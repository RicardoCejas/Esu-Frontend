import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { AuditoriaSesionesSection } from './components/AuditoriaSesionesSection';
import {
  User,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  AlertCircle,
  CheckCircle2,
  Save,
  Lock,
  Ambulance,
  CreditCard,
  Calendar,
  LogOut,
  X,
  FileCheck,
} from 'lucide-react';

interface PatientProfileData {
  telefonoPrincipal: string;
  telefonoAlternativo: string;
  email: string;
  calle: string;
  barrio: string;
  ciudad: string;
  codigoPostal: string;
  obraSocial: string;
  nroAfiliado: string;
  plan: string;
  grupoSanguineo: string;
  contactoEmergenciaNombre: string;
  contactoEmergenciaVinculo: string;
  contactoEmergenciaTelefono: string;
  alergias: string;
  condicionesCronicas: string;
  centroReferencia: string;
}

const BARRIOS_CRUZ_DEL_EJE = [
  'Barrio Centro',
  'Barrio San Cayetano',
  'Barrio Hospital',
  'Barrio Central',
  'Barrio Las Playas',
  'Barrio Rincón',
  'Barrio Malvinas',
  'Barrio La Rinconada',
  'Barrio Palo Parado',
  'Otro sector de Cruz del Eje',
];

const GRUPOS_SANGUINEOS = ['0+', '0-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const CENTROS_SALUD = [
  'Hospital Regional Aurelio Crespo',
  'Clínica Privada Cabrera',
  'Centro de Diagnóstico Cruz del Eje',
];

export const MiPerfilPage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  // Modal para solicitar cambio de correo electrónico
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoEmailConfirm, setNuevoEmailConfirm] = useState('');
  const [motivoCambioEmail, setMotivoCambioEmail] = useState('');
  const [emailSolicitadoToast, setEmailSolicitadoToast] = useState(false);

  // Datos editables del perfil del paciente
  const [formData, setFormData] = useState<PatientProfileData>({
    telefonoPrincipal: user?.telefono || '3549-551122',
    telefonoAlternativo: '3549-421000',
    email: user?.email || 'lucas.ramirez@email.com',
    calle: 'Av. Sarmiento 840',
    barrio: 'Barrio Centro',
    ciudad: 'Cruz del Eje',
    codigoPostal: '5280',
    obraSocial: user?.obraSocial || 'APROSS',
    nroAfiliado: user?.nroAfiliado || '20-38123456-01',
    plan: 'Plan Integral Familiar',
    grupoSanguineo: user?.grupoSanguineo || '0+',
    contactoEmergenciaNombre: 'Marta Elena Gómez',
    contactoEmergenciaVinculo: 'Madre',
    contactoEmergenciaTelefono: '3549-408899',
    alergias: 'Penicilina, Betalactámicos',
    condicionesCronicas: 'Ninguna conocida',
    centroReferencia: 'Hospital Regional Aurelio Crespo',
  });

  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Cargar datos guardados previamente en el equipo
  useEffect(() => {
    try {
      const saved = localStorage.getItem('esu_patient_profile_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignorar error de parsing
    }
  }, []);

  const handleChange = (campo: keyof PatientProfileData, valor: string) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleGuardarCambios = (seccion: string) => {
    setGuardando(true);
    setMensajeExito(null);

    try {
      localStorage.setItem('esu_patient_profile_data', JSON.stringify(formData));
      updateUser({
        telefono: formData.telefonoPrincipal,
        obraSocial: formData.obraSocial,
        nroAfiliado: formData.nroAfiliado,
        grupoSanguineo: formData.grupoSanguineo,
      });

      setMensajeExito(`Los datos de ${seccion} se actualizaron correctamente.`);
      success(`Datos de ${seccion} guardados.`);
      setTimeout(() => setMensajeExito(null), 4000);
    } catch {
      toastError('No se pudieron guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  const handleSolicitarCambioEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoEmail || nuevoEmail !== nuevoEmailConfirm) {
      toastError('Los correos electrónicos ingresados no coinciden.');
      return;
    }

    setIsEmailModalOpen(false);
    setEmailSolicitadoToast(true);
    success(`Solicitud enviada. Te enviamos un enlace de validación a ${nuevoEmail}`);
    setNuevoEmail('');
    setNuevoEmailConfirm('');
    setMotivoCambioEmail('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Encabezado Principal de Identidad */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-sky-100 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-700 text-xl font-black text-white shadow-sm font-heading">
            {user?.nombre?.charAt(0) || 'L'}
            {user?.apellido?.charAt(0) || 'R'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900 font-heading">
                {user?.nombre || 'Lucas'} {user?.apellido || 'Ramírez'}
              </h1>
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                Padrón Activo
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Historia Clínica N° <strong className="text-slate-700 font-mono">HC-{user?.dni || '38123456'}-CDE</strong> • Sistema Único de Salud de Cruz del Eje
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Alerta de Éxito al Guardar */}
      {mensajeExito && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* Alerta de Solicitud de Cambio de Correo */}
      {emailSolicitadoToast && (
        <div className="flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50 p-4 text-xs font-semibold text-sky-950 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Mail className="h-5 w-5 text-sky-700 shrink-0" />
            <span>
              Solicitud de cambio de correo registrada. Tu dirección actual seguirá activa para recordatorios hasta que confirmes el enlace enviado.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setEmailSolicitadoToast(false)}
            className="text-sky-700 hover:text-sky-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Grid de Secciones del Perfil del Paciente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Datos Personales y Documentación Legal */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-heading">
                Datos Personales y de Identidad
              </h2>
              <p className="text-xs text-slate-500">
                Registrados según padrón oficial y Registro Civil
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-slate-700">DNI / Documento de Identidad</label>
                <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <Lock className="h-3 w-3 text-slate-500" />
                  Protegido
                </span>
              </div>
              <input
                type="text"
                disabled
                value={user?.dni || '38123456'}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-700 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">
                Para rectificar tu DNI o nombre legal, debés presentar tu DNI físico en la ventanilla de recepción del hospital o centro de salud.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs sm:text-sm font-bold text-slate-700">Fecha de Nacimiento</label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-600" />
                  <input
                    type="text"
                    disabled
                    value="14/08/1993 (33 años)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs font-medium text-slate-700 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-bold text-slate-700">Sexo / Género</label>
                <input
                  type="text"
                  disabled
                  value="Masculino"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs sm:text-sm font-bold text-slate-700">CUIL</label>
                <input
                  type="text"
                  disabled
                  value={`20-${user?.dni || '38123456'}-7`}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-700 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-bold text-slate-700">Nacionalidad</label>
                <input
                  type="text"
                  disabled
                  value="Argentina"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-700 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Contacto y Gestión de Notificaciones (Editable) */}
        <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-heading">
                  Contacto y Notificaciones
                </h2>
                <p className="text-xs text-slate-500">
                  Teléfonos de aviso para turnos y guardia
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleGuardarCambios('Contacto')}
              disabled={guardando}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-800 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Guardar</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-700">
                Teléfono Celular Principal (WhatsApp / SMS)
              </label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-600" />
                <input
                  type="tel"
                  value={formData.telefonoPrincipal}
                  onChange={(e) => handleChange('telefonoPrincipal', e.target.value)}
                  placeholder="ej: 3549-551122"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-8 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Aquí recibirás recordatorios de citas y avisos de reprogramación por guardia.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Teléfono Fijo / Alternativo</label>
              <input
                type="tel"
                value={formData.telefonoAlternativo}
                onChange={(e) => handleChange('telefonoAlternativo', e.target.value)}
                placeholder="ej: 3549-421000"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">Correo Electrónico Actual</label>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Verificado
                </span>
              </div>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-600" />
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs font-medium text-slate-700 cursor-not-allowed"
                />
              </div>

              {/* Botón para solicitar cambio de correo */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-800 transition cursor-pointer"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Solicitar cambio de correo electrónico</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Domicilio y Residencia en Cruz del Eje (Editable) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-heading">
                  Domicilio y Residencia
                </h2>
                <p className="text-xs text-slate-500">
                  Para asignación de dispensarios barriales (CAPS)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleGuardarCambios('Domicilio')}
              disabled={guardando}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-800 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Guardar</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-700">Calle y Número</label>
              <input
                type="text"
                value={formData.calle}
                onChange={(e) => handleChange('calle', e.target.value)}
                placeholder="ej: Av. Sarmiento 840"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Barrio de Cruz del Eje</label>
              <select
                value={formData.barrio}
                onChange={(e) => handleChange('barrio', e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition cursor-pointer"
              >
                {BARRIOS_CRUZ_DEL_EJE.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Localidad</label>
                <input
                  type="text"
                  disabled
                  value="Cruz del Eje, Córdoba"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-700 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Código Postal</label>
                <input
                  type="text"
                  value={formData.codigoPostal}
                  onChange={(e) => handleChange('codigoPostal', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Cobertura Médica y Obra Social */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-heading">
                  Cobertura Médica y Obra Social
                </h2>
                <p className="text-xs text-slate-500">
                  Convenios para aranceles y consultas
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleGuardarCambios('Cobertura Médica')}
              disabled={guardando}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-800 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Guardar</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-700">Obra Social / Prepaga / Cobertura</label>
              <input
                type="text"
                value={formData.obraSocial}
                onChange={(e) => handleChange('obraSocial', e.target.value)}
                placeholder="ej: APROSS, PAMI, SUMAR o Particular"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Número de Afiliado</label>
                <input
                  type="text"
                  value={formData.nroAfiliado}
                  onChange={(e) => handleChange('nroAfiliado', e.target.value)}
                  placeholder="ej: 20-38123456-01"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Plan / Categoría</label>
                <input
                  type="text"
                  value={formData.plan}
                  onChange={(e) => handleChange('plan', e.target.value)}
                  placeholder="ej: Integral, Clásico"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700">Estado de Empadronamiento</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                <FileCheck className="h-3 w-3" /> Habilitado en Ventanilla
              </span>
            </div>
          </div>
        </section>

        {/* 5. Ficha Médica de Emergencia y Resumen Clínico */}
        <section className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs space-y-4 md:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
                <HeartPulse className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-heading">
                  Ficha Médica de Emergencia y Datos Críticos
                </h2>
                <p className="text-xs text-slate-500">
                  Información visible para médicos de guardia en caso de urgencia
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleGuardarCambios('Ficha de Emergencia')}
              disabled={guardando}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-800 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Guardar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-700">Grupo Sanguíneo y RH</label>
              <select
                value={formData.grupoSanguineo}
                onChange={(e) => handleChange('grupoSanguineo', e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition cursor-pointer"
              >
                {GRUPOS_SANGUINEOS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Donante de Órganos</label>
              <input
                type="text"
                disabled
                value="Registrado (Ley Justina 27.447)"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Centro de Salud de Referencia</label>
              <select
                value={formData.centroReferencia}
                onChange={(e) => handleChange('centroReferencia', e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition cursor-pointer"
              >
                {CENTROS_SALUD.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Contacto de Emergencia (Nombre)</label>
              <input
                type="text"
                value={formData.contactoEmergenciaNombre}
                onChange={(e) => handleChange('contactoEmergenciaNombre', e.target.value)}
                placeholder="ej: Marta Elena Gómez"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Vínculo / Parentesco</label>
              <input
                type="text"
                value={formData.contactoEmergenciaVinculo}
                onChange={(e) => handleChange('contactoEmergenciaVinculo', e.target.value)}
                placeholder="ej: Madre, Pareja, Hijo/a"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Teléfono Directo de Urgencia</label>
              <div className="relative mt-1">
                <Ambulance className="absolute left-3 top-2.5 h-3.5 w-3.5 text-rose-500" />
                <input
                  type="tel"
                  value={formData.contactoEmergenciaTelefono}
                  onChange={(e) => handleChange('contactoEmergenciaTelefono', e.target.value)}
                  placeholder="ej: 3549-408899"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-8 pr-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>
            </div>

            <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Alergias Medicamentosas / Sustancias Declaradas
                </label>
                <input
                  type="text"
                  value={formData.alergias}
                  onChange={(e) => handleChange('alergias', e.target.value)}
                  placeholder="ej: Penicilina, AINEs, Yodo, Ninguna"
                  className="mt-1 w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">
                  Condiciones Crónicas / Medicación Habitual
                </label>
                <input
                  type="text"
                  value={formData.condicionesCronicas}
                  onChange={(e) => handleChange('condicionesCronicas', e.target.value)}
                  placeholder="ej: Hipertensión arterial, Asma, Ninguna"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* HU-72: Auditoría de Seguridad y Sesiones Activas */}
      <AuditoriaSesionesSection />

      {/* Modal Accesible: Solicitar Cambio de Correo Electrónico */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    Solicitar Cambio de Correo Electrónico
                  </h3>
                  <p className="text-xs text-slate-500">
                    Proceso de seguridad para pacientes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl bg-sky-50 p-3 text-[11px] text-sky-950 border border-sky-100 leading-relaxed">
              Por razones de confidencialidad y validez de tus recetas digitales, al enviar la solicitud se remitirá un correo de verificación a tu nueva dirección. Tu casilla actual seguirá operando hasta que confirmes el enlace institucional.
            </div>

            <form onSubmit={handleSolicitarCambioEmail} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Correo Electrónico Actual</label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Nuevo Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  placeholder="ej: nuevo.correo@email.com"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Confirmar Nuevo Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={nuevoEmailConfirm}
                  onChange={(e) => setNuevoEmailConfirm(e.target.value)}
                  placeholder="Reingresá el nuevo correo"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Motivo del Cambio (Opcional)</label>
                <input
                  type="text"
                  value={motivoCambioEmail}
                  onChange={(e) => setMotivoCambioEmail(e.target.value)}
                  placeholder="ej: Pérdida de acceso a casilla anterior"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-sky-700 py-2.5 text-xs font-bold text-white hover:bg-sky-800 transition cursor-pointer shadow-xs"
                >
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
