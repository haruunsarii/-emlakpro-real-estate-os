import React, { useState } from 'react';
import EmptyState from '../ui/EmptyState';

export default function ProfileSettingsSection({
  profile = null,
  onChange,
  onToast,
}) {
  const [isCreating, setIsCreating] = useState(false);

  // Profile exists only if at least one meaningful personal identity field is populated
  const hasConsultant = Boolean(
    profile &&
      (profile.firstName?.trim() ||
        profile.lastName?.trim() ||
        profile.email?.trim() ||
        profile.title?.trim() ||
        profile.phone?.trim())
  );

  const handleInputChange = (field, value) => {
    if (onChange) {
      onChange({
        ...(profile || {}),
        [field]: value,
      });
    }
  };

  const handleAvatarChange = () => {
    const newUrl = window.prompt(
      'Yeni profil fotoğrafı URL bağlantısını girin (ör. https://images.unsplash.com/...):',
      profile?.avatarUrl || ''
    );
    if (newUrl !== null && newUrl.trim()) {
      handleInputChange('avatarUrl', newUrl.trim());
      if (onToast) onToast('Profil fotoğrafı güncellendi.');
    }
  };

  const handleAvatarRemove = () => {
    handleInputChange('avatarUrl', null);
    if (onToast) onToast('Profil fotoğrafı kaldırıldı.');
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-space-lg flex flex-col gap-space-lg">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-space-sm bg-surface-container-low -mx-space-lg -mt-space-lg p-space-lg rounded-t-xl border-b border-surface-container">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">person</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
              Profil Ayarları
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Kişisel hesap detaylarınızı, unvanınızı ve iletişim bilgilerinizi yönetin.
            </p>
          </div>
        </div>
        {hasConsultant && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-label-sm bg-emerald-50 text-emerald-800 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Aktif Danışman
          </span>
        )}
      </div>

      {!hasConsultant && !isCreating ? (
        <div className="py-6">
          <EmptyState
            type="empty"
            icon="person_off"
            title="Henüz danışman kaydı bulunmuyor"
            description="Sistemde aktif bir danışman profili tanımlanmamış. Yeni danışman profili oluşturarak ad, unvan ve iletişim detaylarınızı ekleyebilirsiniz."
            actionLabel="Yeni Danışman Profili Tanımla"
            onAction={() => setIsCreating(true)}
          />
        </div>
      ) : (
        <>
          {/* Profile Photo Uploader Card */}
          <div className="flex flex-col sm:flex-row items-center gap-space-md p-space-md rounded-xl bg-surface-container-low border border-surface-container">
            <div className="w-20 h-20 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-surface-container relative">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Danışman'}
                  width="80"
                  height="80"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary text-white flex items-center justify-center font-bold text-xl">
                  {profile?.firstName?.[0]?.toUpperCase() || profile?.lastName?.[0]?.toUpperCase() ? (
                    `${profile?.firstName?.[0]?.toUpperCase() || ''}${profile?.lastName?.[0]?.toUpperCase() || ''}`
                  ) : (
                    <span className="material-symbols-outlined text-[32px]">person</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col flex-1 text-center sm:text-left gap-1">
              <div className="font-label-md text-label-md font-bold text-primary">
                {profile?.firstName || profile?.lastName
                  ? `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()
                  : 'Yeni Danışman Profili'}
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Bu fotoğraf sözleşme özetlerinde, yer gösterim davetlerinde ve dijital kartvizitinizde müşterilere görünür.
              </p>
            </div>

            <div className="flex items-center gap-space-xs flex-wrap">
              <button
                type="button"
                onClick={handleAvatarChange}
                className="px-space-md py-2 rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container transition-colors shadow-sm cursor-pointer font-semibold"
              >
                Fotoğrafı Değiştir
              </button>
              {profile?.avatarUrl && (
                <button
                  type="button"
                  onClick={handleAvatarRemove}
                  className="p-2 rounded-lg bg-surface-container-lowest border border-surface-container text-error hover:bg-error-container/40 transition-colors shadow-sm cursor-pointer"
                  title="Fotoğrafı Kaldır"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              )}
              {isCreating && !hasConsultant && (
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-space-md py-2 rounded-lg border border-surface-container text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {/* Ad */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                Ad *
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
                  badge
                </span>
                <input
                  type="text"
                  value={profile?.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full h-[42px] pl-10 pr-space-md bg-surface text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container focus:outline-none focus:border-secondary transition-all"
                  placeholder="Adınız"
                />
              </div>
            </div>

            {/* Soyad */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                Soyad *
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
                  badge
                </span>
                <input
                  type="text"
                  value={profile?.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full h-[42px] pl-10 pr-space-md bg-surface text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container focus:outline-none focus:border-secondary transition-all"
                  placeholder="Soyadınız"
                />
              </div>
            </div>

            {/* E-posta */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                E-posta Adresi *
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
                  mail
                </span>
                <input
                  type="email"
                  value={profile?.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full h-[42px] pl-10 pr-space-md bg-surface text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container focus:outline-none focus:border-secondary transition-all"
                  placeholder="ornek@emlakpro.com.tr"
                />
              </div>
            </div>

            {/* Telefon */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                Telefon Numarası *
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
                  call
                </span>
                <input
                  type="tel"
                  value={profile?.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full h-[42px] pl-10 pr-space-md bg-surface text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container focus:outline-none focus:border-secondary transition-all"
                  placeholder="+90 (5xx) xxx xx xx"
                />
              </div>
            </div>

            {/* Görev / Unvan */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                Görev / Unvan *
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
                  work
                </span>
                <input
                  type="text"
                  value={profile?.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full h-[42px] pl-10 pr-space-md bg-surface text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container focus:outline-none focus:border-secondary transition-all"
                  placeholder="Örn: Kıdemli Danışman / Ofis Sahibi"
                />
              </div>
            </div>

            {/* Bio / Uzmanlık */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                Uzmanlık Alanı & Biyografi
              </label>
              <textarea
                rows={3}
                value={profile?.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full p-3 bg-surface text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container focus:outline-none focus:border-secondary transition-all"
                placeholder="Müşteri portföy sunumlarında ve dijital kartvizitinizde görünecek kısa tanıtım metni..."
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
