# HU-82: Selección de Centros de Salud: Tarjetas Intercaladas y Efecto Flotante

**Responsable:** Ana Luz (@analuz35)  
**Rama:** `AnaLuz`  
**Estado:** Completada / Implementada  
**Sprint:** Sprint 8 - Identidad Visual y Turnero Digital

---

## 1. Descripción de la Historia de Usuario
- **Como** paciente buscando atención médica en Cruz del Eje,
- **Quiero** ver los centros de salud disponibles en tarjetas con colores institucionales intercalados (`#0d5c75` y `#00a8a8`) y efecto hover interactivo,
- **Para** distinguir inmediatamente cada establecimiento, su dirección y servicios de guardia.

---

## 2. Criterios de Aceptación
- [x] **CA1:** Tarjetas de centros con alternancia cromática según índice (`index % 2 === 0 ? '#0d5c75' : '#00a8a8'`).
- [x] **CA2:** Efecto hover con elevación sutil `hover:-translate-y-1 hover:shadow-lg transition-all duration-200`.
- [x] **CA3:** Indicador visual de guardia 24hs con badge de alerta sanitaria.
- [x] **CA4:** Radio button integrado y estado seleccionado con anillo perimetral y fondo acentuado.

---

## 3. Solución Técnica Implementada (Código Fuente)

```tsx
{centros.map((centro, idx) => {
  const isPrimary = idx % 2 === 0;
  const isSelected = selectedCentroId === centro.id;
  const accentColor = isPrimary ? '#0d5c75' : '#00a8a8';

  return (
    <div
      key={centro.id}
      onClick={() => handleSelectCentro(centro)}
      className={`relative cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
        isSelected
          ? 'border-[#0d5c75] bg-sky-50/40 ring-2 ring-[#0d5c75]/20 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
            style={{ backgroundColor: accentColor }}
          >
            {centro.nombre.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">{centro.nombre}</h3>
            <p className="text-xs text-slate-500">{centro.direccion}</p>
          </div>
        </div>
        {centro.tieneGuardia && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Guardia 24hs
          </span>
        )}
      </div>
    </div>
  );
})}
```
