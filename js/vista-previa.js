/* SELECTOR DE VISTA PREVIA — solo para elegir marca con los socios.
   Se elimina del sitio al ejecutar:  python3 construir.py --final        */
(function () {
  var datos = {"logos": [{"id": "D", "nombre": "La Salida"}, {"id": "F", "nombre": "El Sello"}, {"id": "J", "nombre": "El Eclipse"}], "paletas": [{"id": "1", "nombre": "Tinta & Lacre", "color": "#15130F", "color2": "#B4231A"}, {"id": "2", "nombre": "Borgoña & Cobre", "color": "#2A0E13", "color2": "#A4491F"}, {"id": "3", "nombre": "Petróleo & Coral", "color": "#0B2A2F", "color2": "#C23D2A"}, {"id": "4", "nombre": "Esmeralda & Marfil", "color": "#0B2A20", "color2": "#0E7C57"}, {"id": "5", "nombre": "Grafito & Cobalto", "color": "#13161C", "color2": "#1D46E0"}]};
  var d = document, raiz = d.documentElement;
  try { if (sessionStorage.getItem('sg-vp-oculto')) return; } catch (e) {}
  var caja = d.createElement('div');
  caja.className = 'vp';
  function fila(titulo, clave, opciones) {
    var h = '<div class="fila"><span>' + titulo + '</span>';
    opciones.forEach(function (o) {
      h += '<button type="button" data-clave="' + clave + '" data-valor="' + o.id + '" title="' + o.nombre + '">' +
        (o.color ? '<i style="background:' + o.color + '"></i><i style="background:' + o.color2 + '"></i>' : '') + o.id + ' · ' + o.nombre + '</button>';
    });
    return h + '</div>';
  }
  caja.innerHTML = '<button type="button" class="cerrar" aria-label="Ocultar">×</button><b>Vista previa de marca</b>' +
    fila('Logo', 'logo', datos.logos) + fila('Paleta', 'paleta', datos.paletas) +
    '<small>Solo ustedes ven este panel. Elijan y avisen cuál queda.</small>';
  d.body.appendChild(caja);
  function pintar() {
    caja.querySelectorAll('button[data-clave]').forEach(function (b) {
      b.setAttribute('aria-pressed', raiz.dataset[b.dataset.clave] === b.dataset.valor ? 'true' : 'false');
    });
  }
  caja.addEventListener('click', function (ev) {
    var b = ev.target.closest('button');
    if (!b) return;
    if (b.classList.contains('cerrar')) { caja.remove(); try { sessionStorage.setItem('sg-vp-oculto', '1'); } catch (e) {} return; }
    raiz.dataset[b.dataset.clave] = b.dataset.valor;
    try { localStorage.setItem('sg-' + b.dataset.clave, b.dataset.valor); } catch (e) {}
    pintar();
  });
  pintar();
})();
