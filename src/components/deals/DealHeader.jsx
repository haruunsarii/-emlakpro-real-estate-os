import React from 'react';

export default function DealHeader({
  viewMode = 'kanban',
  onViewModeChange,
  onExport,
  onAddNewDeal,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-low shadow-sm border border-surface-container">
      {/* Title & Pulse Indicator */}
      <div className="flex items-center gap-space-md">
        <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-sm shrink-0">
          <span className="material-symbols-outlined text-[22px]">trending_up</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs flex-wrap">
            <h1 className="font-headline-sm text-headline-sm text-primary font-bold">
              Satış &amp; Kiralama Süreçleri
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-caption text-caption bg-surface-container text-secondary font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              Canlı Huni Takibi
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Gayrimenkul satış ve kiralama fırsatlarınızı aşama bazlı Kanban hunisinde yönetin, teklif ve pazarlık süreçlerini hızlandırın.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-space-sm flex-wrap shrink-0">
        {/* View Toggle (Kanban vs Table) */}
        <div className="inline-flex p-1 rounded-lg bg-surface-container border border-surface-container-high/60">
          <button
            onClick={() => onViewModeChange('kanban')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded font-label-sm text-label-sm transition-all cursor-pointer ${
              viewMode === 'kanban'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">view_kanban</span>
            <span>Kanban</span>
          </button>

          <button
            onClick={() => onViewModeChange('table')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded font-label-sm text-label-sm transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">table_rows</span>
            <span>Tablo</span>
          </button>
        </div>

        {/* Report / Export Button */}
        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 px-space-md py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container shadow-xs font-label-md text-label-md transition-all border border-surface-container-high cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">file_download</span>
          <span>Rapor &amp; Dışa Aktar</span>
        </button>

        {/* Add New Deal Button */}
        <button
          onClick={onAddNewDeal}
          className="inline-flex items-center gap-2 px-space-md py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary shadow-sm font-label-md text-label-md font-semibold transition-all active:scale-95 cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>+ Yeni Fırsat / Anlaşma Ekle</span>
        </button>
      </div>
    </div>
  );
}

