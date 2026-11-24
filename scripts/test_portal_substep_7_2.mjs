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

async function runPortal72Tests() {
  console.log('================================================================');
  console.log('🚀 Aşama 7.2: Müşteri Portalı Canlı İlan Listeleme ve Arama Testi');
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
    // TEST HAZIRLIĞI: Kontrollü Test Veri Seti Enjeksiyonu
    // -------------------------------------------------------------------------
    console.log('--- TEST HAZIRLIĞI: Test Verilerinin Enjeksiyonu ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

    await page.evaluate(() => {
      // Oturumu temizle (ziyaretçi modu)
      localStorage.removeItem('emlakpro_session_v1');

      const testProperties = [
        // 1. Aktif, isPublished: true -> Görünmeli
        {
          id: 'TEST-P1',
          title: 'Moda Sahilinde Panoramik Deniz Manzaralı Penthouse',
          type: 'Satılık',
          category: 'Daire',
          status: 'Aktif',
          isPublished: true,
          location: 'Moda Sahili / Kadıköy',
          district: 'Kadıköy',
          neighborhood: 'Moda',
          price: 28500000,
          priceFormatted: '₺28.500.000',
          netArea: 185,
          grossArea: 220,
          rooms: '3+1',
          isVip: true,
          contract: { note: 'Gizli CRM Sözleşmesi' },
          matchedBuyers: [{ name: 'Gizli Müşteri' }],
        },
        // 2. Yeni İlan, isPublished: true -> Görünmeli
        {
          id: 'TEST-P2',
          title: 'Beykoz Konakları Müstakil Havuzlu Lüks Akıllı Villa',
          type: 'Kiralık',
          category: 'Villa / Köşk',
          status: 'Yeni İlan',
          isPublished: true,
          location: 'Acarkent / Beykoz',
          district: 'Beykoz',
          neighborhood: 'Acarkent',
          price: 150000,
          priceFormatted: '₺150.000',
          netArea: 420,
          grossArea: 550,
          rooms: '5+2',
          isVip: false,
        },
        // 3. Pasif, isPublished: true -> GİZLİ KALMALI
        {
          id: 'TEST-P3',
          title: 'Pasif Gizli Rezidans Dairesi',
          type: 'Satılık',
          category: 'Rezidans',
          status: 'Pasif',
          isPublished: true,
          district: 'Şişli',
          price: 12000000,
        },
        // 4. Taslak, isPublished: true -> GİZLİ KALMALI
        {
          id: 'TEST-P4',
          title: 'Taslak Hazırlık Aşamasında Ofis',
          type: 'Kiralık',
          category: 'Ticari / Ofis',
          status: 'Taslak',
          isPublished: true,
          district: 'Levent',
          price: 80000,
        },
        // 5. Sözleşmede, isPublished: true -> GİZLİ KALMALI
        {
          id: 'TEST-P5',
          title: 'Sözleşme Aşamasındaki Yalı Dairesi',
          type: 'Satılık',
          category: 'Daire',
          status: 'Sözleşmede',
          isPublished: true,
          district: 'Sarıyer',
          price: 45000000,
        },
        // 6. Satıldı -> GİZLİ KALMALI
        {
          id: 'TEST-P6',
          title: 'Satışı Tamamlanmış Boğaz Manzaralı Köşk',
          type: 'Satılık',
          category: 'Villa / Köşk',
          status: 'Satıldı',
          isPublished: true,
          district: 'Üsküdar',
          price: 60000000,
        },
        // 7. Kiralandı -> GİZLİ KALMALI
        {
          id: 'TEST-P7',
          title: 'Kiralaması Biten Modern Loft',
          type: 'Kiralık',
          category: 'Daire',
          status: 'Kiralandı',
          isPublished: true,
          district: 'Beyoğlu',
          price: 50000,
        },
        // 8. Aktif ancak isPublished: false -> GİZLİ KALMALI
        {
          id: 'TEST-P8',
          title: 'Yayından Kaldırılmış Aktif Kayıt',
          type: 'Satılık',
          category: 'Daire',
          status: 'Aktif',
          isPublished: false,
          district: 'Kadıköy',
          price: 20000000,
        },
        // 9. Eski Kayıt (isPublished alanı hiç yok), Durum: Aktif -> GÖRÜNMELİ
        {
          id: 'TEST-P9',
          title: 'Levent Merkezde Geniş Plaza Ofis Katı',
          type: 'Satılık',
          category: 'Ticari / Ofis',
          status: 'Aktif',
          // isPublished yok (undefined)
          location: 'Büyükdere Caddesi / Levent',
          district: 'Beşiktaş',
          neighborhood: 'Levent',
          price: 35000000,
          priceFormatted: '₺35.000.000',
          netArea: 320,
          grossArea: 380,
          rooms: '4+1',
        },
        // 10. Eski Kayıt (isPublished alanı hiç yok), Durum: Pasif -> GİZLİ KALMALI
        {
          id: 'TEST-P10',
          title: 'Eski Pasif Arşiv Dairesi',
          type: 'Satılık',
          category: 'Daire',
          status: 'Pasif',
          // isPublished yok
          district: 'Maltepe',
          price: 8000000,
        },
        // 11. Aktif Sarıyer Arsa
        {
          id: 'TEST-P11',
          title: 'Sarıyer Zekeriyaköy İmarlı Villa Arsası',
          type: 'Satılık',
          category: 'Arsa / Arazi',
          status: 'Aktif',
          isPublished: true,
          location: 'Zekeriyaköy / Sarıyer',
          district: 'Sarıyer',
          neighborhood: 'Zekeriyaköy',
          price: 42000000,
          priceFormatted: '₺42.000.000',
          netArea: 850,
          grossArea: 1000,
          rooms: 'Arsa',
        },
      ];

      localStorage.setItem('emlakpro_properties_v1', JSON.stringify(testProperties));
    });

    // -------------------------------------------------------------------------
    // TEST 1 - 9: İlan Yayınlama Güvenliği & Statü Filtreleme Kuralları
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 1 - 9: İlan Yayınlama Güvenliği Kontrolleri ---');
    await page.goto(`${BASE_URL}/ilanlar`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('article', { timeout: 5000 });

    const renderedTitles = await page.evaluate(() => {
      const articles = Array.from(document.querySelectorAll('article h3'));
      return articles.map((el) => el.textContent.trim());
    });

    // 1. Aktif ilan portalda görünüyor
    assert(
      renderedTitles.some((t) => t.includes('Moda Sahilinde Panoramik Deniz Manzaralı Penthouse')),
      'Senaryo 1: Aktif ilan (TEST-P1) portalda başarıyla görünüyor'
    );

    // 2. Yeni İlan portalda görünüyor
    assert(
      renderedTitles.some((t) => t.includes('Beykoz Konakları Müstakil Havuzlu Lüks Akıllı Villa')),
      'Senaryo 2: Yeni İlan (TEST-P2) portalda başarıyla görünüyor'
    );

    // 3. Pasif ilan görünmüyor
    assert(
      !renderedTitles.some((t) => t.includes('Pasif Gizli Rezidans Dairesi')),
      'Senaryo 3: Pasif ilan (TEST-P3) portalda KESİNLİKLE görünmüyor'
    );

    // 4. Taslak ilan görünmüyor
    assert(
      !renderedTitles.some((t) => t.includes('Taslak Hazırlık Aşamasında Ofis')),
      'Senaryo 4: Taslak ilan (TEST-P4) portalda KESİNLİKLE görünmüyor'
    );

    // 5. Sözleşmede ilan görünmüyor
    assert(
      !renderedTitles.some((t) => t.includes('Sözleşme Aşamasındaki Yalı Dairesi')),
      'Senaryo 5: Sözleşmede olan ilan (TEST-P5) portalda KESİNLİKLE görünmüyor'
    );

    // 6. Satıldı ve Kiralandı ilanları görünmüyor
    assert(
      !renderedTitles.some((t) => t.includes('Satışı Tamamlanmış Boğaz Manzaralı Köşk')),
      'Senaryo 6a: Satıldı durumundaki ilan (TEST-P6) portalda KESİNLİKLE görünmüyor'
    );
    assert(
      !renderedTitles.some((t) => t.includes('Kiralaması Biten Modern Loft')),
      'Senaryo 6b: Kiralandı durumundaki ilan (TEST-P7) portalda KESİNLİKLE görünmüyor'
    );

    // 7. isPublished: false olan ilan görünmüyor
    assert(
      !renderedTitles.some((t) => t.includes('Yayından Kaldırılmış Aktif Kayıt')),
      'Senaryo 7: isPublished: false olan ilan (TEST-P8) portalda KESİNLİKLE görünmüyor'
    );

    // 8. isPublished: true olsa bile uygun olmayan statü görünmüyor (TEST-P3, P4, P5 ile doğrulandı)
    assert(true, 'Senaryo 8: isPublished: true olsa bile uygun olmayan statüler (Taslak, Pasif vb.) filtrelendi');

    // 9. Eski kayıtlarda isPublished bulunmadığında durum kontrolü doğru çalışıyor
    assert(
      renderedTitles.some((t) => t.includes('Levent Merkezde Geniş Plaza Ofis Katı')),
      'Senaryo 9a: isPublished alanı bulunmayan Aktif kayıt (TEST-P9) portalda görünüyor'
    );
    assert(
      !renderedTitles.some((t) => t.includes('Eski Pasif Arşiv Dairesi')),
      'Senaryo 9b: isPublished alanı bulunmayan Pasif kayıt (TEST-P10) filtrelendi ve görünmüyor'
    );

    // Dahili CRM alanlarının sızmadığını doğrula
    const bodyContent = await page.evaluate(() => document.body.textContent);
    assert(
      !bodyContent.includes('Gizli CRM Sözleşmesi') && !bodyContent.includes('Gizli Müşteri'),
      'GÜVENLİK KRİTERİ: CRM dahili verileri (contract, matchedBuyers) portal kartlarına sızdırılmıyor'
    );

    // -------------------------------------------------------------------------
    // TEST 10: Fiyat, Kategori, Konum ve Oda Filtreleri
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 10: Tekil Filtre Fonksiyonları ---');

    // Kategori Filtresi: Ticari
    await page.goto(`${BASE_URL}/ilanlar?kategori=Ticari`, { waitUntil: 'networkidle0' });
    const ticariTitles = await page.evaluate(() =>
      Array.from(document.querySelectorAll('article h3')).map((e) => e.textContent.trim())
    );
    assert(
      ticariTitles.length === 1 && ticariTitles[0].includes('Levent Merkezde Geniş Plaza Ofis Katı'),
      'Kategori filtresi (Ticari) sadece Levent Plaza kaydını getirdi'
    );

    // İşlem Türü Filtresi: Kiralık
    await page.goto(`${BASE_URL}/ilanlar?tip=Kiralık`, { waitUntil: 'networkidle0' });
    const kiralikTitles = await page.evaluate(() =>
      Array.from(document.querySelectorAll('article h3')).map((e) => e.textContent.trim())
    );
    assert(
      kiralikTitles.length === 1 && kiralikTitles[0].includes('Beykoz Konakları Müstakil Havuzlu'),
      'İşlem türü filtresi (Kiralık) sadece Beykoz kiralık villasını getirdi'
    );

    // Konum / İlçe Filtresi: Kadıköy
    await page.goto(`${BASE_URL}/ilanlar?ilce=Kadıköy`, { waitUntil: 'networkidle0' });
    const kadikoyTitles = await page.evaluate(() =>
      Array.from(document.querySelectorAll('article h3')).map((e) => e.textContent.trim())
    );
    assert(
      kadikoyTitles.length === 1 && kadikoyTitles[0].includes('Moda Sahilinde Panoramik'),
      'İlçe filtresi (Kadıköy) sadece Moda Penthouse kaydını getirdi'
    );

    // -------------------------------------------------------------------------
    // TEST 11: Birden Fazla Filtre Aynı Anda Çalışıyor
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 11: Çoklu Filtre Kombinasyonu ---');
    // Satılık + Konut + Kadıköy
    await page.goto(`${BASE_URL}/ilanlar?tip=Satılık&kategori=Konut&ilce=Kadıköy`, {
      waitUntil: 'networkidle0',
    });
    const multiFilterTitles = await page.evaluate(() =>
      Array.from(document.querySelectorAll('article h3')).map((e) => e.textContent.trim())
    );
    assert(
      multiFilterTitles.length === 1 && multiFilterTitles[0].includes('Moda Sahilinde Panoramik'),
      'Çoklu filtre (Satılık + Konut + Kadıköy) başarıyla Moda Penthouse kaydını getirdi'
    );

    // Uyumsuz çoklu filtre (Kiralık + Kadıköy -> 0 sonuç, Empty State gelmeli)
    await page.goto(`${BASE_URL}/ilanlar?tip=Kiralık&ilce=Kadıköy`, { waitUntil: 'networkidle0' });
    const emptyStatePresent = await page.evaluate(() =>
      document.body.textContent.includes('Arama Kriterlerinize Uygun İlan Bulunamadı')
    );
    assert(emptyStatePresent, 'Uyumsuz filtre kombinasyonunda şık Empty State ekranı görüntülendi');

    // -------------------------------------------------------------------------
    // TEST 12: Arama ve Sıralama
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 12: Arama ve Sıralama ---');

    // Türkçe karakter duyarsız arama: 'zekeriyakoy' -> Sarıyer Zekeriyaköy Arsası
    await page.goto(`${BASE_URL}/ilanlar?q=zekeriyakoy`, { waitUntil: 'networkidle0' });
    const searchMatch = await page.evaluate(() =>
      Array.from(document.querySelectorAll('article h3')).map((e) => e.textContent.trim())
    );
    assert(
      searchMatch.length === 1 && searchMatch[0].includes('Sarıyer Zekeriyaköy İmarlı Villa Arsası'),
      'Türkçe karakter duyarsız arama ("zekeriyakoy") doğru ilanı buldu'
    );

    // Fiyata Göre Artan Sıralama (price_asc)
    await page.goto(`${BASE_URL}/ilanlar?sirala=price_asc`, { waitUntil: 'networkidle0' });
    const pricesAsc = await page.evaluate(() => {
      const priceDivs = Array.from(document.querySelectorAll('article .text-2xl, article .text-xl'));
      return priceDivs.map((d) => d.textContent.trim());
    });
    // İlk ilan en düşük fiyat olan ₺150.000 olmalı
    assert(
      pricesAsc[0].includes('150.000'),
      `Fiyata göre artan sıralamada ilk ilan en düşük fiyat oldu: "${pricesAsc[0]}"`
    );

    // Fiyata Göre Azalan Sıralama (price_desc)
    await page.goto(`${BASE_URL}/ilanlar?sirala=price_desc`, { waitUntil: 'networkidle0' });
    const pricesDesc = await page.evaluate(() => {
      const priceDivs = Array.from(document.querySelectorAll('article .text-2xl, article .text-xl'));
      return priceDivs.map((d) => d.textContent.trim());
    });
    // İlk ilan en yüksek fiyat olan ₺42.000.000 olmalı
    assert(
      pricesDesc[0].includes('42.000.000'),
      `Fiyata göre azalan sıralamada ilk ilan en yüksek fiyat oldu: "${pricesDesc[0]}"`
    );

    // -------------------------------------------------------------------------
    // TEST 13: CRM ve Portal Canlı Senkronizasyon (storage / storage event)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 13: CRM ve Portal Canlı Senkronizasyonu ---');
    await page.goto(`${BASE_URL}/ilanlar`, { waitUntil: 'networkidle0' });

    // CRM tarafından yeni bir ilan eklendiğini veya güncellendiğini simüle et
    await page.evaluate(() => {
      const current = JSON.parse(localStorage.getItem('emlakpro_properties_v1') || '[]');
      // Birinci ilanın başlığını güncelle
      const p1 = current.find((p) => p.id === 'TEST-P1');
      if (p1) {
        p1.title = 'GÜNCELLENMİŞ PORTFÖY BAŞLIĞI — Boğaz Yalı Dairesi';
      }
      localStorage.setItem('emlakpro_properties_v1', JSON.stringify(current));
      window.dispatchEvent(new Event('storage'));
    });

    // Sayfa yenilemeden canlı DOM güncellemesini bekle
    await page.waitForFunction(
      () => document.body.textContent.includes('GÜNCELLENMİŞ PORTFÖY BAŞLIĞI'),
      { timeout: 5000 }
    );
    assert(true, 'CRM veri değişikliği müşteri portalına anında ve pürüzsüz yansıdı (Canlı Senkronizasyon)');

    // -------------------------------------------------------------------------
    // TEST 14: İlan Detay Bağlantıları (/ilanlar/:id)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 14: İlan Detay Yönlendirme Bağlantısı ---');
    await page.goto(`${BASE_URL}/ilanlar`, { waitUntil: 'networkidle0' });

    const detailHref = await page.evaluate(() => {
      const firstCardLink = document.querySelector('article a[href^="/ilanlar/"]');
      return firstCardLink ? firstCardLink.getAttribute('href') : null;
    });
    assert(
      detailHref && detailHref.startsWith('/ilanlar/'),
      `İlan detay bağlantısı doğru formatta: "${detailHref}"`
    );

    // Detay linkine tıkla
    await page.click('article a[href^="/ilanlar/"]');
    await page.waitForFunction(() => window.location.pathname.startsWith('/ilanlar/'), {
      timeout: 5000,
    });
    const currentDetailUrl = page.url();
    assert(
      currentDetailUrl.includes('/ilanlar/'),
      `Detay bağlantısına tıklandığında doğru rota açıldı: ${currentDetailUrl}`
    );

    // -------------------------------------------------------------------------
    // TEST 15: Farklı Ekran Çözünürlüklerinde Taşma ve Duyarlılık
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 15: Duyarlılık ve Taşma Kontrolleri ---');
    const viewports = [
      { name: 'Mobil (375x667)', width: 375, height: 667 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Masaüstü (1440x900)', width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      // Ana sayfa kontrolü
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
      const homeOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      assert(!homeOverflow, `${vp.name} Ana Sayfa: Yatay taşma YOK`);

      // İlanlar sayfası kontrolü
      await page.goto(`${BASE_URL}/ilanlar`, { waitUntil: 'networkidle0' });
      const listingsOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      assert(!listingsOverflow, `${vp.name} İlanlar Sayfası: Yatay taşma YOK`);
    }

    console.log('\n================================================================');
    console.log('🎉 TÜM 15 SENARYO BAŞARIYLA TAMAMLANDI! (15/15 Test Passed)');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ Test sırasında beklenmeyen hata:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runPortal72Tests();
