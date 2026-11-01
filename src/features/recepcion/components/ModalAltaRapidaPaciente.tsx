import React, { useState } from 'react';
import { UserPlus, X, AlertCircle } from 'lucide-react';
import { pacientesService } from '@/api/pacientesService';
import type { User } from '@/types';

interface ModalAltaRapidaPacienteProps {
  isOpen: boolean;
  onClose: () => void;
  onPacienteCreado: (paciente: User) => void;
}

export const ModalAltaRapidaPaciente: React.FC<ModalAltaRapidaPacienteProps> = ({
  isOpen,
  onClose,
  onPacienteCreado,
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: '',
    obraSocial: 'Particular / Sin Obra Social',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones esenciales
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      setError('Nombre y Apellido son obligatorios.');
      return;
    }
    if (!formData.dni.trim() || !/^\d{7,9}$/.test(formData.dni.trim())) {
      setError('Ingrese un DNI válido (entre 7 y 9 dígitos numéricos).');
      return;
    }
    if (!formData.telefono.trim()) {
      setError('El teléfono de contacto es necesario para notificaciones.');
      return;
    }

    try {
      setIsSubmitting(true);
      const emailDefecto = formData.email.trim() || `dni${formData.dni.trim()}@recepcion.esu.salud`;
      const creado = await pacientesService.createPaciente({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        dni: formData.dni.trim(),
        telefono: formData.telefono.trim(),
        email: emailDefecto,
      });

      onPacienteCreado(creado);
      onClose();
    } catch {
      setError('Ocurrió un error al procesar el alta rápida del paciente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Alta Rápida de Paciente</h2>
              <p className="text-xs text-muted-foreground">Registro de ventanilla para pacientes sin cuenta online previa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Nombre *</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej. Juan Carlos"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Apellido *</label>
              <input
                type="text"
                required
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                placeholder="Ej. Fernández"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">DNI (Sin puntos) *</label>
              <input
                type="text"
                required
                maxLength={9}
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })}
                placeholder="Ej. 34567890"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Teléfono Móvil *</label>
              <input
                type="tel"
                required
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Ej. 3549-412345"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Correo Electrónico <span className="font-normal text-muted-foreground">(Opcional para comprobantes)</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ejemplo@correo.com (autogenerado si se omite)"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Obra Social / Cobertura Inicial</label>
            <select
              value={formData.obraSocial}
              onChange={(e) => setFormData({ ...formData, obraSocial: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Particular / Sin Obra Social">Particular / Sin Obra Social</option>
              <option value="PAMI">PAMI</option>
              <option value="APROSS">APROSS</option>
              <option value="OSDE">OSDE</option>
              <option value="Swiss Medical">Swiss Medical</option>
              <option value="OSECAC">OSECAC</option>
              <option value="DASPU">DASPU</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-xs flex items-center gap-2"
            >
              {isSubmitting ? 'Registrando...' : 'Dar de Alta Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
