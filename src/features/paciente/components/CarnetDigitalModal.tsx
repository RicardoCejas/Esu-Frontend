import React, { useRef } from 'react';
import {
  CreditCard,
  X,
  Download,
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
    : 'Paciente ESU';
  const dni = user?.dni || '38.452.190';
  const obraSocial = user?.obraSocial || 'APROSS (Córdoba)';
  const nroAfiliado = user?.nroAfiliado || '20-38452190-4/01';
  const grupoSanguineo = user?.grupoSanguineo || '0 Positivo (0+)';
  const alergias = 'Penicilina, AINEs (Ibuprofeno)';

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Carnet Digital ESU',
          text: `Credencial Virtual de Salud ESU - ${pacienteNombre} (DNI ${dni})`,
          url: window.location.href,
        });
      } catch {
        // Cancelado
      }
    } else {
      navigator.clipboard.writeText(
        `Credencial Virtual ESU | Paciente: ${pacienteNombre} | DNI: ${dni} | Cobertura: ${obraSocial} | Afiliado: ${nroAfiliado}`
      );
      alert('Información del carnet copiada al portapapeles');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-950 p-6 shadow-2xl text-slate-100">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Carnet Digital Oficial</h3>
              <p className="text-xs text-slate-400">Credencial del Paciente — Red ESU</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tarjeta Visual Estilo Credencial */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-900 via-slate-900 to-indigo-950 p-6 border border-sky-500/30 shadow-xl"
        >
          {/* Fondo decorativo */}
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-sky-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          {/* Encabezado del Carnet */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-sm">
                ESU
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-sky-300">
                  Ecosistema de Salud Unificado
                </span>
                <p className="text-xs font-semibold text-slate-300">Cruz del Eje · Córdoba</p>
              </div>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
              <CheckCircle2 className="h-3 w-3" /> ACTIVO
            </span>
          </div>

          {/* Cuerpo Central: Paciente + QR */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Datos Personales */}
            <div className="sm:col-span-2 space-y-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Titular de Cobertura
                </span>
                <h4 className="text-lg font-bold text-white tracking-tight">{pacienteNombre}</h4>
                <p className="text-xs font-mono text-sky-200">DNI: {dni}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-lg bg-black/30 p-2 border border-white/5">
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Building2 className="h-3 w-3 text-sky-400" /> Cobertura
                  </span>
                  <p className="font-semibold text-white truncate">{obraSocial}</p>
                  <p className="text-[9px] font-mono text-slate-300">{nroAfiliado}</p>
                </div>

                <div className="rounded-lg bg-black/30 p-2 border border-white/5">
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Droplet className="h-3 w-3 text-rose-400" /> Factor
                  </span>
                  <p className="font-bold text-rose-200">{grupoSanguineo}</p>
                  <p className="text-[9px] text-slate-400">Verificado</p>
                </div>
              </div>

              {/* Alergias / Alerta */}
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2 text-[10px] text-amber-200 flex items-start gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Alergias Críticas: </span>
                  <span>{alergias}</span>
                </div>
              </div>
            </div>

            {/* Código QR Interactivo */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-white p-3 shadow-lg">
              <div className="flex h-28 w-28 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
                <QrCode className="h-24 w-24 text-slate-900" />
              </div>
              <span className="mt-1.5 font-mono text-[9px] font-bold text-slate-800 tracking-tighter">
                SCAN · ADMISIÓN
              </span>
            </div>
          </div>

          {/* Pie del carnet */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
              Token Criptográfico SHA-256
            </span>
            <span className="font-mono text-slate-500">Válido en Centros y Guardias</span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>Compartir</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white hover:bg-sky-500 transition cursor-pointer shadow-lg shadow-sky-600/20"
          >
            <Download className="h-4 w-4" />
            <span>Descargar / Imprimir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
