import React, { lazy } from 'react';
import { useAuth } from '../hooks/useAuth';
import PageSkeleton from '../components/ui/skeletons/PageSkeleton';
import PortalLayout from '../layouts/portal/PortalLayout';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const PortalHomePage = lazy(() => import('../pages/Portal/PortalHomePage'));
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'));

/**
 * SmartRootSwitcher Component
 * Dynamically switches between the public Customer Portal Home Page
 * and the internal CRM Dashboard based on authentication state.
 *
 * - Unauthenticated visitors at `/` see `PortalHomePage` wrapped in `PortalLayout`.
 * - Authenticated users (Admin / Consultant) at `/` see `DashboardPage` wrapped in `AppLayout`.
 * - Displays `PageSkeleton` while authentication status is being checked from localStorage.
 */
export default function SmartRootSwitcher() {
  const { isAuthenticated, currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isAuthenticated && currentUser) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <DashboardPage />
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <PortalLayout>
      <PortalHomePage />
    </PortalLayout>
  );
}

