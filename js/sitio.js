/* Sánchez & Guerra — comportamiento y movimiento del sitio (sin dependencias) */
(function () {
  var d = document, raiz = d.documentElement, w = window;
  var quieto = raiz.classList.contains('quieto') || (w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function todos(sel, ctx) { return Array.prototype.slice.call((ctx || d).querySelectorAll(sel)); }

  /* ── Menú móvil ── */
  var boton = d.querySelector('.menu-boton');
  if (boton) {
    boton.addEventListener('click', function () {
      var abierto = d.body.classList.toggle('menu-abierto');
      boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
    todos('.nav a').forEach(function (a) { a.addEventListener('click', function () { d.body.classList.remove('menu-abierto'); }); });
  }

  /* ── Titulares: se parten en palabras para que suban una a una ── */
  function partir(el) {
    var i = 0, ultima = null;
    function envolver(nodo, destino) {
      todos_nodos(nodo).forEach(function (n) {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(function (trozo) {
            if (!trozo) return;
            if (/^\s+$/.test(trozo)) { destino.appendChild(d.createTextNode(' ')); return; }
            var pal = d.createElement('span'); pal.className = 'pal';
            var dentro = d.createElement('span'); dentro.textContent = trozo; dentro.style.setProperty('--i', i++);
            pal.appendChild(dentro); destino.appendChild(pal); ultima = dentro;
          });
        } else if (n.nodeType === 1) {
          if (n.classList.contains('punto') && ultima) { ultima.appendChild(n.cloneNode(true)); return; }
          if (n.tagName === 'BR') { destino.appendChild(n.cloneNode()); return; }
          var copia = n.cloneNode(false); destino.appendChild(copia); envolver(n, copia);
        }
      });
    }
    function todos_nodos(n) { return Array.prototype.slice.call(n.childNodes); }
    var frag = d.createDocumentFragment(), caja = d.createElement('span');
    envolver(el, caja);
    while (caja.firstChild) frag.appendChild(caja.firstChild);
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    el.innerHTML = ''; el.appendChild(frag);
  }
  if (!quieto) todos('[data-partir]').forEach(partir);

  /* ── Manifiesto: las palabras se encienden al avanzar ── */
  var citas = [];
  if (!quieto) todos('[data-palabras]').forEach(function (el) {
    var palabras = [];
    (function recorrer(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (h) {
        if (h.nodeType === 3) {
          var frag = d.createDocumentFragment();
          h.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(d.createTextNode(' ')); return; }
            var s = d.createElement('span'); s.className = 'pz'; s.textContent = t; frag.appendChild(s); palabras.push(s);
          });
          n.replaceChild(frag, h);
        } else if (h.nodeType === 1) recorrer(h);
      });
    })(el);
    citas.push({ el: el, palabras: palabras });
  });

  /* ── Apariciones al hacer scroll ── */
  var revelables = todos('.revelar, .escalonar, [data-partir]');
  todos('.escalonar').forEach(function (g) { Array.prototype.forEach.call(g.children, function (h, i) { h.style.setProperty('--i', i % 8); }); });
  function mostrar(el) {
    el.classList.add('visto', 'dentro');
    if (el.classList.contains('escalonar')) setTimeout(function () { el.classList.add('hecho'); }, 1600);
  }
  var enPortada = function (el) { return !!el.closest('.portada, .cab-pagina'); };
  if ('IntersectionObserver' in w) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { if (e.isIntersecting) { mostrar(e.target); obs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revelables.forEach(function (el) { if (!enPortada(el)) obs.observe(el); });
  } else revelables.forEach(mostrar);
  // Red de seguridad: nada queda oculto si algo falla
  setTimeout(function () { revelables.forEach(function (el) { if (el.getBoundingClientRect().top < w.innerHeight) mostrar(el); }); }, 3200);

  if (quieto) revelables.forEach(mostrar);

  /* ── Portada: entra después de la presentación inicial ── */
  var portada = d.querySelector('.portada, .cab-pagina');
  function entrar() {
    if (portada) portada.classList.add('dentro');
    contar();
  }
  if (raiz.classList.contains('con-intro')) {
    try { sessionStorage.setItem('sg-intro', '1'); } catch (e) {}
    setTimeout(entrar, 2150);
    setTimeout(function () { raiz.classList.remove('con-intro'); }, 2950);
  } else {
    setTimeout(entrar, 90);   // con temporizador (no con rAF): también corre si la pestaña abre en segundo plano
  }

  /* ── Cifras que cuentan ── */
  var contado = false;
  function contar() {
    if (contado) return; contado = true;
    todos('[data-contar]').forEach(function (el) {
      var m = /^(\d+)(\D*)$/.exec(el.textContent.trim());
      if (!m || quieto) return;
      var fin = parseInt(m[1], 10), resto = m[2], t0 = null, dur = 1400, retardo = 1250;
      el.textContent = '0' + resto;
      setTimeout(function () {
        w.requestAnimationFrame(function paso(t) {
          if (t0 === null) t0 = t;
          var p = Math.min(1, (t - t0) / dur), suave = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(fin * suave) + resto;
          if (p < 1) w.requestAnimationFrame(paso);
        });
      }, retardo);
    });
  }

  /* ── Todo lo que depende de la posición del scroll, en un solo ciclo ── */
  var cabecera = d.querySelector('.cabecera'), progreso = d.querySelector('.progreso');
  var agua = d.querySelector('.marca-agua'), avances = todos('.linea-avance');
  var ultimoY = w.pageYOffset, pendiente = false;
  function alDesplazar() {
    pendiente = false;
    var y = w.pageYOffset, alto = w.innerHeight, total = d.documentElement.scrollHeight - alto;
    if (cabecera) {
      cabecera.classList.toggle('solida', y > 30);
      if (!d.body.classList.contains('menu-abierto')) cabecera.classList.toggle('oculta', y > 500 && y > ultimoY + 4);
      if (y < ultimoY - 4) cabecera.classList.remove('oculta');
    }
    if (progreso) progreso.style.transform = 'scaleX(' + (total > 0 ? Math.min(1, y / total) : 0) + ')';
    if (agua && !quieto && y < alto * 1.4) agua.style.setProperty('--py', (y * 0.22).toFixed(1));
    avances.forEach(function (l) {
      var r = l.getBoundingClientRect();
      var p = (alto * 0.82 - r.top) / (alto * 0.55);
      l.style.setProperty('--avance', Math.max(0, Math.min(1, p)).toFixed(3));
    });
    citas.forEach(function (c) {
      var r = c.el.getBoundingClientRect();
      var p = (alto * 0.86 - r.top) / (r.height + alto * 0.42);
      var n = Math.round(Math.max(0, Math.min(1, p)) * c.palabras.length);
      c.palabras.forEach(function (s, i) { s.classList.toggle('on', i < n); });
    });
    ultimoY = y;
  }
  w.addEventListener('scroll', function () { if (!pendiente) { pendiente = true; w.requestAnimationFrame(alDesplazar); } }, { passive: true });
  w.addEventListener('resize', alDesplazar);
  alDesplazar();

  /* ── La luz de la portada sigue al cursor; las iniciales de los retratos también ── */
  if (!quieto && w.matchMedia('(hover: hover)').matches) {
    var p = d.querySelector('.portada');
    if (p) p.addEventListener('mousemove', function (ev) {
      var r = p.getBoundingClientRect();
      p.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
      p.style.setProperty('--my', (ev.clientY - r.top) + 'px');
    });
    todos('.retrato').forEach(function (ret) {
      ret.addEventListener('mousemove', function (ev) {
        var r = ret.getBoundingClientRect();
        ret.style.setProperty('--rx', (((ev.clientX - r.left) / r.width - 0.5) * 26).toFixed(1));
        ret.style.setProperty('--ry', (((ev.clientY - r.top) / r.height - 0.5) * 16).toFixed(1));
      });
      ret.addEventListener('mouseleave', function () { ret.style.setProperty('--rx', 0); ret.style.setProperty('--ry', 0); });
    });
  }

  /* ── Blog: filtro por tema ── */
  var filtros = todos('.filtro');
  filtros.forEach(function (b) {
    b.addEventListener('click', function () {
      filtros.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var tema = b.dataset.tema;
      todos('[data-tema]').forEach(function (el) {
        if (el.classList.contains('filtro')) return;
        el.hidden = !(tema === 'todos' || el.dataset.tema === tema);
      });
    });
  });

  /* ── Año del pie ── */
  todos('[data-anio]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ── Formulario de contacto ── */
  var form = d.getElementById('form-contacto');
  if (form && form.dataset.modo === 'whatsapp') {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = function (n) { return (form.elements[n].value || '').trim(); };
      var texto = 'Buen día. Quisiera hacer una consulta.\n\n' +
        'Nombre: ' + v('nombre') + '\n' +
        'Teléfono: ' + v('telefono') + '\n' +
        (v('correo') ? 'Correo: ' + v('correo') + '\n' : '') +
        'Asunto: ' + v('asunto') + '\n\n' + v('mensaje') +
        (form.elements['como'] && v('como') ? '\n\nNos conoció por: ' + v('como') : '');
      var wa = 'https://wa.me/' + form.dataset.whatsapp + '?text=' + encodeURIComponent(texto);
      var estado = d.getElementById('form-estado');
      var extra = '';
      if (form.dataset.correo) {
        extra = ' o <a href="mailto:' + form.dataset.correo + '?subject=' + encodeURIComponent('Consulta — ' + v('asunto')) + '&body=' + encodeURIComponent(texto) + '">envíelo por correo</a>';
      }
      estado.innerHTML = 'Se abrirá WhatsApp con su mensaje listo para enviar. Si no se abre, <a href="' + wa + '" target="_blank" rel="noopener">pulse aquí</a>' + extra + '.';
      w.open(wa, '_blank', 'noopener');
    });
  }
})();
