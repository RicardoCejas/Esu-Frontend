import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { pacientesService } from '@/api/pacientesService';
import { turnosService } from '@/api/turnosService';
import type { ConsultaMedica } from '@/types';
import {
  Activity,
  User,
  Pill,
  Save,
  CheckCircle2,
  ArrowLeft,
  QrCode,
  Plus,
  Trash2
} from 'lucide-react';

export const AtencionConsultaPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const pacienteId = searchParams.get('pacienteId') || 'u-paciente-1';
  const turnoId = searchParams.get('turnoId') || '';
  const pacienteNombre = searchParams.get('pacienteNombre') || 'Lucas Ramírez';
  const pacienteDni = searchParams.get('pacienteDni') || '38123456';

  // Estados del Formulario Clínico
  const [motivo, setMotivo] = useState('Control general y chequeo clínico de rutina');
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [presion, setPresion] = useState('120/80');
  const [frecuencia, setFrecuencia] = useState('72');
  const [temperatura, setTemperatura] = useState('36.5');
  const [peso, setPeso] = useState('74');

  // Receta Digital
  const [incluirReceta, setIncluirReceta] = useState(false);
  const [medicamentos, setMedicamentos] = useState([
    { nombreComercial: '', droga: '', presentacion: '', dosisIndicada: '', cantidad: '1 caja' },
  ]);

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const agregarMedicamento = () => {
    setMedicamentos([
      ...medicamentos,
      { nombreComercial: '', droga: '', presentacion: '', dosisIndicada: '', cantidad: '1 caja' },
    ]);
  };

  const eliminarMedicamento = (index: number) => {
    setMedicamentos(medicamentos.filter((_, i) => i !== index));
  };

  const handleMedChange = (index: number, field: string, value: string) => {
    const nuevos = [...medicamentos];
    nuevos[index] = { ...nuevos[index], [field]: value };
    setMedicamentos(nuevos);
  };

  const handleGuardarConsulta = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const nuevaConsulta: Omit<ConsultaMedica, 'id'> = {
      turnoId: turnoId || undefined,
      pacienteId,
      pacienteNombre,
      profesionalId: user?.id || 'p1',
      profesionalNombre: `${user?.nombre} ${user?.apellido}`,
      fecha: new Date().toISOString().split('T')[0],
      motivo,
      diagnostico: diagnostico || 'Consulta Médica de Rutina / Sin patología aguda',
      tratamiento,
      signosVitales: {
        presionArterial: `${presion} mmHg`,
        frecuenciaCardiaca: `${frecuencia} lpm`,
        temperatura: `${temperatura} °C`,
        peso: `${peso} kg`,
      },
      receta: incluirReceta
        ? {
            id: `rec-${Date.now()}`,
            codigoQR: `ESU-REC-QR-${Math.floor(100000 + Math.random() * 900000)}`,
            fechaEmision: new Date().toISOString().split('T')[0],
            fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            medicoNombre: `${user?.nombre} ${user?.apellido}`,
            medicoMatricula: user?.matricula || 'MP-34982',
            pacienteNombre,
            pacienteDni,
            medicamentos,
            diagnostico: diagnostico || 'Tratamiento sintomático',
            indicacionesGenerales: tratamiento || 'Cumplir el tratamiento según prescripción.',
          }
        : undefined,
    };

    await pacientesService.agregarConsulta(nuevaConsulta);
    if (turnoId) {
      await turnosService.updateEstado(turnoId, 'COMPLETADO');
    }

    setIsSubmitting(false);
    setGuardadoExitoso(true);
  };

  if (guardadoExitoso) {
    return (
      <div className="max-w-xl mx-auto rounded-2xl border border-border bg-card p-8 text-center space-y-6 shadow-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Atención Guardada con Éxito</h2>
          <p className="text-xs text-muted-foreground">
            La evolución se asentó en la Historia Clínica Única (HCU) de {pacienteNombre}.
          </p>
        </div>

        {incluirReceta && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-primary font-medium flex items-center justify-center gap-2">
            <QrCode className="h-4 w-4" />
            <span>Receta Digital con QR emitida y disponible para el paciente</span>
          </div>
        )}

        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => navigate('/dashboard/medico')}
            className="rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            Volver a la Agenda Médica
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Volver */}
      <Link
        to="/dashboard/medico"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver a la Agenda</span>
      </Link>

      {/* Ficha del Paciente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">{pacienteNombre}</h1>
            <p className="text-xs text-muted-foreground">
              DNI: <span className="font-mono font-semibold text-foreground">{pacienteDni}</span> • Obra Social: APROSS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-500/20">
            En Atención Activa
          </span>
        </div>
      </div>

      {/* Formulario de Atención */}
      <form onSubmit={handleGuardarConsulta} className="space-y-6">
        {/* Signos Vitales */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Signos Vitales y Triaje
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Presión Arterial</label>
              <input
                type="text"
                value={presion}
                onChange={(e) => setPresion(e.target.value)}
                placeholder="120/80"
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Frecuencia (lpm)</label>
              <input
                type="text"
                value={frecuencia}
                onChange={(e) => setFrecuencia(e.target.value)}
                placeholder="72"
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Temp (°C)</label>
              <input
                type="text"
                value={temperatura}
                onChange={(e) => setTemperatura(e.target.value)}
                placeholder="36.5"
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Peso (kg)</label>
              <input
                type="text"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="74"
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Motivo y Diagnóstico */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
            <label className="text-xs font-bold text-foreground">Motivo de Consulta</label>
            <textarea
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full rounded-lg border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
            <label className="text-xs font-bold text-foreground">Diagnóstico / CIE-10</label>
            <textarea
              rows={3}
              placeholder="Ej: Faringitis aguda (J02.9) / Rinitis alérgica"
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              className="w-full rounded-lg border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Indicaciones y Tratamiento */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
          <label className="text-xs font-bold text-foreground">Indicaciones Médicas y Evolución</label>
          <textarea
            rows={3}
            placeholder="Indicaciones para el paciente, reposo o estudios complementarios recomendados..."
            value={tratamiento}
            onChange={(e) => setTratamiento(e.target.value)}
            className="w-full rounded-lg border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Receta Electrónica Interoperable */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              <span className="font-bold text-sm">Receta Electrónica con Firma y QR</span>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={incluirReceta}
                onChange={(e) => setIncluirReceta(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary"
              />
              <span>Emitir Receta Digital</span>
            </label>
          </div>

          {incluirReceta && (
            <div className="space-y-4 border-t border-border pt-4">
              {medicamentos.map((med, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-muted/30 p-3 rounded-xl">
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">Medicamento / Droga</label>
                    <input
                      type="text"
                      placeholder="Ej: Ibuprofeno 600mg"
                      value={med.nombreComercial}
                      onChange={(e) => handleMedChange(idx, 'nombreComercial', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-5 space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">Posología / Dosis</label>
                    <input
                      type="text"
                      placeholder="Ej: 1 comp cada 8hs por 5 días"
                      value={med.dosisIndicada}
                      onChange={(e) => handleMedChange(idx, 'dosisIndicada', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">Cantidad</label>
                    <input
                      type="text"
                      value={med.cantidad}
                      onChange={(e) => handleMedChange(idx, 'cantidad', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    {medicamentos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => eliminarMedicamento(idx)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={agregarMedicamento}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Agregar otro fármaco</span>
              </button>
            </div>
          )}
        </div>

        {/* Botón Guardar Consulta */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/medico')}
            className="rounded-xl border border-input bg-card px-5 py-2.5 text-xs font-semibold hover:bg-accent transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? 'Guardando...' : 'Finalizar y Asentar en HCU'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
