import React, { memo } from 'react';
import { SALES_RENTAL_COMPARISON } from '../../services/reportsData';

function SalesRentalComparison({ data = SALES_RENTAL_COMPARISON }) {
  const { sales, rental } = data;

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-surface-container shadow-xs flex flex-col justify-between">
      {/* Başlık */}
      <div className="flex items-center justify-between pb-space-md border-b border-surface-container/60">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-secondary text-[22px]">compare_arrows</span>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
              Satış &amp; Kiralama Analizi
            </h3>
            <p className="font-caption text-caption text-on-surface-variant">
              İki temel gelir modelinin işlem hacmi, birim kârlılığı ve komisyon mukayesesi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-bold">
            Satış %{sales.sharePercent ?? 0}
          </span>
          <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold">
            Kiralama %{rental.sharePercent ?? 0}
          </span>
        </div>
      </div>

      {/* Oransal Hacim Karşılaştırma Çubuğu */}
      <div className="py-space-sm flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-secondary flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            Satış: {sales.totalVolume} ({sales.dealsCount} İşlem)
          </span>
          <span className="text-emerald-700 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            Kiralama: {rental.totalVolume} ({rental.dealsCount} İşlem)
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-surface-container flex overflow-hidden">
          <div
            className="h-full bg-secondary transition-all duration-700"
            style={{ width: `${sales.sharePercent}%` }}
            title={`Satış Payı: %${sales.sharePercent}`}
          />
          <div
            className="h-full bg-[#10B981] transition-all duration-700"
            style={{ width: `${rental.sharePercent}%` }}
            title={`Kiralama Payı: %${rental.sharePercent}`}
          />
        </div>
      </div>

      {/* Karşılaştırmalı 4 İstatistik Kartı */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-2">
        {/* Sol Kolon: Satış Metrikleri */}
        <div className="p-space-md rounded-xl bg-blue-50/50 border border-blue-200/60 flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-blue-700">sell</span>
              Satış İşlemleri
            </span>
            <span className="font-caption text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              {sales.growthRate} Büyüme
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex flex-col">
              <span className="font-caption text-[11px] text-blue-950 font-medium">Toplam Hacim</span>
              <span className="font-label-md text-base font-extrabold text-blue-950 mt-0.5">
                {sales.totalVolume}
              </span>
              <span className="font-caption text-[10px] text-blue-800">{sales.dealsCount} Tamamlanan Satış</span>
            </div>

            <div className="flex flex-col">
              <span className="font-caption text-[11px] text-blue-950 font-medium">Ort. İşlem Değeri</span>
              <span className="font-label-md text-base font-extrabold text-blue-950 mt-0.5">
                {sales.avgDealValue}
              </span>
              <span className="font-caption text-[10px] text-blue-800">Portföy başına ortalama</span>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-200/80 flex items-center justify-between text-xs">
            <span className="text-blue-900 font-medium">Ortalama Hizmet Bedeli:</span>
            <strong className="text-blue-950 font-bold">{sales.avgCommission}</strong>
          </div>
        </div>

        {/* Sağ Kolon: Kiralama Metrikleri */}
        <div className="p-space-md rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-emerald-700">vpn_key</span>
              Kiralama İşlemleri
            </span>
            <span className="font-caption text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              {rental.growthRate} Büyüme
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex flex-col">
              <span className="font-caption text-[11px] text-emerald-950 font-medium">Toplam Hacim</span>
              <span className="font-label-md text-base font-extrabold text-emerald-950 mt-0.5">
                {rental.totalVolume}
              </span>
              <span className="font-caption text-[10px] text-emerald-800">{rental.dealsCount} Sözleşme</span>
            </div>

            <div className="flex flex-col">
              <span className="font-caption text-[11px] text-emerald-950 font-medium">Ort. İşlem Değeri</span>
              <span className="font-label-md text-base font-extrabold text-emerald-950 mt-0.5">
                {rental.avgDealValue
                  ? (rental.avgDealValue.includes('/ Ay') ? rental.avgDealValue : `${rental.avgDealValue} / Ay`)
                  : '₺0 / Ay'}
              </span>
              <span className="font-caption text-[10px] text-emerald-800">Sözleşme başına ortalama</span>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-xs">
            <span className="text-emerald-900 font-medium">Ortalama Hizmet Bedeli:</span>
            <strong className="text-emerald-950 font-bold">{rental.avgCommission}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(SalesRentalComparison);


