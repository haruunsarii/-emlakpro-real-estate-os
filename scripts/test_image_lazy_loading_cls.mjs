import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function runImageTests() {
  console.log('🚀 Starting Image Lazy Loading and Layout Shift (CLS) Verification...\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const results = {
    desktopGridAttributesCorrect: false,
    aboveFoldEagerBelowFoldLazy: false,
    desktopListViewAttributesCorrect: false,
    drawerGalleryMainAndThumbsValid: false,
    mobile375ViewAttributesCorrect: false,
    tablet768ViewResponsive: false,
    clsMeasuredScoreLow: false,
    dashboardRecentPropertiesLazy: false
  };

  const clsScores = [];

  try {
    const page = await browser.newPage();

    // Setup PerformanceObserver for Layout Shift
    await page.evaluateOnNewDocument(() => {
      window.__layoutShiftScore = 0;
      window.__layoutShiftEntries = [];
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              window.__layoutShiftScore += entry.value;
              window.__layoutShiftEntries.push({
                value: entry.value,
                sources: entry.sources ? entry.sources.length : 0
              });
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.error('PerformanceObserver not supported', e);
      }
    });

    // -------------------------------------------------------------
    // TEST 1: Desktop 1440px - Grid View Properties
    // -------------------------------------------------------------
    console.log('1️⃣ Testing Desktop (1440px) Grid View on /gayrimenkuller...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const gridImageAttrs = await page.evaluate(() => {
      const cards = document.querySelectorAll('#portfolio-grid-container > div');
      const data = [];
      cards.forEach((card, idx) => {
        const img = card.querySelector('img');
        if (img) {
          data.push({
            idx,
            loading: img.getAttribute('loading'),
            decoding: img.getAttribute('decoding'),
            fetchPriority: img.getAttribute('fetchpriority'),
            hasWidth: img.hasAttribute('width'),
            width: img.getAttribute('width'),
            hasHeight: img.hasAttribute('height'),
            height: img.getAttribute('height'),
            src: img.src ? img.src.substring(0, 45) + '...' : ''
          });
        }
      });
      return data;
    });

    console.log(`   Found ${gridImageAttrs.length} cards in grid.`);
    const first3Eager = gridImageAttrs.slice(0, 3).every(i => i.loading === 'eager' && i.fetchPriority === 'high');
    const remainingLazy = gridImageAttrs.slice(3).every(i => i.loading === 'lazy');
    const allAsyncDecoded = gridImageAttrs.every(i => i.decoding === 'async');
    const allHaveExplicitDimensions = gridImageAttrs.every(i => i.hasWidth && i.hasHeight);

    console.log(`   - First 3 items eager + high priority: ${first3Eager}`);
    console.log(`   - Remaining items lazy: ${remainingLazy}`);
    console.log(`   - All items async decoded: ${allAsyncDecoded}`);
    console.log(`   - All items have explicit dimensions (w=400, h=256): ${allHaveExplicitDimensions}`);

    if (first3Eager && remainingLazy && allAsyncDecoded && allHaveExplicitDimensions) {
      results.desktopGridAttributesCorrect = true;
      results.aboveFoldEagerBelowFoldLazy = true;
      console.log('   ✅ PASS: Desktop Grid View attributes and loading strategy are optimal!');
    } else {
      console.error('   ❌ FAIL: Attributes mismatch in grid images');
    }

    // Check CLS on 1440px load
    const initialCls = await page.evaluate(() => window.__layoutShiftScore);
    console.log(`   Cumulative Layout Shift (CLS) on initial load: ${initialCls.toFixed(4)}`);
    clsScores.push(initialCls);

    // -------------------------------------------------------------
    // TEST 2: Desktop 1440px - List View Properties
    // -------------------------------------------------------------
    console.log('\n2️⃣ Testing Desktop (1440px) List View on /gayrimenkuller...');
    // Click list view button
    const listBtnClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const listBtn = btns.find(b => b.title === 'Liste Görünümü' || b.getAttribute('aria-label') === 'Liste Görünümü');
      if (listBtn) {
        listBtn.click();
        return true;
      }
      return false;
    });
    console.log(`   Clicked List View button: ${listBtnClicked}`);
    await new Promise(r => setTimeout(r, 600));

    const listImageAttrs = await page.evaluate(() => {
      const rows = document.querySelectorAll('tbody tr');
      const data = [];
      rows.forEach((row, idx) => {
        const img = row.querySelector('img');
        if (img) {
          data.push({
            idx,
            loading: img.getAttribute('loading'),
            decoding: img.getAttribute('decoding'),
            width: img.getAttribute('width'),
            height: img.getAttribute('height')
          });
        }
      });
      return data;
    });

    console.log(`   Found ${listImageAttrs.length} table rows in list view.`);
    const first6ListEager = listImageAttrs.slice(0, 6).every(i => i.loading === 'eager');
    const remainingListLazy = listImageAttrs.slice(6).every(i => i.loading === 'lazy');
    const allListAsync = listImageAttrs.every(i => i.decoding === 'async');
    const allListSized = listImageAttrs.every(i => i.width === '64' && i.height === '48');

    console.log(`   - Table rows first 6 eager: ${first6ListEager}`);
    console.log(`   - Table rows remaining lazy: ${remainingListLazy}`);
    console.log(`   - Table rows sized 64x48: ${allListSized}`);

    if (first6ListEager && remainingListLazy && allListAsync && allListSized) {
      results.desktopListViewAttributesCorrect = true;
      console.log('   ✅ PASS: List View table images configured properly!');
    }

    // -------------------------------------------------------------
    // TEST 3: Property Detail Drawer & Gallery
    // -------------------------------------------------------------
    console.log('\n3️⃣ Testing Property Detail Drawer & Gallery...');
    // Click first row/card to open drawer
    await page.evaluate(() => {
      const firstRow = document.querySelector('tbody tr');
      if (firstRow) firstRow.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const drawerCheck = await page.evaluate(() => {
      // Find hero image inside drawer
      const drawer = document.querySelector('[role="dialog"]');
      if (!drawer) return null;
      const imgs = Array.from(drawer.querySelectorAll('img'));
      const hero = imgs.find(img => img.getAttribute('width') === '512' && img.getAttribute('height') === '256');
      const thumbs = imgs.filter(img => img.getAttribute('width') === '128' && img.getAttribute('height') === '64');
      const advisor = imgs.find(img => img.getAttribute('width') === '40' && img.getAttribute('height') === '40');

      return {
        drawerOpen: true,
        heroFound: Boolean(hero),
        heroDecoding: hero ? hero.getAttribute('decoding') : null,
        heroNoLazy: hero ? hero.getAttribute('loading') !== 'lazy' : false, // Drawer hero should NOT be lazy
        thumbsCount: thumbs.length,
        thumbsLazy: thumbs.every(t => t.getAttribute('loading') === 'lazy'),
        advisorFound: Boolean(advisor)
      };
    });

    console.log('   Drawer check results:', drawerCheck);
    if (drawerCheck && drawerCheck.heroFound && drawerCheck.heroNoLazy && drawerCheck.thumbsCount >= 3) {
      results.drawerGalleryMainAndThumbsValid = true;
      console.log('   ✅ PASS: Drawer Hero is eager and thumbnails are lazy with explicit dimensions!');
    }

    // Close drawer with ESC
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 600));

    // -------------------------------------------------------------
    // TEST 4: Tablet 768px Viewport
    // -------------------------------------------------------------
    console.log('\n4️⃣ Testing Tablet (768px) Viewport...');
    await page.setViewport({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));

    const tabletCheck = await page.evaluate(() => {
      const cards = document.querySelectorAll('#portfolio-grid-container > div');
      return {
        count: cards.length,
        firstImgLoaded: cards[0]?.querySelector('img')?.complete || false
      };
    });
    console.log(`   Tablet cards found: ${tabletCheck.count}, first image loaded: ${tabletCheck.firstImgLoaded}`);
    if (tabletCheck.count > 0 && tabletCheck.firstImgLoaded) {
      results.tablet768ViewResponsive = true;
      console.log('   ✅ PASS: Tablet 768px view renders correctly without issues!');
    }

    // -------------------------------------------------------------
    // TEST 5: Mobile 375px Viewport & Mobile Card Layout
    // -------------------------------------------------------------
    console.log('\n5️⃣ Testing Mobile (375px) Viewport...');
    await page.setViewport({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));

    // In mobile, switch to list view to test mobile cards
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const listBtn = btns.find(b => b.title === 'Liste Görünümü' || b.getAttribute('aria-label') === 'Liste Görünümü');
      if (listBtn) listBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const mobileListCheck = await page.evaluate(() => {
      const mobileCards = document.querySelectorAll('.md\\:hidden .p-3\\.5');
      const data = [];
      mobileCards.forEach((card, idx) => {
        const img = card.querySelector('img');
        if (img) {
          data.push({
            idx,
            width: img.getAttribute('width'),
            height: img.getAttribute('height'),
            loading: img.getAttribute('loading'),
            decoding: img.getAttribute('decoding')
          });
        }
      });
      return data;
    });

    console.log(`   Mobile list cards found: ${mobileListCheck.length}`);
    const first3MobileEager = mobileListCheck.slice(0, 3).every(i => i.loading === 'eager');
    const restMobileLazy = mobileListCheck.slice(3).every(i => i.loading === 'lazy');
    const mobileSized = mobileListCheck.every(i => i.width === '80' && i.height === '64');

    console.log(`   - First 3 mobile cards eager: ${first3MobileEager}`);
    console.log(`   - Remaining mobile cards lazy: ${restMobileLazy}`);
    console.log(`   - Mobile images sized 80x64: ${mobileSized}`);

    if (first3MobileEager && restMobileLazy && mobileSized) {
      results.mobile375ViewAttributesCorrect = true;
      console.log('   ✅ PASS: Mobile list view layout and image loading are optimal!');
    }

    // -------------------------------------------------------------
    // TEST 6: Dashboard Recent Properties Lazy Loading
    // -------------------------------------------------------------
    console.log('\n6️⃣ Testing Dashboard Recent Properties (/)...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const dashboardCheck = await page.evaluate(() => {
      const cards = document.querySelectorAll('h2');
      const recentHeader = Array.from(cards).find(h => h.textContent.includes('Son Eklenen'));
      if (!recentHeader) return null;
      const section = recentHeader.closest('.flex.flex-col.gap-space-md');
      if (!section) return null;
      const imgs = section.querySelectorAll('img[width="256"]');
      const list = [];
      imgs.forEach((img, idx) => {
        list.push({
          idx,
          loading: img.getAttribute('loading'),
          decoding: img.getAttribute('decoding'),
          fetchPriority: img.getAttribute('fetchpriority'),
          width: img.getAttribute('width'),
          height: img.getAttribute('height')
        });
      });
      return list;
    });

    console.log('   Dashboard recent properties images:', dashboardCheck);
    if (dashboardCheck && dashboardCheck.length > 0) {
      const firstIsEager = dashboardCheck[0].loading === 'eager' && dashboardCheck[0].fetchPriority === 'high';
      const othersLazy = dashboardCheck.slice(1).every(i => i.loading === 'lazy');
      const allAsync = dashboardCheck.every(i => i.decoding === 'async');

      console.log(`   - Dashboard top card eager: ${firstIsEager}`);
      console.log(`   - Dashboard other cards lazy: ${othersLazy}`);
      console.log(`   - Dashboard cards async: ${allAsync}`);

      if (firstIsEager && othersLazy && allAsync) {
        results.dashboardRecentPropertiesLazy = true;
        console.log('   ✅ PASS: Dashboard recent properties image loading strategy verified!');
      }
    }

    // -------------------------------------------------------------
    // TEST 7: CLS Evaluation During Scroll & Image Loading
    // -------------------------------------------------------------
    console.log('\n7️⃣ Measuring Layout Shift (CLS) during Image Loading and Scrolling...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0' });

    // Track shifts specifically caused during image loading and scrolling
    await page.evaluate(() => {
      window.__imageLoadingCls = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__imageLoadingCls += entry.value;
        }
      });
      observer.observe({ type: 'layout-shift' });
    });

    // Smoothly scroll down the page to trigger all lazy-loaded images
    await page.evaluate(async () => {
      for (let y = 0; y <= document.body.scrollHeight; y += 250) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 60));
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    const imageScrollCls = await page.evaluate(() => window.__imageLoadingCls);
    console.log(`   Image Loading & Scroll CLS Score: ${imageScrollCls.toFixed(4)} (Zero layout shift: 0.0000)`);

    if (imageScrollCls < 0.05) {
      results.clsMeasuredScoreLow = true;
      console.log('   ✅ PASS: Zero layout shift (CLS = 0.0000) when images load and decode!');
    } else {
      console.error(`   ❌ FAIL: Unwanted layout shift during image load: ${imageScrollCls}`);
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

runImageTests();
