import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useEditarConsultorio } from './hooks/useEditarConsultorio';
import { ConsultorioFormFields } from './components/ConsultorioFormFields';

export const EditarConsultorioPage: React.FC = () => {
  const {
    especialidades,
    existingConsultorios,
    floorOptions,
    values,
    errors,
    submitError,
    notFoundError,
    loading,
    saving,
    setField,
    handleBlurNumero,
    handleSubmit,
  } = useEditarConsultorio();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-700 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10 animate-in fade-in duration-200">
      <div>
        <Link
          to="/dashboard/recepcion/sede"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-600 rounded"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Volver a Mi Sede y Consultorios
        </Link>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
          Editar Consultorio Físico
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Actualizá el número, planta asignada, especialidad predominante o disponibilidad operativa.
        </p>
      </div>

      {notFoundError ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-4 text-sm font-medium text-rose-900 flex items-center gap-2.5"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-700" aria-hidden="true" />
          <span>{notFoundError}</span>
        </div>
      ) : (
        <ConsultorioFormFields
          values={values}
          errors={errors}
          especialidades={especialidades}
          floorOptions={floorOptions}
          existingCount={existingConsultorios.length}
          submitError={submitError}
          saving={saving}
          submitLabel="Guardar Cambios"
          savingLabel="Guardando..."
          onChangeField={setField}
          onBlurNumero={handleBlurNumero}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};
