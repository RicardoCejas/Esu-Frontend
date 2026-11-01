# Diagrama de Clases UML — Ecosistema de Salud Unificado (ESU)

Este documento especifica el **Diagrama de Clases UML oficial** del sistema, reflejando fielmente el modelo de dominio implementado en el backend Spring Boot (`com.SaludUnificada.Esu.entidad`) y consumido por el frontend en React.

---

## 1. Diagrama de Clases UML (Estándar OMG / Mermaid)

```mermaid
classDiagram
    direction TB

    class Usuario {
        -Long id
        -String email
        -String password
        -String rol
        -Boolean estadoActivo
        -LocalDate fechaDeAlta
        +getId() Long
        +getEmail() String
        +getRol() String
        +getEstadoActivo() Boolean
        +getFechaDeAlta() LocalDate
    }

    class Paciente {
        -Long id
        -String nombre
        -String apellido
        -String dni
        -String nroAfiliado
        -String telefono
        -LocalDate fechaNacimiento
        -String obraSocial
        -String grupoSanguineo
        +getId() Long
        +getNombreCompleto() String
        +getDni() String
        +getNroAfiliado() String
        +getUsuario() Usuario
    }

    class Profesional {
        -Long id
        -String nombre
        -String apellido
        -String matricula
        -String telefono
        -Boolean estadoActivo
        +getId() Long
        +getNombreCompleto() String
        +getMatricula() String
        +getEstadoActivo() Boolean
        +getEspecialidades() Set~Especialidad~
        +getUsuario() Usuario
    }

    class Especialidad {
        -Long id
        -String nombre
        +getId() Long
        +getNombre() String
        +getProfesionales() Set~Profesional~
    }

    class Turno {
        -Long id
        -LocalDateTime fechaHora
        -String estado
        -String motivoTurno
        -LocalDateTime fechaCreacion
        +getId() Long
        +getFechaHora() LocalDateTime
        +getEstado() String
        +getMotivoTurno() String
        +getPaciente() Paciente
        +getProfesional() Profesional
    }

    class HistoriaClinica {
        -Long id
        -String diagnostico
        -String motivoConsulta
        -String tratamiento
        -LocalDateTime fechaAtencion
        +getId() Long
        +getDiagnostico() String
        +getMotivoConsulta() String
        +getTratamiento() String
        +getFechaAtencion() LocalDateTime
        +getPaciente() Paciente
        +getProfesional() Profesional
    }

    %% Relaciones de Dominio UML
    Usuario "1" <.. "0..1" Paciente : cuenta de acceso (1:1)
    Usuario "1" <.. "0..1" Profesional : cuenta de acceso (1:1)

    Profesional "*" o-- "*" Especialidad : matriculado en (N:M)

    Paciente "1" o-- "*" Turno : solicita / agenda (1:N)
    Profesional "1" o-- "*" Turno : atiende (1:N)

    Paciente "1" *-- "*" HistoriaClinica : expediente único (1:N)
    Profesional "1" --> "*" HistoriaClinica : suscribe atención (1:N)
```

---

## 2. Descripción Semántica de las Relaciones

1. **`Usuario` ↔ `Paciente` (1:1 Opcional):**
   - Un `Usuario` con rol `PACIENTE` posee exactamente un registro asociado en `Paciente` mediante `fk_usuario`.
   - Permite segregar credenciales de acceso (email/password) de los datos de salud e identificación clínica.

2. **`Usuario` ↔ `Profesional` (1:1 Opcional):**
   - Un `Usuario` con rol `MEDICO` posee un registro asociado en `Profesional` mediante `usuario_id`.

3. **`Profesional` ↔ `Especialidad` (N:M Agregación):**
   - Un profesional de la salud puede poseer una o más especialidades médicas (ej. *Cardiología*, *Medicina General*).
   - Una especialidad puede ser ejercida por múltiples profesionales.
   - Materializada mediante la tabla intermedia `profesional_especialidad`.

4. **`Paciente` / `Profesional` ↔ `Turno` (1:N):**
   - Un `Turno` vincula a exactamente un `Paciente` con un `Profesional` en una fecha y hora determinada.
   - Estados canónicos del turno: `PENDIENTE`, `CONFIRMADO`, `CANCELADO`, `ATENDIDO`.

5. **`Paciente` / `Profesional` ↔ `HistoriaClinica` (1:N Composición y Asociación):**
   - La Historia Clínica pertenece de forma inmutable al legajo único del `Paciente` (Composición).
   - Cada consulta o atención médica es suscripta por el `Profesional` actuante que emite el diagnóstico y tratamiento.
