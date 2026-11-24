import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import PortalHeader from './PortalHeader';
import PortalFooter from './PortalFooter';
import PageSkeleton from '../../components/ui/skeletons/PageSkeleton';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

/**
 * PortalLayout Component
 * Standalone, customer-facing layout without CRM sidebar.
 * Includes public PortalHeader, children/outlet area, and PortalFooter.
 */
export default function PortalLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans text-on-surface antialiased overflow-x-hidden">
      {/* Customer Portal Public Header */}
      <PortalHeader />

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-x-hidden">
        <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            {children || <Outlet />}
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Customer Portal Corporate Footer */}
      <PortalFooter />
    </div>
  );
}

