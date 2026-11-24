import React, { useState, useMemo, memo } from 'react';
import { chartMetrics } from '../../services/mockData';
import { useLocalStorage } from '../../hooks/useLocalStorage';

// Generates smooth cubic Bezier curve commands for SVG paths
function generateSmoothCurve(points, yKey) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0][yKey]}`;

  let path = `M ${points[0].x},${points[0][yKey]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1[yKey] + (p2[yKey] - p0[yKey]) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2[yKey] - (p3[yKey] - p1[yKey]) / 6;

    path += ` C ${Math.round(cp1x)},${Math.round(cp1y)} ${Math.round(cp2x)},${Math.round(cp2y)} ${p2.x},${p2[yKey]}`;
  }
  return path;
}

function RevenueChartCard() {
  const [currentYear] = useState(() => new Date().getFullYear());
  const [deals] = useLocalStorage('emlakpro_deals_v1', []);
  const completedDeals = useMemo(
    () => (Array.isArray(deals) ? deals.filter((d) => d.stage === 'tamamlandi') : []),
    [deals]
  );
  const hasDeals = completedDeals.length > 0;

  const [activeFilter, setActiveFilter] = useState('Son 6 Ay');
  const [seriesFilter, setSeriesFilter] = useState('all'); // 'all' | 'sales' | 'rent'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const filters = ['Son 6 Ay', 'Yıllık', 'Kira / Satış'];

  // Memoize spline coordinates, curves, and gridlines strictly by activeFilter
  const { currentStats, points, salesCurve, salesArea, rentCurve, rentArea, gridLines } = useMemo(() => {
    let raw = chartMetrics.last6MonthsData;
    if (activeFilter === 'Yıllık') {
      raw = chartMetrics.yearlyData;
    } else if (activeFilter === 'Kira / Satış') {
      raw = chartMetrics.rentVsSalesData;
    }

    const baseStats = chartMetrics.filterStats[activeFilter] || chartMetrics.filterStats['Son 6 Ay'];
    const stats = {
      ...baseStats,
      subtitle: activeFilter === 'Yıllık'
        ? `${currentYear} yılı 12 aylık kümülatif satış ve kiralama komisyon performansı`
        : baseStats.subtitle,
    };
    const maxVal = stats.maxVal || 2000000;
    const chartHeight = 160;
    const chartTop = 30;
    const startX = 60;
    const endX = 700;
    const stepX = (endX - startX) / (raw.length - 1);

    // Map coordinates for SVG
    const pts = raw.map((d, i) => {
      const x = Math.round(startX + i * stepX);
      const salesY = Math.round(chartTop + chartHeight - (d.sales / maxVal) * chartHeight);
      const rentY = Math.round(chartTop + chartHeight - (d.rent / maxVal) * chartHeight);
      return { ...d, x, salesY, rentY };
    });

    // Construct SVG curves and area fills
    const sCurve = generateSmoothCurve(pts, 'salesY');
    const sArea = `${sCurve} L ${pts[pts.length - 1].x},190 L ${pts[0].x},190 Z`;

    const rCurve = generateSmoothCurve(pts, 'rentY');
    const rArea = `${rCurve} L ${pts[pts.length - 1].x},190 L ${pts[0].x},190 Z`;

    // Grid line y-positions
    const lines = [
      { y: 20, label: stats.yLabels[0] },
      { y: 65, label: stats.yLabels[1] },
      { y: 110, label: stats.yLabels[2] },
      { y: 155, label: stats.yLabels[3] },
      { y: 190, label: stats.yLabels[4] },
    ];

    return {
      currentStats: stats,
      points: pts,
      salesCurve: sCurve,
      salesArea: sArea,
      rentCurve: rCurve,
      rentArea: rArea,
      gridLines: lines,
    };
  }, [activeFilter, currentYear]);

  // Series visibility based on seriesFilter
  const showSales = seriesFilter === 'all' || seriesFilter === 'sales';
  const showRent = seriesFilter === 'all' || seriesFilter === 'rent';

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md border border-surface-container-low transition-all">
      {/* Header & Main Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-xs">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Aylık Satış ve Kiralama Gelir Grafiği ({currentYear})
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {hasDeals ? currentStats.subtitle : 'Henüz tamamlanmış satış veya kiralama sözleşmesi bulunmuyor.'}
          </p>
        </div>

        {/* 3-Way Segmented Control */}
        <div className="inline-flex p-1 bg-surface-container rounded-lg self-start sm:self-auto shadow-xs border border-surface-container-high" id="chart-filter">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => {
                setActiveFilter(f);
                setHoveredIndex(null);
                if (f !== 'Kira / Satış') {
                  setSeriesFilter('all');
                }
              }}
              type="button"
              className={`px-3 py-1.5 rounded-md font-label-sm text-label-sm transition-all duration-200 cursor-pointer ${
                activeFilter === f
                  ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {!hasDeals ? (
        <div className="py-12 px-6 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-surface-container rounded-xl bg-surface-container-low/30">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[28px]">show_chart</span>
          </div>
          <div className="space-y-1">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Henüz Gelir ve İşlem Kaydı Bulunmuyor
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              Satış ve kiralama boru hattında bir fırsat &ldquo;Tamamlandı&rdquo; aşamasına taşındığında, dönemsel ciro ve komisyon gelir grafiğiniz burada otomatik olarak hesaplanacaktır.
            </p>
          </div>
        </div>
      ) : (
        <>

      {/* Sub-Filter for 'Kira / Satış' Mode: Specific series selection */}
      {activeFilter === 'Kira / Satış' && (
        <div className="flex items-center justify-between bg-surface-container-low px-space-md py-2 rounded-lg border border-surface-container animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[18px]">
              tune
            </span>
            <span className="font-label-sm text-on-surface font-semibold">
              Görüntülenen Seri:
            </span>
          </div>

          <div className="inline-flex p-0.5 bg-surface-container rounded-lg gap-1">
            <button
              type="button"
              onClick={() => setSeriesFilter('all')}
              className={`px-2.5 py-1 rounded-md font-caption text-caption transition-all ${
                seriesFilter === 'all'
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Tümü (Karşılaştırma)
            </button>
            <button
              type="button"
              onClick={() => setSeriesFilter('sales')}
              className={`px-2.5 py-1 rounded-md font-caption text-caption transition-all ${
                seriesFilter === 'sales'
                  ? 'bg-secondary text-white font-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Yalnızca Satış
            </button>
            <button
              type="button"
              onClick={() => setSeriesFilter('rent')}
              className={`px-2.5 py-1 rounded-md font-caption text-caption transition-all ${
                seriesFilter === 'rent'
                  ? 'bg-secondary-container text-white font-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Yalnızca Kiralama
            </button>
          </div>
        </div>
      )}

      {/* Key Stats Meta Banner (Dynamically updates with activeFilter) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm p-space-sm bg-surface-container-low rounded-lg border border-surface-container transition-all">
        <div className="flex items-center gap-space-sm">
          <span className={`material-symbols-outlined ${currentStats.stat1.color} text-[22px]`}>
            {currentStats.stat1.icon}
          </span>
          <div className="flex flex-col">
            <span className="font-caption text-caption text-on-surface-variant">
              {currentStats.stat1.label}
            </span>
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              {currentStats.stat1.val}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          <span className={`material-symbols-outlined ${currentStats.stat2.color} text-[22px]`}>
            {currentStats.stat2.icon}
          </span>
          <div className="flex flex-col">
            <span className="font-caption text-caption text-on-surface-variant">
              {currentStats.stat2.label}
            </span>
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              {currentStats.stat2.val}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          <span className={`material-symbols-outlined ${currentStats.stat3.color} text-[22px]`}>
            {currentStats.stat3.icon}
          </span>
          <div className="flex flex-col">
            <span className="font-caption text-caption text-on-surface-variant">
              {currentStats.stat3.label}
            </span>
            <span className={`font-label-md text-label-md font-semibold ${currentStats.stat3.color}`}>
              {currentStats.stat3.val}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive High-Fidelity SVG Chart */}
      <div className="w-full h-64 relative pt-2 overflow-hidden">
        <svg
          className="w-full h-full overflow-visible select-none"
          preserveAspectRatio="none"
          viewBox="0 0 740 220"
        >
          <defs>
            <linearGradient id="salesGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0058be" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#0058be" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="rentGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2170e4" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2170e4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Horizontal Lines & Y-Axis Labels */}
          {gridLines.map((gl, i) => (
            <g key={i}>
              <line
                stroke={i === 4 ? '#c6c5d0' : '#dae2fd'}
                strokeDasharray={i === 4 ? undefined : '3 3'}
                strokeWidth="1"
                x1="40"
                x2="720"
                y1={gl.y}
                y2={gl.y}
              />
              <text
                fill="#767680"
                fontFamily="Inter"
                fontSize="10"
                textAnchor="end"
                x="32"
                y={gl.y + 4}
              >
                {gl.label}
              </text>
            </g>
          ))}

          {/* Sales Gradient Area & Line */}
          {showSales && (
            <>
              <path
                d={salesArea}
                fill="url(#salesGrad)"
                className="transition-all duration-300"
              />
              <path
                d={salesCurve}
                fill="none"
                stroke="#0058be"
                strokeLinecap="round"
                strokeWidth="3"
                className="transition-all duration-300"
              />
            </>
          )}

          {/* Rent Gradient Area & Line */}
          {showRent && (
            <>
              <path
                d={rentArea}
                fill="url(#rentGrad)"
                className="transition-all duration-300"
              />
              <path
                d={rentCurve}
                fill="none"
                stroke="#2170e4"
                strokeDasharray="6 3"
                strokeLinecap="round"
                strokeWidth="2.5"
                className="transition-all duration-300"
              />
            </>
          )}

          {/* Month Nodes & Hover Interactions */}
          {points.map((p, idx) => {
            const isHovered = hoveredIndex === idx;
            const isLast = idx === points.length - 1;

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Vertical hover indicator guide line */}
                {isHovered && (
                  <line
                    x1={p.x}
                    x2={p.x}
                    y1={20}
                    y2={190}
                    stroke="#4f5c8e"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.6"
                  />
                )}

                {/* Sales point */}
                {showSales && (
                  <circle
                    cx={p.x}
                    cy={p.salesY}
                    fill={isHovered ? '#000f3f' : '#ffffff'}
                    r={isHovered ? 6 : 4.5}
                    stroke="#0058be"
                    strokeWidth={isHovered ? 3 : 2.5}
                    className="transition-all duration-150"
                  />
                )}

                {/* Rent point */}
                {showRent && (
                  <circle
                    cx={p.x}
                    cy={p.rentY}
                    fill={isHovered ? '#2170e4' : '#ffffff'}
                    r={isHovered ? 5.5 : 3.5}
                    stroke="#2170e4"
                    strokeWidth="2"
                    className="transition-all duration-150"
                  />
                )}

                {/* Month Label */}
                <text
                  fill={
                    isHovered
                      ? '#0058be'
                      : isLast
                      ? '#0058be'
                      : '#45464f'
                  }
                  fontFamily="Inter"
                  fontSize={points.length > 8 ? '9.5' : '11'}
                  fontWeight={isHovered || isLast ? '700' : '500'}
                  textAnchor="middle"
                  x={p.x}
                  y="210"
                >
                  {p.month}
                </text>

                {/* Interactive Tooltip Card */}
                {isHovered && (
                  <g className="pointer-events-none transition-all">
                    {/* Tooltip background container */}
                    <rect
                      x={Math.max(10, Math.min(610, p.x - 70))}
                      y={Math.max(10, (showSales ? p.salesY : p.rentY) - 52)}
                      width="140"
                      height={activeFilter === 'Kira / Satış' ? 52 : 46}
                      rx="8"
                      fill="#000f3f"
                      opacity="0.96"
                      stroke="#4f5c8e"
                      strokeWidth="1"
                    />
                    <text
                      x={Math.max(80, Math.min(680, p.x))}
                      y={Math.max(10, (showSales ? p.salesY : p.rentY) - 52) + 16}
                      textAnchor="middle"
                      fill="#dce1ff"
                      fontSize="10"
                      fontFamily="Inter"
                      fontWeight="700"
                    >
                      {p.month} {currentYear}
                    </text>

                    {showSales && (
                      <text
                        x={Math.max(80, Math.min(680, p.x))}
                        y={Math.max(10, (showSales ? p.salesY : p.rentY) - 52) + 29}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9.5"
                        fontFamily="Inter"
                        fontWeight="600"
                      >
                        Satış: ₺{p.sales.toLocaleString('tr-TR')}
                      </text>
                    )}

                    {showRent && (
                      <text
                        x={Math.max(80, Math.min(680, p.x))}
                        y={
                          Math.max(10, (showSales ? p.salesY : p.rentY) - 52) +
                          (showSales ? 41 : 29)
                        }
                        textAnchor="middle"
                        fill="#adc6ff"
                        fontSize="9"
                        fontFamily="Inter"
                      >
                        Kira: ₺{p.rent.toLocaleString('tr-TR')}
                      </text>
                    )}

                    {activeFilter === 'Kira / Satış' && p.ratio && (
                      <text
                        x={Math.max(80, Math.min(680, p.x))}
                        y={Math.max(10, (showSales ? p.salesY : p.rentY) - 52) + 48}
                        textAnchor="middle"
                        fill="#808dc2"
                        fontSize="8"
                        fontFamily="Inter"
                      >
                        Oran: {p.ratio}
                      </text>
                    )}
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Bottom Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-2 border-t border-surface-container-low">
        <div className="flex items-center gap-space-md">
          {/* Toggle Sales Series */}
          <button
            type="button"
            onClick={() => {
              if (seriesFilter === 'sales') {
                setSeriesFilter('all');
              } else if (seriesFilter === 'all') {
                setSeriesFilter('rent');
              } else {
                setSeriesFilter('all');
              }
            }}
            className={`flex items-center gap-2 px-2 py-1 rounded-md transition-colors cursor-pointer ${
              showSales ? 'bg-surface-container-low text-on-surface' : 'opacity-40 hover:opacity-70'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-secondary" />
            <span className="font-label-sm text-label-sm">
              Satış Komisyon Geliri
            </span>
          </button>

          {/* Toggle Rent Series */}
          <button
            type="button"
            onClick={() => {
              if (seriesFilter === 'rent') {
                setSeriesFilter('all');
              } else if (seriesFilter === 'all') {
                setSeriesFilter('sales');
              } else {
                setSeriesFilter('all');
              }
            }}
            className={`flex items-center gap-2 px-2 py-1 rounded-md transition-colors cursor-pointer ${
              showRent ? 'bg-surface-container-low text-on-surface' : 'opacity-40 hover:opacity-70'
            }`}
          >
            <span className="w-3.5 h-1.5 rounded-full bg-secondary-container" />
            <span className="font-label-sm text-label-sm">
              Kiralama Komisyon Geliri
            </span>
          </button>
        </div>

        <span className="font-caption text-caption text-outline">
          Veriler TCMB &amp; EmlakPro motoruyla senkronizedir
        </span>
      </div>
        </>
      )}
    </div>
  );
}

export default memo(RevenueChartCard);
