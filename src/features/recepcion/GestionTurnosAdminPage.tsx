import React, { useState, useEffect } from 'react';
import { turnosService } from '@/api/turnosService';
import type { Turno } from '@/types';
import { Search } from 'lucide-react';

export const GestionTurnosAdminPage: React.FC = () => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    turnosService.getAll().then(setTurnos);
  }, []);

  const handleCancelar = async (id: string) => {
    if (window.confirm('¿Desea cancelar este turno administrativamente?')) {
      await turnosService.cancelarTurno(id);
      setTurnos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, estado: 'CANCELADO' } : t))
      );
    }
  };

  const turnosFiltrados = turnos.filter(
    (t) =>
      t.pacienteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.profesionalNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.centroSaludNombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestión Central de Turnos</h1>
        <p className="text-xs text-muted-foreground">
          Supervisión global, reprogramación y cancelaciones administrativas.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filtrar por Paciente, Médico o Centro de Salud..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
              <tr>
                <th className="p-4">Fecha & Hora</th>
                <th className="p-4">Código</th>
                <th className="p-4">Paciente</th>
                <th className="p-4">Profesional</th>
                <th className="p-4">Centro</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {turnosFiltrados.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30">
                  <td className="p-4 font-semibold text-foreground">
                    {t.fecha} — {t.hora} hs
                  </td>
                  <td className="p-4 font-mono text-primary font-bold">{t.codigoVerificacion}</td>
                  <td className="p-4">{t.pacienteNombre}</td>
                  <td className="p-4">{t.profesionalNombre}</td>
                  <td className="p-4 text-muted-foreground">{t.centroSaludNombre}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">
                      {t.estado}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {t.estado !== 'CANCELADO' && (
                      <button
                        onClick={() => handleCancelar(t.id)}
                        className="rounded-lg border border-destructive/20 bg-destructive/10 px-2.5 py-1 text-destructive font-medium hover:bg-destructive hover:text-white transition"
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
