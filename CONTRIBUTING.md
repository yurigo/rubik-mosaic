# Colaboración y revisión

## Trabajar por entregas

1. Seleccionar una tarea del ERS y escribir su criterio de aceptación.
2. Crear una rama desde la rama principal actual (`master`).
3. Modificar solo lo necesario para la tarea y ejecutar las comprobaciones disponibles.
4. Crear commits explicativos y abrir una pull request contra `master`.
5. El propietario revisa el resultado, pide cambios y hace merge cuando lo considera listo.

No es necesario activar múltiples agentes para empezar. Un implementador y una revisión enfocada bastan; repartir motor e interfaz tiene sentido después de acordar sus contratos.

## Plantilla de tarea para un agente

- Objetivo y requisitos del ERS por ID.
- Entradas y salidas esperadas.
- Archivos o módulos asignados.
- Dependencias y límites del alcance.
- Criterios de aceptación y comprobaciones necesarias.
- Informe de cierre: cambios, comprobaciones realmente ejecutadas, resultados y limitaciones.

## Qué revisar en una PR

- Leer la descripción para entender el cambio antes de mirar los archivos.
- Consultar Files changed y comprobar que el alcance corresponde con la tarea.
- Probar el recorrido descrito cuando exista una aplicación.
- Revisar errores, límites, uso de datos y resultados de comprobaciones.
- Pedir explicaciones o correcciones antes del merge si algo no se entiende.

Una aprobación de revisión y un merge son acciones distintas. Al ser autor de tus propias PR, GitHub puede impedir que te des una aprobación formal; aun así puedes inspeccionarlas y hacer merge si las reglas del repositorio lo permiten.

## Verificación actual

Esta entrega solo contiene Markdown. Revisar enlaces relativos y coherencia con el ERS; no hay pruebas de aplicación. No se ha configurado protección de ramas, CI ni revisión automática.
