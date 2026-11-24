import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve('docs', 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const SCREENS = [
  { id: '01-dashboard', name: 'Dashboard', path: '/' },
  { id: '02-customers', name: 'Müşteriler', path: '/musteriler' },
  { id: '03-properties', name: 'Gayrimenkuller', path: '/gayrimenkuller' },
  { id: '04-demands', name: 'Talepler', path: '/talepler' },
  { id: '05-deals-kanban', name: 'Satış ve Kiralama', path: '/satis-ve-kiralama' },
  { id: '06-tasks-calendar', name: 'Görevler ve Randevular', path: '/gorevler-ve-randevular' },
  { id: '07-reports-analytics', name: 'Raporlar', path: '/raporlar' },
  { id: '08-settings-system', name: 'Ayarlar', path: '/ayarlar' },
];

async function captureScreenshots() {
  console.log('📸 EmlakPro Profesyonel Ekran Görüntüleri Oluşturuluyor...');
  console.log(`Çıktı Dizini: ${OUTPUT_DIR}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();

  try {
    for (const screen of SCREENS) {
      const url = `${BASE_URL}${screen.path}`;

      // 1. Desktop Screenshot (1440x900)
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
      await page.goto(url, { waitUntil: 'networkidle0' });
      await new Promise((r) => setTimeout(r, 600));

      const desktopFile = path.join(OUTPUT_DIR, `${screen.id}-desktop.png`);
      await page.screenshot({ path: desktopFile, fullPage: false });
      console.log(`  ✓ [Masaüstü 1440px] ${screen.name} -> ${screen.id}-desktop.png`);

      // 2. Mobile Screenshot (390x844 - iPhone 13/14)
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
      await page.goto(url, { waitUntil: 'networkidle0' });
      await new Promise((r) => setTimeout(r, 600));

      const mobileFile = path.join(OUTPUT_DIR, `${screen.id}-mobile.png`);
      await page.screenshot({ path: mobileFile, fullPage: false });
      console.log(`  ✓ [Mobil 390px] ${screen.name} -> ${screen.id}-mobile.png`);
    }

    console.log('\n🎉 Tüm 16 ekran görüntüsü (8 Masaüstü + 8 Mobil) başarıyla oluşturuldu!');
  } finally {
    await browser.close();
  }
}

captureScreenshots().catch((err) => {
  console.error('Ekran görüntüsü hatası:', err);
  process.exit(1);
});

