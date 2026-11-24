import React, { memo } from 'react';
import { CUSTOMER_CONVERSION_FUNNEL } from '../../services/reportsData';

function CustomerConversionFunnel({ stages = CUSTOMER_CONVERSION_FUNNEL, hasData = false }) {
  if (!hasData) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-surface-container shadow-xs flex flex-col justify-between">
        {/* Başlık */}
        <div className="flex items-center justify-between pb-space-sm border-b border-surface-container/60">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-secondary text-[22px]">filter_alt</span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                Müşteri Dönüşüm Hunisi
              </h3>
              <p className="font-caption text-caption text-on-surface-variant">
                Talepten tapuya müşteri yaşam döngüsü ve aşama bazlı dönüşüm oranları
              </p>
            </div>
          </div>
        </div>

        {/* Boş Durum */}
        <div className="py-12 px-4 text-center text-xs text-on-surface-variant flex flex-col items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[32px] text-outline">filter_alt_off</span>
          <span className="font-semibold text-primary">Yeterli Dönüşüm Verisi Bulunmuyor</span>
          <p className="max-w-xs text-outline leading-relaxed">
            Müşteri talepleri ve satış hattında ilerleyen fırsatlar oluştukça yaşam döngüsü hunisi burada gerçek verilerle hesaplanacaktır.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-surface-container shadow-xs flex flex-col justify-between">
      {/* Başlık */}
      <div className="flex items-center justify-between pb-space-sm border-b border-surface-container/60">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-secondary text-[22px]">filter_alt</span>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
              Müşteri Dönüşüm Hunisi
            </h3>
            <p className="font-caption text-caption text-on-surface-variant">
              Talepten tapuya müşteri yaşam döngüsü ve aşama bazlı kayıp/dönüşüm oranları
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-caption text-caption bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-full font-bold">
            {stages.length} Aşama
          </span>
        </div>
      </div>

      {/* 6 Aşamalı Huni Yığını */}
      <div className="flex flex-col gap-2.5 pt-space-sm">
        {stages.map((stage) => {
          return (
            <div
              key={stage.stageNumber}
              className={`p-space-sm rounded-xl border transition-all flex flex-col gap-1.5 ${
                stage.isFinal
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-surface-container-low/50 border-surface-container hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      stage.isFinal
                        ? 'bg-[#10B981] text-white'
                        : 'bg-primary text-white'
                    }`}
                  >
                    {stage.stageNumber}
                  </span>
                  <span
                    className={`font-semibold ${
                      stage.isFinal ? 'text-emerald-950 font-bold' : 'text-primary'
                    }`}
                  >
                    {stage.stageName}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {stage.dropOff > 0 && (
                    <span className="text-rose-600 font-mono text-[11px] font-semibold">
                      -%{stage.dropOff} kayıp
                    </span>
                  )}
                  <span className="font-bold text-primary font-mono text-sm">
                    {stage.conversionRate}%
                  </span>
                </div>
              </div>

              {/* Hacim ve İlerleme Çubuğu */}
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    stage.isFinal ? 'bg-[#10B981]' : 'bg-primary'
                  }`}
                  style={{ width: `${stage.conversionRate}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-on-surface-variant">
                <span>{stage.leadsCount} Talep / Müşteri</span>
                <span className="font-semibold text-primary">{stage.volume}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(CustomerConversionFunnel);
