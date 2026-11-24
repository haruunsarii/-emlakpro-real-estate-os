import React from 'react';

export default function OfficeSettingsSection({
  office = {},
  onChange,
  onToast,
}) {
  const handleInputChange = (field, value) => {
    if (onChange) {
      onChange({
        ...office,
        [field]: value,
      });
    }
  };

  const handleLogoChange = () => {
    const newLogo = window.prompt(
      'Yeni ofis logosu görsel URL bağlantısını girin:',
      office.logoUrl || ''
    );
    if (newLogo !== null && newLogo.trim()) {
      handleInputChange('logoUrl', newLogo.trim());
      if (onToast) onToast('Ofis logosu güncellendi.');
    }
  };

  const handleLogoRemove = () => {
    handleInputChange('logoUrl', null);
    if (onToast) onToast('Ofis logosu kaldırıldı.');
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-space-lg flex flex-col gap-space-lg">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-space-sm bg-surface-container-low -mx-space-lg -mt-space-lg p-space-lg rounded-t-xl border-b border-surface-container">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">domain</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
              Ofis & Kurumsal Kimlik Bilgileri
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Taşınmaz ticareti mevzuatına uyumlu yasal ve ticari kayıt bilgileri.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-label-sm bg-emerald-50 text-emerald-800 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Onaylı Ofis
        </span>
      </div>

      {/* Logo Uploader Card */}
      <div className="flex flex-col sm:flex-row items-center gap-space-md p-space-md rounded-xl bg-surface-container-low border border-surface-container">
        <div className="w-20 h-20 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-center p-2 relative overflow-hidden flex-shrink-0 border border-surface-container">
          {office.logoUrl ? (
            <img
              src={office.logoUrl}
              alt="Ofis Logosu"
              width="80"
              height="80"
              decoding="async"
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
              image
            </span>
          )}
        </div>

        <div className="flex flex-col flex-1 text-center sm:text-left gap-1">
          <div className="font-label-md text-label-md font-bold text-primary">
            Ofis Logosu & Marka Varlıkları
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Sözleşmelerde, ilan şablonlarında, su damgalarında ve dijital kartvizitlerde kullanılır. PNG, SVG veya JPG (En az 800x800px).
          </p>
        </div>

        <div className="flex items-center gap-space-xs">
          <button
            type="button"
            onClick={handleLogoChange}
            className="px-space-md py-2 rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container transition-colors shadow-sm cursor-pointer font-semibold"
          >
            Logoyu Değiştir
          </button>
          {office.logoUrl && (
            <button
              type="button"
              onClick={handleLogoRemove}
              className="p-2 rounded-lg bg-surface-container-lowest border border-surface-container text-error hover:bg-error-container/40 transition-colors shadow-sm cursor-pointer"
              title="Kaldır"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {/* Ticari Unvan / Ofis Adı */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="font-label-sm text-label-sm font-semibold text-on-surface">
            Ticari Unvan / Ofis Resmi Adı *
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
              apartment
            </span>
            <input
              type="text"
              value={office.officeName || ''}
              onChange={(e) => handleInputChange('officeName', e.target.value)}
              className="w-full h-[42px] pl-10 pr-space-md bg-surface text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container focus:outline-none focus:border-secondary transition-all font-medium"
            />
          </div>
        </div>

        {/* Taşınmaz Ticareti Yetki Belgesi No */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="font-label-sm text-label-sm font-semibold text-on-surface">
              Taşınmaz Ticareti Yetki Belgesi No *
            </label>
            <span className="inline-flex items-center gap-1 font-caption text-caption text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              {office.licenseStatus || 'İBB Onaylı'}
            </span>
          </div>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
              license
            </span>
            <input
              type="text"
              value={office.licenseNo || ''}
              onChange={(e) => handleInputChange('licenseNo', e.target.value)}
              className="w-full h-[42px] pl-10 pr-space-md bg-surface text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container focus:outline-none focus:border-secondary transition-all"
            />
          </div>
        </div>

        {/* Şube / Bölge */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm font-semibold text-on-surface">
            Şube / Çalışma Bölgesi
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
              storefront
            </span>
            <input
              type="text"
              value={office.branch || ''}
              onChange={(e) => handleInputChange('branch', e.target.value)}
              className="w-full h-[42px] pl-10 pr-space-md bg-surface text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container focus:outline-none focus:border-secondary transition-all"
            />
          </div>
        </div>

        {/* Vergi Dairesi */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm font-semibold text-on-surface">
            Vergi Dairesi
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
              receipt_long
            </span>
            <input
              type="text"
              value={office.taxOffice || ''}
              onChange={(e) => handleInputChange('taxOffice', e.target.value)}
              className="w-full h-[42px] pl-10 pr-space-md bg-surface text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container focus:outline-none focus:border-secondary transition-all"
            />
          </div>
        </div>

        {/* Vergi Numarası */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm font-semibold text-on-surface">
            Vergi Kimlik Numarası (VKN)
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
              numbers
            </span>
            <input
              type="text"
              value={office.taxNumber || ''}
              onChange={(e) => handleInputChange('taxNumber', e.target.value)}
              className="w-full h-[42px] pl-10 pr-space-md bg-surface text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container focus:outline-none focus:border-secondary transition-all"
            />
          </div>
        </div>

        {/* Telefon */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm font-semibold text-on-surface">
            Ofis Sabit Telefonu *
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
              call
            </span>
            <input
              type="tel"
              value={office.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full h-[42px] pl-10 pr-space-md bg-surface text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container focus:outline-none focus:border-secondary transition-all"
            />
          </div>
        </div>

        {/* E-posta */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm font-semibold text-on-surface">
            İletişim E-posta Adresi *
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
              mail
            </span>
            <input
              type="email"
              value={office.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full h-[42px] pl-10 pr-space-md bg-surface text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container focus:outline-none focus:border-secondary transition-all"
            />
          </div>
        </div>

        {/* Açık Adres */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm font-semibold text-on-surface">
            Açık Adres (Cadde, No, Daire) *
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
              location_on
            </span>
            <input
              type="text"
              value={office.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full h-[42px] pl-10 pr-space-md bg-surface text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container focus:outline-none focus:border-secondary transition-all"
            />
          </div>
        </div>

        {/* Şehir / İlçe */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm font-semibold text-on-surface">
            Şehir / İlçe *
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
              map
            </span>
            <input
              type="text"
              value={office.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full h-[42px] pl-10 pr-space-md bg-surface text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container focus:outline-none focus:border-secondary transition-all"
            />
          </div>
        </div>

        {/* Web Sitesi */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="font-label-sm text-label-sm font-semibold text-on-surface">
            Web Sitesi & Dijital Kartvizit Portalı
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
              language
            </span>
            <input
              type="url"
              value={office.website || ''}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full h-[42px] pl-10 pr-space-md bg-surface text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container focus:outline-none focus:border-secondary transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

