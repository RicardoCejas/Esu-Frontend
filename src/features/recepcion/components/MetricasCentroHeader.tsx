import React from 'react';
import { FileSpreadsheet, Printer, RefreshCw, BarChart3, TrendingUp } from 'lucide-react';

export type MetricasTabKey = 'resumen' | 'ocupacion';

interface MetricasCentroHeaderProps {
  centroNombre?: string;
  respuestaIncompleta?: boolean;
  cargando: boolean;
  hasMetricas: boolean;
  canExport?: boolean;
  activeTab: MetricasTabKey;
  onTabChange: (tab: MetricasTabKey) => void;
  onExportCsv: () => void;
  onRefresh: () => void;
}

export const MetricasCentroHeader: React.FC<MetricasCentroHeaderProps> = ({
  centroNombre,
  respuestaIncompleta,
  cargando,
  hasMetricas,
  canExport = true,
  activeTab,
  onTabChange,
  onExportCsv,
  onRefresh,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Métricas y Ocupación del Centro</h1>
            {respuestaIncompleta && (
              <span className="rounded-md bg-amber-700 px-2.5 py-0.5 text-[11px] font-bold text-white">
                Límite de registros alcanzado
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Indicadores operativos, demanda por especialidad y ausentismo de {centroNombre || 'tu centro de salud'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {canExport && (
            <button
              type="button"
              onClick={onExportCsv}
              disabled={!hasMetricas || cargando}
              className="min-h-[38px] inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3.5 py-2 text-xs font-semibold text-white transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:opacity-50"
            >
              <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
              <span>Exportar CSV</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[38px] inline-flex items-center gap-1.5 rounded-xl border border-input bg-card hover:bg-muted px-3.5 py-2 text-xs font-semibold text-foreground transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            <span>Imprimir</span>
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={cargando}
            aria-label="Actualizar métricas del centro"
            className="min-h-[38px] inline-flex items-center justify-center rounded-xl border border-input bg-card hover:bg-muted px-3 py-2 text-xs font-semibold text-foreground transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-primary ${cargando ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div role="tablist" aria-label="Vistas de métricas del centro" className="inline-flex rounded-xl border border-border bg-muted/40 p-1 print:hidden">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'resumen'}
          onClick={() => onTabChange('resumen')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
            activeTab === 'resumen' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
          <span>Resumen y Demanda</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'ocupacion'}
          onClick={() => onTabChange('ocupacion')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
            activeTab === 'ocupacion' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          <span>Ocupación y Ausentismo</span>
        </button>
      </div>
    </div>
  );
};
