# Acuerdos de trabajo

## Contexto

Lee README.md y los requisitos relevantes de docs/ERS.md antes de modificar el proyecto. El ERS es un borrador: diferencia requisitos confirmados de propuestas. Para cambios de interfaz, consulta docs/UI.md. La comunicación con el propietario será en español y explicará brevemente las decisiones para facilitar el aprendizaje.

## Invariantes del producto

- Cada cubo estándar 3×3 aporta un bloque visible de nueve casillas.
- Con C columnas y F filas de cubos, la matriz mide 3C columnas por 3F filas; C×F no supera el inventario.
- Las casillas solo usan rojo, verde, amarillo, azul, blanco y naranja. No impongas cuotas globales iguales de color.
- El procesamiento de imagen del MVP se realiza en el navegador, sin enviar imágenes a servicios externos.
- La misma entrada decodificada, parámetros y versión del motor deben producir el mismo patrón.
- Un patrón visual no equivale a un montaje físico validado. No declares realizable una cara sin verificación.

## Implementación y alcance

- Trabaja en una rama y prepara cambios pequeños con referencia a los requisitos aplicables.
- Separa el motor de conversión de la interfaz. Acuerda tipos y contratos antes de repartir tareas.
- Usa primero las capacidades de la plataforma y las dependencias existentes. Justifica cualquier dependencia nueva.
- Mantén los cambios dentro de la tarea. Documenta supuestos reversibles y consulta decisiones que cambien el alcance o la arquitectura.
- No instales skills, plugins ni hooks ajenos al ticket. Al incorporar terceros, revisa fuente, licencia, versión y dependencias; registra lo incorporado en docs/AI-SETUP.md.
- Si se autoriza trabajo paralelo, asigna entregables y archivos para evitar ediciones simultáneas. No añadas una orquestación compleja sin necesidad.

## Verificación y revisión

- Ejecuta las comprobaciones documentadas y apropiadas al cambio. No inventes comandos, resultados ni pruebas de una aplicación que todavía no existe.
- Para el motor, verifica geometría, paleta, determinismo y exportación/importación cuando se implementen.
- Para la interfaz, comprueba teclado, foco, estados de error, dimensiones móviles y fidelidad de la cuadrícula; documenta el navegador y las comprobaciones realmente ejecutadas.
- En la PR explica el problema, el resultado, la validación y las limitaciones. El propietario revisa e integra las PR; no hagas merge salvo petición explícita.
- No publiques credenciales, archivos .env ni imágenes personales de ejemplo en el repositorio.

## Estado técnico actual

Este repositorio contiene documentación, sin aplicación ni dependencias. Todavía no hay comandos de build, lint o test. Añádelos y actualiza esta sección en la PR que configure la base técnica.
