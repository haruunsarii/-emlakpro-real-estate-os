import React, { useState, memo } from 'react';

function PropertyCardRich({
  property,
  onOpenDetail,
  onEdit,
  onDelete,
  onSendPdf,
  onShareWhatsapp,
  onToggleBookmark,
  isBookmarked = false,
  isPriority = false,
}) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const currentPhoto =
    property.gallery && property.gallery[activePhotoIndex]
      ? property.gallery[activePhotoIndex]
      : {
        image: property.gallery?.[0]?.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        count: '1/1 Fotoğraf',
        label: 'Genel',
      };

  return (
    <div className="rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group border border-surface-container-low">
      {/* 1. Hero Image Container */}
      <div className="relative h-64 w-full overflow-hidden bg-surface-container">
        <img
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          src={currentPhoto.image}
          width="400"
          height="256"
          loading={isPriority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={isPriority ? 'high' : 'auto'}
          onClick={() => onOpenDetail(property)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-10">
          <span
            className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold shadow-xs flex items-center gap-1 ${property.type === 'Kiralık'
                ? 'bg-primary-container text-on-primary'
                : 'bg-secondary text-on-secondary'
              }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${property.type === 'Kiralık' ? 'bg-secondary-fixed' : 'bg-surface-bright'
                }`}
            />
            {property.type}
          </span>

          {property.tags && property.tags[1] && (
            <span className="px-2.5 py-1 rounded-full font-label-sm text-label-sm bg-surface-container-highest text-primary font-bold shadow-xs">
              {property.tags[1]}
            </span>
          )}
        </div>

        {/* Top Right Counter & Bookmark */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full font-caption text-caption bg-primary-container/80 backdrop-blur text-on-primary font-bold shadow-xs">
            {currentPhoto.count || property.photoCount || '1/15 Fotoğraf'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(property.id);
            }}
            className={`w-8 h-8 rounded-full backdrop-blur flex items-center justify-center transition-colors shadow-xs cursor-pointer ${isBookmarked
                ? 'bg-secondary text-white'
                : 'bg-surface-container-lowest/80 hover:bg-surface-container-lowest text-primary'
              }`}
            title="Favorilere Ekle"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isBookmarked ? 'bookmark' : 'bookmark_border'}
            </span>
          </button>
        </div>

        {/* Bottom Left & Right Info Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-on-primary z-10">
          <div className="flex items-center gap-1 font-caption text-caption bg-primary-container/80 backdrop-blur px-2.5 py-1 rounded shadow-xs truncate max-w-[200px]">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            <span className="truncate">{property.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-caption text-caption bg-secondary text-on-secondary font-bold px-2 py-0.5 rounded shadow-xs">
              {currentPhoto.label}
            </span>
            <span className="font-caption text-caption bg-surface-container-lowest/90 text-primary font-mono font-bold px-2 py-0.5 rounded shadow-xs">
              {property.id}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Gallery Quick Switcher Bar */}
      {property.gallery && property.gallery.length > 1 && (
        <div className="px-space-sm py-1.5 bg-surface-container-low flex items-center justify-between gap-1 border-b border-surface-container">
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {property.gallery.map((item, idx) => {
              const isActive = activePhotoIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`px-2 py-1 rounded font-caption text-caption flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${isActive
                      ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface font-medium'
                    }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {item.icon || 'photo'}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onOpenDetail(property)}
            className="px-2 py-1 rounded font-caption text-caption text-secondary font-bold hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[14px]">collections</span>
            +14
          </button>
        </div>
      )}

      {/* 3. Card Body */}
      <div className="p-space-md flex flex-col flex-1 justify-between gap-space-sm">
        <div>
          {/* Price & Unit Price */}
          <div className="flex items-baseline justify-between gap-2">
            <div className="font-currency-stat text-currency-stat text-primary font-bold">
              {property.priceFormatted}
            </div>
            <span className="font-caption text-caption text-on-surface-variant font-medium">
              {property.unitPrice}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onOpenDetail(property)}
            className="font-headline-sm text-headline-sm text-primary font-bold mt-1 line-clamp-2 hover:text-secondary cursor-pointer transition-colors"
          >
            {property.title}
          </h3>

          {/* Specs Pills */}
          <div className="flex items-center gap-1.5 flex-wrap mt-3 font-body-sm text-body-sm text-on-surface-variant">
            <span className="inline-flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                square_foot
              </span>
              {property.netArea ? `${property.netArea} m² net` : property.area}
            </span>
            <span className="inline-flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                {property.category === 'İmarlı Arsa'
                  ? 'landscape'
                  : property.category === 'Villa / Köşk'
                    ? 'villa'
                    : 'bed'}
              </span>
              {property.rooms}
            </span>
            <span className="inline-flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                stairs
              </span>
              {property.floor}
            </span>
            <span className="inline-flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                verified
              </span>
              {property.deedStatus}
            </span>
          </div>
        </div>

        {/* 4. CRM Smart Matching Bar */}
        <div
          onClick={() => onOpenDetail(property)}
          className="p-2.5 rounded-lg bg-surface-container flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">
              {property.type === 'Kiralık' ? 'corporate_fare' : 'local_fire_department'}
            </span>
            <span className="font-label-sm text-label-sm text-primary font-bold">
              {property.matchedLabel || `${property.matchedCount || 3} Eşleşen Talep`}
            </span>
          </div>
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
            arrow_forward
          </span>
        </div>

        {/* 5. Footer: Advisor & Action CTAs */}
        <div className="pt-3 flex items-center justify-between border-t border-surface-container-low">
          {/* Advisor info */}
          <div className="flex items-center gap-2">
            {property.advisor?.avatar ? (
              <img
                alt={property.advisor.name}
                className="w-7 h-7 rounded-full object-cover shadow-xs"
                src={property.advisor.avatar}
                width="28"
                height="28"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-secondary text-white font-bold text-xs flex items-center justify-center">
                {property.advisor?.name ? (
                  property.advisor.name.trim().substring(0, 2).toUpperCase()
                ) : (
                  <span className="material-symbols-outlined text-[15px]">person</span>
                )}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-primary font-semibold leading-none">
                {property.advisor?.name || 'Danışman atanmadı'}
              </span>
              <span className="font-caption text-caption text-on-surface-variant leading-none mt-0.5">
                {property.advisor?.title || (property.advisor?.name ? 'Danışman' : 'Atama Bekliyor')}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSendPdf(property)}
              className="w-8 h-8 rounded-lg bg-surface hover:bg-surface-container text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
              title="Sunum Oluştur"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            </button>

            <button
              onClick={() => onShareWhatsapp(property)}
              className="w-8 h-8 rounded-lg bg-surface hover:bg-surface-container text-on-surface-variant hover:text-secondary flex items-center justify-center transition-colors cursor-pointer"
              title="WhatsApp ile Paylaş"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
            </button>

            <button
              onClick={() => onEdit(property)}
              className="w-8 h-8 rounded-lg bg-surface hover:bg-surface-container text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
              title="İlanı Düzenle"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>

            <button
              onClick={() => onDelete(property)}
              className="w-8 h-8 rounded-lg bg-surface hover:bg-error-container text-on-surface-variant hover:text-error flex items-center justify-center transition-colors cursor-pointer"
              title="İlanı Sil"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>

            <button
              onClick={() => onOpenDetail(property)}
              className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary font-label-sm text-label-sm text-primary font-semibold transition-all cursor-pointer ml-0.5"
              type="button"
            >
              Detay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(PropertyCardRich);

