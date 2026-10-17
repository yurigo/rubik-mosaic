# Rubik Mosaic

Convierte una imagen en un patrón de seis colores para preparar un mosaico con caras de cubos Rubik 3×3.

**Estado:** especificación inicial; todavía no existe una aplicación ejecutable. La viabilidad física de los patrones debe verificarse antes de prometer montaje mediante giros.

Ejemplo: nueve cubos dispuestos en 3×3 producen una imagen de 9×9 casillas (81 píxeles). Cada cubo aporta nueve casillas visibles.

## Documentación

- [ERS v0.1](docs/ERS.md): requisitos confirmados, propuestas y criterios de aceptación.
- [Reglas para agentes](AGENTS.md): acuerdos de trabajo del repositorio.
- [Cómo colaborar y revisar PR](CONTRIBUTING.md).
- [Skills, instrucciones y plugins](docs/AI-SETUP.md): diferencias y configuración.
- [Dirección visual inicial](docs/UI.md): propuesta de experiencia y criterios de revisión.

## Primera entrega prevista

Configurar inventario y disposición de cubos, cargar una imagen y mostrar el patrón en la resolución correspondiente. El alcance completo del MVP visual está en el ERS; no todo se implementará en una sola PR.

React, TypeScript y Vite son una propuesta pendiente de concretar. Los comandos de instalación, ejecución y pruebas se añadirán cuando exista la base técnica; por ahora no hay dependencias ni comandos de aplicación.

## Flujo de trabajo

Una tarea pequeña → una rama → implementación y comprobaciones → pull request → revisión del propietario → merge. La rama principal actual es `master`.
