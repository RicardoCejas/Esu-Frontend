import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMetricasCentro } from './hooks/useMetricasCentro';
import { MetricasCentroHeader, type MetricasTabKey } from './components/MetricasCentroHeader';
import { MetricasCentroFiltersBar } from './components/MetricasCentroFiltersBar';
import { MetricasCentroKpiGrid } from './components/MetricasCentroKpiGrid';
import { MetricasCentroDemandaPanel } from './components/MetricasCentroDemandaPanel';
import { MetricasCentroOcupacionPanel } from './components/MetricasCentroOcupacionPanel';

export const MetricasCentroPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: MetricasTabKey = searchParams.get('tab') === 'ocupacion' ? 'ocupacion' : 'resumen';
  const state = useMetricasCentro(user?.centroSaludId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 print:p-0 print:space-y-4">
      <MetricasCentroHeader
        centroNombre={user?.centroSaludNombre}
        respuestaIncompleta={state.metricas?.respuestaIncompleta}
        cargando={state.cargando}
        hasMetricas={!!state.metricas}
        activeTab={activeTab}
        onTabChange={(tab) => setSearchParams({ tab }, { replace: true })}
        onExportCsv={state.exportarCSV}
        onRefresh={state.cargarDatos}
      />

      <MetricasCentroFiltersBar
        fechaDesde={state.fechaDesde}
        onFechaDesdeChange={state.setFechaDesde}
        fechaHasta={state.fechaHasta}
        onFechaHastaChange={state.setFechaHasta}
        especialidad={state.especialidad}
        onEspecialidadChange={state.setEspecialidad}
        especialidadesOpciones={state.especialidadesConocidas}
        periodoDescripcion={state.metricas?.periodoDescripcion}
        horaActualizacion={state.horaActualizacion}
        vistaTabular={state.vistaTabular}
        onToggleVistaTabular={() => state.setVistaTabular((v) => !v)}
      />

      {state.errorCarga && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30 p-4 text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" aria-hidden="true" />
            <span>{state.errorCarga}</span>
          </div>
          <button
            type="button"
            onClick={state.cargarDatos}
            className="rounded-lg bg-rose-700 hover:bg-rose-800 px-3 py-1.5 font-semibold text-white cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {state.cargando && !state.metricas && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <RefreshCw className="h-7 w-7 text-primary animate-spin" aria-hidden="true" />
          <p className="text-xs font-semibold text-muted-foreground">Calculando indicadores del centro...</p>
        </div>
      )}

      {state.metricas && (
        <>
          <MetricasCentroKpiGrid metricas={state.metricas} />
          {activeTab === 'resumen' ? (
            <MetricasCentroDemandaPanel
              metricas={state.metricas}
              demandaSemanalGrafico={state.demandaSemanalGrafico}
              especialidadesGrafico={state.especialidadesGrafico}
              vistaTabular={state.vistaTabular}
            />
          ) : (
            <MetricasCentroOcupacionPanel
              metricas={state.metricas}
              dualBarData={state.dualBarData}
              trendLineData={state.trendLineData}
              vistaTabular={state.vistaTabular}
            />
          )}
        </>
      )}
    </div>
  );
};
