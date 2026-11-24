import React, { useState, useMemo, memo } from 'react';
import { ANALYTICAL_INSIGHTS } from '../../services/reportsData';

function AnalyticalInsights({ onActionClick, insights = ANALYTICAL_INSIGHTS, hasData = false }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState('ins-1');
  const [appliedInsights, setAppliedInsights] = useState({});

  const categories = [
    { key: 'all', label: 'Tümü' },
    { key: 'Bölgesel Trend', label: 'Bölgesel' },
    { key: 'Danışman Başarısı', label: 'Danışman' },
    { key: 'Portföy Talebi', label: 'Portföy' },
    { key: 'Süreç İyileştirme', label: 'Süreç' },
  ];

  const filteredInsights = useMemo(() => {
    const list = hasData ? insights : [];
    return selectedCategory === 'all'
      ? list
      : list.filter((item) => item.category === selectedCategory);
  }, [selectedCategory, insights, hasData]);

  const handleApply = (insight) => {
    setAppliedInsights((prev) => ({
      ...prev,
      [insight.id]: !prev[insight.id],
    }));
    if (onActionClick) {
      onActionClick(insight);
    }
  };

  if (!hasData) {
    return (
      <div className="bg-surface-container-lowest dark:bg-slate-900 rounded-2xl border border-outline-variant/30 dark:border-slate-800 p-5 shadow-sm space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface dark:text-white">
                Stratejik Öngörüler &amp; Tavsiyeler
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-slate-400">
                Veri analizine dayalı performans içgörüleri
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="py-10 px-4 text-center text-xs text-on-surface-variant flex flex-col items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[32px] text-outline">insights</span>
          <span className="font-semibold text-primary">Yeterli Veri Bulunmuyor</span>
          <p className="max-w-xs text-outline leading-relaxed">
            Portföy ve satış analizlerine dayalı stratejik öngörülerin oluşabilmesi için işlem verisi bekleniyor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest dark:bg-slate-900 rounded-2xl border border-outline-variant/30 dark:border-slate-800 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-on-surface dark:text-white">
              Stratejik Öngörüler &amp; Tavsiyeler
            </h3>
            <p className="text-xs text-on-surface-variant dark:text-slate-400">
              Veri analizine dayalı performans içgörüleri
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
            {filteredInsights.length} Öneri
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCategory(cat.key)}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat.key
                ? 'bg-primary text-white'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Insights List */}
      <div className="space-y-2.5">
        {filteredInsights.map((ins) => {
          const isExpanded = expandedId === ins.id;
          const isApplied = !!appliedInsights[ins.id];

          return (
            <div
              key={ins.id}
              className={`rounded-xl border transition-all ${
                isApplied
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : isExpanded
                  ? 'bg-surface-container-low/60 border-primary/30 shadow-xs'
                  : 'bg-surface-container-low/30 border-surface-container hover:border-outline-variant/60'
              }`}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : ins.id)}
                className="p-3.5 flex items-start justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`material-symbols-outlined text-[20px] mt-0.5 shrink-0 ${
                      ins.priority === 'Yüksek'
                        ? 'text-amber-500'
                        : ins.priority === 'Kritik'
                        ? 'text-rose-500'
                        : 'text-primary'
                    }`}
                  >
                    {ins.icon || 'lightbulb'}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface leading-tight">
                      {ins.title}
                    </h4>
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      {ins.category} • {ins.badge}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline text-[18px]">
                  {isExpanded ? 'expand_less' : 'expand_more'}
                </span>
              </div>

              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 text-xs text-on-surface-variant border-t border-surface-container/60">
                  <p className="leading-relaxed">{ins.description}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-semibold text-secondary">
                      Etki: {ins.impact}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(ins);
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        isApplied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-primary text-white hover:bg-primary-hover'
                      }`}
                    >
                      {isApplied ? 'Uygulandı ✓' : 'Aksiyon Al'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(AnalyticalInsights);
