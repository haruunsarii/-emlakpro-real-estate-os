import React from 'react';

export default function MatchingProperties({
  clientName,
  properties = [],
  onOpenPropertyDetail,
  onScheduleShowing,
  onSendPresentation,
}) {
  return (
    <div className="flex flex-col gap-space-md">
      {/* Header Info */}
      <div className="flex items-center justify-between px-space-xs">
        <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-2">
          <span>{clientName} İçin Önerilen {properties.length} Eşleşmiş Portföy</span>
          <span className="font-caption text-caption bg-secondary-fixed/50 text-secondary px-2 py-0.5 rounded-full font-bold">
            Filtrelenmiş
          </span>
        </span>
        <span className="font-caption text-caption text-on-surface-variant font-medium">
          Skora göre sıralandı
        </span>
      </div>

      {/* Properties List */}
      {properties.length === 0 ? (
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm text-center border border-surface-container flex flex-col items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[36px] text-outline">
            domain_disabled
          </span>
          <h4 className="font-headline-sm text-on-surface font-semibold">
            Ofis Portföyünde Eşleşen İlan Bulunmuyor
          </h4>
          <p className="font-body-sm text-on-surface-variant max-w-md">
            Bu müşterinin aradığı kriterlere uyan yeni bir satılık/kiralık portföy kaydı sisteme eklendiğinde eşleştirme motoru otomatik olarak bildirecektir.
          </p>
        </div>
      ) : (
        properties.map((prop, idx) => (
          <div
            key={prop.id}
            className="bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row group border border-surface-container-low"
          >
            {/* Image Column */}
            <div className="md:w-5/12 h-52 md:h-auto relative overflow-hidden shrink-0 bg-surface-container">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                src={prop.image || prop.gallery?.[0]?.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600'}
                alt={prop.title}
                width="400"
                height="208"
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={idx === 0 ? 'high' : 'auto'}
                onClick={() => onOpenPropertyDetail && onOpenPropertyDetail(prop)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600';
                }}
              />

              {/* Code */}
              <div className="absolute top-2.5 left-2.5">
                <span className="font-caption text-caption bg-primary-container text-on-primary font-bold px-2 py-1 rounded shadow-xs">
                  {prop.id}
                </span>
              </div>

              {/* Match Score */}
              <div className="absolute top-2.5 right-2.5">
                <span className="font-caption text-caption bg-secondary-container text-on-secondary font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  {prop.matchScoreBadge || `%${prop.matchScore || 90} Uyum`}
                </span>
              </div>

              {/* Tag Badge */}
              {prop.tagBadge && (
                <div className="absolute bottom-2.5 left-2.5">
                  <span className="font-caption text-caption bg-inverse-surface/80 backdrop-blur-md text-inverse-on-surface px-2 py-0.5 rounded font-medium shadow-xs">
                    {prop.tagBadge}
                  </span>
                </div>
              )}
            </div>

            {/* Content Column */}
            <div className="p-space-md md:w-7/12 flex flex-col justify-between flex-grow gap-2">
              <div>
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className="font-currency-stat text-currency-stat text-primary font-bold">
                    {prop.priceFormatted}
                  </span>
                  {prop.statusBadge && (
                    <span className="font-caption text-caption bg-secondary-fixed/40 text-secondary px-2 py-0.5 rounded font-semibold">
                      {prop.statusBadge}
                    </span>
                  )}
                </div>

                <h4
                  onClick={() => onOpenPropertyDetail && onOpenPropertyDetail(prop)}
                  className="font-headline-sm text-headline-sm text-on-surface mt-1 font-semibold leading-tight line-clamp-1 hover:text-secondary cursor-pointer transition-colors"
                >
                  {prop.title}
                </h4>

                <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-1 truncate">
                  <span className="material-symbols-outlined text-[16px] text-outline shrink-0">
                    location_on
                  </span>
                  <span className="truncate">{prop.location}</span>
                </p>

                {/* Specs Box */}
                <div className="flex items-center gap-3 my-space-sm text-body-sm font-body-sm text-on-surface bg-surface p-2 rounded-lg border border-surface-container/60 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      square_foot
                    </span>
                    <span className="font-semibold">{prop.area || `${prop.netArea || 180} m² net`}</span>
                  </div>
                  <span className="text-outline">•</span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      bed
                    </span>
                    <span className="font-semibold">{prop.rooms || '3+1'}</span>
                  </div>
                  <span className="text-outline">•</span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      domain
                    </span>
                    <span className="truncate">{prop.floor || '3. Kat'}</span>
                  </div>
                </div>

                {/* Neden Eşleşti Callout */}
                {prop.matchReason && (
                  <div className="bg-surface-container-low p-2 rounded text-[11px] font-caption text-on-surface-variant flex items-start gap-1.5 border border-surface-container/60">
                    <span className="material-symbols-outlined text-secondary text-[14px] shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span>
                      <strong className="text-primary font-semibold">Neden Eşleşti:</strong> {prop.matchReason}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-space-sm mt-space-xs border-t border-surface-container flex-wrap">
                <button
                  onClick={() => onOpenPropertyDetail && onOpenPropertyDetail(prop)}
                  className="text-secondary hover:text-primary font-label-sm text-label-sm font-semibold flex items-center gap-0.5 cursor-pointer"
                  type="button"
                >
                  <span>Detay Gör</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onScheduleShowing && onScheduleShowing(prop)}
                    className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-all flex items-center gap-1 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px] text-secondary">
                      calendar_add_on
                    </span>
                    <span>Yer Gösterimi Planla</span>
                  </button>

                  <button
                    onClick={() => onSendPresentation && onSendPresentation(prop)}
                    className="px-3 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-sm text-label-sm transition-all flex items-center gap-1 shadow-xs cursor-pointer font-semibold"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">send</span>
                    <span>Sunum Gönder</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

