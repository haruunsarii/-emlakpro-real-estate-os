import React from 'react';
import Skeleton from '../Skeleton';

export default function RequestSkeleton() {
  return (
    <div className="p-space-lg xl:p-margin flex flex-col gap-space-lg max-w-[1700px] w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-60 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-low flex flex-col gap-2"
          >
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-7 w-20 rounded" />
          </div>
        ))}
      </div>

      {/* Filters Strip */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-low flex flex-col gap-3">
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>

      {/* 2-Panel Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-sm">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-low flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-36 rounded" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-28 rounded" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-24 rounded-lg" />
                <Skeleton className="h-6 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Right Column (7 cols) */}
        <div className="lg:col-span-7 rounded-xl bg-surface-container-lowest border border-surface-container-low p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-surface-container pb-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-4 w-36 rounded" />
            </div>
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

