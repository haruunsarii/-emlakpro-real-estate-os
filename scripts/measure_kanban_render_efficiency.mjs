import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function measureEfficiency() {
  console.log('🔬 Measuring Kanban Component Render & DOM Mutation Efficiency...\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/satis-ve-kiralama`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // Attach MutationObserver to all 8 columns to observe DOM mutation counts during a single card transition
    const mutationResults = await page.evaluate(async () => {
      const colElements = Array.from(document.querySelectorAll('[id^="kanban-col-"]'));
      const mutationCounts = {};
      const observers = [];

      colElements.forEach(col => {
        const id = col.id.replace('kanban-col-', '');
        mutationCounts[id] = 0;
        const obs = new MutationObserver((mutations) => {
          mutationCounts[id] += mutations.length;
        });
        obs.observe(col, { childList: true, subtree: true, attributes: true });
        observers.push(obs);
      });

      // Now trigger a move from col 1 (yeni_firsat) to col 2 (ilk_gorusme)
      const firstCol = document.getElementById('kanban-col-yeni_firsat');
      const card = firstCol?.querySelector('.select-none.cursor-pointer');
      const forwardBtn = card?.querySelector('button[title*="İlerlet"]');

      if (!forwardBtn) {
        return { error: 'Forward button not found' };
      }

      forwardBtn.click();
      await new Promise(r => setTimeout(r, 800));

      // Disconnect observers
      observers.forEach(obs => obs.disconnect());

      return {
        mutationCounts,
        affectedColumns: Object.entries(mutationCounts).filter(([_, count]) => count > 0).map(([id]) => id),
        unaffectedColumns: Object.entries(mutationCounts).filter(([_, count]) => count === 0).map(([id]) => id)
      };
    });

    console.log('📊 DOM Mutation Observation across 8 Columns during Card Move:');
    console.log(JSON.stringify(mutationResults, null, 2));

    const totalCols = Object.keys(mutationResults.mutationCounts).length;
    const unaffectedCount = mutationResults.unaffectedColumns.length;
    const isolationRatio = ((unaffectedCount / (totalCols - 2)) * 100).toFixed(1);

    console.log(`\n✅ Isolation Efficiency: ${unaffectedCount} out of 6 uninvolved columns had ZERO DOM mutations (${isolationRatio}% perfectly isolated).`);

  } catch (err) {
    console.error('Measurement failed:', err);
  } finally {
    await browser.close();
  }
}

measureEfficiency();

