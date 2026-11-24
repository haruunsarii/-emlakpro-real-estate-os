import React, { useState, useRef, useEffect, useMemo } from 'react';
import { APPOINTMENT_TYPES, getActiveAdvisors } from '../../utils/taskHelpers';
import { useAuth } from '../../hooks/useAuth';

export default function CalendarToolbar({
  viewMode = 'haftalik', // 'aylik' | 'haftalik' | 'gunluk' | 'ajanda'
  onViewModeChange,
  currentDateRangeLabel = '18 – 24 Mart 2024',
  currentWeekLabel = 'Mart • 12. Hafta',
  onPrevDate,
  onNextDate,
  onToday,
  selectedAdvisor = 'all',
  onAdvisorChange,
  selectedType = 'all',
  onTypeChange,
  selectedStatus = 'all', // 'all' | 'active' | 'completed' | 'cancelled'
  onStatusChange,
  searchQuery = '',
  onSearchChange,
  onResetFilters,
}) {
  const [advisorDropdownOpen, setAdvisorDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const advisorRef = useRef(null);
  const typeRef = useRef(null);
  const statusRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (advisorRef.current && !advisorRef.current.contains(event.target)) {
        setAdvisorDropdownOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target)) {
        setTypeDropdownOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setStatusDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { currentUser } = useAuth();
  const availableAdvisors = useMemo(() => getActiveAdvisors(currentUser), [currentUser]);

  const hasActiveFilters =
    selectedAdvisor !== 'all' ||
    selectedType !== 'all' ||
    (selectedStatus !== 'all' && selectedStatus !== 'active') ||
    searchQuery.trim() !== '';

  const getAdvisorLabel = () => {
    if (selectedAdvisor === 'all') return `Tüm Danışmanlar (${availableAdvisors.length})`;
    const found = availableAdvisors.find((a) => a.id === selectedAdvisor || a.name === selectedAdvisor);
    return found ? found.name : selectedAdvisor;
  };

  const getTypeLabel = () => {
    if (selectedType === 'all') return 'Tümü';
    return selectedType;
  };

  const getStatusLabel = () => {
    switch (selectedStatus) {
      case 'active':
        return 'Aktif & Bekleyen';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal';
      case 'all':
      default:
        return 'Tüm Durumlar';
    }
  };

  return (
    <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm border border-surface-container flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-sm">
      {/* Sol Grup: Periyot Değiştirici & Tarih Adımlayıcı */}
      <div className="flex flex-wrap items-center gap-space-sm">
        {/* Görünüm Düğmeleri Segmented Control */}
        <div className="flex p-0.5 bg-surface-container-low rounded-lg border border-surface-container">
          <button
            type="button"
            onClick={() => onViewModeChange?.('aylik')}
            className={`px-3 py-1.5 font-label-sm text-label-sm rounded-md transition-all cursor-pointer ${
              viewMode === 'aylik'
                ? 'bg-surface-container-lowest font-bold text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-primary font-medium'
            }`}
          >
            Aylık
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange?.('haftalik')}
            className={`px-3 py-1.5 font-label-sm text-label-sm rounded-md transition-all cursor-pointer ${
              viewMode === 'haftalik'
                ? 'bg-surface-container-lowest font-bold text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-primary font-medium'
            }`}
          >
            Haftalık
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange?.('gunluk')}
            className={`px-3 py-1.5 font-label-sm text-label-sm rounded-md transition-all cursor-pointer ${
              viewMode === 'gunluk'
                ? 'bg-surface-container-lowest font-bold text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-primary font-medium'
            }`}
          >
            Günlük
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange?.('ajanda')}
            className={`px-3 py-1.5 font-label-sm text-label-sm rounded-md transition-all cursor-pointer ${
              viewMode === 'ajanda'
                ? 'bg-surface-container-lowest font-bold text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-primary font-medium'
            }`}
          >
            Ajanda
          </button>
        </div>

        {/* Tarih Gezgini (Prev, Bugün, Next & Hafta Bilgisi) */}
        <div className="flex items-center gap-1.5 bg-surface-container-low px-2 py-1 rounded-lg border border-surface-container">
          <button
            type="button"
            onClick={onPrevDate}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-surface-container text-on-surface transition-colors cursor-pointer"
            title="Önceki Periyot"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={onToday}
            className="px-2.5 py-1 text-xs font-semibold text-primary hover:bg-surface-container rounded-md transition-colors cursor-pointer"
          >
            Bugün
          </button>
          <button
            type="button"
            onClick={onNextDate}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-surface-container text-on-surface transition-colors cursor-pointer"
            title="Sonraki Periyot"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
          <span className="h-4 w-[1px] bg-outline-variant mx-1" />
          <div className="flex items-center gap-2 px-1">
            <span className="font-label-sm text-label-sm font-bold text-primary whitespace-nowrap">
              {currentDateRangeLabel}
            </span>
            <span className="bg-surface-container text-on-surface-variant font-caption text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap hidden sm:inline-block">
              {currentWeekLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Sağ Grup: Danışman, Tür, Durum ve Arama */}
      <div className="flex flex-wrap items-center gap-space-xs sm:gap-space-sm">
        {/* Danışman Filtresi Pill */}
        <div className="relative" ref={advisorRef}>
          <button
            type="button"
            onClick={() => setAdvisorDropdownOpen(!advisorDropdownOpen)}
            className="h-[38px] px-space-sm bg-surface-container-low rounded-lg flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface hover:bg-surface-container transition-colors border border-surface-container cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">person</span>
            <span className="font-medium text-on-surface-variant hidden md:inline">Danışman:</span>
            <span className="font-semibold text-primary truncate max-w-[120px]">
              {getAdvisorLabel()}
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              arrow_drop_down
            </span>
          </button>

          {advisorDropdownOpen && (
            <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1 w-52 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container py-1 z-30">
              <button
                type="button"
                onClick={() => {
                  onAdvisorChange?.('all');
                  setAdvisorDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-container transition-colors ${
                  selectedAdvisor === 'all' ? 'font-bold text-primary bg-surface-container/50' : 'text-on-surface'
                }`}
              >
                <span>Tüm Danışmanlar</span>
                {selectedAdvisor === 'all' && (
                  <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                )}
              </button>
              {availableAdvisors.map((advisor) => (
                <button
                  key={advisor.id || advisor.name}
                  type="button"
                  onClick={() => {
                    onAdvisorChange?.(advisor.name);
                    setAdvisorDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-container transition-colors ${
                    selectedAdvisor === advisor.name || selectedAdvisor === advisor.id
                      ? 'font-bold text-primary bg-surface-container/50'
                      : 'text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                      {advisor.name.charAt(0)}
                    </span>
                    <span>{advisor.name}</span>
                  </div>
                  {(selectedAdvisor === advisor.name || selectedAdvisor === advisor.id) && (
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Aktivite Türü Pill */}
        <div className="relative" ref={typeRef}>
          <button
            type="button"
            onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
            className="h-[38px] px-space-sm bg-surface-container-low rounded-lg flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface hover:bg-surface-container transition-colors border border-surface-container cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">category</span>
            <span className="font-medium text-on-surface-variant hidden md:inline">Tür:</span>
            <span className="font-semibold text-primary truncate max-w-[110px]">
              {getTypeLabel()}
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              arrow_drop_down
            </span>
          </button>

          {typeDropdownOpen && (
            <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1 w-56 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container py-1 z-30">
              <button
                type="button"
                onClick={() => {
                  onTypeChange?.('all');
                  setTypeDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-container transition-colors ${
                  selectedType === 'all' ? 'font-bold text-primary bg-surface-container/50' : 'text-on-surface'
                }`}
              >
                <span>Tüm Türler</span>
                {selectedType === 'all' && (
                  <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                )}
              </button>
              {Object.keys(APPOINTMENT_TYPES).map((typeKey) => (
                <button
                  key={typeKey}
                  type="button"
                  onClick={() => {
                    onTypeChange?.(typeKey);
                    setTypeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-container transition-colors ${
                    selectedType === typeKey
                      ? 'font-bold text-primary bg-surface-container/50'
                      : 'text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        typeKey === 'Yer Gösterimi'
                          ? 'bg-blue-600'
                          : typeKey === 'Müşteri Takip Araması'
                          ? 'bg-emerald-600'
                          : typeKey === 'Sözleşme & Tapu Devri'
                          ? 'bg-purple-600'
                          : typeKey === 'Fotoğraf & Drone Çekimi'
                          ? 'bg-amber-600'
                          : 'bg-slate-600'
                      }`}
                    />
                    <span>{typeKey}</span>
                  </div>
                  {selectedType === typeKey && (
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Durum Filtresi Pill */}
        <div className="relative" ref={statusRef}>
          <button
            type="button"
            onClick={() => setStatusDropdownOpen((prev) => !prev)}
            className="h-[38px] px-space-sm bg-surface-container-low rounded-lg flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface hover:bg-surface-container transition-colors border border-surface-container cursor-pointer"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                selectedStatus === 'completed'
                  ? 'bg-emerald-500'
                  : selectedStatus === 'cancelled'
                  ? 'bg-rose-500'
                  : selectedStatus === 'all'
                  ? 'bg-blue-500'
                  : 'bg-emerald-500'
              }`}
            />
            <span className="font-medium text-on-surface-variant hidden md:inline">Durum:</span>
            <span className="font-semibold text-primary truncate max-w-[120px]">
              {getStatusLabel()}
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              arrow_drop_down
            </span>
          </button>

          {statusDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container py-1 z-30">
              {[
                { key: 'all', label: 'Tüm Durumlar' },
                { key: 'active', label: 'Aktif & Bekleyen' },
                { key: 'completed', label: 'Tamamlandı' },
                { key: 'cancelled', label: 'İptal' },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => {
                    onStatusChange?.(s.key);
                    setStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-container transition-colors ${
                    selectedStatus === s.key
                      ? 'font-bold text-primary bg-surface-container/50'
                      : 'text-on-surface'
                  }`}
                >
                  <span>{s.label}</span>
                  {selectedStatus === s.key && (
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Canlı Arama Input */}
        <div className="relative flex items-center flex-1 sm:flex-initial">
          <span className="material-symbols-outlined absolute left-2.5 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="h-[38px] pl-8 pr-7 text-body-sm font-body-sm bg-surface-container-low border border-surface-container rounded-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest placeholder:text-outline w-full sm:w-52 lg:w-64 transition-all"
            placeholder="İlan, müşteri veya randevu ara..."
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange?.('')}
              className="absolute right-2 text-outline hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        {/* Filtreleri Sıfırla Düğmesi */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="h-[38px] px-2.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1"
            title="Tüm Filtreleri Temizle"
          >
            <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
            <span className="hidden sm:inline">Temizle</span>
          </button>
        )}
      </div>
    </div>
  );
}
