import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('🚀 Starting Sub-step 6.2 ProtectedRoute & Role-Based UI Tests...\n');

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // ---------------------------------------------------------
    // TEST 1, 2, 3: Unauthenticated user cannot access CRM routes and is redirected to /giris
    // ---------------------------------------------------------
    console.log('--- TEST 1, 2, 3: Unauthenticated Access Redirection ---');
    await page.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.clear();
      window.dispatchEvent(new Event('storage'));
    });

    // Attempt to access Dashboard / without session
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => window.location.pathname === '/giris', { timeout: 3000 });
    assert(page.url().includes('/giris'), 'Unauthenticated access to / is redirected to /giris');

    // Attempt to access /musteriler without session
    await page.goto(`${BASE_URL}/musteriler`, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => window.location.pathname === '/giris', { timeout: 3000 });
    assert(page.url().includes('/giris'), 'Unauthenticated access to /musteriler is redirected to /giris');

    // Attempt to access /ayarlar without session
    await page.goto(`${BASE_URL}/ayarlar`, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => window.location.pathname === '/giris', { timeout: 3000 });
    assert(page.url().includes('/giris'), 'Unauthenticated access to /ayarlar is redirected to /giris');

    // ---------------------------------------------------------
    // SETUP: Create Admin & Consultant in settings.users
    // ---------------------------------------------------------
    console.log('\n--- SETUP: Preparing Registered Users (Admin & Consultant) ---');
    await page.evaluate(async () => {
      // Create admin password hash
      const encoder = new TextEncoder();
      const salt = 'emlakpro_salt_v1_';
      const adminHashBuf = await window.crypto.subtle.digest('SHA-256', encoder.encode(salt + 'AdminPass123!'));
      const adminHash = 'sha256:' + Array.from(new Uint8Array(adminHashBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');

      const consultHashBuf = await window.crypto.subtle.digest('SHA-256', encoder.encode(salt + 'ConsultantPass123!'));
      const consultHash = 'sha256:' + Array.from(new Uint8Array(consultHashBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');

      const adminUser = {
        id: 'usr-admin-1',
        name: 'Kemal Demir',
        email: 'kemal@emlakpro.com',
        role: 'Yönetici',
        title: 'Kurucu Broker',
        status: 'Aktif',
        passwordHash: adminHash,
        avatarUrl: '',
      };

      const consultantUser = {
        id: 'usr-consultant-1',
        name: 'Selin Aydın',
        email: 'selin@emlakpro.com',
        role: 'Gayrimenkul Danışmanı',
        title: 'Kıdemli Danışman',
        status: 'Aktif',
        passwordHash: consultHash,
        avatarUrl: '',
      };

      const settings = {
        users: [adminUser, consultantUser],
        profile: {
          firstName: 'Kemal',
          lastName: 'Demir',
          email: 'kemal@emlakpro.com',
          role: 'Yönetici',
        },
      };

      localStorage.setItem('emlakpro_settings_v1', JSON.stringify(settings));
    });

    // ---------------------------------------------------------
    // TEST 4 & 8 & 9: Administrator Login, CRM Access & Admin Menus
    // ---------------------------------------------------------
    console.log('\n--- TEST 4, 8, 9: Admin Login, Menus & Navigation ---');
    await page.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });

    // Fill login form as Admin
    await page.focus('input[type="email"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('input[type="email"]', 'kemal@emlakpro.com');

    await page.focus('input[type="password"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('input[type="password"]', 'AdminPass123!');

    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 600));

    const currentPath = await page.evaluate(() => window.location.pathname);
    console.log('Current path after admin login:', currentPath);

    // If redirected to / or intended /ayarlar
    assert(currentPath === '/' || currentPath === '/ayarlar', 'Admin redirected to Dashboard or intended route after login');

    // Verify Header shows Admin user info
    const headerInfo = await page.evaluate(() => {
      const header = document.querySelector('header');
      return header ? header.textContent : '';
    });
    assert(headerInfo.includes('Kemal Demir'), 'Header displays Admin name (Kemal Demir)');
    assert(headerInfo.includes('Yönetici'), 'Header displays Admin role badge (Yönetici)');

    // Verify Admin sees admin-only menu items in Sidebar
    const adminSidebarText = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      return aside ? aside.textContent : '';
    });
    assert(adminSidebarText.includes('Danışman Yönetimi'), 'Sidebar displays Danışman Yönetimi for Admin');
    assert(adminSidebarText.includes('Ayarlar'), 'Sidebar displays Ayarlar for Admin');

    // Admin can access /ayarlar
    await page.goto(`${BASE_URL}/ayarlar`, { waitUntil: 'networkidle0' });
    const ayarlarContent = await page.content();
    assert(ayarlarContent.includes('Ayarlar & Sistem Yönetimi') || ayarlarContent.includes('Sistem'), 'Admin successfully accesses /ayarlar');

    // Admin can access /danismanlar preparation page
    await page.goto(`${BASE_URL}/danismanlar`, { waitUntil: 'networkidle0' });
    const danismanlarContent = await page.content();
    assert(danismanlarContent.includes('Danışman Yönetimi'), 'Admin successfully accesses /danismanlar');
    assert(
      danismanlarContent.includes('Aşama 6.3') ||
      (danismanlarContent.includes('Danışman') && danismanlarContent.includes('Personel')),
      'Danışman Yönetimi module is rendered'
    );

    // ---------------------------------------------------------
    // TEST 10: Logout Flow via Header
    // ---------------------------------------------------------
    console.log('\n--- TEST 10: Logout Flow via Header ---');
    // Click quick logout button in header
    const logoutBtn = await page.$('header button[title="Çıkış Yap"]');
    assert(logoutBtn !== null, 'Header has quick Çıkış Yap button');
    await logoutBtn.click();

    await page.waitForFunction(() => window.location.pathname === '/giris', { timeout: 3000 });
    assert(page.url().includes('/giris'), 'User is redirected to /giris on logout');

    const sessionAfterLogout = await page.evaluate(() => localStorage.getItem('emlakpro_session_v1'));
    assert(sessionAfterLogout === null, 'Session is cleanly cleared on logout');

    // ---------------------------------------------------------
    // TEST 5, 6, 7, 9: Consultant Login, Shared Access & Role-Based Isolation
    // ---------------------------------------------------------
    console.log('\n--- TEST 5, 6, 7, 9: Consultant Login & Role Isolation ---');
    // Login as Consultant
    await page.focus('input[type="email"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('input[type="email"]', 'selin@emlakpro.com');

    await page.focus('input[type="password"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('input[type="password"]', 'ConsultantPass123!');

    await page.click('button[type="submit"]');

    await page.waitForFunction(() => window.location.pathname === '/' || window.location.pathname === '', { timeout: 5000 });
    assert(page.url() === `${BASE_URL}/` || page.url() === `${BASE_URL}`, 'Consultant redirected to Dashboard after login');

    // Wait for Header to mount and render
    await page.waitForSelector('header', { timeout: 3000 });
    await page.waitForFunction(
      () => (document.querySelector('header')?.textContent || '').includes('Selin Aydın'),
      { timeout: 3000 }
    );

    // Verify Header shows Consultant name and role
    const debugInfo = await page.evaluate(() => {
      const header = document.querySelector('header');
      const session = localStorage.getItem('emlakpro_session_v1');
      return {
        headerText: header ? header.textContent : '',
        session: session ? JSON.parse(session) : null,
      };
    });
    console.log('Debug info on consultant login:', debugInfo);

    assert(debugInfo.headerText.includes('Selin Aydın'), 'Header displays Consultant name (Selin Aydın)');
    assert(debugInfo.headerText.includes('Gayrimenkul Danışmanı'), 'Header displays Consultant role (Gayrimenkul Danışmanı)');

    // Verify Consultant can access shared CRM pages
    await page.goto(`${BASE_URL}/musteriler`, { waitUntil: 'networkidle0' });
    assert(page.url().includes('/musteriler'), 'Consultant can access /musteriler');

    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0' });
    assert(page.url().includes('/gayrimenkuller'), 'Consultant can access /gayrimenkuller');

    await page.goto(`${BASE_URL}/talepler`, { waitUntil: 'networkidle0' });
    assert(page.url().includes('/talepler'), 'Consultant can access /talepler');

    await page.goto(`${BASE_URL}/satis-ve-kiralama`, { waitUntil: 'networkidle0' });
    assert(page.url().includes('/satis-ve-kiralama'), 'Consultant can access /satis-ve-kiralama');

    await page.goto(`${BASE_URL}/raporlar`, { waitUntil: 'networkidle0' });
    assert(page.url().includes('/raporlar'), 'Consultant can access /raporlar');

    // Verify Consultant DOES NOT see admin menu items in Sidebar
    const consultantSidebarText = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      return aside ? aside.textContent : '';
    });
    assert(!consultantSidebarText.includes('Danışman Yönetimi'), 'Sidebar hides Danışman Yönetimi from Consultant');
    assert(!consultantSidebarText.includes('Ayarlar'), 'Sidebar hides Ayarlar from Consultant');

    // Verify Consultant CANNOT access /ayarlar directly -> 403 Access Denied
    await page.goto(`${BASE_URL}/ayarlar`, { waitUntil: 'networkidle0' });
    const ayarlarBlockedContent = await page.content();
    assert(ayarlarBlockedContent.includes('Erişim Yetkisi Yetersiz (403)'), 'Direct access to /ayarlar blocked with 403 for Consultant');
    assert(ayarlarBlockedContent.includes('Sistem Yöneticisi (Admin)'), 'Displays admin requirement note');

    // Verify Consultant CANNOT access /danismanlar directly -> 403 Access Denied
    await page.goto(`${BASE_URL}/danismanlar`, { waitUntil: 'networkidle0' });
    const danismanlarBlockedContent = await page.content();
    assert(danismanlarBlockedContent.includes('Erişim Yetkisi Yetersiz (403)'), 'Direct access to /danismanlar blocked with 403 for Consultant');

    // ---------------------------------------------------------
    // TEST 11: Session Persistence on Reload
    // ---------------------------------------------------------
    console.log('\n--- TEST 11: Session Persistence on Reload ---');
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0' });
    await page.reload({ waitUntil: 'networkidle0' });
    assert(page.url().includes('/gayrimenkuller'), 'Page reload stays on /gayrimenkuller with active session');
    const nameOnReload = await page.evaluate(() => {
      return document.querySelector('header')?.textContent || '';
    });
    assert(nameOnReload.includes('Selin Aydın'), 'Consultant session persisted after reload');

    // ---------------------------------------------------------
    // TEST 12: Mobile Sidebar Behavior & Role Filtering
    // ---------------------------------------------------------
    console.log('\n--- TEST 12: Mobile Sidebar Behavior & Role Filtering ---');
    await page.setViewport({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

    // Open mobile sidebar
    const hamburgerBtn = await page.$('button[aria-label="Menüyü Aç"]');
    assert(hamburgerBtn !== null, 'Mobile hamburger button is present');
    await hamburgerBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    // Check mobile sidebar content
    const mobileSidebarText = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      return aside ? aside.textContent : '';
    });
    assert(mobileSidebarText.includes('Müşteriler'), 'Mobile sidebar has shared items');
    assert(!mobileSidebarText.includes('Danışman Yönetimi'), 'Mobile sidebar correctly hides Danışman Yönetimi from Consultant');
    assert(!mobileSidebarText.includes('Ayarlar'), 'Mobile sidebar correctly hides Ayarlar from Consultant');

    // Close mobile sidebar
    const closeBtn = await page.$('button[aria-label="Menüyü Kapat"]');
    assert(closeBtn !== null, 'Mobile sidebar has close button');
    await closeBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    console.log('\n🎉 ALL 12 TEST SCENARIOS PASSED FLAWLESSLY!\n');
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
