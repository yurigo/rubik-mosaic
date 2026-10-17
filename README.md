# Rubik Mosaic

Editor web para convertir imágenes en mosaicos de seis colores, organizados en caras de cubos Rubik 3×3.

**Ejemplo:** nueve cubos colocados en 3×3 forman una imagen de 9×9 casillas (81 píxeles).

## Estado

Especificación inicial. La aplicación todavía no está implementada y no existen comandos de instalación, desarrollo o pruebas.

## Tecnología

Vue 3, TypeScript y Vite. Componentes `.vue` con templates y procesamiento de imagen en el navegador. El motor de conversión será independiente de Vue. Véanse las decisiones y límites en [arquitectura](docs/architecture.md).

## Documentación

- [Requisitos y criterios de aceptación](docs/requirements.md).
- [Arquitectura y plan de implementación](docs/architecture.md).
- [Diseño de la interfaz](docs/design.md).
- [Instrucciones para agentes](AGENTS.md).

## Próximo incremento

Configurar la base técnica y comprobar la geometría del mosaico; después implementar carga de imagen, conversión a seis colores y comparación con/sin dithering. La guía de montaje y las exportaciones se incorporarán en entregas posteriores.
