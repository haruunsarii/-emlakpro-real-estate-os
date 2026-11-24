/**
 * EmlakPro Customer Portal Helper Utilities
 *
 * Provides central property publishing security rules,
 * data sanitization (stripping internal CRM fields),
 * Turkish-aware search matching, and multi-criteria filtering/sorting.
 */

import { matchesTurkishSearch } from './turkishSearch';
import { matchPropertiesForDemand } from './matchingAlgorithm';
import { isValidPhone, isNonEmpty } from './validation';
import { getTodayYMD } from './taskHelpers';

/**
 * Valid public listing statuses allowed to be visible to customers.
 */
export const PUBLIC_ALLOWED_STATUSES = Object.freeze(['Aktif', 'Yeni İlan']);

/**
 * Statuses that must strictly remain hidden from the public portal.
 */
export const PUBLIC_HIDDEN_STATUSES = Object.freeze([
  'Pasif',
  'Taslak',
  'Sözleşmede',
  'Satıldı',
  'Kiralandı',
]);

/**
 * Central Public Visibility Guard.
 * Determines whether a property record is eligible to be shown on the public portal.
 *
 * Strict Rules:
 * 1. isPublished === false is NEVER visible under any condition.
 * 2. Even if isPublished === true, the status MUST be 'Aktif' or 'Yeni İlan'.
 * 3. Legacy records without isPublished are only visible if status is 'Aktif' or 'Yeni İlan'.
 * 4. 'Pasif', 'Taslak', 'Sözleşmede', 'Satıldı', 'Kiralandı' are strictly hidden.
 *
 * @param {object|null|undefined} property
 * @returns {boolean}
 */
export function isPropertyPubliclyVisible(property) {
  if (!property || typeof property !== 'object') {
    return false;
  }

  // 1. Explicit unpublished check
  if (property.isPublished === false) {
    return false;
  }

  const rawStatus = (property.status || '').trim();

  // 2. Negative blacklist check
  if (PUBLIC_HIDDEN_STATUSES.includes(rawStatus)) {
    return false;
  }

  // 3. Positive whitelist check (only 'Aktif' and 'Yeni İlan')
  if (!PUBLIC_ALLOWED_STATUSES.includes(rawStatus)) {
    return false;
  }

  // Passes all security checks
  return true;
}

/**
 * Scrub internal CRM-only fields before sending property data to public UI.
 * Strips: contract, matchedBuyers, matchedCount, matchedLabel, internalNotes, etc.
 *
 * @param {object} property
 * @returns {object|null}
 */
export function sanitizePropertyForPortal(property) {
  if (!property || typeof property !== 'object') {
    return null;
  }

  // Clone public fields and safely strip CRM-only fields without unused variable declarations
  const publicFields = { ...property };
  delete publicFields.contract;
  delete publicFields.matchedBuyers;
  delete publicFields.matchedCount;
  delete publicFields.matchedLabel;
  delete publicFields.portalSync;
  delete publicFields.internalNotes;
  delete publicFields.commissionRate;

  // Provide safe defaults for public representation
  const mainImage =
    property.gallery?.[0]?.image ||
    property.image ||
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';

  return {
    ...publicFields,
    mainImage,
    photoCount: property.gallery?.length || property.photoCount || 1,
    formattedPrice: property.priceFormatted || formatPrice(property.price),
  };
}

/**
 * Filter an array of properties and sanitize them for public portal presentation.
 *
 * @param {Array} properties
 * @returns {Array}
 */
export function getPublicProperties(properties) {
  if (!Array.isArray(properties)) {
    return [];
  }

  return properties
    .filter(isPropertyPubliclyVisible)
    .map(sanitizePropertyForPortal);
}

/**
 * Extract public-safe advisor information for a property.
 * Links to existing settings.users or property.advisor without leaking internal fields.
 *
 * @param {object} property
 * @param {Array} users - Registered users from settings.users
 * @param {object} office - Office profile from settings.office
 * @returns {object}
 */
export function getPublicAdvisorForProperty(property, users = [], office = null) {
  if (!property) return null;

  const officePhone = office?.phone || '+90 (212) 555 0123';
  const officeEmail = office?.email || 'info@emlakpro.com';
  const officeBranch = office?.branch || office?.officeName || 'Genel Merkez';

  const advisorProp = property.advisor;
  const advisorName = typeof advisorProp === 'string' ? advisorProp : advisorProp?.name;
  const advisorId = property.advisorId || (typeof advisorProp === 'object' ? advisorProp?.id : null);

  // Search in settings.users if available
  let matchedUser = null;
  if (Array.isArray(users) && users.length > 0) {
    if (advisorId) {
      matchedUser = users.find((u) => u.id === advisorId);
    }
    if (!matchedUser && advisorName) {
      matchedUser = users.find(
        (u) => u.name && u.name.trim().toLowerCase() === advisorName.trim().toLowerCase()
      );
    }
  }

  // If found in settings.users, extract only public-safe fields
  if (matchedUser) {
    return {
      name: matchedUser.name,
      title: matchedUser.title || matchedUser.displayRole || 'Gayrimenkul Danışmanı',
      phone: matchedUser.phone || officePhone,
      email: matchedUser.email || officeEmail,
      avatarUrl: matchedUser.avatarUrl || '',
    };
  }

  // If defined directly on property as object
  if (advisorProp && typeof advisorProp === 'object') {
    return {
      name: advisorProp.name || `${officeBranch} Danışmanı`,
      title: advisorProp.title || 'Gayrimenkul Danışmanı',
      phone: advisorProp.phone || officePhone,
      email: advisorProp.email || officeEmail,
      avatarUrl: advisorProp.avatar || advisorProp.avatarUrl || '',
    };
  }

  // If defined as plain string name
  if (typeof advisorProp === 'string' && advisorProp.trim()) {
    return {
      name: advisorProp.trim(),
      title: 'Gayrimenkul Danışmanı',
      phone: officePhone,
      email: officeEmail,
      avatarUrl: property.advisorAvatar || '',
    };
  }

  // Fallback to corporate representative
  return {
    name: `${officeBranch} Portföy Yöneticisi`,
    title: 'Yetkili Müşteri Temsilcisi',
    phone: officePhone,
    email: officeEmail,
    avatarUrl: '',
  };
}
export function formatPrice(price) {
  if (price === null || price === undefined || price === '') {
    return '₺0';
  }
  const num = typeof price === 'number' ? price : Number(String(price).replace(/[^0-9.-]+/g, ''));
  if (isNaN(num)) {
    return String(price);
  }
  return '₺' + num.toLocaleString('tr-TR');
}

/**
 * Map fine-grained property categories into standard top-level groups:
 * 'Konut' | 'Ticari' | 'Arsa'
 *
 * @param {string} category
 * @returns {'Konut' | 'Ticari' | 'Arsa'}
 */
export function getCategoryGroup(category) {
  if (!category || typeof category !== 'string') return 'Konut';
  const c = category.toLowerCase().trim();

  if (
    c.includes('ticari') ||
    c.includes('ofis') ||
    c.includes('plaza') ||
    c.includes('dükkan') ||
    c.includes('dukkan') ||
    c.includes('mağaza') ||
    c.includes('magaza') ||
    c.includes('depo') ||
    c.includes('fabrika')
  ) {
    return 'Ticari';
  }

  if (
    c.includes('arsa') ||
    c.includes('arazi') ||
    c.includes('tarla') ||
    c.includes('bağ') ||
    c.includes('bag')
  ) {
    return 'Arsa';
  }

  return 'Konut';
}

/**
 * Multi-criteria filtering and sorting engine for customer portal listings.
 *
 * @param {Array} properties - Array of public property records
 * @param {object} filters - Active filter state
 * @param {string} sortBy - Sort key ('newest' | 'price_asc' | 'price_desc' | 'area_desc')
 * @returns {Array} - Filtered and sorted properties
 */
export function filterAndSortPortalProperties(properties, filters = {}, sortBy = 'newest') {
  if (!Array.isArray(properties)) return [];

  const {
    type = 'all', // 'all' | 'Satılık' | 'Kiralık'
    categoryGroup = 'all', // 'all' | 'Konut' | 'Ticari' | 'Arsa'
    city = 'all',
    district = 'all',
    room = 'all', // 'all' | '1+1' | '2+1' | '3+1' | '4+1' | '5+'
    minPrice = '',
    maxPrice = '',
    minArea = '',
    maxArea = '',
    search = '',
  } = filters;

  const filtered = properties.filter((prop) => {
    // 1. Transaction Type filter
    if (type !== 'all' && prop.type !== type) {
      return false;
    }

    // 2. Category Group filter
    if (categoryGroup !== 'all') {
      const propGroup = getCategoryGroup(prop.category);
      if (propGroup !== categoryGroup) {
        return false;
      }
    }

    // 3. City filter (if property has city field or parsed from location)
    if (city !== 'all') {
      const propCity = prop.city || (prop.location?.includes('İstanbul') ? 'İstanbul' : '');
      if (propCity && propCity !== city) {
        return false;
      }
    }

    // 4. District filter
    if (district !== 'all' && prop.district !== district) {
      return false;
    }

    // 5. Room count filter
    if (room !== 'all') {
      if (room === '5+') {
        const roomStr = (prop.rooms || '').trim();
        // matches '5+1', '5+2', '6+1', etc.
        const firstDigit = parseInt(roomStr[0], 10);
        if (isNaN(firstDigit) || firstDigit < 5) {
          return false;
        }
      } else if (prop.rooms !== room) {
        return false;
      }
    }

    // 6. Price range filter
    const propPrice = typeof prop.price === 'number' ? prop.price : parseFloat(prop.price) || 0;
    if (minPrice !== '' && !isNaN(Number(minPrice))) {
      if (propPrice < Number(minPrice)) return false;
    }
    if (maxPrice !== '' && !isNaN(Number(maxPrice))) {
      if (propPrice > Number(maxPrice)) return false;
    }

    // 7. Area (m²) range filter (using netArea or grossArea)
    const propArea = prop.netArea || prop.grossArea || 0;
    if (minArea !== '' && !isNaN(Number(minArea))) {
      if (propArea < Number(minArea)) return false;
    }
    if (maxArea !== '' && !isNaN(Number(maxArea))) {
      if (propArea > Number(maxArea)) return false;
    }

    // 8. Keyword / text search with Turkish insensitivity
    if (search && search.trim().length > 0) {
      const q = search.trim();
      const matchTitle = matchesTurkishSearch(prop.title, q);
      const matchLoc = matchesTurkishSearch(prop.location, q);
      const matchDist = matchesTurkishSearch(prop.district, q);
      const matchNeigh = matchesTurkishSearch(prop.neighborhood, q);
      const matchCat = matchesTurkishSearch(prop.category, q);
      const matchType = matchesTurkishSearch(prop.type, q);
      const matchId = matchesTurkishSearch(prop.id, q);

      if (
        !matchTitle &&
        !matchLoc &&
        !matchDist &&
        !matchNeigh &&
        !matchCat &&
        !matchType &&
        !matchId
      ) {
        return false;
      }
    }

    return true;
  });

  // Sort results
  return filtered.sort((a, b) => {
    const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0;
    const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price) || 0;
    const areaA = a.netArea || a.grossArea || 0;
    const areaB = b.netArea || b.grossArea || 0;

    switch (sortBy) {
      case 'price_asc':
        return priceA - priceB;
      case 'price_desc':
        return priceB - priceA;
      case 'area_desc':
        return areaB - areaA;
      case 'newest':
      default:
        // Prioritize VIP/Exclusive, then default order
        if (a.isVip && !b.isVip) return -1;
        if (!a.isVip && b.isVip) return 1;
        return 0;
    }
  });
}

/**
 * Normalize phone number for duplicate customer comparison.
 * Extracts pure 10-digit Turkish mobile number (e.g. 5XXXXXXXXX).
 *
 * @param {string} phone
 * @returns {string}
 */
export function normalizePhoneForLookup(phone) {
  if (!phone || typeof phone !== 'string') return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('90')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, 10);
}

/**
 * Check if a customer already exists in the given customer list by normalized phone.
 *
 * @param {string} phone
 * @param {Array} customers
 * @returns {object|null}
 */
export function findCustomerByPhone(phone, customers = []) {
  if (!phone || !Array.isArray(customers) || customers.length === 0) return null;
  const targetNorm = normalizePhoneForLookup(phone);
  if (!targetNorm) return null;
  return (
    customers.find((c) => {
      const cNorm = normalizePhoneForLookup(c?.phone);
      return cNorm && cNorm === targetNorm;
    }) || null
  );
}

/**
 * Find an eligible active advisor from settings.users.
 * Never fabricates fake advisors; returns null if none available.
 *
 * @param {Array} users - Registered users from settings.users
 * @param {string|object|null} preferredName - Optional advisor name from property or selection
 * @returns {object|null}
 */
export function findEligibleAdvisor(users = [], preferredName = null) {
  let userList = Array.isArray(users) ? users : [];
  if (userList.length === 0) {
    try {
      const raw = window.localStorage.getItem('emlakpro_settings_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.users)) userList = parsed.users;
      }
    } catch {}
  }
  if (!Array.isArray(userList) || userList.length === 0) return null;

  // 1. If preferredName is provided, check if that active user exists
  if (preferredName) {
    const pName =
      typeof preferredName === 'string'
        ? preferredName.trim().toLowerCase()
        : preferredName?.name?.trim()?.toLowerCase();
    if (pName) {
      const matched = users.find(
        (u) =>
          u &&
          u.status !== 'Pasif' &&
          u.name &&
          u.name.trim().toLowerCase() === pName
      );
      if (matched) return matched;
    }
  }

  // 2. Otherwise find the first active user (consultant or manager)
  const activeUser = users.find((u) => u && u.status !== 'Pasif');
  return activeUser || null;
}

/**
 * Upsert (find existing or create new) customer from public portal interactions.
 * Prevents duplicates via Turkish GSM phone normalization (findCustomerByPhone).
 * Maintains customer timeline history with caller-specified title and notes.
 *
 * @param {object} params
 * @param {object} params.formData
 * @param {Array} [params.customers]
 * @param {Array} [params.users]
 * @param {string} params.activityTitle
 * @param {string} params.activityNotes
 * @param {string} [params.defaultRole]
 * @param {string} [params.defaultRegion]
 * @param {string} [params.budgetDisplay]
 * @param {number} [params.budgetMin]
 * @param {number} [params.budgetMax]
 * @returns {{ customerId: string, customer: object, updatedCustomers: Array, isExistingCustomer: boolean }}
 */
export function upsertCustomerFromPortal({
  formData,
  customers = [],
  users = [],
  activityTitle,
  activityNotes,
  defaultRole = 'Alıcı',
  defaultRegion = 'İstanbul',
  budgetDisplay = 'Belirtilmedi',
  budgetMin = 0,
  budgetMax = 0,
}) {
  let customerList = [];
  try {
    const raw = window.localStorage.getItem('emlakpro_customers_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) customerList = parsed;
    }
  } catch {}

  // If localStorage has no customers yet, use passed customer list
  if (customerList.length === 0 && Array.isArray(customers) && customers.length > 0) {
    customerList = [...customers];
  }

  const existingCustomer = findCustomerByPhone(formData.phone, customerList);
  const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const timelineId = `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  let customerId = '';
  let updatedCustomers = [...customerList];
  let targetCustomer = null;

  if (existingCustomer) {
    customerId = existingCustomer.id;
    const newTimelineItem = {
      id: timelineId,
      title: activityTitle,
      notes: activityNotes,
      date: 'Bugün, ' + timeStr,
      bulletBg: 'bg-primary',
    };

    updatedCustomers = updatedCustomers.map((c) => {
      if (c.id === customerId) {
        const currentTimeline = Array.isArray(c.timeline) ? c.timeline : [];
        targetCustomer = {
          ...c,
          email: c.email || formData.email?.trim() || '',
          timeline: [newTimelineItem, ...currentTimeline],
        };
        return targetCustomer;
      }
      return c;
    });
  } else {
    customerId = `c-${Date.now()}`;
    const initials = (formData.name || '')
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const assignedAdvisor = findEligibleAdvisor(users);

    const newCustomerLead = {
      id: customerId,
      name: (formData.name || '').trim(),
      initials: initials || 'EP',
      phone: (formData.phone || '').trim(),
      email: formData.email?.trim() || '',
      role: defaultRole,
      segment: 'Web Portalı Adayı',
      region: defaultRegion,
      budget: budgetDisplay,
      budgetMin: Number(budgetMin) || 0,
      budgetMax: Number(budgetMax) || 0,
      advisor: assignedAdvisor ? assignedAdvisor.name : null,
      advisorShort: assignedAdvisor
        ? assignedAdvisor.name.split(' ').map((n, i, a) => (i === a.length - 1 ? n : n[0] + '.')).join(' ')
        : null,
      status: 'Sıcak Aday',
      statusType: 'hot',
      registrationDate: 'Bugün',
      timeline: [
        {
          id: timelineId,
          title: activityTitle,
          notes: activityNotes,
          date: 'Bugün, ' + timeStr,
          bulletBg: 'bg-primary',
        },
      ],
    };

    targetCustomer = newCustomerLead;
    updatedCustomers = [newCustomerLead, ...updatedCustomers];
  }

  return {
    customerId,
    customer: targetCustomer,
    updatedCustomers,
    isExistingCustomer: Boolean(existingCustomer),
  };
}

/**
 * Submit a customer property search demand from the public portal.
 * Respects:
 * - Single source of truth (emlakpro_requests_v1 & emlakpro_customers_v1)
 * - Duplicate customer detection (links demand to existing customer without creating duplicate)
 * - Safe advisor assignment (no fake advisors)
 * - Instant matching engine calculation (overallScore & matchedProperties)
 * - Clean localStorage persistence and same-window CustomEvent sync
 *
 * @param {object} params
 * @param {object} params.formData
 * @param {Array} params.properties
 * @param {Array} params.customers
 * @param {Array} params.users
 * @returns {{ success: boolean, demandId?: string, demand?: object, isExistingCustomer?: boolean, error?: string }}
 */
export function submitPortalDemand({
  formData,
  properties = [],
  customers = [],
  users = [],
}) {
  if (!formData || typeof formData !== 'object') {
    return { success: false, error: 'Geçersiz form verisi.' };
  }

  // Validations
  if (!isNonEmpty(formData.name, 2)) {
    return { success: false, error: 'Ad Soyad en az 2 karakter olmalıdır.' };
  }
  if (!isValidPhone(formData.phone)) {
    return { success: false, error: 'Geçerli bir Türkiye cep telefonu giriniz.' };
  }
  if (!formData.kvkkConsent) {
    return { success: false, error: 'Lütfen KVKK aydınlatma metnini onaylayınız.' };
  }

  const minB = Number(formData.minBudget) || 0;
  const maxB = Number(formData.maxBudget) || 0;
  let budgetDisplay = formData.budgetDisplay;
  if (!budgetDisplay) {
    if (minB > 0 || maxB > 0) {
      budgetDisplay = `₺${minB.toLocaleString('tr-TR')} - ₺${maxB.toLocaleString('tr-TR')}`;
    } else {
      budgetDisplay = 'Belirtilmedi';
    }
  }

  const existingCustomer = findCustomerByPhone(formData.phone, customers);
  const isExisting = Boolean(existingCustomer);
  const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  const activityTitle = isExisting ? 'Web Portalı Talebi Alındı' : 'Web Portalı Üzerinden Kaydoldu';
  const activityNotes = isExisting
    ? `${formData.transactionType || 'Satılık'} ${formData.propertyType || 'Daire'} talebi kaydedildi.`
    : 'Müşteri web portalı üzerinden gayrimenkul arama talebi bıraktı.';

  const { customerId, updatedCustomers, isExistingCustomer } = upsertCustomerFromPortal({
    formData,
    customers,
    users,
    activityTitle,
    activityNotes,
    defaultRole: formData.transactionType === 'Kiralık' ? 'Kiracı' : 'Alıcı',
    defaultRegion: formData.district?.trim() || 'İstanbul',
    budgetDisplay,
    budgetMin: minB,
    budgetMax: maxB,
  });

  // Find eligible advisor for demand
  const assignedAdvisor = findEligibleAdvisor(users);

  // Generate unique demand ID: TLP-XXXX
  const demandId = `TLP-${Math.floor(1000 + Math.random() * 9000)}`;

  const rawDemand = {
    id: demandId,
    customerId,
    clientName: formData.name.trim(),
    phone: formData.phone.trim(),
    email: formData.email?.trim() || '',
    transactionType: formData.transactionType || 'Satılık',
    propertyType: formData.propertyType || 'Daire / Rezidans',
    city: 'İstanbul',
    district: formData.district?.trim() || '',
    neighborhood: formData.neighborhood?.trim() || '',
    minBudget: minB,
    maxBudget: maxB,
    budget: budgetDisplay,
    minRooms: formData.minRooms || '1+1',
    maxRooms: formData.maxRooms || '4+1',
    roomCount: `${formData.minRooms || '1+1'} - ${formData.maxRooms || '4+1'}`,
    minArea: Number(formData.minArea) || 0,
    maxArea: Number(formData.maxArea) || 0,
    features: Array.isArray(formData.features) ? formData.features : [],
    notes: formData.notes?.trim() || '',
    advisor: assignedAdvisor ? assignedAdvisor.name : null,
    advisorInitials: assignedAdvisor
      ? assignedAdvisor.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : null,
    status: 'Aktif',
    statusBadge: 'Yeni Web Talebi',
    category: 'Web Adayı',
    source: 'Müşteri Portalı',
    date: 'Bugün',
    notesList: [
      {
        text: 'Müşteri web portalı üzerinden arama talebi iletti.',
        author: 'Sistem (Web Portalı)',
        date: 'Bugün, ' + timeStr,
      },
    ],
  };

  // Run matching engine against properties
  const matches = matchPropertiesForDemand(rawDemand, properties, 50);
  const topScore = matches.length > 0 ? matches[0].matchScore : 0;

  const newDemand = {
    ...rawDemand,
    overallScore: topScore,
    scoreBadge: topScore > 0 ? `%${topScore} Uyum` : 'Eşleşme Yok',
    matchedProperties: matches.slice(0, 3),
  };

  // Save to localStorage: emlakpro_requests_v1 & emlakpro_customers_v1
  let storedDemands = [];
  try {
    const raw = window.localStorage.getItem('emlakpro_requests_v1');
    if (raw) storedDemands = JSON.parse(raw);
  } catch {}
  const updatedDemands = [newDemand, ...(Array.isArray(storedDemands) ? storedDemands : [])];

  try {
    window.localStorage.setItem('emlakpro_requests_v1', JSON.stringify(updatedDemands));
    window.localStorage.setItem('emlakpro_customers_v1', JSON.stringify(updatedCustomers));

    // Dispatch same-window CustomEvent so React useLocalStorage hooks update reactively
    window.dispatchEvent(
      new CustomEvent('emlakpro_local_storage_sync', {
        detail: { key: 'emlakpro_requests_v1', newValue: updatedDemands },
      })
    );
    window.dispatchEvent(
      new CustomEvent('emlakpro_local_storage_sync', {
        detail: { key: 'emlakpro_customers_v1', newValue: updatedCustomers },
      })
    );
  } catch (e) {
    console.error('LocalStorage write error in submitPortalDemand:', e);
  }

  return {
    success: true,
    demandId,
    demand: newDemand,
    isExistingCustomer,
  };
}

/**
 * Submit a customer general contact message from the public portal.
 * Saves into emlakpro_tasks_v1 and emlakpro_customers_v1, linking the task to the customer.
 * Prevents duplicates via Turkish GSM phone normalization.
 *
 * @param {object} params
 * @param {object} params.formData
 * @param {Array} [params.users]
 * @param {Array} [params.customers]
 * @returns {{ success: boolean, taskId?: string, task?: object, customerId?: string, customer?: object, isExistingCustomer?: boolean, error?: string }}
 */
export function submitPortalContactMessage({ formData, users = [], customers = [] }) {
  if (!formData || typeof formData !== 'object') {
    return { success: false, error: 'Geçersiz mesaj verisi.' };
  }

  if (!isNonEmpty(formData.name, 2)) {
    return { success: false, error: 'Ad Soyad en az 2 karakter olmalıdır.' };
  }
  if (!isValidPhone(formData.phone)) {
    return { success: false, error: 'Geçerli bir Türkiye cep telefonu giriniz.' };
  }
  if (!isNonEmpty(formData.message, 5)) {
    return { success: false, error: 'Mesajınız en az 5 karakter olmalıdır.' };
  }
  if (!formData.kvkkConsent) {
    return { success: false, error: 'Lütfen KVKK aydınlatma metnini onaylayınız.' };
  }

  const assignedAdvisor = findEligibleAdvisor(users);
  const taskId = `TASK-${Date.now().toString().slice(-4)}`;
  const subject = formData.subject || 'Genel Danışmanlık';

  const existingCustomer = findCustomerByPhone(formData.phone, customers);
  const isExisting = Boolean(existingCustomer);

  const activityTitle = isExisting
    ? `Web İletişim Mesajı: ${subject}`
    : 'Web Portalı Üzerinden Kaydoldu';
  const activityNotes = isExisting
    ? `"${formData.message.trim()}"`
    : `İletişim Mesajı (${subject}): "${formData.message.trim()}"`;

  const { customerId, customer: targetCustomer, updatedCustomers, isExistingCustomer } =
    upsertCustomerFromPortal({
      formData,
      customers,
      users,
      activityTitle,
      activityNotes,
      defaultRole: 'Alıcı',
      defaultRegion: 'İstanbul',
      budgetDisplay: 'Belirtilmedi',
      budgetMin: 0,
      budgetMax: 0,
    });

  const newTask = {
    id: taskId,
    title: `Web İletişim Mesajı: ${subject} - ${formData.name.trim()}`,
    description: `İletişim: ${formData.phone.trim()}${formData.email ? ` | ${formData.email.trim()}` : ''} • Mesaj: "${formData.message.trim()}"`,
    priority: 'high',
    dueDate: getTodayYMD(),
    dueTime: '10:00',
    assignedTo: assignedAdvisor ? assignedAdvisor.name : null,
    completed: false,
    completedAt: null,
    source: 'Müşteri Portalı',
    customerId,
    customerName: targetCustomer?.name || formData.name.trim(),
    customerPhone: targetCustomer?.phone || formData.phone.trim(),
    customerEmail: targetCustomer?.email || formData.email?.trim() || '',
  };

  let storedTasks = [];
  try {
    const raw = window.localStorage.getItem('emlakpro_tasks_v1');
    if (raw) storedTasks = JSON.parse(raw);
  } catch {}
  const updatedTasks = [newTask, ...(Array.isArray(storedTasks) ? storedTasks : [])];

  try {
    window.localStorage.setItem('emlakpro_tasks_v1', JSON.stringify(updatedTasks));
    window.localStorage.setItem('emlakpro_customers_v1', JSON.stringify(updatedCustomers));

    window.dispatchEvent(
      new CustomEvent('emlakpro_local_storage_sync', {
        detail: { key: 'emlakpro_tasks_v1', newValue: updatedTasks },
      })
    );
    window.dispatchEvent(
      new CustomEvent('emlakpro_local_storage_sync', {
        detail: { key: 'emlakpro_customers_v1', newValue: updatedCustomers },
      })
    );
  } catch (e) {
    console.error('LocalStorage write error in submitPortalContactMessage:', e);
  }

  return {
    success: true,
    taskId,
    task: newTask,
    customerId,
    customer: targetCustomer,
    isExistingCustomer,
  };
}

/**
 * Submit an inquiry message for a specific property from the public detail page.
 * Creates an urgent follow-up task assigned to the property's advisor.
 *
 * @param {object} params
 * @param {object} params.formData
 * @param {object} params.property
 * @param {Array} params.users
 * @returns {{ success: boolean, taskId?: string, task?: object, error?: string }}
 */
export function submitPropertyInquiry({ formData, property, users = [] }) {
  if (!formData || typeof formData !== 'object') {
    return { success: false, error: 'Geçersiz talep verisi.' };
  }

  if (!isNonEmpty(formData.name, 2)) {
    return { success: false, error: 'Ad Soyad en az 2 karakter olmalıdır.' };
  }
  if (!isValidPhone(formData.phone)) {
    return { success: false, error: 'Geçerli bir Türkiye cep telefonu giriniz.' };
  }
  if (!formData.kvkkConsent) {
    return { success: false, error: 'Lütfen KVKK aydınlatma metnini onaylayınız.' };
  }

  const assignedAdvisor = findEligibleAdvisor(users, property?.advisor);
  const taskId = `TASK-${Date.now().toString().slice(-4)}`;
  const propId = property?.id || 'İlan';
  const propTitle = property?.title || 'Gayrimenkul';

  const defaultMsg = `Merhaba, #${propId} referanslı ilan hakkında detaylı bilgi ve randevu rica ediyorum.`;
  const message = formData.message?.trim() || defaultMsg;

  const newTask = {
    id: taskId,
    title: `İlan Bilgi Talebi: #${propId} - ${formData.name.trim()}`,
    description: `İlan: ${propTitle} • Tel: ${formData.phone.trim()} • Mesaj: "${message}"`,
    priority: 'urgent',
    dueDate: getTodayYMD(),
    dueTime: '10:00',
    assignedTo: assignedAdvisor ? assignedAdvisor.name : null,
    completed: false,
    completedAt: null,
    source: 'Müşteri Portalı İlan Detayı',
  };

  let storedTasks = [];
  try {
    const raw = window.localStorage.getItem('emlakpro_tasks_v1');
    if (raw) storedTasks = JSON.parse(raw);
  } catch {}
  const updatedTasks = [newTask, ...(Array.isArray(storedTasks) ? storedTasks : [])];

  try {
    window.localStorage.setItem('emlakpro_tasks_v1', JSON.stringify(updatedTasks));
    window.dispatchEvent(
      new CustomEvent('emlakpro_local_storage_sync', {
        detail: { key: 'emlakpro_tasks_v1', newValue: updatedTasks },
      })
    );
  } catch (e) {
    console.error('LocalStorage write error in submitPropertyInquiry:', e);
  }

  return { success: true, taskId, task: newTask };
}
