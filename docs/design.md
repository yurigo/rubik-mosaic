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

Selector de material junto a la disposición. LEGO muestra dimensiones en piezas, paleta con buscador por nombre/ID BrickLink y acciones Todos/Ninguno. Selección con casillas etiquetadas y muestras dentro de un desplegable; la lista expandida usa el scroll global de la página. La comparación conserva su protagonismo y debajo aparece el consumo por color. La cuadrícula marca piezas individuales en LEGO y bloques 3×3 en Rubik. Las tiles redondas permiten cambiar la base y explican que no se incluye en el recuento.

## Comparación de colores

Select etiquetado «Método de comparación de colores» junto a los controles de conversión, independiente del dithering. Ofrece RGB lineal, OKLab, OKLab · conservar color, CIELAB · CIEDE2000 y HSL · experimental, con una descripción asociada a la opción actual. Mantener el resto de ajustes al cambiarlo para poder comparar. RGB es la opción inicial.

«Comparar métodos de color» es un desplegable debajo del workspace, fuera de la vista sticky y antes del consumo de piezas. Cerrado inicialmente; solo al abrir calcula las cinco vistas, con la misma configuración actual. Tarjetas en rejilla adaptable a una columna en móvil, sin scroll interno; conservan la proporción de la imagen y muestran nombre, descripción y botón «Usar este método». El botón de la opción elegida indica «Método seleccionado», con `aria-pressed`. Elegir una tarjeta actualiza el selector principal y el consumo; no cambia el encuadre ni los ajustes. Una nota recomienda empezar con colores planos y explica los límites experimentales.

## Correcciones por zonas

Panel «Dirige los colores» dentro del desplegable «Corregir zonas» del panel de controles. El botón «Seleccionar una zona» activa la selección sobre la imagen original; «Volver a encuadrar» sale del modo. Marca turquesa visible, tolerancia etiquetada, selector de color, recuento de casillas afectadas y Aplicar/Cancelar. Si una zona no cubre suficiente área, explicar que puede requerir más piezas o ampliar el encuadre, sin prometer recuperar detalles. Reglas enumeradas con Ver zona/Eliminar y aviso de color no disponible. Las acciones tienen objetivos táctiles de 44 px. En selección, la imagen es enfocable: las flechas mueven una cruz en pasos del 1 % y Intro/Espacio seleccionan. La selección no se aplica hasta confirmar la regla. Cerrar el desplegable sale del modo de selección sin eliminar reglas o borrador.

## Encuadre directo

El original admite arrastrar para mover, pellizcar con dos dedos para ampliar y rueda sobre la imagen para acercar/alejar. Los controles +, −, ampliación actual y Restablecer se muestran sobre la vista, con objetivos táctiles de 44 px. La sección de encuadre explica los gestos y atajos en lugar de mostrar sliders. El área admite foco visible y +/−, flechas e Inicio; las instrucciones completas están asociadas para lectores de pantalla. Los gestos táctiles se reservan al área real de imagen; el resto de la página conserva su desplazamiento. En los límites de zoom, la rueda permite desplazar la página. En modo «Seleccionar zona» se deshabilitan encuadre y botones; «Volver a encuadrar» los reactiva para evitar acciones ambiguas.

## Flujo de recorte y tamaño

El botón «Recortar imagen» aparece junto a la carga. Abre la fuente completa en un modal amplio (pantalla completa en móvil), con exterior oscurecido, tercios y bordes/esquinas arrastrables. Presets Libre/Original/Cuadrado/4:3/16:9, opción de invertir orientación, Aplicar, Cancelar y Restablecer. Al cerrar vuelve el foco al control de origen mediante el diálogo nativo. Es una herramienta distinta del encuadre con zoom y del modo de selección de colores. Usar imagen completa se ofrece tras un recorte aplicado.

«Tus piezas» presenta «Tengo estas piezas» / «Quiero este tamaño». El primero muestra un único presupuesto y el resultado calculado C×F; el segundo muestra dos dimensiones, bloqueo de proporción y «Necesitas N». Ambos muestran la resolución en píxeles con las unidades de material explícitas. No exigir que el usuario multiplique ni introduzca un presupuesto adicional para un tamaño manual. Avisar que una cuadrícula entera puede aproximar la proporción, y mostrar el ajuste real en la comparación.

## Desplazamiento del editor

El documento tiene un único desplazamiento principal. El panel de controles crece con su contenido y las opciones de color no tienen scroll interno. Elegir colores y Corregir zonas son secciones desplegables nativas, cerradas inicialmente, con resumen de selección/reglas. Al abrirlas, todo sigue desplazándose con la página.

En escritorio (ancho >760 px y alto ≥650 px), la comparación permanece sticky a 16 px del borde superior mientras se recorren los controles. El ancestro workspace no tiene overflow que capture o recorte sticky. Las vistas de imagen limitan su altura al viewport; Pointer Events sigue usando su tamaño real. La corrección de zonas está en los controles y el inventario por color se muestra debajo del workspace, fuera del bloque sticky, para que su altura no oculte las imágenes ni deje contenido inaccesible. En móvil y ventanas bajas todo permanece en flujo normal, sin paneles desplazables internos. La lista de consumos y el pie se alcanzan mediante el scroll global.
