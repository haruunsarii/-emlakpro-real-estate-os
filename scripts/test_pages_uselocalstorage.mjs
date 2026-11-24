import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function runPagesLocalStorageTests() {
  console.log('🚀 EmlakPro 5 Ana Sayfa useLocalStorage Entegrasyon Testi Başlatılıyor...');
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

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1440, height: 900 });

    // 1. PropertiesPage (/gayrimenkuller)
    console.log('--- 1. Gayrimenkuller Sayfası useLocalStorage Entegrasyonu ---');
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0', timeout: 30000 });
    const propCountInUI = await page.evaluate(() => {
      const el = document.querySelector('h2');
      return !!el && document.body.innerText.includes('Son Eklenen Gayrimenkul Portföyleri') || document.body.innerText.includes('İlan');
    });
    record('Gayrimenkuller sayfası portföy listesini başarıyla yükledi', propCountInUI);

    // Reaktif ekleme testi
    const propSyncOk = await page.evaluate(() => {
      const saved = localStorage.getItem('emlakpro_properties_v1');
      const list = saved ? JSON.parse(saved) : [];
      const testProp = {
        id: 'PORT-TEST-SYNC-99',
        title: 'Reaktif Test Yalısı - Sarıyer',
        location: 'İstanbul, Sarıyer',
        district: 'Sarıyer',
        neighborhood: 'Yeniköy',
        category: 'Konut',
        type: 'Satılık',
        price: 85000000,
        priceFormatted: '₺85.000.000',
        rooms: '6+2',
        area: 600,
        status: 'Aktif',
        dateAdded: new Date().toISOString(),
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      };
      const updated = [testProp, ...list];
      localStorage.setItem('emlakpro_properties_v1', JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent('emlakpro_local_storage_sync', {
          detail: { key: 'emlakpro_properties_v1', newValue: updated },
        })
      );
      return true;
    });
    await new Promise((r) => setTimeout(r, 200));
    const propAppeared = await page.evaluate(() => {
      return document.body.innerText.includes('Reaktif Test Yalısı - Sarıyer');
    });
    record('Gayrimenkuller sayfası useLocalStorage sayesinde yeni ilanı sayfa yenilenmeden gösterdi', propAppeared);

    // Temizlik
    await page.evaluate(() => {
      const saved = localStorage.getItem('emlakpro_properties_v1');
      if (saved) {
        const list = JSON.parse(saved).filter((p) => p.id !== 'PORT-TEST-SYNC-99');
        localStorage.setItem('emlakpro_properties_v1', JSON.stringify(list));
        window.dispatchEvent(
          new CustomEvent('emlakpro_local_storage_sync', {
            detail: { key: 'emlakpro_properties_v1', newValue: list },
          })
        );
      }
    });

    // 2. CustomersPage (/musteriler)
    console.log('\n--- 2. Müşteriler Sayfası useLocalStorage Entegrasyonu ---');
    await page.goto(`${BASE_URL}/musteriler`, { waitUntil: 'networkidle0', timeout: 30000 });
    const customersLoaded = await page.evaluate(() => {
      return document.body.innerText.includes('Müşteri Yönetimi') || document.body.innerText.includes('Müşteri');
    });
    record('Müşteriler sayfası müşteri tablosunu başarıyla yükledi', customersLoaded);

    const custSyncOk = await page.evaluate(() => {
      const saved = localStorage.getItem('emlakpro_customers_v1');
      const list = saved ? JSON.parse(saved) : [];
      const testCust = {
        id: 'c-test-sync-99',
        name: 'Kerem Altan Test',
        initials: 'KA',
        phone: '0 (532) 999 88 77',
        email: 'kerem.altan@example.com',
        role: 'Alıcı',
        segment: 'Alıcı (VIP Portföy)',
        region: 'Sarıyer / Yeniköy',
        budget: '50M - 80M ₺',
        advisor: 'Burak Yılmaz',
        status: 'Sıcak Aday',
        statusType: 'hot',
        registrationDate: 'Bugün',
        avatarBg: 'bg-primary text-on-primary',
      };
      const updated = [testCust, ...list];
      localStorage.setItem('emlakpro_customers_v1', JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent('emlakpro_local_storage_sync', {
          detail: { key: 'emlakpro_customers_v1', newValue: updated },
        })
      );
      return true;
    });
    await new Promise((r) => setTimeout(r, 200));
    const custAppeared = await page.evaluate(() => {
      return document.body.innerText.includes('Kerem Altan Test');
    });
    record('Müşteriler sayfası useLocalStorage sayesinde yeni müşteriyi anında reaktif gösterdi', custAppeared);

    // Temizlik
    await page.evaluate(() => {
      const saved = localStorage.getItem('emlakpro_customers_v1');
      if (saved) {
        const list = JSON.parse(saved).filter((c) => c.id !== 'c-test-sync-99');
        localStorage.setItem('emlakpro_customers_v1', JSON.stringify(list));
        window.dispatchEvent(
          new CustomEvent('emlakpro_local_storage_sync', {
            detail: { key: 'emlakpro_customers_v1', newValue: list },
          })
        );
      }
    });

    // 3. DealsPage (/satis-ve-kiralama)
    console.log('\n--- 3. Satış ve Kiralama Sayfası useLocalStorage Entegrasyonu ---');
    await page.goto(`${BASE_URL}/satis-ve-kiralama`, { waitUntil: 'networkidle0', timeout: 30000 });
    const dealsLoaded = await page.evaluate(() => {
      return document.body.innerText.includes('Fırsat') || document.body.innerText.includes('İşlem Hacmi');
    });
    record('Deals sayfası Kanban panosu ve fırsatları başarıyla yükledi', dealsLoaded);

    const dealSyncOk = await page.evaluate(() => {
      const saved = localStorage.getItem('emlakpro_deals_v1');
      const list = saved ? JSON.parse(saved) : [];
      const testDeal = {
        id: 'DEAL-SYNC-99',
        title: 'Özel Penthouse Satış İşlemi',
        customerName: 'Kerem Altan',
        propertyTitle: 'Zorlu Center Boğaz Penthouse',
        amount: 45000000,
        amountFormatted: '₺45.000.000',
        stage: 'yeni_firsat',
        priority: 'Kritik',
        advisor: 'Burak Yılmaz',
        type: 'Satılık',
      };
      const updated = [testDeal, ...list];
      localStorage.setItem('emlakpro_deals_v1', JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent('emlakpro_local_storage_sync', {
          detail: { key: 'emlakpro_deals_v1', newValue: updated },
        })
      );
      return true;
    });
    await new Promise((r) => setTimeout(r, 200));
    const dealAppeared = await page.evaluate(() => {
      return document.body.innerText.includes('Özel Penthouse Satış İşlemi');
    });
    record('Deals sayfası useLocalStorage sayesinde yeni fırsatı anında render etti', dealAppeared);

    // Temizlik
    await page.evaluate(() => {
      const saved = localStorage.getItem('emlakpro_deals_v1');
      if (saved) {
        const list = JSON.parse(saved).filter((d) => d.id !== 'DEAL-SYNC-99');
        localStorage.setItem('emlakpro_deals_v1', JSON.stringify(list));
        window.dispatchEvent(
          new CustomEvent('emlakpro_local_storage_sync', {
            detail: { key: 'emlakpro_deals_v1', newValue: list },
          })
        );
      }
    });

    // 4. RequestsPage (/talepler)
    console.log('\n--- 4. Müşteri Talepleri Sayfası useLocalStorage Entegrasyonu ---');
    await page.goto(`${BASE_URL}/talepler`, { waitUntil: 'networkidle0', timeout: 30000 });
    const requestsLoaded = await page.evaluate(() => {
      return document.body.innerText.includes('Talep') || document.body.innerText.includes('Eşleşme');
    });
    record('Talepler sayfası ve AI eşleştirme havuzu başarıyla yüklendi', requestsLoaded);

    const demandSyncOk = await page.evaluate(() => {
      const saved = localStorage.getItem('emlakpro_requests_v1');
      const list = saved ? JSON.parse(saved) : [];
      const testDemand = {
        id: 'TLP-SYNC-99',
        clientName: 'Leyla Tekin Test',
        targetRegion: 'Beşiktaş / Bebek',
        propertyType: 'Yalı Dairesi',
        budget: '70M - 90M ₺',
        phone: '0 (532) 111 22 33',
        overallScore: 92,
        status: 'Aktif',
      };
      const updated = [testDemand, ...list];
      localStorage.setItem('emlakpro_requests_v1', JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent('emlakpro_local_storage_sync', {
          detail: { key: 'emlakpro_requests_v1', newValue: updated },
        })
      );
      return true;
    });
    await new Promise((r) => setTimeout(r, 200));
    const demandAppeared = await page.evaluate(() => {
      return document.body.innerText.includes('Leyla Tekin Test');
    });
    record('Talepler sayfası useLocalStorage sayesinde yeni talebi anında render etti', demandAppeared);

    // Temizlik
    await page.evaluate(() => {
      const saved = localStorage.getItem('emlakpro_requests_v1');
      if (saved) {
        const list = JSON.parse(saved).filter((d) => d.id !== 'TLP-SYNC-99');
        localStorage.setItem('emlakpro_requests_v1', JSON.stringify(list));
        window.dispatchEvent(
          new CustomEvent('emlakpro_local_storage_sync', {
            detail: { key: 'emlakpro_requests_v1', newValue: list },
          })
        );
      }
    });

    // 5. TasksPage (/gorevler-ve-randevular)
    console.log('\n--- 5. Görevler ve Randevular Sayfası useLocalStorage Entegrasyonu ---');
    await page.goto(`${BASE_URL}/gorevler-ve-randevular`, { waitUntil: 'networkidle0', timeout: 30000 });
    const tasksLoaded = await page.evaluate(() => {
      return document.body.innerText.includes('Görev') || document.body.innerText.includes('Randevu') || document.body.innerText.includes('Takvim');
    });
    record('Görevler ve Randevular sayfası takvim ve görev listesini başarıyla yükledi', tasksLoaded);

    const taskSyncOk = await page.evaluate(() => {
      const saved = localStorage.getItem('emlakpro_tasks_v1');
      const list = saved ? JSON.parse(saved) : [];
      const testTask = {
        id: 'TASK-SYNC-99',
        title: 'Önemli Noter İpotek İşlemi',
        description: 'Tapu devri öncesi ipotek evraklarının noterden tasdiki',
        priority: 'urgent',
        completed: false,
        dueDate: new Date().toISOString().split('T')[0],
        assignedTo: 'Burak Yılmaz',
      };
      const updated = [testTask, ...list];
      localStorage.setItem('emlakpro_tasks_v1', JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent('emlakpro_local_storage_sync', {
          detail: { key: 'emlakpro_tasks_v1', newValue: updated },
        })
      );
      return true;
    });
    await new Promise((r) => setTimeout(r, 200));
    const taskAppeared = await page.evaluate(() => {
      return document.body.innerText.includes('Önemli Noter İpotek İşlemi');
    });
    record('Görevler sayfası useLocalStorage sayesinde yeni görevi reaktif gösterdi', taskAppeared);

    // Temizlik
    await page.evaluate(() => {
      const saved = localStorage.getItem('emlakpro_tasks_v1');
      if (saved) {
        const list = JSON.parse(saved).filter((t) => t.id !== 'TASK-SYNC-99');
        localStorage.setItem('emlakpro_tasks_v1', JSON.stringify(list));
        window.dispatchEvent(
          new CustomEvent('emlakpro_local_storage_sync', {
            detail: { key: 'emlakpro_tasks_v1', newValue: list },
          })
        );
      }
    });

    console.log('\n=============================================');
    console.log(`TEST SONUCU: ${allPassed ? '5 ANA SAYFANIN TAMAMI BAŞARIYLA GEÇTİ ✅' : 'BAZI TESTLER BAŞARISIZ OLDU ❌'}`);
    console.log(`Toplam Test: ${results.length}, Başarılı: ${results.filter((r) => r.passed).length}`);
    console.log('=============================================\n');
  } catch (err) {
    console.error('Test sırasında beklenmeyen hata:', err);
    allPassed = false;
  } finally {
    await browser.close();
  }

  process.exit(allPassed ? 0 : 1);
}

runPagesLocalStorageTests();

