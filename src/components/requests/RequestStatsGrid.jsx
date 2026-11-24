import React, { useMemo } from 'react';

export default function RequestStatsGrid({
  activeFilter,
  onSelectFilter,
  onStatClick,
  demands = [],
}) {
  const dynamicStats = useMemo(() => {
    let highMatchCount = 0;
    let newLeadsCount = 0;
    let pendingGapCount = 0;

    for (let i = 0; i < demands.length; i++) {
      const d = demands[i];
      if ((d.overallScore || 0) >= 80 || (d.matchedProperties && d.matchedProperties.length > 0)) {
        highMatchCount++;
      }
      if (d.status === 'Yeni' || d.priority === 'urgent') {
        newLeadsCount++;
      }
      if (!d.matchedProperties || d.matchedProperties.length === 0) {
        pendingGapCount++;
      }
    }

    return [
      {
        id: 'total_demands',
        title: 'Toplam Talep Havuzu',
        value: demands.length,
        unit: 'Talep',
        icon: 'contact_page',
        isHighlight: false,
        badge1: demands.length > 0 ? 'Aktif Alıcı/Kiracı' : 'Kayıt Yok',
      },
      {
        id: 'high_match',
        title: 'Yüksek Eşleşme (≥%80)',
        value: highMatchCount,
        unit: 'Talep',
        icon: 'stars',
        isHighlight: true,
        badge1: highMatchCount > 0 ? 'Hazır Sunum' : 'Eşleşme Yok',
      },
      {
        id: 'new_leads',
        title: 'Yeni & Acil Talepler',
        value: newLeadsCount,
        unit: 'Yeni',
        icon: 'bolt',
        isHighlight: false,
        badge1: newLeadsCount > 0 ? 'İşlem Bekliyor' : 'Kayıt Yok',
      },
      {
        id: 'pending_gap',
        title: 'Portföy Açığı (Eşleşmesiz)',
        value: pendingGapCount,
        unit: 'Talep',
        icon: 'warning',
        isHighlight: false,
        badge1: pendingGapCount > 0 ? 'Yeni İlan Arayışı' : 'Kayıt Yok',
      },
    ];
  }, [demands]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
      {dynamicStats.map((item) => {
        let isSelected = false;
        if (item.id === 'total_demands' && activeFilter === 'all') isSelected = true;
        if (item.id === 'high_match' && activeFilter === 'high_match') isSelected = true;
        if (item.id === 'new_leads' && activeFilter === 'new') isSelected = true;
        if (item.id === 'pending_gap' && activeFilter === 'pending_gap') isSelected = true;

        return (
          <div
            key={item.id}
            onClick={() => {
              if (onStatClick) {
                onStatClick(item.id);
              } else if (onSelectFilter) {
                if (item.id === 'total_demands') onSelectFilter('all');
                else if (item.id === 'high_match') onSelectFilter(activeFilter === 'high_match' ? 'all' : 'high_match');
                else if (item.id === 'new_leads') onSelectFilter(activeFilter === 'new' ? 'all' : 'new');
                else if (item.id === 'pending_gap') onSelectFilter(activeFilter === 'pending_gap' ? 'all' : 'pending_gap');
              }
            }}
            className={`p-space-lg bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group cursor-pointer border transition-all duration-200 hover:shadow-md ${
              isSelected
                ? 'border-secondary ring-1 ring-secondary'
                : 'border-surface-container-low'
            }`}
          >
            {/* Background Blur Glow */}
            <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            <div className="flex items-center justify-between mb-space-sm z-10">
              <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider text-[11px] font-semibold">
                {item.title}
              </span>
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  item.isHighlight
                    ? 'bg-secondary-fixed/50 text-secondary'
                    : 'bg-surface-container text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {item.icon}
                </span>
              </span>
            </div>

            <div className="z-10">
              <div className="flex items-baseline gap-2">
                <span
                  className={`font-currency-stat text-currency-stat font-bold ${
                    item.isHighlight ? 'text-secondary' : 'text-on-surface'
                  }`}
                >
                  {item.value}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {item.unit}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {item.badge1 && (
                  <span className="font-caption text-caption bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-medium">
                    {item.badge1}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
