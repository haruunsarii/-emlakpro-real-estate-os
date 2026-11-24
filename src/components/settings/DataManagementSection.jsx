import React, { useState, useRef } from 'react';
import {
  exportAllCrmData,
  restoreCrmData,
  resetCrmToFactoryDefaults,
  calculateRealSystemMetrics,
} from '../../services/settingsData';

export default function DataManagementSection({
  settings = {},
  onSettingsReset,
  onToast,
}) {
  const fileInputRef = useRef(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmationInput, setResetConfirmationInput] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreFeedback, setRestoreFeedback] = useState(null);

  const realMetrics = calculateRealSystemMetrics(settings);
  const storageMetric = realMetrics.find((m) => m.id === 'storage');
  const recordsMetric = realMetrics.find((m) => m.id === 'records');
  const systemMetric = realMetrics.find((m) => m.id === 'system');

  // Trigger full CRM JSON export and file download
  const handleExportFullBackup = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const payload = exportAllCrmData(settings);
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
        const downloadAnchor = document.createElement('a');
        const dateStr = new Date().toISOString().slice(0, 10);
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `emlakpro_crm_tam_yedek_${dateStr}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        setIsExporting(false);
        if (onToast) onToast('Tüm CRM veritabanı JSON yedeği başarıyla indirildi ✓', 'success');
      } catch (err) {
        setIsExporting(false);
        console.error('Export error:', err);
        if (onToast) onToast('Yedek dışa aktarılırken bir hata oluştu.', 'error');
      }
    }, 400);
  };

  // Trigger module-based CSV export
  const handleExportModuleCsv = (moduleName) => {
    try {
      const full = exportAllCrmData(settings);
      const items = full.data[moduleName] || [];

      if (!items || items.length === 0) {
        if (onToast) onToast(`${moduleName} modülünde dışa aktarılacak kayıt bulunamadı.`, 'warning');
        return;
      }

      // Extract keys for CSV
      const headers = Object.keys(items[0]).filter((k) => typeof items[0][k] !== 'object');
      const csvRows = [headers.join(';')];

      for (const item of items) {
        const row = headers.map((h) => {
          const val = item[h] !== undefined && item[h] !== null ? String(item[h]) : '';
          return `"${val.replace(/"/g, '""')}"`;
        });
        csvRows.push(row.join(';'));
      }

      const csvContent = '\uFEFF' + csvRows.join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `emlakpro_${moduleName}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      if (onToast) onToast(`${moduleName.toUpperCase()} verileri CSV olarak indirildi ✓`, 'success');
    } catch (err) {
      console.error(err);
      if (onToast) onToast('CSV dışa aktarımında hata oluştu.', 'error');
    }
  };

  // Restore JSON file
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setRestoreFeedback(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        const parsed = JSON.parse(content);

        restoreCrmData(parsed);
        setIsRestoring(false);
        setRestoreFeedback({
          success: true,
          message: `Yedek başarıyla yüklendi! (${parsed.appName || 'EmlakPro'} - ${parsed.formattedExportDate || 'Tarih belirtilmedi'})`,
        });

        if (onToast) onToast('CRM verileri yedekten geri yüklendi ✓', 'success');
        if (onSettingsReset) onSettingsReset();
      } catch (err) {
        setIsRestoring(false);
        setRestoreFeedback({
          success: false,
          message: 'Geçersiz yedek dosyası: ' + (err.message || 'JSON ayrıştırma hatası'),
        });
        if (onToast) onToast('Yedek dosyası okunamadı veya biçimi bozuk.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Factory reset
  const handleFactoryReset = () => {
    if (resetConfirmationInput.trim().toUpperCase() !== 'SIFIRLA') {
      if (onToast) onToast('Onaylamak için lütfen alana "SIFIRLA" yazın.', 'warning');
      return;
    }
    resetCrmToFactoryDefaults();
    setIsResetModalOpen(false);
    setResetConfirmationInput('');
    if (onToast) onToast('Tüm CRM verileri ve yerel ayarlar fabrika başlangıç durumuna sıfırlandı.', 'info');
    if (onSettingsReset) onSettingsReset();
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-space-lg flex flex-col gap-space-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm bg-surface-container-low -mx-space-lg -mt-space-lg p-space-lg rounded-t-xl border-b border-surface-container">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">database</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
              Veri Yönetimi, Yedekleme & Sıfırlama
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Tüm CRM veritabanını dışa aktarın, JSON yedeği indirin veya başlangıç durumuna geri yükleyin.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-label-sm bg-surface-container text-primary font-bold">
          <span className="material-symbols-outlined text-[16px]">folder_zip</span>
          JSON & CSV Desteği
        </span>
      </div>

      {/* Live Data Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-1">
          <span className="text-caption uppercase text-on-surface-variant font-bold">
            Tarayıcı Depolama
          </span>
          <span className="font-headline-sm text-lg font-bold text-primary">
            {storageMetric?.value || '84.5 KB / 5 MB'}
          </span>
          <span className="text-[11px] text-on-surface-variant">
            {storageMetric?.subtitle || 'Yerel HTML5 Bellek'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-1">
          <span className="text-caption uppercase text-on-surface-variant font-bold">
            Aktif Kayıt Sayısı
          </span>
          <span className="font-headline-sm text-lg font-bold text-secondary">
            {recordsMetric?.value || '50 Canlı Kayıt'}
          </span>
          <span className="text-[11px] text-on-surface-variant">
            {recordsMetric?.subtitle || 'Portföy, Müşteri, Fırsat'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-1">
          <span className="text-caption uppercase text-on-surface-variant font-bold">
            Son Yedekleme Zamanı
          </span>
          <span className="font-headline-sm text-lg font-bold text-primary">
            {systemMetric?.subBadgeValue || 'Henüz Yedek Alınmadı'}
          </span>
          <span className="text-[11px] text-on-surface-variant">
            Yerel JSON Arşivi
          </span>
        </div>
      </div>

      {/* Section 1: Full Backup & Restore */}
      <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[22px]">
            cloud_sync
          </span>
          <h3 className="font-label-md text-label-md font-bold text-primary">
            Tam CRM Veritabanı Yedeği (JSON)
          </h3>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Müşteriler, gayrimenkuller, satış fırsatları, talepler, görevler ve sistem ayarlarını tek bir JSON dosyasında toplayıp bilgisayarınıza indirin veya önceden alınmış yedeği yükleyin.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleExportFullBackup}
            disabled={isExporting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white font-label-md font-semibold transition-all shadow-sm cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <span className={`material-symbols-outlined text-[18px] ${isExporting ? 'animate-spin' : ''}`}>
              {isExporting ? 'sync' : 'download'}
            </span>
            <span>{isExporting ? 'Yedek Paketleniyor...' : 'Tam CRM Yedeğini İndir (.json)'}</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isRestoring}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-surface-container-lowest border border-surface-container text-primary font-label-md font-semibold hover:bg-surface-container transition-all shadow-sm cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <span className={`material-symbols-outlined text-[18px] ${isRestoring ? 'animate-spin' : ''}`}>
              {isRestoring ? 'hourglass_top' : 'upload_file'}
            </span>
            <span>{isRestoring ? 'Yükleniyor...' : 'Yedekten Geri Yükle (.json)'}</span>
          </button>
        </div>

        {restoreFeedback && (
          <div
            className={`p-3 rounded-lg text-body-sm font-medium flex items-center gap-2 animate-fadeIn ${
              restoreFeedback.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {restoreFeedback.success ? 'check_circle' : 'error'}
            </span>
            <span>{restoreFeedback.message}</span>
          </div>
        )}
      </div>

      {/* Section 2: Modular CSV Export */}
      <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[22px]">
            table_view
          </span>
          <h3 className="font-label-md text-label-md font-bold text-primary">
            Modül Bazlı Dışa Aktarma (Excel & CSV)
          </h3>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          İstediğiniz veri grubunu Excel ile uyumlu noktalı virgüllü CSV tablosu olarak ayrı ayrı dışa aktarın.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => handleExportModuleCsv('customers')}
            className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface hover:bg-surface-container font-label-sm font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer text-center"
          >
            <span className="material-symbols-outlined text-secondary text-[22px]">groups</span>
            <span>Müşteriler (.csv)</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportModuleCsv('properties')}
            className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface hover:bg-surface-container font-label-sm font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer text-center"
          >
            <span className="material-symbols-outlined text-secondary text-[22px]">domain</span>
            <span>Portföy (.csv)</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportModuleCsv('deals')}
            className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface hover:bg-surface-container font-label-sm font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer text-center"
          >
            <span className="material-symbols-outlined text-secondary text-[22px]">real_estate_agent</span>
            <span>Fırsatlar (.csv)</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportModuleCsv('appointments')}
            className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface hover:bg-surface-container font-label-sm font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer text-center"
          >
            <span className="material-symbols-outlined text-secondary text-[22px]">calendar_month</span>
            <span>Randevular (.csv)</span>
          </button>
        </div>
      </div>

      {/* Section 3: Factory Reset Danger Zone */}
      <div className="p-space-md rounded-xl bg-red-50/60 border border-red-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-red-600 text-[24px] mt-0.5 flex-shrink-0">
            restart_alt
          </span>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-bold text-red-900">
              Demo Verilerini Sıfırla (Fabrika Ayarlarına Dön)
            </span>
            <span className="font-body-sm text-body-sm text-red-800">
              Tarayıcıda yapılan tüm özel müşteri, fırsat ve ayar değişikliklerini temizler, ilk temiz demo veri setine geri döner.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsResetModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-label-md font-bold transition-colors shadow-sm cursor-pointer flex-shrink-0"
        >
          Demo Verilerini Sıfırla
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-2xl border border-surface-container overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between bg-red-50 text-red-900">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 text-[22px]">
                  warning
                </span>
                <h3 className="font-headline-sm text-[18px] font-bold">
                  Verileri Sıfırlamak İstediğinize Emin Misiniz?
                </h3>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Bu işlem tarayıcınızın yerel belleğinde saklanan tüm eklenmiş müşterileri, güncellenmiş fırsatları ve özelleştirilmiş ayarları silecek, sistemi ilk fabrika demo verilerine döndürecektir.
              </p>
              <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container text-[12px] font-mono text-on-surface-variant">
                Yalnızca EmlakPro'ya Ait Temizlenecek Anahtarlar:
                <br />• emlakpro_customers_v1 &amp; emlakpro_customers
                <br />• emlakpro_deals_v1
                <br />• emlakpro_settings_v1
                <br />• emlakpro_last_backup
              </div>

              <div>
                <label className="font-label-sm text-red-900 font-bold block mb-1">
                  Onaylamak için büyük harflerle "SIFIRLA" yazın:
                </label>
                <input
                  type="text"
                  value={resetConfirmationInput}
                  onChange={(e) => setResetConfirmationInput(e.target.value)}
                  placeholder="SIFIRLA"
                  className="w-full h-10 px-3 bg-surface border border-red-300 rounded-lg focus:outline-none focus:border-red-600 font-mono font-bold tracking-wider text-body-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setResetConfirmationInput('');
                  }}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md font-semibold cursor-pointer hover:bg-surface-container-high transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  disabled={resetConfirmationInput.trim().toUpperCase() !== 'SIFIRLA'}
                  onClick={handleFactoryReset}
                  className={`px-5 py-2 rounded-lg font-label-md font-bold transition-colors ${
                    resetConfirmationInput.trim().toUpperCase() === 'SIFIRLA'
                      ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-sm'
                      : 'bg-surface-variant text-on-surface-variant/50 cursor-not-allowed'
                  }`}
                >
                  Evet, Tüm Verileri Sıfırla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

