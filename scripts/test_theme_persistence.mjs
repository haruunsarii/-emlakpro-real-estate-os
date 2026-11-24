import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import assert from 'assert';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.resolve('docs/screenshots/theme-check');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runThemePersistenceTest() {
  console.log('🧪 Starting EmlakPro Theme Persistence & Reload Test...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,950'],
    defaultViewport: { width: 1440, height: 950 },
  });

  try {
    const page = await browser.newPage();

    // 1. Setup session with Harun Sarı
    await page.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });

    await page.evaluate(() => {
      const adminUser = {
        id: 'usr-admin-1',
        name: 'Harun Sarı',
        email: 'harun@emlakpro.com',
        role: 'admin',
        title: 'Yönetici Broker',
        status: 'Aktif',
      };
      const settings = {
        users: [adminUser],
        appearance: {
          theme: 'light',
          density: 'comfortable',
          language: 'tr',
          currency: 'TRY',
          rowsPerPage: 10,
          enableAnimations: true,
        },
      };
      const session = {
        userId: adminUser.id,
        name: adminUser.name,
        role: adminUser.role,
        title: adminUser.title,
        token: 'test-token',
        expiresAt: Date.now() + 86400000,
      };

      localStorage.setItem('emlakpro_settings_v1', JSON.stringify(settings));
      localStorage.setItem('emlakpro_session_v1', JSON.stringify(session));
    });

    // 2. Navigate to /ayarlar
    console.log('--- Navigating to /ayarlar ---');
    await page.goto(`${BASE_URL}/ayarlar`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));

    // Verify initial theme is light
    const initialHtmlClass = await page.evaluate(() => document.documentElement.className);
    console.log('Initial <html> class:', initialHtmlClass);
    assert(!initialHtmlClass.includes('dark'), 'Initial theme should NOT be dark');

    // 3. Switch to "Görünüm & Sistem" tab
    console.log('--- Switching to Görünüm tab ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const gorunumBtn = buttons.find((b) => b.innerText.includes('Görünüm'));
      if (gorunumBtn) gorunumBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    // Take screenshot of Settings in Light Mode
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-settings-light-mode.png') });
    console.log('📸 Captured 01-settings-light-mode.png');

    // 4. Click "Koyu Tema"
    console.log('--- Selecting Koyu Tema ---');
    const darkThemeSelected = await page.evaluate(() => {
      const darkCard = document.querySelector('[data-theme-option="dark"]');
      if (darkCard) {
        darkCard.click();
        return true;
      }
      return false;
    });
    console.log('Dark Theme card clicked:', darkThemeSelected);
    assert(darkThemeSelected, 'Koyu Tema card must be clickable');
    await new Promise((r) => setTimeout(r, 600));

    // 5. Verify <html class="dark"> immediately applied
    const htmlClassAfterClick = await page.evaluate(() => document.documentElement.className);
    console.log('<html> class after clicking Koyu Tema:', htmlClassAfterClick);
    assert(htmlClassAfterClick.includes('dark'), '<html> must have "dark" class immediately after selecting dark theme');

    // Verify localStorage has theme: 'dark'
    const storedTheme = await page.evaluate(() => {
      try {
        const parsed = JSON.parse(localStorage.getItem('emlakpro_settings_v1'));
        return parsed?.appearance?.theme;
      } catch {
        return null;
      }
    });
    console.log('Stored theme in localStorage:', storedTheme);
    assert.strictEqual(storedTheme, 'dark', 'localStorage appearance.theme must be "dark"');

    // Take screenshot of Settings in Dark Mode
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-settings-dark-mode-applied.png') });
    console.log('📸 Captured 02-settings-dark-mode-applied.png');

    // 6. Reload page (F5 simulation)
    console.log('--- Reloading Page (F5 simulation) ---');
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));

    // 7. Verify <html class="dark"> is STILL applied after reload!
    const htmlClassAfterReload = await page.evaluate(() => document.documentElement.className);
    console.log('<html> class after F5 reload:', htmlClassAfterReload);
    assert(htmlClassAfterReload.includes('dark'), '<html> must STILL have "dark" class after F5 reload!');

    // Switch to Görünüm tab after reload and verify Koyu Tema is still selected
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const gorunumBtn = buttons.find((b) => b.innerText.includes('Görünüm'));
      if (gorunumBtn) gorunumBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-settings-dark-mode-persisted-after-f5.png') });
    console.log('📸 Captured 03-settings-dark-mode-persisted-after-f5.png');

    // 8. Navigate to Dashboard in Dark Mode
    console.log('--- Navigating to Dashboard in Dark Mode ---');
    await page.goto(`${BASE_URL}/crm`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));

    const dashboardHtmlClass = await page.evaluate(() => document.documentElement.className);
    console.log('Dashboard <html> class:', dashboardHtmlClass);
    assert(dashboardHtmlClass.includes('dark'), 'Dashboard must remain in dark mode');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-dashboard-dark-mode.png') });
    console.log('📸 Captured 04-dashboard-dark-mode.png');

    // 9. Navigate back to /ayarlar and switch to "Açık Tema"
    console.log('--- Switching back to Açık Tema ---');
    await page.goto(`${BASE_URL}/ayarlar`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 800));

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const gorunumBtn = buttons.find((b) => b.innerText.includes('Görünüm'));
      if (gorunumBtn) gorunumBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    await page.evaluate(() => {
      const lightCard = document.querySelector('[data-theme-option="light"]');
      if (lightCard) lightCard.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const htmlClassAfterLightClick = await page.evaluate(() => document.documentElement.className);
    console.log('<html> class after selecting Açık Tema:', htmlClassAfterLightClick);
    assert(!htmlClassAfterLightClick.includes('dark'), '<html> must NOT have "dark" class after selecting light theme');

    // Reload to verify light theme persists after F5
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 800));

    const htmlClassAfterLightReload = await page.evaluate(() => document.documentElement.className);
    console.log('<html> class after Light theme F5 reload:', htmlClassAfterLightReload);
    assert(!htmlClassAfterLightReload.includes('dark'), '<html> must NOT have "dark" class after reload in light theme');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-settings-light-mode-persisted.png') });
    console.log('📸 Captured 05-settings-light-mode-persisted.png');

    console.log('\n🎉 ALL THEME PERSISTENCE & RELOAD TESTS PASSED 100%!');
  } finally {
    await browser.close();
  }
}

runThemePersistenceTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
