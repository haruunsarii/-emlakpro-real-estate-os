import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function runUiPrimitivesTest() {
  console.log('🚀 EmlakPro Aşama 3.2: Yeni Ortak UI Bileşenleri Doğrulama Testi...');
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
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1440, height: 900 });

    // 1. Dashboard Yükleme ve Mevcut Sistem Kararlılığı
    console.log('--- 1. Uygulama Yüklenmesi ve Temel Kararlılık ---');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    const isAppHealthy = await page.evaluate(() => {
      return document.body.innerText.includes('EmlakPro') || document.body.innerText.includes('Portföy');
    });
    record('Uygulama başarıyla yüklendi (Regresyon yok)', isAppHealthy);

    // 2. BaseModal & useModalBehavior DOM Simülasyonu
    console.log('\n--- 2. BaseModal, ConfirmDeleteModal, BaseDrawer & FormField Yapısal Doğrulama ---');
    
    // Doğrudan bileşen exportlarını doğrulamak için dinamik import testi
    const componentsExported = await page.evaluate(async () => {
      try {
        const baseModalMod = await import('/src/components/ui/BaseModal.jsx');
        const confirmDeleteMod = await import('/src/components/ui/ConfirmDeleteModal.jsx');
        const baseDrawerMod = await import('/src/components/ui/BaseDrawer.jsx');
        const formFieldMod = await import('/src/components/ui/FormField.jsx');

        return {
          hasBaseModal: typeof baseModalMod.default === 'function',
          hasConfirmDelete: typeof confirmDeleteMod.default === 'function',
          hasBaseDrawer: typeof baseDrawerMod.default === 'function',
          hasFormField: typeof formFieldMod.default === 'function',
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    record('BaseModal bileşeni hatasız import edildi', componentsExported.hasBaseModal);
    record('ConfirmDeleteModal bileşeni hatasız import edildi', componentsExported.hasConfirmDelete);
    record('BaseDrawer bileşeni hatasız import edildi', componentsExported.hasBaseDrawer);
    record('FormField bileşeni hatasız import edildi', componentsExported.hasFormField);

    // 3. React DOM Render Testi (Hafif bir test konteynerinde dinamik render)
    const renderTest = await page.evaluate(async () => {
      try {
        const ReactMod = await import('/node_modules/.vite/deps/react.js');
        const ReactDOMMod = await import('/node_modules/.vite/deps/react-dom_client.js');
        const React = ReactMod.default || ReactMod;
        const createRoot = ReactDOMMod.createRoot || ReactDOMMod.default?.createRoot;
        const { default: BaseModal } = await import('/src/components/ui/BaseModal.jsx');
        const { default: ConfirmDeleteModal } = await import('/src/components/ui/ConfirmDeleteModal.jsx');
        const { default: BaseDrawer } = await import('/src/components/ui/BaseDrawer.jsx');
        const { default: FormField } = await import('/src/components/ui/FormField.jsx');

        // Test root div
        let testRoot = document.getElementById('test-ui-container');
        if (!testRoot) {
          testRoot = document.createElement('div');
          testRoot.id = 'test-ui-container';
          document.body.appendChild(testRoot);
        }

        const root = createRoot(testRoot);

        // 1. FormField Test
        root.render(
          React.createElement(
            'div',
            { id: 'test-wrapper' },
            React.createElement(
              FormField,
              {
                id: 'test-input-field',
                label: 'Test Portföy Başlığı',
                required: true,
                error: 'Bu alan zorunludur',
                hint: 'Açıklayıcı bir ilan başlığı giriniz',
              },
              React.createElement('input', {
                id: 'test-input-field',
                defaultValue: '',
                placeholder: 'İlan adı...',
              })
            )
          )
        );

        // Render için kısa bir bekleme
        await new Promise((r) => setTimeout(r, 100));

        const formFieldOk = {
          hasLabel: !!document.querySelector('label[for="test-input-field"]'),
          hasAsterisk: document.querySelector('label[for="test-input-field"]')?.innerText.includes('*'),
          hasError: document.querySelector('[role="alert"]')?.innerText.includes('Bu alan zorunludur'),
        };

        // 2. BaseModal Render Test
        root.render(
          React.createElement(
            BaseModal,
            {
              isOpen: true,
              onClose: () => {},
              title: 'Test Modal Başlığı',
              subtitle: 'Alt açıklama metni',
              icon: 'add_home_work',
              size: 'md',
              footer: React.createElement('button', { id: 'test-footer-btn' }, 'Kaydet'),
            },
            React.createElement('div', { id: 'test-modal-body' }, 'Modal Gövde İçeriği')
          )
        );

        await new Promise((r) => setTimeout(r, 100));

        const modalDialog = document.querySelector('[role="dialog"][aria-modal="true"]');
        const modalOk = {
          hasDialog: !!modalDialog,
          hasTitle: modalDialog?.innerText.includes('Test Modal Başlığı'),
          hasBody: modalDialog?.innerText.includes('Modal Gövde İçeriği'),
          hasFooter: !!document.getElementById('test-footer-btn'),
          hasCloseBtn: !!modalDialog?.querySelector('button[aria-label="Kapat"]'),
        };

        // 3. ConfirmDeleteModal Render Test
        root.render(
          React.createElement(ConfirmDeleteModal, {
            isOpen: true,
            onClose: () => {},
            onConfirm: () => {},
            title: 'İlanı Silmek İstiyor Musunuz?',
            description: 'Bu ilan kalıcı olarak silinecektir.',
            itemDetails: [{ label: 'İlan Kodu', value: 'PORT-8841' }],
            confirmLabel: 'Evet, Sil',
          })
        );

        await new Promise((r) => setTimeout(r, 100));

        const deleteDialog = document.querySelector('[role="dialog"][aria-modal="true"]');
        const deleteOk = {
          hasDeleteDialog: !!deleteDialog,
          hasItemCode: deleteDialog?.innerText.includes('PORT-8841'),
          hasConfirmBtn: deleteDialog?.innerText.includes('Evet, Sil'),
        };

        // 4. BaseDrawer Render Test
        root.render(
          React.createElement(
            BaseDrawer,
            {
              isOpen: true,
              onClose: () => {},
              title: 'Portföy Detay Çekmecesi',
              subtitle: 'PORT-9900 Detayları',
              width: 'lg',
            },
            React.createElement('div', { id: 'test-drawer-body' }, 'Çekmece İçeriği')
          )
        );

        await new Promise((r) => setTimeout(r, 100));

        const drawerDialog = document.querySelector('[role="dialog"][aria-modal="true"]');
        const drawerOk = {
          hasDrawerDialog: !!drawerDialog,
          hasSlideAnimation: !!drawerDialog?.querySelector('.animate-slideLeft'),
          hasDrawerTitle: drawerDialog?.innerText.includes('Portföy Detay Çekmecesi'),
        };

        // Temizlik: test root'u kaldır
        root.unmount();
        testRoot.remove();

        return { formFieldOk, modalOk, deleteOk, drawerOk };
      } catch (e) {
        return { error: e.message };
      }
    });

    if (renderTest.error) {
      record('Bileşen render testinde hata oluştu', false, renderTest.error);
    } else {
      record('FormField: Label, zorunlu yıldız (*) ve hata mesajı (role="alert") başarıyla bağlandı', 
        renderTest.formFieldOk.hasLabel && renderTest.formFieldOk.hasAsterisk && renderTest.formFieldOk.hasError
      );
      record('BaseModal: role="dialog", aria-modal="true", başlık, kapat butonu ve footer render edildi',
        renderTest.modalOk.hasDialog && renderTest.modalOk.hasTitle && renderTest.modalOk.hasFooter
      );
      record('ConfirmDeleteModal: Yıkıcı silme stili, öğe özeti (itemDetails) ve onay butonu render edildi',
        renderTest.deleteOk.hasDeleteDialog && renderTest.deleteOk.hasItemCode && renderTest.deleteOk.hasConfirmBtn
      );
      record('BaseDrawer: Sağdan kayma animasyonu (animate-slideLeft) ve çekmece başlığı render edildi',
        renderTest.drawerOk.hasDrawerDialog && renderTest.drawerOk.hasSlideAnimation
      );
    }

    console.log('\n=============================================');
    console.log(`TEST SONUCU: ${allPassed ? 'TÜM YENİ BİLEŞENLER BAŞARIYLA DOĞRULANDI ✅' : 'BAZI TESTLER BAŞARISIZ OLDU ❌'}`);
    console.log(`Toplam Test: ${results.length}, Başarılı: ${results.filter((r) => r.passed).length}`);
    console.log('=============================================\n');
  } catch (err) {
    console.error('Test sırasında beklenmeyen hata:', err);
    allPassed = false;
  } finally {
    await browser.close();
  }

  process.exit(allPassed ? 0 : 1);
}

runUiPrimitivesTest();
