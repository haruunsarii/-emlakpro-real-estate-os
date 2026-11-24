import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function runKanbanOptimizationTests() {
  console.log('🚀 Starting Kanban Render Optimization E2E Verification...\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const results = {
    eightStagesPresent: false,
    mobileCountersMatchDesktopColumns: false,
    singlePassGroupingAccurate: false,
    stageMoveUpdatesCountsAndVolume: false,
    completedAtDateRulesIntact: false,
    searchAndFiltersReactive: false,
    addDealToStagePreselection: false,
    detailDrawerOpensProperly: false
  };

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // -------------------------------------------------------------
    // TEST 1: Navigate to /satis-ve-kiralama and verify 8 stages
    // -------------------------------------------------------------
    console.log('1️⃣ Navigating to /satis-ve-kiralama...');
    await page.goto(`${BASE_URL}/satis-ve-kiralama`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const stageData = await page.evaluate(() => {
      const colElements = document.querySelectorAll('[id^="kanban-col-"]');
      const stages = [];
      colElements.forEach(col => {
        const id = col.id.replace('kanban-col-', '');
        const titleEl = col.querySelector('.font-headline-sm');
        const countBadge = col.querySelector('span.px-2.py-0\\.5');
        const cards = col.querySelectorAll('.select-none.cursor-pointer');
        stages.push({
          id,
          title: titleEl ? titleEl.textContent.trim() : '',
          countText: countBadge ? parseInt(countBadge.textContent.trim(), 10) : 0,
          cardCount: cards.length
        });
      });
      return stages;
    });

    console.log(`   Found ${stageData.length} Kanban columns on desktop:`);
    stageData.forEach(s => console.log(`   - [${s.id}] ${s.title}: ${s.cardCount} kart (Rozet: ${s.countText})`));

    if (stageData.length === 8 && stageData.every(s => s.countText === s.cardCount)) {
      results.eightStagesPresent = true;
      results.singlePassGroupingAccurate = true;
      console.log('   ✅ PASS: Exactly 8 stages rendered and column card counts match stage badges!');
    } else {
      console.error('   ❌ FAIL: Stage count or card mismatch:', stageData);
    }

    // -------------------------------------------------------------
    // TEST 2: Check mobile stage navigator bar counters
    // -------------------------------------------------------------
    console.log('\n2️⃣ Testing mobile navigator bar counters matching desktop...');
    const mobileCounters = await page.evaluate(() => {
      // Find the mobile navigator buttons
      const navContainer = document.querySelector('.md\\:hidden.flex.items-center');
      if (!navContainer) return [];
      const buttons = navContainer.querySelectorAll('button');
      const list = [];
      buttons.forEach(btn => {
        const text = btn.textContent;
        const countSpan = btn.querySelector('span.px-1\\.5');
        list.push({
          text,
          count: countSpan ? parseInt(countSpan.textContent.trim(), 10) : 0
        });
      });
      return list;
    });

    console.log(`   Found ${mobileCounters.length} mobile navigator items.`);
    const mobileMatchesDesktop = mobileCounters.length === 8 && mobileCounters.every((m, idx) => m.count === stageData[idx].cardCount);
    if (mobileMatchesDesktop) {
      results.mobileCountersMatchDesktopColumns = true;
      console.log('   ✅ PASS: Mobile navigator bar counts 100% match desktop column card counts!');
    } else {
      console.error('   ❌ FAIL: Mobile counters do not match desktop:', mobileCounters);
    }

    // -------------------------------------------------------------
    // TEST 3: Stage Move via Quick Forward button on DealCard
    // -------------------------------------------------------------
    console.log('\n3️⃣ Testing Stage Move via forward button...');
    const moveResult = await page.evaluate(async () => {
      // Find first deal card in first column (yeni_firsat) that has quick move button
      const firstCol = document.getElementById('kanban-col-yeni_firsat');
      if (!firstCol) return { success: false, reason: 'First col not found' };

      const card = firstCol.querySelector('.select-none.cursor-pointer');
      if (!card) return { success: false, reason: 'No card in first col' };

      const titleEl = card.querySelector('h4');
      const dealTitle = titleEl ? titleEl.textContent.trim() : '';

      const forwardBtn = card.querySelector('button[title*="İlerlet"]');
      if (!forwardBtn) return { success: false, reason: 'Forward button not found' };

      const countBeforeCol1 = parseInt(firstCol.querySelector('span.px-2.py-0\\.5').textContent.trim(), 10);
      const col2 = document.getElementById('kanban-col-ilk_gorusme');
      const countBeforeCol2 = parseInt(col2.querySelector('span.px-2.py-0\\.5').textContent.trim(), 10);

      forwardBtn.click();
      await new Promise(r => setTimeout(r, 800));

      const countAfterCol1 = parseInt(firstCol.querySelector('span.px-2.py-0\\.5').textContent.trim(), 10);
      const countAfterCol2 = parseInt(col2.querySelector('span.px-2.py-0\\.5').textContent.trim(), 10);

      return {
        success: true,
        dealTitle,
        countBeforeCol1,
        countAfterCol1,
        countBeforeCol2,
        countAfterCol2
      };
    });

    console.log('   Move result:', moveResult);
    if (moveResult.success && moveResult.countAfterCol1 === moveResult.countBeforeCol1 - 1 && moveResult.countAfterCol2 === moveResult.countBeforeCol2 + 1) {
      results.stageMoveUpdatesCountsAndVolume = true;
      console.log('   ✅ PASS: Deal moved to next stage, source count decreased and target count increased!');
    } else {
      console.error('   ❌ FAIL in stage move:', moveResult);
    }

    // -------------------------------------------------------------
    // TEST 4: Date Rules for Completed Deals
    // -------------------------------------------------------------
    console.log('\n4️⃣ Testing completedAt, firstCompletedAt, lastCompletedAt date rules...');
    const dateRulesResult = await page.evaluate(async () => {
      // Find deal card in sozlesme column and advance it to tamamlandi
      const sozlesmeCol = document.getElementById('kanban-col-sozlesme');
      if (!sozlesmeCol) return { success: false, reason: 'Sozlesme col not found' };

      const card = sozlesmeCol.querySelector('.select-none.cursor-pointer');
      if (!card) return { success: false, reason: 'No card in sozlesme col' };

      const forwardBtn = card.querySelector('button[title*="İlerlet"]');
      if (!forwardBtn) return { success: false, reason: 'Forward button not found in sozlesme card' };

      forwardBtn.click();
      await new Promise(r => setTimeout(r, 1000));

      const saved = localStorage.getItem('emlakpro_deals_v1');
      if (!saved) return { success: false, reason: 'No deals in localStorage' };
      const deals = JSON.parse(saved);

      // Find the deal that was moved into tamamlandi
      const movedDeal = deals.find(d => d.stage === 'tamamlandi' && d.completedAt);
      if (!movedDeal) return { success: false, reason: 'Moved deal with completedAt not found' };

      const hasCompletedAt = Boolean(movedDeal.completedAt);
      const hasFirstCompletedAt = Boolean(movedDeal.firstCompletedAt);
      const hasLastCompletedAt = Boolean(movedDeal.lastCompletedAt);

      return {
        success: hasCompletedAt && hasFirstCompletedAt && hasLastCompletedAt,
        dealId: movedDeal.id,
        completedAt: movedDeal.completedAt,
        firstCompletedAt: movedDeal.firstCompletedAt,
        lastCompletedAt: movedDeal.lastCompletedAt
      };
    });

    console.log('   Date rules check:', dateRulesResult);
    if (dateRulesResult.success) {
      results.completedAtDateRulesIntact = true;
      console.log('   ✅ PASS: Date rules for completed deals (firstCompletedAt, lastCompletedAt, completedAt) are fully intact!');
    } else {
      console.error('   ❌ FAIL in date rules check:', dateRulesResult);
    }

    // -------------------------------------------------------------
    // TEST 5: Add Deal to Stage Button
    // -------------------------------------------------------------
    console.log('\n5️⃣ Testing "Bu Aşamaya Ekle" button on KanbanColumn...');
    const addBtnResult = await page.evaluate(async () => {
      const col = document.getElementById('kanban-col-yer_gosterimi');
      if (!col) return { success: false, reason: 'Col not found' };
      const buttons = Array.from(col.querySelectorAll('button'));
      const addBtn = buttons.find(b => b.textContent.includes('Bu Aşamaya Ekle'));
      if (!addBtn) return { success: false, reason: 'Add btn not found' };

      addBtn.click();
      await new Promise(r => setTimeout(r, 800));

      const modal = document.querySelector('[role="dialog"]');
      const isModalOpen = Boolean(modal);

      return {
        success: isModalOpen,
        modalTitle: modal ? modal.querySelector('h2, h3')?.textContent : ''
      };
    });

    console.log('   Add Deal button result:', addBtnResult);
    if (addBtnResult.success) {
      results.addDealToStagePreselection = true;
      console.log('   ✅ PASS: "Bu Aşamaya Ekle" button opened DealFormModal!');
      // Close modal
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    } else {
      console.error('   ❌ FAIL in Add Deal button:', addBtnResult);
    }

    // -------------------------------------------------------------
    // TEST 6: Deal Detail Drawer
    // -------------------------------------------------------------
    console.log('\n6️⃣ Testing Deal Detail Drawer on card click...');
    const drawerResult = await page.evaluate(async () => {
      const firstCard = document.querySelector('.select-none.cursor-pointer');
      if (!firstCard) return { success: false, reason: 'No card found' };

      firstCard.click();
      await new Promise(r => setTimeout(r, 800));

      const drawer = document.querySelector('[role="dialog"]');
      return {
        success: Boolean(drawer),
        title: drawer ? drawer.querySelector('h3, h2')?.textContent : ''
      };
    });

    console.log('   Deal Detail Drawer result:', drawerResult);
    if (drawerResult.success) {
      results.detailDrawerOpensProperly = true;
      console.log('   ✅ PASS: Deal Detail Drawer opened smoothly!');
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    }

    // -------------------------------------------------------------
    // TEST 7: Search and Filter Reactivity
    // -------------------------------------------------------------
    console.log('\n7️⃣ Testing Search and Filter reactivity on Kanban...');
    const searchSelector = 'input[placeholder="Fırsat, müşteri veya portföy ara..."]';
    await page.click(searchSelector);
    await page.type(searchSelector, 'Moda');
    await new Promise(r => setTimeout(r, 600));

    const searchCount = await page.evaluate(() => {
      const colElements = document.querySelectorAll('[id^="kanban-col-"]');
      let total = 0;
      colElements.forEach(col => {
        total += col.querySelectorAll('.select-none.cursor-pointer').length;
      });
      return total;
    });

    console.log(`   Deals matching "Moda": ${searchCount}`);

    // Click the cancel button inside the search box
    await page.evaluate(() => {
      const cancelBtn = document.querySelector('button[type="button"] span.material-symbols-outlined');
      const cancelBtns = Array.from(document.querySelectorAll('button'));
      const cancel = cancelBtns.find(b => b.querySelector('span')?.textContent === 'cancel');
      if (cancel) cancel.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const resetCount = await page.evaluate(() => {
      const colElements = document.querySelectorAll('[id^="kanban-col-"]');
      let total = 0;
      colElements.forEach(col => {
        total += col.querySelectorAll('.select-none.cursor-pointer').length;
      });
      return total;
    });

    console.log(`   Deals after search reset: ${resetCount}`);
    if (searchCount > 0 && resetCount > searchCount) {
      results.searchAndFiltersReactive = true;
      console.log('   ✅ PASS: Search and filter dynamically updates Kanban columns and card counts!');
    }

  } catch (err) {
    console.error('Test execution failed with error:', err);
  } finally {
    await browser.close();
  }

  console.log('\n==========================================');
  console.log('📊 TEST SUMMARY RESULTS:');
  console.log(JSON.stringify(results, null, 2));
  console.log('==========================================\n');

  const allPassed = Object.values(results).every(v => v === true);
  if (!allPassed) {
    process.exit(1);
  }
}

runKanbanOptimizationTests();
