import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { profesionalesService } from '@/api/profesionalesService';
import { centrosService } from '@/api/centrosService';
import { extractApiErrorMessage } from '@/api/endpoints';
import type { CentroSalud, Especialidad, DisponibilidadProfesional } from '@/types';
import { CambiarPasswordSection } from './CambiarPasswordSection';
import { AuditoriaSesionesSection } from './AuditoriaSesionesSection';
import {
  Stethoscope,
  ShieldCheck,
  Phone,
  Building2,
  Save,
  CheckCircle2,
  LogOut,
  Award,
  FileSignature,
} from 'lucide-react';

const ESPECIALIDADES_MEDICAS = [
  'Medicina General',
  'Clínica Médica',
  'Pediatría',
  'Cardiología',
  'Traumatología y Ortopedia',
  'Cirugía General',
  'Ginecología y Obstetricia',
  'Neurología',
  'Dermatología',
  'Oftalmología',
  'Otorrinolaringología',
  'Psiquiatría',
  'Neumonología',
  'Gastroenterología',
  'Urología',
  'Medicina Familiar y Comunitaria',
];

const CENTROS_SALUD_CDE = [
  'Hospital Regional Dr. Aurelio Crespo',
  'Hospital Provincial Dr. Aurelio Crespo',
  'Clínica Privada Cabrera',
  'Sanatorio María Isabel',
  'Centro de Diagnóstico por Imágenes Cruz del Eje',
  'Dispensario Barrio Centro',
  'Dispensario Barrio San Cayetano',
];

export const PerfilMedicoSection: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Datos profesionales del médico
  const initialDni = user?.dni && /^\d{7,8}$/.test(user.dni.trim()) ? user.dni.trim() : '';
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [apellido, setApellido] = useState(user?.apellido || '');
  const [dni, setDni] = useState(initialDni);
  const [matriculaProvincial, setMatriculaProvincial] = useState(user?.matricula || '');
  const [matriculaNacional, setMatriculaNacional] = useState('');
  const [especialidad, setEspecialidad] = useState(user?.especialidad || '');
  const [especialidadId, setEspecialidadId] = useState('');
  const [subespecialidad, setSubespecialidad] = useState('Atención Ambulatoria');

  // Catálogos reales
  const [especialidadesCat, setEspecialidadesCat] = useState<Especialidad[]>([]);
  const [centrosCat, setCentrosCat] = useState<CentroSalud[]>([]);
  const [disponibilidadesReales, setDisponibilidadesReales] = useState<DisponibilidadProfesional[]>([]);

  // Sede y consultorio
  const [centroSalud, setCentroSalud] = useState(user?.centroSaludNombre || '');
  const [centroSaludId, setCentroSaludId] = useState(user?.centroSaludId ? String(user.centroSaludId) : '');
  const [consultorioHabitual, setConsultorioHabitual] = useState('');
  const [diasAtencion, setDiasAtencion] = useState('');
  const [horarioAtencion, setHorarioAtencion] = useState('');

  // Contacto profesional
  const [telefonoCelular, setTelefonoCelular] = useState(user?.telefono || '');
  const [telefonoInterno, setTelefonoInterno] = useState('');
  const emailInstitucional = user?.email || '';

  // Sello y firma digital
  const [textoFirmaDigital, setTextoFirmaDigital] = useState(
    `Dr./Dra. ${user?.nombre || ''} ${user?.apellido || ''} — ${user?.matricula || 'Matrícula pendiente'} — Esp. ${user?.especialidad || 'Sin especificar'}`
  );

  // Notificaciones y alertas
  const [notifSobreturnos, setNotifSobreturnos] = useState(true);
  const [notifCancelaciones, setNotifCancelaciones] = useState(true);

  // Cargar catálogos y perfil real del profesional desde la API
  useEffect(() => {
    if (!user) return;
    let active = true;

    Promise.all([
      centrosService.getAll().catch(() => [] as CentroSalud[]),
      profesionalesService.getEspecialidades().catch(() => [] as Especialidad[]),
      user.profesionalId ? profesionalesService.getById(user.profesionalId).catch(() => undefined) : Promise.resolve(undefined),
      user.profesionalId ? profesionalesService.getDisponibilidad(user.profesionalId).catch(() => [] as DisponibilidadProfesional[]) : Promise.resolve([] as DisponibilidadProfesional[]),
    ]).then(([centros, esps, prof, disps]) => {
      if (!active) return;
      setCentrosCat(centros);
      setEspecialidadesCat(esps);
      setDisponibilidadesReales(disps.filter((d) => d.activo !== false));

      if (prof) {
        if (prof.nombre) setNombre(prof.nombre);
        if (prof.apellido) setApellido(prof.apellido);
        if (prof.matricula) setMatriculaProvincial(prof.matricula);
        if (prof.telefono) setTelefonoCelular(prof.telefono);
        if (prof.especialidadId) setEspecialidadId(String(prof.especialidadId));
        if (prof.especialidadNombre) setEspecialidad(prof.especialidadNombre);
        const primerCentroId = prof.centrosSaludIds?.[0];
        if (primerCentroId) {
          setCentroSaludId(String(primerCentroId));
          const matchedCenter = centros.find((c) => String(c.id) === String(primerCentroId));
          if (matchedCenter) setCentroSalud(matchedCenter.nombre);
        }
      }

      if (disps.length > 0) {
        const dias = [...new Set(disps.map((d) => d.diaSemana))];
        setDiasAtencion(dias.join(', '));
        const primera = disps[0];
        if (primera?.horaInicio && primera?.horaFin) {
          setHorarioAtencion(`${primera.horaInicio.slice(0, 5)} a ${primera.horaFin.slice(0, 5)} hs`);
        }
      }
    });

    const storageKey = `esu_doctor_profile_${user.id || user.usuarioId || 'medico'}`;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.matriculaNacional) setMatriculaNacional(d.matriculaNacional);
        if (d.subespecialidad) setSubespecialidad(d.subespecialidad);
        if (d.consultorioHabitual) setConsultorioHabitual(d.consultorioHabitual);
        if (d.telefonoInterno) setTelefonoInterno(d.telefonoInterno);
        if (d.textoFirmaDigital) setTextoFirmaDigital(d.textoFirmaDigital);
      }
    } catch {
      // Ignorar fallo de storage
    }

    return () => {
      active = false;
    };
  }, [user]);

  const handleGuardarDatosProfesionales = async (seccion: string) => {
    setGuardando(true);
    setMensajeExito(null);

    try {
      const doctorData = {
        nombre,
        apellido,
        dni,
        matriculaProvincial,
        matriculaNacional,
        especialidad,
        subespecialidad,
        centroSalud,
        consultorioHabitual,
        diasAtencion,
        horarioAtencion,
        telefonoCelular,
        telefonoInterno,
        textoFirmaDigital,
        notifSobreturnos,
        notifCancelaciones,
      };

      const storageKey = `esu_doctor_profile_${user?.id || user?.usuarioId || 'medico'}`;
      localStorage.setItem(storageKey, JSON.stringify(doctorData));

      // Actualizar en el contexto del usuario autenticado
      updateUser({
        nombre,
        apellido,
        dni,
        matricula: matriculaProvincial,
        especialidad,
        telefono: telefonoCelular,
        centroSaludNombre: centroSalud,
      });

      // Si existe profesionalId sincronizar con la API
      if (user?.profesionalId) {
        await profesionalesService.updateProfesional(user.profesionalId, {
          nombre,
          apellido,
          matricula: matriculaProvincial,
          telefono: telefonoCelular,
          especialidadId: especialidadId || undefined,
          centrosSaludIds: centroSaludId ? [centroSaludId] : undefined,
        });
      }

      setMensajeExito(`Datos de ${seccion} actualizados correctamente en el sistema asistencial.`);
      success('Datos de perfil médico guardados exitosamente.');
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: unknown) {
      toastError(extractApiErrorMessage(err, 'Error al guardar los datos del perfil médico.'));
    } finally {
      setGuardando(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Encabezado Principal del Profesional Médico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-sky-100 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-700 to-indigo-800 text-2xl font-black text-white shadow-md">
            <Stethoscope className="h-8 w-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                Dr./Dra. {nombre} {apellido}
              </h1>
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Profesional Matriculado Activo
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Matrícula: <strong className="text-slate-700 font-mono">{matriculaProvincial}</strong> • Especialidad:{' '}
              <strong className="text-sky-700">{especialidad}</strong> •{' '}
              <span>{centroSalud}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer self-start sm:self-auto shrink-0"
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

      {/* Grid de Secciones Profesionales del Médico */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ========================================================================= */}
        {/* 1. DATOS PROFESIONALES Y DE MATRÍCULA                                     */}
        {/* ========================================================================= */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">
                  Datos Profesionales y Matrícula
                </h2>
                <p className="text-xs text-slate-500">
                  Registro oficial ante el Consejo Médico de Córdoba
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleGuardarDatosProfesionales('Datos Profesionales')}
              disabled={guardando}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-800 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Guardar</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Apellido</label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">DNI / Documento</label>
                <input
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\s+/g, ''))}
                  placeholder="ej: 34982123"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">CUIL Profesional</label>
                <input
                  type="text"
                  disabled
                  value={/^\d{7,8}$/.test(dni.trim()) ? `20-${dni.trim()}-7` : 'Sin especificar'}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Matrícula Provincial (MP) *</label>
                <input
                  type="text"
                  required
                  value={matriculaProvincial}
                  onChange={(e) => setMatriculaProvincial(e.target.value)}
                  placeholder="ej: MP-34982"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold font-mono text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Matrícula Nacional (MN)</label>
                <input
                  type="text"
                  value={matriculaNacional}
                  onChange={(e) => setMatriculaNacional(e.target.value)}
                  placeholder="ej: MN-145290"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Especialidad Médica Principal *</label>
              <select
                value={especialidadId || especialidad}
                onChange={(e) => {
                  const val = e.target.value;
                  const found = especialidadesCat.find((item) => String(item.id) === val);
                  if (found) {
                    setEspecialidadId(String(found.id));
                    setEspecialidad(found.nombre);
                  } else {
                    setEspecialidad(val);
                  }
                }}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 cursor-pointer"
              >
                {especialidadesCat.length > 0 ? (
                  <>
                    {!especialidadId && <option value="">Seleccionar especialidad...</option>}
                    {especialidadesCat.map((esp) => (
                      <option key={esp.id} value={String(esp.id)}>
                        {esp.nombre}
                      </option>
                    ))}
                  </>
                ) : (
                  ESPECIALIDADES_MEDICAS.map((esp) => (
                    <option key={esp} value={esp}>
                      {esp}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Subespecialidad / Áreas de Enfoque</label>
              <input
                type="text"
                value={subespecialidad}
                onChange={(e) => setSubespecialidad(e.target.value)}
                placeholder="ej: Diabetología, Ecografía, Atención de Guardia..."
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
              />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. SEDE DE ATENCIÓN Y ASIGNACIÓN DE CONSULTORIO                           */}
        {/* ========================================================================= */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">
                  Sede de Atención y Consultorio
                </h2>
                <p className="text-xs text-slate-500">
                  Lugar físico y franja horaria de agenda médica
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleGuardarDatosProfesionales('Sede y Consultorio')}
              disabled={guardando}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-800 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Guardar</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-700">Centro de Salud Adscrito</label>
              <select
                value={centroSaludId || centroSalud}
                onChange={(e) => {
                  const val = e.target.value;
                  const found = centrosCat.find((item) => String(item.id) === val);
                  if (found) {
                    setCentroSaludId(String(found.id));
                    setCentroSalud(found.nombre);
                  } else {
                    setCentroSalud(val);
                  }
                }}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 cursor-pointer"
              >
                {centrosCat.length > 0 ? (
                  <>
                    {!centroSaludId && <option value="">Sin sede asignada</option>}
                    {centrosCat.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.nombre}
                      </option>
                    ))}
                  </>
                ) : (
                  CENTROS_SALUD_CDE.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Consultorio Asignado Habitual</label>
              <input
                type="text"
                value={consultorioHabitual}
                onChange={(e) => setConsultorioHabitual(e.target.value)}
                placeholder="ej: Consultorio 3 - Planta Baja"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Días de Atención</label>
                <input
                  type="text"
                  value={diasAtencion}
                  onChange={(e) => setDiasAtencion(e.target.value)}
                  placeholder="ej: Lunes a Viernes"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Franja Horaria Habitual</label>
                <input
                  type="text"
                  value={horarioAtencion}
                  onChange={(e) => setHorarioAtencion(e.target.value)}
                  placeholder="ej: 08:00 a 14:00 hs"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>
            </div>

            <div
              className={`rounded-xl border p-3 flex items-center justify-between ${
                disponibilidadesReales.length > 0
                  ? 'bg-teal-50 border-teal-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div>
                <span className={`font-bold block ${disponibilidadesReales.length > 0 ? 'text-teal-950' : 'text-amber-950'}`}>
                  Agenda Pública y de Ventanilla
                </span>
                <span className={`text-[10px] ${disponibilidadesReales.length > 0 ? 'text-teal-700' : 'text-amber-700'}`}>
                  {disponibilidadesReales.length > 0
                    ? `Habilitada con ${disponibilidadesReales.length} franja(s) horaria(s) activa(s)`
                    : 'Sin franjas horarias configuradas en el turnero'}
                </span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  disponibilidadesReales.length > 0
                    ? 'bg-teal-200 text-teal-900'
                    : 'bg-amber-200 text-amber-900'
                }`}
              >
                {disponibilidadesReales.length > 0 ? 'ACTIVA' : 'PENDIENTE'}
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. CONTACTO PROFESIONAL Y ALERTAS ASISTENCIALES                          */}
        {/* ========================================================================= */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">
                  Contacto Profesional y Alertas
                </h2>
                <p className="text-xs text-slate-500">
                  Teléfonos de guardia y notificaciones asistenciales
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleGuardarDatosProfesionales('Contacto Profesional')}
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
                Teléfono Celular Profesional / WhatsApp de Guardia
              </label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="tel"
                  value={telefonoCelular}
                  onChange={(e) => setTelefonoCelular(e.target.value)}
                  placeholder="ej: 3549-551122"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Para comunicación con jefatura de guardia y recepción de emergencias.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Teléfono Interno / Conmutador</label>
                <input
                  type="text"
                  value={telefonoInterno}
                  onChange={(e) => setTelefonoInterno(e.target.value)}
                  placeholder="ej: Int. 204"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Correo Institucional</label>
                <input
                  type="email"
                  disabled
                  value={emailInstitucional}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-800 block">
                Preferencias de Notificaciones en Consultorio
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifSobreturnos}
                  onChange={(e) => setNotifSobreturnos(e.target.checked)}
                  className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="text-slate-700 text-xs">Avisar inmediatamente al registrarse un sobreturno urgente</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifCancelaciones}
                  onChange={(e) => setNotifCancelaciones(e.target.checked)}
                  className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="text-slate-700 text-xs">Notificar reprogramaciones y cancelaciones de pacientes</span>
              </label>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. SELLO Y FIRMA DIGITAL OFICIAL                                          */}
        {/* ========================================================================= */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <FileSignature className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">
                  Sello y Firma Digital Oficial
                </h2>
                <p className="text-xs text-slate-500">
                  Previsualización estampada en recetas y evoluciones médicas
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleGuardarDatosProfesionales('Sello y Firma')}
              disabled={guardando}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-800 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Guardar</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Previsualización del Sello Médico */}
            <div>
              <span className="text-[11px] font-bold text-slate-700 block mb-1">
                Vista Previa del Sello Médico Digital
              </span>
              <div className="rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/40 p-4 text-center space-y-1">
                <p className="text-sm font-black text-slate-900">
                  Dr./Dra. {nombre} {apellido}
                </p>
                <p className="text-xs font-bold text-sky-900">
                  M.P. {matriculaProvincial} {matriculaNacional ? `• M.N. ${matriculaNacional}` : ''}
                </p>
                <p className="text-xs text-slate-600 font-semibold">
                  Especialista en {especialidad}
                </p>
                <p className="text-[11px] text-slate-500">
                  {centroSalud} — Cruz del Eje, Cba.
                </p>
                <div className="pt-2 flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Certificado Digital Oficial Habilitado (Ley 25.506 y 27.553)</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Texto Oficial del Sello</label>
              <textarea
                rows={2}
                value={textoFirmaDigital}
                onChange={(e) => setTextoFirmaDigital(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 transition"
              />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. SEGURIDAD Y ACCESO (CAMBIAR CONTRASEÑA Y AUDITORÍA)                     */}
        {/* ========================================================================= */}
        <div className="md:col-span-2 space-y-6">
          <CambiarPasswordSection />
          <AuditoriaSesionesSection />
        </div>
      </div>
    </div>
  );
};
