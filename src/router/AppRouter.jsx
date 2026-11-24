import React, { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import PortalLayout from '../layouts/portal/PortalLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import SmartRootSwitcher from './SmartRootSwitcher';

// Lazy-loaded CRM Pages
const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'));
const CustomersPage = lazy(() => import('../pages/Customers/CustomersPage'));
const PropertiesPage = lazy(() => import('../pages/Properties/PropertiesPage'));
const RequestsPage = lazy(() => import('../pages/Requests/RequestsPage'));
const DealsPage = lazy(() => import('../pages/Deals/DealsPage'));
const TasksPage = lazy(() => import('../pages/Tasks/TasksPage'));
const ReportsPage = lazy(() => import('../pages/Reports/ReportsPage'));
const SettingsPage = lazy(() => import('../pages/Settings/SettingsPage'));
const ConsultantsPage = lazy(() => import('../pages/Consultants/ConsultantsPage'));

// Lazy-loaded Public Customer Portal Pages
const PropertyListingsPage = lazy(() => import('../pages/Portal/PropertyListingsPage'));
const PropertyDetailPage = lazy(() => import('../pages/Portal/PropertyDetailPage'));
const ContactPage = lazy(() => import('../pages/Portal/ContactPage'));
const PropertyDemandPage = lazy(() => import('../pages/Portal/PropertyDemandPage'));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Smart Root Switcher (Unauthenticated: Customer Portal HomePage / Authenticated: CRM Dashboard) */}
        <Route path="/" element={<SmartRootSwitcher />} />

        {/* Public Customer Portal Routes (No Authentication Required) */}
        <Route element={<PortalLayout />}>
          <Route path="/ilanlar" element={<PropertyListingsPage />} />
          <Route path="/ilanlar/:id" element={<PropertyDetailPage />} />
          <Route path="/iletisim" element={<ContactPage />} />
          <Route path="/talep-birak" element={<PropertyDemandPage />} />
        </Route>

        {/* Public Authentication Route */}
        <Route path="/giris" element={<LoginPage />} />

        {/* Authenticated CRM Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* CRM Dashboard route alias if directly navigated */}
          <Route path="/crm" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Standard Operational CRM Modules */}
          <Route path="/musteriler" element={<CustomersPage />} />
          <Route path="/gayrimenkuller" element={<PropertiesPage />} />
          <Route path="/talepler" element={<RequestsPage />} />
          <Route path="/musteri-talepleri" element={<RequestsPage />} />
          <Route path="/satis-ve-kiralama" element={<DealsPage />} />
          <Route path="/gorevler-ve-randevular" element={<TasksPage />} />
          <Route path="/gorevler" element={<TasksPage />} />
          <Route path="/randevular" element={<TasksPage />} />
          <Route path="/raporlar" element={<ReportsPage />} />

          {/* Admin-Only Protected Modules */}
          <Route
            path="/ayarlar"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/danismanlar"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ConsultantsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
