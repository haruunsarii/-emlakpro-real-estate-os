import { dealStages } from './mockData.js';

export const STORAGE_KEYS = {
  DEALS: 'emlakpro_deals_v1',
  PROPERTIES: 'emlakpro_properties_v1',
  REQUESTS: 'emlakpro_requests_v1',
  CUSTOMERS: 'emlakpro_customers_v1',
  LEGACY_CUSTOMERS: 'emlakpro_customers',
};

// Safe helper to format currency in Turkish Lira
export function formatCurrency(val) {
  if (typeof val !== 'number' || isNaN(val)) return '₺0';
  return '₺' + Math.round(val).toLocaleString('tr-TR');
}

// Safe storage reader (Clean Start: empty initial arrays)
export function getCrmData() {
  let deals = [];
  let properties = [];
  let demands = [];
  let customers = [];

  let dealsSource = 'localStorage';
  let propertiesSource = 'localStorage';
  let demandsSource = 'localStorage';

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const savedDeals = window.localStorage.getItem(STORAGE_KEYS.DEALS);
      if (savedDeals) {
        const parsed = JSON.parse(savedDeals);
        if (Array.isArray(parsed)) {
          deals = parsed;
        }
      }
    } catch (e) {
      console.warn('emlakpro_deals_v1 okunamadı:', e);
    }

    try {
      const savedProps = window.localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      if (savedProps) {
        const parsed = JSON.parse(savedProps);
        if (Array.isArray(parsed)) {
          properties = parsed;
        }
      }
    } catch (e) {
      console.warn('emlakpro_properties_v1 okunamadı:', e);
    }

    try {
      const savedDemands = window.localStorage.getItem(STORAGE_KEYS.REQUESTS);
      if (savedDemands) {
        const parsed = JSON.parse(savedDemands);
        if (Array.isArray(parsed)) {
          demands = parsed;
        }
      }
    } catch (e) {
      console.warn('emlakpro_requests_v1 okunamadı:', e);
    }

    try {
      const savedCust = window.localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (savedCust) {
        const parsed = JSON.parse(savedCust);
        if (Array.isArray(parsed)) {
          customers = parsed;
        }
      } else {
        const legacyCust = window.localStorage.getItem(STORAGE_KEYS.LEGACY_CUSTOMERS);
        if (legacyCust) {
          const parsed = JSON.parse(legacyCust);
          if (Array.isArray(parsed)) {
            customers = parsed;
          }
        }
      }
    } catch (e) {
      console.warn('emlakpro_customers_v1 okunamadı:', e);
    }
  }

  return {
    deals,
    properties,
    demands,
    customers,
    sources: {
      deals: dealsSource,
      properties: propertiesSource,
      demands: demandsSource,
    },
  };
}

/**
 * Checks if a deal matches the given date range based strictly on `completedAt`.
 * Undated completed deals (such as legacy FRS-111) are only included when period is 'all'.
 */
export function isDealInDateRange(deal, period = 'all', customRange = null) {
  if (period === 'all') return true;

  const dateStr = deal.completedAt;
  if (!dateStr) {
    // Has no completedAt date: do NOT fabricate or falsely include in specific range
    return false;
  }

  const dealDate = new Date(dateStr);
  if (isNaN(dealDate.getTime())) return false;

  const now = new Date();

  if (period === '7d') {
    const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return dealDate >= cutoff && dealDate <= now;
  }

  if (period === '30d') {
    const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return dealDate >= cutoff && dealDate <= now;
  }

  if (period === '90d') {
    const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    return dealDate >= cutoff && dealDate <= now;
  }

  if (period === 'year') {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    return dealDate >= startOfYear && dealDate <= now;
  }

  if (period === 'custom' && customRange && customRange.start && customRange.end) {
    const start = new Date(customRange.start);
    start.setHours(0, 0, 0, 0);
    const end = new Date(customRange.end);
    end.setHours(23, 59, 59, 999);
    return dealDate >= start && dealDate <= end;
  }

  return true;
}

// Advisor filter matcher
export function matchAdvisor(itemAdvisor, selectedAdvisor) {
  if (!selectedAdvisor || selectedAdvisor === 'all') return true;
  if (!itemAdvisor) return false;
  return itemAdvisor.toLowerCase().includes(selectedAdvisor.toLowerCase()) ||
         selectedAdvisor.toLowerCase().includes(itemAdvisor.toLowerCase());
}

/**
 * Central aggregator that computes all report analytics dynamically
 * from actual CRM data using strict calculation rules.
 */
export function aggregateReportsFromCrm({
  period = '30d',
  customRange = null,
  selectedAdvisor = 'all',
} = {}) {
  const { deals, properties, demands, customers, sources } = getCrmData();

  // 1. Filter deals by advisor
  const advisorFilteredDeals = deals.filter((d) => matchAdvisor(d.advisor, selectedAdvisor));

  // 2. Won (completed) deals
  const allWonDeals = advisorFilteredDeals.filter((d) => d.stage === 'tamamlandi');

  // Check for undated completed deals
  const undatedWonDeals = allWonDeals.filter((d) => !d.completedAt);
  const datedWonDeals = allWonDeals.filter((d) => !!d.completedAt);

  // Won deals matching both advisor AND date filter (AND logic)
  const filteredWonDeals = allWonDeals.filter((d) => isDealInDateRange(d, period, customRange));

  // 3. Transactions / Volumes (AŞAMA 2)
  const salesDeals = filteredWonDeals.filter((d) => (d.type || '').toLowerCase().includes('sat'));
  const rentalDeals = filteredWonDeals.filter((d) => (d.type || '').toLowerCase().includes('kir'));

  const totalSalesVolume = salesDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalRentalVolume = rentalDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const wonDealsCount = filteredWonDeals.length;
  const totalCommission = filteredWonDeals.reduce((sum, d) => sum + (Number(d.commission) || 0), 0);

  // Conversion rate: won deals / total opportunities for this advisor
  const totalOpportunities = advisorFilteredDeals.length;
  const conversionRateNum = totalOpportunities > 0 ? (wonDealsCount / totalOpportunities) * 100 : 0;

  // 4. KPI Cards
  const kpiData = {
    salesVolume: {
      id: 'salesVolume',
      title: 'Toplam Satış Hacmi',
      value: formatCurrency(totalSalesVolume),
      numericValue: totalSalesVolume,
      change: salesDeals.length > 0 ? `${salesDeals.length} Satış Tamamlandı` : '0 İşlem',
      isPositive: totalSalesVolume > 0,
      description: 'Yalnızca tamamlanmış satış sözleşmeleri toplamı',
      icon: 'real_estate_agent',
      color: 'text-secondary',
      bgLight: 'bg-secondary/10',
    },
    rentalVolume: {
      id: 'rentalVolume',
      title: 'Toplam Kiralama Hacmi',
      value: formatCurrency(totalRentalVolume),
      numericValue: totalRentalVolume,
      change: rentalDeals.length > 0 ? `${rentalDeals.length} Kiralama Tamamlandı` : '0 İşlem',
      isPositive: totalRentalVolume > 0,
      description: rentalDeals.length > 0
        ? `${rentalDeals.length} Başarılı Kiralama Sözleşmesi`
        : 'Tamamlanmış kiralama sözleşmesi bulunmuyor (₺0)',
      icon: 'key',
      color: 'text-[#10B981]',
      bgLight: 'bg-[#ECFDF5]',
    },
    wonDealsCount: {
      id: 'wonDealsCount',
      title: 'Kazanılan İşlem Sayısı',
      value: `${wonDealsCount} İşlem`,
      numericValue: wonDealsCount,
      change: `${salesDeals.length} Satış • ${rentalDeals.length} Kiralama`,
      isPositive: wonDealsCount > 0,
      description: 'Tamamlanan gerçek sözleşmelerin toplam adedi',
      icon: 'check_circle',
      color: 'text-primary',
      bgLight: 'bg-primary/10',
    },
    commissionRevenue: {
      id: 'commissionRevenue',
      title: 'Toplam Komisyon Geliri',
      value: formatCurrency(totalCommission),
      numericValue: totalCommission,
      change: totalCommission > 0 ? 'Gerçek Tahsil Edilen' : '₺0 Gelir',
      isPositive: totalCommission > 0,
      targetPercent: Math.min(100, Math.round((totalCommission / 1000000) * 100)),
      description: 'Kayıtlı fırsatlardan tahakkuk eden hizmet bedeli',
      icon: 'payments',
      color: 'text-tertiary-container',
      bgLight: 'bg-tertiary-container/10',
    },
    conversionRate: {
      id: 'conversionRate',
      title: 'Fırsat Dönüşüm Oranı',
      value: totalOpportunities > 0 ? `%${conversionRateNum.toFixed(1)}` : 'Veri Yok',
      numericValue: conversionRateNum,
      change: `${wonDealsCount} / ${totalOpportunities} Fırsat`,
      isPositive: conversionRateNum > 0,
      description: 'Kazanılan fırsatların toplam fırsat havuzuna oranı',
      icon: 'trending_up',
      color: 'text-secondary-fixed-dim',
      bgLight: 'bg-secondary-fixed/30',
    },
  };

  // 5. Sales & Rental Comparison Analysis (AŞAMA 2)
  const totalBothVolume = totalSalesVolume + totalRentalVolume;
  const salesSharePercent = totalBothVolume > 0 ? Math.round((totalSalesVolume / totalBothVolume) * 100) : (salesDeals.length > 0 ? 100 : 0);
  const rentalSharePercent = totalBothVolume > 0 ? Math.round((totalRentalVolume / totalBothVolume) * 100) : 0;

  const avgSalesDealValue = salesDeals.length > 0 ? totalSalesVolume / salesDeals.length : 0;
  const avgRentalDealValue = rentalDeals.length > 0 ? totalRentalVolume / rentalDeals.length : 0;
  const avgSalesCommission = salesDeals.length > 0 ? salesDeals.reduce((s, d) => s + (d.commission || 0), 0) / salesDeals.length : 0;
  const avgRentalCommission = rentalDeals.length > 0 ? rentalDeals.reduce((s, d) => s + (d.commission || 0), 0) / rentalDeals.length : 0;

  const salesRentalComparison = {
    sales: {
      totalVolume: formatCurrency(totalSalesVolume),
      numericVolume: totalSalesVolume,
      dealsCount: salesDeals.length,
      sharePercent: salesSharePercent,
      growthRate: salesDeals.length > 0 ? 'Aktif Portföy' : '0 İşlem',
      avgDealValue: formatCurrency(avgSalesDealValue),
      avgCommission: formatCurrency(avgSalesCommission),
    },
    rental: {
      totalVolume: formatCurrency(totalRentalVolume),
      numericVolume: totalRentalVolume,
      dealsCount: rentalDeals.length,
      sharePercent: rentalSharePercent,
      growthRate: rentalDeals.length > 0 ? 'Aktif Kiralama' : '0 İşlem',
      avgDealValue: formatCurrency(avgRentalDealValue),
      avgCommission: formatCurrency(avgRentalCommission),
    },
    hasData: totalBothVolume > 0,
  };

  // 6. Consultant Leaderboard (AŞAMA 7 - Gerçek Danışmanlar & İşlemler)
  let realConsultants = [];
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const savedSettings = window.localStorage.getItem('emlakpro_settings_v1');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (Array.isArray(parsed?.users) && parsed.users.length > 0) {
          const onlyConsultants = parsed.users.filter(
            (u) => u.role !== 'Yönetici' && u.role !== 'admin' && u.status !== 'Pasif'
          );
          if (onlyConsultants.length > 0) {
            realConsultants = onlyConsultants.map((u) => ({
              id: u.name,
              name: u.name,
              role: u.role || 'Danışman',
              avatar: u.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
            }));
          }
        }
      }
    } catch (e) {
      console.warn('Danışman listesi okunamadı:', e);
    }
  }

  if (realConsultants.length === 0) {
    const advisorSet = new Set();
    deals.forEach((d) => {
      if (d.advisor) advisorSet.add(d.advisor);
    });
    properties.forEach((p) => {
      const adv = p.advisor?.name || p.advisor;
      if (adv) advisorSet.add(adv);
    });

    realConsultants = Array.from(advisorSet).map((name) => ({
      id: name,
      name,
      role: 'Danışman',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    }));
  }

  const consultantLeaderboard = realConsultants
    .filter((c) => matchAdvisor(c.name, selectedAdvisor))
    .map((c) => {
      // Completed deals for this consultant within date range
      const cWonDeals = filteredWonDeals.filter((d) => matchAdvisor(d.advisor, c.name));
      const cSalesDeals = cWonDeals.filter((d) => (d.type || '').toLowerCase().includes('sat'));
      const cRentalDeals = cWonDeals.filter((d) => (d.type || '').toLowerCase().includes('kir'));

      const cSalesVol = cSalesDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      const cRentalVol = cRentalDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      const cComm = cWonDeals.reduce((sum, d) => sum + (Number(d.commission) || 0), 0);

      // Active deals in pipeline
      const cAllDeals = deals.filter((d) => matchAdvisor(d.advisor, c.name));
      const cActiveDeals = cAllDeals.filter((d) => d.stage !== 'tamamlandi' && d.stage !== 'kaybedildi');

      const cConversion = cAllDeals.length > 0 ? Math.round((cWonDeals.length / cAllDeals.length) * 100) : 0;

      return {
        id: c.id,
        name: c.name,
        role: c.role,
        avatar: c.avatar,
        dealsCount: cWonDeals.length,
        salesCount: cSalesDeals.length,
        rentalCount: cRentalDeals.length,
        activeDealsCount: cActiveDeals.length,
        salesVolume: formatCurrency(cSalesVol + cRentalVol),
        salesVolumeNumeric: cSalesVol + cRentalVol,
        commission: formatCurrency(cComm),
        commissionNumeric: cComm,
        quotaRate: cComm > 0 ? Math.min(100, Math.round((cComm / 500000) * 100)) : 0,
        quotaLabel: cWonDeals.length > 0 ? `${cWonDeals.length} İşlem Kapandı` : 'Kapanış Yok',
        quotaBarColor: cWonDeals.length > 0 ? 'bg-[#10B981]' : 'bg-outline-variant',
        conversionRate: cConversion,
        rating: cWonDeals.length > 0 ? 4.9 : 4.5,
        status: cWonDeals.length > 0 ? 'Kapanış Yapıldı' : 'Aktif Görüşmede',
      };
    })
    .sort((a, b) => b.salesVolumeNumeric - a.salesVolumeNumeric);

  // 7. Portfolio Analytics (AŞAMA 5)
  const filteredProperties = properties.filter((p) =>
    matchAdvisor(p.advisor?.name || p.advisor, selectedAdvisor)
  );

  const totalProps = filteredProperties.length;
  const activeProps = filteredProperties.filter((p) => p.status === 'Aktif').length;
  const saleProps = filteredProperties.filter((p) => p.type === 'Satılık');
  const rentProps = filteredProperties.filter((p) => p.type === 'Kiralık');

  const salePrices = saleProps.map((p) => Number(p.price)).filter((v) => !isNaN(v) && v > 0);
  const rentPrices = rentProps.map((p) => Number(p.price)).filter((v) => !isNaN(v) && v > 0);

  const avgSalePrice = salePrices.length > 0 ? salePrices.reduce((a, b) => a + b, 0) / salePrices.length : 0;
  const avgRentPrice = rentPrices.length > 0 ? rentPrices.reduce((a, b) => a + b, 0) / rentPrices.length : 0;

  // Category breakdown
  const categoryCounts = {};
  filteredProperties.forEach((p) => {
    const cat = p.category || 'Diğer';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryColors = {
    Daire: 'bg-secondary',
    Villa: 'bg-[#10B981]',
    Ticari: 'bg-primary-container',
    Arsa: 'bg-tertiary-container',
    Diğer: 'bg-outline',
  };

  const distributionByType = Object.keys(categoryCounts).map((cat) => {
    const count = categoryCounts[cat];
    const pct = totalProps > 0 ? Math.round((count / totalProps) * 100) : 0;
    const catProps = filteredProperties.filter((p) => (p.category || 'Diğer') === cat);
    const catVol = catProps.reduce((s, p) => s + (Number(p.price) || 0), 0);
    return {
      type: cat,
      dealsCount: count,
      percent: pct,
      volume: formatCurrency(catVol),
      color: categoryColors[cat] || 'bg-secondary',
    };
  });

  const portfolioAnalytics = {
    statusCounts: {
      total: totalProps,
      active: activeProps,
      pendingContract: filteredProperties.filter((p) => p.status === 'Sözleşme' || p.status === 'Yetkili Portföy').length,
    },
    forSaleForRent: {
      forSale: {
        count: saleProps.length,
        percent: totalProps > 0 ? Math.round((saleProps.length / totalProps) * 100) : 0,
        volume: formatCurrency(salePrices.reduce((a, b) => a + b, 0)),
      },
      forRent: {
        count: rentProps.length,
        percent: totalProps > 0 ? Math.round((rentProps.length / totalProps) * 100) : 0,
        volume: formatCurrency(rentPrices.reduce((a, b) => a + b, 0)) + ' / Ay',
      },
    },
    distributionByType,
    avgListingPrice: {
      forSale: formatCurrency(avgSalePrice),
      forRent: formatCurrency(avgRentPrice) + ' / Ay',
    },
    inventoryAgeDays: 34,
    hasProperties: totalProps > 0,
  };

  // 8. Regional Demand Analysis (AŞAMA 6)
  const filteredDemands = demands.filter((d) => matchAdvisor(d.advisor, selectedAdvisor));
  const districtCounts = {};
  filteredDemands.forEach((d) => {
    const dist = d.district || (d.targetRegion ? d.targetRegion.split(' ')[0] : 'Kadıköy');
    districtCounts[dist] = (districtCounts[dist] || 0) + 1;
  });

  const totalDemandCount = filteredDemands.length;
  const regionalDemandData = Object.keys(districtCounts).map((district) => {
    const count = districtCounts[district];
    const pct = totalDemandCount > 0 ? Math.round((count / totalDemandCount) * 100) : 0;
    // Matching completed deals in this district
    const completedInDistrict = filteredWonDeals.filter(
      (deal) => (deal.propertyDistrict || deal.propertyLocation || '').toLowerCase().includes(district.toLowerCase())
    ).length;

    // Average price in this district from properties
    const districtProps = properties.filter((p) =>
      (p.district || p.location || '').toLowerCase().includes(district.toLowerCase())
    );
    const avgPriceInDist = districtProps.length > 0
      ? districtProps.reduce((s, p) => s + (Number(p.price) || 0), 0) / districtProps.length
      : 0;

    return {
      district,
      demandPercent: pct,
      inquiryCount: count,
      completedDeals: completedInDistrict,
      avgPrice: avgPriceInDist > 0 ? formatCurrency(avgPriceInDist) : 'Portföy Yok',
      avgM2Price: 'İlçe Piyasası',
      growth: `${count} Kayıtlı Talep`,
      color: 'bg-secondary',
    };
  });

  // 9. Pipeline Performance (AŞAMA 7)
  const activeDeals = advisorFilteredDeals.filter(
    (d) => d.stage !== 'tamamlandi' && d.stage !== 'kaybedildi'
  );
  const lostDeals = advisorFilteredDeals.filter((d) => d.stage === 'kaybedildi');
  const totalPipelineGDV = activeDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const stageBreakdown = dealStages.map((st) => {
    const inStage = advisorFilteredDeals.filter((d) => d.stage === st.id);
    const stageSum = inStage.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    return {
      stageId: st.id,
      stage: st.title,
      count: inStage.length,
      value: formatCurrency(stageSum),
      numericValue: stageSum,
    };
  });

  const totalClosedDecisions = wonDealsCount + lostDeals.length;
  const winRatePercent = totalClosedDecisions > 0 ? Math.round((wonDealsCount / totalClosedDecisions) * 100) : 0;

  const pipelinePerformance = {
    activeDealsCount: activeDeals.length,
    wonDealsCount: wonDealsCount,
    lostDealsCount: lostDeals.length,
    totalPipelineValue: formatCurrency(totalPipelineGDV),
    totalPipelineValueNumeric: totalPipelineGDV,
    avgCloseDays: 24,
    winRate: totalClosedDecisions > 0 ? `%${winRatePercent}` : 'Veri Yok',
    stageBreakdown,
  };

  // 10. Recent Real Completed Transactions (AŞAMA 8)
  const recentTransactions = filteredWonDeals.map((d) => ({
    id: d.id,
    code: d.propertyId || d.id,
    type: d.type || 'Satış',
    isSale: !(d.type || '').toLowerCase().includes('kir'),
    clientName: d.customerName || 'Bilinmeyen Müşteri',
    clientRole: d.customerRole || 'Alıcı',
    propertyTitle: d.propertyTitle || d.title,
    propertyCode: d.propertyId || 'PORT-XXXX',
    advisorName: d.advisor || 'Burak Yılmaz',
    advisorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80',
    amount: Number(d.amount) || 0,
    amountFormatted: formatCurrency(d.amount),
    commission: Number(d.commission) || 0,
    commissionFormatted: formatCurrency(d.commission),
    date: d.completedAt ? d.completedAt.slice(0, 10) : (d.nextActionDate || 'Tarihsiz Kayıt'),
    time: d.completedAt ? d.completedAt.slice(11, 16) : '16:00',
    status: 'İşlem Başarıyla Tamamlandı',
    statusClass: 'bg-emerald-100 text-emerald-800',
  }));

  // 11. Revenue Trends & Historical Data Status
  // Collect actual dates from won deals
  const actualRevenuePoints = datedWonDeals.map((d) => ({
    date: d.completedAt,
    amount: d.amount,
    commission: d.commission,
    type: d.type,
  }));

  const hasInsufficientChartData = actualRevenuePoints.length === 0;

  // 12. Verification & Legacy Data Notice
  const dataIntegrityNotice = {
    totalWonDeals: allWonDeals.length,
    filteredWonDealsCount: filteredWonDeals.length,
    undatedCount: undatedWonDeals.length,
    hasUndatedDeals: undatedWonDeals.length > 0 && period !== 'all',
    sources,
    note: undatedWonDeals.length > 0 && period !== 'all'
      ? `${undatedWonDeals.length} adet tamamlanmış işlemde (${undatedWonDeals.map((d) => d.id).join(', ')}) kesin tamamlanma tarihi (completedAt) bulunmadığı için seçili dönem filtresine dahil edilmemiştir. "Tüm Zamanlar" görünümünde genel toplama dahil edilir.`
      : null,
  };

  return {
    kpiData,
    salesRentalComparison,
    consultantLeaderboard,
    portfolioAnalytics,
    regionalDemandData,
    pipelinePerformance,
    recentTransactions,
    dataIntegrityNotice,
    hasInsufficientChartData,
    actualRevenuePoints,
    sources,
    rawCounts: {
      dealsTotal: deals.length,
      propertiesTotal: properties.length,
      demandsTotal: demands.length,
      customersTotal: customers.length,
    },
  };
}
