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

async function runPortal74Tests() {
  console.log('================================================================');
  console.log('🚀 Aşama 7.4: Müşteri Talep Formu, İletişim & CRM Entegrasyon Testi');
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
    // TEST HAZIRLIĞI
    // -------------------------------------------------------------------------
    console.log('--- TEST HAZIRLIĞI: Test Verileri & Ortam Kurulumu ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

    await page.evaluate(() => {
      localStorage.removeItem('emlakpro_session_v1');
      localStorage.removeItem('emlakpro_requests_v1');
      localStorage.removeItem('emlakpro_tasks_v1');
      localStorage.removeItem('emlakpro_customers_v1');

      // Test danışman ve ofis
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
            title: 'Kıdemli Danışman',
            phone: '0532 111 2233',
            email: 'burak@emlakpro.com.tr',
            role: 'consultant',
            displayRole: 'Danışman',
            status: 'active',
          },
        ],
      };
      localStorage.setItem('emlakpro_settings_v1', JSON.stringify(settings));

      // Test portföyü (Kadıköy Satılık Daire - 25M ₺)
      const testProperties = [
        {
          id: 'TEST-PORT-74',
          title: 'Moda Sahilinde Panoramik 3+1 Daire',
          type: 'Satılık',
          category: 'Daire',
          status: 'Aktif',
          isPublished: true,
          location: 'Kadıköy, İstanbul',
          district: 'Kadıköy',
          neighborhood: 'Moda',
          price: 25000000,
          priceFormatted: '₺25.000.000',
          rooms: '3+1',
          netArea: 160,
          advisor: 'Burak Yılmaz',
          image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        },
      ];
      localStorage.setItem('emlakpro_properties_v1', JSON.stringify(testProperties));
    });

    console.log('  ✓ Ortam sıfırlandı ve test verileri enjekte edildi.\n');

    // -------------------------------------------------------------------------
    // TEST 1: /talep-birak Form Validasyonu ve KVKK Zorunluluğu
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: /talep-birak Form Validasyon Denetimi ---');
    await page.goto(`${BASE_URL}/talep-birak`, { waitUntil: 'networkidle0' });

    // Boş form ile göndermeyi dene
    const submitBtn = await page.$('button[type="submit"]');
    assert(submitBtn !== null, 'Talebi İlet butonu bulundu.');
    await submitBtn.click();
    await new Promise((r) => setTimeout(r, 200));

    // Kırmızı validasyon hatalarının varlığını denetle
    const errorTexts = await page.evaluate(() => {
      const pElements = Array.from(document.querySelectorAll('p.text-rose-600'));
      return pElements.map((el) => el.textContent.trim());
    });

    assert(
      errorTexts.some((t) => t.includes('Adınız ve soyadınız en az 2 karakter')),
      'Boş ad-soyad hata uyarısı başarıyla gösterildi.'
    );
    assert(
      errorTexts.some((t) => t.includes('geçerli bir Türkiye cep telefonu')),
      'Geçersiz telefon hata uyarısı başarıyla gösterildi.'
    );
    assert(
      errorTexts.some((t) => t.includes('KVKK aydınlatma metnini onaylamanız')),
      'KVKK onay kutusu eksikliği uyarısı başarıyla gösterildi.'
    );

    // Henüz requests havuzuna hiçbir şey yazılmamış olmalı
    const requestsAfterFail = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('emlakpro_requests_v1') || '[]');
    });
    assert(requestsAfterFail.length === 0, 'Validasyon hatasında localStorage kaydı engellendi.');
    console.log('[TEST 1] /talep-birak Validasyon ve KVKK denetimi BAŞARILI.\n');

    // -------------------------------------------------------------------------
    // TEST 2: /talep-birak Başarılı Talep Gönderimi & localStorage Entegrasyonu
    // -------------------------------------------------------------------------
    console.log('--- TEST 2: /talep-birak Başarılı Talep Gönderimi ---');
    // Ad Soyad gir
    await page.type('input[name="name"]', 'Canan Yurt');
    // Telefon gir
    await page.type('input[name="phone"]', '05423334455');
    // İlçe gir
    await page.type('input[name="district"]', 'Kadıköy');
    // Bütçe gir
    await page.type('input[name="minBudget"]', '15000000');
    await page.type('input[name="maxBudget"]', '30000000');
    // KVKK onayla
    await page.click('input[name="kvkkConsent"]');

    // Gönder
    await submitBtn.click();
    await page.waitForSelector('[data-testid="demand-success-state"]', { timeout: 3000 });

    // Başarı ekranındaki TLP- referansını oku
    const successRefText = await page.evaluate(() => {
      return document.querySelector('[data-testid="demand-success-state"]')?.textContent || '';
    });
    assert(successRefText.includes('TLP-'), 'Ekranda TLP-XXXX referans takip kodu gösterildi.');

    // localStorage'daki kaydı doğrula
    const storedRequests = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('emlakpro_requests_v1') || '[]');
    });
    assert(storedRequests.length === 1, 'emlakpro_requests_v1 koleksiyonuna 1 adet talep eklendi.');
    const firstReq = storedRequests[0];
    assert(firstReq.clientName === 'Canan Yurt', 'clientName "Canan Yurt" olarak kaydedildi.');
    assert(firstReq.phone.includes('542'), 'Telefon maskelenmiş olarak kaydedildi.');
    assert(firstReq.transactionType === 'Satılık', 'İşlem türü Satılık olarak kaydedildi.');
    assert(firstReq.source === 'Müşteri Portalı', 'Kaynak "Müşteri Portalı" olarak işaretlendi.');
    assert(firstReq.status === 'Aktif', 'Talep durumu "Aktif" olarak açıldı.');
    console.log('[TEST 2] Başarılı talep kaydı ve veri modeli denetimi BAŞARILI.\n');

    // -------------------------------------------------------------------------
    // TEST 3: Canlı Portföy Eşleştirme Motoru (overallScore ve matchedProperties)
    // -------------------------------------------------------------------------
    console.log('--- TEST 3: Canlı Portföy Eşleştirme Motoru Denetimi ---');
    // İlk talep Kadıköy 15M-30M aralığındaydı; test portföyü (Kadıköy 25M) ile eşleşmeli
    assert(firstReq.overallScore > 0, `Eşleşme skoru pozitif hesaplandı (Skor: %${firstReq.overallScore}).`);
    assert(firstReq.matchedProperties.length > 0, 'Eşleşen portföyler dizisi (matchedProperties) dolduruldu.');
    assert(
      firstReq.matchedProperties[0].id === 'TEST-PORT-74',
      'Test portföyü (#TEST-PORT-74) başarıyla eşleşti.'
    );

    assert(typeof firstReq.overallScore === 'number', 'Eşleştirme skoru sayısal tipte.');
    assert(firstReq.overallScore >= 0, 'Eşleşme skoru sıfır veya pozitif değerde.');
    console.log('[TEST 3] Canlı portföy eşleştirme motoru denetimi BAŞARILI.\n');

    // -------------------------------------------------------------------------
    // TEST 4: Mükerrer Müşteri Koruma Denetimi (emlakpro_customers_v1)
    // -------------------------------------------------------------------------
    console.log('--- TEST 4: Mükerrer Müşteri Denetimi & emlakpro_customers_v1 ---');
    // İlk talep sonrası müşteriler havuzunu oku
    const customersAfterFirst = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('emlakpro_customers_v1') || '[]');
    });
    assert(customersAfterFirst.length === 1, 'İlk talep sonrası 1 yeni müşteri adayı oluşturuldu.');
    assert(customersAfterFirst[0].name === 'Canan Yurt', 'Müşteri adı Canan Yurt.');
    const initialCustomerId = customersAfterFirst[0].id;

    // "Yeni Bir Talep Bırak" butonuna tıkla
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Yeni Bir Talep Bırak')
      );
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 200));

    // Aynı telefonla ikinci kez talep gönder
    await page.type('input[name="name"]', 'Canan Yurt');
    await page.type('input[name="phone"]', '05423334455'); // Aynı numara
    await page.click('input[name="kvkkConsent"]');
    const submitBtn2 = await page.$('button[type="submit"]');
    await submitBtn2.click();
    await page.waitForSelector('[data-testid="demand-success-state"]', { timeout: 3000 });

    // Müşteriler havuzunu tekrar oku
    const customersAfterSecond = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('emlakpro_customers_v1') || '[]');
    });
    assert(
      customersAfterSecond.length === 1,
      'Mükerrer telefon numarasında yeni müşteri oluşturulmadı (Müşteri sayısı 1 olarak korundu).'
    );
    assert(
      customersAfterSecond[0].id === initialCustomerId,
      'Talepler aynı müşteri ID ile ilişkilendirildi.'
    );
    assert(
      customersAfterSecond[0].timeline.length >= 2,
      'Mevcut müşterinin aktivite geçmişine (timeline) yeni talep notu eklendi.'
    );
    console.log('[TEST 4] Mükerrer müşteri koruması ve timeline entegrasyonu BAŞARILI.\n');

    // -------------------------------------------------------------------------
    // TEST 5: Danışman Güvenliği ve Sahte Danışman Üretilmeme Denetimi
    // -------------------------------------------------------------------------
    console.log('--- TEST 5: Danışman Güvenliği Denetimi ---');
    // İlk talepte Burak Yılmaz vardı; talep ona atanmış olmalı
    const currentRequests = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('emlakpro_requests_v1') || '[]');
    });
    assert(
      currentRequests[0].advisor === 'Burak Yılmaz',
      'Mevcut aktif danışman (Burak Yılmaz) talebe atandı.'
    );

    // Şimdi settings.users listesini tamamen boşaltalım ve yeni talep gönderelim
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('emlakpro_settings_v1') || '{}');
      s.users = [];
      localStorage.setItem('emlakpro_settings_v1', JSON.stringify(s));
    });
    // Sayfayı boş kullanıcı durumuyla yenile
    await page.goto(`${BASE_URL}/talep-birak`, { waitUntil: 'networkidle0' });

    await page.type('input[name="name"]', 'Kemal Soylu');
    await page.type('input[name="phone"]', '05551234567');
    await page.click('input[name="kvkkConsent"]');
    const submitBtn3 = await page.$('button[type="submit"]');
    await submitBtn3.click();
    await page.waitForSelector('[data-testid="demand-success-state"]', { timeout: 3000 });

    const requestsAfterEmptyUsers = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('emlakpro_requests_v1') || '[]');
    });
    const latestReq = requestsAfterEmptyUsers[0];
    assert(
      latestReq.advisor === null,
      'Kullanıcı listesi boşken sahte danışman üretilmedi (advisor: null).'
    );
    assert(
      latestReq.advisorInitials === null,
      'Kullanıcı listesi boşken sahte baş harf üretilmedi (advisorInitials: null).'
    );
    console.log('[TEST 5] Danışman güvenliği ve sahte veri üretilmeme denetimi BAŞARILI.\n');

    // -------------------------------------------------------------------------
    // TEST 6: /iletisim Mesaj Formu ve CRM Görevler (emlakpro_tasks_v1) Entegrasyonu
    // -------------------------------------------------------------------------
    console.log('--- TEST 6: /iletisim Mesaj Formu & emlakpro_tasks_v1 ---');
    await page.goto(`${BASE_URL}/iletisim`, { waitUntil: 'networkidle0' });

    // Boş gönderim dene
    const contactSubmitBtn = await page.$('button[type="submit"]');
    assert(contactSubmitBtn !== null, 'Mesajı İlet butonu bulundu.');
    await contactSubmitBtn.click();
    await new Promise((r) => setTimeout(r, 200));

    const contactErrors = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('p.text-rose-600')).map((el) => el.textContent.trim());
    });
    assert(contactErrors.length >= 3, 'İletişim formunda zorunlu alan hataları gösterildi.');

    // Geçerli mesaj gir
    await page.type('input[name="name"]', 'Murat Aslan');
    await page.type('input[name="phone"]', '05339998877');
    await page.type('textarea[name="message"]', 'Kadıköy bölgesindeki ticari yatırımlar hakkında görüşmek istiyorum.');
    await page.click('input[name="kvkkConsent"]');

    await contactSubmitBtn.click();
    await page.waitForSelector('[data-testid="contact-success-state"]', { timeout: 3000 });

    const contactTasks = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('emlakpro_tasks_v1') || '[]');
    });
    assert(contactTasks.length === 1, 'emlakpro_tasks_v1 havuzuna 1 yeni görev kaydedildi.');
    const firstTask = contactTasks[0];
    assert(firstTask.title.includes('Web İletişim Mesajı'), 'Görev başlığı "Web İletişim Mesajı" içeriyor.');
    assert(firstTask.priority === 'high', 'Görev önceliği "high" olarak belirlendi.');
    assert(firstTask.dueDate.length === 10, 'Görev teslim tarihi YYYY-MM-DD formatında.');
    assert(firstTask.completed === false, 'Görev tamamlanmadı (aktif) olarak açıldı.');
    console.log('[TEST 6] /iletisim Mesaj Formu ve CRM görev entegrasyonu BAŞARILI.\n');

    // -------------------------------------------------------------------------
    // TEST 7: İlan Detay Hızlı Danışman Formu (/ilanlar/:id)
    // -------------------------------------------------------------------------
    console.log('--- TEST 7: İlan Detay Hızlı Danışman Formu Entegrasyonu ---');
    await page.goto(`${BASE_URL}/ilanlar/TEST-PORT-74`, { waitUntil: 'networkidle0' });

    // Danışman kartındaki formu doldur
    const inquiryNameInput = await page.$('input[name="name"]');
    const inquiryPhoneInput = await page.$('input[name="phone"]');
    const inquiryKvkk = await page.$('input[name="kvkkConsent"]');
    const inquirySubmitBtn = await page.$('form button[type="submit"]');

    assert(inquiryNameInput !== null, 'İlan detay danışman mesaj ad alanı mevcut.');
    assert(inquiryPhoneInput !== null, 'İlan detay danışman mesaj telefon alanı mevcut.');

    await inquiryNameInput.type('Zeynep Koç');
    await inquiryPhoneInput.type('05357776655');
    await inquiryKvkk.click();

    await inquirySubmitBtn.click();
    await page.waitForSelector('[data-testid="inquiry-success-state"]', { timeout: 3000 });

    // Görev havuzundaki ilana özel görevi doğrula
    const tasksAfterInquiry = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('emlakpro_tasks_v1') || '[]');
    });
    assert(tasksAfterInquiry.length === 2, 'emlakpro_tasks_v1 içinde 2 adet görev oluştu.');
    const inquiryTask = tasksAfterInquiry[0];
    assert(
      inquiryTask.title.includes('İlan Bilgi Talebi: #TEST-PORT-74'),
      'Görev başlığı ilanın referans kodunu (#TEST-PORT-74) içeriyor.'
    );
    assert(inquiryTask.priority === 'urgent', 'İlana özel bilgi talebi önceliği "urgent" olarak ayarlandı.');
    console.log('[TEST 7] İlan Detay Danışman Hızlı Mesaj entegrasyonu BAŞARILI.\n');

    // -------------------------------------------------------------------------
    // TEST 8: Prototip Bildirim Şeffaflığı (Yanıltıcı Taahhüt Verilmeme Denetimi)
    // -------------------------------------------------------------------------
    console.log('--- TEST 8: Prototip Bildirim Şeffaflığı Denetimi ---');
    const pageHtml = await page.content();
    assert(
      !pageHtml.includes('2 saat içinde kesin'),
      'Gerçekleşmeyen 2 saat içinde kesin arama garantisi verilmediği doğrulandı.'
    );
    assert(
      !pageHtml.includes('SMS telefonunuza iletildi'),
      'Yanıltıcı SMS gönderildi taahhüdü verilmediği doğrulandı.'
    );
    assert(
      pageHtml.includes('Prototip Modu'),
      'Prototip yerel bellek (localStorage) bilgilendirmesinin yer aldığı doğrulandı.'
    );
    console.log('[TEST 8] Prototip bildirim şeffaflığı BAŞARILI.\n');

    // -------------------------------------------------------------------------
    // TEST 9: Farklı Ekran Genişliklerinde Duyarlılık ve Taşma Kontrolü
    // -------------------------------------------------------------------------
    console.log('--- TEST 9: Responsive & Taşma Kontrolü (375px, 768px, 1440px) ---');
    const viewports = [
      { name: 'Mobil (375px)', width: 375, height: 667 },
      { name: 'Tablet (768px)', width: 768, height: 1024 },
      { name: 'Masaüstü (1440px)', width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(`${BASE_URL}/talep-birak`, { waitUntil: 'networkidle0' });

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      assert(!hasHorizontalScroll, `${vp.name} ekranında /talep-birak yatay taşma (overflow) yapmıyor.`);

      await page.goto(`${BASE_URL}/iletisim`, { waitUntil: 'networkidle0' });
      const hasHorizontalScrollContact = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      assert(!hasHorizontalScrollContact, `${vp.name} ekranında /iletisim yatay taşma yapmıyor.`);
    }
    console.log('[TEST 9] Duyarlılık ve taşma testleri BAŞARILI.\n');

    console.log('================================================================');
    console.log('🎉 TEBRİKLER! Aşama 7.4 TÜM TESTLER BAŞARIYLA TAMAMLANDI (9/9)');
    console.log('================================================================\n');
  } catch (err) {
    console.error('❌ Test sırasında beklenmeyen hata:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runPortal74Tests();
