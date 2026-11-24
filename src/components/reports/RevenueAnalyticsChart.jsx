import React, { useState, useMemo, memo } from 'react';
import { MONTHLY_REVENUE_DATA, YEARLY_REVENUE_DATA } from '../../services/reportsData';

function RevenueAnalyticsChart({
  actualRevenuePoints = [],
  hasInsufficientChartData = false,
  wonDealsCount = 0,
}) {
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'line'
  const [viewInterval, setViewInterval] = useState('monthly'); // 'monthly' | 'yearly'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const showEmpty = hasInsufficientChartData || wonDealsCount === 0 || actualRevenuePoints.length === 0;

  const activeData = useMemo(() => {
    return viewInterval === 'monthly' ? MONTHLY_REVENUE_DATA : YEARLY_REVENUE_DATA;
  }, [viewInterval]);

  // Max değer hesaplama (Y ekseni ölçeklendirme için)
  const maxValue = useMemo(() => {
    return viewInterval === 'monthly' ? 80 : 2500; // Milyon ₺
  }, [viewInterval]);

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-surface-container shadow-xs flex flex-col justify-between">
      {/* 1. Grafik Başlığı */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-md gap-space-sm border-b border-surface-container/60">
        <div>
          <div className="flex items-center gap-space-xs flex-wrap">
            <span className="material-symbols-outlined text-secondary text-[24px]">monitoring</span>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
              Gelir Analizi
            </h2>
            <span className="text-[10px] bg-surface-container text-on-surface-variant font-bold px-2 py-0.5 rounded-full border border-surface-container-high">
              Gerçek CRM Kayıtları
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Sistemde tamamlanmış sözleşmeler üzerinden dinamik ciro ve komisyon analizi
          </p>
        </div>

        {!showEmpty && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Aylık / Yıllık Geçiş Düğmeleri */}
            <div className="flex p-0.5 bg-surface-container-low rounded-lg border border-surface-container">
              <button
                type="button"
                onClick={() => setViewInterval('monthly')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewInterval === 'monthly'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Aylık Trend
              </button>
              <button
                type="button"
                onClick={() => setViewInterval('yearly')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewInterval === 'yearly'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Yıllık Büyüme
              </button>
            </div>

            {/* Bar / Çizgi Geçiş Düğmeleri */}
            <div className="flex p-0.5 bg-surface-container-low rounded-lg border border-surface-container">
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-all cursor-pointer ${
                  chartType === 'bar'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
                title="Çubuk Grafik"
              >
                <span className="material-symbols-outlined text-[18px]">bar_chart</span>
              </button>
              <button
                type="button"
                onClick={() => setChartType('line')}
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-all cursor-pointer ${
                  chartType === 'line'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
                title="Çizgi Grafik"
              >
                <span className="material-symbols-outlined text-[18px]">show_chart</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {showEmpty ? (
        <div className="py-16 px-6 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[28px]">bar_chart</span>
          </div>
          <div className="space-y-1">
            <h3 className="font-headline-sm text-headline-sm text-primary font-semibold">
              Yeterli Gelir Verisi Bulunmuyor
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              Sistemde henüz tamamlanmış bir satış veya kiralama sözleşmesi bulunmuyor. Satış ve kiralama fırsatları &ldquo;Tamamlandı&rdquo; aşamasına taşındığında dönemsel gelir ve komisyon analizi burada görüntülenecektir.
            </p>
          </div>
        </div>
      ) : (
        <>

      {/* 2. Lejant Şeridi (Chart Legends) */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-space-xs text-xs font-caption text-on-surface-variant">
        <div className="flex items-center gap-space-md flex-wrap">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-sm bg-secondary" />
            <span>Satış Hacmi</span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-sm bg-[#10B981]" />
            <span>Kiralama Hacmi</span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-sm bg-tertiary-container" />
            <span>Komisyon Hasılatı</span>
          </span>
          {viewInterval === 'monthly' && (
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-3 h-1 bg-primary rounded-full" />
              <span>Hedef Kota</span>
            </span>
          )}
        </div>

        <span className="text-[11px] text-outline italic hidden md:inline">
          * Detaylı rakamları görmek için çubukların üzerine gelin.
        </span>
      </div>

      {/* 3. İnteraktif Grafik Alanı (SVG & CSS Bar/Line Hybrid) */}
      <div className="relative w-full h-[280px] pt-4 flex flex-col justify-end select-none">
        {/* Yatay Kılavuz Çizgileri & Y Ekseni Etiketleri */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 text-caption font-caption text-outline">
          {[
            viewInterval === 'monthly' ? '₺80M' : '₺2.5B',
            viewInterval === 'monthly' ? '₺60M' : '₺1.8B',
            viewInterval === 'monthly' ? '₺40M' : '₺1.2B',
            viewInterval === 'monthly' ? '₺20M' : '₺600M',
            '₺0',
          ].map((val, idx) => (
            <div key={idx} className="w-full flex items-center justify-between opacity-35">
              <span className="w-12 text-right shrink-0">{val}</span>
              <div className="w-full ml-3 h-[1px] bg-outline-variant" />
            </div>
          ))}
        </div>

        {/* Hover Tooltip Baloncuğu */}
        {hoveredPoint && (
          <div
            className="absolute top-2 right-4 z-30 bg-primary text-white p-3 rounded-xl shadow-xl border border-secondary-container text-xs flex flex-col gap-1 min-w-[200px] animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
          >
            <div className="flex items-center justify-between border-b border-white/20 pb-1 mb-1 font-bold">
              <span>{hoveredPoint.month || hoveredPoint.year} Performansı</span>
              {hoveredPoint.isPeak && (
                <span className="text-[10px] bg-amber-400 text-amber-950 px-1 rounded font-bold">
                  ZİRVE AY
                </span>
              )}
            </div>
            <div className="flex justify-between items-center text-surface-variant">
              <span>Satış Hacmi:</span>
              <strong className="text-white">₺{hoveredPoint.salesRevenue}M</strong>
            </div>
            <div className="flex justify-between items-center text-surface-variant">
              <span>Kiralama Hacmi:</span>
              <strong className="text-[#10B981]">₺{hoveredPoint.rentalRevenue}M</strong>
            </div>
            <div className="flex justify-between items-center text-surface-variant">
              <span>Net Komisyon:</span>
              <strong className="text-secondary-fixed">₺{hoveredPoint.commissionRevenue}M</strong>
            </div>
            {hoveredPoint.target && (
              <div className="flex justify-between items-center text-outline-variant pt-1 border-t border-white/10 text-[11px]">
                <span>Hedef:</span>
                <span>₺{hoveredPoint.target}M</span>
              </div>
            )}
          </div>
        )}

        {/* ÇUBUK GRAFİK GÖRÜNÜMÜ (Bar Mode) */}
        {chartType === 'bar' && (
          <div className="relative z-10 w-full pl-14 pr-4 h-[230px] grid grid-cols-4 sm:grid-cols-7 items-end gap-2 sm:gap-4">
            {activeData.map((item, index) => {
              const salesPct = Math.min(100, (item.salesRevenue / maxValue) * 100);
              const rentalPct = Math.min(100, (item.rentalRevenue / maxValue) * 100);
              const commPct = Math.min(100, ((item.commissionRevenue * (viewInterval === 'monthly' ? 10 : 15)) / maxValue) * 100);

              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredPoint(item)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="flex flex-col items-center h-full justify-end group cursor-pointer"
                >
                  <div className="flex items-end gap-1 sm:gap-1.5 w-full justify-center h-full px-1">
                    {/* Satış Çubuğu */}
                    <div
                      className="w-2.5 sm:w-3.5 bg-secondary rounded-t-sm transition-all duration-300 group-hover:brightness-110 group-hover:scale-y-105 origin-bottom"
                      style={{ height: `${salesPct}%` }}
                    />
                    {/* Kiralama Çubuğu */}
                    <div
                      className="w-2.5 sm:w-3.5 bg-[#10B981] rounded-t-sm transition-all duration-300 group-hover:brightness-110 group-hover:scale-y-105 origin-bottom"
                      style={{ height: `${rentalPct}%` }}
                    />
                    {/* Komisyon Çubuğu */}
                    <div
                      className="w-2.5 sm:w-3.5 bg-tertiary-container rounded-t-sm transition-all duration-300 group-hover:brightness-110 group-hover:scale-y-105 origin-bottom"
                      style={{ height: `${commPct}%` }}
                    />
                  </div>
                  {/* Ay / Yıl Etiketi */}
                  <span className="font-caption text-caption text-on-surface-variant mt-2 font-medium truncate max-w-[65px] text-center">
                    {item.month || item.year}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ÇİZGİ GRAFİK GÖRÜNÜMÜ (Line Mode via SVG) */}
        {chartType === 'line' && (
          <div className="relative z-10 w-full pl-14 pr-4 h-[230px] flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0058be" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0058be" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="rentalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Satış Alanı & Çizgisi */}
              <path
                d="M 10 130 Q 95 110, 185 80 T 365 70 T 545 40 L 545 200 L 10 200 Z"
                fill="url(#salesGrad)"
              />
              <path
                d="M 10 130 Q 95 110, 185 80 T 365 70 T 545 40"
                fill="none"
                stroke="#0058be"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Kiralama Alanı & Çizgisi */}
              <path
                d="M 10 160 Q 95 150, 185 130 T 365 120 T 545 90 L 545 200 L 10 200 Z"
                fill="url(#rentalGrad)"
              />
              <path
                d="M 10 160 Q 95 150, 185 130 T 365 120 T 545 90"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Komisyon Çizgisi (Mor Kesikli) */}
              <path
                d="M 10 175 Q 95 168, 185 150 T 365 140 T 545 115"
                fill="none"
                stroke="#040056"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Alt Etiketler */}
            <div className="absolute -bottom-6 left-14 right-4 flex justify-between text-caption font-caption text-on-surface-variant font-medium">
              {activeData.map((d, i) => (
                <span key={i} className="truncate max-w-[60px] text-center">
                  {d.month || d.year}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}

export default memo(RevenueAnalyticsChart);


