# Diseño de la interfaz

Propuesta visual pendiente de validación mediante un prototipo.

## Composición

- La comparación entre imagen y mosaico es el elemento principal.
- En escritorio, controles en un panel lateral y vista previa amplia. En móvil, una columna con controles accesibles y sin desplazamiento horizontal de la página.
- Recorrido visible: imagen, cubos, ajustes y guía. Mantener el resultado disponible mientras se modifican parámetros.
- Mostrar cubos usados/disponibles, disposición y resolución en casillas con etiquetas distintas.

## Presentación e interacción

- Base neutra, tipografía legible y jerarquía clara; los colores del mosaico deben destacar sobre la interfaz.
- Casillas cuadradas, zoom sin suavizado y límites opcionales de cubos 3×3.
- Controles con valores visibles, unidades, foco y etiquetas; códigos o nombres junto al color en la guía.
- Diseño adaptable desde 360 px y controles táctiles cómodos. La vista móvil se verificará en el navegador objetivo antes de declararla compatible.
- Estados previstos: sin imagen, procesando, resultado, archivo inválido, inventario insuficiente y exportación.
- Evitar animaciones que distraigan de la comparación o dificulten el ajuste; respetar la preferencia de movimiento reducido si se incorporan transiciones.

## Criterios de revisión visual

1. Distinguir los nueve cubos y las 81 casillas del ejemplo 3×3.
2. Comparar con/sin dithering manteniendo el mismo recorte.
3. Completar carga, ajuste y consulta de guía con teclado.
4. Verificar que en móvil no se corten controles ni se deforme la imagen.
5. Inspeccionar imágenes y errores representativos; registrar navegador, tamaño de pantalla y comprobaciones realizadas.

## Modo LEGO

Selector de material junto a la disposición. LEGO muestra dimensiones en piezas, paleta con buscador por nombre/ID BrickLink y acciones Todos/Ninguno. Selección con casillas etiquetadas y muestras; lista desplazable para evitar un panel de 54 filas. La comparación conserva su protagonismo y debajo aparece el consumo por color. La cuadrícula marca piezas individuales en LEGO y bloques 3×3 en Rubik. Las tiles redondas permiten cambiar la base y explican que no se incluye en el recuento.

## Comparación de colores

Select etiquetado «Método de comparación de colores» junto a los controles de conversión, independiente del dithering. Ofrece RGB lineal, OKLab y HSL · experimental, con una descripción asociada a la opción actual. Mantener el resto de ajustes al cambiarlo para poder comparar. RGB es la opción inicial.
