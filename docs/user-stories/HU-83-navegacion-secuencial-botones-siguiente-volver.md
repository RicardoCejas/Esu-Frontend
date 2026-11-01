# HU-83: Navegación Guiada del Turnero: Botones Secuenciales ("Siguiente" y "Volver")

**Responsable:** Ana Luz (@analuz35)  
**Rama:** `AnaLuz`  
**Estado:** Completada / Implementada  
**Sprint:** Sprint 8 - Identidad Visual y Turnero Digital

---

## 1. Descripción de la Historia de Usuario
- **Como** paciente utilizando el asistente de turnos,
- **Quiero** contar con botones explícitos de 'Siguiente / Elegir Especialidad' y 'Volver Atrás' al seleccionar un centro de salud,
- **Para** avanzar de manera controlada y segura en el flujo sin saltos bruscos o pérdidas accidentales de selección.

---

## 2. Criterios de Aceptación
- [x] **CA1:** Botón de retroceso ("Volver") visible en pasos superiores al inicial, retornando al paso previo.
- [x] **CA2:** Botón de acción principal ("Siguiente: Elegir Especialidad") habilitado únicamente tras seleccionar un centro.
- [x] **CA3:** Animación de transición fluida al cambiar de etapa.
- [x] **CA4:** Accesibilidad por teclado y soporte táctil con target de click ergonómico (`min-h-[44px]`).

---

## 3. Solución Técnica Implementada (Código Fuente)

```tsx
{/* Barra inferior de navegación secuencial */}
<div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6">
  <button
    type="button"
    onClick={handlePrevStep}
    disabled={step === 1}
    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
  >
    <ChevronLeft className="w-4 h-4" /> Volver
  </button>

  <button
    type="button"
    onClick={handleNextStep}
    disabled={!selectedCentro}
    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#0d5c75] to-[#00a8a8] hover:opacity-95 shadow-md shadow-[#0d5c75]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
  >
    Siguiente: Elegir Especialidad <ChevronRight className="w-4 h-4" />
  </button>
</div>
```
