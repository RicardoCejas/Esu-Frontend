# Diagrama Entidad-Relación (DER) — Ecosistema de Salud Unificado (ESU)

Este documento especifica el **Diagrama Entidad-Relación (DER / ERD) oficial** del esquema de persistencia relacional en MySQL para el backend de ESU, derivado del mapeo JPA/Hibernate.

---

## 1. Diagrama Entidad-Relación (Notación Crow's Foot / Mermaid)

```mermaid
erDiagram
    USUARIO {
        bigint id PK "Clave primaria auto-incremental"
        varchar email "Email único del usuario"
        varchar password "Hash de contraseña segura"
        varchar rol "PACIENTE | MEDICO | RECEPCIONISTA | ADMIN"
        boolean estado_activo "Indica si la cuenta está habilitada"
        date fecha_alta "Fecha de registro en la plataforma"
    }

    PACIENTE {
        bigint id PK "Clave primaria auto-incremental"
        bigint fk_usuario FK "Relación 1:1 obligatoria con USUARIO"
        varchar nombre "Nombre del paciente"
        varchar apellido "Apellido del paciente"
        varchar dni "Documento Nacional de Identidad único"
        varchar nro_afiliado "Número de afiliado o historia clínica único"
        varchar telefono "Teléfono de contacto"
        date fecha_nacimiento "Fecha de nacimiento"
        varchar obra_social "Obra social o cobertura médica"
        varchar grupo_sanguineo "Grupo y factor sanguíneo"
    }

    PROFESIONAL {
        bigint id PK "Clave primaria auto-incremental"
        bigint usuario_id FK "Relación 1:1 con USUARIO"
        varchar nombre "Nombre del profesional"
        varchar apellido "Apellido del profesional"
        varchar matricula "Matrícula médica profesional única"
        varchar telefono "Teléfono de contacto del consultorio"
        boolean estado_activo "Disponibilidad activa en nómina"
    }

    ESPECIALIDAD {
        bigint id PK "Clave primaria auto-incremental"
        varchar nombre "Nombre único de la especialidad médica"
    }

    PROFESIONAL_ESPECIALIDAD {
        bigint profesional_id PK,FK "Referencia a PROFESIONAL"
        bigint especialidad_id PK,FK "Referencia a ESPECIALIDAD"
    }

    TURNO {
        bigint id PK "Clave primaria auto-incremental"
        bigint paciente_id FK "Paciente que solicita o asiste"
        bigint profesional_id FK "Profesional asignado para la atención"
        datetime fecha_hora "Fecha y horario programado de la cita"
        varchar estado "PENDIENTE | CONFIRMADO | CANCELADO | ATENDIDO"
        varchar motivo_turno "Motivo de la consulta reportado"
        datetime fecha_creacion "Timestamp automático de agendamiento"
    }

    HISTORIA_CLINICA {
        bigint id PK "Clave primaria auto-incremental"
        bigint paciente_id FK "Paciente titular del expediente"
        bigint profesional_id FK "Profesional que realizó la atención"
        varchar motivo_consulta "Motivo por el cual acudió"
        varchar diagnostico "Diagnóstico médico emitido"
        varchar tratamiento "Indicación médica y tratamiento"
        datetime fecha_atencion "Fecha y hora del registro clínico"
    }

    %% Cardinalidades Relacionales (Crow's Foot)
    USUARIO ||--o| PACIENTE : "posee datos asistenciales (1:0..1)"
    USUARIO ||--o| PROFESIONAL : "posee legajo médico (1:0..1)"

    PROFESIONAL ||--|{ PROFESIONAL_ESPECIALIDAD : "tiene"
    ESPECIALIDAD ||--|{ PROFESIONAL_ESPECIALIDAD : "asignada a"

    PACIENTE ||--o{ TURNO : "reserva / agenda (1:N)"
    PROFESIONAL ||--o{ TURNO : "atiende en agenda (1:N)"

    PACIENTE ||--o{ HISTORIA_CLINICA : "registra antecedentes (1:N)"
    PROFESIONAL ||--o{ HISTORIA_CLINICA : "audita y suscribe (1:N)"
```

---

## 2. Diccionario de Datos y Reglas de Integridad Referencial

| Tabla | Clave Primaria (PK) | Claves Foráneas (FK) | Restricciones de Unicidad |
|---|---|---|---|
| `usuario` | `id` | - | `email` UNIQUE |
| `paciente` | `id` | `fk_usuario` → `usuario(id)` | `dni` UNIQUE, `nro_afiliado` UNIQUE, `fk_usuario` UNIQUE |
| `profesional` | `id` | `usuario_id` → `usuario(id)` | `matricula` UNIQUE, `usuario_id` UNIQUE |
| `especialidad` | `id` | - | `nombre` UNIQUE |
| `profesional_especialidad` | `(profesional_id, especialidad_id)` | `profesional_id` → `profesional(id)`, `especialidad_id` → `especialidad(id)` | PK compuesta |
| `turno` | `id` | `paciente_id` → `paciente(id)`, `profesional_id` → `profesional(id)` | - |
| `historia_clinica` | `id` | `paciente_id` → `paciente(id)`, `profesional_id` → `profesional(id)` | - |
