/* SELECTOR DE LOGO Y COLOR — solo mientras los socios deciden.
   Se elimina del sitio al ejecutar:  python3 construir.py --final        */
(function () {
  var datos = {"logos": [{"id": "D", "nombre": "La Salida"}], "paletas": [{"id": "1", "nombre": "Tinta & Lacre", "color": "#15130F", "color2": "#B4231A"}, {"id": "2", "nombre": "Petróleo & Coral", "color": "#0B2A2F", "color2": "#C23D2A"}, {"id": "3", "nombre": "Tinta & Coral", "color": "#15130F", "color2": "#C23D2A"}, {"id": "4", "nombre": "Petróleo & Lacre", "color": "#0B2A2F", "color2": "#B4231A"}]};
  var d = document, raiz = d.documentElement;
  var abrir = d.createElement('button');
  abrir.type = 'button'; abrir.className = 'vp-abrir'; abrir.setAttribute('aria-expanded', 'false');
  abrir.innerHTML = '<i></i><i></i><span>' + (datos.logos.length > 1 ? 'Logo y color' : 'Color') + '</span>';
  var caja = d.createElement('div');
  caja.className = 'vp'; caja.hidden = true;
  function fila(titulo, clave, opciones) {
    var h = '<div class="fila"><span>' + titulo + '</span>';
    opciones.forEach(function (o) {
      h += '<button type="button" data-clave="' + clave + '" data-valor="' + o.id + '" title="' + o.nombre + '">' +
        (o.color ? '<i style="background:' + o.color + '"></i><i style="background:' + o.color2 + '"></i>' : '') + o.id + ' · ' + o.nombre + '</button>';
    });
    return h + '</div>';
  }
  caja.innerHTML = '<button type="button" class="cerrar" aria-label="Cerrar">×</button><b>Vista previa de marca</b>' +
    (datos.logos.length > 1 ? fila('Logo', 'logo', datos.logos) : '') + fila('Paleta', 'paleta', datos.paletas) +
    '<small>Panel de revisión: no aparecerá en el sitio definitivo.</small>';
  d.body.appendChild(abrir); d.body.appendChild(caja);
  function pintar() {
    caja.querySelectorAll('button[data-clave]').forEach(function (b) {
      b.setAttribute('aria-pressed', raiz.dataset[b.dataset.clave] === b.dataset.valor ? 'true' : 'false');
    });
  }
  function alternar(ver) { caja.hidden = !ver; abrir.hidden = ver; abrir.setAttribute('aria-expanded', ver ? 'true' : 'false'); }
  abrir.addEventListener('click', function () { alternar(true); });
  caja.addEventListener('click', function (ev) {
    var b = ev.target.closest('button');
    if (!b) return;
    if (b.classList.contains('cerrar')) { alternar(false); return; }
    raiz.dataset[b.dataset.clave] = b.dataset.valor;
    try { localStorage.setItem('sg-' + b.dataset.clave, b.dataset.valor); } catch (e) {}
    pintar();
  });
  pintar();
})();
