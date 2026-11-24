import React from 'react';

export default function DealTableView({
  deals = [],
  stages = [],
  onSelectDeal,
  onEditDeal,
  onDeleteDeal,
  onMoveStage,
}) {
  const getStageDot = (stageId) => {
    const found = stages.find((s) => s.id === stageId);
    return found ? found.dotColor : 'bg-secondary';
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
      {/* Desktop Table View (md and up) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-body-sm">
          <thead>
            <tr className="border-b border-surface-container bg-surface-container-low/60 text-on-surface-variant font-caption text-caption uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Fırsat &amp; Portföy</th>
              <th className="py-3 px-4 font-semibold">Müşteri</th>
              <th className="py-3 px-4 font-semibold">İşlem Türü</th>
              <th className="py-3 px-4 font-semibold">Aşama</th>
              <th className="py-3 px-4 font-semibold">İşlem Tutarı</th>
              <th className="py-3 px-4 font-semibold">Komisyon</th>
              <th className="py-3 px-4 font-semibold">Danışman</th>
              <th className="py-3 px-4 font-semibold">Öncelik</th>
              <th className="py-3 px-4 font-semibold text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {deals.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[36px] text-outline">
                      filter_alt_off
                    </span>
                    <span className="font-label-md font-semibold text-primary">
                      Filtrelere uygun satış/kiralama fırsatı bulunamadı
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              deals.map((deal) => (
                <tr
                  key={deal.id}
                  onClick={() => onSelectDeal(deal)}
                  className="hover:bg-surface-container-low/50 transition-colors cursor-pointer group"
                >
                  {/* Title & Property */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-primary group-hover:text-secondary transition-colors">
                        {deal.title}
                      </span>
                      <div className="flex items-center gap-1.5 text-caption font-caption text-on-surface-variant mt-0.5">
                        <span className="bg-surface-container px-1 rounded font-mono font-medium">
                          {deal.propertyId}
                        </span>
                        <span>{deal.propertyDistrict || deal.propertyLocation}</span>
                      </div>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary font-bold text-caption shrink-0">
                        {deal.customerInitials || 'M'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-on-surface">{deal.customerName}</span>
                        <span className="font-caption text-caption text-on-surface-variant">
                          {deal.customerPhone}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full font-caption text-caption font-semibold ${
                        deal.type === 'Satılık'
                          ? 'bg-secondary-fixed text-on-secondary-fixed'
                          : 'bg-surface-container text-on-surface'
                      }`}
                    >
                      {deal.type}
                    </span>
                  </td>

                  {/* Stage Dropdown */}
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-block">
                      <select
                        value={deal.stage}
                        onChange={(e) => onMoveStage && onMoveStage(deal.id, e.target.value)}
                        className="h-8 pl-6 pr-6 rounded-lg bg-surface-container font-caption text-caption font-semibold text-on-surface appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-secondary"
                      >
                        {stages.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                      <span
                        className={`w-2 h-2 rounded-full absolute left-2.5 top-1/2 -translate-y-1/2 ${getStageDot(
                          deal.stage
                        )}`}
                      />
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 font-bold text-primary">
                    {deal.amountFormatted || `₺${Number(deal.amount || 0).toLocaleString('tr-TR')}`}
                  </td>

                  {/* Commission */}
                  <td className="py-3.5 px-4 font-semibold text-secondary">
                    {deal.commissionFormatted || `₺${Number(deal.commission || 0).toLocaleString('tr-TR')}`}
                  </td>

                  {/* Advisor */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-primary-container text-on-primary text-[10px] flex items-center justify-center font-bold">
                        {deal.advisorInitials || 'BY'}
                      </div>
                      <span className="text-on-surface">{deal.advisor}</span>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4">
                    {deal.isUrgent || deal.priority === 'Kritik' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-caption text-caption bg-error-container text-error font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                        Kritik
                      </span>
                    ) : deal.priority === 'Yüksek' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption bg-amber-100 text-amber-800 font-semibold">
                        Yüksek
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption bg-surface-container text-on-surface-variant font-medium">
                        Normal
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onSelectDeal(deal)}
                        className="p-1 rounded text-on-surface-variant hover:text-secondary hover:bg-surface-container"
                        title="Detay Görüntüle"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>

                      <button
                        onClick={() => onEditDeal(deal)}
                        className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container"
                        title="Düzenle"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>

                      <button
                        onClick={() => onDeleteDeal(deal)}
                        className="p-1 rounded text-on-surface-variant hover:text-error hover:bg-error-container/30"
                        title="Sil"
                        type="button"
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

      {/* Mobile Card View (under md) */}
      <div className="md:hidden flex flex-col divide-y divide-surface-container">
        {deals.length === 0 ? (
          <div className="py-12 px-4 text-center text-on-surface-variant flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[36px] text-outline">
              filter_alt_off
            </span>
            <span className="font-label-md font-semibold text-primary">
              Filtrelere uygun fırsat bulunamadı
            </span>
          </div>
        ) : (
          deals.map((deal) => {
            const currentStage = stages.find((s) => s.id === deal.stage);
            return (
              <div
                key={deal.id}
                onClick={() => onSelectDeal(deal)}
                className="p-3.5 flex flex-col gap-2 hover:bg-surface-container-low/50 transition-colors cursor-pointer"
              >
                {/* Title & Stage */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono font-bold text-xs text-secondary">
                      {deal.id}
                    </span>
                    <h4 className="font-semibold text-primary text-sm truncate">
                      {deal.title}
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 font-caption text-xs bg-surface-container px-2 py-0.5 rounded-full shrink-0 font-medium">
                    <span className={`w-2 h-2 rounded-full ${getStageDot(deal.stage)}`} />
                    <span>{currentStage ? currentStage.title : deal.stage}</span>
                  </span>
                </div>

                {/* Customer & Location */}
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span className="truncate max-w-[170px]">
                    👤 {deal.customerName}
                  </span>
                  <span>📍 {deal.propertyDistrict || 'İstanbul'}</span>
                </div>

                {/* Amount, Commission & Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-surface-container/40">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-primary">
                      {deal.amountFormatted || `₺${Number(deal.amount || 0).toLocaleString('tr-TR')}`}
                    </span>
                    <span className="font-caption text-[11px] text-secondary font-semibold">
                      Komisyon: {deal.commissionFormatted}
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onSelectDeal(deal)}
                      className="h-8 w-8 rounded-lg bg-surface border border-surface-container flex items-center justify-center text-on-surface-variant hover:text-secondary cursor-pointer"
                      type="button"
                      title="Detay"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                    </button>
                    <button
                      onClick={() => onEditDeal(deal)}
                      className="h-8 w-8 rounded-lg bg-surface border border-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary cursor-pointer"
                      type="button"
                      title="Düzenle"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteDeal(deal)}
                      className="h-8 w-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 hover:bg-rose-100 cursor-pointer"
                      type="button"
                      title="Sil"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

