import React from 'react';

const SETTINGS_TABS = [
  {
    id: 'profil',
    label: 'Profil Ayarları',
    icon: 'person',
    description: 'Kişisel hesap & iletişim bilgileri',
  },
  {
    id: 'ofis',
    label: 'Ofis Bilgileri',
    icon: 'domain',
    description: 'Kurumsal kimlik, logo & yetki belgeleri',
  },
  {
    id: 'kullanicilar',
    label: 'Kullanıcı Yönetimi',
    icon: 'group',
    description: 'Ekip üyeleri, danışmanlar & yetkiler',
    badgeKey: 'usersCount',
  },
  {
    id: 'bildirimler',
    label: 'Bildirim Ayarları',
    icon: 'notifications_active',
    description: 'SMS, e-posta & WhatsApp tercihleri',
  },
  {
    id: 'gorunum',
    label: 'Görünüm Ayarları',
    icon: 'palette',
    description: 'Tema, dil, para birimi & yoğunluk',
  },
  {
    id: 'portallar',
    label: 'Portal Entegrasyonları',
    icon: 'hub',
    description: 'Sahibinden, Hepsiemlak, Emlakjet, Zingat',
    badge: 'Simülatör',
    badgeColor: 'bg-surface-container text-primary font-semibold',
  },
  {
    id: 'komisyon',
    label: 'Komisyon & Finansal Kurallar',
    icon: 'calculate',
    description: 'Hizmet bedelleri, KDV & prim dağılımı',
  },
  {
    id: 'guvenlik',
    label: 'Güvenlik & Denetim',
    icon: 'security',
    description: '2FA & IP ilke ayarları (Simülasyon)',
    badge: 'Simülasyon',
    badgeColor: 'bg-surface-container text-secondary font-semibold',
  },
  {
    id: 'veri',
    label: 'Veri Yönetimi & Yedekleme',
    icon: 'database',
    description: 'JSON yedek, geri yükleme & sıfırlama',
    badge: 'JSON/CSV',
    badgeColor: 'bg-primary text-white',
  },
];

export default function SettingsSidebarNav({
  activeTab = 'profil',
  onSelectTab,
  usersCount = 4,
}) {
  return (
    <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-2 flex flex-col gap-1">
      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 hidden lg:block">
        Sistem Tercihleri
      </div>

      <div className="flex lg:flex-col overflow-x-auto pb-1 lg:pb-0 gap-1.5 scrollbar-thin">
        {SETTINGS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab && onSelectTab(tab.id)}
              className={`flex-shrink-0 lg:w-full text-left px-3 py-2 lg:py-2.5 rounded-lg transition-all flex items-center justify-between gap-2.5 cursor-pointer whitespace-nowrap lg:whitespace-normal ${
                isActive
                  ? 'bg-primary-container text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-2 lg:gap-2.5 min-w-0">
                <span
                  className={`material-symbols-outlined text-[18px] lg:text-[20px] flex-shrink-0 ${
                    isActive ? 'text-secondary-fixed' : 'text-on-surface-variant'
                  }`}
                >
                  {tab.icon}
                </span>
                <div className="flex flex-col min-w-0">
                  <span
                    className={`font-label-md text-xs lg:text-label-md font-semibold truncate ${
                      isActive ? 'text-white' : 'text-on-surface'
                    }`}
                  >
                    {tab.label}
                  </span>
                  <span
                    className={`font-caption text-[11px] truncate hidden xl:block ${
                      isActive ? 'text-white/80' : 'text-on-surface-variant'
                    }`}
                  >
                    {tab.description}
                  </span>
                </div>
              </div>

              {tab.badgeKey === 'usersCount' && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] lg:text-[11px] font-bold flex-shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-surface-container text-secondary font-semibold'
                  }`}
                >
                  {usersCount}
                </span>
              )}

              {tab.badge && (
                <span
                  className={`hidden sm:inline-block lg:inline-block px-1.5 py-0.5 rounded-full text-[9px] lg:text-[10px] font-bold flex-shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.badgeColor || 'bg-secondary-fixed text-on-secondary-fixed'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
