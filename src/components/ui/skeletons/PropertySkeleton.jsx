import React from 'react';
import Skeleton from '../Skeleton';

export default function PropertySkeleton() {
  return (
    <div className="p-space-lg xl:p-margin flex flex-col gap-space-lg max-w-[1700px] w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-low flex flex-col gap-2"
          >
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-7 w-20 rounded" />
          </div>
        ))}
      </div>

      {/* Filters Strip */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-low flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          <Skeleton className="h-11 w-full lg:w-96 rounded-xl" />
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-lg shrink-0" />
            ))}
          </div>
        </div>
      </div>

      {/* 3-Col Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl bg-surface-container-lowest border border-surface-container-low overflow-hidden shadow-xs flex flex-col"
          >
            <Skeleton className="h-64 w-full rounded-none" />
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-28 rounded-full" />
              </div>
              <Skeleton className="h-6 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-surface-container-low">
                <Skeleton className="h-8 rounded-lg" />
                <Skeleton className="h-8 rounded-lg" />
                <Skeleton className="h-8 rounded-lg" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <Skeleton className="h-6 w-28 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest border border-surface-container-low">
        <Skeleton className="h-5 w-48 rounded" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

