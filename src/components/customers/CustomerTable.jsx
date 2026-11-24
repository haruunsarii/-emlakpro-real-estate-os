import React, { memo } from 'react';
import EmptyState from '../ui/EmptyState';

function CustomerTable({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  checkedCustomerIds,
  checkedSet,
  onToggleCheck,
  onToggleCheckAll,
  onOpenPhone,
  onOpenWhatsapp,
  onResetFilters,
  isFiltered = false,
  onAddCustomer,
}) {
  const isAllChecked =
    customers.length > 0 &&
    (checkedSet
      ? customers.every((c) => checkedSet.has(c.id))
      : customers.every((c) => checkedCustomerIds?.includes(c.id)));

  return (
    <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-container-low">
      {/* Desktop & Tablet Table (md and up) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Table Header */}
          <thead className="bg-surface-container-low text-on-surface-variant font-caption text-caption uppercase tracking-wider select-none border-b border-surface-container">
            <tr>
              <th className="p-3 w-10 text-center">
                <input
                  checked={isAllChecked}
                  onChange={onToggleCheckAll}
                  className="w-4 h-4 rounded text-primary focus:ring-secondary accent-primary cursor-pointer"
                  type="checkbox"
                  aria-label="Tümünü Seç"
                />
              </th>
              <th className="py-3 px-3">Müşteri Bilgisi</th>
              <th className="py-3 px-3">Rol &amp; Segment</th>
              <th className="py-3 px-3">Bölge &amp; Bütçe</th>
              <th className="py-3 px-3">Danışman</th>
              <th className="py-3 px-3">Durum</th>
              <th className="py-3 px-3 text-right">Aksiyonlar</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-surface-container-low">
            {customers.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 sm:p-6">
                  <EmptyState
                    type={isFiltered ? 'filter' : 'empty'}
                    icon={isFiltered ? 'filter_alt_off' : 'person_add'}
                    title={
                      isFiltered
                        ? 'Kriterlere Uygun Müşteri Bulunamadı'
                        : 'Henüz Müşteri Kaydı Yok'
                    }
                    description={
                      isFiltered
                        ? 'Arama veya filtre kombinasyonunuza uyan müşteri bulunamadı. Filtreleri sıfırlayarak tüm listeyi görüntüleyebilirsiniz.'
                        : 'Sistemde henüz kayıtlı müşteri bulunmuyor. Yeni bir müşteri ekleyerek başlayabilirsiniz.'
                    }
                    actionLabel={isFiltered ? 'Filtreleri Sıfırla' : 'Yeni Müşteri Ekle'}
                    onAction={isFiltered ? onResetFilters : onAddCustomer}
                  />
                </td>
              </tr>
            ) : (
              customers.map((c) => {
                const isSelected = selectedCustomerId === c.id;
                const isChecked = checkedSet ? checkedSet.has(c.id) : (checkedCustomerIds?.includes(c.id) ?? false);

                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCustomer(c)}
                    className={`cursor-pointer transition-colors group ${isSelected
                        ? 'bg-surface-container'
                        : 'hover:bg-surface-container/60'
                      }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="p-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        checked={isChecked}
                        onChange={() => onToggleCheck(c.id)}
                        className="w-4 h-4 rounded accent-primary cursor-pointer"
                        type="checkbox"
                        aria-label={`${c.name} seç`}
                      />
                    </td>

                    {/* Müşteri Bilgisi */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-full ${c.avatarBg || 'bg-primary text-on-primary'
                            } font-semibold font-label-sm text-label-sm flex items-center justify-center shrink-0 shadow-xs`}
                        >
                          {c.initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md font-semibold text-primary group-hover:text-secondary flex items-center gap-1">
                            {c.name}
                            {c.statusType === 'hot' && (
                              <span className="w-2 h-2 rounded-full bg-secondary" />
                            )}
                          </span>
                          <span className="font-caption text-caption text-on-surface-variant truncate">
                            {c.phone}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Rol & Segment */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption font-semibold ${(c.segment || '').includes('VIP')
                            ? 'bg-surface-container-highest text-primary'
                            : (c.segment || '').includes('Yatırımcı')
                              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                              : 'bg-surface-container-high text-on-surface'
                          }`}
                      >
                        {c.segment || c.role || 'Standart'}
                      </span>
                    </td>

                    {/* Bölge & Bütçe */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm font-medium text-on-surface">
                          {c.region}
                        </span>
                        <span
                          className={`font-caption text-caption font-semibold ${c.statusType === 'hot' ? 'text-secondary' : 'text-primary'
                            }`}
                        >
                          {c.budget}
                        </span>
                      </div>
                    </td>

                    {/* Danışman */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        {c.advisorAvatar ? (
                          <img
                            className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-surface-variant"
                            src={c.advisorAvatar}
                            alt={c.advisorShort}
                            width="20"
                            height="20"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container font-caption text-[10px] flex items-center justify-center font-bold">
                            {c.advisorInitials || 'BY'}
                          </div>
                        )}
                        <span className="font-caption text-caption font-medium truncate">
                          {c.advisorShort}
                        </span>
                      </div>
                    </td>

                    {/* Durum */}
                    <td className="py-3 px-3">
                      {c.statusType === 'hot' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-caption text-caption font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-error" />
                          {c.status}
                        </span>
                      ) : c.statusType === 'contract' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-secondary font-caption text-caption font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                          {c.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-caption text-caption font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                          {c.status}
                        </span>
                      )}
                    </td>

                    {/* Aksiyonlar */}
                    <td
                      className="py-3 px-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectCustomer(c)}
                          className="p-1 rounded hover:bg-surface text-secondary transition-colors"
                          title="Detay"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            visibility
                          </span>
                        </button>

                        <button
                          onClick={() => onOpenWhatsapp(c.phone)}
                          className="p-1 rounded hover:bg-surface text-on-surface-variant hover:text-secondary transition-colors"
                          title="WhatsApp"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            chat
                          </span>
                        </button>

                        <button
                          onClick={() => onOpenPhone(c.phone)}
                          className="p-1 rounded hover:bg-surface text-on-surface-variant hover:text-primary transition-colors"
                          title="Ara"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            phone
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (under md) */}
      <div className="md:hidden flex flex-col divide-y divide-surface-container-low">
        {/* Mobile Select All Bar */}
        <div className="p-3 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
          <label className="flex items-center gap-2 cursor-pointer font-label-sm text-xs font-semibold text-primary">
            <input
              checked={isAllChecked}
              onChange={onToggleCheckAll}
              className="w-4 h-4 rounded text-primary focus:ring-secondary accent-primary cursor-pointer"
              type="checkbox"
            />
            <span>Tüm Müşterileri Seç</span>
          </label>
          <span className="font-caption text-xs text-on-surface-variant">
            {customers.length} Kayıt
          </span>
        </div>

        {customers.length === 0 ? (
          <div className="p-4">
            <EmptyState
              type={isFiltered ? 'filter' : 'empty'}
              icon={isFiltered ? 'filter_alt_off' : 'person_add'}
              title={
                isFiltered
                  ? 'Kriterlere Uygun Müşteri Bulunamadı'
                  : 'Henüz Müşteri Kaydı Yok'
              }
              description={
                isFiltered
                  ? 'Arama veya filtre kombinasyonunuza uyan müşteri bulunamadı. Filtreleri sıfırlayabilirsiniz.'
                  : 'Sistemde henüz kayıtlı müşteri bulunmuyor.'
              }
              actionLabel={isFiltered ? 'Filtreleri Sıfırla' : 'Yeni Müşteri Ekle'}
              onAction={isFiltered ? onResetFilters : onAddCustomer}
            />
          </div>
        ) : (
          customers.map((c) => {
            const isSelected = selectedCustomerId === c.id;
            const isChecked = checkedSet ? checkedSet.has(c.id) : (checkedCustomerIds?.includes(c.id) ?? false);

            return (
              <div
                key={c.id}
                onClick={() => onSelectCustomer(c)}
                className={`p-3.5 flex flex-col gap-2.5 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-surface-container/70 border-l-4 border-l-primary'
                    : 'hover:bg-surface-container/30'
                }`}
              >
                {/* Top Row: Checkbox, Avatar, Name & Segment */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div onClick={(e) => e.stopPropagation()}>
                      <input
                        checked={isChecked}
                        onChange={() => onToggleCheck(c.id)}
                        className="w-4 h-4 rounded accent-primary cursor-pointer"
                        type="checkbox"
                        aria-label={`${c.name} seç`}
                      />
                    </div>
                    <div
                      className={`w-9 h-9 rounded-full ${
                        c.avatarBg || 'bg-primary text-on-primary'
                      } font-semibold font-label-sm text-xs flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      {c.initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-sm font-semibold text-primary truncate flex items-center gap-1">
                        {c.name}
                        {c.statusType === 'hot' && (
                          <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                        )}
                      </span>
                      <span className="font-caption text-xs text-on-surface-variant truncate">
                        {c.phone}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full font-caption text-[11px] font-semibold shrink-0 ${
                      (c.segment || '').includes('VIP')
                        ? 'bg-surface-container-highest text-primary'
                        : (c.segment || '').includes('Yatırımcı')
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                        : 'bg-surface-container-high text-on-surface'
                    }`}
                  >
                    {c.segment || c.role || 'Standart'}
                  </span>
                </div>

                {/* Region & Budget */}
                <div className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-surface rounded-lg border border-surface-container-low">
                  <span className="text-on-surface-variant truncate max-w-[160px]">
                    📍 {c.region}
                  </span>
                  <span className="font-semibold text-primary">
                    {c.budget}
                  </span>
                </div>

                {/* Bottom Row: Status, Advisor & Quick Touch Actions */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-caption text-[11px] font-semibold ${
                      c.statusType === 'hot'
                        ? 'bg-secondary-fixed/50 text-secondary'
                        : c.statusType === 'negotiation'
                        ? 'bg-surface-container-highest text-primary'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        c.statusType === 'hot'
                          ? 'bg-secondary animate-pulse'
                          : c.statusType === 'negotiation'
                          ? 'bg-primary'
                          : 'bg-outline'
                      }`}
                    />
                    {c.status}
                  </span>

                  <div
                    className="flex items-center gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onOpenWhatsapp(c.phone, c.name)}
                      className="h-8 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 text-xs font-semibold cursor-pointer transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => onOpenPhone(c.phone)}
                      className="h-8 w-8 rounded-lg bg-surface border border-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary cursor-pointer transition-colors"
                      type="button"
                      title="Ara"
                    >
                      <span className="material-symbols-outlined text-[16px]">phone</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Table Pagination Footer */}
      <div className="p-space-sm bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm border-t border-surface-container">
        <span className="font-caption text-caption text-on-surface-variant">
          {customers.length === 0 ? (
            'Kayıtlı müşteri bulunmuyor'
          ) : (
            <>
              Toplam {customers.length} müşteriden <strong>1 - {customers.length}</strong> arası gösteriliyor
            </>
          )}
        </span>
        {customers.length > 0 && (
          <div className="flex items-center gap-1">
            <button
              className="h-8 px-2 rounded bg-surface hover:bg-surface-container text-on-surface-variant font-label-sm text-label-sm disabled:opacity-50 border border-surface-container"
              disabled
              type="button"
            >
              Önceki
            </button>
            <button
              className="w-8 h-8 rounded bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-xs"
              type="button"
            >
              1
            </button>
            <button
              className="h-8 px-2 rounded bg-surface hover:bg-surface-container text-on-surface font-label-sm text-label-sm border border-surface-container"
              disabled
              type="button"
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(CustomerTable);


