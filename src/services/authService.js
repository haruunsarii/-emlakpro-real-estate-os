/**
 * EmlakPro Real Estate OS - Client-Side Authentication Service (Frontend Prototype)
 *
 * IMPORTANT SECURITY NOTICE:
 * This service operates strictly on the client side (SPA) for prototyping and demonstration.
 * Passwords are hashed using the Web Crypto API (SHA-256) before storing in localStorage,
 * ensuring plaintext passwords are NEVER persisted in browser storage or session objects.
 * This client-side hashing mechanism does NOT replace a genuine backend authentication server,
 * salted slow hashing (e.g. bcrypt/Argon2), HTTPS cookie sessions, or server-side authorization.
 */

import { getSavedSettings, saveSettings } from './settingsData';

export const SESSION_STORAGE_KEY = 'emlakpro_session_v1';

/**
 * Hash a plain-text password using the browser Web Crypto API (SHA-256).
 * Safe deterministic fallback is provided if Web Crypto is unavailable.
 *
 * @param {string} plainText
 * @returns {Promise<string>}
 */
export async function hashPassword(plainText) {
  if (!plainText || typeof plainText !== 'string') {
    return '';
  }

  // Use Web Crypto API if available (standard in modern browsers & Node 15+)
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const salt = 'emlakpro_salt_v1_';
      const data = encoder.encode(salt + plainText);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return `sha256:${hashHex}`;
    } catch (e) {
      console.warn('Web Crypto API hashleme hatası, fallback devrede:', e);
    }
  }

  // Deterministic fallback for non-crypto or restricted environments
  let hash = 0;
  const str = 'emlakpro_salt_fallback_' + plainText;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `fallback:${Math.abs(hash).toString(16)}`;
}

/**
 * Verify a plain-text password against a stored passwordHash.
 * If user has no passwordHash (e.g. created prior to auth system),
 * allows default initial password '123456'.
 *
 * @param {string} plainText
 * @param {string} storedHash
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(plainText, storedHash) {
  if (!plainText) return false;
  const computedHash = await hashPassword(plainText);

  if (!storedHash) {
    // Backwards compatibility for users added without an initial password
    const defaultHash = await hashPassword('123456');
    return computedHash === defaultHash;
  }

  return computedHash === storedHash;
}

/**
 * Normalize role to standard permission tiers ('admin' | 'consultant').
 *
 * @param {string} role
 * @returns {'admin' | 'consultant'}
 */
export function normalizeRole(role) {
  if (!role || typeof role !== 'string') return 'consultant';
  const r = role.toLowerCase().trim();
  if (
    r === 'admin' ||
    r === 'yönetici' ||
    r === 'yonetici' ||
    r === 'ofis müdürü' ||
    r === 'ofis muduru'
  ) {
    return 'admin';
  }
  return 'consultant';
}

/**
 * Retrieve all registered users from the single source of truth (settings.users).
 *
 * @returns {Array}
 */
export function getRegisteredUsers() {
  const settings = getSavedSettings();
  if (settings && Array.isArray(settings.users)) {
    return settings.users;
  }
  return [];
}

/**
 * Check if at least one user is registered in the system.
 *
 * @returns {boolean}
 */
export function hasAnyRegisteredUser() {
  return getRegisteredUsers().length > 0;
}

/**
 * Check if an administrator user is registered in the system.
 *
 * @returns {boolean}
 */
export function hasAdminUser() {
  const users = getRegisteredUsers();
  return users.some((u) => normalizeRole(u.role) === 'admin' && u.status !== 'Pasif');
}

/**
 * Get current session object from localStorage.
 * Validates that the user still exists in settings.users and is active.
 * Guarantees that neither password nor passwordHash is ever exposed in session.
 *
 * @returns {object|null}
 */
export function getCurrentSession() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);
    if (!session || typeof session !== 'object' || !session.userId) {
      clearSession();
      return null;
    }

    // Verify user exists and is active in registered users
    const users = getRegisteredUsers();
    const user = users.find((u) => u.id === session.userId);
    if (!user || user.status === 'Pasif') {
      clearSession();
      return null;
    }

    // Return sanitized session (strictly no password or hash)
    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: normalizeRole(user.role),
      displayRole: user.role || 'Gayrimenkul Danışmanı',
      title: user.title || (normalizeRole(user.role) === 'admin' ? 'Yönetici' : 'Danışman'),
      avatarUrl: user.avatarUrl || '',
      loginAt: session.loginAt || new Date().toISOString(),
    };
  } catch (e) {
    console.warn('Oturum bilgisi okunamadı:', e);
    clearSession();
    return null;
  }
}

/**
 * Save an active session in localStorage (WITHOUT password or hash).
 *
 * @param {object} user - User record from settings.users
 * @returns {object} Sanitized session object
 */
export function saveSession(user) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  const session = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
    displayRole: user.role || 'Gayrimenkul Danışmanı',
    title: user.title || (normalizeRole(user.role) === 'admin' ? 'Yönetici' : 'Danışman'),
    avatarUrl: user.avatarUrl || '',
    loginAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('emlakpro_session_change', { detail: session }));
  } catch (e) {
    console.error('Oturum kaydedilemedi:', e);
  }

  return session;
}

/**
 * Clear the current session from localStorage.
 */
export function clearSession() {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('emlakpro_session_change', { detail: null }));
  }
}

/**
 * Set up the initial administrator account when system has 0 registered users.
 *
 * @param {object} params
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} [params.title]
 * @param {string} params.password
 * @param {string} [params.phone]
 * @param {string} [params.avatarUrl]
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
export async function setupInitialAdmin({ name, email, title, password, phone, avatarUrl }) {
  if (hasAnyRegisteredUser()) {
    return {
      success: false,
      error: 'Sistemde zaten kayıtlı kullanıcılar mevcut. Lütfen normal giriş ekranını kullanın.',
    };
  }

  if (!name || name.trim().length < 2) {
    return { success: false, error: 'Yönetici adı ve soyadı en az 2 karakter olmalıdır.' };
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, error: 'Geçerli bir kurumsal e-posta adresi giriniz.' };
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'Yönetici şifresi en az 6 karakter olmalıdır.' };
  }

  const passwordHash = await hashPassword(password);
  const adminId = `usr-admin-${Date.now()}`;
  const adminTitle = (title || '').trim() || 'Sistem Yöneticisi';

  const newAdminUser = {
    id: adminId,
    name: name.trim(),
    email: cleanEmail,
    phone: (phone || '').trim(),
    role: 'Yönetici',
    title: adminTitle,
    status: 'Aktif',
    avatarUrl: (avatarUrl || '').trim(),
    roleBadgeClass: 'bg-primary text-white',
    statusBadgeClass: 'bg-emerald-100 text-emerald-800',
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  // Single Source of Truth: update settings.users & settings.profile
  const currentSettings = getSavedSettings();
  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const updatedSettings = {
    ...currentSettings,
    users: [newAdminUser],
    profile: currentSettings.profile || {
      firstName,
      lastName,
      email: cleanEmail,
      title: adminTitle,
      phone: (phone || '').trim(),
      avatarUrl: (avatarUrl || '').trim(),
      bio: '',
      city: 'İstanbul',
      taxOffice: '',
      taxNumber: '',
      role: 'Yönetici',
    },
  };

  saveSettings(updatedSettings);

  // Automatically start an active session for the newly created admin
  const session = saveSession(newAdminUser);

  return {
    success: true,
    user: session,
  };
}

/**
 * Authenticate an existing user by email and password.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
export async function authenticate(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, error: 'E-posta adresi giriniz.' };
  }
  if (!password) {
    return { success: false, error: 'Şifre giriniz.' };
  }

  const users = getRegisteredUsers();
  const user = users.find((u) => (u.email || '').trim().toLowerCase() === cleanEmail);

  if (!user) {
    return { success: false, error: 'E-posta veya şifre hatalı.' };
  }

  if (user.status === 'Pasif') {
    return { success: false, error: 'Bu kullanıcı hesabı pasife alınmıştır. Yöneticiyle iletişime geçin.' };
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    return { success: false, error: 'E-posta veya şifre hatalı.' };
  }

  const session = saveSession(user);
  return {
    success: true,
    user: session,
  };
}
