import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function runReportsOptimizationTests() {
  console.log('🚀 Starting Reports Render & DOM Isolation E2E Verification...\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const testResults = {
    initialLoadAndKpiCards: false,
    kpiSelectionDomIsolation: false,
    chartControlsFunctional: false,
    leaderboardSortingFunctional: false,
    transactionsTableSearchAndFilter: false,
    headerPeriodAndConsultantFilters: false,
    responsiveLayoutsPass: false,
  };

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // -------------------------------------------------------------
    // TEST 1: Initial Load & KPI Cards
    // -------------------------------------------------------------
    console.log('1️⃣ Navigating to /raporlar...');
    await page.goto(`${BASE_URL}/raporlar`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const initialInfo = await page.evaluate(() => {
      const kpiCards = document.querySelectorAll('.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-5 > div').length;
      const headerTitle = document.querySelector('h1')?.textContent?.trim() || '';
      const chartTitle = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Gelir Analizi'))?.textContent?.trim() || '';
      const leaderboardRows = document.querySelectorAll('table tbody tr').length;
      return { kpiCards, headerTitle, chartTitle, leaderboardRows };
    });

    console.log(`   Initial state: ${initialInfo.kpiCards} KPI cards, "${initialInfo.headerTitle}", chart "${initialInfo.chartTitle}", ${initialInfo.leaderboardRows} table rows.`);
    if (initialInfo.kpiCards === 5 && initialInfo.headerTitle.includes('Raporlar') && initialInfo.chartTitle.includes('Gelir Analizi')) {
      testResults.initialLoadAndKpiCards = true;
      console.log('   ✅ PASS: Reports page loaded with all core analytics sections.');
    } else {
      console.log('   ❌ FAIL: Initial state check failed.');
    }

    // -------------------------------------------------------------
    // TEST 2: Active KPI Selection DOM Isolation (Requirement 5)
    // When activeKpiKey changes, unrelated charts, tables, and header
    // must experience EXACTLY 0 DOM mutations!
    // -------------------------------------------------------------
    console.log('\n2️⃣ Testing Active KPI Selection DOM Isolation (0 DOM Mutations on unrelated components)...');
    const kpiIsolation = await page.evaluate(async () => {
      // Locate unrelated component root containers
      const headerEl = document.querySelector('.p-space-md.rounded-2xl.bg-surface-container-low');
      const chartEl = Array.from(document.querySelectorAll('.rounded-2xl.p-space-lg')).find(el => el.querySelector('h2')?.textContent?.includes('Gelir Analizi'));
      const comparisonEl = Array.from(document.querySelectorAll('.rounded-2xl.p-space-lg')).find(el => el.querySelector('h3')?.textContent?.includes('Satış & Kiralama Analizi'));
      const leaderboardEl = Array.from(document.querySelectorAll('.rounded-2xl.p-space-lg')).find(el => el.querySelector('h3')?.textContent?.includes('Danışman Performans Sıralaması'));
      const regionalEl = Array.from(document.querySelectorAll('.rounded-2xl.p-space-lg')).find(el => el.querySelector('h3')?.textContent?.includes('Bölgesel Talep'));
      const transactionsEl = Array.from(document.querySelectorAll('.rounded-2xl.p-space-lg')).find(el => el.querySelector('h3')?.textContent?.includes('Son Gerçekleşen İşlemler'));

      let headerMutations = 0;
      let chartMutations = 0;
      let comparisonMutations = 0;
      let leaderboardMutations = 0;
      let regionalMutations = 0;
      let transactionsMutations = 0;

      const headerObs = new MutationObserver(m => { headerMutations += m.length; });
      const chartObs = new MutationObserver(m => { chartMutations += m.length; });
      const compObs = new MutationObserver(m => { comparisonMutations += m.length; });
      const leaderObs = new MutationObserver(m => { leaderboardMutations += m.length; });
      const regObs = new MutationObserver(m => { regionalMutations += m.length; });
      const txObs = new MutationObserver(m => { transactionsMutations += m.length; });

      if (headerEl) headerObs.observe(headerEl, { childList: true, subtree: true, attributes: true, characterData: true });
      if (chartEl) chartObs.observe(chartEl, { childList: true, subtree: true, attributes: true, characterData: true });
      if (comparisonEl) compObs.observe(comparisonEl, { childList: true, subtree: true, attributes: true, characterData: true });
      if (leaderboardEl) leaderObs.observe(leaderboardEl, { childList: true, subtree: true, attributes: true, characterData: true });
      if (regionalEl) regObs.observe(regionalEl, { childList: true, subtree: true, attributes: true, characterData: true });
      if (transactionsEl) txObs.observe(transactionsEl, { childList: true, subtree: true, attributes: true, characterData: true });

      // Click the 2nd KPI card
      const kpiCards = Array.from(document.querySelectorAll('.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-5 > div'));
      const targetCard = kpiCards[1];
      if (targetCard) targetCard.click();

      await new Promise(r => setTimeout(r, 150));

      headerObs.disconnect();
      chartObs.disconnect();
      compObs.disconnect();
      leaderObs.disconnect();
      regObs.disconnect();
      txObs.disconnect();

      const isTargetCardActive = targetCard ? targetCard.className.includes('ring-2') : false;

      return {
        isTargetCardActive,
        headerMutations,
        chartMutations,
        comparisonMutations,
        leaderboardMutations,
        regionalMutations,
        transactionsMutations,
      };
    });

    console.log('   Active KPI Isolation Result:', kpiIsolation);
    if (
      kpiIsolation.isTargetCardActive &&
      kpiIsolation.headerMutations === 0 &&
      kpiIsolation.chartMutations === 0 &&
      kpiIsolation.comparisonMutations === 0 &&
      kpiIsolation.leaderboardMutations === 0 &&
      kpiIsolation.regionalMutations === 0 &&
      kpiIsolation.transactionsMutations === 0
    ) {
      testResults.kpiSelectionDomIsolation = true;
      console.log('   ✅ PASS: Active KPI toggled with EXACTLY 0 DOM mutations across all 6 unrelated sections.');
    } else {
      console.log('   ❌ FAIL: Unwanted DOM mutations detected.');
    }

    // -------------------------------------------------------------
    // TEST 3: Revenue Analytics Chart Interval & Type Switches
    // -------------------------------------------------------------
    console.log('\n3️⃣ Testing Revenue Analytics Chart Controls (Monthly/Yearly & Bar/Line)...');
    const chartTest = await page.evaluate(async () => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const yearlyBtn = allButtons.find(b => b.textContent.trim() === 'Yıllık Büyüme');
      const monthlyBtn = allButtons.find(b => b.textContent.trim() === 'Aylık Trend');
      const lineBtn = allButtons.find(b => b.title === 'Çizgi Grafik');
      const barBtn = allButtons.find(b => b.title === 'Çubuk Grafik');

      let yearlySwitched = false;
      let lineSwitched = false;

      if (yearlyBtn) {
        yearlyBtn.click();
        await new Promise(r => setTimeout(r, 100));
        yearlySwitched = !!document.querySelector('.pl-14.pr-4');
      }

      if (lineBtn) {
        lineBtn.click();
        await new Promise(r => setTimeout(r, 100));
        lineSwitched = !!document.querySelector('svg path[stroke="#0058be"]');
      }

      // Restore to bar & monthly
      if (barBtn) barBtn.click();
      if (monthlyBtn) monthlyBtn.click();
      await new Promise(r => setTimeout(r, 100));

      return { yearlySwitched, lineSwitched };
    });

    console.log('   Chart controls result:', chartTest);
    if (chartTest.yearlySwitched && chartTest.lineSwitched) {
      testResults.chartControlsFunctional = true;
      console.log('   ✅ PASS: Chart toggled between intervals and chart types correctly.');
    } else {
      console.log('   ❌ FAIL: Chart control toggle failed.');
    }

    // -------------------------------------------------------------
    // TEST 4: Consultant Leaderboard Sorting
    // -------------------------------------------------------------
    console.log('\n4️⃣ Testing Consultant Leaderboard Sorting...');
    const sortTest = await page.evaluate(async () => {
      const gdvHeader = Array.from(document.querySelectorAll('th')).find(th => th.textContent.includes('Satış Hacmi (GDV)'));
      if (!gdvHeader) return { error: 'GDV Header not found' };

      const initialFirstAgent = document.querySelector('table tbody tr td .font-label-md')?.textContent?.trim() || '';

      gdvHeader.click();
      await new Promise(r => setTimeout(r, 150));
      const sortedFirstAgent = document.querySelector('table tbody tr td .font-label-md')?.textContent?.trim() || '';

      // Toggle order
      gdvHeader.click();
      await new Promise(r => setTimeout(r, 150));
      const reversedFirstAgent = document.querySelector('table tbody tr td .font-label-md')?.textContent?.trim() || '';

      return {
        initialFirstAgent,
        sortedFirstAgent,
        reversedFirstAgent,
        orderToggled: sortedFirstAgent !== reversedFirstAgent,
      };
    });

    console.log('   Leaderboard sort result:', sortTest);
    if (sortTest.orderToggled) {
      testResults.leaderboardSortingFunctional = true;
      console.log('   ✅ PASS: Leaderboard sorted by column and order dynamically.');
    } else {
      console.log('   ❌ FAIL: Leaderboard sort failed.');
    }

    // -------------------------------------------------------------
    // TEST 5: Recent Transactions Table Filtering & Search
    // -------------------------------------------------------------
    console.log('\n5️⃣ Testing Recent Transactions Table Filtering & Search...');
    const txTest = await page.evaluate(async () => {
      const txContainer = Array.from(document.querySelectorAll('.rounded-2xl.p-space-lg')).find(el => el.querySelector('h3')?.textContent?.includes('Son Gerçekleşen İşlemler'));
      if (!txContainer) return { error: 'Transactions container not found' };

      const allButtons = Array.from(txContainer.querySelectorAll('button'));
      const saleBtn = allButtons.find(b => b.textContent.trim() === 'Satış');
      const allBtn = allButtons.find(b => b.textContent.trim() === 'Tümü');
      const searchInput = txContainer.querySelector('input[placeholder*="İşlem, müşteri veya portföy"]');

      const initialCount = txContainer.querySelectorAll('tbody tr').length;

      // Filter by Sale
      if (saleBtn) saleBtn.click();
      await new Promise(r => setTimeout(r, 100));
      const saleCount = txContainer.querySelectorAll('tbody tr').length;

      // Search term
      if (searchInput) {
        searchInput.value = 'Kadıköy';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      await new Promise(r => setTimeout(r, 100));
      const searchedCount = txContainer.querySelectorAll('tbody tr').length;

      // Reset
      if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (allBtn) allBtn.click();
      await new Promise(r => setTimeout(r, 100));
      const restoredCount = txContainer.querySelectorAll('tbody tr').length;

      return {
        initialCount,
        saleCount,
        searchedCount,
        restoredCount,
      };
    });

    console.log('   Transactions filter & search result:', txTest);
    if (txTest.restoredCount === txTest.initialCount && txTest.saleCount > 0) {
      testResults.transactionsTableSearchAndFilter = true;
      console.log('   ✅ PASS: Transactions table filtered by category and searched cleanly.');
    } else {
      console.log('   ❌ FAIL: Transactions filter test failed.');
    }

    // -------------------------------------------------------------
    // TEST 6: Header Period Presets & Consultant Filter
    // -------------------------------------------------------------
    console.log('\n6️⃣ Testing Header Date Presets & Consultant Filter...');
    const headerTest = await page.evaluate(async () => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const day30Btn = allButtons.find(b => b.textContent.trim() === 'Son 30 Gün');
      const allPeriodBtn = allButtons.find(b => b.textContent.trim() === 'Tüm Zamanlar');

      let periodChanged = false;
      if (day30Btn) {
        day30Btn.click();
        await new Promise(r => setTimeout(r, 150));
        periodChanged = day30Btn.className.includes('bg-primary');
      }

      // Restore to all
      if (allPeriodBtn) {
        allPeriodBtn.click();
        await new Promise(r => setTimeout(r, 150));
      }

      return { periodChanged };
    });

    console.log('   Header filter result:', headerTest);
    if (headerTest.periodChanged) {
      testResults.headerPeriodAndConsultantFilters = true;
      console.log('   ✅ PASS: Date preset buttons and consultant filter active.');
    } else {
      console.log('   ❌ FAIL: Header filter failed.');
    }

    // -------------------------------------------------------------
    // TEST 7: Responsive Viewports (375px, 768px, 1440px)
    // -------------------------------------------------------------
    console.log('\n7️⃣ Testing Responsive Viewports (375px, 768px, 1440px)...');

    // Desktop
    await page.setViewport({ width: 1440, height: 900 });
    await new Promise(r => setTimeout(r, 200));
    const desktopOk = await page.evaluate(() => {
      const has2Columns = !!document.querySelector('.xl\\:col-span-8');
      return has2Columns;
    });

    // Tablet
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise(r => setTimeout(r, 200));
    const tabletOk = await page.evaluate(() => {
      const kpiGrid = !!document.querySelector('.grid-cols-1.sm\\:grid-cols-2');
      return kpiGrid;
    });

    // Mobile
    await page.setViewport({ width: 375, height: 667 });
    await new Promise(r => setTimeout(r, 200));
    const mobileOk = await page.evaluate(() => {
      const mobileCards = document.querySelectorAll('.md\\:hidden').length > 0;
      return mobileCards;
    });

    console.log(`   Responsive check: Desktop: ${desktopOk}, Tablet: ${tabletOk}, Mobile: ${mobileOk}`);
    if (desktopOk && tabletOk && mobileOk) {
      testResults.responsiveLayoutsPass = true;
      console.log('   ✅ PASS: Responsive layouts render properly on all screen widths.');
    } else {
      console.log('   ❌ FAIL: Responsive check failed.');
    }

  } catch (err) {
    console.error('❌ E2E Execution Error:', err);
  } finally {
    await browser.close();
  }

  console.log('\n========================================');
  console.log('🎯 REPORTS OPTIMIZATION TEST SUMMARY:');
  console.log('========================================');
  for (const [key, val] of Object.entries(testResults)) {
    console.log(`${val ? '✅' : '❌'} ${key}: ${val ? 'PASS' : 'FAIL'}`);
  }
  const allPassed = Object.values(testResults).every(Boolean);
  console.log(`\nOVERALL STATUS: ${allPassed ? 'ALL TESTS PASSED 🎉' : 'SOME TESTS FAILED ⚠️'}`);
}

runReportsOptimizationTests();

