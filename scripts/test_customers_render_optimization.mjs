import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function runCustomersOptimizationTests() {
  console.log('🚀 Starting Customers Render & DOM Isolation E2E Verification...\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const testResults = {
    initialLoadAndTableRows: false,
    detailDrawerAndStatsIsolatedOnCheckboxToggle: false,
    filtersAndStatsIsolatedOnCustomerSelection: false,
    searchAndRoleFiltersFunctional: false,
    quickNoteAdditionWorking: false,
    responsiveLayoutsPass: false,
  };

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // -------------------------------------------------------------
    // TEST 1: Initial Load, Customer Table & Detail Drawer
    // -------------------------------------------------------------
    console.log('1️⃣ Navigating to /musteriler...');
    await page.goto(`${BASE_URL}/musteriler`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const initialInfo = await page.evaluate(() => {
      const tableRows = document.querySelectorAll('tbody tr').length;
      const drawerTitle = document.querySelector('.lg\\:col-span-5 h2')?.textContent?.trim() || '';
      const statCards = document.querySelectorAll('.grid-cols-1.sm\\:grid-cols-2.xl\\:grid-cols-4 > div').length;
      const initialChecked = document.querySelectorAll('tbody input[type="checkbox"]:checked').length;
      return { tableRows, drawerTitle, statCards, initialChecked };
    });

    console.log(`   Initial state: ${initialInfo.tableRows} table rows, drawer for "${initialInfo.drawerTitle}", ${initialInfo.statCards} stat cards, ${initialInfo.initialChecked} checked rows.`);
    if (initialInfo.tableRows > 0 && initialInfo.drawerTitle.length > 0 && initialInfo.statCards === 4) {
      testResults.initialLoadAndTableRows = true;
      console.log('   ✅ PASS: Customer table, drawer and stats initialized correctly.');
    } else {
      console.log('   ❌ FAIL: Initial state failed.');
    }

    // -------------------------------------------------------------
    // TEST 2: Checkbox Toggle Isolation
    // When clicking a row checkbox, DetailDrawer, StatsGrid, and Header
    // must experience 0 DOM mutations!
    // -------------------------------------------------------------
    console.log('\n2️⃣ Testing Checkbox Toggle Isolation (0 DOM Mutations on DetailDrawer & StatsGrid)...');
    const checkboxIsolation = await page.evaluate(async () => {
      const drawerEl = document.querySelector('.lg\\:col-span-5');
      const statsGridEl = document.querySelector('.grid-cols-1.sm\\:grid-cols-2.xl\\:grid-cols-4');
      const headerEl = document.querySelector('h1')?.closest('.flex.flex-col.lg\\:flex-row');

      let drawerMutations = 0;
      let statsMutations = 0;
      let headerMutations = 0;

      const drawerObserver = new MutationObserver((muts) => {
        drawerMutations += muts.length;
      });
      const statsObserver = new MutationObserver((muts) => {
        statsMutations += muts.length;
      });
      const headerObserver = new MutationObserver((muts) => {
        headerMutations += muts.length;
      });

      if (drawerEl) drawerObserver.observe(drawerEl, { childList: true, subtree: true, attributes: true, characterData: true });
      if (statsGridEl) statsObserver.observe(statsGridEl, { childList: true, subtree: true, attributes: true, characterData: true });
      if (headerEl) headerObserver.observe(headerEl, { childList: true, subtree: true, attributes: true, characterData: true });

      // Find unchecked checkbox in row 2 or 3
      const allCheckboxes = Array.from(document.querySelectorAll('tbody tr input[type="checkbox"]'));
      const targetCheckbox = allCheckboxes.find(cb => !cb.checked);

      if (!targetCheckbox) {
        drawerObserver.disconnect();
        statsObserver.disconnect();
        headerObserver.disconnect();
        return { error: 'No unchecked row checkbox found' };
      }

      // Click the checkbox
      targetCheckbox.click();
      await new Promise(r => setTimeout(r, 150));

      drawerObserver.disconnect();
      statsObserver.disconnect();
      headerObserver.disconnect();

      const newCheckedCount = document.querySelectorAll('tbody input[type="checkbox"]:checked').length;
      const filterBadgeText = Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('Seçili'))?.textContent?.trim() || '';

      return {
        targetFound: true,
        drawerMutations,
        statsMutations,
        headerMutations,
        newCheckedCount,
        filterBadgeText,
      };
    });

    console.log('   Checkbox Toggle Isolation result:', checkboxIsolation);
    if (
      checkboxIsolation.targetFound &&
      checkboxIsolation.drawerMutations === 0 &&
      checkboxIsolation.statsMutations === 0 &&
      checkboxIsolation.headerMutations === 0
    ) {
      testResults.detailDrawerAndStatsIsolatedOnCheckboxToggle = true;
      console.log('   ✅ PASS: Checkbox toggle resulted in EXACTLY 0 DOM mutations on DetailDrawer, StatsGrid, and Header.');
    } else {
      console.log(`   ❌ FAIL: DetailDrawer mutations: ${checkboxIsolation.drawerMutations}, Stats mutations: ${checkboxIsolation.statsMutations}, Header mutations: ${checkboxIsolation.headerMutations}`);
    }

    // -------------------------------------------------------------
    // TEST 3: Customer Row Selection & Isolation
    // When clicking a different customer row, CustomerFilters & CustomerStatsGrid
    // must have 0 DOM mutations, while DetailDrawer updates!
    // -------------------------------------------------------------
    console.log('\n3️⃣ Testing Customer Selection & Isolation (Filters and Stats have 0 DOM mutations)...');
    const rowSelectionResult = await page.evaluate(async () => {
      const filtersEl = document.querySelector('.p-space-md.bg-surface-container-lowest.rounded-xl.shadow-sm.flex.flex-col.gap-space-md');
      const statsGridEl = document.querySelector('.grid-cols-1.sm\\:grid-cols-2.xl\\:grid-cols-4');
      const drawerTitleEl = document.querySelector('.lg\\:col-span-5 h2');
      const previousTitle = drawerTitleEl?.textContent?.trim() || '';

      let filtersMutations = 0;
      let statsMutations = 0;

      const filtersObserver = new MutationObserver((muts) => {
        filtersMutations += muts.length;
      });
      const statsObserver = new MutationObserver((muts) => {
        statsMutations += muts.length;
      });

      if (filtersEl) filtersObserver.observe(filtersEl, { childList: true, subtree: true, attributes: true, characterData: true });
      if (statsGridEl) statsObserver.observe(statsGridEl, { childList: true, subtree: true, attributes: true, characterData: true });

      // Click on row 2 (which is different from selected customer)
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      const targetRow = rows[1];
      if (targetRow) {
        targetRow.click();
      }
      await new Promise(r => setTimeout(r, 150));

      filtersObserver.disconnect();
      statsObserver.disconnect();

      const newTitle = document.querySelector('.lg\\:col-span-5 h2')?.textContent?.trim() || '';

      return {
        previousTitle,
        newTitle,
        titleChanged: previousTitle !== newTitle,
        filtersMutations,
        statsMutations,
      };
    });

    console.log('   Row Selection result:', rowSelectionResult);
    if (rowSelectionResult.titleChanged && rowSelectionResult.filtersMutations === 0 && rowSelectionResult.statsMutations === 0) {
      testResults.filtersAndStatsIsolatedOnCustomerSelection = true;
      console.log(`   ✅ PASS: Drawer switched to "${rowSelectionResult.newTitle}" with 0 DOM mutations on Filters and StatsGrid.`);
    } else {
      console.log(`   ❌ FAIL: titleChanged: ${rowSelectionResult.titleChanged}, filtersMutations: ${rowSelectionResult.filtersMutations}, statsMutations: ${rowSelectionResult.statsMutations}`);
    }

    // -------------------------------------------------------------
    // TEST 4: Search & Role Filters Functionality
    // -------------------------------------------------------------
    console.log('\n4️⃣ Testing Search & Role Filters Functionality...');
    const filterTest = await page.evaluate(async () => {
      const searchInput = document.querySelector('input[placeholder*="İsim, telefon"]');
      const initialRowCount = document.querySelectorAll('tbody tr').length;

      // 1. Search filter
      searchInput.value = 'Kadıköy';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 200));

      const filteredBySearch = document.querySelectorAll('tbody tr').length;

      // Clear search
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 200));

      // 2. Role tab click (Alıcılar)
      const roleButtons = Array.from(document.querySelectorAll('button'));
      const buyersTab = roleButtons.find(b => b.textContent.includes('Alıcılar'));
      if (buyersTab) buyersTab.click();
      await new Promise(r => setTimeout(r, 200));

      const filteredByRole = document.querySelectorAll('tbody tr').length;

      // 3. Reset filters button
      const resetBtn = roleButtons.find(b => b.textContent.includes('Filtreleri Temizle'));
      if (resetBtn) resetBtn.click();
      await new Promise(r => setTimeout(r, 200));

      const restoredRowCount = document.querySelectorAll('tbody tr').length;

      return {
        initialRowCount,
        filteredBySearch,
        filteredByRole,
        restoredRowCount,
      };
    });

    console.log('   Filter Test Results:', filterTest);
    if (
      filterTest.filteredBySearch > 0 &&
      filterTest.filteredByRole > 0 &&
      filterTest.restoredRowCount === filterTest.initialRowCount
    ) {
      testResults.searchAndRoleFiltersFunctional = true;
      console.log('   ✅ PASS: Search, role tabs, and filter reset work accurately.');
    } else {
      console.log('   ❌ FAIL: Filter behavior mismatch.');
    }

    // -------------------------------------------------------------
    // TEST 5: Quick Note Addition & Timeline Update
    // -------------------------------------------------------------
    console.log('\n5️⃣ Testing Quick Note Addition in CustomerDetailDrawer...');
    const initialTimelineCount = await page.evaluate(() => {
      return document.querySelectorAll('.lg\\:col-span-5 .relative.pl-4 > div').length;
    });

    const uniqueTestNote = `Otomasyon Test Notu ${Date.now()}`;
    const noteInputSelector = 'input[placeholder*="hızlı not veya görüşme özeti ekleyin"]';
    await page.waitForSelector(noteInputSelector);
    await page.type(noteInputSelector, uniqueTestNote);
    await new Promise(r => setTimeout(r, 100));

    // Click submit button in the form
    await page.evaluate(() => {
      const noteInput = document.querySelector('input[placeholder*="hızlı not veya görüşme özeti ekleyin"]');
      const submitBtn = noteInput?.parentElement?.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const quickNoteResult = await page.evaluate((data) => {
      const items = Array.from(document.querySelectorAll('.lg\\:col-span-5 .relative.pl-4 > div'));
      const newTimelineCount = items.length;
      const latestNoteText = items[0]?.querySelector('p')?.textContent?.trim() || '';

      return {
        initialCount: data.initialCount,
        newTimelineCount,
        latestNoteText,
        noteAdded: newTimelineCount === data.initialCount + 1 && latestNoteText.includes(data.uniqueTestNote),
      };
    }, { initialCount: initialTimelineCount, uniqueTestNote });

    console.log('   Quick Note Result:', quickNoteResult);
    if (quickNoteResult.noteAdded) {
      testResults.quickNoteAdditionWorking = true;
      console.log('   ✅ PASS: Quick note added to customer timeline dynamically.');
    } else {
      console.log('   ❌ FAIL: Quick note was not added properly.');
    }

    // -------------------------------------------------------------
    // TEST 6: Responsive Layouts (Mobile 375px, Tablet 768px, Desktop 1440px)
    // -------------------------------------------------------------
    console.log('\n6️⃣ Testing Responsive Viewports (375px, 768px, 1440px)...');
    
    // Desktop
    await page.setViewport({ width: 1440, height: 900 });
    await new Promise(r => setTimeout(r, 200));
    const desktopCheck = await page.evaluate(() => {
      const tableVisible = !!document.querySelector('.hidden.md\\:block table');
      const mobileHidden = window.getComputedStyle(document.querySelector('.md\\:hidden')).display === 'none';
      return tableVisible && mobileHidden;
    });

    // Mobile
    await page.setViewport({ width: 375, height: 667 });
    await new Promise(r => setTimeout(r, 200));
    const mobileCheck = await page.evaluate(() => {
      const mobileCardContainer = document.querySelector('.md\\:hidden');
      const mobileVisible = mobileCardContainer && window.getComputedStyle(mobileCardContainer).display !== 'none';
      const desktopTableHidden = window.getComputedStyle(document.querySelector('.hidden.md\\:block')).display === 'none';
      return mobileVisible && desktopTableHidden;
    });

    // Tablet
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise(r => setTimeout(r, 200));
    const tabletCheck = await page.evaluate(() => {
      const tableVisible = !!document.querySelector('.hidden.md\\:block table');
      return tableVisible;
    });

    console.log(`   Responsive check: Desktop: ${desktopCheck}, Mobile: ${mobileCheck}, Tablet: ${tabletCheck}`);
    if (desktopCheck && mobileCheck && tabletCheck) {
      testResults.responsiveLayoutsPass = true;
      console.log('   ✅ PASS: All 3 viewports render correctly with appropriate table/card switches.');
    } else {
      console.log('   ❌ FAIL: Responsive viewport checks failed.');
    }

  } catch (err) {
    console.error('❌ E2E Execution Error:', err);
  } finally {
    await browser.close();
  }

  console.log('\n========================================');
  console.log('🎯 CUSTOMERS OPTIMIZATION TEST SUMMARY:');
  console.log('========================================');
  for (const [key, val] of Object.entries(testResults)) {
    console.log(`${val ? '✅' : '❌'} ${key}: ${val ? 'PASS' : 'FAIL'}`);
  }
  const allPassed = Object.values(testResults).every(Boolean);
  console.log(`\nOVERALL STATUS: ${allPassed ? 'ALL TESTS PASSED 🎉' : 'SOME TESTS FAILED ⚠️'}`);
}

runCustomersOptimizationTests();
