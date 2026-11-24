import React, { memo, useMemo } from 'react';

function ReportKpiSummary({ kpiData, activeKpiId = null, onCardClick = null }) {
  const cards = useMemo(() => {
    if (!kpiData) return [];
    return [
      kpiData.salesVolume,
      kpiData.rentalVolume,
      kpiData.wonDealsCount,
      kpiData.commissionRevenue,
      kpiData.conversionRate,
    ].filter(Boolean);
  }, [kpiData]);

  if (!kpiData) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-space-md">
      {cards.map((card) => {
        const isPositive = card.isPositive ?? true;
        const isSelected = activeKpiId && (card.id === activeKpiId || card.title === activeKpiId);

        return (
          <div
            key={card.id || card.title}
            onClick={() => onCardClick?.(card)}
            className={`bg-surface-container-lowest rounded-2xl p-space-md border shadow-xs flex flex-col justify-between hover:shadow-md transition-all group ${
              onCardClick ? 'cursor-pointer' : ''
            } ${
              isSelected
                ? 'border-secondary ring-2 ring-secondary/40 shadow-md'
                : 'border-surface-container'
            }`}
          >
            {/* Üst Kısım: Başlık, İkon ve Trend */}
            <div>
              <div className="flex items-start justify-between gap-space-xs">
                <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold line-clamp-1">
                  {card.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${card.bgLight || 'bg-surface-container'
                    }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${card.color || 'text-primary'
                      }`}
                  >
                    {card.icon || 'analytics'}
                  </span>
                </div>
              </div>

              {/* Büyük Sayısal Değer */}
              <div className="mt-2">
                <h3 className="font-headline-md text-headline-md text-primary font-bold tracking-tight">
                  {card.value}
                </h3>
              </div>
            </div>

            {/* Alt Kısım: Trend Göstergesi & Açıklama */}
            <div className="mt-space-sm pt-space-xs border-t border-surface-container/60 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-caption text-[11px] font-bold ${isPositive
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-rose-50 text-rose-800'
                    }`}
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {isPositive ? 'trending_up' : 'trending_down'}
                  </span>
                  <span>{card.change}</span>
                </span>
                <span className="text-[11px] text-on-surface-variant font-caption truncate">
                  önceki döneme göre
                </span>
              </div>

              {/* Opsiyonel Hedef Barı (Komisyon Kartı İçin) */}
              {card.targetPercent !== undefined && (
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-secondary transition-all duration-700 rounded-full"
                    style={{ width: `${Math.min(100, card.targetPercent)}%` }}
                  />
                </div>
              )}

              <p className="font-caption text-[11px] text-outline line-clamp-1 mt-0.5">
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(ReportKpiSummary);


