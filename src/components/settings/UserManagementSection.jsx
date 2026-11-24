import React, { useState } from 'react';
import UserModal from './UserModal';
import EmptyState from '../ui/EmptyState';
import { matchesAnyTurkishField } from '../../utils/turkishSearch';

export default function UserManagementSection({
  users = [],
  onUsersChange,
  onToast,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (userId) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Aktif' ? 'Pasif' : 'Aktif';
        return {
          ...u,
          status: nextStatus,
          statusBadgeClass:
            nextStatus === 'Aktif'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-surface-variant text-on-surface-variant',
        };
      }
      return u;
    });

    onUsersChange(updated);
    if (onToast) onToast('Kullanıcı durumu güncellendi.');
  };

  const handleDeleteUser = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    if (window.confirm(`"${user.name}" kullanıcısını silmek istediğinize emin misiniz?`)) {
      const updated = users.filter((u) => u.id !== userId);
      onUsersChange(updated);
      if (onToast) onToast(`"${user.name}" sistemden silindi.`, 'info');
    }
  };

  const handleSaveUser = (userData) => {
    let updated;
    if (editingUser) {
      updated = users.map((u) => (u.id === editingUser.id ? userData : u));
      if (onToast) onToast(`"${userData.name}" bilgileri güncellendi.`, 'success');
    } else {
      updated = [userData, ...users];
      if (onToast) onToast(`"${userData.name}" ekibe eklendi.`, 'success');
    }
    onUsersChange(updated);
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = matchesAnyTurkishField([u.name, u.email, u.role, u.phone], searchTerm);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-space-lg flex flex-col gap-space-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-sm bg-surface-container-low -mx-space-lg -mt-space-lg p-space-lg rounded-t-xl border-b border-surface-container">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">group</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
              Kullanıcı Yönetimi
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Ofiste çalışan danışmanların, yöneticilerin ve asistanların yetki rolleri.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-primary hover:bg-primary-container text-white font-label-md text-label-md font-semibold transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>+ Yeni Kullanıcı Ekle</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="İsim veya e-posta ile ara..."
            className="w-full h-10 pl-9 pr-9 bg-surface border border-surface-container rounded-lg focus:outline-none focus:border-secondary font-body-sm text-body-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label="Aramayı Temizle"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-caption text-caption text-on-surface-variant font-semibold hidden md:inline">
            Rol:
          </span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:border-secondary font-body-sm text-body-sm cursor-pointer"
          >
            <option value="all">Tüm Roller ({users.length})</option>
            <option value="Yönetici">Yönetici</option>
            <option value="Ofis Müdürü">Ofis Müdürü</option>
            <option value="Gayrimenkul Danışmanı">Gayrimenkul Danışmanı</option>
            <option value="Asistan">Asistan</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-surface-container">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-surface-container text-on-surface font-label-sm text-label-sm">
              <th className="py-3 px-4 font-semibold">Kullanıcı</th>
              <th className="py-3 px-4 font-semibold hidden md:table-cell">E-posta</th>
              <th className="py-3 px-4 font-semibold">Rol</th>
              <th className="py-3 px-4 font-semibold">Durum</th>
              <th className="py-3 px-4 font-semibold hidden lg:table-cell">Son Aktif Olma</th>
              <th className="py-3 px-4 font-semibold text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container font-body-sm text-body-sm">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6">
                  <EmptyState
                    type={searchTerm || roleFilter !== 'all' ? 'filter' : 'empty'}
                    icon={searchTerm || roleFilter !== 'all' ? 'person_search' : 'group'}
                    title={
                      searchTerm || roleFilter !== 'all'
                        ? 'Kriterlere Uygun Danışman/Kullanıcı Bulunamadı'
                        : 'Henüz Kullanıcı Bulunmuyor'
                    }
                    description={
                      searchTerm || roleFilter !== 'all'
                        ? 'Arama teriminize veya rol filtrenize uyan danışman/kullanıcı bulunamadı. Filtreleri sıfırlayabilirsiniz.'
                        : 'Sistemde henüz kayıtlı kullanıcı bulunmuyor.'
                    }
                    actionLabel={
                      searchTerm || roleFilter !== 'all' ? 'Filtreleri Temizle' : 'Yeni Kullanıcı Ekle'
                    }
                    onAction={
                      searchTerm || roleFilter !== 'all'
                        ? () => {
                            setSearchTerm('');
                            setRoleFilter('all');
                          }
                        : handleOpenAddModal
                    }
                  />
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-surface-container-low/50 transition-colors">
                  {/* User (Avatar + Name) */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0 text-primary border border-surface-container">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt={u.name}
                            width="36"
                            height="36"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          u.initials || u.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-primary truncate">{u.name}</span>
                        <span className="text-[11px] text-on-surface-variant md:hidden truncate">
                          {u.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3 px-4 text-on-surface-variant hidden md:table-cell">
                    {u.email}
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                        u.roleBadgeClass || 'bg-surface-container text-on-surface'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption font-semibold ${
                        u.status === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-surface-variant text-on-surface-variant'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          u.status === 'Aktif' ? 'bg-emerald-600' : 'bg-slate-400'
                        }`}
                      />
                      {u.status}
                    </span>
                  </td>

                  {/* Last Active */}
                  <td className="py-3 px-4 text-on-surface-variant text-caption hidden lg:table-cell">
                    {u.lastActive || 'Bilinmiyor'}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(u)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                        title="Düzenle"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          u.status === 'Aktif'
                            ? 'text-amber-700 hover:bg-amber-100'
                            : 'text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={u.status === 'Aktif' ? 'Pasife Al' : 'Aktif Et'}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {u.status === 'Aktif' ? 'pause_circle' : 'play_circle'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg text-error hover:bg-error-container/40 transition-colors cursor-pointer"
                        title="Sil"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      <UserModal
        key={editingUser?.id || (isModalOpen ? 'open' : 'closed')}
        isOpen={isModalOpen}
        user={editingUser}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
      />
    </div>
  );
}
