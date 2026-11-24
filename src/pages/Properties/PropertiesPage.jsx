import React, { useState, useMemo, useCallback } from 'react';
import PropertyHeader from '../../components/properties/PropertyHeader';
import PropertyStatsGrid from '../../components/properties/PropertyStatsGrid';
import PropertyFilters from '../../components/properties/PropertyFilters';
import PropertyCardRich from '../../components/properties/PropertyCardRich';
import PropertyListView from '../../components/properties/PropertyListView';
import PropertyDetailDrawer from '../../components/properties/PropertyDetailDrawer';
import PropertyFormModal from '../../components/properties/PropertyFormModal';
import PropertyDeleteModal from '../../components/properties/PropertyDeleteModal';
import PropertyPagination from '../../components/properties/PropertyPagination';
import QuickActionModal from '../../components/dashboard/QuickActionModal';
import EmptyState from '../../components/ui/EmptyState';
import { generatePropertyPdf } from '../../utils/pdfGenerator';
import { useToast } from '../../hooks/useToast';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { matchesAnyTurkishField } from '../../utils/turkishSearch';

const STORAGE_KEY = 'emlakpro_properties_v1';
const ITEMS_PER_PAGE = 15;

export default function PropertiesPage() {
  // Load state and synchronize with localStorage via central hook (Clean Start: empty initial list)
  const [properties, setProperties] = useLocalStorage(STORAGE_KEY, []);

  // View mode: 'grid' or 'list'
  const [viewMode, setViewMode] = useState('grid');

  // Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const bookmarkedSet = useMemo(() => new Set(bookmarkedIds), [bookmarkedIds]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [advisorFilter, setAdvisorFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Detail Drawer state
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form Modal state (Add / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [editingProperty, setEditingProperty] = useState(null);

  // Delete Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  // Quick Action Modal (e.g. Appointment from Matched Buyer)
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [quickModalType, setQuickModalType] = useState('randevu');

  // Centralized Toast notification
  const { showToast, toast } = useToast();

  // Filter & Sort Logic
  const filteredProperties = useMemo(() => {
    return properties
      .filter((item) => {
        // 1. Türkçe Karakter Duyarsız Arama (ID, Title, Location, District, Neighborhood, Advisor)
        if (searchQuery.trim()) {
          const matches = matchesAnyTurkishField(
            [
              item.id,
              item.title,
              item.location,
              item.district,
              item.neighborhood,
              item.category,
              item.advisor?.name,
              item.priceFormatted,
            ],
            searchQuery
          );
          if (!matches) return false;
        }

        // 2. Segment Tabs
        if (activeSegment !== 'all') {
          if (activeSegment === 'Satılık' && item.type !== 'Satılık') return false;
          if (activeSegment === 'Kiralık' && item.type !== 'Kiralık') return false;
          if (activeSegment === 'exclusive' && !item.tags?.includes('Özel Yetkili')) return false;
          if (activeSegment === 'passive' && item.status !== 'Pasif') return false;
          if (activeSegment === 'expiring' && (item.contract?.daysLeft || 100) > 80) return false;
        }

        // 3. Property Type
        if (propertyTypeFilter !== 'all') {
          if (item.category !== propertyTypeFilter) return false;
        }

        // 4. District
        if (districtFilter !== 'all') {
          if (!item.location.includes(districtFilter) && item.district !== districtFilter) {
            return false;
          }
        }

        // 5. Price Filter
        if (priceFilter !== 'all') {
          const p = item.price;
          if (priceFilter === '0-15m' && p > 15000000) return false;
          if (priceFilter === '15-30m' && (p < 15000000 || p > 30000000)) return false;
          if (priceFilter === '30-60m' && (p < 30000000 || p > 60000000)) return false;
          if (priceFilter === '60m+' && p < 60000000) return false;
        }

        // 6. Room Filter
        if (roomFilter !== 'all') {
          if (roomFilter === '5+2' && !item.rooms.includes('5+2')) return false;
          else if (roomFilter !== '5+2' && !item.rooms.includes(roomFilter)) return false;
        }

        // 7. Advisor Filter
        if (advisorFilter !== 'all') {
          if (item.advisor?.name !== advisorFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'area_desc') return (b.netArea || 0) - (a.netArea || 0);
        if (sortBy === 'matches_desc') return (b.matchedCount || 0) - (a.matchedCount || 0);
        return 0; // 'newest' keeps initial order
      });
  }, [
    properties,
    searchQuery,
    activeSegment,
    propertyTypeFilter,
    districtFilter,
    priceFilter,
    roomFilter,
    advisorFilter,
    sortBy,
  ]);

  // Handler setters that batch page reset to 1 in the same event tick (eliminates cascading useEffect)
  const handleSearchChange = useCallback((val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  }, []);

  const handleSegmentChange = useCallback((val) => {
    setActiveSegment(val);
    setCurrentPage(1);
  }, []);

  const handlePropertyTypeChange = useCallback((val) => {
    setPropertyTypeFilter(val);
    setCurrentPage(1);
  }, []);

  const handleDistrictChange = useCallback((val) => {
    setDistrictFilter(val);
    setCurrentPage(1);
  }, []);

  const handlePriceChange = useCallback((val) => {
    setPriceFilter(val);
    setCurrentPage(1);
  }, []);

  const handleRoomChange = useCallback((val) => {
    setRoomFilter(val);
    setCurrentPage(1);
  }, []);

  const handleAdvisorChange = useCallback((val) => {
    setAdvisorFilter(val);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((val) => {
    setSortBy(val);
    setCurrentPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Paginated slice for current page
  const paginatedProperties = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProperties, safeCurrentPage]);

  // Handlers wrapped in useCallback for stable references
  const handleOpenDetail = useCallback((prop) => {
    setSelectedProperty(prop);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleOpenAddModal = useCallback(() => {
    setFormMode('add');
    setEditingProperty(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((prop) => {
    setFormMode('edit');
    setEditingProperty(prop);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenDeleteModal = useCallback((prop) => {
    setPropertyToDelete(prop);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback((propId) => {
    setProperties((prev) => prev.filter((p) => p.id !== propId));
    setIsDeleteModalOpen(false);
    setSelectedProperty((prev) => {
      if (prev?.id === propId) {
        setIsDrawerOpen(false);
        return null;
      }
      return prev;
    });
    showToast(`"${propId}" kodlu portföy kaydı başarıyla silindi.`);
  }, [setProperties, showToast]);

  const handleFormSubmitSuccess = useCallback((savedProp, mode) => {
    if (mode === 'edit') {
      setProperties((prev) =>
        prev.map((p) => (p.id === savedProp.id ? savedProp : p))
      );
      setSelectedProperty((prev) => (prev?.id === savedProp.id ? savedProp : prev));
      showToast(`"${savedProp.id}" ilan bilgileri güncellendi.`);
    } else {
      setProperties((prev) => [savedProp, ...prev]);
      setSelectedProperty(savedProp);
      showToast(`"${savedProp.id}" yeni portföy olarak sisteme kaydedildi!`);
    }
  }, [setProperties, showToast]);

  const handleToggleBookmark = useCallback((id) => {
    setBookmarkedIds((prev) => {
      const isCurrentlyBookmarked = prev.includes(id);
      showToast(
        isCurrentlyBookmarked
          ? 'İlan favorilerden çıkarıldı.'
          : 'İlan favorilere eklendi.'
      );
      return isCurrentlyBookmarked ? prev.filter((i) => i !== id) : [...prev, id];
    });
  }, [showToast]);

  const handleSendPdf = useCallback(async (prop) => {
    try {
      toast.info(`"${prop.id}" PDF sunumu hazırlanıyor...`);
      await generatePropertyPdf(prop);
      toast.success(`"${prop.id}" resmi PDF sunum kataloğu oluşturuldu ve indirildi.`);
    } catch {
      toast.error(`"${prop.id}" PDF sunumu hazırlanırken bir sorun oluştu.`);
    }
  }, [toast]);

  const handleShareWhatsapp = useCallback((prop) => {
    const text = encodeURIComponent(
      `Merhaba, EmlakPro üzerinden "${prop.title}" (${prop.priceFormatted}) ilanını sizinle paylaşıyorum.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }, []);

  const handleExport = useCallback(() => {
    try {
      const headers = ['İlan Kodu', 'Başlık', 'Tür', 'Kategori', 'Fiyat', 'Konum', 'Net m²', 'Oda', 'Danışman', 'Durum'];
      const rows = properties.map((p) => [
        p.id,
        `"${p.title.replace(/"/g, '""')}"`,
        p.type,
        p.category,
        `"${p.priceFormatted}"`,
        `"${p.location}"`,
        p.netArea || p.area,
        p.rooms,
        p.advisor?.name || '',
        p.status,
      ]);

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `EmlakPro_Portfoy_Listesi_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Tüm aktif portföy listesi Excel/CSV formatında başarıyla indirildi.');
    } catch {
      toast.error('Dışa aktarma sırasında bir hata oluştu.');
    }
  }, [properties, toast]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setActiveSegment('all');
    setPropertyTypeFilter('all');
    setDistrictFilter('all');
    setPriceFilter('all');
    setRoomFilter('all');
    setAdvisorFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
    toast.info('Filtreler başarıyla sıfırlandı.');
  }, [toast]);

  const handleSelectSegment = useCallback((seg) => {
    setActiveSegment(seg);
    setCurrentPage(1);
  }, []);

  const handleAddAppointment = useCallback((_prop, _buyer) => {
    setQuickModalType('randevu');
    setIsQuickModalOpen(true);
  }, []);

  const handleDrawerEdit = useCallback((prop) => {
    setIsDrawerOpen(false);
    handleOpenEditModal(prop);
  }, [handleOpenEditModal]);

  const handleDrawerDelete = useCallback((prop) => {
    setIsDrawerOpen(false);
    handleOpenDeleteModal(prop);
  }, [handleOpenDeleteModal]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      {/* Main Page Container */}
      <div className="p-space-lg xl:p-margin flex flex-col gap-space-lg max-w-[1700px] w-full mx-auto">
        {/* 1. Header / Page Title Bar */}
        <PropertyHeader
          activeCount={properties.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onExport={handleExport}
          onAddProperty={handleOpenAddModal}
        />

        {/* 2. Top Portfolio Metrics / KPI Stats Cards */}
        <PropertyStatsGrid
          activeSegment={activeSegment}
          onSelectSegment={handleSelectSegment}
          properties={properties}
        />

        {/* 3. Advanced Search & Filter Bar */}
        <PropertyFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          activeSegment={activeSegment}
          onSegmentChange={handleSegmentChange}
          propertyTypeFilter={propertyTypeFilter}
          onPropertyTypeChange={handlePropertyTypeChange}
          districtFilter={districtFilter}
          onDistrictChange={handleDistrictChange}
          priceFilter={priceFilter}
          onPriceChange={handlePriceChange}
          roomFilter={roomFilter}
          onRoomChange={handleRoomChange}
          advisorFilter={advisorFilter}
          onAdvisorChange={handleAdvisorChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          onResetFilters={handleResetFilters}
          properties={properties}
        />

        {/* 4. Main Portfolio Layout: Grid vs List */}
        {filteredProperties.length === 0 ? (
          <EmptyState
            type={
              searchQuery.trim() ||
              activeSegment !== 'all' ||
              propertyTypeFilter !== 'all' ||
              districtFilter !== 'all' ||
              priceFilter !== 'all' ||
              roomFilter !== 'all' ||
              advisorFilter !== 'all'
                ? 'filter'
                : 'empty'
            }
            icon={
              searchQuery.trim()
                ? 'search_off'
                : activeSegment !== 'all' ||
                  propertyTypeFilter !== 'all' ||
                  districtFilter !== 'all' ||
                  priceFilter !== 'all' ||
                  roomFilter !== 'all' ||
                  advisorFilter !== 'all'
                ? 'filter_alt_off'
                : 'apartment'
            }
            title={
              searchQuery.trim() ||
              activeSegment !== 'all' ||
              propertyTypeFilter !== 'all' ||
              districtFilter !== 'all' ||
              priceFilter !== 'all' ||
              roomFilter !== 'all' ||
              advisorFilter !== 'all'
                ? 'Kriterlere Uygun Gayrimenkul Bulunamadı'
                : 'Henüz Portföy İlanı Bulunmuyor'
            }
            description={
              searchQuery.trim() ||
              activeSegment !== 'all' ||
              propertyTypeFilter !== 'all' ||
              districtFilter !== 'all' ||
              priceFilter !== 'all' ||
              roomFilter !== 'all' ||
              advisorFilter !== 'all'
                ? 'Arama filtrenizi temizleyerek veya farklı filtre kriterleri seçerek portföy listesini görüntüleyebilirsiniz.'
                : 'Sistemde henüz kayıtlı bir portföy ilanı bulunmuyor. Yeni bir ilan ekleyerek başlayabilirsiniz.'
            }
            actionLabel={
              searchQuery.trim() ||
              activeSegment !== 'all' ||
              propertyTypeFilter !== 'all' ||
              districtFilter !== 'all' ||
              priceFilter !== 'all' ||
              roomFilter !== 'all' ||
              advisorFilter !== 'all'
                ? 'Filtreleri Temizle'
                : 'Yeni Portföy Ekle'
            }
            onAction={
              searchQuery.trim() ||
              activeSegment !== 'all' ||
              propertyTypeFilter !== 'all' ||
              districtFilter !== 'all' ||
              priceFilter !== 'all' ||
              roomFilter !== 'all' ||
              advisorFilter !== 'all'
                ? handleResetFilters
                : handleOpenAddModal
            }
          />
        ) : viewMode === 'grid' ? (
          <div
            id="portfolio-grid-container"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg"
          >
            {paginatedProperties.map((prop, index) => (
              <PropertyCardRich
                key={prop.id}
                property={prop}
                index={index}
                isPriority={index < 3}
                onOpenDetail={handleOpenDetail}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onSendPdf={handleSendPdf}
                onShareWhatsapp={handleShareWhatsapp}
                onToggleBookmark={handleToggleBookmark}
                isBookmarked={bookmarkedSet.has(prop.id)}
              />
            ))}
          </div>
        ) : (
          <PropertyListView
            properties={paginatedProperties}
            onOpenDetail={handleOpenDetail}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
            onSendPdf={handleSendPdf}
            onShareWhatsapp={handleShareWhatsapp}
            onToggleBookmark={handleToggleBookmark}
            bookmarkedIds={bookmarkedIds}
            bookmarkedSet={bookmarkedSet}
          />
        )}

        {/* 5. Pagination Bar */}
        <PropertyPagination
          currentPage={safeCurrentPage}
          totalItems={filteredProperties.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Slide-out Quick Property Drawer */}
      <PropertyDetailDrawer
        isOpen={isDrawerOpen}
        property={selectedProperty}
        onClose={handleCloseDetail}
        onEdit={handleDrawerEdit}
        onDelete={handleDrawerDelete}
        onDownloadPdf={handleSendPdf}
        onAddAppointment={handleAddAppointment}
      />

      {/* Property Form Modal (Add & Edit) */}
      <PropertyFormModal
        isOpen={isFormModalOpen}
        mode={formMode}
        property={editingProperty}
        onClose={() => setIsFormModalOpen(false)}
        onSubmitSuccess={handleFormSubmitSuccess}
      />

      {/* Property Delete Confirmation Modal */}
      <PropertyDeleteModal
        isOpen={isDeleteModalOpen}
        property={propertyToDelete}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Quick Action Modal for Appointments */}
      {isQuickModalOpen && (
        <QuickActionModal
          type={quickModalType}
          onClose={() => setIsQuickModalOpen(false)}
          onSubmitSuccess={() => {
            showToast('Randevu başarıyla takvime kaydedildi!');
          }}
        />
      )}
    </div>
  );
}

