import React from 'react';
import Skeleton from '../Skeleton';

export default function CustomerSkeleton() {
  return (
    <div className="p-space-md sm:p-space-lg flex flex-col gap-space-lg max-w-[1700px] w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-56 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-low shadow-xs flex flex-col gap-2"
          >
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-7 w-20 rounded" />
          </div>
        ))}
      </div>

      {/* Filter Strip */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-low flex flex-col md:flex-row gap-3 items-center justify-between">
        <Skeleton className="h-11 w-full md:w-96 rounded-xl" />
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Table Column (7 cols) */}
        <div className="lg:col-span-7 rounded-xl bg-surface-container-lowest border border-surface-container-low overflow-hidden p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-surface-container pb-3">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-5 w-24 rounded" />
          </div>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-surface-container-low">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-3 w-48 rounded" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>

        {/* Detail Column (5 cols) */}
        <div className="lg:col-span-5 rounded-xl bg-surface-container-lowest border border-surface-container-low p-5 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-2xl" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="h-6 w-44 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

