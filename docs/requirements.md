# Especificación de requisitos

Versión 0.2 · 17 de octubre de 2026 · Borrador de producto

## Objetivo y alcance

Transformar una imagen en un mosaico de los seis colores del cubo Rubik, adaptado a la cantidad de cubos disponibles, y facilitar su reproducción física.

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
| RF-03 | Recortar sin deformar | Recorte con proporción C/F, desplazamiento y ampliación de imagen; casillas cuadradas. |
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
- Fijar los rangos y fórmulas de brillo/contraste y la política de saturación del error del dithering.
- Contrastar paleta y legibilidad con imágenes de prueba; medir límites y rendimiento.
- Formalizar el esquema JSON v1 antes de implementar importación/exportación.
