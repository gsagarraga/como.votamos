/* =====================================================================
   Reglas comunes de calificación del voto, tramo por tramo.
   Las usan todos los motores: cada motor traduce lo que hizo el elector
   a "marcas por categoría" y estas funciones dicen cómo se computa.

   marcas = { codigoCategoria: [codigoPartido, codigoPartido, ...] }
   (con repetidos: dos boletas iguales del mismo partido = dos entradas)
   ===================================================================== */
window.Reglas = {
  evaluarTramos: function(categorias, marcas){
    return categorias.map(function(cat){
      const arr = marcas[cat.code] || [];
      const unicos = arr.filter(function(v, i){ return arr.indexOf(v) === i; });
      if(arr.length === 0) return { cat:cat, estado:'blanco' };
      if(unicos.length === 1) return { cat:cat, estado:'valido', partido:unicos[0], repetidas:arr.length > 1 };
      return { cat:cat, estado:'nulo', partidos:unicos };
    });
  },
  resumen: function(tramos){
    const r = { valido:0, blanco:0, nulo:0 };
    tramos.forEach(function(t){ r[t.estado]++; });
    return r;
  },
  unirLista: function(arr){
    if(arr.length <= 1) return arr.join('');
    return arr.slice(0, -1).join(', ') + ' y ' + arr[arr.length - 1];
  }
};

/* ---------------------------------------------------------------------
   Lista completa + marcas por categoría. Dos criterios vigentes:
     'prevalece'  (Córdoba)  la lista completa manda; las marcas sueltas
                             no valen.
     'repetidas'  (Mendoza, Santa Fe) se anula solo la categoría donde la
                             lista completa choca con otra agrupación;
                             una marca de la misma agrupación no molesta.
   Con más de una lista completa se anulan todas las categorías.
   presenta(partido, categoria) -> true si esa lista compite ahí.
   --------------------------------------------------------------------- */
window.Reglas.calificar = function(cats, marcas, lc, presenta, regla){
  const R = window.Reglas;
  if(!lc || lc.length === 0) return { modo:'cat', tramos:R.evaluarTramos(cats, marcas) };
  if(lc.length > 1) return { modo:'lc-multi', tramos:cats.map(function(c){ return { cat:c, estado:'nulo', partidos:lc.slice(), porLc:true }; }) };
  const P = lc[0];
  return { modo:'lc', partido:P, tramos:cats.map(function(c){
    const m = marcas[c.code] || [];
    if(!presenta(P, c.code)){
      const t = R.evaluarTramos([c], marcas)[0];
      if(regla === 'prevalece'){ return m.length ? { cat:c, estado:'blanco', sinOferta:true, ignorada:true } : { cat:c, estado:'blanco', sinOferta:true }; }
      return t.estado === 'blanco' ? { cat:c, estado:'blanco', sinOferta:true } : t;
    }
    if(regla === 'prevalece') return { cat:c, estado:'valido', partido:P, ignorada:m.length > 0 };
    const otros = m.filter(function(x, i){ return x !== P && m.indexOf(x) === i; });
    if(otros.length) return { cat:c, estado:'nulo', partidos:[P].concat(otros), choqueLc:true };
    return { cat:c, estado:'valido', partido:P, refuerzo:m.length > 0 };
  }) };
};

/* Texto del veredicto común a los motores de boleta única. */
window.Reglas.veredicto = function(ev, opciones){
  const R = window.Reglas;
  const tramos = ev.tramos, res = R.resumen(tramos);
  const masc = (opciones.palabra || 'categoría') === 'tramo';
  const w = masc
    ? { s:'tramo', p:'tramos', una:'Un', esa:'ese', todas:'todos los', las:'los', unica:'el único', queda:'queda', quedan:'quedan' }
    : { s:'categoría', p:'categorías', una:'Una', esa:'esa', todas:'todas las', las:'las', unica:'la única', queda:'queda', quedan:'quedan' };
  const nombres = function(ts){ return R.unirLista(ts.map(function(t){ return t.cat.corto; })); };
  const ignor = tramos.filter(function(t){ return t.ignorada; });
  const choque = tramos.filter(function(t){ return t.choqueLc; });
  const nulos = tramos.filter(function(t){ return t.estado === 'nulo' && !t.choqueLc; });
  if(!opciones.hayMarca) return { cls:'neutro', tit:'Todavía no marcaste nada', txt:'Si la depositás así, es <b>voto en blanco</b> en '+(tramos.length === 1 ? w.unica+' '+w.s : w.las+' '+tramos.length+' '+w.p)+': vale, pero no suma a ninguna agrupación.' };
  if(ev.modo === 'lc-multi') return { cls:'mal', tit:'Se anula toda la boleta', txt:'Marcaste <b>más de una lista completa</b>. Cada una vale para '+w.todas+' '+w.p+', así que '+(masc ? 'todos' : 'todas')+' quedan con dos opciones y se anulan. Dejá una sola.' };
  if(ignor.length) return { cls:'mal', tit:'Hay marcas que no cuentan', txt:'Marcaste <b>lista completa</b> y además elegiste por separado en <b>'+nombres(ignor)+'</b>. Esas marcas no valen: con lista completa '+w.todas+' '+w.p+' van a la misma agrupación. Para elegir '+w.s+' por '+w.s+', no marques lista completa.' };
  let cls = 'bien', tit = 'Tu voto vale', txt;
  if(choque.length || nulos.length){
    cls = 'mal'; const n = choque.length + nulos.length;
    tit = n === 1 ? w.una+' '+w.s+' se anula' : n+' '+w.p+' se anulan';
    txt = '';
    if(choque.length) txt += 'En <b>'+nombres(choque)+'</b> marcaste otra agrupación además de tu lista completa: '+w.esa+' '+w.s+' queda con dos opciones y es <b>voto nulo</b>. La lista completa sigue valiendo en '+w.las+' demás. ';
    if(nulos.length) txt += 'En <b>'+nombres(nulos)+'</b> marcaste más de una agrupación: '+w.esa+' '+w.s+' es <b>voto nulo</b>; '+w.las+' demás siguen valiendo. ';
    txt += 'Borrá una de las marcas.';
  } else {
    const val = tramos.filter(function(t){ return t.estado === 'valido'; }).map(function(t){ return t.partido; });
    const dist = val.filter(function(v, i){ return val.indexOf(v) === i; });
    txt = ev.modo === 'lc' ? 'Marcaste <b>lista completa</b>: la agrupación se lleva '+w.todas+' '+w.p+' en '+(masc ? 'los' : 'las')+' que presenta candidaturas.'
      : dist.length > 1 ? 'Elegiste <b>'+dist.length+' agrupaciones</b> en '+w.p+' distint'+(masc ? 'os' : 'as')+': es un <b>voto cruzado</b> válido.'
      : 'Una sola marca por '+w.s+', todas para la misma agrupación.';
    if(tramos.some(function(t){ return t.refuerzo; })) txt += ' Las marcas que repetiste para la misma agrupación no molestan.';
  }
  if(res.blanco && cls === 'bien') txt += ' '+res.blanco+' '+(res.blanco === 1 ? w.s+' '+w.queda : w.p+' '+w.quedan)+' en blanco.';
  return { cls:cls, tit:tit, txt:txt };
};

/* Fila del resumen por categoría. */
window.Reglas.fila = function(t){
  const R = window.Reglas, F = window.FICTICIOS;
  let v, c = '';
  if(t.estado === 'blanco'){ v = '<span class="tenue">'+(t.sinOferta ? 'En blanco (la lista no compite acá)' : 'Voto en blanco')+(t.ignorada ? ' · la marca suelta no cuenta' : '')+'</span>'; c = t.ignorada ? ' aviso' : ''; }
  else if(t.estado === 'valido'){ v = F.partido(t.partido).nombre + (t.ignorada ? ' <span class="tenue">(la marca suelta no cuenta)</span>' : ''); c = t.ignorada ? ' aviso' : ' ok'; }
  else { v = 'Nulo <span class="tenue">('+R.unirLista(t.partidos.map(function(x){ return F.partido(x).nombre; }))+')</span>'; c = ' mal'; }
  return '<li class="fila'+c+'"><span class="fila-cat">'+t.cat.corto+'</span><span class="fila-val">'+v+'</span></li>';
};
