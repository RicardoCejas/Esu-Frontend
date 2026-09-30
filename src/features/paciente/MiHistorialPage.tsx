import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { pacientesService } from '@/api/pacientesService';
import type { ConsultaMedica } from '@/types';
import {
  FileText,
  Calendar,
  Activity,
  Pill,
  ShieldCheck
} from 'lucide-react';

export const MiHistorialPage: React.FC = () => {
  const { user } = useAuth();
  const [consultas, setConsultas] = useState<ConsultaMedica[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      pacientesService.getHistoriaClinica(user.id).then((data) => {
        setConsultas(data);
        setLoading(false);
      });
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Mi Historia Clínica Única (HCU)
          </h1>
          <p className="text-xs text-muted-foreground">
            Registro cronológico digital de tus atenciones médicas, diagnósticos y recetas electrónicas.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs text-primary font-medium">
          <ShieldCheck className="h-4 w-4" />
          <span>Datos confidenciales y protegidos</span>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : consultas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="font-bold text-base">Sin registros médicos previos</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Aún no tienes atenciones asentadas en el Ecosistema de Salud Unificado.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {consultas.map((consulta) => (
            <div
              key={consulta.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5"
            >
              {/* Header de la Consulta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">{consulta.profesionalNombre}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>Atención realizada el {consulta.fecha}</span>
                    </p>
                  </div>
                </div>

                <span className="self-start sm:self-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Consulta Ambulatoria
                </span>
              </div>

              {/* Signos Vitales */}
              {consulta.signosVitales && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-muted/40 p-3.5 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Presión Arterial</span>
                    <span className="font-bold text-foreground">
                      {consulta.signosVitales.presionArterial || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Frecuencia Cardíaca</span>
                    <span className="font-bold text-foreground">
                      {consulta.signosVitales.frecuenciaCardiaca || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Temperatura</span>
                    <span className="font-bold text-foreground">
                      {consulta.signosVitales.temperatura || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Peso Corporal</span>
                    <span className="font-bold text-foreground">
                      {consulta.signosVitales.peso || 'N/A'}
                    </span>
                  </div>
                </div>
              )}

              {/* Detalle Clínico */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-semibold text-foreground">Motivo de Consulta:</span>
                  <p className="rounded-lg border border-border bg-background p-3 text-muted-foreground">
                    {consulta.motivo}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-foreground">Diagnóstico / Evolución:</span>
                  <p className="rounded-lg border border-border bg-background p-3 font-medium text-foreground">
                    {consulta.diagnostico}
                  </p>
                </div>
              </div>

              {/* Receta Digital Asociada */}
              {consulta.receta && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-primary" />
                      <h4 className="font-bold text-xs text-primary">Receta Electrónica Emitida</h4>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-muted-foreground">
                      {consulta.receta.codigoQR}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {consulta.receta.medicamentos.map((med, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-border bg-card p-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                      >
                        <div>
                          <span className="font-bold text-foreground">{med.nombreComercial}</span>{' '}
                          <span className="text-muted-foreground">({med.droga} - {med.presentacion})</span>
                          <p className="text-[11px] text-primary font-medium mt-0.5">{med.dosisIndicada}</p>
                        </div>
                        <span className="text-[11px] font-semibold text-muted-foreground sm:text-right">
                          Cantidad: {med.cantidad}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-muted-foreground italic">
                    Indicaciones: {consulta.receta.indicacionesGenerales}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
