# Configuración de IA: conceptos y estado real

## Conceptos

| Recurso | Función | Ejemplo en este proyecto |
|---|---|---|
| Instrucciones | Normas que el agente debe respetar en el ámbito correspondiente | AGENTS.md: seis colores y procesamiento local de imágenes |
| Skill | Procedimiento reutilizable, con instrucciones y recursos opcionales | Revisar una interfaz con un método definido |
| Agente personalizado | Perfil para una función, con instrucciones y herramientas según el programa | Revisor de accesibilidad |
| Plugin | Paquete distribuible que puede reunir skills, herramientas y configuración | Integración de GitHub o paquete de productividad |
| Extensión | Ampliación de una aplicación anfitriona concreta | En Awesome Copilot, las Canvas Extensions crean experiencias interactivas para su app |
| Hook | Acción automática ante un evento del ciclo de trabajo | Ejecutar una comprobación en un evento soportado |
| Workflow | Secuencia coordinada de pasos; puede ser instrucciones o automatización ejecutable | Comprobar una PR mediante GitHub Actions cuando se configure |
| Herramienta | Operación que el agente puede ejecutar | Leer un archivo o crear una rama |

El significado exacto y el formato cambian entre productos. Un agente personalizado no equivale necesariamente a otro proceso o subagente ejecutándose en paralelo.

## Archivos de Codex

- `AGENTS.md`, en la raíz: instrucciones del proyecto. Respetar mayúsculas para portabilidad.
- `.agents/skills/<nombre>/SKILL.md`: estructura documentada para skills locales del repositorio en Codex; cada skill tiene su archivo singular SKILL.md con metadatos name y description, y puede incluir scripts, referencias y recursos.
- `.codex/config.toml`: configuración específica de Codex cuando haga falta. No es necesario crearla para que exista el proyecto ni para usar AGENTS.md.
- No existe un requisito de crear un archivo global `skills.md`. Un Markdown cualquiera no se convierte en skill por estar dentro de `.codex`.

La carpeta de skills es una ubicación futura, no un directorio ya creado por esta entrega. Se añadirá cuando haya una skill concreta revisada y útil. Las instrucciones ordinarias permanecen en AGENTS.md y docs/.

## Qué significa instalar

Instalar una skill puede consistir en copiar su carpeta completa a una ubicación reconocida. Un instalador puede automatizar la descarga, ubicación y otras configuraciones; no es lo contrario de copiar archivos. Copiar solo SKILL.md puede dejar fuera recursos necesarios.

Instalar un plugin puede además registrar un paquete, conexiones, herramientas o hooks. Los botones Install pueden abrir enlaces específicos del editor o copiar un comando. Hay que identificar el programa de destino antes de ejecutarlo.

Una skill guardada en un repositorio no queda automáticamente instalada en todas las sesiones de ChatGPT ni en la cuenta del móvil. El entorno ejecutor debe poder descubrirla. La documentación distingue skills locales y skills distribuidas dentro de plugins para las diferentes superficies.

## Copilot y compatibilidad

Awesome Copilot es un catálogo de recursos de GitHub Copilot, no una única skill. Su sección Extensions describe Canvas Extensions para experiencias interactivas de la aplicación Copilot; no es un catálogo exclusivo de skills de diseño de interfaces.

Las skills basadas en el estándar abierto pueden ser reutilizables entre agentes. Hay que revisar rutas, herramientas, scripts, dependencias y referencias específicas de Copilot. Un archivo de agente de Copilot o una extensión de VS Code no se instala en Codex simplemente renombrándolo.

No hay inconveniente en usar recursos de otros ecosistemas cuando ayuden al proyecto y sean compatibles. No se incorporará todo un catálogo para resolver una necesidad puntual de diseño.

## Estado al preparar esta PR

- Repositorio público: yurigo/rubik-mosaic; rama principal master.
- AGENTS.md y documentación propuestos mediante PR.
- Ninguna skill, extensión, plugin ni hook externo instalado en el repositorio.
- Ponytail: el propietario recuerda haberlo instalado en su ordenador; esa instalación no se ha verificado desde esta sesión.
- Caveman: falta confirmar la fuente exacta.
- No hay configuración de Codex adicional ni runtime de aplicación todavía.

## Siguientes pasos

1. Revisar e integrar la PR documental.
2. Acordar la primera propuesta visual, usando docs/UI.md como criterio.
3. Elegir y revisar una candidata de skill de UI si aporta un procedimiento útil; registrar fuente, licencia, versión, dependencias y cómo verificar su activación.
4. Configurar la base técnica con comandos reales y el contrato del motor; comprobar el caso de nueve cubos.
5. Implementar la primera funcionalidad en otra PR pequeña.

## Fuentes consultadas el 17 de octubre de 2026

- https://learn.chatgpt.com/docs/build-skills
- https://learn.chatgpt.com/docs/agent-configuration/agents-md
- https://github.com/github/awesome-copilot
- https://awesome-copilot.github.com/extensions/

Consultar la documentación vigente antes de instalar: las rutas y los comandos de los productos pueden cambiar.
