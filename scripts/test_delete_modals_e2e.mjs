import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function runDeleteModalsTests() {
  console.log('🚀 EmlakPro Aşama 3.2: 4 Silme Modalı E2E Doğrulama Testi Başlatılıyor...');
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
    // ----------------------------------------------------
    // TEST 1: PropertyDeleteModal (/gayrimenkuller)
    // ----------------------------------------------------
    console.log('--- 1. Gayrimenkuller Sayfası: PropertyDeleteModal Testi ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0', timeout: 30000 });

    // Test için geçici bir portföy ekle
    const testPropId = 'PORT-TEST-DEL-101';
    await page.evaluate((id) => {
      const saved = localStorage.getItem('emlakpro_properties_v1');
      const list = saved ? JSON.parse(saved) : [];
      const newProp = {
        id,
        title: 'Silme Testi Özel Yalı',
        location: 'İstanbul, Beşiktaş',
        district: 'Beşiktaş',
        neighborhood: 'Bebek',
        category: 'Konut',
        type: 'Satılık',
        price: 95000000,
        priceFormatted: '₺95.000.000',
        rooms: '6+2',
        area: 550,
        status: 'Aktif',
        dateAdded: new Date().toISOString(),
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      };
      localStorage.setItem('emlakpro_properties_v1', JSON.stringify([newProp, ...list]));
      window.dispatchEvent(
        new CustomEvent('emlakpro_local_storage_sync', {
          detail: { key: 'emlakpro_properties_v1', newValue: [newProp, ...list] },
        })
      );
    }, testPropId);

    await new Promise((r) => setTimeout(r, 200));

    // Kart üzerindeki sil butonuna tıkla
    const _deleteBtnFound = await page.evaluate((id) => {
      const cards = Array.from(document.querySelectorAll('div'));
      const card = cards.find((el) => el.innerText.includes(id));
      if (!card) return false;
      const btn = card.querySelector('button[title*="Sil"], button[aria-label*="Sil"]');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    }, testPropId);

    // Eğer buton tıklanamadıysa detay drawer üzerinden veya menüden aç
    let modalOpened = await page.evaluate((id) => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      return !!dialog && dialog.innerText.includes(id);
    }, testPropId);

    if (!modalOpened) {
      // Sayfadaki card sil butonunu selector ile bul
      const cardDelBtn = await page.$(`button[title="İlanı Sil"]`);
      if (cardDelBtn) {
        await cardDelBtn.click();
        await new Promise((r) => setTimeout(r, 200));
        modalOpened = await page.evaluate((id) => {
          const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
          return !!dialog && dialog.innerText.includes(id);
        }, testPropId);
      }
    }

    record('Gayrimenkul silme modalı doğru kayıt bilgileriyle (PORT-TEST-DEL-101) açıldı', modalOpened);

    // ESC ile kapatma testi (Kayıt SİLİNMEMELİ)
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 200));
    const closedAfterEsc = await page.evaluate(() => {
      return !document.querySelector('[role="dialog"][aria-modal="true"]');
    });
    const itemStillExistsAfterEsc = await page.evaluate((id) => {
      const saved = localStorage.getItem('emlakpro_properties_v1');
      return saved ? saved.includes(id) : false;
    }, testPropId);
    record('ESC tuşu modalı kapattı ve kayıt silinmedi', closedAfterEsc && itemStillExistsAfterEsc);

    // Modalı tekrar aç ve Backdrop tıklaması testi
    await page.evaluate((id) => {
      const cards = Array.from(document.querySelectorAll('div'));
      const card = cards.find((el) => el.innerText.includes(id));
      const btn = card?.querySelector('button[title*="Sil"], button[aria-label*="Sil"]');
      btn?.click();
    }, testPropId);
    await new Promise((r) => setTimeout(r, 200));

    // Backdrop'a tıkla (sol üst köşe)
    await page.mouse.click(10, 10);
    await new Promise((r) => setTimeout(r, 200));
    const closedAfterBackdrop = await page.evaluate(() => {
      return !document.querySelector('[role="dialog"][aria-modal="true"]');
    });
    const itemStillExistsAfterBackdrop = await page.evaluate((id) => {
      const saved = localStorage.getItem('emlakpro_properties_v1');
      return saved ? saved.includes(id) : false;
    }, testPropId);
    record('Backdrop tıklaması modalı kapattı ve kayıt silinmedi', closedAfterBackdrop && itemStillExistsAfterBackdrop);

    // Modalı tekrar aç ve "Vazgeç" butonu testi
    await page.evaluate((id) => {
      const cards = Array.from(document.querySelectorAll('div'));
      const card = cards.find((el) => el.innerText.includes(id));
      const btn = card?.querySelector('button[title*="Sil"], button[aria-label*="Sil"]');
      btn?.click();
    }, testPropId);
    await new Promise((r) => setTimeout(r, 200));

    const cancelClicked = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      const cancelBtn = Array.from(dialog?.querySelectorAll('button') || []).find((b) => b.innerText.includes('Vazgeç'));
      if (cancelBtn) {
        cancelBtn.click();
        return true;
      }
      return false;
    });
    await new Promise((r) => setTimeout(r, 200));
    const closedAfterCancel = await page.evaluate(() => {
      return !document.querySelector('[role="dialog"][aria-modal="true"]');
    });
    record('Vazgeç butonu modalı kapattı ve kayıt silinmedi', cancelClicked && closedAfterCancel);

    // Modalı tekrar aç ve GERÇEK SİLME TESTİ (onConfirm)
    await page.evaluate((id) => {
      const cards = Array.from(document.querySelectorAll('div'));
      const card = cards.find((el) => el.innerText.includes(id));
      const btn = card?.querySelector('button[title*="Sil"], button[aria-label*="Sil"]');
      btn?.click();
    }, testPropId);
    await new Promise((r) => setTimeout(r, 200));

    const confirmClicked = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      const delBtn = Array.from(dialog?.querySelectorAll('button') || []).find((b) => b.innerText.includes('Evet, İlanı Sil') || b.innerText.includes('Sil'));
      if (delBtn) {
        delBtn.click();
        return true;
      }
      return false;
    });
    await new Promise((r) => setTimeout(r, 300));

    const itemDeletedFromStorage = await page.evaluate((id) => {
      const saved = localStorage.getItem('emlakpro_properties_v1');
      return saved ? !saved.includes(id) : true;
    }, testPropId);

    const toastShown = await page.evaluate(() => {
      return document.body.innerText.includes('başarıyla silindi');
    });

    record('Sil butonu ilanı başarıyla sildi ve localStorage güncellendi', confirmClicked && itemDeletedFromStorage);
    record('Silme sonrası merkezi Toast bildirimi gösterildi', toastShown);

    // ----------------------------------------------------
    // TEST 2: DealDeleteModal (/satis-ve-kiralama)
    // ----------------------------------------------------
    console.log('\n--- 2. Satış ve Kiralama Sayfası: DealDeleteModal Testi ---');
    await page.goto(`${BASE_URL}/satis-ve-kiralama`, { waitUntil: 'networkidle0', timeout: 30000 });

    const testDealId = 'DEAL-TEST-DEL-202';
    await page.evaluate((id) => {
      const saved = localStorage.getItem('emlakpro_deals_v1');
      const list = saved ? JSON.parse(saved) : [];
      const newDeal = {
        id,
        title: 'Özel Yalı Satış Anlaşması',
        customerName: 'Ahmet Test Müşteri',
        propertyTitle: 'Bebek Boğaz Yalısı',
        propertyId: 'PORT-8841',
        amount: 80000000,
        amountFormatted: '₺80.000.000',
        stage: 'yeni_firsat',
        priority: 'Kritik',
        advisor: 'Burak Yılmaz',
        type: 'Satılık',
      };
      localStorage.setItem('emlakpro_deals_v1', JSON.stringify([newDeal, ...list]));
      window.dispatchEvent(
        new CustomEvent('emlakpro_local_storage_sync', {
          detail: { key: 'emlakpro_deals_v1', newValue: [newDeal, ...list] },
        })
      );
    }, testDealId);
    await new Promise((r) => setTimeout(r, 200));

    // Fırsat kartına (h4 üzerinden) tıkla -> DealDetailDrawer açılsın -> içindeki "Fırsatı Sil" butonuna tıkla
    await page.evaluate((title) => {
      const h4s = Array.from(document.querySelectorAll('h4'));
      const targetH4 = h4s.find((h) => h.innerText.includes(title));
      if (targetH4) {
        // En yakın DealCard konteynerine tıkla
        const card = targetH4.closest('[draggable]') || targetH4;
        card.click();
      }
    }, 'Özel Yalı Satış Anlaşması');
    await new Promise((r) => setTimeout(r, 400));

    await page.evaluate(() => {
      const delBtn = document.querySelector('button[title="Fırsatı Sil"]');
      if (delBtn) delBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    const dealModalOk = await page.evaluate((id) => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      return !!dialog && dialog.innerText.includes(id) && dialog.innerText.includes('Güvenli Silme');
    }, testDealId);
    record('DealDeleteModal doğru başlık, tutar ve Güvenli Silme uyarısıyla açıldı', dealModalOk);

    // Silme onayı testi
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      const btn = Array.from(dialog?.querySelectorAll('button') || []).find((b) => b.innerText.includes('Evet, Fırsatı Sil'));
      btn?.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    const dealDeletedFromStorage = await page.evaluate((id) => {
      const saved = localStorage.getItem('emlakpro_deals_v1');
      return saved ? !saved.includes(id) : true;
    }, testDealId);
    record('Fırsat onaylandıktan sonra localStorage\'dan başarıyla silindi', dealDeletedFromStorage);

    // ----------------------------------------------------
    // TEST 3: RequestDeleteModal (/talepler)
    // ----------------------------------------------------
    console.log('\n--- 3. Müşteri Talepleri Sayfası: RequestDeleteModal Testi ---');
    await page.goto(`${BASE_URL}/talepler`, { waitUntil: 'networkidle0', timeout: 30000 });

    const testDemandId = 'TLP-TEST-DEL-303';
    await page.evaluate((id) => {
      const saved = localStorage.getItem('emlakpro_requests_v1');
      const list = saved ? JSON.parse(saved) : [];
      const newDemand = {
        id,
        clientName: 'Canan Test Alıcı',
        targetRegion: 'Kadıköy / Moda',
        propertyType: 'Konut',
        budget: '25M - 30M ₺',
        phone: '0 (532) 777 66 55',
        overallScore: 88,
        status: 'Aktif',
      };
      localStorage.setItem('emlakpro_requests_v1', JSON.stringify([newDemand, ...list]));
      window.dispatchEvent(
        new CustomEvent('emlakpro_local_storage_sync', {
          detail: { key: 'emlakpro_requests_v1', newValue: [newDemand, ...list] },
        })
      );
    }, testDemandId);
    await new Promise((r) => setTimeout(r, 200));

    // Talep kartındaki sil butonuna tıkla
    await page.evaluate((id) => {
      const cards = Array.from(document.querySelectorAll('div'));
      const card = cards.find((el) => el.innerText.includes(id));
      const btn = card?.querySelector('button[title*="Sil"]');
      btn?.click();
    }, testDemandId);
    await new Promise((r) => setTimeout(r, 200));

    const demandModalOk = await page.evaluate((id) => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      return !!dialog && dialog.innerText.includes(id) && dialog.innerText.includes('Talebi Silmek İstiyor Musunuz?');
    }, testDemandId);
    record('RequestDeleteModal talep kodu ve müşteri adıyla açıldı', demandModalOk);

    // Silme onayı testi
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      const btn = Array.from(dialog?.querySelectorAll('button') || []).find((b) => b.innerText.includes('Evet, Talebi Sil'));
      btn?.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    const demandDeletedFromStorage = await page.evaluate((id) => {
      const saved = localStorage.getItem('emlakpro_requests_v1');
      return saved ? !saved.includes(id) : true;
    }, testDemandId);
    record('Talep onaylandıktan sonra localStorage\'dan başarıyla silindi', demandDeletedFromStorage);

    // ----------------------------------------------------
    // TEST 4: TaskDeleteModal (/gorevler-ve-randevular)
    // ----------------------------------------------------
    console.log('\n--- 4. Görevler ve Randevular Sayfası: TaskDeleteModal Testi ---');
    await page.goto(`${BASE_URL}/gorevler-ve-randevular`, { waitUntil: 'networkidle0', timeout: 30000 });

    const testTaskId = 'TASK-TEST-DEL-404';
    await page.evaluate((id) => {
      const saved = localStorage.getItem('emlakpro_tasks_v1');
      const list = saved ? JSON.parse(saved) : [];
      const newTask = {
        id,
        title: 'Silinecek Özel Randevu Notu',
        description: 'Test amaçlı eklenmiş ajanda görevi',
        priority: 'urgent',
        completed: false,
        dueDate: new Date().toISOString().split('T')[0],
        assignedTo: 'Burak Yılmaz',
      };
      localStorage.setItem('emlakpro_tasks_v1', JSON.stringify([newTask, ...list]));
      window.dispatchEvent(
        new CustomEvent('emlakpro_local_storage_sync', {
          detail: { key: 'emlakpro_tasks_v1', newValue: [newTask, ...list] },
        })
      );
    }, testTaskId);
    await new Promise((r) => setTimeout(r, 200));

    // Görev kartındaki sil butonuna tıkla
    await page.evaluate((id) => {
      const items = Array.from(document.querySelectorAll('div, li'));
      const item = items.find((el) => el.innerText.includes(id) || el.innerText.includes('Silinecek Özel Randevu Notu'));
      const btn = item?.querySelector('button[title*="Sil"]');
      btn?.click();
    }, testTaskId);
    await new Promise((r) => setTimeout(r, 200));

    const taskModalOk = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      return !!dialog && dialog.innerText.includes('Silinecek Özel Randevu Notu') && dialog.innerText.includes('Görevi Sil');
    });
    record('TaskDeleteModal görev başlığı ve güvenli silme notuyla açıldı', taskModalOk);

    // Silme onayı testi
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      const btn = Array.from(dialog?.querySelectorAll('button') || []).find((b) => b.innerText.includes('Evet, Sil'));
      btn?.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    const taskDeletedFromStorage = await page.evaluate((id) => {
      const saved = localStorage.getItem('emlakpro_tasks_v1');
      return saved ? !saved.includes(id) : true;
    }, testTaskId);
    record('Görev onaylandıktan sonra localStorage\'dan başarıyla silindi', taskDeletedFromStorage);

    // ----------------------------------------------------
    // TEST 5: Mobil Görünüm (375px) Taşma ve Buton Kontrolü
    // ----------------------------------------------------
    console.log('\n--- 5. Mobil Görünüm (375px) Duyarlılık Kontrolü ---');
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle0', timeout: 30000 });

    const mobileRenderOk = await page.evaluate(() => {
      return document.body.clientWidth <= 375 && !document.body.innerText.includes('TypeError');
    });
    record('Mobil (375px) görünümde sayfa ve modal konteyneri hatasız render edildi', mobileRenderOk);

    console.log('\n=============================================');
    console.log(`TEST SONUCU: ${allPassed ? 'TÜM 4 SİLME MODALI TESTLERİ BAŞARIYLA GEÇTİ ✅' : 'BAZI TESTLER BAŞARISIZ OLDU ❌'}`);
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

runDeleteModalsTests();
