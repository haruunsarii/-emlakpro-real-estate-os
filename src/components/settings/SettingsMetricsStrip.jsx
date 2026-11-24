import React from 'react';

export default function SettingsMetricsStrip({ metrics = [] }) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
      {metrics.map((m) => (
        <div
          key={m.id}
          className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex flex-col justify-between gap-space-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption uppercase text-on-surface-variant tracking-wider font-semibold">
              {m.title}
            </span>
            {m.isLivePulse ? (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            ) : (
              <span className={`material-symbols-outlined ${m.color || 'text-secondary'} text-[20px]`}>
                {m.icon}
              </span>
            )}
          </div>

          <div>
            <div className="font-headline-sm text-headline-sm text-primary font-bold">
              {m.value}
            </div>
            <div className="text-on-surface-variant font-body-sm text-body-sm mt-0.5 truncate">
              {m.subtitle}
            </div>
          </div>

          <div className="flex items-center justify-between pt-space-xs bg-surface-container-low px-space-sm py-1 rounded">
            <span className="font-caption text-caption text-on-surface">
              {m.subBadgeLabel}
            </span>
            <span className={`font-caption text-caption font-bold ${m.color || 'text-secondary'}`}>
              {m.subBadgeValue}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

