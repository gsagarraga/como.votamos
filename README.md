# ¿Cómo votamos en Argentina?

**Sitio:** https://gsagarraga.github.io/como.votamos/

Proyecto personal con fines educativos de Gonzalo Sagarraga: busca hacer visibles las distintas formas de votar que conviven hoy en Argentina para que cualquiera pueda conocerlas, compararlas y practicarlas. Partidos y candidatos ficticios.

Simuladores de todas las formas de votar en Argentina: 24 distritos y el nivel nacional. HTML/CSS/JS puro, sin dependencias (solo Rubik desde Google Fonts).

## Estructura (opción A: motores + fichas)

La portada y los simuladores son vistas de la misma página: `index.html#<id>` abre el simulador de esa ficha o modelo; sin dirección se ve la portada. Así funciona igual en GitHub Pages y dentro de un artefacto.

```
index.html                Portada + vista de simulador
css/base.css              Tokens compartidos (claro/oscuro, colores por mecánica)
css/simulador.css         Vista de simulador y motor de boleta partidaria
css/bup-columnas.css      Boleta en columnas, urna
css/bup-filas.css         Boleta en filas (colores reales de la BUS)
js/jurisdicciones.js      Fichas por distrito + nacional, mecánicas y modelos generales
js/ficticios.js           Partidos, emblemas y candidatos ficticios (los mismos de la BUS)
js/reglas.js              Calificación común por tramo: válido, blanco, nulo
js/motores/partidaria.js  Mesa con pilas, tijera por tramo, sobre y escrutinio
js/motores/bup-columnas.js Boleta nacional: recuadros, escenarios, urna
js/motores/bup-filas.js   BUS de Córdoba y boletas en filas
js/portada.js             Tarjetas, filtros y búsqueda
js/tema.js                Botón claro / oscuro
js/app.js                 Navegación por #id entre portada y simuladores
```

Motores listos: `partidaria.js`, `bup-columnas.js` (Nación; sirve también para Mendoza, Chubut y Entre Ríos con `listaCompleta`) y `bup-filas.js` (Córdoba, San Luis y las tres boletas de Santa Fe). Las siete boletas únicas de papel están activas. Próximo: `bue.js`.

### Motor BUP en filas

Modelo `window.MODELOS['cordoba']`, migrado del simulador original de la BUS: mismas categorías, partidos, candidatos, números de lista, colores de la boleta y textos. `boletas[]` admite varias hojas (cada una con `listaCompleta`, `niveles`, `categorias` con `layout` gv / list / face, `listas` y `oferta`). Reglas por boleta: dos listas completas anulan todo; una lista completa prevalece y las marcas sueltas no valen; sin lista completa, tramo por tramo. Lo que se quitó respecto del original: el link para compartir la simulación (el artefacto no admite parámetros en la dirección) y el aviso de girar el teléfono (la boleta se desliza de costado).

### Motor BUP en columnas

Modelo `window.MODELOS['nacional']`: `escenarios` (legislativa con Senado, según Acordada CNE 40/25; presidencial, extensión propia de esas pautas porque la CNE todavía no publicó ese modelo), `oferta` por escenario y `listaCompleta` (false en Nación). Diseño: talón troquelado, número arriba, denominación sobre blanco, logo sobre color, recuadro centrado sobre la foto de los dos primeros candidatos, nómina numerada APELLIDO, NOMBRE. Calificación: categoría sin marca = blanco; dos o más agrupaciones en una categoría = nula esa categoría. Con `listaCompleta`, más de una lista completa anula todo y una lista completa prevalece sobre las marcas sueltas (criterio cordobés; a confirmar para cada provincia). Todos usan `reglas.js`.

### Motor de boleta partidaria

Un modelo (`window.MODELOS['partidaria-general']`) define `categorias` y `oferta` (qué tramos presenta cada partido: la boleta de un partido trae solo esos tramos). Calificación según el art. 101 del Código Electoral Nacional anterior a la Ley 27.781: sobre vacío = blanco; boletas del mismo partido repetidas en un tramo = se cuenta una; partidos distintos en un tramo = ese tramo nulo.

## Cómo se completa una ficha

Cada objeto de `JURISDICCIONES` tiene:

- `mecanica`: `partidaria`, `bup` o `bue`.
- `modelo` (solo BUP): `orientacion` (`filas` / `columnas`), `boletas` (hojas por elector), `boletasPaso` si cambia en las primarias, `listaCompleta` (`true`, `false` o `null` = a verificar).
- `norma`, `resumen`, `notas`: lo que se muestra en la tarjeta.
- `estado`: `disponible` (la tarjeta pasa a ser un link a `simulador.html?j=<id>`), `migracion` o `proximamente`.
- `pendiente`: lo que todavía no se contrastó con la norma. Se muestra en la tarjeta; vaciarlo cuando esté verificado.

Una ficha de boleta partidaria sin `norma` se muestra como tarjeta compacta hasta que se cargue su información.

## Qué está verificado y qué no

Verificado con fuentes (octubre 2026): diseño y lista completa de la BUP nacional (Ley 27.781), Córdoba (Ley 9.571), Santa Fe (Ley 14.478: 5 boletas en PASO, 3 en generales, desde 2027), San Luis (Ley XI-1149-2024, sin lista completa), Mendoza (columnas, con lista completa, doble urna en concurrentes), Chubut (columnas, Ley XII Nº 21) y Entre Ríos (columnas, con lista completa, debut 2027).

A verificar: número de ley de Mendoza y Entre Ríos, lista completa en Chubut, reglas de nulidad parcial de cada BUP, normas de las tres BUE y de las 15 provincias con boleta partidaria.

Tipo de boleta y primarias: tabla del Mapa Interactivo de Argentina (legislación vigente al 20/08/2026).

### Lista completa más marcas sueltas (`lcRegla`)

- `prevalece` (Córdoba): manda la lista completa; las marcas sueltas no valen.
- `repetidas` (Mendoza, art. 46 ter Ley 2.551; Santa Fe, Ley 14.478): se anula solo la categoría donde la lista completa choca con otra agrupación; marcas de la misma agrupación no molestan.
- `lcVerificada:false` (Chubut, Entre Ríos, San Luis): la norma consultada no lo dice; se aplica `repetidas` y el panel lo aclara.

Más de una lista completa anula todas las categorías en ambos criterios (inferido para Mendoza: la ley lo deriva de la regla general).

### Verificado en esta etapa (31/10/2026)

- Mendoza: Ley 9.375 (diseño art. 17 bis, votos arts. 46 bis a quater) y manual de autoridades de mesa 2025.
- Chubut: Ley XII Nº 21, arts. 45 a 50 (diseño). No se encontró el artículo de calificación del voto.
- San Luis: Ley XI-1149-2024, art. 17. Corrección: sí tiene lista completa (la ficha anterior decía que no).
- Santa Fe: Ley 14.478, según la cobertura del texto sancionado (tres boletas en generales, lista completa en las de más de una categoría, nulidad de la categoría repetida).
- Entre Ríos: solo cobertura de prensa; falta el texto de la ley.

### Banderas

`banderas-src/` guarda las imágenes originales (una por id de ficha). `python3 banderas-src/generar.py` arma `js/banderas-img.js` con cada una embebida (alto 48 px, proporción propia). La nacional y la de Córdoba van como SVG en `js/banderas.js` (la de Córdoba es la del simulador original de la BUS). Mendoza y Jujuy llegaron más altas que anchas: se completan a 3:2 repitiendo el color del borde.

### Motor BUE (`js/motores/bue.js`, `css/bue.css`)

Reproduce la interfaz Vot.Ar, el mismo software en CABA, Neuquén y Salta. Textos, colores y medidas tomados del simulador oficial de capacitación de CABA 2025 (simuladorcapacitacion.votar.com.ar, archivo constants/CABA.json): «Elija la forma de conformar su voto», «Votar por Categorías», «Votar Lista Completa», «Votar en Blanco», «Sus candidatos seleccionados», «Reiniciar», «Imprimir», «Se está imprimiendo su boleta», «Su boleta ha sido impresa», «Verificando selección». Encabezado #545859, fondo #eeeeee, tarjetas blancas con borde #bec3be.

Opciones: `escenarios`, `municipios` (Salta), `listaCompletaPorNivel` (Neuquén: provincial y después municipal), `ordenAleatorio` (CABA, Res. IGE 29/2025), `boletaColor`, `textoReiniciar` (Neuquén: «Volver al inicio»). Los simuladores oficiales de Neuquén y Salta no estaban en línea (oct. 2026): sus flujos salen de la cobertura de 2023 y 2025.

## Metadatos y publicación

- `og-image.png` (1200×630): vista previa al compartir en WhatsApp, redes y mensajería. Las etiquetas Open Graph y X/Twitter de `index.html` apuntan a `https://gsagarraga.github.io/como.votamos/`; si cambia la dirección, actualizar `canonical`, `og:url`, `og:image` y `twitter:image`.
- `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`: íconos.
- GitHub Pages: Settings → Pages → Deploy from a branch → `main` / raíz.
