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

async function runTests() {
  console.log('========================================================================');
  console.log('🧪 TEST: Dinamik Danışman Atama ve Burak Yılmaz Temizliği Testi');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1440,900',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Seed test users: Harun Sarı (Active Admin), Elif Demir (Active Agent), Caner Aydın (Passive Agent)
    await page.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      const adminUser = {
        id: 'usr-admin-1',
        name: 'Harun Sarı',
        email: 'harun@emlakpro.com',
        role: 'Yönetici Broker',
        title: 'Yönetici Broker',
        status: 'Aktif',
      };
      const activeConsultant = {
        id: 'usr-agent-2',
        name: 'Selin Vardar',
        email: 'selin@emlakpro.com',
        role: 'Gayrimenkul Danışmanı',
        title: 'Lüks Konut Uzmanı',
        status: 'Aktif',
      };
      const passiveConsultant = {
        id: 'usr-agent-3',
        name: 'Ahmet Pasif',
        email: 'ahmet@emlakpro.com',
        role: 'Gayrimenkul Danışmanı',
        title: 'Bölge Danışmanı',
        status: 'Pasif',
      };

      const settings = {
        users: [adminUser, activeConsultant, passiveConsultant],
      };
      const session = {
        userId: 'usr-admin-1',
        name: 'Harun Sarı',
        email: 'harun@emlakpro.com',
        role: 'admin',
        displayRole: 'Yönetici Broker',
      };

      // Seed an unassigned property to test no fake advisor fallback
      const oldUnassignedProp = {
        id: 'PORT-UNASSIGNED-1',
        title: 'Danışmansız Eski İlan',
        type: 'Satılık',
        category: 'Daire',
        price: 9500000,
        priceFormatted: '₺9.500.000',
        unitPrice: '₺95.000 / m²',
        netArea: 100,
        rooms: '2+1',
        location: 'Kadıköy / Moda',
        district: 'Kadıköy',
        neighborhood: 'Moda',
        status: 'Aktif',
        statusType: 'active',
        isPublished: true,
        advisor: null, // Explicitly no advisor
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        gallery: [],
      };

      localStorage.setItem('emlakpro_settings_v1', JSON.stringify(settings));
      localStorage.setItem('emlakpro_session_v1', JSON.stringify(session));
      localStorage.setItem('emlakpro_properties_v1', JSON.stringify([oldUnassignedProp]));
    });

    // =========================================================================
    // SENARYO 1, 2, 3: Yeni İlan Açıldığında Harun Sarı Varsayılan & Pasif Filtre
    // =========================================================================
    console.log('--- SENARYO 1, 2 & 3: Harun Sarı Varsayılan Seçim, Aktif/Pasif Listesi ---');
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0' });
    await page.bringToFront();

    // Click "Yeni Portföy Ekle"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Yeni Portföy Ekle'));
      if (btn) btn.click();
    });

    await page.waitForSelector('#property-form', { timeout: 5000 });

    // Inspect advisor select options and default value
    const selectData = await page.evaluate(() => {
      const select = document.querySelector('select#property-advisor');
      if (!select) return null;
      const options = Array.from(select.options).map(o => ({
        value: o.value,
        text: o.text,
      }));
      return {
        selectedValue: select.value,
        options,
      };
    });

    console.log('  -> Select Aktif Değer:', selectData.selectedValue);
    console.log('  -> Select Seçenekleri:', selectData.options);

    assert(selectData.selectedValue === 'Harun Sarı', `Varsayılan danışman Harun Sarı olmalı. (Mevcut: "${selectData.selectedValue}")`);
    assert(!selectData.options.some(o => o.value === 'Burak Yılmaz'), 'Seçeneklerde sabit "Burak Yılmaz" OLMAMALI.');
    assert(selectData.options.some(o => o.value === 'Selin Vardar'), 'Seçeneklerde aktif danışman "Selin Vardar" bulunmalı.');
    assert(!selectData.options.some(o => o.value === 'Ahmet Pasif'), 'Pasif danışman "Ahmet Pasif" seçeneklerde KESİNLİKLE OLMAMALI.');
    console.log('  ✓ [SENARYO 1, 2, 3 BAŞARILI]: Harun Sarı dinamik varsayılan geldi, aktifler listelendi, pasifler filtrelendi.\n');

    // =========================================================================
    // SENARYO 4: Başka Bir Danışman Seçilip Kaydedilmesi
    // =========================================================================
    console.log('--- SENARYO 4: Başka Bir Danışman (Selin Vardar) Seçilip Kaydedilmesi ---');
    await page.type('input[placeholder*="Moda Sahilinde"]', 'Selin Vardar Portföyü Test İlanı');
    await page.type('input[placeholder="Örn: 28500000"]', '24000000');
    await page.type('input[placeholder="Örn: 185"]', '210');

    // Select Selin Vardar
    await page.select('select#property-advisor', 'Selin Vardar');

    // Click "Portföyü Kaydet"
    await page.evaluate(() => {
      const btn = document.querySelector('button[form="property-form"]');
      if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 1200));

    // Verify stored property advisor
    const savedPropAudit = await page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem('emlakpro_properties_v1') || '[]');
      const prop = stored.find(p => p.title === 'Selin Vardar Portföyü Test İlanı');
      return {
        found: !!prop,
        advisor: prop?.advisor,
      };
    });

    console.log('  -> Kaydedilen İlan Danışmanı:', savedPropAudit.advisor);
    assert(savedPropAudit.found, 'Yeni ilan localStorage içinde bulundu.');
    assert(savedPropAudit.advisor?.name === 'Selin Vardar', `Danışman adı "Selin Vardar" olmalı. (Mevcut: "${savedPropAudit.advisor?.name}")`);
    assert(savedPropAudit.advisor?.title === 'Lüks Konut Uzmanı', `Danışman unvanı "Lüks Konut Uzmanı" olmalı. (Mevcut: "${savedPropAudit.advisor?.title}")`);
    console.log('  ✓ [SENARYO 4 BAŞARILI]: Seçilen danışman doğru ad ve unvanla kaydedildi.\n');

    // =========================================================================
    // SENARYO 5: Danışman Değiştirilmeden Düzenleme Yapıldığında Korunması
    // =========================================================================
    console.log('--- SENARYO 5: Düzenlemede Mevcut Atamanın Korunması ---');
    // Open edit on Selin Vardar's property
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#portfolio-grid-container > div'));
      const card = cards.find(c => c.textContent.includes('Selin Vardar Portföyü Test İlanı'));
      const editBtn = card ? card.querySelector('button[title="İlanı Düzenle"]') : null;
      if (editBtn) editBtn.click();
    });

    await page.waitForSelector('#property-form', { timeout: 5000 });

    const editSelectedAdvisor = await page.evaluate(() => {
      const sel = document.querySelector('select#property-advisor');
      return sel ? sel.value : null;
    });

    console.log('  -> Düzenleme Formu Açılışındaki Danışman:', editSelectedAdvisor);
    assert(editSelectedAdvisor === 'Selin Vardar', `Düzenlemede seçili danışman mevcut "Selin Vardar" olmalı. (Mevcut: "${editSelectedAdvisor}")`);

    // Save without touching advisor
    await page.evaluate(() => {
      const btn = document.querySelector('button[form="property-form"]');
      if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 1200));

    const afterEditAdvisor = await page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem('emlakpro_properties_v1') || '[]');
      const prop = stored.find(p => p.title === 'Selin Vardar Portföyü Test İlanı');
      return prop?.advisor?.name;
    });

    assert(afterEditAdvisor === 'Selin Vardar', `Düzenleme sonrası danışman "Selin Vardar" olarak korunmalı. (Mevcut: "${afterEditAdvisor}")`);
    console.log('  ✓ [SENARYO 5 BAŞARILI]: Düzenlemede mevcut danışman seçimi ve kaydı korundu.\n');

    // =========================================================================
    // SENARYO 6: Danışmanı Olmayan İlanda Sahte Burak Yılmaz Gösterilmemesi
    // =========================================================================
    console.log('--- SENARYO 6: Danışmansız İlanda Sahte Burak Yılmaz Gösterilmemesi ---');
    const unassignedCardText = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#portfolio-grid-container > div'));
      const unassignedCard = cards.find(c => c.textContent.includes('Danışmansız Eski İlan'));
      return unassignedCard ? unassignedCard.innerText : null;
    });

    console.log('  -> Danışmansız Kart İçeriği Snippet:', unassignedCardText?.slice(0, 300));
    assert(unassignedCardText !== null, 'Danışmansız kart DOM üzerinde bulundu.');
    assert(!unassignedCardText.includes('Burak Yılmaz'), 'Danışmansız kartta "Burak Yılmaz" KESİNLİKLE OLMAMALI.');
    assert(unassignedCardText.includes('Danışman atanmadı'), 'Danışmansız kartta "Danışman atanmadı" gösterilmeli.');
    console.log('  ✓ [SENARYO 6 BAŞARILI]: Danışmanı olmayan ilanda sahte kişi adı yerine "Danışman atanmadı" gösterildi.\n');

    // =========================================================================
    // SENARYO 7: Harun Sarı ile Yeni İlan Kaydetme (Varsayılan Akış)
    // =========================================================================
    console.log('--- SENARYO 7: Harun Sarı Varsayılanı ile Yeni İlan Kaydetme ---');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Yeni Portföy Ekle'));
      if (btn) btn.click();
    });

    await page.waitForSelector('#property-form', { timeout: 5000 });
    await page.type('input[placeholder*="Moda Sahilinde"]', 'Harun Sarı Otomatik Zimmetli İlan');
    await page.type('input[placeholder="Örn: 28500000"]', '31000000');
    await page.type('input[placeholder="Örn: 185"]', '250');

    // Don't touch advisor - should default to Harun Sarı
    await page.evaluate(() => {
      const btn = document.querySelector('button[form="property-form"]');
      if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 1200));

    const harunPropAudit = await page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem('emlakpro_properties_v1') || '[]');
      const prop = stored.find(p => p.title === 'Harun Sarı Otomatik Zimmetli İlan');
      return prop?.advisor;
    });

    console.log('  -> Harun Sarı Otomatik İlan Danışmanı:', harunPropAudit);
    assert(harunPropAudit?.name === 'Harun Sarı', `Danışman adı "Harun Sarı" olmalı. (Mevcut: "${harunPropAudit?.name}")`);
    assert(harunPropAudit?.title === 'Yönetici Broker', `Danışman unvanı "Yönetici Broker" olmalı. (Mevcut: "${harunPropAudit?.title}")`);
    console.log('  ✓ [SENARYO 7 BAŞARILI]: Dokunulmadan kaydedilen ilan oturumdaki Harun Sarı\'ya zimmetlendi.\n');

    console.log('========================================================================');
    console.log('🎉 TÜM DİNAMİK DANIŞMAN SENARYOLARI EKSİKSİZ GEÇTİ (7/7 - %100)');
    console.log('========================================================================');
  } finally {
    await browser.close();
  }
}

runTests().catch(err => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
