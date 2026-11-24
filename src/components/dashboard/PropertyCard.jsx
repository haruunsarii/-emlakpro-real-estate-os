import React, { useState, memo } from 'react';

function PropertyCard({ property, onSelect, _index = 0, isPriority = false }) {
  const [isFavorite, setIsFavorite] = useState(false);

  if (!property) return null;

  const propTitle = property.title || 'Gayrimenkul';
  const propType = property.type || 'Satılık';
  const propCategory = property.category || 'Konut';
  const propStatus = property.status || 'Aktif';
  const propStatusType = property.statusType || 'active';
  const propLocation =
    property.location ||
    (property.district ? `${property.district}, İstanbul` : 'İstanbul');
  const propArea =
    property.area ||
    (property.netArea ? `${property.netArea} m² net` : property.grossArea ? `${property.grossArea} m²` : '185 m²');
  const propRooms = property.rooms || '3+1';
  const propDeedStatus = property.deedStatus || 'Kat Mülkiyetli';
  const propPriceFormatted =
    property.priceFormatted ||
    (property.price ? `₺${Number(property.price).toLocaleString('tr-TR')}` : '₺0');
  const propPeriod = property.period || '';
  const propImage =
    property.image ||
    (Array.isArray(property.gallery) && property.gallery[0]?.image
      ? property.gallery[0].image
      : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop');

  const advisorName =
    typeof property.advisor === 'object' && property.advisor !== null
      ? property.advisor.name
      : typeof property.advisor === 'string'
        ? property.advisor
        : 'Danışman atanmadı';
  const avatarSrc =
    property.advisorAvatar || (typeof property.advisor === 'object' ? property.advisor?.avatar : null);
  const avatarInitials =
    property.advisorInitials ||
    (typeof advisorName === 'string' && advisorName !== 'Danışman atanmadı'
      ? advisorName
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
      : 'EP');

  const isRent = propType === 'Kiralık';

  return (
    <div
      onClick={() => onSelect && onSelect(property)}
      className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-space-md group border border-surface-container-low cursor-pointer"
    >
      {/* Property Image & Tags */}
      <div className="relative w-full sm:w-64 h-48 sm:h-auto rounded-lg overflow-hidden shrink-0 bg-surface-container">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={propImage}
          alt={propTitle}
          width="256"
          height="192"
          loading={isPriority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={isPriority ? 'high' : 'auto'}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';
          }}
        />

        {/* Type Tag (Satılık / Kiralık) */}
        <span
          className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full font-caption text-caption font-bold shadow-xs backdrop-blur-sm ${
            isRent
              ? 'bg-secondary-container text-on-secondary-container'
              : 'bg-surface-container-lowest/90 text-primary'
          }`}
        >
          {propType}
        </span>

        {/* Category Tag */}
        <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-primary-container/85 text-on-secondary-container font-caption text-caption backdrop-blur-xs">
          {propCategory}
        </span>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center text-on-surface hover:text-error transition-colors"
          aria-label="Favoriye Ekle"
        >
          <span className={`material-symbols-outlined text-[17px] ${isFavorite ? 'text-error fill' : ''}`}>
            favorite
          </span>
        </button>
      </div>

      {/* Property Main Info */}
      <div className="flex-1 flex flex-col justify-between py-1 gap-2">
        <div>
          {/* Header row: Title & Status */}
          <div className="flex items-start justify-between gap-space-sm">
            <h3 className="font-title-lg text-title-lg text-on-surface font-semibold group-hover:text-secondary transition-colors line-clamp-1">
              {propTitle}
            </h3>

            {/* Status Pill */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-caption text-caption bg-surface-container-high text-primary font-semibold shrink-0">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  propStatusType === 'new'
                    ? 'bg-secondary animate-ping'
                    : propStatusType === 'active'
                      ? 'bg-secondary-container'
                      : 'bg-secondary'
                }`}
              />
              {propStatus}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-[16px] text-outline">
              location_on
            </span>
            <span className="truncate">{propLocation}</span>
          </div>
        </div>

        {/* Specs Row */}
        <div className="flex items-center gap-space-md py-2 bg-surface rounded-lg px-space-sm flex-wrap border border-surface-container-low">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              square_foot
            </span>
            <span className="font-label-sm text-label-sm text-on-surface font-medium">
              {propArea}
            </span>
          </div>

          <span className="text-outline-variant">•</span>

          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              {String(propRooms).includes('Havuz')
                ? 'pool'
                : String(propRooms).includes('Bölüm')
                  ? 'meeting_room'
                  : 'bed'}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface font-medium">
              {propRooms}
            </span>
          </div>

          <span className="text-outline-variant">•</span>

          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              {String(propDeedStatus).includes('Otopark') ? 'local_parking' : 'verified'}
            </span>
            <span className="font-label-sm text-label-sm text-secondary font-medium">
              {propDeedStatus}
            </span>
          </div>
        </div>

        {/* Bottom Row: Advisor & Price */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {avatarSrc ? (
              <img
                className="w-6 h-6 rounded-full object-cover ring-1 ring-surface-variant"
                src={avatarSrc}
                alt={advisorName}
                width="24"
                height="24"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-surface-container-highest text-primary font-bold text-[10px] flex items-center justify-center">
                {avatarInitials}
              </div>
            )}
            <span className="font-caption text-caption text-on-surface-variant">
              Danışman: <strong className="text-on-surface font-medium">{advisorName}</strong>
            </span>
          </div>

          <div className="font-headline-sm text-headline-sm font-bold text-primary tabular-nums">
            {propPriceFormatted}{' '}
            {propPeriod && (
              <span className="text-body-sm font-normal text-on-surface-variant">
                {propPeriod}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(PropertyCard);
