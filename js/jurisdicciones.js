/* =====================================================================
   ¿Cómo votamos en Argentina? — Fichas de jurisdicciones
   ---------------------------------------------------------------------
   Una ficha por distrito (24) + el nivel nacional. Cada simulador se
   arma leyendo su ficha: el motor sale de `mecanica` (+ `modelo`).

   mecanica:  'partidaria' | 'bup' | 'bue'
   modelo (solo BUP):
     orientacion: 'filas'    -> cada partido es una FILA y las categorías
                                van en columnas (modelo cordobés)
                  'columnas' -> cada partido es una COLUMNA y las
                                categorías van en filas (modelo mendocino /
                                nacional)
     boletas:     cantidad de hojas que recibe el elector (1 = integrada)
     listaCompleta: true | false | null (null = a verificar)
   estado: 'disponible' | 'migracion' | 'proximamente'
   pendiente: lo que todavía no se verificó contra la norma; se muestra
              en la portada para que quede claro.
   ===================================================================== */

window.JURISDICCIONES = [
  /* ---------- Nivel nacional ---------- */
  {
    id: 'nacional', nombre: 'Nivel nacional', corto: 'Nación', region: 'Todo el país',
    nivel: 'nacional', mecanica: 'bup',
    modelo: { orientacion: 'columnas', boletas: 1, listaCompleta: false },
    norma: 'Ley 27.781 (Código Electoral Nacional, arts. 62 a 64)',
    resumen: 'Una sola hoja: categorías en filas, agrupaciones en columnas. Sin casillero de lista completa: se marca categoría por categoría.',
    notas: ['Se usó por primera vez en las legislativas del 26/10/2025.', 'La CNE fija un modelo base (Acordada 40/25) y cada Junta Electoral lo adapta a su distrito.'],
    primarias: 'Sí', estado: 'disponible', pendiente: []
  },

  /* ---------- Boleta Única de Papel ---------- */
  {
    id: 'cordoba', nombre: 'Córdoba', region: 'Centro/Pampeana', mecanica: 'bup',
    modelo: { orientacion: 'filas', boletas: 1, listaCompleta: true },
    norma: 'Ley 9.571 (Código Electoral Provincial), arts. 53, 54 y 122',
    resumen: 'Boleta Única de Sufragio (BUS): partidos en filas, categorías en columnas, con casillero de lista completa.',
    notas: ['Vigente desde 2011.', 'Mismo simulador de la BUS, ahora sobre el motor común.'],
    primarias: 'No', estado: 'disponible', pendiente: []
  },
  {
    id: 'santa-fe', nombre: 'Santa Fe', region: 'Centro/Pampeana', mecanica: 'bup',
    modelo: { orientacion: 'filas', boletas: 3, boletasPaso: 5, listaCompleta: true },
    norma: 'Ley 14.478 (Código Electoral, 2026)',
    resumen: 'Varias boletas únicas. En las PASO, una por categoría; en las generales, tres: Gobernador + Diputados, Senador e Intendente + Concejales. Lectura horizontal.',
    notas: ['Rige desde 2027. Antes votaba con una boleta por categoría (2011–2025).', 'Lista completa solo en las boletas que agrupan más de una categoría.'],
    primarias: 'Sí', estado: 'proximamente', pendiente: ['Validez de marcas y voto en blanco con el código nuevo']
  },
  {
    id: 'mendoza', nombre: 'Mendoza', region: 'Cuyo', mecanica: 'bup',
    modelo: { orientacion: 'columnas', boletas: 1, listaCompleta: true },
    norma: 'Ley provincial de Boleta Única de Papel',
    resumen: 'El modelo que tomó la Nación: categorías en filas, agrupaciones en columnas, pero con lista completa.',
    notas: ['Debutó en 2023.', 'Si la elección coincide con la nacional se vota con doble urna: una boleta nacional y otra provincial.'],
    primarias: 'Sí', estado: 'proximamente', pendiente: ['Número de ley y artículos', 'Reglas de nulidad parcial']
  },
  {
    id: 'chubut', nombre: 'Chubut', region: 'Patagonia', mecanica: 'bup',
    modelo: { orientacion: 'columnas', boletas: 1, listaCompleta: null },
    norma: 'Ley XII Nº 21 (Código Electoral, 2024)',
    resumen: 'Boleta integrada con cargos en filas y agrupaciones en columnas, similar a la mendocina.',
    notas: ['Primer Código Electoral de la provincia, aprobado en noviembre de 2024.'],
    primarias: 'No', estado: 'proximamente', pendiente: ['Si tiene casillero de lista completa', 'Reglas de nulidad']
  },
  {
    id: 'entre-rios', nombre: 'Entre Ríos', region: 'Centro/Pampeana', mecanica: 'bup',
    modelo: { orientacion: 'columnas', boletas: 1, listaCompleta: true },
    norma: 'Reforma del Código Electoral provincial (diciembre de 2024)',
    resumen: 'Boleta integrada de inspiración mendocina, con candidatos con foto y opción de lista completa.',
    notas: ['Debuta en las elecciones provinciales de 2027; contempla PASO.'],
    primarias: 'Sí', estado: 'proximamente', pendiente: ['Número de ley y artículos', 'Diseño final aprobado']
  },
  {
    id: 'san-luis', nombre: 'San Luis', region: 'Cuyo', mecanica: 'bup',
    modelo: { orientacion: 'filas', boletas: 1, listaCompleta: false },
    norma: 'Ley XI-1149-2024',
    resumen: 'Boleta integrada horizontal: las columnas son las categorías en juego (varían según el municipio). Sin lista completa.',
    notas: ['Debutó el 11/05/2025. La misma reforma derogó la Ley de Lemas.'],
    primarias: 'Sí', estado: 'proximamente', pendiente: ['Reglas de nulidad parcial']
  },

  /* ---------- Boleta Única Electrónica ---------- */
  {
    id: 'caba', nombre: 'Ciudad de Buenos Aires', corto: 'CABA', region: 'Centro/Pampeana', mecanica: 'bue',
    norma: '', resumen: 'Se elige en pantalla, se imprime una boleta con chip y se verifica antes de depositarla.',
    notas: [], primarias: 'Sí', estado: 'proximamente', pendiente: ['Norma vigente', 'Pantallas y pasos del equipo']
  },
  {
    id: 'neuquen', nombre: 'Neuquén', region: 'Patagonia', mecanica: 'bue',
    norma: '', resumen: 'Se elige en pantalla, se imprime una boleta con chip y se verifica antes de depositarla.',
    notas: [], primarias: 'No', estado: 'proximamente', pendiente: ['Norma vigente', 'Pantallas y pasos del equipo']
  },
  {
    id: 'salta', nombre: 'Salta', region: 'NOA', mecanica: 'bue',
    norma: '', resumen: 'Se elige en pantalla, se imprime una boleta con chip y se verifica antes de depositarla.',
    notas: [], primarias: 'No', estado: 'proximamente', pendiente: ['Norma vigente', 'Pantallas y pasos del equipo']
  },

  /* ---------- Boleta partidaria ---------- */
  { id: 'buenos-aires', nombre: 'Buenos Aires', region: 'Centro/Pampeana', mecanica: 'partidaria', primarias: 'Sí' },
  { id: 'catamarca', nombre: 'Catamarca', region: 'NOA', mecanica: 'partidaria', primarias: 'Sí' },
  { id: 'chaco', nombre: 'Chaco', region: 'NEA', mecanica: 'partidaria', primarias: 'Sí' },
  { id: 'corrientes', nombre: 'Corrientes', region: 'NEA', mecanica: 'partidaria', primarias: 'No' },
  { id: 'formosa', nombre: 'Formosa', region: 'NEA', mecanica: 'partidaria', primarias: 'No' },
  { id: 'jujuy', nombre: 'Jujuy', region: 'NOA', mecanica: 'partidaria', primarias: 'No' },
  { id: 'la-pampa', nombre: 'La Pampa', region: 'Centro/Pampeana', mecanica: 'partidaria', primarias: 'Sí' },
  { id: 'la-rioja', nombre: 'La Rioja', region: 'Cuyo', mecanica: 'partidaria', primarias: 'No' },
  { id: 'misiones', nombre: 'Misiones', region: 'NEA', mecanica: 'partidaria', primarias: 'No' },
  { id: 'rio-negro', nombre: 'Río Negro', region: 'Patagonia', mecanica: 'partidaria', primarias: 'No' },
  { id: 'san-juan', nombre: 'San Juan', region: 'Cuyo', mecanica: 'partidaria', primarias: 'No' },
  { id: 'santa-cruz', nombre: 'Santa Cruz', region: 'Patagonia', mecanica: 'partidaria', primarias: 'No' },
  { id: 'santiago', nombre: 'Santiago del Estero', region: 'NOA', mecanica: 'partidaria', primarias: 'No' },
  { id: 'tierra-del-fuego', nombre: 'Tierra del Fuego', region: 'Patagonia', mecanica: 'partidaria', primarias: 'No' },
  { id: 'tucuman', nombre: 'Tucumán', region: 'NOA', mecanica: 'partidaria', primarias: 'No' }
];


/* Valores por defecto para las fichas de boleta partidaria (se completan
   provincia por provincia cuando se arme cada simulador). */
/* Lemas, sublemas y acoples vigentes en distritos con boleta partidaria (relevado oct. 2026). */
const SISTEMAS_PARTIDARIOS = {
  'formosa':   { tag:'Ley de lemas', nota:'Rige la ley de lemas: un partido (lema) presenta varias listas (sublemas) y sus votos se suman. En 2025 hubo 78 sublemas.' },
  'misiones':  { tag:'Lemas municipales', nota:'Lemas y sublemas solo para cargos municipales (intendente, concejales). Para gobernador se eliminaron en 2006.' },
  'san-juan':  { tag:'Ley de lemas (SiPAD)', nota:'Rige el SiPAD, un sistema de lemas. El gobierno impulsa derogarlo; a junio de 2026 la reforma seguía en la Legislatura.' },
  'tucuman':   { tag:'Acoples', nota:'Rigen los acoples: varias listas de legisladores o concejales se pegan a un mismo candidato a gobernador o intendente. La reforma no avanzó y 2027 se vota con estas reglas.' },
  'santa-cruz':{ tag:'Sin lemas desde 2024', nota:'Derogó la ley de lemas en 2024. La norma de transición venció a fines de 2025 y la nueva ley electoral todavía no se sancionó (oct. 2026).' }
};
window.JURISDICCIONES.forEach(function(j){
  if(j.mecanica !== 'partidaria') return;
  const sis = SISTEMAS_PARTIDARIOS[j.id];
  if(sis){ j.lemas = sis.tag; j.notas = [sis.nota]; }
  j.estado = 'general'; j.enlace = 'partidaria-general'; j.pendiente = [];
  j.compacto = true;
  j.norma = j.norma || '';
  j.resumen = j.resumen || 'Una boleta por partido. Se pueden cortar por tramo y combinar, todo dentro de un sobre.';
  j.notas = j.notas || [];
  j.estado = j.estado || 'proximamente';
  if(j.compacto === undefined) j.compacto = !j.norma; // sin datos propios todavía: tarjeta corta
  j.pendiente = j.pendiente || ['Norma vigente', 'Categorías y tramos de la boleta', 'Lemas, sublemas o acoples, si los hay'];
});

window.MECANICAS = {
  partidaria: {
    nombre: 'Boleta partidaria',
    sigla: 'BP',
    color: '#4fa6d9',
    como: 'Cada partido imprime su boleta. En el cuarto oscuro elegís una de la mesa, podés cortarla por tramos y combinar partidos, y la metés en el sobre.',
    errores: 'Dos boletas del mismo tramo en el sobre anulan ese tramo.'
  },
  bup: {
    nombre: 'Boleta Única de Papel',
    sigla: 'BUP',
    color: '#d8503c',
    como: 'El Estado imprime una sola boleta con toda la oferta. Marcás con lapicera una opción por categoría, la doblás y va directo a la urna, sin sobre.',
    errores: 'Más de una marca en una categoría anula esa categoría.'
  },
  bue: {
    nombre: 'Boleta Única Electrónica',
    sigla: 'BUE',
    color: '#4f9668',
    como: 'Elegís en una pantalla, la máquina imprime tu boleta y graba el voto en un chip. Verificás lo impreso y la depositás en la urna.',
    errores: 'El equipo no deja marcar dos opciones en la misma categoría.'
  }
};

/* =====================================================================
   Modelos generales: simuladores que muestran la mecánica sin atarse a
   una provincia. Sirven mientras se verifica cada ficha provincial.
   ===================================================================== */
window.MODELOS = {
  'partidaria-general': {
    id:'partidaria-general', mecanica:'partidaria',
    titulo:'Boleta partidaria', bajada:'Modelo general · partidos y candidatos ficticios',
    nivel:'Elección provincial y municipal',
    categorias: [
      { code:'gob', label:'Gobernador y Vicegobernador', corto:'Gobernador y Vice', tipo:'formula', roles:['Gobernador','Vice'] },
      { code:'dip', label:'Diputados provinciales', corto:'Diputados', tipo:'lista', n:4 },
      { code:'int', label:'Intendente', corto:'Intendente', tipo:'uno' },
      { code:'con', label:'Concejales', corto:'Concejales', tipo:'lista', n:3 }
    ],
    /* qué tramos presenta cada partido: una boleta solo trae los tramos donde el partido compite */
    oferta: {
      p1:['gob','dip','int','con'],
      p2:['gob','dip','int','con'],
      p3:['dip','int','con'],
      p4:['gob','dip','int','con'],
      p6:['int','con']
    },
    norma:'Criterio de calificación del Código Electoral Nacional anterior a la Ley 27.781 (art. 101), que siguen en general los códigos provinciales con boleta partidaria. Las particularidades de cada provincia se cargan en su ficha.'
  }
};

/* ---------- Boleta Única de Papel nacional (Ley 27.781 + Acordada CNE 40/25) ---------- */
window.MODELOS['nacional'] = {
  id:'nacional', mecanica:'bup-columnas',
  titulo:'Boleta Única de Papel nacional', bajada:'Cargos nacionales · partidos y candidatos ficticios',
  nivel:'Nivel nacional',
  distrito:'Provincia imaginaria',
  listaCompleta:false,
  escenarios:[
    { id:'legislativa', label:'Legislativa con Senado', elecciones:'Elecciones Nacionales · Legislativas',
      nota:'Es el formato que se usó en 2025 en los distritos que renovaban senadores. Diseño según la Acordada CNE 40/25.',
      categorias:[
        { code:'sen', label:'Senadores Nacionales', corto:'Senadores', tipo:'lista', n:2 },
        { code:'dip', label:'Diputados Nacionales', corto:'Diputados', tipo:'lista', n:5 }
      ],
      oferta:{ p1:['sen','dip'], p2:['sen','dip'], p3:['dip'], p4:['sen','dip'], p5:['sen','dip'], p6:['dip'] }
    },
    { id:'presidencial', label:'Presidencial', elecciones:'Elecciones Nacionales · Presidenciales',
      nota:'La Ley 27.781 todavía no se usó en una presidencial y la CNE no publicó ese modelo: esta versión extiende las pautas de 2025 a las cinco categorías.',
      categorias:[
        { code:'pres', label:'Presidente y Vicepresidente', corto:'Presidente', tipo:'formula', roles:['Presidente','Vice'] },
        { code:'sen', label:'Senadores Nacionales', corto:'Senadores', tipo:'lista', n:2 },
        { code:'dip', label:'Diputados Nacionales', corto:'Diputados', tipo:'lista', n:5 },
        { code:'psr', label:'Parlamentarios del Mercosur · Distrito regional', corto:'Parlasur regional', tipo:'lista', n:1 },
        { code:'psn', label:'Parlamentarios del Mercosur · Distrito nacional', corto:'Parlasur nacional', tipo:'lista', n:3 }
      ],
      oferta:{ p1:['pres','sen','dip','psr','psn'], p2:['pres','sen','dip','psr','psn'], p3:['dip','psr'], p4:['pres','sen','dip','psr','psn'], p5:['pres','dip','psn'], p6:['pres','sen','dip','psr','psn'] }
    }
  ],
  norma:'Ley 27.781 (Código Electoral Nacional, arts. 62 a 64) y Acordada CNE 40/25. Una categoría sin marca es voto en blanco; dos o más marcas para agrupaciones distintas en una categoría la anulan, y las demás categorías siguen valiendo.'
};

/* ---------- Córdoba: Boleta Única de Sufragio (migrada del simulador original) ---------- */
window.MODELOS['cordoba'] = {
  id:'cordoba', mecanica:'bup-filas',
  titulo:'Boleta Única de Sufragio (BUS)', bajada:'Córdoba · partidos y candidatos de ejemplo, no reales',
  nivel:'Provincia de Córdoba',
  boletas:[{
    id:'bus', titulo:'Elecciones Generales de la Provincia de Córdoba', sub:'Provincial + Municipal',
    listaCompleta:true,
    niveles:[ { code:'prov', label:'Nivel Provincial' }, { code:'muni', label:'Nivel Municipal' } ],
    /* layout: 'gv' solo cuadro con fórmula · 'list' titulares y suplentes · 'face' con cara */
    categorias:[
      { code:'gob', label:'Gobernador y Vice', corto:'Gobernador y Vice', layout:'gv', roles:['Gobernador','Vice'], nivel:'prov' },
      { code:'legdist', label:'Legislador Distrito Único', corto:'Leg. Distrito Único', layout:'list', nivel:'prov' },
      { code:'legdep', label:'Legislador Departamental', corto:'Leg. Departamental', layout:'face', roles:['Titular','Suplente'], nivel:'prov' },
      { code:'tribunal', label:'Tribunal de Cuentas Provincial', corto:'Trib. Cuentas Prov.', layout:'list', nivel:'prov' },
      { code:'intendente', label:'Intendente y Concejales', corto:'Intendente y Concejales', layout:'face', roles:['Intendente','Suplente'], nivel:'muni' },
      { code:'tribmun', label:'Tribunal de Cuentas Municipal', corto:'Trib. Cuentas Municipal', layout:'list', nivel:'muni' }
    ],
    listas:{ p1:'P242', p2:'A101', p3:'P22', p4:'A304', p5:'A203', p6:'A701' },
    oferta:{
      p1:{ gob:{tit:'Marcos Ibáñez', sup:'Lucía Paredes'}, legdist:{}, legdep:{tit:'Diego Solá', sup:'Ana Bracamonte'}, tribunal:{tit:'Rocío Ferrer', sup:'Iván Correa'}, intendente:{tit:'Andrés Molina', note:'+ Concejales'}, tribmun:{tit:'Karina Suárez', sup:'Leonel Paz'} },
      p2:{ gob:{tit:'Carla Núñez', sup:'Rubén Acosta'}, legdist:{}, legdep:{tit:'Elena Vargas', sup:'Tomás Bianchi'}, tribunal:{tit:'Federico Ortiz', sup:'Malena Ríos'}, intendente:{tit:'Silvina Roldán', note:'+ Concejales'}, tribmun:{tit:'Braian Cuello', sup:'Ornella Sosa'} },
      p3:{ gob:{tit:'Pablo Ferreyra', sup:'Nadia Quiroga'}, legdist:{}, tribunal:{tit:'Hugo Medina', sup:'Rosa Funes'}, tribmun:{tit:'Walter Gómez', sup:'Celeste Ibarra'} },
      p4:{ gob:{tit:'Valeria Torres', sup:'Ignacio Bazán'}, legdist:{}, legdep:{tit:'Sofía Aguirre', sup:'Pedro Lucero'}, tribunal:{tit:'Camila Ponce', sup:'Ezequiel Vega'}, intendente:{tit:'Joaquín Bustos', note:'+ Concejales'}, tribmun:{tit:'Daniela Coria', sup:'Maximiliano Ríos'} },
      p5:{ gob:{tit:'Ramiro Cáceres', sup:'Agustina Luna'}, legdist:{}, legdep:{tit:'Martín Ojeda', sup:'Yamila Soria'}, intendente:{tit:'Betiana Rossi', note:'+ Concejales'} },
      p6:{ gob:{tit:'Julieta Rossi', sup:'Emanuel Díaz'}, legdist:{}, legdep:{tit:'Bianca Herrera', sup:'Nicolás Peralta'}, tribunal:{tit:'Lorena Assad', sup:'Gastón Nieva'}, intendente:{tit:'Rodrigo Espeche', note:'+ Concejales'}, tribmun:{tit:'Yésica Toledo', sup:'Franco Almada'} }
    }
  }],
  norma:'Mecánica basada en el Código Electoral Provincial de Córdoba, <a href="https://www.justiciacordoba.gob.ar/Estatico/JEL/Contenido/Legislacion/files/Electoral/L.9571.pdf" target="_blank" rel="noopener">Ley N° 9.571</a>, arts. 53, 54 y 122 (incs. 1 y 2), modif. Leyes 9.838 y 10.272. La anulación del tramo con más de una marca sigue el criterio de la Cámara Nacional Electoral para la Boleta Única de Papel.'
};

/* =====================================================================
   Boletas únicas provinciales (verificadas contra la norma, oct. 2026)
   ===================================================================== */

/* ---------- Mendoza · Ley 9.375 (modifica la Ley 2.551) ---------- */
window.MODELOS['mendoza'] = {
  id:'mendoza', mecanica:'bup-columnas',
  titulo:'Boleta Única de Papel de Mendoza', bajada:'Mendoza · partidos y candidatos ficticios',
  nivel:'Provincia de Mendoza', distrito:'Mendoza',
  listaCompleta:true, lcRegla:'repetidas', estilo:'mendoza',
  escenarios:[
    { id:'general', label:'Con Gobernador', elecciones:'Elecciones Provinciales · Generales',
      nota:'Así fue la boleta de las generales de 2023: lista completa, Gobernador y Vice, Senadores, Diputados, Intendente y Concejales (art. 17 bis).',
      categorias:[
        { code:'gob', label:'Gobernador y Vicegobernador', corto:'Gobernador', tipo:'formula', roles:['Gobernador','Vicegobernador'] },
        { code:'sen', label:'Senadores provinciales', corto:'Senadores', tipo:'lista', n:6 },
        { code:'dip', label:'Diputados provinciales', corto:'Diputados', tipo:'lista', n:8 },
        { code:'int', label:'Intendente', corto:'Intendente', tipo:'uno', rol:'Intendente' },
        { code:'con', label:'Concejales', corto:'Concejales', tipo:'lista', n:6 }
      ],
      oferta:{ p1:['gob','sen','dip','int','con'], p2:['gob','sen','dip','int','con'], p3:['sen','dip','con'], p4:['gob','sen','dip','int','con'], p6:['gob','sen','dip','int','con'] }
    },
    { id:'legislativa', label:'Legislativa (2025)', elecciones:'Elecciones Provinciales · Legislativas',
      nota:'La boleta provincial de 2025: Senadores, Diputados y, en algunos departamentos, Concejales. Ese año se votó con doble urna, porque la nacional va en otra boleta.',
      categorias:[
        { code:'sen', label:'Senadores provinciales', corto:'Senadores', tipo:'lista', n:6 },
        { code:'dip', label:'Diputados provinciales', corto:'Diputados', tipo:'lista', n:8 },
        { code:'con', label:'Concejales', corto:'Concejales', tipo:'lista', n:6 }
      ],
      oferta:{ p1:['sen','dip','con'], p2:['sen','dip','con'], p3:['dip','con'], p4:['sen','dip','con'], p6:['sen','dip'] }
    }
  ],
  norma:'Ley 9.375 (arts. 17 bis, 46 bis, 46 ter y 46 quater de la Ley 2.551). Lista completa más marcas de otra agrupación: se anula solo la categoría repetida (art. 46 ter, inc. a). Lista completa más marcas de la misma agrupación: voto válido (manual de autoridades de mesa 2025). Sin marcas: voto en blanco.'
};

/* ---------- Chubut · Ley XII Nº 21 (Código Electoral, 2024) ---------- */
window.MODELOS['chubut'] = {
  id:'chubut', mecanica:'bup-columnas',
  titulo:'Boleta Única de Sufragio de Chubut', bajada:'Chubut · partidos y candidatos ficticios',
  nivel:'Provincia del Chubut', distrito:'Chubut',
  aviso:'Chubut todavía no usó esta boleta en una elección provincial. El diseño sigue el art. 47 de la Ley XII Nº 21 y la estética del modelo aprobado para Gaiman (Resolución SEP 15/2026).',
  listaCompleta:true, lcRegla:'repetidas', lcVerificada:false, fotoEnCabecera:true, estilo:'chubut',
  escenarios:[
    { id:'general', label:'Provincial y municipal', elecciones:'Elecciones Provinciales y Municipales',
      nota:'Diseño del art. 47 y 48: primera fila negra con lista completa y foto del candidato a Gobernador; después Gobernador y Vice, Diputados, Consejo de la Magistratura, Intendente y Vice, y Concejales.',
      categorias:[
        { code:'gob', label:'Gobernador y Vicegobernador', corto:'Gobernador', tipo:'formula', roles:['Gobernador','Vice'] },
        { code:'dip', label:'Diputados provinciales', corto:'Diputados', tipo:'lista', n:5 },
        { code:'cm', label:'Consejo de la Magistratura (consejeros populares)', corto:'Consejo Magistratura', tipo:'formula', roles:['Titular','Suplente'] },
        { code:'int', label:'Intendente y Viceintendente', corto:'Intendente', tipo:'formula', roles:['Intendente','Vice'] },
        { code:'con', label:'Concejales', corto:'Concejales', tipo:'lista', n:4 }
      ],
      oferta:{ p1:['gob','dip','cm','int','con'], p2:['gob','dip','cm','int','con'], p3:['dip','int','con'], p4:['gob','dip','cm','int','con'], p5:['gob','dip','int','con'] }
    }
  ],
  norma:'Ley XII Nº 21, arts. 45 a 50 (diseño de la Boleta Única de Sufragio). Estética tomada del modelo de BUS aprobado por la Resolución I SEP Nº 15/2026 (elecciones de Gaiman, 13/12/2026). La lista de diputados muestra los primeros de 16. El código no detalla qué pasa con lista completa más marcas sueltas: el simulador aplica el criterio de Mendoza.'
};

/* ---------- Entre Ríos · reforma del Código Electoral (dic. 2024), debut 2027 ---------- */
window.MODELOS['entre-rios'] = {
  id:'entre-rios', mecanica:'bup-columnas',
  titulo:'Boleta Única de Papel de Entre Ríos', bajada:'Entre Ríos · partidos y candidatos ficticios',
  nivel:'Provincia de Entre Ríos', distrito:'Entre Ríos',
  listaCompleta:true, lcRegla:'repetidas', lcVerificada:false,
  escenarios:[
    { id:'general', label:'Elección general 2027', elecciones:'Elecciones Provinciales y Municipales 2027',
      nota:'Boleta integrada de inspiración mendocina: columnas por agrupación, filas por categoría y casillero de lista completa en el primer tramo. Debuta en 2027.',
      categorias:[
        { code:'gob', label:'Gobernador y Vicegobernador', corto:'Gobernador', tipo:'formula', roles:['Gobernador','Vice'] },
        { code:'sen', label:'Senador departamental', corto:'Senador', tipo:'formula', roles:['Titular','Suplente'] },
        { code:'dip', label:'Diputados provinciales', corto:'Diputados', tipo:'lista', n:5 },
        { code:'int', label:'Presidente municipal', corto:'Pte. municipal', tipo:'formula', roles:['Presidente','Vice'] },
        { code:'con', label:'Concejales', corto:'Concejales', tipo:'lista', n:4 }
      ],
      oferta:{ p1:['gob','sen','dip','int','con'], p2:['gob','sen','dip','int','con'], p4:['gob','sen','dip','int','con'], p5:['dip','int','con'], p6:['gob','sen','dip','int','con'] }
    }
  ],
  norma:'Reforma del Código Electoral de Entre Ríos (sancionada el 27/12/2024). La descripción del diseño sale de la cobertura de prensa; falta contrastar con el texto de la ley el detalle de fotos, el orden de filas y qué pasa con lista completa más marcas sueltas (el simulador aplica el criterio de Mendoza).'
};

/* ---------- San Luis · Ley XI-1149-2024 ---------- */
window.MODELOS['san-luis'] = {
  id:'san-luis', mecanica:'bup-filas',
  titulo:'Boleta Única Papel de San Luis', bajada:'San Luis · modelo del 11 de mayo de 2025 · partidos y candidatos ficticios',
  nivel:'Provincia de San Luis',
  lcRegla:'repetidas', lcVerificada:false,
  boletas:[{
    id:'bup', corto:'Boleta', estilo:'sanluis', listaCompleta:true,
    categorias:[
      { code:'sen', label:'Senador provincial por el Dpto. Pueyrredón', corto:'Senador', layout:'ts' },
      { code:'dip', label:'Diputados provinciales por el Dpto. Pueyrredón', corto:'Diputados', layout:'lista' },
      { code:'int', label:'Intendente municipal de la Ciudad de San Luis', corto:'Intendente', layout:'uno' },
      { code:'con', label:'Concejales municipales de la Ciudad de San Luis', corto:'Concejales', layout:'lista' }
    ],
    listas:{ p1:'10', p2:'22', p3:'35', p4:'41', p5:'57', p6:'63' },
    oferta:{
      p1:{ sen:{tit:'Paula Vera', sup:'Luis Salas'}, dip:{}, int:{tit:'Sonia Cabrera'}, con:{} },
      p2:{ sen:{tit:'Facundo Paz', sup:'Marta Bustos'}, dip:{}, int:{tit:'Ariel Zárate'}, con:{} },
      p3:{ sen:{tit:'Rocío Herrera', sup:'Emilio Funes'}, dip:{}, con:{} },
      p4:{ sen:{tit:'Daniela Rivero', sup:'Julián Toledo'}, dip:{}, int:{tit:'Verónica Luna'}, con:{} },
      p6:{ dip:{}, int:{tit:'Matías Giménez'}, con:{} }
    }
  }],
  norma:'Ley XI-1149-2024, art. 17, y Acordada 06-TEP-2025 del Tribunal Electoral Provincial (modelo y memoria descriptiva de la BUP del 11/05/2025: hoja A3, una fila por agrupación, troquel con los datos de la mesa, casillero de 8 × 8 mm arriba a la derecha). En años con elección de Gobernador se suma esa columna. La ley no trae reglas de nulidad: el simulador aplica el criterio general (más de una marca anula la categoría) y el de Mendoza para lista completa más marcas sueltas.'
};

/* ---------- Santa Fe · Ley 14.478 (Código Electoral, 2026), rige desde 2027 ---------- */
window.MODELOS['santa-fe'] = {
  id:'santa-fe', mecanica:'bup-filas',
  titulo:'Boletas Únicas de Santa Fe', bajada:'Santa Fe · elección general desde 2027 · partidos y candidatos ficticios',
  nivel:'Provincia de Santa Fe',
  lcRegla:'repetidas',
  urnaTexto:'Doblaste cada una de las tres boletas y las metiste en la urna, sin sobre. En el escrutinio se cuentan por separado.',
  boletas:[
    { id:'prov', corto:'Boleta provincial', titulo:'GOBERNADOR/A, VICE y DIPUTADOS/AS', sub:'Boleta 1 de 3',
      estilo:'santafe', color:'#2e9a48', listaCompleta:true,
      categorias:[
        { code:'gob', label:'Gobernador y Vice', corto:'Gobernador y Vice', layout:'gv', roles:['Gobernador','Vicegobernadora'] },
        { code:'dip', label:'Diputados provinciales', corto:'Diputados', layout:'list', rol:'Diputado' }
      ],
      listas:{ p1:'1', p2:'2', p3:'3', p4:'4', p5:'5', p6:'6' },
      oferta:{
        p1:{ gob:{tit:'Marcos Ibáñez', sup:'Lucía Paredes'}, dip:{} },
        p2:{ gob:{tit:'Carla Núñez', sup:'Rubén Acosta'}, dip:{} },
        p3:{ dip:{} },
        p4:{ gob:{tit:'Valeria Torres', sup:'Ignacio Bazán'}, dip:{} },
        p5:{ gob:{tit:'Ramiro Cáceres', sup:'Agustina Luna'}, dip:{} },
        p6:{ dip:{} }
      } },
    { id:'sen', corto:'Boleta de senador', titulo:'SENADOR/A DEPARTAMENTAL', sub:'Boleta 2 de 3',
      estilo:'santafe', color:'#2f6db5', listaCompleta:false,
      categorias:[ { code:'sen', label:'Senador departamental', corto:'Senador', layout:'face', roles:['Titular','Suplente'] } ],
      listas:{ p1:'1', p2:'2', p3:'3', p4:'4', p5:'5', p6:'6' },
      oferta:{ p1:{ sen:{tit:'Diego Solá', sup:'Ana Bracamonte'} }, p2:{ sen:{tit:'Elena Vargas', sup:'Tomás Bianchi'} }, p4:{ sen:{tit:'Sofía Aguirre', sup:'Pedro Lucero'} }, p5:{ sen:{tit:'Martín Ojeda', sup:'Yamila Soria'} } } },
    { id:'muni', corto:'Boleta municipal', titulo:'INTENDENTE/A y CONCEJALES/AS', sub:'Boleta 3 de 3',
      estilo:'santafe', color:'#e0761f', listaCompleta:true,
      categorias:[
        { code:'int', label:'Intendente', corto:'Intendente', layout:'face', roles:['Intendente',''] },
        { code:'con', label:'Concejales', corto:'Concejales', layout:'list', rol:'Concejal' }
      ],
      listas:{ p1:'1', p2:'2', p3:'3', p4:'4', p5:'5', p6:'6' },
      oferta:{ p1:{ int:{tit:'Andrés Molina'}, con:{} }, p2:{ int:{tit:'Silvina Roldán'}, con:{} }, p3:{ int:{tit:'Walter Gómez'}, con:{} }, p4:{ int:{tit:'Joaquín Bustos'}, con:{} }, p6:{ int:{tit:'Rodrigo Espeche'}, con:{} } } }
  ],
  norma:'Ley 14.478 (Código Electoral de Santa Fe, promulgada por Decreto 1844/2026). En las generales se vota con tres boletas: provincial (con lista completa), senador departamental y municipal (con lista completa). Si se marca lista completa y además otra fórmula o lista, se anula la categoría repetida. En las PASO sigue habiendo una boleta por categoría (cinco). El diseño sigue la estética de las boletas santafesinas de 2023 (fondo de color por boleta, un bloque por agrupación con casillero «Voto por»); los colores de las tres boletas nuevas son de referencia hasta que se apruebe el modelo.'
};

/* ---------- estado de las fichas provinciales de BUP ---------- */
(function(){
  function ficha(id){ return window.JURISDICCIONES.find(function(j){ return j.id === id; }); }
  const sl = ficha('san-luis');
  sl.modelo.listaCompleta = true; sl.estado = 'disponible'; sl.pendiente = ['Reglas de nulidad (la ley de BUP no las trae)'];
  sl.resumen = 'Boleta tabular: una fila por agrupación, con número de lista y opción de lista completa. Las columnas cambian según las categorías de cada municipio.';
  const md = ficha('mendoza');
  md.norma = 'Ley 9.375 (modifica la Ley 2.551)'; md.estado = 'disponible'; md.pendiente = [];
  const ch = ficha('chubut');
  ch.modelo.listaCompleta = true; ch.estado = 'disponible'; ch.pendiente = ['Qué pasa con lista completa más marcas sueltas'];
  ch.resumen = 'Columnas por agrupación y filas por categoría. La primera fila es negra, con lista completa y la foto del candidato a Gobernador.';
  const er = ficha('entre-rios');
  er.estado = 'disponible'; er.pendiente = ['Número de ley y texto final del diseño', 'Qué pasa con lista completa más marcas sueltas'];
  const sf = ficha('santa-fe');
  sf.estado = 'disponible'; sf.pendiente = [];
})();


/* =====================================================================
   Boleta Única Electrónica (sistema Vot.Ar en los tres distritos)
   ===================================================================== */
window.MODELOS['caba'] = {
  id:'caba', mecanica:'bue',
  titulo:'Boleta Única Electrónica de CABA', bajada:'Ciudad de Buenos Aires · partidos y candidatos ficticios',
  nivel:'Ciudad Autónoma de Buenos Aires', lugar:'Comuna 5 - Almagro', entidad:'Ciudad Autónoma de Buenos Aires',
  ordenAleatorio:true, boletaColor:'#2fb8b0',
  escenarios:[
    { id:'2025', label:'Legislativa 2025', nota:'Como el 18 de mayo de 2025: una sola categoría, así que la máquina va directo a la grilla. El orden de las listas cambia en cada voto (Resolución IGE 29/2025) y «Votar en Blanco» queda fijo abajo a la derecha.',
      categorias:[ { code:'DIP', label:'Diputados/as de la Legislatura de la Ciudad', corto:'Legisladores', tipo:'lista', n:5 } ],
      oferta:{ p1:['DIP'], p2:['DIP'], p3:['DIP'], p4:['DIP'], p5:['DIP'], p6:['DIP'] } },
    { id:'2027', label:'Con Jefe de Gobierno', nota:'Cuando se elige Jefe de Gobierno se suman categorías y aparece la pantalla «Elija la forma de conformar su voto», como en 2023: Jefe y Vicejefe de Gobierno, Legisladores y Junta Comunal.',
      categorias:[
        { code:'JEF', label:'Jefe/a y Vicejefe/a de Gobierno', corto:'Jefe de Gobierno', tipo:'formula', roles:['Jefe/a','Vicejefe/a'] },
        { code:'DIP', label:'Diputados/as de la Legislatura de la Ciudad', corto:'Legisladores', tipo:'lista', n:5 },
        { code:'JC', label:'Miembros de la Junta Comunal', corto:'Junta Comunal', tipo:'lista', n:4 }
      ],
      oferta:{ p1:['JEF','DIP','JC'], p2:['JEF','DIP','JC'], p3:['DIP','JC'], p4:['JEF','DIP','JC'], p5:['DIP','JC'], p6:['JEF','DIP','JC'] } }
  ],
  norma:'Código Electoral de la Ciudad (Ley 6.031) e IGE. Interfaz y textos según el simulador oficial de capacitación de 2025 (sistema Vot.Ar, empresa MSA). El voto vale recién cuando la boleta entra en la urna; la máquina no guarda registro de los votos.'
};
window.MODELOS['neuquen'] = {
  id:'neuquen', mecanica:'bue',
  titulo:'Boleta Única Electrónica de Neuquén', bajada:'Neuquén · partidos y candidatos ficticios',
  nivel:'Provincia del Neuquén', lugar:'Neuquén Capital', entidad:'Provincia del Neuquén',
  listaCompletaPorNivel:true, boletaColor:'#5bb0dc', textoReiniciar:'Volver al inicio',
  escenarios:[
    { id:'2027', label:'Provincial y municipal', nota:'Las categorías que licitó la provincia para 2027. Si elegís «Votar Lista Completa», la máquina lo hace en dos pasos, como en 2023: primero las categorías provinciales y después las municipales.',
      categorias:[
        { code:'GOB', label:'Gobernador/a y Vicegobernador/a', corto:'Gobernador', tipo:'formula', roles:['Gobernador/a','Vice'], nivel:'prov' },
        { code:'DIP', label:'Diputados/as provinciales', corto:'Diputados', tipo:'lista', n:5, nivel:'prov' },
        { code:'INT', label:'Intendente/a', corto:'Intendente', tipo:'uno', nivel:'muni' },
        { code:'CNJ', label:'Concejales', corto:'Concejales', tipo:'lista', n:4, nivel:'muni' },
        { code:'CES', label:'Consejeros/as escolares', corto:'Consejo escolar', tipo:'lista', n:2, nivel:'muni' }
      ],
      oferta:{ p1:['GOB','DIP','INT','CNJ','CES'], p2:['GOB','DIP','INT','CNJ','CES'], p3:['DIP','INT','CNJ'], p4:['GOB','DIP','INT','CNJ','CES'], p6:['GOB','DIP','CNJ','CES'] } }
  ],
  norma:'Ley provincial de Boleta Única Electrónica y Decreto 1669/2026 (licitación del sistema para 2027). Flujo según la cobertura de 2023: lista completa o por categorías, «Volver al inicio» (rojo) e «Imprimir» (verde), verificación del chip y pliegue por la línea donde cambia el color de la boleta. El simulador oficial de 2023 ya no está en línea.'
};
window.MODELOS['salta'] = {
  id:'salta', mecanica:'bue',
  titulo:'Boleta Única Electrónica de Salta', bajada:'Salta · partidos y candidatos ficticios',
  nivel:'Provincia de Salta', lugar:'Salta Capital', entidad:'Provincia de Salta',
  boletaColor:'#d9a441',
  escenarios:[
    { id:'general', label:'Con Gobernador', nota:'Se elige la forma de votar («Categorías» o «Lista Completa»). La última pantalla permite modificar cada categoría, reiniciar o imprimir.',
      categorias:[
        { code:'GOB', label:'Gobernador/a y Vicegobernador/a', corto:'Gobernador', tipo:'formula', roles:['Gobernador/a','Vice'] },
        { code:'SEN', label:'Senador/a provincial', corto:'Senador', tipo:'uno' },
        { code:'DIP', label:'Diputados/as provinciales', corto:'Diputados', tipo:'lista', n:5 },
        { code:'INT', label:'Intendente/a', corto:'Intendente', tipo:'uno' },
        { code:'CNJ', label:'Concejales', corto:'Concejales', tipo:'lista', n:4 }
      ],
      oferta:{ p1:['GOB','SEN','DIP','INT','CNJ'], p2:['GOB','SEN','DIP','INT','CNJ'], p4:['GOB','DIP','INT','CNJ'], p5:['SEN','DIP','CNJ'], p6:['GOB','SEN','DIP','INT','CNJ'] } },
    { id:'legislativa', label:'Legislativa (2025)', nota:'Como el 11 de mayo de 2025: diputados y senadores provinciales y concejales.',
      categorias:[
        { code:'SEN', label:'Senador/a provincial', corto:'Senador', tipo:'uno' },
        { code:'DIP', label:'Diputados/as provinciales', corto:'Diputados', tipo:'lista', n:5 },
        { code:'CNJ', label:'Concejales', corto:'Concejales', tipo:'lista', n:4 }
      ],
      oferta:{ p1:['SEN','DIP','CNJ'], p2:['SEN','DIP','CNJ'], p3:['DIP','CNJ'], p4:['SEN','DIP','CNJ'], p6:['DIP','CNJ'] } }
  ],
  norma:'Ley 7.730 (normas de control para el voto con Boleta Única Electrónica) y Tribunal Electoral de Salta. Usa el sistema desde 2009; en 2013 se extendió a todo el padrón. Flujo según el instructivo y la cobertura de 2023 y 2025: «Categorías» o «Lista Completa», revisar, imprimir, verificar con el lector, doblar y entregar el segundo troquel.'
};
(function(){
  ['caba','neuquen','salta'].forEach(function(id){
    const j = window.JURISDICCIONES.find(function(x){ return x.id === id; });
    j.estado = 'disponible'; j.pendiente = [];
  });
  const f = function(id){ return window.JURISDICCIONES.find(function(x){ return x.id === id; }); };
  f('caba').norma = 'Ley 6.031 (Código Electoral de la Ciudad)';
  f('caba').resumen = 'Pantalla táctil con la grilla de listas en orden aleatorio, confirmación, impresión en una boleta con chip, verificación y urna.';
  f('caba').notas = ['En 2025 se votó solo Legisladores; con Jefe de Gobierno aparecen la lista completa y el voto por categorías.'];
  f('neuquen').norma = 'Sistema BUE; licitación 2027 (Decreto 1669/2026)';
  f('neuquen').resumen = 'Lista completa (en dos pasos: provincial y municipal) o voto por categorías. La boleta se dobla donde cambia de color.';
  f('neuquen').notas = ['Sigue con boleta electrónica en 2027: la provincia licitó las máquinas en octubre de 2026.'];
  f('salta').norma = 'Ley 7.730 y Tribunal Electoral';
  f('salta').resumen = 'Pantalla táctil con «Categorías» o «Lista Completa», confirmación, impresión con chip y verificación. Usa voto electrónico desde 2009.';
  f('salta').notas = ['En 2025 se eligieron diputados, senadores, concejales y convencionales.'];
})();
