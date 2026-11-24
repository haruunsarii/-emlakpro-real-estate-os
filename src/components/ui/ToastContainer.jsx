import React from 'react';
import Toast from './Toast';

export default function ToastContainer({ toasts = [], onClose }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Sistem Bildirimleri"
      aria-live="polite"
      className="fixed top-4 right-4 z-[9999] pointer-events-none flex flex-col gap-2.5 max-w-[calc(100vw-2rem)] sm:max-w-[400px] w-full sm:w-auto items-end"
      data-testid="toast-container"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          action={toast.action}
          onClose={onClose}
        />
      ))}
    </div>
  );
}

