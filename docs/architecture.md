# Arquitectura

## Decisión: Vue 3 + TypeScript + Vite

Estado: decisión adoptada para el MVP, 17 de octubre de 2026.

El producto es un editor con estado compartido: imagen, recorte, inventario, dimensiones, ajustes, vista previa y selección de cubos. Vue permite mantener esas vistas sincronizadas y sus templates se ajustan a la restricción de legibilidad del proyecto. Vite proporciona el entorno de desarrollo y la construcción de archivos estáticos.

| Elemento | Decisión |
|---|---|
| Interfaz | Vue 3, componentes `.vue`, `<template>` y Composition API con `<script setup lang="ts">` |
| Lenguaje | TypeScript con modo estricto e inferencia; tipos explícitos en los contratos que lo necesiten |
| Construcción | Vite y npm, versiones fijadas mediante package-lock.json; Node.js 24 |
| Imagen | Canvas para entrada/salida; algoritmos independientes de Vue y del DOM |
| Estilos | CSS; añadir una biblioteca solo si resuelve una necesidad demostrada |
| Ejecución | Aplicación cliente desplegable como archivos estáticos; sin backend ni SSR en el MVP |

React y JSX/TSX quedan fuera de la implementación. Astro no se añade al editor: gran parte de esta pantalla necesita interactividad y comparte estado. Si se incorpora una web de contenido o una landing, evaluar Astro para esa parte; una isla Vue puede ser adecuada para una interacción delimitada. Nuxt solo se reevaluará si aparece una necesidad concreta de SSR u otras capacidades que lo justifiquen.

## Criterio de implementación

- Priorizar funciones directas y módulos pequeños. Usar el HTML y las APIs del navegador antes de añadir dependencias.
- Dejar que TypeScript infiera valores locales. Definir tipos para paleta, configuración, resultado y proyecto serializado; evitar interfaces duplicadas y genéricos sin un caso real.
- Validar archivos y JSON en ejecución: el tipado estático no valida datos externos.
- Mantener el estado cerca del editor, con props/emits y composables cuando sean útiles. Añadir router o un almacén global solo al necesitarlos.
- No guardar los grandes búferes de imagen en reactividad profunda. Evaluar un Web Worker si las mediciones muestran bloqueo de la interfaz.

## Organización prevista del código

| Ruta | Responsabilidad |
|---|---|
| `src/components/` | Controles, vista previa y guía por cubos |
| `src/composables/` | Coordinación del estado y procesamiento del editor |
| `src/core/` | Geometría, paleta, reducción, cuantización y dithering, sin Vue ni DOM |
| `src/io/` | Decodificación, adaptadores Canvas e importación/exportación |
| `src/assets/` | Estilos y recursos propios |

Estas carpetas se crearán al implementar sus responsabilidades. Las pruebas puras pueden acompañar al módulo; los recorridos de interfaz tendrán pruebas de integración cuando exista la aplicación.

## Conversión de imagen propuesta

Decodificar y orientar → componer transparencia sobre blanco → recortar → reducir por promedio de área → ajustar brillo/contraste → cuantizar y aplicar dithering → agrupar en bloques 3×3 → representar/exportar.

Paleta sRGB inicial, pendiente de contrastar con cubos reales:

| Código | Color | Hexadecimal |
|---|---|---|
| R | Rojo | #C41E3A |
| G | Verde | #009E60 |
| Y | Amarillo | #FFD500 |
| B | Azul | #0051BA |
| W | Blanco | #FFFFFF |
| O | Naranja | #FF5800 |

El primer motor compone transparencia sobre blanco en sRGB y convierte los canales a RGB lineal. La reducción promedia por área con pesos de solapamiento; la cuantización usa distancia euclídea y difusión de error en RGB lineal. Floyd–Steinberg recorre de izquierda a derecha y de arriba abajo: 7/16 a la derecha, 3/16 abajo izquierda, 5/16 abajo y 1/16 abajo derecha. Descarta el error exterior sin redistribuir y lo multiplica por la intensidad seleccionada. Desempata por orden R,G,Y,B,W,O. El error se acumula sin saturar y cada muestra se limita a [0,1] al cuantizarla. El selector de comparación descrito a continuación permite explorar otras métricas. Brillo/contraste no se implementan en esta iteración.

## Contrato de proyecto propuesto

JSON v1: `schemaVersion`, `engineVersion`, `cubeSize=3`, `availableCubes`, `cubeColumns`, `cubeRows`, `palette[{id,hex}]`, `settings`, `pixels[fila][columna]` y `physicalValidation`. Estado de validación inicial: `unchecked`. Validar tipos, dimensiones, límites y códigos; rechazar versiones incompatibles.

Coordenadas de datos desde cero, origen arriba izquierda, lectura por filas; coordenadas visibles desde uno. El cubo (f,c) contiene `pixels[3f+i][3c+j]`, con i,j entre 0 y 2. El futuro validador físico consumirá bloques del mismo contrato y tendrá implementación independiente del editor.

## Orden de implementación

1. Inicializar Vue/TS/Vite y documentar comandos reales. Implementar geometría y contratos, verificando los casos de 9, 10 y 12 cubos.
2. Implementar motor y editor sobre esos contratos: RF-01 a RF-08 y RF-12. Motor e interfaz pueden desarrollarse por separado tras acordar entradas/salidas.
3. Añadir guía y exportaciones: RF-09 a RF-11; verificar ida/vuelta exacta del patrón y orientación de bloques.
4. Validar el recorrido, accesibilidad, rendimiento y errores. Resolver la viabilidad física antes de declarar RF-13 completado.

## Materiales y paletas variables

`quantize` acepta una paleta explícita y mantiene la de Rubik como valor por defecto. Valida paletas no vacías, IDs únicos y hexadecimales sRGB; desempata por orden de la paleta recibida. `getLegoGeometry` permite hasta 22.500 píxeles, el mismo presupuesto de casillas que 2.500 cubos Rubik. `countColors` cuenta la matriz final. No se aplican cuotas por color.

`src/core/lego.ts` mantiene IDs BrickLink con prefijo `BL-` y las combinaciones de pieza/color verificadas. La interfaz conserva disposición Rubik y LEGO por separado y selecciones independientes por pieza. La selección solo cambia la cuantización; el recorte y la reducción se reutilizan. Los acabados y la base redonda se dibujan únicamente en Canvas. Fuentes: [paletas LEGO](lego-palette.md).

El contrato JSON anterior es una propuesta de Rubik aún sin implementar; habrá que ampliarlo con material, pieza y paleta antes de implementar RF-11 para ambos modos.

## Métodos de comparación (RF-18)

`src/core/color-distance.ts` define las opciones y conversiones. `quantize` recibe el método después de la paleta; por defecto `rgb`, rechazando valores desconocidos. Convierte la paleta una vez y cada muestra al visitar su casilla. La selección minimiza distancia euclídea al cuadrado y conserva el desempate por orden de paleta.

- **RGB lineal:** coordenadas lineales originales, sin cambios en el algoritmo previo.
- **OKLab:** conversión desde sRGB lineal con las matrices de Björn Ottosson actualizadas el 25 de enero de 2021; distancia euclídea en L,a,b. [Fórmulas y código de referencia de dominio público](https://bottosson.github.io/posts/oklab/#converting-from-linear-srgb-to-oklab).
- **HSL experimental:** primero codificar RGB lineal como sRGB continuo y convertirlo a HSL según las [definiciones de CSS Color](https://www.w3.org/TR/css-color-4/#rgb-to-hsl). Para comparar se usan coordenadas `(C cos(2πH), C sin(2πH), L)`, donde H está en vueltas, S,L en [0,1] y `C=(1−|2L−1|)S`. Distancia euclídea al cuadrado con pesos iguales. Esta métrica propia evita la discontinuidad de 0/360° y anula la contribución del tono en grises, blanco y negro. No es una distancia perceptual estándar ni una garantía de conservación del tono.

La reducción por área, saturación a [0,1] al visitar una muestra y difusión Floyd–Steinberg permanecen en RGB lineal en todos los métodos. No convertir ni difundir el error como HSL u OKLab. No se añaden filtros de temperatura, brillo o saturación en esta entrega. El método deberá incluirse en el futuro contrato de proyecto antes de implementar RF-11.

## Reglas de zona (RF-19)

`src/core/regions.ts` conserva máscaras asociadas a toda la imagen original, independientes del recorte. `createRegionRaster` crea una imagen de análisis con lado mayor de hasta 640 px, muestreo vecino más cercano por centros y alfa compuesto sobre blanco sRGB. Se calcula una vez por fuente. `selectRegion` aplica flood fill con conectividad de cuatro vecinos, comparando cada candidato con la semilla (sin deriva de vecinos). Tolerancia 0–100 es distancia euclídea sRGB normalizada por `255√3`; no depende del selector RF-18. La máscara se recalcula al cambiar semilla o tolerancia, no con pan, zoom o dithering.

`projectRegions` integra el solapamiento de cada píxel de máscara con el área de cada casilla dentro del recorte. Si cubre ≥50 % la fuerza al color indicado; conserva el orden de reglas y prevalece la última activa. No fuerza la casilla semilla si su área es insuficiente. Omite colores ausentes de la paleta. Las máscaras se mantienen al cambiar material o colores, y se eliminan con una nueva fuente. Máximo 12 reglas por sesión para acotar memoria y cálculo; sin persistencia JSON todavía.

`quantize` recibe un séptimo argumento opcional de colores forzados, uno por casilla; rechaza IDs fuera de paleta o longitud incorrecta. Una casilla forzada se escribe directamente, descarta error entrante y no lo propaga. La difusión tampoco deposita error en casillas forzadas. Sin reglas, RF-18 conserva su comportamiento anterior. Entrada original, muestras y máscaras no se mutan.

`CropPreview` recibe `selecting` y `selection?: RegionMask`; emite `select {x,y}` en coordenadas absolutas de la fuente. Dibuja una superposición turquesa sin alterar la fuente. `RegionControls` administra la intención mediante props/emits; el estado y la coordinación permanecen en el editor. El modo explícito de selección permite separar toque de selección y gestos de encuadre.

## Navegación del encuadre (RF-03)

`CropViewport` envuelve la vista original mediante un slot y emite zoom y posiciones normalizadas; no modifica el raster ni el algoritmo de reducción. `crop-navigation.ts` transforma desplazamiento y ampliación manteniendo el punto de origen bajo el cursor o el centro del pellizco, salvo límites de la imagen. Usa Pointer Events y captura de puntero; al cambiar el número de dedos toma una nueva referencia para evitar saltos. Rueda no pasiva solo en el área de imagen; Ctrl/Cmd conservan el zoom del navegador. Las teclas solo actúan con el área enfocada. `disabled` desactiva navegación y botones para reservar el área a una herramienta de selección. No hay dependencias adicionales.
