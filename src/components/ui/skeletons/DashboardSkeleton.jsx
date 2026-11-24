import React from 'react';
import Skeleton from '../Skeleton';

export default function DashboardSkeleton() {
  return (
    <div className="p-margin-sm xl:p-margin max-w-[1600px] w-full mx-auto flex flex-col gap-space-lg">
      {/* 1. Header / Action Bar Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-sm border-b border-surface-container-low">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* 2. 5 KPI Metrics Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container-low shadow-xs flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-32 rounded-lg" />
            <Skeleton className="h-3 w-40 rounded" />
          </div>
        ))}
      </div>

      {/* 3. 2-Column Operational Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* Left Column (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-space-lg">
          {/* Revenue Chart Skeleton */}
          <div className="p-space-lg rounded-2xl bg-surface-container-lowest border border-surface-container-low shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-6 w-48 rounded" />
                <Skeleton className="h-3 w-64 rounded" />
              </div>
              <Skeleton className="h-8 w-32 rounded-lg" />
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>

          {/* Recent Properties Grid Skeleton */}
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-60 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-surface-container-lowest border border-surface-container-low overflow-hidden shadow-xs flex flex-col"
                >
                  <Skeleton className="h-44 w-full rounded-none" />
                  <div className="p-4 flex flex-col gap-2.5">
                    <Skeleton className="h-5 w-3/4 rounded" />
                    <Skeleton className="h-4 w-1/2 rounded" />
                    <div className="flex items-center justify-between pt-2 border-t border-surface-container-low">
                      <Skeleton className="h-5 w-24 rounded" />
                      <Skeleton className="h-4 w-16 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-space-lg">
          {/* Appointments Skeleton */}
          <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container-low shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
                <Skeleton className="h-3 w-48 rounded" />
              </div>
            ))}
          </div>

          {/* Activity Timeline Skeleton */}
          <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container-low shadow-xs flex flex-col gap-3">
            <Skeleton className="h-6 w-36 rounded" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 py-1.5">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
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

