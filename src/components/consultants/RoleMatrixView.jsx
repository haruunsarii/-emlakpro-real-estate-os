import React, { useState, useMemo } from 'react';
import {
  ROLES_CONFIG,
  PERMISSION_LEVELS,
  MATRIX_CATEGORIES,
} from './roleMatrixData';

/**
 * RoleMatrixView Component
 * Renders an interactive role and permission matrix table, role summary cards with live user counts,
 * and a clear client-side RBAC prototype disclaimer.
 */
export default function RoleMatrixView({ users = [] }) {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all'); // 'all' | 'admin' | 'manager' | 'consultant' | 'assistant'

  // Compute live user counts per role from central settings.users
  const roleCounts = useMemo(() => {
    const counts = { admin: 0, manager: 0, consultant: 0, assistant: 0 };
    users.forEach((u) => {
      const r = (u.role || '').toLowerCase().trim();
      if (r === 'yönetici' || r === 'admin') counts.admin++;
      else if (r === 'ofis müdürü' || r === 'ofis muduru') counts.manager++;
      else if (r === 'asistan') counts.assistant++;
      else counts.consultant++;
    });
    return counts;
  }, [users]);

  // Determine columns to display (all roles or filtered single role)
  const displayedRoles = useMemo(() => {
    if (selectedRoleFilter === 'all') return ROLES_CONFIG;
    return ROLES_CONFIG.filter((r) => r.id === selectedRoleFilter);
  }, [selectedRoleFilter]);

  return (
    <div className="space-y-6" data-testid="role-matrix-view">
      {/* 1. Prototype Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 flex items-start gap-3 text-xs sm:text-sm text-indigo-950">
        <span className="material-symbols-outlined text-indigo-600 text-xl shrink-0 mt-0.5">
          verified_user
        </span>
        <div className="space-y-1">
          <p className="font-bold text-indigo-900">
            Rol ve Yetkilendirme Mimarisi (Frontend Prototip Standartı)
          </p>
          <p className="text-indigo-800 leading-relaxed">
            Bu matris, EmlakPro kurumsal organizasyon şemasının ve modül erişim sınırlarının
            şeffaf bir göstergesidir. İstemci tarafında rota koruması (<code className="px-1.5 py-0.5 rounded bg-indigo-100 font-mono text-xs">ProtectedRoute</code>)
            ve menü izolasyonu uygulanmakta olup; üretim ortamında sunucu tarafı JWT / RBAC
            yetkilendirme mimarisiyle entegre edilecek referans tasarımı temsil eder.
          </p>
        </div>
      </div>

      {/* 2. Role Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {ROLES_CONFIG.map((role) => {
          const isSelected = selectedRoleFilter === role.id;
          const userCount = roleCounts[role.id] || 0;

          return (
            <div
              key={role.id}
              onClick={() => setSelectedRoleFilter(isSelected ? 'all' : role.id)}
              className={`p-4 rounded-2xl border transition-all duration-200 bg-surface-container-lowest cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md ${
                isSelected
                  ? 'border-primary ring-2 ring-primary/20 shadow-sm bg-primary/[0.02]'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
              data-testid={`role-card-${role.id}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${role.badgeClass}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{role.icon}</span>
                    {role.badgeLabel}
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                    {userCount} Personel
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{role.name}</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                  {role.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className={isSelected ? 'text-primary font-bold' : 'text-slate-500'}>
                  {isSelected ? '✓ Matriste Odaklandı' : 'Yetkileri Filtrele'}
                </span>
                <span className="material-symbols-outlined text-base text-slate-400">
                  {isSelected ? 'filter_alt' : 'chevron_right'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Legend & Filter Toolbar */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-low p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Legend */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mr-1">
            Yetki Düzeyleri:
          </span>
          {Object.values(PERMISSION_LEVELS).map((lvl) => (
            <span
              key={lvl.id}
              title={lvl.description}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold ${lvl.badgeClass}`}
            >
              <span className={`material-symbols-outlined text-sm ${lvl.iconColor}`}>
                {lvl.icon}
              </span>
              <span>{lvl.label}</span>
            </span>
          ))}
        </div>

        {/* Reset Filter Button */}
        {selectedRoleFilter !== 'all' && (
          <button
            type="button"
            onClick={() => setSelectedRoleFilter('all')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            <span>Tüm Rolleri Göster</span>
          </button>
        )}
      </div>

      {/* 4. Categorized Matrix Table */}
      <div className="space-y-6">
        {MATRIX_CATEGORIES.map((category) => (
          <div
            key={category.id}
            className="bg-surface-container-lowest rounded-2xl border border-surface-container-low overflow-hidden shadow-xs"
            data-testid={`category-section-${category.id}`}
          >
            {/* Category Header */}
            <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">
                  {category.icon}
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {category.title}
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {category.modules.length} Modül
              </span>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider bg-slate-50/30">
                    <th className="py-3 px-5 w-2/5 min-w-[220px]">Modül / İşlev Alanı</th>
                    {displayedRoles.map((role) => (
                      <th
                        key={role.id}
                        className="py-3 px-4 text-center min-w-[140px]"
                      >
                        <div className="inline-flex items-center gap-1 font-bold text-slate-800">
                          <span className="material-symbols-outlined text-[15px] text-slate-500">
                            {role.icon}
                          </span>
                          <span>{role.badgeLabel}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {category.modules.map((mod) => (
                    <tr
                      key={mod.id}
                      className="hover:bg-slate-50/70 transition-colors"
                      data-testid={`module-row-${mod.id}`}
                    >
                      {/* Module Info */}
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{mod.name}</span>
                          <span className="font-mono text-[10px] text-slate-400 font-normal">
                            ({mod.route})
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {mod.description}
                        </p>
                      </td>

                      {/* Permissions per Displayed Role */}
                      {displayedRoles.map((role) => {
                        const permKey = mod.permissions[role.id] || 'none';
                        const perm = PERMISSION_LEVELS[permKey];

                        return (
                          <td
                            key={role.id}
                            className="py-3.5 px-4 text-center align-middle"
                          >
                            <span
                              title={perm.description}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold ${perm.badgeClass}`}
                            >
                              <span
                                className={`material-symbols-outlined text-[15px] ${perm.iconColor}`}
                              >
                                {perm.icon}
                              </span>
                              <span>{perm.label}</span>
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
