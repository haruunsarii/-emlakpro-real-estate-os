import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function runLargeFormModalsTests() {
  console.log('🚀 EmlakPro Aşama 3.2 / Adım 4: 4 Büyük Form Modalı E2E Doğrulama Testi Başlatılıyor...');
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
    // 1. PropertyFormModal E2E Tests (/gayrimenkuller)
    // =========================================================================
    console.log('--- TEST GRUBU 1: PropertyFormModal (BaseModal + FormField) ---');
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 600));

    // Open PropertyFormModal via "Yeni İlan Ekle" or "Yeni Portföy Ekle" button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find((b) => b.textContent && (b.textContent.includes('Yeni İlan') || b.textContent.includes('Yeni Portföy')));
      if (addBtn) addBtn.click();
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 400));

    // 1.1 Modal Shell & A11y
    const propModalA11y = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (!dialog) return null;
      const title = dialog.querySelector('h3')?.textContent?.trim();
      const icon = dialog.querySelector('.material-symbols-outlined')?.textContent?.trim();
      const hasForm = Boolean(dialog.querySelector('form#property-form'));
      const hasTitleField = Boolean(document.getElementById('property-title'));
      const hasPriceField = Boolean(document.getElementById('property-price'));
      const hasNetAreaField = Boolean(document.getElementById('property-net-area'));
      const hasDistrictField = Boolean(document.getElementById('property-district'));
      const hasRoomsField = Boolean(document.getElementById('property-rooms'));
      const hasAdvisorField = Boolean(document.getElementById('property-advisor'));
      const footerBtn = Boolean(document.querySelector('button[form="property-form"]'));

      return {
        hasDialog: true,
        title,
        icon,
        hasForm,
        hasTitleField,
        hasPriceField,
        hasNetAreaField,
        hasDistrictField,
        hasRoomsField,
        hasAdvisorField,
        footerBtn,
      };
    });

    record(
      'PropertyFormModal: BaseModal ve FormField DOM iskeleti render edildi',
      propModalA11y &&
        propModalA11y.hasDialog &&
        propModalA11y.title === 'Yeni Portföy Kaydı Ekle' &&
        propModalA11y.icon === 'add_home_work' &&
        propModalA11y.hasTitleField &&
        propModalA11y.hasPriceField &&
        propModalA11y.footerBtn,
      `Başlık: "${propModalA11y?.title}", İkon: "${propModalA11y?.icon}"`
    );

    // 1.2 Form Validation on Empty Inputs
    await page.evaluate(() => {
      const setVal = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      setVal(document.getElementById('property-title'), '');
      setVal(document.getElementById('property-price'), '');
      setVal(document.getElementById('property-net-area'), '');

      const submitBtn = document.querySelector('button[form="property-form"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    const propValErrors = await page.evaluate(() => {
      const alerts = Array.from(document.querySelectorAll('[role="dialog"] [role="alert"]'));
      return alerts.map((a) => a.textContent?.trim());
    });

    const hasTitleErr = propValErrors.some((e) => e && e.includes('başlığı zorunludur'));
    const hasPriceErr = propValErrors.some((e) => e && e.includes('fiyat tutarı'));

    record(
      'PropertyFormModal: Zorunlu alan validasyon hataları FormField altında görüntülendi',
      hasTitleErr && hasPriceErr,
      `Hatalar: ${propValErrors.join(' | ')}`
    );

    // 1.3 Add New Property Successfully
    await page.evaluate(() => {
      const setInput = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      setInput(document.getElementById('property-title'), 'Test Moda Sahil Rezidans 4+1');
      setInput(document.getElementById('property-price'), '32500000');
      setInput(document.getElementById('property-net-area'), '195');

      const submitBtn = document.querySelector('button[form="property-form"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const isPropModalClosed = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
    const isNewPropInPage = await page.evaluate(() => {
      return (document.body.textContent || '').includes('Test Moda Sahil Rezidans 4+1');
    });

    record(
      'PropertyFormModal: Yeni gayrimenkul başarıyla kaydedildi ve sayfada listelendi',
      isPropModalClosed && isNewPropInPage,
      'Yeni portföy kaydedildi, modal kapandı'
    );

    // 1.4 Escape Dismissal
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find((b) => b.textContent && (b.textContent.includes('Yeni İlan') || b.textContent.includes('Yeni Portföy')));
      if (addBtn) addBtn.click();
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 300));

    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 300));
    const closedOnEsc = await page.evaluate(() => !document.querySelector('[role="dialog"]'));

    record(
      'PropertyFormModal: ESC tuşu ile modal sorunsuz kapandı',
      closedOnEsc,
      'BaseModal useModalBehavior ESC entegrasyonu başarılı'
    );

    // =========================================================================
    // 2. DealFormModal E2E Tests (/satis-ve-kiralama)
    // =========================================================================
    console.log('\n--- TEST GRUBU 2: DealFormModal (BaseModal + FormField) ---');
    await page.goto(`${BASE_URL}/satis-ve-kiralama`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 600));

    // Open DealFormModal via "Yeni Fırsat Ekle" button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find((b) => b.textContent && b.textContent.includes('Yeni Fırsat'));
      if (addBtn) addBtn.click();
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 400));

    // 2.1 Modal Shell & A11y
    const dealModalA11y = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (!dialog) return null;
      const title = dialog.querySelector('h3')?.textContent?.trim();
      const icon = dialog.querySelector('.material-symbols-outlined')?.textContent?.trim();
      const hasForm = Boolean(dialog.querySelector('form#deal-modal-form'));
      const hasTitleField = Boolean(document.getElementById('deal-form-title'));
      const hasCustomerSelect = Boolean(document.getElementById('deal-customer-select'));
      const hasPropertySelect = Boolean(document.getElementById('deal-property-select'));
      const hasAmountField = Boolean(document.getElementById('deal-form-amount'));
      const hasCommissionField = Boolean(document.getElementById('deal-form-commission-rate'));
      const footerBtn = Boolean(document.querySelector('button[form="deal-modal-form"]'));

      return {
        hasDialog: true,
        title,
        icon,
        hasForm,
        hasTitleField,
        hasCustomerSelect,
        hasPropertySelect,
        hasAmountField,
        hasCommissionField,
        footerBtn,
      };
    });

    record(
      'DealFormModal: BaseModal ve FormField DOM iskeleti render edildi',
      dealModalA11y &&
        dealModalA11y.hasDialog &&
        dealModalA11y.title === 'Yeni Satış / Kiralama Fırsatı Ekle' &&
        dealModalA11y.icon === 'add_task' &&
        dealModalA11y.hasTitleField &&
        dealModalA11y.hasAmountField &&
        dealModalA11y.footerBtn,
      `Başlık: "${dealModalA11y?.title}", İkon: "${dealModalA11y?.icon}"`
    );

    // 2.2 Validation & Commission Calculation
    await page.evaluate(() => {
      const setInput = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      // Set amount to 20.000.000 and commission to 3% => should be 600.000
      setInput(document.getElementById('deal-form-amount'), '20000000');
      setInput(document.getElementById('deal-form-commission-rate'), '3');
    });
    await new Promise((r) => setTimeout(r, 200));

    const commissionCalcMatches = await page.evaluate(() => {
      const calcDiv = document.getElementById('deal-form-commission-calc');
      const text = calcDiv ? calcDiv.textContent?.trim() : '';
      return text.includes('600.000');
    });

    record(
      'DealFormModal: Dinamik komisyon hizmet bedeli hesabı doğru çalıştı',
      commissionCalcMatches,
      '₺20.000.000 @ %3 = ₺600.000 teyit edildi'
    );

    // 2.3 Create New Deal Successfully
    await page.evaluate(() => {
      const setInput = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      setInput(document.getElementById('deal-form-title'), 'Aşama 3.2 Fırsat Testi');
      const submitBtn = document.querySelector('button[form="deal-modal-form"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const isDealInKanban = await page.evaluate(() => {
      return (document.body.textContent || '').includes('Aşama 3.2 Fırsat Testi');
    });

    record(
      'DealFormModal: Yeni fırsat başarıyla kaydedildi ve Kanban panosunda listelendi',
      isDealInKanban,
      'Kanban panosunda fırsat kartı onaylandı'
    );

    // =========================================================================
    // 3. RequestFormModal E2E Tests (/talepler)
    // =========================================================================
    console.log('\n--- TEST GRUBU 3: RequestFormModal (BaseModal + FormField) ---');
    await page.goto(`${BASE_URL}/talepler`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 600));

    // Open RequestFormModal via "Yeni Talep Ekle" or "+ Talep Oluştur"
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find((b) => b.textContent && (b.textContent.includes('Yeni Talep') || b.textContent.includes('Talep Oluştur') || b.textContent.includes('Yeni Müşteri Talebi')));
      if (addBtn) addBtn.click();
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 400));

    // 3.1 Modal Shell & A11y
    const reqModalA11y = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (!dialog) return null;
      const title = dialog.querySelector('h3')?.textContent?.trim();
      const icon = dialog.querySelector('.material-symbols-outlined')?.textContent?.trim();
      const hasForm = Boolean(dialog.querySelector('form#request-modal-form'));
      const hasClientName = Boolean(document.getElementById('request-client-name'));
      const hasDistrict = Boolean(document.getElementById('request-district'));
      const hasMinBudget = Boolean(document.getElementById('request-min-budget'));
      const hasMaxBudget = Boolean(document.getElementById('request-max-budget'));
      const footerBtn = Boolean(document.querySelector('button[form="request-modal-form"]'));

      return {
        hasDialog: true,
        title,
        icon,
        hasForm,
        hasClientName,
        hasDistrict,
        hasMinBudget,
        hasMaxBudget,
        footerBtn,
      };
    });

    record(
      'RequestFormModal: BaseModal ve FormField DOM iskeleti render edildi',
      reqModalA11y &&
        reqModalA11y.hasDialog &&
        reqModalA11y.title === 'Yeni Müşteri Talebi Oluştur' &&
        reqModalA11y.icon === 'add_task' &&
        reqModalA11y.hasClientName &&
        reqModalA11y.hasDistrict &&
        reqModalA11y.footerBtn,
      `Başlık: "${reqModalA11y?.title}", İkon: "${reqModalA11y?.icon}"`
    );

    // 3.2 Budget Range Validation Check (min > max)
    await page.evaluate(() => {
      const setInput = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      // min 40M > max 20M => should fail
      setInput(document.getElementById('request-min-budget'), '40000000');
      setInput(document.getElementById('request-max-budget'), '20000000');

      const submitBtn = document.querySelector('button[form="request-modal-form"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    const budgetValErr = await page.evaluate(() => {
      const alertP = document.querySelector('#request-max-budget-error');
      return alertP ? alertP.textContent?.trim() : null;
    });

    record(
      'RequestFormModal: Min > Max bütçe validasyon hatası FormField altında görüntülendi',
      budgetValErr && (budgetValErr.includes('yüksek olamaz') || budgetValErr.includes('büyük olamaz')),
      `Hata mesajı: "${budgetValErr}"`
    );

    // 3.3 Create New Request Successfully
    await page.evaluate(() => {
      const setInput = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      setInput(document.getElementById('request-client-name'), 'Ali Kemal Demir');
      setInput(document.getElementById('request-district'), 'Kadıköy');
      setInput(document.getElementById('request-min-budget'), '15000000');
      setInput(document.getElementById('request-max-budget'), '25000000');

      const submitBtn = document.querySelector('button[form="request-modal-form"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const isRequestInList = await page.evaluate(() => {
      return (document.body.textContent || '').includes('Ali Kemal Demir');
    });

    record(
      'RequestFormModal: Yeni müşteri talebi başarıyla eklendi ve listede yer aldı',
      isRequestInList,
      'Yeni talep listeye kaydedildi'
    );

    // =========================================================================
    // 4. AppointmentFormModal E2E Tests (/gorevler-ve-randevular)
    // =========================================================================
    console.log('\n--- TEST GRUBU 4: AppointmentFormModal (BaseModal + FormField) ---');
    await page.goto(`${BASE_URL}/gorevler-ve-randevular`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 600));

    // Open AppointmentFormModal via "+ Yeni Randevu Oluştur" button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const apptBtn = buttons.find((b) => b.textContent && b.textContent.includes('Yeni Randevu'));
      if (apptBtn) apptBtn.click();
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 400));

    // 4.1 Modal Shell & A11y
    const apptModalA11y = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (!dialog) return null;
      const title = dialog.querySelector('h3')?.textContent?.trim();
      const icon = dialog.querySelector('.material-symbols-outlined')?.textContent?.trim();
      const hasForm = Boolean(dialog.querySelector('form#appointment-modal-form'));
      const hasTitleField = Boolean(document.getElementById('appt-form-title'));
      const hasDateField = Boolean(document.getElementById('appt-form-date'));
      const hasStartTime = Boolean(document.getElementById('appt-form-start-time'));
      const hasEndTime = Boolean(document.getElementById('appt-form-end-time'));
      const hasClientSelect = Boolean(document.getElementById('appt-client-select'));
      const hasPropertySelect = Boolean(document.getElementById('appt-property-select'));
      const footerBtn = Boolean(document.querySelector('button[form="appointment-modal-form"]'));

      return {
        hasDialog: true,
        title,
        icon,
        hasForm,
        hasTitleField,
        hasDateField,
        hasStartTime,
        hasEndTime,
        hasClientSelect,
        hasPropertySelect,
        footerBtn,
      };
    });

    record(
      'AppointmentFormModal: BaseModal ve FormField DOM iskeleti render edildi',
      apptModalA11y &&
        apptModalA11y.hasDialog &&
        apptModalA11y.title === 'Yeni Randevu Oluştur' &&
        apptModalA11y.icon === 'calendar_add_on' &&
        apptModalA11y.hasTitleField &&
        apptModalA11y.hasDateField &&
        apptModalA11y.hasStartTime &&
        apptModalA11y.footerBtn,
      `Başlık: "${apptModalA11y?.title}", İkon: "${apptModalA11y?.icon}"`
    );

    // 4.2 Time Range Logic Validation Check (startTime >= endTime)
    await page.evaluate(() => {
      const setInput = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      setInput(document.getElementById('appt-form-title'), 'Zaman Hatası Testi');
      setInput(document.getElementById('appt-form-start-time'), '16:00');
      setInput(document.getElementById('appt-form-end-time'), '15:00');

      const submitBtn = document.querySelector('button[form="appointment-modal-form"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    const timeValErr = await page.evaluate(() => {
      const alertP = document.querySelector('#appt-form-end-time-error');
      return alertP ? alertP.textContent?.trim() : null;
    });

    record(
      'AppointmentFormModal: Başlangıç > Bitiş saati mantık hatası FormField altında görüntülendi',
      timeValErr && timeValErr.includes('başlangıç saatinden sonra'),
      `Hata mesajı: "${timeValErr}"`
    );

    // 4.3 Create New Appointment Successfully
    await page.evaluate(() => {
      const setInput = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      setInput(document.getElementById('appt-form-title'), 'Moda Penthouse Ziyareti');
      setInput(document.getElementById('appt-form-start-time'), '14:00');
      setInput(document.getElementById('appt-form-end-time'), '15:30');

      const submitBtn = document.querySelector('button[form="appointment-modal-form"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const isApptInPage = await page.evaluate(() => {
      return (document.body.textContent || '').includes('Moda Penthouse Ziyareti');
    });

    record(
      'AppointmentFormModal: Yeni randevu başarıyla eklendi ve ajandada yer aldı',
      isApptInPage,
      'Yeni randevu ajandaya kaydedildi'
    );

    // =========================================================================
    // 5. Responsive Viewport Check (375px Mobile vs 1440px Desktop)
    // =========================================================================
    console.log('\n--- TEST GRUBU 5: Responsive Viewport & Taşıma Kontrolü ---');
    await page.setViewport({ width: 375, height: 667 }); // iPhone SE
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 500));

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find((b) => b.textContent && (b.textContent.includes('Yeni İlan') || b.textContent.includes('Yeni Portföy')));
      if (addBtn) addBtn.click();
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 400));

    const mobileLayout = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return null;
      const modalBox = dialog.querySelector('.max-w-3xl') || dialog.querySelector('div > div');
      if (!modalBox) return null;
      const rect = modalBox.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const hasHorizontalOverflow = rect.width > viewportWidth;
      const isVisibleWithinViewport = rect.left >= 0 && rect.right <= viewportWidth + 5;
      return { width: rect.width, viewportWidth, hasHorizontalOverflow, isVisibleWithinViewport };
    });

    record(
      'Responsive Kontrolü (375px Mobil): BaseModal (max-w-3xl) mobil ekrana taşma olmadan sığdı',
      mobileLayout && !mobileLayout.hasHorizontalOverflow && mobileLayout.isVisibleWithinViewport,
      `Modal genişliği: ${Math.round(mobileLayout?.width || 0)}px / Viewport: ${mobileLayout?.viewportWidth}px`
    );

    // Close modal via Escape
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 300));

  } catch (err) {
    console.error('Test yürütme sırasında beklenmeyen hata:', err);
    record('Genel Test Yürütme', false, err.message);
  } finally {
    await browser.close();
  }

  console.log('\n====================================================');
  console.log(`TEST SONUCU: ${results.filter((r) => r.passed).length} / ${results.length} Test Başarılı`);
  console.log('====================================================');

  if (!allPassed) {
    process.exit(1);
  }
}

runLargeFormModalsTests();
