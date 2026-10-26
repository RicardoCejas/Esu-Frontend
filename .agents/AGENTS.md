# Ecosistema de Salud Unificado (ESU) — Reglas de Desarrollo y Arquitectura para Agentes (SSOT)

Este documento es la **fuente canónica y única de verdad (SSOT)** de directrices, estándares de ingeniería y restricciones operativas para todos los agentes de IA y desarrolladores en el repositorio **Esu-Frontend**. Su cumplimiento es estricto y mandatorio.

---

## 1. Contexto del Proyecto

* **Dominio:** Plataforma integral B2B2C para la modernización, centralización y digitalización de servicios de salud en Cruz del Eje, Córdoba, Argentina.
* **Cliente / Institución:** Centros de Salud, Clínicas y Profesionales Médicos de Cruz del Eje.
* **Actores clave:**
  * **Paciente:** Consulta cartilla médica geolocalizada por especialidad/obra social, reserva, reprograma y cancela turnos en tiempo real, accede a su Historia Clínica Única (HCU) y recetas electrónicas.
  * **Profesional Médico:** Gestiona su agenda diaria/semanal, atiende consultas, carga historias clínicas (HCU), bloquea horarios y emite recetas electrónicas con firma y código QR.
  * **Recepción / Centro Médico:** Coordina la sala de espera, gestiona el padrón asistencial de pacientes, administra la nómina y agendas de profesionales de la institución y reagenda turnos por imprevistos.
  * **Administrador:** Supervisa la plataforma, audita accesos y seguridad, y gestiona el ciclo de vida de usuarios y configuraciones del sistema.

---

## 2. Idioma y Formato de Comunicación

* **Español Rioplatense OBLIGATORIO en Chat:** Toda la comunicación directa con el usuario, explicaciones y razonamientos se redactan en español rioplatense natural (voseo).
* **Artefactos Técnicos en Inglés OBLIGATORIO:** Código fuente, nombres de variables, funciones, interfaces, DTOs, comentarios en código y nombres de archivos deben redactarse estrictamente en inglés. (Excepción explícita: commits, mensajes de push y PRs deben redactarse en español según `git-commit-rules`).

---

## 3. Operaciones Destructivas y Base de Datos (CRÍTICO)

### 3.1 Borrado de Datos y Archivos
* **PROHIBIDO** ejecutar procesos o comandos de borrado destructivo (`DELETE`, `TRUNCATE`, `DROP TABLE`, `Remove-Item -Recurse`, etc.) en la base de datos o en el sistema de archivos sin antes informarle al usuario:
  1. Qué registros o archivos específicos serán eliminados.
  2. Cómo se realizará técnicamente la operación.
  3. Cuál es el impacto exacto y los riesgos asociados.
* **OBLIGATORIO:** Esperar la aprobación explícita y afirmativa del usuario antes de proceder con cualquier borrado. Sin excepciones.

### 3.2 Prohibición de Reversión y Stashing sin Autorización en Git
* **PROHIBIDO** ejecutar comandos destructivos o de ocultamiento en Git sin autorización previa y explícita:
  * Reversión destructiva: `git checkout -- <file>`, `git restore <file>`, `git reset --hard`, `git clean -f`.
  * Manipulación de stash: `git stash`, `git stash pop`, `git stash drop`. Queda terminantemente prohibido hacer stash del trabajo en progreso sin orden explícita del usuario.

---

## 4. Encoding y Escritura Segura de Archivos (CERO Mojibake)

* **UTF-8 sin BOM OBLIGATORIO** para todos los archivos del repositorio (`.ts`, `.tsx`, `.json`, `.css`, `.md`, `.html`).
* **CERO TOLERANCIA a errores de encoding o mojibake** (caracteres corruptos tipo `Ã¡`, `Ã³`, ``).
* **Escritura Segura:** Evitar cmdlets de PowerShell (`Out-File`, `Set-Content`) sin codificación UTF-8 explícita. Preferir herramientas de edición granular/diff o Node.js.

---

## 5. Arquitectura del Ecosistema ESU

El sistema opera bajo una arquitectura cliente-servidor desacoplada:

1. **Frontend (Esu-Frontend):**
   * **Tecnologías:** React 19, TypeScript, Vite, Tailwind CSS.
   * **Modelo de Aplicación:** Single Page Application (SPA) unificada con enrutamiento basado en roles (RBAC).
   * **Ruta local:** `c:\Users\Martino\Documents\PROGRAMACION III\Esu-Frontend`
   * **Repositorio GitHub:** `https://github.com/RicardoCejas/Esu-Frontend.git`
   * **Rama base de integración:** `develop` (con PRs requeridos para integración).

2. **Backend (Esu / API REST):**
   * **Tecnologías:** Java 17, Spring Boot, Spring Security (JWT), JPA / Hibernate, MySQL.
   * **Repositorio GitHub:** `https://github.com/RicardoCejas/Esu.git`
   * **Mandato de Seguridad:** Control de acceso por roles en endpoints (`/api/pacientes/*`, `/api/turnos/*`, `/api/historias-clinicas/*`, `/api/usuarios/*`).

---

## 6. Arquitectura Frontend (React 19 + TypeScript + SOLID)

### 6.1 Layouts y Control de Acceso Basado en Roles (RBAC)
No se dividen aplicaciones separadas: el sistema utiliza un cascarón unificado de navegación:
* **`PublicLayout`:** Portal de bienvenida, información institucional y asistente inicial de turnos.
* **`AuthLayout`:** Pantallas de login, registro de pacientes y recuperación de contraseñas.
* **`DashboardLayout`:** Layout protegido común (Topbar + Sidebar dinámico) que adapta sus opciones, menús y rutas según el rol autenticado (`PACIENTE`, `MEDICO`, `RECEPCIONISTA`, `ADMIN`).

### 6.2 SOLID y Container-Presentational (Cero Monolitos)
Todo componente o vista interactiva que supere ~150 líneas DEBE desacoplarse:
1. **Smart Containers (`< 100 líneas`)**: Componente que orquesta custom hooks, maneja el estado de la vista y distribuye props limpias a subcomponentes.
2. **Custom Hooks (`/hooks`)**: Toda la lógica no visual, data fetching, llamadas a la API de Spring Boot, validaciones y cálculos de agenda DEBE encapsularse en custom hooks. Prohibido mezclar `useEffect` + `useState` dispersos en la vista para fetching.
3. **Dumb Components (`/components` o `/ui`)**: Componentes visuales puros, predecibles y testeables que solo reciben props y disparan callbacks.

### 6.3 Tipado Defensivo y Safe Access (Cero Runtime Crashes)
* **Optional Chaining y Coalescencia Nula Obligatoria:** Todo formateo o acceso a datos de API o props debe usar safe access: `(patient?.dni ?? '')`, `(appointment?.date ?? '')`. Cero tolerancia a `Cannot read properties of undefined`.
* **Límites de Líneas por Archivo:**
  * Páginas / Vistas: máximo 400 líneas.
  * Custom Hooks: máximo 250 líneas.
  * Componentes visuales: máximo 150 líneas.

---

## 7. UI/UX y Sistema de Diseño Clínico Oficial (ESU)

### 7.1 Identidad Visual y Paleta Clínica
* **Azul Institucional Salud (`#0284C7` / `#0369A1`):** Color principal para CTAs de agendamiento, botones de acción primaria e identidad de marca.
* **Verde Clínico / Éxito (`#059669` / `#047857`):** Turnos confirmados, usuarios activos, recetas validadas.
* **Ámbar / Alerta (`#D97706` / `#B45309`):** Turnos pendientes, advertencias de historia clínica, estados en espera.
* **Rojo Clínico / Emergencia (`#DC2626` / `#B91C1C`):** Cancelación de turnos, baja de usuarios, errores y eliminación médica.
* **Neutros Quirúrgicos / Slate (`#F8FAFC`, `#F1F5F9`, `#0F172A`):** Fondos limpios y profesionales que garantizan máxima legibilidad y descanso visual.

### 7.2 Reglas de Interfaz Médica
* **Prohibido `alert()`, `confirm()` y `prompt()`:** Usar modales accesibles del sistema o notificaciones Toast.
* **Scroll Lock Obligatorio:** Al abrir modales o drawers, bloquear el scroll del body (`overflow = 'hidden'`) y restaurarlo al cerrar.
* **Animaciones de Apertura y Cierre OBLIGATORIAS:** Modales y overlays deben contar con transiciones suaves de entrada y salida (*fade-in* / *scale-in*).
* **Jerarquía de Z-Index:** Modales base `z-50`, confirmaciones de eliminación crítica `z-[100]`, toasts `z-[200]`.
* **Cero UI Vibecoded:** Cumplir obligatoriamente con `.agents/skills/anti-vibecoded/SKILL.md`. Badges siempre sólidos con texto de alto contraste.

---

## 8. Skills de Calidad OBLIGATORIAS según Contexto

| Contexto | Skill | ¿Cuándo cargar? (OBLIGATORIO) | Ubicación |
|---|---|---|---|
| **Diseño / Edición UI/UX** | `anti-vibecoded` | **MANDATORIA** antes de crear/editar componentes, tablas, modales o vistas | `.agents/skills/anti-vibecoded/SKILL.md` |
| **Craft Visual y Microinteracciones** | `impeccable` | Al pulir jerarquía visual, espaciados, tipografía y responsive | `.agents/skills/impeccable/SKILL.md` |
| **Aesthetic Anti-Plantilla** | `design-taste-frontend` | Al estructurar páginas, evitando layouts predecibles de IA | `.agents/skills/design-taste-frontend/SKILL.md` |
| **Flujos y Asistentes de Turnos** | `cro` | Al diseñar el wizard por pasos de turnos y formularios clínicos | `.agents/skills/cro/SKILL.md` |
| **SOLID (Principios Generales)** | `solid-principles` | Antes de implementar o refactorizar servicios, módulos o arquitecturas | `.agents/skills/solid-principles/SKILL.md` |
| **Componentes React** | `react-solid-rules` | Al diseñar componentes interactivos, custom hooks y containers | `.agents/skills/solid-rules/SKILL.md` |
| **Animaciones Fluidas** | `gsap-core` / `gsap-scrolltrigger` | Al implementar transiciones de dashboard y reveal de elementos | `.agents/skills/gsap-core/SKILL.md` |
| **Commits y Versionado Git** | `git-commit-rules` | **MANDATORIA** antes de staging y commit | `.agents/skills/git-commit-rules/SKILL.md` |

---

## 9. Gestión de Memoria con Engram

* Toda la persistencia arquitectónica, tracking de decisiones y estado de desarrollo se gestiona mediante **Engram** (`mem_save`, `mem_search`) con topic keys estructurados (`esu/*` o `esu-frontend/*`).
* **Aprobación Humana:** El agente nunca debe auto-aprobar cambios de alcance sin validación del desarrollador.

---

## 10. Convenciones de Git y Commits

* **Inspección Previa:** `git status` y `git diff` obligatorios antes de staging.
* **Staging Granular:** PROHIBIDO `git add .` a ciegas. Seleccionar archivos específicos de la tarea.
* **Conventional Commits en Español:** `<type>(<scope>): <descripción en español>` (ej. `feat(appointments): implementar modal de confirmacion para cancelacion de turnos`).
* **Cero Atribución de IA:** Prohibido `Co-Authored-By` o referencias a asistentes de IA en commits.
