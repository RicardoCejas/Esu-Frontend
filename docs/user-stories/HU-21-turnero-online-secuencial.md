# HU-21: Wizard / Stepper de Reserva de Turnos Online de 5 Pasos (Cruz del Eje)

* **Código:** HU-21 (Actualización y Ampliación de Alcance Oficial)
* **Módulo:** `appointments` (Turnero Online / Portal Público de Salud)
* **Épica:** Ecosistema de Salud Unificado (ESU) · Red Asistencial Cruz del Eje, Córdoba
* **Estado:** Implementado / Completado en Frontend

---

## 1. Descripción de la Historia de Usuario

* **Como** paciente, ciudadano o personal de recepción médica de Cruz del Eje,
* **Quiero** agendar y reservar turnos médicos a través de un asistente secuencial progresivo de 5 pasos acoplado a la institución de salud,
* **Para** garantizar la selección precisa del centro médico o consultorio, la especialidad clínica habilitada, el médico tratante con matrícula provincial, la fecha y franja horaria real disponible, y obtener un comprobante imprimible con código único de reserva y verificación QR.

---

## 2. Flujo Canónico de 5 Pasos (Arquitectura de Decisión Única)

A diferencia de interfaces monolíticas que sobrecargan la atención del paciente, este turnero aplica el principio de **Divulgación Progresiva** (Nielsen Heuristics) y la ley de **"Don't Make Me Think"** (Steve Krug):

```
┌─────────────────────────┐
│   Selector Geográfico   │ ──► [Cruz del Eje, Córdoba] (Contexto Global)
└─────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│ Paso 1: Centro de Salud │ ──► Selección de Hospital, Clínica, CAPS o Consultorio
└─────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│  Paso 2: Especialidad   │ ──► Especialidades activas en el centro seleccionado
└─────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│   Paso 3: Profesional   │ ──► Médicos matriculados (MP) con agenda en el centro
└─────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│ Paso 4: Fecha y Horario │ ──► Selector de día + pastillas de turno mañana/tarde
└─────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│   Paso 5: Confirmación  │ ──► Formulario paciente (DNI/Obra Social) + Ticket QR
└─────────────────────────┘
```

---

## 3. Criterios de Aceptación (DoD - Definition of Done)

### Paso 1: Selección de Centro de Salud o Consultorio Independiente
- [x] Listado de centros médicos radicados en Cruz del Eje (`Hospital Regional Aurelio Crespo`, `Clínica Privada Cruz del Eje`, `CAPS San Cayetano`, `CAPS René Favaloro`, `Consultorios del Valle`).
- [x] Filtros por categoría de institución: *Todos*, *Hospitales*, *Clínicas*, *CAPS*, *Consultorios*.
- [x] Buscador reactivo por nombre, barrio o calle.
- [x] Tarjetas de centro con dirección, teléfono, especialidades activas y metadatos limpios (sin badges vibecoded).

### Paso 2: Selección de Especialidad Médica Habilitada
- [x] Filtro estricto: solo se muestran las especialidades que tienen servicio activo en el centro seleccionado en el Paso 1.
- [x] Buscador de especialidades en tiempo real.
- [x] Tarjetas clínicas con íconos médicos Lucide (`Stethoscope`, `Baby`, `HeartPulse`, `Bone`, `Activity`, `Eye`, `Smile`), descripción breve y conteo de profesionales.
- [x] Botón accesible para retroceder y cambiar de centro médico.

### Paso 3: Selección de Profesional Médico
- [x] Presentación de médicos pertenecientes al centro y especialidad elegidos.
- [x] Tarjeta médica con avatar, nombre completo, Matrícula Provincial (MP), días habituales de atención y fecha del próximo cupo disponible.
- [x] Botón accesible para retroceder y cambiar de especialidad.

### Paso 4: Selección de Fecha y Franja Horaria (Slots)
- [x] Selector horizontal de fechas próximas con día y mes.
- [x] Agrupamiento de horarios en dos bloques clínicos: *Turno Mañana (08:00 a 12:30 hs)* y *Turno Tarde (16:00 a 19:30 hs)*.
- [x] Pastillas interactivas con estados claros: disponible, ocupado (tachado/deshabilitado) y seleccionado (resaltado con anillo).
- [x] **Card de acción destacada al pie**: resumen visible del turno elegido con botón 100% sólido de alto contraste (`Continuar a Confirmación`).

### Paso 5: Datos del Paciente y Emisión de Comprobante
- [x] Tarjeta de resumen general: institución médica, especialidad, profesional, fecha y horario.
- [x] Formulario de filiación del paciente con validaciones de campos requeridos:
  - DNI / Documento (mínimo 7 dígitos).
  - Teléfono celular / WhatsApp de contacto.
  - Nombre(s) y Apellido(s).
  - Correo electrónico.
  - Cobertura médica: desplegable con prepagas y obras sociales de la región (`Particular`, `APROSS`, `PAMI`, `OSDE`, etc.).
  - Número de afiliado.
- [x] Botón CTA de confirmación bloqueado hasta completar los datos obligatorios.
- [x] **Modal Accesible de Comprobante**:
  - Código único alfanumérico de turno (ej. `ESU-CDE-8491`).
  - Representación de código QR para escaneo y validación en recepción.
  - Datos completos de la cita e instrucciones de presentación (15 min antes).
  - Botón para imprimir / exportar comprobante a PDF (`window.print()`).
  - Botón para iniciar un nuevo agendamiento.

### Requisitos Transversales y UX/UI
- [x] **Header Institucional y Selector Multiciudad**: Barra global superior oscura (`bg-slate-900`) con marca ESU, selector de localidad (`Cruz del Eje` por defecto) y accesos rápidos.
- [x] **Fondo General Unificado**: Cero parches o franjas alternadas. Toda la página comparte un fondo limpio continuo (`bg-slate-50`).
- [x] **Cumplimiento Anti-Vibecoded**: Eliminación de badges decorativos o flotantes; jerarquía mediante contraste tipográfico y color semántico.
- [x] **Aprovechamiento del Viewport**: Layout ampliado a `max-w-7xl` con grillas responsivas de 3 a 4 columnas en desktop.
- [x] **Cumplimiento SOLID**: Arquitectura Container-Presentational pura (< 100 líneas por smart component, < 150 líneas por dumb component).

---

## 4. Componentes Frontend Implementados

* **Contenedor Smart**: [`TurneroContainer.tsx`](file:///c:/Users/Martino/Documents/PROGRAMACION%20III/Esu-Frontend/src/features/turnero/TurneroContainer.tsx)
* **Custom Hook**: [`useTurnero.ts`](file:///c:/Users/Martino/Documents/PROGRAMACION%20III/Esu-Frontend/src/features/turnero/hooks/useTurnero.ts)
* **Header Global**: [`AppHeader.tsx`](file:///c:/Users/Martino/Documents/PROGRAMACION%20III/Esu-Frontend/src/components/layout/AppHeader.tsx)
* **Barra de Contexto**: [`TurneroHeader.tsx`](file:///c:/Users/Martino/Documents/PROGRAMACION%20III/Esu-Frontend/src/features/turnero/components/TurneroHeader.tsx)
* **Stepper Progresivo**: [`TurneroStepper.tsx`](file:///c:/Users/Martino/Documents/PROGRAMACION%20III/Esu-Frontend/src/features/turnero/components/TurneroStepper.tsx)
* **Paso 1**: [`Step1CenterSelection.tsx`](file:///c:/Users/Martino/Documents/PROGRAMACION%20III/Esu-Frontend/src/features/turnero/components/Step1CenterSelection.tsx)
* **Paso 2**: [`Step2SpecialtySelection.tsx`](file:///c:/Users/Martino/Documents/PROGRAMACION%20III/Esu-Frontend/src/features/turnero/components/Step2SpecialtySelection.tsx)
* **Paso 3**: [`Step3DoctorSelection.tsx`](file:///c:/Users/Martino/Documents/PROGRAMACION%20III/Esu-Frontend/src/features/turnero/components/Step3DoctorSelection.tsx)
* **Paso 4**: [`Step4DateTimeSelection.tsx`](file:///c:/Users/Martino/Documents/PROGRAMACION%20III/Esu-Frontend/src/features/turnero/components/Step4DateTimeSelection.tsx)
* **Paso 5**: [`Step5PatientConfirmation.tsx`](file:///c:/Users/Martino/Documents/PROGRAMACION%20III/Esu-Frontend/src/features/turnero/components/Step5PatientConfirmation.tsx)
* **Modal Comprobante**: [`AppointmentReceiptModal.tsx`](file:///c:/Users/Martino/Documents/PROGRAMACION%20III/Esu-Frontend/src/features/turnero/components/AppointmentReceiptModal.tsx)

---

## 5. Endpoints Backend Previstos (Spring Boot)

* `GET /api/centros-salud?ciudad=cruz-del-eje`: Listado de centros y prestadores.
* `GET /api/especialidades?centroId={id}`: Especialidades activas por institución.
* `GET /api/profesionales?centroId={id}&especialidadId={id}`: Nómina médica disponible.
* `GET /api/turnos/disponibles?profesionalId={id}&fecha={fecha}`: Cupos libres por franja.
* `POST /api/turnos/crear`: Creación y persistencia del turno con asignación de código.
