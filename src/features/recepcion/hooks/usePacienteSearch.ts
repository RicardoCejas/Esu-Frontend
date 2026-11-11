import { useState, useCallback, useEffect } from 'react';
import { extractApiErrorMessage } from '@/api/endpoints';
import { pacientesService } from '@/api/pacientesService';
import type { User } from '@/types';

export function usePacienteSearch(initialDni = '', onSelect?: (p: User) => void) {
  const [terminoBusqueda, setTerminoBusqueda] = useState(initialDni);
  const [paciente, setPaciente] = useState<User | null>(null);
  const [pacientesSugeridos, setPacientesSugeridos] = useState<User[]>([]);
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);
  const [pacienteError, setPacienteError] = useState<string | null>(null);

  const seleccionarPaciente = useCallback(
    (p: User) => {
      setPaciente(p);
      setTerminoBusqueda(p.dni ?? `${p.apellido}, ${p.nombre}`);
      setPacientesSugeridos([]);
      setPacienteError(null);
      if (onSelect) onSelect(p);
    },
    [onSelect]
  );

  const buscarPaciente = useCallback(
    async (termino?: string) => {
      const raw = (termino ?? terminoBusqueda).trim();
      if (!raw) {
        setPacienteError('Ingresá un DNI o apellido/nombre para buscar.');
        setPaciente(null);
        setPacientesSugeridos([]);
        return;
      }

      setBuscandoPaciente(true);
      setPacienteError(null);
      try {
        const cleanDigits = raw.replace(/\D/g, '');
        if (cleanDigits.length >= 7 && cleanDigits === raw) {
          const found = await pacientesService.getByDni(cleanDigits);
          if (found) {
            seleccionarPaciente(found);
          } else {
            setPaciente(null);
            setPacientesSugeridos([]);
            setPacienteError(`No encontramos ningún paciente con DNI ${cleanDigits}.`);
          }
        } else {
          const all = await pacientesService.getAll();
          const q = raw.toLowerCase();
          const matches = all.filter((p) => {
            const fullName = `${p.nombre} ${p.apellido}`.toLowerCase();
            const reverseName = `${p.apellido} ${p.nombre}`.toLowerCase();
            return fullName.includes(q) || reverseName.includes(q) || (p.dni && p.dni.includes(q));
          });
          if (matches.length === 1 && matches[0]) {
            seleccionarPaciente(matches[0]);
          } else if (matches.length > 1) {
            setPaciente(null);
            setPacientesSugeridos(matches.slice(0, 5));
          } else {
            setPaciente(null);
            setPacientesSugeridos([]);
            setPacienteError(`No se encontraron pacientes para "${raw}".`);
          }
        }
      } catch (err) {
        setPaciente(null);
        setPacientesSugeridos([]);
        setPacienteError(extractApiErrorMessage(err, 'Error al consultar el padrón de pacientes.'));
      } finally {
        setBuscandoPaciente(false);
      }
    },
    [terminoBusqueda, seleccionarPaciente]
  );

  useEffect(() => {
    let active = true;
    if (initialDni.length >= 7) {
      const runInitialLookup = async () => {
        setBuscandoPaciente(true);
        try {
          const found = await pacientesService.getByDni(initialDni);
          if (active && found) {
            seleccionarPaciente(found);
          }
        } catch {
          // ignore initial prefill error
        } finally {
          if (active) setBuscandoPaciente(false);
        }
      };
      void runInitialLookup();
    }
    return () => {
      active = false;
    };
  }, [initialDni, seleccionarPaciente]);

  return {
    terminoBusqueda,
    setTerminoBusqueda,
    paciente,
    setPaciente,
    pacientesSugeridos,
    buscandoPaciente,
    pacienteError,
    seleccionarPaciente,
    buscarPaciente,
  };
}
