import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function runSmallFormModalsTests() {
  console.log('🚀 EmlakPro Aşama 3.2 / Adım 3: 3 Küçük Form Modalı E2E Doğrulama Testi Başlatılıyor...');
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
    // 1. UserModal E2E Tests (Settings -> Kullanıcı Yönetimi)
    // =========================================================================
    console.log('--- TEST GRUBU 1: UserModal (BaseModal + FormField) ---');
    await page.goto(`${BASE_URL}/ayarlar`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 600));

    // Switch to 'kullanicilar' tab in SettingsSidebarNav
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const userTabBtn = buttons.find((b) => b.textContent && b.textContent.includes('Kullanıcı Yönetimi'));
      if (userTabBtn) userTabBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    // Open UserModal by clicking "+ Yeni Kullanıcı Ekle"
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find((b) => b.textContent && b.textContent.includes('Yeni Kullanıcı Ekle'));
      if (addBtn) addBtn.click();
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 300));

    // 1.1 Modal Shell & A11y Attributes
    const userModalA11y = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (!dialog) return null;
      const title = dialog.querySelector('h3')?.textContent?.trim();
      const icon = dialog.querySelector('.material-symbols-outlined')?.textContent?.trim();
      const hasForm = Boolean(dialog.querySelector('form#user-modal-form'));
      const hasNameField = Boolean(document.getElementById('user-form-name'));
      const hasEmailField = Boolean(document.getElementById('user-form-email'));
      const hasPhoneField = Boolean(document.getElementById('user-form-phone'));
      const hasRoleField = Boolean(document.getElementById('user-form-role'));
      const hasStatusField = Boolean(document.getElementById('user-form-status'));
      const hasAvatarField = Boolean(document.getElementById('user-form-avatar'));
      const footerBtn = Boolean(document.querySelector('button[form="user-modal-form"]'));

      return {
        hasDialog: true,
        title,
        icon,
        hasForm,
        hasNameField,
        hasEmailField,
        hasPhoneField,
        hasRoleField,
        hasStatusField,
        hasAvatarField,
        footerBtn,
      };
    });

    record(
      'UserModal: BaseModal ve FormField iskeleti render edildi',
      userModalA11y &&
        userModalA11y.hasDialog &&
        userModalA11y.title === 'Yeni Kullanıcı / Danışman Ekle' &&
        userModalA11y.icon === 'person_add' &&
        userModalA11y.hasNameField &&
        userModalA11y.hasEmailField &&
        userModalA11y.footerBtn,
      `Başlık: "${userModalA11y?.title}", İkon: "${userModalA11y?.icon}"`
    );

    // 1.2 Form Validation on Empty Inputs
    await page.evaluate(() => {
      const submitBtn = document.querySelector('button[form="user-modal-form"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    const userValErrors = await page.evaluate(() => {
      const alerts = Array.from(document.querySelectorAll('[role="dialog"] [role="alert"]'));
      return alerts.map((a) => a.textContent?.trim());
    });

    const hasNameErr = userValErrors.some((e) => e && e.includes('en az 2 karakter'));
    const hasEmailErr = userValErrors.some((e) => e && e.includes('kurumsal e-posta'));

    record(
      'UserModal: Zorunlu alan validasyon hataları FormField altında görüntülendi',
      hasNameErr && hasEmailErr,
      `Hatalar: ${userValErrors.join(' | ')}`
    );

    // 1.3 Format Validation on Invalid Email & Phone
    await page.evaluate(() => {
      const setVal = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      setVal(document.getElementById('user-form-name'), 'M');
      setVal(document.getElementById('user-form-email'), 'invalid-email');
      setVal(document.getElementById('user-form-phone'), '123');
      const submitBtn = document.querySelector('button[form="user-modal-form"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    const formatErrors = await page.evaluate(() => {
      const alerts = Array.from(document.querySelectorAll('[role="dialog"] [role="alert"]'));
      return alerts.map((a) => a.textContent?.trim());
    });

    record(
      'UserModal: Geçersiz format validasyonu (kısa ad, geçersiz e-posta, geçersiz telefon) yakalandı',
      formatErrors.length >= 2,
      `Yakalanan format hataları: ${formatErrors.length} (${formatErrors.join(' | ')})`
    );

    // 1.4 Add New User Successfully
    await page.evaluate(() => {
      const setInput = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      const setSelect = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };

      setInput(document.getElementById('user-form-name'), 'Zeynep Yılmaz');
      setInput(document.getElementById('user-form-email'), 'zeynep@emlakpro.com.tr');
      setInput(document.getElementById('user-form-phone'), '05321234567');
      setSelect(document.getElementById('user-form-role'), 'Ofis Müdürü');
      setSelect(document.getElementById('user-form-status'), 'Aktif');

      const submitBtn = document.querySelector('button[form="user-modal-form"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const isUserModalClosedAfterSave = await page.evaluate(() => {
      return !document.querySelector('[role="dialog"]');
    });

    const isNewUserInList = await page.evaluate(() => {
      const tableText = document.querySelector('table')?.textContent || '';
      return tableText.includes('Zeynep Yılmaz') && tableText.includes('zeynep@emlakpro.com.tr');
    });

    record(
      'UserModal: Yeni kullanıcı başarıyla kaydedildi ve kullanıcı tablosuna eklendi',
      isUserModalClosedAfterSave && isNewUserInList,
      'Kullanıcı listesi güncellendi, modal kapandı'
    );

    // 1.5 Edit Existing User
    await page.evaluate(() => {
      // Find Zeynep row and click Edit
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      const zeynepRow = rows.find((r) => r.textContent && r.textContent.includes('Zeynep Yılmaz'));
      if (zeynepRow) {
        const editBtn = zeynepRow.querySelector('button[title="Düzenle"]');
        if (editBtn) editBtn.click();
      }
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 400));

    const editUserModalState = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return null;
      const title = dialog.querySelector('h3')?.textContent?.trim();
      const icon = dialog.querySelector('.material-symbols-outlined')?.textContent?.trim();
      const nameVal = document.getElementById('user-form-name')?.value;
      const emailVal = document.getElementById('user-form-email')?.value;
      const roleVal = document.getElementById('user-form-role')?.value;
      const submitText = dialog.querySelector('button[form="user-modal-form"]')?.textContent?.trim();
      return { title, icon, nameVal, emailVal, roleVal, submitText };
    });

    record(
      'UserModal: Düzenleme modunda mevcut veriler FormField bileşenlerine aktarıldı',
      editUserModalState &&
        editUserModalState.title === 'Kullanıcıyı Düzenle' &&
        editUserModalState.nameVal === 'Zeynep Yılmaz' &&
        editUserModalState.submitText === 'Güncelle',
      `Başlık: "${editUserModalState?.title}", Buton: "${editUserModalState?.submitText}"`
    );

    // Update name to 'Zeynep Yılmaz Kaya' and save
    await page.evaluate(() => {
      const setInput = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      const setSelect = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      setInput(document.getElementById('user-form-name'), 'Zeynep Yılmaz Kaya');
      setSelect(document.getElementById('user-form-role'), 'Yönetici');

      const submitBtn = document.querySelector('button[form="user-modal-form"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const isUpdatedInList = await page.evaluate(() => {
      const tableText = document.querySelector('table')?.textContent || '';
      return tableText.includes('Zeynep Yılmaz Kaya') && tableText.includes('Yönetici');
    });

    record(
      'UserModal: Kullanıcı bilgileri güncellendi ve tabloya yansıdı',
      isUpdatedInList,
      'Zeynep Yılmaz Kaya (Yönetici) tabloda onaylandı'
    );

    // 1.6 Escape & Backdrop Dismissal
    await page.evaluate(() => {
      const addBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent && b.textContent.includes('Yeni Kullanıcı Ekle')
      );
      if (addBtn) addBtn.click();
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 300));

    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 400));
    const closedOnEsc = await page.evaluate(() => !document.querySelector('[role="dialog"]'));

    record(
      'UserModal: ESC tuşu ile modal sorunsuz kapandı',
      closedOnEsc,
      'BaseModal useModalBehavior ESC entegrasyonu başarılı'
    );

    // =========================================================================
    // 2. TaskFormModal E2E Tests (/gorevler)
    // =========================================================================
    console.log('\n--- TEST GRUBU 2: TaskFormModal (BaseModal + FormField) ---');
    await page.goto(`${BASE_URL}/gorevler`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 600));

    // Open TaskFormModal via "Görev Ekle" button in TaskHeader
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const taskBtn = buttons.find((b) => b.textContent && b.textContent.includes('Görev Ekle'));
      if (taskBtn) taskBtn.click();
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 300));

    // 2.1 Modal Shell & A11y Attributes
    const taskModalA11y = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (!dialog) return null;
      const title = dialog.querySelector('h3')?.textContent?.trim();
      const icon = dialog.querySelector('.material-symbols-outlined')?.textContent?.trim();
      const hasForm = Boolean(dialog.querySelector('form#task-modal-form'));
      const hasTitleField = Boolean(document.getElementById('task-form-title'));
      const hasDescField = Boolean(document.getElementById('task-form-desc'));
      const hasPriorityField = Boolean(document.getElementById('task-form-priority'));
      const hasAssignedField = Boolean(document.getElementById('task-form-assigned-to'));
      const hasDueDateField = Boolean(document.getElementById('task-form-due-date'));
      const hasDueTimeField = Boolean(document.getElementById('task-form-due-time'));
      const footerBtn = Boolean(document.querySelector('button[form="task-modal-form"]'));

      return {
        hasDialog: true,
        title,
        icon,
        hasForm,
        hasTitleField,
        hasDescField,
        hasPriorityField,
        hasAssignedField,
        hasDueDateField,
        hasDueTimeField,
        footerBtn,
      };
    });

    record(
      'TaskFormModal: BaseModal ve FormField iskeleti render edildi',
      taskModalA11y &&
        taskModalA11y.hasDialog &&
        taskModalA11y.title === 'Yeni Görev Ekle' &&
        taskModalA11y.icon === 'add_task' &&
        taskModalA11y.hasTitleField &&
        taskModalA11y.hasDescField &&
        taskModalA11y.hasPriorityField &&
        taskModalA11y.footerBtn,
      `Başlık: "${taskModalA11y?.title}", İkon: "${taskModalA11y?.icon}"`
    );

    // 2.2 Validation on Empty Title
    await page.evaluate(() => {
      const titleInput = document.getElementById('task-form-title');
      if (titleInput) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(titleInput, '');
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const submitBtn = document.querySelector('button[form="task-modal-form"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    const taskValErr = await page.evaluate(() => {
      const alertP = document.querySelector('[role="dialog"] [role="alert"]');
      return alertP ? alertP.textContent?.trim() : null;
    });

    record(
      'TaskFormModal: Boş başlık validasyon hatası FormField altında görüntülendi',
      taskValErr && taskValErr.includes('en az 3 karakter'),
      `Hata mesajı: "${taskValErr}"`
    );

    // 2.3 Create New Task Successfully
    await page.evaluate(() => {
      const setInput = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      const setSelect = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const setTextarea = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };

      setInput(document.getElementById('task-form-title'), 'Aşama 3.2 Modalları Test Et');
      setTextarea(document.getElementById('task-form-desc'), 'BaseModal ve FormField entegrasyonu doğrulama görevi');
      setSelect(document.getElementById('task-form-priority'), 'urgent');
      setSelect(document.getElementById('task-form-assigned-to'), 'Burak Yılmaz');

      const submitBtn = document.querySelector('button[form="task-modal-form"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const isTaskInList = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Aşama 3.2 Modalları Test Et');
    });

    record(
      'TaskFormModal: Yeni görev başarıyla eklendi ve görev listesinde yer aldı',
      isTaskInList,
      'Yeni görev listeye kaydedildi'
    );

    // 2.4 Edit Existing Task
    await page.evaluate(() => {
      // Find the card and click Düzenle
      const cards = Array.from(document.querySelectorAll('.group'));
      const testCard = cards.find((c) => c.textContent && c.textContent.includes('Aşama 3.2 Modalları Test Et'));
      if (testCard) {
        const editBtn = testCard.querySelector('button[title="Düzenle"]');
        if (editBtn) editBtn.click();
      }
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 400));

    const editTaskModalState = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return null;
      const title = dialog.querySelector('h3')?.textContent?.trim();
      const titleVal = document.getElementById('task-form-title')?.value;
      const submitText = dialog.querySelector('button[form="task-modal-form"]')?.textContent?.trim();
      return { title, titleVal, submitText };
    });

    record(
      'TaskFormModal: Düzenleme modunda mevcut görev bilgileri formda gösterildi',
      editTaskModalState &&
        editTaskModalState.title === 'Görevi Düzenle' &&
        editTaskModalState.titleVal === 'Aşama 3.2 Modalları Test Et' &&
        editTaskModalState.submitText?.includes('Görevi Güncelle'),
      `Başlık: "${editTaskModalState?.title}", Değer: "${editTaskModalState?.titleVal}"`
    );

    // Dismiss edit modal via "Vazgeç"
    await page.evaluate(() => {
      const cancelBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(
        (b) => b.textContent && b.textContent.includes('Vazgeç')
      );
      if (cancelBtn) cancelBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    const isTaskModalDismissed = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
    record(
      'TaskFormModal: "Vazgeç" butonu ile modal başarıyla kapatıldı',
      isTaskModalDismissed,
      'Dismiss callback düzgün çalışıyor'
    );

    // =========================================================================
    // 3. PortalConfigModal E2E Tests (Settings -> Portal Entegrasyonları)
    // =========================================================================
    console.log('\n--- TEST GRUBU 3: PortalConfigModal (BaseModal + FormField) ---');
    await page.goto(`${BASE_URL}/ayarlar`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 600));

    // Switch to 'portallar' tab
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const portalTabBtn = buttons.find((b) => b.textContent && b.textContent.includes('Portal Entegrasyonları'));
      if (portalTabBtn) portalTabBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    // Find and click 'API Yönet' button on the Sahibinden portal card
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const apiManageBtn = buttons.find((b) => b.textContent && b.textContent.trim() === 'API Yönet');
      if (apiManageBtn) apiManageBtn.click();
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 300));

    // 3.1 Modal Shell & Security Notice
    const portalModalA11y = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (!dialog) return null;
      const title = dialog.querySelector('h3')?.textContent?.trim();
      const icon = dialog.querySelector('.material-symbols-outlined')?.textContent?.trim();
      const hasSecurityNotice = Boolean(dialog.querySelector('strong')?.textContent?.includes('Simülatör & Güvenlik Bildirimi'));
      const hasApiKeyField = Boolean(document.getElementById('portal-api-key'));
      const hasEndpointField = Boolean(document.getElementById('portal-api-endpoint'));
      const hasTestBtn = Boolean(
        Array.from(dialog.querySelectorAll('button')).find(
          (b) => b.textContent && b.textContent.includes('API Bağlantısını Test Et')
        )
      );
      const footerBtn = Boolean(document.querySelector('button[form="portal-config-form"]'));

      return {
        hasDialog: true,
        title,
        icon,
        hasSecurityNotice,
        hasApiKeyField,
        hasEndpointField,
        hasTestBtn,
        footerBtn,
      };
    });

    record(
      'PortalConfigModal: BaseModal ve FormField ile güvenlik bildirimi render edildi',
      portalModalA11y &&
        portalModalA11y.hasDialog &&
        portalModalA11y.title?.includes('Sahibinden') &&
        portalModalA11y.icon === 'hub' &&
        portalModalA11y.hasSecurityNotice &&
        portalModalA11y.hasApiKeyField &&
        portalModalA11y.hasTestBtn &&
        portalModalA11y.footerBtn,
      `Başlık: "${portalModalA11y?.title}", İkon: "${portalModalA11y?.icon}"`
    );

    // 3.2 Test Connection Simulation - Short Key Error
    await page.evaluate(() => {
      const keyInput = document.getElementById('portal-api-key');
      if (keyInput) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(keyInput, 'shb_12');
        keyInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const testBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(
        (b) => b.textContent && b.textContent.includes('API Bağlantısını Test Et')
      );
      if (testBtn) testBtn.click();
    });
    await new Promise((r) => setTimeout(r, 200));

    const shortKeyMsg = await page.evaluate(() => {
      return document.querySelector('[role="dialog"]')?.textContent || '';
    });

    record(
      'PortalConfigModal: Kısa API anahtarı hata durumu yakalandı',
      shortKeyMsg.includes('En az 8 karakter olmalıdır'),
      'Biçim Hatası simülasyonu doğrulandı'
    );

    // 3.3 Test Connection Simulation - Valid Key
    await page.evaluate(() => {
      const keyInput = document.getElementById('portal-api-key');
      if (keyInput) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(keyInput, 'shb_live_secure_api_key_889911');
        keyInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const testBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(
        (b) => b.textContent && b.textContent.includes('API Bağlantısını Test Et')
      );
      if (testBtn) testBtn.click();
    });
    // Wait for 500ms setTimeout in test connection
    await new Promise((r) => setTimeout(r, 700));

    const testSuccessMsg = await page.evaluate(() => {
      return document.querySelector('[role="dialog"]')?.textContent || '';
    });

    record(
      'PortalConfigModal: Geçerli test anahtarı simülasyonu başarıyla onaylandı',
      testSuccessMsg.includes('Şema Formatı Geçerli (Simülasyon)'),
      'Simülatör API yanıtı alındı'
    );

    // 3.4 Save Portal Config
    await page.evaluate(() => {
      const saveBtn = document.querySelector('button[form="portal-config-form"]');
      if (saveBtn) saveBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const isPortalModalClosed = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
    const isConfiguredInCard = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.p-space-md.rounded-xl.bg-surface-container-low.border'));
      const sahibindenCard = cards.find((c) => c.textContent && c.textContent.includes('Sahibinden'));
      return Boolean(sahibindenCard && sahibindenCard.textContent.includes('Yapılandırıldı (Simülasyon)'));
    });

    record(
      'PortalConfigModal: Ayarlar kaydedildi ve portal kartı durumu güncellendi',
      isPortalModalClosed && isConfiguredInCard,
      'Sahibinden: "Yapılandırıldı (Simülasyon)" olarak kaydedildi'
    );

    // 3.5 Backdrop Dismissal
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const apiManageBtn = buttons.find((b) => b.textContent && b.textContent.trim() === 'API Yönet');
      if (apiManageBtn) apiManageBtn.click();
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 400));

    // Click backdrop overlay
    await page.evaluate(() => {
      const backdrop = document.querySelector('.fixed.inset-0.z-50');
      if (backdrop) backdrop.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    const closedOnBackdrop = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
    record(
      'PortalConfigModal: Backdrop tıklaması ile modal güvenle kapandı',
      closedOnBackdrop,
      'useModalBehavior handleBackdropClick başarılı'
    );

    // =========================================================================
    // 4. Responsive Viewport Check (375px Mobile vs 1440px Desktop)
    // =========================================================================
    console.log('\n--- TEST GRUBU 4: Responsive Viewport & Taşıma Kontrolü ---');
    await page.setViewport({ width: 375, height: 667 }); // iPhone SE
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const apiManageBtn = buttons.find((b) => b.textContent && b.textContent.trim() === 'API Yönet');
      if (apiManageBtn) apiManageBtn.click();
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 400));

    const mobileLayout = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return null;
      const modalBox = dialog.querySelector('.max-w-lg') || dialog.querySelector('div > div');
      if (!modalBox) return null;
      const rect = modalBox.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const hasHorizontalOverflow = rect.width > viewportWidth;
      const isVisibleWithinViewport = rect.left >= 0 && rect.right <= viewportWidth + 5;
      return { width: rect.width, viewportWidth, hasHorizontalOverflow, isVisibleWithinViewport };
    });

    record(
      'Responsive Kontrolü (375px Mobil): BaseModal mobil ekrana yatay taşma olmadan sığdı',
      mobileLayout && !mobileLayout.hasHorizontalOverflow && mobileLayout.isVisibleWithinViewport,
      `Modal genişliği: ${Math.round(mobileLayout?.width || 0)}px / Viewport: ${mobileLayout?.viewportWidth}px`
    );

    // Close modal
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

runSmallFormModalsTests();
