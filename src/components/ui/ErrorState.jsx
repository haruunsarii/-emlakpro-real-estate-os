import React from 'react';

/**
 * EmlakPro Central ErrorState Component
 * Displays helpful, graceful error messages without leaking technical stack traces
 * while preserving console logging for developer debugging.
 */
export default function ErrorState({
  title = 'Beklenmeyen Bir Hata Oluştu',
  description = 'İşlem gerçekleştirilirken veya veriler yüklenirken bir sorun oluştu. Verileriniz güvendedir.',
  error = null,
  onRetry = null,
  retryLabel = 'Tekrar Dene',
  secondaryActionLabel = 'Sayfayı Yenile',
  onSecondaryAction = () => window.location.reload(),
  compact = false,
  className = '',
}) {
  if (error && typeof console !== 'undefined' && console.error) {
    console.error('[EmlakPro ErrorState Captured]:', error);
  }

  if (compact) {
    return (
      <div
        className={`py-8 px-4 flex flex-col items-center justify-center text-center text-on-surface-variant ${className}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center text-error mb-2">
          <span className="material-symbols-outlined text-[24px]">error_outline</span>
        </div>
        <h4 className="font-label-md text-body-sm font-semibold text-error mb-1">
          {title}
        </h4>
        {description && (
          <p className="font-caption text-caption text-on-surface-variant max-w-xs mb-3">
            {description}
          </p>
        )}
        <div className="flex items-center gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-error font-label-sm text-xs font-semibold transition-colors cursor-pointer border border-error/20"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              <span>{retryLabel}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-surface-container-lowest rounded-2xl shadow-sm p-8 sm:p-12 flex flex-col items-center justify-center text-center border border-error/20 min-h-[320px] transition-all ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-error/10 flex items-center justify-center text-error mb-4 ring-1 ring-error/20">
        <span className="material-symbols-outlined text-[36px] sm:text-[42px]">
          report_problem
        </span>
      </div>

      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2 max-w-md">
        {title}
      </h3>

      {description && (
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-6">
          {description}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            <span>{retryLabel}</span>
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

