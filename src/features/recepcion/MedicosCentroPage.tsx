import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useMedicosCentro } from './hooks/useMedicosCentro';
import { ModalConfirmacion } from '@/components/ui/ModalConfirmacion';
import { Stethoscope, PlusCircle, Search, RefreshCw, ChevronRight, UserCheck } from 'lucide-react';


export const MedicosCentroPage: React.FC = () => {
  const { user } = useAuth();
  const medicos = useMedicosCentro(user?.centroSaludId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Cuerpo Médico de la Institución</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Gestión de profesionales activos, agendas de atención y vinculación de consultorios.</p>
        </div>
        <Link to="/dashboard/recepcion/medicos/nuevo" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl shadow-xs transition">
          <PlusCircle className="h-4 w-4" />
          <span>Vincular Nuevo Médico</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar por nombre, especialidad o matrícula..." value={medicos.busqueda} onChange={(e) => medicos.setBusqueda(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl border border-input text-xs bg-background focus:ring-2 focus:ring-primary" />
        </div>
        <button onClick={() => medicos.recargar()} className="p-2 border border-border rounded-xl text-muted-foreground hover:bg-muted" title="Actualizar nómina">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {medicos.loading ? (
        <div className="flex h-48 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" /></div>
      ) : medicos.profesionales.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Stethoscope className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
          <h3 className="text-sm font-bold text-foreground">No se encontraron profesionales vinculados</h3>
          <p className="text-xs text-muted-foreground mt-1">Utilice el botón superior para vincular médicos a este centro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicos.profesionales.map((med) => (
            <div key={med.id} className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3 hover:border-sky-500/50 transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground">Dr. {med.nombre} {med.apellido}</h3>
                  <p className="text-xs text-sky-700 font-medium">{med.especialidadNombre}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                  <UserCheck className="h-3 w-3" />
                  <span>Activo</span>
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground space-y-1">
                <p>Matrícula: <span className="tabular-nums font-semibold text-foreground">{med.matricula}</span></p>
                <p>Días: {med.diasAtencion?.join(', ') || 'A convenir'}</p>
                <p>Slot promedio: {med.duracionTurnoMin ?? 20} minutos</p>
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <Link
                  to={`/dashboard/recepcion/medicos/${med.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 hover:underline"
                >
                  <span>Ver Ficha & Agenda</span>
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalConfirmacion isOpen={!!medicos.medicoADesvincular} onClose={() => medicos.setMedicoADesvincular(null)} onConfirm={medicos.confirmarDesvinculacion} title="Desvincular Profesional Médico" description={`¿Confirma que desea desvincular al Dr. ${medicos.medicoADesvincular?.nombre} ${medicos.medicoADesvincular?.apellido} de ${user?.centroSaludNombre || 'este centro'}? Si posee turnos programados pendientes, la operación será rechazada para proteger la atención del paciente.`} confirmText="Desvincular" cancelText="Cancelar" variant="danger" isLoading={medicos.isDesvinculando} />
    </div>
  );
};
