/* =====================================================================
   Motor: BOLETA ÚNICA DE PAPEL · partidos en FILAS, categorías en COLUMNAS
   (modelo cordobés). Admite una o varias boletas (Santa Fe 2027 usa tres),
   cada una con su columna de lista completa opcional y sus niveles.

   Calificación por boleta:
     - más de una lista completa  -> se anulan todas sus categorías
     - una lista completa         -> esa agrupación en todas las categorías
                                     donde compite; las marcas sueltas no valen
     - sin lista completa         -> categoría por categoría (window.Reglas)
   ===================================================================== */
window.MOTORES = window.MOTORES || {};
window.MOTORES['bup-filas'] = (function(){
  const F = window.FICTICIOS, R = window.Reglas;

  const check = '<svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l6 6L20 6"/></svg>';
  const flecha = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17L17 7"/></svg>';
  const busto = '<svg viewBox="0 0 24 28" preserveAspectRatio="xMidYMax slice" fill="currentColor"><circle cx="12" cy="10" r="5.2"/><path d="M1 28c0-6.5 5-9.5 11-9.5s11 3 11 9.5z"/></svg>';
  const ok = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l6 6L20 6"/></svg>';
  const alerta = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>';

  function apellidoInicial(n){ const i = n.lastIndexOf(' '); return i < 0 ? n : n.slice(i+1)+', '+n.charAt(0)+'.'; }

  function montar(el, M){
    const pIdx = {}; F.PARTIDOS.forEach(function(p, i){ pIdx[p.code] = i; });
    const st = { depositada:false, b:{} };
    function limpiar(){ M.boletas.forEach(function(B){ st.b[B.id] = { lc:[], cats:{} }; B.categorias.forEach(function(c){ st.b[B.id].cats[c.code] = []; }); }); }
    limpiar();

    el.innerHTML =
      '<div class="sim-grid ancho">'+
        '<div class="sim-col">'+
          '<section class="bloque">'+
            '<div class="bloque-head"><h3>'+(M.boletas.length > 1 ? 'Tus boletas' : 'Tu boleta')+'</h3><p><b>Paso 2:</b> tocá un casillero para marcarlo. Tocá de nuevo para borrar.</p></div>'+
            '<div class="bf-escena" id="bf-escena"></div>'+
          '</section>'+
        '</div>'+
        '<aside class="sobre tablero" id="bf-panel" aria-live="polite"></aside>'+
      '</div>'+
      '<button type="button" class="sobre-barra siempre" id="bf-barra" data-acc="ir-panel"></button>';

    const escenaEl = el.querySelector('#bf-escena');
    const panelEl = el.querySelector('#bf-panel');
    const barraEl = el.querySelector('#bf-barra');

    function partidosDe(B){ return F.PARTIDOS.filter(function(p){ return B.oferta[p.code]; }); }

    /* ---------- dibujo ---------- */
    function celda(B, p, cat, cIdx){
      const info = B.oferta[p.code][cat.code];
      if(!info) return '<td class="bf-cat bf-vacia" title="'+p.nombre+' no presenta candidatos en este tramo"></td>';
      const marks = st.b[B.id].cats[cat.code];
      const btn = '<button type="button" class="bf-check" data-acc="cat" data-bol="'+B.id+'" data-cat="'+cat.code+'" data-party="'+p.code+'" aria-pressed="'+(marks.indexOf(p.code) !== -1)+'" aria-label="'+cat.label+': '+p.nombre+'"'+(st.depositada ? ' disabled' : '')+'>'+check+'</button>';
      let inner;
      if(cat.layout === 'gv'){
        inner = '<div class="bf-tx centro"><span class="bf-rol">'+cat.roles[0]+'</span><b>'+info.tit+'</b><span class="bf-rol">'+cat.roles[1]+'</span>'+(info.sup || '')+'</div>'+btn;
      } else if(cat.layout === 'list'){
        const c = F.candidatos(pIdx[p.code], cIdx, { tipo:'lista', n:5 }).map(function(x){ return apellidoInicial(x.nombre); });
        const tit = info.tit ? [apellidoInicial(info.tit), c[1]] : c.slice(0, 3);
        const sup = info.sup ? [apellidoInicial(info.sup), c[3]] : c.slice(3, 5);
        const nm = function(a){ return a.map(function(n){ return '<span>'+n+'</span>'; }).join(''); };
        inner = '<div class="bf-listas"><div><b>Titulares:</b>'+nm(tit)+'</div><div><b>Suplentes:</b>'+nm(sup)+'</div></div>'+btn;
      } else {
        inner = '<div class="bf-tx"><span class="bf-rol">'+cat.roles[0]+'</span><b>'+info.tit+'</b>'+
          (info.sup ? '<span class="bf-rol">'+cat.roles[1]+'</span>'+info.sup : '')+
          (info.note ? '<span class="bf-nota">'+info.note+'</span>' : '')+'</div>'+
          '<span class="bf-avatar">'+busto+'</span>'+btn;
      }
      return '<td class="bf-cat" data-bol="'+B.id+'" data-cat="'+cat.code+'" data-party="'+p.code+'" style="--pc:'+p.color+'"><div class="bf-in">'+inner+'</div></td>';
    }

    function boleta(B){
      const cats = B.categorias, niveles = B.niveles || [{ code:'_', label:'' }];
      const lc = B.listaCompleta, ps = partidosDe(B);
      const huecos = niveles.length - 1;
      const W = Math.max(46, (lc ? 16 : 0) + cats.length*13.5 + huecos*1.2 + 2);
      const GAP = 1.2/W*100, LC = lc ? 16/W*100 : 0;
      const catPct = (100 - LC - GAP*huecos) / cats.length;
      const nivelDe = function(c){ return c.nivel || '_'; };

      let col = lc ? '<col style="width:'+LC+'%">' : '';
      let prev = nivelDe(cats[0]);
      cats.forEach(function(c){ if(nivelDe(c) !== prev){ col += '<col style="width:'+GAP+'%">'; prev = nivelDe(c); } col += '<col style="width:'+catPct+'%">'; });

      let fila1 = '';
      if(niveles.length > 1){
        niveles.forEach(function(n, i){
          const cuenta = cats.filter(function(c){ return nivelDe(c) === n.code; }).length + (i === 0 && lc ? 1 : 0);
          if(i > 0) fila1 += '<th class="bf-hueco"></th>';
          fila1 += '<th class="bf-nivel n'+i+'" colspan="'+cuenta+'">'+n.label+'</th>';
        });
      }
      let fila2 = lc ? '<th><div class="bf-colhead">'+flecha+' Voto Lista Completa</div></th>' : '';
      prev = nivelDe(cats[0]);
      cats.forEach(function(c){ if(nivelDe(c) !== prev){ fila2 += '<th class="bf-hueco"></th>'; prev = nivelDe(c); } fila2 += '<th><div class="bf-colhead">'+flecha+' '+c.label+'</div></th>'; });

      const s = st.b[B.id];
      const cuerpo = ps.map(function(p){
        let row = '<tr>';
        if(lc){
          const on = s.lc.indexOf(p.code) !== -1;
          row += '<td class="bf-lc" data-bol="'+B.id+'" data-party="'+p.code+'" style="--pc:'+p.color+'"><div class="bf-lc-in">'+
            '<div class="bf-id"><span>Lista</span><b>'+((B.listas || {})[p.code] || p.num)+'</b><span class="bf-emb">'+F.EMBLEMAS[p.code]+'</span></div>'+
            '<div class="bf-pnom">'+p.nombre+'</div>'+
            '<div class="bf-lc-der"><span class="bf-avatar">'+busto+'</span><span class="bf-lc-box"><button type="button" class="bf-check" data-acc="lc" data-bol="'+B.id+'" data-party="'+p.code+'" aria-pressed="'+on+'" aria-label="Lista completa: '+p.nombre+'"'+(st.depositada ? ' disabled' : '')+'>'+check+'</button><span>Voto lista completa</span></span></div>'+
          '</div></td>';
        }
        let pv = nivelDe(cats[0]);
        cats.forEach(function(c, i){
          if(nivelDe(c) !== pv){ row += '<td class="bf-hueco"></td>'; pv = nivelDe(c); }
          row += celda(B, p, c, i);
        });
        return row + '</tr>';
      }).join('');

      return '<div class="bf-scroll"><div class="bf-hoja" data-w="'+W+'" style="width:'+W+'em">'+
        '<div class="bf-marca"><span>SIMULADOR · EJERCICIO DE PRÁCTICA · SIMULADOR · EJERCICIO DE PRÁCTICA</span></div>'+
        '<div class="bf-top">'+
          '<div class="bf-escudo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z"/></svg></div>'+
          '<div class="bf-tit"><h4>'+B.titulo+'</h4><small>SIMULADOR · '+(B.sub ? B.sub+' · ' : '')+'Partidos y candidatos de ejemplo, no reales</small></div>'+
          '<div class="bf-meta"><span>Sección<b>01</b></span><span>Circuito<b>0000</b></span><span>Mesa<b>—</b></span></div>'+
          '<div class="bf-barras"></div>'+
        '</div>'+
        '<table class="bf-tabla"><colgroup>'+col+'</colgroup><thead>'+(fila1 ? '<tr>'+fila1+'</tr>' : '')+'<tr>'+fila2+'</tr></thead><tbody>'+cuerpo+'</tbody></table>'+
      '</div></div>';
    }


    /* ---------- estilo San Luis (Acordada 06-TEP-2025, Anexo II) ---------- */
    function fotos(n){ let h = '<span class="sl-foto f'+n+'">'; for(let k = 0; k < n; k++) h += '<span>'+busto+'</span>'; return h + '</span>'; }
    function nombreCompleto(n){ const i = n.indexOf(' '); return n.slice(i+1)+' '+n.slice(0, i); }
    function boletaSanLuis(B){
      const ps = partidosDe(B), s = st.b[B.id];
      const W = 8 + (B.listaCompleta ? 17 : 0) + B.categorias.length*21;
      const chk = function(acc, extra, on, label){ return '<button type="button" class="bf-check sl-check" data-acc="'+acc+'" data-bol="'+B.id+'" '+extra+' aria-pressed="'+on+'" aria-label="'+label+'"'+(st.depositada ? ' disabled' : '')+'>'+check+'</button>'; };
      let head = '<th class="sl-h sl-h-num">Lista N°</th>'+(B.listaCompleta ? '<th class="sl-h">Voto<br>lista completa</th>' : '');
      B.categorias.forEach(function(c){ head += '<th class="sl-h">'+c.label+'</th>'; });
      const filas = ps.map(function(p){
        let r = '<tr><td class="sl-num">'+((B.listas || {})[p.code] || p.num)+'</td>';
        if(B.listaCompleta){
          const on = s.lc.indexOf(p.code) !== -1;
          r += '<td class="bf-lc sl-lc" data-bol="'+B.id+'" data-party="'+p.code+'" style="--pc:'+p.color+'"><div class="sl-lc-in"><span class="sl-logo">'+F.EMBLEMAS[p.code]+'</span><span class="sl-pnom">'+p.nombre+'</span>'+chk('lc', 'data-party="'+p.code+'"', on, 'Voto lista completa: '+p.nombre)+'</div></td>';
        }
        B.categorias.forEach(function(c, cIdx){
          const info = B.oferta[p.code][c.code];
          if(!info){ r += '<td class="sl-cat sl-vacia"></td>'; return; }
          const on = s.cats[c.code].indexOf(p.code) !== -1;
          let cont;
          if(c.layout === 'ts'){
            cont = fotos(1)+'<span class="sl-tx"><small>Titular</small>'+nombreCompleto(info.tit)+'<small>Suplente</small><i>'+nombreCompleto(info.sup)+'</i></span>';
          } else if(c.layout === 'uno'){
            cont = fotos(1)+'<span class="sl-tx sl-uno">'+info.tit.toUpperCase()+'</span>';
          } else {
            const l = F.candidatos(pIdx[p.code], cIdx, { tipo:'lista', n:5 });
            cont = fotos(2)+'<span class="sl-tx sl-lista"><small>Titulares</small>'+l.map(function(x, k){ return '<span>'+(k+1)+' '+nombreCompleto(x.nombre)+'</span>'; }).join('')+'</span>';
          }
          r += '<td class="bf-cat sl-cat" data-bol="'+B.id+'" data-cat="'+c.code+'" data-party="'+p.code+'"><div class="sl-cat-in">'+cont+chk('cat', 'data-cat="'+c.code+'" data-party="'+p.code+'"', on, c.label+': '+p.nombre)+'</div></td>';
        });
        return r + '</tr>';
      }).join('');
      const troquel = '<span>ELECCIONES GENERALES<br>DE LA PROVINCIA DE SAN LUIS<br>Simulador · ejercicio de práctica</span><span>DISTRITO SAN LUIS<br>SECCIÓN ELECTORAL: 0001<br>JUAN MARTÍN DE PUEYRREDÓN</span><span>CIRCUITO: 0000<br>CIUDAD DE SAN LUIS</span><span>N° DE MESA 0000</span>';
      return '<div class="bf-scroll"><div class="bf-hoja sl-hoja" data-w="'+W+'" style="width:'+W+'em">'+
        '<div class="sl-troquel">'+troquel+'<span>SERIE XXXXXX</span><span>N° DE BOLETA 0000</span></div>'+
        '<div class="sl-troquel sl-troquel-2">'+troquel+'</div>'+
        '<table class="sl-tabla"><thead><tr>'+head+'</tr></thead><tbody>'+filas+'</tbody></table>'+
      '</div></div>';
    }

    /* ---------- estilo Santa Fe (boletas por color, bloque por agrupación) ---------- */
    function apellidoNombre(n){ const i = n.indexOf(' '); return '<b>'+n.slice(i+1).toUpperCase()+'</b><span>'+n.slice(0, i).toUpperCase()+'</span>'; }
    function boletaSantaFe(B){
      const ps = partidosDe(B), s = st.b[B.id];
      const W = B.listaCompleta ? 66 : 50;
      const votoPor = function(acc, extra, on, label, txt){ return '<span class="sf-voto"><span>'+(txt || 'Voto por')+'</span><button type="button" class="bf-check sf-check" data-acc="'+acc+'" data-bol="'+B.id+'" '+extra+' aria-pressed="'+on+'" aria-label="'+label+'"'+(st.depositada ? ' disabled' : '')+'>'+check+'</button></span>'; };
      const bloques = ps.map(function(p){
        let fila = '<div class="sf-id"><span class="sf-num">'+((B.listas || {})[p.code] || p.num)+'</span><span class="sf-logo" style="--pc:'+p.color+'">'+F.EMBLEMAS[p.code]+'</span></div>';
        if(B.listaCompleta){
          const on = s.lc.indexOf(p.code) !== -1;
          fila += '<div class="bf-lc sf-lc" data-bol="'+B.id+'" data-party="'+p.code+'">'+votoPor('lc', 'data-party="'+p.code+'"', on, 'Voto lista completa: '+p.nombre, 'Voto lista completa')+'</div>';
        }
        let pie = false;
        B.categorias.forEach(function(c, cIdx){
          const info = B.oferta[p.code][c.code];
          if(!info){ fila += '<div class="sf-cat sf-vacia"><span>No presenta candidatos</span></div>'; return; }
          const on = s.cats[c.code].indexOf(p.code) !== -1;
          let cont = '';
          if(c.layout === 'gv'){
            cont = '<span class="sf-foto">'+busto+'</span><span class="sf-c"><small>'+c.roles[0]+':</small>'+apellidoNombre(info.tit)+'</span><span class="sf-foto">'+busto+'</span><span class="sf-c"><small>'+c.roles[1]+':</small>'+apellidoNombre(info.sup)+'</span>';
          } else if(c.layout === 'list'){
            const l = F.candidatos(pIdx[p.code], cIdx, { tipo:'lista', n:3 });
            cont = '<span class="sf-foto">'+busto+'</span>'+l.map(function(x, k){ return '<span class="sf-c"><small>'+c.rol+' Tit. '+(k+1)+':</small>'+apellidoNombre(x.nombre)+'</span>'; }).join('');
            pie = true;
          } else {
            cont = '<span class="sf-foto">'+busto+'</span><span class="sf-c"><small>'+c.roles[0]+':</small>'+apellidoNombre(info.tit)+'</span>'+(info.sup ? '<span class="sf-c sf-sup"><small>'+c.roles[1]+':</small>'+apellidoNombre(info.sup)+'</span>' : '');
          }
          fila += '<div class="bf-cat sf-cat" data-bol="'+B.id+'" data-cat="'+c.code+'" data-party="'+p.code+'">'+votoPor('cat', 'data-cat="'+c.code+'" data-party="'+p.code+'"', on, c.label+': '+p.nombre)+'<span class="sf-cands">'+cont+'</span></div>';
        });
        return '<div class="sf-bloque" style="--pc:'+p.color+'"><div class="sf-nombre">'+p.nombre.toUpperCase()+'</div><div class="sf-fila'+(B.listaCompleta ? ' con-lc' : '')+'" style="--ncat:'+B.categorias.length+'">'+fila+'</div>'+
          (pie ? '<div class="sf-pie">Voto por el resto de la lista que se visualiza en los afiches</div>' : '')+'</div>';
      }).join('');
      const heads = B.listaCompleta || B.categorias.length > 1
        ? '<div class="sf-heads'+(B.listaCompleta ? ' con-lc' : '')+'" style="--ncat:'+B.categorias.length+'"><span></span>'+(B.listaCompleta ? '<span>Voto lista completa</span>' : '')+B.categorias.map(function(c){ return '<span>'+c.label+'</span>'; }).join('')+'</div>' : '';
      return '<div class="bf-scroll"><div class="bf-hoja sf-hoja" data-w="'+W+'" style="width:'+W+'em; --fondo:'+(B.color || '#2f9a46')+'">'+
        '<div class="sf-top"><span class="sf-blanco"></span><div class="sf-tit"><small>Elecciones Generales en Santa Fe · Simulador · '+B.sub+'</small><b>Elección de '+B.titulo+'</b></div></div>'+
        heads+'<div class="sf-bloques">'+bloques+'</div>'+
      '</div></div>';
    }

    function urna(){
      return '<div class="urna-escena"><div class="urna" aria-hidden="true"><div class="urna-ranura"></div><div class="urna-papel"></div><div class="urna-cuerpo"><span>Urna</span></div></div>'+
        '<div class="urna-tx"><h4>'+(M.boletas.length > 1 ? 'Tus boletas están en la urna' : 'Tu boleta está en la urna')+'</h4><p>'+(M.urnaTexto || 'La doblaste para que no se vea lo que marcaste y la depositaste sin sobre. Así la va a encontrar la mesa en el escrutinio.')+'</p></div></div>';
    }

    /* ---------- calificación ---------- */
    function evaluarBoleta(B){
      const s = st.b[B.id];
      return R.calificar(B.categorias, s.cats, B.listaCompleta ? s.lc : [], function(pc, code){ return !!(B.oferta[pc] && B.oferta[pc][code]); }, M.lcRegla || 'prevalece');
    }

    function render(){
      escenaEl.innerHTML = st.depositada ? urna() : M.boletas.map(function(B){ return B.estilo === 'sanluis' ? boletaSanLuis(B) : B.estilo === 'santafe' ? boletaSantaFe(B) : boleta(B); }).join('');
      const evs = M.boletas.map(function(B){ return { B:B, ev:evaluarBoleta(B) }; });

      // estados visuales en la boleta
      if(!st.depositada){
        evs.forEach(function(x){
          const s = st.b[x.B.id], porCat = {};
          x.ev.tramos.forEach(function(t){ porCat[t.cat.code] = t; });
          const lcMal = x.ev.modo === 'lc-multi' || x.ev.tramos.some(function(t){ return t.ignorada || t.choqueLc; });
          escenaEl.querySelectorAll('.bf-lc[data-bol="'+x.B.id+'"]').forEach(function(td){
            const m = s.lc.indexOf(td.getAttribute('data-party')) !== -1;
            td.classList.toggle('marcada', m); td.classList.toggle('mal', m && lcMal); td.classList.toggle('bien', m && !lcMal);
          });
          escenaEl.querySelectorAll('.bf-cat[data-bol="'+x.B.id+'"][data-cat]').forEach(function(td){
            const c = td.getAttribute('data-cat'), pc = td.getAttribute('data-party');
            const m = s.cats[c].indexOf(pc) !== -1, t = porCat[c];
            const mal = m && (t.estado === 'nulo' || !!t.ignorada);
            td.classList.toggle('marcada', m); td.classList.toggle('mal', mal); td.classList.toggle('bien', m && !mal);
            td.classList.toggle('tachada', m && !!t.ignorada);
          });
        });
      }

      const hay = M.boletas.some(function(B){ const s = st.b[B.id]; return s.lc.length || B.categorias.some(function(c){ return s.cats[c.code].length; }); });
      // veredicto global: el peor de las boletas
      const orden = { mal:0, bien:1, neutro:2 };
      let V = null;
      evs.forEach(function(x){
        const s = st.b[x.B.id];
        const hayB = s.lc.length || x.B.categorias.some(function(c){ return s.cats[c.code].length; });
        if(!hayB) return;
        const v = R.veredicto(x.ev, { hayMarca:true, palabra:'tramo', plural:'tramos' });
        if(M.boletas.length > 1 && v.cls === 'mal') v.txt = '<b>'+x.B.corto+':</b> '+v.txt;
        if(!V || orden[v.cls] < orden[V.cls]) V = v;
      });
      if(!V){ const todos = [].concat.apply([], evs.map(function(x){ return x.ev.tramos; })); V = R.veredicto({ modo:'cat', tramos:todos }, { hayMarca:false, palabra:'tramo', plural:'tramos' }); }
      let cls = V.cls, tit = V.tit, porque = V.txt;
      if(hay && cls === 'bien' && M.boletas.length > 1){
        const vacias = evs.filter(function(x){ const s = st.b[x.B.id]; return !s.lc.length && !x.B.categorias.some(function(c){ return s.cats[c.code].length; }); });
        if(vacias.length) porque += ' '+R.unirLista(vacias.map(function(x){ return x.B.corto; }))+(vacias.length === 1 ? ' queda' : ' quedan')+' sin marcar: voto en blanco.';
      }
      if(st.depositada){
        porque = porque.replace(/ (Borrá|Dejá|Para elegir)[^.]*\./g, '');
        if(cls === 'mal'){ tit = 'Tu voto quedó con errores'; porque += ' Ya no se puede corregir: '+(M.boletas.length > 1 ? 'las boletas están' : 'la boleta está')+' en la urna.'; }
      }
      const dudosa = M.lcVerificada === false && evs.some(function(x){ return x.ev.modo === 'lc' && x.ev.tramos.some(function(t){ return t.choqueLc || t.refuerzo; }); });

      const filas = evs.map(function(x){
        const cab = M.boletas.length > 1 ? '<li class="fila-grupo">'+x.B.corto+'</li>' : '';
        return cab + x.ev.tramos.map(R.fila).join('');
      }).join('');
      const lcTxt = evs.filter(function(x){ return st.b[x.B.id].lc.length; }).map(function(x){
        return R.unirLista(st.b[x.B.id].lc.map(function(p){ return F.partido(p).nombre; }));
      });

      barraEl.className = 'sobre-barra siempre est-'+(st.depositada ? 'neutro' : cls);
      barraEl.innerHTML = '<span class="sb-n">Tu voto</span><span class="sb-est">'+(st.depositada ? 'En la urna' : tit)+'</span><span class="sb-ir">Ver</span>';

      panelEl.className = 'sobre tablero est-'+cls+(st.depositada ? ' cerrado' : '');
      panelEl.innerHTML =
        '<div class="sobre-cuerpo">'+
          '<div class="sobre-titulo"><span>'+(st.depositada ? 'Escrutinio de la mesa' : 'Cómo se cuenta tu voto')+'</span></div>'+
          '<div class="veredicto"><div class="veredicto-tit">'+(cls === 'mal' ? alerta : cls === 'bien' ? ok : '')+'<span>'+tit+'</span></div><p>'+porque+'</p>'+
            (lcTxt.length && !st.depositada ? '<p class="lc-aviso">Lista completa marcada: '+lcTxt.join(' · ')+'</p>' : '')+
            (dudosa ? '<p class="duda">La ley no detalla este caso. El simulador aplica el criterio de Mendoza y Santa Fe: se anula solo la categoría repetida.</p>' : '')+'</div>'+
          '<p class="rotulo-sm">Tu voto quedaría así</p>'+
          '<ul class="filas">'+filas+'</ul>'+
          '<div class="sobre-acc">'+
            (st.depositada
              ? '<button type="button" class="btn btn-fuerte" data-acc="otra">Votar de nuevo</button>'
              : '<button type="button" class="btn btn-fuerte" data-acc="depositar"><span class="paso-n">3</span>Doblar y meter en la urna</button><button type="button" class="btn" data-acc="borrar">Borrar todo</button>')+
          '</div>'+
          '<p class="nota-norma">'+M.norma+'</p>'+
        '</div>';
      escalar();
    }

    function escalar(){
      const disp = escenaEl.clientWidth - 4;
      escenaEl.querySelectorAll('.bf-hoja').forEach(function(h){
        const f = Math.max(10, Math.min(15, disp / (+h.getAttribute('data-w') || 98)));
        h.style.setProperty('--bfs', f.toFixed(2)+'px');
      });
    }
    window.addEventListener('resize', escalar);

    function alternar(arr, v){ const i = arr.indexOf(v); if(i === -1) arr.push(v); else arr.splice(i, 1); }
    el.addEventListener('click', function(e){
      const t = e.target.closest('[data-acc], .bf-lc'); if(!t) return;
      if(t.disabled) return;
      let acc = t.getAttribute('data-acc');
      if(!acc && t.matches('.bf-lc')){ if(st.depositada) return; acc = 'lc'; }
      const bol = t.getAttribute('data-bol');
      if(acc === 'lc'){ alternar(st.b[bol].lc, t.getAttribute('data-party')); render(); }
      else if(acc === 'cat'){ alternar(st.b[bol].cats[t.getAttribute('data-cat')], t.getAttribute('data-party')); render(); }
      else if(acc === 'borrar'){ limpiar(); render(); }
      else if(acc === 'depositar'){ st.depositada = true; render(); escenaEl.scrollIntoView && escenaEl.scrollIntoView({ behavior:'smooth', block:'start' }); }
      else if(acc === 'otra'){ st.depositada = false; limpiar(); render(); }
      else if(acc === 'ir-panel'){ panelEl.scrollIntoView({ behavior:'smooth', block:'start' }); }
    });

    render();
  }

  return {
    pasos: function(M){
      const lc = M.boletas.some(function(B){ return B.listaCompleta; });
      return [
        M.boletas.length > 1 ? 'Recibís '+M.boletas.length+' boletas firmadas por la autoridad de mesa.' : 'Recibís la boleta firmada por la autoridad de mesa.',
        lc ? 'Lista completa: un mismo partido en todo. Sin lista completa: elegís partido tramo por tramo.' : 'Marcá una opción por tramo.',
        'La doblás y la metés en la urna. No hay sobre.'
      ];
    },
    avisos: function(M){
      const lc = M.boletas.some(function(B){ return B.listaCompleta; });
      const lcTx = (M.lcRegla || 'prevalece') === 'prevalece' ? 'Con lista completa, las marcas sueltas no valen.' : 'Lista completa más otra agrupación en un tramo: se anula ese tramo.';
      return ['Más de una marca en un tramo lo anula.'].concat(lc ? [lcTx, 'Dos listas completas anulan todos los tramos.'] : []);
    },
    montar: montar
  };
})();
