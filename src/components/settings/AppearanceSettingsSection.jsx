import React from 'react';

export default function AppearanceSettingsSection({
  appearance = {},
  onChange,
  onToast,
}) {
  const handleUpdate = (field, value) => {
    const updated = {
      ...appearance,
      [field]: value,
    };
    if (onChange) onChange(updated);
    if (onToast) onToast('Görünüm tercihi güncellendi.');
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-space-lg flex flex-col gap-space-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-space-sm bg-surface-container-low -mx-space-lg -mt-space-lg p-space-lg rounded-t-xl border-b border-surface-container">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">palette</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
              Görünüm & Sistem Ayarları
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Uygulama temasını, tablo yoğunluğunu, dil ve para birimi standartlarını kişiselleştirin.
            </p>
          </div>
        </div>
        <span className="font-caption text-caption text-secondary bg-secondary-fixed/50 font-bold px-2.5 py-1 rounded-full">
          EmlakPro Design System
        </span>
      </div>

      {/* Tema Seçimi */}
      <div className="flex flex-col gap-3">
        <label className="font-label-md text-label-md font-bold text-primary">
          Uygulama Teması
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Açık Tema */}
          <div
            role="button"
            tabIndex={0}
            data-theme-option="light"
            onClick={() => handleUpdate('theme', 'light')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleUpdate('theme', 'light'); }}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 cursor-pointer transition-all ${
              appearance.theme === 'light'
                ? 'border-secondary bg-secondary/5 shadow-sm'
                : 'border-surface-container bg-surface hover:bg-surface-container-low'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-amber-500">
              <span className="material-symbols-outlined text-[26px]">light_mode</span>
            </div>
            <div className="text-center">
              <span className="font-label-md text-label-md font-bold text-primary block">
                Açık Tema (Varsayılan)
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Yüksek kontrastlı kurumsal beyaz
              </span>
            </div>
            {appearance.theme === 'light' && (
              <span className="material-symbols-outlined text-secondary text-[20px]">
                check_circle
              </span>
            )}
          </div>

          {/* Koyu Tema */}
          <div
            role="button"
            tabIndex={0}
            data-theme-option="dark"
            onClick={() => handleUpdate('theme', 'dark')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleUpdate('theme', 'dark'); }}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 cursor-pointer transition-all ${
              appearance.theme === 'dark'
                ? 'border-secondary bg-secondary/5 shadow-sm'
                : 'border-surface-container bg-surface hover:bg-surface-container-low'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#131b2e] text-white shadow-md flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">dark_mode</span>
            </div>
            <div className="text-center">
              <span className="font-label-md text-label-md font-bold text-primary block">
                Koyu Tema
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Göz yormayan gece çalışma modu
              </span>
            </div>
            {appearance.theme === 'dark' && (
              <span className="material-symbols-outlined text-secondary text-[20px]">
                check_circle
              </span>
            )}
          </div>

          {/* Sistem Teması */}
          <div
            role="button"
            tabIndex={0}
            data-theme-option="system"
            onClick={() => handleUpdate('theme', 'system')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleUpdate('theme', 'system'); }}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 cursor-pointer transition-all ${
              appearance.theme === 'system'
                ? 'border-secondary bg-secondary/5 shadow-sm'
                : 'border-surface-container bg-surface hover:bg-surface-container-low'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-surface-container text-primary shadow-md flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">desktop_windows</span>
            </div>
            <div className="text-center">
              <span className="font-label-md text-label-md font-bold text-primary block">
                Sistem Tercihi
              </span>
              <span className="text-[11px] text-on-surface-variant">
                İşletim sistemi ayarını otomatik izle
              </span>
            </div>
            {appearance.theme === 'system' && (
              <span className="material-symbols-outlined text-secondary text-[20px]">
                check_circle
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Dil, Para Birimi, Yoğunluk & Satır Sayısı */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-2 border-t border-surface-container">
        {/* Dil */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm font-semibold text-on-surface">
            Sistem Dili
          </label>
          <select
            value={appearance.language || 'tr'}
            onChange={(e) => handleUpdate('language', e.target.value)}
            className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:border-secondary font-body-sm cursor-pointer"
          >
            <option value="tr">Türkçe (Varsayılan)</option>
            <option value="en">English (İngilizce - Beta)</option>
          </select>
        </div>

        {/* Para Birimi */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm font-semibold text-on-surface">
            Varsayılan Para Birimi
          </label>
          <select
            value={appearance.currency || 'TRY'}
            onChange={(e) => handleUpdate('currency', e.target.value)}
            className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:border-secondary font-body-sm cursor-pointer"
          >
            <option value="TRY">₺ Türk Lirası (TRY)</option>
            <option value="USD">$ Amerikan Doları (USD)</option>
            <option value="EUR">€ Euro (EUR)</option>
          </select>
        </div>

        {/* Tablo Yoğunluğu */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm font-semibold text-on-surface">
            Tablo & Kart Yoğunluğu
          </label>
          <select
            value={appearance.density || 'comfortable'}
            onChange={(e) => handleUpdate('density', e.target.value)}
            className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:border-secondary font-body-sm cursor-pointer"
          >
            <option value="comfortable">Rahat (Standart Satır Boşlukları)</option>
            <option value="compact">Kompakt (Yoğun Veri Görünümü)</option>
          </select>
        </div>

        {/* Sayfa Başı Satır Sayısı */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm font-semibold text-on-surface">
            Sayfa Başına Varsayılan Satır
          </label>
          <select
            value={appearance.rowsPerPage || 10}
            onChange={(e) => handleUpdate('rowsPerPage', Number(e.target.value))}
            className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:border-secondary font-body-sm cursor-pointer"
          >
            <option value={10}>10 Kayıt</option>
            <option value={25}>25 Kayıt</option>
            <option value={50}>50 Kayıt</option>
          </select>
        </div>
      </div>

      {/* Akıcı Animasyonlar */}
      <div className="flex items-center justify-between p-space-md rounded-xl bg-surface-container-low border border-surface-container">
        <div className="flex flex-col">
          <span className="font-label-md text-label-md font-bold text-primary">
            Akıcı Arayüz Geçişleri & Animasyonlar
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Sayfa ve modal geçişlerinde yumuşak mikromotion efektlerini aktif tutun.
          </span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            checked={Boolean(appearance.enableAnimations)}
            onChange={() => handleUpdate('enableAnimations', !appearance.enableAnimations)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
        </label>
      </div>
    </div>
  );
}

