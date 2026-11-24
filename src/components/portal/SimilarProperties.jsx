import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getPublicProperties } from '../../utils/portalHelpers';
import PortalPropertyCard from './PortalPropertyCard';

/**
 * SimilarProperties Component
 * Recommends published properties matching the category or district of the current listing.
 */
export default function SimilarProperties({ currentProperty, allProperties }) {
  const similarList = useMemo(() => {
    if (!currentProperty || !Array.isArray(allProperties)) return [];

    const publicOnly = getPublicProperties(allProperties);

    return publicOnly
      .filter((p) => p.id !== currentProperty.id)
      .sort((a, b) => {
        // Prioritize same category, then same district
        const aCatMatch = a.category === currentProperty.category ? 2 : 0;
        const bCatMatch = b.category === currentProperty.category ? 2 : 0;
        const aDistMatch = a.district === currentProperty.district ? 1 : 0;
        const bDistMatch = b.district === currentProperty.district ? 1 : 0;
        return bCatMatch + bDistMatch - (aCatMatch + aDistMatch);
      })
      .slice(0, 3);
  }, [currentProperty, allProperties]);

  if (similarList.length === 0) return null;

  return (
    <section className="w-full pt-10 border-t border-slate-200 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            Öneri Portföyler
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Benzer Gayrimenkuller
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            İncelediğiniz ilana benzer özelliklere veya yakın konuma sahip alternatif seçenekler
          </p>
        </div>

        <Link
          to="/ilanlar"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors group"
        >
          <span>Tüm Portföyü Gör</span>
          <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {similarList.map((prop) => (
          <PortalPropertyCard key={prop.id} property={prop} />
        ))}
      </div>
    </section>
  );
}

