import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PortalPropertyCard Component
 * Public customer-facing property card.
 *
 * Displays strictly sanitized, customer-oriented data:
 * - Property cover image & photo count badge
 * - Transaction badge ('Satılık' | 'Kiralık')
 * - Title and formatted price
 * - Location (District / Neighborhood / City)
 * - Specs (Rooms, Net/Gross m², Category)
 * - Direct link to public property detail page (/ilanlar/:id)
 *
 * Internal CRM fields (contracts, buyer matches, margins) are strictly omitted.
 */
export default function PortalPropertyCard({ property }) {
  if (!property) return null;

  const fallbackImage =
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';

  const coverImage =
    property.mainImage ||
    property.gallery?.[0]?.image ||
    property.image ||
    fallbackImage;

  const detailPath = `/ilanlar/${property.id}`;

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* 1. Cover Image & Badges */}
      <div className="relative w-full h-56 sm:h-60 overflow-hidden bg-slate-100">
        <Link to={detailPath} className="block w-full h-full">
          <img
            src={coverImage}
            alt={property.title || 'Gayrimenkul İlanı'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackImage;
            }}
          />
        </Link>

        {/* Subtle Dark Gradient at bottom of image for badge legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges: Type & Category */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-10 pointer-events-none">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 ${
              property.type === 'Kiralık'
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 text-slate-950'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                property.type === 'Kiralık' ? 'bg-emerald-200' : 'bg-slate-950'
              }`}
            />
            {property.type || 'Satılık'}
          </span>

          {property.status === 'Yeni İlan' && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-md">
              Yeni İlan
            </span>
          )}

          {property.category && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-xs text-slate-800 shadow-md">
              {property.category}
            </span>
          )}
        </div>

        {/* Photo Count Badge */}
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900/80 backdrop-blur-xs text-white shadow-md">
            <span className="material-symbols-outlined text-[14px]">photo_camera</span>
            <span>{property.photoCount || 1} Fotoğraf</span>
          </span>
        </div>
      </div>

      {/* 2. Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price Header */}
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <div className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              {property.formattedPrice || property.priceFormatted || '₺0'}
            </div>
            {property.unitPrice && (
              <span className="text-xs font-medium text-slate-500">
                {property.unitPrice}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            <Link to={detailPath}>{property.title}</Link>
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
            <span className="material-symbols-outlined text-slate-400 text-[16px] shrink-0">
              location_on
            </span>
            <span className="truncate">
              {property.neighborhood ? `${property.neighborhood}, ` : ''}
              {property.district ? `${property.district} / ` : ''}
              {property.city || property.location || 'İstanbul'}
            </span>
          </div>
        </div>

        {/* 3. Specs Bar & Detail CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Key Specs: Rooms, Net Area */}
          <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
            {property.rooms && (
              <span className="flex items-center gap-1" title="Oda Sayısı">
                <span className="material-symbols-outlined text-[16px] text-slate-400">
                  meeting_room
                </span>
                <span>{property.rooms}</span>
              </span>
            )}
            {(property.netArea || property.grossArea) && (
              <span className="flex items-center gap-1" title="Kullanım Alanı">
                <span className="material-symbols-outlined text-[16px] text-slate-400">
                  square_foot
                </span>
                <span>{property.netArea || property.grossArea} m²</span>
              </span>
            )}
          </div>

          {/* Button Link */}
          <Link
            to={detailPath}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-blue-600 group/btn transition-colors"
          >
            <span>Detay</span>
            <span className="material-symbols-outlined text-[16px] group-hover/btn:translate-x-0.5 transition-transform">
              chevron_right
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}

