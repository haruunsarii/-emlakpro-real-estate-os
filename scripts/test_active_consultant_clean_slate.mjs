import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function runConsultantCleanTest() {
  console.log('🚀 EmlakPro — Profil Ayarları Aktif Danışman Temiz Başlangıç Denetimi');
  console.log(`Tarayıcı: ${CHROME_PATH}`);
  console.log(`URL: ${BASE_URL}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const summary = { total: 0, passed: 0, failed: 0 };

  function assert(title, condition, details = '') {
    summary.total++;
    if (condition) {
      summary.passed++;
      console.log(`  ✅ [PASS] ${title} ${details ? '(' + details + ')' : ''}`);
      return true;
    } else {
      summary.failed++;
      console.error(`  ❌ [FAIL] ${title} ${details ? '(' + details + ')' : ''}`);
      return false;
    }
  }

  try {
    // 1. Temiz Başlangıç (LocalStorage Clear)
    console.log('\n--- ADIM 1: LocalStorage Sıfırlanıyor ve /ayarlar Sayfası Açılıyor ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/ayarlar`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));

    const cleanCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasAktifDanisman: text.includes('Aktif Danışman'),
        hasBurakYilmaz: text.includes('Burak Yılmaz'),
        hasEmptyTitle: text.includes('Henüz danışman kaydı bulunmuyor'),
        hasCreateButton: text.includes('Yeni Danışman Profili Tanımla'),
        hasHeaderNoDanisman: text.includes('Danışman Tanımlanmadı'),
      };
    });

    assert('Temiz başlangıçta "Aktif Danışman" etiketi görünmüyor', !cleanCheck.hasAktifDanisman);
    assert('Temiz başlangıçta sabit demo adı "Burak Yılmaz" görünmüyor', !cleanCheck.hasBurakYilmaz);
    assert('Profil Ayarları boş durumu gösteriliyor ("Henüz danışman kaydı bulunmuyor")', cleanCheck.hasEmptyTitle);
    assert('"Yeni Danışman Profili Tanımla" butonu mevcut', cleanCheck.hasCreateButton);
    assert('Üst menü profilinde "Danışman Tanımlanmadı" bilgisi gösteriliyor', cleanCheck.hasHeaderNoDanisman);

    // 2. Sayfa Yenileme ile Otomatik Kayıt Oluşmama Denetimi
    console.log('\n--- ADIM 2: Sayfa Yenileniyor (Otomatik Tohumlama Olmama Kontrolü) ---');
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));

    const reloadCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      const rawSettings = localStorage.getItem('emlakpro_settings_v1');
      return {
        hasAktifDanisman: text.includes('Aktif Danışman'),
        hasBurakYilmaz: text.includes('Burak Yılmaz'),
        hasEmptyTitle: text.includes('Henüz danışman kaydı bulunmuyor'),
        rawSettings: rawSettings,
      };
    });

    assert('Sayfa yenilendiğinde "Aktif Danışman" kendiliğinden oluşmuyor', !reloadCheck.hasAktifDanisman);
    assert('Sayfa yenilendiğinde boş durum korunuyor', reloadCheck.hasEmptyTitle);
    assert('LocalStorage içinde kendiliğinden sahte profil tohumlanmadı', !reloadCheck.rawSettings || !reloadCheck.rawSettings.includes('Burak Yılmaz'));

    // 3. Form Açma & Yeni Danışman Profili Kaydetme
    console.log('\n--- ADIM 3: Profil Tanımlama ve Aktif Danışman Durumuna Geçiş ---');
    const openFormClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find((b) => b.innerText.includes('Yeni Danışman Profili Tanımla'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert('"Yeni Danışman Profili Tanımla" butonuna tıklandı', openFormClicked);
    await new Promise((r) => setTimeout(r, 400));

    // Form alanlarını page.type ile doldur
    await page.type('input[placeholder="Adınız"]', 'Kemal');
    await page.type('input[placeholder="Soyadınız"]', 'Öztürk');
    await page.type('input[placeholder*="Kıdemli Danışman"]', 'Broker / Ofis Yöneticisi');
    await new Promise((r) => setTimeout(r, 200));

    // Kaydet butonuna bas
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const saveBtn = buttons.find((b) => b.innerText.includes('Değişiklikleri Kaydet'));
      if (saveBtn) saveBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const savedCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasAktifDanisman: text.includes('Aktif Danışman'),
        hasKemalOzturk: text.includes('Kemal Öztürk'),
        hasBrokerTitle: text.includes('Broker / Ofis Yöneticisi'),
      };
    });

    assert('Profil kaydedildikten sonra "Aktif Danışman" etiketi belirdi', savedCheck.hasAktifDanisman);
    assert('Kaydedilen danışman adı görüntülendi (Kemal Öztürk)', savedCheck.hasKemalOzturk);

    // 4. Fabrika Ayarlarına Sıfırlama Denetimi
    console.log('\n--- ADIM 4: Fabrika Ayarlarına Sıfırlama ve Emniyet Yedeği Kontrolü ---');
    // Veri Yönetimi sekmesine geç
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const dataTab = buttons.find((b) => b.innerText.includes('Veri Yönetimi'));
      if (dataTab) dataTab.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    // Sıfırla fonksiyonunu tetikle
    const resetTriggered = await page.evaluate(async () => {
      const { resetCrmToFactoryDefaults } = await import('/src/services/settingsData.js');
      resetCrmToFactoryDefaults();
      return true;
    });
    assert('resetCrmToFactoryDefaults() fonksiyonu tetiklendi', resetTriggered);
    await new Promise((r) => setTimeout(r, 600));

    // Emniyet yedeğini doğrula
    const backupCheck = await page.evaluate(() => {
      const safetyBackup = localStorage.getItem('emlakpro_pre_restore_safety_backup');
      const settingsKey = localStorage.getItem('emlakpro_settings_v1');
      return {
        hasBackup: !!safetyBackup,
        backupContainsKemal: safetyBackup ? safetyBackup.includes('Kemal') : false,
        settingsCleared: !settingsKey,
      };
    });
    assert('Sıfırlamadan önce emlakpro_pre_restore_safety_backup oluşturuldu', backupCheck.hasBackup && backupCheck.backupContainsKemal);
    assert('Sıfırlama sonrası emlakpro_settings_v1 temizlendi', backupCheck.settingsCleared);

    // Profil sekmesine geri dön ve Aktif Danışman kontrolü yap
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const profileTab = buttons.find((b) => b.innerText.includes('Profil'));
      if (profileTab) profileTab.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    const postResetCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasAktifDanisman: text.includes('Aktif Danışman'),
        hasEmptyTitle: text.includes('Henüz danışman kaydı bulunmuyor'),
        hasDanismanTanimlanmadi: text.includes('Danışman Tanımlanmadı'),
      };
    });

    assert('Sıfırlama sonrasında "Aktif Danışman" etiketi kaldırıldı', !postResetCheck.hasAktifDanisman);
    assert('Sıfırlama sonrasında boş durum mesajı geri geldi ("Henüz danışman kaydı bulunmuyor")', postResetCheck.hasEmptyTitle);
    assert('Üst menü profilinde "Danışman Tanımlanmadı" gösteriliyor', postResetCheck.hasDanismanTanimlanmadi);

    // 5. Sıfırlama Sonrası Sayfa Yenileme ile Kalıcılık
    console.log('\n--- ADIM 5: Sıfırlama Sonrası Yenileme ile Kalıcılık ---');
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));

    const finalReloadCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasAktifDanisman: text.includes('Aktif Danışman'),
        hasEmptyTitle: text.includes('Henüz danışman kaydı bulunmuyor'),
        hasBurakYilmaz: text.includes('Burak Yılmaz'),
      };
    });

    assert('Sıfırlama ve yenileme sonrasında "Aktif Danışman" görünmüyor', !finalReloadCheck.hasAktifDanisman);
    assert('Sıfırlama ve yenileme sonrasında "Burak Yılmaz" görünmüyor', !finalReloadCheck.hasBurakYilmaz);
    assert('Sıfırlama ve yenileme sonrasında "Henüz danışman kaydı bulunmuyor" boş durumu korunuyor', finalReloadCheck.hasEmptyTitle);

  } catch (err) {
    console.error('Test hatası:', err);
  } finally {
    await browser.close();
    console.log(`\n========================================`);
    console.log(`Toplam Test: ${summary.total} | Başarılı: ${summary.passed} | Başarısız: ${summary.failed}`);
    console.log(`========================================\n`);
  }
}

runConsultantCleanTest();
