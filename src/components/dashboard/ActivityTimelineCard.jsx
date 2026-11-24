import React, { useState, memo } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

function ActivityTimelineCard() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Dynamic activities (Clean Start: empty initial list)
  const [activities] = useLocalStorage('emlakpro_activities_v1', []);

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-md border border-surface-container-low">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[22px]">
            history
          </span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Son Aktiviteler &amp; Akış
          </h2>
        </div>
        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
      </div>

      {/* Timeline or Empty State */}
      {activities.length === 0 ? (
        <div className="py-8 px-4 text-center flex flex-col items-center justify-center gap-2 border border-dashed border-surface-container rounded-xl">
          <span className="material-symbols-outlined text-[36px] text-outline">
            history_toggle_off
          </span>
          <span className="font-label-md text-sm font-semibold text-primary">
            Henüz Aktivite Kaydı Yok
          </span>
          <p className="font-caption text-xs text-on-surface-variant max-w-xs leading-relaxed">
            Yeni müşteri, gayrimenkul veya randevu eklediğinizde işlem ve güncelleme geçmişiniz burada otomatik listelenecektir.
          </p>
        </div>
      ) : (
        <div className="relative flex flex-col gap-space-md pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container">
          {activities.map((act) => (
            <div key={act.id} className="relative flex flex-col gap-1">
              {/* Timeline bullet dot */}
              <span
                className={`absolute -left-[27px] top-0.5 w-3 h-3 rounded-full ${act.badgeColor || 'bg-secondary'} ring-4 ring-surface-container-lowest`}
              />

              {/* Content text */}
              <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                {act.user && (
                  <strong className="font-semibold text-primary mr-1">
                    {act.user}
                  </strong>
                )}
                {act.content && <span className="mr-1">{act.content}</span>}
                {act.action && <span className="mr-1">{act.action}</span>}
                {act.highlight && (
                  <span className="font-semibold text-secondary mr-1">
                    {act.highlight}
                  </span>
                )}
                {act.suffix && <span>{act.suffix}</span>}
              </p>

              {/* Time */}
              <span className="font-caption text-caption text-outline">
                {act.time}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Notification Toggle Footer */}
      <div className="p-space-sm bg-surface-container-low rounded-lg flex items-center justify-between border border-surface-container/60">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[20px]">
            {notificationsEnabled ? 'notifications_active' : 'notifications_off'}
          </span>
          <span className="font-label-sm text-label-sm text-on-surface font-medium">
            Masaüstü Anlık Bildirimler
          </span>
        </div>
        <button
          type="button"
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          className={`font-caption text-caption font-semibold px-2.5 py-1 rounded transition-colors shadow-xs ${
            notificationsEnabled
              ? 'text-secondary bg-surface-container-lowest hover:bg-surface-container'
              : 'text-on-surface-variant bg-surface-container hover:bg-surface-container-high'
          }`}
        >
          {notificationsEnabled ? 'Açık' : 'Kapalı'}
        </button>
      </div>
    </div>
  );
}

export default memo(ActivityTimelineCard);
