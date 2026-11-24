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

async function runPortalTests() {
  console.log('================================================================');
  console.log('🚀 Aşama 7.1: Müşteri Portalı Rota ve Layout Altyapısı Testi');
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
    // TEST 1: Oturum Açmamış Ziyaretçi Kök Rota ('/') -> Müşteri Portalı
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Ziyaretçi Kök Rota (/) Kontrolü ---');
    await page.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });
    // Oturumu tamamen temizle
    await page.evaluate(() => localStorage.removeItem('emlakpro_session_v1'));
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

    const currentUrl = page.url();
    assert(currentUrl.endsWith('/'), `Kök rota korundu (URL: ${currentUrl})`);

    const portalHeaderPresent = await page.evaluate(() => {
      const header = document.querySelector('header');
      return header && header.textContent.includes('EmlakPro') && header.textContent.includes('Danışman Girişi');
    });
    assert(portalHeaderPresent, 'Ziyaretçi PortalHeader bileşeni başarıyla görüntülendi');

    const portalHeroTitle = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent : '';
    });
    assert(
      portalHeroTitle.includes('Hayalinizdeki Yaşam Alanını'),
      `PortalHomePage ana başlığı başarıyla yüklendi: "${portalHeroTitle}"`
    );

    const isCrmSidebarAbsent = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      return aside === null;
    });
    assert(isCrmSidebarAbsent, 'Müşteri portalında CRM Sidebar (aside) render EDİLMEDİ (İzolasyon tam)');

    const isPortalFooterPresent = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      return footer && footer.textContent.includes('EmlakPro Real Estate OS');
    });
    assert(isPortalFooterPresent, 'PortalFooter kurumsal altbilgi bileşeni başarıyla render edildi');

    // -------------------------------------------------------------------------
    // TEST 2: Halka Açık Portal Sayfaları (/ilanlar, /ilanlar/:id, /iletisim, /talep-birak)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Halka Açık Müşteri Portalı Rotaları ---');

    // /ilanlar
    await page.goto(`${BASE_URL}/ilanlar`, { waitUntil: 'networkidle0' });
    const listingsTitle = await page.evaluate(() => document.querySelector('h1')?.textContent || '');
    assert(
      listingsTitle.includes('Gayrimenkul Portföyümüz'),
      `/ilanlar rotası oturumsuz açıldı ve başlık doğrulandı: "${listingsTitle}"`
    );
    const noSidebarOnListings = await page.evaluate(() => document.querySelector('aside') === null);
    assert(noSidebarOnListings, '/ilanlar sayfasında CRM Sidebar bulunmuyor');

    // /ilanlar/:id
    await page.goto(`${BASE_URL}/ilanlar/prop-test-777`, { waitUntil: 'networkidle0' });
    const detailText = await page.evaluate(() => document.body.textContent);
    assert(
      detailText.includes('İlan Referans No: prop-test-777') && detailText.includes('İlan Detay Görünümü'),
      '/ilanlar/:id dinamik parametreli rotası oturumsuz açıldı ve parametreyi okudu'
    );

    // /iletisim
    await page.goto(`${BASE_URL}/iletisim`, { waitUntil: 'networkidle0' });
    const contactTitle = await page.evaluate(() => document.querySelector('h1')?.textContent || '');
    assert(
      contactTitle.includes('İletişim ve Ofis Bilgilerimiz'),
      `/iletisim sayfası oturumsuz açıldı ve başlık doğrulandı: "${contactTitle}"`
    );

    // /talep-birak
    await page.goto(`${BASE_URL}/talep-birak`, { waitUntil: 'networkidle0' });
    const demandTitle = await page.evaluate(() => document.querySelector('h1')?.textContent || '');
    assert(
      demandTitle.includes('Gayrimenkul Arama Talebi Bırakın'),
      `/talep-birak sayfası oturumsuz açıldı ve başlık doğrulandı: "${demandTitle}"`
    );

    // -------------------------------------------------------------------------
    // TEST 3: Korunan CRM Rotasına Yetkisiz Erişim (/musteriler -> /giris)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Oturumsuz Ziyaretçinin CRM Rotasına Erişimi ---');
    await page.goto(`${BASE_URL}/musteriler`, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => window.location.pathname === '/giris');
    assert(
      page.url().includes('/giris'),
      'Oturumsuz kullanıcı /musteriler rotasına gittiğinde otomatik /giris sayfasına yönlendirildi'
    );

    // -------------------------------------------------------------------------
    // TEST 4: Giriş Yapma ve Akıllı Kök Rotasının (Smart Root) CRM'e Geçişi
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Yönetici Girişi ve Akıllı Kök (Smart Root) Doğrulaması ---');

    // Test için geçerli bir admin kullanıcısı oluştur ve doğrudan oturum başlat
    await page.evaluate(() => {
      const testAdmin = {
        id: 'usr_admin_portal_test',
        name: 'Kerem Yılmaz (Broker)',
        email: 'broker@emlakpro.com',
        phone: '0532 100 2030',
        role: 'admin',
        title: 'Kurucu Broker',
        displayRole: 'Yönetici (Broker)',
        status: 'active',
        passwordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // dummy sha256
        createdAt: new Date().toISOString(),
      };

      const settings = JSON.parse(localStorage.getItem('emlakpro_settings_v1') || '{}');
      const users = settings.users || [];
      const existingIdx = users.findIndex((u) => u.email === testAdmin.email);
      if (existingIdx >= 0) {
        users[existingIdx] = testAdmin;
      } else {
        users.push(testAdmin);
      }
      settings.users = users;
      localStorage.setItem('emlakpro_settings_v1', JSON.stringify(settings));

      // Oturumu başlat
      localStorage.setItem(
        'emlakpro_session_v1',
        JSON.stringify({
          userId: testAdmin.id,
          email: testAdmin.email,
          name: testAdmin.name,
          role: testAdmin.role,
          title: testAdmin.title,
          displayRole: testAdmin.displayRole,
          loginTime: new Date().toISOString(),
        })
      );
    });

    // Oturum açıkken kök rotaya ('/') git
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('aside', { timeout: 5000 });

    const crmSidebarPresent = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      return aside !== null && aside.textContent.includes('EmlakPro');
    });
    assert(crmSidebarPresent, 'Oturum açıkken kök rota (/) CRM Sidebar içeren AppLayout açtı (Smart Root)');

    const crmDashboardPresent = await page.evaluate(() => {
      return (
        document.body.textContent.includes('Dashboard') ||
        document.body.textContent.includes('Portföy') ||
        document.body.textContent.includes('Gayrimenkul')
      );
    });
    assert(crmDashboardPresent, 'CRM Dashboard bileşenleri başarıyla yüklendi');

    // -------------------------------------------------------------------------
    // TEST 5: Oturumlu Kullanıcının Portal Sayfasını Ziyareti & CRM Dönüş Rozeti
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Oturumlu Kullanıcının Portal Vitrinini İncelemesi ---');
    await page.goto(`${BASE_URL}/ilanlar`, { waitUntil: 'networkidle0' });

    const crmBadgePresent = await page.evaluate(() => {
      const header = document.querySelector('header');
      return (
        header &&
        (header.textContent.includes('CRM Paneli') || header.textContent.includes('Yönetici'))
      );
    });
    assert(crmBadgePresent, 'PortalHeader oturumlu kullanıcıya "CRM Paneli" rozeti/bağlantısı gösterdi');

    // -------------------------------------------------------------------------
    // TEST 6: Danışman Rolü ile Akıllı Rota & Yetki İzolasyonu
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Danışman Rolü Oturumu & İzolasyon ---');
    await page.evaluate(() => {
      const testConsultant = {
        id: 'usr_consultant_portal_test',
        name: 'Zeynep Kaya',
        email: 'zeynep@emlakpro.com',
        phone: '0544 200 3040',
        role: 'consultant',
        title: 'Gayrimenkul Danışmanı',
        displayRole: 'Danışman',
        status: 'active',
        passwordHash: 'dummy',
        createdAt: new Date().toISOString(),
      };

      const settings = JSON.parse(localStorage.getItem('emlakpro_settings_v1') || '{}');
      const users = settings.users || [];
      const existingIdx = users.findIndex((u) => u.email === testConsultant.email);
      if (existingIdx >= 0) {
        users[existingIdx] = testConsultant;
      } else {
        users.push(testConsultant);
      }
      settings.users = users;
      localStorage.setItem('emlakpro_settings_v1', JSON.stringify(settings));

      // Oturumu danışman olarak güncelle
      localStorage.setItem(
        'emlakpro_session_v1',
        JSON.stringify({
          userId: testConsultant.id,
          email: testConsultant.email,
          name: testConsultant.name,
          role: testConsultant.role,
          title: testConsultant.title,
          displayRole: testConsultant.displayRole,
          loginTime: new Date().toISOString(),
        })
      );
    });

    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('aside', { timeout: 5000 });
    const consultantAtRoot = await page.evaluate(() => document.querySelector('aside') !== null);
    assert(consultantAtRoot, 'Danışman rolü kök rotada CRM Dashboard görüyor');

    // Danışman /danismanlar rotasına giderse 403 almalı
    await page.goto(`${BASE_URL}/danismanlar`, { waitUntil: 'networkidle0' });
    const has403 = await page.evaluate(() =>
      document.body.textContent.includes('Yetkisiz Erişim') || document.body.textContent.includes('403')
    );
    assert(has403, 'Danışman /danismanlar sayfasına erişmeye çalıştığında 403 Yetkisiz Erişim aldı');

    // -------------------------------------------------------------------------
    // TEST 7: Çıkış Yapma (Logout) -> Müşteri Portalına Yönlendirme
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 7: Çıkış Yapma ve Portala Dönüş ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('header button[title="Çıkış Yap"]', { timeout: 5000 });

    // Header üzerinden çıkış butonunu tıkla
    await page.evaluate(() => {
      const logoutBtn = document.querySelector('header button[title="Çıkış Yap"]');
      if (logoutBtn) logoutBtn.click();
    });

    // Oturumun temizlenmesini ve portala dönülmesini bekle
    await page.waitForFunction(() => {
      const session = localStorage.getItem('emlakpro_session_v1');
      return !session && window.location.pathname === '/';
    });

    const isSessionCleared = await page.evaluate(() => localStorage.getItem('emlakpro_session_v1') === null);
    assert(isSessionCleared, 'Çıkış yapıldığında oturum (localStorage) başarıyla temizlendi');

    // PortalHomePage lazy chunk'ının yüklenmesini bekle
    await page.waitForFunction(
      () => {
        const aside = document.querySelector('aside');
        const h1 = document.querySelector('h1');
        return aside === null && h1 && h1.textContent.includes('Hayalinizdeki Yaşam Alanını');
      },
      { timeout: 5000 }
    );
    assert(true, 'Çıkış yapan kullanıcı anında müşteri portalı ana sayfasına yönlendirildi');

    // -------------------------------------------------------------------------
    // TEST 8: Duyarlılık (Responsive) & Taşma Kontrolleri
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 8: Duyarlılık ve Taşma Kontrolleri ---');
    const viewports = [
      { name: 'Mobil (375x667)', width: 375, height: 667 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Masaüstü (1440x900)', width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      assert(!hasHorizontalScroll, `${vp.name}: Yatay taşma (horizontal scroll) YOK`);

      if (vp.width <= 768) {
        // Mobil hamburger menü butonu görünür mü?
        const hamburgerVisible = await page.evaluate(() => {
          const btn = document.querySelector('header button[aria-label="Menüyü Aç"]');
          return btn !== null;
        });
        assert(hamburgerVisible, `${vp.name}: Mobil hamburger menü butonu mevcut`);

        if (vp.width === 375) {
          // Mobil çekmecenin açılıp kapandığını doğrula
          await page.click('header button[aria-label="Menüyü Aç"]');
          await page.waitForSelector('header nav.flex-col', { timeout: 2000 });
          const isDrawerOpen = await page.evaluate(() => {
            const drawerLink = document.querySelector('header nav.flex-col a');
            return drawerLink !== null;
          });
          assert(isDrawerOpen, 'Mobil menü çekmecesi başarıyla açıldı');

          // Escape tuşuna basarak kapat
          await page.keyboard.press('Escape');
          await new Promise((r) => setTimeout(r, 200));
          const isDrawerClosed = await page.evaluate(() => document.querySelector('header nav.flex-col') === null);
          assert(isDrawerClosed, 'Escape tuşu ile mobil menü başarıyla kapatıldı');
        }
      }
    }

    console.log('\n================================================================');
    console.log('🎉 TÜM AŞAMA 7.1 TESTLERİ BAŞARIYLA TAMAMLANDI! (8/8 Test Passed)');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ Test sırasında beklenmeyen hata:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runPortalTests();
