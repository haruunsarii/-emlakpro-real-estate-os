import React from 'react';
import { useLocation } from 'react-router-dom';
import DashboardSkeleton from './DashboardSkeleton';
import CustomerSkeleton from './CustomerSkeleton';
import PropertySkeleton from './PropertySkeleton';
import RequestSkeleton from './RequestSkeleton';
import DealSkeleton from './DealSkeleton';
import TaskSkeleton from './TaskSkeleton';
import ReportsSkeleton from './ReportsSkeleton';
import SettingsSkeleton from './SettingsSkeleton';

/**
 * Composite PageSkeleton
 * Intelligently serves the layout-matching skeleton based on the current window/router route,
 * eliminating layout shift and visual jarring during React.Suspense lazy loading.
 */
export default function PageSkeleton() {
  const location = useLocation();
  const path = location?.pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');

  if (path.startsWith('/musteriler')) {
    return <CustomerSkeleton />;
  }
  if (path.startsWith('/gayrimenkuller')) {
    return <PropertySkeleton />;
  }
  if (path.startsWith('/talepler') || path.startsWith('/musteri-talepleri')) {
    return <RequestSkeleton />;
  }
  if (path.startsWith('/satis-ve-kiralama')) {
    return <DealSkeleton />;
  }
  if (
    path.startsWith('/gorevler-ve-randevular') ||
    path.startsWith('/gorevler') ||
    path.startsWith('/randevular')
  ) {
    return <TaskSkeleton />;
  }
  if (path.startsWith('/raporlar')) {
    return <ReportsSkeleton />;
  }
  if (path.startsWith('/ayarlar')) {
    return <SettingsSkeleton />;
  }

  return <DashboardSkeleton />;
}

