---
name: anti-vibecoded
description: >
  Evita patrones visuales genéricos “vibecoded” en interfaces de ESU (Ecosistema de Salud Unificado) y fuerza decisiones de UI clínicas, accesibles y profesionales.
  Trigger: usar cuando se diseñe, edite o revise UI/UX (componentes, pantallas, modales, cards, tablas, estados, microcopy visual).
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.2"
---

# Anti Vibecoded (Ecosistema de Salud Unificado - ESU)

> [!IMPORTANT]
> Es OBLIGATORIO cargar, leer y consultar la skill `anti-vibecoded` antes de realizar cualquier cambio, adición o revisión de código en la interfaz de usuario (frontend) del repositorio.

## Cuándo usar

- Cambios en UI/UX del portal público, asistente de turnos, padrón de pacientes, historias clínicas o paneles de profesionales/recepción.
- Refactors visuales de cards, tablas médicas, badges de estado, iconografía, colores o jerarquía.
- Revisión de PRs donde la UI se vea genérica, tipo plantilla SaaS deslavada o "vibecoded".

## Reglas críticas (MUST)

1. **Prohibido `border-l-*` decorativo en cards.** Extensión: Prohibido simular bordes coloreados de un solo lado mediante elementos internos posicionados absolutamente (ej: `<div className="absolute left-0 top-0 bottom-0 w-1 bg-[...]">`) o pseudo-elementos (`after:border-l-*`). Si se necesita indicar estado (ej. turno confirmado o pendiente), usar un indicador funcional integrado como un badge sólido con texto explícito o contraste tipográfico.
2. **Prohibido `Sparkles` y clichés decorativos de IA.** Los iconos deben ser funcionales y representar atributos reales del dominio médico (Stethoscope, Calendar, User, FileText, Clock, AlertTriangle, ShieldCheck).
3. **Prohibido gradiente genérico `from-blue-* to-purple-*` en superficies principales.**
4. **Todo ícono debe representar acción o dato de negocio (nada decorativo).**
5. **No usar badges/chips flotantes sin función operativa ni texto de marketing trillado.**
6. **Sistema de Color Clínico y Coherente:** Usar la paleta semántica oficial de ESU:
   - Primario / Acción: Azul Institucional (`sky-600` / `sky-700`).
   - Activo / Confirmado: Verde Clínico (`emerald-700` text-white).
   - Pendiente / Alerta: Ámbar (`amber-600` text-white).
   - Cancelado / Error: Rojo Clínico (`rose-700` text-white).
   - Superficies: Neutros limpios (`slate-50`, `slate-100`, `white`, `slate-900`).
7. **Prohibido encajonar contenidos principales en tarjetas blancas flotantes rígidas sobre fondos grises saturados.** El contenido debe fluir integrado con superficies neutras limpias.
8. **Los íconos encerrados en contenedores de fondo con colores pasteles o de estados suaves (ej. `bg-blue-50`, `bg-yellow-100`) son un antipatrón vibecoded trillado.** Renderizar el ícono solo, con su color semántico directo y sin fondo decorativo artificial.
9. **REGLA DE BADGES SÓLIDOS (MANDATORIA):** Todos los badges e insignias DEBEN tener fondo 100% SÓLIDO y opaco con texto de máximo contraste (ej: `bg-emerald-700 text-white font-bold`, `bg-rose-700 text-white font-bold`, `bg-amber-600 text-white font-bold`, `bg-slate-800 text-white`). Está ESTRICTAMENTE PROHIBIDO usar fondos pastel (ej. `bg-amber-100`, `bg-blue-50`, `bg-red-50`), colores deslavados o clases semi-transparentes/opacidades (`bg-opacity-*`, `bg-emerald-500/10`).
10. **Prohibido glassmorphism decorativo (`backdrop-filter: blur()`) sin propósito funcional real.** El blur solo se justifica en capas superpuestas reales (navbar fijo al hacer scroll, backdrop de modal).
11. **Prohibido gradient text en métricas, títulos o cualquier elemento textual.** Usar colores sólidos de alto contraste.
12. **Prohibido paletas neón y combinaciones cyan-on-dark (`text-cyan-400` sobre `bg-slate-900`).** ESU es un sistema de salud que requiere seriedad institucional y alta legibilidad.
13. **Prohibido usar emojis como iconos de navegación o bullets de listas.** Usar siempre iconos Lucide consistentes.
14. **Prohibido botones con gradiente (`bg-gradient-to-r`).** Los botones de acción deben ser sólidos con hover sutil por oscurecimiento.
15. **Prohibido el hero layout predecible de IA (badge → h1 → 2 CTAs → 3-column features).** En ESU el portal público se centra en el buscador rápido de turnos y especialidades.
16. **Accesibilidad Obligatoria (WCAG 2.1 AA):** Todo texto debe superar un ratio de contraste mínimo de 4.5:1 respecto a su fondo. Estados interactivos (`:focus-visible`) nítidos y evidentes para navegación por teclado.