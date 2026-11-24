import React from 'react';

export default function ReminderPanel({
  reminders = [],
  onActionClick,
}) {
  const urgentCount = reminders.filter((r) => r.isUrgent).length;

  const handleAction = (action, reminder) => {
    if (action.type === 'call' && action.phone) {
      window.open(`tel:${action.phone}`, '_self');
    } else if (action.type === 'whatsapp' && action.phone) {
      const msg = encodeURIComponent(
        `Merhaba, EmlakPro Danışmanlık olarak yeni yaşınızı en içten dileklerimizle kutlar, sağlıklı ve mutlu yıllar dileriz!`
      );
      window.open(`https://wa.me/${action.phone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
    } else {
      if (onActionClick) {
        onActionClick(action, reminder);
      }
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-space-md flex flex-col gap-space-sm">
      {/* Başlık ve Acil Rozeti */}
      <div className="flex items-center justify-between border-b border-surface-container pb-space-xs">
        <span className="font-caption text-caption uppercase text-on-surface-variant font-semibold tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-secondary">
            notifications_active
          </span>
          Kritik Hatırlatıcılar
        </span>
        {urgentCount > 0 && (
          <span className="font-caption text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold">
            {urgentCount} Acil
          </span>
        )}
      </div>

      {/* Hatırlatıcı Kartları */}
      <div className="flex flex-col gap-space-xs">
        {reminders.length === 0 ? (
          <div className="py-4 text-center text-xs text-on-surface-variant flex flex-col items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-[24px] text-outline">notifications_off</span>
            <span>Planlanmış kritik hatırlatıcı bulunmuyor.</span>
          </div>
        ) : (
          reminders.map((reminder) => (
          <div
            key={reminder.id}
            className={`p-space-sm rounded-lg flex items-start gap-space-xs border ${reminder.isUrgent
                ? 'bg-rose-50/50 border-rose-200/60'
                : 'bg-surface-container-low/50 border-surface-container'
              }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] mt-0.5 shrink-0 ${reminder.isUrgent ? 'text-rose-600' : 'text-secondary'
                }`}
            >
              {reminder.icon || 'info'}
            </span>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`font-label-sm text-xs font-bold truncate ${reminder.isUrgent ? 'text-rose-950' : 'text-primary'
                    }`}
                >
                  {reminder.title}
                </span>
                <span
                  className={`font-caption text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${reminder.badgeClass || 'bg-surface-container text-on-surface'
                    }`}
                >
                  {reminder.badge}
                </span>
              </div>

              <p
                className={`font-caption text-[11px] mt-0.5 leading-snug ${reminder.isUrgent ? 'text-rose-900' : 'text-on-surface-variant'
                  }`}
              >
                {reminder.description}
              </p>

              {/* Aksiyon Butonları */}
              {reminder.actions && reminder.actions.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {reminder.actions.map((act, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAction(act, reminder)}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${act.type === 'whatsapp'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : act.type === 'call'
                            ? 'bg-secondary hover:bg-secondary/90 text-white'
                            : 'bg-surface-container hover:bg-surface-container-high text-primary font-semibold'
                        }`}
                    >
                      {act.type === 'whatsapp' && (
                        <span className="material-symbols-outlined text-[13px]">chat</span>
                      )}
                      {act.type === 'call' && (
                        <span className="material-symbols-outlined text-[13px]">call</span>
                      )}
                      <span>{act.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}

