---
name: react-solid-rules
description: Directrices de SOLID, SRP, Container-Presentational y custom hooks en React para ESU (Esu-Frontend).
---

# React SOLID Rules & Component Architecture (ESU)

Esta skill define las reglas obligatorias de diseño de software y arquitectura de componentes para el frontend de **ESU (Ecosistema de Salud Unificado)**, basadas en los principios SOLID, SRP (Single Responsibility Principle) y el patrón Container-Presentational (Smart/Dumb Components).

## Principios Fundamentales

1. **S - Single Responsibility Principle (SRP)**:
   - Un componente debe hacer UNA sola cosa. Si tu componente maneja lógica de negocio, llamadas a la API de Spring Boot, validación de turnos, renderizado de UI complejo y layouts responsivos todo en uno, está MAL. Desacoplá la lógica en custom hooks y dividí la UI en componentes atómicos.
   
2. **O - Open/Closed Principle (OCP)**:
   - Los componentes deben estar abiertos a la extensión pero cerrados a la modificación. Usá composición (`children`) o inyección de componentes/props para extender comportamiento en lugar de agregar condicionales anidados.
   
3. **L - Liskov Substitution Principle (LSP)**:
   - Si creás componentes derivados o wrappers (ej. un input de búsqueda de pacientes o botón de acción clínica), deben poder usarse de la misma forma que el elemento original sin romper la interfaz esperada. Propagá correctamente las referencias (`forwardRef`) y las props nativas.

4. **I - Interface Segregation Principle (ISP)**:
   - No obligues a un componente a depender de props que no usa. Si una tarjeta de turno solo necesita la fecha, la especialidad y el médico, no le pases el objeto completo `Turno` con relaciones innecesarias. Pasale solo lo que necesita.

5. **D - Dependency Inversion Principle (DIP)**:
   - Dependé de abstracciones, no de concreciones. Pasá manejadores de eventos como props (`onCancelAppointment`, `onPatientSelect`) o usá inyección mediante contextos (`AuthContext`, `ToastContext`) en lugar de acoplar instancias globales rígidas dentro de tus componentes dumb.

---

## Patrón Container-Presentational (Smart/Dumb)

En ESU estructuramos las vistas dividiéndolas en dos capas claras:

### 1. Smart Components (Containers / Orchestrators)
- **Rol**: Manejar el estado, comunicarse con la API REST de Spring Boot (`/api/*`), persistir datos, orquestar custom hooks y distribuir datos a subcomponentes.
- **Límite**: `< 100 líneas`. Son orquestadores livianos.
- **Regla**: NO deben renderizar estilos de presentación densos ni markup complejo. Delegan el renderizado a dumb components.

### 2. Dumb Components (Presentational Components)
- **Rol**: Renderizar la UI basándose exclusivamente en las props recibidas.
- **Ubicación**: Subdirectorio `/components` o `/ui`.
- **Regla**: Deben ser puros, predecibles y testeables. Cero efectos secundarios directos (`useEffect` llamando a endpoints). Disparan callbacks provistos por el container.

---

## Custom Hooks para Encapsulación de Lógica

Toda lógica no visual debe vivir fuera del componente de UI:

- **Data Fetching & Server State**: Todo fetching asíncrono debe encapsularse en custom hooks dedicados (ej. `useAppointments`, `usePatientHistory`, `useMedicalStaff`). Prohibido mezclar `useEffect` + `useState` dispersos en la vista para traer datos.
- **Efectos y Sincronización**: `useEffect` se reserva exclusivamente para sincronizar el componente con eventos imperativos del browser (scroll lock en modales, atajos de teclado, observers).
- **Naming**: Los hooks deben seguir la convención `use[Domain][Action]` (ej. `useAppointmentBooking`, `usePatientFilter`).

---

## Directrices de Calidad en ESU

- **Strict TypeScript & Safe Access**: Tipar todas las props y retornos. Usar optional chaining y coalescencia nula obligatoria (`(patient?.dni ?? '')`, `(appointment?.status ?? 'PENDING')`) para evitar `Cannot read properties of undefined`.
- **Encoding Impecable**: UTF-8 sin BOM en todos los archivos. Cero tolerancia a mojibake.
- **Consistencia Visual**: Respetar el Design System clínico oficial: Azul Institucional (`#0284C7`), Verde Clínico (`#059669`), Ámbar (`#D97706`), Rojo Clínico (`#DC2626`). Cero estilos vibecoded o inventados fuera del sistema de tokens.
