import React, { useState, useEffect } from 'react';
import SettingsHeader from '../../components/settings/SettingsHeader';
import SettingsSidebarNav from '../../components/settings/SettingsSidebarNav';
import SettingsMetricsStrip from '../../components/settings/SettingsMetricsStrip';
import ProfileSettingsSection from '../../components/settings/ProfileSettingsSection';
import OfficeSettingsSection from '../../components/settings/OfficeSettingsSection';
import UserManagementSection from '../../components/settings/UserManagementSection';
import NotificationSettingsSection from '../../components/settings/NotificationSettingsSection';
import AppearanceSettingsSection from '../../components/settings/AppearanceSettingsSection';
import PortalSettingsSection from '../../components/settings/PortalSettingsSection';
import CommissionSettingsSection from '../../components/settings/CommissionSettingsSection';
import SecuritySettingsSection from '../../components/settings/SecuritySettingsSection';
import DataManagementSection from '../../components/settings/DataManagementSection';
import { useToast } from '../../hooks/useToast';
import {
  getSavedSettings,
  saveSettings,
  initialSettingsState,
  calculateRealSystemMetrics,
} from '../../services/settingsData';
import { applyTheme } from '../../utils/themeHelper';

export default function SettingsPage() {
  const { showToast, toast } = useToast();
  const [activeTab, setActiveTab] = useState('profil');
  const [settings, setSettings] = useState(getSavedSettings);
  const [isDirty, setIsDirty] = useState(false);

  // Sync with storage on mount and when restore/reset occurs
  useEffect(() => {
    const handleStorageChange = () => {
      setSettings(getSavedSettings());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('emlakpro_data_restored', handleStorageChange);
    window.addEventListener('emlakpro_data_reset', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('emlakpro_data_restored', handleStorageChange);
      window.removeEventListener('emlakpro_data_reset', handleStorageChange);
    };
  }, []);

  const handleProfileChange = (newProfile) => {
    setSettings((prev) => ({ ...prev, profile: newProfile }));
    setIsDirty(true);
  };

  const handleOfficeChange = (newOffice) => {
    setSettings((prev) => ({ ...prev, office: newOffice }));
    setIsDirty(true);
  };

  const handleUsersChange = (newUsers) => {
    setSettings((prev) => ({ ...prev, users: newUsers }));
    setIsDirty(true);
  };

  const handleNotificationsChange = (newNotifications) => {
    setSettings((prev) => ({ ...prev, notifications: newNotifications }));
    setIsDirty(true);
  };

  const handleAppearanceChange = (newAppearance) => {
    setSettings((prev) => {
      const updated = { ...prev, appearance: newAppearance };
      saveSettings(updated);
      if (newAppearance?.theme) {
        applyTheme(newAppearance.theme);
      }
      return updated;
    });
  };

  const handlePortalsChange = (newPortals) => {
    setSettings((prev) => ({ ...prev, portals: newPortals }));
    setIsDirty(true);
  };

  const handleCommissionChange = (newCommission) => {
    setSettings((prev) => ({ ...prev, commission: newCommission }));
    setIsDirty(true);
  };

  const handleSecurityChange = (newSecurity) => {
    setSettings((prev) => ({ ...prev, security: newSecurity }));
    setIsDirty(true);
  };

  const handleSaveAll = () => {
    const saved = saveSettings(settings);
    if (saved) {
      setSettings(saved);
      setIsDirty(false);
      toast.success('Tüm ayarlar ve sistem yapılandırması başarıyla kaydedildi ✓');
    } else {
      toast.error('Ayarlar kaydedilirken bir hata oluştu.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Kaydedilmemiş değişiklikleri geri almak istediğinize emin misiniz?')) {
      const restored = getSavedSettings() || initialSettingsState;
      setSettings(restored);
      setIsDirty(false);
      applyTheme(restored?.appearance?.theme);
      toast.info('Değişiklikler geri alındı.');
    }
  };

  return (
    <div className="flex flex-col gap-space-lg max-w-[1600px] mx-auto pb-16">
      {/* Top Header */}
      <SettingsHeader
        lastSavedAt={settings.lastSavedAt || 'Bugün 18:30'}
        isDirty={isDirty}
        onSave={handleSaveAll}
        onReset={handleReset}
      />

      {/* System Status & Metrics Strip */}
      <SettingsMetricsStrip metrics={calculateRealSystemMetrics(settings)} />

      {/* Main Settings Layout: Left Navigation + Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Settings Sidebar Navigation (3 or 4 cols) */}
        <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-4">
          <SettingsSidebarNav
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            usersCount={settings.users?.length || 4}
          />
        </div>

        {/* Right Active Setting Details (8 or 9 cols) */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-space-lg">
          {activeTab === 'profil' && (
            <ProfileSettingsSection
              profile={settings.profile}
              onChange={handleProfileChange}
              onToast={showToast}
            />
          )}

          {activeTab === 'ofis' && (
            <OfficeSettingsSection
              office={settings.office}
              onChange={handleOfficeChange}
              onToast={showToast}
            />
          )}

          {activeTab === 'kullanicilar' && (
            <UserManagementSection
              users={settings.users}
              onUsersChange={handleUsersChange}
              onToast={showToast}
            />
          )}

          {activeTab === 'bildirimler' && (
            <NotificationSettingsSection
              notifications={settings.notifications}
              onChange={handleNotificationsChange}
              onToast={showToast}
            />
          )}

          {activeTab === 'gorunum' && (
            <AppearanceSettingsSection
              appearance={settings.appearance}
              onChange={handleAppearanceChange}
              onToast={showToast}
            />
          )}

          {activeTab === 'portallar' && (
            <PortalSettingsSection
              portals={settings.portals}
              onPortalsChange={handlePortalsChange}
              onToast={showToast}
            />
          )}

          {activeTab === 'komisyon' && (
            <CommissionSettingsSection
              commission={settings.commission}
              onChange={handleCommissionChange}
              onToast={showToast}
            />
          )}

          {activeTab === 'guvenlik' && (
            <SecuritySettingsSection
              security={settings.security}
              onChange={handleSecurityChange}
              onToast={showToast}
            />
          )}

          {activeTab === 'veri' && (
            <DataManagementSection
              settings={settings}
              onSettingsReset={() => {
                setSettings(getSavedSettings());
                setIsDirty(false);
              }}
              onToast={showToast}
            />
          )}
        </div>
      </div>
    </div>
  );
}

