import React from 'react';
import Skeleton from '../Skeleton';

export default function TaskSkeleton() {
  return (
    <div className="flex flex-col gap-space-lg w-full max-w-[1600px] mx-auto p-space-md sm:p-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
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
            <Skeleton className="h-7 w-20 rounded" />
          </div>
        ))}
      </div>

      {/* Calendar Toolbar */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-low flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-44 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-64 rounded-lg" />
      </div>

      {/* Main Split Grid: 8 cols Calendar / 4 cols Task List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Calendar Matrix (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-surface-container-lowest border border-surface-container-low p-5 flex flex-col gap-4">
          <div className="grid grid-cols-7 gap-2 border-b border-surface-container pb-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-6 w-full rounded" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 min-h-[360px]">
            {[...Array(28)].map((_, idx) => (
              <Skeleton key={idx} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>

        {/* Task List / Drawer (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="rounded-2xl bg-surface-container-lowest border border-surface-container-low p-5 flex flex-col gap-3">
            <Skeleton className="h-6 w-40 rounded" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-surface-container-low">
                <Skeleton className="w-5 h-5 rounded" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

