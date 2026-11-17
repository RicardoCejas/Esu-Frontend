import { useState, useEffect, useCallback, useMemo } from 'react';
import { profesionalesService } from '@/api/profesionalesService';
import { extractApiErrorMessage } from '@/api/endpoints';
import { useToast } from '@/context/ToastContext';
import type { Profesional, Especialidad } from '@/types';

export function useMedicosCentro(centroId?: string | number) {
  const { success, error: toastError } = useToast();

  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  // Confirmación de desvinculación
  const [medicoADesvincular, setMedicoADesvincular] = useState<Profesional | null>(null);
  const [isDesvinculando, setIsDesvinculando] = useState(false);

  const cargarDatos = useCallback(async () => {
    if (!centroId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const activeCentroId = String(centroId);
      const [delCentro, esps] = await Promise.all([
        profesionalesService.getByCentro(activeCentroId).catch(() => [] as Profesional[]),
        profesionalesService.getEspecialidades().catch(() => [] as Especialidad[]),
      ]);

      setProfesionales(delCentro);
      setEspecialidades(esps);
    } catch (err) {
      setLoadError(extractApiErrorMessage(err, 'No se pudo cargar el plantel médico del centro.'));
    } finally {
      setLoading(false);
    }
  }, [centroId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const confirmarDesvinculacion = async () => {
    if (!medicoADesvincular || !centroId) return;
    setIsDesvinculando(true);
    try {
      await profesionalesService.desvincularCentro(medicoADesvincular.id, String(centroId));
      success(`Dr./Dra. ${medicoADesvincular.nombre} ${medicoADesvincular.apellido} desvinculado del centro.`);
      setMedicoADesvincular(null);
      await cargarDatos();
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'Error al desvincular al médico.'));
    } finally {
      setIsDesvinculando(false);
    }
  };

  const medicosFiltrados = useMemo(() => {
    return profesionales.filter((p) => {
      const texto = `${p.nombre} ${p.apellido} ${p.especialidadNombre} ${p.matricula}`.toLowerCase();
      return texto.includes(busqueda.toLowerCase());
    });
  }, [profesionales, busqueda]);

  return {
    profesionales: medicosFiltrados,
    especialidades,
    loading,
    loadError,
    busqueda,
    setBusqueda,
    medicoADesvincular,
    setMedicoADesvincular,
    confirmarDesvinculacion,
    isDesvinculando,
    recargar: cargarDatos,
  };
}
