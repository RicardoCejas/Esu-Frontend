---
name: solid-principles
description: >-
  Directrices y ejemplos prácticos para aplicar los 5 principios SOLID en el desarrollo
  con TypeScript y React dentro del proyecto ESU (Ecosistema de Salud Unificado).
---

# Principios SOLID en ESU (Ecosistema de Salud Unificado)

Este documento detalla cómo aplicar rigurosamente los principios SOLID en la arquitectura frontend de ESU.

---

## 1. Single Responsibility Principle (SRP) — Responsabilidad Única
> *Una clase, módulo o componente debe tener una sola razón para cambiar.*

* **En React:**
  * **Containers / Vistas:** Su única responsabilidad es orquestar custom hooks y pasar props limpias a los componentes presentacionales.
  * **Custom Hooks (`/hooks`):** Su única responsabilidad es encapsular la lógica de negocio, cálculos de horarios de agenda y sincronización con la API REST (`/api/turnos`, `/api/pacientes`).
  * **Componentes Presentacionales (`/components`):** Su única responsabilidad es renderizar la interfaz visual de acuerdo a las props recibidas.

**Anti-patrón:**
```tsx
// ❌ MAL: El componente maneja fetch, formato de fecha, validación de turnos y renderizado visual
export const TurnoCard = ({ id }: { id: string }) => {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`/api/turnos/${id}`).then(res => res.json()).then(setData);
  }, [id]);
  return <div>{data?.medico}</div>;
};
```

**Correcto:**
```tsx
// ✅ BIEN: Separación en hook de datos y componente de presentación
export const TurnoCard = ({ turno, onCancel }: TurnoCardProps) => {
  return (
    <article className="rounded-xl border border-slate-200 p-4">
      <h3 className="font-semibold text-slate-900">{turno.doctorName}</h3>
      <p className="text-sm text-slate-600">{turno.specialty}</p>
      <button onClick={() => onCancel(turno.id)} className="btn-danger">
        Cancelar Turno
      </button>
    </article>
  );
};
```

---

## 2. Open/Closed Principle (OCP) — Abierto para Extensión, Cerrado para Modificación
> *El software debe estar abierto a extensiones sin necesidad de modificar el código existente.*

* Si se incorpora un nuevo rol o tipo de usuario en el Dashboard, no se llena el layout de `if-else` interminables; se define un registro de navegación extensible basado en un mapa o contrato común.

```tsx
interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
}

export const navigationConfig: NavigationItem[] = [
  { label: 'Mis Turnos', href: '/turnos', icon: Calendar, roles: ['PACIENTE'] },
  { label: 'Agenda Médica', href: '/agenda', icon: Clock, roles: ['MEDICO'] },
  { label: 'Padrón de Pacientes', href: '/pacientes', icon: Users, roles: ['RECEPCIONISTA', 'ADMIN'] },
];
```

---

## 3. Liskov Substitution Principle (LSP) — Sustitución de Liskov
> *Las clases o componentes derivados deben poder sustituir a sus tipos base sin alterar el funcionamiento.*

* Los componentes atómicos (`Button`, `Input`, `Modal`) deben extender las interfaces HTML nativas correspondientes (`ComponentPropsWithoutRef<'button'>`) para que cualquier consumidor pueda pasar props estándar (`disabled`, `aria-label`, `type`) sin sorpresas.

---

## 4. Interface Segregation Principle (ISP) — Segregación de Interfaces
> *Ningún cliente debe verse obligado a depender de interfaces o propiedades que no utiliza.*

* Prohibido pasar entidades completas con 20 campos cuando una tarjeta solo necesita 3:
```typescript
// ❌ MAL: Obliga a que el componente conozca toda la entidad
interface TurnoItemProps {
  turno: TurnoCompletoConHistorialYAuditoria;
}

// ✅ BIEN: Define un subconjunto específico y desacoplado
interface TurnoItemProps {
  doctorName: string;
  specialty: string;
  scheduledAt: string;
}
```

---

## 5. Dependency Inversion Principle (DIP) — Inversión de Dependencias
> *Los módulos de alto nivel no deben depender de módulos de bajo nivel; ambos deben depender de abstracciones.*

* Los servicios de comunicación con la API se desacoplan de la librería de transporte específica (`fetch`, `axios`) mediante capas de servicio o clientes HTTP abstractos (`apiClient`), facilitando el testing y mockeo sin acoplar la UI a la implementación de red.
