import React from 'react';
import EmptyState from '../ui/EmptyState';

export default function RequestCardList({
  demands,
  selectedDemandId,
  onSelectDemand,
  onEditDemand,
  onDeleteDemand,
  onSortToggle,
  onResetFilters,
  onAddNewRequest,
  isFiltered = false,
}) {
  return (
    <div className="flex flex-col gap-space-sm">
      {/* Header Info */}
      <div className="flex items-center justify-between px-space-xs mb-1">
        <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
          <span>Müşteri Talep Akışı</span>
          <span className="font-caption text-caption text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full font-medium">
            {demands.length} Gösteriliyor
          </span>
        </span>

        <button
          onClick={onSortToggle}
          className="font-caption text-caption text-secondary cursor-pointer hover:underline flex items-center gap-0.5 font-semibold"
          type="button"
        >
          <span>Skora Göre Sırala</span>
          <span className="material-symbols-outlined text-[14px]">sort</span>
        </button>
      </div>

      {/* Cards List */}
      {demands.length === 0 ? (
        <EmptyState
          type={isFiltered ? 'filter' : 'empty'}
          icon={isFiltered ? 'filter_alt_off' : 'format_list_bulleted'}
          title={
            isFiltered
              ? 'Kriterlere Uygun Müşteri Talebi Bulunamadı'
              : 'Henüz Müşteri Talebi Eklenmemiş'
          }
          description={
            isFiltered
              ? 'Uygulanan arama veya filtre kriterlerine uyan müşteri talebi bulunamadı. Filtreleri sıfırlayabilirsiniz.'
              : 'Sisteme yeni bir talep ekleyerek portföy eşleştirme motorunu çalıştırabilirsiniz.'
          }
          actionLabel={isFiltered ? 'Filtreleri Sıfırla' : 'Yeni Talep Ekle'}
          onAction={isFiltered ? onResetFilters : onAddNewRequest}
        />
      ) : (
        demands.map((demand) => {
          const isSelected = selectedDemandId === demand.id;
          const matchCount = demand.matchedProperties ? demand.matchedProperties.length : 0;
          const hasMatches = demand.overallScore > 0 || matchCount > 0;

          return (
            <div
              key={demand.id}
              onClick={() => onSelectDemand(demand)}
              className={`p-space-md rounded-xl shadow-sm cursor-pointer transition-all duration-200 border relative group ${
                isSelected
                  ? 'ring-2 ring-secondary border-secondary bg-gradient-to-r from-surface-container-lowest to-surface-container-low/30 shadow-md'
                  : hasMatches
                  ? 'bg-surface-container-lowest border-surface-container-low opacity-95 hover:opacity-100 hover:shadow-md'
                  : 'bg-surface-container-lowest border-surface-container-low opacity-75 hover:opacity-100'
              }`}
            >
              {/* Top Row: Code, Category & Score */}
              <div className="flex items-start justify-between gap-space-sm mb-space-xs">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-caption text-caption font-semibold text-secondary bg-surface-container px-2 py-0.5 rounded">
                      {demand.id}
                    </span>
                    <span className="font-caption text-caption text-on-primary bg-primary-container px-2 py-0.5 rounded font-semibold">
                      {demand.category || demand.role || 'Talep'}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1 font-bold group-hover:text-secondary transition-colors">
                    {demand.clientName}
                  </h3>
                </div>

                <div className="flex flex-col items-end">
                  {demand.overallScore > 0 ? (
                    <span className="inline-flex items-center gap-1 font-caption text-caption bg-secondary-fixed/50 text-secondary px-2.5 py-1 rounded-full font-bold shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary-container" />
                      %{demand.overallScore} Uyum
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-caption text-caption bg-surface-container text-outline px-2 py-0.5 rounded-full font-medium">
                      Eşleşme Yok
                    </span>
                  )}
                  <span className="font-caption text-caption text-on-surface-variant mt-1">
                    {demand.date || 'Bugün'}
                  </span>
                </div>
              </div>

              {/* 4-Item Criteria Matrix */}
              <div className="grid grid-cols-2 gap-2 my-space-sm bg-surface p-space-sm rounded-lg text-body-sm font-body-sm border border-surface-container/60">
                <div>
                  <span className="text-on-surface-variant text-[11px] block font-caption font-semibold">
                    ARANAN BÖLGE
                  </span>
                  <span className="text-on-surface font-medium truncate block">
                    {demand.targetRegion || demand.district || 'Belirtilmedi'}
                  </span>
                </div>

                <div>
                  <span className="text-on-surface-variant text-[11px] block font-caption font-semibold">
                    BÜTÇE ARALIĞI
                  </span>
                  <span className="text-secondary font-bold truncate block">
                    {demand.budget || 'Belirtilmedi'}
                  </span>
                </div>

                <div>
                  <span className="text-on-surface-variant text-[11px] block font-caption font-semibold">
                    MÜLK TİPİ
                  </span>
                  <span className="text-on-surface font-medium truncate block">
                    {demand.propertyType || demand.categoryGroup || 'Konut'}
                  </span>
                </div>

                <div>
                  <span className="text-on-surface-variant text-[11px] block font-caption font-semibold">
                    ÖZEL TERCİH
                  </span>
                  <span className="text-on-surface font-medium truncate block">
                    {demand.specialPreference || 'Standart Kriter'}
                  </span>
                </div>
              </div>

              {/* Footer: Advisor & Matched Count & Card Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-surface-container">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary font-caption text-[10px] flex items-center justify-center font-bold">
                    {demand.advisorInitials || 'BY'}
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant">
                    Danışman: {demand.advisor || 'Burak Yılmaz'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Edit button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditDemand(demand);
                    }}
                    className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface transition-colors cursor-pointer"
                    title="Talebi Düzenle"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDemand(demand);
                    }}
                    className="p-1 rounded text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors cursor-pointer"
                    title="Talebi Sil"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>

                  <span
                    className={`font-label-sm text-label-sm font-bold flex items-center gap-0.5 ml-1 ${
                      hasMatches ? 'text-secondary' : 'text-outline font-medium'
                    }`}
                  >
                    <span>
                      {matchCount > 0
                        ? `${matchCount} Portföy Eşleşti`
                        : '0 Portföy (Eşleşme Aranıyor)'}
                    </span>
                    {hasMatches && (
                      <span className="material-symbols-outlined text-[16px]">
                        chevron_right
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

