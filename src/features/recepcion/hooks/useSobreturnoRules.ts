import { useState, useEffect, useCallback } from 'react';
import { turnosService } from '@/api/turnosService';
import { pacientesService } from '@/api/pacientesService';
import { centrosService, type ConsultorioItem } from '@/api/centrosService';
import { extractApiErrorMessage } from '@/api/endpoints';
import { useToast } from '@/context/ToastContext';
import type { Turno, User } from '@/types';
import {
  validarCupoSobreturno,
  validarDatosSobreturno,
  MOTIVOS_SOBRETURNO,
} from '@/lib/sobreturnoRules';

export interface UseSobreturnoRulesProps {
  isOpen: boolean;
  profesionalId: string;
  centroSaludId?: string;
  fecha?: string;
  sobreturnosHoyCount: number;
  onSobreturnoCreado?: (nuevoTurno: Turno) => void;
  onClose: () => void;
}

export function useSobreturnoRules({
  isOpen,
  profesionalId,
  centroSaludId,
  fecha = new Date().toLocaleDateString('en-CA'),
  sobreturnosHoyCount,
  onSobreturnoCreado,
  onClose,
}: UseSobreturnoRulesProps) {
  const { success, error: toastError, warning } = useToast();

  const [dniBusqueda, setDniBusqueda] = useState('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<User | null>(null);
  const [buscandoDni, setBuscandoDni] = useState(false);

  // Formulario express
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [obraSocial, setObraSocial] = useState('Demanda Espontánea / Particular');
  const [motivo, setMotivo] = useState(MOTIVOS_SOBRETURNO[0] ?? 'Demanda Espontánea en Sala');
  const [observacion, setObservacion] = useState('');
  const [consultorioSeleccionado, setConsultorioSeleccionado] = useState('');
  const [consultorios, setConsultorios] = useState<ConsultorioItem[]>([]);
  const [guardando, setGuardando] = useState(false);

  const { cupoAlcanzado, cuposRestantes } = validarCupoSobreturno(sobreturnosHoyCount);

  // Cargar consultorios físicos del centro
  useEffect(() => {
    if (isOpen && centroSaludId) {
      centrosService
        .getConsultorios(centroSaludId)
        .then((items) => {
          setConsultorios(items);
          if (items.length > 0 && items[0]) {
            setConsultorioSeleccionado(items[0].numero);
          }
        })
        .catch(() => {
          setConsultorios([]);
        });
    }
  }, [isOpen, centroSaludId]);

  const handleBuscarDni = useCallback(async () => {
    const cleanDni = dniBusqueda.trim();
    if (!cleanDni) return;

    setBuscandoDni(true);
    try {
      const encontrado = await pacientesService.getByDni(cleanDni);
      if (encontrado) {
        setPacienteSeleccionado(encontrado);
        setNombre(encontrado.nombre ?? '');
        setApellido(encontrado.apellido ?? '');
        setDni(encontrado.dni ?? cleanDni);
        setTelefono(encontrado.telefono ?? '');
        setObraSocial(encontrado.obraSocial || 'Particular');
        success(`Paciente encontrado: ${encontrado.nombre} ${encontrado.apellido}`);
      } else {
        setDni(cleanDni);
        setPacienteSeleccionado(null);
        warning('Paciente no registrado en padrón. Puede completarlo con carga express.');
      }
    } catch {
      setDni(cleanDni);
      setPacienteSeleccionado(null);
      warning('No se pudo verificar el DNI en línea. Complete la carga express.');
    } finally {
      setBuscandoDni(false);
    }
  }, [dniBusqueda, success, warning]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validacion = validarDatosSobreturno({
      profesionalId,
      centroSaludId,
      sobreturnosHoyCount,
      nombre,
      apellido,
      dni,
      motivo,
      observacion,
    });

    if (!validacion.valido) {
      warning(validacion.error ?? 'Revise los datos del sobreturno.');
      return;
    }

    setGuardando(true);
    try {
      const nuevo = await turnosService.crearSobreturno({
        profesionalId,
        centroSaludId: String(centroSaludId),
        fecha,
        pacienteId: pacienteSeleccionado?.id,
        pacienteNombre: `${nombre.trim()} ${apellido.trim()}`,
        pacienteDni: dni.trim(),
        pacienteTelefono: telefono.trim(),
        obraSocial,
        motivoSobreturno: validacion.motivoCompleto,
      });

      success(`Sobreturno asignado exitosamente (${sobreturnosHoyCount + 1}/${3} cupos del día).`);
      onSobreturnoCreado?.(nuevo);
      onClose();
    } catch (err: unknown) {
      toastError(extractApiErrorMessage(err, 'Error al asignar el sobreturno.'));
    } finally {
      setGuardando(false);
    }
  };

  const resetForm = () => {
    setDniBusqueda('');
    setPacienteSeleccionado(null);
    setNombre('');
    setApellido('');
    setDni('');
    setTelefono('');
    setObraSocial('Demanda Espontánea / Particular');
    setMotivo(MOTIVOS_SOBRETURNO[0] ?? 'Demanda Espontánea en Sala');
    setObservacion('');
  };

  return {
    dniBusqueda,
    setDniBusqueda,
    pacienteSeleccionado,
    buscandoDni,
    nombre,
    setNombre,
    apellido,
    setApellido,
    dni,
    setDni,
    telefono,
    setTelefono,
    obraSocial,
    setObraSocial,
    motivo,
    setMotivo,
    observacion,
    setObservacion,
    consultorios,
    consultorioSeleccionado,
    setConsultorioSeleccionado,
    guardando,
    cupoAlcanzado,
    cuposRestantes,
    handleBuscarDni,
    handleSubmit,
    resetForm,
  };
}
