import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { clinicaService } from '@/api/clinicaService';
import type { RecetaValidacion } from '@/types';
import {
  QrCode,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Pill,
  Building2,
  Stethoscope,
  User,
  ShieldCheck,
  Camera,
  VideoOff,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const PharmacyValidationView: React.FC = () => {
  const [codigoBuscado, setCodigoBuscado] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [receta, setReceta] = useState<RecetaValidacion | null>(null);

  // Datos de la Farmacia
  const [farmaciaNombre, setFarmaciaNombre] = useState('Farmacia San Cayetano - Cruz del Eje');
  const [farmaciaMatricula, setFarmaciaMatricula] = useState('FP-5512');
  const [isDispensando, setIsDispensando] = useState(false);
  const [dispensacionExitosa, setDispensacionExitosa] = useState<string | null>(null);

  // Cámara / Escáner QR
  const [camaraActiva, setCamaraActiva] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Limpiar stream de la cámara al desmontar
  useEffect(() => {
    return () => {
      detenerCamara();
    };
  }, []);

  const iniciarCamara = async () => {
    try {
      setErrorBusqueda(null);
      setCamaraActiva(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Cámara no accesible:', err);
      setCamaraActiva(false);
      setErrorBusqueda(
        'No se pudo acceder a la cámara web. Puedes ingresar el código de la receta manualmente.'
      );
    }
  };

  const detenerCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCamaraActiva(false);
  };

  const handleBuscar = async (codigoParaBuscar?: string) => {
    const cod = (codigoParaBuscar || codigoBuscado).trim();
    if (!cod) {
      setErrorBusqueda('Por favor ingresa un código de receta o escanea el QR.');
      return;
    }

    setIsLoading(true);
    setErrorBusqueda(null);
    setDispensacionExitosa(null);

    try {
      const data = await clinicaService.validarReceta(cod);

      // Verificación de vigencia (DoD HU-77: 30 días corridos)
      const fechaEmisionMs = new Date(data.fechaEmision).getTime();
      const diasTranscurridos = Math.floor((Date.now() - fechaEmisionMs) / (1000 * 60 * 60 * 24));

      if (diasTranscurridos > 30 && data.estado !== 'DISPENSADA') {
        data.estado = 'VENCIDA';
      }

      setReceta(data);
      detenerCamara();
    } catch (err: any) {
      setErrorBusqueda('No se encontró ninguna receta digital asociada al código ingresado.');
      setReceta(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDispensar = async () => {
    if (!receta) return;

    if (!farmaciaNombre.trim() || !farmaciaMatricula.trim()) {
      alert('Por favor especifica el nombre y matrícula de la farmacia dispensadora.');
      return;
    }

    setIsDispensando(true);
    try {
      const res = await clinicaService.dispensarReceta(
        receta.codigoReceta,
        farmaciaMatricula,
        farmaciaNombre
      );
      setReceta(res.receta);
      setDispensacionExitosa(res.mensaje);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error al procesar la dispensación.');
    } finally {
      setIsDispensando(false);
    }
  };

  // Cargar recetas de prueba rápidas para testing docente o demostración
  const cargarDemo = (codigoDemo: string) => {
    setCodigoBuscado(codigoDemo);
    handleBuscar(codigoDemo);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Navbar Superior del Portal Farmacéutico */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-sm">
                ESU
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white block">
                  Portal de Farmacia y Validación QR
                </span>
                <span className="text-[10px] text-emerald-400 font-medium block">
                  Red Asistencial Cruz del Eje · Sistema de Receta Digital Oficial
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-800 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-semibold hidden sm:inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Ley 27.553 (Receta Electrónica)
            </span>
            <Link
              to="/turnero"
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Ir a Turnero
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto px-4 pt-6">
        {/* Banner de Bienvenida y Ayuda */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 mb-6 shadow-xl border border-emerald-800/40">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Validación y Dispensación Inalterable · HU-77
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
              Verificación de Recetas Digitales para Farmacias
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Escanea el código QR presentado por el paciente o ingresa el código alfanumérico
              de la receta. El sistema verificará vigencia máxima de 30 días, autenticidad médica e
              impedirá el doble expendio mediante confirmación en tiempo real.
            </p>
          </div>
        </div>

        {/* Formulario de Búsqueda y Escáner QR */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-600" />
            1. Búsqueda y Validación de Receta
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-8 relative">
              <input
                type="text"
                value={codigoBuscado}
                onChange={(e) => setCodigoBuscado(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                placeholder="Ingresa el código alfanumérico (ej: REC-CDE-2026-001 o Hash)"
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 pl-10 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <QrCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            <div className="md:col-span-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBuscar()}
                disabled={isLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Buscar Receta
              </button>

              <button
                type="button"
                onClick={() => (camaraActiva ? detenerCamara() : iniciarCamara())}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  camaraActiva
                    ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
                title={camaraActiva ? 'Apagar cámara' : 'Escanear con cámara web'}
              >
                {camaraActiva ? <VideoOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                <span className="hidden sm:inline">
                  {camaraActiva ? 'Cerrar Cámara' : 'Usar Cámara'}
                </span>
              </button>
            </div>
          </div>

          {/* Visor de Cámara si está activa */}
          {camaraActiva && (
            <div className="mt-4 p-4 bg-slate-900 rounded-2xl flex flex-col items-center animate-fadeIn">
              <div className="relative max-w-sm w-full aspect-video bg-black rounded-xl overflow-hidden border-2 border-emerald-500 shadow-inner">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-dashed border-emerald-400/70 m-6 rounded-lg pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] text-emerald-300 bg-black/60 px-2 py-0.5 rounded">
                    Apunta la cámara al código QR
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Simula o detecta el QR impreso en el comprobante del paciente.
              </p>
            </div>
          )}

          {/* Botones de Casos de Prueba Rápidos (DoD Demo) */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">
              Casos de prueba para validación rápida:
            </span>
            <button
              type="button"
              onClick={() => cargarDemo('REC-CDE-2026-001')}
              className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded hover:bg-emerald-100"
            >
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Receta Válida y Vigente</span>
            </button>
            <button
              type="button"
              onClick={() => cargarDemo('REC-CDE-2026-002')}
              className="text-[10px] font-bold px-2 py-1 bg-rose-50 text-rose-800 border border-rose-300 rounded hover:bg-rose-100"
            >
              <span className="inline-flex items-center gap-1"><XCircle className="w-3 h-3 text-rose-600" /> Receta Vencida (&gt;30 días)</span>
            </button>
            <button
              type="button"
              onClick={() => cargarDemo('REC-CDE-2026-003')}
              className="text-[10px] font-bold px-2 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded hover:bg-amber-100"
            >
              <span className="inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-600" /> Receta Ya Dispensada</span>
            </button>
          </div>

          {errorBusqueda && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorBusqueda}</span>
            </div>
          )}
        </div>

        {/* Mensaje de Dispensación Exitosa */}
        {dispensacionExitosa && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 text-emerald-900 flex items-start gap-3 shadow-xs animate-fadeIn">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Dispensación Registrada con Éxito</h4>
              <p className="text-xs text-emerald-800 mt-0.5">{dispensacionExitosa}</p>
              <p className="text-[11px] text-emerald-700 mt-1 font-mono">
                La receta ha sido anulada para futuros expendios en el sistema central de ESU.
              </p>
            </div>
          </div>
        )}

        {/* Tarjeta Detallada de la Receta (DoD HU-77) */}
        {receta && (
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-6">
            {/* Cabecera de Estado y Vigencia */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Código de Receta Digital
                </span>
                <h3 className="text-lg font-black text-slate-900 font-mono tracking-tight flex items-center gap-2">
                  {receta.codigoReceta}
                </h3>
              </div>

              {/* Badges de Estado */}
              <div className="flex items-center gap-2">
                {receta.estado === 'PENDIENTE' && (
                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    VÁLIDA PARA DISPENSACIÓN
                  </span>
                )}
                {receta.estado === 'DISPENSADA' && (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    YA DISPENSADA (NO EXPENDIBLE)
                  </span>
                )}
                {receta.estado === 'VENCIDA' && (
                  <span className="bg-rose-100 text-rose-900 border border-rose-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-700" />
                    RECETA VENCIDA (&gt;30 DÍAS)
                  </span>
                )}
              </div>
            </div>

            {/* Cuadrícula de Metadatos: Médico, Paciente y Centro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Médico Emisor */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                  Médico Prescriptor
                </div>
                <p className="font-bold text-slate-900 text-xs">{receta.medicoNombre}</p>
                <p className="text-[11px] text-slate-600">Matrícula: {receta.medicoMatricula}</p>
                <p className="text-[11px] text-blue-800 font-medium">{receta.especialidad}</p>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {receta.centroSaludNombre}
                </p>
              </div>

              {/* Paciente Titular */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Paciente
                </div>
                <p className="font-bold text-slate-900 text-xs">{receta.pacienteNombre}</p>
                <p className="text-[11px] text-slate-600">DNI: {receta.pacienteDni}</p>
                <p className="text-[11px] text-emerald-800 font-semibold">
                  {receta.pacienteObraSocial} - N°: {receta.pacienteNroAfiliado}
                </p>
              </div>

              {/* Fechas de Emisión y Vigencia */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Vigencia Temporal (Ley 27.553)
                </div>
                <p className="text-[11px] text-slate-700">
                  <strong>Emisión:</strong> {receta.fechaEmision}
                </p>
                <p className="text-[11px] text-slate-700">
                  <strong>Vencimiento:</strong> {receta.fechaVencimiento}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Diagnóstico CIE-10: <strong>{receta.codigoCie10 || 'Z00.0'}</strong> ({receta.diagnostico})
                </p>
              </div>
            </div>

            {/* Lista Desglosada de Medicamentos Prescriptos (DoD HU-77) */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-emerald-600" />
                Medicamentos a Dispensar ({receta.medicamentos.length})
              </h4>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                {receta.medicamentos.map((med, index) => (
                  <div key={index} className="p-3.5 bg-white hover:bg-slate-50 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="font-bold text-slate-900 text-xs">
                        {index + 1}. {med.droga}{' '}
                        {med.nombreComercial && (
                          <span className="text-slate-500 font-normal">
                            (Sugerido: {med.nombreComercial})
                          </span>
                        )}
                        <span className="ml-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
                          {med.presentacion}
                        </span>
                      </div>
                      <span className="text-xs font-black text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        Cantidad: {med.cantidad}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <p>
                        <strong>Dosis / Vía:</strong> {med.dosisIndicada} · Vía {med.viaAdministracion}
                      </p>
                      <p>
                        <strong>Posología:</strong> {med.posologia}{' '}
                        {med.duracion ? `· ${med.duracion}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Si ya fue dispensada, mostrar los datos del expendio */}
            {receta.estado === 'DISPENSADA' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Registro de Dispensación Previa:
                </p>
                <p>
                  <strong>Farmacia:</strong> {receta.farmaciaDispensadora || 'Farmacia Registrada'}
                </p>
                <p>
                  <strong>Fecha y Hora de Expendio:</strong>{' '}
                  {receta.fechaDispensacion || 'Previamente asentada'}
                </p>
              </div>
            )}

            {/* Sección de Dispensación Activa (DoD HU-77) */}
            {receta.estado === 'PENDIENTE' && (
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2">
                  2. Registro y Confirmación de Dispensación Farmacéutica
                </h4>
                <p className="text-xs text-slate-600 mb-4">
                  Al confirmar, la receta quedará marcada como <strong>DISPENSADA</strong> en la
                  base unificada de Cruz del Eje, impidiendo que el paciente pueda reutilizarla en
                  otra farmacia.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Nombre de la Farmacia
                    </label>
                    <input
                      type="text"
                      value={farmaciaNombre}
                      onChange={(e) => setFarmaciaNombre(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Matrícula del Farmacéutico Responsable
                    </label>
                    <input
                      type="text"
                      value={farmaciaMatricula}
                      onChange={(e) => setFarmaciaMatricula(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleDispensar}
                    disabled={isDispensando}
                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    {isDispensando ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Confirmar Dispensación de Medicamentos
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
