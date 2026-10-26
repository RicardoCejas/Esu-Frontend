# Ideas y alcance pendiente — Ecosistema de Salud Unificado (ESU)

> Análisis comparativo entre el repositorio fundacional **`vertice-del-olivoo`** (visión y requerimientos originales) y el estado actual de **`Esu-Frontend`** (SPA implementada).
>
> **Objetivo:** dejar registradas todas las ideas de producto que existieron en la etapa inicial del proyecto y que **todavía no están cubiertas** por el frontend actual, para su futura planificación. No es una especificación de interfaz.

---

## 1. Fuentes analizadas

| Fuente | Ubicación | Contenido |
| :--- | :--- | :--- |
| Repo fundacional | `github.com/Martino17x/vertice-del-olivoo` | README, `Ecosistema-Salud.md` (requerimientos), `Ecosistema-salud.html` (proyección), Wiki, Issues #1–#43 |
| Repo actual | `github.com/RicardoCejas/Esu-Frontend` | Código SPA, `docs/architecture`, Issues `HU-01`–`HU-60` |
| Wiki actual | `github.com/RicardoCejas/Esu-Frontend/wiki` | Visión, pilares, arquitectura y modelo de datos |

**Leyenda de estado:** ✅ Implementado · 🟡 Parcial · ⬜ Pendiente

---

## 2. Resumen ejecutivo

El frontend actual cubre con solidez la **Fase 1 (MVP)** del proyecto original: identidad y sesión, turnero online de 5 pasos, agenda médica, atención clínica, recepción/sala de espera, padrón de pacientes, administración de usuarios/especialidades/sedes y el portal público. Las ideas aún no incluidas corresponden mayormente a la **Fase 2 y 3** del roadmap original, más las **integraciones externas** (WhatsApp, farmacias, telemedicina, interoperabilidad).

| Épica | Ideas pendientes | Estado global |
| :--- | :--- | :---: |
| Notificaciones y comunicación | Recordatorios 24 h, WhatsApp API, chatbot | ⬜ |
| Turnos y agenda avanzada | Lista de espera inteligente, duración configurable, bloqueo masivo | ⬜ |
| Identidad y acceso | Google Auth, validación de DNI, registro opcional | ⬜ |
| HCU y documentación clínica | Control de acceso del paciente, auditoría, estudios/DICOM, FHIR | ⬜ |
| Receta y farmacia | Estado "consumida", red de farmacias | 🟡 |
| Facturación y coberturas | Copagos, obras sociales por centro, precios, credenciales | ⬜ |
| Clínica y atención | Derivaciones/interconsultas, telemedicina, IA de triaje | ⬜ |
| Búsqueda y directorio | Filtro por obra social + ubicación, multi-centro, vista consolidada | 🟡 |
| Métricas y dashboards | Ausentismo, ranking, especialidades demandadas, tiempo real | 🟡 |
| Gestión de proyecto (PMI) | Stakeholders, DoD, roles, métricas de proceso | ⬜ |

---

## 3. Detalle por épica

### 3.1 Notificaciones y comunicación

- ⬜ **Recordatorios automáticos 24 h** (email/SMS/WhatsApp) con botones *Confirmar / Cancelar* que actualizan el estado del turno (origen: `US-07`; relacionado con `HU-48` abierto en el repo actual).
- ⬜ **Lista de espera inteligente**: al cancelarse un turno, notificar y reasignar automáticamente a pacientes en espera, liberando el horario en el buscador (origen: requerimiento §4.3).
- ⬜ **Integración WhatsApp API** bidireccional (confirmación/cancelación conversacional) y **Chatbot de turnos** (requerimientos §4.9 y §4.14).
- ⬜ **Notificación al paciente** cuando el profesional cancela o bloquea horarios (origen: `US-06`).
- ⬜ **Alertas de estudios disponibles** (resultados cargados por el centro).

### 3.2 Turnos y agenda (avanzado)

- ⬜ **Duración de turno configurable** por profesional o especialidad (15/30/60 min) con recálculo de disponibilidad (origen: `US-18`).
- ⬜ **Bloqueo masivo de agenda**: rangos de fechas y franjas completas, con alerta si hay turnos existentes (origen: `US-17`, `US-06`).
- ⬜ **Manejo de concurrencia en tiempo real** para evitar doble reserva (origen: `US-02`; hay `HU-47` de prevención de duplicados aún abierta).
- 🟡 **Reprogramación de turnos**: existe reagendamiento/cancelación administrativa en recepción; falta el flujo de autogestión del paciente.
- ⬜ **Profesional multi-centro con agendas independientes** y **vista consolidada** (diaria/semanal) con anti-solapamiento entre centros (origen: `US-11`, `US-21`; modelo de datos §4.4).

### 3.3 Identidad y acceso

- ⬜ **Autenticación federada** (Google Auth / proveedores externos) (origen: `TR-06`, requerimiento §4.1; el "Patient Journey" original la menciona como primer paso).
- ⬜ **Validación de identidad por DNI** (marcada como "futuras versiones" en §4.1).
- ⬜ **Registro opcional de paciente** (acceso sin cuenta para funciones básicas) (origen: requerimiento §3.1 / `HU-13`).
- ✅ Recuperación de contraseña y verificación de email, 2FA/TOTP, refresh tokens, detección de inactividad y sanitización (repo actual, `HU-41`–`HU-44`).

### 3.4 Historia Clínica Única (HCU) y documentación

- ⬜ **Control del paciente sobre el acceso a su HCU**: otorgar/revocar permisos a profesionales, con acceso temporal o permanente y registro de "quién accedió y cuándo" (origen: `US-13`).
- ⬜ **Auditoría de accesos y modificaciones**: logs inmutables consultables por usuario y fecha sobre datos sensibles (origen: `US-15`, perfil ADMIN §3.4). Hoy el panel admin no expone auditoría.
- ⬜ **Gestión de Estudios y Documentación médica**: subida por el centro, formatos **DICOM/PDF/JPG**, almacenamiento en la nube, visualización y descarga por el paciente, organización cronológica (origen: requerimiento §4.6, `US-03`).
- ⬜ **Visor DICOM** en frontend (Cornerstone.js), previews/compresión y eventual servidor DICOM (Orthanc) (origen: documento técnico de stack, §8).
- ⬜ **Interoperabilidad HL7/FHIR** y exportación de datos clínicos en formato estándar (origen: `US-20`, requerimiento §5.2).
- ⬜ **Cifrado fuerte en reposo** de datos sensibles de salud (p. ej. AES-256) (origen: `US-05`, §5.1).
- ✅ Línea de tiempo clínica, registro de evolución firmado, adendas, cierre de consulta, búsqueda CIE-10, prescripción y PDF con QR (repo actual, `HU-49`–`HU-52`).

### 3.5 Receta electrónica y farmacia

- 🟡 **Receta electrónica con firma digital y QR**: la emisión/visor/PDF existe en el frontend actual; falta la validación externa.
- ⬜ **Estado "Consumida"** de la receta al ser validada por la farmacia (origen: `US-04`).
- ⬜ **Módulo de Farmacia**: consulta de disponibilidad de medicamentos e integración con la red de farmacias (origen: requerimiento §4.13).

### 3.6 Facturación y coberturas

- ⬜ **Obras sociales dinámicas por centro**, con sobrescritura/ampliación por profesional y validación de cobertura al reservar (origen: `US-12`, §4.8).
- ⬜ **Cálculo automático de copagos** según el plan de la obra social y el tipo de consulta, mostrando el monto antes de confirmar la atención (origen: `US-10`).
- ⬜ **Configuración de precios** base por centro y por profesional/especialidad (origen: `US-22`).
- ⬜ **Validación de credenciales/carnets digitales** y **comprobante de pago/recepción** (origen: `US-12`, `US-10`).

### 3.7 Clínica y atención

- ⬜ **Derivaciones e interconsultas**: derivar a un paciente a otro especialista con nota, alerta de "Nueva Derivación" y acceso temporal a la HCU del paciente derivado (origen: `US-09`, §4.11).
- ⬜ **Telemedicina**: videoconsultas encriptadas y agenda de consultas virtuales (origen: requerimiento §4.12; destacado en `Ecosistema-salud.html`).
- ⬜ **IA para triaje**: asistente que evalúa síntomas y orienta a la especialidad correcta al reservar (origen: `Ecosistema-salud.html`).

### 3.8 Búsqueda y directorio

- 🟡 **Filtro por obra social + ubicación geográfica**: existe un mapa de Cruz del Eje y filtros por especialidad, pero no el filtro combinado obra social / geolocalización con resultados dinámicos (origen: `US-01`).
- ⬜ **Actualización dinámica por debounce** y resultados reactivos por movimiento del mapa (origen: `US-01`, "Notas técnicas").
- ✅ Buscadores por especialidad, profesionales y pacientes (DNI/apellido) ya implementados (repo actual).

### 3.9 Métricas y dashboards

- 🟡 **Dashboard de métricas de gestión**: existe panel administrativo con reportes CSV, pero faltan métricas específicas de:
  - ⬜ Tasa de ausentismo / no-show y tiempos de espera (`US-08`).
  - ⬜ Especialidades más demandadas y **ranking de profesionales** (§4.10).
  - ⬜ Volumen de pacientes por centro y actualización casi en tiempo real (§4.10).
- ⬜ **Métricas acotadas para profesionales** (solo sus propios datos) (§4.10).

### 3.10 Gestión de proyecto (PMI) documentada en el repo fundacional

Estos artefactos existían como issues del repo original y conviene recuperarlos como documentación viva:

- ⬜ **Mapa de Stakeholders** (`TR-19`).
- ⬜ **Definition of Done (DoD)** (`TR-15`).
- ⬜ **Roles y responsabilidades del equipo** (`TR-23`).
- ⬜ **Políticas de control de versiones / GitFlow** (`TR-21`).
- ⬜ **Métricas de seguimiento del proyecto** (`TR-12`).
- ⬜ **Wiki técnica + guía de instalación del entorno** (`TR-04`).

---

## 4. Discrepancias de arquitectura y stack

El repositorio fundacional planteaba un stack **BaaS/Node**; el proyecto actual adoptó **Java + Spring Boot + MySQL**. Al documentar, conviene unificar el criterio:

| Capa | Fundacional (`vertice-del-olivoo`) | Actual (`Esu-Frontend` / wiki) |
| :--- | :--- | :--- |
| Frontend | React + Vite + Tailwind + TS | React 19 + Vite + Tailwind + TS ✅ |
| Backend | Node.js + Express / Supabase | Java + Spring Boot ✅ |
| Base de datos | PostgreSQL (Supabase) + Prisma | MySQL + JPA/Hibernate ✅ |
| Autenticación | Supabase Auth (email + Google) | Spring Security + JWT |
| Almacenamiento | Cloudflare R2 / AWS S3 | (pendiente definir) |
| Imágenes médicas | Cornerstone.js + servidor DICOM | (pendiente) |
| Interoperabilidad | HL7/FHIR | (pendiente, mencionado en objetivos) |

> **Acción sugerida:** consolidar en la wiki una única fuente de verdad del stack vigente y marcar explícitamente como "descartado" el enfoque Supabase/Prisma, para evitar requisitos incompatibles en el futuro.

---

## 5. Trazabilidad con el repositorio fundacional

| Idea | Origen |
| :--- | :--- |
| Filtro obra social + ubicación / mapa | `US-01`, `HU-15` (repo fundacional) |
| Reserva con confirmación por email | `US-02` |
| Estudios/archivos (PDF/DICOM) | `US-03`, §4.6 |
| Receta QR + estado "consumida" | `US-04` |
| HCU con alergias destacadas | `US-05` |
| Agenda + bloqueo de horarios | `US-06`, `US-17` |
| Notificaciones anti no-show (24 h) | `US-07` |
| Métricas de ausentismo | `US-08`, §4.10 |
| Derivaciones e interconsultas | `US-09`, §4.11 |
| Copagos automáticos | `US-10` |
| Multi-centro / vista consolidada | `US-11`, `US-21` |
| Obras sociales por centro | `US-12` |
| Control de acceso del paciente a HCU | `US-13` |
| Auditoría de accesos | `US-15` |
| Duración de turnos configurable | `US-18` |
| FHIR / interoperabilidad | `US-20`, §5.2 |
| Precios por consulta | `US-22` |
| Telemedicina | §4.12, `Ecosistema-salud.html` |
| Módulo de farmacia | §4.13 |
| Chatbot de turnos / IA de triaje | §4.14, `Ecosistema-salud.html` |
| Google Auth | §4.1, `TR-06` |
| Artefactos PMI (DoD, roles, stakeholders) | `TR-12`, `TR-15`, `TR-19`, `TR-21`, `TR-23` |
