import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNuevoConsultorio } from './hooks/useNuevoConsultorio';
import { ConsultorioFormFields } from './components/ConsultorioFormFields';

export const NuevoConsultorioPage: React.FC = () => {
  const {
    especialidades,
    existingConsultorios,
    floorOptions,
    values,
    errors,
    submitError,
    loading,
    saving,
    setField,
    handleBlurNumero,
    handleSubmit,
  } = useNuevoConsultorio();

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
          Registrar Nuevo Consultorio
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sumá un nuevo espacio físico de atención y definí su planta y orientación clínica.
        </p>
      </div>

      <ConsultorioFormFields
        values={values}
        errors={errors}
        especialidades={especialidades}
        floorOptions={floorOptions}
        existingCount={existingConsultorios.length}
        submitError={submitError}
        saving={saving}
        submitLabel="Crear Consultorio"
        savingLabel="Creando..."
        submitIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
        onChangeField={setField}
        onBlurNumero={handleBlurNumero}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
