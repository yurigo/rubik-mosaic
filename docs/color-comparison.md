# Comparación de selección de colores (RF-18)

El banco separa la elección de colores de la reducción y del dithering. No introduce filtros, cambios de paleta ni cambios de método inicial: RGB lineal conserva los resultados previos. Las dos alternativas nuevas son seleccionables y se pueden comparar bajo el editor con todos los ajustes actuales.

## Reproducción

`npm run compare:colors` imprime una tabla Markdown sin conexión: 13 muestras × 4 paletas × 5 métodos. Los valores están en `data/color-cases.json`; no contiene imágenes personales. Cada muestra recorre `sampleImage` y `quantize` reales a 1×1, sin dithering, con todos los colores de cada material. No evalúa el ojo de una imagen completa ni la calidad de un degradado: son decisiones de color aisladas.

Con plate 3024 completa:

| Muestra | RGB lineal | OKLab | OKLab ponderado | CIEDE2000 |
|---|---|---|---|---|
| Montaña turquesa `#167C7E` | Dark Bluish Gray | Dark Bluish Gray | Dark Turquoise | Dark Turquoise |
| Montaña azul `#11449A` | Dark Purple | Blue | Blue | Blue |
| Gris opaco `#4E585C` | Dark Gray | Dark Gray | Dark Gray | Dark Gray |
| Neutro `#808080` | Sand Green | Dark Tan | Light Gray | Light Bluish Gray |
| Neutro `#D2D2D2` | Lavender | Maersk Blue | Light Aqua | White |

Los colores del paisaje se generan en Canvas: el cambio de su interior turquesa a gris no procede de compresión, reducción ni difusión de error. Con OKLab estándar, el gris gana por luminosidad parecida aunque pierda cromaticidad; el turquesa de la paleta es más claro. RGB lineal además elige morado para la montaña azul.

La ponderación experimental reduce la contribución de luminosidad mediante `(0.5L,a,b)`, es decir `0.25 ΔL²+Δa²+Δb²`. No se aplican excepciones por nombre de pieza, coordenada de imagen o color concreto. Resuelve ambas montañas y conserva los grises oscuros de prueba, pero en ciertos grises claros elige Light Aqua. Se deja visible esta limitación en la descripción y el banco; no se declara una solución general ni se impone como valor inicial.

CIEDE2000 elige turquesa/azul/gris en los tres casos críticos con las tres piezas LEGO. También mantiene los neutros de 40 a 240 (pasos de 10) dentro de las familias gris/blanco/negro, con colores planos y paletas completas. Eso no garantiza resultados neutros con dithering o con subconjuntos sin grises. Rubik no dispone de gris ni negro y no puede reproducirlos con un único color.

## Verificación

- `npm test`: conversión sRGB lineal→CIELAB D65 y 34 pares publicados de CIEDE2000 (tolerancia ΔE00 <0.00005 en ambos sentidos), identidad, muestras críticas, neutros, exactitud de todos los colores disponibles, subconjuntos, determinismo, reglas y ausencia de mutación. Los tests anteriores siguen verificando RGB.
- `npm run build`: comprueba tipos y genera la aplicación.
- Medición orientativa en Node 24 del entorno de desarrollo: 150×150 casillas, 54 colores, intensidad 0.8, una pasada por método sobre una matriz sintética determinista. RGB 91 ms; OKLab 51 ms; ponderado 52 ms; CIEDE2000 422 ms; HSL 52 ms. Incluye calentamiento desigual: no es un ranking de rendimiento ni una garantía para móvil. Abrir la comparación suma el trabajo de todos los métodos; cerrada solo se calcula el elegido.
- Pendiente: revisión de la interfaz en el navegador de la preview y Safari iOS; comparar imágenes completas y degradados con y sin dithering. No se presenta la comprobación de muestras como validación visual integral.

## Referencias y siguientes experimentos

- [OKLab, Ottosson](https://bottosson.github.io/posts/oklab/): conversión perceptual usada como referencia; la ponderación es una preferencia propia, no parte del modelo.
- [CIEDE2000, Sharma/Wu/Dalal](https://hajim.rochester.edu/ece/sites/gsharma/ciede2000/): fórmula, notas y [34 pares de prueba](https://hajim.rochester.edu/ece/sites/gsharma/ciede2000/dataNprograms/ciede2000testdata.txt), conservados con atribución en `data/ciede2000-reference.txt`. CIELAB usa D65 en esta implementación; los pares publicados ya están en Lab y comprueban la fórmula de distancia, no la transformación sRGB.
- [CSS Color 4](https://www.w3.org/TR/css-color-4/#color-conversion-code): matrices sRGB/XYZ y transformación Lab.
- [ImageMagick: speckling](https://usage.imagemagick.org/quantize/#dither_speckle): difusión de error puede introducir píxeles discordantes en imágenes limpias. [pngquant](https://pngquant.org/#algorithm) limita la difusión según bordes y zonas. Estudiar difusión adaptativa después de evaluar la selección.
- [Content-Adaptive Image Downscaling](https://johanneskopf.de/publications/downscaling/): estudiar conservación de detalles al reducir frente al promedio actual.
- [Bilateral Filtering](https://scholars.duke.edu/publication/802410): estudiar limpieza opcional antes de reducir, comprobando que no elimine detalles pequeños.

Antes de cambiar el valor inicial, revisar montañas, ilustraciones, fotografías, grises y degradados en ambas familias de materiales, con paletas completas y restringidas. Comparar legibilidad, fidelidad de tono, luminosidad, puntos aislados y latencia. La elección de un método no modifica el muestreo, el error lineal Floyd–Steinberg ni la semántica de las reglas de zona.
