import React, { useMemo } from 'react';

/**
 * ConsultantStatsGrid Component
 * Displays key personnel metrics and live portfolio/deal performance allocations.
 */
export default function ConsultantStatsGrid({
  users = [],
  properties = [],
  deals = [],
  activeFilter = 'all',
  onFilterChange,
}) {
  const stats = useMemo(() => {
    const totalPersonnel = users.length;
    let activeConsultants = 0;
    let passivePersonnel = 0;
    let managementCount = 0;

    users.forEach((u) => {
      if (u.status === 'Aktif') activeConsultants++;
      else if (u.status === 'Pasif') passivePersonnel++;

      const role = (u.role || '').toLowerCase();
      if (role === 'yönetici' || role === 'admin' || role === 'ofis müdürü') {
        managementCount++;
      }
    });

    // Count assigned properties (non-empty advisor)
    const assignedPropertiesCount = properties.filter((p) => {
      const adv = typeof p.advisor === 'string' ? p.advisor : p.advisor?.name;
      return Boolean(adv && adv.trim().length > 0);
    }).length;

    // Count closed deals (completed / won stages)
    const closedDealsCount = deals.filter((d) => {
      const stage = (d.stage || d.status || '').toLowerCase();
      return (
        stage === 'tamamlandi' ||
        stage === 'tapu_devir' ||
        stage === 'sozlesme_imza' ||
        stage === 'kazanildi'
      );
    }).length;

    return [
      {
        id: 'all',
        title: 'Toplam Personel',
        value: totalPersonnel,
        unit: 'Kişi',
        subtext: managementCount > 0 ? `${managementCount} Yönetim / Broker` : 'Kayıtlı personel',
        subtextColor: 'text-primary font-medium',
        icon: 'badge',
        iconBg: 'bg-primary/10 text-primary',
        isClickable: true,
      },
      {
        id: 'Aktif',
        title: 'Aktif Danışmanlar',
        value: activeConsultants,
        unit: 'Danışman',
        subtext:
          passivePersonnel > 0
            ? `${activeConsultants} aktif, ${passivePersonnel} pasif personel`
            : totalPersonnel > 0
            ? `%${Math.round((activeConsultants / totalPersonnel) * 100)} sahada aktif`
            : 'Aktif danışman yok',
        subtextColor: 'text-emerald-700 font-medium',
        icon: 'verified_user',
        iconBg: 'bg-emerald-50 text-emerald-600',
        isClickable: true,
      },
      {
        id: 'assigned_props',
        title: 'Atanmış Portföy',
        value: assignedPropertiesCount,
        unit: 'İlan',
        subtext: properties.length > 0 ? `Toplam ${properties.length} ilandan` : 'Canlı portföy atanmadı',
        subtextColor: 'text-secondary font-medium',
        icon: 'apartment',
        iconBg: 'bg-secondary/10 text-secondary',
        isClickable: false,
      },
      {
        id: 'closed_deals',
        title: 'Kapatılan İşlemler',
        value: closedDealsCount,
        unit: 'İşlem',
        subtext: deals.length > 0 ? `Toplam ${deals.length} fırsat havuzunda` : 'Tamamlanan işlem yok',
        subtextColor: 'text-indigo-700 font-medium',
        icon: 'handshake',
        iconBg: 'bg-indigo-50 text-indigo-600',
        isClickable: false,
      },
    ];
  }, [users, properties, deals]);

  return (
    <div data-testid="consultant-kpi-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-space-md">
      {stats.map((stat) => {
        const isSelected = stat.isClickable && activeFilter === stat.id;
        return (
          <div
            key={stat.id}
            onClick={() => {
              if (stat.isClickable && onFilterChange) {
                onFilterChange(activeFilter === stat.id ? 'all' : stat.id);
              }
            }}
            className={`p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border transition-all shadow-xs flex flex-col justify-between ${
              isSelected
                ? 'border-secondary ring-2 ring-secondary/20 shadow-md'
                : 'border-surface-container-low hover:border-surface-container-high'
            } ${stat.isClickable ? 'cursor-pointer hover:shadow-sm' : ''}`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-label-sm text-caption sm:text-label-sm text-on-surface-variant font-medium truncate">
                {stat.title}
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                <span className="material-symbols-outlined text-[18px]">{stat.icon}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-headline-md text-2xl sm:text-3xl text-on-surface font-extrabold tracking-tight">
                {stat.value}
              </span>
              {stat.unit && (
                <span className="font-caption text-caption text-on-surface-variant font-normal">
                  {stat.unit}
                </span>
              )}
            </div>

            <div className={`font-caption text-[11px] sm:text-xs truncate ${stat.subtextColor}`}>
              {stat.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
