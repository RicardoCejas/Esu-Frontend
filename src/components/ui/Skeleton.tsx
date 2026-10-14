import React from 'react';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  ...props
}) => {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-xs space-y-3 dark:border-slate-800 dark:bg-slate-900/60"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
};

export const RouteLoadingFallback: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Cargando módulo"
      className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-6"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      <span className="text-xs font-semibold text-muted-foreground animate-pulse">
        Cargando módulo del sistema ESU...
      </span>
    </div>
  );
};
