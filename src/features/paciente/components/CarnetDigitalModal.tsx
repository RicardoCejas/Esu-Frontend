import React, { useRef } from 'react';
import {
  CreditCard,
  X,
  Printer,
  Share2,
  ShieldCheck,
  Droplet,
  AlertTriangle,
  QrCode,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import type { User } from '@/types';

interface CarnetDigitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

export const CarnetDigitalModal: React.FC<CarnetDigitalModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const pacienteNombre = user
    ? `${user.nombre} ${user.apellido}`.trim()
    : 'Lucas Agustín Ramírez';
  const dni = user?.dni || '38.123.456';
  const obraSocial = user?.obraSocial || 'APROSS (Córdoba)';
  const nroAfiliado = user?.nroAfiliado || '20-38123456-4/01';
  const grupoSanguineo = user?.grupoSanguineo || '0 Positivo (0+)';
  const alergias = 'Penicilina, AINEs (Ibuprofeno)';

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Credencial Digital de Salud',
          text: `Credencial Sanitaria Luvia - ${pacienteNombre} (DNI ${dni})`,
          url: window.location.href,
        });
      } catch {
        // Cancelled
      }
    } else {
      navigator.clipboard.writeText(
        `Credencial Sanitaria Luvia | Paciente: ${pacienteNombre} | DNI: ${dni} | Cobertura: ${obraSocial} | Afiliado: ${nroAfiliado}`
      );
      alert('Información de la credencial copiada al portapapeles');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-sky-100 bg-white p-6 shadow-2xl text-slate-900">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Credencial Digital del Paciente</h3>
              <p className="text-[11px] text-slate-500">Documento Oficial de Cobertura y Admisión</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tarjeta Visual: Credencial Institucional Oficial */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-2xl border border-sky-200 shadow-md bg-white"
        >
          {/* Banda Superior Institucional */}
          <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-sky-950 px-5 py-3.5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo-icon.png" alt="Luvia Logo" className="h-8 w-8 object-contain brightness-0 invert drop-shadow-xs" />
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-200 block leading-tight">
                  Luvia · Cruz del Eje
                </span>
                <span className="text-[10px] text-slate-200 font-medium leading-none">
                  Red Asistencial Integrada de Salud
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
              <CheckCircle2 className="h-3 w-3" /> HABILITADO
            </span>
          </div>

          {/* Cuerpo Central de la Credencial */}
          <div className="p-5 bg-gradient-to-b from-white via-sky-50/20 to-sky-50/40">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Información del Paciente */}
              <div className="sm:col-span-8 space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Titular de Cobertura
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                    {pacienteNombre}
                  </h4>
                  <p className="text-xs font-mono font-bold text-sky-700 mt-0.5">
                    DNI: <span className="font-semibold text-slate-800">{dni}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-2xs">
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                      <Building2 className="h-3 w-3 text-sky-600" /> Cobertura
                    </span>
                    <p className="font-bold text-slate-800 text-[11px] truncate mt-0.5">{obraSocial}</p>
                    <p className="text-[9px] font-mono text-slate-500">{nroAfiliado}</p>
                  </div>

                  <div className="rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-2xs">
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                      <Droplet className="h-3 w-3 text-rose-500" /> Factor Sanguíneo
                    </span>
                    <p className="font-bold text-slate-800 text-[11px] mt-0.5">{grupoSanguineo}</p>
                    <p className="text-[9px] text-emerald-600 font-semibold">Registro validado</p>
                  </div>
                </div>

                {/* Alerta de Salud */}
                <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-2 text-[10px] text-amber-900 flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Alergias / Advertencia: </span>
                    <span>{alergias}</span>
                  </div>
                </div>
              </div>

              {/* QR Institucional de Admisión */}
              <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-sky-100 shadow-xs">
                <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">
                  <QrCode className="h-20 w-20 text-slate-900" />
                </div>
                <span className="mt-1.5 font-mono text-[9px] font-bold text-slate-700 tracking-wider">
                  SCAN ADMISIÓN
                </span>
              </div>
            </div>

            {/* Pie Institucional del Carnet */}
            <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-700" />
                Validez Institucional Ley 26.529
              </span>
              <span className="font-medium text-slate-500">Hospitales y CAPS Cruz del Eje</span>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Compartir</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-sky-700 py-2.5 text-xs font-bold text-white hover:bg-sky-800 transition cursor-pointer shadow-md shadow-sky-700/20"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Imprimir Credencial</span>
          </button>
        </div>
      </div>
    </div>
  );
};
