import React, { useState, useEffect, useRef, useCallback } from 'react';

const TOAST_TYPES = {
  success: {
    icon: 'check_circle',
    title: 'Başarılı',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-200/80',
    borderColor: 'border-emerald-500/30',
    progressBarColor: 'bg-emerald-500',
    role: 'status',
  },
  error: {
    icon: 'error',
    title: 'Hata',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50 border-rose-200/80',
    borderColor: 'border-rose-500/30',
    progressBarColor: 'bg-rose-500',
    role: 'alert',
  },
  warning: {
    icon: 'warning',
    title: 'Uyarı',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-200/80',
    borderColor: 'border-amber-500/30',
    progressBarColor: 'bg-amber-500',
    role: 'alert',
  },
  info: {
    icon: 'info',
    title: 'Bilgi',
    iconColor: 'text-secondary',
    iconBg: 'bg-secondary-fixed/40 border-secondary-fixed',
    borderColor: 'border-secondary/30',
    progressBarColor: 'bg-secondary',
    role: 'status',
  },
};

export default function Toast({
  id,
  type = 'success',
  title,
  message,
  duration = 3500,
  onClose,
  action,
}) {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const remainingTimeRef = useRef(duration);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  const config = TOAST_TYPES[type] || TOAST_TYPES.info;
  const displayTitle = title || config.title;

  const handleClose = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      if (onClose) onClose(id);
    }, 200);
  }, [id, isExiting, onClose]);

  // Timer logic with pause/resume support
  useEffect(() => {
    if (duration <= 0) return; // Persistent toast

    if (isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      handleClose();
    }, remainingTimeRef.current);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, isPaused, handleClose]);

  const handleMouseEnter = () => {
    if (duration <= 0) return;
    setIsPaused(true);
    const now = Date.now();
    const elapsed = startTimeRef.current ? now - startTimeRef.current : 0;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    if (duration <= 0) return;
    setIsPaused(false);
  };

  return (
    <div
      role={config.role}
      aria-atomic="true"
      data-testid="toast-item"
      data-toast-type={type}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto relative w-full sm:w-[380px] max-w-full bg-surface-container-lowest rounded-xl shadow-xl border ${config.borderColor} p-3.5 sm:p-4 overflow-hidden transition-all duration-200 select-none ${isExiting ? 'animate-toast-out' : 'animate-toast-in'
        }`}
    >
      <div className="flex items-start gap-3">
        {/* Type Icon */}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${config.iconBg} ${config.iconColor}`}
        >
          <span className="material-symbols-outlined text-[20px]">{config.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-md text-xs sm:text-sm font-bold text-primary">
              {displayTitle}
            </span>
          </div>
          <p className="font-body-sm text-xs sm:text-[13px] text-on-surface-variant leading-relaxed mt-0.5 break-words">
            {message}
          </p>

          {/* Action button if provided */}
          {action && action.label && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => {
                  if (action.onClick) action.onClick();
                  handleClose();
                }}
                className="font-label-sm text-xs font-bold text-secondary hover:underline cursor-pointer"
              >
                {action.label}
              </button>
            </div>
          )}
        </div>

        {/* Manual Dismiss Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Bildirimi Kapat"
          className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container p-1 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Subtle Progress Bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-surface-container-low overflow-hidden">
          <div
            className={`h-full ${config.progressBarColor} opacity-70 transition-all`}
            style={{
              animation: `toastProgress ${duration}ms linear forwards`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          />
        </div>
      )}
    </div>
  );
}

