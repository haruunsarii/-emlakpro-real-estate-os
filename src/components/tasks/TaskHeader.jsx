import React, { useState } from 'react';

export default function TaskHeader({
  onAddNewTask,
  onAddNewAppointment,
  onSyncCalendar,
}) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncClick = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      if (onSyncCalendar) onSyncCalendar();
    }, 700);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-low shadow-sm border border-surface-container">
      {/* Breadcrumb & Main Command Bar */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant uppercase tracking-wider flex-wrap">
          <span>Yönetim</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-semibold">Görevler &amp; Randevular</span>
          <span className="bg-surface-container text-secondary font-label-sm text-label-sm px-space-xs py-0.5 rounded-full ml-space-xs font-semibold">
            Kadıköy Şube Ajandası
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
          Görevler &amp; Randevular
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
          Gayrimenkul yer gösterimleri, müşteri takip görüşmeleri ve danışman ajandasını tek merkezden koordine edin.
        </p>
      </div>

      {/* Action Suite & Integrations */}
      <div className="flex flex-wrap items-center gap-space-sm shrink-0">
        {/* Calendar Sync Pill Button */}
        <button
          onClick={handleSyncClick}
          className="group flex items-center gap-space-xs px-space-md py-[9px] bg-surface-container-lowest text-on-surface rounded-lg shadow-xs hover:bg-surface-container transition-all text-left border border-surface-container-high cursor-pointer"
          type="button"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 ${
                isSyncing ? 'animate-ping' : 'opacity-75'
              }`}
            />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm font-semibold flex items-center gap-1">
              Google &amp; Apple Takvim
              <span
                className={`material-symbols-outlined text-[14px] text-on-surface-variant group-hover:text-primary ${
                  isSyncing ? 'animate-spin text-secondary' : ''
                }`}
              >
                sync
              </span>
            </span>
            <span className="font-caption text-[10px] text-on-surface-variant leading-none">
              {isSyncing ? 'Senkronize ediliyor...' : 'Senkronize • 3 dk önce'}
            </span>
          </div>
        </button>

        {/* Secondary Action: Görev Ekle */}
        <button
          onClick={onAddNewTask}
          className="flex items-center gap-space-xs px-space-md py-[10px] bg-surface-container-lowest text-primary font-label-md text-label-md rounded-lg shadow-xs hover:bg-surface-container-high transition-colors font-medium border border-surface-container-high cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px] text-secondary">add_task</span>
          <span>Görev Ekle</span>
        </button>

        {/* Primary Action: Randevu Oluştur */}
        <button
          onClick={onAddNewAppointment}
          className="flex items-center gap-space-xs px-space-lg py-[10px] bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-md hover:bg-primary-container transition-all shadow-primary/10 font-semibold cursor-pointer active:scale-95"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">event_available</span>
          <span>+ Yeni Randevu Oluştur</span>
        </button>
      </div>
    </div>
  );
}

