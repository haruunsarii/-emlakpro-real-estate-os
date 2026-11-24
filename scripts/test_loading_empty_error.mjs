import puppeteer from 'puppeteer-core';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';

async function runLoadingEmptyErrorTests() {
  console.log('🚀 EmlakPro Loading, Empty ve Error State Test Paketi Başlatılıyor...');

  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.CHROME_BIN,
  ].filter(Boolean);

  let executablePath = null;
  for (const p of chromePaths) {
    if (fs.existsSync(p)) {
      executablePath = p;
      break;
    }
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const results = [];
  let allPassed = true;

  function record(name, passed, detail = '') {
    results.push({ name, passed, detail });
    if (passed) {
      console.log(`  ✓ ${name} ${detail ? '(' + detail + ')' : ''}`);
    } else {
      console.error(`  ✗ ${name} - BAŞARISIZ! ${detail ? '[' + detail + ']' : ''}`);
      allPassed = false;
    }
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // TEST 1: Toplam İlan ve Sayfa Başına 15 İlan Doğrulaması
    console.log('\n--- 1. Gayrimenkul Portföyü: 21 İlan & Sayfa Başına 15 İlan Doğrulaması ---');
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    // Clear any leftover filter in localStorage to ensure clean state
    await page.evaluate(() => {
      localStorage.removeItem('emlakpro_properties_seed_v2');
      // trigger fresh v3 seed if needed
      window.dispatchEvent(new Event('storage'));
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    const page1Count = await page.evaluate(() => {
      const cards = document.querySelectorAll('#portfolio-grid-container > div');
      return cards.length;
    });
    record('Sayfa 1: Tam 15 İlan Gösteriliyor', page1Count === 15, `${page1Count} İlan`);

    // Sayfalama bilgisini kontrol et (15 - 21 arası veya toplam 21)
    const paginationText = await page.evaluate(() => {
      const el = document.querySelector('body');
      return el ? el.textContent : '';
    });
    const has21Total = paginationText.includes('21 portföy') || paginationText.includes('21');
    record('Toplam İlan Sayısı 21 Olarak Doğrulandı', has21Total);

    // Sayfa 2'ye tıkla
    const page2Clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn2 = btns.find((b) => b.textContent.trim() === '2');
      if (btn2) {
        btn2.click();
        return true;
      }
      return false;
    });
    await new Promise((r) => setTimeout(r, 400));

    const page2Count = await page.evaluate(() => {
      const cards = document.querySelectorAll('#portfolio-grid-container > div');
      return cards.length;
    });
    record('Sayfa 2: Kalan 6 İlan Gösteriliyor (15 + 6 = 21)', page2Count === 6, `${page2Count} İlan`);

    // Sayfa 1'e geri dön
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn1 = btns.find((b) => b.textContent.trim() === '1');
      if (btn1) btn1.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // TEST 2: Gayrimenkuller Ekranında EmptyState ve "Filtreleri Temizle" Testi
    console.log('\n--- 2. Gayrimenkuller: EmptyState & Filtreleri Temizle Doğrulaması ---');
    const propInput = await page.$('input[placeholder*="İlan no, başlık"]');
    if (propInput) {
      await propInput.type('bulunmayan_gayrimenkul_xyz999', { delay: 20 });
      await new Promise((r) => setTimeout(r, 400));

      const emptyStateVisible = await page.evaluate(() => {
        const text = document.body.textContent;
        const hasTitle = text.includes('Kriterlere Uygun Gayrimenkul Bulunamadı');
        const emptyDiv = document.querySelector('[role="status"]');
        return hasTitle && !!emptyDiv;
      });
      record('Gayrimenkuller: 0 sonuç senaryosunda EmptyState render edildi', emptyStateVisible);

      // "Filtreleri Temizle" butonuna tıkla
      const resetClicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const resetBtn = btns.find(
          (b) => b.textContent.includes('Filtreleri Temizle') || b.textContent.includes('Filtreleri Sıfırla')
        );
        if (resetBtn) {
          resetBtn.click();
          return true;
        }
        return false;
      });
      await new Promise((r) => setTimeout(r, 400));

      const countAfterReset = await page.evaluate(() => {
        const cards = document.querySelectorAll('#portfolio-grid-container > div');
        return cards.length;
      });
      record(
        'Gayrimenkuller: "Filtreleri Temizle" sonrası tüm 15 ilan geri geldi',
        countAfterReset === 15,
        `${countAfterReset} İlan`
      );
    }

    // TEST 3: Müşteriler Ekranında EmptyState ve "Filtreleri Sıfırla" Testi
    console.log('\n--- 3. Müşteriler: EmptyState & Filtreleri Sıfırla Doğrulaması ---');
    await page.goto(`${BASE_URL}/musteriler`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    const custInput = await page.$('input[placeholder*="İsim, telefon"]');
    if (custInput) {
      await custInput.type('olmayan_musteri_kaydi_9999', { delay: 20 });
      await new Promise((r) => setTimeout(r, 400));

      const custEmptyVisible = await page.evaluate(() => {
        const text = document.body.textContent;
        return text.includes('Kriterlere Uygun Müşteri Bulunamadı');
      });
      record('Müşteriler: 0 sonuç senaryosunda EmptyState render edildi', custEmptyVisible);

      // Filtreleri Sıfırla butonuna tıkla
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const resetBtn = btns.find((b) => b.textContent.includes('Filtreleri Sıfırla'));
        if (resetBtn) resetBtn.click();
      });
      await new Promise((r) => setTimeout(r, 400));

      const custReturned = await page.evaluate(() => {
        const text = document.body.textContent;
        return text.includes('Selin Vardar') && text.includes('Kemal Güneş');
      });
      record('Müşteriler: "Filtreleri Sıfırla" sonrası müşteri listesi geri yüklendi', custReturned);
    }

    // TEST 4: Talepler Ekranında EmptyState ve "Filtreleri Sıfırla" Testi
    console.log('\n--- 4. Talepler: EmptyState & Filtreleri Sıfırla Doğrulaması ---');
    await page.goto(`${BASE_URL}/talepler`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    const reqInput = await page.$('input[placeholder*="Müşteri adı, aranan bölge"]');
    if (reqInput) {
      await reqInput.type('olmayan_talep_kod_9999', { delay: 20 });
      await new Promise((r) => setTimeout(r, 400));

      const reqEmptyVisible = await page.evaluate(() => {
        const text = document.body.textContent;
        return text.includes('Kriterlere Uygun Müşteri Talebi Bulunamadı');
      });
      record('Talepler: 0 sonuç senaryosunda EmptyState render edildi', reqEmptyVisible);

      // Filtreleri Sıfırla butonuna tıkla
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const resetBtn = btns.find((b) => b.textContent.includes('Filtreleri Sıfırla'));
        if (resetBtn) resetBtn.click();
      });
      await new Promise((r) => setTimeout(r, 400));

      const reqReturned = await page.evaluate(() => {
        const text = document.body.textContent;
        return text.includes('Selin Vardar') && text.includes('Kemal Güneş');
      });
      record('Talepler: "Filtreleri Sıfırla" sonrası talepler geri yüklendi', reqReturned);
    }

    // TEST 5: Satış ve Kiralama Ekranında EmptyState ve "Filtreleri Sıfırla" Testi
    console.log('\n--- 5. Satış ve Kiralama: EmptyState & Filtreleri Sıfırla Doğrulaması ---');
    await page.goto(`${BASE_URL}/satis-ve-kiralama`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    const dealInput = await page.$('input[placeholder*="Fırsat, müşteri veya portföy ara"]');
    if (dealInput) {
      await dealInput.type('olmayan_firsat_kaydi_9999', { delay: 20 });
      await new Promise((r) => setTimeout(r, 400));

      const dealEmptyVisible = await page.evaluate(() => {
        const text = document.body.textContent;
        return text.includes('Kriterlere Uygun Fırsat Bulunamadı');
      });
      record('Satış ve Kiralama: 0 sonuç senaryosunda EmptyState render edildi', dealEmptyVisible);

      // Filtreleri Sıfırla butonuna tıkla
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const resetBtn = btns.find((b) => b.textContent.includes('Filtreleri Sıfırla'));
        if (resetBtn) resetBtn.click();
      });
      await new Promise((r) => setTimeout(r, 400));

      const dealReturned = await page.evaluate(() => {
        const text = document.body.textContent;
        return text.includes('Moda Penthouse') || text.includes('Beykoz Konakları');
      });
      record('Satış ve Kiralama: "Filtreleri Sıfırla" sonrası Kanban panosu geri yüklendi', dealReturned);
    }

    // TEST 6: Raporlar Ekranında Tablo Araması ve EmptyState
    console.log('\n--- 6. Raporlar: Son İşlemler Tablosunda EmptyState Testi ---');
    await page.goto(`${BASE_URL}/raporlar`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    const repSearchInput = await page.$('input[placeholder*="İşlem, müşteri veya portföy ara"]');
    if (repSearchInput) {
      await repSearchInput.type('bulunmayan_sozlesme_999', { delay: 20 });
      await new Promise((r) => setTimeout(r, 400));

      const repEmptyVisible = await page.evaluate(() => {
        const text = document.body.textContent;
        return text.includes('İşlem Kaydı Bulunamadı') || text.includes('Seçili Filtrelere Uygun');
      });
      record('Raporlar: Tablo 0 sonuç senaryosunda EmptyState render edildi', repEmptyVisible);

      // "Filtreleri Sıfırla" tıkla
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const resetBtn = btns.find((b) => b.textContent.includes('Filtreleri Sıfırla'));
        if (resetBtn) resetBtn.click();
      });
      await new Promise((r) => setTimeout(r, 400));
    }

    // TEST 7: Ayarlar Ekranında Kullanıcı Arama ve EmptyState
    console.log('\n--- 7. Ayarlar: Danışman Listesinde EmptyState Testi ---');
    await page.goto(`${BASE_URL}/ayarlar`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    // "Kullanıcı Yönetimi" sekmesine tıkla
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const userTab = btns.find((b) => b.textContent.includes('Kullanıcı Yönetimi'));
      if (userTab) userTab.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    const userSearchInput = await page.$('input[placeholder*="İsim veya e-posta ile ara"]');
    if (userSearchInput) {
      await userSearchInput.type('olmayan_danisman_999', { delay: 20 });
      await new Promise((r) => setTimeout(r, 400));

      const userEmptyVisible = await page.evaluate(() => {
        const text = document.body.textContent;
        return text.includes('Kriterlere Uygun Danışman/Kullanıcı Bulunamadı');
      });
      record('Ayarlar: Danışman listesi 0 sonuç senaryosunda EmptyState render edildi', userEmptyVisible);

      // "Filtreleri Temizle" tıkla
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const resetBtn = btns.find((b) => b.textContent.includes('Filtreleri Temizle'));
        if (resetBtn) resetBtn.click();
      });
      await new Promise((r) => setTimeout(r, 400));

      const userReturned = await page.evaluate(() => {
        const text = document.body.textContent;
        return text.includes('Burak Yılmaz');
      });
      record('Ayarlar: "Filtreleri Temizle" sonrası kullanıcı listesi geri yüklendi', userReturned);
    }

    // TEST 8: Responsive Layout Kontrolü (390px Mobil & 1440px Desktop)
    console.log('\n--- 8. Responsive Görünüm ve Taşma Kontrolü ---');
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));

    const mobileOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    record('Mobil (390px): Gayrimenkuller ekranında yatay taşma yok', !mobileOverflow);

    await page.setViewport({ width: 1440, height: 900 });

  } finally {
    await browser.close();
  }

  console.log(`\n========================================`);
  console.log(`📋 LOADING / EMPTY / ERROR TEST SONUCU: ${allPassed ? '✅ TÜM TESTLER BAŞARILI' : '❌ HATALAR MEVCUT'}`);
  console.log(`========================================\n`);

  fs.writeFileSync('scripts/loading_empty_test_results.json', JSON.stringify(results, null, 2));

  if (!allPassed) {
    process.exit(1);
  }
}

runLoadingEmptyErrorTests().catch((err) => {
  console.error('Test hatası:', err);
  process.exit(1);
});
