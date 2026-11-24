import React from 'react';

export default function TaskStatsGrid({
  stats = {
    todayTasksCount: 0,
    todayTasksUrgent: 0,
    upcomingAppointmentsCount: 0,
    completedTasksCount: 0,
    completedRate: 0,
    overdueCount: 0,
  },
  onStatClick,
  activeFilterKey = null,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
      {/* KPI 1: Bugünkü Görevler */}
      <div
        onClick={() => onStatClick && onStatClick('today_tasks')}
        className={`relative overflow-hidden bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between cursor-pointer transition-all hover:shadow-md border ${activeFilterKey === 'today_tasks'
            ? 'ring-2 ring-primary border-primary'
            : 'border-surface-container'
          }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-caption text-caption uppercase text-on-surface-variant tracking-wider font-semibold">
              Bugünkü Görevler
            </span>
            <span className="font-currency-stat text-currency-stat text-primary mt-space-xs font-bold">
              {stats.todayTasksCount} Görev
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">checklist</span>
          </div>
        </div>
        <div className="mt-space-sm pt-space-xs flex items-center justify-between text-on-surface-variant border-t border-surface-container/60">
          <div className="flex items-center gap-1.5 font-caption text-caption">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="font-semibold text-rose-700">{stats.todayTasksUrgent} Acil</span>
            <span className="text-outline-variant">•</span>
            <span>Ofis Günlük Takip</span>
          </div>
          <span className="font-caption text-caption text-secondary font-semibold hover:underline">
            İncele
          </span>
        </div>
      </div>

      {/* KPI 2: Yaklaşan Randevular */}
      <div
        onClick={() => onStatClick && onStatClick('upcoming_appointments')}
        className={`relative overflow-hidden bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between cursor-pointer transition-all hover:shadow-md border ${activeFilterKey === 'upcoming_appointments'
            ? 'ring-2 ring-secondary border-secondary'
            : 'border-surface-container'
          }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-caption text-caption uppercase text-on-surface-variant tracking-wider font-semibold">
              Yaklaşan Randevular
            </span>
            <span className="font-currency-stat text-currency-stat text-primary mt-space-xs font-bold">
              {stats.upcomingAppointmentsCount} Randevu
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">calendar_today</span>
          </div>
        </div>
        <div className="mt-space-sm pt-space-xs flex items-center justify-between border-t border-surface-container/60">
          <div className="flex items-center gap-1.5 font-caption text-caption text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-secondary-container" />
            <span>Gösterim &amp; Sözleşme</span>
          </div>
          <span className="font-caption text-caption text-secondary font-semibold">
            Ajanda Aktif
          </span>
        </div>
      </div>

      {/* KPI 3: Tamamlanan Görevler */}
      <div
        onClick={() => onStatClick && onStatClick('completed_tasks')}
        className={`relative overflow-hidden bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between cursor-pointer transition-all hover:shadow-md border ${activeFilterKey === 'completed_tasks'
            ? 'ring-2 ring-emerald-500 border-emerald-500'
            : 'border-surface-container'
          }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-caption text-caption uppercase text-on-surface-variant tracking-wider font-semibold">
              Tamamlanan Görevler
            </span>
            <span className="font-currency-stat text-currency-stat text-primary mt-space-xs font-bold">
              {stats.completedTasksCount} Aktivite
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">task_alt</span>
          </div>
        </div>
        <div className="mt-space-sm pt-space-xs flex items-center justify-between border-t border-surface-container/60">
          <div className="flex items-center gap-space-xs">
            <div className="w-20 bg-surface-container-high rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full"
                style={{ width: `${stats.completedRate || 88}%` }}
              />
            </div>
            <span className="font-caption text-caption text-emerald-700 font-bold">
              %{stats.completedRate || 88} Başarı
            </span>
          </div>
          <span className="font-caption text-caption text-on-surface-variant">
            Bu Hafta
          </span>
        </div>
      </div>

      {/* KPI 4: Geciken Görevler */}
      <div
        onClick={() => onStatClick && onStatClick('overdue_tasks')}
        className={`relative overflow-hidden bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between cursor-pointer transition-all hover:shadow-md border ${activeFilterKey === 'overdue_tasks'
            ? 'ring-2 ring-rose-500 border-rose-500'
            : 'border-surface-container'
          }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-caption text-caption uppercase text-rose-700 tracking-wider font-semibold">
              Geciken Görevler
            </span>
            <span className="font-currency-stat text-currency-stat text-rose-700 mt-space-xs font-bold">
              {stats.overdueCount} Hatırlatıcı
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">warning</span>
          </div>
        </div>
        <div className="mt-space-sm pt-space-xs flex items-center justify-between border-t border-surface-container/60">
          <span className="inline-flex items-center gap-1 font-caption text-caption font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            Aksiyon Bekleyenler
          </span>
          <span className="font-caption text-caption text-secondary font-semibold hover:underline">
            Filtrele
          </span>
        </div>
      </div>
    </div>
  );
}

