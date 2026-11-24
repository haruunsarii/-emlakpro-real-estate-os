import React from 'react';

/**
 * ConsultantCard Component
 * Displays a single consultant/user card in grid view with live performance badges,
 * contact actions, and administrative controls (edit, reset password, toggle status, delete).
 * Strictly prevents self-lockout actions (passive toggle / delete) for the active user.
 */
export default function ConsultantCard({
  user,
  isSelf = false,
  assignedPropertiesCount = 0,
  closedDealsCount = 0,
  onEdit,
  onToggleStatus,
  onResetPassword,
  onDelete,
}) {
  const isPassive = user.status === 'Pasif';

  // Get initials for avatar fallback
  const initials = (user.name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  return (
    <div
      data-testid="consultant-card"
      data-user-id={user.id}
      className={`rounded-2xl border transition-all duration-200 bg-surface-container-lowest p-5 flex flex-col justify-between shadow-xs hover:shadow-md ${
        isPassive
          ? 'border-slate-200 opacity-80 bg-slate-50/50'
          : isSelf
          ? 'border-primary/40 ring-1 ring-primary/20'
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      <div>
        {/* Card Header: Avatar & Badges */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-13 h-13 rounded-2xl font-bold text-base flex items-center justify-center shrink-0 shadow-xs ${
                user.avatarUrl ? 'hidden' : 'flex'
              } ${
                isSelf
                  ? 'bg-gradient-to-tr from-primary to-slate-700 text-white'
                  : 'bg-gradient-to-tr from-secondary/15 to-secondary/30 text-secondary'
              }`}
            >
              {initials || 'U'}
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-semibold text-slate-900 text-base leading-tight">
                  {user.name}
                </h3>
                {isSelf && (
                  <span
                    title="Şu anda giriş yapmış olduğunuz aktif oturum"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white tracking-wide"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Siz
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user.title || user.role}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="shrink-0 flex flex-col items-end gap-1">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
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
            <span className="text-[11px] font-medium text-slate-400 px-1">
              {user.role}
            </span>
          </div>
        </div>

        {/* Contact Links */}
        <div className="space-y-1.5 mb-4 text-xs">
          <a
            href={`mailto:${user.email}`}
            className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors group truncate"
            title={user.email}
          >
            <span className="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-primary shrink-0">
              mail
            </span>
            <span className="truncate">{user.email}</span>
          </a>
          {user.phone ? (
            <a
              href={`tel:${user.phone.replace(/\s+/g, '')}`}
              className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors group"
            >
              <span className="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-primary shrink-0">
                call
              </span>
              <span>{user.phone}</span>
            </a>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 italic">
              <span className="material-symbols-outlined text-[15px] shrink-0">call</span>
              <span>Telefon belirtilmedi</span>
            </div>
          )}
        </div>

        {/* Live Metrics: Assigned Properties & Closed Deals */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-center">
            <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Portföy
            </p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              {assignedPropertiesCount} <span className="text-[10px] font-normal text-slate-500">İlan</span>
            </p>
          </div>
          <div className="text-center border-l border-slate-200/80">
            <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              İşlem
            </p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              {closedDealsCount} <span className="text-[10px] font-normal text-slate-500">Satış</span>
            </p>
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1">
          {/* Edit */}
          <button
            type="button"
            data-action="edit"
            onClick={() => onEdit(user)}
            title="Bilgileri Düzenle"
            className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            <span className="hidden sm:inline">Düzenle</span>
          </button>

          {/* Reset Password */}
          <button
            type="button"
            data-action="reset-password"
            onClick={() => onResetPassword(user)}
            title="Şifreyi Sıfırla"
            className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <span className="material-symbols-outlined text-base">lock_reset</span>
            <span className="hidden sm:inline">Şifre</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Toggle Active/Passive */}
          <button
            type="button"
            data-action="toggle-status"
            disabled={isSelf}
            onClick={() => onToggleStatus(user.id)}
            title={
              isSelf
                ? 'Kendi aktif oturumunuzu pasife alamazsınız.'
                : user.status === 'Aktif'
                ? 'Danışmanı pasife al'
                : 'Danışmanı aktif et'
            }
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
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
            <span className="hidden sm:inline">
              {user.status === 'Aktif' ? 'Pasif Yap' : 'Aktif Et'}
            </span>
          </button>

          {/* Delete User */}
          <button
            type="button"
            data-action="delete"
            disabled={isSelf}
            onClick={() => onDelete(user)}
            title={isSelf ? 'Kendi aktif yönetici hesabınızı silemezsiniz.' : 'Danışmanı Sil'}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              isSelf
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <span className="material-symbols-outlined text-base">delete</span>
            <span className="hidden sm:inline">Sil</span>
          </button>
        </div>
      </div>
    </div>
  );
}
