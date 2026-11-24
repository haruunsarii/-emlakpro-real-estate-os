import React from 'react';

export default function CustomerBreadcrumb() {
  return (
    <div className="px-space-md sm:px-space-lg py-space-sm bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container">
      {/* Breadcrumb */}
      <div className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant">
        <span>Yönetim</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">Müşteri Portföyü</span>
      </div>

      {/* Security & Sync Status */}
      <div className="flex items-center gap-space-sm font-caption text-caption text-secondary">
        <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
        <span>KVKK &amp; Veri Güvenliği Protokolü Aktif • Senkronizasyon: 2 dk önce</span>
      </div>
    </div>
  );
}

