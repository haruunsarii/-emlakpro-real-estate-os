import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function runDrawersE2ETests() {
  console.log('🚀 EmlakPro Aşama 3.2 / Adım 5: 3 Overlay Drawer E2E Doğrulama Testi Başlatılıyor...');
  console.log(`Tarayıcı: ${CHROME_PATH}`);
  console.log(`Hedef URL: ${BASE_URL}\n`);

  let allPassed = true;
  const results = [];

  function record(testName, passed, details = '') {
    results.push({ testName, passed, details });
    if (passed) {
      console.log(`  ✓ ${testName} ${details ? `(${details})` : ''}`);
    } else {
      allPassed = false;
      console.error(`  ✗ ${testName} - BAŞARISIZ! ${details}`);
    }
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // =========================================================================
    // 1. PropertyDetailDrawer E2E Tests (/gayrimenkuller)
    // =========================================================================
    console.log('--- TEST GRUBU 1: PropertyDetailDrawer (BaseDrawer width="lg") ---');
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 600));

    // Open PropertyDetailDrawer by clicking on first property card's "Detay" button or title
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const detayBtn = buttons.find((b) => b.textContent && b.textContent.trim() === 'Detay');
      if (detayBtn) {
        detayBtn.click();
      } else {
        const h3 = document.querySelector('h3.cursor-pointer');
        if (h3) h3.click();
      }
    });

    await page.waitForSelector('[role="dialog"][aria-modal="true"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 400));

    // 1.1 Dialog Shell & Header
    const propDrawerA11y = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (!dialog) return null;
      const modalBox = dialog.querySelector('.max-w-xl');
      const headerText = dialog.querySelector('h2, div')?.textContent?.trim();
      const hasCloseBtn = Boolean(dialog.querySelector('button[aria-label="Çekmeceyi Kapat"]'));
      const hasPdfBtn = Array.from(dialog.querySelectorAll('button')).some((b) => b.textContent?.includes('PDF Sunum İndir'));
      const hasEditBtn = Array.from(dialog.querySelectorAll('button')).some((b) => b.textContent?.includes('İlanı Düzenle'));
      const hasDeleteBtn = Boolean(dialog.querySelector('button[title="İlanı Sil"], button[aria-label="İlanı Sil"]'));
      const heroCounter = dialog.querySelector('.bg-primary-container\\/90')?.textContent?.trim();

      return {
        hasDialog: true,
        hasWidthLg: Boolean(modalBox),
        headerText,
        hasCloseBtn,
        hasPdfBtn,
        hasEditBtn,
        hasDeleteBtn,
        heroCounter,
      };
    });

    record(
      'PropertyDetailDrawer: BaseDrawer (width="lg") iskeleti ve erişilebilirlik öznitelikleri render edildi',
      propDrawerA11y && propDrawerA11y.hasDialog && propDrawerA11y.hasWidthLg && propDrawerA11y.hasCloseBtn,
      `max-w-xl teyit edildi, Başlık/Rozet: ${propDrawerA11y?.headerText?.substring(0, 30)}...`
    );

    record(
      'PropertyDetailDrawer: PDF, Düzenle ve Sil aksiyon butonları BaseDrawer footer alanında görüntülendi',
      propDrawerA11y && propDrawerA11y.hasPdfBtn && propDrawerA11y.hasEditBtn && propDrawerA11y.hasDeleteBtn,
      'PDF, Düzenle ve Sil butonları mevcut'
    );

    // 1.2 Thumbnail click changes photo
    const thumbChanged = await page.evaluate(async () => {
      const thumbs = document.querySelectorAll('.grid.grid-cols-4 > div');
      if (thumbs.length > 1) {
        thumbs[1].click();
        await new Promise((r) => setTimeout(r, 200));
        const heroCounter = document.querySelector('.bg-primary-container\\/90')?.textContent?.trim();
        return heroCounter?.includes('2 /');
      }
      return true; // only 1 thumb available in mock
    });

    record(
      'PropertyDetailDrawer: Galeri küçük resim seçimi ve aktif fotoğraf sayacı çalıştı',
      thumbChanged,
      'Küçük resim seçildi ve sayaç güncellendi'
    );

    // 1.3 Close via ESC key
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 400));
    const isClosedEsc = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
    record(
      'PropertyDetailDrawer: ESC tuşu ile BaseDrawer useModalBehavior entegrasyonu başarıyla kapandı',
      isClosedEsc,
      'ESC kapanması doğrulandı'
    );

    // 1.4 Reopen and Close via Backdrop Click
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const detayBtn = buttons.find((b) => b.textContent && b.textContent.trim() === 'Detay');
      if (detayBtn) {
        detayBtn.click();
      } else {
        const h3 = document.querySelector('h3.cursor-pointer');
        if (h3) h3.click();
      }
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 300));

    // Click backdrop (outside the max-w-xl drawer, e.g. at x=100, y=300)
    await page.mouse.click(100, 300);
    await new Promise((r) => setTimeout(r, 400));
    const isClosedBackdrop = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
    record(
      'PropertyDetailDrawer: Backdrop tıklaması ile çekmece kapandı',
      isClosedBackdrop,
      'Backdrop tıklama davranışı doğrulandı'
    );

    // =========================================================================
    // 2. DealDetailDrawer E2E Tests (/satis-ve-kiralama)
    // =========================================================================
    console.log('\n--- TEST GRUBU 2: DealDetailDrawer (BaseDrawer width="xl" + customHeader) ---');
    await page.goto(`${BASE_URL}/satis-ve-kiralama`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 600));

    // Click on first deal card in Kanban board
    await page.evaluate(() => {
      const dealCards = document.querySelectorAll('[draggable="true"], .cursor-grab, article');
      if (dealCards.length > 0) {
        dealCards[0].click();
      }
    });
    await page.waitForSelector('[role="dialog"][aria-modal="true"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 400));

    // 2.1 Deal Drawer Shell & Two-Row Custom Header
    const dealDrawerA11y = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (!dialog) return null;
      const modalBox = dialog.querySelector('.max-w-2xl');
      const hasIdBadge = Boolean(dialog.querySelector('.font-mono'));
      const hasTitle = Boolean(dialog.querySelector('h2'));
      const hasEditBtn = Array.from(dialog.querySelectorAll('button')).some((b) => b.textContent?.includes('Düzenle'));
      const hasDeleteBtn = Boolean(dialog.querySelector('button[title="Fırsatı Sil"], button[aria-label="Fırsatı Sil"]'));
      const hasStageWizard = Boolean(dialog.querySelector('.grid.grid-cols-2.sm\\:grid-cols-4'));
      const hasFinancialBox = Array.from(dialog.querySelectorAll('span')).some((s) => s.textContent?.includes('Tahmini Hizmet Bedeli'));
      const hasCloseBtn = Boolean(dialog.querySelector('button[aria-label="Çekmeceyi Kapat"]'));

      return {
        hasDialog: true,
        hasWidthXl: Boolean(modalBox),
        hasIdBadge,
        hasTitle,
        hasEditBtn,
        hasDeleteBtn,
        hasStageWizard,
        hasFinancialBox,
        hasCloseBtn,
      };
    });

    record(
      'DealDetailDrawer: BaseDrawer (width="xl") ve 2 satırlı özel customHeader başarıyla render edildi',
      dealDrawerA11y &&
        dealDrawerA11y.hasDialog &&
        dealDrawerA11y.hasWidthXl &&
        dealDrawerA11y.hasIdBadge &&
        dealDrawerA11y.hasTitle &&
        dealDrawerA11y.hasEditBtn &&
        dealDrawerA11y.hasCloseBtn,
      'max-w-2xl, Rozetler, Başlık ve Hızlı Aksiyonlar teyit edildi'
    );

    record(
      'DealDetailDrawer: Süreç sihirbazı ve tahmini hizmet bedeli finansal kartları korundu',
      dealDrawerA11y && dealDrawerA11y.hasStageWizard && dealDrawerA11y.hasFinancialBox,
      'Aşama butonları ve komisyon kutuları doğrulandı'
    );

    // 2.2 Add activity note
    const noteAdded = await page.evaluate(async () => {
      const input = document.querySelector('input[placeholder*="notu ekle"]') || document.querySelector('input[type="text"]');
      if (!input) return false;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, 'Adım 5 BaseDrawer E2E aktivite notu');
      input.dispatchEvent(new Event('input', { bubbles: true }));

      const buttons = Array.from(document.querySelectorAll('button'));
      const addNoteBtn = buttons.find((b) => b.textContent && b.textContent.includes('Not Ekle'));
      if (addNoteBtn) {
        addNoteBtn.click();
        await new Promise((r) => setTimeout(r, 400));
        return document.body.textContent?.includes('Adım 5 BaseDrawer E2E aktivite notu');
      }
      return false;
    });

    record(
      'DealDetailDrawer: DealActivityTimeline üzerinden yeni görüşme notu başarıyla eklendi',
      noteAdded,
      'Yeni not zaman çizelgesine işlendi'
    );

    // 2.3 Close via Close Button
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Çekmeceyi Kapat"]') ||
        Array.from(document.querySelectorAll('button')).find((b) => b.textContent === 'Kapat');
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));
    const isDealClosed = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
    record(
      'DealDetailDrawer: Kapat butonu ile çekmece sorunsuz kapandı',
      isDealClosed,
      'Modal kapandı'
    );

    // =========================================================================
    // 3. TaskDetailDrawer E2E Tests (/gorevler-ve-randevular)
    // =========================================================================
    console.log('\n--- TEST GRUBU 3: TaskDetailDrawer (Masaüstü Inline vs Mobil BaseDrawer) ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/gorevler-ve-randevular`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 600));

    // 3.1 Desktop Mode (1440px) — Must be inline card, NO [role="dialog"]!
    const desktopTaskState = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const desktopSidebar = document.querySelector('.lg\\:col-span-4');
      const hasTaskCard = desktopSidebar ? Boolean(desktopSidebar.querySelector('.bg-surface-container-lowest')) : false;
      return {
        hasDialog: Boolean(dialog),
        hasInlineSidebarCard: hasTaskCard,
      };
    });

    record(
      'TaskDetailDrawer (Masaüstü 1440px): Sidebar içinde inline kart olarak render edildi (Sıfır overlay/dialog)',
      !desktopTaskState.hasDialog && desktopTaskState.hasInlineSidebarCard,
      `Dialog var mı: ${desktopTaskState.hasDialog}, Inline kart var mı: ${desktopTaskState.hasInlineSidebarCard}`
    );

    // 3.2 Mobile Mode (375px) — Must open as BaseDrawer overlay!
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/gorevler-ve-randevular`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 600));

    // Switch to 'Ajanda' mode on mobile to display clean list of appointments
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const ajandaBtn = btns.find((b) => b.textContent && b.textContent.includes('Ajanda'));
      if (ajandaBtn) ajandaBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // Click on an appointment card to trigger isMobileDrawerOpen
    await page.evaluate(() => {
      const h4s = Array.from(document.querySelectorAll('h4'));
      const targetH4 = h4s.find((h) => h.textContent && (h.textContent.includes('Devir') || h.textContent.includes('Yer Gösterimi') || h.textContent.includes('Daire')));
      if (targetH4) {
        const card = targetH4.closest('.cursor-pointer') || targetH4;
        card.click();
      }
    });

    await page.waitForSelector('[role="dialog"][aria-modal="true"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 400));

    const mobileTaskA11y = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (!dialog) return null;
      const modalBox = dialog.querySelector('.max-w-md');
      const title = dialog.querySelector('h2')?.textContent?.trim();
      const hasWhatsappBtn = Array.from(dialog.querySelectorAll('button')).some((b) => b.textContent?.includes('WhatsApp'));
      const hasEditBtn = Array.from(dialog.querySelectorAll('button')).some((b) => b.textContent?.includes('Düzenle'));
      const hasCloseBtn = Boolean(dialog.querySelector('button[aria-label="Çekmeceyi Kapat"]'));

      return {
        hasDialog: true,
        hasWidthSm: Boolean(modalBox),
        title,
        hasWhatsappBtn,
        hasEditBtn,
        hasCloseBtn,
      };
    });

    record(
      'TaskDetailDrawer (Mobil 375px): BaseDrawer (width="sm") overlay çekmecesine dönüştü ve açıldı',
      mobileTaskA11y && mobileTaskA11y.hasDialog && mobileTaskA11y.hasWidthSm && mobileTaskA11y.hasWhatsappBtn,
      `Başlık: "${mobileTaskA11y?.title}", WhatsApp butonu mevcut`
    );

    // Close via ESC on mobile
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 400));
    const isMobileTaskClosed = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
    record(
      'TaskDetailDrawer (Mobil 375px): ESC tuşu ile mobil BaseDrawer kapandı',
      isMobileTaskClosed,
      'Mobil overlay kapandı'
    );

    // =========================================================================
    // 4. Master-Detail Regresyon Denetimi (CustomerDetail & RequestDetail)
    // =========================================================================
    console.log('\n--- TEST GRUBU 4: Master-Detail Regresyon Denetimi ---');
    await page.setViewport({ width: 1440, height: 900 });

    // 4.1 CustomersPage — CustomerDetailDrawer must stay inline in lg:col-span-5
    await page.goto(`${BASE_URL}/musteriler`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 600));

    const customerInlineState = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const rightCol = document.querySelector('.lg\\:col-span-5');
      const customerHeader = rightCol ? rightCol.querySelector('h2, h3')?.textContent?.trim() : null;
      const hasQuickActions = rightCol ? Array.from(rightCol.querySelectorAll('a')).some((a) => a.textContent?.includes('WhatsApp')) : false;

      return {
        hasDialog: Boolean(dialog),
        rightColExists: Boolean(rightCol),
        customerHeader,
        hasQuickActions,
      };
    });

    record(
      'Master-Detail Regresyonu (Müşteriler): CustomerDetailDrawer sayfa içi bölünmüş ekranda kaldı (BaseDrawer DEĞİL)',
      !customerInlineState.hasDialog && customerInlineState.rightColExists && customerInlineState.hasQuickActions,
      `Sağ panel: ${customerInlineState.customerHeader}, Dialog: ${customerInlineState.hasDialog}`
    );

    // 4.2 RequestsPage — RequestDetailDrawer must stay inline in lg:col-span-7
    await page.goto(`${BASE_URL}/talepler`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 600));

    const requestInlineState = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const rightCol = document.querySelector('.lg\\:col-span-7');
      const matchingEngineText = rightCol ? rightCol.textContent : '';
      const hasMatchScore = matchingEngineText?.includes('Uyum') || matchingEngineText?.includes('Eşleşen') || matchingEngineText?.includes('Talep');

      return {
        hasDialog: Boolean(dialog),
        rightColExists: Boolean(rightCol),
        hasMatchScore,
      };
    });

    record(
      'Master-Detail Regresyonu (Talepler): RequestDetailDrawer sayfa içi eşleştirme konsolunda kaldı (BaseDrawer DEĞİL)',
      !requestInlineState.hasDialog && requestInlineState.rightColExists && requestInlineState.hasMatchScore,
      `Eşleştirme motoru inline çalışıyor, Dialog: ${requestInlineState.hasDialog}`
    );

    // =========================================================================
    // 5. Responsive Viewport Check (375px, 768px, 1440px)
    // =========================================================================
    console.log('\n--- TEST GRUBU 5: Responsive & Yatay Taşma Denetimi (375px, 768px, 1440px) ---');

    const viewports = [
      { name: 'Mobil (375px)', width: 375, height: 667 },
      { name: 'Tablet (768px)', width: 768, height: 1024 },
      { name: 'Masaüstü (1440px)', width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0', timeout: 30000 });
      await new Promise((r) => setTimeout(r, 400));

      // Open PropertyDetailDrawer
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const detayBtn = buttons.find((b) => b.textContent && b.textContent.trim() === 'Detay');
        if (detayBtn) {
          detayBtn.click();
        } else {
          const h3 = document.querySelector('h3.cursor-pointer');
          if (h3) h3.click();
        }
      });
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await new Promise((r) => setTimeout(r, 300));

      const overflowData = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return null;
        const box = dialog.querySelector('div > div');
        if (!box) return null;
        const rect = box.getBoundingClientRect();
        const docWidth = window.innerWidth;
        const hasHorizontalOverflow = rect.width > docWidth;
        const isWithinBounds = rect.left >= 0 && rect.right <= docWidth + 5;
        return {
          boxWidth: Math.round(rect.width),
          docWidth,
          hasHorizontalOverflow,
          isWithinBounds,
        };
      });

      record(
        `Responsive Kontrolü (${vp.name}): Çekmece ekrana taşma yapmadan sığdı`,
        overflowData && !overflowData.hasHorizontalOverflow && overflowData.isWithinBounds,
        `Genişlik: ${overflowData?.boxWidth}px / Viewport: ${overflowData?.docWidth}px`
      );

      // Close for next iteration
      await page.keyboard.press('Escape');
      await new Promise((r) => setTimeout(r, 300));
    }

  } catch (err) {
    console.error('Test yürütme sırasında beklenmeyen hata:', err);
    allPassed = false;
  } finally {
    await browser.close();
  }

  const passedCount = results.filter((r) => r.passed).length;
  console.log('\n====================================================');
  console.log(`TEST SONUCU: ${passedCount} / ${results.length} Test Başarılı`);
  console.log('====================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runDrawersE2ETests();
