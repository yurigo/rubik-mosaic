# Paletas LEGO

Combinaciones pieza/color: 18 de octubre de 2026. Referencias RGB auditadas: 19 de octubre de 2026. El editor incluye un catálogo local; no consulta servicios al procesar imágenes.

| Pieza BrickLink | Colores sólidos incluidos |
|---|---:|
| [Plate 1×1, 3024](https://www.bricklink.com/v2/catalog/catalogitem.page?P=3024#T=C) | 54 |
| [Tile 1×1, 3070](https://www.bricklink.com/v2/catalog/catalogitem.page?P=3070#T=C) | 52 |
| [Tile round 1×1, 98138](https://www.bricklink.com/v2/catalog/catalogitem.page?P=98138#T=C) | 42 |

Fuente de combinaciones pieza/color: sección **Known Colors** de cada ficha. No usar el desplegable global, Wanted List o todos los anuncios como prueba de fabricación. El catálogo incluye colores históricos y no garantiza producción o disponibilidad comercial actual. Se excluyen transparentes, satinados, perlados, metálicos, luminiscentes y glitter en esta entrega.

Los nombres e identificadores visibles son de BrickLink. Los hexadecimales proceden del campo numérico `VALUE` de la [referencia oficial LDraw](https://www.ldraw.org/article/547.html), con una correspondencia explícita de IDs y nombres LDraw para los 55 colores. No se reutilizan colores Rubik ni muestras CSS. Son aproximaciones para representación digital; no mediciones calibradas de piezas reales. [Auditoría completa, correspondencias y procedimiento de actualización](lego-rgb-audit.md).

Para actualizar las combinaciones pieza/color, revisar Known Colors de las tres fichas y filtrar acabados especiales. No añadir colores que solo figuran en anuncios o búsquedas. Para RGB, revisar el CODE correcto y copiar `VALUE`, nunca `EDGE`; actualizar el CSV local, ejecutar `node scripts/sync-lego-palette.mjs`, comprobar el diff y las pruebas. Mantener distintos los grises antiguos y los bluish gray.

La selección se conserva por tipo de pieza durante la sesión. Inicialmente están marcados todos los colores catalogados; el usuario debe ajustar la selección a su caja. Se admite un único color y se bloquea la conversión sin ninguno. El recuento refleja el patrón generado, sin límites de inventario por color. No hay persistencia entre recargas todavía.

La base de las tiles redondas solo modifica la previsualización, no la cuantización ni el inventario: no se utiliza como un color gratuito para dejar huecos. Cada celda siempre consume una pieza. El relieve de las plates y los espacios entre círculos son una representación ilustrativa.
