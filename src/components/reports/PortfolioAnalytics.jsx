import React, { memo } from 'react';
import { PORTFOLIO_ANALYTICS } from '../../services/reportsData';

function PortfolioAnalytics({ data = PORTFOLIO_ANALYTICS }) {
  if (!data?.hasProperties || data?.statusCounts?.total === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-surface-container shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-space-md border-b border-surface-container/60">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-secondary text-[24px]">pie_chart</span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                Portföy Analitiği
              </h3>
              <p className="font-caption text-caption text-on-surface-variant">
                Mülk türü kırılımı, satılık/kiralık oranı ve ortalama liste fiyatları
              </p>
            </div>
          </div>
          <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold">
            0 İlan
          </span>
        </div>

        <div className="py-12 px-4 text-center text-xs text-on-surface-variant flex flex-col items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[32px] text-outline">apartment</span>
          <span className="font-semibold text-primary">Henüz Portföy Verisi Yok</span>
          <p className="max-w-xs text-outline leading-relaxed">
            Gayrimenkul portföyleri sisteme eklendikçe mülk kategorisi ve fiyat dağılımları burada analiz edilecektir.
          </p>
        </div>
      </div>
    );
  }

  const {
    distributionByType,
    forSaleForRent,
    statusCounts,
    avgListingPrice,
    inventoryAgeDays,
  } = data;

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-surface-container shadow-xs flex flex-col justify-between">
      {/* Başlık */}
      <div className="flex items-center justify-between pb-space-md border-b border-surface-container/60">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-secondary text-[24px]">pie_chart</span>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
              Portföy Analitiği
            </h3>
            <p className="font-caption text-caption text-on-surface-variant">
              Mülk türü kırılımı, satılık/kiralık oranı, aktif envanter ve ortalama liste fiyatları
            </p>
          </div>
        </div>
        <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-bold">
          {statusCounts.total} Toplam İlan
        </span>
      </div>

      <div className="flex flex-col gap-space-md pt-space-sm">
        {/* Mülk Tipi Kırılımı & Yatay Çubuklar */}
        <div className="flex flex-col gap-space-sm">
          <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-wider">
            Portföy Kategorisi &amp; Ciro Katkısı
          </span>

          <div className="flex flex-col gap-2">
            {distributionByType.map((item) => (
              <div
                key={item.type}
                className="p-space-xs rounded-xl bg-surface-container-low/50 hover:bg-surface-container-low transition-colors border border-surface-container flex flex-col gap-1"
              >
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-primary">
                    <span className={`w-2.5 h-2.5 rounded-sm ${item.color}`} />
                    <span>{item.type}</span>
                  </div>
                  <div className="flex items-center gap-2 font-caption text-on-surface-variant">
                    <span>{item.dealsCount} İlan</span>
                    <strong className="text-primary font-mono">{item.volume}</strong>
                    <span className="font-bold text-secondary">%{item.percent}</span>
                  </div>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Satılık / Kiralık Oranı Çift Çubuk */}
        <div className="flex flex-col gap-space-xs pt-1 border-t border-surface-container/60">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-secondary">Satılık: {forSaleForRent.forSale.count} İlan ({forSaleForRent.forSale.volume})</span>
            <span className="text-emerald-700">Kiralık: {forSaleForRent.forRent.count} İlan</span>
          </div>
          <div className="w-full bg-surface-container h-2 rounded-full flex overflow-hidden">
            <div
              className="h-full bg-secondary transition-all duration-700"
              style={{ width: `${forSaleForRent.forSale.percent}%` }}
            />
            <div
              className="h-full bg-[#10B981] transition-all duration-700"
              style={{ width: `${forSaleForRent.forRent.percent}%` }}
            />
          </div>
        </div>

        {/* 2 Özet Metrik Kutusu */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-space-xs rounded-xl bg-surface-container-low border border-surface-container flex flex-col">
            <span className="font-caption text-[11px] text-on-surface-variant">Ort. Satılık Fiyatı</span>
            <span className="font-headline-sm text-sm font-bold text-primary mt-0.5 truncate">
              {avgListingPrice.forSale}
            </span>
          </div>
          <div className="p-space-xs rounded-xl bg-surface-container-low border border-surface-container flex flex-col">
            <span className="font-caption text-[11px] text-on-surface-variant">Ort. Kiralık Fiyatı</span>
            <span className="font-headline-sm text-sm font-bold text-emerald-800 mt-0.5 truncate">
              {avgListingPrice.forRent}
            </span>
          </div>
        </div>

        {/* Envanter Yaşı Bilgisi */}
        <div className="p-space-xs rounded-lg bg-surface-container-low flex items-center justify-between text-xs text-on-surface-variant border border-surface-container/60">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-secondary">hourglass_empty</span>
            <span>Ortalama Envanter Süresi:</span>
          </span>
          <span className="font-bold text-primary font-mono">{inventoryAgeDays} Gün</span>
        </div>
      </div>
    </div>
  );
}

export default memo(PortfolioAnalytics);
