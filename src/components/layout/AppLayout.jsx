import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import PageSkeleton from '../ui/skeletons/PageSkeleton';
import ErrorBoundary from '../ui/ErrorBoundary';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pl-0 lg:pl-[260px] min-h-screen flex flex-col transition-all overflow-x-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="relative pt-16 flex-1 bg-surface overflow-x-hidden">
          <ErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              {children || <Outlet />}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
