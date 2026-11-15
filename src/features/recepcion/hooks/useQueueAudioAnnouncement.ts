import { useState, useEffect, useCallback } from 'react';
import { audioSpeechService, clampVolume } from '@/lib/audioSpeechService';

const STORAGE_KEY = 'esu_audio_announcement_config';

interface StoredAudioConfig {
  sonidoHabilitado: boolean;
  vozHabilitada: boolean;
  volumen: number;
}

export function useQueueAudioAnnouncement() {
  const [sonidoHabilitado, setSonidoHabilitadoState] = useState<boolean>(true);
  const [vozHabilitada, setVozHabilitadaState] = useState<boolean>(true);
  const [volumen, setVolumenState] = useState<number>(0.7);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Carga inicial de preferencias desde localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as StoredAudioConfig;
        if (typeof parsed.sonidoHabilitado === 'boolean') setSonidoHabilitadoState(parsed.sonidoHabilitado);
        if (typeof parsed.vozHabilitada === 'boolean') setVozHabilitadaState(parsed.vozHabilitada);
        if (typeof parsed.volumen === 'number') setVolumenState(clampVolume(parsed.volumen));
      }
    } catch {
      // Ignorar fallas de lectura de localStorage
    }
  }, []);

  // Persistir cambios
  const persistConfig = useCallback((sonido: boolean, voz: boolean, vol: number) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ sonidoHabilitado: sonido, vozHabilitada: voz, volumen: vol })
      );
    } catch {
      // Ignorar fallas de escritura de localStorage
    }
  }, []);

  const toggleSonido = useCallback(() => {
    setSonidoHabilitadoState((prev) => {
      const next = !prev;
      persistConfig(next, vozHabilitada, volumen);
      return next;
    });
  }, [vozHabilitada, volumen, persistConfig]);

  const toggleVoz = useCallback(() => {
    setVozHabilitadaState((prev) => {
      const next = !prev;
      persistConfig(sonidoHabilitado, next, volumen);
      return next;
    });
  }, [sonidoHabilitado, volumen, persistConfig]);

  const setVolumen = useCallback(
    (val: number) => {
      const clamped = clampVolume(val);
      setVolumenState(clamped);
      persistConfig(sonidoHabilitado, vozHabilitada, clamped);
    },
    [sonidoHabilitado, vozHabilitada, persistConfig]
  );

  const anunciarLlamado = useCallback(
    async (pacienteNombre: string, consultorioNumero?: string) => {
      if (!sonidoHabilitado) return;

      setIsSpeaking(true);
      try {
        await audioSpeechService.anunciarLlamado(pacienteNombre, consultorioNumero, {
          volumen,
          vozHabilitada,
        });
      } finally {
        setIsSpeaking(false);
      }
    },
    [sonidoHabilitado, vozHabilitada, volumen]
  );

  const probarAudio = useCallback(async () => {
    await anunciarLlamado('Prueba del Sistema', '1');
  }, [anunciarLlamado]);

  return {
    sonidoHabilitado,
    vozHabilitada,
    volumen,
    isSpeaking,
    isAudioSupported: audioSpeechService.isAudioSupported(),
    isSpeechSupported: audioSpeechService.isSpeechSupported(),
    anunciarLlamado,
    probarAudio,
    toggleSonido,
    toggleVoz,
    setVolumen,
  };
}
