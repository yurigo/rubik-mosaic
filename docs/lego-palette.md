# Paletas LEGO

Instantánea: 18 de octubre de 2026. El editor incluye un catálogo local; no consulta servicios al procesar imágenes.

| Pieza BrickLink | Colores sólidos incluidos |
|---|---:|
| [Plate 1×1, 3024](https://www.bricklink.com/v2/catalog/catalogitem.page?P=3024#T=C) | 54 |
| [Tile 1×1, 3070](https://www.bricklink.com/v2/catalog/catalogitem.page?P=3070#T=C) | 52 |
| [Tile round 1×1, 98138](https://www.bricklink.com/v2/catalog/catalogitem.page?P=98138#T=C) | 42 |

Fuente de combinaciones pieza/color: sección **Known Colors** de cada ficha. No usar el desplegable global, Wanted List o todos los anuncios como prueba de fabricación. El catálogo incluye colores históricos y no garantiza producción o disponibilidad comercial actual. Se excluyen transparentes, satinados, perlados, metálicos, luminiscentes y glitter en esta entrega.

Los nombres e identificadores son de BrickLink. Los hexadecimales proceden de la propiedad CSS `--bl-castor-table-swatch-with-image-background-color` de las filas de su [Color Guide](https://www.bricklink.com/catalogColors.asp), relacionando nombre e ID de la misma fila. Son aproximaciones de pantalla proporcionadas por esa guía; no mediciones calibradas de piezas reales ni colores Rubik reutilizados. El archivo `src/core/lego.ts` contiene los 55 colores distintos que utiliza la unión de las tres paletas.

Para actualizar: revisar Known Colors de las tres fichas, filtrar acabados especiales, contrastar nombres/IDs y muestras en Color Guide, modificar los datos y la fecha, y revisar las pruebas de catálogo y conversión. No añadir colores que solo figuran en anuncios o búsquedas. Mantener distintos los grises antiguos y los bluish gray.

La selección se conserva por tipo de pieza durante la sesión. Inicialmente están marcados todos los colores catalogados; el usuario debe ajustar la selección a su caja. Se admite un único color y se bloquea la conversión sin ninguno. El recuento refleja el patrón generado, sin límites de inventario por color. No hay persistencia entre recargas todavía.

La base de las tiles redondas solo modifica la previsualización, no la cuantización ni el inventario: no se utiliza como un color gratuito para dejar huecos. Cada celda siempre consume una pieza. El relieve de las plates y los espacios entre círculos son una representación ilustrativa.
