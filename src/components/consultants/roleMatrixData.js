/**
 * EmlakPro Role Definitions & Metadata
 */
export const ROLES_CONFIG = [
  {
    id: 'admin',
    name: 'Yönetici (Admin / Broker)',
    badgeLabel: 'Yönetici',
    badgeClass: 'bg-primary text-white',
    colorBorder: 'border-primary/40',
    icon: 'shield_person',
    description:
      'Ofis kurucusu ve sistem yöneticisi. Tüm CRM modüllerine, kullanıcı tanımlamaya, finansal kurallara, güvenlik ayarlarına ve sistem yedeklemesine tam yetkilidir.',
  },
  {
    id: 'manager',
    name: 'Ofis Müdürü (Office Manager)',
    badgeLabel: 'Ofis Müdürü',
    badgeClass: 'bg-secondary text-white',
    colorBorder: 'border-secondary/40',
    icon: 'manage_accounts',
    description:
      'Günlük ofis operasyonunu ve satış ekiplerini koordine eder. Portföy onaylarını, müşteri havuzunu, randevuları ve genel ciro raporlarını yönetir; sistem güvenlik ve fabrika ayarlarına erişemez.',
  },
  {
    id: 'consultant',
    name: 'Gayrimenkul Danışmanı',
    badgeLabel: 'Danışman',
    badgeClass: 'bg-secondary-fixed text-on-secondary-fixed',
    colorBorder: 'border-secondary-fixed',
    icon: 'real_estate_agent',
    description:
      'Saha satış ve kiralama uzmanı. Kendi adına atanmış portföyleri, müşterileri, talepleri, randevuları ve işlem fırsatlarını yönetir. Yönetim modülleri sol menüde gizlenir (403 korumalı).',
  },
  {
    id: 'assistant',
    name: 'Ofis Asistanı (Secretary)',
    badgeLabel: 'Asistan',
    badgeClass: 'bg-surface-variant text-on-surface',
    colorBorder: 'border-slate-300',
    icon: 'support_agent',
    description:
      'Ön büro, karşılama ve operasyonel destek personeli. Yeni müşteri kaydı açma, randevu planlama ve genel portföy inceleme yetkilerine sahiptir; ciro ve danışman yönetimi kapalıdır.',
  },
];

/**
 * Permission Level Definitions & Visual Badges
 */
export const PERMISSION_LEVELS = {
  full: {
    id: 'full',
    label: 'Tam Yetki',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    icon: 'check_circle',
    iconColor: 'text-emerald-600',
    description: 'Tüm kayıtları görüntüleme, yeni ekleme, düzenleme, silme ve dışa aktarma (Export).',
  },
  owned: {
    id: 'owned',
    label: 'Kendi Kayıtları',
    badgeClass: 'bg-sky-50 text-sky-700 border border-sky-200/80',
    icon: 'person',
    iconColor: 'text-sky-600',
    description: 'Yalnızca kendisine atanmış kayıtları ekleyebilir, düzenleyebilir ve yönetebilir.',
  },
  readonly: {
    id: 'readonly',
    label: 'Yalnızca Görüntüleme',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    icon: 'visibility',
    iconColor: 'text-amber-600',
    description: 'Kayıtları inceleme, filtreleme ve detaylarını görme; değişiklik veya silme yapamaz.',
  },
  none: {
    id: 'none',
    label: 'Erişim Yok',
    badgeClass: 'bg-slate-100 text-slate-500 border border-slate-200',
    icon: 'block',
    iconColor: 'text-slate-400',
    description: 'Modül menüde gizlidir; doğrudan URL erişimi ProtectedRoute 403 engeli alır.',
  },
};

/**
 * Categorized Modules and Role Permission Mappings
 */
export const MATRIX_CATEGORIES = [
  {
    id: 'crm',
    title: 'Operasyonel CRM Modülleri',
    icon: 'hub',
    modules: [
      {
        id: 'dashboard',
        name: 'Dashboard & Canlı KPI',
        route: '/',
        description: 'Ofis genel performansı, gelir grafiği ve hızlı operasyonel kartlar',
        permissions: {
          admin: 'full',
          manager: 'full',
          consultant: 'owned',
          assistant: 'readonly',
        },
      },
      {
        id: 'customers',
        name: 'Müşteriler & Müşteri Geçmişi',
        route: '/musteriler',
        description: 'Alıcı/satıcı müşteri havuzu, iletişim detayları ve evrak arşivi',
        permissions: {
          admin: 'full',
          manager: 'full',
          consultant: 'owned',
          assistant: 'full',
        },
      },
      {
        id: 'properties',
        name: 'Gayrimenkul Portföyü',
        route: '/gayrimenkuller',
        description: 'Satılık/kiralık ilan yönetimi, fotoğraf galerisi ve ilan detayları',
        permissions: {
          admin: 'full',
          manager: 'full',
          consultant: 'owned',
          assistant: 'readonly',
        },
      },
      {
        id: 'demands',
        name: 'Alıcı & Kiracı Talepleri',
        route: '/talepler',
        description: 'Müşteri bütçe aralıkları, bölge tercihleri ve akıllı ilan eşleştirme',
        permissions: {
          admin: 'full',
          manager: 'full',
          consultant: 'owned',
          assistant: 'full',
        },
      },
      {
        id: 'deals',
        name: 'Satış & Kiralama (Deals)',
        route: '/satis-ve-kiralama',
        description: '8 aşamalı Kanban satış hattı, fırsat havuzu ve işlem tamamlama',
        permissions: {
          admin: 'full',
          manager: 'full',
          consultant: 'owned',
          assistant: 'none',
        },
      },
      {
        id: 'tasks',
        name: 'Görevler & Randevu Takvimi',
        route: '/gorevler-ve-randevular',
        description: 'Ajanda takvimi, yer gösterme randevuları ve yapılacaklar listesi',
        permissions: {
          admin: 'full',
          manager: 'full',
          consultant: 'owned',
          assistant: 'full',
        },
      },
    ],
  },
  {
    id: 'analytics',
    title: 'Finans, Ciro & Analitik',
    icon: 'monitoring',
    modules: [
      {
        id: 'reports',
        name: 'Raporlar & Danışman Ligi',
        route: '/raporlar',
        description: 'Ofis ciro analitiği, bölgesel talep haritası ve PDF performans ihracatı',
        permissions: {
          admin: 'full',
          manager: 'full',
          consultant: 'owned',
          assistant: 'none',
        },
      },
    ],
  },
  {
    id: 'management',
    title: 'Yönetim, Personel & Sistem Güvenliği',
    icon: 'admin_panel_settings',
    modules: [
      {
        id: 'consultants',
        name: 'Danışman & Personel Yönetimi',
        route: '/danismanlar',
        description: 'Ofis personeli CRUD, şifre sıfırlama, durum yönetimi ve yetki matrisi',
        permissions: {
          admin: 'full',
          manager: 'readonly',
          consultant: 'none',
          assistant: 'none',
        },
      },
      {
        id: 'settings',
        name: 'Ofis & Finans Ayarları',
        route: '/ayarlar',
        description: 'Kurumsal ofis profili, şube bilgileri ve kademeli komisyon kuralları',
        permissions: {
          admin: 'full',
          manager: 'none',
          consultant: 'none',
          assistant: 'none',
        },
      },
      {
        id: 'security_backup',
        name: 'Yedekleme & Güvenlik',
        route: '/ayarlar (Güvenlik / Yedek)',
        description: 'JSON sistem yedeği indirme, atomik geri yükleme ve fabrika ayarlarına sıfırlama',
        permissions: {
          admin: 'full',
          manager: 'none',
          consultant: 'none',
          assistant: 'none',
        },
      },
    ],
  },
];

