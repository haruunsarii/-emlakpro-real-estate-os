/**
 * EmlakPro Real Estate CRM - Complete Settings & System Management Data Service
 * Comprehensive schema covering Profile, Corporate Office, Users, Notifications,
 * Portal Integrations, Commission Rules, Security & Appearance.
 */

export const SETTINGS_STORAGE_KEY = 'emlakpro_settings_v1';
export const BACKUP_STORAGE_KEY = 'emlakpro_last_backup';
export const SAFETY_BACKUP_STORAGE_KEY = 'emlakpro_pre_restore_safety_backup';
export const SUPPORTED_SCHEMA_VERSIONS = ['2.4'];
export const APP_VERSION = 'v2.4 Pro';

export const initialUserProfile = null;

export const initialOfficeProfile = {
  officeName: 'EmlakPro Prime Gayrimenkul Danışmanlığı A.Ş.',
  branch: 'Kadıköy Merkez Şube',
  logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo3zFn_dQsdvENUB-Y1KIxI1G9HH9XbnuOo_ncda7l0DRWeykGFlTSyNpGwWcQcJhV2L--m8B1t02pKjKD9QawnYBcAYcXc6O0szfpq6SWvUqmi6ikZy72HDRNLw_YPu7ti7ggn90kKex7e0SzkMMv5GDsGfUwl-JpvZuoUFXQNrZDFSTALhJGIpxLSloXYzYpOsoj-L2jwNaAEqFShX6gHHC5okpPZ3CHCS0SkxBG',
  phone: '+90 (216) 418 90 00',
  email: 'kadikoy@emlakpro.com.tr',
  website: 'https://kadikoy.emlakpro.com.tr',
  address: 'Bağdat Caddesi No: 342/B, Suadiye',
  city: 'Kadıköy, İstanbul',
  taxOffice: 'Kadıköy V.D.',
  taxNumber: '8291048291',
  licenseNo: '3400892 - Kadıköy Şube',
  licenseStatus: 'İBB Onaylı',
  isVerifiedOffice: true,
};

export const initialUsersList = [];

export const initialNotificationPreferences = {
  newCustomer: true,
  newDemand: true,
  taskReminders: true,
  appointmentReminders: true,
  stageChanges: true,
  systemAlerts: true,
  emailDigests: false,
  smsAlerts: true,
  whatsappInstant: true,
};

export const initialAppearanceSettings = {
  theme: 'light', // 'light' | 'dark' | 'system'
  density: 'comfortable', // 'comfortable' | 'compact'
  language: 'tr',
  currency: 'TRY',
  dateFormat: 'DD.MM.YYYY',
  rowsPerPage: 10,
  enableAnimations: true,
  sidebarCollapsed: false,
};

export const initialPortalIntegrations = [
  {
    id: 'sahibinden',
    name: 'Sahibinden.com Kurumsal API',
    initial: 'S',
    initialBg: 'bg-amber-400/20 text-amber-700',
    status: 'Yapılandırıldı (Simülasyon)',
    statusColor: 'bg-surface-container text-primary font-semibold',
    dotColor: 'bg-secondary',
    lastSync: 'Simülasyon şablonu aktif',
    quota: '96 / 150 (Demo Kota)',
    autoListing: true,
    fetchLeads: true,
    apiKey: 'shb_demo_981a287f39021c',
    apiEndpoint: 'https://api.sahibinden.com/v2/kurumsal',
    isConfigured: true,
  },
  {
    id: 'hepsiemlak',
    name: 'Hepsiemlak Pro API',
    initial: 'H',
    initialBg: 'bg-rose-500/20 text-rose-700',
    status: 'Yapılandırıldı (Simülasyon)',
    statusColor: 'bg-surface-container text-primary font-semibold',
    dotColor: 'bg-secondary',
    lastSync: 'Simülasyon şablonu aktif',
    quota: '74 / 100 (Demo Kota)',
    autoListing: true,
    fetchLeads: true,
    apiKey: 'he_demo_37189104fa28c',
    apiEndpoint: 'https://api.hepsiemlak.com/pro/v1',
    isConfigured: true,
  },
  {
    id: 'emlakjet',
    name: 'Emlakjet Kurumsal XML / API',
    initial: 'EJ',
    initialBg: 'bg-blue-500/20 text-blue-700',
    status: 'Yapılandırıldı (Simülasyon)',
    statusColor: 'bg-surface-container text-primary font-semibold',
    dotColor: 'bg-secondary',
    lastSync: 'Simülasyon şablonu aktif',
    quota: '58 / 100 (Demo Kota)',
    autoListing: true,
    fetchLeads: false,
    apiKey: 'ej_demo_90184a771bce4',
    apiEndpoint: 'https://xml.emlakjet.com/v3/feed',
    isConfigured: true,
  },
  {
    id: 'zingat',
    name: 'Zingat / RE-OS Ağı',
    initial: 'Z',
    initialBg: 'bg-slate-300/40 text-on-surface-variant',
    status: 'Yapılandırılmadı',
    statusColor: 'bg-surface-variant text-on-surface-variant',
    dotColor: 'bg-slate-400',
    lastSync: 'Hiç eşitlenmedi',
    quota: '0 / 50',
    autoListing: false,
    fetchLeads: false,
    apiKey: '',
    apiEndpoint: 'https://api.zingat.com/partner/v1',
    isConfigured: false,
  },
];

export const initialCommissionRules = {
  buyerRate: 2,
  sellerRate: 2,
  vatRate: 20,
  rentalFeeMonths: 1,
  rentalFeeDescription: '1 Aylık Kira + KDV',
  advisorSplitModel: 'Kademeli Performans Modeli (%50 - %70 danışman payı)',
  mandatoryContractRequired: true,
  contractEnforcementNotice: 'Yetki sözleşmesi PDF formatında sisteme yüklenmeyen ilanlar portallarda veya sitede yayınlanamaz, taslak kalır.',
};

export const initialSecuritySettings = {
  twoFactorAuth: 'ZORUNLU',
  isTwoFactorEnforced: true,
  ipRestriction: 'AKTİF',
  isIpRestrictionActive: true,
  sessionTimeoutMinutes: 30,
  officeStaticIp: '212.156.44.82',
  auditLogs: [
    {
      id: 'log-1',
      author: 'Burak Y.',
      action: 'Kadıköy Şube komisyon şablonunu güncelledi.',
      time: 'Bugün 11:20',
      dotColor: 'bg-secondary',
    },
    {
      id: 'log-2',
      author: 'Elif D.',
      action: 'Sahibinden portal API bağlantısını senkronize etti.',
      time: 'Bugün 09:45',
      dotColor: 'bg-secondary',
    },
    {
      id: 'log-3',
      author: 'Sistem',
      action: 'Otomatik KVKK veri maskeleme denetimi tamamlandı.',
      time: 'Dün 23:00',
      dotColor: 'bg-emerald-500',
    },
    {
      id: 'log-4',
      author: 'Burak Y.',
      action: 'Taşınmaz Ticareti Yetki Belgesi onay belgesi yenilendi.',
      time: '3 gün önce',
      dotColor: 'bg-secondary',
    },
  ],
};

export const initialSystemMetrics = [
  {
    id: 'storage',
    title: 'Tarayıcı Depolama Kullanımı',
    icon: 'database',
    value: '0.0 KB / ~5 MB',
    subtitle: 'Yerel HTML5 Depolama (Tahmini)',
    subBadgeLabel: 'Kota Durumu',
    subBadgeValue: 'Temiz Başlangıç',
    color: 'text-secondary',
  },
  {
    id: 'records',
    title: 'CRM Toplam Kayıt Havuzu',
    icon: 'inventory_2',
    value: '50 Aktif Kayıt',
    subtitle: '6 Portföy, 6 Müşteri, 12 Fırsat',
    subBadgeLabel: 'Veri Kaynağı',
    subBadgeValue: 'LocalStorage + Sistem Verisi',
    color: 'text-primary',
  },
  {
    id: 'portals',
    title: 'Portal Entegrasyon Durumu',
    icon: 'hub',
    isLivePulse: false,
    value: '0 / 4 Yapılandırıldı',
    subtitle: 'Simülasyon Modu (Canlı API Değildir)',
    subBadgeLabel: 'Mimari',
    subBadgeValue: 'İstemci Taslağı',
    color: 'text-primary',
  },
  {
    id: 'system',
    title: 'Sistem Sürümü & Yedekleme',
    icon: 'verified_user',
    value: APP_VERSION,
    subtitle: 'İstemci Modu (React 19 SPA)',
    subBadgeLabel: 'Son Yedek',
    subBadgeValue: 'Henüz Yedek Alınmadı (Önerilir)',
    color: 'text-secondary',
  },
];

export const initialSettingsState = {
  profile: initialUserProfile,
  office: initialOfficeProfile,
  users: initialUsersList,
  notifications: initialNotificationPreferences,
  appearance: initialAppearanceSettings,
  portals: initialPortalIntegrations,
  commission: initialCommissionRules,
  security: initialSecuritySettings,
  metrics: initialSystemMetrics,
  lastSavedAt: 'Bugün 18:30',
};

/**
 * Load settings from localStorage with safe fallback
 */
export function getSavedSettings() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            profile:
              parsed.profile &&
              (parsed.profile.firstName || parsed.profile.lastName || parsed.profile.email || parsed.profile.title)
                ? parsed.profile
                : null,
            office: { ...initialOfficeProfile, ...(parsed.office || {}) },
            users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : initialUsersList,
            notifications: { ...initialNotificationPreferences, ...(parsed.notifications || {}) },
            appearance: { ...initialAppearanceSettings, ...(parsed.appearance || {}) },
            portals: Array.isArray(parsed.portals) && parsed.portals.length > 0 ? parsed.portals : initialPortalIntegrations,
            commission: { ...initialCommissionRules, ...(parsed.commission || {}) },
            security: { ...initialSecuritySettings, ...(parsed.security || {}) },
            metrics: parsed.metrics || initialSystemMetrics,
            lastSavedAt: parsed.lastSavedAt || 'Bugün 18:30',
          };
        }
      }
    } catch (e) {
      console.warn('emlakpro_settings_v1 okunamadı, varsayılan ayarlar yükleniyor:', e);
    }
  }
  return initialSettingsState;
}

/**
 * Save settings to localStorage and trigger storage event
 */
export function saveSettings(settings) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const updated = {
        ...settings,
        lastSavedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      return updated;
    } catch (e) {
      console.error('emlakpro_settings_v1 kaydedilemedi:', e);
      return null;
    }
  }
  return null;
}

/**
 * Calculate dynamic storage and record metrics from live browser state & CRM data
 */
export function calculateRealSystemMetrics(settings = {}) {
  let storageBytes = 0;
  let customersCount = 0;
  let propertiesCount = 0;
  let dealsCount = 0;
  let demandsCount = 0;
  let tasksCount = 0;
  let appointmentsCount = 0;
  let lastBackup = 'Henüz Yedek Alınmadı';

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      // Calculate bytes used strictly by emlakpro_* keys (prevent foreign key contamination)
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith('emlakpro_')) {
          const val = window.localStorage.getItem(key) || '';
          storageBytes += (key.length + val.length) * 2; // UTF-16 in JavaScript string
        }
      }

      // Read customers count from localStorage if present
      const savedCustomers =
        window.localStorage.getItem('emlakpro_customers_v1') ||
        window.localStorage.getItem('emlakpro_customers');
      if (savedCustomers) {
        const parsed = JSON.parse(savedCustomers);
        if (Array.isArray(parsed)) customersCount = parsed.length;
      }

      // Read properties count from localStorage if present
      const savedProps = window.localStorage.getItem('emlakpro_properties_v1');
      if (savedProps) {
        const parsed = JSON.parse(savedProps);
        if (Array.isArray(parsed)) propertiesCount = parsed.length;
      }

      // Read deals count from localStorage if present
      const savedDeals = window.localStorage.getItem('emlakpro_deals_v1');
      if (savedDeals) {
        const parsed = JSON.parse(savedDeals);
        if (Array.isArray(parsed)) dealsCount = parsed.length;
      }

      // Read demands count from localStorage if present
      const savedDemands = window.localStorage.getItem('emlakpro_requests_v1');
      if (savedDemands) {
        const parsed = JSON.parse(savedDemands);
        if (Array.isArray(parsed)) demandsCount = parsed.length;
      }

      // Read tasks count from localStorage if present
      const savedTasks = window.localStorage.getItem('emlakpro_tasks_v1');
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed)) tasksCount = parsed.length;
      }

      // Read appointments count from localStorage if present
      const savedAppts = window.localStorage.getItem('emlakpro_appointments_v1');
      if (savedAppts) {
        const parsed = JSON.parse(savedAppts);
        if (Array.isArray(parsed)) appointmentsCount = parsed.length;
      }

      // Last backup info
      const savedBackup = window.localStorage.getItem(BACKUP_STORAGE_KEY);
      if (savedBackup) {
        lastBackup = savedBackup;
      }
    } catch (e) {
      console.warn('Metrik hesaplama hatası:', e);
    }
  }

  const totalRecords =
    customersCount + dealsCount + propertiesCount + demandsCount + tasksCount + appointmentsCount;
  const storageKb = (storageBytes / 1024).toFixed(1);
  const quotaPercent = ((storageBytes / (5 * 1024 * 1024)) * 100).toFixed(2); // ~5MB typical browser estimate

  const portals = settings.portals || initialPortalIntegrations;
  const configuredPortals = portals.filter((p) => p.isConfigured).length;

  return [
    {
      id: 'storage',
      title: 'Tarayıcı Depolama Kullanımı',
      icon: 'database',
      value: `${storageKb} KB / ~5 MB`,
      subtitle: `Yerel HTML5 Depolama (%${quotaPercent} Tahmini)`,
      subBadgeLabel: 'Kota Durumu',
      subBadgeValue: storageBytes > 0 ? 'Aktif Yerel Veri' : 'Temiz Başlangıç',
      color: 'text-secondary',
    },
    {
      id: 'records',
      title: 'CRM Toplam Kayıt Havuzu',
      icon: 'inventory_2',
      value: `${totalRecords} Aktif Kayıt`,
      subtitle: `${propertiesCount} Portföy, ${customersCount} Müşteri, ${dealsCount} Fırsat, ${demandsCount} Talep`,
      subBadgeLabel: 'Veri Kaynağı',
      subBadgeValue: 'LocalStorage + Sistem Verisi',
      color: 'text-primary',
    },
    {
      id: 'portals',
      title: 'Portal Entegrasyon Durumu',
      icon: 'hub',
      isLivePulse: false,
      value: `${configuredPortals} / ${portals.length} Yapılandırıldı`,
      subtitle: 'Simülasyon Modu (Canlı API Değildir)',
      subBadgeLabel: 'Mimari',
      subBadgeValue: 'İstemci Taslağı',
      color: configuredPortals > 0 ? 'text-primary' : 'text-on-surface-variant',
    },
    {
      id: 'system',
      title: 'Sistem Sürümü & Yedekleme',
      icon: 'verified_user',
      value: APP_VERSION,
      subtitle: 'İstemci Modu (React 19 SPA)',
      subBadgeLabel: 'Son Yedek',
      subBadgeValue: lastBackup,
      color: 'text-secondary',
    },
  ];
}

/**
 * Gather full CRM data bundle for download (all 7 collections from live localStorage with fallback)
 */
export function exportAllCrmData(settings) {
  let customers = [];
  let properties = [];
  let deals = [];
  let demands = [];
  let tasks = [];
  let appointments = [];

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const c =
        window.localStorage.getItem('emlakpro_customers_v1') ||
        window.localStorage.getItem('emlakpro_customers');
      if (c) {
        const parsedC = JSON.parse(c);
        if (Array.isArray(parsedC)) customers = parsedC;
      }

      const p = window.localStorage.getItem('emlakpro_properties_v1');
      if (p) {
        const parsedP = JSON.parse(p);
        if (Array.isArray(parsedP)) properties = parsedP;
      }

      const d = window.localStorage.getItem('emlakpro_deals_v1');
      if (d) {
        const parsedD = JSON.parse(d);
        if (Array.isArray(parsedD)) deals = parsedD;
      }

      const dm = window.localStorage.getItem('emlakpro_requests_v1');
      if (dm) {
        const parsedDm = JSON.parse(dm);
        if (Array.isArray(parsedDm)) demands = parsedDm;
      }

      const t = window.localStorage.getItem('emlakpro_tasks_v1');
      if (t) {
        const parsedT = JSON.parse(t);
        if (Array.isArray(parsedT)) tasks = parsedT;
      }

      const a = window.localStorage.getItem('emlakpro_appointments_v1');
      if (a) {
        const parsedA = JSON.parse(a);
        if (Array.isArray(parsedA)) appointments = parsedA;
      }
    } catch (e) {
      console.warn('Veri dışa aktarırken hata:', e);
    }
  }

  const exportPayload = {
    schemaVersion: '2.4',
    appName: 'EmlakPro Real Estate OS',
    exportTimestamp: new Date().toISOString(),
    formattedExportDate: new Date().toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    exportedBy: settings?.profile?.firstName
      ? `${settings.profile.firstName} ${settings.profile.lastName}`.trim()
      : 'Sistem Yöneticisi',
    office: settings?.office || initialOfficeProfile,
    data: {
      settings: settings || getSavedSettings(),
      customers,
      properties,
      deals,
      demands,
      tasks,
      appointments,
    },
    metricsSummary: {
      totalCustomers: customers.length,
      totalProperties: properties.length,
      totalDeals: deals.length,
      totalDemands: demands.length,
      totalTasks: tasks.length,
      totalAppointments: appointments.length,
      totalRecords:
        customers.length +
        properties.length +
        deals.length +
        demands.length +
        tasks.length +
        appointments.length,
    },
  };

  // Mark last backup date in localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    const backupStr = new Date().toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
    window.localStorage.setItem(BACKUP_STORAGE_KEY, backupStr);
    window.dispatchEvent(new Event('storage'));
  }

  return exportPayload;
}

/**
 * Strictly validate CRM backup JSON structure, schemaVersion, and collection integrity
 */
export function validateCrmBackup(backupObject) {
  if (!backupObject || typeof backupObject !== 'object' || Array.isArray(backupObject)) {
    throw new Error('Dosya içeriği geçerli bir JSON nesnesi değil.');
  }

  // 1. schemaVersion check
  if (!backupObject.schemaVersion) {
    throw new Error('Eksik "schemaVersion" alanı: Yüklenen dosya geçerli bir EmlakPro yedek formatı taşımıyor.');
  }

  if (!SUPPORTED_SCHEMA_VERSIONS.includes(String(backupObject.schemaVersion))) {
    throw new Error(
      `Desteklenmeyen yedek sürümü ("v${backupObject.schemaVersion}"). Yalnızca v${SUPPORTED_SCHEMA_VERSIONS.join(', v')} sürümleri geri yüklenebilir.`
    );
  }

  // 2. data container check
  if (!backupObject.data || typeof backupObject.data !== 'object' || Array.isArray(backupObject.data)) {
    throw new Error('Yedek dosyasında geçerli bir "data" veri kapsayıcısı bulunamadı.');
  }

  const { customers, properties, deals, demands, tasks, appointments, settings } = backupObject.data;

  // 3. Customers array check if present
  if (customers !== undefined) {
    if (!Array.isArray(customers)) {
      throw new Error('"data.customers" alanı bir liste (dizi) olmalıdır.');
    }
    for (let i = 0; i < customers.length; i++) {
      const c = customers[i];
      if (!c || typeof c !== 'object' || !c.id || !c.name) {
        throw new Error(`Müşteri listesinde ${i + 1}. kaydın ID veya İsim bilgisi eksik/geçersiz.`);
      }
    }
  }

  // 4. Properties array check if present
  if (properties !== undefined) {
    if (!Array.isArray(properties)) {
      throw new Error('"data.properties" alanı bir liste (dizi) olmalıdır.');
    }
    for (let i = 0; i < properties.length; i++) {
      const p = properties[i];
      if (!p || typeof p !== 'object' || !p.id) {
        throw new Error(`Gayrimenkul listesinde ${i + 1}. kaydın ID bilgisi eksik/geçersiz.`);
      }
    }
  }

  // 5. Deals array check if present
  if (deals !== undefined) {
    if (!Array.isArray(deals)) {
      throw new Error('"data.deals" alanı bir liste (dizi) olmalıdır.');
    }
    for (let i = 0; i < deals.length; i++) {
      const d = deals[i];
      if (!d || typeof d !== 'object' || !d.id || !d.title) {
        throw new Error(`Fırsat listesinde ${i + 1}. kaydın ID veya Başlık bilgisi eksik/geçersiz.`);
      }
    }
  }

  // 6. Demands array check if present
  if (demands !== undefined) {
    if (!Array.isArray(demands)) {
      throw new Error('"data.demands" alanı bir liste (dizi) olmalıdır.');
    }
    for (let i = 0; i < demands.length; i++) {
      const dm = demands[i];
      if (!dm || typeof dm !== 'object' || !dm.id) {
        throw new Error(`Talep listesinde ${i + 1}. kaydın ID bilgisi eksik/geçersiz.`);
      }
    }
  }

  // 7. Tasks array check if present
  if (tasks !== undefined) {
    if (!Array.isArray(tasks)) {
      throw new Error('"data.tasks" alanı bir liste (dizi) olmalıdır.');
    }
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      if (!t || typeof t !== 'object' || !t.id) {
        throw new Error(`Görev listesinde ${i + 1}. kaydın ID bilgisi eksik/geçersiz.`);
      }
    }
  }

  // 8. Appointments array check if present
  if (appointments !== undefined) {
    if (!Array.isArray(appointments)) {
      throw new Error('"data.appointments" alanı bir liste (dizi) olmalıdır.');
    }
    for (let i = 0; i < appointments.length; i++) {
      const a = appointments[i];
      if (!a || typeof a !== 'object' || !a.id) {
        throw new Error(`Randevu listesinde ${i + 1}. kaydın ID bilgisi eksik/geçersiz.`);
      }
    }
  }

  // 9. Settings check if present
  if (settings !== undefined) {
    if (typeof settings !== 'object' || Array.isArray(settings) || settings === null) {
      throw new Error('"data.settings" alanı bir ayarlar nesnesi olmalıdır.');
    }
  }

  return true;
}

/**
 * Restore CRM data from parsed JSON backup with automatic safety snapshot & atomic rollback
 */
export function restoreCrmData(backupObject) {
  // First, run full validation
  validateCrmBackup(backupObject);

  if (typeof window === 'undefined' || !window.localStorage) {
    throw new Error('Tarayıcı yerel depolama (localStorage) ortamı bulunamadı.');
  }

  // 1. Create a pre-restore safety snapshot of CURRENT state before touching anything
  const currentSnapshot = {
    customers_v1: window.localStorage.getItem('emlakpro_customers_v1'),
    customers_legacy: window.localStorage.getItem('emlakpro_customers'),
    properties_v1: window.localStorage.getItem('emlakpro_properties_v1'),
    deals_v1: window.localStorage.getItem('emlakpro_deals_v1'),
    requests_v1: window.localStorage.getItem('emlakpro_requests_v1'),
    tasks_v1: window.localStorage.getItem('emlakpro_tasks_v1'),
    appointments_v1: window.localStorage.getItem('emlakpro_appointments_v1'),
    settings_v1: window.localStorage.getItem(SETTINGS_STORAGE_KEY),
    last_backup: window.localStorage.getItem(BACKUP_STORAGE_KEY),
    snapshotDate: new Date().toISOString(),
    reason: 'pre-restore',
  };

  try {
    window.localStorage.setItem(SAFETY_BACKUP_STORAGE_KEY, JSON.stringify(currentSnapshot));
  } catch (err) {
    console.warn('Emniyet yedeği kaydedilemedi, ancak geri yüklemeye devam ediliyor:', err);
  }

  const { customers, properties, deals, demands, tasks, appointments, settings } = backupObject.data;

  // 2. Perform writes with automatic rollback on error
  try {
    if (Array.isArray(customers)) {
      window.localStorage.setItem('emlakpro_customers_v1', JSON.stringify(customers));
      window.localStorage.setItem('emlakpro_customers', JSON.stringify(customers));
    }
    if (Array.isArray(properties)) {
      window.localStorage.setItem('emlakpro_properties_v1', JSON.stringify(properties));
    }
    if (Array.isArray(deals)) {
      window.localStorage.setItem('emlakpro_deals_v1', JSON.stringify(deals));
    }
    if (Array.isArray(demands)) {
      window.localStorage.setItem('emlakpro_requests_v1', JSON.stringify(demands));
    }
    if (Array.isArray(tasks)) {
      window.localStorage.setItem('emlakpro_tasks_v1', JSON.stringify(tasks));
    }
    if (Array.isArray(appointments)) {
      window.localStorage.setItem('emlakpro_appointments_v1', JSON.stringify(appointments));
    }
    if (settings && typeof settings === 'object') {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }

    const backupStr =
      new Date().toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' (Yedekten Yüklendi)';
    window.localStorage.setItem(BACKUP_STORAGE_KEY, backupStr);

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('emlakpro_data_restored', { detail: { timestamp: Date.now() } }));
    return true;
  } catch (writeError) {
    // ROLLBACK ATOMICALLY
    console.error('Geri yükleme sırasında hata oluştu, önceki duruma dönülüyor (Rollback):', writeError);
    const safeRollback = (action) => {
      try {
        action();
      } catch (err) {
        console.warn('Rollback anahtar geri yükleme uyarısı:', err);
      }
    };

    safeRollback(() => {
      if (currentSnapshot.customers_v1 !== null) {
        window.localStorage.setItem('emlakpro_customers_v1', currentSnapshot.customers_v1);
      } else {
        window.localStorage.removeItem('emlakpro_customers_v1');
      }
    });

    safeRollback(() => {
      if (currentSnapshot.customers_legacy !== null) {
        window.localStorage.setItem('emlakpro_customers', currentSnapshot.customers_legacy);
      } else {
        window.localStorage.removeItem('emlakpro_customers');
      }
    });

    safeRollback(() => {
      if (currentSnapshot.properties_v1 !== null) {
        window.localStorage.setItem('emlakpro_properties_v1', currentSnapshot.properties_v1);
      } else {
        window.localStorage.removeItem('emlakpro_properties_v1');
      }
    });

    safeRollback(() => {
      if (currentSnapshot.deals_v1 !== null) {
        window.localStorage.setItem('emlakpro_deals_v1', currentSnapshot.deals_v1);
      } else {
        window.localStorage.removeItem('emlakpro_deals_v1');
      }
    });

    safeRollback(() => {
      if (currentSnapshot.requests_v1 !== null) {
        window.localStorage.setItem('emlakpro_requests_v1', currentSnapshot.requests_v1);
      } else {
        window.localStorage.removeItem('emlakpro_requests_v1');
      }
    });

    safeRollback(() => {
      if (currentSnapshot.tasks_v1 !== null) {
        window.localStorage.setItem('emlakpro_tasks_v1', currentSnapshot.tasks_v1);
      } else {
        window.localStorage.removeItem('emlakpro_tasks_v1');
      }
    });

    safeRollback(() => {
      if (currentSnapshot.appointments_v1 !== null) {
        window.localStorage.setItem('emlakpro_appointments_v1', currentSnapshot.appointments_v1);
      } else {
        window.localStorage.removeItem('emlakpro_appointments_v1');
      }
    });

    safeRollback(() => {
      if (currentSnapshot.settings_v1 !== null) {
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, currentSnapshot.settings_v1);
      } else {
        window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
      }
    });

    window.dispatchEvent(new Event('storage'));
    throw new Error('Geri yükleme yazma hatası oluştu. Mevcut veriler bozulmadan eski haline getirildi: ' + writeError.message);
  }
}

/**
 * Reset all custom localStorage modifications and restore initial state (strictly scoped to emlakpro keys)
 * Automatically takes a pre-reset safety backup into SAFETY_BACKUP_STORAGE_KEY before clearing.
 */
export function resetCrmToFactoryDefaults() {
  if (typeof window !== 'undefined' && window.localStorage) {
    // 1. Take a safety backup of current state before wiping so user data is not irreversibly lost
    try {
      const preResetSnapshot = {
        customers_v1: window.localStorage.getItem('emlakpro_customers_v1'),
        customers_legacy: window.localStorage.getItem('emlakpro_customers'),
        properties_v1: window.localStorage.getItem('emlakpro_properties_v1'),
        deals_v1: window.localStorage.getItem('emlakpro_deals_v1'),
        requests_v1: window.localStorage.getItem('emlakpro_requests_v1'),
        tasks_v1: window.localStorage.getItem('emlakpro_tasks_v1'),
        appointments_v1: window.localStorage.getItem('emlakpro_appointments_v1'),
        settings_v1: window.localStorage.getItem(SETTINGS_STORAGE_KEY),
        session_v1: window.localStorage.getItem('emlakpro_session_v1'),
        last_backup: window.localStorage.getItem(BACKUP_STORAGE_KEY),
        snapshotDate: new Date().toISOString(),
        reason: 'pre-factory-reset',
      };
      window.localStorage.setItem(SAFETY_BACKUP_STORAGE_KEY, JSON.stringify(preResetSnapshot));
    } catch (e) {
      console.warn('Sıfırlama öncesi emniyet yedeği alınamadı:', e);
    }

    // 2. Remove all operational CRM data keys strictly scoped to emlakpro
    const keysToRemove = [
      'emlakpro_customers_v1',
      'emlakpro_customers',
      'emlakpro_properties_v1',
      'emlakpro_properties_seed_v2',
      'emlakpro_properties_seed_v4',
      'emlakpro_requests_v1',
      'emlakpro_deals_v1',
      'emlakpro_tasks_v1',
      'emlakpro_appointments_v1',
      'emlakpro_session_v1',
      SETTINGS_STORAGE_KEY,
      BACKUP_STORAGE_KEY,
    ];

    keysToRemove.forEach((key) => {
      window.localStorage.removeItem(key);
    });

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('emlakpro_session_change', { detail: null }));
    window.dispatchEvent(new CustomEvent('emlakpro_data_reset', { detail: { timestamp: Date.now() } }));
  }
  return initialSettingsState;
}
