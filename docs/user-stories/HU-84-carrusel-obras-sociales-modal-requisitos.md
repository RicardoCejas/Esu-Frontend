# HU-84: Coberturas Sanitarias: Carrusel Continuo de Obras Sociales y Modal de Requisitos

**Responsable:** Ana Luz (@analuz35)  
**Rama:** `AnaLuz`  
**Estado:** Completada / Implementada  
**Sprint:** Sprint 8 - Identidad Visual y Turnero Digital

---

## 1. Descripción de la Historia de Usuario
- **Como** afiliado a una obra social o prepaga (Apross, PAMI, OSDE, Swiss Medical, etc.),
- **Quiero** ver un carrusel dinámico ubicado debajo de la selección de centros de salud y abrir el detalle de coberturas en un modal interactivo,
- **Para** verificar qué convenios aplican y qué requisitos de atención debo presentar el día del turno.

---

## 2. Criterios de Aceptación
- [x] **CA1:** Ubicación del bloque de obras sociales debajo de los centros de salud conforme al requerimiento de la usuaria.
- [x] **CA2:** Carrusel con animación CSS continua (`animate-marquee`) y pausa al posar el cursor o dedo (`pause-on-hover`).
- [x] **CA3:** Inclusión de logos vectoriales oficiales (Apross, PAMI, OSDE, Swiss Medical, Galeno, Federada, Sancor, OSECAC).
- [x] **CA4:** Modal interactivo con requisitos de atención por entidad (carnet digital/físico, orden médica, copagos, etc.).

---

## 3. Solución Técnica Implementada (Código Fuente)

```tsx
{/* Carrusel Continuo de Obras Sociales */}
<section className="w-full mt-10 pt-6 border-t border-slate-200/80">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
      Obras Sociales y Convenios Aceptados
    </h3>
    <button
      onClick={() => setIsModalOpen(true)}
      className="text-xs font-semibold text-[#0d5c75] hover:underline"
    >
      Ver requisitos de atención →
    </button>
  </div>

  <div className="relative overflow-hidden w-full py-3 mask-radial-fade">
    <div className="flex w-max animate-marquee space-x-8 hover:[animation-play-state:paused]">
      {[...obrasSociales, ...obrasSociales].map((os, i) => (
        <div key={i} className="flex items-center justify-center px-4 py-2 bg-white rounded-xl shadow-xs border border-slate-200">
          <img src={os.logoUrl} alt={os.nombre} className="h-7 max-w-[110px] object-contain" />
        </div>
      ))}
    </div>
  </div>
</section>
```
