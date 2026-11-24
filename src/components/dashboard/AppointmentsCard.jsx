import React, { useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../ui/EmptyState';
import { useLocalStorage } from '../../hooks/useLocalStorage';

function AppointmentsCard() {
  const navigate = useNavigate();
  const [appointments] = useLocalStorage('emlakpro_appointments_v1', []);

  const items = useMemo(() => {
    if (Array.isArray(appointments) && appointments.length > 0) {
      return appointments.slice(0, 3).map((a, idx) => ({
        id: a.id || `apt-${idx}`,
        time: a.startTime ? `${a.startTime} - ${a.endTime || ''}` : (a.time || '14:30'),
        title: a.title || 'Müşteri Randevusu',
        client: a.customerName || a.client || 'Müşteri',
        clientRole: a.categoryLabel ? `(${a.categoryLabel})` : (a.clientRole || ''),
        agent: a.advisor ? (a.advisor.length > 12 ? a.advisor.split(' ')[0] + ' ' + (a.advisor.split(' ')[1]?.[0] || '') + '.' : a.advisor) : (a.agent || 'Danışman'),
        tag: a.dayName || a.tag || 'Bu Hafta',
        icon: a.category === 'sozlesme' ? 'verified' : (a.icon || 'location_on'),
        clientIcon: 'person',
      }));
    }
    return [];
  }, [appointments]);

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-md border border-surface-container-low">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[22px]">
            event_available
          </span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Yaklaşan Randevular
          </h2>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-surface-container font-caption text-caption text-on-surface-variant font-medium">
          Güncel Takvim
        </span>
      </div>

      {/* Appointments List */}
      <div className="flex flex-col gap-space-sm">
        {items.length === 0 ? (
          <EmptyState
            type="empty"
            compact
            icon="event_busy"
            title="Yaklaşan Randevu Yok"
            description="Bugün veya bu hafta için planlanmış aktif randevu bulunmuyor."
            actionLabel="Randevu Oluştur"
            onAction={() => navigate('/gorevler-ve-randevular')}
          />
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate('/gorevler-ve-randevular')}
              className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col gap-2 border border-surface-container/60 cursor-pointer"
            >
              {/* Top row: Time & Tag */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 font-label-sm text-label-sm text-primary font-bold">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    {item.icon}
                  </span>
                  {item.time}
                </span>
                <span className="px-2 py-0.5 rounded-full font-caption text-caption bg-surface-container-highest text-secondary font-bold">
                  {item.tag}
                </span>
              </div>

              {/* Title */}
              <div className="font-label-md text-label-md text-on-surface font-semibold">
                {item.title}
              </div>

              {/* Bottom info: Client & Agent */}
              <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm pt-1 border-t border-surface-container/40">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">
                    {item.clientIcon || 'person'}
                  </span>
                  <span>
                    {item.client} {item.clientRole && <span className="text-outline text-[11px]">{item.clientRole}</span>}
                  </span>
                </span>
                <span className="text-caption font-medium text-secondary">
                  {item.agent}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default memo(AppointmentsCard);
