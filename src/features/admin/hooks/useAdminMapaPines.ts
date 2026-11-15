import { useCallback, useEffect, useState } from 'react';
import { centrosService } from '@/api/centrosService';
import { useToast } from '@/context/ToastContext';
import {
  CENTROS_DEFAULT_CDE,
  type CentroMapaPin,
  mapCentroSaludToPin,
  mapaCentrosService,
} from '../../home/mapaCentrosData';

/**
 * Loads health centers from backend API (falling back gracefully when offline) and persists pin coordinates.
 */
export function useAdminMapaPines() {
  const { success, error: toastError } = useToast();

  const [centros, setCentros] = useState<CentroMapaPin[]>(() => mapaCentrosService.getCentros());
  const [selectedId, setSelectedId] = useState<string>('cde-hosp-crespo');
  const [currentLat, setCurrentLat] = useState<number>(CENTROS_DEFAULT_CDE[0].lat);
  const [currentLng, setCurrentLng] = useState<number>(CENTROS_DEFAULT_CDE[0].lng);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const selectedCentro = centros.find((c) => c.id === selectedId) || centros[0];

  const loadCentros = useCallback(async () => {
    setLoading(true);
    try {
      const apiCentros = await centrosService.getAll();
      if (apiCentros.length > 0) {
        const pins = apiCentros.map(mapCentroSaludToPin);
        setCentros(pins);
        const active = pins.find((p) => p.id === selectedId) || pins[0];
        if (active) {
          setSelectedId(active.id);
          setCurrentLat(active.lat);
          setCurrentLng(active.lng);
        }
      }
    } catch {
      const fallback = mapaCentrosService.getCentros();
      setCentros(fallback);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    void loadCentros();
    // Initial sync with backend centers on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectCentro = useCallback(
    (id: string) => {
      setSelectedId(id);
      const target = centros.find((c) => c.id === id);
      if (target) {
        setCurrentLat(target.lat);
        setCurrentLng(target.lng);
      }
    },
    [centros]
  );

  const setCoordinates = useCallback((lat: number, lng: number, centroIdToSelect?: string) => {
    if (centroIdToSelect) setSelectedId(centroIdToSelect);
    setCurrentLat(Number(lat.toFixed(6)));
    setCurrentLng(Number(lng.toFixed(6)));
  }, []);

  const guardarCoordenadas = async () => {
    if (!selectedCentro) return;
    if (!Number.isFinite(currentLat) || !Number.isFinite(currentLng)) {
      toastError('Ingresá coordenadas numéricas válidas antes de guardar.');
      return;
    }

    setSaving(true);
    try {
      let updatedPin: CentroMapaPin = {
        ...selectedCentro,
        lat: Number(currentLat.toFixed(6)),
        lng: Number(currentLng.toFixed(6)),
      };

      if (selectedCentro.backendId) {
        const savedCentro = await centrosService.updateCentro(selectedCentro.backendId, {
          nombre: selectedCentro.rawCentro?.nombre ?? selectedCentro.nombre,
          tipo: selectedCentro.rawCentro?.tipo ?? (selectedCentro.tipo === 'DIAGNOSTICO' ? 'CONSULTORIO_PRIVADO' : selectedCentro.tipo),
          direccion: selectedCentro.rawCentro?.direccion ?? selectedCentro.direccion,
          telefono: selectedCentro.rawCentro?.telefono ?? selectedCentro.telefono,
          ciudad: selectedCentro.rawCentro?.ciudad ?? selectedCentro.ciudad,
          horarioAtencion: selectedCentro.rawCentro?.horarioAtencion ?? selectedCentro.horario,
          disponibleGuardia: selectedCentro.esGuardia,
          permiteConsultas: selectedCentro.rawCentro?.permiteConsultas,
          permiteEstudios: selectedCentro.rawCentro?.permiteEstudios,
          cantidadPlantas: selectedCentro.rawCentro?.cantidadPlantas,
          estudiosDisponibles: selectedCentro.rawCentro?.estudiosDisponibles,
          latitud: updatedPin.lat,
          longitud: updatedPin.lng,
        });
        if (savedCentro) {
          updatedPin = mapCentroSaludToPin(savedCentro);
        }
      }

      mapaCentrosService.guardarCoordenadas(selectedCentro.id, updatedPin.lat, updatedPin.lng);
      setCentros((prev) => prev.map((c) => (c.id === selectedCentro.id ? updatedPin : c)));
      setSavedSuccess(true);
      success(`Ubicación de ${updatedPin.nombreCorto} guardada correctamente.`);
      window.setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'No se pudieron guardar las coordenadas.');
    } finally {
      setSaving(false);
    }
  };

  const confirmarRestablecer = async () => {
    setSaving(true);
    try {
      const defaults = mapaCentrosService.restablecerPredeterminados();
      await Promise.all(
        centros.map(async (pin) => {
          const def = defaults.find((d) => d.id === pin.id || d.backendId === pin.backendId);
          if (pin.backendId && def) {
            await centrosService.updateCentro(pin.backendId, {
              nombre: pin.rawCentro?.nombre ?? pin.nombre,
              tipo: pin.rawCentro?.tipo ?? (pin.tipo === 'DIAGNOSTICO' ? 'CONSULTORIO_PRIVADO' : pin.tipo),
              direccion: pin.rawCentro?.direccion ?? pin.direccion,
              latitud: def.lat,
              longitud: def.lng,
            });
          }
        })
      );

      await loadCentros();
      setConfirmResetOpen(false);
      setSavedSuccess(true);
      success('Coordenadas restablecidas a los valores oficiales de Cruz del Eje.');
      window.setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'No se pudieron restablecer todas las ubicaciones.');
    } finally {
      setSaving(false);
    }
  };

  const copiarCoordenadasTS = () => {
    const tsCode =
      `// Coordenadas actualizadas de Cruz del Eje:\n` +
      centros
        .map(
          (c) =>
            `// ${c.nombreCorto}\nlat: ${c.id === selectedId ? currentLat : c.lat},\nlng: ${c.id === selectedId ? currentLng : c.lng},`
        )
        .join('\n\n');
    void navigator.clipboard.writeText(tsCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return {
    centros,
    selectedCentro,
    selectedId,
    currentLat,
    currentLng,
    loading,
    saving,
    savedSuccess,
    copied,
    confirmResetOpen,
    setConfirmResetOpen,
    selectCentro,
    setCoordinates,
    guardarCoordenadas,
    confirmarRestablecer,
    copiarCoordenadasTS,
  };
}
