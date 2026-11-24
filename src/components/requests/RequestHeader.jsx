import React, { useState } from 'react';

export default function RequestHeader({
  onRunEngine,
  onRefreshEngine,
  onExport,
  onNewRequest,
  onAddNewRequest,
  isSyncing = false,
}) {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleRunEngineClick = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 900);
    const triggerEngine = onRunEngine || onRefreshEngine;
    if (triggerEngine) triggerEngine();
  };

  const handleNewRequestClick = () => {
    const triggerNew = onNewRequest || onAddNewRequest;
    if (triggerNew) triggerNew();
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-low">
      {/* Title & Engine Protocol Info */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-sm flex-wrap">
          <span className="font-caption text-caption text-secondary font-semibold bg-secondary-fixed/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[11px]">
            Akıllı Portföy Motoru
          </span>
          <span className="font-caption text-caption text-on-surface-variant flex items-center gap-1.5 font-medium text-[12px]">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
            Canlı Kriter Algoritması Aktif
          </span>
        </div>

        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
          Müşteri Talepleri &amp; Akıllı Eşleştirme
        </h1>

        <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
          Kayıtlı alıcı ve kiracı taleplerini güncel portföy veritabanıyla anlık eşleştirin, kriter skorlarına göre fırsatları hızla satışa dönüştürün.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-space-sm flex-wrap w-full lg:w-auto">
        {/* Run Matching Engine */}
        <button
          onClick={handleRunEngineClick}
          className="inline-flex items-center justify-center gap-space-xs px-3 sm:px-4 py-2.5 bg-surface-container text-on-surface font-label-md text-xs sm:text-label-md rounded-lg hover:bg-surface-container-high transition-all active:scale-[0.98] cursor-pointer border border-surface-container/60 shadow-xs flex-1 sm:flex-none"
          type="button"
          title="Tüm talepleri portföy havuzuyla yeniden eşleştir"
        >
          <span
            className={`material-symbols-outlined text-[18px] sm:text-[19px] text-secondary ${
              isSpinning || isSyncing ? 'animate-spin' : ''
            }`}
          >
            sync
          </span>
          <span className="font-semibold whitespace-nowrap">Eşleştirme Motorunu Çalıştır</span>
        </button>

        {/* Export */}
        <button
          onClick={onExport}
          className="inline-flex items-center justify-center gap-space-xs px-3 sm:px-4 py-2.5 bg-surface-container-low text-on-surface-variant hover:text-on-surface font-label-md text-xs sm:text-label-md rounded-lg hover:bg-surface-container transition-all cursor-pointer border border-surface-container flex-1 sm:flex-none"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] sm:text-[19px]">file_download</span>
          <span>Dışa Aktar</span>
        </button>

        {/* New Request */}
        <button
          onClick={handleNewRequestClick}
          className="inline-flex items-center justify-center gap-space-xs px-4 sm:px-5 py-2.5 bg-primary-container text-on-primary font-label-md text-xs sm:text-label-md font-semibold rounded-lg shadow-sm hover:bg-primary transition-all active:scale-[0.98] cursor-pointer w-full sm:w-auto"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] sm:text-[20px]">add_circle</span>
          <span>+ Yeni Talep Oluştur</span>
        </button>
      </div>
    </div>
  );
}

