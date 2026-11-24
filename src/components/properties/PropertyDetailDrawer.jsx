import React, { useState } from 'react';
import BaseDrawer from '../ui/BaseDrawer';

export default function PropertyDetailDrawer({
  isOpen,
  property,
  onClose,
  onEdit,
  onDelete,
  onDownloadPdf,
  _onAddAppointment,
}) {
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);

  if (!isOpen || !property) return null;

  const galleryItems = property.gallery && property.gallery.length > 0
    ? property.gallery
    : [
      {
        label: 'Genel',
        count: '1 / 1 Fotoğraf',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000',
      },
    ];

  const currentHeroPhoto = galleryItems[activeThumbIndex] || galleryItems[0];

  const drawerTitle = (
    <div className="flex items-center gap-2">
      <span className="font-mono text-body-sm font-bold bg-surface-container text-primary px-2.5 py-1 rounded">
        {property.id}
      </span>
      <span className="font-label-md text-label-md text-primary font-bold">
        Hızlı Portföy Önizleme
      </span>
    </div>
  );

  const drawerFooter = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onDownloadPdf && onDownloadPdf(property)}
        className="flex-1 py-2.5 rounded-lg bg-surface hover:bg-surface-container text-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 transition-colors border border-surface-container cursor-pointer"
        type="button"
      >
        <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
        <span>PDF Sunum İndir</span>
      </button>

      <button
        onClick={() => onEdit && onEdit(property)}
        className="flex-1 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        type="button"
      >
        <span className="material-symbols-outlined text-[18px]">edit</span>
        <span>İlanı Düzenle</span>
      </button>

      <button
        onClick={() => onDelete && onDelete(property)}
        className="p-2.5 rounded-lg bg-error-container hover:bg-error hover:text-white text-on-error-container transition-colors cursor-pointer"
        title="İlanı Sil"
        aria-label="İlanı Sil"
        type="button"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    </div>
  );

  return (
    <BaseDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={drawerTitle}
      ariaLabel={`Portföy Önizleme: ${property.title || property.id}`}
      width="lg"
      footer={drawerFooter}
      footerClassName="p-space-md bg-surface-container-lowest shadow-lg border-t border-surface-container"
      contentClassName="p-space-lg flex flex-col gap-space-lg"
    >
      {/* 1. Hero Gallery Strip */}
      <div className="flex flex-col gap-2">
        <div className="relative h-64 rounded-xl overflow-hidden shadow-sm bg-surface-container">
          <img
            className="w-full h-full object-cover"
            src={currentHeroPhoto.image}
            alt={property.title}
            width="512"
            height="256"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';
            }}
          />
          <div className="absolute bottom-3 left-3 bg-primary-container/90 text-on-primary font-caption text-caption px-2.5 py-1 rounded-full backdrop-blur shadow-sm">
            {activeThumbIndex + 1} / {galleryItems.length} Fotoğraf ({currentHeroPhoto.label})
          </div>
        </div>

        {/* Thumbnails Row */}
        <div className="grid grid-cols-4 gap-2">
          {galleryItems.slice(0, 4).map((thumb, idx) => {
            const isActive = activeThumbIndex === idx;
            const isLast = idx === 3 && galleryItems.length > 4;

            return (
              <div
                key={idx}
                onClick={() => setActiveThumbIndex(idx)}
                className={`h-16 rounded-lg overflow-hidden cursor-pointer transition-all relative ${
                  isActive
                    ? 'ring-2 ring-secondary shadow-sm'
                    : 'opacity-70 hover:opacity-100 bg-surface-container'
                }`}
              >
                <img
                  className="w-full h-full object-cover"
                  src={thumb.image}
                  alt={thumb.label}
                  width="128"
                  height="64"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300';
                  }}
                />
                {isLast && (
                  <div className="absolute inset-0 bg-primary/60 flex items-center justify-center text-on-primary font-caption text-caption font-bold">
                    +{galleryItems.length - 3}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Headline & Price */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-secondary text-on-secondary font-semibold">
            {property.type} {property.category}
          </span>
          {property.tags && property.tags[1] && (
            <span className="px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container-high text-primary font-bold">
              {property.tags[1]}
            </span>
          )}
          <span className="font-caption text-caption text-on-surface-variant flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {property.location}
          </span>
        </div>

        <h2 className="font-headline-md text-headline-md text-primary font-bold mt-1">
          {property.title}
        </h2>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-currency-stat text-currency-stat text-primary font-bold">
            {property.priceFormatted}
          </span>
          <span className="font-body-md text-body-md text-on-surface-variant font-normal">
            (Pazarlık payı var • {property.unitPrice})
          </span>
        </div>
      </div>

      {/* 3. Contract Validity Alert */}
      <div className="p-space-md rounded-xl bg-surface-container-low shadow-xs flex items-start gap-3 border border-surface-container">
        <div className="w-9 h-9 rounded-lg bg-surface-container-high text-secondary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">
            assignment_turned_in
          </span>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-primary font-bold">
              Yetki Sözleşmesi Durumu
            </span>
            <span className="font-label-sm text-label-sm text-secondary bg-surface-container px-2 py-0.5 rounded-full font-semibold">
              {property.contract?.status || 'Aktif'}
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Sözleşme Bitiş: <strong>{property.contract?.endDate || '14 Ağustos 2024'}</strong>{' '}
            ({property.contract?.daysLeft || 72} gün kaldı). {property.contract?.note}
          </p>
        </div>
      </div>

      {/* 4. Property Specs Matrix (6 boxes) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col border border-surface-container/60">
          <span className="font-caption text-caption text-on-surface-variant uppercase text-[10px]">
            Net / Brüt
          </span>
          <span className="font-label-md text-label-md text-primary font-bold mt-0.5">
            {property.netArea ? `${property.netArea} m² / ${property.grossArea || property.netArea + 25} m²` : property.area}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col border border-surface-container/60">
          <span className="font-caption text-caption text-on-surface-variant uppercase text-[10px]">
            Oda Sayısı
          </span>
          <span className="font-label-md text-label-md text-primary font-bold mt-0.5">
            {property.rooms}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col border border-surface-container/60">
          <span className="font-caption text-caption text-on-surface-variant uppercase text-[10px]">
            Bulunduğu Kat
          </span>
          <span className="font-label-md text-label-md text-primary font-bold mt-0.5 truncate">
            {property.floorDetails || property.floor}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col border border-surface-container/60">
          <span className="font-caption text-caption text-on-surface-variant uppercase text-[10px]">
            Bina Yaşı
          </span>
          <span className="font-label-md text-label-md text-primary font-bold mt-0.5">
            {property.buildingAge}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col border border-surface-container/60">
          <span className="font-caption text-caption text-on-surface-variant uppercase text-[10px]">
            Isıtma
          </span>
          <span className="font-label-md text-label-md text-primary font-bold mt-0.5 truncate">
            {property.heating || 'Kombi (Doğalgaz)'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col border border-surface-container/60">
          <span className="font-caption text-caption text-on-surface-variant uppercase text-[10px]">
            Tapu Durumu
          </span>
          <span className="font-label-md text-label-md text-primary font-bold mt-0.5 truncate">
            {property.deedStatus || 'Kat Mülkiyeti'}
          </span>
        </div>
      </div>

      {/* 5. Detailed Features Checklist */}
      <div className="flex flex-col gap-2">
        <span className="font-label-md text-label-md text-primary font-bold">
          Öne Çıkan Nitelikler
        </span>
        <div className="grid grid-cols-2 gap-2">
          {(property.features || ['Balkon', 'Asansör', 'Otopark', 'Site İçi', 'Klima', 'Ebeveyn Banyosu']).map((feat, i) => (
            <div key={i} className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                check_circle
              </span>
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Description Text */}
      <div className="flex flex-col gap-1.5">
        <span className="font-label-md text-label-md text-primary font-bold">
          İlan Açıklaması
        </span>
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed bg-surface-container-low p-space-md rounded-lg border border-surface-container/60">
          {property.description || `${property.location} mevkiinde, merkezi lokasyonda, ferah ve aydınlık cepheli satılık lüks daire. Tüm ulaşım ağlarına, okul ve AVM merkezlerine yürüme mesafesindedir.`}
        </p>
      </div>

      {/* 7. Portal Entegrasyon Durumları */}
      <div className="flex flex-col gap-2">
        <span className="font-label-md text-label-md text-primary font-bold">
          Portal Entegrasyon Durumu
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-surface flex items-center justify-between border border-surface-container">
            <span className="font-label-sm text-label-sm font-semibold text-primary">
              Sahibinden
            </span>
            <span className="inline-flex items-center gap-1 font-caption text-caption text-secondary font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
              Yayında
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-surface flex items-center justify-between border border-surface-container">
            <span className="font-label-sm text-label-sm font-semibold text-primary">
              Hepsiemlak
            </span>
            <span className="inline-flex items-center gap-1 font-caption text-caption text-secondary font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
              Yayında
            </span>
          </div>
        </div>
      </div>

      {/* 8. Sorumlu Danışman Card */}
      <div className="p-space-md rounded-xl bg-surface flex items-center justify-between border border-surface-container">
        <div className="flex items-center gap-2.5">
          {property.advisor?.avatar ? (
            <img
              alt={property.advisor.name}
              className="w-10 h-10 rounded-full object-cover shadow-xs"
              src={property.advisor.avatar}
              width="40"
              height="40"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-secondary text-white font-bold flex items-center justify-center">
              {property.advisor?.name ? (
                property.advisor.name.trim().substring(0, 2).toUpperCase()
              ) : (
                <span className="material-symbols-outlined text-[20px]">person</span>
              )}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-semibold text-primary">
              {property.advisor?.name || 'Danışman atanmadı'}
            </span>
            <span className="font-caption text-caption text-on-surface-variant">
              {property.advisor?.title || (property.advisor?.name ? 'Yetkili Danışman' : 'Atama Bekliyor')}
            </span>
          </div>
        </div>

        <span className="font-caption text-caption text-secondary font-semibold bg-surface-container px-2 py-1 rounded">
          Yetkili Danışman
        </span>
      </div>
    </BaseDrawer>
  );
}
