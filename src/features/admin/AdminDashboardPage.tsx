import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, ShieldCheck, Activity, Stethoscope, ArrowUpRight, TrendingUp } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Panel de Control y Métricas — Administrador
        </h1>
        <p className="text-xs text-muted-foreground">
          Monitoreo global de la red de salud pública y privada de Cruz del Eje.
        </p>
      </div>

      {/* Tarjetas de Métricas Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Total Pacientes Registrados</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">1,480</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              <TrendingUp className="h-3 w-3 inline mr-0.5" /> +12%
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Padrón unificado Cruz del Eje</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Profesionales Activos</span>
            <Stethoscope className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">38</span>
            <span className="text-xs text-primary font-semibold">7 Especialidades</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Médicos matriculados en sistema</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Centros Conectados</span>
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">4</span>
            <span className="text-xs text-emerald-600 font-semibold">100% Operativos</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Hospital, Clínicas y Dispensarios</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Tasa de Ausentismo</span>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">6.4%</span>
            <span className="text-xs text-emerald-600 font-semibold">-18% vs 2025</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Reducido por recordatorios y QR</p>
        </div>
      </div>

      {/* Accesos de Configuración */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/dashboard/admin/usuarios"
          className="group rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg">Gestión de Usuarios y Roles (RBAC)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Administre altas, bajas lógicas, asignación de roles de médicos, recepcionistas y administradores.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
            <span>Ir a Usuarios</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        <Link
          to="/dashboard/admin/especialidades"
          className="group rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg">Centros de Salud y Especialidades</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Configure la red de dispensarios, clínicas, hospitales y catálogo de especialidades médicas habilitadas.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
            <span>Ir a Catálogo</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>
    </div>
  );
};
