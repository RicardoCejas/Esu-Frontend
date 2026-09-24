# ESU Clinical Design System — Sistema de Diseño Oficial

Este documento define el **Design System oficial del Ecosistema de Salud Unificado (ESU)**, construido sobre **Tailwind CSS + shadcn/ui (Radix UI)**. Su propósito es garantizar una interfaz médica profesional, accesible, de descanso visual y libre de antipatrones genéricos o "vibecoded".

---

## 1. Principios de Diseño Clínico

1. **Claridad y Confianza:** Interfaces limpias, asépticas y funcionales donde la información médica (turnos, historias clínicas, matrículas, recetas) se lea de forma inequívoca.
2. **Cero UI "Vibecoded" (Anti-Slop):** Prohibidos los gradientes de texto de IA, las superficies púrpuras/rosadas decorativas, los bordes unilaterales artificiales (`border-l-*`) y los badges deslavados en pasteles ilegibles.
3. **Accesibilidad Universal (WCAG 2.1 AA):** Contraste mínimo de 4.5:1 en todos los textos, soporte completo de navegación por teclado en modales y selects, y estados `:focus-visible` notorios.
4. **Doble Densidad:**
   - **Baja Densidad (Pacientes / Turnero):** Tarjetas amplias, tipografía grande, proceso guiado paso a paso con mínima fricción cognitiva.
   - **Alta Densidad (Médicos / Recepción):** Tablas paginadas compactas, filtros combinados instantáneos y atajos rápidos para agilizar la atención.

---

## 2. Paleta de Tokens Semánticos (Variables CSS)

Configurados en [`src/index.css`](file:///c:/Users/Martino/Documents/PROGRAMACION%20III/Esu-Frontend/src/index.css) y compatibles con la arquitectura de **shadcn/ui**:

| Token Semántico | Variable CSS | Modo Claro (HSL / HEX) | Modo Oscuro (HSL / HEX) | Aplicación en ESU |
|---|---|---|---|---|
| **Primary** | `--primary` | `200 98% 39%` (`#0284C7`) | `199 89% 48%` (`#0EA5E9`) | Acciones primarias, botones de agendamiento, CTAs |
| **Secondary** | `--secondary` | `210 40% 96%` (`#F1F5F9`) | `217 33% 22%` (`#334155`) | Acciones secundarias, badges neutros, tabs |
| **Success** | `--success` | `160 84% 39%` (`#059669`) | `160 84% 39%` (`#059669`) | Turnos confirmados, usuarios activos, recetas emitidas |
| **Warning** | `--warning` | `38 92% 50%` (`#D97706`) | `38 92% 50%` (`#D97706`) | Turnos pendientes, advertencias de legajo, en espera |
| **Destructive** | `--destructive` | `0 72% 51%` (`#DC2626`) | `0 63% 31%` (`#7F1D1D`) | Cancelación de turnos, baja de usuarios, errores |
| **Background** | `--background` | `210 40% 98%` (`#F8FAFC`) | `222 47% 11%` (`#0F172A`) | Fondo general del viewport |
| **Card / Surface** | `--card` | `0 0% 100%` (`#FFFFFF`) | `217 33% 17%` (`#1E293B`) | Paneles, tarjetas y contenedores de datos |
| **Border / Line** | `--border` | `214 32% 91%` (`#E2E8F0`) | `217 33% 24%` (`#334155`) | Bordes de inputs, tablas y divisiones sutiles |

---

## 3. Tipografía y Jerarquía

* **Fuente Principal (UI & Datos):** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`.
* **Fuente Monoespaciada (DNI, Matrículas, IDs):** `ui-monospace`, `Consolas`, `monospace`.
* **Escala y Pesos:**
  - `text-2xl font-bold tracking-tight text-slate-900`: Títulos principales de páginas.
  - `text-lg font-semibold text-slate-800`: Encabezados de tarjetas y secciones.
  - `text-sm font-medium text-slate-600`: Etiquetas de formulario y datos secundarios.
  - `text-xs font-semibold uppercase tracking-wider text-slate-500`: Cabeceras de tablas clínicas.

---

## 4. Reglas Estrictas de Componentes

### 4.1 Badges de Estado (MANDATORIAMENTE SÓLIDOS)
Queda **estrictamente prohibido** utilizar fondos pastel deslavados o transparencias tipo `bg-emerald-100` o `bg-amber-500/10`. Todos los badges deben ser sólidos con texto de máximo contraste:
- **Confirmado / Activo:** `<span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-700 text-white">Confirmado</span>`
- **Pendiente / En Espera:** `<span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-600 text-white">Pendiente</span>`
- **Cancelado / Inactivo:** `<span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-700 text-white">Cancelado</span>`
- **En Consulta:** `<span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-700 text-white">En Consulta</span>`

### 4.2 Botones de Acción (Button)
- **Primario (Agendamiento/Guardar):** `bg-sky-600 hover:bg-sky-700 text-white shadow-sm font-medium rounded-lg px-4 py-2`
- **Secundario (Volver/Cancelar modal):** `bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg px-4 py-2 border border-slate-300`
- **Destructivo (Dar de Baja/Eliminar):** `bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg px-4 py-2`

### 4.3 Modales y Diálogos (Dialog / Radix UI)
- **Scroll Lock Obligatorio:** Bloquear el scroll del `body` al abrir y restaurarlo al desmontar.
- **Transición Fluida:** Entrada y salida con *fade-in* y *scale-95 to scale-100*.
- **Jerarquía Z-Index:** Base de modales `z-50`, confirmaciones de baja médica `z-[100]`, toasts `z-[200]`.

### 4.4 Tablas Clínicas (Padrón y Agenda)
- Cabecera fija neutra (`bg-slate-50 text-slate-600`).
- Filas con hover sutil (`hover:bg-slate-50/80 transition-colors`).
- Paginación integrada y estado vacío con ilustración/icono descriptivo ante listas vacías.

---

## 5. Utilidad de Fusión de Clases (cn)

Disponible en [`src/lib/utils.ts`](file:///c:/Users/Martino/Documents/PROGRAMACION%20III/Esu-Frontend/src/lib/utils.ts) para resolver colisiones de Tailwind en componentes shadcn:

```typescript
import { cn } from '@/lib/utils'

export const Badge = ({ className, ...props }) => (
  <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold', className)} {...props} />
)
```

---

## 6. Especificación de Flujo UX: Asistente de Turnos (Wizard de 5 Pasos)

El Turnero es la cara visible principal del sistema hacia los ciudadanos de Cruz del Eje. Debe diseñarse bajo el patrón **Stepper interactivo** con bajo esfuerzo cognitivo:

1. **Paso 1 — Centro de Salud o Consultorio Independiente (Cruz del Eje):**
   - Buscador geolocalizado con tarjetas claras.
   - Filtro entre *Centros de Salud / Clínicas* (ej. Clínica Cruz del Eje, Hospital Aurelio Crespo, Sanatorio Privado) y *Profesionales Independientes*.
2. **Paso 2 — Especialidad Médica:**
   - Grilla con tarjetas de especialidades habilitadas en el centro seleccionado (ej. Cardiología, Pediatría, Ginecología).
3. **Paso 3 — Profesional Médico:**
   - Lista de médicos disponibles para esa especialidad dentro de la institución, mostrando matrícula provincial, foto/avatar y días de atención.
4. **Paso 4 — Fecha y Horario (Slots):**
   - Calendario mensual reactivo con indicador de días disponibles.
   - Selector en pastillas sólidas de slots de 15/30 min divididos en turnos Mañana y Tarde.
5. **Paso 5 — Identificación y Confirmación:**
   - Formulario directo (DNI, Nombre Completo, Teléfono, Obra Social).
   - Resumen de la cita y botón CTA principal *"Confirmar Turno"*.
   - Comprobante digital con código QR de verificación de turno y opción de descarga PDF.

