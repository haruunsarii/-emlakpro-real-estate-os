import React, { useState, useCallback, useEffect, useRef } from 'react';
import ToastContainer from '../components/ui/ToastContainer';
import { ToastContext } from './ToastContextCore';

const MAX_TOASTS = 5;
const DEDUPLICATION_WINDOW_MS = 1800;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const recentToastsRef = useRef(new Map());

  // Remove toast by id
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Clear all toasts
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Core showToast function
  const showToast = useCallback((message, typeOrOptions = 'success', options = {}) => {
    if (!message) return null;

    let type = 'success';
    let opts = {};

    if (typeof typeOrOptions === 'string') {
      type = typeOrOptions;
      opts = options || {};
    } else if (typeof typeOrOptions === 'object') {
      opts = typeOrOptions;
      type = opts.type || 'success';
    }

    const dedupeKey = `${type}:${message.trim()}`;
    const now = Date.now();
    const lastSeen = recentToastsRef.current.get(dedupeKey);

    // Prevent immediate duplicate spam
    if (lastSeen && now - lastSeen < DEDUPLICATION_WINDOW_MS) {
      return null;
    }
    recentToastsRef.current.set(dedupeKey, now);

    // Prune old dedupe keys periodically
    if (recentToastsRef.current.size > 50) {
      for (const [key, timestamp] of recentToastsRef.current.entries()) {
        if (now - timestamp > 5000) {
          recentToastsRef.current.delete(key);
        }
      }
    }

    const id = `toast-${now}-${Math.random().toString(36).substr(2, 6)}`;
    const newToast = {
      id,
      type,
      message,
      title: opts.title,
      duration: opts.duration !== undefined ? opts.duration : type === 'error' ? 4500 : 3500,
      action: opts.action,
    };

    setToasts((prev) => {
      // Keep only up to MAX_TOASTS - 1 to make room for newToast
      const trimmed = prev.length >= MAX_TOASTS ? prev.slice(prev.length - MAX_TOASTS + 1) : prev;
      return [...trimmed, newToast];
    });

    return id;
  }, []);

  // Shortcut helpers
  const toastHelpers = {
    success: (msg, opts) => showToast(msg, 'success', opts),
    error: (msg, opts) => showToast(msg, 'error', opts),
    warning: (msg, opts) => showToast(msg, 'warning', opts),
    info: (msg, opts) => showToast(msg, 'info', opts),
  };

  // Listen for window-level custom events ('emlakpro_toast')
  useEffect(() => {
    const handleCustomToast = (event) => {
      if (event.detail && event.detail.message) {
        showToast(event.detail.message, event.detail.type || 'info', event.detail.options);
      }
    };
    window.addEventListener('emlakpro_toast', handleCustomToast);
    return () => {
      window.removeEventListener('emlakpro_toast', handleCustomToast);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        toast: toastHelpers,
        removeToast,
        clearToasts,
        toasts,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export default ToastProvider;

