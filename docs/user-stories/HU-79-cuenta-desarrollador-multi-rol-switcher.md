# HU-79: Cuenta Desarrollador Multi-Rol y Selector de Roles en Tiempo Real

* **Proyecto:** Esu Frontend
* **Sprint:** Sprint 7
* **Asignado a:** Ricardo Cejas

---

- **Como** desarrollador y evaluador de la plataforma ESU,
- **Quiero** iniciar sesión con una cuenta maestra (`dev@esu.gob.ar`) y alternar al instante entre Paciente, Médico, Recepción y Administrador,
- **Para** verificar vistas, permisos, notificaciones y turnos de cada rol en equipo sin tener que cerrar sesión ni cargar credenciales repetidamente.

### Criterios de Aceptación (DoD)
- [ ] Creación y auto-aprovisionamiento de la cuenta `dev@esu.gob.ar` con contraseña `Dev12345!` tanto en base de datos como en fallback local seguro.
- [ ] Componente `DevRoleSwitcher` visible en el header superior del dashboard y en la barra pública al activar la cuenta dev.
- [ ] Conmutación en 1 click entre los 4 roles (**Paciente**, **Médico**, **Centro Médico**, **Administrador**), actualizando contexto de usuario y redirigiendo al dashboard correspondiente.
- [ ] Adaptación de `RoleGuard` para garantizar acceso irrestricto entre rutas y persistencia del rol activo en recargas de página.
