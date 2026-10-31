/* =====================================================================
   Partidos y candidatos ficticios, compartidos por todos los motores.
   Son los mismos del simulador de la BUS de Córdoba.
   ===================================================================== */
window.FICTICIOS = (function(){
  const EMBLEMAS = {
    p1:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    p2:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
    p3:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="12" r="6" opacity=".9"/><circle cx="15" cy="12" r="6" opacity=".55"/></svg>',
    p4:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 17H3z"/></svg>',
    p5:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.6 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z"/></svg>',
    p6:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 20C5 11 10 5 20 4c0 10-5 16-14 16z"/></svg>'
  };
  const PARTIDOS = [
    { code:'p1', num:'101', nombre:'Unidad Vecinal',      color:'#971b2f' },
    { code:'p2', num:'202', nombre:'Horizonte Común',     color:'#3f75a8' },
    { code:'p3', num:'303', nombre:'Encuentro Ciudadano', color:'#7a6038' },
    { code:'p4', num:'404', nombre:'Convergencia Social', color:'#2f8fb8' },
    { code:'p5', num:'505', nombre:'Movimiento Federal',  color:'#b5485a' },
    { code:'p6', num:'606', nombre:'Nueva Alternativa',   color:'#2f8a45' }
  ];
  const NOMBRES = ['Ana','Luis','Marta','Pablo','Sonia','Julián','Carla','Hernán','Paula','Gonzalo','Lucía','Mariano','Romina','Sergio','Natalia','Facundo','Silvia','Matías','Verónica','Emilio','Rocío','Gustavo','Daniela','Ariel'];
  const APELLIDOS = ['Quiroga','Molina','Sosa','Pereyra','Luna','Barrios','Cabrera','Domínguez','Funes','Giménez','Herrera','Ledesma','Maldonado','Navarro','Olivera','Paz','Rivero','Salas','Toledo','Vera','Zárate','Bustos','Cuello','Dávila'];

  function nombre(semilla, k){
    return NOMBRES[(semilla*5 + k*7) % NOMBRES.length] + ' ' + APELLIDOS[(semilla*3 + k*11 + 5) % APELLIDOS.length];
  }
  /* Candidatos de un partido para una categoría, siempre los mismos. */
  function candidatos(pIdx, cIdx, cat){
    const s = pIdx*13 + cIdx*17 + 3;
    if(cat.tipo === 'formula') return cat.roles.map(function(r, k){ return { rol:r, nombre:nombre(s, k) }; });
    if(cat.tipo === 'uno') return [{ rol:cat.rol || '', nombre:nombre(s, 0) }];
    const out = [];
    for(let k = 0; k < (cat.n || 3); k++) out.push({ rol:(k+1)+'.', nombre:nombre(s, k) });
    return out;
  }
  const porCodigo = {};
  PARTIDOS.forEach(function(p){ porCodigo[p.code] = p; });

  return { PARTIDOS:PARTIDOS, EMBLEMAS:EMBLEMAS, candidatos:candidatos, partido:function(c){ return porCodigo[c]; } };
})();
