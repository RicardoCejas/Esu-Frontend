import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  XCircle,
  FileText,
  Info,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  notificacionesService,
  type NotificacionItem,
  type TipoNotificacion,
} from '@/api/notificacionesService';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const cargarNotificaciones = async () => {
    const data = await notificacionesService.getAll();
    setNotificaciones(data);
  };

  useEffect(() => {
    cargarNotificaciones();

    // Event listener para cerrar al hacer clic afuera
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const noLeidasCount = useMemo(() => {
    return notificaciones.filter((n) => !n.leida).length;
  }, [notificaciones]);

  // Agrupación cronológica: Hoy, Ayer, Semana
  const grupos = useMemo(() => {
    const ahora = new Date();
    const hoyInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).getTime();
    const ayerInicio = hoyInicio - 24 * 60 * 60 * 1000;
    const semanaInicio = hoyInicio - 7 * 24 * 60 * 60 * 1000;

    const hoy: NotificacionItem[] = [];
    const ayer: NotificacionItem[] = [];
    const semana: NotificacionItem[] = [];

    notificaciones.forEach((n) => {
      const t = new Date(n.fechaHora).getTime();
      if (t >= hoyInicio) {
        hoy.push(n);
      } else if (t >= ayerInicio) {
        ayer.push(n);
      } else if (t >= semanaInicio) {
        semana.push(n);
      } else {
        semana.push(n); // Anteriores en el bloque de semana
      }
    });

    return [
      { titulo: 'Hoy', items: hoy },
      { titulo: 'Ayer', items: ayer },
      { titulo: 'Esta semana y anteriores', items: semana },
    ].filter((g) => g.items.length > 0);
  }, [notificaciones]);

  const handleMarcarLeida = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await notificacionesService.marcarComoLeida(id);
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
  };

  const handleMarcarTodas = async () => {
    await notificacionesService.marcarTodasComoLeidas();
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const handleItemClick = async (notif: NotificacionItem) => {
    if (!notif.leida) {
      await notificacionesService.marcarComoLeida(notif.id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, leida: true } : n))
      );
    }
    setIsOpen(false);
    if (notif.enlace) {
      navigate(notif.enlace);
    }
  };

  const renderIcono = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case 'TURNO_PROXIMO':
        return <Calendar className="h-4 w-4 text-sky-600 dark:text-sky-400" />;
      case 'CANCELACION':
        return <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      case 'RECETA_EMITIDA':
        return <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'SISTEMA':
      default:
        return <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  const formatearHora = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Botón Campana con Badge */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notificaciones"
        aria-expanded={isOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-input bg-background text-foreground transition-all hover:bg-accent hover:text-accent-foreground cursor-pointer"
        title="Centro de notificaciones y recordatorios"
      >
        <Bell className="h-4 w-4 text-foreground" />
        {noLeidasCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-extrabold text-white shadow-xs animate-in zoom-in-50 duration-200">
            {noLeidasCount > 9 ? '9+' : noLeidasCount}
          </span>
        )}
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card p-0 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
          {/* Header del dropdown */}
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-heading text-sm font-bold text-foreground">
                Notificaciones
              </span>
              {noLeidasCount > 0 && (
                <span className="rounded-full bg-sky-100 dark:bg-sky-950/60 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                  {noLeidasCount} nuevas
                </span>
              )}
            </div>

            {noLeidasCount > 0 && (
              <button
                type="button"
                onClick={handleMarcarTodas}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Marcar todas</span>
              </button>
            )}
          </div>

          {/* Listado de notificaciones agrupadas */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border">
            {grupos.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30 text-muted-foreground" />
                No tenés notificaciones pendientes
              </div>
            ) : (
              grupos.map((grupo) => (
                <div key={grupo.titulo} className="p-0">
                  <div className="sticky top-0 z-10 bg-muted/60 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur-xs">
                    {grupo.titulo}
                  </div>
                  <div className="divide-y divide-border/60">
                    {grupo.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`group flex items-start gap-3 px-4 py-3 transition cursor-pointer ${
                          item.leida
                            ? 'bg-card hover:bg-muted/40 opacity-80'
                            : 'bg-sky-50/50 dark:bg-sky-950/20 hover:bg-sky-50 dark:hover:bg-sky-950/30'
                        }`}
                      >
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background border border-border shadow-2xs">
                          {renderIcono(item.tipo)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs truncate ${
                                item.leida
                                  ? 'font-medium text-foreground'
                                  : 'font-bold text-foreground'
                              }`}
                            >
                              {item.titulo}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground shrink-0">
                              <Clock className="h-2.5 w-2.5" />
                              {formatearHora(item.fechaHora)}
                            </span>
                          </div>

                          <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.mensaje}
                          </p>

                          {item.enlace && (
                            <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-sky-600 dark:text-sky-400 group-hover:underline">
                              <span>Ver detalle</span>
                              <ChevronRight className="h-3 w-3" />
                            </span>
                          )}
                        </div>

                        {!item.leida && (
                          <button
                            type="button"
                            onClick={(e) => handleMarcarLeida(e, item.id)}
                            title="Marcar como leída"
                            className="mt-0.5 shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer del dropdown */}
          <div className="border-t border-border bg-muted/20 px-4 py-2 text-center text-[11px] text-muted-foreground">
            Avisos de cancelaciones, turnos próximos y recetas
          </div>
        </div>
      )}
    </div>
  );
};
