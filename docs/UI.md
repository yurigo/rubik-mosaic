# Dirección visual inicial — propuesta

## Objetivo

Crear una herramienta visual cuidada y fácil de aprender. La imagen transformada será el elemento principal. Este documento es un briefing del proyecto, no una skill instalada ni una decisión de diseño aprobada.

## Composición propuesta

- Escritorio: ajustes en un panel lateral y una zona amplia de comparación original/resultado.
- Móvil: controles y vista previa en una columna; acciones accesibles sin desplazamientos horizontales.
- Orden de trabajo visible: imagen, cubos, ajustes y guía. Mantener el resultado disponible al modificar parámetros.
- Mostrar siempre «cubos usados / disponibles», disposición y resolución en casillas; evitar confundir cubos con píxeles.

## Lenguaje visual propuesto

- Base neutra cálida, tipografía legible y espacios generosos; usar los seis colores como contenido y acentos, evitando competir con la fotografía.
- Jerarquía clara entre acción principal, ajustes y opciones avanzadas. Mostrar valores y unidades.
- Casillas perfectamente cuadradas; zoom con bordes nítidos y separación opcional de bloques 3×3.
- Diseño adaptable desde 360 px; controles táctiles de tamaño cómodo y foco visible.
- Estados diseñados: inicio sin imagen, procesando, resultado, archivo inválido, inventario insuficiente y exportación.
- Los colores de interfaz pueden diferir de los seis colores de las casillas. En la guía, acompañar el color con códigos o nombres.

## Comprobaciones antes de dar por terminada la interfaz

1. Con nueve cubos en 3×3, distinguir claramente los nueve bloques y las 81 casillas.
2. Comparar con y sin dithering sobre el mismo recorte, especialmente a 9×9.
3. Completar el recorrido con teclado y comprobar etiquetas y foco.
4. Verificar en móvil que no se corten controles ni se deforme la imagen.
5. Inspeccionar imágenes reales y casos de error; indicar qué se comprobó y en qué navegador.

## Cómo elegir una skill de diseño

Evaluar una candidata con una tarea concreta: diseñar y construir este editor con sus estados, vista móvil y accesibilidad. Comparar el resultado con este briefing. Un nombre llamativo o muchos seguidores no prueban su utilidad.

Antes de incorporar una skill externa: leer SKILL.md y sus archivos asociados, identificar herramientas o scripts necesarios, revisar licencia y registrar la versión. Verificar que sirve al entorno que ejecutará Codex; no basta con copiar un enlace de instalación de otro producto.

No hay una skill de UI externa instalada en esta entrega. El primer trabajo de diseño deberá producir una propuesta visual revisable antes de desarrollar todos los controles.
