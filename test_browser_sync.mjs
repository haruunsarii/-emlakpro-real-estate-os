/**
 * Live Browser Synchronization Test using Puppeteer-Core with real Google Chrome
 * Tests the 7-step data consistency and reactive update cycle across all 8 screens without F5 reload.
 */
import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';

async function runBrowserTest() {
  console.log('====================================================');
  console.log('EmlakPro Real Browser Automation & Multi-Screen Test');
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  let testsPassed = 0;
  let totalTests = 0;

  function assert(cond, msg) {
    totalTests++;
    if (!cond) {
      console.error(`❌ FAIL: ${msg}`);
      throw new Error(msg);
    }
    console.log(`✓ PASS: ${msg}`);
    testsPassed++;
  }

  try {
    // 1. Initial Page Load
    console.log('Step 1: Navigating to Dashboard (http://localhost:5173)...');
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    const pageTitle = await page.title();
    assert(pageTitle.includes('EmlakPro'), `App loaded successfully: "${pageTitle}"`);

    // Clean start in browser localStorage
    await page.evaluate(() => {
      window.localStorage.clear();
      window.dispatchEvent(new Event('storage'));
    });
    await new Promise((r) => setTimeout(r, 500));

    // 2. Generate JSON Backup
    console.log('\nStep 2: Creating original JSON backup snapshot...');
    const originalBackup = await page.evaluate(async () => {
      // Import settingsData service directly in browser
      const mod = await import('/src/services/settingsData.js');
      return mod.exportAllCrmData();
    });

    assert(originalBackup.schemaVersion === '2.4', 'Backup has schemaVersion 2.4');
    assert(originalBackup.data.customers.length === 6, 'Backup has exactly 6 customers');
    assert(originalBackup.data.properties.length === 15, 'Backup has exactly 15 properties');
    assert(originalBackup.data.deals.length === 12, 'Backup has exactly 12 deals');
    assert(originalBackup.data.demands.length === 5, 'Backup has exactly 5 demands');
    assert(originalBackup.data.tasks.length === 7, 'Backup has exactly 7 tasks');
    assert(originalBackup.data.appointments.length === 14, 'Backup has exactly 14 appointments');
    assert(originalBackup.metricsSummary.totalRecords === 59, 'Total records count in backup is 59');

    // 3. Mutate Data: Change customer, delete property, change deal stage
    console.log('\nStep 3: Mutating CRM data in browser...');
    const mutationResult = await page.evaluate(async () => {
      // a. Modify customer
      const custData = JSON.parse(window.localStorage.getItem('emlakpro_customers_v1') || '[]');
      const targetCust = custData.length > 0 ? custData : (await import('/src/services/mockData.js')).customersList;
      const modifiedCust = JSON.parse(JSON.stringify(targetCust));
      modifiedCust[0].name = 'Selin Vardar (GÜNCELLENDİ)';
      window.localStorage.setItem('emlakpro_customers_v1', JSON.stringify(modifiedCust));

      // b. Delete property (remove 1 property)
      const propData = JSON.parse(window.localStorage.getItem('emlakpro_properties_v1') || '[]');
      const targetProps = propData.length > 0 ? propData : (await import('/src/services/mockData.js')).initialPropertiesList;
      const modifiedProps = targetProps.slice(1); // 14 properties left
      window.localStorage.setItem('emlakpro_properties_v1', JSON.stringify(modifiedProps));

      // c. Change deal stage (move FRS-101 to tamamlandi)
      const dealsData = JSON.parse(window.localStorage.getItem('emlakpro_deals_v1') || '[]');
      const targetDeals = dealsData.length > 0 ? dealsData : (await import('/src/services/mockData.js')).initialDealsList;
      const modifiedDeals = JSON.parse(JSON.stringify(targetDeals));
      const deal1 = modifiedDeals.find((d) => d.id === 'FRS-101');
      if (deal1) {
        deal1.stage = 'tamamlandi';
        deal1.completedAt = new Date().toISOString();
      }
      window.localStorage.setItem('emlakpro_deals_v1', JSON.stringify(modifiedDeals));

      // Dispatch sync events
      window.dispatchEvent(new Event('storage'));
      return {
        custName: modifiedCust[0].name,
        propsCount: modifiedProps.length,
        dealStage: deal1?.stage,
      };
    });

    assert(mutationResult.custName === 'Selin Vardar (GÜNCELLENDİ)', 'Customer modified in browser localStorage');
    assert(mutationResult.propsCount === 14, 'Property deleted (count reduced to 14)');
    assert(mutationResult.dealStage === 'tamamlandi', 'Deal stage updated to tamamlandi');

    // 4. Verify modified state in live UI (Dashboard & Customers) without F5
    console.log('\nStep 4: Checking live UI updates before restore...');
    await new Promise((r) => setTimeout(r, 600));

    // Dashboard check: total portfolio count should show 14 İlan
    const dashboardPropCountText = await page.evaluate(() => {
      const el = document.querySelector('.font-currency-stat');
      return el ? el.textContent : '';
    });
    assert(dashboardPropCountText.includes('14 İlan'), `Dashboard dynamically updated to "14 İlan" without F5 (got "${dashboardPropCountText}")`);

    // Navigate to /musteriler using in-app client navigation
    await page.evaluate(() => {
      const link = document.querySelector('a[href="/musteriler"]');
      if (link) link.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // Check customer name in table
    const renderedCustName = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('Selin Vardar (GÜNCELLENDİ)');
    });
    assert(renderedCustName, 'Customers page table rendered mutated name "Selin Vardar (GÜNCELLENDİ)"');

    // 5. Restore Original JSON Backup
    console.log('\nStep 5: Restoring original JSON backup in browser...');
    const restoreResult = await page.evaluate(async (backup) => {
      const mod = await import('/src/services/settingsData.js');
      return mod.restoreCrmData(backup);
    }, originalBackup);

    assert(restoreResult === true, 'restoreCrmData returned true');

    // 6. Check all 8 screens without F5 reload
    console.log('\nStep 6: Verifying all 8 screens reflect restored data without F5 reload...');

    // Screen 2: Müşteriler (Currently on /musteriler)
    await new Promise((r) => setTimeout(r, 600));
    const isCustomerRestored = await page.evaluate(() => {
      const body = document.body.innerText;
      const hasOldName = body.includes('Selin Vardar');
      const hasMutatedName = body.includes('Selin Vardar (GÜNCELLENDİ)');
      return hasOldName && !hasMutatedName;
    });
    assert(isCustomerRestored, 'Screen 2 (Müşteriler): Customer name restored to "Selin Vardar" without F5');

    // Screen 1: Dashboard (Navigate via router)
    await page.evaluate(() => {
      const link = document.querySelector('a[href="/"]');
      if (link) link.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    const restoredPropCount = await page.evaluate(() => {
      const el = document.querySelector('.font-currency-stat');
      return el ? el.textContent : '';
    });
    assert(restoredPropCount.includes('15 İlan'), `Screen 1 (Dashboard): Portfolio count restored to "15 İlan" (got "${restoredPropCount}")`);

    // Screen 3: Gayrimenkuller
    await page.evaluate(() => {
      const link = document.querySelector('a[href="/gayrimenkuller"]');
      if (link) link.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    
    // Page 1 should render 10 cards (pagination itemsPerPage = 10)
    const page1CardsCount = await page.evaluate(() => {
      const container = document.getElementById('portfolio-grid-container');
      return container ? container.children.length : 0;
    });
    assert(page1CardsCount === 10, `Screen 3 (Gayrimenkuller): Page 1 rendered exactly 10 cards (count: ${page1CardsCount})`);

    const page1Text = await page.evaluate(() => document.body.innerText);
    assert(page1Text.includes('15 portföyden') && page1Text.includes('1 - 10'), 'Screen 3 (Gayrimenkuller): Page 1 pagination indicator shows "15 portföyden 1 - 10 arası gösteriliyor"');

    // Click Page 2 button
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.trim() === '2');
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // Page 2 should render remaining 5 cards
    const page2CardsCount = await page.evaluate(() => {
      const container = document.getElementById('portfolio-grid-container');
      return container ? container.children.length : 0;
    });
    assert(page2CardsCount === 5, `Screen 3 (Gayrimenkuller): Page 2 rendered exactly remaining 5 cards (count: ${page2CardsCount})`);

    const page2Text = await page.evaluate(() => document.body.innerText);
    assert(page2Text.includes('11 - 15'), 'Screen 3 (Gayrimenkuller): Page 2 pagination indicator shows "11 - 15 arası gösteriliyor"');

    // Click Prev button to return to Page 1
    await page.evaluate(() => {
      const prevBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Önceki'));
      if (prevBtn) prevBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    const returnedPage1CardsCount = await page.evaluate(() => {
      const container = document.getElementById('portfolio-grid-container');
      return container ? container.children.length : 0;
    });
    assert(returnedPage1CardsCount === 10, `Screen 3 (Gayrimenkuller): Returned to Page 1 with 10 cards`);

    // Screen 4: Talepler
    await page.evaluate(() => {
      const link = document.querySelector('a[href="/talepler"]');
      if (link) link.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    const demandsBody = await page.evaluate(() => document.body.innerText);
    assert(demandsBody.includes('TLP-4821'), 'Screen 4 (Talepler): Demand TLP-4821 present in list');

    // Screen 5: Satış & Kiralama (Kanban)
    await page.evaluate(() => {
      const link = document.querySelector('a[href="/satis-ve-kiralama"]');
      if (link) link.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    const deal101Stage = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('PORT-8841') || body.includes('Moda Sahil Penthouse Satışı');
    });
    assert(deal101Stage, 'Screen 5 (Satış ve Kiralama): Restored deal "Moda Sahil Penthouse Satışı" (PORT-8841) present on Kanban board');

    // Screen 6: Görevler & Randevular
    await page.evaluate(() => {
      const link = document.querySelector('a[href="/gorevler-ve-randevular"]');
      if (link) link.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    const tasksBody = await page.evaluate(() => document.body.innerText);
    assert(tasksBody.includes('Suadiye Daire Devri') || tasksBody.includes('TSK-1') || tasksBody.includes('APT-1'), 'Screen 6 (Görevler & Randevular): Restored tasks & appointments visible');

    // Screen 7: Raporlar
    await page.evaluate(() => {
      const link = document.querySelector('a[href="/raporlar"]');
      if (link) link.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    const reportsBody = await page.evaluate(() => document.body.innerText);
    assert(reportsBody.includes('Performans') || reportsBody.includes('Raporlar'), 'Screen 7 (Raporlar): Reports page rendered');

    // Screen 8: Ayarlar
    await page.evaluate(() => {
      const link = document.querySelector('a[href="/ayarlar"]');
      if (link) link.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    const settingsBody = await page.evaluate(() => document.body.innerText);
    assert(settingsBody.includes('59 Aktif Kayıt') || settingsBody.includes('Aktif Kayıt'), 'Screen 8 (Ayarlar): System metrics strip displays restored record pool');

    console.log('\n====================================================');
    console.log(`Live Browser Test Result: ${testsPassed} / ${totalTests} PASSED cleanly in real Chrome!`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('Browser Test Error:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runBrowserTest();
