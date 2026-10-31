/* =====================================================================
   Motor: BOLETA PARTIDARIA
   Mesa del cuarto oscuro con una pila de boletas por partido. El elector
   toma boletas, las corta por la línea punteada entre tramos y mete en
   el sobre lo que quiere votar. El sobre se califica tramo por tramo
   con window.Reglas.
   ===================================================================== */
window.MOTORES = window.MOTORES || {};
window.MOTORES.partidaria = (function(){
  const F = window.FICTICIOS, R = window.Reglas;

  const busto = '<svg viewBox="0 0 24 28" preserveAspectRatio="xMidYMax slice" fill="currentColor"><circle cx="12" cy="10" r="5.2"/><path d="M1 28c0-6.5 5-9.5 11-9.5s11 3 11 9.5z"/></svg>';
  const tijera = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/></svg>';
  const ok = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l6 6L20 6"/></svg>';
  const alerta = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>';

  function montar(el, M){
    const cats = M.categorias;
    const catPorCod = {}; cats.forEach(function(c, i){ catPorCod[c.code] = { cat:c, i:i }; });
    const partidos = F.PARTIDOS.filter(function(p){ return M.oferta[p.code]; });
    const pIdx = {}; F.PARTIDOS.forEach(function(p, i){ pIdx[p.code] = i; });

    const estado = { piezas:[], sig:1, cerrado:false };

    /* ---------- esqueleto ---------- */
    el.innerHTML =
      '<div class="sim-grid">'+
        '<div class="sim-col">'+
          '<section class="bloque">'+
            '<div class="bloque-head"><h3>La mesa del cuarto oscuro</h3><p>Una pila por partido. Tocá una pila para tomar una boleta.</p></div>'+
            '<div class="mesa" id="pt-mesa"></div>'+
          '</section>'+
          '<section class="bloque">'+
            '<div class="bloque-head"><h3>Boletas en tu mano</h3><p>Usá la tijera para separar tramos. Después mandá al sobre lo que quieras votar.</p></div>'+
            '<div id="pt-mano" class="mano"></div>'+
          '</section>'+
        '</div>'+
        '<aside class="sobre" id="pt-sobre" aria-live="polite"></aside>'+
      '</div>'+
      '<button type="button" class="sobre-barra" id="pt-barra" data-acc="ir-sobre"></button>';

    const mesaEl = el.querySelector('#pt-mesa');
    const manoEl = el.querySelector('#pt-mano');
    const sobreEl = el.querySelector('#pt-sobre');
    const barraEl = el.querySelector('#pt-barra');

    /* ---------- piezas de boleta ---------- */
    function tramoHTML(pc, code){
      const p = F.partido(pc), c = catPorCod[code];
      const cands = F.candidatos(pIdx[pc], c.i, c.cat);
      const partes = function(n){ const i = n.indexOf(' '); return { nom:n.slice(0, i), ape:n.slice(i+1) }; };
      const nFotos = c.cat.tipo === 'formula' ? 2 : 1;
      let fotos = '';
      for(let k = 0; k < nFotos; k++) fotos += '<span class="tr-busto">'+busto+'</span>';
      let panel;
      if(c.cat.tipo === 'lista'){
        const tit = cands.map(function(x, k){ return '<li><span>'+(k+1)+'.</span> '+partes(x.nombre).ape+', '+partes(x.nombre).nom+'</li>'; }).join('');
        const sup = F.candidatos(pIdx[pc] + 3, c.i + 5, { tipo:'lista', n:Math.max(2, cands.length - 1) }).map(function(x, k){ return '<li><span>'+(k+1)+'.</span> '+partes(x.nombre).ape+'</li>'; }).join('');
        const p0 = partes(cands[0].nombre);
        panel = '<div class="tr-cara-nombre"><small>'+p0.nom+'</small><b>'+p0.ape+'</b></div>'+
          '<div class="tr-lista"><p>'+c.cat.label+'</p><div class="tr-cols"><div><em>Titulares</em><ol>'+tit+'</ol></div><div><em>Suplentes</em><ol>'+sup+'</ol></div></div></div>';
      } else {
        panel = '<div class="tr-panel">'+cands.map(function(x){ const q = partes(x.nombre); return '<b>'+q.nom+'</b><span>'+q.ape+'</span>'; }).join('')+'</div>';
      }
      return '<div class="tramo tipo-'+c.cat.tipo+'" style="--pc:'+p.color+'">'+
        '<div class="tr-top">'+
          '<span class="tr-num"><i>Lista</i><b>'+p.num+'</b></span>'+
          '<span class="tr-elec">Elecciones provinciales y municipales · Simulador<br><b>'+p.nombre.toUpperCase()+'</b></span>'+
        '</div>'+
        '<div class="tr-marca"><span class="tr-emb">'+F.EMBLEMAS[pc]+'</span><span class="tr-pnom">'+p.nombre+'</span></div>'+
        '<div class="tr-cat">Candidatos a '+c.cat.label+'</div>'+
        '<div class="tr-fotos">'+fotos+'</div>'+
        panel+
      '</div>';
    }
    function boletaHTML(pz, conTijera){
      let h = '';
      pz.cats.forEach(function(code, i){
        if(i > 0){
          h += conTijera
            ? '<button type="button" class="corte" data-acc="cortar" data-id="'+pz.id+'" data-i="'+i+'" aria-label="Cortar entre '+catPorCod[pz.cats[i-1]].cat.corto+' y '+catPorCod[code].cat.corto+'"><span class="corte-ico">'+tijera+'</span></button>'
            : '<span class="corte corte-fija"></span>';
        }
        h += tramoHTML(pz.party, code);
      });
      return '<div class="boleta">'+h+'</div>';
    }
    function nombresCats(codes){ return R.unirLista(codes.map(function(c){ return catPorCod[c].cat.corto; })); }

    /* ---------- mesa ---------- */
    // Cada pila reproduce en miniatura la boleta real del partido: un tramo por categoría que presenta.
    function miniBoleta(p, of){
      return '<span class="pm-hoja">'+of.map(function(code){
        const c = catPorCod[code];
        return '<span class="pm-tr"><span class="pm-num">'+p.num+'</span><span class="pm-emb">'+F.EMBLEMAS[p.code]+'</span>'+
          '<span class="pm-cat">'+c.cat.corto+'</span><span class="pm-foto">'+busto+(c.cat.tipo === 'formula' ? busto : '')+'</span><span class="pm-panel"></span></span>';
      }).join('')+'</span>';
    }
    mesaEl.innerHTML = '<div class="mesa-tabla">'+partidos.map(function(p){
      const of = M.oferta[p.code];
      return '<button type="button" class="pila" data-acc="tomar" data-party="'+p.code+'" style="--pc:'+p.color+'" aria-label="Tomar una boleta de la lista '+p.num+', '+p.nombre+'">'+
        '<span class="pila-fajo"><span class="pila-hoja h3"></span><span class="pila-hoja h2"></span>'+miniBoleta(p, of)+'</span>'+
        '<span class="pila-rotulo"><b>Lista '+p.num+' · '+p.nombre+'</b><small>'+(of.length === cats.length ? 'Todos los tramos' : 'Solo '+nombresCats(of))+'</small></span>'+
        '<span class="pila-cta"><span class="paso-n">1</span>Tomar boleta</span>'+
      '</button>';
    }).join('')+'</div>';

    /* ---------- render ---------- */
    function render(){
      const enMano = estado.piezas.filter(function(p){ return p.lugar === 'mano'; });
      const enSobre = estado.piezas.filter(function(p){ return p.lugar === 'sobre'; });

      manoEl.innerHTML = enMano.length ? enMano.map(function(pz){
        const entera = pz.cats.length === M.oferta[pz.party].length;
        return '<div class="pieza">'+
          '<div class="pieza-meta"><b>'+F.partido(pz.party).nombre+'</b><span>'+(entera ? 'Boleta entera' : 'Pedazo: '+nombresCats(pz.cats))+'</span></div>'+
          '<div class="pieza-scroll">'+boletaHTML(pz, pz.cats.length > 1 && !estado.cerrado)+'</div>'+
          '<div class="pieza-acc">'+
            '<button type="button" class="btn btn-fuerte" data-acc="al-sobre" data-id="'+pz.id+'"'+(estado.cerrado ? ' disabled' : '')+'><span class="paso-n">3</span>Meter en el sobre</button>'+
            '<button type="button" class="btn" data-acc="devolver" data-id="'+pz.id+'">Dejar en la mesa</button>'+
          '</div>'+
        '</div>';
      }).join('') : '<p class="vacio-mano">Todavía no tomaste ninguna boleta.</p>';

      // calificación
      const marcas = {};
      enSobre.forEach(function(pz){ pz.cats.forEach(function(c){ (marcas[c] = marcas[c] || []).push(pz.party); }); });
      const tramos = R.evaluarTramos(cats, marcas);
      const res = R.resumen(tramos);

      let cls, titulo, porque;
      if(enSobre.length === 0){
        cls = 'neutro'; titulo = 'Sobre vacío';
        porque = 'Si lo cerrás así, es un <b>voto en blanco</b> en los '+cats.length+' tramos: vale, pero no suma a ningún partido.';
      } else if(res.nulo > 0){
        const nul = tramos.filter(function(t){ return t.estado === 'nulo'; });
        cls = 'mal'; titulo = res.nulo === 1 ? 'Un tramo se anula' : res.nulo+' tramos se anulan';
        porque = 'En <b>'+R.unirLista(nul.map(function(t){ return t.cat.corto; }))+'</b> hay boletas de partidos distintos. Ese tramo se cuenta como <b>voto nulo</b>; los demás tramos siguen valiendo. Sacá del sobre uno de los pedazos.';
      } else {
        cls = 'bien'; titulo = 'Tu voto vale';
        const partidosVot = tramos.filter(function(t){ return t.estado === 'valido'; }).map(function(t){ return t.partido; });
        const distintos = partidosVot.filter(function(v, i){ return partidosVot.indexOf(v) === i; });
        porque = distintos.length > 1 ? 'Combinaste <b>'+distintos.length+' partidos</b> en tramos distintos: es un <b>voto cortado</b> válido.' : 'Todos los tramos que votaste son del mismo partido.';
        if(res.blanco) porque += ' '+res.blanco+(res.blanco === 1 ? ' tramo queda' : ' tramos quedan')+' en blanco.';
        if(tramos.some(function(t){ return t.repetidas; })) porque += ' Hay boletas repetidas del mismo partido en un tramo: se cuenta una sola.';
      }

      const filas = tramos.map(function(t){
        let v, c = '';
        if(t.estado === 'blanco'){ v = '<span class="tenue">Voto en blanco</span>'; }
        else if(t.estado === 'valido'){ v = F.partido(t.partido).nombre + (t.repetidas ? ' <span class="tenue">(repetida, cuenta una)</span>' : ''); c = ' ok'; }
        else { v = 'Nulo <span class="tenue">('+R.unirLista(t.partidos.map(function(x){ return F.partido(x).nombre; }))+')</span>'; c = ' mal'; }
        return '<li class="fila'+c+'"><span class="fila-cat">'+t.cat.corto+'</span><span class="fila-val">'+v+'</span></li>';
      }).join('');

      const contenido = enSobre.length ? enSobre.map(function(pz){
        return '<li class="en-sobre" style="--pc:'+F.partido(pz.party).color+'">'+
          '<span class="en-sobre-tx"><b>'+F.partido(pz.party).nombre+'</b><span>'+nombresCats(pz.cats)+'</span></span>'+
          (estado.cerrado ? '' : '<button type="button" class="btn btn-chico" data-acc="sacar" data-id="'+pz.id+'">Sacar</button>')+
        '</li>';
      }).join('') : '<li class="tenue sobre-vacio">Nada todavía.</li>';

      barraEl.className = 'sobre-barra est-'+cls;
      barraEl.innerHTML = '<span class="sb-n">Sobre · '+enSobre.length+(enSobre.length === 1 ? ' pieza' : ' piezas')+'</span><span class="sb-est">'+(estado.cerrado ? 'Cerrado' : titulo)+'</span><span class="sb-ir">Ver</span>';
      sobreEl.className = 'sobre est-'+cls+(estado.cerrado ? ' cerrado' : '');
      sobreEl.innerHTML =
        '<div class="sobre-solapa" aria-hidden="true"></div>'+
        '<div class="sobre-cuerpo">'+
          '<div class="sobre-titulo"><span>Tu sobre</span><span class="sobre-n">'+enSobre.length+(enSobre.length === 1 ? ' pieza' : ' piezas')+'</span></div>'+
          '<ul class="sobre-lista">'+contenido+'</ul>'+
          '<div class="veredicto"><div class="veredicto-tit">'+(cls === 'mal' ? alerta : cls === 'bien' ? ok : '')+'<span>'+(estado.cerrado ? 'Escrutinio de la mesa' : titulo)+'</span></div>'+
            '<p>'+(estado.cerrado ? 'Así se computa tu sobre cuando lo abren en la mesa.' : porque)+'</p></div>'+
          '<p class="rotulo-sm">'+(estado.cerrado ? 'Resultado por tramo' : 'Tu voto quedaría así')+'</p>'+
          '<ul class="filas">'+filas+'</ul>'+
          '<div class="sobre-acc">'+
            (estado.cerrado
              ? '<button type="button" class="btn btn-fuerte" data-acc="reabrir">Volver a votar</button>'
              : '<button type="button" class="btn btn-fuerte" data-acc="cerrar"><span class="paso-n">3</span>Cerrar el sobre</button>')+
            '<button type="button" class="btn" data-acc="reiniciar">Empezar de nuevo</button>'+
          '</div>'+
          '<p class="nota-norma">'+M.norma+'</p>'+
        '</div>';
    }

    /* ---------- acciones ---------- */
    function pieza(id){ return estado.piezas.find(function(p){ return p.id === id; }); }
    el.addEventListener('click', function(e){
      const b = e.target.closest('[data-acc]'); if(!b) return;
      const acc = b.getAttribute('data-acc');
      const id = +b.getAttribute('data-id');
      if(acc === 'tomar'){
        if(estado.cerrado) return;
        const pc = b.getAttribute('data-party');
        estado.piezas.push({ id:estado.sig++, party:pc, cats:M.oferta[pc].slice(), lugar:'mano' });
        render();
        const ult = manoEl.lastElementChild; if(ult && ult.scrollIntoView) ult.scrollIntoView({ behavior:'smooth', block:'nearest' });
      } else if(acc === 'cortar'){
        const pz = pieza(id), i = +b.getAttribute('data-i');
        const resto = { id:estado.sig++, party:pz.party, cats:pz.cats.slice(i), lugar:'mano' };
        pz.cats = pz.cats.slice(0, i);
        estado.piezas.splice(estado.piezas.indexOf(pz) + 1, 0, resto);
        render();
      } else if(acc === 'al-sobre'){ pieza(id).lugar = 'sobre'; render(); }
      else if(acc === 'sacar'){ pieza(id).lugar = 'mano'; render(); }
      else if(acc === 'devolver'){ estado.piezas.splice(estado.piezas.indexOf(pieza(id)), 1); render(); }
      else if(acc === 'cerrar'){ estado.cerrado = true; render(); sobreEl.scrollIntoView && sobreEl.scrollIntoView({ behavior:'smooth', block:'start' }); }
      else if(acc === 'ir-sobre'){ sobreEl.scrollIntoView({ behavior:'smooth', block:'start' }); }
      else if(acc === 'reabrir'){ estado.cerrado = false; render(); }
      else if(acc === 'reiniciar'){ estado.piezas = []; estado.cerrado = false; render(); }
    });

    render();
  }

  return {
    pasos: ['Tomá boletas de la mesa.', 'Si querés combinar partidos, cortá por la línea punteada.', 'Meté en el sobre solo lo que vas a votar y cerralo.'],
    avisos: ['Dos pedazos de distinto partido para el mismo tramo anulan ese tramo.', 'Dos boletas iguales del mismo partido cuentan como una.', 'Sobre vacío: voto en blanco.'],
    montar: montar
  };
})();
