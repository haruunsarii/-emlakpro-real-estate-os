import React, { memo } from 'react';

function PropertyHeader({
  activeCount = 148,
  viewMode = 'grid',
  onViewModeChange,
  onExport,
  onAddProperty,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
      {/* Title & Badge */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-sm flex-wrap">
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
            Gayrimenkul Portföyü
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm bg-surface-container-high text-primary font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            {activeCount} Aktif İlan
          </span>
          <span className="font-caption text-caption uppercase px-2.5 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-medium">
            Kadıköy &amp; Anadolu Yakası Ağı
          </span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
          Ofisinizin satılık ve kiralık konut, ticari ve arsa portföylerini görüntüleyin, filtreleyin ve ilan detaylarını yönetin.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-space-sm flex-wrap w-full lg:w-auto">
        {/* View Mode Switcher */}
        <div className="flex items-center p-1 bg-surface-container-low rounded-lg shadow-xs border border-surface-container">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-2.5 py-1.5 rounded font-label-sm text-label-sm flex items-center gap-1 transition-all cursor-pointer ${viewMode === 'grid'
                ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
              }`}
            title="Grid Görünümü"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-2.5 py-1.5 rounded font-label-sm text-label-sm flex items-center gap-1 transition-all cursor-pointer ${viewMode === 'list'
                ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
              }`}
            title="Liste Görünümü"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">view_list</span>
            <span className="hidden sm:inline">Liste</span>
          </button>
        </div>

        {/* Toplu İçe/Dışa Aktar */}
        <button
          onClick={onExport}
          className="flex items-center gap-space-xs px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all shadow-xs border border-surface-container cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[19px] text-on-surface-variant">
            file_download
          </span>
          <span>Toplu İçe/Dışa Aktar</span>
        </button>

        {/* Yeni Portföy Ekle */}
        <button
          onClick={onAddProperty}
          className="flex items-center gap-space-xs px-5 py-2.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md transition-all shadow-md group cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-90">
            add
          </span>
          <span className="font-semibold">Yeni Portföy Ekle</span>
        </button>
      </div>
    </div>
  );
}

export default memo(PropertyHeader);

