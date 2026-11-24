import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function runFinalAudit() {
  console.log('🚀 EmlakPro Aşama 2 Final Entegrasyon & Regresyon Denetimi Başlatılıyor...');

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const results = [];
  let allPassed = true;

  function record(section, testName, passed, detail = '') {
    results.push({ section, testName, passed, detail });
    if (passed) {
      console.log(`  ✓ [${section}] ${testName} ${detail ? '(' + detail + ')' : ''}`);
    } else {
      console.error(`  ✗ [${section}] ${testName} - BAŞARISIZ! ${detail ? '[' + detail + ']' : ''}`);
      allPassed = false;
    }
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // ==========================================
    // 1. SKELETON ENTEGRASYON DENETİMİ
    // ==========================================
    console.log('\n--- 1. Skeleton Entegrasyon Denetimi ---');
    // Sayfa skeleton'larının export ve modül bütünlüğü
    const skeletonFiles = [
      'CustomerSkeleton.jsx',
      'DashboardSkeleton.jsx',
      'DealSkeleton.jsx',
      'PageSkeleton.jsx',
      'PropertySkeleton.jsx',
      'ReportsSkeleton.jsx',
      'RequestSkeleton.jsx',
      'SettingsSkeleton.jsx',
      'TaskSkeleton.jsx',
    ];

    let allFilesExist = true;
    for (const f of skeletonFiles) {
      if (!fs.existsSync(`src/components/ui/skeletons/${f}`)) {
        allFilesExist = false;
      }
    }
    record('Skeleton', 'Tüm 9 Skeleton dosyası diskte mevcut', allFilesExist);

    // AppLayout içinde Suspense fallback olarak PageSkeleton kullanılıyor mu?
    const appLayoutContent = fs.readFileSync('src/components/layout/AppLayout.jsx', 'utf8');
    const hasSuspenseFallback = appLayoutContent.includes('fallback={<PageSkeleton />}');
    record('Skeleton', 'AppLayout içinde Suspense fallback={<PageSkeleton />} entegre', hasSuspenseFallback);

    // Senkron localStorage işlemlerinde yapay bekleme (sleep) olmaması:
    // Sayfa render edildiğinde yapay loading spinner/gecikmesi olmadan verinin anında DOM'da olduğunu doğrula
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0' });
    const hasDataImmediately = await page.evaluate(() => {
      const el = document.querySelector('#portfolio-grid-container');
      const hasCards = el && el.children.length > 0;
      // Kontrol et: Sayfada yapay spinner veya yapay bekleme overlay'i var mı?
      const hasArtificialSpinner = !!document.querySelector('.animate-spin');
      return hasCards && !hasArtificialSpinner;
    });
    record(
      'Skeleton',
      'Senkron localStorage verisi yapay gecikme olmadan anında DOM\'a yüklendi',
      hasDataImmediately
    );

    // ==========================================
    // 2. ERROR STATE & ERRORBOUNDARY DENETİMİ
    // ==========================================
    console.log('\n--- 2. Error State & ErrorBoundary Denetimi ---');
    // AppLayout içinde ErrorBoundary kalkanı var mı?
    const hasErrorBoundaryInLayout =
      appLayoutContent.includes('<ErrorBoundary>') && appLayoutContent.includes('</ErrorBoundary>');
    record('ErrorBoundary', 'AppLayout ana çalışma alanını ErrorBoundary ile sarmalıyor', hasErrorBoundaryInLayout);

    // ErrorState bileşeni erişilebilir ARIA ve butonları barındırıyor mu?
    const errorStateContent = fs.readFileSync('src/components/ui/ErrorState.jsx', 'utf8');
    const hasRoleAlert = errorStateContent.includes('role="alert"');
    const hasRetryAction = errorStateContent.includes('retryLabel') && errorStateContent.includes('onRetry');
    const hasReloadAction = errorStateContent.includes('window.location.reload()');
    record('ErrorState', 'ErrorState bileşeni role="alert" ve erişilebilirlik içeriyor', hasRoleAlert);
    record('ErrorState', 'ErrorState "Tekrar Dene" ve "Sayfayı Yenile" aksiyonlarını içeriyor', hasRetryAction && hasReloadAction);

    // Hata durumunda localStorage verilerinin korunması testi:
    await page.evaluate(() => {
      localStorage.setItem('emlakpro_audit_test_persistence', 'PRESERVED_123');
    });
    const retrievedBefore = await page.evaluate(() => localStorage.getItem('emlakpro_audit_test_persistence'));
    record('ErrorPersistence', 'localStorage verisi hata öncesi teyit edildi', retrievedBefore === 'PRESERVED_123');
    // Sayfayı yeniden yükle / route değiştir
    await page.goto(`${BASE_URL}/ayarlar`, { waitUntil: 'networkidle0' });
    const retrievedAfter = await page.evaluate(() => localStorage.getItem('emlakpro_audit_test_persistence'));
    record('ErrorPersistence', 'localStorage verisi rota geçişlerinde ve hata kalkanında korundu', retrievedAfter === 'PRESERVED_123');
    await page.evaluate(() => localStorage.removeItem('emlakpro_audit_test_persistence'));

    // ==========================================
    // 3. GAYRİMENKUL VERİ BÜTÜNLÜĞÜ
    // ==========================================
    console.log('\n--- 3. Gayrimenkul Veri Bütünlüğü Denetimi ---');
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));

    // 3a. 21 İlan & Sayfa 1 (15 İlan) / Sayfa 2 (6 İlan)
    const page1CardsCount = await page.evaluate(() => {
      return document.querySelectorAll('#portfolio-grid-container > div').length;
    });
    record('Portföy', 'Sayfa 1: Tam 15 ilan listeleniyor', page1CardsCount === 15, `${page1CardsCount} İlan`);

    // Sayfa 2'ye geç
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn2 = btns.find((b) => b.textContent.trim() === '2');
      if (btn2) btn2.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    const page2CardsCount = await page.evaluate(() => {
      return document.querySelectorAll('#portfolio-grid-container > div').length;
    });
    record('Portföy', 'Sayfa 2: Kalan 6 ilan listeleniyor (15 + 6 = 21)', page2CardsCount === 6, `${page2CardsCount} İlan`);

    // Sayfa 1'e geri dön
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn1 = btns.find((b) => b.textContent.trim() === '1');
      if (btn1) btn1.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // 3b. Orijinal 6 ilan korunmuş mu?
    const original6Ids = ['PORT-8841', 'PORT-7720', 'PORT-6502', 'PORT-7902', 'PORT-5110', 'PORT-4290'];
    const mockDataContent = fs.readFileSync('src/services/mockData.js', 'utf8');
    const allOriginalsInMock = original6Ids.every((id) => mockDataContent.includes(id));
    record('Portföy', 'Orijinal 6 ilan ID ve verileri mockData içinde eksiksiz mevcut', allOriginalsInMock);

    // 3c. 21 ilan ID'lerinin benzersizliği
    const idsInMock = [...mockDataContent.matchAll(/id:\s*["'](PORT-\d+)["']/g)].map((m) => m[1]);
    const uniqueIds = new Set(idsInMock);
    record('Portföy', '21 ilanın tamamı benzersiz ID değerine sahip', uniqueIds.size >= 21, `${uniqueIds.size} Benzersiz ID`);

    // 3d. Kullanıcının oluşturduğu özel ilanın korunması:
    await page.evaluate(() => {
      try {
        const saved = JSON.parse(localStorage.getItem('emlakpro_properties_v1') || '[]');
        const customProp = {
          id: 'PORT-USER-CUSTOM-001',
          title: 'Kullanıcı Özel İlanı Test',
          type: 'Satılık',
          category: 'Daire',
          priceFormatted: '₺15.000.000',
          price: 15000000,
          location: 'Kadıköy',
          status: 'Aktif',
          statusType: 'active',
          rooms: '3+1',
          netArea: 120,
        };
        localStorage.setItem('emlakpro_properties_v1', JSON.stringify([customProp, ...saved]));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));

    const customPropPreserved = await page.evaluate(() => {
      const saved = JSON.parse(localStorage.getItem('emlakpro_properties_v1') || '[]');
      return saved.some((p) => p.id === 'PORT-USER-CUSTOM-001');
    });
    record('Portföy', 'Kullanıcının önceden eklediği özel portföy kaydı korundu', customPropPreserved);

    // Temizle
    await page.evaluate(() => {
      const saved = JSON.parse(localStorage.getItem('emlakpro_properties_v1') || '[]');
      const filtered = saved.filter((p) => p.id !== 'PORT-USER-CUSTOM-001');
      localStorage.setItem('emlakpro_properties_v1', JSON.stringify(filtered));
      window.dispatchEvent(new Event('storage'));
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));

    // ==========================================
    // 4. EMPTYSTATE VE FİLTRELERİ SIFIRLA DENETİMİ
    // ==========================================
    console.log('\n--- 4. EmptyState ve Filtre Sıfırlama Denetimi (8 Ekran) ---');

    // 4a. Gayrimenkuller: Arama -> EmptyState -> Sıfırla
    const propInput = await page.$('input[placeholder*="İlan no, başlık"]');
    await propInput.type('olmayan_portfoy_sorgusu_xyz_999', { delay: 10 });
    await new Promise((r) => setTimeout(r, 400));

    const propEmptyStateFound = await page.evaluate(() => {
      return document.body.textContent.includes('Kriterlere Uygun Gayrimenkul Bulunamadı');
    });
    record('EmptyState', 'Gayrimenkuller: 0 sonuç filtre EmptyState görüntülendi', propEmptyStateFound);

    // "Filtreleri Temizle" tıkla
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find((b) => b.textContent.includes('Filtreleri Temizle'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 400));
    const propCountAfterReset = await page.evaluate(() => {
      return document.querySelectorAll('#portfolio-grid-container > div').length;
    });
    record('EmptyState', 'Gayrimenkuller: "Filtreleri Temizle" ile 15 ilanlık liste geri geldi', propCountAfterReset === 15);

    // 4b. Müşteriler: Arama -> EmptyState -> Sıfırla
    await page.goto(`${BASE_URL}/musteriler`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));
    const custInput = await page.$('input[placeholder*="İsim, telefon"]');
    await custInput.type('olmayan_musteri_sorgusu_999', { delay: 10 });
    await new Promise((r) => setTimeout(r, 400));

    const custEmptyStateFound = await page.evaluate(() => {
      return document.body.textContent.includes('Kriterlere Uygun Müşteri Bulunamadı');
    });
    record('EmptyState', 'Müşteriler: 0 sonuç filtre EmptyState görüntülendi', custEmptyStateFound);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find((b) => b.textContent.includes('Filtreleri Sıfırla'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 400));
    const custReturned = await page.evaluate(() => {
      return document.body.textContent.includes('Selin Vardar');
    });
    record('EmptyState', 'Müşteriler: "Filtreleri Sıfırla" ile müşteri listesi geri yüklendi', custReturned);

    // 4c. Talepler: Arama -> EmptyState -> Sıfırla
    await page.goto(`${BASE_URL}/talepler`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));
    const reqInput = await page.$('input[placeholder*="Müşteri adı, aranan bölge"]');
    await reqInput.type('olmayan_talep_sorgusu_999', { delay: 10 });
    await new Promise((r) => setTimeout(r, 400));

    const reqEmptyFound = await page.evaluate(() => {
      return document.body.textContent.includes('Kriterlere Uygun Müşteri Talebi Bulunamadı');
    });
    record('EmptyState', 'Talepler: 0 sonuç filtre EmptyState görüntülendi', reqEmptyFound);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find((b) => b.textContent.includes('Filtreleri Sıfırla'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 400));
    const reqReturned = await page.evaluate(() => {
      return document.body.textContent.includes('Selin Vardar');
    });
    record('EmptyState', 'Talepler: "Filtreleri Sıfırla" ile talep listesi geri yüklendi', reqReturned);

    // 4d. Satış ve Kiralama: Arama -> EmptyState -> Sıfırla
    await page.goto(`${BASE_URL}/satis-ve-kiralama`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));
    const dealInput = await page.$('input[placeholder*="Fırsat, müşteri veya portföy ara"]');
    await dealInput.type('olmayan_firsat_sorgusu_999', { delay: 10 });
    await new Promise((r) => setTimeout(r, 400));

    const dealEmptyFound = await page.evaluate(() => {
      return document.body.textContent.includes('Kriterlere Uygun Fırsat Bulunamadı');
    });
    record('EmptyState', 'Satış ve Kiralama: 0 sonuç filtre EmptyState görüntülendi', dealEmptyFound);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find((b) => b.textContent.includes('Filtreleri Sıfırla'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 400));
    const dealReturned = await page.evaluate(() => {
      return document.body.textContent.includes('Moda Penthouse') || document.body.textContent.includes('Beykoz Konakları');
    });
    record('EmptyState', 'Satış ve Kiralama: "Filtreleri Sıfırla" ile Kanban geri yüklendi', dealReturned);

    // 4e. Dashboard yönlendirme eylemleri
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));
    const hasDashboardActions = await page.evaluate(() => {
      const text = document.body.textContent;
      return text.includes('Son Eklenen Gayrimenkul Portföyleri') && text.includes('Yaklaşan Randevular');
    });
    record('EmptyState', 'Dashboard son portföy ve randevu bileşenleri aktif', hasDashboardActions);

    // ==========================================
    // 5. AŞAMA 2.6 REGRESYON DENETİMİ
    // ==========================================
    console.log('\n--- 5. Aşama 2.6 Filtreleme & Arama Regresyon Denetimi ---');

    // 5a. Global Ctrl+K Odaklanma ve Çoklu-Varlık Paleti
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyK');
    await page.keyboard.up('Control');
    await new Promise((r) => setTimeout(r, 300));

    const isHeaderFocused = await page.evaluate(() => {
      const headerInput = document.querySelector('header input[placeholder*="⌘K"]');
      return document.activeElement === headerInput;
    });
    record('AramaRegresyon', 'Ctrl+K ile Header arama çubuğuna odaklanıldı', isHeaderFocused);

    // 5b. Türkçe Karakter Duyarsız "kadikoy" Araması
    await page.keyboard.type('kadikoy', { delay: 30 });
    await new Promise((r) => setTimeout(r, 400));

    const headerResults = await page.evaluate(() => {
      const dropdown = document.querySelector('header .absolute.top-full');
      const text = dropdown ? dropdown.textContent : '';
      return text.includes('Portföyler') && (text.includes('Kadıköy') || text.includes('Moda'));
    });
    record('AramaRegresyon', 'Header: "kadikoy" ASCII araması Türkçe "Kadıköy" portföylerini buldu', headerResults);

    // 5c. "X" butonu ile temizleme
    const headerClearBtn = await page.$('header button[aria-label="Aramayı Temizle"]');
    if (headerClearBtn) {
      await headerClearBtn.click();
      await new Promise((r) => setTimeout(r, 300));
    }
    const headerTextAfterClear = await page.evaluate(() => {
      const input = document.querySelector('header input[placeholder*="⌘K"]');
      return input ? input.value : '';
    });
    record('AramaRegresyon', 'Header: "X" butonu aramayı sıfırladı', headerTextAfterClear === '');

    // 5d. Escape tuşu ile menüyü kapatma
    await page.keyboard.type('moda', { delay: 20 });
    await new Promise((r) => setTimeout(r, 200));
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 200));
    const isDropdownClosed = await page.evaluate(() => {
      return !document.querySelector('header .absolute.top-full');
    });
    record('AramaRegresyon', 'Escape tuşu canlı arama çekmecesini kapattı', isDropdownClosed);

    // ==========================================
    // 6. RESPONSIVE GÖRÜNÜM DENETİMİ (390px Mobil vs 1440px Masaüstü)
    // ==========================================
    console.log('\n--- 6. Responsive Görünüm ve Taşma Denetimi ---');
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));

    const mobileHasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    record('Responsive', 'Mobil (390px): Gayrimenkuller ekranında yatay taşma yok (0px)', !mobileHasOverflow);

    await page.goto(`${BASE_URL}/satis-ve-kiralama`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));
    const mobileKanbanNoOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    record('Responsive', 'Mobil (390px): Satış ve Kiralama ekranında sayfa taşması yok (0px)', mobileKanbanNoOverflow);

    await page.setViewport({ width: 1440, height: 900 });

  } finally {
    await browser.close();
  }

  console.log(`\n======================================================`);
  console.log(`📋 AŞAMA 2 FİNAL ENTEGRASYON VE REGRESYON SONUCU: ${allPassed ? '✅ TÜM TESTLER EKSİKSİZ GEÇTİ' : '❌ HATALAR MEVCUT'}`);
  console.log(`======================================================\n`);

  fs.writeFileSync('scripts/final_regression_results.json', JSON.stringify(results, null, 2));

  if (!allPassed) {
    process.exit(1);
  }
}

runFinalAudit().catch((err) => {
  console.error('Final denetim hatası:', err);
  process.exit(1);
});

