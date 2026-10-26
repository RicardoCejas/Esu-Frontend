import React, { useState, useEffect } from 'react';
import { turnosService } from '@/api/turnosService';
import { pacientesService } from '@/api/pacientesService';
import { useToast } from '@/context/ToastContext';
import type { Turno, User } from '@/types';
import {
  X,
  UserPlus,
  Search,
  Flame,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

interface ModalCrearSobreturnoProps {
  isOpen: boolean;
  onClose: () => void;
  profesionalId: string;
  centroSaludId?: string;
  fecha?: string;
  sobreturnosHoyCount: number;
  onSobreturnoCreado?: (nuevoTurno: Turno) => void;
}

const MOTIVOS_SOBRETURNO = [
  'Urgencia Menor / Síntoma Agudo',
  'Demanda Espontánea en Sala',
  'Control Post-Alta Inmediato',
  'Revisión de Estudios Urgentes',
  'Receta Crónica / Firma Prioritaria',
];

export const ModalCrearSobreturno: React.FC<ModalCrearSobreturnoProps> = ({
  isOpen,
  onClose,
  profesionalId,
  centroSaludId = 'c1',
  fecha = new Date().toISOString().split('T')[0],
  sobreturnosHoyCount,
  onSobreturnoCreado,
}) => {
  const { success, error, warning } = useToast();
  const [pacientes, setPacientes] = useState<User[]>([]);
  const [dniBusqueda, setDniBusqueda] = useState('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<User | null>(null);

  // Formulario Express
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [obraSocial, setObraSocial] = useState('Demanda Espontánea / Particular');
  const [motivo, setMotivo] = useState(MOTIVOS_SOBRETURNO[0]);
  const [observacion, setObservacion] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      pacientesService.getAll().then(setPacientes);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cupoAlcanzado = sobreturnosHoyCount >= 3;

  const handleBuscarDni = () => {
    if (!dniBusqueda.trim()) return;
    const encontrado = pacientes.find((p) => p.dni === dniBusqueda.trim());
    if (encontrado) {
      setPacienteSeleccionado(encontrado);
      setNombre(encontrado.nombre);
      setApellido(encontrado.apellido);
      setDni(encontrado.dni);
      setTelefono(encontrado.telefono || '');
      setObraSocial(encontrado.obraSocial || 'Particular');
    } else {
      setDni(dniBusqueda.trim());
      setPacienteSeleccionado(null);
      warning('No se encontró el paciente en el padrón. Puede cargarlo con el formulario express.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cupoAlcanzado) {
      warning('No se pueden asignar más sobreturnos: cupo máximo de 3 alcanzado.');
      return;
    }

    if (!nombre.trim() || !apellido.trim() || !dni.trim()) {
      warning('Por favor complete los datos obligatorios del paciente.');
      return;
    }

    setGuardando(true);
    try {
      const motivoCompleto = observacion.trim()
        ? `${motivo} (${observacion.trim()})`
        : motivo;

      const nuevo = await turnosService.crearSobreturno({
        profesionalId,
        centroSaludId,
        fecha,
        pacienteId: pacienteSeleccionado?.id,
        pacienteNombre: `${nombre.trim()} ${apellido.trim()}`,
        pacienteDni: dni.trim(),
        pacienteTelefono: telefono.trim(),
        obraSocial,
        motivoSobreturno: motivoCompleto,
      });

      success(`Sobreturno asignado exitosamente (${sobreturnosHoyCount + 1}/3 cupos del día).`);
      if (onSobreturnoCreado) onSobreturnoCreado(nuevo);
      onClose();
    } catch (err: any) {
      error(err.message || 'Error al asignar el sobreturno.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-card overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header con Badge de Cupo */}
        <div className="bg-amber-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2 text-white">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-heading">
                  Agregar Sobreturno / Demanda Espontánea
                </h2>
                <span className="rounded-full bg-amber-800/80 px-2.5 py-0.5 text-[11px] font-mono font-bold">
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
            className="rounded-full p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Alerta de Cupo Máximo si aplica */}
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
              className="rounded-xl bg-muted px-4 py-2 text-xs font-bold text-foreground hover:bg-accent transition"
            >
              Entendido / Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-foreground flex-1">
            {/* Buscador Rápido por DNI (DoD HU-FE-63) */}
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
                  className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono font-semibold text-foreground focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                  type="button"
                  onClick={handleBuscarDni}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
                >
                  Buscar
                </button>
              </div>

              {pacienteSeleccionado && (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                  <UserCheck className="h-4 w-4" />
                  <span>Paciente vinculado: {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</span>
                </div>
              )}
            </div>

            {/* Formulario de Carga Express (DoD HU-FE-63) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Marcelo"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Apellido</label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Ej: Quiroga"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">DNI</label>
                <input
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Sin puntos"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Teléfono / Celular</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="03549..."
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Cobertura / Obra Social */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Obra Social o Prepaga</label>
              <input
                type="text"
                value={obraSocial}
                onChange={(e) => setObraSocial(e.target.value)}
                placeholder="Ej: APROSS, PAMI, Particular..."
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Motivo del Sobreturno */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Motivo de Urgencia o Demanda Espontánea</label>
              <select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Footer de Acciones */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5" />
                Se marcará con badge ámbar distintivo en sala de espera.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-accent transition cursor-pointer"
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
