import React from 'react';
import { getAppointmentTypeConfig } from '../../utils/taskHelpers';

export default function AppointmentCard({
  appointment,
  isSelected = false,
  onClick,
  onEdit,
  onDelete,
  variant = 'calendar', // 'calendar' | 'compact' | 'agenda'
}) {
  if (!appointment) return null;

  const typeConfig = getAppointmentTypeConfig(appointment.type);

  if (variant === 'compact') {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(appointment);
        }}
        className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer transition-all flex items-center gap-1 ${typeConfig.chipBg
          } ${isSelected ? 'ring-2 ring-primary font-bold shadow-xs' : 'hover:opacity-80'}`}
        title={`${appointment.startTime} - ${appointment.title} (${appointment.clientName})`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${typeConfig.dotColor} shrink-0`} />
        <span className="truncate">{appointment.startTime} {appointment.title}</span>
      </div>
    );
  }

  if (variant === 'agenda') {
    return (
      <div
        onClick={() => onClick && onClick(appointment)}
        className={`p-space-sm rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-space-sm ${isSelected
            ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
            : 'border-surface-container bg-surface-container-lowest hover:border-outline-variant hover:shadow-xs'
          }`}
      >
        <div className="flex items-start gap-space-sm min-w-0 flex-1">
          {/* Sol Renk Çubuğu & Saat */}
          <div className="flex flex-col items-center justify-center min-w-[70px] py-1 px-2 rounded-lg bg-surface-container-low border border-surface-container">
            <span className="font-label-sm text-xs font-bold text-primary">{appointment.startTime}</span>
            <span className="font-caption text-[10px] text-on-surface-variant">{appointment.endTime}</span>
            <span className={`w-2 h-2 rounded-full mt-1 ${typeConfig.dotColor}`} />
          </div>

          {/* Orta Bilgiler */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded font-caption text-[10px] font-bold uppercase tracking-wider ${typeConfig.chipBg}`}>
                {appointment.type}
              </span>
              {appointment.status === 'completed' && (
                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-caption text-[10px] font-bold">
                  TAMAMLANDI
                </span>
              )}
              {appointment.status === 'cancelled' && (
                <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-caption text-[10px] font-bold">
                  İPTAL
                </span>
              )}
            </div>
            <h4 className="font-label-md text-sm font-bold text-primary mt-1 truncate">
              {appointment.title}
            </h4>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-on-surface-variant font-caption">
              {appointment.clientName && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">person</span>
                  <span className="font-medium text-on-surface">{appointment.clientName}</span>
                </span>
              )}
              {appointment.propertyTitle && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">home</span>
                  <span className="truncate max-w-[200px]">{appointment.propertyTitle}</span>
                  {appointment.propertyId && (
                    <span className="text-[10px] bg-surface-container px-1 rounded font-mono">
                      {appointment.propertyId}
                    </span>
                  )}
                </span>
              )}
              {appointment.location && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  <span className="truncate max-w-[180px]">{appointment.location}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sağ: Danışman & Hızlı Butonlar */}
        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-surface-container">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary text-[10px]">
              {appointment.advisorName?.charAt(0) || 'D'}
            </div>
            <span className="text-xs text-on-surface-variant font-medium">
              {appointment.advisorName}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(appointment);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                title="Düzenle"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(appointment);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-on-surface-variant hover:text-rose-600 transition-colors cursor-pointer"
                title="Sil"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Varsayılan: Takvim Hücresi Kartı (Haftalık / Günlük Grid İçin)
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(appointment);
      }}
      className={`h-full w-full p-2 rounded-lg shadow-xs flex flex-col justify-between cursor-pointer transition-all border ${typeConfig.bgColor
        } ${typeConfig.borderColor} ${isSelected
          ? 'ring-2 ring-primary ring-offset-1 shadow-md'
          : 'hover:shadow-sm hover:brightness-95'
        }`}
    >
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span
            className={`font-caption text-[10px] font-bold uppercase tracking-wider truncate ${typeConfig.textColor}`}
          >
            {appointment.type}
          </span>
          {appointment.propertyId && (
            <span className="font-caption text-[9px] px-1 rounded bg-black/5 font-mono text-on-surface-variant">
              {appointment.propertyId}
            </span>
          )}
        </div>
        <p className="font-label-sm text-[12px] font-bold text-primary leading-tight mt-0.5 line-clamp-1">
          {appointment.title}
        </p>
        <span className="font-caption text-[11px] text-on-surface-variant truncate block mt-0.5">
          {appointment.clientName}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-black/5 mt-1">
        <span className="font-caption text-[10px] text-on-surface-variant font-medium truncate max-w-[70px]">
          {appointment.advisorName}
        </span>
        <span
          className={`font-caption text-[10px] px-1 rounded font-semibold ${typeConfig.textColor
            } bg-white/70`}
        >
          {appointment.startTime}
        </span>
      </div>
    </div>
  );
}

