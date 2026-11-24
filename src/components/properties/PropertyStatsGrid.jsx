import React, { useMemo, memo } from 'react';

function PropertyStatsGrid({ activeSegment, onSelectSegment, properties = [] }) {
  const kpiList = useMemo(() => {
    let forSaleCount = 0;
    let forRentCount = 0;
    let forSaleTotal = 0;
    let forRentTotal = 0;
    let expiringCount = 0;

    for (let i = 0; i < properties.length; i++) {
      const p = properties[i];
      const price = Number(p.price) || 0;
      if (p.type === 'Satılık') {
        forSaleCount++;
        forSaleTotal += price;
      } else if (p.type === 'Kiralık') {
        forRentCount++;
        forRentTotal += price;
      }

      if ((p.contract?.daysLeft || 100) <= 80) {
        expiringCount++;
      }
    }

    const formatShortM = (num) => {
      const m = num / 1000000;
      return `₺${m.toLocaleString('tr-TR', { maximumFractionDigits: 1 })}M`;
    };

    return [
      {
        id: 'total_value',
        title: 'Toplam Portföy Değeri',
        value: `₺${forSaleTotal.toLocaleString('tr-TR')}`,
        trend: properties.length > 0 ? '+12.4%' : '0%',
        subtitle: `${properties.length} İlan hacmi`,
        icon: 'apartment',
        iconColor: 'text-primary',
      },
      {
        id: 'for_sale',
        title: 'Satılık İlanlar',
        value: `${forSaleCount} İlan`,
        highlight: formatShortM(forSaleTotal),
        subtitle: forSaleCount > 0 ? '• Ort. 24 günde satış' : '• Aktif satılık yok',
        icon: 'sell',
        iconColor: 'text-secondary',
      },
      {
        id: 'for_rent',
        title: 'Kiralık İlanlar',
        value: `${forRentCount} İlan`,
        highlight: `₺${forRentTotal.toLocaleString('tr-TR')} / ay`,
        subtitle: forRentCount > 0 ? '• %100 doluluk' : '• Aktif kiralık yok',
        icon: 'key',
        iconColor: 'text-secondary',
      },
      {
        id: 'expiring_contracts',
        title: 'Yetki Sözleşmesi Biten',
        value: `${expiringCount} Sözleşme`,
        subtitle: expiringCount > 0 ? 'Yenileme takip sürecinde' : 'Takip kaydı yok',
        icon: 'schedule',
        iconColor: 'text-error',
        isWarning: expiringCount > 0,
      },
    ];
  }, [properties]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
      {kpiList.map((item) => {
        let isSelected = false;
        if (item.id === 'total_value' && activeSegment === 'all') isSelected = true;
        if (item.id === 'for_sale' && activeSegment === 'Satılık') isSelected = true;
        if (item.id === 'for_rent' && activeSegment === 'Kiralık') isSelected = true;
        if (item.id === 'expiring_contracts' && activeSegment === 'expiring') isSelected = true;

        return (
          <div
            key={item.id}
            onClick={() => {
              if (item.id === 'total_value') onSelectSegment('all');
              else if (item.id === 'for_sale') onSelectSegment(activeSegment === 'Satılık' ? 'all' : 'Satılık');
              else if (item.id === 'for_rent') onSelectSegment(activeSegment === 'Kiralık' ? 'all' : 'Kiralık');
              else if (item.id === 'expiring_contracts') onSelectSegment(activeSegment === 'expiring' ? 'all' : 'expiring');
            }}
            className={`p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-all cursor-pointer border ${
              isSelected
                ? 'border-secondary ring-1 ring-secondary'
                : 'border-surface-container-low'
            }`}
          >
            <div className="flex items-start justify-between">
              <span className="font-caption text-caption uppercase text-on-surface-variant tracking-wider font-semibold text-[11px]">
                {item.title}
              </span>
              <div
                className={`w-9 h-9 rounded-lg ${
                  item.isWarning ? 'bg-error-container text-on-error-container' : 'bg-surface-container'
                } flex items-center justify-center ${item.iconColor}`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </div>
            </div>

            <div className="mt-3">
              <div className="font-currency-stat text-currency-stat text-primary font-bold leading-tight">
                {item.value}
              </div>

              <div className="flex items-center gap-2 mt-2 font-body-sm text-body-sm text-on-surface-variant flex-wrap">
                {item.trend && (
                  <span className="inline-flex items-center font-label-sm text-label-sm text-secondary bg-surface-container px-2 py-0.5 rounded-full font-semibold">
                    <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>
                    {item.trend}
                  </span>
                )}
                {item.highlight && (
                  <span
                    className={`font-label-sm text-label-sm font-semibold ${
                      item.id === 'for_rent' ? 'text-secondary' : 'text-primary'
                    }`}
                  >
                    {item.highlight}
                  </span>
                )}
                {item.subtitle && (
                  <span className={item.isWarning ? 'text-error font-medium flex items-center gap-1.5' : ''}>
                    {item.isWarning && <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />}
                    {item.subtitle}
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

export default memo(PropertyStatsGrid);
