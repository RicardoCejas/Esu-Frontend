# Casos de Prueba Backend - ESU (Spring Boot & Postman)
**Autor:** Martino  
**Host Local:** `http://localhost:8081`  
**Casos asignados:** CP-49 al CP-60  

---

## 0. Paso Previo Obligatorio: Autenticación y Obtención de Tokens JWT

Antes de ejecutar los casos de prueba, necesitás obtener los tokens Bearer para cada rol.

### 0.1 Login Médico (Para CP-49 al CP-56)
* **Método:** `POST`
* **URL:** `http://localhost:8081/api/auth/login`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
```json
{
  "email": "dr.martinez@hospitalcrespo.gob.ar",
  "password": "Admin123!"
}
```
* **Respuesta esperada:** `200 OK`
* **Acción:** Copiá el valor del campo `accessToken` (sin comillas) y usalo como Bearer Token en los casos médicos.

---

### 0.2 Login Administrador (Para CP-57 al CP-60)
* **Método:** `POST`
* **URL:** `http://localhost:8081/api/auth/login`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
```json
{
  "email": "admin@esu.gob.ar",
  "password": "Admin123!"
}
```
* **Respuesta esperada:** `200 OK`
* **Acción:** Copiá el valor del campo `accessToken` y usalo como Bearer Token para disponibilidades.

---

## Funcionalidad 1: Registro y Firma de Evolución Médica (POST /api/historias-clinicas/evoluciones)

### [CP-49] Alta exitosa y firma electrónica de evolución médica en HCU (Happy Path)
* **Objetivo:** Registrar evolución clínica con firma HMAC SHA-256 y finalizar automáticamente el turno asociado.
* **Método:** `POST`
* **URL:** `http://localhost:8081/api/historias-clinicas/evoluciones`
* **Headers:**
  * `Authorization`: `Bearer [TOKEN_JWT_MEDICO]`
  * `Content-Type`: `application/json`
* **Body (raw JSON):**
```json
{
  "pacienteId": 1,
  "profesionalId": 1,
  "turnoId": 1,
  "motivoConsulta": "Control clínico general",
  "anamnesis": "Paciente refiere cefaleas ocasionales",
  "examenFisico": "Normotenso, auscultación cardíaca normal",
  "diagnostico": "Cefalea tensional",
  "codigoCie10": "G44.2",
  "presionArterial": "120/80",
  "frecuenciaCardiaca": "75",
  "temperatura": "36.5",
  "firmar": true
}
```
* **Resultado Esperado:** `201 Created`
* **Qué mirar:** En el response viene `hashIntegridad` generado con SHA-256 de 64 caracteres y `"firmada": true`. El turno 1 pasa a `FINALIZADO`.

---

### [CP-50] Rechazo por omisión de campos clínicos obligatorios (Bean Validation)
* **Objetivo:** Validar que `@NotBlank` intercepte motivos y diagnósticos vacíos.
* **Método:** `POST`
* **URL:** `http://localhost:8081/api/historias-clinicas/evoluciones`
* **Headers:**
  * `Authorization`: `Bearer [TOKEN_JWT_MEDICO]`
  * `Content-Type`: `application/json`
* **Body (raw JSON):**
```json
{
  "pacienteId": 1,
  "profesionalId": 1,
  "motivoConsulta": "",
  "diagnostico": ""
}
```
* **Resultado Esperado:** `400 Bad Request`
* **Qué mirar:** Respuesta RFC 7807 detallando campos vacíos en `invalidParams`.

---

### [CP-51] Control de acceso / Paciente inexistente en BD
* **Objetivo:** Comprobar que no se puedan registrar evoluciones sobre pacientes inexistentes.
* **Método:** `POST`
* **URL:** `http://localhost:8081/api/historias-clinicas/evoluciones`
* **Headers:**
  * `Authorization`: `Bearer [TOKEN_JWT_MEDICO]`
  * `Content-Type`: `application/json`
* **Body (raw JSON):**
```json
{
  "pacienteId": 999999,
  "profesionalId": 1,
  "motivoConsulta": "Consulta de urgencia",
  "diagnostico": "Gripe común"
}
```
* **Resultado Esperado:** `403 Forbidden` (o `404 Not Found`)
* **Nota técnica para la defensa:** El filtro `@securityPolicy.canAccessPatient(999999)` intercepta la petición a nivel seguridad perimetral antes de llegar al servicio, denegando el acceso de forma segura.

---

### [CP-52] Bloqueo de acceso perimetral sin token de autenticación (Seguridad)
* **Objetivo:** Probar que el endpoint esté protegido contra usuarios anónimos.
* **Método:** `POST`
* **URL:** `http://localhost:8081/api/historias-clinicas/evoluciones`
* **Headers:**
  * `Content-Type`: `application/json`
  * *(Sin cabecera Authorization)*
* **Body (raw JSON):**
```json
{
  "pacienteId": 1,
  "profesionalId": 1,
  "motivoConsulta": "Intento anónimo",
  "diagnostico": "Diagnóstico no autorizado"
}
```
* **Resultado Esperado:** `401 Unauthorized`
* **Qué mirar:** Spring Security corta el request antes del controlador con mensaje `"Full authentication is required"`.

---

## Funcionalidad 2: Emisión de Adenda Médica / Fe de Erratas (POST /api/historias-clinicas/evoluciones/{id}/adenda)

### [CP-53] Emisión exitosa de adenda aclaratoria vinculada a evolución (Happy Path)
* **Objetivo:** Registrar fe de erratas manteniendo inmutable la evolución clínica original.
* **Método:** `POST`
* **URL:** `http://localhost:8081/api/historias-clinicas/evoluciones/1/adenda`
* **Headers:**
  * `Authorization`: `Bearer [TOKEN_JWT_MEDICO]`
  * `Content-Type`: `application/json`
* **Body (raw JSON):**
```json
{
  "profesionalId": 1,
  "justificacionClinica": "Aclaración sobre pauta posológica del tratamiento",
  "contenidoAdicional": "Se especifica toma nocturna de la medicación para evitar somnolencia diurna."
}
```
* **Resultado Esperado:** `201 Created`
* **Qué mirar:** Retorna `id` generado de la adenda, fecha y hora de creación, vinculada a la evolución 1.

---

### [CP-54] Rechazo por justificación y contenido aclaratorio vacíos (Bean Validation)
* **Objetivo:** Comprobar que no se puedan emitir adendas vacías sin justificación.
* **Método:** `POST`
* **URL:** `http://localhost:8081/api/historias-clinicas/evoluciones/1/adenda`
* **Headers:**
  * `Authorization`: `Bearer [TOKEN_JWT_MEDICO]`
  * `Content-Type`: `application/json`
* **Body (raw JSON):**
```json
{
  "profesionalId": 1,
  "justificacionClinica": "",
  "contenidoAdicional": ""
}
```
* **Resultado Esperado:** `400 Bad Request`
* **Qué mirar:** Mensajes de validación de Bean Validation indicando que ambos campos son obligatorios.

---

### [CP-55] Control de error sobre evolución médica inexistente (Seguridad / Recurso)
* **Objetivo:** Evitar anexar adendas huérfanas sobre registros que no existen.
* **Método:** `POST`
* **URL:** `http://localhost:8081/api/historias-clinicas/evoluciones/999999/adenda`
* **Headers:**
  * `Authorization`: `Bearer [TOKEN_JWT_MEDICO]`
  * `Content-Type`: `application/json`
* **Body (raw JSON):**
```json
{
  "profesionalId": 1,
  "justificacionClinica": "Corrección clínica",
  "contenidoAdicional": "Texto aclaratorio"
}
```
* **Resultado Esperado:** `403 Forbidden` (o `404 Not Found`)
* **Nota técnica para la defensa:** `@securityPolicy.canAccessEvolucion(#id)` frena el request si la evolución médica no existe o no pertenece al profesional.

---

### [CP-56] Rechazo por falta de token de autenticación en adenda (Seguridad)
* **Objetivo:** Garantizar que ninguna fe de erratas pueda emitirse sin firma del médico autenticado.
* **Método:** `POST`
* **URL:** `http://localhost:8081/api/historias-clinicas/evoluciones/1/adenda`
* **Headers:**
  * `Content-Type`: `application/json`
  * *(Sin cabecera Authorization)*
* **Body (raw JSON):**
```json
{
  "profesionalId": 1,
  "justificacionClinica": "Intento anónimo",
  "contenidoAdicional": "Aclaración sin credenciales"
}
```
* **Resultado Esperado:** `401 Unauthorized`

---

## Funcionalidad 3: Configuración de Disponibilidad y Generación de Slots (POST /api/disponibilidades)

### [CP-57] Configuración exitosa de jornada laboral semanal (Happy Path)
* **Objetivo:** Crear disponibilidad horaria e iniciar la generación de turnos libres.
* **Método:** `POST`
* **URL:** `http://localhost:8081/api/disponibilidades`
* **Headers:**
  * `Authorization`: `Bearer [TOKEN_JWT_ADMIN]`
  * `Content-Type`: `application/json`
* **Body (raw JSON):**
```json
{
  "profesionalId": 1,
  "diaSemana": "TUESDAY",
  "horaInicio": "08:00:00",
  "horaFin": "12:00:00",
  "intervaloMinutos": 20,
  "centroSaludId": 1
}
```
* **Resultado Esperado:** `201 Created`
* **Qué mirar:** Retorna la disponibilidad creada con ID y estado activo.

---

### [CP-58] Rechazo por inconsistencia cronológica (Regla de Negocio Temporal)
* **Objetivo:** Comprobar que `horaInicio` no pueda ser posterior a `horaFin` (14:00 > 08:00).
* **Método:** `POST`
* **URL:** `http://localhost:8081/api/disponibilidades`
* **Headers:**
  * `Authorization`: `Bearer [TOKEN_JWT_ADMIN]`
  * `Content-Type`: `application/json`
* **Body (raw JSON):**
```json
{
  "profesionalId": 1,
  "diaSemana": "WEDNESDAY",
  "horaInicio": "14:00",
  "horaFin": "08:00",
  "intervaloMinutos": 20,
  "centroSaludId": 1
}
```
* **Resultado Esperado:** `400 Bad Request`
* **Qué mirar:** Mensaje de error controlado indicando que la hora de inicio debe ser estrictamente anterior a la hora de fin.

---

### [CP-59] Conflicto de solapamiento de agenda horaria (Integridad de Grilla)
* **Objetivo:** Probar que no se superpongan franjas horarias para el mismo médico y día.
* **Precondición:** CP-57 ejecutado (martes 08:00 a 12:00 ya ocupado). Se intenta registrar martes 10:00 a 14:00.
* **Método:** `POST`
* **URL:** `http://localhost:8081/api/disponibilidades`
* **Headers:**
  * `Authorization`: `Bearer [TOKEN_JWT_ADMIN]`
  * `Content-Type`: `application/json`
* **Body (raw JSON):**
```json
{
  "profesionalId": 1,
  "diaSemana": "TUESDAY",
  "horaInicio": "10:00",
  "horaFin": "14:00",
  "intervaloMinutos": 20,
  "centroSaludId": 1
}
```
* **Resultado Esperado:** `409 Conflict`
* **Qué mirar:** Mensaje claro de conflicto por solapamiento de rango horario.

---

### [CP-60] Rechazo por intervalo menor al límite mínimo permitido (Valores Límite - BVA)
* **Objetivo:** Validar `@Min(5)` para que no se admitan consultas médicas menores a 5 minutos.
* **Método:** `POST`
* **URL:** `http://localhost:8081/api/disponibilidades`
* **Headers:**
  * `Authorization`: `Bearer [TOKEN_JWT_ADMIN]`
  * `Content-Type`: `application/json`
* **Body (raw JSON):**
```json
{
  "profesionalId": 1,
  "diaSemana": "THURSDAY",
  "horaInicio": "08:00",
  "horaFin": "12:00",
  "intervaloMinutos": 2,
  "centroSaludId": 1
}
```
* **Resultado Esperado:** `400 Bad Request`
* **Qué mirar:** Spring Validation rechaza el request indicando que el intervalo mínimo es de 5 minutos.
