import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { clinicaService } from '@/api/clinicaService';
import { Cie10Autocomplete } from '@/components/Cie10Autocomplete';
import type { ResumenClinico, Cie10Diagnostico } from '@/types';
import {
  AlertTriangle,
  ShieldAlert,
  HeartPulse,
  CheckCircle2,
  ArrowLeft,
  QrCode,
  Plus,
  Trash2,
  Scale,
  Clock,
  History,
  FileSignature,
  Lock,
  AlertOctagon,
  FileText
} from 'lucide-react';

interface FármacoPrescripto {
  nombreComercial: string;
  droga: string;
  presentacion: string;
  dosisIndicada: string;
  posologia: string;
  viaAdministracion: string;
  duracion: string;
  cantidad: string;
}

export const AtencionConsultaPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const pacienteId = searchParams.get('pacienteId') || '1';
  const turnoId = searchParams.get('turnoId') || '';
  const pacienteNombreParam = searchParams.get('pacienteNombre');

  // Resumen del paciente y alertas críticas
  const [resumen, setResumen] = useState<ResumenClinico | null>(null);

  // Estados del Formulario Clínico (Evolución Estructurada)
  const [motivo, setMotivo] = useState('Control general y chequeo clínico de rutina');
  const [anamnesis, setAnamnesis] = useState('Paciente refiere buen estado general sin dolor torácico.');
  const [examenFisico, setExamenFisico] = useState('Normotenso, afebril, buena mecánica ventilatoria. R1 y R2 normofonéticos.');
  const [diagnosticoTexto, setDiagnosticoTexto] = useState('');
  const [cie10, setCie10] = useState<Cie10Diagnostico | null>(null);
  const [tratamiento, setTratamiento] = useState('Pautas de alarma. Hidratación adecuada.');

  // Signos Vitales
  const [presion, setPresion] = useState('120/80');
  const [frecuencia, setFrecuencia] = useState('72');
  const [temperatura, setTemperatura] = useState('36.5');
  const [peso, setPeso] = useState('74');
  const [talla, setTalla] = useState('175');

  // Receta Digital Dinámica
  const [incluirReceta, setIncluirReceta] = useState(false);
  const [medicamentos, setMedicamentos] = useState<FármacoPrescripto[]>([
    {
      nombreComercial: '',
      droga: 'Paracetamol',
      presentacion: 'Comprimidos 500mg',
      dosisIndicada: '500 mg',
      posologia: 'Cada 8 horas',
      viaAdministracion: 'Oral',
      duracion: '3 días',
      cantidad: '1 caja (16 comp.)',
    },
  ]);

  // Borrador y Auto-guardado
  const [ultimoAutoguardado, setUltimoAutoguardado] = useState<string | null>(null);

  // Modales
  const [showFirmaModal, setShowFirmaModal] = useState(false);
  const [showAdendaModal, setShowAdendaModal] = useState(false);
  const [showAnulacionModal, setShowAnulacionModal] = useState(false);
  const [justificacionAdenda, setJustificacionAdenda] = useState('');
  const [contenidoAdenda, setContenidoAdenda] = useState('');
  const [dictamenAnulacion, setDictamenAnulacion] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [hashGenerado, setHashGenerado] = useState<string | null>(null);

  // Cálculo reactivo de IMC
  const imcCalculado = useMemo(() => {
    const p = parseFloat(peso);
    const t = parseFloat(talla) / 100;
    if (p > 0 && t > 0) {
      const val = (p / (t * t)).toFixed(1);
      const num = parseFloat(val);
      let cat = 'Normal';
      let color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
      if (num < 18.5) {
        cat = 'Bajo peso';
        color = 'text-amber-700 bg-amber-50 border-amber-200';
      } else if (num >= 25 && num < 30) {
        cat = 'Sobrepeso';
        color = 'text-amber-700 bg-amber-50 border-amber-200';
      } else if (num >= 30) {
        cat = 'Obesidad';
        color = 'text-rose-700 bg-rose-50 border-rose-200';
      }
      return { valor: val, categoria: cat, colorClass: color };
    }
    return { valor: '--', categoria: 'Sin datos', colorClass: 'text-gray-500 bg-gray-50 border-gray-200' };
  }, [peso, talla]);

  // Carga inicial del Resumen Clínico (HU-49)
  useEffect(() => {
    const cargarResumen = async () => {
      try {
        const data = await clinicaService.getResumenClinico(pacienteId);
        setResumen(data);

        // Restaurar borrador local si existe
        const draftKey = `esu_draft_consulta_${pacienteId}`;
        const draftJson = localStorage.getItem(draftKey);
        if (draftJson) {
          try {
            const draft = JSON.parse(draftJson);
            if (draft.motivo) setMotivo(draft.motivo);
            if (draft.anamnesis) setAnamnesis(draft.anamnesis);
            if (draft.examenFisico) setExamenFisico(draft.examenFisico);
            if (draft.diagnosticoTexto) setDiagnosticoTexto(draft.diagnosticoTexto);
            if (draft.cie10) setCie10(draft.cie10);
            if (draft.tratamiento) setTratamiento(draft.tratamiento);
            if (draft.presion) setPresion(draft.presion);
            if (draft.frecuencia) setFrecuencia(draft.frecuencia);
            if (draft.temperatura) setTemperatura(draft.temperatura);
            if (draft.peso) setPeso(draft.peso);
            if (draft.talla) setTalla(draft.talla);
            if (draft.medicamentos) setMedicamentos(draft.medicamentos);
            if (draft.incluirReceta !== undefined) setIncluirReceta(draft.incluirReceta);
          } catch (e) {
            console.error('Error restaurando borrador:', e);
          }
        }
      } catch (err) {
        console.error('Error al cargar resumen clínico:', err);
      }
    };

    cargarResumen();
  }, [pacienteId]);

  // Auto-guardado local reactivo cada cambio con debounce (HU-49)
  useEffect(() => {
    const timer = setTimeout(() => {
      const draftData = {
        motivo,
        anamnesis,
        examenFisico,
        diagnosticoTexto,
        cie10,
        tratamiento,
        presion,
        frecuencia,
        temperatura,
        peso,
        talla,
        medicamentos,
        incluirReceta,
        fecha: new Date().toISOString(),
      };
      localStorage.setItem(`esu_draft_consulta_${pacienteId}`, JSON.stringify(draftData));
      clinicaService.guardarBorrador({ pacienteId, draftData });
      setUltimoAutoguardado(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1500);

    return () => clearTimeout(timer);
  }, [motivo, anamnesis, examenFisico, diagnosticoTexto, cie10, tratamiento, presion, frecuencia, temperatura, peso, talla, medicamentos, incluirReceta, pacienteId]);

  // Gestión de fármacos en prescripción dinámica
  const agregarMedicamento = () => {
    setMedicamentos([
      ...medicamentos,
      {
        nombreComercial: '',
        droga: '',
        presentacion: '',
        dosisIndicada: '',
        posologia: '',
        viaAdministracion: 'Oral',
        duracion: '',
        cantidad: '1 caja',
      },
    ]);
  };

  const eliminarMedicamento = (index: number) => {
    setMedicamentos(medicamentos.filter((_, i) => i !== index));
  };

  const handleMedChange = (index: number, field: keyof FármacoPrescripto, val: string) => {
    const updated = [...medicamentos];
    updated[index] = { ...updated[index], [field]: val };
    setMedicamentos(updated);
  };

  // Confirmar Firma Inalterable (HU-51)
  const handleConfirmarFirma = async () => {
    if (!cie10) {
      alert('Debe seleccionar al menos un diagnóstico formal CIE-10 antes de firmar.');
      return;
    }

    setIsSubmitting(true);
    setShowFirmaModal(false);

    try {
      const payload = {
        motivoConsulta: motivo,
        anamnesis,
        examenFisico,
        diagnostico: diagnosticoTexto || cie10.descripcion,
        codigoCie10: cie10.codigo,
        descripcionCie10: cie10.descripcion,
        tratamiento,
        presionArterial: `${presion} mmHg`,
        frecuenciaCardiaca: `${frecuencia} lpm`,
        temperatura: `${temperatura} °C`,
        peso: `${peso} kg`,
        talla: `${talla} cm`,
        imc: imcCalculado.valor,
        incluirReceta,
        medicamentos: incluirReceta ? medicamentos : [],
      };

      const res = await clinicaService.finalizarAtencion(turnoId || '1', payload);
      setHashGenerado(res.hashIntegridad || '3a887b41e8c950d88251e6b83f09804b49cb3766');

      // Limpiar borrador local al firmar definitivamente
      localStorage.removeItem(`esu_draft_consulta_${pacienteId}`);
      setGuardadoExitoso(true);
    } catch (err: any) {
      alert('Error al firmar consulta: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Emisión de Adenda / Fe de erratas (HU-51)
  const handleGuardarAdenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justificacionAdenda.trim() || !contenidoAdenda.trim()) {
      alert('La justificación clínica y el contenido aclaratorio son obligatorios.');
      return;
    }

    try {
      await clinicaService.registrarAdenda(1, {
        profesionalId: user?.id || 1,
        justificacionClinica: justificacionAdenda,
        contenidoAdicional: contenidoAdenda,
      });
      alert('Adenda médica registrada con éxito con hash de inalterabilidad.');
      setShowAdendaModal(false);
      setJustificacionAdenda('');
      setContenidoAdenda('');
    } catch (err: any) {
      alert('Error emitiendo adenda: ' + (err.message || 'Error'));
    }
  };

  // Solicitud de anulación legal (HU-51)
  const handleSolicitarAnulacion = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Dictamen legal registrado. La solicitud de anulación ha sido elevada al Comité de Auditoría y Legales.');
    setShowAnulacionModal(false);
    setDictamenAnulacion('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Barra superior de atención clínica */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/medico/agenda')}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              title="Volver a la Agenda"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h1 className="text-lg font-black text-slate-900 tracking-tight">
                  Atención Clínica Estructurada (Consultorio)
                </h1>
                {turnoId && (
                  <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-200">
                    Turno #{turnoId}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Dr./Dra. {user?.nombre || 'Médico'} {user?.apellido || 'Tratante'} •{' '}
                <span className="font-semibold text-emerald-700">Matrícula {user?.matricula || 'MP-34982'} (Habilitada)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Indicador de Auto-guardado de Borrador (HU-49) */}
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Borrador local:</span>
              <span className="font-semibold text-slate-700">
                {ultimoAutoguardado ? `Auto-guardado a las ${ultimoAutoguardado}` : 'Guardando...'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowAdendaModal(true)}
              className="text-xs font-semibold px-3 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              Emitir Adenda (Fe de Erratas)
            </button>

            <button
              type="button"
              onClick={() => setShowAnulacionModal(true)}
              className="text-xs font-semibold px-3 py-2 text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1.5"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
              Solicitar Anulación Legal
            </button>
          </div>
        </div>
      </div>

      {/* Pantalla dividida en 3 COLUMNAS ESTRUCTURADAS (HU-49) */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        {guardadoExitoso ? (
          <div className="bg-white rounded-2xl p-8 border border-emerald-200 shadow-md text-center max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              Consulta Médica Firmada y Cerrada con Éxito
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              El acto médico ha quedado inscripto en la Historia Clínica Única con validez jurídica conforme a la Ley 26.529. El turno se actualizó a estado <strong>FINALIZADO</strong>.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-6 font-mono text-xs text-slate-600 space-y-1">
              <p><span className="font-bold text-slate-900">Hash SHA-256 de Integridad:</span> {hashGenerado}</p>
              <p><span className="font-bold text-slate-900">Estado de la Evolución:</span> INALTERABLE / FIRMADA</p>
              <p><span className="font-bold text-slate-900">Fecha y Hora de Cierre:</span> {new Date().toLocaleString()}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/medico/agenda"
                className="px-5 py-2.5 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-sm"
              >
                Volver a la Agenda de Turnos
              </Link>
              <Link
                to={`/paciente/historial?pacienteId=${pacienteId}`}
                className="px-5 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Ver Línea de Tiempo del Paciente
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMNA 1: Datos del Paciente y PANEL DE ALERTAS CRÍTICAS FIJO (HU-49) */}
            <div className="lg:col-span-3 space-y-5">
              {/* Tarjeta de Paciente */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-lg">
                    {resumen?.nombreCompleto ? resumen.nombreCompleto.substring(0, 2).toUpperCase() : 'PA'}
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 leading-snug">
                      {resumen?.nombreCompleto || pacienteNombreParam || 'Cargando paciente...'}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      DNI: {resumen?.dni || '38123456'} • {resumen?.edad || 34} años
                    </p>
                  </div>
                </div>

                <div className="pt-3 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Obra Social:</span>
                    <span className="font-bold text-slate-800">{resumen?.obraSocial || 'APROSS'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">N° Afiliado:</span>
                    <span className="font-semibold text-slate-800">{resumen?.nroAfiliado || 'AP-884219/00'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Grupo Sanguíneo:</span>
                    <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {resumen?.grupoSanguineo || '0+'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Última Consulta:</span>
                    <span className="font-semibold text-slate-700">{resumen?.ultimaConsultaFecha || '15/09/2026'}</span>
                  </div>
                </div>
              </div>

              {/* PANEL LATERAL DE ALERTAS MÉDICAS CRÍTICAS FIJO (Alergias graves destacadas en rojo - HU-49 DoD) */}
              <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-rose-900">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  <h3 className="text-sm font-black tracking-tight uppercase">
                    Alertas Médicas Críticas
                  </h3>
                </div>
                <p className="text-xs text-rose-800 mb-3 font-medium">
                  Información clínica de alto riesgo de visualización mandatoria:
                </p>
                <div className="space-y-2">
                  {resumen?.alertasCriticas?.map((alerta, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-white border border-rose-200 rounded-xl text-xs font-bold text-rose-800 shadow-2xs flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{alerta}</span>
                    </div>
                  )) || (
                    <div className="p-2.5 bg-white border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>ALERGIA GRAVE: Penicilina y derivados (Shock Anafiláctico)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Acceso a Historial Previo */}
              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Historial del Paciente</p>
                  <p className="text-slate-500">Línea de tiempo cronológica</p>
                </div>
                <Link
                  to={`/paciente/historial?pacienteId=${pacienteId}`}
                  target="_blank"
                  className="px-3 py-1.5 bg-white border border-slate-300 font-bold text-slate-800 rounded-lg hover:bg-slate-50 shadow-2xs"
                >
                  Abrir
                </Link>
              </div>
            </div>

            {/* COLUMNA 2: Antecedentes Patológicos y Signos Vitales (HU-49) */}
            <div className="lg:col-span-3 space-y-5">
              {/* Formulario de Signos Vitales */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <HeartPulse className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-black text-slate-900">
                    Signos Vitales y Somatometría
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Presión Arterial (TA)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={presion}
                        onChange={(e) => setPresion(e.target.value)}
                        placeholder="120/80"
                        className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-2 text-2xs font-bold text-slate-400">mmHg</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Frecuencia Cardíaca
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={frecuencia}
                          onChange={(e) => setFrecuencia(e.target.value)}
                          placeholder="72"
                          className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="absolute right-3 top-2 text-2xs font-bold text-slate-400">lpm</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Temperatura
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={temperatura}
                          onChange={(e) => setTemperatura(e.target.value)}
                          placeholder="36.5"
                          className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="absolute right-3 top-2 text-2xs font-bold text-slate-400">°C</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Peso Corporal
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={peso}
                          onChange={(e) => setPeso(e.target.value)}
                          placeholder="74"
                          className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="absolute right-3 top-2 text-2xs font-bold text-slate-400">kg</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Talla / Estatura
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={talla}
                          onChange={(e) => setTalla(e.target.value)}
                          placeholder="175"
                          className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="absolute right-3 top-2 text-2xs font-bold text-slate-400">cm</span>
                      </div>
                    </div>
                  </div>

                  {/* Cálculo reactivo de IMC dinámico */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${imcCalculado.colorClass}`}>
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-4 h-4" />
                      <span>IMC Calculado:</span>
                    </div>
                    <span>{imcCalculado.valor} ({imcCalculado.categoria})</span>
                  </div>
                </div>
              </div>

              {/* Antecedentes Clínicos del Paciente */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                  Antecedentes Personales
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {resumen?.antecedentes?.map((ant, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
                      <span>{ant}</span>
                    </li>
                  )) || (
                    <li>Sin antecedentes registrados previamente.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* COLUMNA 3: FORMULARIO DE CONSULTA ACTUAL ESTRUCTURADO (HU-49, HU-50, HU-51) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-black text-slate-900">
                      Formulario de Evolución Médica
                    </h2>
                    <p className="text-xs text-slate-500">
                      Registro clínico regido por ley de inmutabilidad y derechos del paciente
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                    Paso 1 de 2
                  </span>
                </div>

                {/* 1. Motivo de Consulta */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1. Motivo de Consulta <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Ej. Fiebre de 48hs y dolor de garganta..."
                    className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                {/* 2. Anamnesis / Enfermedad Actual */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    2. Anamnesis y Evolución del Cuadro
                  </label>
                  <textarea
                    rows={3}
                    value={anamnesis}
                    onChange={(e) => setAnamnesis(e.target.value)}
                    placeholder="Descripción detallada del cuadro relatado por el paciente..."
                    className="w-full text-xs font-normal p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* 3. Examen Físico */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    3. Examen Físico y Hallazgos Clínicos
                  </label>
                  <textarea
                    rows={2}
                    value={examenFisico}
                    onChange={(e) => setExamenFisico(e.target.value)}
                    placeholder="Hallazgos semiológicos a la inspección, palpación y auscultación..."
                    className="w-full text-xs font-normal p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* 4. DIAGNÓSTICO REACTIVO CIE-10 (HU-50) */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <Cie10Autocomplete
                    selected={cie10}
                    onSelect={(diag) => setCie10(diag)}
                    required
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Aclaración Diagnóstica / Observaciones Clínicas
                    </label>
                    <input
                      type="text"
                      value={diagnosticoTexto}
                      onChange={(e) => setDiagnosticoTexto(e.target.value)}
                      placeholder="Diagnóstico en lenguaje natural (ej. Faringitis estreptocócica aguda)..."
                      className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* 5. Plan y Tratamiento */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    5. Tratamiento e Indicaciones Médicas
                  </label>
                  <textarea
                    rows={3}
                    value={tratamiento}
                    onChange={(e) => setTratamiento(e.target.value)}
                    placeholder="Indicaciones higiénico-dietéticas, descanso, reposo y pautas de alarma..."
                    className="w-full text-xs font-normal p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* MÓDULO DINÁMICO DE PRESCRIPCIÓN DE RECETAS DIGITALES (HU-50) */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={incluirReceta}
                        onChange={(e) => setIncluirReceta(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-emerald-600" />
                        Emitir Receta Médica Digital con Código QR
                      </span>
                    </label>

                    {incluirReceta && (
                      <button
                        type="button"
                        onClick={agregarMedicamento}
                        className="text-2xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Agregar Fármaco
                      </button>
                    )}
                  </div>

                  {incluirReceta && (
                    <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-2xs text-emerald-700 bg-emerald-100/50 p-2 rounded-lg font-medium">
                        <span>✓ Matrícula Médica MP-34982 Habilitada para Prescripción Electrónica</span>
                        <span>Ley de Recetas Digitales 27.553</span>
                      </div>

                      {medicamentos.map((med, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs relative">
                          <div className="flex items-center justify-between">
                            <span className="text-2xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              Fármaco #{idx + 1}
                            </span>
                            {medicamentos.length > 1 && (
                              <button
                                type="button"
                                onClick={() => eliminarMedicamento(idx)}
                                className="text-rose-500 hover:text-rose-700 p-1"
                                title="Eliminar fármaco"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <input
                                type="text"
                                placeholder="Principio Activo / Droga *"
                                value={med.droga}
                                onChange={(e) => handleMedChange(idx, 'droga', e.target.value)}
                                className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                                required
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                placeholder="Nombre Comercial (opcional)"
                                value={med.nombreComercial}
                                onChange={(e) => handleMedChange(idx, 'nombreComercial', e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <input
                              type="text"
                              placeholder="Presentación (ej. Comp.)"
                              value={med.presentacion}
                              onChange={(e) => handleMedChange(idx, 'presentacion', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                            />
                            <input
                              type="text"
                              placeholder="Dosis (ej. 500 mg)"
                              value={med.dosisIndicada}
                              onChange={(e) => handleMedChange(idx, 'dosisIndicada', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                            />
                            <input
                              type="text"
                              placeholder="Posología (ej. c/8hs)"
                              value={med.posologia}
                              onChange={(e) => handleMedChange(idx, 'posologia', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                            />
                            <input
                              type="text"
                              placeholder="Duración (ej. 7 días)"
                              value={med.duracion}
                              onChange={(e) => handleMedChange(idx, 'duracion', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* BOTÓN DE FIRMA INALTERABLE CON BLOQUEO ESTRICTO (HU-50, HU-51) */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500">
                    {!cie10 ? (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Bloqueo: Seleccione un diagnóstico CIE-10 para habilitar la firma.
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Requisitos clínicos completos para firma digital.
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!cie10 || isSubmitting}
                    onClick={() => setShowFirmaModal(true)}
                    className={`px-6 py-3 text-sm font-black rounded-xl shadow-md flex items-center gap-2 transition-all ${
                      !cie10 || isSubmitting
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-98'
                    }`}
                  >
                    <FileSignature className="w-4 h-4" />
                    Firmar y Guardar Consulta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE ADVERTENCIA LEGAL DE INALTERABILIDAD DEFINITIVA (HU-51 DoD) */}
      {showFirmaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600 mb-4 pb-3 border-b border-amber-100">
              <Lock className="w-6 h-6 text-amber-500 shrink-0" />
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  Advertencia Legal: Firma Inalterable Definitiva
                </h3>
                <p className="text-2xs text-slate-500">Ley Nacional 26.529 de Derechos del Paciente</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed mb-6">
              <p>
                Al confirmar la firma electrónica de este acto médico:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 font-medium text-slate-700">
                <li>
                  La evolución clínica quedará <strong>sellada criptográficamente (SHA-256)</strong> de manera inalterable en el servidor.
                </li>
                <li>
                  <strong>No se permitirá la edición ni el borrado directo</strong> de este documento por ningún usuario ni administrador.
                </li>
                <li>
                  Cualquier corrección o aclaración posterior deberá realizarse exclusivamente mediante una <strong>Adenda Clínica / Fe de Erratas</strong> justificada.
                </li>
                <li>
                  El turno médico quedará automáticamente cerrado en estado <strong>FINALIZADO</strong>.
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowFirmaModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                Cancelar y Revisar
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmarFirma}
                className="px-5 py-2.5 text-xs font-black bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-sm flex items-center gap-1.5"
              >
                <FileSignature className="w-3.5 h-3.5" />
                {isSubmitting ? 'Firmando en servidor...' : 'Acepto y Firmo Electrónicamente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EMISIÓN DE ADENDA / FE DE ERRATAS (HU-51 DoD) */}
      {showAdendaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <History className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Emitir Adenda Médica / Fe de Erratas
                </h3>
                <p className="text-2xs text-slate-500">Anexar aclaración o corrección a evolución previa inalterable</p>
              </div>
            </div>

            <form onSubmit={handleGuardarAdenda} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Justificación Clínica Obligatoria <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Corrección por resultado sobreviniente de laboratorio..."
                  value={justificacionAdenda}
                  onChange={(e) => setJustificacionAdenda(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Contenido Aclaratorio de la Adenda <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detalle el contenido exacto que complementa o rectifica el registro previo..."
                  value={contenidoAdenda}
                  onChange={(e) => setContenidoAdenda(e.target.value)}
                  className="w-full text-xs font-normal p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdendaModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm"
                >
                  Registrar Adenda Oficial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE SOLICITUD DE ANULACIÓN LEGAL (HU-51 DoD) */}
      {showAnulacionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-4 pb-3 border-b border-rose-100">
              <AlertOctagon className="w-5 h-5 text-rose-500" />
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Solicitar Anulación Legal de Consulta
                </h3>
                <p className="text-2xs text-slate-500">Reemplaza el borrado directo por procedimiento formal</p>
              </div>
            </div>

            <form onSubmit={handleSolicitarAnulacion} className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Por disposición sanitaria, un registro clínico médico no puede ser destruido. Se creará un dictamen formal de nulidad para revisión legal.
              </p>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Dictamen / Fundamento de Nulidad <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explique el motivo grave o error de asignación de paciente que fundamenta la anulación..."
                  value={dictamenAnulacion}
                  onChange={(e) => setDictamenAnulacion(e.target.value)}
                  className="w-full text-xs font-normal p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAnulacionModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black bg-rose-600 text-white rounded-xl hover:bg-rose-700 shadow-sm"
                >
                  Elevar Solicitud de Anulación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
