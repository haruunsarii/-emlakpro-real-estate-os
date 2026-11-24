import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PageSkeleton from '../ui/skeletons/PageSkeleton';

/**
 * ProtectedRoute Component (Frontend Prototype)
 *
 * Guarantees that:
 * 1. Unauthenticated users cannot access CRM routes and are redirected to /giris.
 * 2. Original intended location is passed in route state for post-login redirection.
 * 3. Loading state is handled smoothly without premature or flickering redirects.
 * 4. Role-based restrictions (e.g. allowedRoles=['admin']) are enforced at the page level.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Loading state guard: render skeleton while verifying auth state
  if (isLoading) {
    return <PageSkeleton />;
  }

  // 2. Authentication check: redirect to /giris if no active session
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/giris" state={{ from: location }} replace />;
  }

  // 3. Role-based authorization check
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = currentUser.role || 'consultant';
    const isAllowed = allowedRoles.includes(userRole);

    if (!isAllowed) {
      return (
        <div className="p-space-lg max-w-3xl mx-auto my-space-lg">
          <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">gpp_bad</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Erişim Yetkisi Yetersiz (403)</h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed">
              Bu sayfaya erişim yalnızca <strong>Sistem Yöneticisi (Admin)</strong> yetkisine sahip kullanıcılar için tanımlanmıştır.
              Mevcut oturum rolünüz: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">{currentUser.displayRole || 'Danışman'}</span>.
            </p>
            <div className="flex items-center justify-center gap-3">
              <a
                href="/"
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">dashboard</span>
                Dashboard&apos;a Dön
              </a>
            </div>
          </div>
        </div>
      );
    }
  }

  // Render children or nested route Outlet
  return children ? children : <Outlet />;
}

