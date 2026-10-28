# HU-73: Portal Paciente: Filtros de Estado de Turnos y Requisitos de Atención Médica

* **Proyecto:** Esu Frontend
* **Sprint:** Sprint 7
* **Asignado a:** Ricardo Cejas

---

- **Como** paciente registrado en la plataforma,
- **Quiero** clasificar mis citas médicas entre turnos próximos e historial previo, además de conocer los requisitos documentales obligatorios,
- **Para** llevar un control ordenado de mis asistencias pasadas y presentarme a tiempo con la documentación requerida en ventanilla.

### Criterios de Aceptación (DoD)
- [ ] Pestañas de filtrado superior divididas en **Próximos Turnos** (confirmados, pendientes y en espera) e **Historial de Turnos** (atendidos y cancelados), cada una con su contador numérico.
- [ ] Ocultamiento condicional del botón superior derecho `+ Solicitar Nuevo Turno` cuando la lista general esté vacía, delegando la acción al botón principal central del estado vacío.
- [ ] Banner visible y accesible de preparación previa indicando la obligación de concurrir con DNI físico original, credencial de Obra Social o Programa SUMAR, y 15 minutos de anticipación.
- [ ] Estados vacíos contextualizados por pestaña cuando no haya turnos próximos agendados o no se registre historial previo.
