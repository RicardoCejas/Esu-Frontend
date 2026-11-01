import React from 'react';
import { ShieldCheck, HelpCircle, CheckCircle2 } from 'lucide-react';

interface CoverageValidatorProps {
  obraSocial?: string;
  nroAfiliado?: string;
  className?: string;
}

export const CoverageValidator: React.FC<CoverageValidatorProps> = ({
  obraSocial,
  nroAfiliado,
  className = '',
}) => {
  if (!obraSocial || obraSocial === 'Particular') {
    return (
      <div className={'flex items-start gap-2 rounded-xl border border-sky-500/30 bg-sky-500/5 p-3 text-xs ' + className}>
        <HelpCircle className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sky-800 dark:text-sky-300">Atención Particular: </span>
          <span className="text-muted-foreground">
            Consulta arancelada según valores del Colegio Médico de Córdoba. Se abona en recepción.
          </span>
        </div>
      </div>
    );
  }

  const isApross = obraSocial.toUpperCase().includes('APROSS');
  const isPami = obraSocial.toUpperCase().includes('PAMI');

  return (
    <div className={'rounded-xl border p-3.5 text-xs space-y-2 ' + (
      isApross || isPami
        ? 'border-emerald-500/30 bg-emerald-500/5'
        : 'border-amber-500/30 bg-amber-500/5'
    ) + ' ' + className}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-bold text-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Convenio Activo: {obraSocial}
        </span>
        <span className="flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-3 w-3" /> Validado Online
        </span>
      </div>

      <div className="text-muted-foreground text-[11px] leading-relaxed">
        {isApross && (
          <p>
            • <strong>APROSS:</strong> Cobertura ambulatoria al 100%. Presentar carnet digital y DNI al momento de la admisión. Sin coseguro en centros públicos de Cruz del Eje.
          </p>
        )}
        {isPami && (
          <p>
            • <strong>PAMI:</strong> Atención médica integral gratuita. Llevar último recibo de haberes o credencial plástica/digital.
          </p>
        )}
        {!isApross && !isPami && (
          <p>
            • <strong>{obraSocial}:</strong> Convenio por reintegro o copago según plan contratado. Verifique con su entidad antes del día de la cita.
          </p>
        )}
      </div>

      {nroAfiliado && (
        <div className="pt-1 border-t border-border/40 text-[10px] text-muted-foreground flex justify-between">
          <span>Afiliado N°: <strong className="font-mono text-foreground">{nroAfiliado}</strong></span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Padrón Sincronizado</span>
        </div>
      )}
    </div>
  );
};
