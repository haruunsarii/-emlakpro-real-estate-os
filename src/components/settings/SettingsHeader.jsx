import React from 'react';

export default function SettingsHeader({
  lastSavedAt = 'Bugün 18:30',
  isDirty = false,
  onSave,
  onReset,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-sm border-b border-surface-container">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
          Ayarlar
        </h1>
        <p className="text-on-surface-variant font-body-sm text-body-sm mt-0.5">
          EmlakPro hesabınızı, ofis bilgilerinizi ve sistem tercihlerinizi yönetin.
        </p>
      </div>

      <div className="flex items-center gap-space-sm flex-wrap">
        <div className="text-right hidden sm:block">
          <span className="font-caption text-caption text-on-surface-variant block">Son Kaydedilme</span>
          <span className="font-label-sm text-label-sm text-primary font-medium">{lastSavedAt}</span>
        </div>

        {isDirty && (
          <button
            onClick={onReset}
            type="button"
            className="px-space-md py-2 rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container font-label-md text-label-md transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">undo</span>
            <span>Geri Al</span>
          </button>
        )}

        <button
          onClick={onSave}
          type="button"
          className="px-space-md py-2 rounded-lg bg-primary hover:bg-primary-container text-white font-label-md text-label-md transition-all shadow-sm flex items-center gap-1.5 cursor-pointer font-semibold"
        >
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Değişiklikleri Kaydet</span>
        </button>
      </div>
    </div>
  );
}

