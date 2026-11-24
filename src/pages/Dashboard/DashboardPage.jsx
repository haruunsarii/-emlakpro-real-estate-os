import React, { useState, useCallback } from 'react';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import KpiGrid from '../../components/dashboard/KpiGrid';
import RevenueChartCard from '../../components/dashboard/RevenueChartCard';
import RecentPropertiesList from '../../components/dashboard/RecentPropertiesList';
import AppointmentsCard from '../../components/dashboard/AppointmentsCard';
import ActivityTimelineCard from '../../components/dashboard/ActivityTimelineCard';
import QuickActionModal from '../../components/dashboard/QuickActionModal';
import { useToast } from '../../hooks/useToast';

export default function DashboardPage() {
  const { toast } = useToast();
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  const handleOpenAction = useCallback((type) => {
    setModalState({ isOpen: true, type, data: null });
  }, []);

  const handleSelectProperty = useCallback((property) => {
    setModalState({ isOpen: true, type: 'detail', data: property });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState({ isOpen: false, type: null, data: null });
  }, []);

  const handleSubmitSuccess = useCallback((type, formData) => {
    if (type === 'portfoy') {
      try {
        const saved = localStorage.getItem('emlakpro_properties_v1');
        const list = saved ? JSON.parse(saved) : [];
        const rawBudget = String(formData.budget || '').replace(/[^\d]/g, '');
        const priceNum = Number(rawBudget) || 25000000;
        const mainImg =
          formData.image ||
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCOE4ERROEPOOsVZZR-nfScOCS74vK-GMM6B1i1CdADXDPRd6VAyvc27cJjlzdqB6Lzb-F5HAEWZ72lMYP2MZlIJT8wreXSKdo8Kw8AsVFKuo6ziW3SiVRTdqaybxgfDI745YYxJqFynjQDqBACJgtEjpONh-NTkCPH3UxPjSSfplH4xVsqZQKb-OQXgnwWRT7YyqchEXoby0VEvz6ITU7K5cpi1KhX_NbYWKurYvdP';

        const newProp = {
          id: `PORT-${Math.floor(1000 + Math.random() * 9000)}`,
          title: formData.title,
          type: formData.propertyType || 'Satılık',
          category: 'Daire',
          status: 'Aktif',
          statusType: 'active',
          isPublished: true,
          price: priceNum,
          priceFormatted:
            formData.propertyType === 'Kiralık'
              ? `₺${priceNum.toLocaleString('tr-TR')} / ay`
              : `₺${priceNum.toLocaleString('tr-TR')}`,
          location: 'Kadıköy / İstanbul',
          district: 'Kadıköy',
          rooms: '3+1',
          netArea: 150,
          grossArea: 175,
          image: mainImg,
          gallery: [
            {
              label: 'Ana Görünüm',
              icon: 'photo_camera',
              count: '1/1 Fotoğraf',
              image: mainImg,
            },
          ],
          advisor: {
            name: 'Burak Yılmaz',
            title: 'Kıdemli Danışman',
          },
        };

        localStorage.setItem('emlakpro_properties_v1', JSON.stringify([newProp, ...list]));
        window.dispatchEvent(
          new CustomEvent('emlakpro_local_storage_sync', {
            detail: { key: 'emlakpro_properties_v1', newValue: [newProp, ...list] },
          })
        );
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error('Portföy ekleme hatası:', err);
      }
    }

    const messages = {
      musteri: `Yeni müşteri "${formData.name}" başarıyla sisteme eklendi!`,
      randevu: `"${formData.title}" randevusu takvime kaydedildi!`,
      portfoy: `Yeni portföy "${formData.title}" başarıyla oluşturuldu!`,
    };

    toast.success(messages[type] || 'İşlem başarıyla tamamlandı!');
  }, [toast]);

  return (
    <div className="flex flex-col w-full">
      <div className="p-margin-sm xl:p-margin max-w-[1600px] w-full mx-auto flex flex-col gap-space-lg">
        {/* 1. Top Header & Quick Actions */}
        <DashboardHeader onActionClick={handleOpenAction} />

        {/* 2. 5 KPI Metrics Tiles */}
        <KpiGrid />

        {/* 3. Main 2-Column Operational Grid (8 cols left, 4 cols right) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          {/* Left Column: 8 Cols */}
          <div className="xl:col-span-8 flex flex-col gap-space-lg min-w-0">
            {/* Monthly Revenue Chart */}
            <RevenueChartCard />

            {/* Recent Properties Section */}
            <RecentPropertiesList onSelectProperty={handleSelectProperty} />
          </div>

          {/* Right Column: 4 Cols */}
          <div className="xl:col-span-4 flex flex-col gap-space-lg min-w-0">
            {/* Upcoming Appointments */}
            <AppointmentsCard />

            {/* Recent Activity Timeline */}
            <ActivityTimelineCard />
          </div>
        </div>
      </div>

      {/* Interactive Quick Action / Details Modal */}
      {modalState.isOpen && (
        <QuickActionModal
          type={modalState.type}
          data={modalState.data}
          onClose={handleCloseModal}
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  );
}
