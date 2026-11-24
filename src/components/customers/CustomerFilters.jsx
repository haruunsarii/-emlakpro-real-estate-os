import React, { memo } from 'react';

function CustomerFilters({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  advisorFilter,
  onAdvisorFilterChange,
  budgetFilter,
  onBudgetFilterChange,
  regionFilter,
  onRegionFilterChange,
  onResetFilters,
  selectedCount,
  onBulkSms,
  onBulkAdvisorChange,
  roleCounts = { all: 0, buyers: 0, sellers: 0, renters: 0, owners: 0 },
}) {
  const roleTabs = [
    { id: 'all', label: `Tümü (${roleCounts.all || 0})` },
    { id: 'Alıcı', label: `Alıcılar (${roleCounts.buyers || 0})` },
    { id: 'Satıcı', label: `Satıcılar (${roleCounts.sellers || 0})` },
    { id: 'Kiracı', label: `Kiracılar (${roleCounts.renters || 0})` },
    { id: 'Mülk Sahibi', label: `Mülk Sahibi (${roleCounts.owners || 0})` },
  ];

  return (
    <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col gap-space-md border border-surface-container-low">
      {/* Search Row & Role Segment Pills */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
        {/* Search Field */}
        <div className="relative flex-1 max-w-xl">
          <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-11 pl-11 pr-space-md bg-surface rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-low transition-all border border-transparent focus:border-secondary"
            placeholder="İsim, telefon, e-posta, aranan semt veya talep koduna göre ara..."
            type="text"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
            </button>
          )}
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center flex-wrap gap-1.5 p-1 bg-surface rounded-lg border border-surface-container/60">
          {roleTabs.map((tab) => {
            const isActive = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onRoleFilterChange(tab.id)}
                className={`px-3 py-1.5 rounded-md font-label-sm text-label-sm transition-all cursor-pointer ${isActive
                    ? 'bg-primary text-on-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Second Filter Row: Dropdowns & Bulk Actions */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs border-t border-surface-container-low">
        {/* Left: Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-space-sm">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="h-9 px-3 pr-8 bg-surface hover:bg-surface-container rounded-lg font-label-sm text-label-sm text-on-surface cursor-pointer focus:outline-none appearance-none transition-colors border border-surface-container"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="Sıcak Aday">Sıcak Aday (Hot)</option>
              <option value="Görüşülüyor">Aktif Görüşme</option>
              <option value="Sözleşmede">Sözleşme Aşamasında</option>
              <option value="Beklemede">Beklemede</option>
              <option value="Ekspertiz Aşamasında">Ekspertiz</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Advisor Dropdown */}
          <div className="relative">
            <select
              value={advisorFilter}
              onChange={(e) => onAdvisorFilterChange(e.target.value)}
              className="h-9 px-3 pr-8 bg-surface hover:bg-surface-container rounded-lg font-label-sm text-label-sm text-on-surface cursor-pointer focus:outline-none appearance-none transition-colors border border-surface-container"
            >
              <option value="all">Tüm Danışmanlar</option>
              <option value="Burak Yılmaz">Burak Yılmaz (Siz)</option>
              <option value="Elif Demir">Elif Demir</option>
              <option value="Caner Aydın">Caner Aydın</option>
              <option value="Mert Can">Mert Can</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Budget Range Dropdown */}
          <div className="relative">
            <select
              value={budgetFilter}
              onChange={(e) => onBudgetFilterChange(e.target.value)}
              className="h-9 px-3 pr-8 bg-surface hover:bg-surface-container rounded-lg font-label-sm text-label-sm text-on-surface cursor-pointer focus:outline-none appearance-none transition-colors border border-surface-container"
            >
              <option value="all">Bütçe Aralığı: Tümü</option>
              <option value="0-10m">0 - 10.000.000 ₺</option>
              <option value="10-30m">10.000.000 - 30.000.000 ₺</option>
              <option value="30m+">30.000.000 ₺ ve Üzeri (VIP)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Region Dropdown */}
          <div className="relative">
            <select
              value={regionFilter}
              onChange={(e) => onRegionFilterChange(e.target.value)}
              className="h-9 px-3 pr-8 bg-surface hover:bg-surface-container rounded-lg font-label-sm text-label-sm text-on-surface cursor-pointer focus:outline-none appearance-none transition-colors border border-surface-container"
            >
              <option value="all">Tüm Bölgeler</option>
              <option value="Kadıköy">Kadıköy / Moda / Suadiye</option>
              <option value="Levent">Beşiktaş / Levent / Bebek</option>
              <option value="Beykoz">Beykoz / Konaklar</option>
              <option value="Ataşehir">Ataşehir / Finans</option>
              <option value="Şile">Şile / Sahilköy</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={onResetFilters}
            className="h-9 px-3 rounded-lg text-secondary hover:bg-surface-container font-label-sm text-label-sm font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">
              filter_alt_off
            </span>
            <span>Filtreleri Temizle</span>
          </button>
        </div>

        {/* Right: Bulk Action Tools */}
        <div className="flex items-center gap-2">
          <span className="font-caption text-caption text-on-surface-variant font-medium">
            {selectedCount} Seçili
          </span>
          <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-surface-container">
            <button
              onClick={onBulkSms}
              disabled={selectedCount === 0}
              className="h-8 px-2.5 rounded-md hover:bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center gap-1 disabled:opacity-40 transition-colors cursor-pointer"
              title="Toplu Mesaj / SMS"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">
                sms
              </span>
              <span className="hidden sm:inline">SMS Gönder</span>
            </button>
            <button
              onClick={onBulkAdvisorChange}
              disabled={selectedCount === 0}
              className="h-8 px-2.5 rounded-md hover:bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center gap-1 disabled:opacity-40 transition-colors cursor-pointer"
              title="Danışman Ata"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">
                swap_horiz
              </span>
              <span className="hidden sm:inline">Danışman Değiştir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CustomerFilters);

