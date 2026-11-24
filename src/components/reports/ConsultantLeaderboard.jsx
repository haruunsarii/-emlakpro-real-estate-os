import React, { useState, useMemo, useCallback, memo } from 'react';
import { CONSULTANT_LEADERBOARD } from '../../services/reportsData';

function ConsultantLeaderboard({
  consultants = CONSULTANT_LEADERBOARD,
  selectedConsultant = 'all',
}) {
  const [sortField, setSortField] = useState('dealsCount');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  }, [sortField]);

  // Filtreleme
  const filteredList = useMemo(() => {
    return consultants.filter((c) => {
      if (selectedConsultant !== 'all' && c.id !== selectedConsultant && c.name !== selectedConsultant) {
        return false;
      }
      return true;
    });
  }, [consultants, selectedConsultant]);

  // Sıralama
  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'salesVolume') {
        aVal = a.salesVolumeNumeric;
        bVal = b.salesVolumeNumeric;
      } else if (sortField === 'commission') {
        aVal = a.commissionNumeric;
        bVal = b.commissionNumeric;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
  }, [filteredList, sortField, sortOrder]);

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-space-lg border border-surface-container shadow-xs flex flex-col justify-between">
      {/* Başlık ve Filtre Bilgisi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-md border-b border-surface-container/60 gap-space-sm">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-secondary text-[24px]">leaderboard</span>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
              Danışman Performans Sıralaması
            </h3>
            <p className="font-caption text-caption text-on-surface-variant">
              İşlem hacmi, komisyon hasılatı, kota hedefleri ve müşteri dönüşüm liderliği
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-caption text-on-surface-variant">
          <span className={`w-2 h-2 rounded-full ${filteredList.length > 0 ? 'bg-emerald-500' : 'bg-outline-variant'}`} />
          <span>{filteredList.length} Aktif Danışman</span>
        </div>
      </div>

      {/* Liderlik Tablosu */}
      <div className="overflow-x-auto pt-2">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-surface-container font-caption text-caption text-on-surface-variant uppercase tracking-wider">
              <th className="py-space-sm px-space-md">Sıra &amp; Danışman</th>
              <th
                onClick={() => handleSort('dealsCount')}
                className="py-space-sm px-space-sm cursor-pointer hover:text-primary transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Tamamlanan İşlem</span>
                  <span className="material-symbols-outlined text-[14px]">
                    {sortField === 'dealsCount' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                  </span>
                </div>
              </th>
              <th
                onClick={() => handleSort('salesVolume')}
                className="py-space-sm px-space-sm cursor-pointer hover:text-primary transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Satış Hacmi (GDV)</span>
                  <span className="material-symbols-outlined text-[14px]">
                    {sortField === 'salesVolume' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                  </span>
                </div>
              </th>
              <th
                onClick={() => handleSort('commission')}
                className="py-space-sm px-space-sm cursor-pointer hover:text-primary transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Komisyon Geliri</span>
                  <span className="material-symbols-outlined text-[14px]">
                    {sortField === 'commission' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                  </span>
                </div>
              </th>
              <th className="py-space-sm px-space-sm w-44">Kota &amp; Performans</th>
              <th
                onClick={() => handleSort('conversionRate')}
                className="py-space-sm px-space-md text-right cursor-pointer hover:text-primary transition-colors select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Dönüşüm</span>
                  <span className="material-symbols-outlined text-[14px]">
                    {sortField === 'conversionRate' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container/60 text-sm">
            {sortedList.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-xs text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[32px] text-outline">group_off</span>
                    <span className="font-semibold text-primary">Kayıtlı Danışman veya İşlem Bulunmuyor</span>
                    <p className="max-w-xs text-outline leading-relaxed">Ayarlar bölümünden yeni personel eklediğinizde veya satış fırsatları oluşturulduğunda performans sıralaması burada listelenecektir.</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedList.map((agent) => (
              <tr
                key={agent.id}
                className="hover:bg-surface-container-low/60 transition-colors group"
              >
                {/* Sıra & Danışman Avatarı & Bilgisi */}
                <td className="py-space-sm px-space-md">
                  <div className="flex items-center gap-space-sm">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-caption text-[11px] shrink-0 ${agent.rank === 1
                          ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                          : agent.rank === 2
                            ? 'bg-secondary-fixed text-on-secondary-fixed'
                            : 'bg-surface-container text-on-surface'
                        }`}
                    >
                      #{agent.rank}
                    </span>
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      width="40"
                      height="40"
                      loading="lazy"
                      decoding="async"
                      className="w-10 h-10 rounded-full object-cover shadow-xs border border-surface-container shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-sm font-bold text-primary group-hover:text-secondary transition-colors truncate">
                        {agent.name}
                      </span>
                      <span className="font-caption text-xs text-on-surface-variant truncate">
                        {agent.role}
                      </span>
                    </div>
                  </div>
                </td>

                {/* İşlem Sayısı */}
                <td className="py-space-sm px-space-sm font-label-md text-sm font-semibold text-primary">
                  {agent.dealsCount} İşlem
                  <span className="block text-[11px] text-outline font-normal">
                    {agent.salesCount} Satış • {agent.rentalCount} Kira
                  </span>
                </td>

                {/* Satış Hacmi */}
                <td className="py-space-sm px-space-sm font-body-sm text-sm text-on-surface font-medium">
                  {agent.salesVolume}
                </td>

                {/* Komisyon Geliri */}
                <td className="py-space-sm px-space-sm font-label-md text-sm font-bold text-primary">
                  {agent.commission}
                </td>

                {/* Performans Barı & Kota */}
                <td className="py-space-sm px-space-sm">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-caption font-caption text-[11px]">
                      <span className={agent.quotaClass}>{agent.quotaLabel}</span>
                      <span className="text-on-surface-variant">{agent.target}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${agent.quotaBarColor}`}
                        style={{ width: `${Math.min(100, agent.quotaRate)}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Dönüşüm Oranı */}
                <td className="py-space-sm px-space-md text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md font-label-sm text-xs font-bold ${agent.conversionClass
                      }`}
                  >
                    %{agent.conversionRate}
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

export default memo(ConsultantLeaderboard);


