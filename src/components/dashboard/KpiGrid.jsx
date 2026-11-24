import React, { useState, useEffect, useMemo, memo } from 'react';
import KpiCard from './KpiCard';

function KpiGrid() {
  const [syncCount, setSyncCount] = useState(0);

  useEffect(() => {
    const handleSync = () => setSyncCount((c) => c + 1);
    window.addEventListener('storage', handleSync);
    window.addEventListener('emlakpro_local_storage_sync', handleSync);
    window.addEventListener('emlakpro_data_restored', handleSync);
    window.addEventListener('emlakpro_data_reset', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('emlakpro_local_storage_sync', handleSync);
      window.removeEventListener('emlakpro_data_restored', handleSync);
      window.removeEventListener('emlakpro_data_reset', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const dynamicKpis = useMemo(() => {
    void syncCount; // trigger dependency on external storage sync
    let properties = [];
    let customers = [];
    let deals = [];

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const savedProps = window.localStorage.getItem('emlakpro_properties_v1');
        if (savedProps) {
          const parsed = JSON.parse(savedProps);
          if (Array.isArray(parsed)) properties = parsed;
        }

        const savedCust =
          window.localStorage.getItem('emlakpro_customers_v1') ||
          window.localStorage.getItem('emlakpro_customers');
        if (savedCust) {
          const parsed = JSON.parse(savedCust);
          if (Array.isArray(parsed)) customers = parsed;
        }

        const savedDeals = window.localStorage.getItem('emlakpro_deals_v1');
        if (savedDeals) {
          const parsed = JSON.parse(savedDeals);
          if (Array.isArray(parsed)) deals = parsed;
        }
      } catch (e) {
        console.warn('Dashboard KPI verileri okunamadı:', e);
      }
    }

    const saleProps = properties.filter((p) => (p.type || '').toLowerCase().includes('sat'));
    const rentProps = properties.filter((p) => (p.type || '').toLowerCase().includes('kir'));

    const saleTotal = saleProps.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
    const rentTotal = rentProps.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

    const completedDeals = deals.filter((d) => d.stage === 'tamamlandi');
    const totalCommission = completedDeals.reduce((sum, d) => {
      const comm = d.commission || (Number(d.amount) || 0) * ((Number(d.commissionRate) || 2) / 100);
      return sum + comm;
    }, 0);

    const saleM = (saleTotal / 1000000).toFixed(1);
    const rentFormatted = rentTotal >= 1000000
      ? `${(rentTotal / 1000000).toFixed(2)}M ₺`
      : `${Math.round(rentTotal / 1000)}K ₺`;

    return [
      {
        id: 'total_portfolio',
        title: 'Toplam Portföy',
        value: `${properties.length} İlan`,
        trend: properties.length > 0 ? '+12% bu ay' : 'Portföy boş',
        trendType: properties.length > 0 ? 'up' : 'neutral',
        icon: 'domain',
        progress: Math.min(100, properties.length * 10),
        progressColor: 'bg-secondary',
      },
      {
        id: 'active_customers',
        title: 'Aktif Müşteriler',
        value: `${customers.length} Kişi`,
        trend: customers.length > 0 ? '+8% yeni talep' : 'Müşteri yok',
        trendType: customers.length > 0 ? 'up' : 'neutral',
        icon: 'groups',
        progress: Math.min(100, customers.length * 8),
        progressColor: 'bg-secondary',
      },
      {
        id: 'for_sale',
        title: 'Satılık Gayrimenkul',
        value: `${saleProps.length} İlan`,
        subtext: saleProps.length > 0 ? `${saleM}M ₺ toplam portföy` : '₺0 toplam portföy',
        icon: 'sell',
        progress: properties.length > 0 ? Math.min(100, Math.round((saleProps.length / properties.length) * 100)) : 0,
        progressColor: 'bg-primary-container',
      },
      {
        id: 'for_rent',
        title: 'Kiralık Portföy',
        value: `${rentProps.length} İlan`,
        subtext: rentProps.length > 0 ? `${rentFormatted} aylık ciro` : '₺0 aylık ciro',
        icon: 'key',
        progress: properties.length > 0 ? Math.min(100, Math.round((rentProps.length / properties.length) * 100)) : 0,
        progressColor: 'bg-secondary-container',
      },
      {
        id: 'monthly_closing',
        title: 'Aylık Kapanış',
        value: `${completedDeals.length} İşlem`,
        subtext: completedDeals.length > 0 ? `₺${Math.round(totalCommission).toLocaleString('tr-TR')} komisyon` : '₺0 komisyon',
        icon: 'check_circle',
        progress: Math.min(100, completedDeals.length * 25),
        progressColor: 'bg-secondary',
      },
    ];
  }, [syncCount]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-space-md">
      {dynamicKpis.map((item) => (
        <KpiCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export default memo(KpiGrid);
