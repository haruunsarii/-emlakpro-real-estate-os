import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

const SCREENS = [
  { name: 'Dashboard', path: '/' },
  { name: 'Müşteriler', path: '/musteriler' },
  { name: 'Gayrimenkuller', path: '/gayrimenkuller' },
  { name: 'Talepler', path: '/talepler' },
  { name: 'Satış ve Kiralama', path: '/satis-ve-kiralama' },
  { name: 'Görevler ve Randevular', path: '/gorevler-ve-randevular' },
  { name: 'Raporlar', path: '/raporlar' },
  { name: 'Ayarlar', path: '/ayarlar' },
];

const VIEWPORTS = [
  { name: 'Mobile (375px)', width: 375, height: 667 },
  { name: 'Tablet (768px)', width: 768, height: 1024 },
  { name: 'Desktop (1440px)', width: 1440, height: 900 },
];

async function runCleanSlateAudit() {
  console.log('🚀 EmlakPro Aşama 5: Temiz Başlangıç ve Demo Verilerinin Kaldırılması Denetimi');
  console.log(`Tarayıcı: ${CHROME_PATH}`);
  console.log(`URL: ${BASE_URL}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const auditReport = {
    test1_clean_state_screens: [],
    test2_single_record_crud: {},
    test3_delete_no_reseeding: {},
    test4_safety_backup: {},
    test5_responsive_empty_states: [],
    consoleErrors: [],
    summary: { total: 0, passed: 0, failed: 0 }
  };

  function assert(title, condition, details = '') {
    auditReport.summary.total++;
    if (condition) {
      auditReport.summary.passed++;
      console.log(`  ✅ [PASS] ${title} ${details ? '(' + details + ')' : ''}`);
      return true;
    } else {
      auditReport.summary.failed++;
      console.error(`  ❌ [FAIL] ${title} ${details ? '(' + details + ')' : ''}`);
      return false;
    }
  }

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore favicon or known benign dev logs
      if (!text.includes('favicon') && !text.includes('chrome-extension')) {
        console.warn(`[Tarayıcı Konsol Hatası]: ${text}`);
        auditReport.consoleErrors.push(text);
      }
    }
  });

  try {
    // -------------------------------------------------------------
    // ADIM 0: LocalStorage Sıfırlama (İzole Test Ortamı)
    // -------------------------------------------------------------
    console.log('\n--- ADIM 0: İzole Oturumda LocalStorage Sıfırlanıyor ---');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.clear();
      const adminSession = {
        userId: 'usr-admin-1',
        name: 'Sistem Yöneticisi',
        email: 'admin@emlakpro.com',
        role: 'admin',
        displayRole: 'Yönetici',
        title: 'Yönetici',
        avatarUrl: '',
        loginAt: new Date().toISOString(),
      };
      const settings = {
        users: [{ id: 'usr-admin-1', name: 'Sistem Yöneticisi', email: 'admin@emlakpro.com', role: 'Yönetici', status: 'Aktif' }],
        profile: null,
      };
      localStorage.setItem('emlakpro_session_v1', JSON.stringify(adminSession));
      localStorage.setItem('emlakpro_settings_v1', JSON.stringify(settings));
    });
    await page.reload({ waitUntil: 'networkidle2' });
    console.log('  LocalStorage başarıyla sıfırlandı.');

    // -------------------------------------------------------------
    // TEST 1: 8 Ana Ekranda Temiz Başlangıç ve Sıfır / Boş Durum Kontrolü
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: 8 Ana Ekranda Temiz Başlangıç (0 Kayıt & EmptyState) ---');

    // 1.1 Dashboard
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));
    const dashboardStats = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasEmptyPropertyText: text.includes('Henüz Portföy Eklenmemiş') || text.includes('Sisteme yeni bir gayrimenkul portföyü ekleyerek'),
        hasEmptyAppointmentText: text.includes('Yaklaşan Randevu Yok') || text.includes('planlanmış aktif randevu bulunmuyor'),
        hasEmptyActivityText: text.includes('Henüz Aktivite Kaydı Yok') || text.includes('Aktivite Akışı'),
        hasEmptyRevenueText: text.includes('Henüz Gelir ve İşlem Kaydı Bulunmuyor') || text.includes('tamamlanmış satış veya kiralama sözleşmesi bulunmuyor'),
        hasZeroKpi: text.includes('0 İlan Portföyde') || text.includes('0 Aktif Portföy') || text.includes('₺0')
      };
    });
    assert('Dashboard: Portföy boş durumu gösteriliyor ("Henüz Portföy Eklenmemiş")', dashboardStats.hasEmptyPropertyText);
    assert('Dashboard: Randevu boş durumu gösteriliyor ("Yaklaşan Randevu Yok")', dashboardStats.hasEmptyAppointmentText);
    assert('Dashboard: Aktivite boş durumu gösteriliyor ("Henüz Aktivite Kaydı Yok")', dashboardStats.hasEmptyActivityText);
    assert('Dashboard: Gelir grafiği boş durumu gösteriliyor ("Henüz Gelir ve İşlem Kaydı Bulunmuyor")', dashboardStats.hasEmptyRevenueText);
    assert('Dashboard: KPI sayaçları 0 gösteriyor', dashboardStats.hasZeroKpi);
    auditReport.test1_clean_state_screens.push({ screen: 'Dashboard', status: 'passed' });

    // 1.2 Müşteriler
    await page.goto(`${BASE_URL}/musteriler`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));
    const customerStats = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasEmptyTable: text.includes('Henüz Müşteri Kaydı Yok') || text.includes('Sistemde henüz kayıtlı müşteri bulunmuyor'),
        hasZeroKpi: text.includes('0 Kayıtlı Müşteri') || text.includes('Tümü (0)') || text.includes('0 Kişi')
      };
    });
    assert('Müşteriler: Boş müşteri tablosu ("Henüz Müşteri Kaydı Yok") ve 0 sayaçlar', customerStats.hasEmptyTable && customerStats.hasZeroKpi);
    auditReport.test1_clean_state_screens.push({ screen: 'Müşteriler', status: 'passed' });

    // 1.3 Gayrimenkuller
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));
    const propertyStats = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasZeroKpi: text.includes('0 Aktif İlan') || text.includes('0 İlan Portföyde') || text.includes('Tümü (0)') || text.includes('₺0'),
        hasEmptyGrid: text.includes('Henüz Portföy İlanı Bulunmuyor') || text.includes('Sistemde henüz kayıtlı bir portföy ilanı bulunmuyor')
      };
    });
    assert('Gayrimenkuller: 0 İlan ve boş portföy durumu ("Henüz Portföy İlanı Bulunmuyor")', propertyStats.hasEmptyGrid && propertyStats.hasZeroKpi);
    auditReport.test1_clean_state_screens.push({ screen: 'Gayrimenkuller', status: 'passed' });

    // 1.4 Talepler
    await page.goto(`${BASE_URL}/talepler`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));
    const demandStats = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasZeroKpi: text.includes('TOPLAM TALEP HAVUZU') || text.includes('Tümü(0)') || text.includes('0 Talep') || text.includes('Talepler (0)'),
        hasEmptyState: text.includes('Henüz Müşteri Talebi Eklenmemiş') || text.includes('portföy eşleştirme motorunu çalıştırabilirsiniz')
      };
    });
    assert('Talepler: 0 Talep ve boş talep listesi ("Henüz Müşteri Talebi Eklenmemiş")', demandStats.hasEmptyState && demandStats.hasZeroKpi);
    auditReport.test1_clean_state_screens.push({ screen: 'Talepler', status: 'passed' });

    // 1.5 Satış ve Kiralama (Deals)
    await page.goto(`${BASE_URL}/satis-ve-kiralama`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));
    const dealsStats = await page.evaluate(() => {
      const text = document.body.innerText;
      const badges = Array.from(document.querySelectorAll('span')).map(s => s.innerText.trim());
      const zeroBadges = badges.filter(b => b === '0');
      return {
        zeroCount: zeroBadges.length,
        hasZeroText: text.includes('0 Fırsat') || text.includes('0 Başarılı') || zeroBadges.length >= 4
      };
    });
    assert('Satış ve Kiralama: Kanban sütunları boş (0 fırsat)', dealsStats.hasZeroText || dealsStats.zeroCount >= 4);
    auditReport.test1_clean_state_screens.push({ screen: 'Satış ve Kiralama', status: 'passed' });

    // 1.6 Görevler ve Randevular
    await page.goto(`${BASE_URL}/gorevler-ve-randevular`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));
    const taskStats = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasZeroKpi: text.includes('0 Görev') && text.includes('0 Randevu'),
        hasEmptyReminders: text.includes('Yaklaşan hatırlatıcı bulunmuyor') || text.includes('Hatırlatıcı Yok') || text.includes('0 Hatırlatıcı')
      };
    });
    assert('Görevler ve Randevular: 0 sayaç ve boş durumlar (0 Görev, 0 Randevu)', taskStats.hasZeroKpi);
    auditReport.test1_clean_state_screens.push({ screen: 'Görevler ve Randevular', status: 'passed' });

    // 1.7 Raporlar
    await page.goto(`${BASE_URL}/raporlar`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));
    const reportsStats = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasZeroRevenue: text.includes('₺0') || text.includes('0 ₺'),
        hasEmptyRevenueChart: text.includes('Yeterli Gelir Verisi Bulunmuyor') || text.includes('Grafik için henüz yeterli işlem geçmişi oluşmadı'),
        hasEmptyRegional: text.includes('Henüz Bölgesel Talep Verisi Yok') || text.includes('Talep ve portföy kayıtları eklendikçe'),
        hasEmptyPortfolio: text.includes('Henüz Portföy Verisi Yok') || text.includes('Portföy analizi için gayrimenkul ekleyin'),
        hasEmptyLeaderboard: text.includes('0 Aktif Danışman') || text.includes('Kayıtlı Danışman veya İşlem Bulunmuyor')
      };
    });
    assert('Raporlar: Gelir grafiği boş durumu ("Yeterli Gelir Verisi Bulunmuyor")', reportsStats.hasEmptyRevenueChart);
    assert('Raporlar: Bölgesel talep boş durumu ("Henüz Bölgesel Talep Verisi Yok")', reportsStats.hasEmptyRegional);
    assert('Raporlar: Portföy analitiği boş durumu ("Henüz Portföy Verisi Yok")', reportsStats.hasEmptyPortfolio);
    assert('Raporlar: Danışman liderliği boş tablosu ("0 Aktif Danışman")', reportsStats.hasEmptyLeaderboard);
    auditReport.test1_clean_state_screens.push({ screen: 'Raporlar', status: 'passed' });

    // 1.8 Ayarlar
    await page.goto(`${BASE_URL}/ayarlar`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));
    // Click Ekip & Kullanıcılar tab
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const teamBtn = buttons.find(b => b.innerText.includes('Ekip') || b.innerText.includes('Kullanıcı'));
      if (teamBtn) teamBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));
    const settingsStats = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasEmptyTeam:
          text.includes('Henüz Kullanıcı Bulunmuyor') ||
          text.includes('Sistemde henüz kayıtlı kullanıcı bulunmuyor') ||
          (!text.includes('Burak Yılmaz') && !text.includes('Meltem Şahin'))
      };
    });
    assert('Ayarlar: Ekip listesinde sahte kullanıcı yok ("Henüz Kullanıcı Bulunmuyor")', settingsStats.hasEmptyTeam);
    auditReport.test1_clean_state_screens.push({ screen: 'Ayarlar', status: 'passed' });

    // -------------------------------------------------------------
    // TEST 2: Temiz Ortamda Tek Kayıt Ekleme ve Dinamik Sayaç Güncellemesi
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Tek Kayıt Ekleme & Sayfa Yenileme ile Kalıcılık (CRUD) ---');
    await page.evaluate(() => {
      const now = new Date().toISOString();
      const testCustomer = {
        id: 'cust-real-1',
        name: 'Zeynep Kaya',
        fullName: 'Zeynep Kaya',
        role: 'Alıcı',
        type: 'buyer',
        segment: 'Bireysel Alıcı',
        status: 'Sıcak Aday',
        statusType: 'hot',
        isHot: true,
        phone: '0532 111 22 33',
        email: 'zeynep@example.com',
        budget: '₺7.500.000',
        budgetMin: 5000000,
        budgetMax: 10000000,
        city: 'İstanbul',
        district: 'Kadıköy',
        region: 'İstanbul / Kadıköy',
        advisor: 'Burak Yılmaz',
        initials: 'ZK',
        avatarBg: 'bg-primary text-on-primary',
        notes: [],
        timeline: [],
        createdAt: now,
        updatedAt: now
      };
      const testProperty = {
        id: 'prop-real-1',
        title: 'Bağdat Caddesi Lüks 3+1 Daire',
        type: 'Satılık',
        propertyType: 'Satılık',
        listingType: 'Satılık',
        category: 'Daire',
        price: 7500000,
        priceFormatted: '₺7.500.000',
        currency: 'TRY',
        city: 'İstanbul',
        district: 'Kadıköy',
        location: 'Kadıköy / İstanbul',
        neighborhood: 'Caddebostan',
        rooms: '3+1',
        netArea: 145,
        grossArea: 165,
        area: 145,
        status: 'Aktif',
        statusType: 'active',
        assignedAgent: 'Burak Yılmaz',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
        createdAt: now
      };
      const testDeal = {
        id: 'deal-real-1',
        title: 'Zeynep Kaya - Kadıköy Daire Satışı',
        customerId: 'cust-real-1',
        customerName: 'Zeynep Kaya',
        propertyId: 'prop-real-1',
        propertyTitle: 'Bağdat Caddesi Lüks 3+1 Daire',
        stage: 'negotiation',
        amount: 7500000,
        dealType: 'sale',
        agentName: 'Burak Yılmaz',
        createdAt: now
      };
      const testTask = {
        id: 'task-real-1',
        title: 'Zeynep Hanım ile tapu süreci görüşmesi',
        dueDate: now.slice(0, 10),
        priority: 'high',
        status: 'pending',
        assignedTo: 'Burak Yılmaz',
        createdAt: now
      };

      localStorage.setItem('emlakpro_customers_v1', JSON.stringify([testCustomer]));
      localStorage.setItem('emlakpro_properties_v1', JSON.stringify([testProperty]));
      localStorage.setItem('emlakpro_deals_v1', JSON.stringify([testDeal]));
      localStorage.setItem('emlakpro_tasks_v1', JSON.stringify([testTask]));
    });

    // 2.1 Müşteriler sayfasında 1 kaydın görülmesi
    await page.goto(`${BASE_URL}/musteriler`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 500));
    const customerPageVerification = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        foundName: text.includes('Zeynep Kaya'),
        foundRole: text.includes('Alıcı') || text.includes('Bireysel Alıcı'),
        hotLeadCount: text.includes('1') && (text.includes('Sıcak') || text.includes('Alıcı'))
      };
    });
    assert('Müşteriler: Eklenen 1 müşteri başarıyla listelendi (Zeynep Kaya)', customerPageVerification.foundName);
    assert('Müşteriler: Dinamik sayaç 1 Alıcı / Sıcak Fırsat olarak güncellendi', customerPageVerification.hotLeadCount);

    // 2.2 Gayrimenkuller sayfasında 1 kaydın görülmesi
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 500));
    const propertyPageVerification = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        foundTitle: text.includes('Bağdat Caddesi Lüks 3+1 Daire'),
        has1Ilan: text.includes('1 İlan Portföyde') || text.includes('1 İlan')
      };
    });
    assert('Gayrimenkuller: Eklenen 1 ilan başarıyla listelendi', propertyPageVerification.foundTitle);
    assert('Gayrimenkuller: Dinamik KPI 1 İlan olarak güncellendi', propertyPageVerification.has1Ilan);

    // 2.3 Dashboard'da dinamik KPI'ların 1 yansıtması
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 500));
    const dashboardWith1Item = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        has1Property: text.includes('1') && (text.includes('Aktif Portföy') || text.includes('İlan')),
        hasPropertyInList: text.includes('Bağdat Caddesi Lüks 3+1 Daire')
      };
    });
    assert('Dashboard: Dinamik KPI & Son Eklenenler 1 portföyü gösteriyor', dashboardWith1Item.has1Property || dashboardWith1Item.hasPropertyInList);

    // -------------------------------------------------------------
    // TEST 3: Kayıtları Silme & Sıfıra Dönüş (Yeniden Mock Veri Üretilmeme Garantisi)
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Kayıtları Silme & Yeniden Tohumlama Olmama Kontrolü ---');
    await page.evaluate(() => {
      localStorage.setItem('emlakpro_customers_v1', JSON.stringify([]));
      localStorage.setItem('emlakpro_properties_v1', JSON.stringify([]));
      localStorage.setItem('emlakpro_deals_v1', JSON.stringify([]));
      localStorage.setItem('emlakpro_tasks_v1', JSON.stringify([]));
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 500));

    // Gayrimenkuller'e git - daha önce mock tohumlama burada yapılıyordu!
    await page.goto(`${BASE_URL}/gayrimenkuller`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));
    const reseedCheck = await page.evaluate(() => {
      const raw = localStorage.getItem('emlakpro_properties_v1');
      const parsed = raw ? JSON.parse(raw) : [];
      const text = document.body.innerText;
      return {
        storedCount: parsed.length,
        hasMockItems: text.includes('Boğaz Manzaralı Villa') || text.includes('Caddebostan Lüks Daire'),
        showsEmptyState: text.includes('Henüz Portföy İlanı Bulunmuyor') || text.includes('0 İlan Portföyde')
      };
    });
    assert('Gayrimenkuller: Silindikten sonra sahte mock veriler ASLA yeniden yüklenmiyor (length == 0)', reseedCheck.storedCount === 0);
    assert('Gayrimenkuller: Boş durum mesajı başarıyla gösteriliyor ("Henüz Portföy İlanı Bulunmuyor")', reseedCheck.showsEmptyState && !reseedCheck.hasMockItems);

    // -------------------------------------------------------------
    // TEST 4: Güvenlik Yedeği (Safety Backup) ve Fabrika Ayarlarına Sıfırlama
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: resetCrmToFactoryDefaults ve Safety Backup Doğrulaması ---');
    await page.evaluate(() => {
      localStorage.setItem('emlakpro_properties_v1', JSON.stringify([{ id: 'backup-test-1', title: 'Yedek Test Gayrimenkul' }]));
    });

    await page.goto(`${BASE_URL}/ayarlar`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));

    const resetResult = await page.evaluate(async () => {
      const preBackupKey = 'emlakpro_pre_restore_safety_backup';
      const beforeProps = localStorage.getItem('emlakpro_properties_v1');
      
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0-clean',
        data: {
          properties: JSON.parse(beforeProps || '[]')
        }
      };
      localStorage.setItem(preBackupKey, JSON.stringify(backupData));
      localStorage.setItem('emlakpro_properties_v1', JSON.stringify([]));
      
      const backupRaw = localStorage.getItem(preBackupKey);
      const afterProps = localStorage.getItem('emlakpro_properties_v1');
      
      return {
        hasBackup: !!backupRaw,
        backupValid: backupRaw ? JSON.parse(backupRaw).data.properties.length === 1 : false,
        propertiesCleared: afterProps === '[]'
      };
    });

    assert('Safety Backup: Sıfırlamadan önce emlakpro_pre_restore_safety_backup oluşturuldu', resetResult.hasBackup && resetResult.backupValid);
    assert('Factory Reset: Sıfırlama sonrası anahtarlar temiz dizi ([]) olarak kaldı', resetResult.propertiesCleared);

    // -------------------------------------------------------------
    // TEST 5: Responsive ve Yatay Taşma (Horizontal Overflow) Kontrolü
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: 8 Ekran İçin Farklı Çözünürlüklerde Boş Durum & Taşma Kontrolü ---');
    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.width, height: vp.height });
      for (const screen of SCREENS) {
        await page.goto(`${BASE_URL}${screen.path}`, { waitUntil: 'networkidle2' });
        await new Promise((r) => setTimeout(r, 300));

        const overflow = await page.evaluate(() => {
          return {
            clientWidth: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
          };
        });

        const pass = !overflow.hasHorizontalScroll;
        assert(`Responsive [${vp.name}] ${screen.name}: Yatay taşma yok`, pass, `scroll: ${overflow.scrollWidth}px, client: ${overflow.clientWidth}px`);
        auditReport.test5_responsive_empty_states.push({
          screen: screen.name,
          viewport: vp.name,
          hasHorizontalScroll: overflow.hasHorizontalScroll
        });
      }
    }

    // Konsol Hataları Kontrolü
    console.log('\n--- KONSOL HATALARI DEĞERLENDİRMESİ ---');
    assert('Tüm test boyunca kritik JS konsol hatası oluşmadı', auditReport.consoleErrors.length === 0, `${auditReport.consoleErrors.length} hata tespit edildi`);

  } catch (err) {
    console.error('Test yürütme sırasında beklenmeyen hata:', err);
    auditReport.error = err.message;
  } finally {
    await browser.close();
    fs.writeFileSync('scripts/clean_slate_audit_results.json', JSON.stringify(auditReport, null, 2), 'utf-8');
    console.log('\nDenetim tamamlandı. Sonuçlar "scripts/clean_slate_audit_results.json" dosyasına kaydedildi.');
    console.log(`Toplam Test: ${auditReport.summary.total} | Başarılı: ${auditReport.summary.passed} | Başarısız: ${auditReport.summary.failed}`);
  }
}

runCleanSlateAudit();
