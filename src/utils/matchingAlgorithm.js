/**
 * EmlakPro Akıllı Portföy & Talep Eşleştirme Motoru
 * Kural ve kriter bazlı, açıklanabilir algoritmik eşleştirme motoru.
 */

/**
 * Belirli bir müşteri talebi ile portföydeki gayrimenkulü kıyaslar ve 0-100 arasında detaylı skor üretir.
 * @param {Object} demand - Müşteri talebi
 * @param {Object} property - Portföy ilanı
 * @returns {Object} { totalScore, subScores: { budget, location, roomsArea, typeSpecs }, matchReason, statusBadge }
 */
export function calculateMatchScore(demand, property) {
  if (!demand || !property) {
    return { totalScore: 0, subScores: { budget: 0, location: 0, roomsArea: 0, typeSpecs: 0 }, matchReason: '' };
  }

  // 1. İşlem Türü Kontrolü (Satılık / Kiralık) - Sert Kriter
  const isTypeMatch =
    (demand.type === 'Satılık' || demand.role === 'Satın Alma' || demand.role === 'Satılık')
      ? property.type === 'Satılık'
      : (demand.type === 'Kiralık' || demand.role === 'Kiralama' || demand.role === 'Kiralık')
      ? property.type === 'Kiralık'
      : true;

  if (!isTypeMatch) {
    // İşlem tipi uyuşmuyorsa skor sıfırlanır (Satılık arayana Kiralık önerilmez)
    return {
      totalScore: 0,
      subScores: { budget: 0, location: 0, roomsArea: 0, typeSpecs: 0 },
      matchReason: 'İşlem türü uyuşmuyor (Satılık / Kiralık ayrımı).',
      statusBadge: 'Uyumsuz',
    };
  }

  // 2. Bütçe Uyumu (Ağırlık: %30)
  let budgetScore = 100;
  const propPrice = property.price || 0;
  const minBudget = demand.minBudget || demand.budgetMin || 0;
  const maxBudget = demand.maxBudget || demand.budgetMax || Infinity;

  if (propPrice > 0 && maxBudget !== Infinity) {
    if (propPrice <= maxBudget && (minBudget === 0 || propPrice >= minBudget * 0.8)) {
      budgetScore = 100; // Tam bütçe dahilinde
    } else if (propPrice > maxBudget && propPrice <= maxBudget * 1.1) {
      budgetScore = 80; // %10'a kadar esneme payında
    } else if (propPrice > maxBudget * 1.1 && propPrice <= maxBudget * 1.25) {
      budgetScore = 55; // %25'e kadar esneme payında
    } else if (propPrice < minBudget * 0.8) {
      budgetScore = 75; // Bütçenin oldukça altında (fırsat olabilir)
    } else {
      budgetScore = 20; // Bütçenin çok üzerinde
    }
  }

  // 3. Lokasyon & Bölge Uyumu (Ağırlık: %25)
  let locationScore = 40;
  const targetRegion = (demand.targetRegion || demand.district || demand.city || '').toLowerCase();
  const propLocation = (property.location || '').toLowerCase();
  const propDistrict = (property.district || '').toLowerCase();
  const propNeighborhood = (property.neighborhood || '').toLowerCase();

  if (targetRegion) {
    if (
      (propNeighborhood && targetRegion.includes(propNeighborhood)) ||
      (propDistrict && targetRegion.includes(propDistrict)) ||
      (propLocation && targetRegion.includes(propLocation))
    ) {
      locationScore = 100; // Birebir aynı semt / ilçe
    } else if (targetRegion.includes('kadıköy') && propLocation.includes('kadıköy')) {
      locationScore = 100;
    } else if (targetRegion.includes('beşiktaş') && (propLocation.includes('beşiktaş') || propLocation.includes('levent'))) {
      locationScore = 100;
    } else if (targetRegion.includes('beykoz') && propLocation.includes('beykoz')) {
      locationScore = 100;
    } else if (targetRegion.includes('anadolu') && (propDistrict.includes('kadıköy') || propDistrict.includes('üsküdar') || propDistrict.includes('ataşehir'))) {
      locationScore = 85;
    } else {
      locationScore = 50; // Aynı şehir / alternatif bölge
    }
  }

  // 4. Mülk Tipi ve Nitelik Uyumu (Ağırlık: %25)
  let typeScore = 60;
  const demandCategory = (demand.category || demand.propertyType || '').toLowerCase();
  const propCategory = (property.category || '').toLowerCase();

  if (demandCategory) {
    if (demandCategory.includes('daire') && propCategory.includes('daire')) typeScore = 100;
    else if (demandCategory.includes('penthouse') && (propCategory.includes('daire') || property.title.toLowerCase().includes('penthouse'))) typeScore = 100;
    else if (demandCategory.includes('villa') && propCategory.includes('villa')) typeScore = 100;
    else if (demandCategory.includes('ofis') && (propCategory.includes('ofis') || propCategory.includes('ticari'))) typeScore = 100;
    else if (demandCategory.includes('arsa') && propCategory.includes('arsa')) typeScore = 100;
    else if (propCategory.includes(demandCategory)) typeScore = 95;
    else typeScore = 50;
  }

  // 5. Metrekare ve Oda Sayısı Uyumu (Ağırlık: %20)
  let roomsAreaScore = 75;
  const demandRooms = (demand.rooms || demand.propertyType || '').toLowerCase();
  const propRooms = (property.rooms || '').toLowerCase();

  if (demandRooms && propRooms) {
    if (demandRooms.includes('3+1') && propRooms.includes('3+1')) roomsAreaScore += 15;
    else if (demandRooms.includes('4+1') && propRooms.includes('4+1')) roomsAreaScore += 15;
    else if (demandRooms.includes('2+1') && propRooms.includes('2+1')) roomsAreaScore += 15;
    else if (demandRooms.includes('5+2') && propRooms.includes('5+2')) roomsAreaScore += 15;
    else roomsAreaScore -= 10;
  }

  const propArea = property.netArea || 0;
  const minArea = demand.minArea || 0;
  if (propArea > 0 && minArea > 0) {
    if (propArea >= minArea) roomsAreaScore = Math.min(100, roomsAreaScore + 10);
    else roomsAreaScore = Math.max(30, roomsAreaScore - 20);
  }

  // Toplam Ağırlıklı Skor Hesaplama (0 - 100)
  const weightedScore = Math.round(
    budgetScore * 0.30 +
    locationScore * 0.25 +
    typeScore * 0.25 +
    roomsAreaScore * 0.20
  );

  const totalScore = Math.min(100, Math.max(0, weightedScore));

  // Açıklanabilir Neden & Etiket Üretimi
  let statusBadge = 'Bütçeye Uygun';
  if (budgetScore === 100) statusBadge = 'Bütçeye Tam Uygun';
  else if (propPrice > maxBudget) statusBadge = 'Bütçe Tavanında';
  else if (propPrice < minBudget) statusBadge = 'Fırsat Fiyat';

  let matchReason = '';
  if (totalScore >= 90) {
    matchReason = `Aranan ${property.district} lokasyonu, ${property.rooms} oda düzeni ve bütçe kriterleriyle yüksek oranda örtüşüyor.`;
  } else if (totalScore >= 75) {
    matchReason = `Bölge ve mülk tipi beklentileri karşılıyor, bütçe esneme aralığında değerlendirilebilir.`;
  } else {
    matchReason = `Kısmi kriter uyumu (alternatif portföy olarak incelenebilir).`;
  }

  return {
    totalScore,
    subScores: {
      budget: budgetScore,
      location: locationScore,
      roomsArea: Math.min(100, roomsAreaScore),
      typeSpecs: typeScore,
    },
    matchReason,
    statusBadge,
  };
}

/**
 * Belirli bir talep için tüm portföy listesini puanlar ve en yüksek skordan en düşüğe doğru sıralar.
 * @param {Object} demand
 * @param {Array} properties
 * @param {number} minThreshold - Minimum gösterilme eşiği (varsayılan: 60)
 * @returns {Array} Eşleşen portföyler
 */
export function matchPropertiesForDemand(demand, properties = [], minThreshold = 60) {
  if (!demand || !properties || properties.length === 0) return [];

  const results = properties
    .map((prop) => {
      const match = calculateMatchScore(demand, prop);
      return {
        ...prop,
        matchScore: match.totalScore,
        matchScoreBadge: `%${match.totalScore} Uyum`,
        subScores: match.subScores,
        statusBadge: match.statusBadge,
        matchReason: match.matchReason,
      };
    })
    .filter((item) => item.matchScore >= minThreshold)
    .sort((a, b) => b.matchScore - a.matchScore);

  return results;
}

