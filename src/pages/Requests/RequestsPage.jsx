import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RequestHeader from '../../components/requests/RequestHeader';
import RequestStatsGrid from '../../components/requests/RequestStatsGrid';
import RequestFilters from '../../components/requests/RequestFilters';
import RequestCardList from '../../components/requests/RequestCardList';
import RequestDetailDrawer from '../../components/requests/RequestDetailDrawer';
import RequestFormModal from '../../components/requests/RequestFormModal';
import RequestDeleteModal from '../../components/requests/RequestDeleteModal';
import { matchPropertiesForDemand } from '../../utils/matchingAlgorithm';
import { useToast } from '../../hooks/useToast';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { matchesAnyTurkishField, matchesTurkishSearch } from '../../utils/turkishSearch';

const DEMANDS_STORAGE_KEY = 'emlakpro_requests_v1';
const PROPERTIES_STORAGE_KEY = 'emlakpro_properties_v1';

export default function RequestsPage() {
  const navigate = useNavigate();

  // 1. Demands state with central useLocalStorage hook (Clean Start: empty initial list)
  const [demands, setDemands] = useLocalStorage(DEMANDS_STORAGE_KEY, []);

  // 2. Properties pool (reactive synchronization from localStorage)
  const [properties] = useLocalStorage(PROPERTIES_STORAGE_KEY, []);

  // Selected demand ID
  const [selectedDemandId, setSelectedDemandId] = useState(null);

  // Filters State
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [advisorFilter, setAdvisorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortByScore, setSortByScore] = useState(true);

  // Mobile View Toggle: 'list' or 'detail'
  const [mobileActiveView, setMobileActiveView] = useState('list');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDemand, setEditingDemand] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [demandToDelete, setDemandToDelete] = useState(null);

  // Engine Refresh Animation State
  const [isSyncing, setIsSyncing] = useState(false);

  // Centralized Toast State
  const { showToast } = useToast();

  // 3. Dynamic Matching Engine Runner
  const runMatchingEngine = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setDemands((prevDemands) => {
        return prevDemands.map((demand) => {
          const dynamicMatches = matchPropertiesForDemand(demand, properties, 50);
          const highestScore = dynamicMatches.length > 0 ? dynamicMatches[0].matchScore : demand.overallScore;

          return {
            ...demand,
            overallScore: demand.overallScore > 0 ? demand.overallScore : highestScore,
            matchedProperties:
              demand.matchedProperties && demand.matchedProperties.length > 0
                ? demand.matchedProperties
                : dynamicMatches.slice(0, 3),
          };
        });
      });
      setIsSyncing(false);
      showToast('Canlı Eşleştirme Motoru Çalıştırıldı: Tüm portföyler güncel kriterlerle skorlandı.');
    }, 800);
  };

  // 4. Reset Filters Handler
  const handleResetFilters = () => {
    setActiveTab('all');
    setSearchQuery('');
    setPropertyTypeFilter('all');
    setDistrictFilter('all');
    setBudgetFilter('all');
    setAdvisorFilter('all');
    setStatusFilter('all');
    setSortByScore(true);
    showToast('Tüm filtreler sıfırlandı.');
  };

  // 5. Filtering and Sorting logic
  const filteredDemands = useMemo(() => {
    let result = demands.filter((demand) => {
      // Türkçe Karakter Duyarsız Arama (Client Name, Code, Region, Type, Advisor, Phone, Email)
      if (searchQuery.trim()) {
        const matches = matchesAnyTurkishField(
          [
            demand.clientName,
            demand.id,
            demand.targetRegion,
            demand.district,
            demand.city,
            demand.propertyType,
            demand.categoryGroup,
            demand.advisor,
            demand.phone,
            demand.email,
          ],
          searchQuery
        );
        if (!matches) return false;
      }

      // Quick Tab Filter
      if (activeTab === 'high_match' && (demand.overallScore || 0) < 85) return false;
      if (activeTab === 'buy' && demand.role !== 'Satın Alma' && demand.transactionType !== 'Satılık' && demand.type !== 'Satılık') return false;
      if (activeTab === 'rent' && demand.role !== 'Kiralama' && demand.transactionType !== 'Kiralık' && demand.type !== 'Kiralık') return false;
      if (activeTab === 'waiting' && demand.overallScore > 0 && demand.matchedProperties?.length > 0) return false;

      // Dropdown: Property Type
      if (propertyTypeFilter !== 'all') {
        const typeStr = demand.propertyType || demand.categoryGroup || demand.category || '';
        if (!matchesTurkishSearch(typeStr, propertyTypeFilter)) return false;
      }

      // Dropdown: District
      if (districtFilter !== 'all') {
        const regStr = demand.targetRegion || demand.district || demand.city || '';
        if (!matchesTurkishSearch(regStr, districtFilter)) return false;
      }

      // Dropdown: Budget
      if (budgetFilter !== 'all') {
        const minB = demand.budgetMin ?? demand.minBudget ?? 0;
        const maxB = demand.budgetMax ?? demand.maxBudget ?? Infinity;
        if (budgetFilter === '0-15m' && minB > 15000000) return false;
        if (budgetFilter === '15-30m' && (maxB < 15000000 || minB > 30000000)) return false;
        if (budgetFilter === '30-60m' && (maxB < 30000000 || minB > 60000000)) return false;
        if (budgetFilter === '60m+' && maxB < 60000000) return false;
      }

      // Dropdown: Advisor
      if (advisorFilter !== 'all') {
        if (!matchesTurkishSearch(demand.advisor || '', advisorFilter)) {
          return false;
        }
      }

      // Dropdown: Status
      if (statusFilter !== 'all') {
        const statStr = (demand.status || demand.statusBadge || '').toLowerCase();
        if (!statStr.includes(statusFilter.toLowerCase())) return false;
      }

      return true;
    });

    if (sortByScore) {
      result.sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
    }

    return result;
  }, [
    demands,
    searchQuery,
    activeTab,
    propertyTypeFilter,
    districtFilter,
    budgetFilter,
    advisorFilter,
    statusFilter,
    sortByScore,
  ]);

  // Dynamic counts for tabs
  const tabCounts = useMemo(() => {
    return {
      all: demands.length,
      high_match: demands.filter((d) => (d.overallScore || 0) >= 85).length,
      buy: demands.filter((d) => d.role === 'Satın Alma' || d.transactionType === 'Satılık' || d.type === 'Satılık').length,
      rent: demands.filter((d) => d.role === 'Kiralama' || d.transactionType === 'Kiralık' || d.type === 'Kiralık').length,
      waiting: demands.filter((d) => !d.overallScore || d.overallScore === 0 || !d.matchedProperties?.length).length,
    };
  }, [demands]);

  // Selected demand object
  const currentSelectedDemand = useMemo(() => {
    return demands.find((d) => d.id === selectedDemandId) || demands[0] || null;
  }, [demands, selectedDemandId]);

  // Matched properties for current selected demand
  const currentMatchedProperties = useMemo(() => {
    if (!currentSelectedDemand) return [];
    if (currentSelectedDemand.matchedProperties && currentSelectedDemand.matchedProperties.length > 0) {
      return currentSelectedDemand.matchedProperties;
    }
    // Compute on the fly
    return matchPropertiesForDemand(currentSelectedDemand, properties, 50).slice(0, 3);
  }, [currentSelectedDemand, properties]);

  // 6. Actions Handlers
  const handleOpenCreateModal = () => {
    setEditingDemand(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (demand) => {
    setEditingDemand(demand);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (demand) => {
    setDemandToDelete(demand);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = (data) => {
    if (editingDemand) {
      // Update existing
      setDemands((prev) =>
        prev.map((item) => (item.id === editingDemand.id ? { ...item, ...data } : item))
      );
      showToast(`${data.clientName} talebi başarıyla güncellendi.`);
    } else {
      // Create new
      // Run automatic matching for the new demand against existing properties
      const matches = matchPropertiesForDemand(data, properties, 50).slice(0, 3);
      const topScore = matches.length > 0 ? matches[0].matchScore : 0;

      const newDemand = {
        ...data,
        overallScore: topScore,
        scoreBadge: topScore > 0 ? `%${topScore} Uyum` : 'Eşleşme Yok',
        matchedProperties: matches,
        notesList: [],
      };

      setDemands((prev) => [newDemand, ...prev]);
      setSelectedDemandId(newDemand.id);
      showToast(`Yeni talep (${newDemand.id}) oluşturuldu ve portföylerle eşleştirildi.`);
    }
  };

  const handleConfirmDelete = (id) => {
    const deleted = demands.find((d) => d.id === id);
    const updated = demands.filter((d) => d.id !== id);
    setDemands(updated);
    setIsDeleteModalOpen(false);
    setDemandToDelete(null);

    if (selectedDemandId === id) {
      setSelectedDemandId(updated[0]?.id || null);
    }
    showToast(
      `${deleted?.clientName || 'Seçili'} talebi silindi. İlgili müşteri ve gayrimenkul kayıtları korundu.`
    );
  };

  const handleAddNote = (demandId, noteText) => {
    const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setDemands((prev) =>
      prev.map((d) => {
        if (d.id === demandId) {
          const notesList = d.notesList || [];
          return {
            ...d,
            notesList: [
              ...notesList,
              {
                text: noteText,
                author: `${d.advisor || 'Burak Yılmaz'}`,
                date: `Bugün, ${timeStr}`,
              },
            ],
          };
        }
        return d;
      })
    );
    showToast('Danışman görüşme notu başarıyla kaydedildi.');
  };

  const handleSendCatalog = (demand, matchedProps) => {
    showToast(
      `Karşılaştırmalı E-Katalog (${matchedProps.length} ilan) ${demand.clientName} adlı müşteriye başarıyla iletildi!`
    );
  };

  const handleSendPresentation = (demand, property) => {
    const propTitle = property ? property.title : 'Önerilen Portföy';
    showToast(`PDF Sunum Dosyası (${propTitle}) ${demand.clientName} için hazırlandı.`);
  };

  const handleScheduleShowing = (property) => {
    showToast(
      `${property.id} (${property.title}) için yer gösterme randevusu takvime eklendi.`
    );
  };

  const handleExportCSV = () => {
    if (demands.length === 0) return;
    const headers = ['Talep Kodu', 'Müşteri', 'Telefon', 'İşlem', 'Bölge', 'Bütçe', 'Danışman', 'Skor'];
    const rows = demands.map((d) => [
      d.id,
      `"${d.clientName || ''}"`,
      `"${d.phone || ''}"`,
      `"${d.transactionType || d.role || ''}"`,
      `"${d.targetRegion || d.district || ''}"`,
      `"${d.budget || ''}"`,
      `"${d.advisor || ''}"`,
      `"%${d.overallScore || 0}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `EmlakPro_Musteri_Talepleri_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Tüm müşteri talepleri Excel uyumlu CSV olarak dışa aktarıldı.');
  };

  const handleSelectDemand = (demand) => {
    setSelectedDemandId(demand.id);
    setMobileActiveView('detail');
  };

  // Stats Grid Click-to-filter
  const handleStatCardClick = (statKey) => {
    if (statKey === 'toplam-talep' || statKey === 'total_demands') {
      setActiveTab('all');
    } else if (statKey === 'yuksek-eslesme' || statKey === 'high_match') {
      setActiveTab('high_match');
    } else if (statKey === 'yeni-eklenenler' || statKey === 'new_leads') {
      setActiveTab('all');
      setSortByScore(false);
      showToast('En son eklenen talepler listelendi.');
    } else if (statKey === 'bekleyen-portfoy' || statKey === 'pending_gap') {
      setActiveTab('waiting');
    }
  };

  return (
    <div className="p-space-lg lg:p-margin flex flex-col gap-space-lg max-w-[1600px] w-full mx-auto">
      {/* 1. Header & Live Engine Status */}
      <RequestHeader
        onRefreshEngine={runMatchingEngine}
        onExport={handleExportCSV}
        onAddNewRequest={handleOpenCreateModal}
        isSyncing={isSyncing}
      />

      {/* 2. KPI Cards Grid */}
      <RequestStatsGrid
        demands={demands}
        onStatClick={handleStatCardClick}
      />

      {/* 3. Multi-Filter & Search Strip */}
      <RequestFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        propertyTypeFilter={propertyTypeFilter}
        onPropertyTypeChange={setPropertyTypeFilter}
        districtFilter={districtFilter}
        onDistrictChange={setDistrictFilter}
        budgetFilter={budgetFilter}
        onBudgetChange={setBudgetFilter}
        advisorFilter={advisorFilter}
        onAdvisorChange={setAdvisorFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onResetFilters={handleResetFilters}
        tabCounts={tabCounts}
      />

      {/* Mobile Toggle Bar (visible only on small screens < lg) */}
      <div className="flex lg:hidden items-center justify-center p-1 bg-surface-container rounded-xl gap-2">
        <button
          onClick={() => setMobileActiveView('list')}
          className={`flex-1 py-2 text-label-md font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileActiveView === 'list'
              ? 'bg-surface-container-lowest text-primary shadow-xs'
              : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
          <span>Talepler ({filteredDemands.length})</span>
        </button>

        <button
          onClick={() => setMobileActiveView('detail')}
          className={`flex-1 py-2 text-label-md font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileActiveView === 'detail'
              ? 'bg-surface-container-lowest text-primary shadow-xs'
              : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          <span>Eşleşme Detayları</span>
        </button>
      </div>

      {/* 4. Main Two-Panel Master-Detail Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN: Demand Cards List (5 Cols) */}
        <div
          className={`lg:col-span-5 ${
            mobileActiveView === 'detail' ? 'hidden lg:block' : 'block'
          }`}
        >
          <RequestCardList
            demands={filteredDemands}
            selectedDemandId={selectedDemandId}
            onSelectDemand={handleSelectDemand}
            onEditDemand={handleOpenEditModal}
            onDeleteDemand={handleOpenDeleteModal}
            onSortToggle={() => setSortByScore(!sortByScore)}
            onResetFilters={handleResetFilters}
            onAddNewRequest={handleOpenCreateModal}
            isFiltered={Boolean(
              searchQuery.trim() ||
                activeTab !== 'all' ||
                propertyTypeFilter !== 'all' ||
                districtFilter !== 'all' ||
                budgetFilter !== 'all' ||
                advisorFilter !== 'all' ||
                statusFilter !== 'all'
            )}
          />
        </div>

        {/* RIGHT COLUMN: Detailed Matching Engine View (7 Cols) */}
        <div
          className={`lg:col-span-7 ${
            mobileActiveView === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          <RequestDetailDrawer
            demand={currentSelectedDemand}
            matchedProperties={currentMatchedProperties}
            onEditDemand={handleOpenEditModal}
            onDeleteDemand={handleOpenDeleteModal}
            onOpenPropertyDetail={(prop) => {
              navigate('/gayrimenkuller');
              showToast(`${prop.id} - ${prop.title} portföy detayına yönlendirildiniz.`);
            }}
            onScheduleShowing={handleScheduleShowing}
            onSendPresentation={handleSendPresentation}
            onSendCatalog={handleSendCatalog}
            onAddNote={handleAddNote}
          />
        </div>
      </div>

      {/* 5. Modals */}
      <RequestFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingDemand}
      />

      <RequestDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        demand={demandToDelete}
      />
    </div>
  );
}
