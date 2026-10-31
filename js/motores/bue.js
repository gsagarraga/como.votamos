/* =====================================================================
   Motor: BOLETA ÚNICA ELECTRÓNICA
   Reproduce el flujo y la interfaz del sistema Vot.Ar (el mismo software
   en CABA, Neuquén y Salta), con los textos de su configuración real:
   "Elija la forma de conformar su voto", "Votar por Categorías",
   "Votar Lista Completa", "Votar en Blanco", "Sus candidatos
   seleccionados", "Reiniciar", "Imprimir", etc.

   Estados:  mesa → insertar → [municipio] → [modo] → categoría | lista
             → confirmación → imprimiendo → impresa → verificando
             → plegado → urna
   Opciones del modelo:
     escenarios[]          variantes (p. ej. CABA 2025 / 2027)
     municipios[]          pantalla previa para elegir municipio (Salta)
     listaCompletaPorNivel la lista completa se vota en dos pasos (Neuquén)
     ordenAleatorio        orden de las listas al azar en cada voto (CABA)
     boletaColor           franja de color de la boleta impresa
   ===================================================================== */
window.MOTORES = window.MOTORES || {};
window.MOTORES.bue = (function(){
  const F = window.FICTICIOS, R = window.Reglas;
  const busto = '<svg viewBox="0 0 24 28" preserveAspectRatio="xMidYMax slice" fill="currentColor"><circle cx="12" cy="10" r="5.2"/><path d="M1 28c0-6.5 5-9.5 11-9.5s11 3 11 9.5z"/></svg>';
  const icoReiniciar = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/></svg>';
  const icoImprimir = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12v5H6z"/><path d="M4 9h16a2 2 0 0 1 2 2v6h-4v4H6v-4H2v-6a2 2 0 0 1 2-2zm4 7v3h8v-3z"/></svg>';
  const icoBlanco = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="15" rx="2"/><path d="M3 8l9 6 9-6"/></svg>';
  const icoContraste = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>';
  const ok = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l6 6L20 6"/></svg>';
  const BLANCO = 'BLC';

  function montar(el, M){
    const pIdx = {}; F.PARTIDOS.forEach(function(p, i){ pIdx[p.code] = i; });
    const st = { esc:M.escenarios[0].id, paso:'mesa', municipio:null, modo:null, cat:0, nivel:0, sel:{}, orden:null, contraste:false, volverAConfirmacion:false, verificada:false };

    el.innerHTML =
      '<div class="sim-grid ancho">'+
        '<div class="sim-col">'+
          '<section class="bloque">'+
            '<div class="bloque-head"><h3>La máquina de votación</h3><p>Tocá la pantalla como lo harías en el cuarto oscuro.</p></div>'+
            (M.escenarios.length > 1 ? '<div class="escenarios" role="group" aria-label="Elección">'+M.escenarios.map(function(e){ return '<button type="button" class="esc" data-acc="esc" data-id="'+e.id+'">'+e.label+'</button>'; }).join('')+'</div>' : '')+
            '<p class="esc-nota" id="bue-nota"></p>'+
            '<div class="bue-escena" id="bue-escena"></div>'+
          '</section>'+
        '</div>'+
        '<aside class="sobre tablero" id="bue-panel" aria-live="polite"></aside>'+
      '</div>';
    const escena = el.querySelector('#bue-escena');
    const panel = el.querySelector('#bue-panel');
    const nota = el.querySelector('#bue-nota');

    function E(){ return M.escenarios.find(function(e){ return e.id === st.esc; }); }
    function cats(){ return E().categorias; }
    function niveles(){ // para lista completa en dos pasos
      const cs = cats();
      if(!M.listaCompletaPorNivel) return [cs];
      const prov = cs.filter(function(c){ return c.nivel !== 'muni'; }), muni = cs.filter(function(c){ return c.nivel === 'muni'; });
      return muni.length ? [prov, muni] : [prov];
    }
    function partidosCat(c){
      let ps = F.PARTIDOS.filter(function(p){ return (E().oferta[p.code] || []).indexOf(c.code) !== -1; });
      return ordenar(ps);
    }
    function partidosNivel(cs){
      let ps = F.PARTIDOS.filter(function(p){ return cs.some(function(c){ return (E().oferta[p.code] || []).indexOf(c.code) !== -1; }); });
      return ordenar(ps);
    }
    function ordenar(ps){
      if(!M.ordenAleatorio) return ps;
      if(!st.orden){ st.orden = F.PARTIDOS.map(function(p){ return p.code; }).sort(function(){ return Math.random() - .5; }); }
      return ps.slice().sort(function(a, b){ return st.orden.indexOf(a.code) - st.orden.indexOf(b.code); });
    }
    function cand(pc, c){ return F.candidatos(pIdx[pc], cats().indexOf(c) + (E().semilla || 0), c); }
    function AN(n){ const i = n.indexOf(' '); return n.slice(i+1)+' '+n.slice(0, i); }
    function grilla(n){ return n <= 2 ? n : n <= 4 ? 2 : n <= 6 ? 3 : n <= 8 ? 4 : n <= 12 ? 4 : 6; }

    /* ---------- piezas de pantalla ---------- */
    function encabezado(solapa){
      return '<div class="bue-enc">'+
        '<p class="bue-datos"><b>'+(st.municipio || M.lugar)+'</b><br><span>Elección de demostración · Uso no oficial</span><br><span>'+M.entidad+'</span></p>'+
        (solapa ? '<div class="bue-solapa">'+solapa+'</div>' : '<div></div>')+
        '<div class="bue-marca">Simulador</div>'+
      '</div>';
    }
    function barra(opts){
      return '<div class="bue-barra">'+
        '<div class="bue-barra-izq"><button type="button" class="bue-bb" data-acc="contraste">'+icoContraste+'<span>Vista alto contraste</span></button>'+
          (opts.atras ? '<button type="button" class="bue-bb" data-acc="atras"><span>'+opts.atras+'</span></button>' : '')+'</div>'+
        (opts.blanco ? '<button type="button" class="bue-blanco" data-acc="blanco">'+icoBlanco+'<span>Votar en Blanco</span></button>' : '')+
      '</div>';
    }
    function tarjetaCandidato(p, c){
      const cs = cand(p.code, c);
      const nombres = (c.tipo === 'formula' ? cs : cs.slice(0, 3)).map(function(x, k){
        return '<div class="bue-cn'+(k === 0 ? ' principal' : '')+'">'+(c.tipo === 'formula' ? '<small>'+x.rol+'</small>' : '<span>'+(k+1)+'.</span>')+AN(x.nombre)+'</div>';
      }).join('');
      return '<button type="button" class="bue-card" data-acc="elegir" data-party="'+p.code+'" style="--pc:'+p.color+'">'+
        '<span class="bue-card-top"><span class="bue-pnom">'+p.nombre+'</span><span class="bue-lista"><small>Lista</small>'+p.num+'</span></span>'+
        '<span class="bue-imgs"><span class="bue-foto">'+busto+'</span><span class="bue-logo">'+F.EMBLEMAS[p.code]+'</span></span>'+
        '<span class="bue-color"></span>'+
        '<span class="bue-noms">'+nombres+'</span>'+
      '</button>';
    }
    function tarjetaLista(p, cs){
      const principales = cs.filter(function(c){ return (E().oferta[p.code] || []).indexOf(c.code) !== -1; }).slice(0, 2);
      return '<button type="button" class="bue-card bue-card-lista" data-acc="elegir-lista" data-party="'+p.code+'" style="--pc:'+p.color+'">'+
        '<span class="bue-card-top"><span class="bue-pnom">'+p.nombre+'</span><span class="bue-lista"><small>Lista</small>'+p.num+'</span></span>'+
        '<span class="bue-imgs"><span class="bue-logo grande">'+F.EMBLEMAS[p.code]+'</span>'+principales.map(function(){ return '<span class="bue-foto chica">'+busto+'</span>'; }).join('')+'</span>'+
        '<span class="bue-color"></span>'+
        '<span class="bue-noms">'+principales.map(function(c){ const x = cand(p.code, c)[0]; return '<div class="bue-cn"><small>'+c.corto+'</small>'+AN(x.nombre)+'</div>'; }).join('')+'</span>'+
      '</button>';
    }
    function resumenCat(c){
      const v = st.sel[c.code];
      if(!v) return '<div class="bue-conf-item vacio"><div class="bue-conf-cat">'+c.label+'</div><p>Candidato aún no seleccionado</p>'+modificar(c)+'</div>';
      if(v === BLANCO) return '<div class="bue-conf-item"><div class="bue-conf-cat">'+c.label+'</div><div class="bue-conf-blanco">Voto en blanco</div>'+modificar(c)+'</div>';
      const p = F.partido(v), cs = cand(v, c);
      const prin = c.tipo === 'formula' ? cs.map(function(x){ return AN(x.nombre).toUpperCase(); }).join(' · ') : AN(cs[0].nombre).toUpperCase();
      const resto = c.tipo === 'lista' ? cs.slice(1).map(function(x){ return AN(x.nombre).toUpperCase(); }).join('; ') : '';
      return '<div class="bue-conf-item" style="--pc:'+p.color+'">'+
        '<div class="bue-conf-cat">'+c.label+'</div>'+
        '<div class="bue-conf-cuerpo"><span class="bue-foto">'+busto+'</span><span class="bue-logo">'+F.EMBLEMAS[v]+'</span><span class="bue-conf-franja"></span>'+
          '<span class="bue-conf-num">Lista<b>'+p.num+'</b></span><div class="bue-conf-tx"><span class="bue-conf-pnom">'+p.nombre+'</span><b class="bue-conf-prin">'+prin+'</b>'+(resto ? '<span class="bue-conf-resto">'+resto+'</span>' : '')+'</div></div>'+
        modificar(c)+
      '</div>';
    }
    function modificar(c){
      const permitir = cats().length > 1 && (st.modo === 'cat' ? M.botonModificar !== false : true);
      return permitir ? '<button type="button" class="bue-modificar" data-acc="modificar" data-cat="'+c.code+'">Modificar</button>' : '';
    }

    function boletaPapel(impresa){
      const cs = cats();
      const filas = impresa ? cs.map(function(c){
        const v = st.sel[c.code];
        if(v === BLANCO || !v) return '<div class="bp-fila"><span class="bp-cat">'+c.label+'</span><b>VOTO EN BLANCO</b></div>';
        const p = F.partido(v), x = cand(v, c);
        return '<div class="bp-fila"><span class="bp-cat">'+c.label+'</span><b>Lista '+p.num+' · '+p.nombre.toUpperCase()+'</b><span>'+(c.tipo === 'formula' ? x.map(function(y){ return AN(y.nombre); }).join(' / ') : AN(x[0].nombre))+'</span></div>';
      }).join('') : '';
      return '<div class="bp'+(impresa ? ' impresa' : '')+(st.paso === 'plegado' || st.paso === 'urna' ? ' plegada' : '')+'" style="--bc:'+(M.boletaColor || '#5bb0dc')+'">'+
        '<div class="bp-troquel t1'+(st.paso === 'mesa' ? '' : ' cortado')+'"><span>Troquel 1 · N° 000123</span></div>'+
        '<div class="bp-cuerpo"><div class="bp-enc"><b>Boleta Única Electrónica</b><span>'+M.entidad+' · Simulador</span></div>'+
          (impresa ? filas : '<div class="bp-vacia">Boleta en blanco</div>')+
          '<span class="bp-chip" title="Chip RFID">'+'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg></span>'+
        '</div>'+
        '<div class="bp-pliegue"><span>Doblar por la línea de puntos</span></div>'+
        '<div class="bp-franja"></div>'+
        '<div class="bp-troquel t2'+(st.paso === 'urna' ? ' cortado' : '')+'"><span>Troquel 2 · N° 000123</span></div>'+
      '</div>';
    }

    /* ---------- pantallas ---------- */
    function pantalla(){
      const cs = cats();
      if(st.paso === 'insertar' || st.paso === 'mesa') return encabezado()+'<div class="bue-msg"><div class="bue-ranura-ico"></div><h1>Introduzca la Boleta Única Electrónica en la impresora</h1><h2>Si tiene dudas, consulte a las autoridades de mesa.</h2><p class="bue-tip">No olvide verificar su selección luego de imprimir</p></div>';
      if(st.paso === 'municipio') return encabezado('Seleccione su municipio')+'<div class="bue-cuerpo"><div class="bue-muni">'+M.municipios.map(function(m){ return '<button type="button" class="bue-opcion" data-acc="municipio" data-m="'+m+'">'+m+'</button>'; }).join('')+'</div></div>'+barra({});
      if(st.paso === 'modo') return encabezado('Elija la forma de conformar su voto')+
        '<div class="bue-cuerpo bue-modos"><button type="button" class="bue-modo" data-acc="modo" data-m="cat"><span class="bue-modo-ico cat"></span>Votar por Categorías</button>'+
        '<button type="button" class="bue-modo" data-acc="modo" data-m="lista"><span class="bue-modo-ico lista"></span>Votar Lista Completa</button></div>'+barra({});
      if(st.paso === 'categoria'){
        const c = cs[st.cat], ps = partidosCat(c), n = grilla(ps.length);
        return encabezado('Candidatos a '+c.label)+
          '<div class="bue-cuerpo"><div class="bue-grid" style="--cols:'+n+'">'+ps.map(function(p){ return tarjetaCandidato(p, c); }).join('')+'</div></div>'+
          barra({ blanco:true, atras: cs.length > 1 ? (st.cat > 0 ? 'Volver Atrás' : 'Cambiar Modo de Votación') : null });
      }
      if(st.paso === 'lista'){
        const nv = niveles()[st.nivel], ps = partidosNivel(nv), n = grilla(ps.length);
        const titulo = niveles().length > 1 ? (st.nivel === 0 ? 'Lista completa · Categorías provinciales' : 'Lista completa · Categorías municipales') : 'Seleccione una lista completa';
        return encabezado(titulo)+'<div class="bue-cuerpo"><div class="bue-grid" style="--cols:'+n+'">'+ps.map(function(p){ return tarjetaLista(p, nv); }).join('')+'</div></div>'+
          barra({ blanco:true, atras: st.nivel > 0 ? 'Volver Atrás' : 'Cambiar Modo de Votación' });
      }
      if(st.paso === 'confirmacion') return encabezado('Sus candidatos seleccionados')+
        '<div class="bue-cuerpo bue-conf"><div class="bue-conf-lista'+(cs.length > 2 ? ' muchos' : '')+'">'+cs.map(resumenCat).join('')+'</div>'+
        '<div class="bue-conf-botones"><button type="button" class="bue-reiniciar" data-acc="reiniciar">'+icoReiniciar+'<span>'+(M.textoReiniciar || 'Reiniciar')+'</span></button><button type="button" class="bue-imprimir" data-acc="imprimir">'+icoImprimir+'<span>Imprimir</span></button></div></div>';
      if(st.paso === 'imprimiendo') return encabezado()+'<div class="bue-msg"><div class="bue-spinner"></div><h1>Se está imprimiendo su boleta</h1><h2>No retire la boleta hasta que se le indique</h2></div>';
      if(st.paso === 'verificando') return encabezado('Verificando selección')+'<div class="bue-cuerpo bue-conf solo"><div class="bue-conf-lista'+(cs.length > 2 ? ' muchos' : '')+'">'+cs.map(function(c){ return resumenCat(c).replace(/<button[^>]*Modificar<\/button>/, ''); }).join('')+'</div></div>'+
        '<div class="bue-barra"><div class="bue-barra-izq"><span class="bue-verif-ok">'+ok+'Lo que grabó el chip coincide con lo impreso</span></div></div>';
      // impresa, plegado, urna, mesa
      return encabezado()+'<div class="bue-msg"><h1>Su boleta ha sido impresa</h1><h2>Puede retirar su boleta y depositarla en la urna</h2><p class="bue-tip">Si desea verificarla, proceda como lo indica la imagen</p><div class="bue-verif-ico"></div></div>';
    }

    const TOTAL = 7;
    const ORDEN = { mesa:1, insertar:2, municipio:2, modo:2, categoria:2, lista:2, confirmacion:3, imprimiendo:4, impresa:5, verificando:5, plegado:6, urna:7 };
    function guia(){
      const n = ORDEN[st.paso];
      const btn = function(paso, acc, txt, sec){ return '<button type="button" class="btn '+(sec ? '' : 'btn-fuerte ')+'bue-paso-btn" data-acc="'+acc+'">'+(paso ? '<span class="bue-paso-n">'+paso+'</span>' : '')+txt+'</button>'; };
      const g = {
        mesa:        ['En la mesa', 'La autoridad de mesa te entrega una boleta en blanco y corta ante vos el primer troquel.', btn(1, 'insertar', 'Recibir la boleta y meterla en la ranura')],
        insertar:    ['En la máquina', 'La boleta entra por la ranura y la pantalla se activa.', ''],
        municipio:   ['En la máquina', 'Tocá tu municipio en la pantalla.', ''],
        modo:        ['En la máquina', 'Elegí en la pantalla cómo querés votar.', ''],
        categoria:   ['En la máquina', 'Tocá en la pantalla la lista que querés votar, o «Votar en Blanco».', ''],
        lista:       ['En la máquina', 'Tocá en la pantalla la lista completa que querés votar.', ''],
        confirmacion:['En la máquina', 'Revisá tu selección. Si está bien, tocá «Imprimir» en la pantalla; si no, «'+(M.textoReiniciar || 'Reiniciar')+'» o «Modificar».', ''],
        imprimiendo: ['En la máquina', 'La máquina imprime tu elección y la graba en el chip. No retires la boleta.', ''],
        impresa:     ['Con la boleta en la mano', 'La máquina devolvió la boleta impresa. Podés comprobar lo que grabó el chip apoyándola en el lector.', btn(5, 'verificar', 'Apoyar la boleta en el verificador')+btn(6, 'plegar', 'Doblar sin verificar', true)],
        verificando: ['Con la boleta en la mano', 'El lector muestra lo grabado en el chip. La máquina no guarda tu voto: queda solo en la boleta.', btn(6, 'plegar', 'Doblar la boleta por la línea de puntos')],
        plegado:     ['De vuelta en la mesa', 'Frente a la autoridad, cortá el segundo troquel y entregalo. La autoridad lo compara con el primero.', btn(7, 'urna', 'Entregar el troquel y depositar en la urna')],
        urna:        ['Listo', 'Tu voto cuenta recién ahora, cuando la boleta entra en la urna.', btn(0, 'otra', 'Votar de nuevo')]
      }[st.paso];
      return '<div class="bue-guia'+(g[2] ? ' con-accion' : '')+'" aria-live="polite">'+
        '<div class="bue-guia-n"><b>'+n+'</b><span>de '+TOTAL+'</span></div>'+
        '<div class="bue-guia-tx"><small>Paso '+n+' · '+g[0]+'</small><p>'+g[1]+'</p></div>'+
        (g[2] ? '<div class="bue-guia-acc">'+g[2]+'</div>' : '')+
        (st.paso === 'mesa' ? '<div class="bue-guia-boleta" aria-hidden="true"><span></span></div>' : '')+
      '</div>';
    }

    function render(){
      el.querySelectorAll('.esc').forEach(function(b){ b.classList.toggle('activo', b.getAttribute('data-id') === st.esc); b.disabled = st.paso !== 'mesa' && st.paso !== 'urna'; });
      nota.textContent = E().nota || '';
      const enMaquina = ['insertar','municipio','modo','categoria','lista','confirmacion','imprimiendo'].indexOf(st.paso) !== -1;
      const boletaFuera = ['impresa','verificando','plegado','urna'].indexOf(st.paso) !== -1;
      const maquina = '<div class="bue-scroll"><div class="bue-maquina'+(st.contraste ? ' contraste' : '')+'">'+
          '<div class="bue-marco"><div class="bue-pantalla">'+pantalla()+'</div></div>'+
          '<div class="bue-base"><span class="bue-ranura'+(enMaquina ? ' con-boleta' : '')+'"></span><span class="bue-lector'+(st.paso === 'verificando' ? ' activo' : '')+'">Verificador</span></div>'+
        '</div></div>';
      const mano = boletaFuera ? '<div class="bue-mano">'+(st.paso === 'urna' ? '<div class="urna-escena"><div class="urna" aria-hidden="true"><div class="urna-ranura"></div><div class="urna-papel"></div><div class="urna-cuerpo"><span>Urna</span></div></div><div class="urna-tx"><h4>Tu boleta está en la urna</h4><p>Doblada por la línea de puntos y sin sobre. El segundo troquel quedó con la autoridad de mesa, que lo comparó con el primero.</p></div></div>' : boletaPapel(true))+'</div>' : '';
      // Después de imprimir, la boleta pasa a primer plano: al lado de la máquina mientras se verifica,
      // y sola (sin máquina) cuando ya se dobla y se lleva a la urna.
      let cuerpo;
      if(st.paso === 'impresa' || st.paso === 'verificando') cuerpo = '<div class="bue-par">'+mano+'<div class="bue-par-maq">'+maquina+'</div></div>';
      else if(st.paso === 'plegado' || st.paso === 'urna') cuerpo = '<div class="bue-solo">'+mano+'</div>';
      else cuerpo = maquina;
      escena.innerHTML = guia()+cuerpo;
      renderPanel();
      escalar();
    }

    function renderPanel(){
      const cs = cats();
      const elegidas = cs.filter(function(c){ return st.sel[c.code]; }).length;
      const filas = cs.map(function(c){
        const v = st.sel[c.code];
        const t = !v ? { cat:c, estado:'blanco', pendiente:true } : v === BLANCO ? { cat:c, estado:'blanco' } : { cat:c, estado:'valido', partido:v };
        return t.pendiente ? '<li class="fila"><span class="fila-cat">'+c.corto+'</span><span class="fila-val"><span class="tenue">Sin elegir todavía</span></span></li>' : R.fila(t);
      }).join('');
      const pasos = [['mesa','Recibir la boleta'], ['elegir','Elegir en la pantalla'], ['confirmacion','Confirmar'], ['imprimiendo','Imprimir'], ['verificando','Verificar'], ['plegado','Doblar y cortar el troquel'], ['urna','Depositar en la urna']];
      const actual = ORDEN[st.paso] - 1;
      panel.className = 'sobre tablero est-'+(st.paso === 'urna' ? 'bien' : 'neutro');
      panel.innerHTML = '<div class="sobre-cuerpo">'+
        '<div class="sobre-titulo"><span>'+(st.paso === 'urna' ? 'Así se cuenta tu voto' : 'Dónde estás')+'</span></div>'+
        '<ol class="bue-progreso">'+pasos.map(function(p, i){ return '<li class="'+(i < actual ? 'hecho' : i === actual ? 'actual' : '')+'">'+p[1]+'</li>'; }).join('')+'</ol>'+
        '<div class="veredicto">'+(st.paso === 'urna' ? '<div class="veredicto-tit">'+ok+'<span>Tu voto vale</span></div>' : '')+
          '<p>'+(st.paso === 'urna' ? 'Con boleta electrónica no hay voto nulo por marcar de más: la pantalla acepta una sola opción por categoría. Solo se anula una boleta escrita, tachada o rota.' : 'Solo se puede elegir una opción por categoría o votar en blanco. Hasta imprimir podés cambiar todo con <b>Reiniciar</b> o <b>Modificar</b>; después, hay que pedir una boleta nueva y la anterior se destruye.')+'</p></div>'+
        '<p class="rotulo-sm">Tu selección ('+elegidas+' de '+cs.length+')</p><ul class="filas">'+filas+'</ul>'+
        '<p class="nota-norma">'+M.norma+'</p>'+
      '</div>';
    }

    function escalar(){
      const m = escena.querySelector('.bue-maquina'); if(!m) return;
      const w = m.clientWidth;
      m.style.setProperty('--u', (w / 100).toFixed(3)+'px');
    }
    window.addEventListener('resize', escalar);

    /* ---------- navegación ---------- */
    function siguienteTrasModo(){
      if(st.modo === 'cat'){ st.paso = 'categoria'; st.cat = 0; }
      else { st.paso = 'lista'; st.nivel = 0; }
    }
    function avanzarCategoria(){
      if(st.volverAConfirmacion){ st.volverAConfirmacion = false; st.paso = 'confirmacion'; return; }
      if(st.cat < cats().length - 1) st.cat++; else st.paso = 'confirmacion';
    }
    function reiniciarVoto(){ st.sel = {}; st.modo = null; st.cat = 0; st.nivel = 0; st.volverAConfirmacion = false; st.paso = cats().length > 1 ? 'modo' : 'categoria'; }

    el.addEventListener('click', function(e){
      const b = e.target.closest('[data-acc]'); if(!b || b.disabled) return;
      const acc = b.getAttribute('data-acc'), cs = cats();
      if(acc === 'esc'){ st.esc = b.getAttribute('data-id'); st.sel = {}; st.paso = 'mesa'; st.municipio = null; st.orden = null; }
      else if(acc === 'insertar'){ st.paso = 'insertar'; render(); setTimeout(function(){ if(st.paso !== 'insertar') return; st.paso = M.municipios ? 'municipio' : (cs.length > 1 ? 'modo' : 'categoria'); st.cat = 0; render(); }, 1300); return; }
      else if(acc === 'municipio'){ st.municipio = b.getAttribute('data-m'); st.paso = cs.length > 1 ? 'modo' : 'categoria'; }
      else if(acc === 'modo'){ st.modo = b.getAttribute('data-m'); siguienteTrasModo(); }
      else if(acc === 'elegir'){ st.sel[cs[st.cat].code] = b.getAttribute('data-party'); avanzarCategoria(); }
      else if(acc === 'elegir-lista'){
        const pc = b.getAttribute('data-party');
        niveles()[st.nivel].forEach(function(c){ st.sel[c.code] = (E().oferta[pc] || []).indexOf(c.code) !== -1 ? pc : BLANCO; });
        if(st.volverAConfirmacion || st.nivel >= niveles().length - 1){ st.volverAConfirmacion = false; st.paso = 'confirmacion'; } else st.nivel++;
      }
      else if(acc === 'blanco'){
        if(st.paso === 'categoria'){ st.sel[cs[st.cat].code] = BLANCO; avanzarCategoria(); }
        else { niveles()[st.nivel].forEach(function(c){ st.sel[c.code] = BLANCO; }); if(st.nivel >= niveles().length - 1){ st.paso = 'confirmacion'; } else st.nivel++; }
      }
      else if(acc === 'atras'){
        if(st.paso === 'categoria' && st.cat > 0) st.cat--;
        else if(st.paso === 'lista' && st.nivel > 0) st.nivel--;
        else if(M.municipios && cs.length <= 1) st.paso = 'municipio';
        else { st.sel = {}; st.paso = 'modo'; }
      }
      else if(acc === 'modificar'){
        const code = b.getAttribute('data-cat'), i = cs.findIndex(function(c){ return c.code === code; });
        st.volverAConfirmacion = true;
        if(st.modo === 'lista'){ st.paso = 'lista'; st.nivel = niveles().findIndex(function(nv){ return nv.some(function(c){ return c.code === code; }); }); }
        else { st.paso = 'categoria'; st.cat = i; }
      }
      else if(acc === 'reiniciar'){ reiniciarVoto(); }
      else if(acc === 'imprimir'){ st.paso = 'imprimiendo'; render(); setTimeout(function(){ if(st.paso === 'imprimiendo'){ st.paso = 'impresa'; render(); } }, 1800); return; }
      else if(acc === 'verificar'){ st.paso = 'verificando'; st.verificada = true; }
      else if(acc === 'plegar'){ st.paso = 'plegado'; }
      else if(acc === 'urna'){ st.paso = 'urna'; }
      else if(acc === 'otra'){ st.sel = {}; st.paso = 'mesa'; st.municipio = null; st.orden = null; st.modo = null; }
      else if(acc === 'contraste'){ st.contraste = !st.contraste; }
      render();
    });

    render();
  }

  return {
    pasos: function(M){ return ['Recibís la boleta en blanco y la metés en la ranura.', 'Elegís en la pantalla táctil.', 'Confirmás tu selección.', 'La máquina imprime y graba el chip.', 'Verificás con el lector.', 'Doblás y entregás el segundo troquel.', 'Depositás la boleta en la urna.']; },
    avisos: function(M){ return ['La pantalla acepta una sola opción por categoría: no se puede votar doble.', 'Hasta imprimir podés corregir todo; después, la boleta se destruye y te dan otra.', 'Escribir, tachar o romper la boleta la anula.']; },
    montar: montar
  };
})();
