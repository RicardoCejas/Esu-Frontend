import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseHoraToMinutes,
  calcularMinutosEspera,
  obtenerSemaforoEspera,
  formatearTiempoEspera,
} from '../src/lib/telemetriaEspera.ts';

describe('HU-INT-02: Telemetría de Tiempos de Espera y Semáforo Clínico', () => {
  describe('parseHoraToMinutes', () => {
    it('debe parsear strings HH:mm a minutos totales del día', () => {
      assert.equal(parseHoraToMinutes('00:00'), 0);
      assert.equal(parseHoraToMinutes('09:30'), 570);
      assert.equal(parseHoraToMinutes('14:45'), 885);
      assert.equal(parseHoraToMinutes('23:59'), 1439);
    });

    it('debe soportar timestamps con formato ISO que contengan T', () => {
      assert.equal(parseHoraToMinutes('2026-11-09T10:15:00'), 615);
    });

    it('debe devolver null ante valores inválidos o corruptos', () => {
      assert.equal(parseHoraToMinutes(undefined), null);
      assert.equal(parseHoraToMinutes(''), null);
      assert.equal(parseHoraToMinutes('invalido'), null);
      assert.equal(parseHoraToMinutes('25:00'), null);
      assert.equal(parseHoraToMinutes('12:65'), null);
    });
  });

  describe('calcularMinutosEspera', () => {
    it('debe calcular la diferencia exacta respecto a horaCheckIn', () => {
      const simulatedNow = new Date('2026-11-09T10:35:00'); // 10:35 hs (635 min)
      const minutos = calcularMinutosEspera('10:10', '10:00', simulatedNow);
      assert.equal(minutos, 25);
    });

    it('debe usar horaTurno como fallback si horaCheckIn está ausente', () => {
      const simulatedNow = new Date('2026-11-09T11:20:00'); // 11:20 hs (680 min)
      const minutos = calcularMinutosEspera(undefined, '11:00', simulatedNow);
      assert.equal(minutos, 20);
    });

    it('debe devolver 0 si el horario es futuro o negativo', () => {
      const simulatedNow = new Date('2026-11-09T08:00:00'); // 08:00 hs
      const minutos = calcularMinutosEspera('09:30', '09:30', simulatedNow);
      assert.equal(minutos, 0);
    });

    it('debe devolver 0 si no se cuenta con ningún horario válido', () => {
      assert.equal(calcularMinutosEspera(undefined, undefined), 0);
    });
  });

  describe('obtenerSemaforoEspera', () => {
    it('debe clasificar 0 a 14 minutos como ÓPTIMO (Verde)', () => {
      const res0 = obtenerSemaforoEspera(0);
      assert.equal(res0.nivel, 'optimo');
      assert.equal(res0.esCritico, false);

      const res14 = obtenerSemaforoEspera(14);
      assert.equal(res14.nivel, 'optimo');
    });

    it('debe clasificar 15 a 29 minutos como MODERADO (Ámbar)', () => {
      const res15 = obtenerSemaforoEspera(15);
      assert.equal(res15.nivel, 'moderado');
      assert.equal(res15.esCritico, false);

      const res29 = obtenerSemaforoEspera(29);
      assert.equal(res29.nivel, 'moderado');
    });

    it('debe clasificar >= 30 minutos como CRÍTICO (Rojo)', () => {
      const res30 = obtenerSemaforoEspera(30);
      assert.equal(res30.nivel, 'critico');
      assert.equal(res30.esCritico, true);

      const res65 = obtenerSemaforoEspera(65);
      assert.equal(res65.nivel, 'critico');
      assert.equal(res65.esCritico, true);
    });
  });

  describe('formatearTiempoEspera', () => {
    it('debe formatear minutos amigablemente', () => {
      assert.equal(formatearTiempoEspera(0), '< 1 min');
      assert.equal(formatearTiempoEspera(-5), '< 1 min');
      assert.equal(formatearTiempoEspera(8), '8 min');
      assert.equal(formatearTiempoEspera(60), '1h');
      assert.equal(formatearTiempoEspera(75), '1h 15m');
      assert.equal(formatearTiempoEspera(130), '2h 10m');
    });
  });
});
