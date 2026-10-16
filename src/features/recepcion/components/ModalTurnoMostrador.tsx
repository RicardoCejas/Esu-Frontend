import React, { useState } from 'react';
import { CalendarPlus, X, AlertCircle } from 'lucide-react';
import { turnosService } from '@/api/turnosService';
import type { Turno, CentroSalud, Profesional, User } from '@/types';

interface ModalTurnoMostradorProps {
  isOpen: boolean;
  onClose: () => void;
  pacientes: User[];
  centros: CentroSalud[];
  profesionales: Profesional[];
  onTurnoCreado: (turno: Turno) => void;
}

export const ModalTurnoMostrador: React.FC<ModalTurnoMostradorProps> = ({
  isOpen,
  onClose,
  pacientes,
  centros,
  profesionales,
  onTurnoCreado,
}) => {
  const [pacienteId, setPacienteId] = useState(pacientes[0]?.id || '');
  const [centroSaludId, setCentroSaludId] = useState(centros[0]?.id || 'c1');
  const [profesionalId, setProfesionalId] = useState(profesionales[0]?.id || 'p1');
  const [hora, setHora] = useState('10:00');
  const [motivoConsulta, setMotivoConsulta] = useState('Demanda espontánea en mostrador / Consulta del día');
  const [obraSocial, setObraSocial] = useState('APROSS');
  const [copagoMonto, setCopagoMonto] = useState(0);
  const [numeroBono, setNumeroBono] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const paciente = pacientes.find((p) => p.id === pacienteId);
    const centro = centros.find((c) => c.id === centroSaludId);
    const profesional = profesionales.find((p) => p.id === profesionalId);

    if (!paciente || !centro || !profesional) {
      setError('Por favor complete todos los datos requeridos para asignar el turno.');
      return;
    }

    try {
      setIsSubmitting(true);
      const hoy = new Date().toISOString().split('T')[0];
      const nuevo = await turnosService.crearTurnoMostrador({
        fecha: hoy,
        hora,
        pacienteId: paciente.id,
        pacienteNombre: `${paciente.nombre} ${paciente.apellido}`,
        pacienteDni: paciente.dni,
        pacienteTelefono: paciente.telefono || 'Sin especificar',
        obraSocial,
        copagoMonto: Number(copagoMonto),
        numeroBono: numeroBono.trim() || undefined,
        esPrimeraVez: false,
        consultorioNumero: '102',
        planta: 'Planta Baja',
        profesionalId: profesional.id,
        profesionalNombre: `${profesional.nombre} ${profesional.apellido}`,
        especialidadNombre: profesional.especialidadNombre,
        centroSaludId: centro.id,
        centroSaludNombre: centro.nombre,
        estado: 'CONFIRMADO',
        motivoConsulta,
      });

      onTurnoCreado(nuevo);
      onClose();
    } catch {
      setError('No se pudo generar el turno de mostrador.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Turno Presencial de Mostrador</h2>
              <p className="text-xs text-muted-foreground">Asignación inmediata de cita para el día de hoy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">Paciente *</label>
            <select
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} {p.apellido} — DNI: {p.dni}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Centro de Salud *</label>
              <select
                value={centroSaludId}
                onChange={(e) => setCentroSaludId(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {centros.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1">Profesional *</label>
              <select
                value={profesionalId}
                onChange={(e) => setProfesionalId(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {profesionales.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.nombre} {pr.apellido} ({pr.especialidadNombre})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Horario Asignado *</label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1">Obra Social</label>
              <select
                value={obraSocial}
                onChange={(e) => setObraSocial(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="APROSS">APROSS</option>
                <option value="PAMI">PAMI</option>
                <option value="OSDE">OSDE</option>
                <option value="Particular / Sin Obra Social">Particular</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Copago / Cobro ($)</label>
              <input
                type="number"
                min={0}
                value={copagoMonto}
                onChange={(e) => setCopagoMonto(Number(e.target.value))}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1">N° Bono (Si aplica)</label>
              <input
                type="text"
                value={numeroBono}
                onChange={(e) => setNumeroBono(e.target.value)}
                placeholder="Ej. MST-9901"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Motivo / Observación de Recepción</label>
            <input
              type="text"
              value={motivoConsulta}
              onChange={(e) => setMotivoConsulta(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-border px-4 py-2 font-semibold text-muted-foreground hover:bg-muted transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-primary px-5 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-xs"
            >
              {isSubmitting ? 'Asignando...' : 'Asignar Turno de Mostrador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
