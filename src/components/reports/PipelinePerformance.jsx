import React, { memo } from 'react';
import { PIPELINE_PERFORMANCE } from '../../services/reportsData';

function PipelinePerformance({ data = PIPELINE_PERFORMANCE }) {
  const {
    activeDealsCount,
    wonDealsCount,
    lostDealsCount,
    totalPipelineValue,
    avgCloseDays,
    winRate,
    stageBreakdown,
  } = data;

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-surface-container shadow-xs flex flex-col justify-between">
      {/* Başlık */}
      <div className="flex items-center justify-between pb-space-sm border-b border-surface-container/60">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-secondary text-[22px]">account_tree</span>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
              Satış Hattı &amp; Fırsat Performansı
            </h3>
            <p className="font-caption text-caption text-on-surface-variant">
              Aktif fırsat stoğu, aşama dağılımı ve ortalama sözleşme kapanış süreleri
            </p>
          </div>
        </div>
        <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold">
          Kazanma: {winRate}
        </span>
      </div>

      {/* 4 Özet Metrik Kutusu */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-2 gap-2 pt-space-sm">
        <div className="p-space-xs rounded-xl bg-surface-container-low border border-surface-container flex flex-col">
          <span className="font-caption text-[11px] text-on-surface-variant font-medium">Aktif Fırsatlar</span>
          <span className="font-headline-sm text-lg font-bold text-primary mt-0.5">
            {activeDealsCount} Fırsat
          </span>
          <span className="font-caption text-[10px] text-secondary">Takip Edilen</span>
        </div>

        <div className="p-space-xs rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex flex-col">
          <span className="font-caption text-[11px] text-emerald-950 font-medium">Kazanılan (Won)</span>
          <span className="font-headline-sm text-lg font-bold text-emerald-900 mt-0.5">
            {wonDealsCount} İşlem
          </span>
          <span className="font-caption text-[10px] text-emerald-700">Başarılı Devir</span>
        </div>

        <div className="p-space-xs rounded-xl bg-rose-50/60 border border-rose-200/60 flex flex-col">
          <span className="font-caption text-[11px] text-rose-950 font-medium">Kayıp / İptal</span>
          <span className="font-headline-sm text-lg font-bold text-rose-900 mt-0.5">
            {lostDealsCount} Fırsat
          </span>
          <span className="font-caption text-[10px] text-rose-700">İptal Edilen</span>
        </div>

        <div className="p-space-xs rounded-xl bg-surface-container-low border border-surface-container flex flex-col">
          <span className="font-caption text-[11px] text-on-surface-variant font-medium">Ort. Kapanış Süresi</span>
          <span className="font-headline-sm text-lg font-bold text-secondary mt-0.5">
            {avgCloseDays} Gün
          </span>
          <span className="font-caption text-[10px] text-outline">Hızlı Kapanış</span>
        </div>
      </div>

      {/* Toplam Hat Değeri & Aşama Dağılımı */}
      <div className="mt-space-md p-space-sm rounded-xl bg-surface-container-low/60 border border-surface-container flex flex-col gap-space-xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-primary">Toplam Satış Hattı Değeri (Pipeline GDV):</span>
          <span className="font-extrabold text-primary font-mono text-sm">{totalPipelineValue}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
          {stageBreakdown.map((item, idx) => (
            <div
              key={idx}
              className="p-1.5 rounded-lg bg-surface-container-lowest border border-surface-container flex flex-col"
            >
              <span className="font-caption text-[10px] text-on-surface-variant truncate">
                {item.stage}
              </span>
              <span className="font-label-sm text-xs font-bold text-primary mt-0.5">
                {item.count} İlan
              </span>
              <span className="font-caption text-[10px] text-secondary font-mono">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(PipelinePerformance);

