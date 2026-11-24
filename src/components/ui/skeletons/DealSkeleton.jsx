import React from 'react';
import Skeleton from '../Skeleton';

export default function DealSkeleton() {
  return (
    <div className="flex flex-col gap-space-lg w-full max-w-[1700px] mx-auto p-space-lg lg:p-margin">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-low flex flex-col gap-2"
          >
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-7 w-28 rounded" />
          </div>
        ))}
      </div>

      {/* Filters Strip */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-low flex flex-col gap-3">
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>

      {/* 8 Kanban Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-space-md">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
          <div
            key={col}
            className="flex flex-col gap-space-sm p-3 rounded-2xl bg-surface-container-lowest border border-surface-container-low min-h-[420px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-6 rounded-full" />
            </div>
            {/* Deal Cards */}
            {[1, 2].map((card) => (
              <div
                key={card}
                className="p-3 rounded-xl bg-surface border border-surface-container-low flex flex-col gap-2"
              >
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-3 w-3/4 rounded" />
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-4 w-16 rounded" />
                  <Skeleton className="w-6 h-6 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

