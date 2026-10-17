# Instrucciones del proyecto

- Consulta [requisitos](docs/requirements.md) y [arquitectura](docs/architecture.md) para la tarea; consulta [diseño](docs/design.md) cuando cambies la interfaz. Conserva los IDs de los requisitos.
- Usa Vue 3, TypeScript y Vite. Escribe componentes `.vue` con `<template>` y `<script setup lang="ts">`. No introduzcas React ni JSX/TSX.
- Prioriza código legible, inferencia de tipos y contratos pequeños. Evita anotaciones redundantes, abstracciones y dependencias sin una necesidad concreta.
- Mantén el motor de imagen independiente de Vue y del DOM. El MVP procesa las imágenes en el navegador.
- Respeta la geometría y la paleta del ERS. No presentes un patrón visual como físicamente validado sin comprobarlo.
- Trabaja en ramas y PR pequeñas. Antes de retomar una PR, consulta su estado y los comentarios publicados; no sobrescribas cambios ajenos. El propietario integra salvo que pida expresamente hacer merge.
- Verifica los comportamientos afectados y comunica qué se comprobó y qué quedó pendiente. En cambios visuales, inspecciona también el resultado en pantalla.
- Mantén la documentación centrada en producto, implementación y mantenimiento. Actualiza la decisión afectada sin copiar conversaciones, tutoriales generales ni preferencias ajenas al proyecto.
- No publiques secretos ni imágenes personales. No añadas herramientas externas que la tarea no necesite.
- Comunica cambios y decisiones en español.

## Comandos

Todavía no hay aplicación ni comandos de build, lint o test. La PR de inicialización debe definirlos en el README y actualizar esta sección.
