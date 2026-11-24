import React from 'react';
import BaseModal from './BaseModal';

/**
 * EmlakPro Unified Confirmation & Delete Modal
 * Replaces repetitive single-purpose delete modals across properties,
 * deals, requests, tasks, and settings with a consistent accessible dialog.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {() => void} props.onClose - Dismiss callback
 * @param {() => void} props.onConfirm - Action callback
 * @param {string} [props.title] - Warning title
 * @param {string} [props.description] - Detailed warning message
 * @param {Array<{ label: string, value: string | React.ReactNode }>} [props.itemDetails] - Preview info of item being deleted
 * @param {string} [props.confirmLabel='Evet, Sil'] - Primary action button text
 * @param {string} [props.cancelLabel='Vazgeç'] - Dismiss button text
 * @param {boolean} [props.isDestructive=true] - Red destructive styling vs neutral
 * @param {boolean} [props.isLoading=false] - Loading spinner state
 * @param {string} [props.icon='delete_forever'] - Material Symbols icon name
 */
export default function ConfirmDeleteModal({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Kaydı Silmek İstediğinize Emin misiniz?',
  description = 'Bu işlem geri alınamaz ve ilgili kayıt sistemden kalıcı olarak kaldırılacaktır.',
  itemDetails = [],
  confirmLabel = 'Evet, Sil',
  cancelLabel = 'Vazgeç',
  isDestructive = true,
  isLoading = false,
  icon = 'delete_forever',
  children,
}) {
  const footerContent = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md font-medium transition-colors cursor-pointer disabled:opacity-50"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isLoading}
        className={`px-5 py-2 rounded-lg font-label-md font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${isDestructive
            ? 'bg-error hover:bg-error/90 text-white shadow-error/20'
            : 'bg-primary hover:bg-primary-container text-white'
          }`}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="material-symbols-outlined text-[18px]">
            {isDestructive ? 'delete' : 'check'}
          </span>
        )}
        <span>{confirmLabel}</span>
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={footerContent}
      contentClassName="p-5 sm:p-6 flex flex-col gap-4 text-center sm:text-left"
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-error-container/30 text-error flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[28px]">{icon}</span>
        </div>

        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <h3 className="font-headline-sm text-base sm:text-headline-sm text-primary font-bold">
            {title}
          </h3>
          {description && (
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {Array.isArray(itemDetails) && itemDetails.length > 0 && (
        <div className="p-3.5 bg-surface rounded-xl border border-surface-container text-body-sm flex flex-col gap-2 mt-1">
          {itemDetails.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs sm:text-body-sm gap-2">
              <span className="font-caption text-caption text-on-surface-variant font-medium shrink-0">
                {item.label}
              </span>
              <span className="font-semibold text-primary truncate max-w-[240px] text-right">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {children}
    </BaseModal>
  );
}

