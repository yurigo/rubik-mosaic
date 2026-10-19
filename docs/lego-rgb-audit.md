# Auditoría RGB LEGO · 19 de octubre de 2026

Se revisan los 55 colores únicos del proyecto. Se conservan identificadores BrickLink y combinaciones pieza/color. Los RGB pasan de fondos CSS de presentación a las definiciones numéricas `VALUE` de la tabla oficial [LDraw Colour Definition Reference](https://www.ldraw.org/article/547.html), consultada el 19 de octubre de 2026. No se utiliza `EDGE`, una fotografía de pieza o el fondo de su tarjeta.

La correspondencia se revisa por identidad del color, contrastando la [guía BrickLink](https://www.bricklink.com/catalogColors.asp) (nombre/ID LEGO) y, para los colores históricos, la [tabla de correspondencias de Mecabricks](https://www.mecabricks.com/docs/colour_chart.pdf). No se supone que los IDs de BrickLink, LEGO y LDraw coincidan, ni se unen catálogos por nombres parecidos.

Casos importantes: BrickLink Blue Violet #174 corresponde a LEGO 431 / LDraw **431 Bright_Blue_Violet**, no a LDraw 89 Blue_Violet. Warm Pink #175 corresponde a 430. Rose Pink #56 corresponde a LEGO 17 Rose / LDraw **10017 Rose_Pink**, no a 77 Light_Pink. Medium Tan #241 corresponde a 371; Neon Yellow #236 a 368. Dark Gray #10 y Dark Bluish Gray #85 conservan IDs distintos (LDraw 8 y 72).

Se contrastó también el CSV numérico de Rebrickable. Sus RGB y algunos nombres difieren, incluidos grises oscuros y rosas históricos. La aplicación adopta **una sola referencia LDraw para los 55 colores**, sin mezclar fuentes según el resultado deseado ni aplicar pesos específicos para esta ilustración. Son referencias de representación digital, no mediciones calibradas de piezas físicas ni una garantía de coincidencia bajo cualquier iluminación.

`data/lego-color-reference.csv` guarda la instantánea y el RGB anterior para auditar cambios. `scripts/sync-lego-palette.mjs` genera la paleta por ID y comprueba unicidad, formato y cobertura de los 55 colores; `npm test` verifica que los datos generados coincidan. Actualizar deliberadamente la instantánea, las fuentes/fecha y las pruebas; nunca extraer RGB de estilos CSS.

| BrickLink ID | Nombre | RGB anterior (CSS) | LDraw CODE | LDraw Name | VALUE |
|---|---|---|---|---|---|
| 11 | Black | `#2E2E2E` | 0 | Black | `#1B2A34` |
| 7 | Blue | `#196BCF` | 1 | Blue | `#1E5AA8` |
| 174 | Blue Violet | `#8A7FDD` | 431 | Bright_Blue_Violet | `#665EA7` |
| 36 | Bright Green | `#2BD043` | 10 | Bright_Green | `#58AB41` |
| 105 | Bright Light Blue | `#B5D6FF` | 212 | Bright_Light_Blue | `#9DC3F7` |
| 110 | Bright Light Orange | `#FDBF0E` | 191 | Bright_Light_Orange | `#FCAC00` |
| 103 | Bright Light Yellow | `#FCEB82` | 226 | Bright_Light_Yellow | `#FFEC6C` |
| 104 | Bright Pink | `#FCB1DB` | 29 | Bright_Pink | `#FF9ECD` |
| 8 | Brown | `#70462E` | 6 | Brown | `#543324` |
| 220 | Coral | `#FF765C` | 353 | Coral | `#FF6D77` |
| 153 | Dark Azure | `#38AEEB` | 321 | Dark_Azure | `#469BC3` |
| 63 | Dark Blue | `#234065` | 272 | Dark_Blue | `#19325A` |
| 85 | Dark Bluish Gray | `#7D7C78` | 72 | Dark_Bluish_Grey | `#646464` |
| 120 | Dark Brown | `#50372F` | 308 | Dark_Brown | `#352100` |
| 10 | Dark Gray | `#848375` | 8 | Dark_Grey | `#545955` |
| 80 | Dark Green | `#30533B` | 288 | Dark_Green | `#00451A` |
| 68 | Dark Orange | `#AC5112` | 484 | Dark_Orange | `#91501C` |
| 47 | Dark Pink | `#EF5BB3` | 5 | Dark_Pink | `#D3359D` |
| 89 | Dark Purple | `#7045BA` | 85 | Medium_Lilac | `#441A91` |
| 59 | Dark Red | `#83211F` | 320 | Dark_Red | `#720012` |
| 69 | Dark Tan | `#A98F6A` | 28 | Dark_Tan | `#897D62` |
| 39 | Dark Turquoise | `#0BABA8` | 3 | Dark_Turquoise | `#069D9F` |
| 6 | Green | `#009D48` | 2 | Green | `#00852B` |
| 154 | Lavender | `#D0B8ED` | 31 | Lavender | `#CDA4DE` |
| 152 | Light Aqua | `#C0F4E7` | 323 | Light_Aqua | `#D3F2EA` |
| 86 | Light Bluish Gray | `#B9B9B9` | 71 | Light_Bluish_Grey | `#969696` |
| 9 | Light Gray | `#B8BAAE` | 7 | Light_Grey | `#8A928D` |
| 90 | Light Nougat | `#F7CFB4` | 78 | Light_Nougat | `#FFC995` |
| 34 | Lime | `#BEE13C` | 27 | Lime | `#A5CA18` |
| 72 | Maersk Blue | `#6BC4E1` | 313 | Maersk_Blue | `#ABD9FF` |
| 71 | Magenta | `#BA177E` | 26 | Magenta | `#901F76` |
| 156 | Medium Azure | `#70DCF3` | 322 | Medium_Azure | `#68C3E2` |
| 42 | Medium Blue | `#81B0E4` | 73 | Medium_Blue | `#7396C8` |
| 157 | Medium Lavender | `#C38BD4` | 30 | Medium_Lavender | `#A06EB9` |
| 150 | Medium Nougat | `#D59459` | 84 | Medium_Nougat | `#AA7D55` |
| 31 | Medium Orange | `#FFAC00` | 462 | Medium_Orange | `#F58624` |
| 241 | Medium Tan | `#FBC685` | 371 | Medium_Tan | `#CCA373` |
| 236 | Neon Yellow | `#F3F304` | 368 | Neon_Yellow | `#EDFF21` |
| 28 | Nougat | `#F1A56B` | 92 | Nougat | `#BB805A` |
| 155 | Olive Green | `#A9A45A` | 330 | Olive_Green | `#77774E` |
| 4 | Orange | `#FF8D34` | 25 | Orange | `#D67923` |
| 23 | Pink | `#FBD0DE` | 13 | Pink | `#F6A9BB` |
| 24 | Purple | `#8622A1` | 22 | Purple | `#671F81` |
| 5 | Red | `#D82424` | 4 | Red | `#B40000` |
| 88 | Reddish Brown | `#7C442C` | 70 | Reddish_Brown | `#5F3109` |
| 167 | Reddish Orange | `#FF5500` | 402 | Reddish_Orange | `#CA4C0B` |
| 56 | Rose Pink | `#F2D3D1` | 10017 | Rose_Pink | `#FF9494` |
| 55 | Sand Blue | `#93ABB9` | 379 | Sand_Blue | `#70819A` |
| 48 | Sand Green | `#98B69C` | 378 | Sand_Green | `#708E7C` |
| 2 | Tan | `#E1D19D` | 19 | Tan | `#D7BA8C` |
| 49 | Very Light Gray | `#D8D9CE` | 503 | Very_Light_Grey | `#BCB4A5` |
| 175 | Warm Pink | `#FFBAB7` | 430 | Warm_Pink | `#F79B9B` |
| 1 | White | `#F3F4EF` | 15 | White | `#F4F4F4` |
| 3 | Yellow | `#FFDA19` | 14 | Yellow | `#FAC80A` |
| 158 | Yellowish Green | `#DBED94` | 326 | Yellowish_Green | `#E2F99A` |

## Comprobación con raster real y límites

PNG RGBA de 475×475, procesado localmente sin publicar el archivo: las muestras opacas más frecuentes del cuerpo incluyen `(78,88,92)` y `(77,87,91)`. Antes, `(78,88,92)` elegía Dark Green en RGB; con la referencia revisada los tres métodos eligen un gris disponible para estas muestras. También se comprueba el gris neutro `(80,80,80)` sin dithering y una rampa de grises con difusión.

Comparación de extremo a extremo del raster decodificado: recorte completo, 150×150 casillas, plate 3024 con 54 colores, sin reglas ni dithering. Para contar una región reproducible de grises fríos se usan los centros de casilla cuyos píxeles originales cumplen A=255, R≥30, B≤140, B≥G≥R y B−R≤35; no es segmentación semántica. Son 4.011 casillas. Dark Green pasa de 1.858 a 0 en RGB y de 2.688 a 0 en OKLab. No son comparaciones de perfiles entre navegadores: la decodificación local de esta prueba no sustituye comprobar Safari/Canvas.

Con dithering pueden aparecer casillas cromáticas aisladas al compensar el error de una paleta discreta. La corrección no impone «gris» por nombre ni garantiza grises exclusivos bajo cualquier ajuste, paleta reducida o iluminación física. Las sombras azuladas del original todavía pueden aproximarse con azul oscuro/negro. No se modifican los métodos RGB/OKLab/HSL, sus pesos, la reducción, la transparencia o la difusión para pasar esta prueba.
