import React from 'react';

export default function NotificationSettingsSection({
  notifications = {},
  onChange,
  onToast,
}) {
  const handleToggle = (key) => {
    const updated = {
      ...notifications,
      [key]: !notifications[key],
    };
    if (onChange) onChange(updated);
    if (onToast) {
      const stateStr = updated[key] ? 'etkinleştirildi' : 'kapatıldı';
      onToast(`Bildirim tercihi ${stateStr}.`);
    }
  };

  const notificationItems = [
    {
      key: 'newCustomer',
      title: 'Yeni Müşteri Bildirimi',
      description: 'Yeni müşteri kaydı oluşturulduğunda veya portal entegrasyonundan yeni alıcı/satıcı geldiğinde anlık uyarı ver.',
      icon: 'person_add',
      color: 'text-primary',
    },
    {
      key: 'newDemand',
      title: 'Yeni Müşteri Talebi Bildirimi',
      description: 'Portföy ile eşleşen yeni bir satın alma veya kiralama talebi girildiğinde bildirim gönder.',
      icon: 'assignment_turned_in',
      color: 'text-secondary',
    },
    {
      key: 'taskReminders',
      title: 'Görev Hatırlatmaları',
      description: 'Zamanı yaklaşan veya geciken takip görevleri için danışmana çalışma saatlerinde hatırlatma yap.',
      icon: 'task_alt',
      color: 'text-emerald-700',
    },
    {
      key: 'appointmentReminders',
      title: 'Randevu & Yer Gösterimi Hatırlatmaları',
      description: 'Takvimdeki yer gösterimleri ve tapu randevularından 2 saat önce danışmana ve müşteriye hatırlatıcı ilet.',
      icon: 'calendar_month',
      color: 'text-amber-700',
    },
    {
      key: 'stageChanges',
      title: 'Fırsat Aşaması Değişiklikleri',
      description: 'Satış & Kiralama hunisinde fırsatlar Teklif, Pazarlık veya Sözleşme aşamalarına taşındığında ekibi bilgilendir.',
      icon: 'alt_route',
      color: 'text-purple-700',
    },
    {
      key: 'systemAlerts',
      title: 'Sistem & Güvenlik Bildirimleri',
      description: 'KVKK yedekleme raporları, yeni cihazdan oturum açma ve portal API senkronizasyon hatalarında uyarı ver.',
      icon: 'security',
      color: 'text-red-700',
    },
    {
      key: 'whatsappInstant',
      title: 'WhatsApp Cloud API Otomasyonu',
      description: 'Müşteri karşılama, portföy linki paylaşımı ve randevu lokasyon mesajlarını WhatsApp Business üzerinden otomatik ilet.',
      icon: 'chat',
      color: 'text-emerald-600',
    },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-space-lg flex flex-col gap-space-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-space-sm bg-surface-container-low -mx-space-lg -mt-space-lg p-space-lg rounded-t-xl border-b border-surface-container">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">notifications_active</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
              Bildirim Ayarları
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Hangi olaylarda ve temas noktalarında anlık bildirim almak istediğinizi belirleyin.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-label-sm bg-emerald-50 text-emerald-800 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Anlık Bildirimler Aktif
        </span>
      </div>

      {/* Switches List */}
      <div className="flex flex-col divide-y divide-surface-container">
        {notificationItems.map((item) => {
          const isChecked = Boolean(notifications[item.key]);
          return (
            <div
              key={item.key}
              className="py-4 flex items-center justify-between gap-4 hover:bg-surface-container-low/40 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`material-symbols-outlined text-[24px] ${item.color} mt-0.5 flex-shrink-0`}
                >
                  {item.icon}
                </span>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-bold text-primary">
                    {item.title}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl">
                    {item.description}
                  </span>
                </div>
              </div>

              {/* Custom Switch Toggle */}
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggle(item.key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

