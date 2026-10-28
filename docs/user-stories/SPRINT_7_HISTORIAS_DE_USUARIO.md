# Historias de Usuario - Sprint 7 (Esu Frontend)

* **Proyecto:** Esu Frontend
* **Sprint:** Sprint 7
* **Asignado a:** Ricardo Cejas

---

## HU-73: Portal Paciente: Filtros de Estado de Turnos y Requisitos de Atención Médica

* **Proyecto:** Esu Frontend
* **Sprint:** Sprint 7
* **Asignado a:** Ricardo Cejas

- **Como** paciente registrado en la plataforma,
- **Quiero** clasificar mis citas médicas entre turnos próximos e historial previo, además de conocer los requisitos documentales obligatorios,
- **Para** llevar un control ordenado de mis asistencias pasadas y presentarme a tiempo con la documentación requerida en ventanilla.

### Criterios de Aceptación (DoD)
- [ ] Pestañas de filtrado superior divididas en **Próximos Turnos** (confirmados, pendientes y en espera) e **Historial de Turnos** (atendidos y cancelados), cada una con su contador numérico.
- [ ] Ocultamiento condicional del botón superior derecho `+ Solicitar Nuevo Turno` cuando la lista general esté vacía, delegando la acción al botón principal central del estado vacío.
- [ ] Banner visible y accesible de preparación previa indicando la obligación de concurrir con DNI físico original, credencial de Obra Social o Programa SUMAR, y 15 minutos de anticipación.
- [ ] Estados vacíos contextualizados por pestaña cuando no haya turnos próximos agendados o no se registre historial previo.

---

## HU-74: Portal Paciente: Consulta y Validación de Recetas Electrónicas con Código QR

* **Proyecto:** Esu Frontend
* **Sprint:** Sprint 7
* **Asignado a:** Ricardo Cejas

- **Como** paciente bajo tratamiento médico,
- **Quiero** acceder a mis recetas electrónicas vigentes e historial de prescripciones con código QR,
- **Para** retirar medicamentos en farmacias y dispensarios de la red sanitaria sin necesidad de traslados a buscar órdenes en papel.

### Criterios de Aceptación (DoD)
- [ ] Nueva vista dedicada en `/dashboard/paciente/recetas` accesible desde el menú lateral del paciente.
- [ ] Tarjetas de prescripción con detalle de fecha, profesional emisor, centro de salud, fármaco, posología y vigencia del tratamiento.
- [ ] Modal emergente interactivo que genera y despliega el código QR oficial de dispensación con código de seguridad alfanumérico.
- [ ] Buscador en tiempo real por nombre de medicamento o profesional prescriptor.

---

## HU-75: Portal Paciente: Repositorio y Descarga de Informes de Estudios Clínicos en PDF

* **Proyecto:** Esu Frontend
* **Sprint:** Sprint 7
* **Asignado a:** Ricardo Cejas

- **Como** paciente que se realizó prácticas diagnósticas,
- **Quiero** visualizar y descargar los informes de mis análisis de laboratorio y estudios por imágenes,
- **Para** disponer de mi información médica digitalizada y poder compartirla en futuras consultas.

### Criterios de Aceptación (DoD)
- [ ] Nueva vista en `/dashboard/paciente/estudios` accesible desde la barra de navegación del paciente.
- [ ] Listado de prácticas realizadas con badges de clasificación (Laboratorio, Radiología, Ecografía), fecha, institución y médico solicitante.
- [ ] Indicadores de estado de procesamiento (*Informe Disponible* y *En Análisis*).
- [ ] Botón de descarga directa simulada en formato PDF para reportes de laboratorio e imágenes validados.

---

## HU-76: Portal Paciente: Directorio Asistencial de Centros de Salud y Guardias de Emergencia

* **Proyecto:** Esu Frontend
* **Sprint:** Sprint 7
* **Asignado a:** Ricardo Cejas

- **Como** usuario del sistema de salud de Cruz del Eje,
- **Quiero** consultar los centros asistenciales habilitados, sus guardias permanentes y teléfonos de emergencia,
- **Para** acudir con rapidez al establecimiento adecuado ante una urgencia médica o programar mi atención.

### Criterios de Aceptación (DoD)
- [ ] Vista `/dashboard/paciente/centros` incorporada a la navegación lateral del portal de pacientes.
- [ ] Fichas institucionales con direcciones exactas, teléfonos de contacto, horarios de guardia de 24 hs y cartera de servicios.
- [ ] Enlace rápido de derivación al Turnero Online para agendar turnos ambulatorios en la institución elegida.
- [ ] Acceso destacado a las líneas de emergencia comunitaria (107 y conmutador central hospitalario).

---

## HU-77: Turnero Online: Integración Visual sin Contraste y Padrón Acotado a 3 Centros

* **Proyecto:** Esu Frontend
* **Sprint:** Sprint 7
* **Asignado a:** Ricardo Cejas

- **Como** ciudadano que busca reservar un turno online,
- **Quiero** navegar en una interfaz con colores claros armónicos y elegir exclusivamente entre las tres instituciones de salud principales,
- **Para** tener una experiencia fluida, consistente con la identidad de la web pública y sin confusiones de sedes inexistentes.

### Criterios de Aceptación (DoD)
- [ ] Eliminación de los fondos oscuros (`slate-900`) en la cabecera y stepper del turnero, reemplazándolos por la paleta `#edf5fa` y tonos institucionales claros.
- [ ] Supresión definitiva del banner de aviso de *Modo demostración*.
- [ ] Restricción del catálogo de sedes en el paso 1 a únicamente tres instituciones: *Hospital Regional Aurelio Crespo*, *Clínica Privada Cabrera* y *Centro de Diagnóstico Cruz del Eje*.
- [ ] Reasignación y disponibilidad de todos los profesionales y especialidades médicas dentro de estas tres sedes.

---

## HU-78: Credencial Sanitaria Digital Institucional y Suavizado del Centro de Notificaciones

* **Proyecto:** Esu Frontend
* **Sprint:** Sprint 7
* **Asignado a:** Ricardo Cejas

- **Como** paciente acreditado en la red sanitaria,
- **Quiero** disponer de un carnet digital con aspecto institucional oficial y un centro de notificaciones integrado,
- **Para** acreditar mi identidad en ventanilla de admisión sin estéticas sobrecargadas o contrastes invasivos.

### Criterios de Aceptación (DoD)
- [ ] Rediseño del modal de carnet digital con sello institucional de Cruz del Eje, encabezado formal, código QR de admisión y botón de impresión.
- [ ] Eliminación de tipografías con sombras pesadas, bordes oscuros o elementos de diseño no profesionales en la credencial.
- [ ] Suavizado de las barras de agrupación temporal (*Hoy*, *Ayer*, *Esta semana*) en el centro de notificaciones para armonizar con el fondo claro del sistema.
- [ ] Soporte de scroll bloqueante y accesibilidad con cierre por teclado (Escape) y click fuera del modal.

---

## HU-79: Cuenta Desarrollador Multi-Rol y Selector de Roles en Tiempo Real

* **Proyecto:** Esu Frontend
* **Sprint:** Sprint 7
* **Asignado a:** Ricardo Cejas

- **Como** desarrollador y evaluador de la plataforma ESU,
- **Quiero** iniciar sesión con una cuenta maestra (`dev@esu.gob.ar`) y alternar al instante entre Paciente, Médico, Recepción y Administrador,
- **Para** verificar vistas, permisos, notificaciones y turnos de cada rol en equipo sin tener que cerrar sesión ni cargar credenciales repetidamente.

### Criterios de Aceptación (DoD)
- [ ] Creación y auto-aprovisionamiento de la cuenta `dev@esu.gob.ar` con contraseña `Dev12345!` tanto en base de datos como en fallback local seguro.
- [ ] Componente `DevRoleSwitcher` visible en el header superior del dashboard y en la barra pública al activar la cuenta dev.
- [ ] Conmutación en 1 click entre los 4 roles (**Paciente**, **Médico**, **Centro Médico**, **Administrador**), actualizando contexto de usuario y redirigiendo al dashboard correspondiente.
- [ ] Adaptación de `RoleGuard` para garantizar acceso irrestricto entre rutas y persistencia del rol activo en recargas de página.
