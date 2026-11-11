import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function countLines(filePath) {
  const content = fs.readFileSync(path.join(ROOT, filePath), 'utf8');
  return content.split(/\r?\n/).length;
}

function readFile(filePath) {
  return fs.readFileSync(path.join(ROOT, filePath), 'utf8');
}

describe('Fase 8: Centro Médico — Métricas, Reportes y Cierre', () => {
  it('1. Endpoints de reportes y métricas están alineados en endpoints.ts', () => {
    const content = readFile('src/api/endpoints.ts');
    assert.ok(content.includes('excelTurnos: \'/reportes/turnos/excel\''), 'Debe existir excelTurnos');
    assert.ok(content.includes('pdfTurnos: \'/reportes/turnos/pdf\''), 'Debe existir pdfTurnos');
    assert.ok(content.includes('csvTurnos: \'/reportes/turnos/csv\''), 'Debe existir csvTurnos');
    assert.ok(content.includes('pacientesCsv: \'/reportes/pacientes/csv\''), 'Debe existir pacientesCsv');
  });

  it('2. reportesService implementa exportaciones oficiales Excel, PDF y CSV con triggerFileDownload', () => {
    const content = readFile('src/api/reportesService.ts');
    assert.ok(content.includes('export function triggerFileDownload'), 'Debe exportar triggerFileDownload');
    assert.ok(content.includes('exportarTurnosExcel'), 'Debe tener exportarTurnosExcel');
    assert.ok(content.includes('exportarTurnosPdf'), 'Debe tener exportarTurnosPdf');
    assert.ok(content.includes('exportarTurnosCsv'), 'Debe tener exportarTurnosCsv');
    assert.ok(content.includes('exportarPacientesCsv'), 'Debe tener exportarPacientesCsv');
  });

  it('3. metricasService soporta filtros por profesionalId y consultorio, y duración promedio nullable', () => {
    const content = readFile('src/api/metricasService.ts');
    assert.ok(content.includes('profesionalId?: number | string | null;'), 'DashboardMetricas debe tener profesionalId');
    assert.ok(content.includes('consultorio?: string | null;'), 'DashboardMetricas debe tener consultorio');
    assert.ok(content.includes('tiempoPromedioConsultaMinutos: number | null;'), 'tiempoPromedioConsultaMinutos debe ser nullable');
    assert.ok(content.includes('getAusentismoPorProfesional'), 'Debe soportar getAusentismoPorProfesional');
  });

  it('4. MetricasCentroKpiGrid y useMetricasCentro manejan duración honesta y descargas oficiales', () => {
    const kpiContent = readFile('src/features/recepcion/components/MetricasCentroKpiGrid.tsx');
    assert.ok(!kpiContent.includes('?? 20'), 'No debe tener fallback silencioso ?? 20');
    assert.ok(kpiContent.includes('Sin datos'), 'Debe mostrar Sin datos cuando sea null');

    const hookContent = readFile('src/features/recepcion/hooks/useMetricasCentro.ts');
    assert.ok(hookContent.includes('descargarExcelOficial'), 'useMetricasCentro debe tener descargarExcelOficial');
    assert.ok(hookContent.includes('descargarPdfOficial'), 'useMetricasCentro debe tener descargarPdfOficial');
    assert.ok(hookContent.includes('exportarCSV'), 'useMetricasCentro debe tener exportarCSV');
  });

  it('5. Cumplimiento estricto de límites de líneas SSOT (.agents/AGENTS.md)', () => {
    const limits = [
      { file: 'src/features/recepcion/MetricasCentroPage.tsx', max: 400 },
      { file: 'src/features/recepcion/GestionTurnosAdminPage.tsx', max: 400 },
      { file: 'src/features/recepcion/PadronPacientesPage.tsx', max: 400 },
      { file: 'src/features/recepcion/hooks/useMetricasCentro.ts', max: 250 },
      { file: 'src/features/recepcion/components/MetricasCentroFiltersBar.tsx', max: 150 },
      { file: 'src/features/recepcion/components/MetricasCentroHeader.tsx', max: 150 },
      { file: 'src/features/recepcion/components/MetricasCentroKpiGrid.tsx', max: 150 },
      { file: 'src/features/recepcion/components/MetricasCentroEstadoBreakdown.tsx', max: 150 },
      { file: 'src/api/reportesService.ts', max: 250 },
    ];

    for (const { file, max } of limits) {
      const lines = countLines(file);
      assert.ok(
        lines <= max,
        `El archivo ${file} tiene ${lines} líneas, superando el límite estricto de ${max}`
      );
    }
  });
});
