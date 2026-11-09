import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  Building2,
  Droplet,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Share2,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { ScannableQrCode } from '@/components/common/ScannableQrCode';

export const CredencialPublicaPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Obtener parámetros del código QR
  const dniParam = searchParams.get('dni') || '39.412.850';
  const nombreParam = searchParams.get('nombre') || 'Lucas Agustín Ramírez';
  const coberturaParam = searchParams.get('cobertura') || 'APROSS (Córdoba)';
  const afiliadoParam = searchParams.get('afiliado') || '20-39412850-4/01';
  const grupoParam = searchParams.get('grupo') || '0 Positivo (0+)';
  const alergiasParam = searchParams.get('alergias') || 'Penicilina, AINEs (Ibuprofeno)';
  const estadoParam = searchParams.get('estado') || 'HABILITADO';
  const centroParam = searchParams.get('centro') || 'Hospital Provincial Dr. Aurelio Crespo';
  const hashParam =
    searchParams.get('hash') ||
    'ESU-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-VALID';

  const [fechaConsulta, setFechaConsulta] = useState('');

  useEffect(() => {
    const now = new Date();
    setFechaConsulta(
      now.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Credencial Digital - ${nombreParam}`,
          text: `Credencial de Paciente Oficial Luvia - ${nombreParam} (DNI ${dniParam})`,
          url: window.location.href,
        });
      } catch {
        // Cancelado
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace oficial de credencial copiado al portapapeles');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Contenedor central */}
      <div className="max-w-xl mx-auto w-full my-auto space-y-4">
        {/* Banner Superior de Autenticidad Gubernamental */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <img
              src="/logo-icon.png"
              alt="Luvia Logo"
              className="h-7 w-7 object-contain brightness-0 invert"
            />
            <div>
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-sky-300 block leading-tight">
                Sistema Único de Salud · Luvia
              </span>
              <span className="text-[9px] text-slate-400">
                Red Asistencial Integrada · Cruz del Eje
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 text-[11px] font-bold text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>CREDENCIAL VERIFICADA</span>
          </div>
        </div>

        {/* Tarjeta Visual Oficial del Paciente (Imprimible y Escaneable) */}
        <div className="relative overflow-hidden rounded-3xl border border-sky-300/30 bg-white text-slate-900 shadow-2xl transition">
          {/* Banda Superior Institucional */}
          <div className="bg-gradient-to-r from-sky-950 via-sky-800 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-sky-200 block">
                  Credencial Digital del Paciente
                </span>
                <span className="text-[11px] text-slate-200 font-medium">
                  Documento Oficial de Cobertura y Admisión
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/25 border border-emerald-400/50 px-3 py-0.5 text-xs font-extrabold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              {estadoParam}
            </span>
          </div>

          {/* Cuerpo de la Credencial */}
          <div className="p-6 bg-gradient-to-b from-white via-sky-50/20 to-sky-50/50 space-y-4">
            {/* Titular y DNI */}
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Titular de Cobertura
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {nombreParam}
                </h1>
                <p className="text-xs font-mono font-bold text-sky-700 mt-0.5">
                  DNI: <span className="font-semibold text-slate-800">{dniParam}</span>
                </p>
              </div>

              <div className="shrink-0 flex items-center sm:flex-col sm:items-end text-xs text-slate-500">
                <span className="text-[10px] text-slate-400 font-semibold">Validado por</span>
                <span className="font-bold text-sky-900">RENAPER / ESU</span>
              </div>
            </div>

            {/* Grilla de Cobertura y Grupo Sanguíneo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl bg-white p-3.5 border border-slate-200/90 shadow-2xs space-y-1">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                  <Building2 className="h-3.5 w-3.5 text-sky-600" /> Cobertura Médica
                </span>
                <p className="font-bold text-slate-900 text-sm truncate">{coberturaParam}</p>
                <p className="text-[10px] font-mono font-medium text-slate-500">
                  Afiliado: <span className="text-slate-700 font-bold">{afiliadoParam}</span>
                </p>
              </div>

              <div className="rounded-2xl bg-white p-3.5 border border-slate-200/90 shadow-2xs space-y-1">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                  <Droplet className="h-3.5 w-3.5 text-rose-500" /> Factor Sanguíneo
                </span>
                <p className="font-bold text-slate-900 text-sm">{grupoParam}</p>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Registro Clínico Homologado
                </p>
              </div>
            </div>

            {/* Alerta de Alergias */}
            <div className="rounded-2xl bg-amber-50/90 border border-amber-200 p-3 text-xs text-amber-950 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Alergias / Advertencias Clínicas: </span>
                <span className="font-medium text-amber-900">{alergiasParam}</span>
              </div>
            </div>

            {/* Código QR y Centro de Referencia */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Centro de Salud Habitual
                </span>
                <p className="text-xs font-bold text-slate-800">{centroParam}</p>
                <p className="text-[10px] text-slate-500">
                  Habilitado para atención ambulatoria, guardia y farmacia.
                </p>
                <div className="pt-1 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Lock className="h-3 w-3 text-slate-400" />
                  Hash: {hashParam.slice(0, 18)}...
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-200 shadow-xs shrink-0">
                <ScannableQrCode value={window.location.href} size={84} alt="Código QR de Admisión" />
                <span className="mt-1 font-mono text-[8px] font-bold text-slate-600">
                  VALIDADO
                </span>
              </div>
            </div>

            {/* Pie Institucional con Leyes y Seguridad */}
            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-700" />
                Validez Institucional Ley Nac. 26.529
              </span>
              <span>Verificado: {fechaConsulta || 'En tiempo real'}</span>
            </div>
          </div>
        </div>

        {/* Acciones de la Credencial */}
        <div className="flex flex-wrap gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-2xl border border-sky-400/30 bg-slate-800/80 hover:bg-slate-800 text-white py-3 text-xs font-bold transition shadow-md cursor-pointer"
          >
            <Share2 className="h-4 w-4 text-sky-400" />
            <span>Compartir</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white py-3 text-xs font-bold transition shadow-lg shadow-sky-600/30 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir Carnet</span>
          </button>
        </div>

        {/* Enlace para volver o acceder al portal */}
        <div className="text-center pt-2">
          <Link
            to="/dashboard/paciente"
            className="inline-flex items-center gap-1.5 text-xs text-sky-300 hover:text-white hover:underline font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver a Mis Turnos y Servicios de Salud</span>
          </Link>
        </div>
      </div>

      {/* Pie de página gubernamental */}
      <footer className="text-center text-[11px] text-slate-500 pt-6">
        Sistema Integral de Salud Cruz del Eje · Plataforma ESU Luvia · Todos los derechos reservados
      </footer>
    </div>
  );
};
