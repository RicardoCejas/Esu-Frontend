import { useState, useEffect, useMemo } from 'react';
import type { Turno } from '@/types';
import {
  calcularMinutosEspera,
  obtenerSemaforoEspera,
  formatearTiempoEspera,
  type SemaforoInfo,
} from '@/lib/telemetriaEspera';

export interface UseTiempoEsperaResult {
  minutos: number;
  semaforo: SemaforoInfo;
  formato: string;
  esCritico: boolean;
}

export function useTiempoEspera(
  horaCheckIn?: string,
  horaTurno?: string,
  refreshIntervalMs = 30000
): UseTiempoEsperaResult {
  const [tick, setTick] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(Date.now());
    }, refreshIntervalMs);

    return () => clearInterval(timer);
  }, [refreshIntervalMs]);

  return useMemo(() => {
    const now = new Date(tick);
    const minutos = calcularMinutosEspera(horaCheckIn, horaTurno, now);
    const semaforo = obtenerSemaforoEspera(minutos);
    const formato = formatearTiempoEspera(minutos);

    return {
      minutos,
      semaforo,
      formato,
      esCritico: semaforo.esCritico,
    };
  }, [horaCheckIn, horaTurno, tick]);
}

export interface TurnoConEspera extends Turno {
  minutosEspera: number;
  semaforo: SemaforoInfo;
  formatoEspera: string;
}

export function useTurnosEsperaOrdenados(
  turnos: Turno[],
  refreshIntervalMs = 30000
): TurnoConEspera[] {
  const [tick, setTick] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(Date.now());
    }, refreshIntervalMs);

    return () => clearInterval(timer);
  }, [refreshIntervalMs]);

  return useMemo(() => {
    const now = new Date(tick);

    const enriched: TurnoConEspera[] = turnos.map((t) => {
      const minutos = calcularMinutosEspera(t.horaCheckIn, t.hora, now);
      const semaforo = obtenerSemaforoEspera(minutos);
      const formatoEspera = formatearTiempoEspera(minutos);

      return {
        ...t,
        minutosEspera: minutos,
        semaforo,
        formatoEspera,
      };
    });

    // Ordenar de mayor a menor tiempo de espera
    return enriched.sort((a, b) => b.minutosEspera - a.minutosEspera);
  }, [turnos, tick]);
}
