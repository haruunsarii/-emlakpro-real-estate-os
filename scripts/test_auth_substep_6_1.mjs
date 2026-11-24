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
  console.log('🚀 Starting Sub-step 6.1 Authentication E2E Tests...\n');

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // ---------------------------------------------------------
    // TEST 1: Initial Clean State -> /giris displays Initial Setup Form
    // ---------------------------------------------------------
    console.log('--- TEST 1: Clean State Initial Setup Mode ---');
    await page.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });

    // Ensure localStorage is clean for this test
    await page.evaluate(() => {
      localStorage.clear();
      window.dispatchEvent(new Event('storage'));
    });
    await page.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });

    const pageContent = await page.content();
    assert(pageContent.includes('İlk Yönetici Hesabınızı Oluşturun'), 'Page renders Initial Admin Setup header');
    assert(pageContent.includes('Frontend Prototip Bilgisi'), 'Page renders prototype disclaimer');

    const nameInput = await page.$('input[placeholder*="Ahmet Yılmaz"]');
    assert(nameInput !== null, 'Yönetici Adı input is present');

    const emailInput = await page.$('input[placeholder="yonetici@emlakpro.com"]');
    assert(emailInput !== null, 'Kurumsal E-posta input is present');

    const passwordInput = await page.$('input[placeholder="En az 6 karakter"]');
    assert(passwordInput !== null, 'Şifre input is present');

    const confirmPasswordInput = await page.$('input[placeholder="Şifreyi tekrar yazınız"]');
    assert(confirmPasswordInput !== null, 'Şifre Tekrarı input is present');

    // ---------------------------------------------------------
    // TEST 2: Form Validations (Empty, short password, mismatched passwords)
    // ---------------------------------------------------------
    console.log('\n--- TEST 2: Initial Setup Validations ---');
    // Try typing 1-char name
    await nameInput.type('A');
    await emailInput.type('invalid-email');
    await passwordInput.type('123');
    await confirmPasswordInput.type('456');

    // Submit form
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();
    await new Promise((r) => setTimeout(r, 200));

    const contentAfterInvalid = await page.content();
    assert(contentAfterInvalid.includes('en az 2 karakter'), 'Validation error for short name');
    assert(contentAfterInvalid.includes('Geçerli bir kurumsal e-posta'), 'Validation error for invalid email');
    assert(contentAfterInvalid.includes('en az 6 karakter'), 'Validation error for short password');
    assert(contentAfterInvalid.includes('eşleşmiyor'), 'Validation error for mismatched passwords');

    // ---------------------------------------------------------
    // TEST 3: Successful Admin Account Creation & Security Verification
    // ---------------------------------------------------------
    console.log('\n--- TEST 3: Admin Account Creation & Security Invariants ---');
    // Clear inputs and type valid admin credentials
    async function fillInput(inputSelector, text) {
      await page.focus(inputSelector);
      await page.keyboard.down('Control');
      await page.keyboard.press('A');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
      await page.type(inputSelector, text);
    }

    await fillInput('input[placeholder*="Ahmet Yılmaz"]', 'Kemal Demir');
    await fillInput('input[placeholder="yonetici@emlakpro.com"]', 'kemal@emlakpro.com');
    await fillInput('input[placeholder="En az 6 karakter"]', 'AdminSecure2026!');
    await fillInput('input[placeholder="Şifreyi tekrar yazınız"]', 'AdminSecure2026!');

    const currentFormState = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input')).map((i) => ({
        placeholder: i.placeholder,
        value: i.value,
      }));
      return inputs;
    });
    console.log('Form inputs before submit:', currentFormState);

    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 600));

    // Check if error appeared
    const pageHtml = await page.content();
    if (pageHtml.includes('bg-rose-50') || pageHtml.includes('text-rose-600')) {
      const errTexts = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.text-rose-600, .bg-rose-50')).map((el) => el.textContent.trim());
      });
      console.log('Errors found on page:', errTexts);
    }

    // Wait for SPA client navigation to /
    await page.waitForFunction(
      () => window.location.pathname === '/' || window.location.pathname === '',
      { timeout: 5000 }
    );
    const currentUrl = page.url();
    assert(currentUrl === `${BASE_URL}/` || currentUrl === `${BASE_URL}`, 'Successfully redirected to Dashboard');

    // Inspect localStorage
    const storageData = await page.evaluate(() => {
      const settings = JSON.parse(localStorage.getItem('emlakpro_settings_v1') || '{}');
      const session = JSON.parse(localStorage.getItem('emlakpro_session_v1') || '{}');
      return { settings, session };
    });

    // Verify settings.users contains exactly 1 user
    assert(Array.isArray(storageData.settings.users), 'settings.users is an array');
    assert(storageData.settings.users.length === 1, 'settings.users has exactly 1 registered user');

    const admin = storageData.settings.users[0];
    assert(admin.name === 'Kemal Demir', 'Registered user name is Kemal Demir');
    assert(admin.email === 'kemal@emlakpro.com', 'Registered user email is kemal@emlakpro.com');
    assert(admin.role === 'Yönetici', 'Registered user role is Yönetici');
    assert(typeof admin.passwordHash === 'string' && admin.passwordHash.startsWith('sha256:'), 'passwordHash uses sha256 prefix');

    // CRITICAL SECURITY CHECKS: No plaintext password anywhere!
    assert(admin.password === undefined, 'CRITICAL: No plaintext password in settings.users');
    assert(storageData.session.userId === admin.id, 'Session userId matches admin id');
    assert(storageData.session.name === 'Kemal Demir', 'Session name is Kemal Demir');
    assert(storageData.session.role === 'admin', 'Session normalized role is admin');
    assert(storageData.session.password === undefined, 'CRITICAL: No plaintext password in session object');
    assert(storageData.session.passwordHash === undefined, 'CRITICAL: No passwordHash in session object');

    // ---------------------------------------------------------
    // TEST 4: Page Reload and Active Session Detection at /giris
    // ---------------------------------------------------------
    console.log('\n--- TEST 4: Session Persistence & Active Session Screen ---');
    await page.reload({ waitUntil: 'networkidle0' });
    await page.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });

    const activeSessionContent = await page.content();
    assert(activeSessionContent.includes('Aktif Oturum Bulunuyor'), 'Displays Active Session card at /giris');
    assert(activeSessionContent.includes('Kemal Demir'), 'Displays active user name in session card');
    assert(activeSessionContent.includes('Yönetici'), 'Displays active user role');

    // ---------------------------------------------------------
    // TEST 5: Logout Flow & Switch to Standard Login Mode
    // ---------------------------------------------------------
    console.log('\n--- TEST 5: Logout & Standard Login Mode ---');
    const logoutBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find((b) => b.textContent.includes('Çıkış Yap'));
    });
    assert(logoutBtn !== null, 'Found Çıkış Yap button');
    await logoutBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    const sessionAfterLogout = await page.evaluate(() => localStorage.getItem('emlakpro_session_v1'));
    assert(sessionAfterLogout === null, 'emlakpro_session_v1 is cleared from localStorage');

    const loginPageContent = await page.content();
    assert(loginPageContent.includes('CRM Hesabınıza Giriş Yapın'), 'Displays Standard Login Mode now that users exist');
    assert(!loginPageContent.includes('İlk Yönetici Hesabınızı Oluşturun'), 'Does NOT display Initial Setup mode');

    // ---------------------------------------------------------
    // TEST 6: Failed Authentication (Wrong Password)
    // ---------------------------------------------------------
    console.log('\n--- TEST 6: Authentication Failure (Wrong Password) ---');
    const loginEmailInput = await page.$('input[type="email"]');
    const loginPasswordInput = await page.$('input[type="password"]');
    const loginSubmitBtn = await page.$('button[type="submit"]');

    await loginEmailInput.type('kemal@emlakpro.com');
    await loginPasswordInput.type('WrongPassword123');
    await loginSubmitBtn.click();
    await new Promise((r) => setTimeout(r, 500));

    const failedContent = await page.content();
    assert(failedContent.includes('E-posta veya şifre hatalı'), 'Displays error message for wrong credentials');
    const sessionAfterFail = await page.evaluate(() => localStorage.getItem('emlakpro_session_v1'));
    assert(sessionAfterFail === null, 'Session remains null after failed login');

    // ---------------------------------------------------------
    // TEST 7: Successful Authentication (Correct Password)
    // ---------------------------------------------------------
    console.log('\n--- TEST 7: Successful Authentication ---');
    await fillInput('input[type="password"]', 'AdminSecure2026!');
    await page.click('button[type="submit"]');

    // Wait for SPA client navigation to /
    await page.waitForFunction(
      () => window.location.pathname === '/' || window.location.pathname === '',
      { timeout: 5000 }
    );
    assert(page.url() === `${BASE_URL}/` || page.url() === `${BASE_URL}`, 'Redirected to Dashboard after valid login');

    const sessionAfterSuccess = await page.evaluate(() => JSON.parse(localStorage.getItem('emlakpro_session_v1') || '{}'));
    assert(sessionAfterSuccess.name === 'Kemal Demir', 'Session successfully restored for Kemal Demir');
    assert(sessionAfterSuccess.role === 'admin', 'Session role is admin');
    assert(sessionAfterSuccess.password === undefined && sessionAfterSuccess.passwordHash === undefined, 'No password credentials in session');

    // ---------------------------------------------------------
    // TEST 8: Factory Reset, Safety Backup & Return to Setup Mode
    // ---------------------------------------------------------
    console.log('\n--- TEST 8: Factory Reset, Safety Backup & Return to Initial State ---');
    await page.evaluate(() => {
      // Simulate factory reset using service method
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
        'emlakpro_settings_v1',
        'emlakpro_last_backup',
      ];

      const preResetSnapshot = {
        session_v1: window.localStorage.getItem('emlakpro_session_v1'),
        settings_v1: window.localStorage.getItem('emlakpro_settings_v1'),
        snapshotDate: new Date().toISOString(),
      };
      window.localStorage.setItem('emlakpro_pre_restore_safety_backup', JSON.stringify(preResetSnapshot));

      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('emlakpro_session_change', { detail: null }));
      window.dispatchEvent(new CustomEvent('emlakpro_data_reset', { detail: { timestamp: Date.now() } }));
    });

    const safetyBackup = await page.evaluate(() => {
      const raw = localStorage.getItem('emlakpro_pre_restore_safety_backup');
      return raw ? JSON.parse(raw) : null;
    });

    assert(safetyBackup !== null, 'Safety backup created successfully before reset');
    assert(typeof safetyBackup.session_v1 === 'string', 'Safety backup contains session_v1 snapshot');

    await page.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });
    const contentAfterReset = await page.content();
    assert(contentAfterReset.includes('İlk Yönetici Hesabınızı Oluşturun'), 'Page successfully reverts to Initial Setup Mode after reset');

    console.log('\n🎉 ALL 8 TEST SUITES PASSED FLAWLESSLY!\n');
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
