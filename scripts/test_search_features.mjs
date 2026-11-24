import puppeteer from 'puppeteer-core';
import fs from 'fs';
import { normalizeTurkishText, matchesTurkishSearch } from '../src/utils/turkishSearch.js';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function runSearchTests() {
  console.log('🚀 EmlakPro Arama ve Filtreleme Deneyimi Testi Başlatılıyor...');
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

  // 1. UNIT TESTLER: Türkçe Karakter ve Büyük/Küçük Harf Normalizasyonu
  console.log('--- 1. Türkçe Karakter Normalizasyonu Birim Testleri ---');
  record('Kadıköy -> kadikoy eşleşmesi', matchesTurkishSearch('Kadıköy', 'kadikoy'));
  record('Beşiktaş -> besiktas eşleşmesi', matchesTurkishSearch('Beşiktaş', 'besiktas'));
  record('İSTANBUL -> istanbul eşleşmesi', matchesTurkishSearch('İSTANBUL', 'istanbul'));
  record('İstanbul -> ıstanbul eşleşmesi', matchesTurkishSearch('İstanbul', 'ıstanbul'));
  record('Çamlıca -> camlica eşleşmesi', matchesTurkishSearch('Çamlıca', 'camlica'));
  record('Göztepe -> goztepe eşleşmesi', matchesTurkishSearch('Göztepe', 'goztepe'));
  record('Şişli -> sisli eşleşmesi', matchesTurkishSearch('Şişli', 'sisli'));
  record('Caner Aydın -> aydin eşleşmesi', matchesTurkishSearch('Caner Aydın', 'aydin'));

  // 2. TARAYICI E2E TESTLERİ
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1440, height: 900 });

    // TEST 2: Global ⌘K / Ctrl+K ve Header Hızlı Arama
    console.log('\n--- 2. Global ⌘K / Ctrl+K Kısayolu ve Header Canlı Arama ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    // Klavyeden Control+K tuş kombinasyonuna bas
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyK');
    await page.keyboard.up('Control');
    await new Promise((r) => setTimeout(r, 400));

    // Arama input'unun focus alıp almadığını kontrol et
    const isFocused = await page.evaluate(() => {
      const activeEl = document.activeElement;
      return activeEl && activeEl.placeholder && activeEl.placeholder.includes('⌘K');
    });
    record('Ctrl+K ile Header Arama Girişine Odaklanma (Focus)', isFocused);

    // Header arama kutusuna "kadikoy" yaz (Türkçe karaktersiz)
    await page.keyboard.type('kadikoy', { delay: 40 });
    await new Promise((r) => setTimeout(r, 500));

    const dropdownCheck = await page.evaluate(() => {
      const dropdown = document.querySelector('header .absolute.top-full');
      if (!dropdown) return { exists: false, count: 0 };
      const buttons = dropdown.querySelectorAll('button');
      return { exists: true, count: buttons.length, text: dropdown.textContent };
    });

    record('Header Hızlı Arama Dropdown Açıldı', dropdownCheck.exists);
    record('Türkçe Karakter Duyarsız "kadikoy" ile Eşleşen Sonuçlar Geldi', dropdownCheck.count > 0, `${dropdownCheck.count} Sonuç`);

    // "X" butonu ile aramayı temizle
    const clearBtn = await page.$('header button[aria-label="Aramayı Temizle"]');
    if (clearBtn) {
      await clearBtn.click();
      await new Promise((r) => setTimeout(r, 400));
      const textAfterClear = await page.evaluate(() => {
        const input = document.querySelector('header input[placeholder*="⌘K"]');
        return input ? input.value : '';
      });
      record('Header Arama "X" Butonu ile Temizleme', textAfterClear === '', `Giriş Değeri: "${textAfterClear}"`);
    } else {
      record('Header Arama "X" Butonu ile Temizleme', false, 'Temizle butonu bulunamadı');
    }

    // Escape tuşuna basarak dropdown'u kapat
    await page.keyboard.type('moda', { delay: 30 });
    await new Promise((r) => setTimeout(r, 300));
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 300));

    const isClosedAfterEscape = await page.evaluate(() => {
      const dropdown = document.querySelector('header .absolute.top-full');
      return !dropdown;
    });
    record('Escape Tuşu ile Arama Menüsünü Kapatma', isClosedAfterEscape);

    // TEST 3: Gayrimenkuller Ekranında Türkçe Karakter Duyarsız Arama
    console.log('\n--- 3. Gayrimenkuller Ekranında Türkçe Karakter Duyarsız Arama ---');
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    const propSearchInput = await page.$('input[placeholder*="İlan no, başlık"]');
    if (propSearchInput) {
      // 3a: ASCII "kadikoy" yaz
      await propSearchInput.type('kadikoy', { delay: 40 });
      await new Promise((r) => setTimeout(r, 400));

      const kadikoyCount = await page.evaluate(() => {
        const cards = document.querySelectorAll('#portfolio-grid-container > div');
        return cards.length;
      });
      record('Gayrimenkuller: "kadikoy" araması "Kadıköy" ilanlarını buldu', kadikoyCount > 0, `${kadikoyCount} İlan`);

      // 3b: Temizle butonu
      const cleared = await page.evaluate(() => {
        const input = document.querySelector('input[placeholder*="İlan no, başlık"]');
        const container = input ? input.parentElement : null;
        const btn = container ? container.querySelector('button') : null;
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });
      await new Promise((r) => setTimeout(r, 400));

      const allCountAfterClear = await page.evaluate(() => {
        const cards = document.querySelectorAll('#portfolio-grid-container > div');
        return cards.length;
      });
      record('Gayrimenkuller: Arama temizlenince tüm portföy listesi geri geldi', allCountAfterClear >= 10, `${allCountAfterClear} İlan`);
    } else {
      record('Gayrimenkuller Arama Girişi Bulunamadı', false);
    }

    // TEST 4: Müşteriler Ekranında Türkçe Karakter Duyarsız Arama
    console.log('\n--- 4. Müşteriler Ekranında Türkçe Karakter Duyarsız Arama ---');
    await page.goto(`${BASE_URL}/musteriler`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    const custSearchInput = await page.$('input[placeholder*="İsim, telefon"]');
    if (custSearchInput) {
      // "vardar" yaz (Selin Vardar için)
      await custSearchInput.type('vardar', { delay: 40 });
      await new Promise((r) => setTimeout(r, 400));

      const custResult = await page.evaluate(() => {
        const text = document.body.textContent;
        return text.includes('Selin Vardar');
      });
      record('Müşteriler: "vardar" araması "Selin Vardar" kaydını buldu', custResult);

      // Temizle
      await page.evaluate(() => {
        const input = document.querySelector('input[placeholder*="İsim, telefon"]');
        const container = input ? input.parentElement : null;
        const btn = container ? container.querySelector('button') : null;
        if (btn) btn.click();
      });
      await new Promise((r) => setTimeout(r, 300));
    } else {
      record('Müşteriler Arama Girişi Bulunamadı', false);
    }

    // TEST 5: Talepler Ekranında Türkçe Karakter Duyarsız Arama
    console.log('\n--- 5. Talepler Ekranında Türkçe Karakter Duyarsız Arama ---');
    await page.goto(`${BASE_URL}/talepler`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    const reqSearchInput = await page.$('input[placeholder*="Müşteri adı, aranan bölge"]');
    if (reqSearchInput) {
      // "kadikoy" yaz (Kadıköy talepleri için)
      await reqSearchInput.type('kadikoy', { delay: 40 });
      await new Promise((r) => setTimeout(r, 400));

      const reqResult = await page.evaluate(() => {
        const text = document.body.textContent;
        return text.includes('Kadıköy') || text.includes('Moda');
      });
      record('Talepler: "kadikoy" araması Kadıköy bölge taleplerini buldu', reqResult);
    }

    // TEST 6: Satış ve Kiralama Ekranında Türkçe Karakter Duyarsız Arama
    console.log('\n--- 6. Satış ve Kiralama Ekranında Türkçe Karakter Duyarsız Arama ---');
    await page.goto(`${BASE_URL}/satis-ve-kiralama`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    const dealSearchInput = await page.$('input[placeholder*="Fırsat, müşteri veya portföy ara"]');
    if (dealSearchInput) {
      // "penthouse" yaz
      await dealSearchInput.type('penthouse', { delay: 40 });
      await new Promise((r) => setTimeout(r, 400));

      const dealResult = await page.evaluate(() => {
        const text = document.body.textContent;
        return text.includes('Penthouse') || text.includes('Moda');
      });
      record('Satış ve Kiralama: "penthouse" araması ilgili fırsatı buldu', dealResult);
    }

  } finally {
    await browser.close();
  }

  console.log(`\n========================================`);
  console.log(`📋 FİLTRELEME & ARAMA TEST SONUCU: ${allPassed ? '✅ TÜM TESTLER BAŞARILI' : '❌ HATALAR MEVCUT'}`);
  console.log(`========================================\n`);

  fs.writeFileSync('scripts/search_test_results.json', JSON.stringify(results, null, 2));

  if (!allPassed) {
    process.exit(1);
  }
}

runSearchTests().catch((err) => {
  console.error('Test hatası:', err);
  process.exit(1);
});
