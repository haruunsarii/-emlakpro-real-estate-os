import React from 'react';

/**
 * PropertyLocationMap Component
 * Customer-facing location section for property detail page.
 *
 * Adheres strictly to rule 4:
 * - If genuine coordinates or exact address are absent, shows only representative location area.
 * - DOES NOT fabricate unverified transit lines, travel times, or points of interest.
 */
export default function PropertyLocationMap({ property }) {
  if (!property) return null;

  const displayLocation =
    property.location ||
    [property.neighborhood, property.district, property.city || 'İstanbul']
      .filter(Boolean)
      .join(', ');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs font-sans">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-rose-500 text-2xl">
            location_on
          </span>
          <span>Konum ve Bölge Bilgisi</span>
        </h2>

        {property.district && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {property.district} / {property.city || 'İstanbul'}
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
          <span className="material-symbols-outlined text-slate-400 text-[20px] shrink-0 mt-0.5">
            pin_drop
          </span>
          <div>
            <span className="font-semibold text-slate-900 block">{displayLocation}</span>
            <span className="text-xs text-slate-400">
              Detaylı ada/parsel ve tam adres gösterimi güvenlik ve gizlilik politikamız gereği yerinde gösterim sırasında paylaşılmaktadır.
            </span>
          </div>
        </div>

        {/* Representative Map Canvas Placeholder */}
        <div className="relative w-full h-64 sm:h-72 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden flex flex-col items-center justify-center p-6 text-center">
          {/* Subtle grid pattern background */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(#94a3b8 1px, transparent 1px), radial-gradient(#94a3b8 1px, #f1f5f9 1px)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 10px 10px',
            }}
          />

          <div className="relative z-10 space-y-2 max-w-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-2xl animate-bounce">
                location_on
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{displayLocation}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Gayrimenkulün yerinde incelenmesi ve lokasyon ziyareti için danışmanımız ile irtibata geçebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

