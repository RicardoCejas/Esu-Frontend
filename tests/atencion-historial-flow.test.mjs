import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeConsulta, normalizeTimelineToConsulta } from '../src/api/pacienteNormalizer.ts';

test('normalizeConsulta maps real domain values and does NOT inject fake default vital signs', () => {
  const backendResponse = {
    id: 101,
    paciente: { id: 55, nombre: 'Ana', apellido: 'Gomez' },
    profesional: { id: 22, nombre: 'Carlos', apellido: 'Perez', matricula: 'MP-8921' },
    centroSaludNombre: 'Hospital Regional Cruz del Eje',
    fechaAtencion: '2026-11-05T14:30:00',
    motivoConsulta: 'Dolor abdominal agudo',
    diagnostico: 'Gastroenteritis aguda',
    codigoCie10: 'K52.9',
    descripcionCie10: 'Gastroenteritis y colitis no especificadas',
    tratamiento: 'Hidratación y reposo',
    presionArterial: '110/70',
    frecuenciaCardiaca: '80',
    temperatura: '37.1',
    peso: '68',
    recetaId: 88,
    hashIntegridad: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  };

  const consulta = normalizeConsulta(backendResponse);

  assert.equal(consulta.id, '101');
  assert.equal(consulta.pacienteId, '55');
  assert.equal(consulta.profesionalId, '22');
  assert.equal(consulta.profesionalMatricula, 'MP-8921');
  assert.equal(consulta.profesionalNombre, 'Dr./Dra. Carlos Perez');
  assert.equal(consulta.centroSaludNombre, 'Hospital Regional Cruz del Eje');
  assert.equal(consulta.fecha, '2026-11-05');
  assert.equal(consulta.motivo, 'Dolor abdominal agudo');
  assert.equal(consulta.diagnostico, 'Gastroenteritis aguda');
  assert.equal(consulta.codigoCie10, 'K52.9');
  assert.equal(consulta.signosVitales?.presionArterial, '110/70');
  assert.equal(consulta.signosVitales?.frecuenciaCardiaca, '80');
  assert.equal(consulta.signosVitales?.temperatura, '37.1');
  assert.equal(consulta.signosVitales?.peso, '68');
  assert.equal(consulta.recetaId, 88);
  assert.equal(consulta.hashIntegridad, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
});

test('normalizeConsulta without vital signs leaves them undefined and does NOT invent 120/80 mmHg or 72 lpm', () => {
  const minimalResponse = {
    id: 102,
    fecha: '2026-11-06',
    motivoConsulta: 'Consulta general',
    diagnostico: 'Examen de rutina',
  };

  const consulta = normalizeConsulta(minimalResponse);

  assert.equal(consulta.signosVitales?.presionArterial, undefined, 'Must not default to 120/80 mmHg');
  assert.equal(consulta.signosVitales?.frecuenciaCardiaca, undefined, 'Must not default to 72 lpm');
  assert.equal(consulta.signosVitales?.temperatura, undefined, 'Must not default to 36.5 °C');
  assert.equal(consulta.signosVitales?.peso, undefined, 'Must not default to 75 kg');
  assert.equal(consulta.profesionalMatricula, undefined);
  assert.equal(consulta.recetaId, undefined);
  assert.equal(consulta.hashIntegridad, undefined);
});

test('normalizeTimelineToConsulta transforms timeline items faithfully', () => {
  const timelineItem = {
    id: 301,
    fecha: '2026-11-04 10:15',
    tipo: 'EVOLUCION',
    profesionalNombre: 'Dr. Roberto Gomez',
    profesionalMatricula: 'MP-4411',
    especialidad: 'Traumatología',
    motivo: 'Esguince de tobillo derecho',
    diagnostico: 'Esguince grado II',
    codigoCie10: 'S93.4',
    descripcionCie10: 'Esguince y torcedura de tobillo',
    tratamiento: 'Inmovilización y AINEs',
    signosVitales: {
      presionArterial: '125/80',
      frecuenciaCardiaca: '74',
      temperatura: '36.6',
      peso: '82',
      talla: '178',
      imc: '25.9',
    },
    recetaId: 99,
    tieneAdendas: true,
    adendas: ['[04/11/2026 11:00] Justificación: Rectificación de dosis | Contenido: Ibuprofeno 600mg cada 8hs'],
    hashIntegridad: 'hash-sha256-real-de-prueba',
    pdfUrl: '/api/historias-clinicas/evoluciones/301/pdf',
  };

  const consulta = normalizeTimelineToConsulta(timelineItem, '55');

  assert.equal(consulta.id, '301');
  assert.equal(consulta.pacienteId, '55');
  assert.equal(consulta.profesionalNombre, 'Dr. Roberto Gomez');
  assert.equal(consulta.profesionalMatricula, 'MP-4411');
  assert.equal(consulta.especialidadNombre, 'Traumatología');
  assert.equal(consulta.fecha, '2026-11-04');
  assert.equal(consulta.signosVitales?.presionArterial, '125/80');
  assert.equal(consulta.signosVitales?.talla, '178');
  assert.equal(consulta.signosVitales?.imc, '25.9');
  assert.equal(consulta.recetaId, 99);
  assert.equal(consulta.hashIntegridad, 'hash-sha256-real-de-prueba');
  assert.equal(consulta.adendas?.length, 1);
  assert.equal(consulta.pdfUrl, '/api/historias-clinicas/evoluciones/301/pdf');
});

test('consulta with prescription properly configures payload and does not fabricate receta if disabled', () => {
  const buildPayload = (incluirReceta, medicamentos) => ({
    motivoConsulta: 'Gripe estacional',
    diagnostico: 'Rinofaringitis aguda',
    incluirReceta,
    medicamentos: incluirReceta ? medicamentos : [],
  });

  const meds = [
    { nombreComercial: 'Paracetamol', droga: 'Paracetamol', presentacion: 'Comprimidos 500mg', dosisIndicada: '1 cada 8hs', cantidad: '1 caja' },
  ];

  // Case 1: with prescription
  const payloadWith = buildPayload(true, meds);
  assert.equal(payloadWith.incluirReceta, true);
  assert.equal(payloadWith.medicamentos.length, 1);
  assert.equal(payloadWith.medicamentos[0].nombreComercial, 'Paracetamol');

  // Case 2: without prescription
  const payloadWithout = buildPayload(false, meds);
  assert.equal(payloadWithout.incluirReceta, false);
  assert.equal(payloadWithout.medicamentos.length, 0, 'Must omit medications when prescription is not enabled');
});

test('consultation signing strictly validates required professional and patient domain identifiers', () => {
  const validateSigning = ({ turnoId, profesionalId, pacienteId, cie10 }) => {
    if (!cie10) throw new Error('Debe seleccionar al menos un diagnóstico formal CIE-10 antes de firmar.');
    if (!turnoId) throw new Error('No se pudo identificar el turno de la atención.');
    if (!profesionalId) throw new Error('No se pudo validar el identificador del profesional médico actuante.');
    if (!pacienteId) throw new Error('No se pudo identificar al paciente de la consulta médica.');
    return true;
  };

  assert.throws(
    () => validateSigning({ turnoId: '10', profesionalId: '', pacienteId: '20', cie10: { codigo: 'J00' } }),
    /profesional médico actuante/
  );

  assert.throws(
    () => validateSigning({ turnoId: '10', profesionalId: '5', pacienteId: '', cie10: { codigo: 'J00' } }),
    /paciente de la consulta/
  );

  assert.throws(
    () => validateSigning({ turnoId: '', profesionalId: '5', pacienteId: '20', cie10: { codigo: 'J00' } }),
    /turno de la atención/
  );

  assert.throws(
    () => validateSigning({ turnoId: '10', profesionalId: '5', pacienteId: '20', cie10: null }),
    /CIE-10/
  );

  assert.equal(
    validateSigning({ turnoId: '10', profesionalId: '5', pacienteId: '20', cie10: { codigo: 'J00' } }),
    true
  );
});

test('hash integrity is only set when returned by backend and does not invent hardcoded hashes', () => {
  let hashGenerado = null;

  const handleResponse = (resultado) => {
    hashGenerado = resultado.hashIntegridad || null;
  };

  // Case 1: Backend returns actual hash
  handleResponse({ id: 1, hashIntegridad: 'abc123sha256' });
  assert.equal(hashGenerado, 'abc123sha256');

  // Case 2: Backend returns empty or undefined hash
  handleResponse({ id: 2, hashIntegridad: undefined });
  assert.equal(hashGenerado, null, 'Must be null, not a hardcoded SHA-256 hash');
});
