import React, { useMemo, memo } from 'react';

function PropertyFilters({
  searchQuery,
  onSearchChange,
  activeSegment,
  onSegmentChange,
  propertyTypeFilter,
  onPropertyTypeChange,
  districtFilter,
  onDistrictChange,
  priceFilter,
  onPriceChange,
  roomFilter,
  onRoomChange,
  advisorFilter,
  onAdvisorChange,
  sortBy,
  onSortChange,
  onResetFilters,
  properties = [],
}) {
  // Single-pass O(N) calculation for segment counts, district counts, and advisor counts
  const { counts, availableDistricts, districtCounts, availableAdvisors, advisorCounts } = useMemo(() => {
    if (!properties || properties.length === 0) {
      return {
        counts: { all: 0, forSale: 0, forRent: 0, exclusive: 0, passive: 0 },
        availableDistricts: [],
        districtCounts: {},
        availableAdvisors: [],
        advisorCounts: {},
      };
    }

    let forSale = 0;
    let forRent = 0;
    let exclusive = 0;
    let passive = 0;
    const distCounts = {};
    const advCounts = {};

    for (let i = 0; i < properties.length; i++) {
      const p = properties[i];
      if (p.type === 'Satılık') forSale++;
      if (p.type === 'Kiralık') forRent++;
      if (p.tags?.includes('Özel Yetkili') || p.isExclusive) exclusive++;
      if (p.status === 'Pasif') passive++;

      if (p.district) {
        distCounts[p.district] = (distCounts[p.district] || 0) + 1;
      }
      const advName = p.advisor?.name;
      if (advName) {
        advCounts[advName] = (advCounts[advName] || 0) + 1;
      }
    }

    const sortedDistricts = Object.keys(distCounts).sort();
    const sortedAdvisors = Object.keys(advCounts).sort();

    return {
      counts: {
        all: properties.length,
        forSale,
        forRent,
        exclusive,
        passive,
      },
      availableDistricts: sortedDistricts,
      districtCounts: distCounts,
      availableAdvisors: sortedAdvisors,
      advisorCounts: advCounts,
    };
  }, [properties]);

  const segmentTabs = [
    { id: 'all', label: `Tümü (${counts.all})` },
    { id: 'Satılık', label: `Satılık (${counts.forSale})` },
    { id: 'Kiralık', label: `Kiralık (${counts.forRent})` },
    { id: 'exclusive', label: `Yetkili Portföy (${counts.exclusive})` },
    { id: 'passive', label: `Pasif / Arşiv (${counts.passive})` },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-md border border-surface-container-low">
      {/* Top Row: Global Search & Quick Status Segments */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xl">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-11 pl-11 pr-14 rounded-lg bg-surface text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-low transition-all border border-transparent focus:border-secondary placeholder:text-outline"
            placeholder="İlan no, başlık, semt, sokak veya ada/parsel ara... (⌘K)"
            type="text"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
            </button>
          ) : (
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 font-caption text-caption bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded pointer-events-none">
              ⌘K
            </kbd>
          )}
        </div>

        {/* Segments Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
          {segmentTabs.map((tab) => {
            const isActive = activeSegment === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSegmentChange(tab.id)}
                className={`px-3.5 py-2 rounded-lg font-label-sm text-label-sm whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                    : 'bg-surface hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-medium'
                }`}
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: Filter Dropdowns & Sorter */}
      <div className="flex items-center justify-between gap-space-sm flex-wrap pt-2 border-t border-surface-container-low">
        <div className="flex items-center gap-space-sm flex-wrap flex-1">
          {/* Filter: Property Type */}
          <div className="relative">
            <select
              value={propertyTypeFilter}
              onChange={(e) => onPropertyTypeChange(e.target.value)}
              className="h-10 pl-3 pr-8 rounded-lg bg-surface hover:bg-surface-container text-on-surface font-body-sm text-body-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-colors border border-surface-container"
            >
              <option value="all">Mülk Tipi: Tümü</option>
              <option value="Daire">Daire</option>
              <option value="Rezidans">Rezidans</option>
              <option value="Villa / Köşk">Villa / Köşk</option>
              <option value="Ticari / Ofis">Ticari / Ofis</option>
              <option value="İmarlı Arsa">İmarlı Arsa</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          {/* Filter: Location (İlçe) */}
          <div className="relative">
            <select
              value={districtFilter}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="h-10 pl-3 pr-8 rounded-lg bg-surface hover:bg-surface-container text-on-surface font-body-sm text-body-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-colors border border-surface-container"
            >
              <option value="all">İlçe: Tümü</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d} ({districtCounts[d] || 0})
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          {/* Filter: Price Range */}
          <div className="relative">
            <select
              value={priceFilter}
              onChange={(e) => onPriceChange(e.target.value)}
              className="h-10 pl-3 pr-8 rounded-lg bg-surface hover:bg-surface-container text-on-surface font-body-sm text-body-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-colors border border-surface-container"
            >
              <option value="all">Fiyat Aralığı (Tümü)</option>
              <option value="0-15m">0 - ₺15.000.000</option>
              <option value="15-30m">₺15.000.000 - ₺30.000.000</option>
              <option value="30-60m">₺30.000.000 - ₺60.000.000</option>
              <option value="60m+">₺60.000.000 ve üzeri</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          {/* Filter: Rooms */}
          <div className="relative">
            <select
              value={roomFilter}
              onChange={(e) => onRoomChange(e.target.value)}
              className="h-10 pl-3 pr-8 rounded-lg bg-surface hover:bg-surface-container text-on-surface font-body-sm text-body-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-colors border border-surface-container"
            >
              <option value="all">Oda Sayısı: Tümü</option>
              <option value="1+1">1+1</option>
              <option value="2+1">2+1</option>
              <option value="3+1">3+1</option>
              <option value="4+1">4+1</option>
              <option value="5+2">5+2 ve üzeri</option>
              <option value="6+2">6+2 ve üzeri</option>
              <option value="Villa İmarlı">Villa İmarlı / Arsa</option>
              <option value="Ofis">Açık Ofis / Ticari</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          {/* Filter: Agent */}
          <div className="relative">
            <select
              value={advisorFilter}
              onChange={(e) => onAdvisorChange(e.target.value)}
              className="h-10 pl-3 pr-8 rounded-lg bg-surface hover:bg-surface-container text-on-surface font-body-sm text-body-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-colors border border-surface-container"
            >
              <option value="all">Sorumlu Danışman: Tümü</option>
              {availableAdvisors.map((adv) => (
                <option key={adv} value={adv}>
                  {adv} ({advisorCounts[adv] || 0})
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={onResetFilters}
            className="text-secondary font-label-sm text-label-sm hover:underline flex items-center gap-1 pl-1 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Filtreleri Temizle</span>
          </button>
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="font-caption text-caption text-on-surface-variant uppercase font-medium">
            Sırala:
          </span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="h-10 pl-3 pr-8 rounded-lg bg-surface text-on-surface font-body-sm text-body-sm font-semibold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/20 border border-surface-container"
            >
              <option value="newest">En Yeni Eklenenler</option>
              <option value="price_desc">Fiyat (Azalan)</option>
              <option value="price_asc">Fiyat (Artan)</option>
              <option value="area_desc">Metrekare (Azalan)</option>
              <option value="matches_desc">Eşleşen Müşteri Sayısı</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
              swap_vert
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(PropertyFilters);
