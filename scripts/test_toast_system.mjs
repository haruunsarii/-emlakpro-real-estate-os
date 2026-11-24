import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function runToastTests() {
  console.log('🚀 EmlakPro Merkezi Toast Bildirim Sistemi Testi Başlatılıyor...');
  console.log(`Tarayıcı: ${CHROME_PATH}`);
  console.log(`Hedef URL: ${BASE_URL}\n`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  let allPassed = true;
  const testResults = [];

  function record(testName, passed, details = '') {
    testResults.push({ testName, passed, details });
    if (passed) {
      console.log(`  ✓ ${testName} ${details ? `(${details})` : ''}`);
    } else {
      allPassed = false;
      console.error(`  ✗ ${testName} - BAŞARISIZ! ${details}`);
    }
  }

  try {
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    // TEST 1: 4 Bildirim Türü (Success, Error, Warning, Info) ve ARIA Rolleri
    console.log('\n--- 1. Dört Bildirim Türü ve ARIA Rolleri Testi ---');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('emlakpro_toast', {
        detail: { message: 'İşlem başarıyla tamamlandı.', type: 'success', options: { title: 'Kayıt Başarılı' } }
      }));
      window.dispatchEvent(new CustomEvent('emlakpro_toast', {
        detail: { message: 'Sunucu bağlantı hatası oluştu.', type: 'error', options: { title: 'Bağlantı Hatası' } }
      }));
      window.dispatchEvent(new CustomEvent('emlakpro_toast', {
        detail: { message: 'Lütfen dikkat: Bu işlem geri alınamaz.', type: 'warning', options: { title: 'Sistem Uyarısı' } }
      }));
      window.dispatchEvent(new CustomEvent('emlakpro_toast', {
        detail: { message: 'Yeni portföy eşleşmesi bulundu.', type: 'info', options: { title: 'Bilgilendirme' } }
      }));
    });
    await new Promise((r) => setTimeout(r, 400));

    const toastTypesCheck = await page.evaluate(() => {
      const toasts = document.querySelectorAll('[data-testid="toast-item"]');
      const types = Array.from(toasts).map((t) => ({
        type: t.getAttribute('data-toast-type'),
        role: t.getAttribute('role'),
        text: t.textContent,
      }));
      return types;
    });

    const hasSuccess = toastTypesCheck.some((t) => t.type === 'success' && t.role === 'status');
    const hasError = toastTypesCheck.some((t) => t.type === 'error' && t.role === 'alert');
    const hasWarning = toastTypesCheck.some((t) => t.type === 'warning' && t.role === 'alert');
    const hasInfo = toastTypesCheck.some((t) => t.type === 'info' && t.role === 'status');

    record('Success Toast (role="status")', hasSuccess);
    record('Error Toast (role="alert")', hasError);
    record('Warning Toast (role="alert")', hasWarning);
    record('Info Toast (role="status")', hasInfo);

    // TEST 2: Manuel Kapatma ('X' Butonu ile Dismiss)
    console.log('\n--- 2. Manuel Kapatma (Dismiss Butonu) Testi ---');
    const initialCount = await page.evaluate(() => document.querySelectorAll('[data-testid="toast-item"]').length);
    const closeBtn = await page.$('[data-testid="toast-item"] button[aria-label="Bildirimi Kapat"]');
    if (closeBtn) {
      await closeBtn.click();
      await new Promise((r) => setTimeout(r, 400)); // Animasyon süresi
      const countAfterClose = await page.evaluate(() => document.querySelectorAll('[data-testid="toast-item"]').length);
      record('Manuel Kapatma Butonu', countAfterClose === initialCount - 1, `Önce: ${initialCount}, Sonra: ${countAfterClose}`);
    } else {
      record('Manuel Kapatma Butonu', false, 'Kapatma butonu bulunamadı');
    }

    // TEST 3: Otomatik Kapanma (Auto-dismiss Duration)
    console.log('\n--- 3. Otomatik Kapanma (Auto-Dismiss) Testi ---');
    await page.evaluate(() => {
      // 1000ms süreli özel bir test bildirimi
      window.dispatchEvent(new CustomEvent('emlakpro_toast', {
        detail: { message: 'Otomatik kapanacak test bildirimi.', type: 'info', options: { duration: 1000 } }
      }));
    });
    await new Promise((r) => setTimeout(r, 300));
    const existsInitially = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-testid="toast-item"]')).some(t => t.textContent.includes('Otomatik kapanacak'));
    });
    record('Kısa Süreli Toast Eklendi', existsInitially);

    // 1100ms + 300ms animasyon bekle
    await new Promise((r) => setTimeout(r, 1400));
    const existsAfterTimeout = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-testid="toast-item"]')).some(t => t.textContent.includes('Otomatik kapanacak'));
    });
    record('Süre Sonunda Otomatik Kapanma', !existsAfterTimeout, 'Süre dolunca DOM dan kaldırıldı');

    // TEST 4: Yinelenen Bildirim Koruması (Deduplication)
    console.log('\n--- 4. Yinelenen Bildirim Koruması (Deduplication) Testi ---');
    const beforeDedupeCount = await page.evaluate(() => document.querySelectorAll('[data-testid="toast-item"]').length);
    await page.evaluate(() => {
      // Hızlıca 3 kez aynı mesajı gönder
      for (let i = 0; i < 3; i++) {
        window.dispatchEvent(new CustomEvent('emlakpro_toast', {
          detail: { message: 'Aynı bildirim tekrarı denemesi.', type: 'warning' }
        }));
      }
    });
    await new Promise((r) => setTimeout(r, 300));
    const afterDedupeCount = await page.evaluate(() => document.querySelectorAll('[data-testid="toast-item"]').length);
    const addedCount = afterDedupeCount - beforeDedupeCount;
    record('Deduplication / Spam Önleme', addedCount === 1, `3 kez tetiklendi, eklenen kart sayısı: ${addedCount}`);

    // TEST 5: Maksimum Yığılma Sınırı (Max Limit: 5 Toasts)
    console.log('\n--- 5. Maksimum Yığılma Sınırı (Max Toasts: 5) Testi ---');
    await page.evaluate(() => {
      for (let i = 1; i <= 8; i++) {
        window.dispatchEvent(new CustomEvent('emlakpro_toast', {
          detail: { message: `Farklı Bildirim No ${i} - ${Date.now()}`, type: 'info' }
        }));
      }
    });
    await new Promise((r) => setTimeout(r, 400));
    const stackedCount = await page.evaluate(() => document.querySelectorAll('[data-testid="toast-item"]').length);
    record('Maksimum Toast Sınırı', stackedCount <= 5, `Görüntülenen: ${stackedCount} (Hedef max: 5)`);

    // TEST 6: Mobil (375px) Görünümü & Konumlandırma
    console.log('\n--- 6. Mobil (375px) ve Masaüstü Konumlandırma Testi ---');
    await page.setViewport({ width: 375, height: 667 });
    await new Promise((r) => setTimeout(r, 300));

    const mobileLayoutCheck = await page.evaluate(() => {
      const container = document.querySelector('[data-testid="toast-container"]');
      if (!container) return { exists: false };
      const rect = container.getBoundingClientRect();
      const style = window.getComputedStyle(container);
      const docScrollWidth = document.documentElement.scrollWidth;
      return {
        exists: true,
        zIndex: style.zIndex,
        pointerEvents: style.pointerEvents,
        width: rect.width,
        right: rect.right,
        noHorizontalOverflow: docScrollWidth <= 376,
      };
    });
    record('Mobil Toast Konteyner Mevcut', mobileLayoutCheck.exists);
    record('Mobil z-index Koruması (9999)', mobileLayoutCheck.zIndex === '9999', `z-index: ${mobileLayoutCheck.zIndex}`);
    record('Arka Plandaki Butonlara Tıklanabilir (pointer-events-none)', mobileLayoutCheck.pointerEvents === 'none');
    record('Mobil Ekranı Dışarı Taşırmama', mobileLayoutCheck.noHorizontalOverflow);

    // Geri 1440px masaüstüne dön
    await page.setViewport({ width: 1440, height: 900 });

    // TEST 7: Modal Açıkken Toast Görünürlüğü (Z-Index Layering)
    console.log('\n--- 7. Modal Açıkken Toast Görünürlüğü Testi ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));

    // Dashboard'ta "Müşteri Ekle" butonuna tıkla
    const openedModal = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find((b) => b.textContent.includes('Müşteri Ekle'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (openedModal) {
      await new Promise((r) => setTimeout(r, 400));

      // Modal açıkken form submit yap (boş form -> validation error)
      const clickedSubmit = await page.evaluate(() => {
        const modalForm = document.querySelector('form');
        if (modalForm) {
          const submitBtn = modalForm.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.click();
            return true;
          }
        }
        return false;
      });

      if (clickedSubmit) {
        await new Promise((r) => setTimeout(r, 400));

        // Toast container ve toast-item kontrolü
        const modalToastCheck = await page.evaluate(() => {
          const errorToast = document.querySelector('[data-testid="toast-item"][data-toast-type="error"]');
          const modalBackdrop = document.querySelector('.fixed.inset-0.z-50');
          if (!errorToast || !modalBackdrop) return { success: false, hasErrorToast: false };

          const toastZ = window.getComputedStyle(errorToast.parentElement).zIndex;
          const modalZ = window.getComputedStyle(modalBackdrop).zIndex;

          return {
            success: true,
            hasErrorToast: true,
            toastText: errorToast.textContent,
            toastZ: parseInt(toastZ, 10),
            modalZ: parseInt(modalZ, 10),
            isAboveModal: parseInt(toastZ, 10) > parseInt(modalZ, 10),
          };
        });

        record('Form Validasyon Hatasında Error Toast', modalToastCheck.hasErrorToast, modalToastCheck.toastText ? `Mesaj: ${modalToastCheck.toastText.slice(0, 50)}...` : '');
        record('Toast Modaldan Daha Üst Katmanda (z-9999 > z-50)', modalToastCheck.isAboveModal, `Toast Z: ${modalToastCheck.toastZ}, Modal Z: ${modalToastCheck.modalZ}`);
      }
    }

    // TEST 8: Gerçek Sayfa CRUD İşlemleri (Gayrimenkul Favori & Ayarlar Kaydet)
    console.log('\n--- 8. Gerçek Sayfa CRUD & Aksiyon Bildirimleri Testi ---');

    // 8a: Gayrimenkuller Ekranında Favori Toggle
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));

    const bookmarkBtn = await page.$('button[title="Favorilere Ekle"]');
    if (bookmarkBtn) {
      await bookmarkBtn.click();
      await new Promise((r) => setTimeout(r, 400));

      const bookmarkToastText = await page.evaluate(() => {
        const toast = document.querySelector('[data-testid="toast-item"]');
        return toast ? toast.textContent : '';
      });
      record('Gayrimenkul Favorilere Ekleme Toast', bookmarkToastText.includes('favorilere eklendi') || bookmarkToastText.includes('favori'), bookmarkToastText);
    }

    // 8b: Ayarlar Ekranında Değişiklikleri Kaydet
    await page.goto(`${BASE_URL}/ayarlar`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));

    // Sayfadaki "Değişiklikleri Kaydet" butonunu bul
    const foundSaveBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Kaydet'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (foundSaveBtn) {
      await new Promise((r) => setTimeout(r, 400));
      const settingsToastText = await page.evaluate(() => {
        const toast = document.querySelector('[data-testid="toast-item"]');
        return toast ? toast.textContent : '';
      });
      record('Ayarlar Kaydetme Başarı Toast', settingsToastText.includes('kaydedildi'), settingsToastText);
    }

  } finally {
    await browser.close();
  }

  console.log(`\n========================================`);
  console.log(`📋 MERKEZİ TOAST SİSTEMİ TEST SONUCU: ${allPassed ? '✅ TÜM TESTLER BAŞARILI' : '❌ HATALAR MEVCUT'}`);
  console.log(`========================================\n`);

  fs.writeFileSync('scripts/toast_test_results.json', JSON.stringify(testResults, null, 2));

  if (!allPassed) {
    process.exit(1);
  }
}

runToastTests().catch((err) => {
  console.error('Test hatası:', err);
  process.exit(1);
});

