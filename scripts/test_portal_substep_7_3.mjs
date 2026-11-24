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

async function runPortal73Tests() {
  console.log('================================================================');
  console.log('🚀 Aşama 7.3: Müşteri Portalı İlan Detay ve Danışman İletişim Testi');
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
    // TEST HAZIRLIĞI: Kontrollü Test Verilerinin Enjeksiyonu
    // -------------------------------------------------------------------------
    console.log('--- TEST HAZIRLIĞI: Test İlanları & settings.users Enjeksiyonu ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

    await page.evaluate(() => {
      // Oturumu temizle
      localStorage.removeItem('emlakpro_session_v1');

      // settings.users ve office tanımla
      const settings = {
        office: {
          officeName: 'EmlakPro Prime Kadıköy',
          branch: 'Kadıköy Merkez',
          phone: '+90 (216) 418 90 00',
          email: 'kadikoy@emlakpro.com.tr',
        },
        users: [
          {
            id: 'usr_danisman_burak',
            name: 'Burak Yılmaz',
            title: 'Kıdemli Gayrimenkul Danışmanı',
            phone: '0532 111 2233',
            email: 'burak@emlakpro.com.tr',
            role: 'consultant',
            displayRole: 'Danışman',
            status: 'active',
            passwordHash: 'dummy_hash_should_never_leak',
          },
        ],
      };
      localStorage.setItem('emlakpro_settings_v1', JSON.stringify(settings));

      // Test İlanları
      const testProperties = [
        // 1. Yayındaki Aktif İlan (Galeri, Danışman Burak Yılmaz)
        {
          id: 'TEST-DETAY-1',
          title: 'Fenerbahçe Sahilinde Panoramik Deniz Manzaralı Penthouse',
          type: 'Satılık',
          category: 'Daire',
          status: 'Aktif',
          isPublished: true,
          location: 'Fenerbahçe / Kadıköy',
          district: 'Kadıköy',
          neighborhood: 'Fenerbahçe',
          price: 32000000,
          priceFormatted: '₺32.000.000',
          unitPrice: '₺160.000 / m²',
          netArea: 200,
          grossArea: 240,
          rooms: '4+1',
          floor: '8. Kat',
          floorDetails: '8. Kat (Çatı Dubleksi)',
          buildingAge: '1 (Yeni Yapı)',
          deedStatus: 'Kat Mülkiyetli',
          loanEligibility: 'Tam Uygun',
          description: 'Fenerbahçe marina ve ada manzarasına hakim, lüks mimari detaylara sahip çatı dubleksi.',
          features: ['Panoramik Deniz Manzarası', 'Akıllı Ev Altyapısı', '2 Araçlık Kapalı Otopark'],
          advisor: 'Burak Yılmaz',
          gallery: [
            {
              image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
              label: 'Salon',
            },
            {
              image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
              label: 'Mutfak',
            },
            {
              image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200',
              // label yok (uydurulmamalı)
            },
          ],
          contract: { note: 'Gizli CRM Sözleşmesi' },
          matchedBuyers: [{ name: 'Gizli Müşteri' }],
        },
        // 2. Yayından Kaldırılmış İlan (isPublished: false) -> 404 olmalı
        {
          id: 'TEST-DETAY-2',
          title: 'Gizli Yayından Kaldırılmış İlan',
          type: 'Satılık',
          category: 'Daire',
          status: 'Aktif',
          isPublished: false,
          district: 'Kadıköy',
          price: 15000000,
        },
        // 3. Pasif İlan -> 404 olmalı
        {
          id: 'TEST-DETAY-3',
          title: 'Pasif Arşiv İlanı',
          type: 'Satılık',
          category: 'Daire',
          status: 'Pasif',
          isPublished: true,
          district: 'Kadıköy',
          price: 10000000,
        },
        // 4. Benzer İlan (Aynı ilçe/kategori)
        {
          id: 'TEST-DETAY-BENZER',
          title: 'Caddebostan Sahilinde Balkonlu Modern Daire',
          type: 'Satılık',
          category: 'Daire',
          status: 'Aktif',
          isPublished: true,
          district: 'Kadıköy',
          price: 24000000,
          priceFormatted: '₺24.000.000',
          rooms: '3+1',
          netArea: 160,
        },
      ];

      localStorage.setItem('emlakpro_properties_v1', JSON.stringify(testProperties));
    });

    // -------------------------------------------------------------------------
    // TEST 1: Yayındaki Aktif İlan Detay Ekranı Yüklenmesi
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Aktif İlan Detay Ekranı ve Bileşenleri ---');
    await page.goto(`${BASE_URL}/ilanlar/TEST-DETAY-1`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1', { timeout: 5000 });

    const pageTitle = await page.evaluate(() => document.querySelector('h1')?.textContent || '');
    assert(
      pageTitle.includes('Fenerbahçe Sahilinde Panoramik Deniz Manzaralı Penthouse'),
      `İlan başlığı başarıyla yüklendi: "${pageTitle}"`
    );

    const pricePresent = await page.evaluate(() => document.body.textContent.includes('₺32.000.000'));
    assert(pricePresent, 'Formatlı fiyat (₺32.000.000) detay sayfasında görüntülendi');

    const specsPresent = await page.evaluate(() => {
      const text = document.body.textContent;
      return (
        text.includes('4+1') &&
        text.includes('200 m²') &&
        text.includes('8. Kat (Çatı Dubleksi)') &&
        text.includes('Kat Mülkiyetli')
      );
    });
    assert(specsPresent, 'Teknik özellikler tablosu doğru değerlerle render edildi');

    // -------------------------------------------------------------------------
    // TEST 2: Geçersiz veya Bulunmayan İlan ID'sinde 404 Ekranı
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Bulunmayan İlan ID (404 Durumu) ---');
    await page.goto(`${BASE_URL}/ilanlar/PORT-YOK-999`, { waitUntil: 'networkidle0' });
    const isNotFoundPresent = await page.evaluate(() => {
      const text = document.body.textContent;
      return (
        text.includes('İlan Bulunamadı veya Yayından Kaldırıldı') &&
        text.includes('PORT-YOK-999')
      );
    });
    assert(isNotFoundPresent, 'Var olmayan ilan ID girildiğinde şık 404 ekranı açıldı');

    // -------------------------------------------------------------------------
    // TEST 3: Yayından Kaldırılmış (isPublished: false) veya Pasif İlanda 404 Koruması
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Güvenlik Kalkanı: isPublished: false ve Pasif İlan Koruması ---');
    // isPublished: false olan ilan
    await page.goto(`${BASE_URL}/ilanlar/TEST-DETAY-2`, { waitUntil: 'networkidle0' });
    const unpubCheck = await page.evaluate(() =>
      document.body.textContent.includes('İlan Bulunamadı veya Yayından Kaldırıldı')
    );
    assert(unpubCheck, 'isPublished: false olan ilanın detay sayfasına erişim engellendi (404)');

    // Pasif olan ilan
    await page.goto(`${BASE_URL}/ilanlar/TEST-DETAY-3`, { waitUntil: 'networkidle0' });
    const passiveCheck = await page.evaluate(() =>
      document.body.textContent.includes('İlan Bulunamadı veya Yayından Kaldırıldı')
    );
    assert(passiveCheck, 'Pasif statüdeki ilanın detay sayfasına erişim engellendi (404)');

    // -------------------------------------------------------------------------
    // TEST 4 & 5: Zengin Fotoğraf Galerisi & Tam Ekran Lightbox
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4 & 5: Galeri Küçük Resim Seçimi & Lightbox Modalı ---');
    await page.goto(`${BASE_URL}/ilanlar/TEST-DETAY-1`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('img[alt="Küçük Resim 2"]', { timeout: 5000 });

    // 4. Küçük resme tıklayınca ana fotoğraf değişmeli
    await page.click('img[alt="Küçük Resim 2"]');
    const activePhotoText = await page.evaluate(() => {
      return document.body.textContent.includes('2 / 3 Fotoğraf');
    });
    assert(activePhotoText, 'Küçük resme (thumbnail) tıklandığında aktif görsel 2/3 olarak güncellendi');

    // 5. Tam ekran Lightbox açma ve Escape ile kapatma
    await page.click('button[title="Tam Ekran Görüntüle"]');
    await page.waitForSelector('[role="dialog"][aria-label="Tam Ekran Fotoğraf Galerisi"]', {
      timeout: 3000,
    });
    const isModalOpen = await page.evaluate(
      () => document.querySelector('[role="dialog"]') !== null
    );
    assert(isModalOpen, 'Tam ekran Lightbox modalı başarıyla açıldı');

    // Escape tuşuna basarak kapat
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 200));
    const isModalClosed = await page.evaluate(
      () => document.querySelector('[role="dialog"]') === null
    );
    assert(isModalClosed, 'Escape tuşu ile Lightbox modalı başarıyla kapatıldı');

    // -------------------------------------------------------------------------
    // TEST 6, 7 & 8: Yetkili Danışman Kartı, WhatsApp & Telefon ve Güvenlik
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6 - 8: Yetkili Danışman Kartı & Güvenli İletişim Hatları ---');
    const advisorInfo = await page.evaluate(() => {
      const waLink = document.querySelector('a[href^="https://wa.me/"]');
      const telLink = document.querySelector('a[href^="tel:"]');
      return {
        waHref: waLink ? waLink.getAttribute('href') : null,
        telHref: telLink ? telLink.getAttribute('href') : null,
        bodyText: document.body.textContent,
      };
    });

    assert(
      advisorInfo.waHref &&
        advisorInfo.waHref.includes('wa.me/905321112233') &&
        advisorInfo.waHref.includes('TEST-DETAY-1'),
      'WhatsApp bağlantısı doğru danışman numarasını (905321112233) ve ilan ID (TEST-DETAY-1) mesajını içeriyor'
    );

    assert(
      advisorInfo.telHref && advisorInfo.telHref.startsWith('tel:'),
      `Telefon bağlantısı doğrudan arama şemasına (tel:) sahip: "${advisorInfo.telHref}"`
    );

    // GÜVENLİK KONTROLÜ: Danışmanın hash/şifre veya CRM dahili alanları sızmıyor
    assert(
      !advisorInfo.bodyText.includes('dummy_hash_should_never_leak'),
      'GÜVENLİK KRİTERİ: Danışman şifre özeti (hash) sayfada KESİNLİKLE bulunmuyor'
    );
    assert(
      !advisorInfo.bodyText.includes('Gizli CRM Sözleşmesi') &&
        !advisorInfo.bodyText.includes('Gizli Müşteri'),
      'GÜVENLİK KRİTERİ: CRM dahili verileri (contract, matchedBuyers) detay sayfasına sızdırılmıyor'
    );

    // -------------------------------------------------------------------------
    // TEST 9: Doğrulanmamış Bilgi İzolasyonu (Harita ve Galeri Etiketleri)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 9: Doğrulanmamış Bilgi İzolasyonu ---');
    const verifiedDataOnly = await page.evaluate(() => {
      const text = document.body.textContent;
      // Metro, Sahil gibi uydurma ulaşım maddeleri üretilmemeli
      const noFakeTransit =
        !text.includes('Metroya 5 dk') && !text.includes('Hastaneye 200m');
      return noFakeTransit;
    });
    assert(verifiedDataOnly, 'Doğrulanmamış ulaşım veya mesafe bilgisi üretilmedi (Temsili konum korundu)');

    // -------------------------------------------------------------------------
    // TEST 10: Benzer İlanlar Öneri Bölümü
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 10: Benzer İlanlar Bölümü ---');
    const similarListingPresent = await page.evaluate(() => {
      return document.body.textContent.includes('Caddebostan Sahilinde Balkonlu Modern Daire');
    });
    assert(similarListingPresent, 'Aynı ilçe/kategorideki yayında olan benzer ilan önerildi');

    // -------------------------------------------------------------------------
    // TEST 11: Duyarlılık ve Yatay Taşma Denetimi
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 11: Farklı Ekran Çözünürlüklerinde Responsive Uyum ---');
    const viewports = [
      { name: 'Mobil (375x667)', width: 375, height: 667 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Masaüstü (1440x900)', width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(`${BASE_URL}/ilanlar/TEST-DETAY-1`, { waitUntil: 'networkidle0' });

      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      assert(!hasHorizontalScroll, `${vp.name} İlan Detay Sayfası: Yatay taşma (scroll) YOK`);
    }

    console.log('\n================================================================');
    console.log('🎉 TÜM AŞAMA 7.3 TESTLERİ BAŞARIYLA TAMAMLANDI! (11/11 Test Passed)');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ Test sırasında beklenmeyen hata:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runPortal73Tests();

