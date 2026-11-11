import { useState, useEffect, useCallback } from 'react';
import { centrosService, type ConsultorioItem } from '@/api/centrosService';
import { extractApiErrorMessage } from '@/api/endpoints';
import { useToast } from '@/context/ToastContext';
import type { CentroSalud } from '@/types';

export function useMiSede(centroId?: string | number) {
  const { success, error: toastError } = useToast();

  const [centro, setCentro] = useState<CentroSalud | null>(null);
  const [consultorios, setConsultorios] = useState<ConsultorioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [consultorioAEliminar, setConsultorioAEliminar] = useState<ConsultorioItem | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    if (!centroId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorCarga(null);
    try {
      const idStr = String(centroId);
      const [cData, consData] = await Promise.all([
        centrosService.getById(idStr),
        centrosService.getConsultorios(idStr),
      ]);
      setCentro(cData ?? null);
      setConsultorios(Array.isArray(consData) ? consData : []);
    } catch (err: unknown) {
      setErrorCarga(
        extractApiErrorMessage(err, 'No se pudo cargar la información institucional de tu sede.')
      );
    } finally {
      setLoading(false);
    }
  }, [centroId]);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const confirmarEliminarConsultorio = async () => {
    if (!consultorioAEliminar) return;
    setIsSaving(true);
    try {
      await centrosService.deleteConsultorio(consultorioAEliminar.id);
      setConsultorios((prev) => prev.filter((c) => c.id !== consultorioAEliminar.id));
      success(`Consultorio ${consultorioAEliminar.numero} dado de baja.`);
      setConsultorioAEliminar(null);
    } catch (err: unknown) {
      toastError(extractApiErrorMessage(err, 'No se pudo dar de baja el consultorio.'));
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEstadoConsultorio = async (consultorio: ConsultorioItem) => {
    setTogglingId(consultorio.id);
    try {
      const updated = await centrosService.cambiarEstadoConsultorio(consultorio.id, !consultorio.activo);
      setConsultorios((prev) => prev.map((c) => (c.id === consultorio.id ? updated : c)));
      success(
        updated.activo
          ? `Consultorio ${consultorio.numero} reactivado.`
          : `Consultorio ${consultorio.numero} pausado.`
      );
    } catch (err: unknown) {
      toastError(extractApiErrorMessage(err, 'No se pudo actualizar el estado del consultorio.'));
    } finally {
      setTogglingId(null);
    }
  };

  return {
    centro,
    consultorios,
    loading,
    errorCarga,
    isSaving,
    togglingId,
    consultorioAEliminar,
    setConsultorioAEliminar,
    cargarDatos,
    toggleEstadoConsultorio,
    confirmarEliminarConsultorio,
  };
}
