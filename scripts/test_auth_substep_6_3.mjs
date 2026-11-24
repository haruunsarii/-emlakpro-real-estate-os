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
  console.log('🚀 Starting Sub-step 6.3 Admin Kontrol Paneli & Gelişmiş Danışman Yönetimi Tests...\n');

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,850'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  try {
    // ---------------------------------------------------------
    // SETUP: Clean state with 1 Admin, 1 assigned property & 1 won deal
    // ---------------------------------------------------------
    console.log('--- SETUP: Initializing Admin & CRM Collections ---');
    await page.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });

    await page.evaluate(async () => {
      localStorage.clear();

      // Compute SHA-256 for admin password 'AdminPass123!'
      const encoder = new TextEncoder();
      const salt = 'emlakpro_salt_v1_';
      const adminHashBuf = await window.crypto.subtle.digest(
        'SHA-256',
        encoder.encode(salt + 'AdminPass123!')
      );
      const adminHash =
        'sha256:' +
        Array.from(new Uint8Array(adminHashBuf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

      const adminUser = {
        id: 'usr-admin-1',
        name: 'Kemal Demir',
        email: 'kemal@emlakpro.com',
        phone: '0 (532) 111 22 33',
        role: 'Yönetici',
        title: 'Kurucu Broker',
        status: 'Aktif',
        passwordHash: adminHash,
        avatarUrl: '',
        createdAt: new Date().toISOString(),
      };

      const settings = {
        users: [adminUser],
        profile: {
          firstName: 'Kemal',
          lastName: 'Demir',
          email: 'kemal@emlakpro.com',
          role: 'Yönetici',
        },
      };
      localStorage.setItem('emlakpro_settings_v1', JSON.stringify(settings));

      // 1 Property assigned to Selin Aydın
      const properties = [
        {
          id: 'prop-101',
          title: 'Kadıköy Moda Deniz Manzaralı 3+1',
          advisor: 'Selin Aydın',
          status: 'Satılık',
        },
      ];
      localStorage.setItem('emlakpro_properties_v1', JSON.stringify(properties));

      // 1 Won Deal for Selin Aydın
      const deals = [
        {
          id: 'deal-201',
          title: 'Moda Dairesi Satış Sözleşmesi',
          advisor: 'Selin Aydın',
          stage: 'tamamlandi',
          amount: 12500000,
        },
      ];
      localStorage.setItem('emlakpro_deals_v1', JSON.stringify(deals));

      window.dispatchEvent(new Event('storage'));
    });

    // Helper: input clearing with Ctrl+A
    const clearAndType = async (selector, text) => {
      await page.focus(selector);
      await page.keyboard.down('Control');
      await page.keyboard.press('A');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
      await page.type(selector, text);
    };

    // Helper: robust button click by text
    const clickButtonByText = async (text) => {
      await page.evaluate((btnText) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find((b) => b.textContent && b.textContent.includes(btnText));
        if (!btn) throw new Error(`Button with text "${btnText}" not found`);
        btn.click();
      }, text);
    };

    // Helper: log in user
    const loginUser = async (email, password) => {
      await page.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });
      await clearAndType('input[type="email"]', email);
      await clearAndType('input[type="password"]', password);
      await page.click('button[type="submit"]');
      await new Promise((r) => setTimeout(r, 800));
    };

    // Helper: logout user via header button
    const logoutUser = async () => {
      await page.waitForSelector('header button[title="Çıkış Yap"]', { timeout: 5000 });
      await page.evaluate(() => {
        const btn = document.querySelector('header button[title="Çıkış Yap"]');
        if (btn) btn.click();
      });
      await page.waitForFunction(() => window.location.pathname === '/giris', { timeout: 5000 });
      await new Promise((r) => setTimeout(r, 500));
    };

    // ---------------------------------------------------------
    // TEST 1: Admin Login and Navigate to /danismanlar
    // ---------------------------------------------------------
    console.log('\n--- TEST 1: Admin Access to /danismanlar & KPI Initial State ---');
    await loginUser('kemal@emlakpro.com', 'AdminPass123!');
    await page.goto(`${BASE_URL}/danismanlar`, { waitUntil: 'networkidle0' });

    const pageHeading = await page.$eval('h1', (el) => el.textContent);
    assert(
      pageHeading.includes('Danışman') && pageHeading.includes('Yönetimi'),
      `Page title is correct: "${pageHeading}"`
    );

    // Verify 4 KPI cards rendered
    const kpiCards = await page.$$eval('span.font-extrabold', (els) =>
      els.map((el) => el.textContent.trim())
    );
    console.log('KPI Cards Values:', kpiCards);
    assert(kpiCards.length >= 4, 'ConsultantStatsGrid rendered with 4 KPI metrics');
    assert(kpiCards[0] === '1', 'Toplam Personel is 1');
    assert(kpiCards[1] === '1', 'Aktif Danışmanlar is 1');

    // Verify Admin card has 'Siz' badge
    const selfBadge = await page.$eval('span[title*="aktif oturum"]', (el) => el.textContent);
    assert(selfBadge.includes('Siz'), 'Self-badge "Siz" is displayed on Admin card');

    // ---------------------------------------------------------
    // TEST 2: Add Consultant via ConsultantModal
    // ---------------------------------------------------------
    console.log('\n--- TEST 2: Add Consultant via ConsultantModal & SHA-256 Hashing ---');
    await clickButtonByText('Yeni Danışman Ekle');
    await page.waitForSelector('#consultant-name', { timeout: 3000 });

    await clearAndType('#consultant-name', 'Selin Aydın');
    await clearAndType('#consultant-email', 'selin@emlakpro.com');
    await clearAndType('#consultant-phone', '05321234567');
    await clearAndType('#consultant-title', 'Kıdemli Gayrimenkul Danışmanı');
    await clearAndType('#consultant-password', 'SelinPass123!');
    await clearAndType('#consultant-confirm-password', 'SelinPass123!');

    // Submit modal
    await clickButtonByText('Danışmanı Kaydet');
    await page.waitForFunction(() => !document.querySelector('#consultant-name'), {
      timeout: 3000,
    });
    await new Promise((r) => setTimeout(r, 600));

    // Verify user in localStorage
    const storedUsers = await page.evaluate(() => {
      const settings = JSON.parse(localStorage.getItem('emlakpro_settings_v1') || '{}');
      return settings.users || [];
    });
    assert(storedUsers.length === 2, 'settings.users now contains 2 users');

    const selinStored = storedUsers.find((u) => u.email === 'selin@emlakpro.com');
    assert(Boolean(selinStored), 'Selin Aydın user record found in localStorage');
    assert(
      selinStored.passwordHash && selinStored.passwordHash.startsWith('sha256:'),
      `Password hash generated with SHA-256: ${selinStored.passwordHash.slice(0, 16)}...`
    );
    assert(
      !JSON.stringify(storedUsers).includes('SelinPass123!'),
      'Plaintext password "SelinPass123!" is NOT stored anywhere in localStorage'
    );

    // Verify live dynamic performance stats on Selin's card
    const cardTextContent = await page.evaluate(() => document.body.textContent);
    assert(cardTextContent.includes('Selin Aydın'), 'Selin Aydın card is rendered');
    assert(cardTextContent.includes('1 İlan'), 'Selin assigned property count is 1 İlan');
    assert(cardTextContent.includes('1 Satış'), 'Selin closed deals count is 1 Satış');

    // ---------------------------------------------------------
    // TEST 3: New Consultant Login & Role Isolation
    // ---------------------------------------------------------
    console.log('\n--- TEST 3: Consultant Login & Menu/Route Isolation ---');
    await logoutUser();
    await loginUser('selin@emlakpro.com', 'SelinPass123!');

    // Redirected to /
    const consultantPath = await page.evaluate(() => window.location.pathname);
    assert(consultantPath === '/', 'Consultant redirected to / after login');

    // Verify header shows Selin Aydın
    const consultantHeader = await page.$eval('header', (el) => el.textContent);
    assert(consultantHeader.includes('Selin Aydın'), 'Header displays Selin Aydın name');

    // Verify Sidebar does NOT show Danışman Yönetimi or Ayarlar
    const sidebarText = await page.$eval('aside', (el) => el.textContent);
    assert(!sidebarText.includes('Danışman'), 'Consultant cannot see Danışman Yönetimi in Sidebar');
    assert(!sidebarText.includes('Ayarlar'), 'Consultant cannot see Ayarlar in Sidebar');

    // Consultant tries accessing /danismanlar directly -> 403
    await page.goto(`${BASE_URL}/danismanlar`, { waitUntil: 'networkidle0' });
    const page403Content = await page.evaluate(() => document.body.textContent);
    assert(
      page403Content.includes('403') || page403Content.includes('Yetkisi Yetersiz'),
      'Consultant is blocked from /danismanlar with 403 Forbidden'
    );

    // ---------------------------------------------------------
    // TEST 4: Edit Consultant Profile
    // ---------------------------------------------------------
    console.log('\n--- TEST 4: Admin Edits Consultant Profile ---');
    await logoutUser();
    await loginUser('kemal@emlakpro.com', 'AdminPass123!');
    await page.goto(`${BASE_URL}/danismanlar`, { waitUntil: 'networkidle0' });

    // Click edit on Selin Aydın
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[data-testid="consultant-card"]'));
      const selinCard = cards.find((c) => c.textContent.includes('Selin Aydın'));
      const editBtn = selinCard.querySelector('button[data-action="edit"]');
      if (editBtn) editBtn.click();
    });

    await page.waitForSelector('#consultant-name', { timeout: 3000 });
    await clearAndType('#consultant-title', 'Lüks Villa Danışmanı');
    await clickButtonByText('Bilgileri Güncelle');
    await page.waitForFunction(() => !document.querySelector('#consultant-name'), {
      timeout: 3000,
    });
    await new Promise((r) => setTimeout(r, 600));

    const updatedCardText = await page.evaluate(() => document.body.textContent);
    assert(
      updatedCardText.includes('Lüks Villa Danışmanı'),
      'Selin title updated to "Lüks Villa Danışmanı"'
    );

    // ---------------------------------------------------------
    // TEST 5: Toggle Status to Pasif & Blocked Login
    // ---------------------------------------------------------
    console.log('\n--- TEST 5: Toggle Status (Aktif -> Pasif) & Blocked Login ---');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[data-testid="consultant-card"]'));
      const selinCard = cards.find((c) => c.textContent.includes('Selin Aydın'));
      const toggleBtn = selinCard.querySelector('button[data-action="toggle-status"]');
      if (toggleBtn) toggleBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    // Verify Selin card status says 'Pasif'
    const selinStatus = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[data-testid="consultant-card"]'));
      const selinCard = cards.find((c) => c.textContent.includes('Selin Aydın'));
      return selinCard ? selinCard.textContent : '';
    });
    assert(selinStatus.includes('Pasif'), 'Selin Aydın status badge changed to Pasif');

    // Admin logs out, Selin attempts login
    await logoutUser();
    await loginUser('selin@emlakpro.com', 'SelinPass123!');

    // Must still be on /giris with error message
    const currentLoginPath = await page.evaluate(() => window.location.pathname);
    const loginError = await page.evaluate(() => {
      const err = document.querySelector('[role="alert"]');
      return err ? err.textContent : '';
    });
    assert(currentLoginPath === '/giris', 'Passive consultant prevented from logging in');
    assert(
      loginError.toLowerCase().includes('pasif'),
      `Error correctly identifies passive account: "${loginError}"`
    );

    // ---------------------------------------------------------
    // TEST 6: Reset Password & Login with New Password
    // ---------------------------------------------------------
    console.log('\n--- TEST 6: Reset Password Modal & Login with New Password ---');
    await loginUser('kemal@emlakpro.com', 'AdminPass123!');
    await page.goto(`${BASE_URL}/danismanlar`, { waitUntil: 'networkidle0' });

    // Toggle Selin back to Aktif
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[data-testid="consultant-card"]'));
      const selinCard = cards.find((c) => c.textContent.includes('Selin Aydın'));
      const toggleBtn = selinCard.querySelector('button[data-action="toggle-status"]');
      if (toggleBtn) toggleBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    // Click Şifre Sıfırla on Selin
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[data-testid="consultant-card"]'));
      const selinCard = cards.find((c) => c.textContent.includes('Selin Aydın'));
      const pwdBtn = selinCard.querySelector('button[data-action="reset-password"]');
      if (pwdBtn) pwdBtn.click();
    });

    await page.waitForSelector('#reset-new-password', { timeout: 3000 });
    await clearAndType('#reset-new-password', 'NewSecret456!');
    await clearAndType('#reset-confirm-password', 'NewSecret456!');

    await clickButtonByText('Şifreyi Güncelle');
    await page.waitForFunction(() => !document.querySelector('#reset-new-password'), {
      timeout: 3000,
    });
    await new Promise((r) => setTimeout(r, 600));

    // Admin logs out and Selin logs in with NewSecret456!
    await logoutUser();
    await loginUser('selin@emlakpro.com', 'NewSecret456!');
    const selinNewPath = await page.evaluate(() => window.location.pathname);
    assert(selinNewPath === '/', 'Selin logged in successfully with new reset password');

    // ---------------------------------------------------------
    // TEST 7: Self-Lockout Prevention for Admin
    // ---------------------------------------------------------
    console.log('\n--- TEST 7: Admin Self-Lockout Prevention Checks ---');
    await logoutUser();
    await loginUser('kemal@emlakpro.com', 'AdminPass123!');
    await page.goto(`${BASE_URL}/danismanlar`, { waitUntil: 'networkidle0' });

    const selfButtons = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[data-testid="consultant-card"]'));
      const adminCard = cards.find(
        (c) => c.textContent.includes('Kemal Demir') && c.textContent.includes('Siz')
      );
      if (!adminCard) return null;
      const toggleBtn = adminCard.querySelector('button[data-action="toggle-status"]');
      const deleteBtn = adminCard.querySelector('button[data-action="delete"]');
      return {
        hasToggleDisabled: toggleBtn ? toggleBtn.hasAttribute('disabled') : false,
        hasDeleteDisabled: deleteBtn ? deleteBtn.hasAttribute('disabled') : false,
      };
    });

    assert(Boolean(selfButtons), 'Admin self-card found');
    assert(selfButtons.hasToggleDisabled, 'Admin status toggle button is strictly disabled');
    assert(selfButtons.hasDeleteDisabled, 'Admin delete button is strictly disabled');

    // ---------------------------------------------------------
    // TEST 8: Filter, Search & Table View Switcher
    // ---------------------------------------------------------
    console.log('\n--- TEST 8: Filter Tabs, Search & Table View Mode ---');
    // Search for Selin
    await clearAndType('input[placeholder*="İsim, unvan"]', 'selin');
    await new Promise((r) => setTimeout(r, 400));

    let visibleCards = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[data-testid="consultant-card"]'));
      return cards.map((c) => c.textContent);
    });
    assert(
      visibleCards.some((c) => c.includes('Selin Aydın')) &&
        !visibleCards.some((c) => c.includes('Kemal Demir')),
      'Search filters to only Selin Aydın'
    );

    // Clear search
    await page.evaluate(() => {
      const btn = document.querySelector('button[title="Aramayı Temizle"]');
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // Switch to Table View
    await page.evaluate(() => {
      const btn = document.querySelector('button[title="Tablo Görünümü"]');
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    const tableRows = await page.$$eval('tbody tr', (rows) => rows.length);
    assert(tableRows === 2, `Table View displays exactly 2 rows (found ${tableRows})`);

    // Switch back to Grid View
    await page.evaluate(() => {
      const btn = document.querySelector('button[title="Kart Görünümü"]');
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // ---------------------------------------------------------
    // TEST 9: Delete Consultant via ConfirmDeleteModal
    // ---------------------------------------------------------
    console.log('\n--- TEST 9: Delete Consultant via ConfirmDeleteModal ---');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[data-testid="consultant-card"]'));
      const selinCard = cards.find((c) => c.textContent.includes('Selin Aydın'));
      const delBtn = selinCard.querySelector('button[data-action="delete"]');
      if (delBtn) delBtn.click();
    });

    await page.waitForFunction(
      () =>
        Array.from(document.querySelectorAll('button')).some((b) =>
          b.textContent.includes('Evet, Danışmanı Sil')
        ),
      { timeout: 3000 }
    );
    await clickButtonByText('Evet, Danışmanı Sil');
    await page.waitForFunction(
      () =>
        !Array.from(document.querySelectorAll('button')).some((b) =>
          b.textContent.includes('Evet, Danışmanı Sil')
        ),
      { timeout: 3000 }
    );
    await new Promise((r) => setTimeout(r, 600));

    // Verify only Admin remains in users
    const finalStoredUsers = await page.evaluate(() => {
      const settings = JSON.parse(localStorage.getItem('emlakpro_settings_v1') || '{}');
      return settings.users || [];
    });
    assert(finalStoredUsers.length === 1, 'Only 1 user remains in settings.users');
    assert(
      finalStoredUsers[0].name === 'Kemal Demir',
      'Remaining user is Kemal Demir (Admin)'
    );

    const remainingCards = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[data-testid="consultant-card"]'));
      return cards.map((c) => c.textContent);
    });
    assert(
      !remainingCards.some((c) => c.includes('Selin Aydın')),
      'Selin Aydın card removed from UI'
    );

    console.log('\n🎉 ALL 9 ADVANCED CONSULTANT MANAGEMENT TESTS PASSED PERFECTLY!\n');
  } catch (error) {
    console.error('❌ Test failed with exception:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
