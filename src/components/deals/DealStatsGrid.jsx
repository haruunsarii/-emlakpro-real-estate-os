import React from 'react';

export default function DealStatsGrid({
  stats = {
    totalVolume: 184200000,
    activeCount: 38,
    totalCommission: 5420000,
    wonCount: 14,
    wonVolume: 46800000,
    wonRate: 72,
    criticalCount: 6,
  },
  onStatClick,
  activeFilterKey = null,
}) {
  const formatTL = (num) => {
    return '₺' + Number(num || 0).toLocaleString('tr-TR');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
      {/* KPI 1: Toplam Açık Fırsat Hacmi */}
      <div
        onClick={() => onStatClick && onStatClick('active')}
        className={`p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all cursor-pointer border ${
          activeFilterKey === 'active'
            ? 'ring-2 ring-primary border-primary'
            : 'border-surface-container'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-caption text-caption uppercase text-on-surface-variant tracking-wider font-semibold">
              Toplam Açık Fırsat Hacmi
            </span>
            <div className="mt-space-xs flex items-baseline gap-space-xs">
              <span className="font-currency-stat text-currency-stat text-primary tracking-tight font-bold">
                {formatTL(stats.totalVolume)}
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[20px]">account_balance</span>
          </div>
        </div>
        <div className="mt-space-md flex items-center justify-between pt-space-sm bg-surface-container-low/50 -mx-space-lg -mb-space-lg px-space-lg py-2">
          <span className="font-body-sm text-body-sm text-on-surface font-semibold">
            {stats.activeCount} Aktif Fırsat
          </span>
          <span className="inline-flex items-center gap-1 font-caption text-caption text-secondary font-semibold">
            <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +%14 bu ay
          </span>
        </div>
      </div>

      {/* KPI 2: Tahmini Komisyon Geliri */}
      <div
        onClick={() => onStatClick && onStatClick('commission')}
        className={`p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all cursor-pointer border ${
          activeFilterKey === 'commission'
            ? 'ring-2 ring-secondary border-secondary'
            : 'border-surface-container'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-caption text-caption uppercase text-on-surface-variant tracking-wider font-semibold">
              Tahmini Komisyon Geliri
            </span>
            <div className="mt-space-xs flex items-baseline gap-space-xs">
              <span className="font-currency-stat text-currency-stat text-primary tracking-tight font-bold">
                {formatTL(stats.totalCommission)}
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[20px]">paid</span>
          </div>
        </div>
        <div className="mt-space-md flex items-center justify-between pt-space-sm bg-surface-container-low/50 -mx-space-lg -mb-space-lg px-space-lg py-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
            %2.0 - %4.0 ortalama komisyon
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full font-caption text-[10px] bg-secondary-fixed text-on-secondary-fixed font-bold">
            POTANSİYEL
          </span>
        </div>
      </div>

      {/* KPI 3: Kazanılan Anlaşmalar */}
      <div
        onClick={() => onStatClick && onStatClick('won')}
        className={`p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all cursor-pointer border ${
          activeFilterKey === 'won'
            ? 'ring-2 ring-emerald-500 border-emerald-500'
            : 'border-surface-container'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-caption text-caption uppercase text-on-surface-variant tracking-wider font-semibold">
              Kazanılan Anlaşmalar (Bu Ay)
            </span>
            <div className="mt-space-xs flex items-baseline gap-1.5 flex-wrap">
              <span className="font-currency-stat text-currency-stat text-primary tracking-tight font-bold">
                {stats.wonCount} İşlem
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                / {formatTL(stats.wonVolume)} hacim
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[20px]">verified</span>
          </div>
        </div>
        <div className="mt-space-md flex items-center justify-between pt-space-sm bg-surface-container-low/50 -mx-space-lg -mb-space-lg px-space-lg py-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
            Kapanış Oranı
          </span>
          <span className="inline-flex items-center gap-1 font-caption text-caption text-secondary font-bold">
            <span className="w-2 h-2 rounded-full bg-secondary-container" /> %{stats.wonRate} Başarı
          </span>
        </div>
      </div>

      {/* KPI 4: Kritik / İlgi Bekleyen */}
      <div
        onClick={() => onStatClick && onStatClick('critical')}
        className={`p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all cursor-pointer border ${
          activeFilterKey === 'critical'
            ? 'ring-2 ring-error border-error'
            : 'border-surface-container'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-caption text-caption uppercase text-error tracking-wider font-semibold">
              Kritik / İlgi Bekleyen
            </span>
            <div className="mt-space-xs flex items-baseline gap-space-xs">
              <span className="font-currency-stat text-currency-stat text-error tracking-tight font-bold">
                {stats.criticalCount} Fırsat
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-error-container flex items-center justify-center text-error group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[20px]">notification_important</span>
          </div>
        </div>
        <div className="mt-space-md flex items-center justify-between pt-space-sm bg-error-container/30 -mx-space-lg -mb-space-lg px-space-lg py-2">
          <span className="font-caption text-caption text-on-error-container font-medium truncate">
            &gt; 3 gündür aktivite yok
          </span>
          <span className="font-label-sm text-[11px] text-error font-bold group-hover:underline flex items-center gap-0.5">
            <span>Filtrele</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </div>
  );
}

