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
  console.log('🚀 Starting Sub-step 6.4 Role & Permission Matrix Visualization Tests...\n');

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,850'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  try {
    // ---------------------------------------------------------
    // SETUP: Initializing 5 Users across all 4 Roles
    // ---------------------------------------------------------
    console.log('--- SETUP: Initializing Registered Users (Admin, Manager, Consultants, Assistant) ---');
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

      const users = [
        {
          id: 'usr-admin-1',
          name: 'Kemal Demir',
          email: 'kemal@emlakpro.com',
          role: 'Yönetici',
          title: 'Kurucu Broker',
          status: 'Aktif',
          passwordHash: adminHash,
        },
        {
          id: 'usr-manager-1',
          name: 'Burak Yılmaz',
          email: 'burak@emlakpro.com',
          role: 'Ofis Müdürü',
          title: 'Operasyon Direktörü',
          status: 'Aktif',
          passwordHash: adminHash,
        },
        {
          id: 'usr-consultant-1',
          name: 'Selin Aydın',
          email: 'selin@emlakpro.com',
          role: 'Gayrimenkul Danışmanı',
          title: 'Kıdemli Danışman',
          status: 'Aktif',
          passwordHash: adminHash,
        },
        {
          id: 'usr-consultant-2',
          name: 'Ece Kaya',
          email: 'ece@emlakpro.com',
          role: 'Gayrimenkul Danışmanı',
          title: 'Lüks Konut Uzmanı',
          status: 'Aktif',
          passwordHash: adminHash,
        },
        {
          id: 'usr-assistant-1',
          name: 'Damla Çelik',
          email: 'damla@emlakpro.com',
          role: 'Asistan',
          title: 'Ön Büro Asistanı',
          status: 'Aktif',
          passwordHash: adminHash,
        },
      ];

      const settings = {
        users,
        profile: {
          firstName: 'Kemal',
          lastName: 'Demir',
          email: 'kemal@emlakpro.com',
          role: 'Yönetici',
        },
      };
      localStorage.setItem('emlakpro_settings_v1', JSON.stringify(settings));
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

    // Helper: log in user
    const loginUser = async (email, password) => {
      await page.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });
      await clearAndType('input[type="email"]', email);
      await clearAndType('input[type="password"]', password);
      await page.click('button[type="submit"]');
      await new Promise((r) => setTimeout(r, 800));
    };

    // ---------------------------------------------------------
    // TEST 1: Admin Login and Navigate to /danismanlar
    // ---------------------------------------------------------
    console.log('\n--- TEST 1: Access /danismanlar & Verify Main Tabs ---');
    await loginUser('kemal@emlakpro.com', 'AdminPass123!');
    await page.goto(`${BASE_URL}/danismanlar`, { waitUntil: 'networkidle0' });

    const pageHeading = await page.$eval('h1', (el) => el.textContent);
    assert(
      pageHeading.includes('Danışman') && pageHeading.includes('Yönetimi'),
      `Page title is correct: "${pageHeading}"`
    );

    // Verify Tab buttons exist
    const consultantsTab = await page.$('button[data-testid="tab-consultants"]');
    const matrixTab = await page.$('button[data-testid="tab-role-matrix"]');
    assert(consultantsTab !== null, 'Danışman & Personel Listesi tab button is rendered');
    assert(matrixTab !== null, 'Rol ve Yetki Matrisi tab button is rendered');

    // ---------------------------------------------------------
    // TEST 2: Switch to "Rol ve Yetki Matrisi" Tab
    // ---------------------------------------------------------
    console.log('\n--- TEST 2: Switch to Role & Permission Matrix Tab ---');
    await page.click('button[data-testid="tab-role-matrix"]');
    await new Promise((r) => setTimeout(r, 400));

    const matrixView = await page.$('[data-testid="role-matrix-view"]');
    assert(matrixView !== null, 'RoleMatrixView is mounted and visible');

    // ---------------------------------------------------------
    // TEST 3: Verify Prototype Disclaimer Banner
    // ---------------------------------------------------------
    console.log('\n--- TEST 3: Prototype Disclaimer Banner Verification ---');
    const disclaimerText = await page.evaluate(() => {
      const banner = document.querySelector('[data-testid="role-matrix-view"]');
      return banner ? banner.textContent : '';
    });
    assert(
      disclaimerText.includes('Rol ve Yetkilendirme Mimarisi') &&
        disclaimerText.includes('Frontend Prototip Standartı'),
      'Disclaimer banner prominently displays Frontend Prototype standard notice'
    );
    assert(
      disclaimerText.includes('ProtectedRoute'),
      'Disclaimer mentions ProtectedRoute client-side guard architecture'
    );

    // ---------------------------------------------------------
    // TEST 4: Role Summary Cards & Live Dynamic User Counts
    // ---------------------------------------------------------
    console.log('\n--- TEST 4: Role Summary Cards & Live Dynamic Counts ---');
    const roleCardStats = await page.evaluate(() => {
      const adminCard = document.querySelector('[data-testid="role-card-admin"]');
      const managerCard = document.querySelector('[data-testid="role-card-manager"]');
      const consultantCard = document.querySelector('[data-testid="role-card-consultant"]');
      const assistantCard = document.querySelector('[data-testid="role-card-assistant"]');

      return {
        adminText: adminCard ? adminCard.textContent : '',
        managerText: managerCard ? managerCard.textContent : '',
        consultantText: consultantCard ? consultantCard.textContent : '',
        assistantText: assistantCard ? assistantCard.textContent : '',
      };
    });

    assert(
      roleCardStats.adminText.includes('1 Personel'),
      `Admin role card displays 1 Personel (actual: "${roleCardStats.adminText.slice(0, 40)}")`
    );
    assert(
      roleCardStats.managerText.includes('1 Personel'),
      `Manager role card displays 1 Personel`
    );
    assert(
      roleCardStats.consultantText.includes('2 Personel'),
      `Consultant role card displays 2 Personel (Selin & Ece)`
    );
    assert(
      roleCardStats.assistantText.includes('1 Personel'),
      `Assistant role card displays 1 Personel (Damla)`
    );

    // ---------------------------------------------------------
    // TEST 5: Permission Levels Legend
    // ---------------------------------------------------------
    console.log('\n--- TEST 5: Permission Levels Legend Verification ---');
    const legendText = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="role-matrix-view"]');
      return el ? el.textContent : '';
    });
    assert(legendText.includes('Tam Yetki'), 'Legend includes "Tam Yetki"');
    assert(legendText.includes('Kendi Kayıtları'), 'Legend includes "Kendi Kayıtları"');
    assert(legendText.includes('Yalnızca Görüntüleme'), 'Legend includes "Yalnızca Görüntüleme"');
    assert(legendText.includes('Erişim Yok'), 'Legend includes "Erişim Yok"');

    // ---------------------------------------------------------
    // TEST 6: Category Sections and 10 Modules Mapping
    // ---------------------------------------------------------
    console.log('\n--- TEST 6: Category Sections & 10 Modules Mapping ---');
    const crmSection = await page.$('[data-testid="category-section-crm"]');
    const analyticsSection = await page.$('[data-testid="category-section-analytics"]');
    const managementSection = await page.$('[data-testid="category-section-management"]');

    assert(crmSection !== null, 'Operasyonel CRM category section rendered');
    assert(analyticsSection !== null, 'Finans & Analitik category section rendered');
    assert(managementSection !== null, 'Yönetim & Sistem Güvenliği category section rendered');

    // Count all module rows
    const moduleRowsCount = await page.$$eval('[data-testid^="module-row-"]', (rows) => rows.length);
    assert(moduleRowsCount === 10, `All 10 modules rendered in matrix (found ${moduleRowsCount})`);

    // Verify key permission rules on specific rows
    const rowPermissions = await page.evaluate(() => {
      const getRowText = (id) => {
        const row = document.querySelector(`[data-testid="module-row-${id}"]`);
        return row ? row.textContent : '';
      };

      return {
        consultantsRow: getRowText('consultants'),
        dealsRow: getRowText('deals'),
        settingsRow: getRowText('settings'),
      };
    });

    // Danışman Yönetimi row: Admin has full, Consultant has none
    assert(
      rowPermissions.consultantsRow.includes('Danışman & Personel Yönetimi') &&
        rowPermissions.consultantsRow.includes('Tam Yetki') &&
        rowPermissions.consultantsRow.includes('Erişim Yok'),
      'Danışman Yönetimi module has Tam Yetki for Admin and Erişim Yok for Consultant'
    );

    // Deals row: Consultant has Kendi Kayıtları, Assistant has none
    assert(
      rowPermissions.dealsRow.includes('Satış & Kiralama') &&
        rowPermissions.dealsRow.includes('Kendi Kayıtları') &&
        rowPermissions.dealsRow.includes('Erişim Yok'),
      'Deals module has Kendi Kayıtları for Consultant and Erişim Yok for Assistant'
    );

    // Settings row: Admin has full, Others have none
    assert(
      rowPermissions.settingsRow.includes('Ofis & Finans Ayarları') &&
        rowPermissions.settingsRow.includes('Tam Yetki') &&
        rowPermissions.settingsRow.includes('Erişim Yok'),
      'Settings module restricted to Admin only'
    );

    // ---------------------------------------------------------
    // TEST 7: Interactive Role Focus Filter
    // ---------------------------------------------------------
    console.log('\n--- TEST 7: Interactive Role Focus Filter ---');
    // Click on Consultant card to focus on consultant role
    await page.click('[data-testid="role-card-consultant"]');
    await new Promise((r) => setTimeout(r, 300));

    // In focused mode, first table header should only have 2 columns: Modül and Danışman
    const focusedHeaders = await page.evaluate(() => {
      const firstTable = document.querySelector('[data-testid="category-section-crm"] table');
      const ths = firstTable ? Array.from(firstTable.querySelectorAll('thead th')) : [];
      return ths.map((th) => th.textContent.trim());
    });
    console.log('Focused Table Headers (First Table):', focusedHeaders);
    assert(
      focusedHeaders.length === 2,
      `Table columns filtered to exactly 2 columns in focus mode (found ${focusedHeaders.length})`
    );
    assert(
      focusedHeaders[1].includes('Danışman'),
      'Single focused column is Danışman'
    );

    // Reset filter
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const resetBtn = buttons.find((b) => b.textContent && b.textContent.includes('Tüm Rolleri Göster'));
      if (resetBtn) resetBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    const restoredHeaders = await page.evaluate(() => {
      const firstTable = document.querySelector('[data-testid="category-section-crm"] table');
      const ths = firstTable ? Array.from(firstTable.querySelectorAll('thead th')) : [];
      return ths.map((th) => th.textContent.trim());
    });
    assert(
      restoredHeaders.length === 5,
      `All 4 roles restored in table headers (found ${restoredHeaders.length} headers)`
    );

    // ---------------------------------------------------------
    // TEST 8: Switch Back to Consultants Tab & Verify List Intact
    // ---------------------------------------------------------
    console.log('\n--- TEST 8: Switch Back to Consultants Tab ---');
    await page.click('button[data-testid="tab-consultants"]');
    await new Promise((r) => setTimeout(r, 400));

    const statsGrid = await page.$('[class*="grid-cols-2 lg:grid-cols-4"]');
    assert(statsGrid !== null, 'ConsultantStatsGrid is rendered on Consultants tab');

    const consultantCards = await page.$$('[data-testid="consultant-card"]');
    assert(
      consultantCards.length === 5,
      `All 5 users rendered in Consultants tab (found ${consultantCards.length})`
    );

    console.log('\n🎉 ALL 8 ROLE & PERMISSION MATRIX TESTS PASSED FLAWLESSLY!\n');
  } catch (error) {
    console.error('❌ Test failed with exception:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
