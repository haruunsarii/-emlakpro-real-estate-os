import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.resolve('docs/screenshots/tasks-check');

async function updateScreenshots() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,950'],
    defaultViewport: { width: 1440, height: 950 },
  });

  try {
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });

    await page.evaluate(() => {
      const adminUser = {
        id: 'usr-admin-1',
        name: 'Harun Sarı',
        email: 'harun@emlakpro.com',
        role: 'admin',
        title: 'Yönetici Broker',
        status: 'Aktif',
      };
      const agentUser = {
        id: 'usr-agent-1',
        name: 'Selin Vardar',
        email: 'selin@emlakpro.com',
        role: 'Gayrimenkul Danışmanı',
        title: 'Lüks Konut Uzmanı',
        status: 'Aktif',
      };
      localStorage.setItem('emlakpro_settings_v1', JSON.stringify({ users: [adminUser, agentUser] }));
      localStorage.setItem(
        'emlakpro_session_v1',
        JSON.stringify({
          userId: 'usr-admin-1',
          name: 'Harun Sarı',
          email: 'harun@emlakpro.com',
          role: 'admin',
          displayRole: 'Yönetici Broker',
        })
      );
    });

    await page.goto(`${BASE_URL}/gorevler-ve-randevular`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));

    // Ensure status filter is 'all'
    await page.evaluate(() => {
      const statusPill = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Durum:')
      );
      statusPill?.click();
    });
    await new Promise((r) => setTimeout(r, 300));
    await page.evaluate(() => {
      const allOption = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.trim() === 'Tüm Durumlar'
      );
      allOption?.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // 1. Create a task with Harun Sarı
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Görev Ekle')
      );
      btn?.click();
    });
    await page.waitForSelector('#task-modal-form', { visible: true });
    await page.type('#task-form-title', 'PORT-8841 Kadıköy Tapu Takyidat ve İpotek Kontrolü');
    await page.type('#task-form-desc', 'Moda Penthouse devir işlemi öncesi şerh ve haciz kontrolleri tamamlanacak.');
    await page.select('#task-form-priority', 'urgent');

    // Submit task
    await page.evaluate(() => {
      const submitBtn = document.querySelector('button[form="task-modal-form"]');
      submitBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // Scroll to TaskList
    await page.evaluate(() => {
      const list = Array.from(document.querySelectorAll('h3')).find((el) => el.innerText.includes('Günün Görevleri'));
      list?.scrollIntoView({ block: 'center' });
    });
    await new Promise((r) => setTimeout(r, 400));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-task-created-in-list.png'), fullPage: false });

    // 2. Mark completed
    await page.evaluate(() => {
      const span = Array.from(document.querySelectorAll('span.font-label-sm.text-label-sm')).find((el) =>
        el.innerText.includes('PORT-8841 Kadıköy Tapu Takyidat')
      );
      const card = span?.closest('.group');
      const checkbox = card?.querySelector('input[type="checkbox"]');
      checkbox?.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    await page.evaluate(() => {
      const list = Array.from(document.querySelectorAll('h3')).find((el) => el.innerText.includes('Günün Görevleri'));
      list?.scrollIntoView({ block: 'center' });
    });
    await new Promise((r) => setTimeout(r, 400));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-task-marked-completed.png'), fullPage: false });

    // 3. Reload for persistence check
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 800));

    await page.evaluate(() => {
      const statusPill = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Durum:')
      );
      statusPill?.click();
    });
    await new Promise((r) => setTimeout(r, 300));
    await page.evaluate(() => {
      const allOption = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.trim() === 'Tüm Durumlar'
      );
      allOption?.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    await page.evaluate(() => {
      const list = Array.from(document.querySelectorAll('h3')).find((el) => el.innerText.includes('Günün Görevleri'));
      list?.scrollIntoView({ block: 'center' });
    });
    await new Promise((r) => setTimeout(r, 400));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-task-persisted-after-reload.png'), fullPage: false });

    // 4. Create appointment with Harun Sarı
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 400));

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Yeni Randevu Oluştur')
      );
      btn?.click();
    });
    await page.waitForSelector('#appointment-modal-form', { visible: true });
    await page.type('#appt-form-title', 'Moda Penthouse VIP Müşteri Yer Gösterimi');
    await page.select('#appt-form-type', 'Yer Gösterimi');

    await page.evaluate(() => {
      const startTimeInput = document.getElementById('appt-form-start-time');
      const endTimeInput = document.getElementById('appt-form-end-time');
      if (startTimeInput) startTimeInput.value = '10:00';
      if (endTimeInput) endTimeInput.value = '11:00';
      startTimeInput?.dispatchEvent(new Event('input', { bubbles: true }));
      startTimeInput?.dispatchEvent(new Event('change', { bubbles: true }));
      endTimeInput?.dispatchEvent(new Event('input', { bubbles: true }));
      endTimeInput?.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await page.evaluate(() => {
      const submitBtn = document.querySelector('button[form="appointment-modal-form"]');
      submitBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-appointment-created-and-viewed.png'), fullPage: false });

    console.log('✓ Ekran görüntüleri Harun Sarı ile güncellendi.');
  } finally {
    await browser.close();
  }
}

updateScreenshots().catch(console.error);

