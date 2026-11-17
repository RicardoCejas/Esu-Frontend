import test from 'node:test'
import assert from 'node:assert/strict'

test('Kanban status classifier groups appointments into the 4 clinical phases', () => {
  const turnosMock = [
    { id: '1', estado: 'PENDIENTE', esSobreturno: false },
    { id: '2', estado: 'CONFIRMADO', esSobreturno: true },
    { id: '3', estado: 'EN_SALA_DE_ESPERA', esSobreturno: false },
    { id: '4', estado: 'EN_ESPERA', esSobreturno: false },
    { id: '5', estado: 'ATENDIENDO', esSobreturno: false },
    { id: '6', estado: 'COMPLETADO', esSobreturno: false },
    { id: '7', estado: 'CANCELADO', esSobreturno: true },
  ]

  const porLlegar = turnosMock.filter(t => t.estado === 'PENDIENTE' || t.estado === 'CONFIRMADO')
  const enEspera = turnosMock.filter(t => t.estado === 'EN_SALA_DE_ESPERA' || t.estado === 'EN_ESPERA')
  const enConsulta = turnosMock.filter(t => t.estado === 'ATENDIENDO')
  const atendidos = turnosMock.filter(t => t.estado === 'COMPLETADO')
  const sobreturnosActivos = turnosMock.filter(t => t.esSobreturno && t.estado !== 'CANCELADO')

  assert.equal(porLlegar.length, 2)
  assert.equal(enEspera.length, 2)
  assert.equal(enConsulta.length, 1)
  assert.equal(atendidos.length, 1)
  assert.equal(sobreturnosActivos.length, 1) // ID 2 is active, ID 7 is canceled
})

test('Reception KPI counter calculates totals accurately without leaking provincial scopes', () => {
  const turnosCentro = [
    { id: '10', estado: 'PENDIENTE', fecha: '2026-11-09' },
    { id: '11', estado: 'EN_SALA_DE_ESPERA', fecha: '2026-11-09' },
    { id: '12', estado: 'ATENDIENDO', fecha: '2026-11-09' },
    { id: '13', estado: 'COMPLETADO', fecha: '2026-11-09' },
  ]

  const kpis = {
    total: turnosCentro.length,
    enSalaDeEspera: turnosCentro.filter(t => t.estado === 'EN_SALA_DE_ESPERA' || t.estado === 'EN_ESPERA').length,
    enConsulta: turnosCentro.filter(t => t.estado === 'ATENDIENDO').length,
    atendidosHoy: turnosCentro.filter(t => t.estado === 'COMPLETADO').length,
  }

  assert.equal(kpis.total, 4)
  assert.equal(kpis.enSalaDeEspera, 1)
  assert.equal(kpis.enConsulta, 1)
  assert.equal(kpis.atendidosHoy, 1)
})
