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

  // Ficha y Edición
  const [medicoSeleccionado, setMedicoSeleccionado] = useState<Profesional | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Formulario de edición
  const [editNombre, setEditNombre] = useState('');
  const [editApellido, setEditApellido] = useState('');
  const [editMatricula, setEditMatricula] = useState('');
  const [editEspId, setEditEspId] = useState('');
  const [editDias, setEditDias] = useState<string[]>([]);
  const [editDuracion, setEditDuracion] = useState(20);

  // Confirmación de desvinculación accesible
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
      const [profs, esps] = await Promise.all([
        profesionalesService.getByCentro(activeCentroId).catch(() => profesionalesService.getAll()),
        profesionalesService.getEspecialidades(),
      ]);

      const filtrados = profs.filter((p) =>
        p.centrosSaludIds && p.centrosSaludIds.length > 0 ? p.centrosSaludIds.includes(activeCentroId) : true
      );

      setProfesionales(filtrados);
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

  const abrirFicha = (med: Profesional) => {
    setMedicoSeleccionado(med);
    setEditNombre(med.nombre);
    setEditApellido(med.apellido);
    setEditMatricula(med.matricula);
    setEditEspId(med.especialidadId);
    setEditDias(med.diasAtencion || ['Lunes', 'Miércoles', 'Viernes']);
    setEditDuracion(med.duracionTurnoMin || 20);
    setModoEdicion(false);
  };

  const toggleDia = (dia: string) => {
    setEditDias((prev) => (prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]));
  };

  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicoSeleccionado || !editNombre.trim() || !editApellido.trim() || !editMatricula.trim()) {
      return;
    }

    try {
      const espSeleccionada = especialidades.find((esp) => esp.id === editEspId);
      const espNombre = espSeleccionada ? espSeleccionada.nombre : medicoSeleccionado.especialidadNombre;

      const updated = await profesionalesService.updateProfesional(medicoSeleccionado.id, {
        nombre: editNombre.trim(),
        apellido: editApellido.trim(),
        matricula: editMatricula.trim(),
        especialidadId: editEspId,
        especialidadNombre: espNombre,
        diasAtencion: editDias,
        duracionTurnoMin: Number(editDuracion),
      });

      setProfesionales((prev) =>
        prev.map((p) => (p.id === medicoSeleccionado.id ? { ...p, ...updated } : p))
      );
      setMedicoSeleccionado({ ...medicoSeleccionado, ...updated });
      setModoEdicion(false);
      success(`Datos del Dr. ${editNombre} ${editApellido} actualizados`);
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'Error al actualizar datos del profesional'));
    }
  };

  const confirmarDesvinculacion = async () => {
    if (!medicoADesvincular || !centroId) return;
    setIsDesvinculando(true);
    try {
      await profesionalesService.desvincularCentro(medicoADesvincular.id, String(centroId));
      setProfesionales((prev) => prev.filter((p) => p.id !== medicoADesvincular.id));
      if (medicoSeleccionado?.id === medicoADesvincular.id) {
        setMedicoSeleccionado(null);
      }
      success(`Dr. ${medicoADesvincular.nombre} ${medicoADesvincular.apellido} desvinculado del centro`);
      setMedicoADesvincular(null);
    } catch (err) {
      toastError(extractApiErrorMessage(err, 'Error al desvincular al médico'));
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
    medicoSeleccionado,
    setMedicoSeleccionado,
    modoEdicion,
    setModoEdicion,
    editNombre,
    setEditNombre,
    editApellido,
    setEditApellido,
    editMatricula,
    setEditMatricula,
    editEspId,
    setEditEspId,
    editDias,
    toggleDia,
    editDuracion,
    setEditDuracion,
    abrirFicha,
    guardarCambios,
    medicoADesvincular,
    setMedicoADesvincular,
    confirmarDesvinculacion,
    isDesvinculando,
    recargar: cargarDatos,
  };
}
