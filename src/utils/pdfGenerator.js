/**
 * Generates and downloads a real, beautifully formatted PDF property presentation brochure.
 * Dynamically loads jsPDF on demand to keep initial page bundles lightweight (Aşama 3.3).
 * @param {Object} property
 */
export async function generatePropertyPdf(property) {
  if (!property) return;

  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Colors
  const primaryNavy = [0, 15, 63];
  const accentBlue = [0, 88, 190];
  const textDark = [19, 27, 46];
  const textMuted = [80, 85, 100];
  const bgLight = [242, 243, 255];
  const borderLight = [218, 226, 253];

  // 1. Header Bar
  doc.setFillColor(...primaryNavy);
  doc.rect(0, 0, 210, 28, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('EmlakPro Prime', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(218, 226, 253);
  doc.text('Kadikoy Merkez Sube | Profesyonel Gayrimenkul Portfoy Sunumu', 14, 22);

  // Property ID Tag (top right)
  doc.setFillColor(...accentBlue);
  doc.roundedRect(155, 8, 41, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(property.id || 'PORT-XXXX', 160, 16);

  // 2. Headline & Price Section
  let y = 40;

  // Type & Status Pill
  doc.setFillColor(...bgLight);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(14, y - 5, 45, 8, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...accentBlue);
  doc.text(`${property.type || 'Satilik'} ${property.category || 'Konut'}`, 17, y);

  if (property.tags && property.tags[1]) {
    doc.setFillColor(255, 240, 230);
    doc.roundedRect(63, y - 5, 38, 8, 1.5, 1.5, 'F');
    doc.setTextColor(200, 80, 20);
    doc.text(property.tags[1], 66, y);
  }

  y += 12;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...primaryNavy);
  const titleLines = doc.splitTextToSize(property.title || 'Luks Gayrimenkul Portfoyu', 180);
  doc.text(titleLines, 14, y);
  y += titleLines.length * 7 + 2;

  // Price box
  doc.setFillColor(...bgLight);
  doc.roundedRect(14, y, 182, 18, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primaryNavy);
  doc.text(property.priceFormatted || 'Fiyat Belirtilmedi', 20, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...textMuted);
  doc.text(`Birim Fiyat: ${property.unitPrice || '-'} | Pazarlik payi mevcut`, 110, y + 12);

  y += 26;

  // 3. Location Box
  doc.setDrawColor(...borderLight);
  doc.roundedRect(14, y, 182, 14, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...accentBlue);
  doc.text('Konum:', 20, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textDark);
  doc.text(`${property.location || property.district || 'Istanbul'} - Kadikoy & Anadolu Yakasi Portfoyu`, 42, y + 9);

  y += 22;

  // 4. Specifications Matrix (Table of 6 items)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryNavy);
  doc.text('Gayrimenkul Teknik Detaylari ve Ozellikleri', 14, y);
  y += 6;

  const specs = [
    { label: 'Net Alan', val: property.netArea ? `${property.netArea} m2` : property.area || '-' },
    { label: 'Brut Alan', val: property.grossArea ? `${property.grossArea} m2` : '-' },
    { label: 'Oda Sayisi', val: property.rooms || '-' },
    { label: 'Bulundugu Kat', val: property.floorDetails || property.floor || '-' },
    { label: 'Bina Yasi', val: property.buildingAge || '-' },
    { label: 'Tapu Durumu', val: property.deedStatus || '-' },
    { label: 'Kredi Uygunlugu', val: property.loanEligibility || 'Tam Uygun' },
    { label: 'Yetki Sozlesmesi', val: property.contract?.status || 'Aktif Tek Yetkili' },
  ];

  const colWidth = 44;
  const rowHeight = 16;
  const startX = 14;

  specs.forEach((spec, idx) => {
    const colIndex = idx % 4;
    const rowIndex = Math.floor(idx / 4);
    const boxX = startX + colIndex * (colWidth + 2);
    const boxY = y + rowIndex * (rowHeight + 2);

    doc.setFillColor(250, 250, 255);
    doc.setDrawColor(...borderLight);
    doc.roundedRect(boxX, boxY, colWidth, rowHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text(spec.label, boxX + 3, boxY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...primaryNavy);
    doc.text(String(spec.val), boxX + 3, boxY + 11);
  });

  y += 42;

  // 5. Portals & CRM Matching
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryNavy);
  doc.text('Pazarlama & Eslestirme Durumu', 14, y);
  y += 6;

  doc.setFillColor(...bgLight);
  doc.roundedRect(14, y, 182, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textDark);
  doc.text(`* CRM Eslestirme: ${property.matchedLabel || `${property.matchedCount || 4} Sicak Alici Talebi Eslesmis Durumda`}`, 20, y + 7);
  doc.text('* Portal Senkronizasyonu: Sahibinden.com (Yayinda) ve Hepsiemlak (Yayinda)', 20, y + 14);

  y += 30;

  // 6. Advisor & Contact Box
  doc.setFillColor(...primaryNavy);
  doc.roundedRect(14, y, 182, 36, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('Yetkili Portfoy Danismani', 20, y + 10);

  doc.setFontSize(14);
  doc.text(property.advisor?.name || 'Burak Yilmaz', 20, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(218, 226, 253);
  doc.text(`${property.advisor?.title || 'Kidemli Danisman'} | Tel: +90 (532) 411 90 12 | E-posta: info@emlakpro.com`, 20, y + 25);
  doc.text('Adres: Bagdat Caddesi No: 244 Kadikoy / Istanbul', 20, y + 31);

  // 7. Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  const now = new Date();
  const dateStr = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR');
  doc.text(`Olusturulma Tarihi: ${dateStr} | EmlakPro Modern Real Estate OS`, 14, pageHeight - 8);
  doc.text('Sayfa 1 / 1', 185, pageHeight - 8);

  // Trigger real browser download
  const cleanId = (property.id || 'PORTFOY').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${cleanId}_EmlakPro_Sunum.pdf`);
}

