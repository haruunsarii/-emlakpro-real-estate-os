import React, { memo } from 'react';

function RegionalDemandAnalysis({ districts = [] }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-surface-container shadow-xs flex flex-col justify-between">
      {/* Başlık */}
      <div className="flex items-center justify-between pb-space-md border-b border-surface-container/60">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-secondary text-[24px]">map</span>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
              Bölgesel Talep &amp; İlçe Analitiği
            </h3>
            <p className="font-caption text-caption text-on-surface-variant">
              Kayıtlı taleplere göre ilçe dağılımı, talep yoğunluğu ve portföy ortalama fiyatları
            </p>
          </div>
        </div>
        <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-bold">
          {districts.length} Bölge
        </span>
      </div>

      {/* İlçe Listesi & Talep Dağılım Çubukları */}
      <div className="flex flex-col gap-space-sm pt-space-sm">
        {districts.length === 0 ? (
          <div className="py-8 text-center text-xs text-on-surface-variant flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[32px] text-outline">location_off</span>
            <span className="font-semibold text-primary">Henüz Bölgesel Talep Verisi Yok</span>
            <p className="max-w-xs text-outline leading-relaxed">
              Yeni alıcı ve kiracı talepleri oluşturuldukça ilçe bazlı talep yoğunluğu burada haritalandırılacaktır.
            </p>
          </div>
        ) : (
          districts.map((d) => (
            <div
              key={d.district}
              className="p-space-sm rounded-xl bg-surface-container-low/50 hover:bg-surface-container-low transition-colors border border-surface-container flex flex-col gap-1.5"
            >
              {/* Üst Bilgi Satırı */}
              <div className="flex flex-wrap items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px]">
                    location_on
                  </span>
                  <span className="font-label-md text-sm font-bold text-primary">
                    {d.district}
                  </span>
                  <span className="font-caption text-[11px] bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                    {d.growth}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-on-surface-variant">
                    Ort. Fiyat: <strong className="text-primary">{d.avgPrice}</strong> ({d.avgM2Price})
                  </span>
                  <span className="font-mono font-bold text-secondary text-sm">
                    %{d.demandPercent} Talep
                  </span>
                </div>
              </div>

              {/* İlerleme Çubuğu */}
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${d.color || 'bg-secondary'}`}
                  style={{ width: `${d.demandPercent * 2.5}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default memo(RegionalDemandAnalysis);
