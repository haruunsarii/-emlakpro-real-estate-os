import React, { useId } from 'react';
import { useModalBehavior } from '../../hooks/useModalBehavior';

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  full: 'max-w-5xl',
};

/**
 * EmlakPro Central BaseModal Component
 * Standardizes modal overlays, ESC key handling, backdrop click isolation,
 * header layout, accessible labels, and safe scrolling.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {() => void} props.onClose - Dismiss callback
 * @param {string} [props.title] - Modal title
 * @param {string} [props.subtitle] - Modal secondary subtitle / description
 * @param {string} [props.icon] - Material Symbols icon name for header badge
 * @param {'sm'|'md'|'lg'|'xl'|'full'|string} [props.size='md'] - Max width preset
 * @param {React.ReactNode} props.children - Modal content body
 * @param {React.ReactNode} [props.footer] - Modal action buttons / footer area
 * @param {string} [props.className] - Container wrapper custom class
 * @param {string} [props.contentClassName] - Body scrollable area custom class
 * @param {boolean} [props.showCloseButton=true] - Whether to render 'X' button
 * @param {React.ReactNode} [props.headerRight] - Additional actions on header right
 * @param {boolean} [props.closeOnEsc=true] - Whether ESC key closes modal
 * @param {boolean} [props.lockScroll=true] - Whether body scrolling is locked
 * @param {string} [props.ariaLabel] - Fallback accessible label if title is omitted
 */
export default function BaseModal({
  isOpen = false,
  onClose,
  title,
  subtitle,
  icon,
  size = 'md',
  children,
  footer,
  className = '',
  contentClassName = '',
  showCloseButton = true,
  headerRight,
  closeOnEsc = true,
  lockScroll = true,
  ariaLabel,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const { handleBackdropClick } = useModalBehavior(isOpen, onClose, { closeOnEsc, lockScroll });

  if (!isOpen) return null;

  const maxWidthClass = SIZE_CLASSES[size] || (size.startsWith('max-w-') ? size : 'max-w-lg');

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-primary/40 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={subtitle ? descriptionId : undefined}
      aria-label={!title ? ariaLabel || 'İletişim Penceresi' : undefined}
    >
      <div
        className={`bg-surface-container-lowest w-full ${maxWidthClass} rounded-2xl shadow-2xl border border-surface-container overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton || headerRight) && (
          <div className="px-5 sm:px-6 py-4 border-b border-surface-container flex items-center justify-between bg-surface-container-low/60 shrink-0">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              {icon && (
                <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">{icon}</span>
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h3
                    id={titleId}
                    className="font-headline-sm text-base sm:text-headline-sm font-bold text-primary truncate"
                  >
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p
                    id={descriptionId}
                    className="font-caption text-caption text-on-surface-variant truncate mt-0.5"
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {headerRight}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 sm:p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                  aria-label="Kapat"
                >
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px]">close</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className={`overflow-y-auto flex-1 p-5 sm:p-6 ${contentClassName}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-surface-container-low/40 border-t border-surface-container shrink-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

