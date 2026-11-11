import React from 'react';
import { Clock, UserCheck, DollarSign, RotateCcw } from 'lucide-react';
import type { Turno } from '@/types';

interface RecepcionTurnosTableProps {
  turnos: Turno[];
  loading: boolean;
  mostrarFecha?: boolean;
  onCheckIn: (turno: Turno) => void;
  onOpenCopago: (turno: Turno) => void;
  onOpenCancelar: (turno: Turno) => void;
}

export const RecepcionTurnosTable: React.FC<RecepcionTurnosTableProps> = ({
  turnos,
  loading,
  mostrarFecha = false,
  onCheckIn,
  onOpenCopago,
  onOpenCancelar,
}) => {
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
      </div>
    );
  }

  if (turnos.length === 0) {
    return (
      <div className="rounded-b-xl border border-border border-t-0 bg-card p-12 text-center">
        <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
        <h3 className="text-sm font-bold text-foreground">No se encontraron turnos para los filtros seleccionados</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Intente modificar la búsqueda por DNI o restablezca los filtros de profesional.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-b-xl border border-border border-t-0 bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3.5">{mostrarFecha ? 'Fecha y Hora' : 'Hora'}</th>
              <th className="p-3.5">Paciente / DNI</th>
              <th className="p-3.5">Cobertura & Copago</th>
              <th className="p-3.5">Médico / Especialidad</th>
              <th className="p-3.5">Consultorio / Sede</th>
              <th className="p-3.5 text-center">Estado</th>
              <th className="p-3.5 text-right">Acciones de Ventanilla</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {turnos.map((t) => {
              const esEnEspera = t.estado === 'EN_SALA_DE_ESPERA' || t.estado === 'EN_ESPERA';
              const esAtendiendo = t.estado === 'ATENDIENDO';
              const esCompletado = t.estado === 'COMPLETADO';
              const esCancelado = t.estado === 'CANCELADO';

              return (
                <tr key={t.id} className="hover:bg-muted/30 transition">
                  <td className="p-3.5 font-bold tabular-nums text-sm text-foreground">
                    {mostrarFecha && t.fecha && (
                      <div className="text-[11px] text-muted-foreground font-normal">
                        {t.fecha}
                      </div>
                    )}
                    <div>{t.hora} hs</div>
                    {t.horaCheckIn && (
                      <div className="text-[10px] text-muted-foreground font-normal">
                        Check-in: {t.horaCheckIn}
                      </div>
                    )}
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <span>{t.pacienteNombre}</span>
                      {t.esPrimeraVez && (
                        <span className="inline-flex items-center rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          1ª Vez
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground tabular-nums">
                      DNI: {t.pacienteDni} • Tel: {t.pacienteTelefono ?? 'S/N'}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-medium text-foreground">{t.obraSocial || 'Particular'}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      {t.copagoMonto !== undefined ? (
                        <span className="text-emerald-600 font-semibold">
                          Copago: ${t.copagoMonto} {t.numeroBono && `(${t.numeroBono})`}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium">Copago pendiente</span>
                      )}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-semibold text-foreground">{t.profesionalNombre}</div>
                    <div className="text-[11px] text-muted-foreground">{t.especialidadNombre}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-medium text-foreground">
                      Consultorio {t.consultorioNumero || 'S/N'} {t.planta && `(${t.planta})`}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                      {t.centroSaludNombre}
                    </div>
                  </td>

                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        esEnEspera
                          ? 'bg-amber-600 text-white'
                          : esAtendiendo
                          ? 'bg-sky-700 text-white'
                          : esCompletado
                          ? 'bg-emerald-700 text-white'
                          : esCancelado
                          ? 'bg-rose-700 text-white'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {t.estado === 'EN_SALA_DE_ESPERA' ? 'EN SALA DE ESPERA' : t.estado}
                    </span>
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!esEnEspera && !esAtendiendo && !esCompletado && !esCancelado && (
                        <button
                          type="button"
                          onClick={() => onCheckIn(t)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1.5 text-xs font-semibold shadow-xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
                          title="Marcar llegada presencial"
                        >
                          <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Presente</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenCopago(t)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:bg-muted text-foreground px-2 py-1.5 text-xs font-medium transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                        title="Verificar copago"
                      >
                        <DollarSign className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                        <span>Copago</span>
                      </button>

                      {!esCompletado && !esCancelado && (
                        <button
                          type="button"
                          onClick={() => onOpenCancelar(t)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-300 hover:bg-rose-50 text-rose-700 px-2 py-1.5 text-xs font-medium transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-600 cursor-pointer"
                          title="Cancelar turno"
                          aria-label="Cancelar turno"
                        >
                          <RotateCcw className="h-3 w-3" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
