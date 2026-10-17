# Arquitectura

## Decisión: Vue 3 + TypeScript + Vite

Estado: decisión adoptada para el MVP, 17 de octubre de 2026.

El producto es un editor con estado compartido: imagen, recorte, inventario, dimensiones, ajustes, vista previa y selección de cubos. Vue permite mantener esas vistas sincronizadas y sus templates se ajustan a la restricción de legibilidad del proyecto. Vite proporciona el entorno de desarrollo y la construcción de archivos estáticos.

| Elemento | Decisión |
|---|---|
| Interfaz | Vue 3, componentes `.vue`, `<template>` y Composition API con `<script setup lang="ts">` |
| Lenguaje | TypeScript con modo estricto e inferencia; tipos explícitos en los contratos que lo necesiten |
| Construcción | Vite; fijar versiones y gestor de paquetes al inicializar el proyecto |
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

Para el primer motor, convertir sRGB a RGB lineal y usar distancia euclídea y difusión de error en ese espacio. Floyd–Steinberg recorre de izquierda a derecha y de arriba abajo: 7/16 a la derecha, 3/16 abajo izquierda, 5/16 abajo y 1/16 abajo derecha. Descartar el error exterior sin redistribuir; multiplicarlo por la intensidad seleccionada. Desempatar por orden R,G,Y,B,W,O. Antes de implementarlo, fijar las fórmulas de ajuste y la política de saturación. Comparar resultados visuales antes de introducir una métrica perceptual distinta.

## Contrato de proyecto propuesto

JSON v1: `schemaVersion`, `engineVersion`, `cubeSize=3`, `availableCubes`, `cubeColumns`, `cubeRows`, `palette[{id,hex}]`, `settings`, `pixels[fila][columna]` y `physicalValidation`. Estado de validación inicial: `unchecked`. Validar tipos, dimensiones, límites y códigos; rechazar versiones incompatibles.

Coordenadas de datos desde cero, origen arriba izquierda, lectura por filas; coordenadas visibles desde uno. El cubo (f,c) contiene `pixels[3f+i][3c+j]`, con i,j entre 0 y 2. El futuro validador físico consumirá bloques del mismo contrato y tendrá implementación independiente del editor.

## Orden de implementación

1. Inicializar Vue/TS/Vite y documentar comandos reales. Implementar geometría y contratos, verificando los casos de 9, 10 y 12 cubos.
2. Implementar motor y editor sobre esos contratos: RF-01 a RF-08 y RF-12. Motor e interfaz pueden desarrollarse por separado tras acordar entradas/salidas.
3. Añadir guía y exportaciones: RF-09 a RF-11; verificar ida/vuelta exacta del patrón y orientación de bloques.
4. Validar el recorrido, accesibilidad, rendimiento y errores. Resolver la viabilidad física antes de declarar RF-13 completado.
