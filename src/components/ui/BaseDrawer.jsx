import React, { useId } from 'react';
import { useModalBehavior } from '../../hooks/useModalBehavior';

const WIDTH_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
  full: 'max-w-full',
};

/**
 * EmlakPro Central BaseDrawer Component
 * Specifically built for true slide-out overlay drawers (PropertyDetailDrawer,
 * DealDetailDrawer, and mobile TaskDetailDrawer).
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether drawer is visible
 * @param {() => void} props.onClose - Dismiss callback
 * @param {string|React.ReactNode} [props.title] - Drawer header title (pass null to omit)
 * @param {string|React.ReactNode} [props.subtitle] - Drawer header subtitle
 * @param {'sm'|'md'|'lg'|'xl'|'full'|string} [props.width='lg'] - Drawer width preset
 * @param {React.ReactNode} props.children - Drawer content body
 * @param {React.ReactNode} [props.footer] - Bottom sticky action bar
 * @param {React.ReactNode} [props.header] - Custom full header node
 * @param {React.ReactNode} [props.customHeader] - Alias for custom header node
 * @param {React.ReactNode} [props.headerRight] - Custom actions in standard header
 * @param {boolean} [props.showCloseButton=true] - Whether to render 'X' button in standard header
 * @param {string} [props.className] - Container wrapper custom class
 * @param {string} [props.contentClassName] - Body scrollable area custom class
 * @param {string} [props.footerClassName] - Footer custom class
 * @param {boolean} [props.closeOnEsc=true] - Whether ESC key closes drawer
 * @param {boolean} [props.lockScroll=true] - Whether body scrolling is locked
 * @param {string} [props.ariaLabel] - Fallback accessible label if title is omitted
 */
export default function BaseDrawer({
  isOpen = false,
  onClose,
  title,
  subtitle,
  width = 'lg',
  children,
  footer,
  header,
  customHeader,
  headerRight,
  showCloseButton = true,
  className = '',
  contentClassName = '',
  footerClassName = '',
  closeOnEsc = true,
  lockScroll = true,
  ariaLabel,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const { handleBackdropClick } = useModalBehavior(isOpen, onClose, { closeOnEsc, lockScroll });

  if (!isOpen) return null;

  const maxWidthClass = WIDTH_CLASSES[width] || (width.startsWith('max-w-') ? width : 'max-w-xl');
  const activeCustomHeader = customHeader || header;
  const isStringTitle = typeof title === 'string' && title.trim().length > 0;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex justify-end bg-primary/40 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby={isStringTitle ? titleId : undefined}
      aria-describedby={subtitle && typeof subtitle === 'string' ? descriptionId : undefined}
      aria-label={!isStringTitle ? (ariaLabel || (typeof title === 'string' && title) || 'Yan Çekmece') : undefined}
    >
      <div
        className={`w-full ${maxWidthClass} h-full bg-surface-container-lowest shadow-2xl flex flex-col justify-between border-l border-surface-container transform transition-transform duration-300 ease-in-out animate-slideLeft ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar: Custom Header or Default Header */}
        {activeCustomHeader ? (
          <div className="sticky top-0 z-10 shrink-0 bg-surface-container-lowest/95 backdrop-blur border-b border-surface-container">
            {typeof activeCustomHeader === 'function'
              ? activeCustomHeader({ onClose, titleId, descriptionId })
              : activeCustomHeader}
          </div>
        ) : (
          (title || showCloseButton || headerRight) && (
            <div className="min-h-16 h-auto py-2.5 sm:py-3 px-space-md sm:px-space-lg flex items-center justify-between sticky top-0 bg-surface-container-lowest/95 backdrop-blur z-10 border-b border-surface-container shrink-0">
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="min-w-0">
                  {title && (
                    isStringTitle ? (
                      <h2 id={titleId} className="font-headline-sm text-base sm:text-headline-sm text-primary font-bold truncate">
                        {title}
                      </h2>
                    ) : (
                      <div id={titleId}>{title}</div>
                    )
                  )}
                  {subtitle && (
                    typeof subtitle === 'string' ? (
                      <p id={descriptionId} className="font-caption text-caption text-on-surface-variant truncate mt-0.5">
                        {subtitle}
                      </p>
                    ) : (
                      <div id={descriptionId}>{subtitle}</div>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {headerRight}
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 sm:p-2 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                    aria-label="Çekmeceyi Kapat"
                  >
                    <span className="material-symbols-outlined text-[20px] sm:text-[22px]">close</span>
                  </button>
                )}
              </div>
            </div>
          )
        )}

        {/* Scrollable Content Body */}
        <div className={`flex-1 overflow-y-auto ${contentClassName}`}>
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className={`p-space-md sm:p-space-lg bg-surface-container-low/50 border-t border-surface-container shrink-0 ${footerClassName}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

