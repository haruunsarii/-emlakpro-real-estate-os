import React, { useState, useRef, useMemo, useCallback, memo } from 'react';
import KanbanColumn from './KanbanColumn';

const KanbanBoard = memo(function KanbanBoard({
  stages = [],
  deals = [],
  onSelectDeal,
  onMoveDealStage,
  onAddDealToStage,
}) {
  const [_activeDraggingDeal, setActiveDraggingDeal] = useState(null);
  const scrollContainerRef = useRef(null);

  // Single-pass O(N) grouping of deals by stage
  const dealsByStage = useMemo(() => {
    const map = {};
    for (let i = 0; i < stages.length; i++) {
      map[stages[i].id] = [];
    }
    for (let i = 0; i < deals.length; i++) {
      const d = deals[i];
      if (map[d.stage]) {
        map[d.stage].push(d);
      } else {
        map[d.stage] = [d];
      }
    }
    return map;
  }, [stages, deals]);

  const handleDragStart = useCallback((_e, deal) => {
    setActiveDraggingDeal(deal);
  }, []);

  const handleDragEnd = useCallback(() => {
    setActiveDraggingDeal(null);
  }, []);

  const handleDropDeal = useCallback(
    (dealId, targetStageId) => {
      if (onMoveDealStage) {
        onMoveDealStage(dealId, targetStageId);
      }
    },
    [onMoveDealStage]
  );

  // Quick move to next stage (useful on mobile & tablet)
  const handleQuickMoveStage = useCallback(
    (deal) => {
      const currentIndex = stages.findIndex((s) => s.id === deal.stage);
      if (currentIndex >= 0 && currentIndex < stages.length - 1) {
        const nextStage = stages[currentIndex + 1];
        if (onMoveDealStage) {
          onMoveDealStage(deal.id, nextStage.id);
        }
      }
    },
    [stages, onMoveDealStage]
  );

  const handleScrollToStage = useCallback((stageId) => {
    const elem = document.getElementById(`kanban-col-${stageId}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, []);

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* Mobile Stage Navigator Bar */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1 px-1">
        {stages.map((stage) => {
          const count = dealsByStage[stage.id]?.length || 0;
          return (
            <button
              key={stage.id}
              onClick={() => handleScrollToStage(stage.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              type="button"
            >
              <span className={`w-2 h-2 rounded-full ${stage.dotColor || 'bg-secondary'}`} />
              <span>{stage.title}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-surface text-[10px] text-on-surface-variant font-bold">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Horizontally Scrollable Kanban Columns */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto pb-space-lg snap-x snap-mandatory scroll-smooth"
      >
        <div className="flex items-start gap-space-md min-w-[2100px] pb-4">
          {stages.map((stage) => {
            const stageDeals = dealsByStage[stage.id] || [];
            return (
              <div
                key={stage.id}
                id={`kanban-col-${stage.id}`}
                className="snap-center md:snap-start shrink-0"
              >
                <KanbanColumn
                  stage={stage}
                  deals={stageDeals}
                  onSelectDeal={onSelectDeal}
                  onDropDeal={handleDropDeal}
                  onAddDealToStage={onAddDealToStage}
                  onQuickMoveStage={handleQuickMoveStage}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default KanbanBoard;
