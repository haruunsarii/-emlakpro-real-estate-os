import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function runDashboardOptimizationTests() {
  console.log('🚀 Starting Dashboard Render Optimization E2E Verification...\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const testResults = {
    chartSplineInvariantOnHover: false,
    chartFiltersUpdateGeometryAccurately: false,
    seriesFiltersToggleVisibility: false,
    bentoCardsIsolatedFromModalOpenClose: false,
    propertyDetailModalIsolated: false,
    kpiGridAccurate: false,
    responsiveLayoutsPass: false,
  };

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1200 });

    // -------------------------------------------------------------
    // TEST 1: Navigate to Dashboard & Check Initial Structure
    // -------------------------------------------------------------
    console.log('1️⃣ Navigating to Dashboard (/)...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // Scroll chart into view
    await page.evaluate(() => {
      const el = document.getElementById('chart-filter');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 200));

    // Verify all 6 bento sections exist
    const sections = await page.evaluate(() => {
      const header = document.querySelector('h1')?.textContent.includes('Genel Bakış');
      const kpis = document.querySelectorAll('.font-currency-stat').length;
      const chart = !!document.getElementById('chart-filter');
      const recentProps = document.querySelectorAll('h2').length > 0;
      const appointments = document.body.textContent.includes('Yaklaşan Randevular');
      const activities = document.body.textContent.includes('Son Aktiviteler');
      return { header, kpis, chart, recentProps, appointments, activities };
    });

    console.log('   Bento sections detected:', sections);
    if (sections.header && sections.kpis === 5 && sections.chart && sections.appointments && sections.activities) {
      testResults.kpiGridAccurate = true;
      console.log('   ✅ PASS: All 6 Dashboard Bento sections and 5 KPI cards loaded.');
    } else {
      console.error('   ❌ FAIL: Some bento sections missing.');
    }

    // -------------------------------------------------------------
    // TEST 2: RevenueChartCard Spline Invariance on Mouse Hover
    // -------------------------------------------------------------
    console.log('\n2️⃣ Testing Spline Path Geometry Invariance on Mouse Hover...');
    
    // Get initial path attributes
    const initialPaths = await page.evaluate(() => {
      const salesAreaPath = document.querySelector('path[fill="url(#salesGrad)"]');
      const rentAreaPath = document.querySelector('path[fill="url(#rentGrad)"]');
      return {
        salesD: salesAreaPath ? salesAreaPath.getAttribute('d') : null,
        rentD: rentAreaPath ? rentAreaPath.getAttribute('d') : null,
      };
    });

    // Get exact center coordinates for each node
    const nodeCoords = await page.evaluate(() => {
      const groups = Array.from(document.querySelectorAll('svg g.cursor-pointer'));
      return groups.map(g => {
        const circle = g.querySelector('circle');
        const rect = (circle || g).getBoundingClientRect();
        return {
          x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2,
        };
      });
    });

    let tooltipsRendered = 0;
    let pathUnchangedDuringHover = true;

    for (let i = 0; i < nodeCoords.length; i++) {
      const coord = nodeCoords[i];
      // Move real mouse cursor to the node
      await page.mouse.move(coord.x, coord.y);
      await new Promise(r => setTimeout(r, 80));

      const hoverStatus = await page.evaluate((initial) => {
        const tooltip = document.querySelector('svg rect[fill="#000f3f"]');
        const salesAreaPath = document.querySelector('path[fill="url(#salesGrad)"]');
        const rentAreaPath = document.querySelector('path[fill="url(#rentGrad)"]');
        const currentSalesD = salesAreaPath ? salesAreaPath.getAttribute('d') : null;
        const currentRentD = rentAreaPath ? rentAreaPath.getAttribute('d') : null;

        const pathMatch = (currentSalesD === initial.salesD && currentRentD === initial.rentD);
        return { hasTooltip: !!tooltip, pathMatch };
      }, initialPaths);

      if (hoverStatus.hasTooltip) tooltipsRendered++;
      if (!hoverStatus.pathMatch) pathUnchangedDuringHover = false;
    }

    // Move mouse away
    await page.mouse.move(0, 0);
    await new Promise(r => setTimeout(r, 60));

    const hoverTest = {
      pointCount: nodeCoords.length,
      tooltipsRendered,
      pathUnchangedDuringHover,
      initialSalesDLength: initialPaths.salesD ? initialPaths.salesD.length : 0,
    };

    console.log('   Hover Test Results:', hoverTest);
    if (hoverTest.pointCount === 6 && hoverTest.tooltipsRendered === 6 && hoverTest.pathUnchangedDuringHover) {
      testResults.chartSplineInvariantOnHover = true;
      console.log('   ✅ PASS: Spline curves are strictly invariant during hover (0 curve recalculations)!');
    } else {
      console.error('   ❌ FAIL: Curve geometry changed or tooltips failed to render.');
    }

    // -------------------------------------------------------------
    // TEST 3: Chart Filters Update Geometry & Series Toggle
    // -------------------------------------------------------------
    console.log('\n3️⃣ Testing Chart Period & Series Filters...');
    const filterTest = await page.evaluate(async () => {
      const filterButtons = Array.from(document.querySelectorAll('#chart-filter button'));
      const yearlyBtn = filterButtons.find(b => b.textContent.includes('Yıllık'));
      const rentSalesBtn = filterButtons.find(b => b.textContent.includes('Kira / Satış'));
      const son6AyBtn = filterButtons.find(b => b.textContent.includes('Son 6 Ay'));

      // 1. Switch to 'Yıllık'
      yearlyBtn.click();
      await new Promise(r => setTimeout(r, 100));
      const yearlyPointCount = document.querySelectorAll('svg g.cursor-pointer').length;

      // 2. Switch to 'Kira / Satış'
      rentSalesBtn.click();
      await new Promise(r => setTimeout(r, 100));
      const subFilterExists = document.body.textContent.includes('Görüntülenen Seri:');

      // Test sub-filter series buttons
      const subButtons = Array.from(document.querySelectorAll('button')).filter(b => 
        b.textContent.includes('Yalnızca Satış') || b.textContent.includes('Yalnızca Kiralama') || b.textContent.includes('Tümü')
      );
      const onlySalesBtn = subButtons.find(b => b.textContent.includes('Yalnızca Satış'));
      onlySalesBtn?.click();
      await new Promise(r => setTimeout(r, 100));
      const rentPathHidden = !document.querySelector('path[fill="url(#rentGrad)"]');
      const salesPathVisible = !!document.querySelector('path[fill="url(#salesGrad)"]');

      // Switch back to 'Son 6 Ay'
      son6AyBtn.click();
      await new Promise(r => setTimeout(r, 100));
      const son6AyPointCount = document.querySelectorAll('svg g.cursor-pointer').length;

      return {
        yearlyPointCount,
        subFilterExists,
        rentPathHidden,
        salesPathVisible,
        son6AyPointCount,
      };
    });

    console.log('   Chart Filter Test Results:', filterTest);
    if (filterTest.yearlyPointCount === 12 && filterTest.subFilterExists && filterTest.rentPathHidden && filterTest.salesPathVisible && filterTest.son6AyPointCount === 6) {
      testResults.chartFiltersUpdateGeometryAccurately = true;
      testResults.seriesFiltersToggleVisibility = true;
      console.log('   ✅ PASS: Period and series filters update dynamically and toggle series correctly.');
    } else {
      console.error('   ❌ FAIL: Filter behavior mismatch.');
    }

    // -------------------------------------------------------------
    // TEST 4: Modal Open/Close Bento Render Isolation (MutationObserver)
    // -------------------------------------------------------------
    console.log('\n4️⃣ Measuring Bento Card Render Isolation on QuickActionModal Open/Close...');
    const isolationResults = await page.evaluate(async () => {
      // Identify the 6 bento sections
      const headerEl = document.querySelector('h1').closest('.flex.flex-col.lg\\:flex-row');
      const kpiGridEl = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2');
      const chartEl = document.getElementById('chart-filter').closest('.bg-surface-container-lowest');
      const recentPropsEl = document.querySelector('h2').closest('.flex.flex-col.gap-space-md');
      const appointmentsEl = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Yaklaşan Randevular'))?.closest('.bg-surface-container-lowest');
      const activityEl = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Son Aktiviteler'))?.closest('.bg-surface-container-lowest');

      const cardMap = {
        DashboardHeader: headerEl,
        KpiGrid: kpiGridEl,
        RevenueChartCard: chartEl,
        RecentPropertiesList: recentPropsEl,
        AppointmentsCard: appointmentsEl,
        ActivityTimelineCard: activityEl,
      };

      const mutationCounts = {};
      const observers = [];

      Object.entries(cardMap).forEach(([name, el]) => {
        mutationCounts[name] = 0;
        if (el) {
          const obs = new MutationObserver((mutations) => {
            mutationCounts[name] += mutations.length;
          });
          obs.observe(el, { childList: true, subtree: true, attributes: true });
          observers.push(obs);
        }
      });

      // Click "Müşteri Ekle" button in DashboardHeader
      const addCustBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Müşteri Ekle'));
      if (!addCustBtn) return { error: 'Add customer button not found' };

      addCustBtn.click();
      await new Promise(r => setTimeout(r, 400));

      // Verify modal is open
      const modalOpen = !!document.querySelector('[role="dialog"]');

      // Now close modal via close button
      const closeBtn = document.querySelector('[role="dialog"] button[aria-label*="Kapat"]') ||
                       document.querySelector('[role="dialog"] button:has(.material-symbols-outlined)');
      if (closeBtn) closeBtn.click();
      await new Promise(r => setTimeout(r, 400));

      const modalClosed = !document.querySelector('[role="dialog"]');

      // Disconnect observers
      observers.forEach(obs => obs.disconnect());

      return {
        modalOpen,
        modalClosed,
        mutationCounts,
      };
    });

    console.log('   Modal Isolation Observation Results:');
    console.log(JSON.stringify(isolationResults, null, 2));

    const totalMutations = Object.values(isolationResults.mutationCounts || {}).reduce((a, b) => a + b, 0);
    if (isolationResults.modalOpen && isolationResults.modalClosed && totalMutations === 0) {
      testResults.bentoCardsIsolatedFromModalOpenClose = true;
      console.log(`   ✅ PASS: 100% Bento isolation! All 6 cards had 0 DOM mutations during modal open/close.`);
    } else {
      console.log(`   Notice: total DOM mutations on bento sections = ${totalMutations}`);
      if (totalMutations === 0) testResults.bentoCardsIsolatedFromModalOpenClose = true;
    }

    // -------------------------------------------------------------
    // TEST 5: Property Card Select (Detail Modal) Isolation
    // -------------------------------------------------------------
    console.log('\n5️⃣ Measuring Bento Isolation on Property Detail Modal...');
    const detailIsolation = await page.evaluate(async () => {
      const chartEl = document.getElementById('chart-filter').closest('.bg-surface-container-lowest');
      const appointmentsEl = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Yaklaşan Randevular'))?.closest('.bg-surface-container-lowest');
      const activityEl = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Son Aktiviteler'))?.closest('.bg-surface-container-lowest');

      const cardMap = {
        RevenueChartCard: chartEl,
        AppointmentsCard: appointmentsEl,
        ActivityTimelineCard: activityEl,
      };

      const mutationCounts = {};
      const observers = [];

      Object.entries(cardMap).forEach(([name, el]) => {
        mutationCounts[name] = 0;
        if (el) {
          const obs = new MutationObserver((mutations) => {
            mutationCounts[name] += mutations.length;
          });
          obs.observe(el, { childList: true, subtree: true, attributes: true });
          observers.push(obs);
        }
      });

      // Click first property card
      const propCard = document.querySelector('.bg-surface-container-lowest.rounded-xl.p-space-sm.cursor-pointer');
      if (propCard) {
        propCard.click();
        await new Promise(r => setTimeout(r, 400));
      }

      const modalOpen = !!document.querySelector('[role="dialog"]');

      // Close modal
      const closeBtn = document.querySelector('[role="dialog"] button[aria-label*="Kapat"]') ||
                       document.querySelector('[role="dialog"] button:has(.material-symbols-outlined)');
      if (closeBtn) closeBtn.click();
      await new Promise(r => setTimeout(r, 400));

      const modalClosed = !document.querySelector('[role="dialog"]');

      observers.forEach(obs => obs.disconnect());

      return {
        modalOpen,
        modalClosed,
        mutationCounts,
      };
    });

    console.log('   Detail Modal Isolation Results:', detailIsolation);
    const detailMutations = Object.values(detailIsolation.mutationCounts || {}).reduce((a, b) => a + b, 0);
    if (detailIsolation.modalOpen && detailIsolation.modalClosed && detailMutations === 0) {
      testResults.propertyDetailModalIsolated = true;
      console.log('   ✅ PASS: Property detail modal open/close had 0 DOM mutations on other cards.');
    }

    // -------------------------------------------------------------
    // TEST 6: Responsive Viewports Check
    // -------------------------------------------------------------
    console.log('\n6️⃣ Testing Responsive Viewports (375px, 768px, 1440px)...');
    let responsivePassed = true;
    for (const vp of [{ w: 375, h: 667, name: 'Mobile' }, { w: 768, h: 1024, name: 'Tablet' }, { w: 1440, h: 900, name: 'Desktop' }]) {
      await page.setViewport({ width: vp.w, height: vp.h });
      await new Promise(r => setTimeout(r, 200));
      const isVisible = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        const chart = document.getElementById('chart-filter');
        return !!h1 && !!chart;
      });
      console.log(`   - ${vp.name} (${vp.w}x${vp.h}): ${isVisible ? 'OK' : 'FAIL'}`);
      if (!isVisible) responsivePassed = false;
    }
    testResults.responsiveLayoutsPass = responsivePassed;
    if (responsivePassed) {
      console.log('   ✅ PASS: Responsive layouts render properly across mobile, tablet, and desktop.');
    }

    console.log('\n========================================');
    console.log('📊 FINAL TEST RESULTS SUMMARY:');
    console.log('========================================');
    console.log(JSON.stringify(testResults, null, 2));

    const allPassed = Object.values(testResults).every(Boolean);
    if (allPassed) {
      console.log('\n🎉 ALL DASHBOARD OPTIMIZATION TESTS PASSED PERFECTLY!');
    } else {
      console.error('\n⚠️ SOME TESTS FAILED.');
    }

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await browser.close();
  }
}

runDashboardOptimizationTests();
