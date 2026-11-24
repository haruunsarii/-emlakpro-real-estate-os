/**
 * EmlakPro Turkish-Aware Search & Text Normalization Utility
 *
 * Handles Turkish case conversion and character insensitivity:
 * - ç/Ç -> c
 * - ğ/Ğ -> g
 * - ı/I/İ/i -> i
 * - ö/Ö -> o
 * - ş/Ş -> s
 * - ü/Ü -> u
 *
 * Ensures that searching "kadikoy" matches "Kadıköy", "besiktas" matches "Beşiktaş",
 * "istanbul" matches "İSTANBUL", and "camlica" matches "Çamlıca".
 */

/**
 * Normalizes a string for diacritic-insensitive, Turkish-aware comparison.
 * @param {string|number|null|undefined} text
 * @returns {string}
 */
export function normalizeTurkishText(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    // 1. Explicit Turkish uppercase/lowercase conversions
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'g')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'u')
    // 2. Standard lowercase
    .toLowerCase()
    // 3. Decompose and strip any remaining unicode combining diacritical marks
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // 4. Clean extra spaces
    .trim();
}

/**
 * Checks whether target text contains the query string in a Turkish-aware manner.
 * @param {string|number|null|undefined} target - The text to search within
 * @param {string|null|undefined} query - The search keyword
 * @returns {boolean}
 */
export function matchesTurkishSearch(target, query) {
  if (!query || !query.trim()) return true;
  if (target === null || target === undefined) return false;

  const normalizedTarget = normalizeTurkishText(target);
  const normalizedQuery = normalizeTurkishText(query);

  if (!normalizedQuery) return true;
  return normalizedTarget.includes(normalizedQuery);
}

/**
 * Checks if ANY of the provided fields matches the query keyword.
 * @param {Array<string|number|null|undefined>} fields - Array of strings or values
 * @param {string|null|undefined} query - The search keyword
 * @returns {boolean}
 */
export function matchesAnyTurkishField(fields = [], query = '') {
  if (!query || !query.trim()) return true;
  const normalizedQuery = normalizeTurkishText(query);
  if (!normalizedQuery) return true;

  return fields.some((field) => {
    if (field === null || field === undefined) return false;
    return normalizeTurkishText(field).includes(normalizedQuery);
  });
}

