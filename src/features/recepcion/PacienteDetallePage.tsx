import React, { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarPlus, Save, ShieldCheck, QrCode } from 'lucide-react';
import { usePacienteDetalle } from './hooks/usePacienteDetalle';
import { PacienteFamiliaresSection } from './components/PacienteFamiliaresSection';
import { PacienteTurnosHistorialSection } from './components/PacienteTurnosHistorialSection';
import { ModalVerificarCarnetQR } from './components/ModalVerificarCarnetQR';
import { ModalCancelarMostrador } from './components/ModalCancelarMostrador';
import type { Turno } from '@/types';

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'];

export const PacienteDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    canEdit,
    paciente,
    turnos,
    familiares,
    values,
    errors,
    loading,
    saving,
    loadError,
    submitError,
    conveniosPopulares,
    setField,
    loadData,
    handleSave,
    handleAgregarFamiliar,
    handleEliminarFamiliar,
    handleMarcarAusente,
    handleTurnoCancelado,
  } = usePacienteDetalle(id);

  const formRef = useRef<HTMLFormElement>(null);
  const [modalQrOpen, setModalQrOpen] = useState(false);
  const [turnoACancelar, setTurnoACancelar] = useState<Turno | null>(null);
  const [modalCancelarOpen, setModalCancelarOpen] = useState(false);

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ok = await handleSave();
    if (!ok) {
      window.requestAnimationFrame(() => {
        const firstInvalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
        firstInvalid?.focus();
      });
    }
  };

  const handleOpenCancelar = (t: Turno) => {
    setTurnoACancelar(t);
    setModalCancelarOpen(true);
  };

  const handleCloseCancelar = () => {
    setTurnoACancelar(null);
    setModalCancelarOpen(false);
  };

  const onCanceladoSuccess = (turnoId: string) => {
    handleTurnoCancelado(turnoId);
    handleCloseCancelar();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-700 border-t-transparent" />
      </div>
    );
  }

  if (loadError || !paciente) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Link
          to="/dashboard/recepcion/pacientes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Volver al Padrón de Pacientes
        </Link>
        <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-6 text-sm text-rose-900 space-y-3">
          <p className="font-semibold">{loadError || 'Paciente no encontrado.'}</p>
          <button
            type="button"
            onClick={() => void loadData()}
            className="rounded-lg bg-rose-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-800 cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/dashboard/recepcion/pacientes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 hover:underline rounded focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Volver al Padrón de Pacientes
          </Link>

          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {paciente.apellido}, {paciente.nombre}
            </h1>
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-bold text-white ${
                paciente.dniVerificado ? 'bg-emerald-700' : 'bg-amber-700'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {paciente.dniVerificado ? 'Identidad Verificada' : 'Contacto Incompleto'}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-bold text-white ${
                paciente.activo !== false ? 'bg-emerald-700' : 'bg-slate-600'
              }`}
            >
              {paciente.activo !== false ? 'ACTIVO' : 'INACTIVO'}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground tabular-nums">
            DNI {paciente.dni} · Cobertura: {paciente.obraSocial || 'Particular'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start">
          <button
            type="button"
            onClick={() => setModalQrOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
          >
            <QrCode className="h-4 w-4 text-sky-600" />
            <span>Verificar QR</span>
          </button>

          {canEdit && (
            <Link
              to={`/dashboard/recepcion/turnos/nuevo?dni=${encodeURIComponent(paciente.dni)}`}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-800 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              <span>Dar Turno en Mostrador</span>
            </Link>
          )}
        </div>
      </div>

      {submitError && (
        <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
          {submitError}
        </div>
      )}

      {/* Formulario de Filiación y Cobertura */}
      <form
        ref={formRef}
        noValidate
        onSubmit={onFormSubmit}
        className="rounded-xl border border-border bg-card p-6 space-y-5 shadow-xs"
      >
        <fieldset disabled={!canEdit || saving} className="space-y-4">
          <legend className="w-full border-b border-border pb-2 text-base font-bold text-foreground">
            Filiación, Contacto y Cobertura Médica
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="pac-nombre" className="block text-xs font-semibold text-foreground mb-1.5">
                Nombre <span className="text-rose-700">*</span>
              </label>
              <input
                id="pac-nombre"
                type="text"
                required
                value={values.nombre}
                onChange={(e) => setField('nombre', e.target.value)}
                aria-invalid={Boolean(errors.nombre)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.nombre && <p className="mt-1 text-xs font-medium text-rose-700">{errors.nombre}</p>}
            </div>

            <div>
              <label htmlFor="pac-apellido" className="block text-xs font-semibold text-foreground mb-1.5">
                Apellido <span className="text-rose-700">*</span>
              </label>
              <input
                id="pac-apellido"
                type="text"
                required
                value={values.apellido}
                onChange={(e) => setField('apellido', e.target.value)}
                aria-invalid={Boolean(errors.apellido)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.apellido && <p className="mt-1 text-xs font-medium text-rose-700">{errors.apellido}</p>}
            </div>

            <div>
              <label htmlFor="pac-dni" className="block text-xs font-semibold text-foreground mb-1.5">
                DNI <span className="text-rose-700">*</span>
              </label>
              <input
                id="pac-dni"
                type="text"
                inputMode="numeric"
                value={values.dni}
                onChange={(e) => setField('dni', e.target.value)}
                aria-invalid={Boolean(errors.dni)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground tabular-nums focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.dni && <p className="mt-1 text-xs font-medium text-rose-700">{errors.dni}</p>}
            </div>

            <div>
              <label htmlFor="pac-telefono" className="block text-xs font-semibold text-foreground mb-1.5">
                Teléfono / WhatsApp
              </label>
              <input
                id="pac-telefono"
                type="tel"
                inputMode="tel"
                value={values.telefono}
                onChange={(e) => setField('telefono', e.target.value)}
                placeholder="Ej: 3549-456789"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
            </div>

            <div>
              <label htmlFor="pac-email" className="block text-xs font-semibold text-foreground mb-1.5">
                Correo Electrónico
              </label>
              <input
                id="pac-email"
                type="email"
                value={values.email}
                onChange={(e) => setField('email', e.target.value)}
                aria-invalid={Boolean(errors.email)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.email && <p className="mt-1 text-xs font-medium text-rose-700">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="pac-obra-social" className="block text-xs font-semibold text-foreground mb-1.5">
                Obra Social / Cobertura
              </label>
              <select
                id="pac-obra-social"
                value={values.obraSocial}
                onChange={(e) => setField('obraSocial', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              >
                {conveniosPopulares.map((os) => (
                  <option key={os} value={os}>
                    {os}
                  </option>
                ))}
              </select>
            </div>

            {values.obraSocial === 'Otra' && (
              <div>
                <label htmlFor="pac-otra-obra-social" className="block text-xs font-semibold text-foreground mb-1.5">
                  Nombre de Cobertura Específica
                </label>
                <input
                  id="pac-otra-obra-social"
                  type="text"
                  placeholder="Ej: OSECAC, Medifé..."
                  value={values.otraObraSocial}
                  onChange={(e) => setField('otraObraSocial', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
                />
              </div>
            )}

            <div>
              <label htmlFor="pac-afiliado" className="block text-xs font-semibold text-foreground mb-1.5">
                Número de Afiliado
              </label>
              <input
                id="pac-afiliado"
                type="text"
                value={values.nroAfiliado}
                onChange={(e) => setField('nroAfiliado', e.target.value)}
                placeholder="Ej: 45-123456-00"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground tabular-nums focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pac-nacimiento" className="block text-xs font-semibold text-foreground mb-1.5">
                  Fecha de Nac.
                </label>
                <input
                  id="pac-nacimiento"
                  type="date"
                  value={values.fechaNacimiento}
                  onChange={(e) => setField('fechaNacimiento', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
                />
              </div>

              <div>
                <label htmlFor="pac-sangre" className="block text-xs font-semibold text-foreground mb-1.5">
                  Grupo Sang.
                </label>
                <select
                  id="pac-sangre"
                  value={values.grupoSanguineo}
                  onChange={(e) => setField('grupoSanguineo', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
                >
                  <option value="">S/D</option>
                  {BLOOD_GROUPS.filter(Boolean).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="pac-activo-toggle" className="block text-xs font-semibold text-foreground mb-1.5">
                Estado del Paciente en Padrón
              </label>
              <select
                id="pac-activo-toggle"
                value={values.activo ? 'true' : 'false'}
                onChange={(e) => setField('activo', e.target.value === 'true')}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground font-semibold focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
              >
                <option value="true">Activo / Habilitado</option>
                <option value="false">Inactivo / Inhabilitado</option>
              </select>
            </div>
          </div>
        </fieldset>

        {canEdit && (
          <div className="flex justify-end border-t border-border pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-5 py-2 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50 transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {saving ? 'Guardando...' : 'Actualizar Ficha de Paciente'}
            </button>
          </div>
        )}
      </form>

      {/* Sección Grupo Familiar */}
      <PacienteFamiliaresSection
        familiares={familiares}
        canEdit={canEdit}
        onAgregar={handleAgregarFamiliar}
        onEliminar={handleEliminarFamiliar}
      />

      {/* Sección Historial de Turnos */}
      <PacienteTurnosHistorialSection
        turnos={turnos}
        canEdit={canEdit}
        onMarcarAusente={handleMarcarAusente}
        onCancelar={handleOpenCancelar}
      />

      {/* Modales */}
      <ModalVerificarCarnetQR
        isOpen={modalQrOpen}
        onClose={() => setModalQrOpen(false)}
      />

      <ModalCancelarMostrador
        turno={turnoACancelar}
        isOpen={modalCancelarOpen}
        onClose={handleCloseCancelar}
        onCancelado={onCanceladoSuccess}
      />
    </div>
  );
};
