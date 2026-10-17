# Rubik Mosaic — ERS y guía de trabajo

Versión 0.1 · 17 de octubre de 2026 · Borrador para revisión

## 1. Propósito y estado

Crear una aplicación que transforme una imagen en un mosaico de seis colores, dividido en caras de cubos Rubik de 3 × 3 casillas, y ayude a reproducirlo físicamente.

Confirmado por el promotor: entrada mediante imagen; colores rojo, verde, amarillo, azul, blanco y naranja; pixel art con dithering; cantidad de cubos configurable; nueve cubos en una disposición de 3 × 3 producen 9 × 9 píxeles.

El resto de este documento son propuestas explícitas para comenzar. No implica que el promotor haya aprobado plataforma, límites, algoritmos o alcance comercial. No se ha construido ni probado la aplicación.

## 2. Usuarios y recorrido

Usuario principal: persona que dispone de cubos y quiere construir un retrato o dibujo. No se presupone que sepa programar ni resolver un cubo.

Recorrido: cargar imagen → indicar inventario y disposición → recortar → ajustar conversión → comparar → consultar bloques → exportar guía → montar.

## 3. Modelo geométrico

Se utiliza una sola cara visible de cada cubo estándar 3 × 3. Los cubos pueden girarse para elegir su cara visible. No se consumen ni se retiran pegatinas.

- N: cubos disponibles, entero positivo.
- C: columnas de cubos; F: filas de cubos, ambos enteros positivos.
- Cubos usados = C × F, que debe ser menor o igual que N.
- Anchura del mosaico = 3C píxeles; altura = 3F píxeles.
- Casillas visibles = 9CF; sobrantes = N − CF.

| Disponibles | Columnas × filas | Usados | Resolución |
|---|---|---|---|
| 9 | 3 × 3 | 9 | 9 × 9 |
| 9 | 1 × 9 | 9 | 3 × 27 |
| 10 | 3 × 3 | 9 | 9 × 9 |
| 12 | 4 × 3 | 12 | 12 × 9 |

N no determina una disposición única. La interfaz propondrá una cercana al formato de la imagen, permitiendo cambiarla y mostrando sobrantes. No impondrá raíz cuadrada entera ni deformará la fotografía para encajarla.

El inventario cuenta cubos, no una bolsa de piezas de colores: no se impondrá un reparto global de un sexto de cada color en la cara visible.

## 4. Alcance por entregas

**MVP visual:** carga, inventario, disposición, recorte, reducción, paleta fija, dithering configurable, comparación, guía por cubos, exportación PNG y proyecto JSON. El resultado se identificará como patrón visual con montaje físico pendiente de verificar.

**Entrega de montaje validado:** comprobar cada cara objetivo frente a estados legales del cubo. Solo entonces mostrar «montaje validado». Es un requisito para presentar el producto como generador de mosaicos físicamente construibles, aunque se implemente después del prototipo visual.

**Posterior:** secuencias de movimientos desde un cubo resuelto, PDF imprimible, calibración de colores por marca, guardar progreso y formatos de cubos distintos de 3 × 3.

Fuera del primer alcance: cuentas, pagos, colaboración, generación de imágenes por IA, reconocimiento del estado actual por cámara, aplicación móvil nativa y un servidor de procesamiento.

## 5. Requisitos funcionales y aceptación

| ID | Requisito propuesto | Criterio de aceptación |
|---|---|---|
| RF-01 | Cargar JPEG, PNG y WebP estáticos | Una imagen válida aparece orientada correctamente; un archivo inválido produce un error legible y no pierde el proyecto anterior. |
| RF-02 | Configurar N, C y F | Rechaza cero, negativos, decimales y C×F>N; muestra usados, sobrantes y resolución. Caso obligatorio: N=9,C=3,F=3 → 9×9. |
| RF-03 | Recortar sin deformar | El recorte tiene proporción C/F, permite mover y ampliar la imagen y produce casillas cuadradas. |
| RF-04 | Reducir a la resolución objetivo | La matriz contiene exactamente 3F filas de 3C valores. Vista ampliada sin suavizado entre casillas. |
| RF-05 | Cuantizar con seis colores | Cada celda pertenece a uno de los seis identificadores de paleta. Ningún séptimo color entra en los datos exportados. |
| RF-06 | Elegir dithering | Incluye «sin dithering» y Floyd–Steinberg; intensidad 0–100 %. A 0 % coincide con conversión sin dithering. El error se propaga sobre la cuadrícula completa. |
| RF-07 | Ajustar imagen | Brillo y contraste con valores neutros y botón de restablecer; regenerar conserva inventario y recorte. Rangos concretos se fijarán antes de implementar. |
| RF-08 | Comparar y navegar | Muestra original recortado y resultado, zoom y límites de cada bloque 3×3. |
| RF-09 | Consultar guía | Cada cubo tiene fila y columna; al seleccionarlo se muestran nueve casillas y códigos de color en el mismo orden que el mosaico. |
| RF-10 | Exportar PNG | Exporta patrón ampliado con escala entera y sin interpolación; la cuadrícula es opcional. No exporta la interfaz. |
| RF-11 | Guardar y abrir JSON | Conserva matriz final, dimensiones, paleta, ajustes, versión y estado de validación; al reabrir se obtiene el mismo patrón. La imagen original no se incluye en el MVP; sin ella no se puede cambiar el recorte. |
| RF-12 | Recuperarse de errores | Explica formatos/límites, no bloquea la interfaz y permite volver a intentarlo. |
| RF-13 | Validar montaje físico | Solo en la entrega correspondiente: cada bloque aceptado tiene un estado completo legal que demuestra su cara visible; «no comprobado» y «no realizable» son estados diferentes. |

Las líneas y los textos de la guía pueden usar colores de interfaz ajenos a la paleta; la restricción de seis colores corresponde a las casillas del mosaico.

## 6. Paleta y procesamiento

Paleta digital inicial propuesta, orientativa y modificable tras comparar con los cubos reales:

| Identificador | Nombre | sRGB hexadecimal |
|---|---|---|
| R | Rojo | #C41E3A |
| G | Verde | #009E60 |
| Y | Amarillo | #FFD500 |
| B | Azul | #0051BA |
| W | Blanco | #FFFFFF |
| O | Naranja | #FF5800 |

Orden propuesto: decodificar y orientar → componer transparencia sobre blanco → recortar → reducir por promedio de área → ajustar brillo/contraste → cuantizar y aplicar dithering → dividir en bloques → representar y exportar.

Propuesta técnica inicial verificable: distancias euclídeas y difusión de error en RGB lineal, convirtiendo desde sRGB antes del cálculo. Floyd–Steinberg recorre izquierda a derecha y arriba abajo con pesos 7/16 derecha, 3/16 abajo izquierda, 5/16 abajo y 1/16 abajo derecha. En los bordes se descarta el error exterior; no se redistribuye. Intensidad multiplica el error difundido. Desempate mediante orden R,G,Y,B,W,O. Documentar saturación y fórmulas exactas antes del ticket de motor. Evaluar distancia perceptual como mejora si los ejemplos lo justifican.

La salida debe ser determinista para la misma imagen decodificada, parámetros y versión de motor. No se promete igualdad binaria entre decodificadores distintos sin verificarla.

A 9×9 se pierden muchos detalles. No existe una garantía de reconocimiento de cualquier fotografía. Comparar fotos y dibujos sencillos antes de elegir valores predeterminados; el dithering puede reducir la legibilidad a baja resolución.

## 7. Viabilidad física: puerta de calidad

No se asumirá sin demostración que cualquier bloque arbitrario de nueve colores se puede construir mediante giros. Una imagen coloreada no constituye una prueba de montaje.

El ticket de investigación deberá establecer las restricciones reales con modelo de piezas y esquema de colores del cubo. Para cada cara aceptada, el validador debe aportar una configuración legal completa compatible, contrastable con un verificador independiente. Un solver solo puede generar movimientos después de disponer de ese estado completo.

Si no se verifica una cara, se mostrará su coordenada y estado. Si se demuestra incompatible, se ofrecerá una alternativa de colores que deberá revisar el usuario; nunca se modificará el patrón silenciosamente. Un fallo de tiempo de cálculo no se etiquetará como imposibilidad física.

No se requieren movimientos en el MVP visual. La guía de colores por sí sola presupone conocimientos de montaje; esta limitación debe ser visible.

## 8. Requisitos no funcionales

- RNF-01 Privacidad: procesar imágenes en el navegador; sin envíos de imágenes, analítica ni llamadas a IA en el MVP.
- RNF-02 Accesibilidad: controles por teclado, foco visible, etiquetas y códigos junto al color en la guía.
- RNF-03 Compatibilidad propuesta: navegadores de escritorio Chrome y Firefox actuales al ejecutar la entrega; registrar versiones verificadas.
- RNF-04 Límites iniciales propuestos: 20 MiB por archivo, 25 megapíxeles decodificados y 2.500 cubos; comprobar dimensiones antes de reservar grandes búferes cuando sea posible. Son límites de producto provisionales, no mediciones.
- RNF-05 Rendimiento objetivo: regenerar 900 cubos (90×90 celdas en disposición 30×30) en menos de un segundo tras decodificar, sobre un equipo de referencia que deberá documentarse. Medir antes de prometerlo; evaluar Web Worker si bloquea la interacción.
- RNF-06 Mantenibilidad: motor puro separado de interfaz, tipos explícitos, pruebas de invariantes y formato de proyecto versionado.
- RNF-07 Fidelidad: exportar e importar no cambia dimensiones, códigos ni orden de la matriz.

## 9. Arquitectura y contrato inicial propuestos

Web de escritorio, TypeScript y motor de imagen basado en Canvas. React y Vite son una opción propuesta para la interfaz, pendiente de confirmar el entorno. No se requiere un modelo generativo, una API de IA ni una base de datos para convertir las imágenes.

Módulos: entrada/recorte, motor de conversión, configuración geométrica, vista/guía y exportación. El validador físico tendrá una interfaz independiente.

Proyecto JSON v1: schemaVersion, engineVersion, cubeSize=3, availableCubes, cubeColumns, cubeRows, palette[{id,hex}], settings, pixels[fila][columna], physicalValidation. Coordenadas de datos base cero, coordenadas de guía base uno; origen arriba izquierda, lectura por filas. Estado físico inicial: unchecked. La validación de entrada comprueba tipos, límites, dimensiones y códigos; rechaza versiones no soportadas.

Cada bloque (f,c) contiene pixels[3f+i][3c+j], con i,j entre 0 y 2. Los porcentajes de uso de color describen la imagen visible y no necesidades de pegatinas separadas.

## 10. Plan de delegación

Tú decides el objetivo, revisas los resultados visuales y priorizas. El agente coordinador mantiene requisitos, divide trabajo, revisa contratos e integra. Cada agente ejecutor recibe una tarea pequeña y verificable.

| Ticket | Resultado y aceptación | Dependencias |
|---|---|---|
| T0 · Acordar entorno | Repositorio accesible, comandos reales de arranque/verificación documentados y reglas de trabajo | Elección del usuario |
| T1 · Contratos | Tipos de proyecto, paleta, geometría y ejemplos 9/10/12 cubos validados | T0 |
| T2 · Motor | Funciones de reducción, cuantización y dithering; casos deterministas e invariantes de tamaño/paleta | T1 |
| T3 · Interfaz | Carga, inventario, recorte, ajustes y comparación usando motor simulado inicialmente | T1; integrar T2 al finalizar |
| T4 · Guía/exportación | PNG y JSON; ida/vuelta exacta de matriz; bloques orientados correctamente | T1, T2 |
| T5 · Revisión de entrega | Recorrido completo con nueve cubos, errores, teclado y límites; evidencias y defectos | T2, T3, T4 |
| T6 · Viabilidad física | Conclusiones demostradas, casos legales/no comprobados y contrato de verificación | T1; bloquea la promesa de montaje validado |

T2 y T3 pueden hacerse en paralelo tras fijar T1. Al comenzar, es suficiente un ejecutor y un revisor; añadir agentes solo cuando existan tareas independientes. Este documento prepara la delegación; todavía no se han lanzado agentes ni creado issues remotos.

Plantilla de encargo: objetivo; requisitos por ID; entradas/salidas; archivos propios; dependencias; exclusiones; criterios de aceptación; pruebas necesarias; formato de informe. Cada cierre debe indicar cambios, comprobaciones ejecutadas, resultado y limitaciones. Un segundo agente revisa las invariantes antes de integrar.

## 11. Configuración de colaboración

Para empezar en esta conversación no necesitas instalar nada. Mantendremos español, explicaciones breves, decisiones documentadas y una entrega pequeña cada vez. Se avanzará con supuestos reversibles explícitos, consultando decisiones que cambien producto o arquitectura.

En un repositorio, incorporar un AGENTS.md breve con estas reglas propuestas:

1. Leer el ERS y citar IDs de requisitos en cada tarea.
2. Diferenciar confirmado, propuesto y pendiente. No añadir funcionalidades ajenas al ticket.
3. Mantener motor determinista, seis códigos de color y dimensiones múltiplos de tres.
4. No enviar imágenes fuera del dispositivo en el MVP.
5. Acordar contratos antes de paralelizar y asignar archivos para evitar ediciones simultáneas.
6. Ejecutar los comandos reales de verificación documentados y comunicar fallos sin inventar resultados.
7. Explicar brevemente qué cambió y cómo comprobarlo.

AGENTS.md contiene normas del proyecto. Una skill añade un procedimiento reutilizable. Un agente es quien realiza una tarea. No son tres nombres para lo mismo.

## 12. Ponytail y posible Caveman

Se ha localizado el proyecto https://github.com/DietrichGebert/ponytail. Su README ofrece instalación para Codex y otros agentes; debe revisarse en la versión que se vaya a instalar, especialmente scripts y hooks. No está instalado en esta sesión.

«Cabeman» podría referirse a «Caveman», mencionado en referencias de este ecosistema, pero falta confirmar la fuente exacta. No se da por identificado ni instalado. Si su finalidad es acortar respuestas, se evaluará si ayuda al aprendizaje; las instrucciones de explicar decisiones en español tendrán prioridad.

Para Codex con descubrimiento local, la documentación oficial describe .agents/skills/<nombre>/SKILL.md para skills del repositorio. En ChatGPT Work no debe suponerse que copiar una carpeta local instale una skill en la cuenta. Primero hay que elegir dónde desarrollar. No se ejecutarán instrucciones de Claude Code en Codex ni al revés.

## 13. Decisiones abiertas y siguiente entrega

1. Entorno: seguir construyendo aquí, o repositorio local con Codex/IDE; sistema operativo si se elige local.
2. Confirmar cubos estándar 3×3 girables, sin recolocar pegatinas.
3. Confirmar el MVP visual como primera entrega y la validación física como siguiente puerta de calidad.
4. Confirmar la referencia exacta de Caveman y si se desea instalar Ponytail tras revisarlo.

Siguiente entrega propuesta: cerrar estas decisiones, convertir este borrador en ERS v0.2, establecer repositorio y AGENTS.md, y ejecutar T1. El primer incremento visible será cargar una imagen y obtener 9×9 casillas con nueve cubos.

## 14. Fuentes de configuración consultadas

- OpenAI, instrucciones AGENTS.md: https://learn.chatgpt.com/docs/agent-configuration/agents-md
- OpenAI, skills y descubrimiento local: https://learn.chatgpt.com/docs/build-skills
- Ponytail, fuente del proyecto: https://github.com/DietrichGebert/ponytail

Las decisiones de producto y de algoritmo de este ERS son propuestas del proyecto; no se presentan como recomendaciones de esas fuentes.
