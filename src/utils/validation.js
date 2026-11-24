/**
 * EmlakPro Validation & Input Formatting Utilities
 * Standardized validators and formatting helpers across all CRM forms.
 */

/**
 * Automatically formats Turkish phone numbers as the user types
 * Examples: "05321234567" -> "0 (532) 123 45 67"
 * @param {string} value 
 * @returns {string} Formatted phone string
 */
export function formatPhoneNumber(value) {
  if (!value) return '';
  // Strip all non-digit characters
  const digits = value.replace(/\D/g, '');

  // Normalize leading 0
  let cleanDigits = digits;
  if (cleanDigits.startsWith('90')) {
    cleanDigits = cleanDigits.slice(2);
  }
  if (!cleanDigits.startsWith('0') && cleanDigits.length > 0) {
    cleanDigits = '0' + cleanDigits;
  }

  // Truncate to maximum 11 digits (0 + 10 digits)
  cleanDigits = cleanDigits.slice(0, 11);

  // Format into 0 (5XX) XXX XX XX
  const len = cleanDigits.length;
  if (len === 0) return '';
  if (len <= 1) return cleanDigits;
  if (len <= 4) return `${cleanDigits.slice(0, 1)} (${cleanDigits.slice(1)}`;
  if (len <= 7) return `${cleanDigits.slice(0, 1)} (${cleanDigits.slice(1, 4)}) ${cleanDigits.slice(4)}`;
  if (len <= 9) return `${cleanDigits.slice(0, 1)} (${cleanDigits.slice(1, 4)}) ${cleanDigits.slice(4, 7)} ${cleanDigits.slice(7)}`;
  return `${cleanDigits.slice(0, 1)} (${cleanDigits.slice(1, 4)}) ${cleanDigits.slice(4, 7)} ${cleanDigits.slice(7, 9)} ${cleanDigits.slice(9, 11)}`;
}

/**
 * Validates a Turkish phone number
 * Accepts formats: 05XXXXXXXXX, 0 (5XX) XXX XX XX, +90 5XX XXX XX XX
 * @param {string} phone 
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  // Must be 10 digits (without leading zero) or 11 digits (with leading zero), starting with 5 or 05
  if (digits.length === 11 && digits.startsWith('05')) return true;
  if (digits.length === 10 && digits.startsWith('5')) return true;
  if (digits.length === 12 && digits.startsWith('905')) return true;
  return false;
}

/**
 * Standard email validator using RFC-compliant pattern
 * @param {string} email 
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
  return pattern.test(email.trim());
}

/**
 * Validates that string is non-empty after trimming
 * @param {string} text 
 * @param {number} minLength 
 * @returns {boolean}
 */
export function isNonEmpty(text, minLength = 1) {
  if (typeof text !== 'string') return false;
  return text.trim().length >= minLength;
}

/**
 * Validates positive number
 * @param {any} val 
 * @param {number} min 
 * @returns {boolean}
 */
export function isPositiveNumber(val, min = 1) {
  const num = Number(val);
  return !isNaN(num) && isFinite(num) && num >= min;
}

/**
 * Validates min and max budget/price range
 * @param {any} min 
 * @param {any} max 
 * @returns {{ isValid: boolean, message?: string }}
 */
export function validateBudgetRange(min, max) {
  const minNum = Number(min);
  const maxNum = Number(max);
  if (isNaN(minNum) || minNum < 0) {
    return { isValid: false, message: 'Minimum bütçe geçerli bir pozitif sayı olmalıdır.' };
  }
  if (isNaN(maxNum) || maxNum <= 0) {
    return { isValid: false, message: 'Maksimum bütçe geçerli bir pozitif sayı olmalıdır.' };
  }
  if (minNum > maxNum) {
    return { isValid: false, message: 'Minimum bütçe, maksimum bütçeden yüksek olamaz.' };
  }
  return { isValid: true };
}

/**
 * Validates that startTime is before endTime for appointment scheduling
 * @param {string} startTime - HH:MM
 * @param {string} endTime - HH:MM
 * @returns {boolean}
 */
export function isValidTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return true; // optional
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return false;
  return sh * 60 + sm < eh * 60 + em;
}

