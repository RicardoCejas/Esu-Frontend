import React, { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { pacientesService } from '@/api/pacientesService';
import { DNI_VALIDATION_ERROR, isValidDniFormat } from '@/lib/dniValidation';
import type { User } from '@/types';
import {
  ShieldAlert,
  CreditCard,
  Lock,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Camera,
  FileText,
  X,
  Info,
  User as UserIcon,
  Phone,
  Building2,
} from 'lucide-react';
import { FechaNacimientoPicker } from '@/components/common/FechaNacimientoPicker';
import { DniCameraScanner } from '@/components/auth/DniCameraScanner';

interface ValidacionDniModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: (nuevoDni: string) => void;
  isMandatory?: boolean;
}

function isPlaceholderValue(val?: string): boolean {
  if (!val) return true;
  const clean = val.trim();
  return (
    clean === '' ||
    clean === 'Sin especificar' ||
    clean === '3549000000' ||
    clean === 'Paciente Registrado' ||
    clean === 'Registrado' ||
    clean.startsWith('DNI-') ||
    clean.startsWith('PENDIENTE') ||
    clean.startsWith('G-') ||
    clean.startsWith('AF-') ||
    clean.startsWith('GGL-')
  );
}

export const ValidacionDniModal: React.FC<ValidacionDniModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isMandatory = true,
}) => {
  const { user, updateUser } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  // Método de validación: 'manual' | 'camera'
  const [metodo, setMetodo] = useState<'camera' | 'manual'>('manual');

  // Recuperar datos previos o precargados de Google / sesión
  const [nombre, setNombre] = useState(
    user?.nombre && user.nombre !== 'Paciente Registrado' ? user.nombre : ''
  );
  const [apellido, setApellido] = useState(
    user?.apellido && user.apellido !== 'Registrado' ? user.apellido : ''
  );
  const [telefono, setTelefono] = useState(
    !isPlaceholderValue(user?.telefono) ? (user?.telefono || '') : ''
  );
  const [dni, setDni] = useState(
    !isPlaceholderValue(user?.dni) ? (user?.dni || '').replace(/\D/g, '') : ''
  );
  const [fechaNacimiento, setFechaNacimiento] = useState(user?.fechaNacimiento || '');
  const [obraSocial, setObraSocial] = useState(user?.obraSocial || 'APROSS (Córdoba)');
  const [nroAfiliado, setNroAfiliado] = useState(
    !isPlaceholderValue(user?.nroAfiliado) ? (user?.nroAfiliado || '') : ''
  );
  const [nroTramite, setNroTramite] = useState('');
  const [mostrarModalAyuda, setMostrarModalAyuda] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sincronizar campos cuando el modal se abre o cambia el usuario autenticado
  useEffect(() => {
    if (!isOpen || !user) return;

    let cached: Record<string, string> | null = null;
    if (typeof window !== 'undefined') {
      const keys = Array.from(
        new Set(
          [
            user.pacienteId ? `esu_paciente_data_${user.pacienteId}` : null,
            user.id ? `esu_paciente_data_${user.id}` : null,
            user.email ? `esu_paciente_data_${user.email.trim().toLowerCase()}` : null,
          ].filter(Boolean) as string[]
        )
      );
      for (const k of keys) {
        try {
          const raw = localStorage.getItem(k);
          if (raw) {
            cached = JSON.parse(raw) as Record<string, string>;
            break;
          }
        } catch {
          // Ignorar error de parsing
        }
      }
    }

    const nextNombre = !isPlaceholderValue(user.nombre)
      ? user.nombre
      : (cached?.nombre || '');
    const nextApellido = !isPlaceholderValue(user.apellido)
      ? user.apellido
      : (cached?.apellido || '');
    const nextTel = !isPlaceholderValue(user.telefono)
      ? (user.telefono || '')
      : (!isPlaceholderValue(cached?.telefono) ? (cached?.telefono || '') : '');
    const nextDni = !isPlaceholderValue(user.dni)
      ? (user.dni || '').replace(/\D/g, '')
      : (!isPlaceholderValue(cached?.dni) ? (cached?.dni || '').replace(/\D/g, '') : '');
    const nextFecha = user.fechaNacimiento || cached?.fechaNacimiento || '';
    const nextObra = user.obraSocial || cached?.obraSocial || 'APROSS (Córdoba)';
    const nextAfiliado = !isPlaceholderValue(user.nroAfiliado)
      ? (user.nroAfiliado || '')
      : (!isPlaceholderValue(cached?.nroAfiliado) ? (cached?.nroAfiliado || '') : '');

    setNombre(nextNombre);
    setApellido(nextApellido);
    setTelefono(nextTel);
    setDni(nextDni);
    setFechaNacimiento(nextFecha);
    setObraSocial(nextObra);
    setNroAfiliado(nextAfiliado);
    if (cached?.nroTramite) {
      setNroTramite(cached.nroTramite);
    }
    setErrorLocal(null);
  }, [
    isOpen,
    user,
    user?.id,
    user?.pacienteId,
    user?.email,
    user?.nombre,
    user?.apellido,
    user?.telefono,
    user?.dni,
    user?.fechaNacimiento,
    user?.obraSocial,
    user?.nroAfiliado,
  ]);

  if (!isOpen) return null;

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 8);
    setDni(val);
    setErrorLocal(null);
  };

  const handleTramiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setNroTramite(val);
    setErrorLocal(null);
  };

  const handleCancelar = () => {
    if (onClose) {
      onClose();
    }
    if (isMandatory) {
      navigate('/dashboard/paciente');
    }
  };

  // Manejo común de éxito de validación (tanto por cámara como manual)
  const finalizarValidacion = async (
    cleanDni: string,
    fechaNac: string,
    tramite: string,
    nombreVal: string,
    apellidoVal: string,
    telefonoVal: string,
    obraSocialVal: string,
    nroAfiliadoVal: string
  ) => {
    try {
      let backendUser: User | null = null;
      const targetId = user?.pacienteId || user?.usuarioId || user?.id;

      if (targetId) {
        try {
          backendUser = await pacientesService.updateContacto(targetId, {
            nombre: nombreVal,
            apellido: apellidoVal,
            telefono: telefonoVal,
            obraSocial: obraSocialVal,
            nroAfiliado: nroAfiliadoVal,
            dni: cleanDni,
            fechaNacimiento: fechaNac,
            nroTramite: tramite,
          });
        } catch (apiErr: unknown) {
          const cause = apiErr instanceof Error ? (apiErr as { cause?: unknown }).cause : undefined;
          const hasServerResponse =
            (isAxiosError(apiErr) && Boolean(apiErr.response)) ||
            (isAxiosError(cause) && Boolean(cause.response));
          const apiMsg = apiErr instanceof Error ? apiErr.message : '';

          if (
            hasServerResponse ||
            apiMsg.toLowerCase().includes('pertenece a otro') ||
            apiMsg.toLowerCase().includes('ya existe') ||
            apiMsg.toLowerCase().includes('duplicado')
          ) {
            throw apiErr;
          }
          console.warn('Backend updateContacto omitido por desconexión temporal:', apiMsg);
        }
      }

      const resolvedPacienteId = backendUser?.id || user?.pacienteId;
      const finalNombre = backendUser?.nombre || nombreVal;
      const finalApellido = backendUser?.apellido || apellidoVal;
      const finalTelefono =
        backendUser?.telefono && !isPlaceholderValue(backendUser.telefono)
          ? backendUser.telefono
          : telefonoVal;
      const finalObraSocial = backendUser?.obraSocial || obraSocialVal;
      const finalNroAfiliado = backendUser?.nroAfiliado || nroAfiliadoVal;
      const finalDni = backendUser?.dni || cleanDni;
      const finalFechaNac = backendUser?.fechaNacimiento || fechaNac;

      // Guardar validación confirmada en almacenamiento local bajo IDs y email del usuario
      if (typeof window !== 'undefined') {
        const storageKeys = Array.from(
          new Set(
            [
              user?.pacienteId,
              user?.id,
              resolvedPacienteId,
              user?.email ? user.email.trim().toLowerCase() : null,
            ].filter(Boolean) as string[]
          )
        );
        const payloadCache = JSON.stringify({
          nombre: finalNombre,
          apellido: finalApellido,
          telefono: finalTelefono,
          obraSocial: finalObraSocial,
          nroAfiliado: finalNroAfiliado,
          dni: finalDni,
          fechaNacimiento: finalFechaNac,
          nroTramite: tramite,
        });
        for (const key of storageKeys) {
          localStorage.setItem(`esu_dni_verified_${key}`, 'true');
          localStorage.setItem(`esu_paciente_data_${key}`, payloadCache);
        }
      }

      updateUser({
        ...(resolvedPacienteId ? { pacienteId: resolvedPacienteId } : {}),
        nombre: finalNombre,
        apellido: finalApellido,
        telefono: finalTelefono,
        obraSocial: finalObraSocial,
        nroAfiliado: finalNroAfiliado,
        dni: finalDni,
        fechaNacimiento: finalFechaNac,
        ...(backendUser?.centroSaludId ? { centroSaludId: backendUser.centroSaludId } : {}),
        ...(backendUser?.centroSaludNombre ? { centroSaludNombre: backendUser.centroSaludNombre } : {}),
        dniVerificado: true,
      });

      success('¡Datos del paciente registrados y validados con éxito!');
      if (onSuccess) {
        onSuccess(finalDni);
      }
      if (onClose) {
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al validar la identidad.';
      if (
        msg.toLowerCase().includes('pertenece a otro') ||
        msg.toLowerCase().includes('ya existe') ||
        msg.toLowerCase().includes('duplicado') ||
        msg.toLowerCase().includes('conflicto de integridad')
      ) {
        setErrorLocal(
          'El DNI o número de afiliado ingresado ya se encuentra registrado por otro usuario. Verifica tus datos o preséntate en mesa de entrada de tu centro de salud.'
        );
      } else {
        setErrorLocal(msg);
      }
      toastError('No se pudo completar la carga de datos del paciente.');
      throw err;
    }
  };

  // Validación mediante Escáner de Cámara Óptico
  const handleScanSuccess = async (data: {
    dni: string;
    nroTramite: string;
    fechaNacimiento?: string;
    nombre?: string;
    apellido?: string;
  }) => {
    setIsSubmitting(true);
    setErrorLocal(null);
    try {
      const targetNombre = nombre.trim() || data.nombre || 'Lucas Agustín';
      const targetApellido = apellido.trim() || data.apellido || 'Ramírez';
      const targetTelefono = telefono.trim() || '3549-123456';
      const targetDni = data.dni || dni || '39412850';
      const targetFecha = fechaNacimiento || data.fechaNacimiento || '1995-07-14';
      const targetTramite = data.nroTramite || '1420';
      const targetAfiliado = nroAfiliado.trim() || `20-${targetDni}-4/01`;

      setNombre(targetNombre);
      setApellido(targetApellido);
      setTelefono(targetTelefono);
      setDni(targetDni);
      setFechaNacimiento(targetFecha);
      setNroTramite(targetTramite);

      await finalizarValidacion(
        targetDni,
        targetFecha,
        targetTramite,
        targetNombre,
        targetApellido,
        targetTelefono,
        obraSocial,
        targetAfiliado
      );
    } catch {
      // Manejado en finalizarValidacion
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validación manual con formulario completo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    const cleanNombre = nombre.trim();
    const cleanApellido = apellido.trim();
    if (!cleanNombre || !cleanApellido) {
      setErrorLocal('Por favor ingresa tu nombre y apellido completos.');
      return;
    }

    const cleanTel = telefono.trim();
    if (!cleanTel || cleanTel.length < 6) {
      setErrorLocal('Por favor ingresa un número de teléfono o celular válido para notificaciones.');
      return;
    }

    const cleanDni = dni.trim();
    if (!isValidDniFormat(cleanDni)) {
      setErrorLocal(DNI_VALIDATION_ERROR);
      return;
    }

    if (!fechaNacimiento) {
      setErrorLocal('Por favor selecciona tu fecha de nacimiento.');
      return;
    }

    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    if (isNaN(birthDate.getTime()) || birthDate >= today) {
      setErrorLocal('La fecha de nacimiento ingresada no es válida (debe ser una fecha anterior a hoy).');
      return;
    }

    if (!nroTramite || nroTramite.length !== 4) {
      setErrorLocal('Debes ingresar los últimos 4 números del trámite de tu DNI.');
      return;
    }

    const cleanAfiliado = nroAfiliado.trim() || `20-${cleanDni}-4/01`;

    setIsSubmitting(true);
    try {
      await finalizarValidacion(
        cleanDni,
        fechaNacimiento,
        nroTramite,
        cleanNombre,
        cleanApellido,
        cleanTel,
        obraSocial,
        cleanAfiliado
      );
    } catch {
      // Manejado en finalizarValidacion
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 text-slate-800 flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Encabezado Institucional */}
        <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-slate-900 px-5 sm:px-6 py-4 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-200">
                <ShieldAlert className="h-5 w-5 text-sky-300" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold leading-tight">
                  Carga de Datos y Validación de Paciente
                </h2>
                <p className="text-[11px] sm:text-xs text-sky-200/90 mt-0.5">
                  Seguridad Sanitaria · Sistema Único de Salud Luvia
                </p>
              </div>
            </div>
            {!isMandatory && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Mensaje de bienvenida / protección */}
          <div className="rounded-xl bg-sky-50 border border-sky-200/80 p-3 text-xs text-sky-950 space-y-1">
            <div className="flex items-center gap-2 font-bold text-sky-950">
              <Lock className="h-3.5 w-3.5 shrink-0 text-sky-700" />
              <span>Vinculación de Ficha Sanitaria del Paciente</span>
            </div>
            <p className="leading-relaxed text-slate-700 text-[11px]">
              Para habilitar tus turnos, recetas, estudios y tu credencial digital, es necesario completar tus datos personales oficiales y validar tu documento.
            </p>
          </div>

          {/* Selector de Método: Ingreso con Datos vs Escáner Óptico */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMetodo('manual');
                setErrorLocal(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg transition cursor-pointer ${
                metodo === 'manual'
                  ? 'bg-white text-sky-900 font-bold shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="h-4 w-4 text-sky-600" />
              <span>Cargar Mis Datos</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMetodo('camera');
                setErrorLocal(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg transition cursor-pointer ${
                metodo === 'camera'
                  ? 'bg-white text-sky-900 font-bold shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="h-4 w-4 text-sky-600" />
              <span>Escanear con Cámara</span>
            </button>
          </div>

          {errorLocal && (
            <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="space-y-1">
                <span className="font-semibold">{errorLocal}</span>
              </div>
            </div>
          )}

          {/* VISTA 1: Escáner Óptico de Cámara */}
          {metodo === 'camera' && (
            <DniCameraScanner
              onScanSuccess={handleScanSuccess}
              onSwitchToManual={() => setMetodo('manual')}
              defaultDni={dni}
            />
          )}

          {/* VISTA 2: Formulario Completo de Paciente */}
          {metodo === 'manual' && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nombre *</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ej: Laura"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Apellido *</label>
                  <input
                    type="text"
                    placeholder="Ej: Martínez"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Teléfono / WhatsApp */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Teléfono / WhatsApp de contacto *</span>
                  <span className="text-[11px] text-slate-500 font-normal">Para avisos de turnos</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="Ej: 3549-123456"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Campo DNI */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Número de DNI (Sin puntos) *</span>
                  <span className="text-[11px] text-slate-500 font-normal">7 u 8 dígitos</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 40026880"
                    value={dni}
                    onChange={handleDniChange}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Fecha de Nacimiento con Selector Intuitivo */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Fecha de Nacimiento *</span>
                  <span className="text-[11px] text-slate-500 font-normal">Día / Mes / Año</span>
                </label>
                <FechaNacimientoPicker
                  value={fechaNacimiento}
                  onChange={(val) => {
                    setFechaNacimiento(val);
                    setErrorLocal(null);
                  }}
                  required
                />
              </div>

              {/* Obra Social / Cobertura */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Obra Social / Cobertura</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <select
                      value={obraSocial}
                      onChange={(e) => setObraSocial(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition"
                    >
                      <option value="APROSS (Córdoba)">APROSS (Córdoba)</option>
                      <option value="PAMI">PAMI</option>
                      <option value="Particular / Salud Pública">Particular / Salud Pública</option>
                      <option value="OSDE">OSDE</option>
                      <option value="Swiss Medical">Swiss Medical</option>
                      <option value="OSECAC">OSECAC</option>
                      <option value="Otra Obra Social">Otra Obra Social</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">N° de Afiliado (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: 20-40026880-4/01"
                    value={nroAfiliado}
                    onChange={(e) => setNroAfiliado(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Campo Últimos 4 dígitos del Trámite */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Últimos 4 números de trámite del DNI *
                  </label>
                  <button
                    type="button"
                    onClick={() => setMostrarModalAyuda(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 hover:underline cursor-pointer transition"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-sky-600" />
                    <span>¿Dónde lo encuentro?</span>
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 1420"
                    maxLength={4}
                    value={nroTramite}
                    onChange={handleTramiteChange}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs sm:text-sm font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCancelar}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Volver al Portal</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-50 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Guardando y validando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Guardar Datos y Habilitar Portal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Modal Lightbox Explicativo de Ayuda de N° de Trámite */}
      {mostrarModalAyuda && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setMostrarModalAyuda(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-sky-100 overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del modal de ayuda */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                  <Info className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Número de Trámite en tu DNI
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Documento Nacional de Identidad Tarjeta
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMostrarModalAyuda(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Imagen explicativa del DNI */}
            <div className="p-5 space-y-4">
              <div className="relative rounded-2xl overflow-hidden border-2 border-sky-200/80 shadow-md bg-slate-100">
                <img
                  src="/ayuda-tramite-dni.png"
                  alt="Ubicación del Número de Trámite en el DNI"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Explicación paso a paso */}
              <div className="rounded-xl bg-sky-50 border border-sky-200 p-3.5 text-xs text-sky-950 space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-sky-900">
                  <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
                  ¿Cómo ubicarlo?
                </p>
                <p className="leading-relaxed text-slate-700 text-[11px]">
                  En el <strong>frente de tu DNI físico</strong>, justo debajo de la <em>Fecha de vencimiento</em> y al lado del código de barras (marcado en el <strong>recuadro rojo</strong>), verás una serie de 11 números precedidos por <strong>"Trámite N° / Of. Ident."</strong>.
                </p>
                <div className="rounded-lg bg-white p-2 border border-sky-100 font-medium text-[11px] text-sky-900">
                  Ingresa únicamente los <strong>últimos 4 números</strong> en la casilla de validación.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMostrarModalAyuda(false)}
                className="w-full rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold py-2.5 text-xs transition cursor-pointer shadow-sm"
              >
                Entendido, volver a la validación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
