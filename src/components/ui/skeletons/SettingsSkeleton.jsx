import React from 'react';
import Skeleton from '../Skeleton';

export default function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-space-lg w-full max-w-[1600px] mx-auto p-space-md sm:p-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-60 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Settings Navigation Tabs Strip */}
      <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-low flex items-center gap-2 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-lg shrink-0" />
        ))}
      </div>

      {/* System Metrics Health Strip */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-low grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-6 w-16 rounded" />
          </div>
        ))}
      </div>

      {/* Main Settings Card */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-low flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-44 rounded" />
            <Skeleton className="h-4 w-60 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-container-low">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

