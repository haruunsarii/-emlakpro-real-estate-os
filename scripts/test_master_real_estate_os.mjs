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

async function runMasterTest() {
  console.log('========================================================================');
  console.log('👑 EMLAKPRO REAL ESTATE OS — MASTER E2E REGRESYON & SENKRONİZASYON TESTİ');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1440,900',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
    ],
  });

  try {
    // =========================================================================
    // BÖLÜM 1: TEMİZ BAŞLANGIÇ & AŞAMA 6 YÖNETİCİ KURULUMU, ŞİFRE GÜVENLİĞİ
    // =========================================================================
    console.log('--- BÖLÜM 1: İlk Yönetici Kurulumu, Web Crypto SHA-256 & Oturum ---');
    const pageAdmin = await browser.newPage();
    pageAdmin.on('pageerror', (err) => console.error('[pageAdmin ERROR]:', err.message));
    await pageAdmin.setViewport({ width: 1440, height: 900 });
    await pageAdmin.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

    // Verileri temizle
    await pageAdmin.evaluate(() => {
      localStorage.clear();
    });
    await pageAdmin.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });

    await pageAdmin.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });
    await pageAdmin.evaluate(() => localStorage.clear());
    await pageAdmin.reload({ waitUntil: 'networkidle0' });

    // Mod 1: İlk Yönetici Kurulumu formu
    const setupHeader = await pageAdmin.$eval('h2', (el) => el.textContent);
    assert(
      setupHeader.includes('Kurulum') || setupHeader.includes('Yönetici Hesabınızı Oluşturun'),
      'Mod 1: İlk Yönetici Kurulumu ekranı açıldı.'
    );

    await pageAdmin.type('input[placeholder="Örn: Ahmet Yılmaz"]', 'Kemal Demir');
    await pageAdmin.type('input[placeholder="yonetici@emlakpro.com"]', 'kemal@emlakpro.com');
    await pageAdmin.type('input[placeholder="Kurucu Broker"]', 'Yönetici Broker');
    await pageAdmin.type('input[placeholder="En az 6 karakter"]', 'AdminPass2026!');
    await pageAdmin.type('input[placeholder="Şifreyi tekrar yazınız"]', 'AdminPass2026!');

    const setupBtn = await pageAdmin.$('button[type="submit"]');
    await setupBtn.click();
    await new Promise((r) => setTimeout(r, 600));
    await pageAdmin.waitForFunction(() => window.location.pathname === '/', { timeout: 5000 });
    console.log('  ✓ İlk Yönetici hesabı oluşturuldu ve Dashboard ekranına yönlendirildi.');

    // Şifre güvenliği denetimi (Web Crypto SHA-256 hash)
    const storageAudit = await pageAdmin.evaluate(() => {
      const settings = JSON.parse(localStorage.getItem('emlakpro_settings_v1') || '{}');
      const session = JSON.parse(localStorage.getItem('emlakpro_session_v1') || '{}');
      const user = settings.users?.[0];
      return {
        hasPlainPasswordInSettings: JSON.stringify(settings).includes('AdminPass2026!'),
        hasPlainPasswordInSession: JSON.stringify(session).includes('AdminPass2026!'),
        isHashed: user?.passwordHash?.startsWith('sha256:'),
        sessionHasNoHash: !session.password && !session.passwordHash,
      };
    });

    assert(!storageAudit.hasPlainPasswordInSettings, 'GÜVENLİK: Düz metin şifre ayarlarda ASLA saklanmıyor.');
    assert(!storageAudit.hasPlainPasswordInSession, 'GÜVENLİK: Düz metin şifre oturum nesnesinde ASLA bulunmuyor.');
    assert(storageAudit.isHashed, 'GÜVENLİK: Şifre Web Crypto SHA-256 formatında özetlendi.');
    assert(storageAudit.sessionHasNoHash, 'GÜVENLİK: Oturum nesnesinde şifre veya hash bulunmuyor.');
    console.log('[BÖLÜM 1] İlk Yönetici Kurulumu ve İstemci Tarafı Güvenlik Mimarisi BAŞARILI.\n');

    // =========================================================================
    // BÖLÜM 2: DANIŞMAN YÖNETİMİ, ROL VE YETKİ MATRİSİ & 403 KORUMASI (AŞAMA 6)
    // =========================================================================
    console.log('--- BÖLÜM 2: Danışman Yönetimi, Yetki Matrisi & ProtectedRoute 403 ---');
    await pageAdmin.goto(`${BASE_URL}/danismanlar`, { waitUntil: 'networkidle0' });

    // Helper functions for forms and buttons
    const clearAndType = async (selector, text) => {
      await pageAdmin.waitForSelector(selector, { timeout: 5000 });
      await pageAdmin.focus(selector);
      await pageAdmin.keyboard.down('Control');
      await pageAdmin.keyboard.press('A');
      await pageAdmin.keyboard.up('Control');
      await pageAdmin.keyboard.press('Backspace');
      await pageAdmin.type(selector, text);
    };

    const clickButtonByText = async (text) => {
      await pageAdmin.evaluate((btnText) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find((b) => b.textContent && b.textContent.includes(btnText));
        if (!btn) throw new Error(`Button with text "${btnText}" not found`);
        btn.click();
      }, text);
    };

    // Danışman ekle: Selin Aydın
    await clickButtonByText('Yeni Danışman Ekle');
    await pageAdmin.waitForSelector('#consultant-name');
    await clearAndType('#consultant-name', 'Selin Aydın');
    await clearAndType('#consultant-email', 'selin@emlakpro.com');
    await clearAndType('#consultant-phone', '05442223344');
    await clearAndType('#consultant-title', 'Gayrimenkul Danışmanı');
    await pageAdmin.select('#consultant-role', 'Gayrimenkul Danışmanı');
    await clearAndType('#consultant-password', 'Danisman123!');
    await clearAndType('#consultant-confirm-password', 'Danisman123!');
    await clickButtonByText('Danışmanı Kaydet');
    await pageAdmin.waitForFunction(() => !document.querySelector('#consultant-name'));
    await new Promise((r) => setTimeout(r, 600));

    // Rol ve Yetki Matrisi sekmesini test et
    await pageAdmin.click('[data-testid="tab-role-matrix"]');
    await new Promise((r) => setTimeout(r, 400));
    const matrixMounted = await pageAdmin.$('[data-testid="role-matrix-view"]');
    assert(matrixMounted !== null, 'Rol ve Yetki Matrisi görünümü başarıyla render edildi.');

    // Çıkış yap ve Danışman hesabıyla giriş yap
    await pageAdmin.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });
    await pageAdmin.evaluate(() => localStorage.removeItem('emlakpro_session_v1'));
    await pageAdmin.reload({ waitUntil: 'networkidle0' });

    await clearAndType('input[type="email"]', 'selin@emlakpro.com');
    await clearAndType('input[type="password"]', 'Danisman123!');
    const loginBtn = await pageAdmin.$('button[type="submit"]');
    await loginBtn.click();
    await pageAdmin.waitForFunction(() => window.location.pathname === '/', { timeout: 5000 });

    // Danışman menü kısıtlamalarını doğrula
    const sidebarText = await pageAdmin.evaluate(() => {
      return document.querySelector('aside')?.textContent || '';
    });
    assert(!sidebarText.includes('Danışman Yönetimi'), 'Danışman rolünde Danışman Yönetimi menüsü GİZLİ.');
    assert(!sidebarText.includes('Ayarlar'), 'Danışman rolünde Ayarlar menüsü GİZLİ.');

    // ProtectedRoute 403 doğrudan URL koruması
    await pageAdmin.goto(`${BASE_URL}/danismanlar`, { waitUntil: 'networkidle0' });
    const forbiddenText = await pageAdmin.evaluate(() => document.body.textContent);
    assert(
      forbiddenText.includes('403') || forbiddenText.includes('Erişim Yetkisi'),
      'Danışmanın /danismanlar sayfasına doğrudan erişimi 403 ile engellendi.'
    );
    console.log('[BÖLÜM 2] Rol İzolasyonu ve ProtectedRoute 403 Kalkanı BAŞARILI.\n');

    // =========================================================================
    // BÖLÜM 3: MÜŞTERİ PORTALI & AKILLI KÖK (SMART ROOT) MİMARİSİ (AŞAMA 7.1)
    // =========================================================================
    console.log('--- BÖLÜM 3: Müşteri Portalı ve Akıllı Kök (Smart Root) İzolasyonu ---');
    // Yeni ziyaretçi sekmesi
    const pageVisitor = await browser.newPage();
    pageVisitor.on('pageerror', (err) => console.error('[pageVisitor ERROR]:', err.message));
    await pageVisitor.setViewport({ width: 1440, height: 900 });

    // 3A: Oturumsuz ziyaretçi kök adrese (/) girdiğinde müşteri portalı açılmalı
    await pageVisitor.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await pageVisitor.evaluate(() => localStorage.removeItem('emlakpro_session_v1'));
    await pageVisitor.reload({ waitUntil: 'networkidle0' });

    const visitorHeader = await pageVisitor.$('header');
    assert(visitorHeader !== null, 'Ziyaretçiye PortalHeader başarıyla yüklendi.');
    const hasCrmSidebar = await pageVisitor.evaluate(() => Boolean(document.querySelector('aside')));
    assert(!hasCrmSidebar, 'Müşteri portalında CRM Sidebar render EDİLMEDİ (Tam İzolasyon).');

    // 3B: Oturumlu kullanıcı kök adrese (/) girdiğinde CRM Dashboard açılmalı (Akıllı Kök)
    await pageAdmin.bringToFront();
    await pageAdmin.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });
    await pageAdmin.waitForSelector('input[type="email"]', { timeout: 5000 });
    await clearAndType('input[type="email"]', 'kemal@emlakpro.com');
    await clearAndType('input[type="password"]', 'AdminPass2026!');
    const adminLoginBtn = await pageAdmin.$('button[type="submit"]');
    await adminLoginBtn.click();
    await new Promise((r) => setTimeout(r, 600));

    // Kök adrese (/) git ve Smart Root'un CRM Dashboard'u açtığını doğrula
    await pageAdmin.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    const adminHasSidebar = await pageAdmin.evaluate(() => Boolean(document.querySelector('aside')));
    assert(adminHasSidebar, 'Oturumlu kullanıcı kök adreste (/) CRM Dashboard ve Sidebar görüyor (Smart Root).');
    console.log('[BÖLÜM 3] Akıllı Kök (Smart Root) ve Portal İzolasyonu BAŞARILI.\n');

    // =========================================================================
    // BÖLÜM 4: İLAN YAYINLAMA GÜVENLİĞİ & CANLI VİTRİN FİLTRELERİ (AŞAMA 7.2)
    // =========================================================================
    console.log('--- BÖLÜM 4: İlan Yayınlama Güvenliği, Whitelist/Blacklist & Arama ---');
    await pageAdmin.bringToFront();
    // Test portföyleri tanımla
    await pageAdmin.evaluate(() => {
      const sampleProperties = [
        {
          id: 'MASTER-P1',
          title: 'Moda Sahilinde Panoramik 3+1 Daire',
          type: 'Satılık',
          category: 'Daire',
          status: 'Aktif',
          isPublished: true,
          price: 28000000,
          priceFormatted: '₺28.000.000',
          location: 'Kadıköy, İstanbul',
          district: 'Kadıköy',
          neighborhood: 'Moda',
          rooms: '3+1',
          netArea: 170,
          advisor: 'Selin Aydın',
          image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
          gallery: [{ label: 'Ana Görünüm', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800' }],
          contract: { note: 'Gizli CRM verisi' },
          matchedBuyers: [{ id: 'c-1', name: 'Gizli Alıcı' }],
        },
        {
          id: 'MASTER-P2-PASIF',
          title: 'Yayından Kaldırılmış Gizli Portföy',
          type: 'Satılık',
          category: 'Daire',
          status: 'Pasif',
          isPublished: true, // Statü Pasif olduğu için gizlenmeli
          price: 15000000,
          district: 'Kadıköy',
        },
        {
          id: 'MASTER-P3-UNPUBLISHED',
          title: 'Taslak Hazırlıkta İlan',
          type: 'Satılık',
          category: 'Villa',
          status: 'Aktif',
          isPublished: false, // isPublished: false olduğu için KESİNLİKLE gizlenmeli
          price: 45000000,
          district: 'Beykoz',
        },
      ];
      localStorage.setItem('emlakpro_properties_v1', JSON.stringify(sampleProperties));
      window.dispatchEvent(new Event('storage'));
    });

    // Ziyaretçi /ilanlar sayfasına gitsin
    await pageVisitor.bringToFront();
    await pageVisitor.goto(`${BASE_URL}/ilanlar`, { waitUntil: 'networkidle0' });
    await pageVisitor.waitForFunction(
      () => document.body.textContent.includes('Moda Sahilinde Panoramik 3+1 Daire'),
      { timeout: 5000 }
    );
    const portalListingText = await pageVisitor.evaluate(() => document.body.textContent);

    assert(portalListingText.includes('Moda Sahilinde Panoramik 3+1 Daire'), 'Aktif ve yayında olan ilan (MASTER-P1) listelendi.');
    assert(!portalListingText.includes('Yayından Kaldırılmış Gizli Portföy'), 'GÜVENLİK: Pasif ilan (MASTER-P2-PASIF) KESİNLİKLE listelenmedi.');
    assert(!portalListingText.includes('Taslak Hazırlıkta İlan'), 'GÜVENLİK: isPublished: false olan ilan (MASTER-P3-UNPUBLISHED) KESİNLİKLE listelenmedi.');
    assert(!portalListingText.includes('Gizli CRM verisi'), 'GÜVENLİK: CRM operasyonel verileri (contract) portal kartlarına sızdırılmıyor.');
    console.log('[BÖLÜM 4] İlan Yayınlama Güvenliği ve Whitelist/Blacklist Kalkanı BAŞARILI.\n');

    // =========================================================================
    // BÖLÜM 5: İLAN DETAY SAYFASI, GALERİ & DANIŞMAN İLETİŞİM HATLARI (AŞAMA 7.3)
    // =========================================================================
    console.log('--- BÖLÜM 5: İlan Detay Ekranı, Lightbox & WhatsApp Entegrasyonu ---');
    await pageVisitor.bringToFront();
    await pageVisitor.goto(`${BASE_URL}/ilanlar/MASTER-P1`, { waitUntil: 'networkidle0' });

    const detailTitle = await pageVisitor.evaluate(() => {
      return document.querySelector('h1')?.textContent || '';
    });
    assert(detailTitle.includes('Moda Sahilinde Panoramik 3+1 Daire'), 'İlan başlığı detay sayfasında görüntülendi.');

    // Danışman kartı telefon ve WhatsApp bağlantısı
    const contactLinks = await pageVisitor.evaluate(() => {
      const wa = document.querySelector('a[href*="wa.me"]')?.getAttribute('href') || '';
      const tel = document.querySelector('a[href*="tel:"]')?.getAttribute('href') || '';
      return { wa, tel };
    });
    assert(contactLinks.wa.includes('MASTER-P1'), 'WhatsApp doğrudan mesaj bağlantısı ilan ID kodunu içeriyor.');
    assert(contactLinks.tel.startsWith('tel:'), 'Telefon bağlantısı geçerli tel: protokolünü kullanıyor.');

    // Pasif ilanın detayına doğrudan erişilmeye çalışıldığında 404 engeli
    await pageVisitor.goto(`${BASE_URL}/ilanlar/MASTER-P2-PASIF`, { waitUntil: 'networkidle0' });
    const notFoundText = await pageVisitor.evaluate(() => document.body.textContent);
    assert(notFoundText.includes('İlan Bulunamadı veya Yayından Kaldırıldı'), 'Pasif ilanın detayına girildiğinde 404 Bulunamadı ekranı devreye girdi.');
    console.log('[BÖLÜM 5] İlan Detay Ekranı ve Yayın Güvenliği Kalkanı BAŞARILI.\n');

    // =========================================================================
    // BÖLÜM 6: FORM ENTEGRASYONU, CANLI EŞLEŞTİRME & MÜKERRER MÜŞTERİ (AŞAMA 7.4)
    // =========================================================================
    console.log('--- BÖLÜM 6: Talep Formu, Mükerrer Müşteri Koruma & Görev Entegrasyonu ---');
    await pageVisitor.bringToFront();
    await pageVisitor.goto(`${BASE_URL}/talep-birak`, { waitUntil: 'networkidle0' });

    // Talep formunu doldur
    await pageVisitor.waitForSelector('input[name="name"]', { timeout: 5000 });
    await pageVisitor.type('input[name="name"]', 'Hakan Yıldız');
    await pageVisitor.type('input[name="phone"]', '05301112233');
    await pageVisitor.type('input[name="district"]', 'Kadıköy');
    await pageVisitor.type('input[name="minBudget"]', '20000000');
    await pageVisitor.type('input[name="maxBudget"]', '35000000');
    await pageVisitor.click('input[name="kvkkConsent"]');

    const demandSubmitBtn = await pageVisitor.$('button[type="submit"]');
    await demandSubmitBtn.click();
    await pageVisitor.waitForSelector('[data-testid="demand-success-state"]', { timeout: 3000 });

    // Talebin localStorage'a yazıldığını ve portföy eşleştirme skoru ürettiğini doğrula
    const demandAudit = await pageVisitor.evaluate(() => {
      const reqs = JSON.parse(localStorage.getItem('emlakpro_requests_v1') || '[]');
      const custs = JSON.parse(localStorage.getItem('emlakpro_customers_v1') || '[]');
      const firstR = reqs[0];
      return {
        reqCount: reqs.length,
        custCount: custs.length,
        clientName: firstR?.clientName,
        overallScore: firstR?.overallScore,
        hasMatches: firstR?.matchedProperties?.length > 0,
        customerId: firstR?.customerId,
      };
    });

    assert(demandAudit.reqCount >= 1, 'Yeni talep emlakpro_requests_v1 koleksiyonuna işlendi.');
    assert(demandAudit.clientName === 'Hakan Yıldız', 'Müşteri adı "Hakan Yıldız" olarak kaydedildi.');
    assert(demandAudit.overallScore > 0, `Akıllı portföy eşleştirme motoru anında skor üretti (Skor: %${demandAudit.overallScore}).`);
    assert(demandAudit.hasMatches, 'Uyumlu portföy (#MASTER-P1) taleple anında eşleştirildi.');

    // Mükerrer kontrolü: Aynı telefonla ikinci kez talep gönderildiğinde yeni müşteri oluşturulmamalı
    await pageVisitor.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Yeni Bir Talep Bırak')
      );
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 200));

    await pageVisitor.waitForSelector('input[name="name"]', { timeout: 3000 });
    await pageVisitor.type('input[name="name"]', 'Hakan Yıldız');
    await pageVisitor.type('input[name="phone"]', '05301112233'); // Aynı numara
    await pageVisitor.click('input[name="kvkkConsent"]');
    const demandSubmitBtn2 = await pageVisitor.$('button[type="submit"]');
    await demandSubmitBtn2.click();
    await pageVisitor.waitForSelector('[data-testid="demand-success-state"]', { timeout: 3000 });

    const custCountAfter = await pageVisitor.evaluate(() => {
      const custs = JSON.parse(localStorage.getItem('emlakpro_customers_v1') || '[]');
      return custs.length;
    });
    assert(custCountAfter === demandAudit.custCount, 'Mükerrer telefon numarasında yeni müşteri OLUŞTURULMADI.');
    console.log('[BÖLÜM 6] Talep Kaydı, Anlık Eşleştirme ve Mükerrer Müşteri Koruması BAŞARILI.\n');

    // =========================================================================
    // BÖLÜM 7: ÇİFT YÖNLÜ CANLI SEKME SENKRONİZASYONU (AŞAMA 7.5 FİNAL)
    // =========================================================================
    console.log('--- BÖLÜM 7: Çift Yönlü Eşzamanlı Sekme Senkronizasyonu (Zero Reload) ---');
    // Sayfa 1 (Sol): Ziyaretçi Portalı (/ilanlar)
    await pageVisitor.bringToFront();
    await pageVisitor.goto(`${BASE_URL}/ilanlar`, { waitUntil: 'networkidle0' });

    // Sayfa 2 (Sağ): CRM Paneli (/gayrimenkuller)
    await pageAdmin.bringToFront();
    await pageAdmin.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0' });

    // 7A: CRM'den yeni portföy eklendiğinde Portal Sayfa 1'de SAYFA YENİLENMEDEN belirmeli
    console.log('  -> Simülasyon 7A: CRM yeni ilan yayına alıyor...');
    await pageAdmin.evaluate(() => {
      const current = JSON.parse(localStorage.getItem('emlakpro_properties_v1') || '[]');
      const newLiveProp = {
        id: 'LIVE-SYNC-P1',
        title: 'Canlı Senkronize Edilen Beşiktaş Lüks Rezidans',
        type: 'Satılık',
        category: 'Daire',
        status: 'Aktif',
        isPublished: true,
        price: 36000000,
        priceFormatted: '₺36.000.000',
        district: 'Beşiktaş',
        location: 'Beşiktaş, İstanbul',
        rooms: '4+1',
        netArea: 210,
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      };
      localStorage.setItem('emlakpro_properties_v1', JSON.stringify([newLiveProp, ...current]));
      // Tarayıcı storage event tetikler
    });

    // Sayfa 1'in (Portal) reload YAPMADAN yeni ilanı render etmesini bekle
    await pageVisitor.bringToFront();
    await pageVisitor.waitForFunction(
      () => document.body.textContent.includes('Canlı Senkronize Edilen Beşiktaş Lüks Rezidans'),
      { timeout: 4000 }
    );
    console.log('  ✓ [CRM -> Portal]: CRM\'de eklenen ilan Müşteri Portalında SAYFA YENİLENMEDEN anında belirdi.');

    // 7B: CRM'de ilan pasife alındığında Portal Sayfa 1'den SAYFA YENİLENMEDEN kaybolmalı
    console.log('  -> Simülasyon 7B: CRM ilanı pasife alıyor...');
    await pageAdmin.bringToFront();
    await pageAdmin.evaluate(() => {
      const current = JSON.parse(localStorage.getItem('emlakpro_properties_v1') || '[]');
      const updated = current.map((p) =>
        p.id === 'LIVE-SYNC-P1' ? { ...p, status: 'Pasif' } : p
      );
      localStorage.setItem('emlakpro_properties_v1', JSON.stringify(updated));
    });

    // Sayfa 1'in (Portal) reload yapmadan ilanı gizlemesini bekle
    await pageVisitor.bringToFront();
    await pageVisitor.waitForFunction(
      () => !document.body.textContent.includes('Canlı Senkronize Edilen Beşiktaş Lüks Rezidans'),
      { timeout: 4000 }
    );
    console.log('  ✓ [CRM -> Portal]: Pasife alınan ilan Müşteri Portalından SAYFA YENİLENMEDEN anında kaldırıldı.');

    // 7C: Ziyaretçi ilanın detayındayken ilan yayından kaldırılırsa anında 404 ekranına düşmeli
    console.log('  -> Simülasyon 7C: İlan detay sayfasındayken yayından kaldırma kalkanı...');
    await pageVisitor.bringToFront();
    await pageVisitor.goto(`${BASE_URL}/ilanlar/MASTER-P1`, { waitUntil: 'networkidle0' });
    const isShowingDetail = await pageVisitor.evaluate(() => document.body.textContent.includes('Moda Sahilinde'));
    assert(isShowingDetail, 'Ziyaretçi şu anda #MASTER-P1 detay sayfasında.');

    // CRM ilanın yayınını durdurur
    await pageAdmin.bringToFront();
    await pageAdmin.evaluate(() => {
      const current = JSON.parse(localStorage.getItem('emlakpro_properties_v1') || '[]');
      const updated = current.map((p) =>
        p.id === 'MASTER-P1' ? { ...p, isPublished: false } : p
      );
      localStorage.setItem('emlakpro_properties_v1', JSON.stringify(updated));
    });

    // Sayfa 1'in anında 404 ekranına düşmesini bekle
    await pageVisitor.bringToFront();
    await pageVisitor.waitForFunction(
      () => document.body.textContent.includes('İlan Bulunamadı veya Yayından Kaldırıldı'),
      { timeout: 4000 }
    );
    console.log('  ✓ [CRM -> Portal Detay]: Yayından kaldırılan ilan detay sayfasında ANINDA 404 kalkanı devreye girdi.');

    // 7D: Portaldan yeni talep bırakıldığında CRM /talepler sayfasında anında görünmeli
    console.log('  -> Simülasyon 7D: Portal talep bırakıyor -> CRM anında alıyor...');
    await pageAdmin.bringToFront();
    await pageAdmin.goto(`${BASE_URL}/talepler`, { waitUntil: 'networkidle0' });
    await pageVisitor.bringToFront();
    await pageVisitor.goto(`${BASE_URL}/talep-birak`, { waitUntil: 'networkidle0' });
    await pageVisitor.waitForSelector('input[name="name"]', { timeout: 4000 });

    await pageVisitor.type('input[name="name"]', 'Mert Eren');
    await pageVisitor.type('input[name="phone"]', '05419990011');
    await pageVisitor.click('input[name="kvkkConsent"]');
    const submitBtnD = await pageVisitor.$('button[type="submit"]');
    await submitBtnD.click();
    await pageVisitor.waitForSelector('[data-testid="demand-success-state"]', { timeout: 3000 });

    // Sayfa 2'de (CRM) yeni talebin belirmesini bekle
    await pageAdmin.bringToFront();
    await pageAdmin.waitForFunction(
      () => document.body.textContent.includes('Mert Eren'),
      { timeout: 4000 }
    );
    console.log('  ✓ [Portal -> CRM]: Portaldan iletilen talep CRM Talepler ekranında SAYFA YENİLENMEDEN anında belirdi.');
    console.log('[BÖLÜM 7] Çift Yönlü Eşzamanlı Sekme Senkronizasyonu %100 BAŞARILI.\n');

    // =========================================================================
    // BÖLÜM 8: ÇOKLU CİHAZ VE RESPONSIVE TAŞMA KONTROLÜ
    // =========================================================================
    console.log('--- BÖLÜM 8: Çoklu Cihaz ve Responsive Taşma Kontrolü ---');
    await pageVisitor.bringToFront();
    await pageVisitor.evaluate(() => localStorage.removeItem('emlakpro_session_v1'));
    const viewports = [
      { name: 'Mobil (375x667)', width: 375, height: 667 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Masaüstü (1440x900)', width: 1440, height: 900 },
    ];

    const testUrls = ['/', '/ilanlar', '/talep-birak', '/iletisim'];
    for (const vp of viewports) {
      await pageVisitor.setViewport({ width: vp.width, height: vp.height });
      for (const path of testUrls) {
        await pageVisitor.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle0' });
        const hasScroll = await pageVisitor.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        assert(!hasScroll, `${vp.name} ekranında ${path} sayfasında yatay taşma YOK.`);
      }
    }
    console.log('[BÖLÜM 8] Çoklu Cihaz Responsive Uyum Kontrolleri BAŞARILI.\n');

    console.log('========================================================================');
    console.log('🎉 TEBRİKLER! TÜM AŞAMALARI (1-7) KAPSAYAN MASTER TEST EKSİKSİZ TAMAMLANDI!');
    console.log('========================================================================\n');
  } catch (err) {
    console.error('❌ Master Test sırasında hata:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runMasterTest();
