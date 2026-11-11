import React, { useEffect } from 'react';
import {
  X,
  UserPlus,
  Search,
  Flame,
  AlertTriangle,
  UserCheck,
  Building2,
} from 'lucide-react';
import {
  useSobreturnoRules,
  type UseSobreturnoRulesProps,
} from '@/features/recepcion/hooks/useSobreturnoRules';
import { MOTIVOS_SOBRETURNO } from '@/lib/sobreturnoRules';

export interface ModalCrearSobreturnoProps extends UseSobreturnoRulesProps {}

export const ModalCrearSobreturno: React.FC<ModalCrearSobreturnoProps> = (props) => {
  const {
    isOpen,
    onClose,
    sobreturnosHoyCount,
  } = props;

  const {
    dniBusqueda,
    setDniBusqueda,
    pacienteSeleccionado,
    buscandoDni,
    nombre,
    setNombre,
    apellido,
    setApellido,
    dni,
    setDni,
    telefono,
    setTelefono,
    obraSocial,
    setObraSocial,
    motivo,
    setMotivo,
    observacion,
    setObservacion,
    consultorios,
    consultorioSeleccionado,
    setConsultorioSeleccionado,
    guardando,
    cupoAlcanzado,
    handleBuscarDni,
    handleSubmit,
    resetForm,
  } = useSobreturnoRules(props);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !guardando) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, guardando, onClose, resetForm]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-sobreturno-title"
    >
      <div className="w-full max-w-xl rounded-3xl border border-border bg-card overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-amber-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2 text-white">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="modal-sobreturno-title" className="text-lg font-bold">
                  Agregar Sobreturno / Demanda Espontánea
                </h2>
                <span className="rounded-full bg-amber-800/80 px-2.5 py-0.5 text-[11px] tabular-nums font-bold">
                  {sobreturnosHoyCount}/3 Cupos
                </span>
              </div>
              <p className="text-xs text-amber-100">
                Atención médica imprevista intercalada en sala de espera
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-full p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer disabled:opacity-50"
            aria-label="Cerrar modal de sobreturno"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Alerta de Cupo Máximo */}
        {cupoAlcanzado ? (
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                Cupo Máximo Diario de Sobreturnos Alcanzado
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                El profesional ya cuenta con 3 sobreturnos asignados para la jornada de hoy. Por normativa de calidad asistencial no es posible sobrecargar la agenda.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-muted px-4 py-2 text-xs font-bold text-foreground hover:bg-accent transition cursor-pointer"
            >
              Entendido / Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-foreground flex-1">
            {/* Buscador de Paciente por DNI */}
            <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-amber-600" />
                Búsqueda Rápida de Paciente por DNI
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ingrese DNI (ej: 34982112)..."
                  value={dniBusqueda}
                  onChange={(e) => setDniBusqueda(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleBuscarDni();
                    }
                  }}
                  className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                  type="button"
                  disabled={buscandoDni}
                  onClick={handleBuscarDni}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-bold text-white transition cursor-pointer disabled:opacity-50"
                >
                  {buscandoDni ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              {pacienteSeleccionado && (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                  <UserCheck className="h-4 w-4" />
                  <span>Paciente vinculado: {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</span>
                </div>
              )}
            </div>

            {/* Formulario Express */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Nombre *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Marcelo"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Apellido *</label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Ej: Quiroga"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">DNI *</label>
                <input
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Sin puntos"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Teléfono</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="03549..."
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Consultorio Físico & Obra Social */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Obra Social o Prepaga</label>
                <input
                  type="text"
                  value={obraSocial}
                  onChange={(e) => setObraSocial(e.target.value)}
                  placeholder="Ej: APROSS, PAMI, Particular..."
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {consultorios.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    Consultorio Físico Asignado
                  </label>
                  <select
                    value={consultorioSeleccionado}
                    onChange={(e) => setConsultorioSeleccionado(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {consultorios.map((c) => (
                      <option key={c.id} value={c.numero}>
                        Consultorio {c.numero} ({c.planta})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Motivo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Motivo de Demanda Espontánea *</label>
              <select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {MOTIVOS_SOBRETURNO.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Observaciones */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Detalle Clínico / Síntomas</label>
              <textarea
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Describa el motivo por el cual se requiere atención inmediata en sala..."
                rows={2}
                className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5" />
                Se marcará con badge ámbar en sala de espera.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={guardando}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-accent transition cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-5 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{guardando ? 'Guardando...' : 'Confirmar Sobreturno'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
