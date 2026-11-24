import React, { memo } from 'react';

function CustomerHeader({ totalCount, onExport, onAddCustomer }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
      {/* Title & Badge */}
      <div className="flex flex-col">
        <div className="flex items-center gap-space-sm flex-wrap">
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
            Müşteri Yönetimi
          </h1>
          <span className="px-space-sm py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-semibold">
            {totalCount ?? 0} Kayıtlı Müşteri
          </span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-3xl">
          Alıcı, satıcı, kiracı ve mülk sahibi portföyünüzü, kurumsal iletişim geçmişlerini ve danışman atamalarını tek bir çalışma alanından yönetin.
        </p>
      </div>

      {/* Action CTAs */}
      <div className="flex items-center gap-space-sm flex-wrap">
        <button
          onClick={onExport}
          className="h-10 px-space-md rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all shadow-sm flex items-center gap-space-xs border border-surface-container cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
            file_download
          </span>
          <span>Dışa Aktar (Excel/CSV)</span>
        </button>

        <button
          onClick={onAddCustomer}
          className="h-10 px-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm flex items-center gap-space-xs cursor-pointer font-semibold"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>+ Yeni Müşteri Ekle</span>
        </button>
      </div>
    </div>
  );
}

export default memo(CustomerHeader);

