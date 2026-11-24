import React, { useState, useRef, useEffect, memo } from 'react';
import { DATE_PRESETS, CONSULTANTS_FILTER_LIST } from '../../services/reportsData';

function ReportHeader({
  activePeriod = '30d',
  onPeriodChange,
  customRange,
  onCustomDateApply,
  selectedConsultant = 'all',
  onConsultantChange,
  consultants = CONSULTANTS_FILTER_LIST,
  onExport,
  onExportPdf,
  onExportExcel,
  onExportCsv,
}) {
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [consultantDropdownOpen, setConsultantDropdownOpen] = useState(false);
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(customRange?.start || '2026-10-01');
  const [customEndDate, setCustomEndDate] = useState(customRange?.end || '2026-11-10');

  const exportRef = useRef(null);
  const consultantRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setExportDropdownOpen(false);
      }
      if (consultantRef.current && !consultantRef.current.contains(event.target)) {
        setConsultantDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePresetClick = (presetId) => {
    if (presetId === 'custom') {
      setIsCustomDateModalOpen(true);
    } else {
      if (onPeriodChange) onPeriodChange(presetId);
    }
  };

  const handleApplyCustomDate = (e) => {
    e.preventDefault();
    setIsCustomDateModalOpen(false);
    if (onCustomDateApply) {
      onCustomDateApply({ start: customStartDate, end: customEndDate });
    } else if (onPeriodChange) {
      onPeriodChange('custom', { start: customStartDate, end: customEndDate });
    }
  };

  const getConsultantLabel = () => {
    const found = consultants.find((c) => c.id === selectedConsultant);
    return found ? found.name : 'Tüm Danışmanlar';
  };

  return (
    <div className="flex flex-col gap-space-md p-space-md rounded-2xl bg-surface-container-low border border-surface-container shadow-xs">
      {/* 1. Üst Başlık & Eylem Çubuğu */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant uppercase tracking-wider flex-wrap">
            <span>Yönetim</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Raporlar &amp; Analitik</span>
            <span className="bg-surface-container text-secondary font-label-sm text-label-sm px-space-xs py-0.5 rounded-full ml-space-xs font-semibold">
              Kadıköy Merkez &amp; Şubeler
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
            Raporlar &amp; Performans Analitiği
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            İşletmenizin performansını analiz edin, fırsatları keşfedin ve veriye dayalı kararlar alın.
          </p>
        </div>

        {/* Danışman Filtresi & Raporu Dışa Aktar Butonu */}
        <div className="flex flex-wrap items-center gap-space-sm shrink-0">
          {/* Danışman Seçimi Dropdown */}
          <div className="relative" ref={consultantRef}>
            <button
              type="button"
              onClick={() => setConsultantDropdownOpen(!consultantDropdownOpen)}
              className="h-10 px-space-sm bg-surface-container-lowest rounded-xl flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface hover:bg-surface-container transition-colors border border-surface-container shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">person</span>
              <span className="font-medium text-on-surface-variant hidden sm:inline">Danışman:</span>
              <span className="font-semibold text-primary truncate max-w-[130px]">
                {getConsultantLabel()}
              </span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                arrow_drop_down
              </span>
            </button>

            {consultantDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                {consultants.map((consultant) => (
                  <button
                    key={consultant.id}
                    type="button"
                    onClick={() => {
                      if (onConsultantChange) onConsultantChange(consultant.id);
                      setConsultantDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-container transition-colors ${
                      selectedConsultant === consultant.id
                        ? 'font-bold text-primary bg-surface-container/50'
                        : 'text-on-surface'
                    }`}
                  >
                    <span>{consultant.name}</span>
                    {selectedConsultant === consultant.id && (
                      <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Raporu Dışa Aktar Dropdown Butonu */}
          <div className="relative" ref={exportRef}>
            <button
              type="button"
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="h-10 px-space-md bg-primary hover:bg-primary-container text-white rounded-xl font-label-sm text-label-sm font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span>Raporu Dışa Aktar</span>
              <span className="material-symbols-outlined text-[16px] ml-0.5">arrow_drop_down</span>
            </button>

            {exportDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 font-caption text-[11px] text-on-surface-variant font-bold uppercase tracking-wider border-b border-surface-container">
                  Dışa Aktarma Formatı
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setExportDropdownOpen(false);
                    if (onExport) onExport('pdf');
                    else if (onExportPdf) onExportPdf();
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-surface-container transition-colors flex items-center gap-2 text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-rose-600">picture_as_pdf</span>
                  <div className="flex flex-col">
                    <span className="font-semibold">PDF Raporu İndir</span>
                    <span className="text-[10px] text-on-surface-variant">Yönetici özeti ve tablolar</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExportDropdownOpen(false);
                    if (onExport) onExport('excel');
                    else if (onExportExcel) onExportExcel();
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-surface-container transition-colors flex items-center gap-2 text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">table_view</span>
                  <div className="flex flex-col">
                    <span className="font-semibold">Excel Tablosu (.xls - HTML tabanlı tablo)</span>
                    <span className="text-[10px] text-on-surface-variant">Biçimlendirilmiş elektronik tablo</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExportDropdownOpen(false);
                    if (onExport) onExport('csv');
                    else if (onExportCsv) onExportCsv();
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-surface-container transition-colors flex items-center gap-2 text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">csv</span>
                  <div className="flex flex-col">
                    <span className="font-semibold">CSV Veri Dosyası</span>
                    <span className="text-[10px] text-on-surface-variant">UTF-8 Türkçe formatında</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Tarih Aralığı Ön Ayarları (Date Presets Segmented Control) */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm pt-2 border-t border-surface-container">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface-container-lowest rounded-xl border border-surface-container">
          {DATE_PRESETS.map((preset) => {
            const isActive = activePeriod === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetClick(preset.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                }`}
              >
                {preset.id === 'custom' && (
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                )}
                <span>{preset.label}</span>
                {preset.id === 'custom' && activePeriod === 'custom' && (
                  <span className="text-[10px] bg-white/20 px-1 rounded ml-0.5">
                    {customStartDate.slice(5)} - {customEndDate.slice(5)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Aktif Veri Durumu & Filtre Bilgisi */}
        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-caption">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Canlı CRM Veritabanı • Son Senkronizasyon: Az önce</span>
        </div>
      </div>

      {/* Özel Tarih Aralığı Seçim Modalı */}
      {isCustomDateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container w-full max-w-sm p-space-md flex flex-col gap-space-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-surface-container pb-space-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">date_range</span>
                <h3 className="font-label-md text-sm font-bold text-primary">
                  Özel Tarih Aralığı Belirle
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomDateModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-surface-container text-outline hover:text-primary flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleApplyCustomDate} className="flex flex-col gap-space-sm">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-primary">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="h-10 px-3 text-sm rounded-lg border border-surface-container bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-primary">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="h-10 px-3 text-sm rounded-lg border border-surface-container bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container mt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomDateModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-on-surface-variant hover:bg-surface-container rounded-lg font-medium cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-primary hover:bg-primary-container text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Tarihi Uygula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ReportHeader);

