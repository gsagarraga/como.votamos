(function(){
  const J = window.JURISDICCIONES, M = window.MECANICAS;
  const ESTADOS = {
    disponible:  { txt:'Simulador de boleta', cls:'ok' },
    general:     { txt:'Simulador general', cls:'ok' },
    migracion:   { txt:'En migración al motor común', cls:'mig' },
    proximamente:{ txt:'Próximamente', cls:'prox' }
  };

  /* ---------- miniatura de la boleta según mecánica/modelo ---------- */
  function mini(j){
    const c = 'var(--c-'+j.mecanica+')';
    if(j.mecanica === 'partidaria'){
      // varias boletas apiladas, una cortada por tramos
      let s = '';
      [['var(--paper-tint-1)',-10,-4],['var(--paper-tint-2)',-4,0],['var(--paper)',4,4]].forEach(function(b){
        s += '<g transform="translate('+(30+b[1])+','+(10+b[2])+') rotate('+b[1]/2+')">'+
             '<rect width="40" height="50" rx="2" style="fill:'+b[0]+'" stroke="'+c+'" stroke-width="1.4"/>';
        if(b[0] === 'var(--paper)'){
          s += '<line x1="0" y1="17" x2="40" y2="17" stroke="'+c+'" stroke-dasharray="3 2"/>'+
               '<line x1="0" y1="34" x2="40" y2="34" stroke="'+c+'" stroke-dasharray="3 2"/>'+
               '<circle cx="8" cy="9" r="4" fill="'+c+'"/><rect x="15" y="7" width="19" height="4" rx="1" fill="'+c+'" opacity=".5"/>';
        }
        s += '</g>';
      });
      // sobre
      s += '<g transform="translate(66,44)"><rect width="30" height="20" rx="2" style="fill:var(--sobre);stroke:var(--sobre-borde)" stroke-width="1.2"/>'+
           '<path d="M0 0 L15 11 L30 0" fill="none" style="stroke:var(--sobre-borde)" stroke-width="1.2"/></g>';
      return svg(s);
    }
    if(j.mecanica === 'bue'){
      return svg(
        '<rect x="14" y="10" width="54" height="38" rx="4" style="fill:var(--paper)" stroke="'+c+'" stroke-width="1.6"/>'+
        '<rect x="20" y="16" width="42" height="26" rx="2" fill="'+c+'" opacity=".14"/>'+
        '<rect x="24" y="20" width="16" height="8" rx="1.5" fill="'+c+'"/><rect x="42" y="20" width="16" height="8" rx="1.5" fill="'+c+'" opacity=".45"/>'+
        '<rect x="24" y="30" width="16" height="8" rx="1.5" fill="'+c+'" opacity=".45"/><rect x="42" y="30" width="16" height="8" rx="1.5" fill="'+c+'" opacity=".45"/>'+
        '<rect x="34" y="48" width="14" height="6" fill="'+c+'" opacity=".5"/>'+
        '<g transform="translate(72,24) rotate(8)"><rect width="22" height="34" rx="1.5" style="fill:var(--paper)" stroke="'+c+'" stroke-width="1.4"/>'+
        '<rect x="5" y="20" width="12" height="9" rx="1" fill="none" stroke="'+c+'" stroke-width="1.2"/>'+
        '<line x1="4" y1="6" x2="18" y2="6" stroke="'+c+'"/><line x1="4" y1="11" x2="15" y2="11" stroke="'+c+'"/></g>'
      );
    }
    // BUP
    const m = j.modelo || {};
    const hojas = Math.min(m.boletas || 1, 3);
    let s = '';
    for(let h = hojas - 1; h >= 0; h--){
      const ox = 14 + h*7, oy = 6 + h*5, w = hojas > 1 ? 62 : 76, hgt = 50;
      s += '<g transform="translate('+ox+','+oy+')">'+
           '<rect width="'+w+'" height="'+hgt+'" rx="2" style="fill:var(--paper)" stroke="'+c+'" stroke-width="1.4"/>';
      if(h === 0){
        const n = 4;
        if(m.orientacion === 'filas'){
          const lcw = m.listaCompleta ? 12 : 0;
          for(let i=0;i<n;i++){
            const y = 6 + i*(hgt-10)/n;
            s += '<rect x="4" y="'+y+'" width="'+(w-8)+'" height="'+((hgt-10)/n-2)+'" rx="1" fill="'+c+'" opacity="'+(i%2?.12:.24)+'"/>';
          }
          if(lcw) s += '<rect x="4" y="6" width="'+lcw+'" height="'+(hgt-12)+'" style="fill:var(--negro-lc)" opacity=".85"/>';
        } else {
          const lch = m.listaCompleta ? 7 : 0;
          for(let i=0;i<n;i++){
            const x = 4 + i*(w-8)/n;
            s += '<rect x="'+x+'" y="4" width="'+((w-8)/n-2)+'" height="'+(hgt-8)+'" rx="1" fill="'+c+'" opacity="'+(i%2?.12:.24)+'"/>';
          }
          if(lch) s += '<rect x="4" y="4" width="'+(w-8)+'" height="'+lch+'" style="fill:var(--negro-lc)" opacity=".9"/>';
        }
      }
      s += '</g>';
    }
    return svg(s);
  }
  function svg(inner){
    return '<svg viewBox="0 0 110 68" aria-hidden="true">'+inner+'</svg>';
  }

  function modeloTxt(j){
    if(j.mecanica !== 'bup') return '';
    const m = j.modelo;
    let t = m.orientacion === 'filas' ? 'Partidos en filas' : 'Partidos en columnas';
    if(m.boletas > 1) t += ' · '+m.boletas+' boletas'+(m.boletasPaso ? ' ('+m.boletasPaso+' en PASO)' : '');
    return t;
  }
  function lcTxt(j){
    if(j.mecanica !== 'bup') return '';
    const v = j.modelo.listaCompleta;
    if(v === true) return '<span class="tag">Con lista completa</span>';
    if(v === false) return '<span class="tag">Sin lista completa</span>';
    return '<span class="tag tag-pend">Lista completa: a verificar</span>';
  }

  const FLECHA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>';
  function card(j){
    const est = ESTADOS[j.estado];
    const nombre = j.corto && j.nivel !== 'nacional' ? j.corto : j.nombre;
    const pend = (j.pendiente && j.pendiente.length)
      ? '<p class="pend"><b>A verificar:</b> '+j.pendiente.join(' · ')+'</p>' : '';
    const notas = (j.compacto ? [] : (j.notas || [])).map(function(n){ return '<li>'+n+'</li>'; }).join('');
    const tag = est.cls === 'ok' ? 'a' : 'article';
    const href = est.cls === 'ok' ? ' href="#'+(j.enlace || j.id)+'"' : '';
    return '<'+tag+href+' class="card'+(j.compacto ? ' card-compacta' : '')+' mec-'+j.mecanica+(j.nivel === 'nacional' ? ' card-nac' : '')+'" data-id="'+j.id+'" data-mec="'+j.mecanica+'" data-q="'+(j.nombre+' '+(j.corto||'')+' '+j.region).toLowerCase()+'">'+
      '<div class="card-mini">'+mini(j)+'</div>'+
      '<div class="card-body">'+
        '<div class="card-top"><h3>'+window.bandera(j.id)+nombre+'</h3></div>'+
        '<div class="card-meta"><span class="sigla">'+M[j.mecanica].sigla+'</span>'+
          (modeloTxt(j) ? '<span>'+modeloTxt(j)+'</span>' : '')+
          '<span>'+j.region+'</span><span>Primarias: '+j.primarias+'</span></div>'+
        (j.compacto ? '' : '<p class="resumen">'+j.resumen+'</p>')+
        (notas ? '<ul class="notas">'+notas+'</ul>' : '')+
        (j.lemas && j.compacto ? '<div class="lemas-c"><span class="tag tag-lemas">'+j.lemas+'</span><p>'+j.notas[0]+'</p></div>' : '')+
        (j.compacto ? '' : pend)+
        '<div class="card-pie">'+
          '<div class="tags">'+lcTxt(j)+(j.lemas && !j.compacto ? '<span class="tag tag-lemas">'+j.lemas+'</span>' : '')+(j.norma ? '<span class="norma">'+j.norma+'</span>' : '')+'</div>'+
          (est.cls === 'ok' ? '<span class="card-ir">'+est.txt+FLECHA+'</span>' : '<span class="estado e-'+est.cls+'">'+est.txt+'</span>')+
        '</div>'+
      '</div>'+
    '</'+tag+'>';
  }

  /* ---------- armar secciones ---------- */
  const prov = J.filter(function(j){ return j.nivel !== 'nacional' && !j.ejemplo; });
  const nac = J.find(function(j){ return j.nivel === 'nacional'; });

  document.getElementById('nacional').innerHTML = card(nac);

  // resumen de cifras
  const cuenta = { partidaria:0, bup:0, bue:0 };
  prov.forEach(function(j){ cuenta[j.mecanica]++; });
  document.getElementById('cifras').innerHTML = ['partidaria','bup','bue'].map(function(k){
    return '<button type="button" class="cifra" data-filtro="'+k+'" style="--mc:var(--c-'+k+')">'+
      '<b>'+cuenta[k]+'</b><span>'+M[k].nombre+'</span></button>';
  }).join('');

  const grupos = [
    { mec:'partidaria', titulo:M.partidaria.nombre, demo:'partidaria-general', pendComun:'Todas usan el mismo tipo de boleta, así que comparten un <b>simulador general</b>. Lemas, sublemas y acoples relevados en Formosa, Misiones, San Juan, Santa Cruz y Tucumán (octubre de 2026).', items: prov.filter(function(j){ return j.mecanica==='partidaria'; }) },
    { mec:'bup', titulo:M.bup.nombre, sub:[
        { titulo:'Partidos en filas, categorías en columnas', nota:'Modelo cordobés. Se lee de izquierda a derecha por partido.', items: prov.filter(function(j){ return j.mecanica==='bup' && j.modelo.orientacion==='filas'; }) },
        { titulo:'Partidos en columnas, categorías en filas', nota:'Modelo mendocino, el mismo que adoptó la Nación. Se lee de arriba abajo por partido.', items: prov.filter(function(j){ return j.mecanica==='bup' && j.modelo.orientacion==='columnas'; }) }
      ] },
    { mec:'bue', titulo:M.bue.nombre, items: prov.filter(function(j){ return j.mecanica==='bue'; }) }
  ];

  function orden(a, b){ return a.nombre.localeCompare(b.nombre, 'es'); }

  document.getElementById('grupos').innerHTML = grupos.map(function(g){
    const m = M[g.mec];
    let body = '';
    if(g.sub){
      body = g.sub.map(function(s){
        return '<div class="sub"><div class="sub-head"><h4>'+s.titulo+'</h4><p>'+s.nota+'</p></div>'+
          '<div class="grid">'+s.items.sort(orden).map(card).join('')+'</div></div>';
      }).join('');
    } else {
      const compacta = g.items.every(function(j){ return j.compacto; });
      body = '<div class="grid'+(compacta ? ' grid-compacta' : '')+'">'+g.items.sort(orden).map(card).join('')+'</div>';
    }
    const n = g.sub ? g.sub.reduce(function(a,s){ return a + s.items.length; }, 0) : g.items.length;
    return '<section class="grupo" id="g-'+g.mec+'" data-mec="'+g.mec+'" style="--mc:var(--c-'+g.mec+')">'+
      '<header class="grupo-head">'+
        '<div class="grupo-tit"><h2>'+g.titulo+'</h2><span class="n">'+n+' '+(n===1?'distrito':'distritos')+'</span></div>'+
        '<div class="grupo-txt"><p>'+m.como+'</p>'+(g.pendComun ? '<p class="pend">'+g.pendComun+'</p>' : '')+
          (g.demo ? '<a class="cta" href="#'+g.demo+'">Probar el simulador general <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg></a>' : '')+'</div>'+
      '</header>'+ body +
    '</section>';
  }).join('');

  /* ---------- mapa ---------- */
  const mapa = document.getElementById('mapa');
  if(mapa && window.MAPA_D){
    const D = window.MAPA_D, NS = 'http://www.w3.org/2000/svg';
    let paths = '';
    prov.forEach(function(j){
      const href = '#'+(j.enlace || j.id);
      const t = '<title>'+j.nombre+' · '+M[j.mecanica].nombre+'</title>';
      if(j.id === 'caba'){
        paths += '<a href="'+href+'" data-mec="'+j.mecanica+'" data-nombre="'+j.nombre+'" style="--mc:var(--c-'+j.mecanica+')">'+t+'<circle cx="552.8" cy="79.3" r="20"/></a>';
        return;
      }
      if(!D[j.id]) return;
      let d = D[j.id];
      if(j.id === 'tierra-del-fuego' && D.malvinas) d += ' ' + D.malvinas;
      paths += '<a href="'+href+'" data-mec="'+j.mecanica+'" data-nombre="'+j.nombre+'" style="--mc:var(--c-'+j.mecanica+')">'+t+'<path d="'+d+'"/></a>';
    });
    // CABA al final para que quede encima
    mapa.innerHTML = '<svg viewBox="-10 -644 816 1885" role="img" aria-hidden="false">'+paths+'</svg>';
    const caba = mapa.querySelector('a[data-nombre^="Ciudad"]'); if(caba) caba.parentNode.appendChild(caba);
  }

  /* ---------- filtros ---------- */
  let filtro = 'todas', q = '';
  const chips = document.querySelectorAll('[data-filtro]');
  function aplicar(){
    chips.forEach(function(c){ c.classList.toggle('activo', c.getAttribute('data-filtro') === filtro); });
    document.querySelectorAll('.grupo').forEach(function(g){
      const mecOk = filtro === 'todas' || g.getAttribute('data-mec') === filtro;
      let visibles = 0;
      g.querySelectorAll('.card').forEach(function(c){
        const ok = mecOk && (!q || c.getAttribute('data-q').indexOf(q) !== -1);
        c.hidden = !ok; if(ok) visibles++;
      });
      g.querySelectorAll('.sub').forEach(function(s){
        s.hidden = !Array.prototype.some.call(s.querySelectorAll('.card'), function(c){ return !c.hidden; });
      });
      g.hidden = visibles === 0;
    });
    const nacCard = document.querySelector('#nacional .card');
    const nacOk = (filtro === 'todas' || filtro === 'bup') && (!q || nacCard.getAttribute('data-q').indexOf(q) !== -1);
    document.getElementById('nacional-wrap').hidden = !nacOk;
    const total = document.querySelectorAll('#grupos .card:not([hidden])').length + (nacOk ? 1 : 0);
    document.getElementById('vacio').hidden = total > 0;
    document.querySelectorAll('#mapa a').forEach(function(a){ a.classList.toggle('apagado', filtro !== 'todas' && a.getAttribute('data-mec') !== filtro); });
  }
  chips.forEach(function(c){
    c.addEventListener('click', function(){
      const f = c.getAttribute('data-filtro');
      filtro = (filtro === f && f !== 'todas') ? 'todas' : f;
      aplicar();
    });
  });
  document.getElementById('buscar').addEventListener('input', function(e){
    q = e.target.value.trim().toLowerCase(); aplicar();
  });
  aplicar();
})();
