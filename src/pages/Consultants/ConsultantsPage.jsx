import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getSavedSettings, saveSettings } from '../../services/settingsData';
import { getCrmData } from '../../services/reportsAggregator';
import { matchesAnyTurkishField } from '../../utils/turkishSearch';
import ConsultantStatsGrid from '../../components/consultants/ConsultantStatsGrid';
import ConsultantCard from '../../components/consultants/ConsultantCard';
import ConsultantModal from '../../components/consultants/ConsultantModal';
import ResetPasswordModal from '../../components/consultants/ResetPasswordModal';
import RoleMatrixView from '../../components/consultants/RoleMatrixView';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import EmptyState from '../../components/ui/EmptyState';

/**
 * ConsultantsPage - Danışman Yönetimi & Performans Takip Paneli (Aşama 6.3)
 *
 * Yönetici (Admin) rolüne özel, tam donanımlı danışman CRUD ve performans izleme ekranı.
 * - Tek Veri Kaynağı: `settings.users` (emlakpro_settings_v1)
 * - Güvenlik: Web Crypto SHA-256 şifreleme, düz metin şifre saklanmaz
 * - Kendini Kilitleme Koruması: Aktif oturum sahibi kendini pasife alamaz veya silemez
 * - Canlı İstatistikler: `properties` ve `deals` koleksiyonlarından dinamik türetilir
 */
export default function ConsultantsPage() {
  const { currentUser, refreshAuth } = useAuth();

  // 1. Data States
  const [users, setUsers] = useState(() => getSavedSettings().users || []);
  const [crmData, setCrmData] = useState(() => getCrmData());

  // 2. Filter & View States
  const [activeTab, setActiveTab] = useState('consultants'); // 'consultants' | 'matrix'
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'Aktif' | 'Pasif' | 'management'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // 3. Modals States
  const [consultantModal, setConsultantModal] = useState({ isOpen: false, user: null });
  const [passwordModal, setPasswordModal] = useState({ isOpen: false, user: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });

  // 4. Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // Sync users with localStorage events
  const reloadData = useCallback(() => {
    const freshSettings = getSavedSettings();
    setUsers(freshSettings.users || []);
    setCrmData(getCrmData());
  }, []);

  useEffect(() => {
    window.addEventListener('storage', reloadData);
    window.addEventListener('emlakpro_data_reset', reloadData);
    window.addEventListener('emlakpro_data_restored', reloadData);

    return () => {
      window.removeEventListener('storage', reloadData);
      window.removeEventListener('emlakpro_data_reset', reloadData);
      window.removeEventListener('emlakpro_data_restored', reloadData);
    };
  }, [reloadData]);

  // Compute live performance metrics per consultant
  const userStatsMap = useMemo(() => {
    const map = {};
    const properties = crmData.properties || [];
    const deals = crmData.deals || [];

    users.forEach((u) => {
      const userNameClean = (u.name || '').trim().toLowerCase();

      // Properties assigned to this user
      const assignedProps = properties.filter((p) => {
        const advName = (
          typeof p.advisor === 'string' ? p.advisor : p.advisor?.name || ''
        )
          .trim()
          .toLowerCase();
        return advName && advName === userNameClean;
      }).length;

      // Deals where advisor is this user and deal is closed/won
      const closedDeals = deals.filter((d) => {
        const advName = (
          typeof d.advisor === 'string' ? d.advisor : d.advisor?.name || ''
        )
          .trim()
          .toLowerCase();
        const stage = (d.stage || d.status || '').toLowerCase();
        const isClosed =
          stage === 'tamamlandi' ||
          stage === 'tapu_devir' ||
          stage === 'sozlesme_imza' ||
          stage === 'kazanildi';
        return advName && advName === userNameClean && isClosed;
      }).length;

      map[u.id] = {
        assignedProps,
        closedDeals,
      };
    });

    return map;
  }, [users, crmData]);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Filter Tab
      if (activeFilter === 'Aktif' && u.status !== 'Aktif') return false;
      if (activeFilter === 'Pasif' && u.status !== 'Pasif') return false;
      if (activeFilter === 'management') {
        const r = (u.role || '').toLowerCase();
        const isMgmt = r === 'yönetici' || r === 'admin' || r === 'ofis müdürü';
        if (!isMgmt) return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const fields = [u.name, u.email, u.phone, u.title, u.role];
        if (!matchesAnyTurkishField(fields, searchQuery)) {
          return false;
        }
      }

      return true;
    });
  }, [users, activeFilter, searchQuery]);

  // Check if a user is the active logged-in user
  const isSelfUser = useCallback(
    (user) => {
      if (!currentUser || !user) return false;
      return (
        currentUser.userId === user.id ||
        (currentUser.email &&
          user.email &&
          currentUser.email.toLowerCase() === user.email.toLowerCase())
      );
    },
    [currentUser]
  );

  // -------------------------------------------------------------
  // CRUD Handlers
  // -------------------------------------------------------------

  // Add or Edit User
  const handleSaveUser = async (savedUserData) => {
    const currentSettings = getSavedSettings();
    const existingList = currentSettings.users || [];
    const isEditing = existingList.some((u) => u.id === savedUserData.id);

    let updatedList;
    if (isEditing) {
      updatedList = existingList.map((u) =>
        u.id === savedUserData.id ? { ...u, ...savedUserData } : u
      );
      showToast(`${savedUserData.name} bilgileri başarıyla güncellendi.`);
    } else {
      updatedList = [savedUserData, ...existingList];
      showToast(`${savedUserData.name} sisteme başarıyla eklendi.`);
    }

    saveSettings({ ...currentSettings, users: updatedList });
    setUsers(updatedList);
    refreshAuth();
  };

  // Toggle Active / Passive Status
  const handleToggleStatus = (userId) => {
    const userToToggle = users.find((u) => u.id === userId);
    if (!userToToggle) return;

    if (isSelfUser(userToToggle)) {
      showToast('Kendi aktif yönetici hesabınızı pasife alamazsınız!', 'error');
      return;
    }

    const nextStatus = userToToggle.status === 'Aktif' ? 'Pasif' : 'Aktif';
    const statusBadgeClass =
      nextStatus === 'Aktif'
        ? 'bg-emerald-100 text-emerald-800'
        : 'bg-slate-100 text-slate-700';

    const currentSettings = getSavedSettings();
    const updatedList = (currentSettings.users || []).map((u) =>
      u.id === userId ? { ...u, status: nextStatus, statusBadgeClass } : u
    );

    saveSettings({ ...currentSettings, users: updatedList });
    setUsers(updatedList);
    showToast(
      `${userToToggle.name} durumu "${nextStatus}" olarak değiştirildi.`,
      nextStatus === 'Aktif' ? 'success' : 'info'
    );
  };

  // Reset Password
  const handleResetPassword = async (userId, newPasswordHash) => {
    const currentSettings = getSavedSettings();
    const updatedList = (currentSettings.users || []).map((u) =>
      u.id === userId ? { ...u, passwordHash: newPasswordHash } : u
    );

    saveSettings({ ...currentSettings, users: updatedList });
    setUsers(updatedList);
    showToast('Danışman şifresi güvenli bir şekilde (SHA-256) güncellendi.');
  };

  // Delete User Confirmation
  const handleConfirmDelete = () => {
    const userToDelete = deleteModal.user;
    if (!userToDelete) return;

    if (isSelfUser(userToDelete)) {
      showToast('Kendi aktif yönetici hesabınızı silemezsiniz!', 'error');
      setDeleteModal({ isOpen: false, user: null });
      return;
    }

    const currentSettings = getSavedSettings();
    const updatedList = (currentSettings.users || []).filter(
      (u) => u.id !== userToDelete.id
    );

    saveSettings({ ...currentSettings, users: updatedList });
    setUsers(updatedList);
    setDeleteModal({ isOpen: false, user: null });
    showToast(`${userToDelete.name} sistemden kalıcı olarak kaldırıldı.`, 'info');
  };

  return (
    <div className="p-space-md sm:p-space-lg max-w-7xl mx-auto space-y-6">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-lg border flex items-center gap-2.5 text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-800'
              : toast.type === 'info'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-emerald-900 text-white border-emerald-800'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {toast.type === 'error'
              ? 'error'
              : toast.type === 'info'
              ? 'info'
              : 'check_circle'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface-container">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-1">
            <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
            Yönetici Modülü
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Danışman & Personel Yönetimi
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Ofis danışmanları, yetki rolleri, portföy dağılımları ve hesap yönetimi
          </p>
        </div>

        {/* Action Button: Add Consultant */}
        <button
          type="button"
          onClick={() => setConsultantModal({ isOpen: true, user: null })}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-primary text-white hover:bg-slate-800 transition-all shadow-xs shrink-0"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          <span>Yeni Danışman Ekle</span>
        </button>
      </div>

      {/* Tab Navigation: Danışmanlar vs Rol & Yetki Matrisi */}
      <div className="flex items-center gap-2 border-b border-surface-container pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('consultants')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'consultants'
              ? 'bg-primary text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          data-testid="tab-consultants"
        >
          <span className="material-symbols-outlined text-lg">badge</span>
          <span>Danışman & Personel Listesi</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === 'consultants'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200/80 text-slate-700'
            }`}
          >
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-primary text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          data-testid="tab-role-matrix"
        >
          <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
          <span>Rol ve Yetki Matrisi</span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              activeTab === 'matrix'
                ? 'bg-white/20 text-white'
                : 'bg-secondary/10 text-secondary'
            }`}
          >
            RBAC
          </span>
        </button>
      </div>

      {/* TAB 1: Consultants & Staff List */}
      {activeTab === 'consultants' ? (
        <>
          {/* KPI Stats Grid */}
          <ConsultantStatsGrid
            users={users}
            properties={crmData.properties || []}
            deals={crmData.deals || []}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          {/* Filter & Search Toolbar */}
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-low p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                  activeFilter === 'all'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tümü ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('Aktif')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                  activeFilter === 'Aktif'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Aktif ({users.filter((u) => u.status === 'Aktif').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('Pasif')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                  activeFilter === 'Pasif'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pasif ({users.filter((u) => u.status === 'Pasif').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('management')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                  activeFilter === 'management'
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Yönetim (
                {
                  users.filter((u) => {
                    const r = (u.role || '').toLowerCase();
                    return r === 'yönetici' || r === 'admin' || r === 'ofis müdürü';
                  }).length
                }
                )
              </button>
            </div>

            {/* Search & View Switcher */}
            <div className="flex items-center gap-2">
              {/* Search Box */}
              <div className="relative flex-1 md:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="İsim, unvan, e-posta ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    title="Aramayı Temizle"
                    aria-label="Aramayı Temizle"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Kart Görünümü"
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">grid_view</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  title="Tablo Görünümü"
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">table_rows</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content: Grid vs Table vs Empty State */}
          {filteredUsers.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-low p-8 shadow-xs">
              <EmptyState
                preset={searchQuery ? 'search' : 'idle'}
                icon="group_off"
                title={
                  searchQuery
                    ? `"${searchQuery}" ile eşleşen personel bulunamadı`
                    : 'Kayıtlı danışman veya personel bulunmuyor'
                }
                description={
                  searchQuery
                    ? 'Arama kriterlerinizi kontrol edin veya filtreleri temizleyin.'
                    : 'Sisteme ilk danışman kaydını ekleyerek portföy ve görev atamaları yapabilirsiniz.'
                }
                actionText={searchQuery ? 'Filtreyi Temizle' : 'Yeni Danışman Ekle'}
                onAction={() => {
                  if (searchQuery) {
                    setSearchQuery('');
                    setActiveFilter('all');
                  } else {
                    setConsultantModal({ isOpen: true, user: null });
                  }
                }}
              />
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => {
                const stats = userStatsMap[user.id] || { assignedProps: 0, closedDeals: 0 };
                return (
                  <ConsultantCard
                    key={user.id}
                    user={user}
                    isSelf={isSelfUser(user)}
                    assignedPropertiesCount={stats.assignedProps}
                    closedDealsCount={stats.closedDeals}
                    onEdit={(u) => setConsultantModal({ isOpen: true, user: u })}
                    onToggleStatus={handleToggleStatus}
                    onResetPassword={(u) => setPasswordModal({ isOpen: true, user: u })}
                    onDelete={(u) => setDeleteModal({ isOpen: true, user: u })}
                  />
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-low overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4">Danışman</th>
                      <th className="py-3 px-4">Rol & Unvan</th>
                      <th className="py-3 px-4">İletişim</th>
                      <th className="py-3 px-4 text-center">Durum</th>
                      <th className="py-3 px-4 text-center">Portföy</th>
                      <th className="py-3 px-4 text-center">İşlem</th>
                      <th className="py-3 px-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => {
                      const stats = userStatsMap[user.id] || { assignedProps: 0, closedDeals: 0 };
                      const isSelf = isSelfUser(user);
                      const initials = (user.name || '')
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((p) => p[0].toUpperCase())
                        .join('');

                      return (
                        <tr
                          key={user.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            user.status === 'Pasif' ? 'opacity-70 bg-slate-50/30' : ''
                          }`}
                        >
                          {/* Name & Avatar */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.name}
                                  className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                                  user.avatarUrl ? 'hidden' : 'flex'
                                } ${
                                  isSelf
                                    ? 'bg-primary text-white'
                                    : 'bg-secondary/15 text-secondary'
                                }`}
                              >
                                {initials || 'U'}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-slate-900">
                                    {user.name}
                                  </span>
                                  {isSelf && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary text-white">
                                      Siz
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-slate-400 block">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role & Title */}
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-800 block">
                              {user.title || user.role}
                            </span>
                            <span className="text-[11px] text-slate-500">{user.role}</span>
                          </td>

                          {/* Contact */}
                          <td className="py-3 px-4 text-slate-600">
                            <div className="text-xs">
                              {user.phone ? <span>{user.phone}</span> : <span className="text-slate-400 italic">-</span>}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                user.status === 'Aktif'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  user.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                              />
                              {user.status || 'Aktif'}
                            </span>
                          </td>

                          {/* Assigned Properties */}
                          <td className="py-3 px-4 text-center font-bold text-slate-800">
                            {stats.assignedProps}
                          </td>

                          {/* Closed Deals */}
                          <td className="py-3 px-4 text-center font-bold text-slate-800">
                            {stats.closedDeals}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => setConsultantModal({ isOpen: true, user })}
                                title="Düzenle"
                                className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <span className="material-symbols-outlined text-base">edit</span>
                              </button>

                              {/* Reset Password */}
                              <button
                                type="button"
                                onClick={() => setPasswordModal({ isOpen: true, user })}
                                title="Şifreyi Sıfırla"
                                className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                              >
                                <span className="material-symbols-outlined text-base">
                                  lock_reset
                                </span>
                              </button>

                              {/* Toggle Active / Passive */}
                              <button
                                type="button"
                                disabled={isSelf}
                                onClick={() => handleToggleStatus(user.id)}
                                title={
                                  isSelf
                                    ? 'Kendi hesabınızı pasife alamazsınız.'
                                    : user.status === 'Aktif'
                                    ? 'Pasife Al'
                                    : 'Aktif Et'
                                }
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isSelf
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : user.status === 'Aktif'
                                    ? 'text-amber-600 hover:bg-amber-50'
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                <span className="material-symbols-outlined text-base">
                                  {user.status === 'Aktif' ? 'pause_circle' : 'play_circle'}
                                </span>
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                disabled={isSelf}
                                onClick={() => setDeleteModal({ isOpen: true, user })}
                                title={isSelf ? 'Kendi hesabınızı silemezsiniz.' : 'Sil'}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isSelf
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'text-rose-600 hover:bg-rose-50'
                                }`}
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* TAB 2: Role and Permission Matrix View */
        <RoleMatrixView users={users} />
      )}

      {/* 1. Add / Edit Modal */}
      <ConsultantModal
        isOpen={consultantModal.isOpen}
        user={consultantModal.user}
        existingUsers={users}
        onClose={() => setConsultantModal({ isOpen: false, user: null })}
        onSave={handleSaveUser}
      />

      {/* 2. Reset Password Modal */}
      <ResetPasswordModal
        isOpen={passwordModal.isOpen}
        user={passwordModal.user}
        onClose={() => setPasswordModal({ isOpen: false, user: null })}
        onResetPassword={handleResetPassword}
      />

      {/* 3. Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        onConfirm={handleConfirmDelete}
        title="Danışmanı Silmek İstediğinize Emin misiniz?"
        description="Bu işlem geri alınamaz. İlgili personel kaydı sistemden kalıcı olarak kaldırılacaktır."
        itemDetails={
          deleteModal.user
            ? [
                { label: 'Personel', value: deleteModal.user.name },
                { label: 'E-posta', value: deleteModal.user.email },
                { label: 'Rol / Unvan', value: deleteModal.user.title || deleteModal.user.role },
              ]
            : []
        }
        confirmLabel="Evet, Danışmanı Sil"
        cancelLabel="Vazgeç"
        icon="person_remove"
      />
    </div>
  );
}
