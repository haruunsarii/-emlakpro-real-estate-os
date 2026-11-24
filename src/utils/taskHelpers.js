/**
 * EmlakPro Görevler & Randevular Yardımcı Fonksiyonları & Sabitleri
 */

import { getSavedSettings } from '../services/settingsData';

export const APPOINTMENT_TYPES = {
  'Yer Gösterimi': {
    id: 'Yer Gösterimi',
    label: 'Yer Gösterimi',
    color: 'bg-blue-600',
    dotColor: 'bg-blue-600',
    chipBg: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
  },
  'Müşteri Takip Araması': {
    id: 'Müşteri Takip Araması',
    label: 'Müşteri Takip Araması',
    color: 'bg-emerald-600',
    dotColor: 'bg-emerald-600',
    chipBg: 'bg-emerald-100 text-emerald-800',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-900',
  },
  'Sözleşme & Tapu Devri': {
    id: 'Sözleşme & Tapu Devri',
    label: 'Sözleşme & Tapu Devri',
    color: 'bg-purple-600',
    dotColor: 'bg-purple-600',
    chipBg: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-900',
  },
  'Fotoğraf & Drone Çekimi': {
    id: 'Fotoğraf & Drone Çekimi',
    label: 'Fotoğraf & Drone Çekimi',
    color: 'bg-amber-600',
    dotColor: 'bg-amber-600',
    chipBg: 'bg-amber-100 text-amber-800',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-900',
  },
  'Değerleme & Ekspertiz': {
    id: 'Değerleme & Ekspertiz',
    label: 'Değerleme & Ekspertiz',
    color: 'bg-slate-600',
    dotColor: 'bg-slate-600',
    chipBg: 'bg-slate-100 text-slate-800',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-900',
  },
};

export const TASK_PRIORITIES = {
  urgent: { id: 'urgent', label: 'ACİL', badgeBg: 'bg-rose-50 text-rose-700 font-bold' },
  high: { id: 'high', label: 'YÜKSEK', badgeBg: 'bg-amber-50 text-amber-700 font-bold' },
  normal: { id: 'normal', label: 'NORMAL', badgeBg: 'bg-surface-container text-on-surface-variant font-medium' },
  low: { id: 'low', label: 'DÜŞÜK', badgeBg: 'bg-surface-container-low text-outline font-medium' },
};

export const ADVISORS_LIST = [
  { id: 'Elif Demir', name: 'Elif Demir', initials: 'ED', role: 'Danışman' },
  { id: 'Mert Can', name: 'Mert Can', initials: 'MC', role: 'Danışman' },
  { id: 'Selin Vardar', name: 'Selin Vardar', initials: 'SV', role: 'Danışman' },
];

/**
 * Dinamik aktif danışmanları döner:
 * 1. emlakpro_settings_v1 içindeki aktif (status !== 'Pasif') kullanıcılar
 * 2. Oturum açmış kullanıcı (currentUser) aktif listede yoksa güvenle başa eklenir
 * 3. Hiçbir kullanıcı tanımlı değilse genel fallback listesi döner
 *
 * @param {object|null} currentUser
 * @returns {Array<object>}
 */
export function getActiveAdvisors(currentUser = null) {
  let active = [];
  try {
    const settings = getSavedSettings();
    const allUsers = Array.isArray(settings?.users) ? settings.users : [];
    active = allUsers.filter((u) => u && u.status !== 'Pasif');
  } catch (e) {
    console.warn('Aktif danışman listesi okunamadı:', e);
  }

  if (currentUser?.name) {
    const exists = active.some(
      (u) =>
        (u.id && currentUser.userId && u.id === currentUser.userId) ||
        (u.email && currentUser.email && u.email === currentUser.email) ||
        u.name === currentUser.name
    );
    if (!exists) {
      active.unshift({
        id: currentUser.userId || 'current-user',
        name: currentUser.name,
        title: currentUser.title || currentUser.displayRole || 'Danışman',
        avatarUrl: currentUser.avatarUrl || '',
        status: 'Aktif',
      });
    }
  }

  if (active.length === 0) {
    if (currentUser?.name) {
      active = [
        {
          id: currentUser.userId || 'current-user',
          name: currentUser.name,
          title: currentUser.title || currentUser.displayRole || 'Danışman',
          status: 'Aktif',
        },
      ];
    } else {
      active = [...ADVISORS_LIST];
    }
  }

  return active;
}

/**
 * Verilen bir tarihi YYYY-MM-DD biçiminde döner (Yerel saat dilimini korur)
 */
export function formatDateYMD(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Canlı sistem bugününün YYYY-MM-DD tarihini döner
 */
export function getTodayYMD() {
  return formatDateYMD(new Date());
}

/**
 * Randevu türüne göre konfigürasyon döner
 */
export function getAppointmentTypeConfig(typeLabelOrId) {
  if (!typeLabelOrId) return APPOINTMENT_TYPES['Yer Gösterimi'];
  if (APPOINTMENT_TYPES[typeLabelOrId]) return APPOINTMENT_TYPES[typeLabelOrId];

  const norm = String(typeLabelOrId).toLowerCase();
  if (norm.includes('gösterim') || norm.includes('gosterim') || norm.includes('ziyaret') || norm.includes('open house')) {
    return APPOINTMENT_TYPES['Yer Gösterimi'];
  }
  if (norm.includes('müşteri') || norm.includes('müsteri') || norm.includes('takip') || norm.includes('arama')) {
    return APPOINTMENT_TYPES['Müşteri Takip Araması'];
  }
  if (norm.includes('sözleşme') || norm.includes('sozlesme') || norm.includes('tapu') || norm.includes('kapora')) {
    return APPOINTMENT_TYPES['Sözleşme & Tapu Devri'];
  }
  if (norm.includes('drone') || norm.includes('fotoğraf') || norm.includes('fotograf') || norm.includes('prodüksiyon')) {
    return APPOINTMENT_TYPES['Fotoğraf & Drone Çekimi'];
  }
  if (norm.includes('değerleme') || norm.includes('degerleme') || norm.includes('ekspertiz') || norm.includes('spk')) {
    return APPOINTMENT_TYPES['Değerleme & Ekspertiz'];
  }

  return APPOINTMENT_TYPES['Yer Gösterimi'];
}

/**
 * Görev öncelik rozet ve etiketini döner
 */
export function getTaskPriorityConfig(priority) {
  if (!priority) return TASK_PRIORITIES.normal;
  const p = String(priority).toLowerCase();
  if (p.includes('acil') || p.includes('urgent')) return TASK_PRIORITIES.urgent;
  if (p.includes('yüksek') || p.includes('yuksek') || p.includes('high')) return TASK_PRIORITIES.high;
  if (p.includes('düşük') || p.includes('dusuk') || p.includes('low')) return TASK_PRIORITIES.low;
  return TASK_PRIORITIES.normal;
}

/**
 * Görevin gecikip gecikmediğini kontrol eder.
 * Varsayılan olarak canlı sistem bugünü (new Date()) baz alınır.
 */
export function isTaskOverdue(task, refDateStr = getTodayYMD()) {
  if (!task || task.completed || task.status === 'Tamamlandı') return false;
  if (task.status === 'Gecikti') return true;

  if (task.dueDate) {
    if (task.dueDate < refDateStr) return true;
  }
  return false;
}

/**
 * Verilen bir tarihin ait olduğu Pazartesi gününü döner.
 * Saat 12:00:00 olarak sabitlenerek DST (yaz/kış saati) geçişlerindeki gün kaymaları önlenir.
 * Pazar günleri doğru şekilde bir önceki Pazartesi'ye bağlanır.
 */
export function getMonday(d) {
  const dateObj = new Date(d);
  const date = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 12, 0, 0);
  const day = date.getDay(); // 0: Pazar, 1: Pazartesi, ..., 6: Cumartesi
  // Pazar ise 6 gün geri; değilse (1 - day) gün geri giderek Pazartesi bulunur
  const distanceToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + distanceToMonday);
  return date;
}

/**
 * Verilen bir tarihin haftalık 7 gün dizisini döner.
 * Pazartesi'den başlar, Pazar ile biter.
 * Ay ve yıl geçişlerini (örn: 28 Aralık - 3 Ocak) tam doğrulukla hesaplar.
 */
export function getWeekDays(refDate) {
  const monday = getMonday(refDate);
  const days = [];
  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const todayYMD = getTodayYMD();

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i, 12, 0, 0);
    const fullDate = formatDateYMD(d);
    const isToday = fullDate === todayYMD;

    days.push({
      key: dayNames[i].toLowerCase(),
      dayName: dayNames[i],
      dayNum: d.getDate(),
      fullDate,
      isToday,
      isWeekend: i >= 5,
    });
  }
  return days;
}

/**
 * Hafta aralığı metnini biçimlendirir.
 * Ay ve yıl geçişlerinde tam doğruluk sağlar:
 * - Aynı ay: "10 – 16 Kasım 2026"
 * - Ay geçişi: "28 Mart – 3 Nisan 2026"
 * - Yıl geçişi: "28 Aralık 2026 – 3 Ocak 2027"
 */
export function formatWeekRange(refDate) {
  const monday = getMonday(refDate);
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6, 12, 0, 0);

  const monthsTr = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const mDay = monday.getDate();
  const mMonth = monthsTr[monday.getMonth()];
  const mYear = monday.getFullYear();

  const sDay = sunday.getDate();
  const sMonth = monthsTr[sunday.getMonth()];
  const sYear = sunday.getFullYear();

  // Yıl geçişi
  if (mYear !== sYear) {
    return `${mDay} ${mMonth} ${mYear} – ${sDay} ${sMonth} ${sYear}`;
  }
  // Ay geçişi
  if (mMonth !== sMonth) {
    return `${mDay} ${mMonth} – ${sDay} ${sMonth} ${sYear}`;
  }
  // Aynı ay içi
  return `${mDay} – ${sDay} ${sMonth} ${sYear}`;
}

/**
 * 2024-03-18 bazlı şablon randevuları canlı haftanın ilgili günlerine taşır
 */
export function normalizeAppointmentsToCurrentWeek(appointmentsList) {
  const monday = getMonday(new Date());
  const weekDayMap = {
    '2024-03-18': 0, // Pazartesi
    '2024-03-19': 1, // Salı
    '2024-03-20': 2, // Çarşamba
    '2024-03-21': 3, // Perşembe
    '2024-03-22': 4, // Cuma
    '2024-03-23': 5, // Cumartesi
    '2024-03-24': 6, // Pazar
  };

  return appointmentsList.map((appt) => {
    const dayOffset = appt.dayIndex !== undefined
      ? appt.dayIndex
      : (weekDayMap[appt.date] !== undefined ? weekDayMap[appt.date] : undefined);

    if (dayOffset !== undefined) {
      const targetDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + dayOffset, 12, 0, 0);
      return {
        ...appt,
        status: appt.status || 'active',
        date: formatDateYMD(targetDate),
      };
    }
    return {
      ...appt,
      status: appt.status || 'active',
    };
  });
}

/**
 * Görevleri canlı sisteme göre normalize eder
 */
export function normalizeTasksToCurrentWeek(tasksList) {
  const todayStr = getTodayYMD();
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12, 0, 0);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0);

  return tasksList.map((task) => {
    if (!task.dueDate || task.dueDate === '2024-03-20') {
      return { ...task, dueDate: todayStr };
    }
    if (task.dueDate === '2024-03-21') {
      return { ...task, dueDate: formatDateYMD(tomorrow) };
    }
    if (task.dueDate && task.dueDate < '2024-03-20') {
      return { ...task, dueDate: formatDateYMD(yesterday) };
    }
    return task;
  });
}
