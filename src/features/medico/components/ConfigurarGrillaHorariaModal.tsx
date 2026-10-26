import React, { useState, useEffect } from 'react';
import { profesionalesService } from '@/api/profesionalesService';
import { centrosService } from '@/api/centrosService';
import { useToast } from '@/context/ToastContext';
import type { DisponibilidadProfesional, CentroSalud } from '@/types';
import {
  X,
  Clock,
  Calendar,
  Building2,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Save
} from 'lucide-react';

interface ConfigurarGrillaHorariaModalProps {
  isOpen: boolean;
  onClose: () => void;
  profesionalId: string;
  profesionalNombre?: string;
  onSaved?: () => void;
}

const DIAS_SEMANA = [
  { key: 'MONDAY', label: 'Lunes' },
  { key: 'TUESDAY', label: 'Martes' },
  { key: 'WEDNESDAY', label: 'Miércoles' },
  { key: 'THURSDAY', label: 'Jueves' },
  { key: 'FRIDAY', label: 'Viernes' },
  { key: 'SATURDAY', label: 'Sábado' },
];

const INTERVALOS = [
  { value: 15, label: '15 min', desc: 'Consultas breves / controles' },
  { value: 20, label: '20 min', desc: 'Atención médica estándar' },
  { value: 30, label: '30 min', desc: 'Primera vez / estudios complejos' },
];

export const ConfigurarGrillaHorariaModal: React.FC<ConfigurarGrillaHorariaModalProps> = ({
  isOpen,
  onClose,
  profesionalId,
  profesionalNombre,
  onSaved,
}) => {
  const { success, error, warning } = useToast();
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadProfesional[]>([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Formulario interactivo
  const [diaSemana, setDiaSemana] = useState('MONDAY');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('13:00');
  const [intervaloMinutos, setIntervaloMinutos] = useState<number>(20);
  const [centroSaludId, setCentroSaludId] = useState('c1');
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen, profesionalId]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [c, d] = await Promise.all([
        centrosService.getAll(),
        profesionalesService.getDisponibilidad(profesionalId || 'p1'),
      ]);
      setCentros(c);
      if (c.length > 0 && !centroSaludId) {
        setCentroSaludId(c[0].id);
      }
      setDisponibilidades(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const toMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const handleGuardarFranja = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion(null);

    const inicioMin = toMinutes(horaInicio);
    const finMin = toMinutes(horaFin);

    // 1. Validación de orden temporal
    if (inicioMin >= finMin) {
      setErrorValidacion('La hora de inicio debe ser anterior a la hora de fin.');
      warning('La hora de inicio debe ser menor que la hora de fin.');
      return;
    }

    if (finMin - inicioMin < intervaloMinutos) {
      setErrorValidacion(`La franja horaria debe ser de al menos ${intervaloMinutos} minutos.`);
      return;
    }

    // 2. Validación de solapamiento de horarios en un mismo centro médico (DoD)
    const solapado = disponibilidades.some((disp) => {
      if (disp.diaSemana !== diaSemana || disp.centroSaludId !== centroSaludId) {
        return false;
      }
      const existingInicio = toMinutes(disp.horaInicio);
      const existingFin = toMinutes(disp.horaFin);

      // Existe solapamiento si: Max(inicio1, inicio2) < Min(fin1, fin2)
      return Math.max(inicioMin, existingInicio) < Math.min(finMin, existingFin);
    });

    if (solapado) {
      const msg = `Conflicto de horario: Ya existe una franja configurada que se solapa en este centro médico para el día seleccionado.`;
      setErrorValidacion(msg);
      warning(msg);
      return;
    }

    setGuardando(true);
    try {
      const guardada = await profesionalesService.guardarDisponibilidad({
        profesionalId: profesionalId || 'p1',
        diaSemana,
        horaInicio,
        horaFin,
        intervaloMinutos,
        centroSaludId,
      });

      setDisponibilidades((prev) => [...prev, guardada]);
      success('Grilla horaria guardada y turnero online abastecido exitosamente.');
      if (onSaved) onSaved();
    } catch (err: any) {
      error(err.message || 'Error al persistir la disponibilidad.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: string) => {
    try {
      await profesionalesService.eliminarDisponibilidad(id);
      setDisponibilidades((prev) => prev.filter((d) => d.id !== id));
      success('Franja horaria eliminada.');
      if (onSaved) onSaved();
    } catch {
      error('No se pudo eliminar la franja horaria.');
    }
  };

  const getNombreCentro = (id: string) => {
    return centros.find((c) => c.id === id)?.nombre || id;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-3xl border border-border bg-card overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-sky-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-2">
              <Calendar className="h-5 w-5 text-sky-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading">
                Configuración de Grilla Horaria y Slots
              </h2>
              <p className="text-xs text-sky-100">
                {profesionalNombre || 'Agenda de Disponibilidad Médica'} • Generador de cupos automáticos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-foreground flex-1">
          {/* Formulario de Alta de Franja */}
          <form onSubmit={handleGuardarFranja} className="rounded-2xl border border-border bg-muted/30 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Plus className="h-4 w-4 text-sky-600" />
                Nueva Franja Horaria de Atención
              </span>
              <span className="text-[11px] text-muted-foreground">
                DoD: Valida solapamiento por centro de salud
              </span>
            </div>

            {/* Selector de Centro Médico */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-sky-600" />
                Centro de Salud Institucional
              </label>
              <select
                value={centroSaludId}
                onChange={(e) => setCentroSaludId(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {centros.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.ciudad})
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Día de la Semana (Lunes a Sábado) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Día de la Semana (Lunes a Sábado)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {DIAS_SEMANA.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => {
                      setDiaSemana(d.key);
                      setErrorValidacion(null);
                    }}
                    className={`rounded-xl px-2.5 py-2 text-xs font-bold transition cursor-pointer text-center ${
                      diaSemana === d.key
                        ? 'bg-sky-700 text-white shadow-xs'
                        : 'border border-border bg-card text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Horas Inicio y Fin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-sky-600" />
                  Hora Inicio
                </label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => {
                    setHoraInicio(e.target.value);
                    setErrorValidacion(null);
                  }}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-sky-600" />
                  Hora Fin
                </label>
                <input
                  type="time"
                  value={horaFin}
                  onChange={(e) => {
                    setHoraFin(e.target.value);
                    setErrorValidacion(null);
                  }}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            {/* Selector de Intervalo (15, 20 o 30 minutos) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Duración / Intervalo por Consulta</span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  Define el espaciado de slots en el turnero
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {INTERVALOS.map((int) => (
                  <button
                    key={int.value}
                    type="button"
                    onClick={() => setIntervaloMinutos(int.value)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition cursor-pointer ${
                      intervaloMinutos === int.value
                        ? 'border-sky-600 bg-sky-50/60 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200 shadow-xs'
                        : 'border-border bg-card text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    <span className="text-sm font-extrabold">{int.label}</span>
                    <span className="text-[10px] text-muted-foreground">{int.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Alerta de Error de Validación */}
            {errorValidacion && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorValidacion}</span>
              </div>
            )}

            {/* Botón de Guardar Franja */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={guardando}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-700 hover:bg-sky-800 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>{guardando ? 'Guardando...' : 'Guardar Franja Horaria'}</span>
              </button>
            </div>
          </form>

          {/* Grilla Actual Configurada */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Franjas Horarias Activas ({disponibilidades.length})</span>
              <span className="text-[11px] font-normal lowercase">Próximos 30 días calculados</span>
            </h3>

            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Cargando disponibilidad...</div>
            ) : disponibilidades.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-xs text-muted-foreground">
                No hay franjas horarias configuradas. Configure días y horarios arriba para generar cupos.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {disponibilidades.map((d) => {
                  const diaObj = DIAS_SEMANA.find((x) => x.key === d.diaSemana);
                  const diaNombre = diaObj ? diaObj.label : d.diaSemana;

                  return (
                    <div
                      key={d.id}
                      className="rounded-2xl border border-border bg-card p-3.5 flex items-center justify-between shadow-2xs hover:border-sky-500/50 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-sky-700 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                            {diaNombre}
                          </span>
                          <span className="font-mono font-bold text-xs text-foreground">
                            {d.horaInicio} - {d.horaFin} hs
                          </span>
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            {d.intervaloMinutos} min
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[240px]">
                          {d.centroSaludNombre || getNombreCentro(d.centroSaludId)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleEliminar(d.id)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Eliminar franja"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-border bg-muted/40 px-6 py-3 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Los slots se actualizan de forma instantánea en el turnero web.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-accent transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
