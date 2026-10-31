/* =====================================================================
   Motor: BOLETA ÚNICA DE PAPEL · partidos en COLUMNAS, categorías en FILAS
   (modelo nacional / mendocino). Una sola hoja con talón troquelado; se
   marca dentro del recuadro de cada categoría, se dobla por los pliegues
   verticales y va a la urna sin sobre.

   Opciones del modelo:
     escenarios[]   variantes de la misma boleta (p. ej. legislativa / presidencial)
     listaCompleta  agrega una fila de "lista completa" (Mendoza, Entre Ríos)
   ===================================================================== */
window.MOTORES = window.MOTORES || {};
window.MOTORES['bup-columnas'] = (function(){
  const F = window.FICTICIOS, R = window.Reglas;

  const cruz = '<svg class="marca" viewBox="0 0 40 40" aria-hidden="true"><path d="M8 9c6 5 15 14 24 23" /><path d="M31 7c-5 7-13 16-23 26" /></svg>';
  const busto = '<svg viewBox="0 0 24 28" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><circle cx="12" cy="10" r="5.2"/><path d="M1 28c0-6.5 5-9.5 11-9.5s11 3 11 9.5z"/></svg>';
  const ok = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l6 6L20 6"/></svg>';
  const alerta = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>';

  function apellidoNombre(n){
    const i = n.indexOf(' ');
    return '<span class="bc-nm"><b>'+n.slice(i+1).toUpperCase()+'</b>, '+n.slice(0, i).toUpperCase()+'</span>';
  }

  function montar(el, M){
    const pIdx = {}; F.PARTIDOS.forEach(function(p, i){ pIdx[p.code] = i; });
    const st = { esc:M.escenarios[0].id, marcas:{}, lc:[], depositada:false };

    el.innerHTML =
      '<div class="sim-grid ancho">'+
        '<div class="sim-col">'+
          '<section class="bloque">'+
            '<div class="bloque-head"><h3>Tu boleta</h3><p><b>Paso 2:</b> tocá el recuadro de una agrupación para marcarla. Tocá de nuevo para borrar.</p></div>'+
            (M.escenarios.length > 1 ? '<div class="escenarios" role="group" aria-label="Tipo de elección">'+M.escenarios.map(function(e){
              return '<button type="button" class="esc" data-acc="esc" data-id="'+e.id+'">'+e.label+'</button>';
            }).join('')+'</div>' : '')+
            '<p class="esc-nota" id="bc-nota"></p>'+
            '<div class="bc-escena" id="bc-escena"></div>'+
          '</section>'+
        '</div>'+
        '<aside class="sobre tablero" id="bc-panel" aria-live="polite"></aside>'+
      '</div>'+
      '<button type="button" class="sobre-barra siempre" id="bc-barra" data-acc="ir-panel"></button>';

    const escenaEl = el.querySelector('#bc-escena');
    const panelEl = el.querySelector('#bc-panel');
    const barraEl = el.querySelector('#bc-barra');
    const notaEl = el.querySelector('#bc-nota');

    function esc(){ return M.escenarios.find(function(e){ return e.id === st.esc; }); }
    function partidosDe(E){ return F.PARTIDOS.filter(function(p){ return E.oferta[p.code]; }); }

    /* ---------- dibujo de la boleta ---------- */
    function celda(E, p, cat, cIdx){
      if(E.oferta[p.code].indexOf(cat.code) === -1){
        return '<div class="bc-cel bc-vacia" style="--pc:'+p.color+'"><span>No presenta candidaturas</span></div>';
      }
      const cands = F.candidatos(pIdx[p.code], cIdx, cat);
      const fotos = Math.min(2, cands.length);
      let foto = '<div class="bc-foto f'+fotos+'">';
      for(let k = 0; k < fotos; k++) foto += '<span>'+busto+'</span>';
      foto += '</div>';
      const nomina = cat.tipo === 'formula'
        ? cands.map(function(c){ return '<li><span class="bc-rol">'+c.rol+'</span>'+apellidoNombre(c.nombre)+'</li>'; }).join('')
        : cands.map(function(c, k){ return '<li><span class="bc-n">'+(k+1)+'.</span>'+apellidoNombre(c.nombre)+'</li>'; }).join('');
      const marcado = (st.marcas[cat.code] || []).indexOf(p.code) !== -1;
      if(M.estilo === 'mendoza'){
        const box = '<button type="button" class="bc-box mz-box'+(marcado ? ' on' : '')+'" data-acc="marcar" data-cat="'+cat.code+'" data-party="'+p.code+'" aria-pressed="'+marcado+'" aria-label="'+cat.label+': '+p.nombre+'"'+(st.depositada ? ' disabled' : '')+'>'+(marcado ? cruz : '')+'</button>';
        const cab = '<div class="mz-cab"><span>Voto candidatos a '+cat.label+'</span>'+box+'</div>';
        const AN = function(n){ const i = n.indexOf(' '); return n.slice(i+1).toUpperCase()+' '+n.slice(0, i).toUpperCase(); };
        let cuerpo;
        if(cat.tipo === 'formula'){
          cuerpo = '<div class="mz-cuerpo mz-foto2">'+foto+'<div class="mz-nom">'+cands.map(function(c){ return '<b>'+AN(c.nombre)+'</b><small>'+c.rol.toUpperCase()+'</small>'; }).join('')+'</div></div>';
        } else if(cat.tipo === 'uno'){
          cuerpo = '<div class="mz-cuerpo mz-foto1">'+foto+'<div class="mz-nom"><b>'+AN(cands[0].nombre)+'</b><small>'+(cat.rol || '').toUpperCase()+'</small></div></div>';
        } else {
          cuerpo = '<ol class="mz-lista">'+cands.map(function(c, k){ return '<li'+(k === 0 ? ' class="mz-primero"' : '')+'>'+AN(c.nombre)+'</li>'; }).join('')+'</ol>';
        }
        return '<div class="bc-cel mz-cel" style="--pc:'+p.color+'" data-cat="'+cat.code+'" data-party="'+p.code+'">'+cab+cuerpo+'</div>';
      }
      if(M.estilo === 'chubut'){
        const nombres = cands.slice(0, cat.tipo === 'lista' ? 3 : 2).map(function(c){ const i = c.nombre.indexOf(' '); return '<li>'+(cat.tipo === 'formula' ? '<span class="bc-rol">'+c.rol+'</span>' : '')+c.nombre.slice(0, i)+'<b>'+c.nombre.slice(i+1).toUpperCase()+'</b></li>'; }).join('');
        return '<div class="bc-cel ch-cel" style="--pc:'+p.color+'" data-cat="'+cat.code+'" data-party="'+p.code+'"><div class="ch-panel">'+
          foto+'<ol class="ch-nombres">'+nombres+(cat.tipo === 'lista' && cands.length > 3 ? '<li class="ch-mas">y '+(cat.n > 5 ? 'el resto de la lista' : (cands.length - 3)+' más')+'</li>' : '')+'</ol>'+
          '<button type="button" class="bc-box ch-box'+(marcado ? ' on' : '')+'" data-acc="marcar" data-cat="'+cat.code+'" data-party="'+p.code+'" aria-pressed="'+marcado+'" aria-label="'+cat.label+': '+p.nombre+'"'+(st.depositada ? ' disabled' : '')+'>'+(marcado ? cruz : '')+'</button>'+
        '</div></div>';
      }
      return '<div class="bc-cel" style="--pc:'+p.color+'" data-cat="'+cat.code+'" data-party="'+p.code+'">'+
        '<button type="button" class="bc-box'+(marcado ? ' on' : '')+'" data-acc="marcar" data-cat="'+cat.code+'" data-party="'+p.code+'" aria-pressed="'+marcado+'" aria-label="'+cat.label+': '+p.nombre+'"'+(st.depositada ? ' disabled' : '')+'>'+(marcado ? cruz : '')+'</button>'+
        foto+
        '<ol class="bc-nomina'+(cat.tipo === 'formula' ? ' formula' : '')+'">'+nomina+'</ol>'+
      '</div>';
    }

    function boleta(E){
      const ps = partidosDe(E);
      const chubut = M.estilo === 'chubut';
      const chev = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
      const mendoza = M.estilo === 'mendoza';
      let g = mendoza ? '<div class="bc-esq mz-lado"><span>Lista completa</span></div>'
        : chubut ? '<div class="bc-esq ch-lado">'+chev+'<span>Agrupación</span></div>'
        : '<div class="bc-esq"><span>Marque con una cruz dentro del recuadro la opción de su preferencia en cada categoría</span></div>';
      ps.forEach(function(p){
        if(mendoza){
          const on = st.lc.indexOf(p.code) !== -1;
          g += '<div class="bc-head mz-head bc-head-lc" style="--pc:'+p.color+'">'+
            '<div class="mz-cab"><span>Voto lista completa<br>Lista '+p.num+'</span><button type="button" class="bc-box mz-box'+(on ? ' on' : '')+'" data-acc="lc" data-party="'+p.code+'" aria-pressed="'+on+'" aria-label="Voto lista completa: '+p.nombre+'"'+(st.depositada ? ' disabled' : '')+'>'+(on ? cruz : '')+'</button></div>'+
            '<span class="mz-logo"><span>'+F.EMBLEMAS[p.code]+'</span>'+p.nombre+'</span>'+
            '<span class="mz-pnom">'+p.nombre.toUpperCase()+'</span>'+
          '</div>';
        } else if(M.listaCompleta){
          const on = st.lc.indexOf(p.code) !== -1;
          g += '<div class="bc-head bc-head-lc" style="--pc:'+p.color+'">'+
            (chubut ? '<span class="bc-num">'+p.num+'</span><span class="bc-nom">'+p.nombre+'</span><span class="bc-logo">'+F.EMBLEMAS[p.code]+'</span>'
              : '<span class="bc-logo">'+F.EMBLEMAS[p.code]+'</span><span class="bc-nom">'+p.nombre+'</span><span class="bc-num"><small>Lista</small> '+p.num+'</span>')+
            (M.fotoEnCabecera ? '<span class="bc-foto f1"><span>'+busto+'</span></span>' : '')+
            '<span class="bc-lc-fila"><button type="button" class="bc-box'+(on ? ' on' : '')+'" data-acc="lc" data-party="'+p.code+'" aria-pressed="'+on+'" aria-label="Voto lista completa: '+p.nombre+'"'+(st.depositada ? ' disabled' : '')+'>'+(on ? cruz : '')+'</button><span>Voto lista completa</span></span>'+
          '</div>';
        } else {
          g += '<div class="bc-head" style="--pc:'+p.color+'">'+
            '<span class="bc-num">'+p.num+'</span>'+
            '<span class="bc-nom">'+p.nombre+'</span>'+
            '<span class="bc-logo">'+F.EMBLEMAS[p.code]+'</span>'+
          '</div>';
        }
      });
      E.categorias.forEach(function(cat, cIdx){
        g += mendoza ? '<div class="bc-cat mz-lado"><span>'+cat.label+'</span></div>'
          : chubut ? '<div class="bc-cat ch-lado">'+chev+'<span>'+cat.corto+'</span></div>' : '<div class="bc-cat"><span>'+cat.label+'</span></div>';
        ps.forEach(function(p){ g += celda(E, p, cat, cIdx); });
      });
      if(mendoza){
        return '<div class="bc-scroll"><div class="bc estilo-mendoza" style="--cols:'+ps.length+'"><div class="bc-hoja">'+
          '<div class="bc-grid mz-grid">'+g+'</div>'+
          '<div class="mz-marca" aria-hidden="true">Simulador · ejercicio de práctica</div>'+
        '</div></div></div>';
      }
      if(chubut){
        return '<div class="bc-scroll"><div class="bc estilo-chubut" style="--cols:'+ps.length+'"><div class="bc-hoja">'+
          '<div class="ch-top"><span class="ch-distrito">'+M.distrito.toUpperCase()+'</span>'+
            '<span class="ch-inst"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7l10 10M17 7L7 17"/></svg>Marcá una sola opción dentro del recuadro.</span>'+
            '<span class="ch-org"><b>Provincia del Chubut</b><span>'+E.elecciones+' · Simulador</span></span></div>'+
          '<div class="bc-grid ch-grid">'+g+'</div><div class="ch-trama"></div>'+
        '</div></div></div>';
      }
      return '<div class="bc-scroll"><div class="bc'+(st.depositada ? ' depositada' : '')+'" style="--cols:'+ps.length+'">'+
        '<div class="bc-talon" aria-label="Talón troquelado"><span>Talón · Mesa 0000 · Firma de la autoridad de mesa</span></div>'+
        '<div class="bc-hoja">'+
          '<div class="bc-top">'+
            '<div class="bc-mesa"><span>Distrito</span><b>'+M.distrito+'</b><span>Sección 001 · Circuito 0001 · Mesa 0000</span></div>'+
            '<div class="bc-inst">Boleta Única de Papel · Simulador</div>'+
            '<div class="bc-elec"><b>'+E.elecciones+'</b><span>Ejercicio de práctica · no válido</span></div>'+
          '</div>'+
          '<div class="bc-grid">'+g+'</div>'+
        '</div>'+
      '</div></div>';
    }

    function urna(){
      return '<div class="urna-escena">'+
        '<div class="urna" aria-hidden="true">'+
          '<div class="urna-ranura"></div>'+
          '<div class="urna-papel"></div>'+
          '<div class="urna-cuerpo"><span>Urna</span></div>'+
        '</div>'+
        '<div class="urna-tx"><h4>Tu boleta está en la urna</h4><p>'+(M.urnaTexto || 'La doblaste por los pliegues verticales, así nadie ve lo que marcaste. La autoridad de mesa desprendió el talón antes de que la deposites.')+'</p></div>'+
      '</div>';
    }

    /* ---------- calificación ---------- */
    function evaluar(E){
      return R.calificar(E.categorias, st.marcas, M.listaCompleta ? st.lc : [], function(pc, code){ return E.oferta[pc] && E.oferta[pc].indexOf(code) !== -1; }, M.lcRegla || 'repetidas');
    }

    /* ---------- render ---------- */
    function render(){
      const E = esc();
      el.querySelectorAll('.esc').forEach(function(b){ b.classList.toggle('activo', b.getAttribute('data-id') === st.esc); b.disabled = st.depositada; });
      notaEl.textContent = E.nota || '';
      escenaEl.innerHTML = st.depositada ? urna() : boleta(E);

      const ev = evaluar(E), tramos = ev.tramos;
      const hayMarca = st.lc.length > 0 || E.categorias.some(function(c){ return (st.marcas[c.code] || []).length; });
      const V = R.veredicto(ev, { hayMarca:hayMarca });
      let cls = V.cls, tit = V.tit, porque = V.txt;

      // marcas en conflicto, en rojo sobre la boleta
      if(!st.depositada){
        const porCat = {}; tramos.forEach(function(t){ porCat[t.cat.code] = t; });
        escenaEl.querySelectorAll('.bc-cel[data-cat]').forEach(function(c){
          const t = porCat[c.getAttribute('data-cat')], on = !!c.querySelector('.bc-box.on');
          c.classList.toggle('conflicto', on && (t.estado === 'nulo' || !!t.ignorada));
        });
        const lcMal = ev.modo === 'lc-multi' || tramos.some(function(t){ return t.choqueLc || t.ignorada; });
        escenaEl.querySelectorAll('.bc-head-lc').forEach(function(h){ h.classList.toggle('conflicto', lcMal && !!h.querySelector('.bc-box.on')); });
      }

      if(st.depositada){
        porque = porque.replace(/ (Borrá|Dejá|Para elegir)[^.]*\./g, '').replace('Si la depositás así, es', 'Quedó como');
        if(cls === 'mal'){ tit = 'Tu voto quedó con errores'; porque += ' Ya no se puede corregir: la boleta está en la urna.'; }
      }
      const dudosa = M.lcVerificada === false && ev.modo === 'lc' && tramos.some(function(t){ return t.choqueLc || t.refuerzo; });
      if(dudosa) porque += '<span class="duda">La ley no detalla este caso. El simulador aplica el criterio de Mendoza y Santa Fe: se anula solo la categoría repetida.</span>';
      const filas = tramos.map(R.fila).join('');

      barraEl.className = 'sobre-barra siempre est-'+(st.depositada ? 'neutro' : cls);
      barraEl.innerHTML = '<span class="sb-n">Tu voto</span><span class="sb-est">'+(st.depositada ? 'En la urna' : tit)+'</span><span class="sb-ir">Ver</span>';

      panelEl.className = 'sobre tablero est-'+cls+(st.depositada ? ' cerrado' : '');
      panelEl.innerHTML =
        '<div class="sobre-cuerpo">'+
          '<div class="sobre-titulo"><span>'+(st.depositada ? 'Escrutinio de la mesa' : 'Cómo se cuenta tu voto')+'</span></div>'+
          '<div class="veredicto"><div class="veredicto-tit">'+(cls === 'mal' ? alerta : cls === 'bien' ? ok : '')+'<span>'+tit+'</span></div><p>'+porque+'</p></div>'+
          '<p class="rotulo-sm">Por categoría</p>'+
          '<ul class="filas">'+filas+'</ul>'+
          '<div class="sobre-acc">'+
            (st.depositada
              ? '<button type="button" class="btn btn-fuerte" data-acc="otra">Votar de nuevo</button>'
              : '<button type="button" class="btn btn-fuerte" data-acc="depositar"><span class="paso-n">3</span>Doblar y meter en la urna</button>'+
                '<button type="button" class="btn" data-acc="borrar">Borrar marcas</button>')+
          '</div>'+
          '<p class="nota-norma">'+M.norma+'</p>'+
        '</div>';
      escalar();
    }

    /* ---------- escala: la boleta entra entera si se puede, si no scrollea ---------- */
    function escalar(){
      const hoja = escenaEl.querySelector('.bc'); if(!hoja) return;
      const cols = partidosDe(esc()).length;
      const em = (M.estilo === 'chubut' || M.estilo === 'mendoza' ? 3.6 : 2.4 + 8.5) + cols*11.5 + .4;
      const disp = escenaEl.clientWidth - 6;
      const f = Math.max(11, Math.min(16, disp / em));
      hoja.style.setProperty('--bfs', f.toFixed(2)+'px');
    }
    window.addEventListener('resize', escalar);

    /* ---------- acciones ---------- */
    function alternar(arr, v){ const i = arr.indexOf(v); if(i === -1) arr.push(v); else arr.splice(i, 1); }
    el.addEventListener('click', function(e){
      const b = e.target.closest('[data-acc]'); if(!b || b.disabled) return;
      const acc = b.getAttribute('data-acc');
      if(acc === 'marcar'){
        const c = b.getAttribute('data-cat');
        st.marcas[c] = st.marcas[c] || [];
        alternar(st.marcas[c], b.getAttribute('data-party'));
        render();
        const nb = el.querySelector('.bc-box[data-cat="'+c+'"][data-party="'+b.getAttribute('data-party')+'"]'); if(nb) nb.focus({ preventScroll:true });
      }
      else if(acc === 'lc'){ alternar(st.lc, b.getAttribute('data-party')); render(); }
      else if(acc === 'esc'){ st.esc = b.getAttribute('data-id'); st.marcas = {}; st.lc = []; render(); }
      else if(acc === 'borrar'){ st.marcas = {}; st.lc = []; render(); }
      else if(acc === 'depositar'){ st.depositada = true; render(); escenaEl.scrollIntoView && escenaEl.scrollIntoView({ behavior:'smooth', block:'start' }); }
      else if(acc === 'otra'){ st.depositada = false; st.marcas = {}; st.lc = []; render(); }
      else if(acc === 'ir-panel'){ panelEl.scrollIntoView({ behavior:'smooth', block:'start' }); }
    });

    render();
  }

  return {
    pasos: function(M){ return ['La autoridad de mesa te da la boleta firmada al dorso.', M.listaCompleta ? 'Marcá lista completa o una opción por categoría.' : 'Marcá una opción por categoría, dentro del recuadro.', 'Doblala por los pliegues y metela en la urna. No hay sobre.']; },
    avisos: function(M){ return [
      'Dos marcas en la misma categoría anulan esa categoría.',
      !M.listaCompleta ? 'No hay casillero de lista completa: se vota categoría por categoría.'
        : (M.lcRegla || 'repetidas') === 'prevalece' ? 'Si marcás lista completa, las marcas sueltas no cuentan.'
        : 'Lista completa más otra agrupación en una categoría: se anula esa categoría.',
      'Una categoría sin marca es voto en blanco.'
    ]; },
    montar: montar
  };
})();
