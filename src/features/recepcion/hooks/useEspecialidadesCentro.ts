import { useState, useEffect, useCallback, useMemo } from 'react';
import { profesionalesService } from '@/api/profesionalesService';
import { centrosService, type ConsultorioItem } from '@/api/centrosService';
import { extractApiErrorMessage } from '@/api/endpoints';
import { useToast } from '@/context/ToastContext';
import type { Especialidad, Profesional } from '@/types';

export function useEspecialidadesCentro(centroId?: string | number) {
  const { success, error: toastError } = useToast();

  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [consultorios, setConsultorios] = useState<ConsultorioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [tabActiva, setTabActiva] = useState<'especialidades' | 'consultorios'>('especialidades');

  // Modal / Confirmación
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState<Especialidad | null>(null);
  const [isModalConsultorioOpen, setIsModalConsultorioOpen] = useState(false);
  const [itemAEliminar, setItemAEliminar] = useState<{ tipo: 'medico' | 'consultorio'; id: string; nombre: string } | null>(null);
  const [isEliminando, setIsEliminando] = useState(false);

  const cargarDatos = useCallback(async () => {
    if (!centroId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const activeCentroId = String(centroId);
      const [esps, profs, cons] = await Promise.all([
        profesionalesService.getEspecialidades(),
        profesionalesService.getByCentro(activeCentroId).catch(() => profesionalesService.getAll()),
        centrosService.getConsultorios(activeCentroId).catch(() => [] as ConsultorioItem[]),
      ]);

      setEspecialidades(esps ?? []);
      setProfesionales(profs ?? []);
      setConsultorios(cons ?? []);
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'No se pudieron cargar los datos de especialidades y consultorios.'));
    } finally {
      setLoading(false);
    }
  }, [centroId, toastError]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const getMedicosPorEspecialidad = useCallback(
    (espId: string) => {
      return profesionales.filter((p) => p.especialidadId === espId);
    },
    [profesionales]
  );

  const handleCrearConsultorio = async (data: { numero: string; planta: string; especialidadAsignada?: string }) => {
    if (!centroId) return;
    try {
      const nuevo = await centrosService.createConsultorio({
        centroSaludId: String(centroId),
        numero: data.numero.trim(),
        planta: data.planta.trim(),
        especialidadAsignada: data.especialidadAsignada?.trim(),
        activo: true,
      });
      setConsultorios((prev) => [...prev, nuevo]);
      setIsModalConsultorioOpen(false);
      success(`Consultorio ${nuevo.numero} dado de alta exitosamente.`);
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'No se pudo crear el consultorio físico.'));
    }
  };

  const confirmarEliminacion = async () => {
    if (!itemAEliminar || !centroId) return;
    setIsEliminando(true);
    try {
      if (itemAEliminar.tipo === 'consultorio') {
        await centrosService.deleteConsultorio(itemAEliminar.id);
        setConsultorios((prev) => prev.filter((c) => c.id !== itemAEliminar.id));
        success(`Consultorio ${itemAEliminar.nombre} eliminado.`);
      } else {
        await profesionalesService.desvincularCentro(itemAEliminar.id, String(centroId));
        setProfesionales((prev) => prev.filter((p) => p.id !== itemAEliminar.id));
        success(`Médico ${itemAEliminar.nombre} desvinculado.`);
      }
      setItemAEliminar(null);
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'Error al procesar la operación.'));
    } finally {
      setIsEliminando(false);
    }
  };

  const especialidadesFiltradas = useMemo(() => {
    return especialidades.filter((esp) => esp.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  }, [especialidades, busqueda]);

  return {
    especialidades: especialidadesFiltradas,
    profesionales,
    consultorios,
    loading,
    busqueda,
    setBusqueda,
    tabActiva,
    setTabActiva,
    getMedicosPorEspecialidad,
    especialidadSeleccionada,
    setEspecialidadSeleccionada,
    isModalConsultorioOpen,
    setIsModalConsultorioOpen,
    handleCrearConsultorio,
    itemAEliminar,
    setItemAEliminar,
    confirmarEliminacion,
    isEliminando,
    recargar: cargarDatos,
  };
}
