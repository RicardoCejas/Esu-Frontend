# HU-80: Rediseño Visual Institucional del Portal y Turnero con Identidad Cruz del Eje

**Responsable:** Ana Luz (@analuz35)  
**Rama:** `AnaLuz`  
**Estado:** Completada / Implementada  
**Sprint:** Sprint 8 - Identidad Visual y Turnero Digital

---

## 1. Descripción de la Historia de Usuario
- **Como** ciudadana y paciente del sistema de salud municipal de Cruz del Eje,
- **Quiero** que el portal y el turnero digital reflejen la identidad visual del logo institucional con colores acordes (`#0d5c75` y `#00a8a8`) con contraste intercalado y preservando el acceso a obras sociales,
- **Para** tener una experiencia visualmente armónica, confiable, accesible y representativa de mi municipio.

---

## 2. Criterios de Aceptación
- [x] **CA1:** Implementar paleta institucional primaria con `#0d5c75` (Deep Cruz del Eje Blue) y secundaria `#00a8a8` (Teal de contraste).
- [x] **CA2:** Fondo del Turnero y Portal con gradiente suave `bg-gradient-to-b from-[#0d5c75]/5 via-white to-slate-50`.
- [x] **CA3:** Aplicación de contraste dinámico en tarjetas y contenedores rectangulares con gradientes cruzados.
- [x] **CA4:** Mantener de forma permanente la sección de obras sociales y convenios requerida por la usuaria.

---

## 3. Solución Técnica Implementada (Código Fuente)

```tsx
// Contenedor principal con paleta y gradientes Cruz del Eje:
<div className="min-h-screen bg-gradient-to-b from-[#0d5c75]/5 via-white to-slate-50 text-slate-800">
  {/* Header institucional */}
  <header className="bg-gradient-to-r from-[#0d5c75] to-[#00a8a8] text-white shadow-md">
    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold">
          ESU
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Sistema de Salud Municipal</h1>
          <p className="text-xs text-white/80">Cruz del Eje - Gestión de Turnos</p>
        </div>
      </div>
    </div>
  </header>
</div>
```
