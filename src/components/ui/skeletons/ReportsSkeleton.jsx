import React from 'react';
import Skeleton from '../Skeleton';

export default function ReportsSkeleton() {
  return (
    <div className="flex flex-col gap-space-lg w-full max-w-[1600px] mx-auto p-space-md sm:p-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-60 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Date Presets Strip */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-low flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg shrink-0" />
          ))}
        </div>
        <Skeleton className="h-9 w-44 rounded-lg" />
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-low flex flex-col gap-2"
          >
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-8 w-36 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
        ))}
      </div>

      {/* 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-low flex flex-col gap-4">
          <Skeleton className="h-6 w-44 rounded" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-low flex flex-col gap-4">
          <Skeleton className="h-6 w-44 rounded" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>

      {/* Transactions Table Skeleton */}
      <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-low flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-52 rounded" />
          <Skeleton className="h-9 w-48 rounded-lg" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-surface-container-low">
            <Skeleton className="h-5 w-36 rounded" />
            <Skeleton className="h-5 w-28 rounded" />
            <Skeleton className="h-5 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

