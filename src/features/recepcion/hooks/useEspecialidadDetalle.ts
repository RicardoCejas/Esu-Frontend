import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { extractApiErrorMessage } from '@/api/endpoints';
import { profesionalesService } from '@/api/profesionalesService';
import type { Especialidad, Profesional } from '@/types';

/**
 * Coordinates specialty details, update persistence, and center physician assignment management.
 */
export function useEspecialidadDetalle(especialidadId?: string) {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const centroId = String(user?.centroSaludId ?? '').trim();

  const [especialidad, setEspecialidad] = useState<Especialidad | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [medicosCentro, setMedicosCentro] = useState<Profesional[]>([]);
  const [otrosMedicosEspecialidad, setOtrosMedicosEspecialidad] = useState<Profesional[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nombreError, setNombreError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!especialidadId) {
      setLoading(false);
      setLoadError('Identificador de especialidad inválido.');
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const [allSpecs, centerProfs, specProfs] = await Promise.all([
        profesionalesService.getEspecialidades(),
        centroId
          ? profesionalesService.getByCentro(centroId).catch(() => [] as Profesional[])
          : Promise.resolve([] as Profesional[]),
        profesionalesService.getByEspecialidad(especialidadId).catch(() => [] as Profesional[]),
      ]);

      const found = allSpecs.find((s) => String(s.id) === String(especialidadId)) ?? null;
      if (!found) {
        setEspecialidad(null);
        setLoadError('No se encontró la especialidad solicitada.');
        return;
      }

      setEspecialidad(found);
      setNombre(found.nombre ?? '');
      setDescripcion(found.descripcion ?? '');

      const inCenter = centerProfs.filter(
        (m) =>
          String(m.especialidadId) === String(found.id) ||
          (m.especialidadNombre ?? '').toLowerCase() === (found.nombre ?? '').toLowerCase()
      );
      const centerIds = new Set(inCenter.map((m) => m.id));
      setMedicosCentro(inCenter);
      setOtrosMedicosEspecialidad(specProfs.filter((m) => !centerIds.has(m.id)));
    } catch (err) {
      setLoadError(extractApiErrorMessage(err, 'No se pudo cargar la especialidad médica.'));
    } finally {
      setLoading(false);
    }
  }, [especialidadId, centroId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSave = async (): Promise<boolean> => {
    if (!especialidad) return false;
    const cleanName = nombre.trim();
    if (cleanName.length < 3) {
      setNombreError('El nombre de la especialidad debe tener al menos 3 caracteres.');
      return false;
    }

    setSaving(true);
    setSubmitError(null);
    try {
      const updated = await profesionalesService.updateEspecialidad(especialidad.id, {
        nombre: cleanName,
        descripcion: descripcion.trim(),
      });
      setEspecialidad(updated);
      success(`Especialidad "${updated.nombre}" actualizada correctamente.`);
      await loadData();
      return true;
    } catch (err) {
      const msg = extractApiErrorMessage(err, 'No se pudo actualizar la especialidad.');
      setSubmitError(msg);
      toastError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDesvincularMedico = async (prof: Profesional): Promise<boolean> => {
    if (!centroId) return false;
    setSaving(true);
    try {
      await profesionalesService.desvincularCentro(prof.id, centroId);
      success(`Dr./Dra. ${prof.nombre} ${prof.apellido} desvinculado de la sede.`);
      await loadData();
      return true;
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'No se pudo desvincular al profesional.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleVincularMedico = async (prof: Profesional): Promise<boolean> => {
    if (!centroId) return false;
    setSaving(true);
    try {
      await profesionalesService.vincularCentro(prof.id, centroId);
      success(`Dr./Dra. ${prof.nombre} ${prof.apellido} vinculado a la sede.`);
      await loadData();
      return true;
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'No se pudo vincular al profesional a la sede.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    centroId,
    especialidad,
    nombre,
    setNombre: (v: string) => {
      setNombre(v);
      if (nombreError) setNombreError(null);
    },
    descripcion,
    setDescripcion,
    medicosCentro,
    otrosMedicosEspecialidad,
    loading,
    saving,
    loadError,
    nombreError,
    submitError,
    loadData,
    handleSave,
    handleDesvincularMedico,
    handleVincularMedico,
  };
}
