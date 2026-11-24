import React from 'react';

/**
 * EmlakPro Central EmptyState Component
 * Displays consistent, accessible empty, search-not-found, filter-empty, and idle states
 * across all 8 screens and internal dashboard/widget lists.
 */
export default function EmptyState({
  type = 'empty', // 'empty' | 'search' | 'filter' | 'idle' | 'error' | 'custom'
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  compact = false,
  className = '',
  actionIcon,
}) {
  // Preset configurations based on standard UX states
  const presets = {
    search: {
      defaultIcon: 'search_off',
      defaultTitle: 'Aramanızla Eşleşen Kayıt Bulunamadı',
      defaultDesc:
        'Arama kriterlerinizi değiştirerek veya yazım kontrolü yaparak tekrar deneyebilirsiniz.',
      defaultAction: 'Aramayı Temizle',
      defaultActionIcon: 'close',
      iconColor: 'text-secondary',
      badgeBg: 'bg-secondary/10',
    },
    filter: {
      defaultIcon: 'filter_alt_off',
      defaultTitle: 'Kriterlere Uygun Sonuç Bulunamadı',
      defaultDesc:
        'Uygulanan filtre kombinasyonuna uygun kayıt bulunamadı. Filtreleri sıfırlayarak tüm listeyi görüntüleyebilirsiniz.',
      defaultAction: 'Filtreleri Sıfırla',
      defaultActionIcon: 'restart_alt',
      iconColor: 'text-secondary',
      badgeBg: 'bg-secondary/10',
    },
    empty: {
      defaultIcon: 'inbox',
      defaultTitle: 'Henüz Kayıt Bulunmuyor',
      defaultDesc:
        'Sistemde henüz listelenecek bir kayıt oluşturulmadı. Yeni bir işlem başlatarak ilk kaydınızı oluşturabilirsiniz.',
      defaultAction: 'Yeni Kayıt Ekle',
      defaultActionIcon: 'add',
      iconColor: 'text-primary',
      badgeBg: 'bg-primary/10',
    },
    idle: {
      defaultIcon: 'history_toggle_off',
      defaultTitle: 'Henüz Bir Aktivite Yok',
      defaultDesc:
        'Bu alanda gösterilecek geçmiş işlem veya hareket henüz gerçekleşmedi.',
      defaultAction: null,
      defaultActionIcon: null,
      iconColor: 'text-on-surface-variant',
      badgeBg: 'bg-surface-container',
    },
    error: {
      defaultIcon: 'error_outline',
      defaultTitle: 'Veriler Yüklenemedi',
      defaultDesc:
        'Kayıtlar listelenirken bir sorun oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.',
      defaultAction: 'Tekrar Dene',
      defaultActionIcon: 'refresh',
      iconColor: 'text-error',
      badgeBg: 'bg-error/10',
    },
    custom: {
      defaultIcon: 'folder_open',
      defaultTitle: 'Sonuç Bulunamadı',
      defaultDesc: '',
      defaultAction: null,
      defaultActionIcon: null,
      iconColor: 'text-primary',
      badgeBg: 'bg-primary/10',
    },
  };

  const currentPreset = presets[type] || presets.custom;

  const displayIcon = icon || currentPreset.defaultIcon;
  const displayTitle = title || currentPreset.defaultTitle;
  const displayDesc = description !== undefined ? description : currentPreset.defaultDesc;
  const displayAction = actionLabel !== undefined ? actionLabel : currentPreset.defaultAction;
  const displayActionIcon = actionIcon || currentPreset.defaultActionIcon;

  if (compact) {
    return (
      <div
        className={`py-8 px-4 flex flex-col items-center justify-center text-center text-on-surface-variant ${className}`}
        role="status"
        aria-label={displayTitle}
      >
        <div
          className={`w-12 h-12 rounded-xl ${currentPreset.badgeBg} flex items-center justify-center mb-2.5 transition-transform hover:scale-105`}
        >
          {typeof displayIcon === 'string' ? (
            <span className={`material-symbols-outlined text-[24px] ${currentPreset.iconColor}`}>
              {displayIcon}
            </span>
          ) : (
            displayIcon
          )}
        </div>

        <h4 className="font-label-md text-body-sm font-semibold text-on-surface mb-1">
          {displayTitle}
        </h4>

        {displayDesc && (
          <p className="font-caption text-caption text-on-surface-variant max-w-xs mb-3">
            {displayDesc}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap justify-center">
          {displayAction && onAction && (
            <button
              onClick={onAction}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-sm text-xs font-semibold transition-colors cursor-pointer border border-surface-container"
            >
              {displayActionIcon && (
                <span className="material-symbols-outlined text-[15px]">{displayActionIcon}</span>
              )}
              <span>{displayAction}</span>
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface font-label-sm text-xs transition-colors cursor-pointer"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-surface-container-lowest rounded-2xl shadow-sm p-8 sm:p-12 flex flex-col items-center justify-center text-center border border-surface-container-low min-h-[300px] sm:min-h-[340px] transition-all ${className}`}
      role="status"
      aria-label={displayTitle}
    >
      {/* Icon Circle */}
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${currentPreset.badgeBg} flex items-center justify-center mb-4 ring-1 ring-surface-container-high transition-transform hover:scale-105`}
      >
        {typeof displayIcon === 'string' ? (
          <span className={`material-symbols-outlined text-[32px] sm:text-[38px] ${currentPreset.iconColor}`}>
            {displayIcon}
          </span>
        ) : (
          displayIcon
        )}
      </div>

      {/* Title */}
      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2 max-w-md">
        {displayTitle}
      </h3>

      {/* Description */}
      {displayDesc && (
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-6">
          {displayDesc}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {displayAction && onAction && (
          <button
            onClick={onAction}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {displayActionIcon && (
              <span className="material-symbols-outlined text-[18px]">{displayActionIcon}</span>
            )}
            <span>{displayAction}</span>
          </button>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-outline/30 hover:bg-surface-container-low text-on-surface font-label-md font-medium transition-colors cursor-pointer"
          >
            <span>{secondaryActionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}

