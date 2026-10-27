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
        semana.push(n);
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
        return <Calendar className="h-3.5 w-3.5 text-sky-600" />;
      case 'CANCELACION':
        return <XCircle className="h-3.5 w-3.5 text-rose-500" />;
      case 'RECETA_EMITIDA':
        return <FileText className="h-3.5 w-3.5 text-emerald-600" />;
      case 'SISTEMA':
      default:
        return <Info className="h-3.5 w-3.5 text-amber-500" />;
    }
  };

  const formatearHora = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Botón Campana con Badge Suave */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notificaciones"
        aria-expanded={isOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-sky-200/80 bg-white/90 text-slate-700 transition hover:bg-sky-50 hover:text-sky-800 shadow-2xs cursor-pointer"
        title="Centro de notificaciones"
      >
        <Bell className="h-4 w-4 text-slate-600" />
        {noLeidasCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-600 px-1 text-[9px] font-bold text-white shadow-xs">
            {noLeidasCount > 9 ? '9+' : noLeidasCount}
          </span>
        )}
      </button>

      {/* Menú Desplegable Armonioso y Sin Alto Contraste */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-sky-100 bg-white shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header del dropdown */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-heading text-sm font-bold text-slate-900">
                Notificaciones
              </span>
              {noLeidasCount > 0 && (
                <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200/60">
                  {noLeidasCount} nuevas
                </span>
              )}
            </div>

            {noLeidasCount > 0 && (
              <button
                type="button"
                onClick={handleMarcarTodas}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-900 hover:underline cursor-pointer"
              >
                <CheckCheck className="h-3 w-3" />
                <span>Marcar todas</span>
              </button>
            )}
          </div>

          {/* Listado con separadores suaves */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100">
            {grupos.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <Bell className="h-6 w-6 mx-auto mb-1.5 opacity-30 text-slate-400" />
                No tenés notificaciones pendientes
              </div>
            ) : (
              grupos.map((grupo) => (
                <div key={grupo.titulo}>
                  <div className="sticky top-0 z-10 bg-slate-50/90 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100/70 backdrop-blur-xs">
                    {grupo.titulo}
                  </div>
                  <div className="divide-y divide-slate-50">
                    {grupo.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`group flex items-start gap-3 px-4 py-2.5 transition cursor-pointer ${
                          item.leida
                            ? 'bg-white hover:bg-slate-50/70'
                            : 'bg-sky-50/30 hover:bg-sky-50/60'
                        }`}
                      >
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 shadow-2xs">
                          {renderIcono(item.tipo)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs truncate ${
                                item.leida
                                  ? 'font-medium text-slate-700'
                                  : 'font-bold text-slate-900'
                              }`}
                            >
                              {item.titulo}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                              <Clock className="h-2.5 w-2.5" />
                              {formatearHora(item.fechaHora)}
                            </span>
                          </div>

                          <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2 leading-snug">
                            {item.mensaje}
                          </p>

                          {item.enlace && (
                            <span className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-semibold text-sky-600 group-hover:underline">
                              <span>Ver detalle</span>
                              <ChevronRight className="h-2.5 w-2.5" />
                            </span>
                          )}
                        </div>

                        {!item.leida && (
                          <button
                            type="button"
                            onClick={(e) => handleMarcarLeida(e, item.id)}
                            title="Marcar como leída"
                            className="mt-0.5 shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer suave sin contraste */}
          <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-1.5 text-center text-[10px] text-slate-400">
            Avisos de cancelaciones, turnos próximos y recetas
          </div>
        </div>
      )}
    </div>
  );
};
