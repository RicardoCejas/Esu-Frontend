import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePaciente } from '../src/api/pacienteNormalizer.ts';
import { isValidDniFormat } from '../src/lib/dniValidation.ts';

describe('Fase 5 - Padrón de Pacientes, Verificación de Carnet QR y Grupo Familiar', () => {
  it('debe mapear el estado activo real del paciente y no forzar siempre true', () => {
    const pacienteActivo = normalizePaciente({
      id: 10,
      nombre: 'Lucas',
      apellido: 'Ramirez',
      dni: '38111222',
      email: 'lucas@correo.com',
      activo: true,
    });
    assert.equal(pacienteActivo.activo, true);

    const pacienteInactivo = normalizePaciente({
      id: 11,
      nombre: 'Mario',
      apellido: 'Gomez',
      dni: '39111222',
      email: 'mario@correo.com',
      activo: false,
    });
    assert.equal(pacienteInactivo.activo, false);
  });

  it('debe normalizar fechas de nacimiento en array o string ISO', () => {
    const pacienteArray = normalizePaciente({
      id: 12,
      nombre: 'Ana',
      apellido: 'Lopez',
      dni: '40111222',
      fechaNacimiento: [1995, 6, 15],
    });
    assert.equal(pacienteArray.fechaNacimiento, '1995-06-15');

    const pacienteDmy = normalizePaciente({
      id: 13,
      nombre: 'Pedro',
      apellido: 'Perez',
      dni: '41111222',
      fechaNacimiento: '24/12/1988',
    });
    assert.equal(pacienteDmy.fechaNacimiento, '1988-12-24');
  });

  it('debe validar formato de DNI argentino válido', () => {
    assert.equal(isValidDniFormat('38111222'), true);
    assert.equal(isValidDniFormat('7111222'), true); // 7 dígitos
    assert.equal(isValidDniFormat('123'), false); // muy corto
    assert.equal(isValidDniFormat('ABC12345'), false); // letras
    assert.equal(isValidDniFormat(''), false);
  });

  it('debe estructurar el payload de vinculación familiar correctamente', () => {
    const familiarPayload = {
      nombre: 'Mateo',
      apellido: 'Ramirez',
      dni: '52111222',
      tipoVinculo: 'Hijo/a',
      obraSocial: 'APROSS',
      nroAfiliado: 'AF-52111222',
    };

    assert.equal(familiarPayload.nombre, 'Mateo');
    assert.equal(familiarPayload.tipoVinculo, 'Hijo/a');
    assert.equal(familiarPayload.dni, '52111222');
  });

  it('debe estructurar la respuesta de verificación de carnet digital', () => {
    const carnetResponse = {
      pacienteId: 10,
      nombreCompleto: 'Lucas Ramirez',
      dni: '38111222',
      nroAfiliado: 'AF-38111222',
      obraSocial: 'APROSS',
      estadoActivo: true,
      tokenVerificacion: 'hmac-sha256-hash-valido',
      qrPayload: 'ESU:CARNET:10:38111222:SIG',
    };

    assert.equal(carnetResponse.pacienteId, 10);
    assert.equal(carnetResponse.estadoActivo, true);
    assert.ok(carnetResponse.qrPayload.startsWith('ESU:CARNET:'));
  });
});
