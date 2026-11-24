import React, { useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  getPublicProperties,
  filterAndSortPortalProperties,
} from '../../utils/portalHelpers';
import PortalPropertyCard from '../../components/portal/PortalPropertyCard';

const STORAGE_KEY = 'emlakpro_properties_v1';
const ITEMS_PER_PAGE = 9;

/**
 * PropertyListingsPage Component
 * Public Customer Portal Listings Catalog (/ilanlar) (Aşama 7.2)
 *
 * Driven by URL query parameters (Single Source of Truth):
 * - tip: 'all' | 'Satılık' | 'Kiralık'
 * - kategori: 'all' | 'Konut' | 'Ticari' | 'Arsa'
 * - ilce: district name or 'all'
 * - oda: room count or 'all'
 * - minFiyat, maxFiyat: price filters
 * - minM2, maxM2: area filters
 * - q: keyword search string
 * - sirala: sorting mode ('newest' | 'price_asc' | 'price_desc' | 'area_desc')
 * - sayfa: current page number
 */
export default function PropertyListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties] = useLocalStorage(STORAGE_KEY, []);
  const listingsTopRef = useRef(null);

  // 1. Sanitize and retrieve only publicly published properties
  const publicProperties = useMemo(() => {
    return getPublicProperties(properties);
  }, [properties]);

  // 2. Extract dynamic filter options from live published records
  const availableDistricts = useMemo(() => {
    const set = new Set();
    publicProperties.forEach((p) => {
      if (p.district && typeof p.district === 'string') {
        set.add(p.district.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [publicProperties]);

  const availableRooms = useMemo(() => {
    const set = new Set();
    publicProperties.forEach((p) => {
      if (p.rooms && typeof p.rooms === 'string') {
        set.add(p.rooms.trim());
      }
    });
    return Array.from(set).sort();
  }, [publicProperties]);

  // 3. Derive Filter States directly from URL Search Params
  const typeFilter = searchParams.get('tip') || 'all';
  const categoryFilter = searchParams.get('kategori') || 'all';
  const districtFilter = searchParams.get('ilce') || 'all';
  const roomFilter = searchParams.get('oda') || 'all';
  const minPrice = searchParams.get('minFiyat') || '';
  const maxPrice = searchParams.get('maxFiyat') || '';
  const minArea = searchParams.get('minM2') || '';
  const maxArea = searchParams.get('maxM2') || '';
  const searchQuery = searchParams.get('q') || '';
  const sortBy = searchParams.get('sirala') || 'newest';
  const pageParam = parseInt(searchParams.get('sayfa') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  // Generic updater for URL search params
  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    // Reset page to 1 on filter changes
    if (key !== 'sayfa') {
      next.delete('sayfa');
    }
    setSearchParams(next, { replace: true });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchParams({}, { replace: true });
  };

  // 4. Apply combined filtering and sorting
  const filteredProperties = useMemo(() => {
    const filters = {
      type: typeFilter,
      categoryGroup: categoryFilter,
      district: districtFilter,
      room: roomFilter,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      search: searchQuery,
    };
    return filterAndSortPortalProperties(publicProperties, filters, sortBy);
  }, [
    publicProperties,
    typeFilter,
    categoryFilter,
    districtFilter,
    roomFilter,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    searchQuery,
    sortBy,
  ]);

  // 5. Pagination logic
  const totalItems = filteredProperties.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProperties = useMemo(() => {
    return filteredProperties.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProperties, startIndex]);

  const handlePageChange = (p) => {
    updateFilter('sayfa', p === 1 ? '' : String(p));
    if (listingsTopRef.current) {
      listingsTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Count active filters (for badge)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (typeFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (districtFilter !== 'all') count++;
    if (roomFilter !== 'all') count++;
    if (minPrice !== '') count++;
    if (maxPrice !== '') count++;
    if (minArea !== '') count++;
    if (maxArea !== '') count++;
    if (searchQuery.trim().length > 0) count++;
    return count;
  }, [
    typeFilter,
    categoryFilter,
    districtFilter,
    roomFilter,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    searchQuery,
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      {/* 1. Top Banner / Breadcrumb */}
      <div className="bg-slate-900 text-white py-10 sm:py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-3" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-amber-400 transition-colors">
              Ana Sayfa
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-slate-200 font-medium">İlanlar & Portföy</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
                <span className="material-symbols-outlined text-[14px]">real_estate_agent</span>
                Canlı Gayrimenkul Vitrini
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Gayrimenkul Portföyümüz
              </h1>
              <p className="mt-2 text-sm text-slate-300 max-w-2xl">
                Seçkin lokasyonlarda yer alan satılık ve kiralık lüks konut, ticari ve arsa portföyümüzü keşfedin.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/talep-birak"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs hover:from-amber-400 hover:to-amber-500 shadow-md transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                Aradığınızı Bulamadınız mı? Talep Bırakın
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div ref={listingsTopRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* 2. Search & Filter Panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs mb-8 space-y-5">
          {/* Top Bar: Search Input & Quick Type Tabs */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => updateFilter('q', e.target.value)}
                placeholder="İlan başlığı, ilçe, semt veya anahtar kelime ile arayın..."
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all shadow-xs"
              />
              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[18px]">
                search
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => updateFilter('q', '')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Aramayı Temizle"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            {/* Transaction Type Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => updateFilter('tip', 'all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tümü
              </button>
              <button
                type="button"
                onClick={() => updateFilter('tip', 'Satılık')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === 'Satılık'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Satılık
              </button>
              <button
                type="button"
                onClick={() => updateFilter('tip', 'Kiralık')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === 'Kiralık'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kiralık
              </button>
            </div>
          </div>

          {/* Secondary Filter Controls Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100">
            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Kategori
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => updateFilter('kategori', e.target.value)}
                className="w-full h-10 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="Konut">Konut</option>
                <option value="Ticari">Ticari</option>
                <option value="Arsa">Arsa & Arazi</option>
              </select>
            </div>

            {/* District Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                İlçe
              </label>
              <select
                value={districtFilter}
                onChange={(e) => updateFilter('ilce', e.target.value)}
                className="w-full h-10 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <option value="all">Tüm İlçeler</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Oda Sayısı
              </label>
              <select
                value={roomFilter}
                onChange={(e) => updateFilter('oda', e.target.value)}
                className="w-full h-10 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <option value="all">Tüm Odalar</option>
                {availableRooms.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
                <option value="5+">5+ ve Üzeri</option>
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Min Fiyat (₺)
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => updateFilter('minFiyat', e.target.value)}
                placeholder="Örn: 5000000"
                className="w-full h-10 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Max Fiyat (₺)
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => updateFilter('maxFiyat', e.target.value)}
                placeholder="Örn: 50000000"
                className="w-full h-10 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Sort Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Sıralama
              </label>
              <select
                value={sortBy}
                onChange={(e) => updateFilter('sirala', e.target.value)}
                className="w-full h-10 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <option value="newest">En Yeni İlanlar</option>
                <option value="price_asc">Fiyata Göre Artan (En Düşük)</option>
                <option value="price_desc">Fiyata Göre Azalan (En Yüksek)</option>
                <option value="area_desc">Metrekareye Göre (Büyükten)</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips & Clear Action */}
          {activeFiltersCount > 0 && (
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold mr-1">
                  Uygulanan Filtreler ({activeFiltersCount}):
                </span>

                {typeFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold">
                    <span>{typeFilter}</span>
                    <button
                      type="button"
                      onClick={() => updateFilter('tip', 'all')}
                      className="hover:text-amber-950 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                )}

                {categoryFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold">
                    <span>{categoryFilter}</span>
                    <button
                      type="button"
                      onClick={() => updateFilter('kategori', 'all')}
                      className="hover:text-blue-950 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                )}

                {districtFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold">
                    <span>{districtFilter}</span>
                    <button
                      type="button"
                      onClick={() => updateFilter('ilce', 'all')}
                      className="hover:text-slate-950 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                )}

                {roomFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 text-xs font-semibold">
                    <span>{roomFilter}</span>
                    <button
                      type="button"
                      onClick={() => updateFilter('oda', 'all')}
                      className="hover:text-purple-950 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                )}

                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold">
                    <span>Fiyat Filtresi</span>
                    <button
                      type="button"
                      onClick={() => {
                        updateFilter('minFiyat', '');
                        updateFilter('maxFiyat', '');
                      }}
                      className="hover:text-emerald-950 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 text-xs font-semibold">
                    <span>&quot;{searchQuery}&quot;</span>
                    <button
                      type="button"
                      onClick={() => updateFilter('q', '')}
                      className="hover:text-slate-950 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 underline transition-colors cursor-pointer"
              >
                Tüm Filtreleri Temizle
              </button>
            </div>
          )}
        </div>

        {/* 3. Results Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-200">
          <div className="text-sm font-semibold text-slate-600">
            Toplam <strong className="text-slate-900">{totalItems}</strong> güncel gayrimenkul listeleniyor
          </div>

          {totalItems > 0 && (
            <div className="text-xs text-slate-500 font-medium">
              Sayfa {currentPage} / {totalPages} (Gösterilen: {startIndex + 1} -{' '}
              {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)})
            </div>
          )}
        </div>

        {/* 4. Listings Grid */}
        {paginatedProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {paginatedProperties.map((prop) => (
              <PortalPropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        ) : (
          /* Empty State when no properties match filters */
          <div className="bg-white rounded-2xl border border-slate-200/80 p-10 sm:p-14 text-center max-w-2xl mx-auto shadow-xs my-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto mb-4 shadow-xs">
              <span className="material-symbols-outlined text-3xl">search_off</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Arama Kriterlerinize Uygun İlan Bulunamadı
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
              Uyguladığınız filtre kombinasyonuna uygun gayrimenkul bulunamadı. Filtreleri genişleterek tekrar arayabilir veya özel talep formumuzu doldurabilirsiniz.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
              >
                Filtreleri Sıfırla
              </button>
              <Link
                to="/talep-birak"
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-xs"
              >
                Özel Talep Bırakın
              </Link>
            </div>
          </div>
        )}

        {/* 5. Pagination Bar */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="text-xs text-slate-500">
              Toplam <strong>{totalItems}</strong> ilandan{' '}
              <strong>
                {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}
              </strong>{' '}
              arası gösteriliyor
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                <span>Önceki</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePageChange(p)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    p === currentPage
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <span>Sonraki</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
