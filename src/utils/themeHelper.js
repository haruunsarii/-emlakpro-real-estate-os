import { getSavedSettings, saveSettings } from '../services/settingsData';

/**
 * Resolves a theme preference ('light' | 'dark' | 'system') to either 'light' or 'dark'
 */
export function getResolvedTheme(themePreference) {
  if (themePreference === 'dark') return 'dark';
  if (themePreference === 'light') return 'light';
  // If 'system' or unspecified
  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'light';
}

/**
 * Applies the theme to the DOM (adds or removes 'dark' class on documentElement)
 */
export function applyTheme(themeValue) {
  if (typeof document === 'undefined') return 'light';

  let themeToApply = themeValue;
  if (!themeToApply) {
    const settings = getSavedSettings();
    themeToApply = settings?.appearance?.theme || 'light';
  }

  const resolved = getResolvedTheme(themeToApply);
  const isDark = resolved === 'dark';

  if (isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.colorScheme = 'dark';
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.colorScheme = 'light';
  }

  return resolved;
}

/**
 * Updates appearance.theme in settings, saves to localStorage, and immediately applies to DOM
 */
export function setAndSaveTheme(newTheme) {
  if (typeof window === 'undefined') return;

  const currentSettings = getSavedSettings();
  const updated = {
    ...currentSettings,
    appearance: {
      ...(currentSettings?.appearance || {}),
      theme: newTheme,
    },
  };

  saveSettings(updated);
  applyTheme(newTheme);

  window.dispatchEvent(
    new CustomEvent('emlakpro_theme_change', {
      detail: { theme: newTheme, isDark: getResolvedTheme(newTheme) === 'dark' },
    })
  );
}

/**
 * Initializes listeners for theme synchronization across tabs and media query changes
 */
export function initThemeListener() {
  if (typeof window === 'undefined') return () => {};

  // Apply immediately on init
  applyTheme();

  const handleSync = () => {
    applyTheme();
  };

  // Listen to OS prefers-color-scheme if 'system' is chosen
  let mediaQuery = null;
  const handleMediaChange = () => {
    const settings = getSavedSettings();
    if (settings?.appearance?.theme === 'system') {
      applyTheme('system');
    }
  };

  if (window.matchMedia) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleMediaChange);
    }
  }

  window.addEventListener('storage', handleSync);
  window.addEventListener('emlakpro_theme_change', handleSync);
  window.addEventListener('emlakpro_data_restored', handleSync);
  window.addEventListener('emlakpro_data_reset', handleSync);

  return () => {
    if (mediaQuery) {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleMediaChange);
      }
    }
    window.removeEventListener('storage', handleSync);
    window.removeEventListener('emlakpro_theme_change', handleSync);
    window.removeEventListener('emlakpro_data_restored', handleSync);
    window.removeEventListener('emlakpro_data_reset', handleSync);
  };
}

