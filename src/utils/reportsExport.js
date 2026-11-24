/**
 * Utility functions for exporting reports in CSV, Excel, and PDF formats.
 */

// Helper to format currency in Turkish style
export function formatCurrencyTr(val) {
  if (typeof val !== 'number') return val;
  return '₺' + val.toLocaleString('tr-TR');
}

// Normalize KPI data whether it's an object or an array
function getKpiList(kpiData) {
  if (!kpiData) return [];
  if (Array.isArray(kpiData)) return kpiData;
  return Object.values(kpiData).filter(Boolean);
}

/**
 * Export data to CSV with UTF-8 BOM for Microsoft Excel Turkish compatibility
 */
export function exportReportsCsv({ periodLabel, consultantLabel, kpiData, consultantLeaderboard, recentTransactions }) {
  const now = new Date().toLocaleDateString('tr-TR');
  const bom = '\uFEFF';
  let csv = bom;
  const kpiList = getKpiList(kpiData);

  // Header
  csv += 'EMLAKPRO REAL ESTATE CRM - PERFORMANS VE ANALİTİK RAPORU\r\n';
  csv += `Rapor Tarihi:;${now}\r\n`;
  csv += `Dönem:;${periodLabel || 'Son 30 Gün'}\r\n`;
  csv += `Danışman Filtresi:;${consultantLabel || 'Tüm Danışmanlar'}\r\n\r\n`;

  // KPI Section
  csv += '--- TEMEL PERFORMANS GÖSTERGELERİ (KPI) ---\r\n';
  csv += 'Metrik;Değer;Değişim;Hedef Başarısı;Açıklama\r\n';
  if (kpiList && kpiList.length > 0) {
    kpiList.forEach(item => {
      csv += `"${item.title}";"${item.value}";"${item.change}";"%${item.targetPercent || 100}";"${item.description}"\r\n`;
    });
  }
  csv += '\r\n';

  // Consultant Leaderboard Section
  csv += '--- DANIŞMAN PERFORMANS TABLOSU ---\r\n';
  csv += 'Sıra;Danışman;Rol;Kazanılan İşlem;Toplam Ciro;Hizmet Bedeli;Dönüşüm Oranı;Kota Durumu\r\n';
  if (consultantLeaderboard && consultantLeaderboard.length > 0) {
    consultantLeaderboard.forEach((c, idx) => {
      const deals = c.dealsCount ?? c.dealsWon ?? 0;
      const quota = c.quotaRate ?? c.quotaProgress ?? 100;
      csv += `${idx + 1};"${c.name}";"${c.role}";${deals};"${formatCurrencyTr(c.salesVolume)}";"${formatCurrencyTr(c.commission)}";"%${c.conversionRate}";"%${quota}"\r\n`;
    });
  }
  csv += '\r\n';

  // Recent Transactions Section
  csv += '--- SON GERÇEKLEŞEN İŞLEMLER ---\r\n';
  csv += 'İşlem Kodu;İşlem Tipi;Müşteri;Gayrimenkul;Danışman;İşlem Tutarı;Tarih;Durum\r\n';
  if (recentTransactions && recentTransactions.length > 0) {
    recentTransactions.forEach(t => {
      const typeStr = t.type || (t.isSale ? 'Satış' : 'Kiralama');
      const consultantStr = t.advisorName || t.consultant || '';
      csv += `"${t.code || t.id}";"${typeStr}";"${t.clientName}";"${t.propertyTitle}";"${consultantStr}";"${formatCurrencyTr(t.amount)}";"${t.date}";"${t.status}"\r\n`;
    });
  } else {
    csv += '"Seçili filtrelere uygun tamamlanmış işlem bulunamadı";"";"";"";"";"";"";""\r\n';
  }

  // Trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `EmlakPro_Performans_Raporu_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export to Excel format (.xls HTML table)
 */
export function exportReportsExcel({ periodLabel, consultantLabel, kpiData, consultantLeaderboard, recentTransactions }) {
  const now = new Date().toLocaleDateString('tr-TR');
  const kpiList = getKpiList(kpiData);

  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th { background-color: #001e4a; color: #ffffff; font-weight: bold; padding: 8px 12px; border: 1px solid #c0c6dc; text-align: left; }
        td { padding: 6px 12px; border: 1px solid #e1e3ea; }
        .title { font-size: 16pt; font-weight: bold; color: #001e4a; }
        .subtitle { font-size: 11pt; color: #43474e; margin-bottom: 15px; }
        .section-header { font-size: 13pt; font-weight: bold; color: #00458f; margin-top: 15px; margin-bottom: 5px; }
        .highlight { background-color: #eaf1fb; font-weight: bold; }
        .text-right { text-align: right; }
      </style>
    </head>
    <body>
      <div class="title">EmlakPro Real Estate CRM - Performans & Analitik Raporu</div>
      <div class="subtitle">Tarih: ${now} | Dönem: ${periodLabel || 'Tüm Zamanlar'} | Danışman: ${consultantLabel || 'Tüm Danışmanlar'} | Biçim: Elektronik Tablo (.xls - HTML tabanlı tablo)</div>

      <div class="section-header">1. Temel Performans Göstergeleri (KPI)</div>
      <table>
        <thead>
          <tr>
            <th>Metrik</th>
            <th>Değer</th>
            <th>Dönemsel Değişim</th>
            <th>Hedef Oranı</th>
            <th>Açıklama</th>
          </tr>
        </thead>
        <tbody>
          ${(kpiList || []).map(k => `
            <tr>
              <td><b>${k.title}</b></td>
              <td class="text-right"><b>${k.value}</b></td>
              <td>${k.change}</td>
              <td class="text-right">%${k.targetPercent || 100}</td>
              <td>${k.description}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="section-header">2. Danışman Başarı ve Ciro Sıralaması</div>
      <table>
        <thead>
          <tr>
            <th>Sıra</th>
            <th>Danışman</th>
            <th>Ünvan</th>
            <th>Kazanılan İşlem</th>
            <th>Toplam Hacim (GDV)</th>
            <th>Hizmet Bedeli Geliri</th>
            <th>Dönüşüm Oranı</th>
            <th>Hedef Gerçekleşme</th>
          </tr>
        </thead>
        <tbody>
          ${(consultantLeaderboard || []).map((c, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td><b>${c.name}</b></td>
              <td>${c.role}</td>
              <td class="text-right">${c.dealsCount ?? c.dealsWon ?? 0}</td>
              <td class="text-right">${formatCurrencyTr(c.salesVolume)}</td>
              <td class="text-right highlight">${formatCurrencyTr(c.commission)}</td>
              <td class="text-right">%${c.conversionRate}</td>
              <td class="text-right">%${c.quotaRate ?? c.quotaProgress ?? 100}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="section-header">3. Son Gerçekleşen İşlemler</div>
      <table>
        <thead>
          <tr>
            <th>İşlem ID</th>
            <th>Tür</th>
            <th>Müşteri</th>
            <th>Gayrimenkul Başlığı</th>
            <th>Danışman</th>
            <th>İşlem Tutarı</th>
            <th>Tarih</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          ${(recentTransactions && recentTransactions.length > 0) ? recentTransactions.map(t => `
            <tr>
              <td>${t.code || t.id}</td>
              <td>${t.type || (t.isSale ? 'Satış' : 'Kiralama')}</td>
              <td><b>${t.clientName}</b></td>
              <td>${t.propertyTitle}</td>
              <td>${t.advisorName || t.consultant || ''}</td>
              <td class="text-right"><b>${formatCurrencyTr(t.amount)}</b></td>
              <td>${t.date}</td>
              <td>${t.status}</td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="8" style="text-align:center; padding: 15px; color: #888;">Seçili filtrelere uygun tamamlanmış işlem kaydı bulunamadı.</td>
            </tr>
          `}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `EmlakPro_Performans_Raporu_${new Date().toISOString().slice(0, 10)}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export to PDF using jsPDF.
 * Dynamically loads jsPDF on demand to keep initial page bundles lightweight (Aşama 3.3).
 */
export async function exportReportsPdf({ periodLabel, consultantLabel, kpiData, consultantLeaderboard, recentTransactions }) {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const kpiList = getKpiList(kpiData);

  const navy = [0, 30, 74];
  const blue = [0, 93, 190];
  const darkText = [20, 27, 45];
  const grayText = [90, 95, 110];
  const bgLight = [245, 247, 252];

  // Header Banner
  doc.setFillColor(...navy);
  doc.rect(0, 0, 210, 26, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('EmlakPro - Performans & Finansal Raporu', 14, 13);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(200, 215, 245);
  const now = new Date().toLocaleDateString('tr-TR');
  doc.text(`Rapor Tarihi: ${now}  |  Donem: ${periodLabel || 'Son 30 Gun'}  |  Filtre: ${consultantLabel || 'Tum Danismanlar'}`, 14, 20);

  let y = 34;

  // Section 1: KPI Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...navy);
  doc.text('1. Temel Performans Gostergeleri (KPI)', 14, y);
  y += 6;

  // KPI Boxes (5 columns)
  const boxWidth = 35;
  const boxHeight = 18;
  const startX = 14;

  if (kpiList && kpiList.length > 0) {
    kpiList.slice(0, 5).forEach((kpi, i) => {
      const bx = startX + (i * 36.5);
      doc.setFillColor(...bgLight);
      doc.roundedRect(bx, y, boxWidth, boxHeight, 2, 2, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...grayText);
      // Clean Turkish chars for standard helvetica
      const cleanTitle = cleanAscii(kpi.title);
      doc.text(cleanTitle.substring(0, 18), bx + 2.5, y + 5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...darkText);
      const cleanVal = cleanAscii(kpi.value);
      doc.text(cleanVal, bx + 2.5, y + 11);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...blue);
      doc.text(cleanAscii(kpi.change), bx + 2.5, y + 15.5);
    });
    y += boxHeight + 8;
  }

  // Section 2: Consultant Leaderboard
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...navy);
  doc.text('2. Danisman Performans Siralamasi', 14, y);
  y += 5;

  // Table Header
  doc.setFillColor(...blue);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Sira', 16, y + 4.8);
  doc.text('Danisman', 28, y + 4.8);
  doc.text('Rol', 68, y + 4.8);
  doc.text('Islem', 105, y + 4.8);
  doc.text('Satis Hacmi', 125, y + 4.8);
  doc.text('Komisyon', 155, y + 4.8);
  doc.text('Donusum', 182, y + 4.8);
  y += 7;

  // Table Rows
  if (consultantLeaderboard && consultantLeaderboard.length > 0) {
    consultantLeaderboard.slice(0, 5).forEach((c, idx) => {
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 249, idx % 2 === 0 ? 255 : 252);
      doc.rect(14, y, 182, 6.5, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...darkText);
      doc.text(`${idx + 1}`, 18, y + 4.5);
      doc.setFont('helvetica', 'bold');
      doc.text(cleanAscii(c.name), 28, y + 4.5);
      doc.setFont('helvetica', 'normal');
      doc.text(cleanAscii(c.role), 68, y + 4.5);
      doc.text(`${c.dealsCount ?? c.dealsWon ?? 0}`, 108, y + 4.5);
      doc.text(cleanAscii(formatCurrencyTr(c.salesVolume)), 125, y + 4.5);
      doc.setTextColor(...blue);
      doc.setFont('helvetica', 'bold');
      doc.text(cleanAscii(formatCurrencyTr(c.commission)), 155, y + 4.5);
      doc.setTextColor(...darkText);
      doc.setFont('helvetica', 'normal');
      doc.text(`%${c.conversionRate}`, 185, y + 4.5);
      y += 6.5;
    });
    y += 8;
  }

  // Section 3: Recent Transactions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...navy);
  doc.text('3. Son Gerceklesen Islemler', 14, y);
  y += 5;

  // Table Header
  doc.setFillColor(...navy);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Islem ID', 16, y + 4.8);
  doc.text('Tip', 36, y + 4.8);
  doc.text('Musteri', 54, y + 4.8);
  doc.text('Gayrimenkul', 92, y + 4.8);
  doc.text('Danisman', 138, y + 4.8);
  doc.text('Tutar', 170, y + 4.8);
  y += 7;

  // Transactions Rows
  if (recentTransactions && recentTransactions.length > 0) {
    recentTransactions.slice(0, 8).forEach((t, idx) => {
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 249, idx % 2 === 0 ? 255 : 252);
      doc.rect(14, y, 182, 6.5, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...darkText);
      doc.text(t.code || t.id, 16, y + 4.5);
      doc.text(cleanAscii(t.type || (t.isSale ? 'Satis' : 'Kiralama')), 36, y + 4.5);
      doc.setFont('helvetica', 'bold');
      doc.text(cleanAscii(t.clientName).substring(0, 18), 54, y + 4.5);
      doc.setFont('helvetica', 'normal');
      doc.text(cleanAscii(t.propertyTitle).substring(0, 24), 92, y + 4.5);
      doc.text(cleanAscii(t.advisorName || t.consultant || ''), 138, y + 4.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...blue);
      doc.text(cleanAscii(formatCurrencyTr(t.amount)), 170, y + 4.5);
      y += 6.5;
    });
  } else {
    doc.setFillColor(248, 249, 252);
    doc.rect(14, y, 182, 10, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...grayText);
    doc.text('Secili filtrelere uygun tamamlanmis islem kaydi bulunamadi.', 16, y + 6.5);
    y += 10;
  }

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...grayText);
  doc.text('EmlakPro Real Estate CRM  *  Rapor ve Performans Analitigi Modulu', 14, 287);
  doc.text('Sayfa 1 / 1', 185, 287);

  // Save
  doc.save(`EmlakPro_Performans_Raporu_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// Helper to convert Turkish special characters to standard Latin for standard PDF fonts
function cleanAscii(str) {
  if (!str) return '';
  return String(str)
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
    .replace(/₺/g, 'TL ');
}
