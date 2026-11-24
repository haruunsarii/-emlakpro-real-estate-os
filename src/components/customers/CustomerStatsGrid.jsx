import React, { useMemo, memo } from 'react';

function CustomerStatsGrid({ activeStat, onSelectRole, customers = [] }) {
  const dynamicStats = useMemo(() => {
    const total = customers.length;
    let buyers = 0;
    let sellers = 0;
    let renters = 0;
    let hotLeads = 0;

    for (let i = 0; i < customers.length; i++) {
      const c = customers[i];
      const role = c.role || '';
      const status = c.status || '';
      const priority = c.priority || '';

      if (role === 'Alıcı') buyers++;
      else if (role === 'Satıcı' || role === 'Mülk Sahibi') sellers++;
      else if (role === 'Kiracı') renters++;

      if (status === 'Sıcak Aday' || priority === 'Yüksek' || c.isHot) hotLeads++;
    }

    const buyerPct = total > 0 ? Math.round((buyers / total) * 100) : 0;
    const sellerPct = total > 0 ? Math.round((sellers / total) * 100) : 0;
    const renterPct = total > 0 ? Math.round((renters / total) * 100) : 0;

    return [
      {
        id: 'buyers',
        title: 'Alıcı Adayları',
        count: buyers,
        unit: 'Kişi',
        subtext: total > 0 ? `Portföyün %${buyerPct}'si` : 'Henüz alıcı adayı yok',
        subtextColor: 'text-secondary',
        icon: 'shopping_bag',
        iconBg: 'bg-surface-container text-secondary',
      },
      {
        id: 'sellers',
        title: 'Mülk Sahipleri / Satıcılar',
        count: sellers,
        unit: 'Kişi',
        subtext: total > 0 ? `Portföyün %${sellerPct}'si` : 'Henüz mülk sahibi yok',
        subtextColor: 'text-on-surface-variant',
        icon: 'real_estate_agent',
        iconBg: 'bg-surface-container-high text-primary',
      },
      {
        id: 'renters',
        title: 'Kiracı Portföyü',
        count: renters,
        unit: 'Kişi',
        subtext: total > 0 ? `Portföyün %${renterPct}'si` : 'Henüz kiracı adayı yok',
        subtextColor: 'text-on-surface-variant',
        icon: 'key',
        iconBg: 'bg-surface-container text-on-surface-variant',
      },
      {
        id: 'hot_leads',
        title: 'Sıcak Takip / Öncelikli',
        count: hotLeads,
        unit: 'Müşteri',
        subtext: hotLeads > 0 ? 'Acil aksiyon bekleyen' : 'Aktif sıcak takip yok',
        subtextColor: hotLeads > 0 ? 'text-error' : 'text-on-surface-variant',
        icon: 'local_fire_department',
        iconBg: 'bg-error-container text-on-error-container',
        hasDot: hotLeads > 0,
      },
    ];
  }, [customers]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
      {dynamicStats.map((item) => {
        const isSelected = activeStat === item.id;

        return (
          <div
            key={item.id}
            onClick={() => onSelectRole && onSelectRole(item.id)}
            className={`p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex items-center justify-between border transition-all cursor-pointer hover:shadow-md ${
              isSelected
                ? 'border-secondary ring-1 ring-secondary'
                : 'border-surface-container-low'
            }`}
          >
            <div className="flex flex-col">
              <span className="font-caption text-caption uppercase text-on-surface-variant tracking-wider font-semibold text-[11px]">
                {item.title}
              </span>
              <div className="flex items-baseline gap-space-xs mt-1">
                <span className="font-currency-stat text-currency-stat text-primary font-bold">
                  {item.count}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {item.unit}
                </span>
              </div>
              <span
                className={`font-caption text-caption ${item.subtextColor} font-medium mt-1 flex items-center gap-1`}
              >
                {item.hasDot && (
                  <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
                )}
                {item.subtext}
              </span>
            </div>

            <div
              className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {item.icon}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(CustomerStatsGrid);
