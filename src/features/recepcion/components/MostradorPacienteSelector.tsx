import React from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Check, UserCheck } from 'lucide-react';
import type { User } from '@/types';

interface MostradorPacienteSelectorProps {
  terminoBusqueda: string;
  onTerminoChange: (val: string) => void;
  onBuscar: () => void;
  buscando: boolean;
  paciente: User | null;
  pacientesSugeridos: User[];
  onSeleccionar: (u: User) => void;
  error: string | null;
}

export const MostradorPacienteSelector: React.FC<MostradorPacienteSelectorProps> = ({
  terminoBusqueda,
  onTerminoChange,
  onBuscar,
  buscando,
  paciente,
  pacientesSugeridos,
  onSeleccionar,
  error,
}) => {
  return (
    <section className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
      <h2 className="text-base font-bold text-foreground border-b border-border pb-2">
        1. Identificación del Paciente
      </h2>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="tm-paciente-busqueda" className="block text-xs font-semibold text-foreground mb-1.5">
            Buscar paciente por DNI o Nombre / Apellido <span className="text-rose-700">*</span>
          </label>
          <input
            id="tm-paciente-busqueda"
            type="text"
            placeholder="Ej: 38445123 o Gómez Carlos"
            value={terminoBusqueda}
            onChange={(e) => onTerminoChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onBuscar();
              }
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
          />
        </div>
        <button
          type="button"
          disabled={buscando}
          onClick={onBuscar}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 disabled:opacity-50 cursor-pointer transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          {buscando ? 'Buscando...' : 'Buscar Paciente'}
        </button>
        <Link
          to={`/dashboard/recepcion/pacientes/nuevo?returnTo=turno${terminoBusqueda ? `&dni=${encodeURIComponent(terminoBusqueda)}` : ''}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-semibold text-sky-700 hover:bg-muted transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
        >
          <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
          Alta Rápida Paciente
        </Link>
      </div>

      {error && (
        <p role="alert" className="text-xs font-medium text-rose-700">
          {error}
        </p>
      )}

      {pacientesSugeridos.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Coincidencias encontradas en el padrón:
          </p>
          <div className="divide-y divide-border">
            {pacientesSugeridos.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 text-xs">
                <div>
                  <span className="font-bold text-foreground">{p.apellido}, {p.nombre}</span>
                  <span className="text-muted-foreground ml-2 tabular-nums">DNI {p.dni}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onSeleccionar(p)}
                  className="inline-flex items-center gap-1 rounded-md bg-sky-700 hover:bg-sky-800 text-white px-2.5 py-1 text-xs font-medium transition cursor-pointer"
                >
                  <Check className="h-3 w-3" />
                  <span>Seleccionar</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {paciente && (
        <div className="rounded-lg border border-emerald-300 bg-muted/40 p-3.5 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-foreground">
                {paciente.apellido}, {paciente.nombre}
              </p>
              <p className="text-muted-foreground tabular-nums">
                DNI {paciente.dni} · Tel: {paciente.telefono || 'Sin especificar'}
              </p>
            </div>
          </div>
          <span className="rounded-md bg-emerald-700 px-2.5 py-0.5 text-[11px] font-bold text-white">
            Paciente seleccionado
          </span>
        </div>
      )}
    </section>
  );
};
