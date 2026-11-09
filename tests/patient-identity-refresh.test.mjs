import test from 'node:test'
import assert from 'node:assert/strict'
import { refreshSingleFlight } from '../src/api/tokenStorage.ts'
import { esPacienteDniVerificado } from '../src/lib/identityValidation.ts'
import { MOCK_CENTERS } from '../src/features/turnero/data/mockTurneroData.ts'

test('refreshSingleFlight deduplicates concurrent refresh calls into one execution', async () => {
  let executions = 0

  const task = async () => {
    executions++
    await new Promise((resolve) => setTimeout(resolve, 25))
    return `token-${executions}`
  }

  const [t1, t2, t3] = await Promise.all([
    refreshSingleFlight.run(task),
    refreshSingleFlight.run(task),
    refreshSingleFlight.run(task),
  ])

  assert.equal(executions, 1)
  assert.equal(t1, 'token-1')
  assert.equal(t2, 'token-1')
  assert.equal(t3, 'token-1')

  // Subsequent execution after settlement starts a new task
  const t4 = await refreshSingleFlight.run(task)
  assert.equal(executions, 2)
  assert.equal(t4, 'token-2')
})

test('esPacienteDniVerificado validates hydrated patient fields without placeholder values', () => {
  // Google placeholder DNI is never considered verified
  assert.equal(
    esPacienteDniVerificado({
      id: '31',
      nombre: 'Ricardo',
      apellido: 'Cejas',
      email: 'ricardo@gmail.com',
      dni: 'G-12345678',
      rol: 'PACIENTE',
      telefono: '3549-654321',
      fechaNacimiento: '1993-08-14',
      activo: true,
    }),
    false
  )

  // Placeholder phone without dniVerificado flag is treated as incomplete
  assert.equal(
    esPacienteDniVerificado({
      id: '31',
      nombre: 'Ricardo',
      apellido: 'Cejas',
      email: 'ricardo@gmail.com',
      dni: '40026880',
      rol: 'PACIENTE',
      telefono: '3549000000',
      fechaNacimiento: '1993-08-14',
      activo: true,
    }),
    false
  )

  // Valid 7-8 digit DNI + real phone + birth date recognizes complete identity
  assert.equal(
    esPacienteDniVerificado({
      id: '31',
      nombre: 'Ricardo',
      apellido: 'Cejas',
      email: 'ricardo@gmail.com',
      dni: '40026880',
      rol: 'PACIENTE',
      telefono: '3549-654321',
      fechaNacimiento: '1993-08-14',
      activo: true,
    }),
    true
  )
})

test('Centro de Diagnóstico por Imágenes Cruz del Eje exposes non-zero study count matching disponibles', () => {
  const centroDiag = MOCK_CENTERS.find((c) => c.id === 'cde-centro-diag')
  assert.ok(centroDiag)
  assert.equal(centroDiag.permiteConsultas, false)
  assert.ok(Array.isArray(centroDiag.estudiosDisponibles))
  assert.equal(centroDiag.specialtiesCount, centroDiag.estudiosDisponibles.length)
  assert.ok(centroDiag.specialtiesCount > 0)
})
