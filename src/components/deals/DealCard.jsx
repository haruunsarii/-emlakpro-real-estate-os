import React, { memo } from 'react';

const DealCard = memo(function DealCard({
  deal,
  onSelectDeal,
  onDragStart,
  onDragEnd,
  onQuickMoveStage,
}) {
  const isWon = deal.stage === 'tamamlandi';
  const isLost = deal.stage === 'kaybedildi';

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', deal.id);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(e, deal);
  };

  return (
    <div
      draggable={!isWon && !isLost}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onSelectDeal(deal)}
      className={`p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all cursor-pointer group border select-none relative ${
        deal.isUrgent
          ? 'border-error/40 hover:border-error bg-gradient-to-br from-surface-container-lowest to-error-container/10'
          : isWon
          ? 'border-emerald-200 hover:border-emerald-500'
          : isLost
          ? 'border-surface-container-high opacity-80'
          : 'border-surface-container hover:border-secondary'
      }`}
    >
      {/* Top Row: Type Badge, Urgent Warning, Drag Handle */}
      <div className="flex items-center justify-between mb-space-xs gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {isWon ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-caption text-caption bg-secondary-container text-white font-bold">
              <span>Satış Başarılı</span>
              <span className="material-symbols-outlined text-[13px]">check</span>
            </span>
          ) : isLost ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption bg-error-container text-error font-semibold">
              Vazgeçildi
            </span>
          ) : (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption font-semibold ${
                deal.type === 'Satılık'
                  ? 'bg-secondary-fixed text-on-secondary-fixed'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              {deal.type}
            </span>
          )}

          {deal.isUrgent && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-caption text-[10px] bg-error-container text-error font-bold animate-pulse">
              <span className="material-symbols-outlined text-[12px]">warning</span>
              <span>Acil Takip</span>
            </span>
          )}
        </div>

        {/* Drag Icon or Stage Time */}
        <div className="flex items-center gap-1 text-on-surface-variant">
          {!isWon && !isLost && (
            <span
              className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary transition-colors cursor-grab"
              title="Sürükle & Bırak"
            >
              drag_indicator
            </span>
          )}
        </div>
      </div>

      {/* Deal Title */}
      <h4 className="font-label-md text-label-md text-primary font-bold line-clamp-1 group-hover:text-secondary transition-colors mt-1">
        {deal.title}
      </h4>

      {/* Property Code & Location */}
      <div className="flex items-center gap-2 mt-1 mb-space-xs text-caption font-caption text-on-surface-variant">
        <span className="bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded font-mono font-medium">
          {deal.propertyId || 'PORT-XXXX'}
        </span>
        <span className="truncate">{deal.propertyLocation || 'İstanbul'}</span>
      </div>

      {/* Customer Row */}
      <div className="flex items-center gap-space-sm my-2 pt-1 border-t border-surface-container/60">
        <div className="w-7 h-7 rounded-full bg-secondary-fixed/60 flex items-center justify-center font-label-sm text-label-sm font-bold text-secondary shrink-0">
          {deal.customerInitials || 'SV'}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">
            {deal.customerName}
          </span>
          <span className="font-caption text-caption text-on-surface-variant truncate">
            {deal.customerRole || 'Müşteri'}
          </span>
        </div>
      </div>

      {/* Financial Box: Price & Commission */}
      <div className="p-space-xs rounded-lg bg-surface-container-low flex items-center justify-between my-2 border border-surface-container/60">
        <div>
          <span className="font-caption text-[10px] text-on-surface-variant uppercase tracking-wider block font-semibold">
            {deal.type === 'Kiralık' ? 'Aylık Kira' : 'Fırsat Değeri'}
          </span>
          <span className="font-label-md text-label-md text-primary font-bold">
            {deal.amountFormatted || `₺${Number(deal.amount || 0).toLocaleString('tr-TR')}`}
          </span>
        </div>
        <div className="text-right">
          <span className="font-caption text-[10px] text-on-surface-variant uppercase tracking-wider block font-semibold">
            {isWon ? 'Kazanılan' : 'Hizmet Bedeli'}
          </span>
          <span className="font-caption text-caption text-secondary font-bold">
            {deal.commissionFormatted || `₺${Number(deal.commission || 0).toLocaleString('tr-TR')}`}
          </span>
        </div>
      </div>

      {/* Footer: Activity & Actions */}
      <div className="flex items-center justify-between text-on-surface-variant font-caption text-caption pt-space-xs border-t border-surface-container/60">
        {/* Status / Activity Text */}
        <span
          className={`flex items-center gap-1 font-medium truncate max-w-[170px] ${
            deal.isUrgent ? 'text-error font-bold' : isWon ? 'text-secondary font-bold' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {deal.isUrgent
              ? 'priority_high'
              : isWon
              ? 'receipt_long'
              : deal.nextAction?.includes('randevu') || deal.nextAction?.includes('Ofis')
              ? 'event'
              : 'schedule'}
          </span>
          <span className="truncate">{deal.lastActivity || deal.nextAction || 'Aktif takip'}</span>
        </span>

        {/* Quick Contact & Advisor Avatar */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <a
            href={`https://wa.me/${(deal.customerPhone || '905338194420').replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded text-on-surface-variant hover:text-secondary hover:bg-surface-container transition-colors"
            title="WhatsApp Görüşmesi"
          >
            <span className="material-symbols-outlined text-[16px]">chat</span>
          </a>

          <a
            href={`tel:${deal.customerPhone || '+905338194420'}`}
            className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
            title="Telefon ile Ara"
          >
            <span className="material-symbols-outlined text-[16px]">call</span>
          </a>

          {/* Quick Stage Forward Button on Card */}
          {onQuickMoveStage && !isWon && !isLost && (
            <button
              onClick={() => onQuickMoveStage(deal)}
              className="p-1 rounded text-on-surface-variant hover:text-secondary hover:bg-surface-container transition-colors"
              title="Bir Sonraki Aşamaya İlerlet"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          )}

          {/* Advisor Initials Badge */}
          <div
            className="w-5 h-5 rounded-full bg-primary-container text-on-primary text-[10px] flex items-center justify-center font-bold shadow-2xs"
            title={`Danışman: ${deal.advisor || 'Burak Yılmaz'}`}
          >
            {deal.advisorInitials || 'BY'}
          </div>
        </div>
      </div>
    </div>
  );
});

export default DealCard;

