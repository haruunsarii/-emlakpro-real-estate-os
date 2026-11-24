import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { getPublicProperties } from '../../utils/portalHelpers';
import PortalPropertyCard from '../../components/portal/PortalPropertyCard';

const STORAGE_KEY = 'emlakpro_properties_v1';

/**
 * PortalHomePage Component
 * Customer Portal Home Page (Aşama 7.2)
 *
 * Includes:
 * 1. Interactive Hero search banner passing params to /ilanlar
 * 2. Real-time featured property showcase synced with emlakpro_properties_v1
 * 3. Corporate trust pillars ("Neden EmlakPro?")
 * 4. High-conversion CTA banner
 */
export default function PortalHomePage() {
  const navigate = useNavigate();
  const [properties] = useLocalStorage(STORAGE_KEY, []);

  // Filter public-only and sanitized properties
  const publicProperties = useMemo(() => {
    return getPublicProperties(properties);
  }, [properties]);

  // Extract available unique districts from published listings
  const availableDistricts = useMemo(() => {
    const set = new Set();
    publicProperties.forEach((p) => {
      if (p.district && typeof p.district === 'string') {
        set.add(p.district.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [publicProperties]);

  // Hero search form state
  const [searchType, setSearchType] = useState('all'); // 'all' | 'Satılık' | 'Kiralık'
  const [searchCategory, setSearchCategory] = useState('all'); // 'all' | 'Konut' | 'Ticari' | 'Arsa'
  const [searchDistrict, setSearchDistrict] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Handle Hero search submission
  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (searchType !== 'all') {
      params.set('tip', searchType);
    }
    if (searchCategory !== 'all') {
      params.set('kategori', searchCategory);
    }
    if (searchDistrict !== 'all') {
      params.set('ilce', searchDistrict);
    }
    if (searchKeyword.trim().length > 0) {
      params.set('q', searchKeyword.trim());
    }

    const queryStr = params.toString();
    navigate(queryStr ? `/ilanlar?${queryStr}` : '/ilanlar');
  };

  // Top featured properties (prioritize VIP/Exclusive, up to 6 items)
  const featuredProperties = useMemo(() => {
    return [...publicProperties]
      .sort((a, b) => {
        if (a.isVip && !b.isVip) return -1;
        if (!a.isVip && b.isVip) return 1;
        if (a.isExclusive && !b.isExclusive) return -1;
        if (!a.isExclusive && b.isExclusive) return 1;
        return 0;
      })
      .slice(0, 6);
  }, [publicProperties]);

  return (
    <div className="w-full flex flex-col font-sans text-slate-800">
      {/* 1. Hero Section & Interactive Search */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-primary text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative backdrop blurs */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-semibold tracking-wider uppercase backdrop-blur-md border border-white/15">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Kurumsal Gayrimenkul Portalı
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Hayalinizdeki Yaşam Alanını ve <br className="hidden sm:inline" />
            <span className="text-amber-400">Yatırım Fırsatlarını</span> Keşfedin
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
            İstanbul&apos;un en seçkin lokasyonlarında yer alan lüks konut, rezidans, villa ve ticari
            portföylerimizi EmlakPro güvencesiyle doğrudan inceleyin.
          </p>

          {/* Search Box Card */}
          <div className="max-w-4xl mx-auto mt-8 bg-white/10 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/20 shadow-2xl text-left">
            {/* Transaction Type Tabs */}
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSearchType('all')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  searchType === 'all'
                    ? 'bg-white text-slate-950 shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                Tüm İlanlar
              </button>
              <button
                type="button"
                onClick={() => setSearchType('Satılık')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  searchType === 'Satılık'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                Satılık
              </button>
              <button
                type="button"
                onClick={() => setSearchType('Kiralık')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  searchType === 'Kiralık'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                Kiralık
              </button>
            </div>

            {/* Filter Inputs Grid */}
            <form onSubmit={handleHeroSearch} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Category Group Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Kategori
                  </label>
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full h-11 px-3 bg-white text-slate-900 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-xs"
                  >
                    <option value="all">Tüm Kategoriler</option>
                    <option value="Konut">Konut (Daire, Villa, Rezidans)</option>
                    <option value="Ticari">Ticari (Ofis, Plaza, Dükkan)</option>
                    <option value="Arsa">Arsa & Arazi</option>
                  </select>
                </div>

                {/* District Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    İlçe / Bölge
                  </label>
                  <select
                    value={searchDistrict}
                    onChange={(e) => setSearchDistrict(e.target.value)}
                    className="w-full h-11 px-3 bg-white text-slate-900 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-xs"
                  >
                    <option value="all">Tüm Bölgeler (İstanbul)</option>
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Keyword Search Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Anahtar Kelime
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      placeholder="Semt, proje, oda veya kelime..."
                      className="w-full h-11 pl-9 pr-3 bg-white text-slate-900 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-xs"
                    />
                    <span className="material-symbols-outlined absolute left-2.5 top-3 text-slate-400 text-[18px]">
                      search
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-300">
                  Şu an yayında <strong>{publicProperties.length}</strong> güncel gayrimenkul bulunmaktadır.
                </span>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 font-bold text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">search</span>
                  <span>İlanları Keşfet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. Featured Showcase Section (Vitrin İlanları) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-slate-200">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
              Vitrin Portföyü
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Öne Çıkan Gayrimenkuller
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Özel yetkili, seçkin konumlu ve yüksek yatırım potansiyeline sahip ilanlarımız
            </p>
          </div>

          <Link
            to="/ilanlar"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors group"
          >
            <span>Tüm İlanları Görüntüle ({publicProperties.length})</span>
            <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>

        {/* Featured Property Cards Grid */}
        {featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredProperties.map((prop) => (
              <PortalPropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl">apartment</span>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Şu Anda Yayınlanmış İlan Bulunmuyor
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Yeni portföyler eklenmektedir. Kriterlerinize uygun bir gayrimenkul geldiğinde anında haberdar olmak için talep bırakabilirsiniz.
            </p>
            <Link
              to="/talep-birak"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">edit_note</span>
              <span>Talep Bırak</span>
            </Link>
          </div>
        )}

        {/* Bottom Link */}
        {featuredProperties.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              to="/ilanlar"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 text-white font-bold text-xs sm:text-sm hover:bg-slate-800 transition-colors shadow-sm"
            >
              <span>Tüm Portföyümüzü İnceleyin ({publicProperties.length} İlan)</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        )}
      </section>

      {/* 3. Why EmlakPro (Corporate Trust Pillars) */}
      <section className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
              Neden EmlakPro?
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Kurumsal ve Şeffaf Gayrimenkul Deneyimi
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Gayrimenkul alım, satım ve kiralama süreçlerinizde profesyonel kadromuzla yanınızdayız.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Ekspertiz ve Değerleme</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Tüm portföylerimiz yerinde incelenir, bölge rayiç değerleri ve tapu uygunlukları
                titizlikle kontrol edilir.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">badge</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Lisanslı Uzman Danışmanlar</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Her semt ve kategoride uzmanlaşmış, sektör deneyimi yüksek profesyonel danışman kadrosu.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">handshake</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Hızlı ve Güvenli Tapu Süreci</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Sözleşmeden tapu devrine kadar tüm hukuki, belediye ve banka prosedürlerinde kesintisiz
                rehberlik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Corporate Call-to-Action Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-slate-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Gayrimenkulünüzü Değerinde Satmak veya Kiralamak İster Misiniz?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Portföyünüzü geniş alıcı kitlemize ulaştırmak ve ücretsiz fiyat ekspertizi almak için hemen
              bizimle iletişime geçin.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/iletisim"
              className="px-6 py-3 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-colors shadow-xs"
            >
              Bize Ulaşın
            </Link>
            <Link
              to="/talep-birak"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors shadow-xs"
            >
              Talep Bırakın
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
