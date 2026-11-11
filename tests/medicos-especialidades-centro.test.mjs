import test from 'node:test'
import assert from 'node:assert/strict'

test('Doctors by center filters doctors assigned to the active health center', () => {
  const doctorsMock = [
    { id: '1', nombre: 'Juan', apellido: 'Perez', especialidadId: '10', centrosSaludIds: ['1', '2'] },
    { id: '2', nombre: 'Ana', apellido: 'Lopez', especialidadId: '10', centrosSaludIds: ['2'] },
    { id: '3', nombre: 'Carlos', apellido: 'Gomez', especialidadId: '20', centrosSaludIds: ['1'] },
  ]

  const activeCentroId = '2'
  const doctorsInCenter2 = doctorsMock.filter(p => p.centrosSaludIds.includes(activeCentroId))
  assert.equal(doctorsInCenter2.length, 2)
  assert.equal(doctorsInCenter2.some(d => d.id === '3'), false)

  const pediatricsInCenter2 = doctorsInCenter2.filter(p => p.especialidadId === '10')
  assert.equal(pediatricsInCenter2.length, 2)
})

test('Consultorio creation payload validates required physical number without dummy fallback', () => {
  const buildConsultorioPayload = (centroId, numero, planta, especialidad) => {
    const numClean = (numero ?? '').trim()
    if (!numClean) {
      throw new Error('El número o identificador del consultorio es obligatorio.')
    }
    const cId = Number(String(centroId).replace(/\D/g, ''))
    if (!Number.isFinite(cId) || cId <= 0) {
      throw new Error('Debe especificar un centro de salud válido.')
    }
    return {
      centroSaludId: cId,
      numero: numClean,
      planta: planta || 'Planta Baja',
      especialidadAsignada: especialidad?.trim() || undefined,
      activo: true,
    }
  }

  assert.throws(() => buildConsultorioPayload(1, '', 'Planta Baja'), /El número o identificador del consultorio es obligatorio/)
  assert.throws(() => buildConsultorioPayload(null, '101', 'Planta Baja'), /Debe especificar un centro de salud válido/)

  const valid = buildConsultorioPayload('1', '105', '1° Piso', 'Cardiología')
  assert.equal(valid.centroSaludId, 1)
  assert.equal(valid.numero, '105')
  assert.equal(valid.planta, '1° Piso')
  assert.equal(valid.especialidadAsignada, 'Cardiología')
})
