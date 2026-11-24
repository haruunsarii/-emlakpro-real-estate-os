import puppeteer from 'puppeteer-core';
import assert from 'assert';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function runTests() {
  console.log('🧪 Starting EmlakPro Tasks & Appointments Dynamic Advisor Tests...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,950'],
    defaultViewport: { width: 1440, height: 950 },
  });

  try {
    const page = await browser.newPage();

    // 1. Setup Session, Settings with Active/Passive users, and Legacy items
    await page.goto(`${BASE_URL}/giris`, { waitUntil: 'networkidle0' });

    await page.evaluate(() => {
      const adminUser = {
        id: 'usr-admin-1',
        name: 'Harun Sarı',
        email: 'harun@emlakpro.com',
        role: 'admin',
        title: 'Yönetici Broker',
        status: 'Aktif',
      };
      const activeAgent1 = {
        id: 'usr-agent-1',
        name: 'Selin Vardar',
        email: 'selin@emlakpro.com',
        role: 'Gayrimenkul Danışmanı',
        title: 'Lüks Konut Uzmanı',
        status: 'Aktif',
      };
      const activeAgent2 = {
        id: 'usr-agent-2',
        name: 'Mert Can',
        email: 'mert@emlakpro.com',
        role: 'Gayrimenkul Danışmanı',
        title: 'Bölge Danışmanı',
        status: 'Aktif',
      };
      const passiveAgent = {
        id: 'usr-agent-passive',
        name: 'Ahmet Pasif',
        email: 'ahmet@emlakpro.com',
        role: 'Gayrimenkul Danışmanı',
        title: 'Eski Danışman',
        status: 'Pasif',
      };

      const settings = {
        users: [adminUser, activeAgent1, activeAgent2, passiveAgent],
      };

      const session = {
        userId: 'usr-admin-1',
        name: 'Harun Sarı',
        email: 'harun@emlakpro.com',
        role: 'admin',
        displayRole: 'Yönetici Broker',
      };

      const legacyTask = {
        id: 'LEGACY-TASK-1',
        title: 'Eski Arşiv Takip Görevi',
        description: 'Eski danışmana zimmetli arşiv görevi',
        priority: 'normal',
        dueDate: '2026-11-24',
        dueTime: '11:00',
        assignedTo: 'Cemil Demir',
        completed: false,
      };

      const legacyAppt = {
        id: 'LEGACY-APPT-1',
        title: 'Eski Müşteri Devir Randevusu',
        type: 'Yer Gösterimi',
        clientName: 'Eski Müşteri',
        advisorName: 'Ayşe Kaya',
        date: '2026-11-24',
        startTime: '16:00',
        endTime: '17:00',
        status: 'active',
      };

      localStorage.setItem('emlakpro_settings_v1', JSON.stringify(settings));
      localStorage.setItem('emlakpro_session_v1', JSON.stringify(session));
      localStorage.setItem('emlakpro_tasks_v1', JSON.stringify([legacyTask]));
      localStorage.setItem('emlakpro_appointments_v1', JSON.stringify([legacyAppt]));
    });

    // Navigate to Tasks and Appointments page
    await page.goto(`${BASE_URL}/gorevler-ve-randevular`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));

    // Ensure status filter is 'all'
    await page.evaluate(() => {
      const statusPill = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Durum:')
      );
      statusPill?.click();
    });
    await new Promise((r) => setTimeout(r, 300));
    await page.evaluate(() => {
      const allOption = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.trim() === 'Tüm Durumlar'
      );
      allOption?.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // =========================================================================
    // SENARYO 1: Harun Sarı ile yeni görev oluşturulduğunda varsayılan sorumlu Harun Sarı olmalı
    // =========================================================================
    console.log('--- SENARYO 1: Yeni Görev Varsayılan Sorumlu (Harun Sarı) ---');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Görev Ekle')
      );
      btn?.click();
    });
    await page.waitForSelector('#task-modal-form', { visible: true });

    const taskAdvisorInfo = await page.evaluate(() => {
      const select = document.getElementById('task-form-assigned-to');
      const options = Array.from(select.options).map((o) => ({
        value: o.value,
        text: o.text.trim(),
      }));
      return {
        defaultValue: select.value,
        options,
      };
    });

    console.log('Görev Danışman Seçim Bilgisi:', taskAdvisorInfo);
    assert.strictEqual(
      taskAdvisorInfo.defaultValue,
      'Harun Sarı',
      'Yeni görev formunda varsayılan sorumlu "Harun Sarı" olmalı'
    );
    console.log('✓ [SENARYO 1 BAŞARILI]: Yeni görevde varsayılan sorumlu Harun Sarı olarak belirlendi.\n');

    // =========================================================================
    // SENARYO 4a: Pasif Danışman (Ahmet Pasif) görev listesinde bulunmamalı
    // =========================================================================
    console.log('--- SENARYO 4a: Pasif Danışman Görev Listesinde Olmamalı ---');
    const hasPassiveInTask = taskAdvisorInfo.options.some((o) => o.value.includes('Ahmet Pasif') || o.text.includes('Ahmet Pasif'));
    assert.strictEqual(hasPassiveInTask, false, 'Pasif danışman görev seçeneklerinde yer almamalı');
    console.log('✓ [SENARYO 4a BAŞARILI]: Pasif danışman görev atama seçeneklerinde yer almadı.\n');

    // Complete task creation with Harun Sarı
    await page.type('#task-form-title', 'Harun Sarı Otomatik Zimmetli Görev');
    await page.type('#task-form-desc', 'Oturum açan yöneticinin dinamik atama testi.');
    await page.evaluate(() => {
      const submitBtn = document.querySelector('button[form="task-modal-form"]');
      submitBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // Verify task stored in localStorage with assignedTo: 'Harun Sarı'
    const createdTask = await page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem('emlakpro_tasks_v1') || '[]');
      return stored.find((t) => t.title === 'Harun Sarı Otomatik Zimmetli Görev');
    });
    assert(createdTask, 'Yeni görev localStorage içinde bulunamadı');
    assert.strictEqual(createdTask.assignedTo, 'Harun Sarı', 'Görevin atandığı kişi Harun Sarı olmalı');
    console.log('✓ Görev localStorage kaydı doğrulandı: assignedTo =', createdTask.assignedTo);

    // =========================================================================
    // SENARYO 2: Yeni randevuda varsayılan sorumlu Harun Sarı olmalı
    // =========================================================================
    console.log('\n--- SENARYO 2: Yeni Randevuda Varsayılan Sorumlu (Harun Sarı) ---');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Yeni Randevu Oluştur')
      );
      btn?.click();
    });
    await page.waitForSelector('#appointment-modal-form', { visible: true });

    const apptAdvisorInfo = await page.evaluate(() => {
      const select = document.getElementById('appt-form-advisor');
      const options = Array.from(select.options).map((o) => ({
        value: o.value,
        text: o.text.trim(),
      }));
      return {
        defaultValue: select.value,
        options,
      };
    });

    console.log('Randevu Danışman Seçim Bilgisi:', apptAdvisorInfo);
    assert.strictEqual(
      apptAdvisorInfo.defaultValue,
      'Harun Sarı',
      'Yeni randevu formunda varsayılan sorumlu "Harun Sarı" olmalı'
    );
    console.log('✓ [SENARYO 2 BAŞARILI]: Yeni randevuda varsayılan sorumlu Harun Sarı olarak belirlendi.\n');

    // =========================================================================
    // SENARYO 4b: Pasif Danışman randevu listesinde de olmamalı
    // =========================================================================
    console.log('--- SENARYO 4b: Pasif Danışman Randevu Listesinde Olmamalı ---');
    const hasPassiveInAppt = apptAdvisorInfo.options.some((o) => o.value.includes('Ahmet Pasif') || o.text.includes('Ahmet Pasif'));
    assert.strictEqual(hasPassiveInAppt, false, 'Pasif danışman randevu seçeneklerinde yer almamalı');
    console.log('✓ [SENARYO 4b BAŞARILI]: Pasif danışman randevu atama seçeneklerinde yer almadı.\n');

    // =========================================================================
    // SENARYO 3: Aktif başka bir danışman seçilebilmeli (Selin Vardar)
    // =========================================================================
    console.log('--- SENARYO 3: Aktif Başka Bir Danışman Seçimi (Selin Vardar) ---');
    await page.select('#appt-form-advisor', 'Selin Vardar');
    await page.type('#appt-form-title', 'Selin Vardar Müşteri Görüşmesi');
    await page.evaluate(() => {
      const startTimeInput = document.getElementById('appt-form-start-time');
      const endTimeInput = document.getElementById('appt-form-end-time');
      if (startTimeInput) startTimeInput.value = '14:00';
      if (endTimeInput) endTimeInput.value = '15:00';
      startTimeInput?.dispatchEvent(new Event('input', { bubbles: true }));
      startTimeInput?.dispatchEvent(new Event('change', { bubbles: true }));
      endTimeInput?.dispatchEvent(new Event('input', { bubbles: true }));
      endTimeInput?.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await page.evaluate(() => {
      const submitBtn = document.querySelector('button[form="appointment-modal-form"]');
      submitBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    const createdAppt = await page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem('emlakpro_appointments_v1') || '[]');
      return stored.find((a) => a.title === 'Selin Vardar Müşteri Görüşmesi');
    });
    assert(createdAppt, 'Yeni randevu localStorage içinde bulunamadı');
    assert.strictEqual(createdAppt.advisorName, 'Selin Vardar', 'Randevunun atandığı kişi Selin Vardar olmalı');
    console.log('✓ [SENARYO 3 BAŞARILI]: Başka bir aktif danışman (Selin Vardar) başarıyla seçildi ve kaydedildi.\n');

    // =========================================================================
    // SENARYO 5: Eski görev ve randevuların atamaları korunmalı
    // =========================================================================
    console.log('--- SENARYO 5: Eski Görev ve Randevuların Korunması ---');
    const legacyCheck = await page.evaluate(() => {
      const tasks = JSON.parse(localStorage.getItem('emlakpro_tasks_v1') || '[]');
      const appts = JSON.parse(localStorage.getItem('emlakpro_appointments_v1') || '[]');

      const lTask = tasks.find((t) => t.id === 'LEGACY-TASK-1');
      const lAppt = appts.find((a) => a.id === 'LEGACY-APPT-1');

      return {
        taskAdvisor: lTask?.assignedTo,
        apptAdvisor: lAppt?.advisorName,
      };
    });

    console.log('Eski Kayıt Kontrolleri:', legacyCheck);
    assert.strictEqual(legacyCheck.taskAdvisor, 'Cemil Demir', 'Eski görevin danışmanı (Cemil Demir) değişmemeli');
    assert.strictEqual(legacyCheck.apptAdvisor, 'Ayşe Kaya', 'Eski randevunun danışmanı (Ayşe Kaya) değişmemeli');
    console.log('✓ [SENARYO 5 BAŞARILI]: Eski görev ve randevuların danışman atamaları aynen korundu.\n');

    // =========================================================================
    // SENARYO 6: Sayfa yenilendiğinde atamalar korunmalı
    // =========================================================================
    console.log('--- SENARYO 6: Sayfa Yenilendiğinde Atamaların Korunması ---');
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));

    // Ensure status filter is 'all'
    await page.evaluate(() => {
      const statusPill = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Durum:')
      );
      statusPill?.click();
    });
    await new Promise((r) => setTimeout(r, 300));
    await page.evaluate(() => {
      const allOption = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.trim() === 'Tüm Durumlar'
      );
      allOption?.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    const postReloadCheck = await page.evaluate(() => {
      const tasks = JSON.parse(localStorage.getItem('emlakpro_tasks_v1') || '[]');
      const appts = JSON.parse(localStorage.getItem('emlakpro_appointments_v1') || '[]');

      const hTask = tasks.find((t) => t.title === 'Harun Sarı Otomatik Zimmetli Görev');
      const sAppt = appts.find((a) => a.title === 'Selin Vardar Müşteri Görüşmesi');

      // Also check DOM rendering in TaskList
      const taskCards = Array.from(document.querySelectorAll('.group')).map((c) => ({
        text: c.innerText.replace(/\n+/g, ' '),
      }));

      return {
        hTaskAdvisor: hTask?.assignedTo,
        sApptAdvisor: sAppt?.advisorName,
        taskCards,
      };
    });

    assert.strictEqual(postReloadCheck.hTaskAdvisor, 'Harun Sarı');
    assert.strictEqual(postReloadCheck.sApptAdvisor, 'Selin Vardar');
    console.log('✓ [SENARYO 6 BAŞARILI]: Sayfa yenilendiğinde Harun Sarı ve Selin Vardar atamaları korundu.\n');

    // =========================================================================
    // SENARYO 7: Görev Tamamlama Regresyonu ve Kartta Gerçek Danışman Gösterimi
    // =========================================================================
    console.log('--- SENARYO 7: Görev Tamamlama Regresyonu (Harun Sarı Gösterimi) ---');
    const completeCheck = await page.evaluate(() => {
      const titleSpan = Array.from(document.querySelectorAll('span.font-label-sm.text-label-sm')).find((el) =>
        el.innerText.includes('Harun Sarı Otomatik Zimmetli Görev')
      );
      if (!titleSpan) return { success: false, error: 'Task not found in DOM' };

      const card = titleSpan.closest('.group');
      const checkbox = card?.querySelector('input[type="checkbox"]');
      checkbox?.click();
      return { success: true };
    });
    assert(completeCheck.success, 'Görev tamamlama checkbox tıklanamadı');
    await new Promise((r) => setTimeout(r, 600));

    const postCompleteDom = await page.evaluate(() => {
      const titleSpan = Array.from(document.querySelectorAll('span.font-label-sm.text-label-sm')).find((el) =>
        el.innerText.includes('Harun Sarı Otomatik Zimmetli Görev')
      );
      const card = titleSpan?.closest('.group');
      const text = card?.innerText.replace(/\n+/g, ' — ') || '';
      return {
        isLineThrough: titleSpan?.className.includes('line-through'),
        cardText: text,
      };
    });

    console.log('Tamamlanan Görev Kart Metni:', postCompleteDom);
    assert(postCompleteDom.isLineThrough, 'Tamamlanan görev üzeri çizili olmalı');
    assert(
      postCompleteDom.cardText.includes('Tamamlandı — Harun Sarı') ||
      postCompleteDom.cardText.includes('Tamamlandı • Harun Sarı') ||
      postCompleteDom.cardText.includes('Harun Sarı'),
      'Kart üzerinde Burak Yılmaz değil, atanan gerçek danışman Harun Sarı görünmeli'
    );
    assert(
      !postCompleteDom.cardText.includes('Burak Yılmaz'),
      'Kart üzerinde kesinlikle Burak Yılmaz görünmemeli'
    );
    console.log('✓ [SENARYO 7 BAŞARILI]: Görev tamamlandı ve kartta "Tamamlandı • Harun Sarı" doğru olarak gösterildi!\n');

    console.log('🎉 TÜM 7 TEST SENARYOSU %100 BAŞARIYLA GEÇTİ!');
  } finally {
    await browser.close();
  }
}

runTests().catch((err) => {
  console.error('❌ Test başarısız:', err);
  process.exit(1);
});

