import React from 'react';

/**
 * PropertySpecsTable Component
 * Detailed technical specifications and features table for property detail page.
 *
 * Displays strictly authentic property specs without fabricated or CRM-internal data.
 */
export default function PropertySpecsTable({ property }) {
  if (!property) return null;

  // Build genuine specs rows
  const specs = [
    { label: 'İlan No', value: property.id, icon: 'tag' },
    { label: 'İşlem Türü', value: property.type, icon: 'swap_horiz' },
    { label: 'Gayrimenkul Türü', value: property.category, icon: 'apartment' },
    {
      label: 'Net Kullanım Alanı',
      value: property.netArea ? `${property.netArea} m²` : '-',
      icon: 'square_foot',
    },
    {
      label: 'Brüt Kullanım Alanı',
      value: property.grossArea ? `${property.grossArea} m²` : '-',
      icon: 'crop_free',
    },
    { label: 'Oda Sayısı', value: property.rooms || '-', icon: 'meeting_room' },
    {
      label: 'Bulunduğu Kat',
      value: property.floorDetails || property.floor || '-',
      icon: 'stairs',
    },
    { label: 'Bina Yaşı', value: property.buildingAge || '-', icon: 'domain' },
    { label: 'Tapu Durumu', value: property.deedStatus || '-', icon: 'assignment' },
    { label: 'Krediye Uygunluk', value: property.loanEligibility || '-', icon: 'payments' },
  ];

  return (
    <div className="w-full space-y-8 font-sans">
      {/* 1. Technical Specs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-500 text-2xl">
            fact_check
          </span>
          <span>Teknik Özellikler ve Detaylar</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-3.5">
          {specs.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 border-b border-slate-100 text-xs sm:text-sm"
            >
              <span className="text-slate-500 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-[18px]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </span>
              <span className="font-semibold text-slate-900 text-right">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Property Description */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-500 text-2xl">
            description
          </span>
          <span>İlan Açıklaması</span>
        </h2>

        <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line space-y-3">
          {property.description ? (
            <p>{property.description}</p>
          ) : (
            <p>
              {property.title} portföyümüz {property.location || property.district} bölgesinde yer
              almakta olup, detaylı bilgi ve yerinde randevulu gösterim için yetkili
              danışmanımızla iletişime geçebilirsiniz.
            </p>
          )}
        </div>
      </div>

      {/* 3. Features Checklist (Shown ONLY if present in data) */}
      {property.features && Array.isArray(property.features) && property.features.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500 text-2xl">
              checklist
            </span>
            <span>Öne Çıkan Donanım & Nitelikler</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {property.features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs sm:text-sm font-medium text-slate-800"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs shrink-0 font-bold">
                  ✓
                </span>
                <span className="truncate">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

