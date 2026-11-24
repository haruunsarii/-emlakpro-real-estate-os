import React, { memo } from 'react';

function PropertyPagination({
  currentPage = 1,
  totalItems = 15,
  itemsPerPage = 10,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(totalItems, currentPage * itemsPerPage);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-low">
      <div className="font-body-sm text-body-sm text-on-surface-variant">
        {totalItems} portföyden{' '}
        <span className="font-semibold text-primary">
          {startItem} - {endItem}
        </span>{' '}
        arası gösteriliyor
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange && onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-surface-container cursor-pointer"
          type="button"
          aria-label="Önceki sayfa"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          <span>Önceki</span>
        </button>

        {pageNumbers.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              onClick={() => onPageChange && onPageChange(p)}
              className={`w-8 h-8 rounded-lg font-label-sm text-label-sm font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                  : 'bg-surface hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-surface-container'
              }`}
              type="button"
              aria-label={`Sayfa ${p}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange && onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-surface-container cursor-pointer"
          type="button"
          aria-label="Sonraki sayfa"
        >
          <span>Sonraki</span>
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
}

export default memo(PropertyPagination);
