import { useState, useEffect, useCallback, useMemo } from 'react';
import { profesionalesService } from '@/api/profesionalesService';
import { extractApiErrorMessage } from '@/api/endpoints';
import { useToast } from '@/context/ToastContext';
import type { Especialidad, Profesional } from '@/types';

export function useEspecialidadesCentro(centroId?: string | number) {
  const { error: toastError } = useToast();

  const [catalogoEspecialidades, setCatalogoEspecialidades] = useState<Especialidad[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroSede, setFiltroSede] = useState<'habilitadas' | 'todas'>('habilitadas');

  const cargarDatos = useCallback(async () => {
    if (!centroId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const activeCentroId = String(centroId);
      const [esps, profs] = await Promise.all([
        profesionalesService.getEspecialidades(),
        profesionalesService.getByCentro(activeCentroId).catch(() => [] as Profesional[]),
      ]);

      const centroProfs = (profs ?? []).filter((p) =>
        p.centrosSaludIds && p.centrosSaludIds.length > 0 ? p.centrosSaludIds.includes(activeCentroId) : true
      );

      setCatalogoEspecialidades(esps ?? []);
      setProfesionales(centroProfs);
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'No se pudieron cargar los datos de especialidades de la sede.'));
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

  const especialidadesConMedicosIds = useMemo(() => {
    return new Set(profesionales.map((p) => p.especialidadId));
  }, [profesionales]);

  const especialidadesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return catalogoEspecialidades.filter((esp) => {
      const matchesSearch = !q || esp.nombre.toLowerCase().includes(q) || (esp.descripcion ?? '').toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (filtroSede === 'habilitadas') {
        return especialidadesConMedicosIds.has(esp.id);
      }
      return true;
    });
  }, [catalogoEspecialidades, busqueda, filtroSede, especialidadesConMedicosIds]);

  return {
    especialidades: especialidadesFiltradas,
    totalHabilitadas: especialidadesConMedicosIds.size,
    totalCatalogo: catalogoEspecialidades.length,
    profesionales,
    loading,
    busqueda,
    setBusqueda,
    filtroSede,
    setFiltroSede,
    getMedicosPorEspecialidad,
    recargar: cargarDatos,
  };
}
