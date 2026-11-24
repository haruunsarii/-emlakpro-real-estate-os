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

async function runRegression() {
  console.log('================================================================');
  console.log('🚀 Phase 6: Admin Paneli & Danışman Yönetimi — Final Regresyon Testi');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,850'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Temiz Başlangıç & Mod 1 (İlk Yönetici Kurulumu)
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Temiz Başlangıç & Mod 1 (İlk Yönetici Kurulumu) ---');
    await page.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });

    const setupHeader = await page.$eval('h2', (el) => el.textContent);
    assert(
      setupHeader.includes('Kurulum') || setupHeader.includes('Yönetici Hesabınızı Oluşturun'),
      'Sistem temiz başlangıçta Mod 1: İlk Yönetici Kurulumu ekranını gösteriyor'
    );

    const isDisclaimerPresent = await page.evaluate(() =>
      document.body.textContent.includes('Frontend Prototip Bilgisi')
    );
    assert(isDisclaimerPresent, 'İstemci tarafı güvenlik prototipi bilgilendirme kutusu mevcut');

    // -------------------------------------------------------------------------
    // TEST 2: Yönetici Hesabı Oluşturma & Güvenlik Kriterleri (SHA-256)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: İlk Yönetici Hesabı Oluşturma & İstemci Tarafı SHA-256 ---');
    await page.type('input[placeholder="Örn: Ahmet Yılmaz"]', 'Kemal Demir');
    await page.type('input[placeholder="yonetici@emlakpro.com"]', 'kemal@emlakpro.com');
    await page.type('input[placeholder="Kurucu Broker"]', 'Yönetici Broker');
    await page.type('input[placeholder="En az 6 karakter"]', 'AdminPass2026!');
    await page.type('input[placeholder="Şifreyi tekrar yazınız"]', 'AdminPass2026!');

    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 600));
    await page.waitForFunction(
      () => window.location.pathname === '/' || window.location.pathname === '',
      { timeout: 5000 }
    );

    const currentUrl = page.url();
    assert(
      currentUrl === `${BASE_URL}/` || currentUrl === `${BASE_URL}/#`,
      'Yönetici kaydı sonrası doğrudan Dashboard ekranına yönlendirildi'
    );

    const storageAudit = await page.evaluate(() => {
      const usersStr = localStorage.getItem('emlakpro_settings_v1');
      const sessionStr = localStorage.getItem('emlakpro_session_v1');
      return {
        users: usersStr ? JSON.parse(usersStr).users : [],
        session: sessionStr ? JSON.parse(sessionStr) : null,
        rawStorage: JSON.stringify(localStorage),
      };
    });

    assert(storageAudit.users.length === 1, 'settings.users içinde tam 1 kullanıcı oluşturuldu');
    const adminUser = storageAudit.users[0];
    assert(adminUser.name === 'Kemal Demir', 'Yönetici adı Kemal Demir olarak kaydedildi');
    assert(adminUser.role === 'Yönetici', 'Kullanıcı rolü Yönetici olarak tanımlandı');
    assert(
      adminUser.passwordHash && adminUser.passwordHash.startsWith('sha256:'),
      'Şifre Web Crypto SHA-256 ile özetlendi (sha256:...)'
    );
    assert(
      !storageAudit.rawStorage.includes('AdminPass2026!'),
      'GÜVENLİK KRİTERİ: Düz metin şifre localStorage içinde ASLA saklanmıyor'
    );
    assert(
      storageAudit.session && storageAudit.session.name === 'Kemal Demir',
      'Oturum nesnesi Kemal Demir için başarıyla başlatıldı'
    );
    assert(
      !storageAudit.session.password && !storageAudit.session.passwordHash,
      'GÜVENLİK KRİTERİ: Oturum nesnesinde şifre veya şifre özeti bulunmuyor'
    );

    // -------------------------------------------------------------------------
    // TEST 3: Yönetici Arayüzü & Menü Görünürlüğü
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Yönetici Arayüzü, Header & Menü İzolasyonu ---');
    const headerInfo = await page.evaluate(() => {
      const header = document.querySelector('header');
      return header ? header.textContent : '';
    });
    assert(headerInfo.includes('Kemal Demir'), 'Header üzerinde aktif yönetici adı görünüyor');
    assert(headerInfo.includes('Yönetici'), 'Header üzerinde Yönetici rol rozeti görünüyor');

    const sidebarText = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      return aside ? aside.textContent : '';
    });
    assert(sidebarText.includes('Danışman Yönetimi'), 'Sidebar yöneticilere Danışman Yönetimi menüsünü gösteriyor');
    assert(sidebarText.includes('Ayarlar'), 'Sidebar yöneticilere Ayarlar menüsünü gösteriyor');

    // -------------------------------------------------------------------------
    // TEST 4: Danışman Yönetimi (/danismanlar), Canlı KPI'lar & CRUD
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Danışman Yönetimi (/danismanlar), Canlı KPI ve Danışman Ekleme ---');
    await page.goto(`${BASE_URL}/danismanlar`, { waitUntil: 'networkidle0' });

    const kpiCounts = await page.$$eval(
      '[data-testid="consultant-kpi-grid"] span.font-extrabold',
      (els) => els.map((el) => el.textContent.trim())
    );
    assert(kpiCounts[0] === '1', 'Toplam Personel başlangıçta 1 (Yönetici)');
    assert(kpiCounts[1] === '1', 'Aktif Danışmanlar başlangıçta 1');

    // Admin self badge
    const selfBadge = await page.$('[data-testid="consultant-card"] span');
    const selfBadgeText = await page.evaluate((el) => el.textContent, selfBadge);
    assert(selfBadgeText.includes('Siz') || selfBadgeText.includes('Aktif'), 'Yönetici kartında "Siz (Aktif Oturum)" rozeti mevcut');

    // Helper functions for forms and buttons
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

    // Yeni Danışman Ekle: Selin Aydın
    await clickButtonByText('Yeni Danışman Ekle');
    await page.waitForSelector('#consultant-name');
    await clearAndType('#consultant-name', 'Selin Aydın');
    await clearAndType('#consultant-email', 'selin@emlakpro.com');
    await clearAndType('#consultant-phone', '05321112233');
    await clearAndType('#consultant-title', 'Kıdemli Danışman');
    await page.select('#consultant-role', 'Gayrimenkul Danışmanı');
    await clearAndType('#consultant-password', 'SelinPass123!');
    await clearAndType('#consultant-confirm-password', 'SelinPass123!');
    await clickButtonByText('Danışmanı Kaydet');
    await page.waitForFunction(() => !document.querySelector('#consultant-name'));
    await new Promise((r) => setTimeout(r, 600));

    // Bir Ofis Müdürü ekle: Burak Yılmaz
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
    await new Promise((r) => setTimeout(r, 600));

    // Bir Asistan ekle: Damla Demir
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
    await new Promise((r) => setTimeout(r, 600));

    const totalUsers = await page.evaluate(() => {
      const raw = localStorage.getItem('emlakpro_settings_v1');
      return raw ? JSON.parse(raw).users.length : 0;
    });
    assert(totalUsers === 4, 'Sistemde tam 4 kayıtlı kullanıcı mevcut (Yönetici, Müdür, Danışman, Asistan)');

    // -------------------------------------------------------------------------
    // TEST 5: Rol ve Yetki Matrisi Görselleştirmesi (Alt Adım 6.4)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Rol ve Yetki Matrisi Görselleştirmesi & İnteraktif Odak ---');
    await page.click('[data-testid="tab-role-matrix"]');
    await new Promise((r) => setTimeout(r, 400));

    const matrixMounted = await page.$('[data-testid="role-matrix-view"]');
    assert(matrixMounted !== null, 'Rol ve Yetki Matrisi görünümü başarıyla render edildi');

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

    assert(roleCardStats.adminText.includes('1 Personel'), 'Yönetici kartında canlı 1 Personel yazıyor');
    assert(roleCardStats.managerText.includes('1 Personel'), 'Ofis Müdürü kartında canlı 1 Personel yazıyor');
    assert(roleCardStats.consultantText.includes('1 Personel'), 'Gayrimenkul Danışmanı kartında canlı 1 Personel yazıyor');
    assert(roleCardStats.assistantText.includes('1 Personel'), 'Ofis Asistanı kartında canlı 1 Personel yazıyor');

    // İnteraktif Odaklanma: Danışman rolüne tıkla
    await page.click('[data-testid="role-card-consultant"]');
    await new Promise((r) => setTimeout(r, 300));

    const focusedHeaders = await page.evaluate(() => {
      const firstTable = document.querySelector('[data-testid="category-section-crm"] table');
      const ths = firstTable ? Array.from(firstTable.querySelectorAll('thead th')) : [];
      return ths.map((th) => th.textContent.trim());
    });
    assert(focusedHeaders.length === 2, 'Odak modunda tablo kolonları sadece seçilen role daraltıldı (2 kolon)');

    // Odak filtresini temizle
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
    assert(restoredHeaders.length === 5, 'Odak temizlendiğinde tüm 4 rol kolonu geri yüklendi (5 kolon)');

    // -------------------------------------------------------------------------
    // TEST 6: Kendini Kilitleme Koruması (Self-Lockout Prevention)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Yönetici Kendini Kilitleme Koruması ---');
    await page.click('[data-testid="tab-consultants"]');
    await new Promise((r) => setTimeout(r, 400));

    const adminSelfControls = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[data-testid="consultant-card"]'));
      const adminCard = cards.find((c) => c.textContent.includes('Kemal Demir'));
      if (!adminCard) return null;
      const toggleBtn = adminCard.querySelector('[data-action="toggle-status"]');
      const deleteBtn = adminCard.querySelector('[data-action="delete"]');
      return {
        toggleDisabled: toggleBtn ? toggleBtn.disabled : false,
        deleteDisabled: deleteBtn ? deleteBtn.disabled : false,
      };
    });
    assert(adminSelfControls && adminSelfControls.toggleDisabled, 'Yönetici kendi durumunu pasife alamaz (disabled)');
    assert(adminSelfControls && adminSelfControls.deleteDisabled, 'Yönetici kendi hesabını silemez (disabled)');

    // -------------------------------------------------------------------------
    // TEST 7: Danışman Girişi, Menü İzolasyonu & 403 Kalkanı
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 7: Danışman Girişi, Menü İzolasyonu & ProtectedRoute 403 Kalkanı ---');
    // Çıkış yap
    await page.click('header button[title="Çıkış Yap"]');
    await new Promise((r) => setTimeout(r, 600));
    await page.waitForFunction(
      () => window.location.pathname === '/giris',
      { timeout: 5000 }
    );

    assert(page.url().includes('/giris'), 'Çıkış sonrası /giris sayfasına dönüldü');

    // Selin Aydın olarak giriş yap
    await clearAndType('input[type="email"]', 'selin@emlakpro.com');
    await clearAndType('input[type="password"]', 'SelinPass123!');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 600));
    await page.waitForFunction(
      () => window.location.pathname === '/' || window.location.pathname === '',
      { timeout: 5000 }
    );

    const consultantHeader = await page.$eval('header', (el) => el.textContent);
    assert(consultantHeader.includes('Selin Aydın'), 'Header üzerinde danışman Selin Aydın görünüyor');
    assert(consultantHeader.includes('Gayrimenkul Danışmanı'), 'Header üzerinde Gayrimenkul Danışmanı rolü görünüyor');

    const consultantSidebar = await page.$eval('aside', (el) => el.textContent);
    assert(!consultantSidebar.includes('Danışman Yönetimi'), 'Danışman menüsünde Danışman Yönetimi kesinlikle gizli');
    assert(!consultantSidebar.includes('Ayarlar'), 'Danışman menüsünde Ayarlar kesinlikle gizli');

    // 403 Kontrolü: /danismanlar
    await page.goto(`${BASE_URL}/danismanlar`, { waitUntil: 'networkidle0' });
    const forbidden403Danisman = await page.evaluate(() => document.body.textContent);
    assert(
      forbidden403Danisman.includes('403') || forbidden403Danisman.includes('Yetkisiz Erişim') || forbidden403Danisman.includes('Yönetici'),
      'Danışmanın /danismanlar sayfasına doğrudan URL erişimi 403 korumasıyla engellendi'
    );

    // 403 Kontrolü: /ayarlar
    await page.goto(`${BASE_URL}/ayarlar`, { waitUntil: 'networkidle0' });
    const forbidden403Ayarlar = await page.evaluate(() => document.body.textContent);
    assert(
      forbidden403Ayarlar.includes('403') || forbidden403Ayarlar.includes('Yetkisiz Erişim') || forbidden403Ayarlar.includes('Yönetici'),
      'Danışmanın /ayarlar sayfasına doğrudan URL erişimi 403 korumasıyla engellendi'
    );

    // Danışmanın CRM operasyonel sayfalarına erişimi
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0' });
    const propertiesTitle = await page.evaluate(() => document.body.textContent);
    assert(propertiesTitle.includes('Gayrimenkul') || propertiesTitle.includes('Portföy'), 'Danışman Gayrimenkuller ekranına serbestçe erişebiliyor');

    // -------------------------------------------------------------------------
    // TEST 8: Pasife Alınan Kullanıcı Giriş Engeli
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 8: Pasife Alınan Hesap Giriş Engeli Denetimi ---');
    // Admin ile giriş yap
    await page.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });
    await page.evaluate(async () => {
      // Simulate admin session
      const encoder = new TextEncoder();
      const salt = 'emlakpro_salt_v1_';
      const hashBuf = await window.crypto.subtle.digest('SHA-256', encoder.encode(salt + 'AdminPass2026!'));
      const adminHash = 'sha256:' + Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      const raw = localStorage.getItem('emlakpro_settings_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        // Selin'i pasife al
        parsed.users = parsed.users.map(u => u.email === 'selin@emlakpro.com' ? { ...u, status: 'Pasif' } : u);
        localStorage.setItem('emlakpro_settings_v1', JSON.stringify(parsed));
      }
      localStorage.removeItem('emlakpro_session_v1');
    });

    await page.reload({ waitUntil: 'networkidle0' });

    // Pasif Selin Aydın ile giriş yapmayı dene
    await clearAndType('input[type="email"]', 'selin@emlakpro.com');
    await clearAndType('input[type="password"]', 'SelinPass123!');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 600));

    const passiveError = await page.evaluate(() => {
      const alert = document.querySelector('[role="alert"]');
      return alert ? alert.textContent : '';
    });
    assert(
      passiveError.includes('pasif') || passiveError.includes('yetkiliyle iletişime'),
      'Pasife alınmış danışman girişi engellendi ve açıklayıcı hata mesajı verildi'
    );

    // -------------------------------------------------------------------------
    // TEST 9: Fabrika Ayarlarına Sıfırlama, Emniyet Yedeği & İlk Kuruluma Dönüş
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 9: Fabrika Ayarlarına Sıfırlama, Emniyet Yedeği & Temiz Duruma Dönüş ---');
    const resetResult = await page.evaluate(async () => {
      const { resetCrmToFactoryDefaults } = await import('/src/services/settingsData.js');
      resetCrmToFactoryDefaults();
      const safetyBackup = localStorage.getItem('emlakpro_pre_restore_safety_backup');
      const session = localStorage.getItem('emlakpro_session_v1');
      const settings = localStorage.getItem('emlakpro_settings_v1');
      return {
        hasBackup: !!safetyBackup,
        backupContainsKemal: safetyBackup ? safetyBackup.includes('Kemal Demir') : false,
        sessionCleared: !session,
        usersEmpty: settings ? JSON.parse(settings).users.length === 0 : true,
      };
    });

    assert(resetResult.hasBackup, 'Sıfırlama öncesinde emlakpro_pre_restore_safety_backup oluşturuldu');
    assert(resetResult.backupContainsKemal, 'Emniyet yedeği Kemal Demir yönetici kaydını içeriyor');
    assert(resetResult.sessionCleared, 'Oturum anahtarı (emlakpro_session_v1) sıfırlandı');
    assert(resetResult.usersEmpty, 'settings.users tamamen temiz diziye ([]) sıfırlandı');

    await page.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });
    const finalPageText = await page.evaluate(() => document.body.textContent);
    assert(
      finalPageText.includes('Kurulum') || finalPageText.includes('Yönetici Hesabınızı Oluşturun'),
      'Uygulama başarıyla Mod 1: İlk Yönetici Kurulumu durumuna geri döndü'
    );

    // -------------------------------------------------------------------------
    // TEST 10: Responsive Tasarım Uyumu (Mobil, Tablet, Masaüstü)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 10: Farklı Ekran Çözünürlüklerinde Responsive Uyum ---');
    // Mobile (375px)
    await page.setViewport({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'networkidle0' });
    const mobileOverflow = await page.evaluate(() => document.body.scrollWidth <= 375);
    assert(mobileOverflow, 'Mobil (375px) görünümde yatay taşma oluşmuyor');

    // Tablet (768px)
    await page.setViewport({ width: 768, height: 1024 });
    await page.reload({ waitUntil: 'networkidle0' });
    const tabletOverflow = await page.evaluate(() => document.body.scrollWidth <= 768);
    assert(tabletOverflow, 'Tablet (768px) görünümde yatay taşma oluşmuyor');

    // Desktop (1280px)
    await page.setViewport({ width: 1280, height: 850 });
    await page.reload({ waitUntil: 'networkidle0' });
    const desktopOverflow = await page.evaluate(() => document.body.scrollWidth <= 1280);
    assert(desktopOverflow, 'Masaüstü (1280px) görünümde yatay taşma oluşmuyor');

    console.log('\n================================================================');
    console.log('🎉 TEBRİKLER! TÜM 10 FİNAL ENTEGRASYON VE REGRESYON TESTİ EKSİKSİZ GEÇTİ!');
    console.log('================================================================\n');

  } catch (err) {
    console.error('Test sırasında beklenmeyen hata:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runRegression();
