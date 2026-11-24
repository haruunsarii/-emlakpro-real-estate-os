import React, { useState, useMemo, useCallback } from 'react';
import CustomerBreadcrumb from '../../components/customers/CustomerBreadcrumb';
import CustomerHeader from '../../components/customers/CustomerHeader';
import CustomerStatsGrid from '../../components/customers/CustomerStatsGrid';
import CustomerFilters from '../../components/customers/CustomerFilters';
import CustomerTable from '../../components/customers/CustomerTable';
import CustomerDetailDrawer from '../../components/customers/CustomerDetailDrawer';
import QuickActionModal from '../../components/dashboard/QuickActionModal';
import { useToast } from '../../hooks/useToast';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { matchesAnyTurkishField } from '../../utils/turkishSearch';

const CUSTOMERS_STORAGE_KEY = 'emlakpro_customers_v1';
const LEGACY_STORAGE_KEY = 'emlakpro_customers';

export default function CustomersPage() {
  const [customers, setCustomers] = useLocalStorage(
    CUSTOMERS_STORAGE_KEY,
    [],
    { legacyKey: LEGACY_STORAGE_KEY }
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [checkedCustomerIds, setCheckedCustomerIds] = useState([]);

  // O(1) Checkbox lookup Set
  const checkedSet = useMemo(() => new Set(checkedCustomerIds), [checkedCustomerIds]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [advisorFilter, setAdvisorFilter] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  // Toast notification service
  const { showToast, toast } = useToast();

  // Modal notifications
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('musteri');

  // Bulk action modals
  const [isBulkSmsOpen, setIsBulkSmsOpen] = useState(false);
  const [smsMessage, setSmsMessage] = useState('');
  const [isBulkAdvisorOpen, setIsBulkAdvisorOpen] = useState(false);
  const [targetAdvisor, setTargetAdvisor] = useState('Burak Yılmaz');

  // Dynamic role counts for filter pills
  const roleCounts = useMemo(() => {
    let buyers = 0;
    let sellers = 0;
    let renters = 0;
    let owners = 0;
    for (let i = 0; i < customers.length; i++) {
      const c = customers[i];
      const r = c.role || '';
      if (r === 'Alıcı') buyers++;
      else if (r === 'Satıcı') sellers++;
      else if (r === 'Kiracı') renters++;
      else if (r === 'Mülk Sahibi') owners++;
    }
    return { all: customers.length, buyers, sellers, renters, owners };
  }, [customers]);

  // Determine active stat card for visual highlighting
  const activeStat = useMemo(() => {
    if (statusFilter === 'Sıcak Aday') return 'hot_leads';
    if (roleFilter === 'Alıcı') return 'buyers';
    if (roleFilter === 'Satıcı' || roleFilter === 'Mülk Sahibi') return 'sellers';
    if (roleFilter === 'Kiracı') return 'renters';
    return null;
  }, [roleFilter, statusFilter]);

  // Filter logic
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // 1. Türkçe Karakter Duyarsız Arama (Name, Phone, Email, Region, Segment, Role)
      if (searchQuery.trim()) {
        const matches = matchesAnyTurkishField(
          [c.name, c.company, c.phone, c.email, c.region, c.preferredRegion, c.segment, c.role, c.id, c.advisor],
          searchQuery
        );
        if (!matches) return false;
      }

      // 2. Role Filter (Satıcı includes Mülk Sahibi / Satıcılar)
      if (roleFilter !== 'all') {
        if (roleFilter === 'Satıcı') {
          if (
            !c.role?.includes('Satıcı') &&
            !c.role?.includes('Mülk Sahibi') &&
            !c.segment?.includes('Satıcı') &&
            !c.segment?.includes('Mülk Sahibi')
          ) {
            return false;
          }
        } else if (!c.role?.includes(roleFilter) && !c.segment?.includes(roleFilter)) {
          return false;
        }
      }

      // 3. Status Filter
      if (statusFilter !== 'all') {
        if (c.status !== statusFilter) {
          return false;
        }
      }

      // 4. Advisor Filter
      if (advisorFilter !== 'all') {
        if (c.advisor !== advisorFilter) {
          return false;
        }
      }

      // 5. Budget Filter
      if (budgetFilter !== 'all') {
        if (budgetFilter === '0-10m' && c.budgetMin > 10000000) return false;
        if (budgetFilter === '10-30m' && (c.budgetMin > 30000000 || c.budgetMax < 10000000)) return false;
        if (budgetFilter === '30m+' && c.budgetMin < 30000000) return false;
      }

      // 6. Region Filter
      if (regionFilter !== 'all') {
        if (!c.region?.includes(regionFilter)) {
          return false;
        }
      }

      return true;
    });
  }, [customers, searchQuery, roleFilter, statusFilter, advisorFilter, budgetFilter, regionFilter]);

  // Selected customer object
  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || filteredCustomers[0] || null;
  }, [customers, selectedCustomerId, filteredCustomers]);

  // Memoized filter flag
  const isFiltered = useMemo(
    () =>
      Boolean(
        searchQuery.trim() ||
          roleFilter !== 'all' ||
          statusFilter !== 'all' ||
          advisorFilter !== 'all' ||
          budgetFilter !== 'all' ||
          regionFilter !== 'all'
      ),
    [searchQuery, roleFilter, statusFilter, advisorFilter, budgetFilter, regionFilter]
  );

  // Stable Handlers
  const handleSelectCustomer = useCallback((c) => {
    setSelectedCustomerId(c.id);
  }, []);

  const handleOpenAddCustomerModal = useCallback(() => {
    setModalType('musteri');
    setIsModalOpen(true);
  }, []);

  const handleToggleCheck = useCallback((id) => {
    setCheckedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleToggleCheckAll = useCallback(() => {
    setCheckedCustomerIds((prev) => {
      if (prev.length === filteredCustomers.length) {
        return [];
      }
      return filteredCustomers.map((c) => c.id);
    });
  }, [filteredCustomers]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
    setAdvisorFilter('all');
    setBudgetFilter('all');
    setRegionFilter('all');
    showToast('Filtreler başarıyla temizlendi.');
  }, [showToast]);

  const handleExport = useCallback(() => {
    showToast('Müşteri listesi Excel/CSV formatında dışa aktarılıyor...');
  }, [showToast]);

  const handleBulkSms = useCallback(() => {
    if (checkedCustomerIds.length === 0) {
      toast.warning('Lütfen önce işlem yapılacak müşterileri seçin.');
      return;
    }
    setSmsMessage(
      'Sayın müşterimiz, portföyümüze kriterlerinize uygun yeni özel mülkler eklenmiştir. İncelemek için bizimle iletişime geçebilirsiniz.'
    );
    setIsBulkSmsOpen(true);
  }, [checkedCustomerIds.length, toast]);

  const handleSendBulkSmsSubmit = useCallback((e) => {
    e.preventDefault();
    if (!smsMessage.trim()) return;

    setCustomers((prev) =>
      prev.map((c) => {
        if (checkedSet.has(c.id)) {
          if (c.timeline?.[0]?.notes === `SMS İçeriği: "${smsMessage}"`) {
            return c;
          }
          const newTimelineItem = {
            id: `t-${Date.now()}-${c.id}`,
            title: 'Toplu SMS İletildi',
            date: 'Az önce',
            notes: `SMS İçeriği: "${smsMessage}"`,
            advisor: 'Burak Yılmaz (Siz)',
            bulletBg: 'bg-secondary',
          };
          return {
            ...c,
            timeline: [newTimelineItem, ...(c.timeline || [])],
          };
        }
        return c;
      })
    );

    setIsBulkSmsOpen(false);
    showToast(
      `${checkedCustomerIds.length} seçili müşteriye SMS başarıyla iletildi ve aktivite geçmişine kaydedildi.`
    );
  }, [smsMessage, setCustomers, checkedSet, checkedCustomerIds.length, showToast]);

  const handleBulkAdvisorChange = useCallback(() => {
    if (checkedCustomerIds.length === 0) {
      toast.warning('Lütfen önce danışman atanacak müşterileri seçin.');
      return;
    }
    setIsBulkAdvisorOpen(true);
  }, [checkedCustomerIds.length, toast]);

  const handleAssignAdvisorSubmit = useCallback((e) => {
    e.preventDefault();
    const advisorMap = {
      'Burak Yılmaz': { short: 'B. Yılmaz', initials: 'BY' },
      'Elif Demir': { short: 'E. Demir', initials: 'ED' },
      'Caner Aydın': { short: 'C. Aydın', initials: 'CA' },
      'Mert Can': { short: 'M. Can', initials: 'MC' },
    };

    const advisorInfo = advisorMap[targetAdvisor] || {
      short: targetAdvisor,
      initials: 'DN',
    };

    setCustomers((prev) =>
      prev.map((c) => {
        if (checkedSet.has(c.id)) {
          if (c.timeline?.[0]?.title === 'Danışman Değişikliği Yapıldı' && c.advisor === targetAdvisor) {
            return c;
          }
          const newTimelineItem = {
            id: `t-${Date.now()}-${c.id}`,
            title: 'Danışman Değişikliği Yapıldı',
            date: 'Az önce',
            notes: `Müşteri yeni danışman "${targetAdvisor}" portföyüne aktarıldı.`,
            advisor: 'Sistem Yöneticisi',
            bulletBg: 'bg-primary',
          };
          return {
            ...c,
            advisor: targetAdvisor,
            advisorShort: advisorInfo.short,
            advisorInitials: advisorInfo.initials,
            timeline: [newTimelineItem, ...(c.timeline || [])],
          };
        }
        return c;
      })
    );

    setIsBulkAdvisorOpen(false);
    showToast(
      `${checkedCustomerIds.length} müşterinin danışmanı "${targetAdvisor}" olarak güncellendi.`
    );
  }, [targetAdvisor, setCustomers, checkedSet, checkedCustomerIds.length, showToast]);

  const handleStatSelect = useCallback((statId) => {
    if (activeStat === statId) {
      setRoleFilter('all');
      setStatusFilter('all');
      return;
    }

    if (statId === 'buyers') {
      setRoleFilter('Alıcı');
      setStatusFilter('all');
    } else if (statId === 'sellers') {
      setRoleFilter('Satıcı');
      setStatusFilter('all');
    } else if (statId === 'renters') {
      setRoleFilter('Kiracı');
      setStatusFilter('all');
    } else if (statId === 'hot_leads') {
      setStatusFilter('Sıcak Aday');
      setRoleFilter('all');
    }
  }, [activeStat]);

  const handleOpenPhone = useCallback((phone) => {
    window.open(`tel:${phone.replace(/[^0-9+]/g, '')}`, '_self');
  }, []);

  const handleOpenWhatsapp = useCallback((phone) => {
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank');
  }, []);

  const handleAddNote = useCallback((customerId, noteText) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          if (c.timeline?.[0]?.notes === noteText) {
            return c;
          }
          const newTimelineItem = {
            id: `t-${Date.now()}`,
            title: 'Hızlı Görüşme Notu',
            date: 'Az önce',
            notes: noteText,
            advisor: 'Burak Yılmaz (Siz)',
            bulletBg: 'bg-secondary',
          };
          return {
            ...c,
            timeline: [newTimelineItem, ...(c.timeline || [])],
          };
        }
        return c;
      })
    );
    showToast('Yeni not başarıyla aktivite geçmişine kaydedildi.');
  }, [setCustomers, showToast]);

  const handleAddAppointment = useCallback((_customer) => {
    setModalType('randevu');
    setIsModalOpen(true);
  }, []);

  const handleSendPresentation = useCallback((property, customer) => {
    showToast(`"${property.title}" portföy sunumu ${customer.name} için WhatsApp ve e-posta ile iletildi.`);
  }, [showToast]);

  const handleScheduleShowing = useCallback((property, customer) => {
    showToast(`"${property.title}" için ${customer.name} adına yer gösterme randevusu oluşturuldu.`);
  }, [showToast]);

  const handleCreateCustomerSubmit = useCallback((type, formData) => {
    const newCustomer = {
      id: `c-${Date.now()}`,
      name: formData.name,
      initials: formData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2),
      phone: formData.phone,
      email: `${formData.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      role: formData.propertyType === 'Kiralık' ? 'Kiracı' : 'Alıcı',
      segment: `${formData.propertyType === 'Kiralık' ? 'Kiracı' : 'Alıcı'} (Yeni Aday)`,
      region: 'Kadıköy / Moda',
      budget: formData.budget || '20M - 25M ₺',
      budgetMin: 20000000,
      budgetMax: 25000000,
      advisor: 'Burak Yılmaz',
      advisorShort: 'B. Yılmaz',
      status: 'Sıcak Aday',
      statusType: 'hot',
      registrationDate: 'Bugün',
      office: 'Kadıköy Şube',
      avatarBg: 'bg-primary text-on-primary',
      criteria: {
        targetRegion: 'Kadıköy Çevresi',
        budgetRange: formData.budget || '20M - 25M ₺',
        propertyType: 'Konut / Daire',
        deedType: 'Kat Mülkiyeti',
        tags: ['Yeni Kayıt'],
      },
      matchedProperties: [],
      timeline: [
        {
          id: `t-${Date.now()}`,
          title: 'Yeni Müşteri Kaydı',
          date: 'Az önce',
          notes: 'Müşteri CRM sistemine eklendi.',
          advisor: 'Burak Yılmaz',
          bulletBg: 'bg-secondary',
        },
      ],
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    setSelectedCustomerId(newCustomer.id);
    showToast(`"${formData.name}" sisteme başarıyla kaydedildi!`);
  }, [setCustomers, showToast]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      {/* 1. Sub-header Breadcrumb & Global Protocol Banner */}
      <CustomerBreadcrumb />

      <div className="p-space-md sm:p-space-lg flex flex-col gap-space-lg max-w-[1700px] w-full mx-auto">
        {/* 2. Page Header & Action CTAs */}
        <CustomerHeader
          totalCount={customers.length}
          onExport={handleExport}
          onAddCustomer={handleOpenAddCustomerModal}
        />

        {/* 3. Top Analytical Distribution Cards */}
        <CustomerStatsGrid
          activeStat={activeStat}
          onSelectRole={handleStatSelect}
          customers={customers}
        />

        {/* 4. Search & Advanced Filter Console */}
        <CustomerFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          advisorFilter={advisorFilter}
          onAdvisorFilterChange={setAdvisorFilter}
          budgetFilter={budgetFilter}
          onBudgetFilterChange={setBudgetFilter}
          regionFilter={regionFilter}
          onRegionFilterChange={setRegionFilter}
          onResetFilters={handleResetFilters}
          selectedCount={checkedCustomerIds.length}
          onBulkSms={handleBulkSms}
          onBulkAdvisorChange={handleBulkAdvisorChange}
          roleCounts={roleCounts}
        />

        {/* 5. Main Workspace Grid: Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Left: High Density Customers Table (7 cols on Desktop) */}
          <div className="lg:col-span-7 flex flex-col min-w-0">
            <CustomerTable
              customers={filteredCustomers}
              selectedCustomerId={selectedCustomer?.id}
              onSelectCustomer={handleSelectCustomer}
              checkedCustomerIds={checkedCustomerIds}
              checkedSet={checkedSet}
              onToggleCheck={handleToggleCheck}
              onToggleCheckAll={handleToggleCheckAll}
              onOpenPhone={handleOpenPhone}
              onOpenWhatsapp={handleOpenWhatsapp}
              onResetFilters={handleResetFilters}
              isFiltered={isFiltered}
              onAddCustomer={handleOpenAddCustomerModal}
            />
          </div>

          {/* Right: Detailed Customer Profile & Portfolio Match Drawer Preview (5 cols on Desktop) */}
          <div className="lg:col-span-5 flex flex-col min-w-0 lg:sticky lg:top-20">
            <CustomerDetailDrawer
              customer={selectedCustomer}
              onAddAppointment={handleAddAppointment}
              onAddNote={handleAddNote}
              onSendPresentation={handleSendPresentation}
              onScheduleShowing={handleScheduleShowing}
            />
          </div>
        </div>
      </div>

      {/* Quick Action Modal (Müşteri Ekle / Randevu Oluştur) */}
      {isModalOpen && (
        <QuickActionModal
          type={modalType}
          onClose={() => setIsModalOpen(false)}
          onSubmitSuccess={handleCreateCustomerSubmit}
        />
      )}

      {/* Toplu SMS Gönder Modalı */}
      {isBulkSmsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-surface-container-lowest w-full max-w-lg rounded-xl shadow-2xl border border-surface-container overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">
                  sms
                </span>
                <h3 className="font-headline-sm text-[18px] font-bold text-primary">
                  Toplu SMS Gönder ({checkedCustomerIds.length} Müşteri Seçili)
                </h3>
              </div>
              <button
                onClick={() => setIsBulkSmsOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSendBulkSmsSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <span className="font-caption text-on-surface-variant block mb-1">
                  Alıcılar:
                </span>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-2 bg-surface rounded-lg border border-surface-container">
                  {customers
                    .filter((c) => checkedSet.has(c.id))
                    .map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-0.5 rounded bg-surface-container text-primary font-caption text-caption font-semibold"
                      >
                        {c.name}
                      </span>
                    ))}
                </div>
              </div>

              <div>
                <label className="font-label-sm text-on-surface font-semibold block mb-1">
                  Hazır Şablonlar:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setSmsMessage(
                        'Sayın müşterimiz, aradığınız kriterlere uygun yeni bir portföy ilanımız sisteme eklenmiştir. Bilgi almak için arayabilirsiniz.'
                      )
                    }
                    className="px-2.5 py-1 rounded bg-surface hover:bg-surface-container text-on-surface-variant font-caption text-caption border border-surface-container"
                  >
                    Yeni Portföy
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSmsMessage(
                        'Sayın müşterimiz, takibinizdeki portföyün fiyatında revizyona gidilmiştir. Güncel sunum için lütfen iletişime geçin.'
                      )
                    }
                    className="px-2.5 py-1 rounded bg-surface hover:bg-surface-container text-on-surface-variant font-caption text-caption border border-surface-container"
                  >
                    Fiyat Revizyonu
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSmsMessage(
                        'Sayın müşterimiz, haftalık özel gayrimenkul bültenimiz hazırlanmıştır. İncelemek isterseniz randevu oluşturabilirsiniz.'
                      )
                    }
                    className="px-2.5 py-1 rounded bg-surface hover:bg-surface-container text-on-surface-variant font-caption text-caption border border-surface-container"
                  >
                    Haftalık Bülten
                  </button>
                </div>
              </div>

              <div>
                <label className="font-label-sm text-on-surface font-semibold block mb-1">
                  SMS Mesaj Metni *
                </label>
                <textarea
                  required
                  rows={4}
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  className="w-full p-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm text-on-surface"
                  placeholder="Gönderilecek SMS metnini girin..."
                />
                <span className="font-caption text-on-surface-variant text-[11px] block mt-1">
                  Karakter sayısı: {smsMessage.length} (Tahmini 1 SMS)
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setIsBulkSmsOpen(false)}
                  className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-white font-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  SMS Gönder ({checkedCustomerIds.length})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toplu Danışman Değiştir Modalı */}
      {isBulkAdvisorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-surface-container-lowest w-full max-w-lg rounded-xl shadow-2xl border border-surface-container overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  swap_horiz
                </span>
                <h3 className="font-headline-sm text-[18px] font-bold text-primary">
                  Danışman Değiştir ({checkedCustomerIds.length} Müşteri Seçili)
                </h3>
              </div>
              <button
                onClick={() => setIsBulkAdvisorOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAssignAdvisorSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <span className="font-caption text-on-surface-variant block mb-1">
                  Atama Yapılacak Müşteriler:
                </span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 bg-surface rounded-lg border border-surface-container">
                  {customers
                    .filter((c) => checkedSet.has(c.id))
                    .map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-0.5 rounded bg-surface-container text-primary font-caption text-caption font-semibold"
                      >
                        {c.name} ({c.advisorShort})
                      </span>
                    ))}
                </div>
              </div>

              <div>
                <label className="font-label-sm text-on-surface font-semibold block mb-1">
                  Yeni Sorumlu Danışmanı Seçin *
                </label>
                <select
                  value={targetAdvisor}
                  onChange={(e) => setTargetAdvisor(e.target.value)}
                  className="w-full h-11 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-label-md text-on-surface"
                >
                  <option value="Burak Yılmaz">Burak Yılmaz (Siz) - Kadıköy Şube</option>
                  <option value="Elif Demir">Elif Demir - Beykoz & Kadıköy Şube</option>
                  <option value="Caner Aydın">Caner Aydın - Levent & Maslak Şube</option>
                  <option value="Mert Can">Mert Can - Üsküdar & Ataşehir Şube</option>
                </select>
                <p className="font-caption text-on-surface-variant text-[12px] mt-1.5">
                  Seçilen danışman tüm müşteri takiplerini, taleplerini ve randevularını devralacaktır. Müşteri geçmişine atama notu düşülecektir.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setIsBulkAdvisorOpen(false)}
                  className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-white font-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  Danışmanı Ata &amp; Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

