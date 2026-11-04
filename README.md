# Ecosistema de Salud Unificado (ESU) - Frontend
> Aplicación web SPA (Single Page Application) moderna, reactiva y accesible para la digitalización integral de servicios de salud en Cruz del Eje.

<p align="center">
  <img src="https://img.shields.io/badge/Estado-Operativo_/_Fase_3_Completa-success?style=for-the-badge" alt="Estado">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=for-the-badge&logo=react-query&logoColor=white" alt="React Query">
</p>

---

## Tabla de Contenidos
1. [Visión General del Frontend](#visión-general-del-frontend)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Módulos y Vistas por Rol](#módulos-y-vistas-por-rol)
5. [Seguridad y Control de Sesión](#seguridad-y-control-de-sesión)
6. [Instalación y Ejecución Local](#instalación-y-ejecución-local)
7. [Scripts Disponibles](#scripts-disponibles)
8. [Variables de Entorno](#variables-de-entorno)
9. [Equipo de Desarrollo y Enlaces](#equipo-de-desarrollo)

---

## Visión General del Frontend

El cliente web de **ESU** es una aplicación reactiva desarrollada con **React 19** y **TypeScript**, diseñada para brindar una experiencia de usuario fluida, rápida y accesible tanto a pacientes como al personal de salud y administrativo de Cruz del Eje.

### Aspectos Destacados:
* **Turnero Asistido (Wizard):** Reserva de turnos guiada por pasos interactivos con validación de disponibilidad en tiempo real.
* **Modo Demostración / Offline:** Permite probar el flujo completo de reserva y navegación sin requerir una conexión activa al backend.
* **Directorio Médico con Mapa Interactivo:** Búsqueda geolocalizada de centros de salud y consultorios con renderizado cartográfico mediante **MapLibre GL**.
* **Gestión Hospitalaria Visual:** Panel Kanban de salas de espera para recepción y pantalla pública de llamados (Tótem / Smart TV).
* **Validación de Recetas QR:** Portal especializado para farmacias que permite validar prescripciones médicas escaneando códigos QR o ingresando tokens criptográficos.

---

## Stack Tecnológico

| Herramienta / Librería | Versión | Propósito en el Proyecto |
| :--- | :--- | :--- |
| **React** | `19.x` | Biblioteca base para la construcción de interfaces declarativas. |
| **TypeScript** | `6.x` | Tipado estricto de componentes, esquemas de datos y APIs. |
| **Vite** | `8.x` | Bundler y servidor de desarrollo ultra-rápido con HMR. |
| **Tailwind CSS** | `v4` | Motor de estilos utilitarios modernos y diseño responsivo. |
| **React Router** | `v7` | Enrutamiento declarativo con rutas anidadas y guardias (`AuthGuard`, `RoleGuard`). |
| **TanStack React Query** | `v5` | Gestión de estado asíncrono, almacenamiento en caché e invalidación reactiva. |
| **React Hook Form + Zod** | `7.x` / `3.x` | Manejo de formularios performantes y validación estricta de esquemas en cliente. |
| **MapLibre GL** | `6.x` | Renderizado cartográfico vectorial de centros asistenciales. |
| **Lucide React** | `1.x` | Iconografía accesible y consistente en toda la plataforma. |
| **Axios** | `1.x` | Cliente HTTP con interceptores para inyección automática de tokens JWT y manejo de errores. |

---

## Estructura del Proyecto

El código fuente sigue una arquitectura orientada a características (**Feature-Driven Architecture**):

```text
Frontend/
├── public/                    # Activos estáticos, iconos, logos y workers de mapas
│   ├── centros/               # Imágenes de centros asistenciales
│   ├── especialidades/        # Ilustraciones por especialidad médica
│   └── maplibre-gl-worker.js  # Worker para aceleración de mapas
├── src/
│   ├── api/                   # Clientes Axios y configuración de peticiones
│   ├── components/            # Componentes reutilizables:
│   │   ├── auth/              # ActivityMonitor (inactividad) y guardias
│   │   ├── layout/            # DashboardLayout, Sidebar, Navbar
│   │   ├── notifications/     # Toast notifications y alertas
│   │   └── ui/                # Botones, modales, cards, inputs
│   ├── context/               # Contextos globales (AuthContext, Theme)
│   ├── features/              # Módulos organizados por dominio:
│   │   ├── admin/             # Dashboards, auditoría, gestión de sedes y especialidades
│   │   ├── agenda/            # Agenda médica pública y privada
│   │   ├── auth/              # Login, registro, recuperación y verificación de email
│   │   ├── farmacia/          # Validador y dispensador de recetas digitales por QR
│   │   ├── home/              # Landing page principal
│   │   ├── medico/            # Consulta médica, evolución clínica, adendas y CIE-10
│   │   ├── paciente/          # Portal del paciente, turnos, HCU y recetas
│   │   ├── perfil/            # Gestión de perfil de usuario
│   │   ├── profesionales/     # Directorio y mapa geolocalizado
│   │   ├── recepcion/         # Check-in, salas de espera Kanban y pantalla TV
│   │   └── turnero/           # Asistente por pasos de reserva de turnos
│   ├── hooks/                 # Custom hooks reutilizables y consultas React Query
│   ├── routes/                # Definición de rutas (`AppRoutes`, `AuthGuard`, `RoleGuard`)
│   ├── schemas/               # Esquemas de validación Zod
│   ├── types/                 # Definiciones de tipos e interfaces TypeScript
│   ├── App.tsx                # Raíz de la aplicación
│   └── main.tsx               # Punto de entrada de Vite
├── tests/                     # Suites de pruebas funcionales y de validación
├── package.json               # Dependencias y scripts de ejecución
└── vite.config.ts             # Configuración de compilación Vite y plugins
```

---

## Módulos y Vistas por Rol

### 1. Paciente
* **Reserva de Turnos (`/turnero`):** Wizard interactivo para seleccionar especialidad, profesional, centro, fecha y horario.
* **Mis Turnos (`/dashboard/mis-turnos`):** Visualización de turnos programados, historial y opciones para cancelar o reprogramar.
* **Mi Historial Clínico (`/dashboard/mi-historial`):** Acceso a evoluciones médicas pasadas y registros de atención.
* **Mis Recetas (`/dashboard/mis-recetas`):** Acceso y descarga de recetas digitales con código QR.
* **Centros de Salud (`/dashboard/centros-salud`):** Mapa interactivo de centros médicos cercanos.

### 2. Profesional Médico
* **Agenda Médica (`/dashboard/medico/agenda`):** Vista de calendario con turnos diarios y herramientas para bloquear franjas horarias.
* **Atención y Consulta (`/dashboard/medico/atencion`):** Espacio de trabajo médico para registrar la evolución del paciente, seleccionar diagnósticos **CIE-10**, emitir recetas digitales firmadas y generar solicitudes de estudios.
* **Adendas Médicas:** Sistema de agregados a historias clínicas conforme a la **Ley Nacional 26.529** de inmutabilidad de registros.

### 3. Recepción y Admisión
* **Check-in y Admisión (`/dashboard/recepcion`):** Marcación de arribo de pacientes y asignación de consultorio.
* **Padrón de Pacientes (`/dashboard/recepcion/padron`):** Registro y búsqueda ágil de pacientes por DNI.
* **Salas de Espera Kanban (`/dashboard/recepcion/salas-espera`):** Tablero dinámico con estados: *En Espera*, *En Consulta*, *Finalizado*.
* **Pantalla Pública TV / Tótem (`/pantalla-turnos`):** Vista de alto contraste diseñada para pantallas de sala de espera que anuncia el llamado sonoro/visual del paciente.

### 4. Farmacia
* **Validador de Receta Digital (`/farmacia/validar-receta`):** Escaneo de código QR o ingreso manual de código para verificar autenticidad, vigencia y asentar la dispensa del medicamento.

### 5. Administración
* **Métricas y Ausentismo (`/dashboard/admin/metricas`):** Gráficos y analíticas de ocupación, cancelaciones y ausencias.
* **Gestión Integral (`/dashboard/admin/usuarios`, `/dashboard/admin/sedes`, `/dashboard/admin/especialidades`):** Altas, bajas y modificaciones de la infraestructura del sistema.

---

## Seguridad y Control de Sesión

* **Rutas Protegidas (`AuthGuard`):** Bloqueo automático de acceso a rutas privadas para usuarios no autenticados, redirigiendo a `/login`.
* **Control de Accesos por Rol (`RoleGuard`):** Restricción estricta de navegación según el rol del usuario autenticado (`PACIENTE`, `MEDICO`, `RECEPCIONISTA`, `FARMACIA`, `ADMIN`).
* **Monitor Global de Actividad (`ActivityMonitor`):** Cierre de sesión forzoso y advertencia visual tras periodos prolongados de inactividad, evitando accesos indebidos en terminales hospitalarias.
* **Sanitización de Datos:** Validación de todos los datos de entrada en formularios mediante esquemas de **Zod**.

---

## Instalación y Ejecución Local

### Prerrequisitos
* **Node.js** (v18.0.0 o superior)
* Gestor de paquetes **npm** (v9 o superior)

### Pasos de Instalación
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/RicardoCejas/Esu-Frontend.git
   cd Esu-Frontend
   ```

2. Instalar dependencias del proyecto:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   La aplicación se iniciará en `http://localhost:5173`.

---

## Scripts Disponibles

En el directorio del proyecto puedes ejecutar:

| Comando | Acción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con recarga en caliente (HMR). |
| `npm run build` | Compila TypeScript y empaqueta la aplicación para producción en `dist/`. |
| `npm run preview` | Previsualiza localmente el build de producción. |
| `npm run lint` | Ejecuta ESLint para analizar errores de estilo y buenas prácticas. |
| `npm test` | Ejecuta las pruebas automatizadas del frontend. |

---

## Variables de Entorno

Puedes crear un archivo `.env` en la raíz del frontend para configurar la conexión con la API:

```env
# URL base de la API REST del Backend (Spring Boot)
VITE_API_URL=http://localhost:8080/api

# Modo por defecto (opcional)
VITE_ENABLE_DEV_TOOLS=true
```

---

## Equipo de Desarrollo
* **Martino Costigliolo**
* **Braian Aguilera**
* **Ricardo Cejas**
* **Ana Luz Nieto**
* **Nahuel Aguero**

---

### Enlaces Relacionados
* **Repositorio del Backend:** [GitHub - Esu-Backend](https://github.com/RicardoCejas/Esu-Backend)
* **Gestión del Proyecto (PMI):** [Plan de Proyecto y Acta de Constitución](https://docs.google.com/document/d/1JAX4x0MIplwLKrF0S_HmMbUiuKS_gzoV/edit?usp=drive_link&ouid=110551275600190878595&rtpof=true&sd=true)
* **Documentación Técnica:** [Carpeta Oficial ESU en Google Drive](https://drive.google.com/drive/folders/1Fkj_hzJDNtrR1ZQJit4Ro4zfghxreBYk)
