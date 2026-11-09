import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useEspecialidadesCentro } from './hooks/useEspecialidadesCentro';
import { EspecialidadesGrid } from './components/EspecialidadesGrid';
import { ConsultoriosCentroTab } from './components/ConsultoriosCentroTab';
import { EspecialidadDetalleModal } from './components/EspecialidadDetalleModal';
import { ModalConfirmacion } from '@/components/ui/ModalConfirmacion';
import { Layers, DoorOpen, Search, RefreshCw } from 'lucide-react';

export const EspecialidadesCentroPage: React.FC = () => {
  const { user } = useAuth();
  const esp = useEspecialidadesCentro(user?.centroSaludId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Especialidades y Consultorios</h1>
            <span className="rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 text-[11px] font-semibold">
              {user?.centroSaludNombre || 'Sede Médica'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Control de servicios médicos habilitados e infraestructura física de consultorios.</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => esp.setTabActiva('especialidades')} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${esp.tabActiva === 'especialidades' ? 'bg-sky-600 text-white border-sky-600' : 'bg-card text-muted-foreground border-border hover:bg-muted'}`}>
            <Layers className="h-4 w-4" />
            <span>Especialidades</span>
          </button>
          <button onClick={() => esp.setTabActiva('consultorios')} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${esp.tabActiva === 'consultorios' ? 'bg-sky-600 text-white border-sky-600' : 'bg-card text-muted-foreground border-border hover:bg-muted'}`}>
            <DoorOpen className="h-4 w-4" />
            <span>Consultorios Físicos</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar especialidades..." value={esp.busqueda} onChange={(e) => esp.setBusqueda(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl border border-input text-xs bg-background focus:ring-2 focus:ring-primary" />
        </div>
        <button onClick={() => esp.recargar()} className="p-2 border border-border rounded-xl text-muted-foreground hover:bg-muted" title="Actualizar datos">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {esp.loading ? (
        <div className="flex h-48 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" /></div>
      ) : esp.tabActiva === 'especialidades' ? (
        <EspecialidadesGrid especialidades={esp.especialidades} getMedicosPorEspecialidad={esp.getMedicosPorEspecialidad} onSeleccionar={(item) => esp.setEspecialidadSeleccionada(item)} />
      ) : (
        <ConsultoriosCentroTab consultorios={esp.consultorios} onCrear={esp.handleCrearConsultorio} onEliminar={(c) => esp.setItemAEliminar({ tipo: 'consultorio', id: c.id, nombre: `Consultorio ${c.numero}` })} isModalOpen={esp.isModalConsultorioOpen} setIsModalOpen={esp.setIsModalConsultorioOpen} />
      )}

      <EspecialidadDetalleModal especialidad={esp.especialidadSeleccionada} medicos={esp.especialidadSeleccionada ? esp.getMedicosPorEspecialidad(esp.especialidadSeleccionada.id) : []} onCerrar={() => esp.setEspecialidadSeleccionada(null)} onDesvincularMedico={(m) => esp.setItemAEliminar({ tipo: 'medico', id: m.id, nombre: `Dr. ${m.nombre} ${m.apellido}` })} />

      <ModalConfirmacion isOpen={!!esp.itemAEliminar} onClose={() => esp.setItemAEliminar(null)} onConfirm={esp.confirmarEliminacion} title="Confirmar Eliminación" description={`¿Confirma que desea eliminar ${esp.itemAEliminar?.nombre} de este centro de salud?`} confirmText="Eliminar" cancelText="Cancelar" variant="danger" isLoading={esp.isEliminando} />
    </div>
  );
};
