import { useEffect, useCallback } from 'react';

/**
 * useModalBehavior hook
 * Standardizes modal and floating drawer lifecycle behaviors:
 * 1. Closes modal on keyboard 'Escape' key press.
 * 2. Locks body scrolling (`overflow: hidden`) when modal is open and restores previous overflow on close/unmount.
 * 3. Provides a clean `handleBackdropClick` callback for closing only when clicking the backdrop container itself.
 *
 * @param {boolean} isOpen - Whether the modal/drawer is open
 * @param {() => void} onClose - Callback when modal requested to close
 * @param {object} [options]
 * @param {boolean} [options.closeOnEsc=true]
 * @param {boolean} [options.lockScroll=true]
 * @returns {{ handleBackdropClick: (e: React.MouseEvent) => void }}
 */
export function useModalBehavior(isOpen, onClose, options = {}) {
  const { closeOnEsc = true, lockScroll = true } = options;

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen || !closeOnEsc || typeof onClose !== 'function') return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEsc, onClose]);

  // Body scroll lock management
  useEffect(() => {
    if (!isOpen || !lockScroll) return;

    // Track active modals count on window to avoid unlocking prematurely when multiple overlays exist
    window.__emlakpro_active_modals = (window.__emlakpro_active_modals || 0) + 1;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.__emlakpro_active_modals = Math.max(0, (window.__emlakpro_active_modals || 1) - 1);
      if (window.__emlakpro_active_modals === 0) {
        document.body.style.overflow = originalOverflow || '';
      }
    };
  }, [isOpen, lockScroll]);

  // Safe backdrop click handler
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget && typeof onClose === 'function') {
        onClose();
      }
    },
    [onClose]
  );

  return { handleBackdropClick };
}

export default useModalBehavior;

