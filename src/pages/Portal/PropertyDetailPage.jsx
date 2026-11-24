import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useToast } from '../../hooks/useToast';
import {
  isPropertyPubliclyVisible,
  sanitizePropertyForPortal,
  getPublicAdvisorForProperty,
} from '../../utils/portalHelpers';
import { generatePropertyPdf } from '../../utils/pdfGenerator';
import PortalPhotoGallery from '../../components/portal/PortalPhotoGallery';
import PropertySpecsTable from '../../components/portal/PropertySpecsTable';
import PortalConsultantCard from '../../components/portal/PortalConsultantCard';
import PropertyLocationMap from '../../components/portal/PropertyLocationMap';
import SimilarProperties from '../../components/portal/SimilarProperties';

const PROPERTIES_STORAGE_KEY = 'emlakpro_properties_v1';
const SETTINGS_STORAGE_KEY = 'emlakpro_settings_v1';

/**
 * PropertyDetailPage Component
 * Public Customer Portal Property Detail Page (/ilanlar/:id) (Aşama 7.3)
 *
 * Rules:
 * - Enforces isPropertyPubliclyVisible(): non-published or passive records render 404 state.
 * - Sanitizes internal CRM data via sanitizePropertyForPortal().
 * - Associates responsible advisor via getPublicAdvisorForProperty() without leaking internal credentials.
 * - Photo gallery with thumbnails, fullscreen lightbox, genuine specs table, location, and similar properties.
 */
export default function PropertyDetailPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [properties] = useLocalStorage(PROPERTIES_STORAGE_KEY, []);
  const [settings] = useLocalStorage(SETTINGS_STORAGE_KEY, {});
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // 1. Find raw property in local storage
  const rawProperty = useMemo(() => {
    if (!id || !Array.isArray(properties)) return null;
    return properties.find((p) => p.id === id) || null;
  }, [id, properties]);

  // 2. Strict Public Visibility Gate
  const isVisible = useMemo(() => {
    return isPropertyPubliclyVisible(rawProperty);
  }, [rawProperty]);

  // 3. Sanitized Public Property & Associated Advisor
  const property = useMemo(() => {
    if (!rawProperty || !isVisible) return null;
    return sanitizePropertyForPortal(rawProperty);
  }, [rawProperty, isVisible]);

  const advisor = useMemo(() => {
    if (!rawProperty || !isVisible) return null;
    return getPublicAdvisorForProperty(rawProperty, settings?.users, settings?.office);
  }, [rawProperty, isVisible, settings]);

  // Copy shareable link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast?.('İlan bağlantısı panoya kopyalandı.', 'success');
    } catch {
      showToast?.('Bağlantı kopyalanamadı, lütfen tarayıcı adresini kopyalayınız.', 'warning');
    }
  };

  // Generate PDF or Print
  const handlePrintOrPdf = async () => {
    if (!rawProperty) return;
    setIsGeneratingPdf(true);
    try {
      await generatePropertyPdf(rawProperty);
      showToast?.('İlan PDF broşürü başarıyla oluşturuldu.', 'success');
    } catch {
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 4. If property does not exist OR is not publicly published -> Render 404
  if (!property || !isVisible) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
        {/* Top Banner */}
        <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto">
            <nav className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <Link to="/" className="hover:text-amber-400 transition-colors">
                Ana Sayfa
              </Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <Link to="/ilanlar" className="hover:text-amber-400 transition-colors">
                İlanlar
              </Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-slate-200">İlan Detayı</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">İlan Detay Görünümü</h1>
          </div>
        </div>

        {/* 404 Notice Card */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-14 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <span className="material-symbols-outlined text-3xl">search_off</span>
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-3">
              İlan Referans No: {id || 'Belirtilmedi'}
            </span>

            <h2 className="text-2xl font-bold text-slate-950 mb-2">
              İlan Bulunamadı veya Yayından Kaldırıldı
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto mb-8 leading-relaxed">
              İncelemek istediğiniz gayrimenkul kaydı sistemimizde mevcut değil ya da satış/kiralama süreci
              tamamlanarak yayından kaldırılmış olabilir. Güncel portföyümüzü inceleyebilir veya kriterlerinize uygun
              gayrimenkul için özel talep bırakabilirsiniz.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/ilanlar"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">view_list</span>
                <span>Tüm İlanları Görüntüle</span>
              </Link>
              <Link
                to="/talep-birak"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                <span>Özel Talep Bırakın</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. Active and Valid Property Presentation
  const displayLocation =
    property.location ||
    [property.neighborhood, property.district, property.city || 'İstanbul']
      .filter(Boolean)
      .join(', ');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      {/* 1. Breadcrumb & Header Bar */}
      <div className="bg-slate-900 text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-3 flex-wrap" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-amber-400 transition-colors">
              Ana Sayfa
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link to="/ilanlar" className="hover:text-amber-400 transition-colors">
              İlanlar & Portföy
            </Link>
            {property.district && (
              <>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <Link
                  to={`/ilanlar?ilce=${encodeURIComponent(property.district)}`}
                  className="hover:text-amber-400 transition-colors"
                >
                  {property.district}
                </Link>
              </>
            )}
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-slate-200 font-medium truncate max-w-xs">#{property.id}</span>
          </nav>

          {/* Title, Badges & Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-4xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
                  İlan No: #{property.id}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    property.type === 'Kiralık'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {property.type}
                </span>

                {property.status === 'Yeni İlan' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                    Yeni İlan
                  </span>
                )}

                {property.category && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                    {property.category}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {property.title}
              </h1>

              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400">
                <span className="material-symbols-outlined text-slate-400 text-[18px]">
                  location_on
                </span>
                <span>{displayLocation}</span>
              </div>
            </div>

            {/* Quick Actions (Share & PDF) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                title="İlan Bağlantısını Kopyala"
              >
                <span className="material-symbols-outlined text-[16px]">share</span>
                <span>Paylaş</span>
              </button>

              <button
                type="button"
                onClick={handlePrintOrPdf}
                disabled={isGeneratingPdf}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700 disabled:opacity-50"
                title="PDF Broşürü İndir veya Yazdır"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>{isGeneratingPdf ? 'Hazırlanıyor...' : 'Yazdır / PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Gallery, Specs, Description, Location (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Rich Photo Gallery */}
            <PortalPhotoGallery property={property} />

            {/* Technical Specifications Table */}
            <PropertySpecsTable property={property} />

            {/* Location & Region Map */}
            <PropertyLocationMap property={property} />
          </div>

          {/* Right Column: Sticky Sidebar / Price & Advisor Card (4 cols) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Price Box Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Portföy Fiyatı
              </span>
              <div className="text-3xl font-black text-slate-950 tracking-tight">
                {property.formattedPrice || property.priceFormatted || '₺0'}
              </div>

              {property.unitPrice && (
                <div className="text-xs font-medium text-slate-500 mt-1">
                  Birim Fiyat: {property.unitPrice}
                </div>
              )}

              {/* Quick Specs summary */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
                {property.rooms && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Oda</span>
                    <span className="font-bold text-slate-900">{property.rooms}</span>
                  </div>
                )}
                {(property.netArea || property.grossArea) && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Alan</span>
                    <span className="font-bold text-slate-900">{property.netArea || property.grossArea} m²</span>
                  </div>
                )}
              </div>
            </div>

            {/* Responsible Consultant Card */}
            <PortalConsultantCard property={property} advisor={advisor} />
          </aside>
        </div>

        {/* 3. Similar Properties Recommendation Showcase */}
        <SimilarProperties currentProperty={property} allProperties={properties} />
      </div>
    </div>
  );
}
