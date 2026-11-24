import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReportHeader from '../../components/reports/ReportHeader';
import ReportKpiSummary from '../../components/reports/ReportKpiSummary';
import RevenueAnalyticsChart from '../../components/reports/RevenueAnalyticsChart';
import SalesRentalComparison from '../../components/reports/SalesRentalComparison';
import ConsultantLeaderboard from '../../components/reports/ConsultantLeaderboard';
import RegionalDemandAnalysis from '../../components/reports/RegionalDemandAnalysis';
import RecentTransactionsTable from '../../components/reports/RecentTransactionsTable';
import CustomerConversionFunnel from '../../components/reports/CustomerConversionFunnel';
import PortfolioAnalytics from '../../components/reports/PortfolioAnalytics';
import PipelinePerformance from '../../components/reports/PipelinePerformance';
import AnalyticalInsights from '../../components/reports/AnalyticalInsights';
import { useToast } from '../../hooks/useToast';

import {
  DATE_PRESETS,
} from '../../services/reportsData';

import {
  aggregateReportsFromCrm,
} from '../../services/reportsAggregator';

import {
  exportReportsCsv,
  exportReportsExcel,
  exportReportsPdf,
} from '../../utils/reportsExport';

export default function ReportsPage() {
  const [activePeriod, setActivePeriod] = useState('all'); // Default to 'all' so real completed deals are fully visible
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [selectedConsultant, setSelectedConsultant] = useState('all');
  const [activeKpiKey, setActiveKpiKey] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [dismissNotice, setDismissNotice] = useState(false);

  // Centralized Toast Notification
  const { showToast } = useToast();

  // Re-read CRM data when window regains focus, storage changes, or restore/reset event occurs
  useEffect(() => {
    const handleSync = () => {
      setRefreshTrigger((prev) => prev + 1);
    };

    window.addEventListener('focus', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('emlakpro_data_restored', handleSync);
    window.addEventListener('emlakpro_data_reset', handleSync);
    return () => {
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('emlakpro_data_restored', handleSync);
      window.removeEventListener('emlakpro_data_reset', handleSync);
    };
  }, []);

  // Get active period label
  const periodLabel = useMemo(() => {
    if (activePeriod === 'custom' && customRange.start && customRange.end) {
      return `${customRange.start} - ${customRange.end}`;
    }
    const preset = DATE_PRESETS.find((p) => p.id === activePeriod);
    return preset ? preset.label : 'Tüm Zamanlar';
  }, [activePeriod, customRange]);

  // Central Dynamic Aggregation (AŞAMA 1 - 7)
  const aggregated = useMemo(() => {
    // refreshTrigger ensures recalculation on focus/storage event
    void refreshTrigger;
    return aggregateReportsFromCrm({
      period: activePeriod,
      customRange,
      selectedAdvisor: selectedConsultant,
    });
  }, [activePeriod, customRange, selectedConsultant, refreshTrigger]);

  // Dynamic Consultant Filter List from actual users and CRM records
  const consultantList = useMemo(() => {
    const list = [{ id: 'all', name: 'Tüm Danışmanlar' }];
    if (aggregated.consultantLeaderboard && aggregated.consultantLeaderboard.length > 0) {
      aggregated.consultantLeaderboard.forEach((c) => {
        if (!list.some((item) => item.id === c.name)) {
          list.push({ id: c.name, name: c.name });
        }
      });
    }
    return list;
  }, [aggregated.consultantLeaderboard]);

  // Get active consultant label
  const consultantLabel = useMemo(() => {
    const found = consultantList.find((c) => c.id === selectedConsultant);
    return found ? found.name : 'Tüm Danışmanlar';
  }, [selectedConsultant, consultantList]);

  // Handle period change
  const handlePeriodChange = useCallback((periodKey) => {
    setActivePeriod(periodKey);
    const preset = DATE_PRESETS.find((p) => p.id === periodKey);
    showToast(`Dönem değiştirildi: ${preset ? preset.label : periodKey}`, 'info');
  }, [showToast]);

  // Handle custom date apply
  const handleCustomDateApply = useCallback((range) => {
    setCustomRange(range);
    setActivePeriod('custom');
    showToast(`Özel tarih aralığı uygulandı: ${range.start} - ${range.end}`, 'info');
  }, [showToast]);

  // Handle consultant change
  const handleConsultantChange = useCallback((consultantId) => {
    setSelectedConsultant(consultantId);
    const cons = consultantList.find((c) => c.id === consultantId);
    showToast(`Danışman filtresi: ${cons ? cons.name : 'Tüm Danışmanlar'}`, 'info');
  }, [consultantList, showToast]);

  // Handle file export with synchronized live filtered data (AŞAMA 9)
  const handleExport = useCallback(async (format) => {
    const exportPayload = {
      periodLabel,
      consultantLabel,
      kpiData: aggregated.kpiData,
      consultantLeaderboard: aggregated.consultantLeaderboard,
      recentTransactions: aggregated.recentTransactions,
    };

    try {
      if (format === 'csv') {
        exportReportsCsv(exportPayload);
        showToast('CSV raporu başarıyla indirildi (Excel uyumlu UTF-8).', 'success');
      } else if (format === 'excel') {
        exportReportsExcel(exportPayload);
        showToast('Excel raporu (.xls) başarıyla oluşturuldu ve indirildi.', 'success');
      } else if (format === 'pdf') {
        showToast('PDF performans raporu hazırlanıyor...', 'info');
        await exportReportsPdf(exportPayload);
        showToast('PDF performans raporu başarıyla üretildi.', 'success');
      }
    } catch (err) {
      console.error('Export error:', err);
      showToast('Rapor dışa aktarılırken bir hata oluştu.', 'error');
    }
  }, [periodLabel, consultantLabel, aggregated.kpiData, aggregated.consultantLeaderboard, aggregated.recentTransactions, showToast]);

  // Handle KPI card click
  const handleKpiCardClick = useCallback((kpi) => {
    setActiveKpiKey((prev) => (prev === kpi.id ? null : kpi.id));
    showToast(`Seçilen Metrik: ${kpi.title} (${kpi.value})`, 'info');
  }, [showToast]);

  // Handle Insight Action Click
  const handleInsightAction = useCallback((insight) => {
    showToast(`Stratejik aksiyon kaydedildi: "${insight.title}"`, 'success');
  }, [showToast]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <ReportHeader
        activePeriod={activePeriod}
        onPeriodChange={handlePeriodChange}
        customRange={customRange}
        onCustomDateApply={handleCustomDateApply}
        selectedConsultant={selectedConsultant}
        onConsultantChange={handleConsultantChange}
        consultants={consultantList}
        onExport={handleExport}
      />

      {/* Veri Bütünlüğü Bilgilendirme Uyarısı (AŞAMA 4: Undated Legacy Deals Notice) */}
      {aggregated.dataIntegrityNotice.hasUndatedDeals && !dismissNotice && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-amber-700 shrink-0 mt-0.5">
              info
            </span>
            <div className="space-y-0.5">
              <span className="font-bold">Veri Bütünlüğü Notu:</span>
              <p className="text-amber-800 leading-relaxed">
                {aggregated.dataIntegrityNotice.note}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDismissNotice(true)}
            className="text-amber-700 hover:text-amber-950 p-1"
            title="Kapat"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Canlı Veri Durumu Şeridi (AŞAMA 10) */}
      <div className="flex items-center justify-between text-xs text-on-surface-variant px-1 font-caption">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Veri Kaynağı: Yerel CRM Veritabanı (localStorage)
          </span>
        </div>
        <span>
          Toplam {aggregated.rawCounts.dealsTotal} Fırsat • {aggregated.rawCounts.propertiesTotal} Portföy • {aggregated.rawCounts.demandsTotal} Talep
        </span>
      </div>

      {/* 2. KPI Summary Cards (Gerçek Veriyle Hesaplanmış) */}
      <ReportKpiSummary
        kpiData={aggregated.kpiData}
        activeKpiId={activeKpiKey}
        onCardClick={handleKpiCardClick}
      />

      {/* 3. Main Analytics Layout (Two-Column Desktop Grid) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Revenue, Sales/Rental, Leaderboard, Regional, Transactions */}
        <div className="xl:col-span-8 space-y-6">
          {/* Revenue Analytics Chart */}
          <RevenueAnalyticsChart
            actualRevenuePoints={aggregated.actualRevenuePoints}
            hasInsufficientChartData={aggregated.hasInsufficientChartData}
            wonDealsCount={aggregated.kpiData.wonDealsCount.numericValue}
          />

          {/* Sales & Rental Comparison Analysis (Gerçek Veri) */}
          <SalesRentalComparison data={aggregated.salesRentalComparison} />

          {/* Consultant Leaderboard (Gerçek Danışmanlar & Gerçek Cirolar) */}
          <ConsultantLeaderboard
            consultants={aggregated.consultantLeaderboard}
            selectedConsultant={selectedConsultant}
          />

          {/* Regional Demand Analysis (Gerçek Talepler & İlçeler) */}
          <RegionalDemandAnalysis districts={aggregated.regionalDemandData} />

          {/* Recent Transactions Table (Yalnızca Gerçek Tamamlanmış İşlemler) */}
          <RecentTransactionsTable transactions={aggregated.recentTransactions} />
        </div>

        {/* Right Column (4 cols): Conversion Funnel, Portfolio, Pipeline, Insights */}
        <div className="xl:col-span-4 space-y-6">
          {/* Customer Conversion Funnel */}
          <CustomerConversionFunnel hasData={aggregated.kpiData.wonDealsCount.numericValue > 0 || aggregated.rawCounts.dealsTotal > 0} />

          {/* Portfolio Analytics (Gerçek Portföy Dağılımı) */}
          <PortfolioAnalytics data={aggregated.portfolioAnalytics} />

          {/* Pipeline Performance (Gerçek Aşama Dağılımı & GDV) */}
          <PipelinePerformance data={aggregated.pipelinePerformance} />

          {/* Analytical Insights & Recommendations */}
          <AnalyticalInsights onActionClick={handleInsightAction} hasData={aggregated.kpiData.wonDealsCount.numericValue > 0} />
        </div>
      </div>
    </div>
  );
}
