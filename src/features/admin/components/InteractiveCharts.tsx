import React, { useState } from 'react';

// Gráfico de Barras Interactivo
interface BarChartProps {
  data: { label: string; valor: number; detalle?: string }[];
}

export const InteractiveBarChart: React.FC<BarChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => d.valor), 1);

  return (
    <div className="space-y-4">
      <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-border">
        {data.map((item, idx) => {
          const heightPercent = Math.round((item.valor / maxVal) * 100);
          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={item.label}
              className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip flotante */}
              {isHovered && (
                <div className="absolute -top-10 z-20 bg-slate-900 text-white text-[10px] font-semibold py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                  {item.label}: <span className="font-bold text-sky-400">{item.valor} turnos</span>
                </div>
              )}

              {/* Barra */}
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 ${
                  isHovered
                    ? 'bg-primary shadow-lg shadow-primary/30 scale-105'
                    : 'bg-primary/80 hover:bg-primary'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Etiquetas Eje X */}
      <div className="flex justify-between gap-2 px-2 text-[11px] text-muted-foreground font-medium">
        {data.map((item) => (
          <span key={item.label} className="flex-1 text-center truncate">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// Gráfico de Dona / Circular Interactivo
interface DonutChartProps {
  data: { label: string; valor: number; color: string }[];
}

export const InteractiveDonutChart: React.FC<DonutChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = data.reduce((acc, d) => acc + d.valor, 0);

  // Cálculo de segmentos SVG con stroke-dasharray
  let acumulado = 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="20"
            className="text-muted/30"
          />
          {data.map((item, idx) => {
            const porcentaje = total > 0 ? item.valor / total : 0;
            const strokeDasharray = `${porcentaje * circumference} ${circumference}`;
            const strokeDashoffset = -acumulado * circumference;
            acumulado += porcentaje;
            const isHovered = hoveredIndex === idx;

            return (
              <circle
                key={item.label}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? 24 : 20}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Centro de la Dona */}
        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-black text-foreground">
            {hoveredIndex !== null ? data[hoveredIndex].valor : total}
          </span>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            {hoveredIndex !== null ? data[hoveredIndex].label.split(' ')[0] : 'Total Turnos'}
          </span>
        </div>
      </div>

      {/* Leyenda lateral */}
      <div className="space-y-2 text-xs">
        {data.map((item, idx) => {
          const isHovered = hoveredIndex === idx;
          const porcentaje = total > 0 ? Math.round((item.valor / total) * 100) : 0;

          return (
            <div
              key={item.label}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center gap-2.5 p-1.5 rounded-lg cursor-pointer transition ${
                isHovered ? 'bg-muted font-bold' : 'hover:bg-muted/50'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground truncate max-w-[140px]">{item.label}</span>
              <span className="font-mono text-foreground font-semibold ml-auto">{porcentaje}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
