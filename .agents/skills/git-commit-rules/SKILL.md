---
name: git-commit-rules
description: Reglas estrictas para inspección previa, staging atómico granular, formato de commits y prohibición de atribución IA en ESU (Esu-Frontend).
---

# Git Commit Rules & Conventions (ESU - Frontend)

Esta skill define las reglas obligatorias para el manejo de versiones, inspección de diffs, staging atómico y mensajes de commit en el repositorio **Esu-Frontend**.

## 1. Inspección Previa OBLIGATORIA
Antes de realizar cualquier staging (`git add`), es **estrictamente obligatorio**:
1. Ejecutar `git status` para revisar el estado del árbol de trabajo (archivos modificados, creados o eliminados).
2. Ejecutar `git diff` (o `git diff --cached`) para auditar las líneas exactas modificadas, verificando que no existan:
   - Archivos temporales, logs o artefactos accidentales.
   - Caracteres de mojibake o errores de encoding (UTF-8 sin BOM requerido).
   - Cambios de formato no deseados, archivos de backup (`*.bak`) ni `console.log` sueltos.

## 2. Staging Atómico y Granular
- **PROHIBIDO usar `git add .` o `git add -A` a ciegas.**
- El staging DEBE ser focalizado y granular: seleccionar explícitamente los archivos específicos pertenecientes a la tarea, feature o bugfix actual (`git add path/to/file1 path/to/file2`).
- Agrupar cambios en commits lógicos independientes cuando una tarea abarque múltiples áreas no relacionadas.

## 3. Frecuencia de Commits
- Realizar commits pequeños y cohesivos por cambio o corrección específica.
- Al finalizar una fase o tarea completa, realizar el commit de cierre correspondiente.

## 4. Formato Conventional Commits (OBLIGATORIO EN ESPAÑOL)
Todos los mensajes de commit, mensajes de push, títulos y descripciones de Pull Requests (PRs) **DEBEN ESTAR SIEMPRE ESCRITOS EN ESPAÑOL**.

Estructura:
`<type>(<scope>): <descripción breve en minúsculas en español>`

### Tipos permitidos (`type`):
- `feat`: Nueva funcionalidad (pantallas, wizards, integración de endpoints).
- `fix`: Corrección de un error o bug de UI/lógica.
- `refactor`: Cambio de código que ni agrega feature ni corrige bug (modularización, clean code, custom hooks).
- `style`: Formateo, estilos visuales, Tailwind sin cambios de lógica.
- `test`: Adición o corrección de pruebas unitarias o de componentes.
- `docs`: Cambios exclusivamente en documentación, README o diagramas.
- `chore`: Tareas de build, dependencias, skills o configuración sin tocar lógica de negocio.

### Ámbitos (`scope`) en ESU:
Indica el módulo o área afectada:
- `auth`: Autenticación, login, registro, guards y tokens JWT.
- `patients`: Padrón general, registro clínico y legajo de pacientes.
- `appointments`: Gestión, reserva, reagendamiento y cancelación de turnos.
- `doctors`: Nómina de profesionales, matrículas, agendas y bloqueos.
- `ehr`: Historia Clínica Única (HCU) y línea de tiempo de atención.
- `prescriptions`: Receta electrónica con firma y código QR.
- `users`: Gestión y administración de cuentas de usuario y roles.
- `ui`: Componentes transversales, layout, topbar, sidebar, modales, skeletons.
- `skills`: Reglas de desarrollo y configuración de agentes IA.
- `docs`: Documentación técnica, especificaciones y diagramas.

### Ejemplos válidos en español:
- `feat(appointments): implementar modal interactivo para cancelacion de turnos con aviso de cupo`
- `feat(patients): agregar formulario con validacion de dni para alta asistencial`
- `refactor(ui): modularizar sidebar adaptativo segun rol autenticado`
- `fix(auth): corregir redireccion de guard al expirar token jwt`
- `chore(skills): actualizar agentes y reglas de desarrollo para el ecosistema esu`

## 5. Prohibición Estricta de Atribución de IA
- **PROHIBIDO** incluir cabeceras de atribución de IA como `Co-Authored-By: CoPilot/ChatGPT/Gemini/Claude` o comentarios similares en el mensaje del commit o en el código.
- Los commits deben ser atribuidos únicamente mediante la autoría git estándar del desarrollador.
