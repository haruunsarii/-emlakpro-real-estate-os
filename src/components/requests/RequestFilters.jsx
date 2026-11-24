import React from 'react';

export default function RequestFilters({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  propertyTypeFilter,
  onPropertyTypeChange,
  districtFilter,
  onDistrictChange,
  budgetFilter,
  onBudgetChange,
  advisorFilter,
  onAdvisorChange,
  statusFilter,
  onStatusChange,
  onResetFilters,
  tabCounts = { all: 184, high_match: 42, buy: 84, rent: 100, waiting: 14 },
}) {
  const tabs = [
    { id: 'all', label: 'Tümü', count: tabCounts.all },
    { id: 'high_match', label: 'Yüksek Eşleşenler', count: tabCounts.high_match, isHighlight: true },
    { id: 'buy', label: 'Satın Alma', count: tabCounts.buy },
    { id: 'rent', label: 'Kiralama', count: tabCounts.rent },
    { id: 'waiting', label: 'Eşleşme Bekleyenler', count: tabCounts.waiting },
  ];

  return (
    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-md border border-surface-container-low">
      {/* 1. Quick Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-surface-container">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                  : 'bg-surface text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
              type="button"
            >
              <span>{tab.label}</span>
              <span
                className={`ml-1.5 text-[13px] ${
                  tab.isHighlight && !isActive
                    ? 'font-bold text-secondary'
                    : 'opacity-80'
                }`}
              >
                ({tab.count ?? 0})
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Search & Dropdown Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-space-sm items-center">
        {/* Search Bar */}
        <div className="xl:col-span-4 relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-outline text-[20px] pointer-events-none">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-[42px] pl-10 pr-10 bg-surface text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:bg-surface-container-lowest focus:border-secondary transition-all placeholder:text-outline"
            placeholder="Müşteri adı, aranan bölge, talep kodu (TLP-...) ara..."
            type="text"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 text-on-surface-variant hover:text-on-surface cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
            </button>
          )}
        </div>

        {/* Mülk Tipi */}
        <div className="xl:col-span-2">
          <div className="relative">
            <select
              value={propertyTypeFilter}
              onChange={(e) => onPropertyTypeChange(e.target.value)}
              className="w-full h-[42px] px-3 pr-8 bg-surface text-on-surface font-body-sm text-body-sm rounded-lg appearance-none border border-surface-container-high focus:outline-none focus:border-secondary transition-all cursor-pointer"
            >
              <option value="all">Mülk Tipi: Tümü</option>
              <option value="Daire">Daire / Rezidans</option>
              <option value="Penthouse">Penthouse / Çatı Dubleksi</option>
              <option value="Villa">Villa / Müstakil</option>
              <option value="Ofis">Ticari Plaza / Ofis</option>
              <option value="Arsa">İmarlı Arsa</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
              unfold_more
            </span>
          </div>
        </div>

        {/* Bölge / İlçe */}
        <div className="xl:col-span-2">
          <div className="relative">
            <select
              value={districtFilter}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="w-full h-[42px] px-3 pr-8 bg-surface text-on-surface font-body-sm text-body-sm rounded-lg appearance-none border border-surface-container-high focus:outline-none focus:border-secondary transition-all cursor-pointer"
            >
              <option value="all">Bölge: Tümü (İstanbul)</option>
              <option value="Kadıköy">Kadıköy (Moda, Kalamış, Caddebostan)</option>
              <option value="Beşiktaş">Beşiktaş / Levent</option>
              <option value="Beykoz">Beykoz &amp; Konaklar</option>
              <option value="Sarıyer">Sarıyer &amp; Boğaz Hattı</option>
              <option value="Ataşehir">Ataşehir &amp; Finans Mrkz.</option>
              <option value="Üsküdar">Üsküdar &amp; Çengelköy</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
              location_on
            </span>
          </div>
        </div>

        {/* Bütçe */}
        <div className="xl:col-span-2">
          <div className="relative">
            <select
              value={budgetFilter}
              onChange={(e) => onBudgetChange(e.target.value)}
              className="w-full h-[42px] px-3 pr-8 bg-surface text-on-surface font-body-sm text-body-sm rounded-lg appearance-none border border-surface-container-high focus:outline-none focus:border-secondary transition-all cursor-pointer"
            >
              <option value="all">Bütçe: Tümü</option>
              <option value="0-15m">₺0 - ₺15.000.000</option>
              <option value="15-30m">₺15.000.000 - ₺30.000.000</option>
              <option value="30-60m">₺30.000.000 - ₺60.000.000</option>
              <option value="60m+">₺60.000.000 + (VIP)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
              payments
            </span>
          </div>
        </div>

        {/* Danışman */}
        <div className="xl:col-span-2">
          <div className="relative">
            <select
              value={advisorFilter}
              onChange={(e) => onAdvisorChange(e.target.value)}
              className="w-full h-[42px] px-3 pr-8 bg-surface text-on-surface font-body-sm text-body-sm rounded-lg appearance-none border border-surface-container-high focus:outline-none focus:border-secondary transition-all cursor-pointer"
            >
              <option value="all">Danışman: Tümü</option>
              <option value="Burak Yılmaz">Burak Yılmaz (Kıdemli)</option>
              <option value="Elif Demir">Elif Demir</option>
              <option value="Mert Can">Mert Can</option>
              <option value="Selin Akın">Selin Akın</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
              person
            </span>
          </div>
        </div>
      </div>

      {/* 3. Secondary Actions Strip */}
      <div className="flex items-center justify-between pt-1 text-caption font-caption text-on-surface-variant flex-wrap gap-2 border-t border-surface-container/60">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-primary">Talep Durumu:</span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-8 px-2.5 rounded bg-surface border border-surface-container text-on-surface font-label-sm text-[12px] cursor-pointer focus:outline-none focus:border-secondary"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="Yeni">Yeni</option>
            <option value="Aktif">Aktif</option>
            <option value="Eşleşme Bulundu">Eşleşme Bulundu</option>
            <option value="Randevu Planlandı">Randevu Planlandı</option>
            <option value="Tamamlandı">Tamamlandı</option>
            <option value="İptal">İptal</option>
          </select>
        </div>

        <button
          onClick={onResetFilters}
          className="text-secondary font-label-sm text-label-sm hover:underline flex items-center gap-1 cursor-pointer font-semibold"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          <span>Filtreleri Sıfırla</span>
        </button>
      </div>
    </div>
  );
}
