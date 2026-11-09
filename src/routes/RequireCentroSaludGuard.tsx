import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Building2, AlertTriangle, LogOut } from 'lucide-react';

export const RequireCentroSaludGuard: React.FC = () => {
  const { user, logout } = useAuth();
  const isDev = Boolean(import.meta.env.DEV && (user?.isDeveloper || user?.email === 'dev@esu.gob.ar'));

  // Si es recepcionista y no tiene sede médica asignada, bloquear navegación fail-closed (HU-Frontend-99)
  if (user && user.rol === 'RECEPCIONISTA' && !user.centroSaludId && !isDev) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center ring-8 ring-amber-50">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              Cuenta Institucional Sin Sede Asignada
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Su cuenta de recepcionista no cuenta con un <span className="font-semibold text-slate-900">Centro de Salud</span> vinculado.
              Por políticas de seguridad y aislamiento multi-tenancy, no puede operar la recepción ni acceder a datos clínicos sin una sede asignada.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-left text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Pasos de resolución requeridos:</span>
            </div>
            <p>1. Contacte al administrador del centro o de la red de salud de Cruz del Eje.</p>
            <p>2. Solicite la asignación explícita de su centro de salud en la nómina de usuarios.</p>
            <p>3. Vuelva a iniciar sesión para actualizar sus credenciales institucionales.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => logout()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
            <Link
              to="/portal"
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              Ir al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
