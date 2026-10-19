# Rubik Mosaic

Editor web para convertir imágenes en mosaicos de seis colores, organizados en caras de cubos Rubik 3×3.

**Ejemplo:** nueve cubos colocados en 3×3 forman una imagen de 9×9 casillas (81 píxeles).

## Estado

Primera iteración del editor: carga local de JPG/PNG/WebP, inventario y disposición de cubos, recorte con ampliación y posición, conversión a seis colores, dithering configurable y comparación de imágenes. Incluye un paisaje de ejemplo para probar sin subir archivos.

El patrón todavía no valida el montaje físico. Brillo/contraste, zoom de inspección, guía por cubos y exportaciones quedan pendientes.

## Desarrollo y comprobaciones

Requiere Node.js 24 y npm. Las dependencias están fijadas en `package-lock.json`.

```sh
npm ci
npm run dev
```

| Comando | Función |
|---|---|
| `npm test` | Pruebas del motor: geometría, recorte, reducción, paleta y dithering |
| `npm run typecheck` | Comprobación de tipos de TypeScript y componentes Vue |
| `npm run build` | Comprueba tipos y genera `dist/` |
| `npm run preview` | Sirve el resultado de la compilación |

GitHub Actions ejecuta pruebas y build en las PR y al actualizar `master`.

## Tecnología

Vue 3, TypeScript y Vite. Componentes `.vue` con templates y procesamiento de imagen en el navegador. El motor de conversión será independiente de Vue. Véanse las decisiones y límites en [arquitectura](docs/architecture.md).

## Documentación

- [Requisitos y criterios de aceptación](docs/requirements.md).
- [Arquitectura y plan de implementación](docs/architecture.md).
- [Diseño de la interfaz](docs/design.md).
- [Instrucciones para agentes](AGENTS.md).

## Despliegue en Vercel

Importar este repositorio en un proyecto de Vercel con la integración de GitHub. Configuración: framework **Vite**, directorio raíz **`.`**, instalación **`npm ci`**, build **`npm run build`**, salida **`dist`** y Node.js **24.x**. No requiere variables de entorno.

Mantener **`master`** como rama de producción. La integración genera previews de las ramas/PR y publica producción cuando se actualiza `master`. Vercel construye y despliega; GitHub Actions ejecuta las pruebas del proyecto por separado.

Para probar una rama que ya existía al conectar Vercel, usar **Deployments → Create Deployment** e indicar su nombre. Si `master` aún contiene solo documentación, su primer despliegue no podrá compilar la aplicación hasta integrar la primera PR de código; la rama de la PR sí contiene la aplicación.

Documentación del proveedor: [GitHub y previews](https://vercel.com/docs/git/vercel-for-github), [despliegue por referencia Git](https://vercel.com/docs/git).

## Mosaicos LEGO

Selecciona plate 3024, tile cuadrada 3070 o tile redonda 98138, introduce ancho y alto en piezas y marca los colores de tu caja. El editor genera el patrón con esa selección y muestra las piezas necesarias por color. Una pieza equivale a un píxel; no hay límites de cantidad por color. [Fuentes y actualización de paletas](docs/lego-palette.md).

### Correcciones por zonas

En «Dirige los colores», activa «Seleccionar una zona» y toca la imagen original. Ajusta la tolerancia, elige un color disponible y aplica la regla. La marca turquesa permite revisar la selección; Ver zona y Eliminar gestionan las reglas guardadas durante la sesión. Con teclado, enfoca la imagen, mueve la cruz con las flechas y pulsa Intro o Espacio.

Las reglas siguen a la imagen al cambiar el encuadre. Una casilla se fuerza si al menos la mitad de su área pertenece a la zona; un detalle pequeño puede requerir más piezas o un recorte más cercano. Los colores retirados de la paleta suspenden sus reglas. Cargar otra imagen limpia las reglas; no se guardan entre recargas.

## Recorte y tamaño

«Recortar imagen» permite ajustar un rectángulo libre o con proporción fija sin modificar el original. «Tengo estas piezas» calcula una disposición con el presupuesto disponible; «Quiero este tamaño» calcula cuántas piezas necesitas para las columnas y filas elegidas. El bloqueo de proporción enlaza ambos ejes. Zoom, arrastre y reglas de color siguen funcionando dentro del recorte aplicado.
