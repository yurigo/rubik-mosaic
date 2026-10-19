# Especificación de requisitos

Versión 0.5 · 18 de octubre de 2026 · Borrador de producto

## Objetivo y alcance

Transformar una imagen en un mosaico de cubos Rubik o piezas LEGO 1×1, adaptado al material y a los colores seleccionados, y facilitar su reproducción física.

**Confirmado:** carga de imagen, pixelado, dithering, paleta rojo/verde/amarillo/azul/blanco/naranja, inventario configurable y caso de nueve cubos en 3×3 que produce 9×9 píxeles.

**Propuesta de primera versión:** cubos estándar 3×3 con una cara visible, sin retirar pegatinas; recorte, ajustes, comparación, guía por cubos y exportación. Los detalles de formatos, límites y entregas siguientes son propuestas revisables. La tecnología decidida se documenta en [arquitectura](architecture.md).

Recorrido: cargar imagen → configurar cubos y disposición → recortar → convertir y ajustar → consultar guía → exportar.

## Geometría

N es el número disponible de cubos, C las columnas y F las filas. Los tres valores son enteros positivos.

- Cubos usados: C×F ≤ N; sobrantes: N−CF.
- Anchura de la imagen: 3C píxeles; altura: 3F píxeles.
- Casillas visibles: 9CF. Cada cubo aporta un bloque de 3×3.

| N | Columnas × filas de cubos | Resolución | Sobrantes |
|---|---|---|---|
| 9 | 3×3 | 9×9 | 0 |
| 9 | 1×9 | 3×27 | 0 |
| 10 | 3×3 | 9×9 | 1 |
| 12 | 4×3 | 12×9 | 0 |

El inventario no determina una disposición única. Se propondrá una cercana al formato de la imagen y se permitirá modificarla. La imagen se recorta sin deformarla. No se imponen cuotas iguales de colores: se cuentan cubos, no pegatinas independientes.

## Requisitos funcionales

Los criterios siguientes definen la propuesta verificable del MVP visual, salvo RF-13, que pertenece a la validación física posterior.

| ID | Requisito | Criterio de aceptación |
|---|---|---|
| RF-01 | Cargar JPEG, PNG y WebP estáticos | La imagen aparece orientada correctamente. Un archivo inválido produce un error legible y conserva el proyecto anterior. |
| RF-02 | Configurar inventario y disposición | Rechaza cero, negativos, decimales y C×F>N; muestra usados, sobrantes y resolución. N=9,C=3,F=3 produce 9×9. |
| RF-03 | Recortar sin deformar | Recorte con proporción C/F y casillas cuadradas. Arrastrar desplaza el encuadre; pellizco y rueda amplían entre 1× y 4× sin salir de la imagen. Botones +/− y restablecimiento sobre la vista original. Con la imagen enfocada, +/− amplían, flechas desplazan e Inicio restablece; no intercepta atajos en otros campos ni Ctrl/Cmd. |
| RF-04 | Reducir a la resolución objetivo | La matriz tiene exactamente 3F filas de 3C valores. La ampliación no suaviza las casillas. |
| RF-05 | Cuantizar a seis colores | Toda casilla usa un identificador de la paleta. Los datos exportados no contienen un séptimo color. |
| RF-06 | Configurar dithering | Opciones sin dithering y Floyd–Steinberg, intensidad 0–100 %. Al 0 % coincide con la conversión sin dithering; se procesa la cuadrícula completa. |
| RF-07 | Ajustar brillo y contraste | Valores neutros y restablecimiento; regenerar conserva inventario y recorte. Los rangos se concretarán antes de implementar. |
| RF-08 | Comparar y navegar | Original recortado y resultado, zoom y límites opcionales de bloques 3×3. |
| RF-09 | Mostrar guía por cubos | Cada cubo tiene fila y columna; al seleccionarlo se muestran sus nueve casillas y códigos de color en el orden del mosaico. |
| RF-10 | Exportar PNG | Patrón ampliado con escala entera, sin interpolación; cuadrícula opcional. La exportación no incluye controles de interfaz. |
| RF-11 | Guardar y abrir proyecto JSON | Conserva matriz final, dimensiones, paleta, ajustes, versiones y estado de validación. Reabrir reproduce el patrón exacto. No incluye la imagen original; para cambiar el recorte hace falta volver a cargarla. |
| RF-12 | Recuperarse de errores | Explica formatos y límites, permite reintentar y mantiene la interfaz operativa. |
| RF-13 | Validar montaje físico | Cada bloque aceptado dispone de un estado completo legal que demuestra su cara visible. Distingue no comprobado de no realizable. |

La restricción de seis colores afecta a las casillas, no al texto, líneas y controles de la interfaz. A 9×9 se pierde mucho detalle: debe poder compararse con/sin dithering; no se garantiza que cualquier fotografía siga siendo reconocible.

## Ampliación LEGO

| ID | Requisito | Criterio de aceptación |
|---|---|---|
| RF-14 | Elegir Rubik, plate 3024, tile cuadrada 3070 o tile redonda 98138 | Cada pieza LEGO ofrece su propia paleta sólida catalogada, con nombre e ID BrickLink; Rubik conserva sus seis colores. |
| RF-15 | Configurar ancho y alto LEGO en piezas | Una pieza = un píxel; 3×3 piezas producen 3×3 píxeles y consumen 9 piezas. Acepta rectángulos y enteros positivos hasta 22.500 piezas totales; no exige múltiplos de tres. |
| RF-16 | Seleccionar colores de la caja | Cuantización y dithering solo usan colores seleccionados para la pieza actual. Un color genera un mosaico monocromo; ninguno muestra un mensaje y no muestra un resultado antiguo. Conserva la selección de cada pieza durante la sesión. |
| RF-17 | Previsualizar y contar piezas LEGO | Representa plates con relieve ilustrativo, tiles cuadradas planas y redondas con base configurable. El recuento por color suma ancho×alto; la base no consume piezas ni interviene en la conversión. |

RF-02, RF-04, RF-05 y los bloques 3×3 de RF-08 describen el modo Rubik. En LEGO se aplican RF-14 a RF-17; se comparten carga, recorte, reducción por área y dithering. Los colores disponibles no implican cantidades disponibles: en esta entrega no se limita el consumo por color. Brillo/contraste, guía y exportaciones siguen pendientes.

Paletas, fuentes y límites de fidelidad: [paletas LEGO](lego-palette.md). El catálogo incluye colores históricos; no garantiza disponibilidad de compra. No se mezclan tipos de pieza en un mismo mosaico.

## Comparación de colores

**RF-18:** seleccionar RGB lineal, OKLab o HSL experimental en Rubik y LEGO. RGB lineal es el valor inicial y reproduce los resultados anteriores. Cambiar método regenera el resultado sin modificar imagen, recorte, disposición, paleta o intensidad. El método afecta únicamente a la distancia para escoger un color; reducción y difusión del error siguen en RGB lineal. Todos los métodos respetan la paleta seleccionada, también con dithering. La elección se conserva durante la sesión y no se persiste entre recargas. No se garantiza una interpretación semántica de objetos ni una mejora visual para toda imagen.

## Montaje físico y entregas

El primer prototipo genera un patrón visual y lo identifica como pendiente de verificar para montaje. Antes de ofrecer una garantía de construcción mediante giros, RF-13 debe demostrar la viabilidad de cada bloque con un modelo del cubo. No se presupone ni se descarta que cualquier cara arbitraria sea realizable.

Un tiempo de cálculo agotado no demuestra imposibilidad. Si se demuestra incompatible una cara, se indicará su coordenada y se propondrá una alternativa que el usuario pueda revisar; no se cambiará silenciosamente el patrón. La guía visual no incluye secuencias de movimientos en el MVP.

Fuera del MVP: cuentas, pagos, colaboración, servidor de procesamiento, generación de imágenes con IA, reconocimiento del estado del cubo por cámara, app móvil nativa, solver de movimientos, PDF, calibración por marca y otros tamaños de cubo.

## Requisitos no funcionales

- **RNF-01 Privacidad:** procesar las imágenes en el navegador, sin enviarlas a servicios externos, analítica ni APIs de IA.
- **RNF-02 Accesibilidad:** teclado, foco visible, etiquetas y códigos junto al color en la guía.
- **RNF-03 Compatibilidad propuesta:** Chrome y Firefox de escritorio; comprobar la vista móvil en Safari iOS antes de declararla compatible. Registrar versiones y dispositivos realmente verificados.
- **RNF-04 Límites iniciales propuestos:** 20 MiB por archivo, 25 megapíxeles decodificados y 2.500 cubos. Comprobar dimensiones antes de grandes reservas cuando sea posible. Validar estos límites con mediciones.
- **RNF-05 Rendimiento objetivo:** regenerar 900 cubos (30×30 cubos, 90×90 casillas) en menos de un segundo después de decodificar. Documentar equipo de referencia y resultados antes de prometer ese tiempo.
- **RNF-06 Mantenibilidad:** motor independiente, contratos simples, comprobaciones de invariantes y formato de proyecto versionado. Resultado determinista para la misma entrada decodificada, parámetros y versión del motor.
- **RNF-07 Fidelidad:** exportar/importar no cambia dimensiones, códigos ni orden de la matriz. No se presupone igualdad binaria de decodificación entre navegadores distintos.

## Pendiente de cerrar antes de cada implementación

- Confirmar supuesto de cubos girables 3×3 y separar claramente las entregas visual y físicamente validada.
- Fijar los rangos y fórmulas de brillo/contraste. La política del dithering implementado está en arquitectura.
- Contrastar paleta y legibilidad con imágenes de prueba; medir límites y rendimiento.
- Formalizar el esquema JSON v1 antes de implementar importación/exportación.

## Correcciones por zonas

**RF-19:** seleccionar por toque/click o teclado una zona conectada de la imagen original recortada, ajustar tolerancia y asignarle un único color de la paleta disponible. Mostrar la máscara antes de aplicar y el número de casillas que cubre al menos a la mitad. Conservar hasta 12 reglas no destructivas durante la sesión; permitir verlas y eliminarlas. La última regla activa prevalece en solapes. Cambiar encuadre, resolución, método o dithering conserva las reglas; cargar una nueva imagen o el ejemplo las limpia. Un color ausente de la paleta actual deja su regla inactiva y advertida, sin eliminarla; vuelve a actuar si el color está disponible de nuevo. Las casillas forzadas respetan la paleta y no reciben ni propagan error de dithering. La selección analiza una versión de hasta 640 píxeles en su lado mayor; los detalles más pequeños pueden no representarse. No se garantiza recuperar un ojo u otro detalle que no cubra al menos la mitad de una casilla. Combinaciones de colores y edición manual de casillas quedan fuera de esta entrega.
