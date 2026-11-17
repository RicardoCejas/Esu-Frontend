# HU-85: Catálogo de Especialidades: Fotografía Médica Clínica Real Directa al Rubro

**Responsable:** Ana Luz (@analuz35)  
**Rama:** `AnaLuz`  
**Estado:** Completada / Implementada  
**Sprint:** Sprint 8 - Identidad Visual y Turnero Digital

---

## 1. Descripción de la Historia de Usuario
- **Como** paciente navegando las especialidades del centro seleccionado,
- **Quiero** ver fotografías médicas reales y específicas para cada disciplina médica (Cardiología, Clínica, Dermatología, Ginecología, Kinesiología, Odontología, Pediatría, etc.),
- **Para** identificar con certeza la especialidad correcta eliminando imágenes genéricas o repetidas.

---

## 2. Criterios de Aceptación
- [x] **CA1:** Reemplazo integral de gráficos abstractos e ilustraciones por fotos clínicas reales directas al rubro.
- [x] **CA2:** Diferenciación visual absoluta entre especialidades (ej: cardiología con ecocardiograma, odontología con consultorio dental, dermatología con dermatoscopio).
- [x] **CA3:** Optimización web de imágenes en formato ligero con `object-cover`, esquinas redondeadas y fallback ante fallos de carga.
- [x] **CA4:** Contraste tipográfico garantizado sobre o debajo de la imagen.

---

## 3. Solución Técnica Implementada (Código Fuente)

```tsx
export const ESPECIALIDADES_CATALOGO = [
  {
    id: 'esp-cardio',
    nombre: 'Cardiología',
    fotoUrl: '/images/especialidades/cardiologia.jpg',
    descripcion: 'Control cardiovascular, electrocardiogramas y ecocardiogramas.'
  },
  {
    id: 'esp-clinica',
    nombre: 'Clínica Médica',
    fotoUrl: '/images/especialidades/clinica.jpg',
    descripcion: 'Atención integral del adulto, chequeos y derivaciones.'
  },
  {
    id: 'esp-dermato',
    nombre: 'Dermatología',
    fotoUrl: '/images/especialidades/dermatologia.jpg',
    descripcion: 'Salud de la piel, control de lunares y patologías cutáneas.'
  },
  {
    id: 'esp-gineco',
    nombre: 'Ginecología y Obstetricia',
    fotoUrl: '/images/especialidades/ginecologia.jpg',
    descripcion: 'Salud reproductiva, controles periódicos y ecografías.'
  },
  {
    id: 'esp-kinesio',
    nombre: 'Kinesiología y Fisioterapia',
    fotoUrl: '/images/especialidades/kinesiologia.jpg',
    descripcion: 'Rehabilitación física, postural y kinefilaxia motora.'
  },
  {
    id: 'esp-odonto',
    nombre: 'Odontología General',
    fotoUrl: '/images/especialidades/odontologia.jpg',
    descripcion: 'Salud bucodental, limpiezas y tratamientos restauradores.'
  }
];
```
