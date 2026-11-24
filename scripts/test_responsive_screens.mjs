import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

const VIEWPORTS = [
  { name: 'Mobil (375px - iPhone SE)', width: 375, height: 667 },
  { name: 'Mobil (390px - iPhone 13/14)', width: 390, height: 844 },
  { name: 'Tablet (768px - iPad)', width: 768, height: 1024 },
  { name: 'Küçük Laptop (1024px)', width: 1024, height: 768 },
  { name: 'Desktop (1440px)', width: 1440, height: 900 },
];

const SCREENS = [
  { id: 'screen-1', name: 'Dashboard', path: '/' },
  { id: 'screen-2', name: 'Müşteriler', path: '/musteriler' },
  { id: 'screen-3', name: 'Gayrimenkuller', path: '/gayrimenkuller' },
  { id: 'screen-4', name: 'Talepler', path: '/talepler' },
  { id: 'screen-5', name: 'Satış ve Kiralama', path: '/satis-ve-kiralama' },
  { id: 'screen-6', name: 'Görevler ve Randevular', path: '/gorevler-ve-randevular' },
  { id: 'screen-7', name: 'Raporlar', path: '/raporlar' },
  { id: 'screen-8', name: 'Ayarlar', path: '/ayarlar' },
];

async function runTests() {
  console.log('🚀 EmlakPro Responsive Test Başlatılıyor...');
  console.log(`Tarayıcı: ${CHROME_PATH}`);
  console.log(`Hedef URL: ${BASE_URL}\n`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  const results = [];
  let allPassed = true;

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n========================================`);
      console.log(`📱 Test Edilen Çözünürlük: ${vp.name} (${vp.width}x${vp.height})`);
      console.log(`========================================`);

      await page.setViewport({ width: vp.width, height: vp.height });

      for (const screen of SCREENS) {
        const url = `${BASE_URL}${screen.path}`;
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
        await new Promise((r) => setTimeout(r, 600));

        // 1. Yatay Taşma Kontrolü (scrollWidth <= innerWidth)
        const overflowCheck = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
          const clientWidth = window.innerWidth;
          const diff = scrollWidth - clientWidth;

          // Hangi elementin taştığını bulma (varsa)
          let offendingElement = null;
          if (diff > 1) {
            const allElements = document.querySelectorAll('*');
            for (const el of allElements) {
              const rect = el.getBoundingClientRect();
              if (rect.right > clientWidth + 2) {
                offendingElement = {
                  tag: el.tagName,
                  className: (el.className || '').toString().slice(0, 80),
                  right: Math.round(rect.right),
                  expectedMax: clientWidth,
                };
                break;
              }
            }
          }

          return {
            scrollWidth,
            clientWidth,
            diff,
            hasOverflow: diff > 1.5,
            offendingElement,
          };
        });

        const pass = !overflowCheck.hasOverflow;
        if (!pass) allPassed = false;

        const resultObj = {
          viewport: vp.name,
          width: vp.width,
          screen: screen.name,
          path: screen.path,
          scrollWidth: overflowCheck.scrollWidth,
          clientWidth: overflowCheck.clientWidth,
          diff: overflowCheck.diff,
          passed: pass,
          offender: overflowCheck.offendingElement,
        };
        results.push(resultObj);

        if (pass) {
          console.log(`  ✓ [${screen.name}] Yatay taşma yok (Genişlik: ${overflowCheck.clientWidth}px, Scroll: ${overflowCheck.scrollWidth}px)`);
        } else {
          console.error(`  ✗ [${screen.name}] YATAY TAŞMA TESPİT EDİLDİ! Fark: +${overflowCheck.diff}px (Element: ${JSON.stringify(overflowCheck.offendingElement)})`);
        }
      }
    }

    // INTERACTIVE TESTS: Mobil 375px'te Özel Bileşen Davranışları
    console.log(`\n========================================`);
    console.log(`🧪 Mobil Özel Bileşen ve Etkileşim Testleri (375px)`);
    console.log(`========================================`);

    await page.setViewport({ width: 375, height: 667 });

    // Test 1: Mobil Sidebar Açılma, Escape ile Kapanma ve Backdrop ile Kapanma
    console.log('\n--- 1. Mobil Sidebar Drawer & Dismiss Testi ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));

    // Hamburger butonunu bul ve tıkla
    const hamburgerBtn = await page.$('button[aria-label="Menüyü Aç"]');
    if (hamburgerBtn) {
      await hamburgerBtn.click();
      await new Promise((r) => setTimeout(r, 400));

      const isSidebarOpen = await page.evaluate(() => {
        const aside = document.querySelector('aside');
        const style = window.getComputedStyle(aside);
        return !style.transform.includes('-260') && !style.transform.includes('matrix(1, 0, 0, 1, -');
      });
      console.log(`  Mobil Hamburger Açılışı: ${isSidebarOpen ? '✓ Açık' : '✗ Başarısız'}`);

      // Escape tuşuna bas
      await page.keyboard.press('Escape');
      await new Promise((r) => setTimeout(r, 400));

      const isSidebarClosedEscape = await page.evaluate(() => {
        const aside = document.querySelector('aside');
        const style = window.getComputedStyle(aside);
        return style.transform.includes('-260') || style.transform.includes('matrix(1, 0, 0, 1, -');
      });
      console.log(`  Escape Tuşu ile Kapanma: ${isSidebarClosedEscape ? '✓ Kapandı' : '✗ Kapanmadı'}`);

      // Yeniden aç ve backdrop tıkla
      await hamburgerBtn.click();
      await new Promise((r) => setTimeout(r, 400));

      const backdrop = await page.$('.bg-primary\\/40');
      if (backdrop) {
        await backdrop.click();
        await new Promise((r) => setTimeout(r, 400));

        const isSidebarClosedBackdrop = await page.evaluate(() => {
          const aside = document.querySelector('aside');
          const style = window.getComputedStyle(aside);
          return style.transform.includes('-260') || style.transform.includes('matrix(1, 0, 0, 1, -');
        });
        console.log(`  Backdrop Tıklaması ile Kapanma: ${isSidebarClosedBackdrop ? '✓ Kapandı' : '✗ Kapanmadı'}`);
      }
    } else {
      console.error('  ✗ Hamburger butonu bulunamadı!');
      allPassed = false;
    }

    // Test 2: Müşteriler Mobil Kart Görünümü Testi
    console.log('\n--- 2. Müşteri Tablosu -> Mobil Kart Dönüşüm Testi ---');
    await page.goto(`${BASE_URL}/musteriler`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));

    const customerCardCheck = await page.evaluate(() => {
      const mobileCards = document.querySelector('.md\\:hidden');
      const desktopTable = document.querySelector('.hidden.md\\:block');
      const mobileVisible = mobileCards ? window.getComputedStyle(mobileCards).display !== 'none' : false;
      const desktopHidden = desktopTable ? window.getComputedStyle(desktopTable).display === 'none' : false;
      return { mobileVisible, desktopHidden };
    });
    console.log(`  Müşteriler Mobilde: Kart Görünümü Aktif: ${customerCardCheck.mobileVisible ? '✓' : '✗'}, Masaüstü Tablo Gizli: ${customerCardCheck.desktopHidden ? '✓' : '✗'}`);
    if (!customerCardCheck.mobileVisible || !customerCardCheck.desktopHidden) allPassed = false;

    // Test 3: Gayrimenkuller Mobilde Tek Sütun Grid Testi
    console.log('\n--- 3. Gayrimenkul Kartları Tek Sütun Izgara Testi ---');
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));

    const propertyGridCheck = await page.evaluate(() => {
      const grid = document.querySelector('.grid.grid-cols-1');
      if (!grid) return { hasGrid: false };
      const style = window.getComputedStyle(grid);
      const cols = style.gridTemplateColumns ? style.gridTemplateColumns.split(' ').length : 1;
      return { hasGrid: true, cols };
    });
    console.log(`  Gayrimenkul Kartları Mobilde Tek Sütun (grid-cols-1): ${propertyGridCheck.cols === 1 ? '✓ (1 Sütun)' : `✗ (${propertyGridCheck.cols} Sütun)`}`);
    if (propertyGridCheck.cols !== 1) allPassed = false;

    // Test 4: Kanban Panosu Mobil Aşama Navigatörü Testi
    console.log('\n--- 4. Fırsatlar & Kanban Mobil Aşama Gezgini Testi ---');
    await page.goto(`${BASE_URL}/satis-ve-kiralama`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));

    const kanbanNavCheck = await page.evaluate(() => {
      const stagePills = document.querySelectorAll('.md\\:hidden button');
      return {
        hasStagePills: stagePills.length >= 8,
        pillCount: stagePills.length,
      };
    });
    console.log(`  Kanban 8 Aşama Mobil Hızlı Erişim Hapları: ${kanbanNavCheck.hasStagePills ? `✓ (${kanbanNavCheck.pillCount} Aşama)` : `✗ (${kanbanNavCheck.pillCount} Bulundu)`}`);
    if (!kanbanNavCheck.hasStagePills) allPassed = false;

    // Test 5: Takvim / Randevular Taşma Koruması Testi
    console.log('\n--- 5. Takvim & Randevu Görünümleri Taşma Koruması ---');
    await page.goto(`${BASE_URL}/gorevler-ve-randevular`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));

    const calendarCheck = await page.evaluate(() => {
      const docEl = document.documentElement;
      const scrollWidth = docEl.scrollWidth;
      const clientWidth = window.innerWidth;
      const overflowContainer = document.querySelector('.overflow-x-auto');
      return {
        docScrollWidth: scrollWidth,
        clientWidth,
        hasOverflowContainer: !!overflowContainer,
        noPageBlowout: scrollWidth <= clientWidth + 1,
      };
    });
    console.log(`  Haftalık Takvim Matrisi Sayfayı Taşırıyor mu?: ${calendarCheck.noPageBlowout ? '✓ Hayır (Sayfa genişliği korundu)' : '✗ Evet (Taşma var)'}`);
    console.log(`  İç Kaydırma Alanı (.overflow-x-auto) Mevcut mu?: ${calendarCheck.hasOverflowContainer ? '✓ Evet' : '✗ Hayır'}`);
    if (!calendarCheck.noPageBlowout) allPassed = false;

    // Test 6: Raporlar Son İşlemler Tablosu Mobil Kart Dönüşümü
    console.log('\n--- 6. Raporlar Son İşlemler Mobil Kart Görünümü Testi ---');
    await page.goto(`${BASE_URL}/raporlar`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));

    const reportsTxCheck = await page.evaluate(() => {
      const mobileCards = document.querySelector('.md\\:hidden');
      const desktopTable = document.querySelector('.hidden.md\\:block');
      const mobileVisible = mobileCards ? window.getComputedStyle(mobileCards).display !== 'none' : false;
      const desktopHidden = desktopTable ? window.getComputedStyle(desktopTable).display === 'none' : false;
      return { mobileVisible, desktopHidden };
    });
    console.log(`  Son İşlemler Mobilde: Kart Görünümü Aktif: ${reportsTxCheck.mobileVisible ? '✓' : '✗'}, Masaüstü Tablo Gizli: ${reportsTxCheck.desktopHidden ? '✓' : '✗'}`);
    if (!reportsTxCheck.mobileVisible || !reportsTxCheck.desktopHidden) allPassed = false;

    // Test 7: Ayarlar Yatay Kaydırılabilir Sekmeler Testi
    console.log('\n--- 7. Ayarlar Ekranı Mobil Yatay Sekme Testi ---');
    await page.goto(`${BASE_URL}/ayarlar`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));

    const settingsTabCheck = await page.evaluate(() => {
      const tabContainer = document.querySelector('.overflow-x-auto');
      const tabs = tabContainer ? tabContainer.querySelectorAll('button') : [];
      return {
        hasScrollableTabs: !!tabContainer,
        tabCount: tabs.length,
      };
    });
    console.log(`  Ayarlar Mobil Yatay Sekmeler: ${settingsTabCheck.tabCount >= 8 ? `✓ (${settingsTabCheck.tabCount} Sekme)` : `✗ (${settingsTabCheck.tabCount} Bulundu)`}`);
    if (settingsTabCheck.tabCount < 8) allPassed = false;

  } finally {
    await browser.close();
  }

  console.log(`\n========================================`);
  console.log(`📋 GENEL RESPONSIVE TEST SONUCU: ${allPassed ? '✅ TÜM TESTLER BAŞARILI' : '❌ HATALAR MEVCUT'}`);
  console.log(`========================================\n`);

  fs.writeFileSync('scripts/test_results.json', JSON.stringify(results, null, 2));

  if (!allPassed) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test hatası:', err);
  process.exit(1);
});

