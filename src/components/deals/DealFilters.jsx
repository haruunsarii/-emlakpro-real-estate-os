import React from 'react';

export default function DealFilters({
  activePipelineTab = 'all',
  onPipelineTabChange,
  searchQuery,
  onSearchChange,
  advisorFilter,
  onAdvisorChange,
  propertyTypeFilter,
  onPropertyTypeChange,
  priorityFilter,
  onPriorityChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  counts = { all: 38, sale: 24, rent: 14 },
}) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">
      {/* Left side: Pipeline Tabs */}
      <div className="flex items-center gap-space-xs overflow-x-auto pb-1 xl:pb-0">
        {/* All */}
        <button
          onClick={() => onPipelineTabChange('all')}
          className={`inline-flex items-center gap-2 px-space-md py-2 rounded-lg font-label-md text-label-md font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activePipelineTab === 'all'
              ? 'bg-primary-container text-on-primary shadow-xs'
              : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
          }`}
          type="button"
        >
          <span>Tümü</span>
          <span
            className={`px-1.5 py-0.5 rounded-full font-caption text-caption ${
              activePipelineTab === 'all'
                ? 'bg-secondary-container text-white'
                : 'bg-surface-container-highest text-on-surface-variant'
            }`}
          >
            {counts.all}
          </span>
        </button>

        {/* Satış Pipeline */}
        <button
          onClick={() => onPipelineTabChange('Satılık')}
          className={`inline-flex items-center gap-2 px-space-md py-2 rounded-lg font-label-md text-label-md font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activePipelineTab === 'Satılık'
              ? 'bg-primary-container text-on-primary shadow-xs'
              : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
          }`}
          type="button"
        >
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span>Satış Pipeline</span>
          <span
            className={`px-1.5 py-0.5 rounded-full font-caption text-caption ${
              activePipelineTab === 'Satılık'
                ? 'bg-secondary-container text-white'
                : 'bg-surface-container-highest text-on-surface-variant'
            }`}
          >
            {counts.sale}
          </span>
        </button>

        {/* Kiralama Pipeline */}
        <button
          onClick={() => onPipelineTabChange('Kiralık')}
          className={`inline-flex items-center gap-2 px-space-md py-2 rounded-lg font-label-md text-label-md font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activePipelineTab === 'Kiralık'
              ? 'bg-primary-container text-on-primary shadow-xs'
              : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
          }`}
          type="button"
        >
          <span className="w-2 h-2 rounded-full bg-tertiary-container" />
          <span>Kiralama Pipeline</span>
          <span
            className={`px-1.5 py-0.5 rounded-full font-caption text-caption ${
              activePipelineTab === 'Kiralık'
                ? 'bg-secondary-container text-white'
                : 'bg-surface-container-highest text-on-surface-variant'
            }`}
          >
            {counts.rent}
          </span>
        </button>
      </div>

      {/* Right side: Filters & Search */}
      <div className="flex items-center gap-space-sm flex-wrap xl:flex-nowrap">
        {/* Search */}
        <div className="relative min-w-[220px] flex-1 sm:flex-initial">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-9 pr-8 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container transition-all border border-transparent focus:border-secondary"
            placeholder="Fırsat, müşteri veya portföy ara..."
            type="text"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
            </button>
          )}
        </div>

        {/* Advisor Filter */}
        <div className="relative">
          <select
            value={advisorFilter}
            onChange={(e) => onAdvisorChange(e.target.value)}
            className="h-10 pl-3 pr-8 rounded-lg bg-surface-container-low font-label-sm text-label-sm text-on-surface appearance-none focus:outline-none focus:bg-surface-container transition-all cursor-pointer border border-transparent focus:border-secondary"
          >
            <option value="all">Tüm Danışmanlar</option>
            <option value="Burak Yılmaz">Burak Yılmaz (Kıdemli)</option>
            <option value="Elif Demir">Elif Demir</option>
            <option value="Mert Can">Mert Can</option>
            <option value="Caner Aydın">Caner Aydın</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-on-surface-variant text-[18px] pointer-events-none">
            expand_more
          </span>
        </div>

        {/* Property Type Filter */}
        <div className="relative">
          <select
            value={propertyTypeFilter}
            onChange={(e) => onPropertyTypeChange(e.target.value)}
            className="h-10 pl-3 pr-8 rounded-lg bg-surface-container-low font-label-sm text-label-sm text-on-surface appearance-none focus:outline-none focus:bg-surface-container transition-all cursor-pointer border border-transparent focus:border-secondary"
          >
            <option value="all">Mülk Tipi: Tümü</option>
            <option value="Daire">Daire / Rezidans</option>
            <option value="Villa">Villa / Müstakil</option>
            <option value="Ticari">Ticari / Ofis</option>
            <option value="Arsa">Arsa / Arazi</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-on-surface-variant text-[18px] pointer-events-none">
            expand_more
          </span>
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="h-10 pl-3 pr-8 rounded-lg bg-surface-container-low font-label-sm text-label-sm text-on-surface appearance-none focus:outline-none focus:bg-surface-container transition-all cursor-pointer border border-transparent focus:border-secondary"
          >
            <option value="all">Öncelik: Tümü</option>
            <option value="Kritik">Kritik (Acil Takip)</option>
            <option value="Yüksek">Yüksek Öncelik</option>
            <option value="Normal">Normal Öncelik</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-on-surface-variant text-[18px] pointer-events-none">
            flag
          </span>
        </div>

        {/* Sort Option */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="h-10 pl-3 pr-8 rounded-lg bg-surface-container-low font-label-sm text-label-sm text-on-surface appearance-none focus:outline-none focus:bg-surface-container transition-all cursor-pointer border border-transparent focus:border-secondary"
          >
            <option value="amount-desc">Sırala: En Yüksek Tutar</option>
            <option value="amount-asc">Sırala: En Düşük Tutar</option>
            <option value="activity">Sırala: Son Aktivite</option>
            <option value="date">Sırala: Takip Tarihi</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-on-surface-variant text-[18px] pointer-events-none">
            swap_vert
          </span>
        </div>

        {/* Reset Filter Button */}
        <button
          onClick={onResetFilters}
          className="p-2 h-10 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer shrink-0"
          title="Filtreleri Temizle"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">restart_alt</span>
        </button>
      </div>
    </div>
  );
}

