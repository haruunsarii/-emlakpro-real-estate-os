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
  console.log('🧪 TEST: İletişim Formundan Otomatik CRM Müşteri Kaydı Oluşturma Testi');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // 1. Initial Clean State Setup
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      // Keep test isolated without touching existing user settings if possible,
      // but ensure tasks and customers start clean for this test
      localStorage.removeItem('emlakpro_tasks_v1');
      localStorage.removeItem('emlakpro_customers_v1');
      localStorage.removeItem('emlakpro_requests_v1');
    });

    // =========================================================================
    // SENARYO 1: Yeni Telefonla İletişim Mesajı -> Müşteri & Görev Oluşumu
    // =========================================================================
    console.log('--- SENARYO 1: Yeni Telefonla Mesaj Gönderimi & Otomatik Müşteri Kaydı ---');
    await page.goto(`${BASE_URL}/iletisim`, { waitUntil: 'networkidle0' });

    await page.type('input[name="name"]', 'Eren Bozkurt');
    await page.type('input[name="phone"]', '05351112233');
    await page.type('input[name="email"]', 'eren.bozkurt@example.com');
    await page.type('textarea[name="message"]', 'Kadıköy bölgesindeki lüks konut portföyünüz hakkında detaylı bilgi rica ediyorum.');
    await page.click('input[name="kvkkConsent"]');

    const submitBtn = await page.$('button[type="submit"]');
    assert(submitBtn !== null, 'Mesajı İlet butonu bulundu.');
    await submitBtn.click();

    await page.waitForSelector('[data-testid="contact-success-state"]', { timeout: 4000 });

    const audit1 = await page.evaluate(() => {
      const customers = JSON.parse(localStorage.getItem('emlakpro_customers_v1') || '[]');
      const tasks = JSON.parse(localStorage.getItem('emlakpro_tasks_v1') || '[]');
      return { customers, tasks };
    });

    console.log(`  -> Oluşan Müşteri Sayısı: ${audit1.customers.length}`);
    console.log(`  -> Oluşan Görev Sayısı: ${audit1.tasks.length}`);

    assert(audit1.customers.length === 1, 'emlakpro_customers_v1 havuzunda tam 1 müşteri oluşmalı.');
    const customer1 = audit1.customers[0];
    assert(customer1.name === 'Eren Bozkurt', `Müşteri adı "Eren Bozkurt" olmalı. (Mevcut: "${customer1.name}")`);
    assert(customer1.email === 'eren.bozkurt@example.com', `Müşteri e-postası doğru kaydedilmeli. (Mevcut: "${customer1.email}")`);
    assert(customer1.segment === 'Web Portalı Adayı', `Segment "Web Portalı Adayı" olmalı. (Mevcut: "${customer1.segment}")`);
    assert(customer1.status === 'Sıcak Aday', `Durum "Sıcak Aday" olmalı. (Mevcut: "${customer1.status}")`);
    assert(customer1.statusType === 'hot', `statusType "hot" olmalı. (Mevcut: "${customer1.statusType}")`);
    assert(Array.isArray(customer1.timeline) && customer1.timeline.length === 1, 'Müşteri zaman çizelgesinde 1 aktivite bulunmalı.');

    assert(audit1.tasks.length === 1, 'emlakpro_tasks_v1 havuzunda tam 1 görev oluşmalı.');
    const task1 = audit1.tasks[0];
    assert(task1.customerId === customer1.id, `Görev müşteri ID'si "${customer1.id}" ile eşleşmeli. (Mevcut: "${task1.customerId}")`);
    assert(task1.customerName === 'Eren Bozkurt', `Görevdeki müşteri adı "Eren Bozkurt" olmalı.`);
    assert(task1.title.includes('Web İletişim Mesajı'), 'Görev başlığı "Web İletişim Mesajı" içermeli.');
    console.log('  ✓ [SENARYO 1 BAŞARILI]: Yeni müşteri CRM koleksiyonuna işlendi, görevle tam ilişkilendirildi.\n');

    // =========================================================================
    // SENARYO 2 & 3: Aynı Telefonla İkinci Mesaj -> Mükerrer Yok, Timeline Güncellendi
    // =========================================================================
    console.log('--- SENARYO 2 & 3: Aynı Telefonla İkinci Mesaj (Mükerrer Koruma & Timeline) ---');
    // Click "Yeni Bir Mesaj Gönder" to show the form again
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const newMsgBtn = btns.find(b => b.textContent.includes('Yeni Bir Mesaj Gönder'));
      if (newMsgBtn) newMsgBtn.click();
    });

    await page.waitForSelector('input[name="name"]', { timeout: 3000 });

    // Submit second message with same phone
    await page.type('input[name="name"]', 'Eren Bozkurt');
    await page.type('input[name="phone"]', '0535 111 22 33'); // formatted variation
    await page.type('textarea[name="message"]', 'Ayrıca Kadıköy Moda sahilindeki 3+1 daireler için de randevu talep ediyorum.');
    await page.click('input[name="kvkkConsent"]');

    const submitBtn2 = await page.$('button[type="submit"]');
    await submitBtn2.click();

    await page.waitForSelector('[data-testid="contact-success-state"]', { timeout: 4000 });

    const audit2 = await page.evaluate(() => {
      const customers = JSON.parse(localStorage.getItem('emlakpro_customers_v1') || '[]');
      const tasks = JSON.parse(localStorage.getItem('emlakpro_tasks_v1') || '[]');
      return { customers, tasks };
    });

    console.log(`  -> 2. Gönderim Sonrası Müşteri Sayısı: ${audit2.customers.length}`);
    console.log(`  -> 2. Gönderim Sonrası Görev Sayısı: ${audit2.tasks.length}`);

    // Scenario 2: No duplicate customer
    assert(audit2.customers.length === 1, 'Mükerrer müşteri OLUŞTURULMAMALI. Müşteri sayısı hala 1 olmalı.');
    const updatedCustomer = audit2.customers[0];
    assert(updatedCustomer.id === customer1.id, `Müşteri ID'si değişmemeli. (İlk: "${customer1.id}", Şimdi: "${updatedCustomer.id}")`);

    // Scenario 3: Timeline appended
    assert(updatedCustomer.timeline.length === 2, `Zaman çizelgesine 2. aktivite eklenmeli. (Mevcut: ${updatedCustomer.timeline.length})`);
    const newestTimeline = updatedCustomer.timeline[0];
    assert(newestTimeline.notes.includes('3+1 daireler için de randevu'), 'Yeni aktivite ikinci mesajın içeriğini barındırmalı.');

    // Scenario 4: Task created for every message
    assert(audit2.tasks.length === 2, 'Her mesaj için ayrı görev açılmalı (Toplam 2 görev).');

    // Scenario 5: Both tasks associated with the customer
    const task2 = audit2.tasks[0]; // newest task
    assert(task2.customerId === customer1.id, `İkinci görev de aynı müşteriyle (${customer1.id}) ilişkilendirilmeli.`);
    assert(task2.customerName === 'Eren Bozkurt', 'İkinci görevde de müşteri adı doğru.');

    console.log('  ✓ [SENARYO 2, 3, 4, 5 BAŞARILI]: Mükerrer müşteri önlendi, timeline güncellendi, her 2 görev de müşteriye bağlandı.\n');

    // =========================================================================
    // SENARYO 6: Sayfa Yenilendiğinde Veri Kalıcılığı (Persistence)
    // =========================================================================
    console.log('--- SENARYO 6: Sayfa Yenileme Sonrası Veri Kalıcılığı ---');
    await page.reload({ waitUntil: 'networkidle0' });

    const auditReload = await page.evaluate(() => {
      const customers = JSON.parse(localStorage.getItem('emlakpro_customers_v1') || '[]');
      const tasks = JSON.parse(localStorage.getItem('emlakpro_tasks_v1') || '[]');
      return {
        customerCount: customers.length,
        taskCount: tasks.length,
        timelineCount: customers[0]?.timeline?.length,
      };
    });

    assert(auditReload.customerCount === 1, 'Yenileme sonrası müşteri kaydı korundu.');
    assert(auditReload.taskCount === 2, 'Yenileme sonrası 2 görev kaydı korundu.');
    assert(auditReload.timelineCount === 2, 'Yenileme sonrası 2 timeline aktivitesi korundu.');
    console.log('  ✓ [SENARYO 6 BAŞARILI]: localStorage üzerinde tüm müşteri ve görev verileri kalıcı.\n');

    // =========================================================================
    // SENARYO 7: Talep Bırak ile Çift Yönlü Müşteri Entegrasyonunun Korunumu
    // =========================================================================
    console.log('--- SENARYO 7: Talep Bırak (/talep-birak) ile Çift Yönlü Müşteri Uyumu ---');
    await page.goto(`${BASE_URL}/talep-birak`, { waitUntil: 'networkidle0' });

    // Eren Bozkurt now submits a demand from /talep-birak
    await page.type('input[name="name"]', 'Eren Bozkurt');
    await page.type('input[name="phone"]', '0535 111 22 33');
    await page.type('input[name="email"]', 'eren.bozkurt@example.com');
    await page.click('input[name="kvkkConsent"]');

    const demandSubmitBtn = await page.$('button[type="submit"]');
    await demandSubmitBtn.click();

    await page.waitForSelector('[data-testid="demand-success-state"]', { timeout: 4000 });

    const audit3 = await page.evaluate(() => {
      const customers = JSON.parse(localStorage.getItem('emlakpro_customers_v1') || '[]');
      const demands = JSON.parse(localStorage.getItem('emlakpro_requests_v1') || '[]');
      return { customers, demands };
    });

    assert(audit3.demands.length === 1, 'Talep Bırak üzerinden 1 yeni talep oluşturuldu.');
    assert(audit3.customers.length === 1, 'İletişimden gelen müşteri Talep Bırak ile mükerrer OLUŞTURULMADI.');
    const crossCustomer = audit3.customers[0];
    assert(crossCustomer.timeline.length === 3, `Zaman çizelgesine talep aktivitesi eklendi (Toplam 3 aktivite). (Mevcut: ${crossCustomer.timeline.length})`);
    assert(audit3.demands[0].customerId === crossCustomer.id, 'Talep kaydı müşterinin gerçek ID\'sine bağlandı.');
    console.log('  ✓ [SENARYO 7 BAŞARILI]: Talep Bırak formu ile İletişim formu kusursuz ortak müşteri havuzunu kullandı.\n');

    console.log('========================================================================');
    console.log('🎉 TÜM İLETİŞİM FORMU CRM MÜŞTERİ SENARYOLARI GEÇTİ (7/7 - %100)');
    console.log('========================================================================');
  } finally {
    await browser.close();
  }
}

runTests().catch(err => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
