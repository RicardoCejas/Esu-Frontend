import { useState, useEffect, useCallback, useMemo } from 'react';
import { usuariosService } from '@/api/usuariosService';
import { extractApiErrorMessage } from '@/api/endpoints';
import { useToast } from '@/context/ToastContext';
import type { User } from '@/types';
import {
  filterEligibleCenterStaff,
  filterPersonalCentroList,
  isSelfAccount,
} from '../utils/centroStaffHelpers';

export function usePersonalCentro(currentUser: User | null) {
  const { success, error: toastError } = useToast();
  const centroId = currentUser?.centroSaludId;

  const [staff, setStaff] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<'TODOS' | 'RECEPCIONISTA' | 'MEDICO'>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO'>('TODOS');
  const [cuentaAToggle, setCuentaAToggle] = useState<User | null>(null);
  const [cuentaAEliminar, setCuentaAEliminar] = useState<User | null>(null);

  const cargarDatos = useCallback(async () => {
    if (!centroId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    try {
      const usuariosList = await usuariosService.getAll();
      setStaff(filterEligibleCenterStaff(usuariosList, centroId));
    } catch (err: unknown) {
      setLoadError(extractApiErrorMessage(err, 'No se pudo cargar el personal de la sede.'));
    } finally {
      setIsLoading(false);
    }
  }, [centroId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const personalFiltrado = useMemo(
    () => filterPersonalCentroList(staff, { busqueda, filtroRol, filtroEstado }),
    [staff, busqueda, filtroRol, filtroEstado]
  );

  const confirmarToggleEstado = async () => {
    if (!cuentaAToggle || isSelfAccount(cuentaAToggle, currentUser)) return;
    const nuevoEstado = !(cuentaAToggle.activo !== false);
    setIsSaving(true);
    try {
      await usuariosService.cambiarEstado(cuentaAToggle.id, nuevoEstado);
      setStaff((prev) =>
        prev.map((u) => (u.id === cuentaAToggle.id ? { ...u, activo: nuevoEstado } : u))
      );
      success(
        nuevoEstado
          ? `Cuenta ${cuentaAToggle.email} reactivada.`
          : `Cuenta ${cuentaAToggle.email} desactivada.`
      );
      setCuentaAToggle(null);
    } catch (err: unknown) {
      toastError(extractApiErrorMessage(err, 'No se pudo cambiar el estado de la cuenta.'));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!cuentaAEliminar || isSelfAccount(cuentaAEliminar, currentUser)) return;
    setIsSaving(true);
    try {
      await usuariosService.eliminar(cuentaAEliminar.id);
      setStaff((prev) => prev.filter((u) => u.id !== cuentaAEliminar.id));
      success(`Cuenta ${cuentaAEliminar.email} eliminada del centro.`);
      setCuentaAEliminar(null);
    } catch (err: unknown) {
      toastError(extractApiErrorMessage(err, 'No se pudo eliminar la cuenta seleccionada.'));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    staff,
    personalFiltrado,
    isLoading,
    loadError,
    isSaving,
    busqueda,
    setBusqueda,
    filtroRol,
    setFiltroRol,
    filtroEstado,
    setFiltroEstado,
    cuentaAToggle,
    setCuentaAToggle,
    cuentaAEliminar,
    setCuentaAEliminar,
    cargarDatos,
    confirmarToggleEstado,
    confirmarEliminar,
  };
}
