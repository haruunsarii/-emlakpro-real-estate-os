import React, { useState, useMemo, memo } from 'react';
import EmptyState from '../ui/EmptyState';
import { RECENT_TRANSACTIONS } from '../../services/reportsData';
import { matchesAnyTurkishField } from '../../utils/turkishSearch';

function RecentTransactionsTable({ transactions = RECENT_TRANSACTIONS }) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'sale' | 'rental'
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterType === 'sale' && !tx.isSale) return false;
      if (filterType === 'rental' && tx.isSale) return false;
      if (searchTerm.trim()) {
        const match = matchesAnyTurkishField(
          [tx.clientName, tx.propertyTitle, tx.code, tx.id, tx.advisorName, tx.consultant],
          searchTerm
        );
        if (!match) return false;
      }
      return true;
    });
  }, [transactions, filterType, searchTerm]);

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-surface-container shadow-xs flex flex-col justify-between">
      {/* Başlık ve Filtre Düğmeleri */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-space-md border-b border-surface-container/60 gap-space-sm">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-secondary text-[24px]">receipt_long</span>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
              Son Gerçekleşen İşlemler
            </h3>
            <p className="font-caption text-caption text-on-surface-variant">
              Ofis danışmanları tarafından başarıyla tamamlanan en son satış ve kiralama sözleşmeleri ({filtered.length} İşlem)
            </p>
          </div>
        </div>

        {/* Arama ve Satış / Kira Filtre Butonları */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Arama Girişi */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="İşlem, müşteri veya portföy ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs rounded-lg border border-surface-container bg-surface-container-low text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary w-44 sm:w-56"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtre Düğmeleri */}
          <div className="flex p-0.5 bg-surface-container-low rounded-lg border border-surface-container">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Tümü
            </button>
            <button
              type="button"
              onClick={() => setFilterType('sale')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                filterType === 'sale'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Satış
            </button>
            <button
              type="button"
              onClick={() => setFilterType('rental')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                filterType === 'rental'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Kiralama
            </button>
          </div>
        </div>
      </div>

      {/* Mobil Kart Görünümü (< md) */}
      <div className="md:hidden flex flex-col gap-3 pt-3">
        {filtered.length === 0 ? (
          <EmptyState
            type={searchTerm || filterType !== 'all' ? 'filter' : 'empty'}
            compact
            icon="receipt_long"
            title="İşlem Kaydı Bulunamadı"
            description={
              searchTerm || filterType !== 'all'
                ? 'Filtreleme kriterlerinize uygun tamamlanmış işlem bulunamadı.'
                : 'Henüz tamamlanmış bir satış veya kiralama sözleşmesi kaydedilmemiş.'
            }
            actionLabel={searchTerm || filterType !== 'all' ? 'Filtreleri Sıfırla' : null}
            onAction={() => {
              setSearchTerm('');
              setFilterType('all');
            }}
          />
        ) : (
          filtered.map((tx) => (
            <div
              key={tx.id}
              className="bg-surface-container-low/60 rounded-xl p-3 border border-surface-container flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      tx.isSale
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {tx.type}
                  </span>
                  <span className="font-mono text-xs font-bold text-primary">
                    {tx.code}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full font-caption text-[10px] font-bold ${
                    tx.statusClass || 'bg-surface-container text-on-surface'
                  }`}
                >
                  {tx.status}
                </span>
              </div>

              <div>
                <p className="font-label-sm text-xs font-semibold text-primary">
                  {tx.propertyTitle}
                </p>
                <p className="font-caption text-[10px] text-outline font-mono">
                  {tx.propertyCode}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-surface-container text-xs">
                <div>
                  <span className="font-caption text-[10px] text-outline block">Müşteri</span>
                  <span className="font-label-sm text-xs font-bold text-primary">{tx.clientName}</span>
                </div>
                <div className="text-right">
                  <span className="font-caption text-[10px] text-outline block">Tutar &amp; Komisyon</span>
                  <span className="font-label-sm text-xs font-bold text-primary">{tx.amount}</span>
                  <span className="block text-[10px] text-secondary font-mono">{tx.commission}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-surface-container/60 text-[11px] text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <img
                    src={tx.advisorAvatar}
                    alt={tx.advisorName}
                    width="20"
                    height="20"
                    loading="lazy"
                    decoding="async"
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                  />
                  <span className="font-medium truncate max-w-[120px]">{tx.advisorName}</span>
                </div>
                <span className="font-caption text-[10px] text-outline">
                  {tx.date} • {tx.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Masaüstü Tablo Alanı (>= md) */}
      <div className="hidden md:block overflow-x-auto pt-2">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-surface-container font-caption text-caption text-on-surface-variant uppercase tracking-wider">
              <th className="py-space-sm px-space-md">İşlem &amp; Kod</th>
              <th className="py-space-sm px-space-sm">Müşteri</th>
              <th className="py-space-sm px-space-sm">Gayrimenkul Portföyü</th>
              <th className="py-space-sm px-space-sm">Danışman</th>
              <th className="py-space-sm px-space-sm text-right">İşlem Tutarı</th>
              <th className="py-space-sm px-space-sm">Tarih</th>
              <th className="py-space-sm px-space-md text-right">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container/60 text-sm">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6">
                  <EmptyState
                    type={searchTerm || filterType !== 'all' ? 'filter' : 'empty'}
                    icon="receipt_long"
                    title="Seçili Filtrelere Uygun İşlem Kaydı Bulunamadı"
                    description={
                      searchTerm || filterType !== 'all'
                        ? 'Arama teriminize veya işlem türü filtrenize uygun sözleşme bulunamadı. Filtreleri sıfırlayabilirsiniz.'
                        : 'Satış veya kiralama hunisinde bir fırsat "Tamamlandı" aşamasına taşındığında gerçek sözleşme kaydı olarak burada listelenir.'
                    }
                    actionLabel={searchTerm || filterType !== 'all' ? 'Filtreleri Sıfırla' : null}
                    onAction={() => {
                      setSearchTerm('');
                      setFilterType('all');
                    }}
                  />
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
              <tr
                key={tx.id}
                className="hover:bg-surface-container-low/60 transition-colors group"
              >
                {/* İşlem Rozeti & Kodu */}
                <td className="py-space-sm px-space-md">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        tx.isSale
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {tx.type}
                    </span>
                    <span className="font-mono text-xs font-bold text-primary">
                      {tx.code}
                    </span>
                  </div>
                </td>

                {/* Müşteri */}
                <td className="py-space-sm px-space-sm">
                  <div className="flex flex-col">
                    <span className="font-label-md text-xs font-bold text-primary">
                      {tx.clientName}
                    </span>
                    <span className="font-caption text-[11px] text-on-surface-variant">
                      {tx.clientRole}
                    </span>
                  </div>
                </td>

                {/* Gayrimenkul */}
                <td className="py-space-sm px-space-sm">
                  <div className="flex flex-col max-w-[220px]">
                    <span className="font-label-sm text-xs font-semibold text-primary truncate">
                      {tx.propertyTitle}
                    </span>
                    <span className="font-caption text-[10px] text-outline font-mono">
                      {tx.propertyCode}
                    </span>
                  </div>
                </td>

                {/* Danışman */}
                <td className="py-space-sm px-space-sm">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={tx.advisorAvatar}
                      alt={tx.advisorName}
                      width="24"
                      height="24"
                      loading="lazy"
                      decoding="async"
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                    />
                    <span className="font-label-sm text-xs text-on-surface font-medium truncate max-w-[110px]">
                      {tx.advisorName}
                    </span>
                  </div>
                </td>

                {/* İşlem Tutarı & Komisyon */}
                <td className="py-space-sm px-space-sm text-right">
                  <div className="flex flex-col">
                    <span className="font-label-md text-xs font-bold text-primary">
                      {tx.amount}
                    </span>
                    <span className="font-caption text-[10px] text-secondary font-mono">
                      Komisyon: {tx.commission}
                    </span>
                  </div>
                </td>

                {/* Tarih */}
                <td className="py-space-sm px-space-sm font-caption text-xs text-on-surface-variant">
                  {tx.date}
                  <span className="block text-[10px] text-outline">{tx.time}</span>
                </td>

                {/* Durum Rozeti */}
                <td className="py-space-sm px-space-md text-right">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full font-caption text-[10px] font-bold ${
                      tx.statusClass || 'bg-surface-container text-on-surface'
                    }`}
                  >
                    {tx.status}
                  </span>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(RecentTransactionsTable);

