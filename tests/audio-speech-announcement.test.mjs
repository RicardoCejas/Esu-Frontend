import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  clampVolume,
  construirMensajeLlamado,
  audioSpeechService,
} from '../src/lib/audioSpeechService.ts';

describe('HU-INT-03: Servicio Desacoplado de Audio Chime y Síntesis de Voz', () => {
  describe('clampVolume', () => {
    it('debe delimitar el volumen estrictamente entre 0.0 y 1.0', () => {
      assert.equal(clampVolume(-0.5), 0);
      assert.equal(clampVolume(1.8), 1);
      assert.equal(clampVolume(0.45), 0.45);
      assert.equal(clampVolume(0), 0);
      assert.equal(clampVolume(1), 1);
    });

    it('debe devolver 0.7 ante valores nulos, indefinidos o no numéricos', () => {
      assert.equal(clampVolume(undefined), 0.7);
      assert.equal(clampVolume(null), 0.7);
      assert.equal(clampVolume(NaN), 0.7);
      assert.equal(clampVolume(Infinity), 0.7);
    });
  });

  describe('construirMensajeLlamado', () => {
    it('debe construir la locución para paciente con consultorio asignado', () => {
      const msg = construirMensajeLlamado('Juan Carlos Gomez', '104');
      assert.equal(msg, 'Paciente Juan Carlos Gomez, dirigirse a Consultorio 104.');
    });

    it('debe construir la locución a recepción si el consultorio no está definido', () => {
      const msgVacio = construirMensajeLlamado('Maria Rodriguez', '');
      assert.equal(msgVacio, 'Paciente Maria Rodriguez, por favor acercarse a recepción.');

      const msgUndefined = construirMensajeLlamado('Pedro Pascal', undefined);
      assert.equal(msgUndefined, 'Paciente Pedro Pascal, por favor acercarse a recepción.');
    });

    it('debe tratar "S/N" como recepción', () => {
      const msgSN = construirMensajeLlamado('Lucia Rossi', 'S/N');
      assert.equal(msgSN, 'Paciente Lucia Rossi, por favor acercarse a recepción.');
    });

    it('debe limpiar espacios en blanco de paciente y consultorio', () => {
      const msg = construirMensajeLlamado('   Ana Valdez   ', '  2B  ');
      assert.equal(msg, 'Paciente Ana Valdez, dirigirse a Consultorio 2B.');
    });
  });

  describe('AudioSpeechService tolerancia a SSR / Node environment', () => {
    it('debe informar soporte falso en entorno sin navegador sin arrojar excepciones', () => {
      assert.equal(audioSpeechService.isAudioSupported(), false);
      assert.equal(audioSpeechService.isSpeechSupported(), false);
    });

    it('debe resolver llamadas asíncronas limpiamente sin lanzar excepciones no controladas', async () => {
      await assert.doesNotReject(async () => {
        await audioSpeechService.playChime(0.5);
        await audioSpeechService.speakText('Prueba de audio');
        await audioSpeechService.anunciarLlamado('Juan Perez', '1');
        audioSpeechService.cancelAll();
      });
    });
  });
});
