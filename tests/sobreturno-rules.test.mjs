import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validarCupoSobreturno,
  validarDatosSobreturno,
  LIMITE_SOBRETURNOS_DIARIOS,
  MOTIVOS_SOBRETURNO,
} from '../src/lib/sobreturnoRules.ts';

describe('HU-INT-05: Validación de Reglas de Sobreturnos y Consultorios', () => {
  describe('validarCupoSobreturno', () => {
    it('debe permitir solicitar sobreturnos cuando no se alcanzó el cupo máximo de 3', () => {
      const res0 = validarCupoSobreturno(0);
      assert.equal(res0.cupoAlcanzado, false);
      assert.equal(res0.cuposRestantes, LIMITE_SOBRETURNOS_DIARIOS);

      const res2 = validarCupoSobreturno(2);
      assert.equal(res2.cupoAlcanzado, false);
      assert.equal(res2.cuposRestantes, 1);
    });

    it('debe bloquear la solicitud cuando se alcanza o supera el cupo de 3 sobreturnos', () => {
      const res3 = validarCupoSobreturno(3);
      assert.equal(res3.cupoAlcanzado, true);
      assert.equal(res3.cuposRestantes, 0);

      const res4 = validarCupoSobreturno(5);
      assert.equal(res4.cupoAlcanzado, true);
      assert.equal(res4.cuposRestantes, 0);
    });
  });

  describe('validarDatosSobreturno', () => {
    const validBase = {
      profesionalId: '10',
      centroSaludId: '1',
      sobreturnosHoyCount: 1,
      nombre: 'Carlos',
      apellido: 'Tevez',
      dni: '32111222',
      motivo: MOTIVOS_SOBRETURNO[0],
      observacion: 'Dolor agudo',
    };

    it('debe aceptar datos válidos y componer el motivo completo', () => {
      const res = validarDatosSobreturno(validBase);
      assert.equal(res.valido, true);
      assert.ok(res.motivoCompleto.includes('Urgencia Menor'));
      assert.ok(res.motivoCompleto.includes('Dolor agudo'));
    });

    it('debe rechazar si el cupo ya fue alcanzado', () => {
      const res = validarDatosSobreturno({
        ...validBase,
        sobreturnosHoyCount: 3,
      });
      assert.equal(res.valido, false);
      assert.ok(res.error?.includes('Cupo máximo'));
    });

    it('debe rechazar fail-closed si falta el centro de salud', () => {
      const res = validarDatosSobreturno({
        ...validBase,
        centroSaludId: undefined,
      });
      assert.equal(res.valido, false);
      assert.ok(res.error?.includes('centro de salud es obligatorio'));
    });

    it('debe rechazar fail-closed si falta el profesional', () => {
      const res = validarDatosSobreturno({
        ...validBase,
        profesionalId: '',
      });
      assert.equal(res.valido, false);
      assert.ok(res.error?.includes('profesional médico es obligatorio'));
    });

    it('debe rechazar nombres o apellidos vacíos', () => {
      const resNombre = validarDatosSobreturno({ ...validBase, nombre: '   ' });
      assert.equal(resNombre.valido, false);

      const resApellido = validarDatosSobreturno({ ...validBase, apellido: '' });
      assert.equal(resApellido.valido, false);
    });

    it('debe rechazar DNIs inválidos fuera del rango argentino de 7 a 8 dígitos', () => {
      assert.equal(validarDatosSobreturno({ ...validBase, dni: '1234' }).valido, false);
      assert.equal(validarDatosSobreturno({ ...validBase, dni: '123456' }).valido, false);
      assert.equal(validarDatosSobreturno({ ...validBase, dni: '123456789' }).valido, false);
      assert.equal(validarDatosSobreturno({ ...validBase, dni: '12345678901' }).valido, false);
      assert.equal(validarDatosSobreturno({ ...validBase, dni: '7123456' }).valido, true);
      assert.equal(validarDatosSobreturno({ ...validBase, dni: '32123456' }).valido, true);
    });

    it('debe rechazar si el motivo total supera los 255 caracteres', () => {
      const obsGigante = 'z'.repeat(260);
      const res = validarDatosSobreturno({ ...validBase, observacion: obsGigante });
      assert.equal(res.valido, false);
      assert.ok(res.error?.includes('255'));
    });
  });
});
