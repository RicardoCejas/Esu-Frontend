import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Power, Trash2 } from 'lucide-react';
import type { User } from '@/types';
import { isSelfAccount } from '../utils/centroStaffHelpers';

interface PersonalCentroTableProps {
  staff: User[];
  currentUser: User | null;
  canManageUsers?: boolean;
  onToggleEstado: (u: User) => void;
  onEliminar: (u: User) => void;
}

export const PersonalCentroTable: React.FC<PersonalCentroTableProps> = ({
  staff,
  currentUser,
  canManageUsers = true,
  onToggleEstado,
  onEliminar,
}) => {
  if (staff.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-xs text-muted-foreground">
        No se encontraron cuentas de recepción o médicos para los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div
        tabIndex={0}
        role="region"
        aria-label="Listado de personal habilitado del centro de salud"
        className="overflow-x-auto focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
      >
        <table className="w-full text-xs text-left text-foreground">
          <caption className="sr-only">Personal habilitado del centro de salud</caption>
          <thead className="bg-muted text-muted-foreground uppercase text-[10px]">
            <tr>
              <th scope="col" className="px-4 py-3 font-bold">Integrante</th>
              <th scope="col" className="px-4 py-3 font-bold">Perfil</th>
              <th scope="col" className="px-4 py-3 font-bold">Correo / DNI</th>
              <th scope="col" className="px-4 py-3 font-bold">Estado</th>
              <th scope="col" className="px-4 py-3 font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staff.map((cuenta) => {
              const self = isSelfAccount(cuenta, currentUser);
              const activo = cuenta.activo !== false;
              const nombreDisplay = `${cuenta.nombre || ''} ${cuenta.apellido || ''}`.trim() || cuenta.email;
              const isMedico = cuenta.rol === 'MEDICO' || cuenta.rol === 'PROFESIONAL';

              return (
                <tr key={cuenta.id} className="hover:bg-muted/30 transition-colors">
                  <th scope="row" className="px-4 py-3 font-semibold text-foreground">
                    <div className="flex items-center gap-2">
                      <span>{nombreDisplay}</span>
                      {self && (
                        <span className="rounded-md bg-slate-800 text-white px-1.5 py-0.5 text-[10px] font-bold">
                          Tu cuenta
                        </span>
                      )}
                    </div>
                  </th>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold text-white ${
                        isMedico ? 'bg-sky-700' : 'bg-slate-700'
                      }`}
                    >
                      {isMedico ? 'Profesional Médico' : 'Recepción'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-foreground">{cuenta.email}</div>
                    {cuenta.dni && (
                      <div className="text-[11px] text-muted-foreground tabular-nums">DNI: {cuenta.dni}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold text-white ${
                        activo ? 'bg-emerald-700' : 'bg-rose-700'
                      }`}
                    >
                      {activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {canManageUsers && (
                      <div className="flex items-center justify-end gap-1.5">
                        {self ? (
                          <button
                            type="button"
                            disabled
                            title="Por seguridad no podés modificar tus propios permisos ni rol"
                            aria-label="Permisos deshabilitados para tu propia cuenta"
                            className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-[11px] font-semibold text-foreground opacity-40 cursor-not-allowed"
                          >
                            <Shield className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                            <span>Permisos</span>
                          </button>
                        ) : (
                          <Link
                            to={`/dashboard/recepcion/personal/${cuenta.id}/permisos`}
                            className="inline-flex items-center gap-1 rounded-lg border border-input bg-background hover:bg-muted px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <Shield className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                            <span>Permisos</span>
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => onToggleEstado(cuenta)}
                          disabled={self}
                          aria-label={activo ? `Desactivar a ${cuenta.email}` : `Activar a ${cuenta.email}`}
                          title={self ? 'No podés desactivar tu propia cuenta' : activo ? 'Desactivar acceso' : 'Reactivar acceso'}
                          className="min-h-[32px] min-w-[32px] inline-flex items-center justify-center rounded-lg border border-input bg-background hover:bg-muted p-1.5 text-foreground transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Power className={`h-3.5 w-3.5 ${activo ? 'text-amber-700' : 'text-emerald-700'}`} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEliminar(cuenta)}
                          disabled={self}
                          aria-label={`Eliminar cuenta ${cuenta.email}`}
                          title={self ? 'No podés eliminar tu propia cuenta' : 'Eliminar cuenta'}
                          className="min-h-[32px] min-w-[32px] inline-flex items-center justify-center rounded-lg border border-input bg-background hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30 p-1.5 text-muted-foreground transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-600 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    )}
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
