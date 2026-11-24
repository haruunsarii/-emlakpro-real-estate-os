import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function runPropertiesOptimizationTests() {
  console.log('🚀 Starting Properties Render & Filter Optimization E2E Verification...\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const testResults = {
    twentyOnePropertiesAndPagination: false,
    fourteenCardsIsolatedOnBookmark: false,
    allCardsIsolatedOnDrawerOpen: false,
    statsAndHeaderIsolatedOnSearch: false,
    pageResetsToFirstOnFilterChange: false,
    viewModeSwitchFunctional: false,
    responsiveLayoutsPass: false,
  };

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // -------------------------------------------------------------
    // TEST 1: Initial Load, 21 Properties & 15-Item Pagination
    // -------------------------------------------------------------
    console.log('1️⃣ Navigating to /gayrimenkuller...');
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const initialCardCount = await page.evaluate(() => {
      return document.querySelectorAll('#portfolio-grid-container > div').length;
    });

    console.log(`   Initial cards rendered on page 1: ${initialCardCount}`);

    // Now test 21 items & 2-page pagination by injecting 6 temporary items into localStorage
    const pagination21Test = await page.evaluate(async () => {
      const currentRaw = localStorage.getItem('emlakpro_properties_v1');
      const currentList = currentRaw ? JSON.parse(currentRaw) : [];
      const originalCount = currentList.length;

      // Create 6 additional mock properties to test 21 items boundary
      const extraItems = [];
      for (let i = 1; i <= 6; i++) {
        extraItems.push({
          ...currentList[0],
          id: `PORT-TEST-${i}`,
          title: `Test Ek Gayrimenkul ${i}`,
          price: 10000000 + i * 1000000,
          priceFormatted: `₺${(10 + i).toLocaleString('tr-TR')}.000.000`,
        });
      }

      const list21 = [...currentList, ...extraItems];
      localStorage.setItem('emlakpro_properties_v1', JSON.stringify(list21));
      window.dispatchEvent(new Event('storage'));
      await new Promise(r => setTimeout(r, 300));

      const page1Count = document.querySelectorAll('#portfolio-grid-container > div').length;

      // Find Page 2 button
      const allButtons = Array.from(document.querySelectorAll('button'));
      const page2Btn = allButtons.find(b => b.getAttribute('aria-label') === 'Sayfa 2' || (b.textContent.trim() === '2' && b.closest('.flex.items-center.gap-1')));
      
      let page2Count = 0;
      if (page2Btn) {
        page2Btn.click();
        await new Promise(r => setTimeout(r, 200));
        page2Count = document.querySelectorAll('#portfolio-grid-container > div').length;
      }

      // Return to Page 1
      const page1Btn = allButtons.find(b => b.getAttribute('aria-label') === 'Sayfa 1' || (b.textContent.trim() === '1' && b.closest('.flex.items-center.gap-1')));
      if (page1Btn) {
        page1Btn.click();
        await new Promise(r => setTimeout(r, 200));
      }

      // Restore original list
      localStorage.setItem('emlakpro_properties_v1', JSON.stringify(currentList));
      window.dispatchEvent(new Event('storage'));
      await new Promise(r => setTimeout(r, 200));

      return {
        originalCount,
        page1Count,
        page2Count,
      };
    });

    console.log('   21-Item Pagination Boundary Test:', pagination21Test);
    if (pagination21Test.page1Count === 15 && pagination21Test.page2Count === 6) {
      testResults.twentyOnePropertiesAndPagination = true;
      console.log('   ✅ PASS: 21 items total properly paginates into 15 items on page 1 and 6 items on page 2.');
    } else {
      console.error('   ❌ FAIL: Pagination boundary failed:', pagination21Test);
    }

    // -------------------------------------------------------------
    // TEST 2: Bookmark Toggle Card Isolation (MutationObserver)
    // -------------------------------------------------------------
    console.log('\n2️⃣ Measuring DOM Mutation Isolation on Bookmark Toggle...');
    const bookmarkIsolation = await page.evaluate(async () => {
      const cards = Array.from(document.querySelectorAll('#portfolio-grid-container > div'));
      const mutationCounts = cards.map(() => 0);
      const observers = [];

      cards.forEach((card, idx) => {
        const obs = new MutationObserver((mutations) => {
          mutationCounts[idx] += mutations.length;
        });
        obs.observe(card, { childList: true, subtree: true, attributes: true });
        observers.push(obs);
      });

      // Target Card 2 (index 1) bookmark button
      const targetCard = cards[1];
      const bookmarkBtn = targetCard.querySelector('button[title*="Favori"]');
      if (!bookmarkBtn) return { error: 'Bookmark button not found' };

      bookmarkBtn.click();
      await new Promise(r => setTimeout(r, 400));

      observers.forEach(obs => obs.disconnect());

      const unaffectedCards = mutationCounts.filter((cnt, idx) => idx !== 1 && cnt === 0).length;
      const targetCardMutations = mutationCounts[1];

      return {
        targetCardMutations,
        unaffectedCards,
        totalOtherCards: cards.length - 1,
        mutationCounts,
      };
    });

    console.log('   Bookmark Isolation Results:');
    console.log(`   - Target Card (Card 2) DOM mutations: ${bookmarkIsolation.targetCardMutations}`);
    console.log(`   - Unaffected other cards with ZERO mutations: ${bookmarkIsolation.unaffectedCards} / ${bookmarkIsolation.totalOtherCards}`);

    if (bookmarkIsolation.unaffectedCards === 14 && bookmarkIsolation.targetCardMutations > 0) {
      testResults.fourteenCardsIsolatedOnBookmark = true;
      console.log('   ✅ PASS: 100% Card Isolation! 14 out of 14 other cards experienced 0 DOM mutations.');
    } else {
      console.error('   ❌ FAIL: Card isolation mismatch:', bookmarkIsolation);
    }

    // -------------------------------------------------------------
    // TEST 3: Drawer Opening Card Isolation (MutationObserver)
    // -------------------------------------------------------------
    console.log('\n3️⃣ Measuring DOM Mutation Isolation on Drawer Open & Close...');
    const drawerIsolation = await page.evaluate(async () => {
      const cards = Array.from(document.querySelectorAll('#portfolio-grid-container > div'));
      const mutationCounts = cards.map(() => 0);
      const observers = [];

      cards.forEach((card, idx) => {
        const obs = new MutationObserver((mutations) => {
          mutationCounts[idx] += mutations.length;
        });
        obs.observe(card, { childList: true, subtree: true, attributes: true });
        observers.push(obs);
      });

      // Open drawer via "Detay" button on Card 1
      const allButtons = Array.from(cards[0].querySelectorAll('button'));
      const dBtn = allButtons.find(b => b.textContent.includes('Detay'));
      if (dBtn) dBtn.click();
      await new Promise(r => setTimeout(r, 400));

      const drawerIsOpen = !!document.querySelector('[role="dialog"]');

      // Close drawer
      const closeBtn = document.querySelector('[role="dialog"] button[aria-label*="Kapat"]') ||
                       document.querySelector('[role="dialog"] button:has(.material-symbols-outlined)');
      if (closeBtn) closeBtn.click();
      await new Promise(r => setTimeout(r, 400));

      const drawerIsClosed = !document.querySelector('[role="dialog"]');

      observers.forEach(obs => obs.disconnect());

      const totalMutationsAcrossAllCards = mutationCounts.reduce((a, b) => a + b, 0);

      return {
        drawerIsOpen,
        drawerIsClosed,
        totalMutationsAcrossAllCards,
        mutationCounts,
      };
    });

    console.log('   Drawer Isolation Results:');
    console.log(`   - Drawer opened: ${drawerIsolation.drawerIsOpen}, closed: ${drawerIsolation.drawerIsClosed}`);
    console.log(`   - Total DOM mutations on all 15 cards: ${drawerIsolation.totalMutationsAcrossAllCards}`);

    if (drawerIsolation.drawerIsOpen && drawerIsolation.drawerIsClosed && drawerIsolation.totalMutationsAcrossAllCards === 0) {
      testResults.allCardsIsolatedOnDrawerOpen = true;
      console.log('   ✅ PASS: 100% Drawer Isolation! All 15 cards had 0 DOM mutations when drawer opened/closed.');
    } else {
      console.error('   ❌ FAIL: Cards underwent DOM mutations during drawer open/close.');
    }

    // -------------------------------------------------------------
    // TEST 4: PropertyStatsGrid & PropertyHeader Isolation on Search
    // -------------------------------------------------------------
    console.log('\n4️⃣ Testing Header & StatsGrid Isolation during Live Search...');
    const searchIsolation = await page.evaluate(async () => {
      const headerEl = document.querySelector('h1').closest('.flex.flex-col.lg\\:flex-row');
      const statsGridEl = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');

      let headerMutations = 0;
      let statsMutations = 0;

      const headerObs = new MutationObserver((m) => headerMutations += m.length);
      const statsObs = new MutationObserver((m) => statsMutations += m.length);

      if (headerEl) headerObs.observe(headerEl, { childList: true, subtree: true, attributes: true });
      if (statsGridEl) statsObs.observe(statsGridEl, { childList: true, subtree: true, attributes: true });

      // Type "Moda" in search input
      const searchInput = document.querySelector('input[placeholder*="İlan no, başlık"]');
      if (!searchInput) return { error: 'Search input not found' };

      // Simulate typing
      searchInput.value = 'Moda';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 200));

      const filteredCount = document.querySelectorAll('#portfolio-grid-container > div').length;

      // Clear search
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 200));

      headerObs.disconnect();
      statsObs.disconnect();

      return {
        filteredCount,
        headerMutations,
        statsMutations,
      };
    });

    console.log('   Search Isolation Results:', searchIsolation);
    if (searchIsolation.headerMutations === 0 && searchIsolation.statsMutations === 0 && searchIsolation.filteredCount > 0) {
      testResults.statsAndHeaderIsolatedOnSearch = true;
      console.log('   ✅ PASS: PropertyHeader and PropertyStatsGrid had 0 DOM mutations during live search typing!');
    } else {
      console.error('   ❌ FAIL: Header or stats mutated during search.');
    }

    // -------------------------------------------------------------
    // TEST 5: Filter Change Resets Page to 1
    // -------------------------------------------------------------
    console.log('\n5️⃣ Testing Automatic Page Reset on Filter Changes...');
    const resetTest = await page.evaluate(async () => {
      // Inject temporary items to get 2 pages
      const currentRaw = localStorage.getItem('emlakpro_properties_v1');
      const currentList = currentRaw ? JSON.parse(currentRaw) : [];

      const extraItems = [];
      for (let i = 1; i <= 6; i++) {
        extraItems.push({
          ...currentList[0],
          id: `PORT-PAGE-${i}`,
          title: `Page Test ${i}`,
          type: 'Satılık',
        });
      }
      localStorage.setItem('emlakpro_properties_v1', JSON.stringify([...currentList, ...extraItems]));
      window.dispatchEvent(new Event('storage'));
      await new Promise(r => setTimeout(r, 200));

      // Go to page 2
      const allButtons = Array.from(document.querySelectorAll('button'));
      const page2Btn = allButtons.find(b => b.getAttribute('aria-label') === 'Sayfa 2' || (b.textContent.trim() === '2' && b.closest('.flex.items-center.gap-1')));
      if (page2Btn) page2Btn.click();
      await new Promise(r => setTimeout(r, 200));

      // Click "Kiralık" tab
      const kiralikTab = allButtons.find(b => b.textContent.includes('Kiralık ('));
      if (kiralikTab) kiralikTab.click();
      await new Promise(r => setTimeout(r, 200));

      // Verify active page is page 1 (button '1' has aria-current='page' or active class)
      const page1Btn = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Sayfa 1' || b.textContent.trim() === '1');
      const isPage1Active = page1Btn?.getAttribute('aria-current') === 'page' || page1Btn?.className.includes('bg-primary-container');

      // Reset back to "Tümü"
      const allTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Tümü ('));
      if (allTab) allTab.click();

      // Restore original list
      localStorage.setItem('emlakpro_properties_v1', JSON.stringify(currentList));
      window.dispatchEvent(new Event('storage'));
      await new Promise(r => setTimeout(r, 200));

      return { isPage1Active };
    });

    console.log('   Page Reset Test Results:', resetTest);
    if (resetTest.isPage1Active) {
      testResults.pageResetsToFirstOnFilterChange = true;
      console.log('   ✅ PASS: Filter change immediately resets active page to 1.');
    } else {
      console.error('   ❌ FAIL: Page did not reset to 1 on filter change.');
    }

    // -------------------------------------------------------------
    // TEST 6: View Mode Switch (Grid <-> List)
    // -------------------------------------------------------------
    console.log('\n6️⃣ Testing Grid vs List View Toggle...');
    const viewSwitchTest = await page.evaluate(async () => {
      const listBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Liste'));
      if (!listBtn) return { error: 'List button not found' };
      listBtn.click();
      await new Promise(r => setTimeout(r, 200));

      const tableExists = !!document.querySelector('table');
      const tableRows = document.querySelectorAll('tbody tr').length;

      // Switch back to Grid
      const gridBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Grid'));
      if (gridBtn) gridBtn.click();
      await new Promise(r => setTimeout(r, 200));

      const gridExists = !!document.getElementById('portfolio-grid-container');

      return {
        tableExists,
        tableRows,
        gridExists,
      };
    });

    console.log('   View Switch Test Results:', viewSwitchTest);
    if (viewSwitchTest.tableExists && viewSwitchTest.tableRows === 15 && viewSwitchTest.gridExists) {
      testResults.viewModeSwitchFunctional = true;
      console.log('   ✅ PASS: Grid and List views toggle smoothly, table displays 15 rows.');
    } else {
      console.error('   ❌ FAIL: View toggle mismatch.');
    }

    // -------------------------------------------------------------
    // TEST 7: Responsive Viewports Check (Mobile, Tablet, Desktop)
    // -------------------------------------------------------------
    console.log('\n7️⃣ Testing Responsive Viewports (375px, 768px, 1440px)...');
    let responsivePassed = true;
    for (const vp of [{ w: 375, h: 667, name: 'Mobile' }, { w: 768, h: 1024, name: 'Tablet' }, { w: 1440, h: 900, name: 'Desktop' }]) {
      await page.setViewport({ width: vp.w, height: vp.h });
      await new Promise(r => setTimeout(r, 200));
      const isVisible = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        const grid = document.getElementById('portfolio-grid-container');
        return !!h1 && !!grid;
      });
      console.log(`   - ${vp.name} (${vp.w}x${vp.h}): ${isVisible ? 'OK' : 'FAIL'}`);
      if (!isVisible) responsivePassed = false;
    }
    testResults.responsiveLayoutsPass = responsivePassed;
    if (responsivePassed) {
      console.log('   ✅ PASS: Responsive layouts render properly across all viewports.');
    }

    console.log('\n========================================');
    console.log('📊 FINAL PROPERTIES OPTIMIZATION RESULTS:');
    console.log('========================================');
    console.log(JSON.stringify(testResults, null, 2));

    const allPassed = Object.values(testResults).every(Boolean);
    if (allPassed) {
      console.log('\n🎉 ALL PROPERTIES OPTIMIZATION TESTS PASSED PERFECTLY!');
    } else {
      console.error('\n⚠️ SOME TESTS FAILED.');
    }

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await browser.close();
  }
}

runPropertiesOptimizationTests();
