import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

const results = [];

function recordResult(num, question, passed, details) {
  results.push({ num, question, passed, details });
  const icon = passed ? '✅ [EVET / GEÇTİ]' : '❌ [HAYIR / KALDI]';
  console.log(`\n${icon} Madde ${num}: ${question}`);
  console.log(`   Detay: ${details}`);
}

async function runChecklist() {
  console.log('================================================================');
  console.log('🔍 EmlakPro — Kullanıcı Kontrol Listesi Doğrulama Testi');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,850'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  // Helper functions
  const clearAndType = async (selector, text) => {
    await page.focus(selector);
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type(selector, text);
  };

  const clickButtonByText = async (text) => {
    await page.evaluate((btnText) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find((b) => b.textContent && b.textContent.includes(btnText));
      if (!btn) throw new Error(`Button with text "${btnText}" not found`);
      btn.click();
    }, text);
  };

  const logoutUser = async () => {
    await page.waitForSelector('header button[title="Çıkış Yap"]', { timeout: 5000 });
    await page.evaluate(() => {
      const btn = document.querySelector('header button[title="Çıkış Yap"]');
      if (btn) btn.click();
    });
    await page.waitForFunction(() => window.location.pathname === '/giris', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 500));
  };

  try {
    // -------------------------------------------------------------------------
    // MADDE 1: Uygulama ilk açıldığında yönetici oluşturma ekranı geliyor mu?
    // -------------------------------------------------------------------------
    console.log('--- Test 1 Başlatılıyor: İlk Açılış & Yönetici Oluşturma Ekranı ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
    // Direct navigation to root / with zero users
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

    const currentUrlAfterClean = page.url();
    const redirectedToLogin = currentUrlAfterClean.includes('/giris');
    const headerTitle = await page.$eval('h2', (el) => el.textContent.trim());
    const isSetupHeader = headerTitle.includes('İlk Yönetici Hesabınızı Oluşturun');
    const hasNameInput = (await page.$('input[placeholder*="Ahmet Yılmaz"]')) !== null;
    const hasEmailInput = (await page.$('input[placeholder="yonetici@emlakpro.com"]')) !== null;
    const hasPasswordInput = (await page.$('input[placeholder="En az 6 karakter"]')) !== null;

    const test1Passed =
      redirectedToLogin && isSetupHeader && hasNameInput && hasEmailInput && hasPasswordInput;
    recordResult(
      1,
      'Uygulama ilk açıldığında yönetici oluşturma ekranı geliyor mu?',
      test1Passed,
      redirectedToLogin
        ? `Kullanıcı yokken '/' rotası otomatik olarak '/giris' sayfasına yönlendirdi ve "${headerTitle}" formunu açtı.`
        : 'Yönlendirme veya form başlığı tespit edilemedi.'
    );

    // -------------------------------------------------------------------------
    // MADDE 2: İlk yönetici oluşturulduktan sonra giriş yapılabiliyor mu?
    // -------------------------------------------------------------------------
    console.log('\n--- Test 2 Başlatılıyor: İlk Yönetici Oluşturma ve Giriş Yapabilme ---');
    await clearAndType('input[placeholder*="Ahmet Yılmaz"]', 'Kemal Demir');
    await clearAndType('input[placeholder="yonetici@emlakpro.com"]', 'kemal@emlakpro.com');
    await clearAndType('input[placeholder="Kurucu Broker"]', 'Yönetici Broker');
    await clearAndType('input[placeholder="En az 6 karakter"]', 'AdminPass2026!');
    await clearAndType('input[placeholder="Şifreyi tekrar yazınız"]', 'AdminPass2026!');

    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 600));
    await page.waitForFunction(
      () => window.location.pathname !== '/giris',
      { timeout: 5000 }
    );

    // Now test re-login: Logout first
    await logoutUser();

    // Mode 2 login form check
    const loginHeader = await page.$eval('h2', (el) => el.textContent.trim());
    const isStandardLoginForm = loginHeader.includes('CRM Hesabınıza Giriş Yapın');

    // Perform login with created admin credentials
    await clearAndType('input[type="email"]', 'kemal@emlakpro.com');
    await clearAndType('input[type="password"]', 'AdminPass2026!');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 600));
    await page.waitForFunction(
      () => window.location.pathname !== '/giris',
      { timeout: 5000 }
    );

    const loggedInHeader = await page.$eval('header', (el) => el.textContent);
    const isAdminLoggedIn =
      loggedInHeader.includes('Kemal Demir') && loggedInHeader.includes('Yönetici');

    const test2Passed = isStandardLoginForm && isAdminLoggedIn;
    recordResult(
      2,
      'İlk yönetici oluşturulduktan sonra giriş yapılabiliyor mu?',
      test2Passed,
      test2Passed
        ? `Yönetici başarıyla oluşturuldu, çıkış sonrası standart giriş modunda "kemal@emlakpro.com" ile giriş yapıldı (Header: Kemal Demir / Yönetici).`
        : 'Giriş işlemi tamamlanamadı.'
    );

    // -------------------------------------------------------------------------
    // MADDE 3: Yönetici hesabıyla Danışmanlar sayfası açılıyor mu?
    // -------------------------------------------------------------------------
    console.log('\n--- Test 3 Başlatılıyor: Yönetici ile Danışmanlar Sayfası Erişimi ---');
    await page.goto(`${BASE_URL}/danismanlar`, { waitUntil: 'networkidle0' });

    const pageHeading = await page.$eval('h1', (el) => el.textContent.trim());
    const isConsultantsTitle =
      pageHeading.includes('Danışman') && pageHeading.includes('Yönetimi');
    const isNot403 = await page.evaluate(() => !document.body.textContent.includes('403 - Yetkisiz'));

    // Self badge check on admin card
    const cardContent = await page.$eval('[data-testid="consultant-card"]', (el) => el.textContent);
    const hasSelfBadge = cardContent.includes('Siz') && cardContent.includes('Kemal Demir');

    const test3Passed = isConsultantsTitle && isNot403 && hasSelfBadge;
    recordResult(
      3,
      'Yönetici hesabıyla Danışmanlar sayfası açılıyor mu?',
      test3Passed,
      test3Passed
        ? `'/danismanlar' rotası 403 engeline takılmadan açıldı (Başlık: "${pageHeading}") ve "Siz (Aktif Oturum)" rozetli yönetici kartı render edildi.`
        : 'Danışmanlar sayfası açılamadı veya 403 hatası alındı.'
    );

    // -------------------------------------------------------------------------
    // MADDE 4: Dört rolün personel sayıları doğru görünüyor mu?
    // -------------------------------------------------------------------------
    console.log('\n--- Test 4 Başlatılıyor: Dört Rolün Personel Sayıları Doğrulaması ---');
    // Currently we have 1 Admin (Kemal Demir). Let's add 1 Manager, 2 Consultants, 1 Assistant
    // Add Manager: Burak Yılmaz
    await clickButtonByText('Yeni Danışman Ekle');
    await page.waitForSelector('#consultant-name');
    await clearAndType('#consultant-name', 'Burak Yılmaz');
    await clearAndType('#consultant-email', 'burak@emlakpro.com');
    await clearAndType('#consultant-title', 'Operasyon Direktörü');
    await page.select('#consultant-role', 'Ofis Müdürü');
    await clearAndType('#consultant-password', 'BurakPass123!');
    await clearAndType('#consultant-confirm-password', 'BurakPass123!');
    await clickButtonByText('Danışmanı Kaydet');
    await page.waitForFunction(() => !document.querySelector('#consultant-name'));
    await new Promise((r) => setTimeout(r, 500));

    // Add Consultant 1: Selin Aydın
    await clickButtonByText('Yeni Danışman Ekle');
    await page.waitForSelector('#consultant-name');
    await clearAndType('#consultant-name', 'Selin Aydın');
    await clearAndType('#consultant-email', 'selin@emlakpro.com');
    await clearAndType('#consultant-title', 'Kıdemli Danışman');
    await page.select('#consultant-role', 'Gayrimenkul Danışmanı');
    await clearAndType('#consultant-password', 'SelinPass123!');
    await clearAndType('#consultant-confirm-password', 'SelinPass123!');
    await clickButtonByText('Danışmanı Kaydet');
    await page.waitForFunction(() => !document.querySelector('#consultant-name'));
    await new Promise((r) => setTimeout(r, 500));

    // Add Consultant 2: Ece Arda
    await clickButtonByText('Yeni Danışman Ekle');
    await page.waitForSelector('#consultant-name');
    await clearAndType('#consultant-name', 'Ece Arda');
    await clearAndType('#consultant-email', 'ece@emlakpro.com');
    await clearAndType('#consultant-title', 'Ticari Gayrimenkul Uzmanı');
    await page.select('#consultant-role', 'Gayrimenkul Danışmanı');
    await clearAndType('#consultant-password', 'EcePass123!');
    await clearAndType('#consultant-confirm-password', 'EcePass123!');
    await clickButtonByText('Danışmanı Kaydet');
    await page.waitForFunction(() => !document.querySelector('#consultant-name'));
    await new Promise((r) => setTimeout(r, 500));

    // Add Assistant: Damla Demir
    await clickButtonByText('Yeni Danışman Ekle');
    await page.waitForSelector('#consultant-name');
    await clearAndType('#consultant-name', 'Damla Demir');
    await clearAndType('#consultant-email', 'damla@emlakpro.com');
    await clearAndType('#consultant-title', 'Ofis Koordinatörü');
    await page.select('#consultant-role', 'Asistan');
    await clearAndType('#consultant-password', 'DamlaPass123!');
    await clearAndType('#consultant-confirm-password', 'DamlaPass123!');
    await clickButtonByText('Danışmanı Kaydet');
    await page.waitForFunction(() => !document.querySelector('#consultant-name'));
    await new Promise((r) => setTimeout(r, 500));

    // Switch to Role Matrix tab to check 4 role summary cards
    await page.click('button[data-testid="tab-role-matrix"]');
    await new Promise((r) => setTimeout(r, 400));

    const roleStats = await page.evaluate(() => {
      const admin = document.querySelector('[data-testid="role-card-admin"]')?.textContent || '';
      const manager = document.querySelector('[data-testid="role-card-manager"]')?.textContent || '';
      const consultant = document.querySelector('[data-testid="role-card-consultant"]')?.textContent || '';
      const assistant = document.querySelector('[data-testid="role-card-assistant"]')?.textContent || '';
      return { admin, manager, consultant, assistant };
    });

    const adminOk = roleStats.admin.includes('1 Personel');
    const managerOk = roleStats.manager.includes('1 Personel');
    const consultantOk = roleStats.consultant.includes('2 Personel');
    const assistantOk = roleStats.assistant.includes('1 Personel');
    const test4Passed = adminOk && managerOk && consultantOk && assistantOk;

    recordResult(
      4,
      'Dört rolün personel sayıları doğru görünüyor mu?',
      test4Passed,
      test4Passed
        ? `Canlı sayımlar doğru: Yönetici: 1 Personel, Ofis Müdürü: 1 Personel, Gayrimenkul Danışmanı: 2 Personel (Selin & Ece), Asistan: 1 Personel (Damla). Toplam: 5 Personel.`
        : `Sayılar uyuşmuyor: Admin=${roleStats.admin}, Manager=${roleStats.manager}, Consultant=${roleStats.consultant}, Assistant=${roleStats.assistant}`
    );

    // -------------------------------------------------------------------------
    // MADDE 5: Rol ve Yetki Matrisi sekmesi sorunsuz çalışıyor mu?
    // -------------------------------------------------------------------------
    console.log('\n--- Test 5 Başlatılıyor: Rol ve Yetki Matrisi Sekmesi Denetimi ---');
    const matrixViewMounted = (await page.$('[data-testid="role-matrix-view"]')) !== null;
    const legendText = await page.$eval('[data-testid="role-matrix-view"]', (el) => el.textContent);
    const hasLegendTiers =
      legendText.includes('Tam Yetki') &&
      legendText.includes('Kendi Kayıtları') &&
      legendText.includes('Yalnızca Görüntüleme') &&
      legendText.includes('Erişim Yok');

    const moduleRowsCount = (await page.$$('[data-testid^="module-row-"]')).length;

    // Test interactive focus
    await page.click('[data-testid="role-card-consultant"]');
    await new Promise((r) => setTimeout(r, 300));
    const focusedColCount = await page.evaluate(() => {
      const firstTable = document.querySelector('[data-testid="category-section-crm"] table');
      return firstTable ? firstTable.querySelectorAll('thead th').length : 0;
    });

    // Reset focus
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find((b) => b.textContent && b.textContent.includes('Tüm Rolleri Göster'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    // Switch back to consultants list tab
    await page.click('button[data-testid="tab-consultants"]');
    await new Promise((r) => setTimeout(r, 400));
    const cardsRendered = (await page.$$('[data-testid="consultant-card"]')).length;

    const test5Passed =
      matrixViewMounted &&
      hasLegendTiers &&
      moduleRowsCount === 10 &&
      focusedColCount === 2 &&
      cardsRendered === 5;

    recordResult(
      5,
      'Rol ve Yetki Matrisi sekmesi sorunsuz çalışıyor mu?',
      test5Passed,
      test5Passed
        ? `Matris görünümü, 4 seviyeli lejant, 10 modülün tamamı, interaktif tek-rol odaklanması (5 kolondan 2 kolona daralma) ve listeye geri dönüş pürüzsüz çalışıyor.`
        : 'Matris sekmesinde bileşen veya filtreleme eksikliği tespit edildi.'
    );

    // -------------------------------------------------------------------------
    // MADDE 6: Danışman hesabıyla giriş yapıldığında yönetici menüleri gizleniyor mu?
    // -------------------------------------------------------------------------
    console.log('\n--- Test 6 Başlatılıyor: Danışman Hesabı ile Menü İzolasyonu ---');
    // Logout admin
    await logoutUser();

    // Login as Consultant (Selin Aydın)
    await clearAndType('input[type="email"]', 'selin@emlakpro.com');
    await clearAndType('input[type="password"]', 'SelinPass123!');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 600));
    await page.waitForFunction(
      () => window.location.pathname !== '/giris',
      { timeout: 5000 }
    );

    // Check Header
    const consultantHeader = await page.$eval('header', (el) => el.textContent);
    const hasConsultantRoleInHeader =
      consultantHeader.includes('Selin Aydın') &&
      consultantHeader.includes('Gayrimenkul Danışmanı');

    // Check Sidebar items
    const sidebarText = await page.$eval('aside', (el) => el.textContent);
    const hasDanismanYonetimiInSidebar = sidebarText.includes('Danışman Yönetimi');
    const hasAyarlarInSidebar = sidebarText.includes('Ayarlar');
    const hasSistemSection = sidebarText.includes('SİSTEM');

    // Check direct route protection
    await page.goto(`${BASE_URL}/danismanlar`, { waitUntil: 'networkidle0' });
    const danismanlar403Text = await page.evaluate(() => document.body.textContent);
    const is403Danismanlar =
      danismanlar403Text.includes('403') || danismanlar403Text.includes('Yetkisiz Erişim');

    await page.goto(`${BASE_URL}/ayarlar`, { waitUntil: 'networkidle0' });
    const ayarlar403Text = await page.evaluate(() => document.body.textContent);
    const is403Ayarlar =
      ayarlar403Text.includes('403') || ayarlar403Text.includes('Yetkisiz Erişim');

    const test6Passed =
      hasConsultantRoleInHeader &&
      !hasDanismanYonetimiInSidebar &&
      !hasAyarlarInSidebar &&
      !hasSistemSection &&
      is403Danismanlar &&
      is403Ayarlar;

    recordResult(
      6,
      'Danışman hesabıyla giriş yapıldığında yönetici menüleri gizleniyor mu?',
      test6Passed,
      test6Passed
        ? `Danışman menüsünde "Danışman Yönetimi", "Ayarlar" ve "SİSTEM" başlığı gizlendi. '/danismanlar' ve '/ayarlar' sayfalarına doğrudan erişim ProtectedRoute 403 ekranıyla engellendi.`
        : 'Danışman menüsünde yetkisiz öğeler göründü veya 403 engeli çalışmadı.'
    );

    // -------------------------------------------------------------------------
    // MADDE 7: Çıkış yapıldığında oturum temizleniyor mu?
    // -------------------------------------------------------------------------
    console.log('\n--- Test 7 Başlatılıyor: Çıkış Yapma & Oturum Temizleme ---');
    // Return to a valid route first to see header
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0' });
    await logoutUser();

    const sessionAfterLogout = await page.evaluate(() =>
      localStorage.getItem('emlakpro_session_v1')
    );
    const isSessionNull = sessionAfterLogout === null;

    // Try navigating to a protected route unauthenticated
    await page.goto(`${BASE_URL}/musteriler`, { waitUntil: 'networkidle0' });
    const bouncedToLogin = page.url().includes('/giris');

    const test7Passed = isSessionNull && bouncedToLogin;
    recordResult(
      7,
      'Çıkış yapıldığında oturum temizleniyor mu?',
      test7Passed,
      test7Passed
        ? `'emlakpro_session_v1' anahtarı localStorage'dan tamamen kaldırıldı (null) ve korumalı '/musteriler' sayfasına gidilmek istendiğinde '/giris'e geri fırlatıldı.`
        : 'Oturum temizlenemedi.'
    );

    // -------------------------------------------------------------------------
    // MADDE 8: Sayfa yenilendiğinde oturum ve veriler beklenen şekilde korunuyor mu?
    // -------------------------------------------------------------------------
    console.log('\n--- Test 8 Başlatılıyor: Sayfa Yenileme ile Oturum ve Veri Kalıcılığı ---');
    // Login as Admin
    await clearAndType('input[type="email"]', 'kemal@emlakpro.com');
    await clearAndType('input[type="password"]', 'AdminPass2026!');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 600));
    await page.waitForFunction(
      () => window.location.pathname !== '/giris',
      { timeout: 5000 }
    );

    // Navigate to /danismanlar
    await page.goto(`${BASE_URL}/danismanlar`, { waitUntil: 'networkidle0' });

    // Reload page
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));

    const reloadedUrl = page.url();
    const stayedOnDanismanlar = reloadedUrl.includes('/danismanlar');

    const sessionAfterReload = await page.evaluate(() => {
      const rawSession = localStorage.getItem('emlakpro_session_v1');
      const rawSettings = localStorage.getItem('emlakpro_settings_v1');
      return {
        session: rawSession ? JSON.parse(rawSession) : null,
        users: rawSettings ? JSON.parse(rawSettings).users : [],
      };
    });

    const isSessionPreserved =
      sessionAfterReload.session &&
      sessionAfterReload.session.name === 'Kemal Demir' &&
      sessionAfterReload.session.role === 'admin';
    const areUsersPreserved = sessionAfterReload.users.length === 5;

    const test8Passed = stayedOnDanismanlar && isSessionPreserved && areUsersPreserved;
    recordResult(
      8,
      'Sayfa yenilendiğinde oturum ve veriler beklenen şekilde korunuyor mu?',
      test8Passed,
      test8Passed
        ? `Sayfa yenilendiğinde kullanıcı '/danismanlar' sayfasında kaldı, aktif oturum ('Kemal Demir' / admin) ve kayıtlı 5 personelin tamamı veri kaybı olmaksızın korundu.`
        : 'Sayfa yenilemede oturum veya veri kaybı tespit edildi.'
    );

    // -------------------------------------------------------------------------
    // FINAL SUMMARY
    // -------------------------------------------------------------------------
    console.log('\n================================================================');
    console.log('📊 TEST SONUÇLARI ÖZETİ');
    console.log('================================================================');
    const totalPassed = results.filter((r) => r.passed).length;
    console.log(`Toplam Kontrol: ${results.length} | Başarılı: ${totalPassed} | Başarısız: ${results.length - totalPassed}`);
    if (totalPassed === results.length) {
      console.log('🎉 8 KONTROL MADDESİNİN TAMAMI %100 BAŞARIYLA DOĞRULANDI!');
    }
    console.log('================================================================\n');

  } catch (err) {
    console.error('Test sırasında beklenmeyen hata:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runChecklist();
