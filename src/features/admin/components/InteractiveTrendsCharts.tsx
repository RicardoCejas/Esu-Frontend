import React, { useState } from 'react';

// Gráfico de Barras Doble (Atendidos vs Cancelados / Ausentes)
interface DualBarChartProps {
  data: {
    label: string;
    atendidos: number;
    ausentes: number;
  }[];
}

export const InteractiveDualBarChart: React.FC<DualBarChartProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.atendidos, d.ausentes)),
    1
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-5 text-xs">
        <div className="flex items-center gap-1.5 font-medium">
          <div className="h-3 w-3 rounded-sm bg-sky-600 dark:bg-sky-500" />
          <span className="text-foreground">Turnos Atendidos</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <div className="h-3 w-3 rounded-sm bg-rose-500 dark:bg-rose-400" />
          <span className="text-foreground">Ausencias / Cancelaciones</span>
        </div>
      </div>

      <div className="h-60 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-border">
        {data.map((item, idx) => {
          const heightAtendidos = Math.round((item.atendidos / maxVal) * 100);
          const heightAusentes = Math.round((item.ausentes / maxVal) * 100);
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.label}
              className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip flotante */}
              {isHovered && (
                <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[11px] font-semibold py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 pointer-events-none border border-slate-700">
                  <span className="text-slate-300">{item.label}:</span>{' '}
                  <span className="font-bold text-sky-400">{item.atendidos} at.</span> |{' '}
                  <span className="font-bold text-rose-400">{item.ausentes} aus.</span>
                </div>
              )}

              {/* Columnas agrupadas */}
              <div className="flex items-end gap-1.5 w-full justify-center">
                <div
                  style={{ height: `${heightAtendidos}%` }}
                  className={`w-1/2 max-w-[24px] rounded-t-lg transition-all duration-300 ${
                    isHovered
                      ? 'bg-sky-600 dark:bg-sky-500 shadow-md scale-105'
                      : 'bg-sky-600/80 dark:bg-sky-500/80 hover:bg-sky-600'
                  }`}
                />
                <div
                  style={{ height: `${heightAusentes}%` }}
                  className={`w-1/2 max-w-[24px] rounded-t-lg transition-all duration-300 ${
                    isHovered
                      ? 'bg-rose-500 dark:bg-rose-400 shadow-md scale-105'
                      : 'bg-rose-500/80 dark:bg-rose-400/80 hover:bg-rose-500'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Etiquetas Eje X */}
      <div className="flex justify-between gap-3 px-2 text-[11px] text-muted-foreground font-medium">
        {data.map((item) => (
          <span key={item.label} className="flex-1 text-center truncate">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// Gráfico de Líneas Interactivo (Evolución de Tasa de Ausentismo y Asistencia)
interface LineChartProps {
  data: {
    label: string;
    tasaAsistencia: number; // Porcentaje 0 a 100
    tasaAusentismo: number; // Porcentaje 0 a 100
  }[];
}

export const InteractiveLineChart: React.FC<LineChartProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 600;
  const height = 200;
  const paddingX = 40;
  const paddingY = 25;

  const pointsCount = data.length;
  const stepX = pointsCount > 1 ? (width - 2 * paddingX) / (pointsCount - 1) : 0;

  const getCoord = (idx: number, val: number) => {
    const x = paddingX + idx * stepX;
    // Escala de 0 a 100%
    const y = height - paddingY - (val / 100) * (height - 2 * paddingY);
    return { x, y };
  };

  const lineAsistenciaPath = data
    .map((d, i) => {
      const { x, y } = getCoord(i, d.tasaAsistencia);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const lineAusentismoPath = data
    .map((d, i) => {
      const { x, y } = getCoord(i, d.tasaAusentismo);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-5 text-xs">
        <div className="flex items-center gap-1.5 font-medium">
          <div className="h-0.5 w-4 bg-emerald-600 dark:bg-emerald-400" />
          <span className="text-foreground">Tasa Asistencia (%)</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <div className="h-0.5 w-4 bg-amber-500 dark:bg-amber-400" />
          <span className="text-foreground">Tasa Ausentismo (%)</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-52 overflow-visible">
          {/* Líneas guía horizontales */}
          {[0, 25, 50, 75, 100].map((level) => {
            const y = height - paddingY - (level / 100) * (height - 2 * paddingY);
            return (
              <g key={level}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-border/60"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-muted-foreground font-mono"
                >
                  {level}%
                </text>
              </g>
            );
          })}

          {/* Líneas de datos */}
          <path
            d={lineAsistenciaPath}
            fill="none"
            stroke="#059669"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={lineAusentismoPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Puntos interactivos */}
          {data.map((d, i) => {
            const ptAsistencia = getCoord(i, d.tasaAsistencia);
            const ptAusentismo = getCoord(i, d.tasaAusentismo);
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={d.label}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <circle
                  cx={ptAsistencia.x}
                  cy={ptAsistencia.y}
                  r={isHovered ? 6 : 4}
                  className="fill-emerald-600 transition-all duration-150"
                />
                <circle
                  cx={ptAusentismo.x}
                  cy={ptAusentismo.y}
                  r={isHovered ? 6 : 4}
                  className="fill-amber-500 transition-all duration-150"
                />
                {isHovered && (
                  <line
                    x1={ptAsistencia.x}
                    y1={paddingY}
                    x2={ptAsistencia.x}
                    y2={height - paddingY}
                    stroke="currentColor"
                    className="text-foreground/40"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {hoveredIdx !== null && (
          <div className="mt-2 text-center text-xs font-semibold text-foreground animate-in fade-in duration-150">
            <span className="text-muted-foreground">{data[hoveredIdx].label}:</span>{' '}
            <span className="text-emerald-600 font-bold">
              {data[hoveredIdx].tasaAsistencia}% Asistencia
            </span>{' '}
            •{' '}
            <span className="text-amber-600 font-bold">
              {data[hoveredIdx].tasaAusentismo}% Ausentismo
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between px-6 text-[11px] text-muted-foreground font-medium">
        {data.map((item) => (
          <span key={item.label} className="truncate text-center">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};
