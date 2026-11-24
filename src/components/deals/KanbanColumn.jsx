import React, { useState, useMemo, memo } from 'react';
import DealCard from './DealCard';

const KanbanColumn = memo(function KanbanColumn({
  stage,
  deals = [],
  onSelectDeal,
  onDropDeal,
  onAddDealToStage,
  onQuickMoveStage,
  onDragStart,
  onDragEnd,
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const totalVolume = useMemo(() => {
    return deals.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [deals]);

  const formatTL = (num) => {
    return '₺' + Number(num || 0).toLocaleString('tr-TR');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Only if leaving the actual container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const dealId = e.dataTransfer.getData('text/plain');
    if (dealId && onDropDeal) {
      onDropDeal(dealId, stage.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-[300px] shrink-0 flex flex-col rounded-xl p-space-sm shadow-sm transition-all border ${
        isDragOver
          ? 'bg-secondary-fixed/30 border-secondary ring-2 ring-secondary/50 scale-[1.01]'
          : 'bg-surface-container-low border-surface-container/60'
      } ${stage.isLost ? 'opacity-90' : ''}`}
    >
      {/* 1. Column Header */}
      <div className="flex items-center justify-between p-space-xs mb-space-xs">
        <div className="flex items-center gap-space-xs">
          <span className={`w-2.5 h-2.5 rounded-full ${stage.dotColor || 'bg-secondary'}`} />
          <span className="font-headline-sm text-headline-sm text-primary font-bold text-[16px]">
            {stage.title}
          </span>
          <span className="px-2 py-0.5 rounded-full font-caption text-caption bg-surface-container-highest text-on-surface-variant font-bold text-[11px]">
            {deals.length}
          </span>
        </div>
        <span className="font-caption text-caption text-on-surface-variant font-semibold">
          {formatTL(totalVolume)}
        </span>
      </div>

      {/* 2. Stage Progress Indicator */}
      <div className="w-full bg-surface-container h-1 rounded-full mb-space-sm overflow-hidden">
        <div
          className={`${stage.dotColor || 'bg-secondary'} h-full rounded-full transition-all duration-500`}
          style={{ width: `${stage.progress || 15}%` }}
        />
      </div>

      {/* 3. Cards Deck */}
      <div className="flex flex-col gap-space-sm min-h-[120px]">
        {deals.length === 0 ? (
          <div
            className={`h-28 rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-3 text-center transition-colors ${
              isDragOver
                ? 'border-secondary bg-secondary-fixed/40 text-secondary'
                : 'border-surface-container text-outline'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {isDragOver ? 'move_to_inbox' : 'inbox'}
            </span>
            <span className="font-caption text-caption mt-1">
              {isDragOver ? 'Fırsatı buraya bırakın' : 'Bu aşamada fırsat yok'}
            </span>
          </div>
        ) : (
          deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onSelectDeal={onSelectDeal}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onQuickMoveStage={onQuickMoveStage}
            />
          ))
        )}
      </div>

      {/* 4. Column Bottom Action */}
      <button
        onClick={() => onAddDealToStage(stage.id)}
        className="mt-space-sm p-2 rounded-lg bg-surface-container-lowest/70 hover:bg-surface-container-lowest text-on-surface-variant hover:text-primary font-label-sm text-label-sm font-medium flex items-center justify-center gap-1 transition-all cursor-pointer border border-surface-container/60 hover:border-secondary shadow-2xs"
        type="button"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        <span>Bu Aşamaya Ekle</span>
      </button>
    </div>
  );
});

export default KanbanColumn;

