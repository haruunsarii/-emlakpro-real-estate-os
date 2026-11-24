import React, { useState, useMemo, useCallback } from 'react';
import DealHeader from '../../components/deals/DealHeader';
import DealStatsGrid from '../../components/deals/DealStatsGrid';
import DealFilters from '../../components/deals/DealFilters';
import KanbanBoard from '../../components/deals/KanbanBoard';
import DealTableView from '../../components/deals/DealTableView';
import DealDetailDrawer from '../../components/deals/DealDetailDrawer';
import DealFormModal from '../../components/deals/DealFormModal';
import DealDeleteModal from '../../components/deals/DealDeleteModal';
import EmptyState from '../../components/ui/EmptyState';
import { dealStages } from '../../services/mockData';
import { useToast } from '../../hooks/useToast';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { matchesAnyTurkishField } from '../../utils/turkishSearch';

const DEALS_STORAGE_KEY = 'emlakpro_deals_v1';

export default function DealsPage() {
  // 1. Deals State with central useLocalStorage hook (Clean Start: empty initial list)
  const [deals, setDeals] = useLocalStorage(DEALS_STORAGE_KEY, []);

  // View mode: 'kanban' or 'table'
  const [viewMode, setViewMode] = useState('kanban');

  // Filter & Search states
  const [pipelineTab, setPipelineTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [advisorFilter, setAdvisorFilter] = useState('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('amount-desc');
  const [kpiFilterKey, setKpiFilterKey] = useState(null);

  // Modals & Drawer State
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [defaultStageForNew, setDefaultStageForNew] = useState('yeni_firsat');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);

  // Centralized Toast Notification
  const { showToast } = useToast();

  // 2. Dynamic KPI Calculations
  const stats = useMemo(() => {
    const activeDeals = deals.filter(
      (d) => d.stage !== 'tamamlandi' && d.stage !== 'kaybedildi'
    );
    const wonDeals = deals.filter((d) => d.stage === 'tamamlandi');
    const criticalDeals = deals.filter(
      (d) => d.isUrgent || d.priority === 'Kritik'
    );

    const totalVolume = activeDeals.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const totalCommission = activeDeals.reduce((sum, d) => sum + Number(d.commission || 0), 0);
    const wonVolume = wonDeals.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const wonRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;

    return {
      totalVolume,
      activeCount: activeDeals.length,
      totalCommission,
      wonCount: wonDeals.length,
      wonVolume,
      wonRate,
      criticalCount: criticalDeals.length,
    };
  }, [deals]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: deals.length,
      sale: deals.filter((d) => d.type === 'Satılık').length,
      rent: deals.filter((d) => d.type === 'Kiralık').length,
    };
  }, [deals]);

  // 3. Filtering & Sorting Logic
  const filteredDeals = useMemo(() => {
    let result = deals.filter((deal) => {
      // KPI filter (from clicking a stat card)
      if (kpiFilterKey === 'active') {
        if (deal.stage === 'tamamlandi' || deal.stage === 'kaybedildi') return false;
      } else if (kpiFilterKey === 'won') {
        if (deal.stage !== 'tamamlandi') return false;
      } else if (kpiFilterKey === 'critical') {
        if (!deal.isUrgent && deal.priority !== 'Kritik') return false;
      }

      // Pipeline tab filter
      if (pipelineTab !== 'all' && deal.type !== pipelineTab) {
        return false;
      }

      // Türkçe Karakter Duyarsız Arama (Title, Customer, Property, Code, Location, Advisor)
      if (searchQuery.trim()) {
        const matches = matchesAnyTurkishField(
          [
            deal.id,
            deal.title,
            deal.customerName,
            deal.propertyTitle,
            deal.propertyId,
            deal.propertyLocation,
            deal.advisor,
          ],
          searchQuery
        );
        if (!matches) return false;
      }

      // Advisor Filter
      if (advisorFilter !== 'all' && deal.advisor !== advisorFilter) {
        return false;
      }

      // Property Type Filter
      if (propertyTypeFilter !== 'all') {
        const pType = (deal.propertyType || '').toLowerCase();
        if (!pType.includes(propertyTypeFilter.toLowerCase())) return false;
      }

      // Priority Filter
      if (priorityFilter !== 'all') {
        if (priorityFilter === 'Kritik' && !deal.isUrgent && deal.priority !== 'Kritik') return false;
        if (priorityFilter !== 'Kritik' && deal.priority !== priorityFilter) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'amount-desc') return Number(b.amount || 0) - Number(a.amount || 0);
      if (sortBy === 'amount-asc') return Number(a.amount || 0) - Number(b.amount || 0);
      if (sortBy === 'date') return (b.nextActionDate || '').localeCompare(a.nextActionDate || '');
      return 0; // default activity order
    });

    return result;
  }, [
    deals,
    kpiFilterKey,
    pipelineTab,
    searchQuery,
    advisorFilter,
    propertyTypeFilter,
    priorityFilter,
    sortBy,
  ]);

  // 4. Stage Transition (Drag & Drop or Direct)
  const handleMoveDealStage = useCallback((dealId, targetStageId) => {
    const targetStage = dealStages.find((s) => s.id === targetStageId);
    const targetStageTitle = targetStage ? targetStage.title : targetStageId;
    const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === dealId) {
          const oldStage = dealStages.find((s) => s.id === d.stage)?.title || d.stage;
          const isNowWon = targetStageId === 'tamamlandi';
          const isNowLost = targetStageId === 'kaybedildi';

          // Completion Date Management (firstCompletedAt, lastCompletedAt, completedAt)
          let completedAt = d.completedAt;
          let firstCompletedAt = d.firstCompletedAt;
          let lastCompletedAt = d.lastCompletedAt;

          if (isNowWon) {
            // Only generate new completion date when transitioning INTO tamamlandi from another stage
            if (d.stage !== 'tamamlandi') {
              const nowIso = new Date().toISOString();
              completedAt = nowIso;
              // Preserve first completed date if already completed previously; otherwise set to now
              firstCompletedAt = d.firstCompletedAt || d.completedAt || nowIso;
              lastCompletedAt = nowIso;
            } else {
              // Deal is already in tamamlandi stage: preserve existing dates exactly as they are
              firstCompletedAt = d.firstCompletedAt || d.completedAt;
              lastCompletedAt = d.lastCompletedAt || d.completedAt;
            }
          } else if (d.stage === 'tamamlandi') {
            // Deal is moved OUT of tamamlandi to another stage
            // completedAt must become undefined
            // firstCompletedAt and lastCompletedAt must be preserved
            firstCompletedAt = d.firstCompletedAt || d.completedAt;
            lastCompletedAt = d.lastCompletedAt || d.completedAt;
            completedAt = undefined;
          }

          const newActivities = [
            ...(d.activities || []),
            {
              id: `act-${Date.now()}`,
              type: isNowWon ? 'won' : isNowLost ? 'lost' : 'stage_change',
              text: isNowWon
                ? 'Satış süreci başarıyla tamamlandı ve kazanıldı ✓'
                : isNowLost
                ? 'Fırsat kaybedildi olarak işaretlendi.'
                : `Aşama güncellendi: ${oldStage} → ${targetStageTitle}`,
              author: d.advisor || 'Burak Yılmaz',
              date: `Bugün, ${timeStr}`,
            },
          ];

          return {
            ...d,
            stage: targetStageId,
            completedAt: isNowWon ? completedAt : undefined,
            firstCompletedAt: firstCompletedAt,
            lastCompletedAt: lastCompletedAt,
            isUrgent: isNowWon || isNowLost ? false : d.isUrgent,
            lastActivity: isNowWon
              ? 'Satış Başarılı ✓'
              : isNowLost
              ? 'Arşivlendi'
              : `Aşama: ${targetStageTitle}`,
            activities: newActivities,
          };
        }
        return d;
      })
    );

    // Update selected deal in drawer if it's currently open
    setSelectedDeal((prev) => {
      if (prev && prev.id === dealId) {
        return {
          ...prev,
          stage: targetStageId,
        };
      }
      return prev;
    });

    showToast(`"${dealId}" fırsatının aşaması "${targetStageTitle}" olarak güncellendi.`);
  }, [setDeals, showToast]);

  // 5. Drawer & Modal Actions
  const handleOpenDealDetail = useCallback((deal) => {
    setSelectedDeal(deal);
    setIsDrawerOpen(true);
  }, []);

  const handleAddNewDeal = useCallback((stageId = 'yeni_firsat') => {
    setEditingDeal(null);
    setDefaultStageForNew(stageId);
    setIsFormModalOpen(true);
  }, []);

  const handleEditDeal = (deal) => {
    setEditingDeal(deal);
    setIsFormModalOpen(true);
  };

  const handleDeleteDeal = (deal) => {
    setDealToDelete(deal);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = (data) => {
    let dealData = { ...data };
    if (editingDeal) {
      // Update existing
      if (dealData.stage === 'tamamlandi') {
        if (editingDeal.stage !== 'tamamlandi') {
          // Transitioned into tamamlandi from another stage
          const nowIso = new Date().toISOString();
          dealData.completedAt = nowIso;
          dealData.firstCompletedAt = editingDeal.firstCompletedAt || editingDeal.completedAt || nowIso;
          dealData.lastCompletedAt = nowIso;
        } else {
          // Deal was already completed and remains completed: preserve dates without modification
          dealData.completedAt = editingDeal.completedAt;
          dealData.firstCompletedAt = editingDeal.firstCompletedAt || editingDeal.completedAt;
          dealData.lastCompletedAt = editingDeal.lastCompletedAt || editingDeal.completedAt;
        }
      } else if (editingDeal.stage === 'tamamlandi') {
        // Deal was moved OUT of completed stage
        dealData.firstCompletedAt = editingDeal.firstCompletedAt || editingDeal.completedAt;
        dealData.lastCompletedAt = editingDeal.lastCompletedAt || editingDeal.completedAt;
        dealData.completedAt = undefined;
      }

      setDeals((prev) =>
        prev.map((item) => (item.id === editingDeal.id ? { ...item, ...dealData } : item))
      );
      if (selectedDeal && selectedDeal.id === editingDeal.id) {
        setSelectedDeal((prev) => ({ ...prev, ...dealData }));
      }
      showToast(`"${data.title}" fırsatı güncellendi.`);
    } else {
      // Create new
      if (dealData.stage === 'tamamlandi' && !dealData.completedAt) {
        const nowIso = new Date().toISOString();
        dealData.completedAt = nowIso;
        dealData.firstCompletedAt = nowIso;
        dealData.lastCompletedAt = nowIso;
      }
      setDeals((prev) => [dealData, ...prev]);
      showToast(`Yeni fırsat (${data.id} - ${data.title}) hunisine eklendi.`);
    }
  };

  const handleConfirmDelete = (dealId) => {
    const deleted = deals.find((d) => d.id === dealId);
    setDeals((prev) => prev.filter((d) => d.id !== dealId));
    setIsDeleteModalOpen(false);
    setDealToDelete(null);
    if (selectedDeal && selectedDeal.id === dealId) {
      setIsDrawerOpen(false);
      setSelectedDeal(null);
    }
    showToast(`"${deleted?.title || dealId}" fırsatı silindi. Müşteri ve portföy kayıtları korundu.`);
  };

  const handleAddActivityNote = (dealId, noteText) => {
    const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === dealId) {
          const newActivities = [
            ...(d.activities || []),
            {
              id: `act-${Date.now()}`,
              type: 'note',
              text: noteText,
              author: d.advisor || 'Burak Yılmaz',
              date: `Bugün, ${timeStr}`,
            },
          ];
          return {
            ...d,
            notes: noteText,
            lastActivity: 'Görüşme notu eklendi',
            activities: newActivities,
          };
        }
        return d;
      })
    );

    // Update open drawer instance
    if (selectedDeal && selectedDeal.id === dealId) {
      setSelectedDeal((prev) => ({
        ...prev,
        notes: noteText,
        activities: [
          ...(prev.activities || []),
          {
            id: `act-${Date.now()}`,
            type: 'note',
            text: noteText,
            author: prev.advisor || 'Burak Yılmaz',
            date: `Bugün, ${timeStr}`,
          },
        ],
      }));
    }

    showToast('Görüşme notu başarıyla aktivite geçmişine kaydedildi.');
  };

  const handleExportReport = () => {
    if (deals.length === 0) return;
    const headers = ['Fırsat No', 'Başlık', 'Tür', 'Aşama', 'Müşteri', 'Telefon', 'Portföy', 'Tutar', 'Komisyon', 'Danışman', 'Öncelik'];
    const rows = deals.map((d) => [
      d.id,
      `"${d.title || ''}"`,
      d.type,
      d.stage,
      `"${d.customerName || ''}"`,
      `"${d.customerPhone || ''}"`,
      `"${d.propertyId || ''} - ${d.propertyLocation || ''}"`,
      d.amount,
      d.commission,
      `"${d.advisor || ''}"`,
      d.priority,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `EmlakPro_Satis_Kiralama_Hunisi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Satış ve kiralama hunisi raporu Excel uyumlu CSV olarak dışa aktarıldı.');
  };

  const handleResetFilters = () => {
    setPipelineTab('all');
    setSearchQuery('');
    setAdvisorFilter('all');
    setPropertyTypeFilter('all');
    setPriorityFilter('all');
    setSortBy('amount-desc');
    setKpiFilterKey(null);
    showToast('Tüm filtreler temizlendi.');
  };

  const handleStatClick = (key) => {
    if (kpiFilterKey === key) {
      setKpiFilterKey(null);
      showToast('KPI filtresi kaldırıldı.');
    } else {
      setKpiFilterKey(key);
      const labels = {
        active: 'Açık fırsatlar filtrelendi.',
        commission: 'Tüm fırsatlar listeleniyor.',
        won: 'Kazanılan tamamlanmış işlemler listelendi.',
        critical: 'Kritik ve acil ilgi bekleyen fırsatlar filtrelendi.',
      };
      showToast(labels[key] || 'Filtrelendi.');
    }
  };

  return (
    <div className="flex flex-col gap-space-lg w-full max-w-[1700px] mx-auto p-space-lg lg:p-margin">
      {/* 1. Header / Action Bar */}
      <DealHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExportReport}
        onAddNewDeal={() => handleAddNewDeal('yeni_firsat')}
      />

      {/* 2. KPI Metrics Bento Grid */}
      <DealStatsGrid
        stats={stats}
        onStatClick={handleStatClick}
        activeFilterKey={kpiFilterKey}
      />

      {/* 3. Multi-Filter Toolbar */}
      <DealFilters
        activePipelineTab={pipelineTab}
        onPipelineTabChange={setPipelineTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        advisorFilter={advisorFilter}
        onAdvisorChange={setAdvisorFilter}
        propertyTypeFilter={propertyTypeFilter}
        onPropertyTypeChange={setPropertyTypeFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onResetFilters={handleResetFilters}
        counts={tabCounts}
      />

      {/* 4. Main Board: Kanban vs Table View vs EmptyState */}
      {filteredDeals.length === 0 ? (
        <EmptyState
          type={
            searchQuery.trim() ||
            pipelineTab !== 'all' ||
            advisorFilter !== 'all' ||
            propertyTypeFilter !== 'all' ||
            priorityFilter !== 'all' ||
            kpiFilterKey !== null
              ? 'filter'
              : 'empty'
          }
          icon={
            searchQuery.trim()
              ? 'search_off'
              : pipelineTab !== 'all' ||
                advisorFilter !== 'all' ||
                propertyTypeFilter !== 'all' ||
                priorityFilter !== 'all' ||
                kpiFilterKey !== null
              ? 'filter_alt_off'
              : 'assignment'
          }
          title={
            searchQuery.trim() ||
            pipelineTab !== 'all' ||
            advisorFilter !== 'all' ||
            propertyTypeFilter !== 'all' ||
            priorityFilter !== 'all' ||
            kpiFilterKey !== null
              ? 'Kriterlere Uygun Fırsat Bulunamadı'
              : 'Henüz Satış/Kiralama Fırsatı Eklenmemiş'
          }
          description={
            searchQuery.trim() ||
            pipelineTab !== 'all' ||
            advisorFilter !== 'all' ||
            propertyTypeFilter !== 'all' ||
            priorityFilter !== 'all' ||
            kpiFilterKey !== null
              ? 'Filtre veya arama sonucunda fırsat listelenemedi. Filtreleri sıfırlayabilirsiniz.'
              : 'Satış ve kiralama hunisine yeni bir fırsat ekleyerek süreci başlatabilirsiniz.'
          }
          actionLabel={
            searchQuery.trim() ||
            pipelineTab !== 'all' ||
            advisorFilter !== 'all' ||
            propertyTypeFilter !== 'all' ||
            priorityFilter !== 'all' ||
            kpiFilterKey !== null
              ? 'Filtreleri Sıfırla'
              : 'Yeni Fırsat Ekle'
          }
          onAction={
            searchQuery.trim() ||
            pipelineTab !== 'all' ||
            advisorFilter !== 'all' ||
            propertyTypeFilter !== 'all' ||
            priorityFilter !== 'all' ||
            kpiFilterKey !== null
              ? handleResetFilters
              : () => handleAddNewDeal('yeni_firsat')
          }
        />
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          stages={dealStages}
          deals={filteredDeals}
          onSelectDeal={handleOpenDealDetail}
          onMoveDealStage={handleMoveDealStage}
          onAddDealToStage={handleAddNewDeal}
        />
      ) : (
        <DealTableView
          deals={filteredDeals}
          stages={dealStages}
          onSelectDeal={handleOpenDealDetail}
          onEditDeal={handleEditDeal}
          onDeleteDeal={handleDeleteDeal}
          onMoveStage={handleMoveDealStage}
        />
      )}

      {/* 5. Bottom Insights Strip */}
      <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md border border-surface-container mt-2">
        <div className="flex items-center gap-space-md">
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[24px]">insights</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-primary font-bold">
              Dönüşüm Hunisi Sağlığı: Güçlü
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Aktif {stats.activeCount} fırsatın {deals.filter(d => d.stage === 'teklif_verildi' || d.stage === 'pazarlik').length}&apos;i son aşamalarda (Teklif &amp; Pazarlık). Ortalama satış döngüsü süresi: <strong>22 gün</strong> (Geçen aya göre 4 gün daha hızlı).
            </span>
          </div>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={() => showToast('Aktivite günlüğü son 30 günlük tüm işlem hareketlerini listeliyor.')}
            className="inline-flex items-center gap-2 px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">history_toggle_off</span>
            <span>Aktivite Günlüğü</span>
          </button>
          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 px-space-md py-2 rounded-lg bg-primary text-white hover:bg-primary/90 font-label-md text-label-md shadow-sm transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">analytics</span>
            <span>Detaylı Huni Raporu</span>
          </button>
        </div>
      </div>

      {/* 6. Modals & Drawers */}
      <DealDetailDrawer
        isOpen={isDrawerOpen}
        deal={selectedDeal}
        stages={dealStages}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedDeal(null);
        }}
        onEditDeal={(deal) => {
          setIsDrawerOpen(false);
          handleEditDeal(deal);
        }}
        onDeleteDeal={(deal) => {
          setIsDrawerOpen(false);
          handleDeleteDeal(deal);
        }}
        onMoveStage={handleMoveDealStage}
        onAddActivityNote={handleAddActivityNote}
      />

      <DealFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingDeal}
        stages={dealStages}
        defaultStageId={defaultStageForNew}
      />

      <DealDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        deal={dealToDelete}
      />
    </div>
  );
}

