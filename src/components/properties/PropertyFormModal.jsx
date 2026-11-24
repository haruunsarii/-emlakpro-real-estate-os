import React, { useState, useMemo } from 'react';
import BaseModal from '../ui/BaseModal';
import FormField from '../ui/FormField';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { getSavedSettings } from '../../services/settingsData';

// Helper to compress uploaded user image files so they fit into localStorage safely
function compressImageFile(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const elem = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = elem.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

const PRESET_PHOTOS = [
  {
    name: 'Panoramik Boğaz Manzarası',
    label: 'Manzara/Boğaz',
    icon: 'visibility',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB701Lch_fQFhoe6C6xv0nnS3uPv4-qic8X90dzCS4kigBcFrmhKKMNBEh9KGXS4sMh58QuY1zQfaMccOrSxHiUxmc5I_vcwc-9Erxk3L0RhXL3CC-khRYdKZN3boq5GuzRI3DHWicqWdvuDLhEK4896s692F3gB3NaAjkwfdFM5Rl4h5G9NEP8_EqGTXUpmjzmZsqhG1sRsLR0x2hgpR3PKEPBoQxUed1kIrk2r4ke',
  },
  {
    name: 'Müstakil Taş Villa & Havuz',
    label: 'Villa/Havuz',
    icon: 'pool',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2a7xvPayX8KKisVVbD8vBwhKFLf-kmqwbeTxQAa3PUqTSD1MkpPSnVZ1oYYvtmHDY-wtBVZqOiyoaoWST2QFt1M3RL4weu84SM58TgugAbtropR6X1KhZRdBKQycM74Pod-B51grgyAKvd_uezeSeAoTSJW-l4zwZXniA9Omo8impPawtEJdaULePu0Dg2246LL-tp_Fa23WcFbTJSZg0ArqIt-3ENYOxpi3mGJyK',
  },
  {
    name: 'Lüks Geniş Salon',
    label: 'Salon',
    icon: 'living',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOE4ERROEPOOsVZZR-nfScOCS74vK-GMM6B1i1CdADXDPRd6VAyvc27cJjlzdqB6Lzb-F5HAEWZ72lMYP2MZlIJT8wreXSKdo8Kw8AsVFKuo6ziW3SiVRTdqaybxgfDI745YYxJqFynjQDqBACJgtEjpONh-NTkCPH3UxPjSSfplH4xVsqZQKb-OQXgnwWRT7YyqchEXoby0VEvz6ITU7K5cpi1KhX_NbYWKurYvdP',
  },
  {
    name: 'Peyzajlı Özel Bahçe',
    label: 'Bahçe',
    icon: 'yard',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRnPGPP6ak3jhjr98jweMtyanYkr1I-vmNXhXLnS2jsnJJ-yaFb1-s_3P599HJocqj6mNWlQJ7mz-bSJvluH1xSilPhYujKgpwQi8t9J3L9f9UPnCLYyKWrHYThdZeYn6GL0vvrXfBfhCQqdcVAPLtDwSpom1jnJDRzrevMnDZf27bq3vanQ25a8Ay9CyOLp42Z50lW9J5Ht9fPBQ3kfGPUSHRHEcJghryc2toqlOh',
  },
  {
    name: 'Modern Ada Mutfak',
    label: 'Mutfak',
    icon: 'countertops',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb0yNvWBe673aKJAqDwbk0knD-cZ96KHd6EW4ouBbBZbXjkv6S2trpWEjMpzB-typg47ekyxfpmCF27FEw0oxqoJy_dDo9Ta72-lu3SCOeK96E3SkZa2tjuzLYVSyq_YCpJxu0xLUWiM3-cFE4nUA3WwekmJJWaTxEV69VseQGThwxS45VYOMEhdScCmanf1IQTW8B7MLLeNAky-sDCb332IRJxzjZ-os6A4BohvOt',
  },
  {
    name: 'Marina Cepheli Teras',
    label: 'Teras/Balkon',
    icon: 'deck',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwyrzWu7sNIqymzX4gFEYrjJvZdnMNy0T2PJwCp8hrncRyf3hNw4Yk2BQB9YRxUspZvg7Pq9_ztKTPgFDfly3BzSfAuYZn9k5GzuupyGEaQ275t4KcGAf7dz6-KGiGjkBOW4ZZ7McUHIul6zvPDAoBfviKTORkz8uSDSrk2I0ZCO1gJ8NmXsL-HYtErsg6uOmUlZv2krbUr00jQW7M6UiDEcHQDiu9rq7P-3YsM2hX',
  },
  {
    name: 'A+ Plaza Ofis Katı',
    label: 'Ofis/Ticari',
    icon: 'domain',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzFCv3TnQVTMrqnPTExG1gLtC0NIvtXYtfFqHgVmaSVk7xsM_V6SCVmBg-U4JQ8PmvosBBvHVrBnJHblZHvdvIAjy12_QmkJHVzXMLuCGhSXLra0-ZJG9c7lHgBTq3dzUagq95faTI8rH6rzzBWGKeS27zqaXknZyePxM9KRKGL2cKB0BUbde7ny3y5MzBsBOJKXFna7QXvOAvwboC1aogLlFmxowo0W5VVeI0kP4D',
  },
  {
    name: 'Rezidans Kule Bloğu',
    label: 'Rezidans',
    icon: 'apartment',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjUWU8NO4nXTBL8fVrXXPoAnBXNA8Gjgk4pTacIxMLscTqOMVUBo6TlqPDlLV8b-1Iw9y3mTGF982UNWVpc4qFnxCRastJyy2CPyjHvQPeMpxS1rcsqUTZ_mzViICRD4YnPN9u9IucvJgI3AL3et_46M5dLcasJrLgmx_vCsoV-bn-5f76BP32OilQNt_qP3U_4FLrHKRhMiuHGI5kETdyjhm5R9Qq62wGizlAfFMi',
  },
];

const ROOM_LABELS = [
  { label: 'Ana Görünüm', icon: 'photo_camera' },
  { label: 'Salon', icon: 'living' },
  { label: 'Mutfak', icon: 'countertops' },
  { label: 'Yatak Odası', icon: 'bed' },
  { label: 'Banyo', icon: 'bathtub' },
  { label: 'Teras & Balkon', icon: 'balcony' },
  { label: 'Boğaz / Manzara', icon: 'visibility' },
  { label: 'Bahçe & Havuz', icon: 'yard' },
  { label: 'Ofis / Çalışma Alanı', icon: 'domain' },
  { label: 'Dış Cephe / Bina', icon: 'apartment' },
];

/**
 * EmlakPro Property Form Modal (Add / Edit)
 * Refactored in Phase 3.2 Step 4 using BaseModal and FormField primitives.
 */
export default function PropertyFormModal({
  isOpen,
  mode = 'add', // 'add' or 'edit'
  property = null,
  onClose,
  onSubmitSuccess,
}) {
  const { currentUser } = useAuth();

  // Dynamic registered advisors from settings.users + current logged-in user
  const availableAdvisors = useMemo(() => {
    const settings = getSavedSettings();
    const allUsers = Array.isArray(settings?.users) ? settings.users : [];
    const active = allUsers.filter((u) => u.status !== 'Pasif');

    if (currentUser?.name) {
      const exists = active.some(
        (u) =>
          (u.id && currentUser.userId && u.id === currentUser.userId) ||
          u.name?.trim().toLowerCase() === currentUser.name?.trim().toLowerCase()
      );
      if (!exists) {
        active.unshift({
          id: currentUser.userId || 'current-user',
          name: currentUser.name,
          title: currentUser.displayRole || currentUser.role || 'Yönetici Broker',
          role: currentUser.role || 'Yönetici',
          status: 'Aktif',
          avatarUrl: currentUser.avatarUrl || currentUser.avatar || '',
        });
      }
    }

    return active;
  }, [currentUser]);

  const defaultAdvisorName = useMemo(() => {
    return currentUser?.name || availableAdvisors[0]?.name || '';
  }, [currentUser, availableAdvisors]);

  const selectAdvisorOptions = useMemo(() => {
    const list = [...availableAdvisors];
    if (mode === 'edit' && property?.advisor?.name) {
      const exists = list.some((u) => u.name === property.advisor.name);
      if (!exists) {
        list.push({
          id: 'existing-prop-advisor',
          name: property.advisor.name,
          title: property.advisor.title || 'Danışman',
          avatarUrl: property.advisor.avatar || '',
        });
      }
    }
    return list;
  }, [availableAdvisors, mode, property]);

  const [formData, setFormData] = useState(() => ({
    title: '',
    type: 'Satılık',
    category: 'Daire',
    price: '',
    district: 'Kadıköy',
    neighborhood: 'Moda',
    netArea: '',
    grossArea: '',
    rooms: '3+1',
    floor: '4. Kat',
    buildingAge: '0 (Sıfır Yapı)',
    deedStatus: 'Kat Mülkiyetli',
    loanEligibility: 'Tam Uygun',
    advisor: defaultAdvisorName,
    status: 'Aktif',
    tag: 'Özel Yetkili',
  }));

  const [formErrors, setFormErrors] = useState({});
  const { toast } = useToast();

  // Photos State
  const [photos, setPhotos] = useState([]);
  const [photoTab, setPhotoTab] = useState('upload'); // 'upload' | 'url' | 'presets'
  const [urlInput, setUrlInput] = useState('');
  const [urlLabel, setUrlLabel] = useState('Ana Görünüm');
  const [photoError, setPhotoError] = useState('');

  const [prevKey, setPrevKey] = useState(() => `${mode}-${property?.id || 'new'}-${isOpen ? 'open' : 'closed'}`);
  const currentKey = `${mode}-${property?.id || 'new'}-${isOpen ? 'open' : 'closed'}`;

  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    if (mode === 'edit' && property) {
      setFormData({
        title: property.title || '',
        type: property.type || 'Satılık',
        category: property.category || 'Daire',
        price: property.price ? String(property.price) : '',
        district: property.district || 'Kadıköy',
        neighborhood: property.neighborhood || 'Moda',
        netArea: property.netArea ? String(property.netArea) : '',
        grossArea: property.grossArea ? String(property.grossArea) : '',
        rooms: property.rooms || '3+1',
        floor: property.floor || '4. Kat',
        buildingAge: property.buildingAge || '0 (Sıfır Yapı)',
        deedStatus: property.deedStatus || 'Kat Mülkiyetli',
        loanEligibility: property.loanEligibility || 'Tam Uygun',
        advisor: property.advisor?.name || defaultAdvisorName,
        status: property.status || 'Aktif',
        tag: property.tags?.[1] || 'Özel Yetkili',
      });

      if (Array.isArray(property.gallery) && property.gallery.length > 0) {
        setPhotos(
          property.gallery.map((g, idx) => ({
            id: `edit-photo-${idx}`,
            url: g.image,
            label: g.label || 'Ana Görünüm',
            icon: g.icon || 'photo_camera',
          }))
        );
      } else if (property.image) {
        setPhotos([
          {
            id: 'edit-photo-0',
            url: property.image,
            label: 'Ana Görünüm',
            icon: 'photo_camera',
          },
        ]);
      } else {
        setPhotos([]);
      }
    } else {
      setFormData({
        title: '',
        type: 'Satılık',
        category: 'Daire',
        price: '',
        district: 'Kadıköy',
        neighborhood: 'Moda',
        netArea: '',
        grossArea: '',
        rooms: '3+1',
        floor: '4. Kat',
        buildingAge: '0 (Sıfır Yapı)',
        deedStatus: 'Kat Mülkiyetli',
        loanEligibility: 'Tam Uygun',
        advisor: defaultAdvisorName,
        status: 'Aktif',
        tag: 'Özel Yetkili',
      });
      setPhotos([
        {
          id: 'new-photo-0',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOE4ERROEPOOsVZZR-nfScOCS74vK-GMM6B1i1CdADXDPRd6VAyvc27cJjlzdqB6Lzb-F5HAEWZ72lMYP2MZlIJT8wreXSKdo8Kw8AsVFKuo6ziW3SiVRTdqaybxgfDI745YYxJqFynjQDqBACJgtEjpONh-NTkCPH3UxPjSSfplH4xVsqZQKb-OQXgnwWRT7YyqchEXoby0VEvz6ITU7K5cpi1KhX_NbYWKurYvdP',
          label: 'Ana Görünüm',
          icon: 'photo_camera',
        },
      ]);
    }
    setFormErrors({});
    setPhotoError('');
    setUrlInput('');
  }

  // Photo handlers
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPhotoError('');

    try {
      const newItems = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          setPhotoError('Lütfen yalnızca geçerli görsel dosyaları (JPG, PNG, WebP) seçin.');
          continue;
        }
        const dataUrl = await compressImageFile(file, 1200, 0.8);
        newItems.push({
          id: `upload-${Date.now()}-${i}-${Math.random()}`,
          url: dataUrl,
          label: photos.length === 0 && i === 0 ? 'Ana Görünüm' : `Fotoğraf ${photos.length + i + 1}`,
          icon: 'photo_camera',
        });
      }
      setPhotos((prev) => [...prev, ...newItems]);
      e.target.value = '';
    } catch (err) {
      console.error('Fotoğraf yükleme hatası:', err);
      setPhotoError('Fotoğraf işlenirken bir sorun oluştu.');
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setPhotoError('Lütfen bir görsel URL adresi girin.');
      return;
    }
    if (
      !trimmed.startsWith('http://') &&
      !trimmed.startsWith('https://') &&
      !trimmed.startsWith('data:image')
    ) {
      setPhotoError('Geçerli bir web adresi girin (http:// veya https:// ile başlamalıdır).');
      return;
    }

    const match = ROOM_LABELS.find((r) => r.label === urlLabel);
    setPhotos((prev) => [
      ...prev,
      {
        id: `url-${Date.now()}-${Math.random()}`,
        url: trimmed,
        label: urlLabel,
        icon: match?.icon || 'photo_camera',
      },
    ]);
    setUrlInput('');
    setPhotoError('');
  };

  const handleAddPreset = (preset) => {
    setPhotos((prev) => [
      ...prev,
      {
        id: `preset-${Date.now()}-${Math.random()}`,
        url: preset.url,
        label: preset.label || preset.name,
        icon: preset.icon || 'photo_camera',
      },
    ]);
    setPhotoError('');
  };

  const handleSetCover = (index) => {
    if (index === 0) return;
    setPhotos((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      selected.label = 'Ana Görünüm';
      selected.icon = 'photo_camera';
      return [selected, ...copy];
    });
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleLabelChange = (index, newLabel) => {
    const match = ROOM_LABELS.find((r) => r.label === newLabel);
    setPhotos((prev) =>
      prev.map((p, idx) =>
        idx === index
          ? { ...p, label: newLabel, icon: match?.icon || 'photo_camera' }
          : p
      )
    );
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'İlan başlığı zorunludur.';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = 'Geçerli bir fiyat tutarı giriniz.';
    }
    if (!formData.netArea || isNaN(Number(formData.netArea)) || Number(formData.netArea) <= 0) {
      errors.netArea = 'Geçerli bir net metrekare giriniz.';
    }
    if (photos.length === 0) {
      errors.photos = 'Lütfen en az bir ilan fotoğrafı ekleyin.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Lütfen zorunlu ilan alanlarını ve en az 1 görseli eksiksiz doldurun.');
      return;
    }

    const priceNum = Number(formData.price);
    const netAreaNum = Number(formData.netArea);
    const unitPriceNum = Math.round(priceNum / netAreaNum);

    const priceFormatted =
      formData.type === 'Kiralık'
        ? `₺${priceNum.toLocaleString('tr-TR')} / ay`
        : `₺${priceNum.toLocaleString('tr-TR')}`;

    const unitPriceFormatted =
      formData.type === 'Kiralık'
        ? 'Aidat: ₺8.500'
        : `₺${unitPriceNum.toLocaleString('tr-TR')} / m²`;

    // Resolve advisor dynamically from registered users or preserve existing
    const selectedAdvisorRecord = selectAdvisorOptions.find(
      (u) => u.name === formData.advisor
    );

    let assignedAdvisor = null;
    if (selectedAdvisorRecord) {
      assignedAdvisor = {
        name: selectedAdvisorRecord.name,
        title: selectedAdvisorRecord.title || selectedAdvisorRecord.displayRole || 'Gayrimenkul Danışmanı',
        ...(selectedAdvisorRecord.avatarUrl || selectedAdvisorRecord.avatar
          ? { avatar: selectedAdvisorRecord.avatarUrl || selectedAdvisorRecord.avatar }
          : {}),
      };
    } else if (mode === 'edit' && property?.advisor && property.advisor.name === formData.advisor) {
      assignedAdvisor = property.advisor;
    } else if (formData.advisor) {
      assignedAdvisor = {
        name: formData.advisor,
        title: 'Gayrimenkul Danışmanı',
      };
    } else if (currentUser?.name) {
      assignedAdvisor = {
        name: currentUser.name,
        title: currentUser.displayRole || currentUser.role || 'Yönetici Broker',
        ...(currentUser.avatarUrl || currentUser.avatar
          ? { avatar: currentUser.avatarUrl || currentUser.avatar }
          : {}),
      };
    }

    // Prepare gallery and main image
    const mainImage =
      photos.length > 0
        ? photos[0].url
        : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';

    const formattedGallery = photos.map((p, idx) => ({
      label: p.label || (idx === 0 ? 'Ana Görünüm' : `Fotoğraf ${idx + 1}`),
      icon: p.icon || 'photo_camera',
      count: `${idx + 1}/${photos.length} Fotoğraf`,
      image: p.url,
    }));

    const newOrUpdatedProperty = {
      ...(property || {}),
      id: property?.id || `PORT-${Math.floor(1000 + Math.random() * 9000)}`,
      title: formData.title,
      type: formData.type,
      category: formData.category,
      status: formData.status,
      statusType: formData.status === 'Aktif' ? 'active' : 'pending',
      isPublished: property?.isPublished !== undefined ? property.isPublished : true,
      tags: [formData.type, formData.tag],
      location: `${formData.neighborhood} / ${formData.district}`,
      district: formData.district,
      neighborhood: formData.neighborhood,
      price: priceNum,
      priceFormatted,
      unitPrice: unitPriceFormatted,
      netArea: netAreaNum,
      grossArea: Number(formData.grossArea) || netAreaNum + 20,
      rooms: formData.rooms,
      floor: formData.floor,
      buildingAge: formData.buildingAge,
      deedStatus: formData.deedStatus,
      loanEligibility: formData.loanEligibility,
      advisor: assignedAdvisor,
      image: mainImage,
      gallery:
        formattedGallery.length > 0
          ? formattedGallery
          : [
              {
                label: 'Ana Görünüm',
                icon: 'photo_camera',
                count: '1/1 Fotoğraf',
                image: mainImage,
              },
            ],
      contract: property?.contract || {
        status: 'Aktif',
        endDate: '31 Aralık 2026',
        daysLeft: 180,
        note: 'Yetki sözleşmesi tescil edildi.',
      },
      portalSync: property?.portalSync || {
        sahibinden: true,
        hepsiemlak: true,
      },
      matchedBuyers: property?.matchedBuyers || [
        {
          id: 'c-1',
          name: 'Selin Vardar',
          initials: 'SV',
          budget: priceFormatted,
          searchNote: 'Yeni İlan Eşleşmesi',
          matchScore: '%92 Uyum',
          color: 'bg-primary-container text-on-primary',
        },
      ],
    };

    onSubmitSuccess(newOrUpdatedProperty, mode);
    onClose();
  };

  const modalFooter = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md transition-colors cursor-pointer"
      >
        İptal
      </button>
      <button
        type="submit"
        form="property-form"
        className="px-6 py-2.5 rounded-lg bg-primary text-white font-label-md font-semibold hover:bg-primary-container transition-colors shadow-md cursor-pointer flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-[19px]">
          {mode === 'edit' ? 'check' : 'add'}
        </span>
        <span>{mode === 'edit' ? 'Değişiklikleri Kaydet' : 'Portföyü Kaydet'}</span>
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      icon={mode === 'edit' ? 'edit' : 'add_home_work'}
      title={mode === 'edit' ? `İlanı Düzenle (${property?.id})` : 'Yeni Portföy Kaydı Ekle'}
      subtitle="İlan detaylarını, oda bilgilerini ve fotoğraflarını yönetin"
      footer={modalFooter}
    >
      <form id="property-form" onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* FOTOĞRAFLAR VE GALERİ YÖNETİMİ BÖLÜMÜ */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">
                photo_library
              </span>
              <span className="font-label-md font-bold text-primary">
                İlan Fotoğrafları &amp; Galeri
              </span>
              <span className="px-2 py-0.5 rounded-full font-caption text-caption font-semibold bg-primary-container text-on-primary">
                {photos.length} Fotoğraf
              </span>
            </div>

            {/* Photo Source Tabs */}
            <div className="flex items-center p-0.5 rounded-lg bg-surface border border-surface-container text-xs">
              <button
                type="button"
                onClick={() => setPhotoTab('upload')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  photoTab === 'upload'
                    ? 'bg-primary-container text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">upload</span>
                <span>Dosya Yükle</span>
              </button>
              <button
                type="button"
                onClick={() => setPhotoTab('url')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  photoTab === 'url'
                    ? 'bg-primary-container text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">link</span>
                <span>Link / URL</span>
              </button>
              <button
                type="button"
                onClick={() => setPhotoTab('presets')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  photoTab === 'presets'
                    ? 'bg-primary-container text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                <span>Hazır Fotoğraflar</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {photoError && (
            <div className="px-3 py-2 rounded-lg bg-error-container text-on-error-container font-caption text-caption flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{photoError}</span>
            </div>
          )}
          {formErrors.photos && (
            <div className="px-3 py-2 rounded-lg bg-error-container text-on-error-container font-caption text-caption flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{formErrors.photos}</span>
            </div>
          )}

          {/* TAB 1: FILE UPLOAD DROPZONE */}
          {photoTab === 'upload' && (
            <div className="flex flex-col gap-2">
              <label className="border-2 border-dashed border-primary/30 hover:border-secondary bg-surface rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-surface-container group">
                <div className="w-12 h-12 rounded-full bg-surface-container group-hover:bg-primary-container group-hover:text-on-primary text-secondary flex items-center justify-center transition-all mb-2 shadow-xs">
                  <span className="material-symbols-outlined text-[26px]">
                    add_photo_alternate
                  </span>
                </div>
                <span className="font-label-md font-bold text-primary group-hover:text-secondary transition-colors">
                  Bilgisayarınızdan Fotoğraf Seçin veya Sürükleyin
                </span>
                <span className="font-caption text-caption text-on-surface-variant mt-0.5">
                  JPG, PNG veya WebP formatında birden çok fotoğraf seçebilirsiniz
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* TAB 2: DIRECT URL INPUT */}
          {photoTab === 'url' && (
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  link
                </span>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/... veya doğrudan görsel bağlantısı"
                  className="w-full h-10 pl-9 pr-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm text-on-surface text-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                />
              </div>
              <div className="w-40">
                <select
                  value={urlLabel}
                  onChange={(e) => setUrlLabel(e.target.value)}
                  className="w-full h-10 px-2 bg-surface border border-surface-container rounded-lg font-body-sm text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/20"
                >
                  {ROOM_LABELS.map((r) => (
                    <option key={r.label} value={r.label}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddUrl}
                className="px-4 h-10 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-sm font-semibold transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Ekle</span>
              </button>
            </div>
          )}

          {/* TAB 3: PRESETS GALLERY */}
          {photoTab === 'presets' && (
            <div className="flex flex-col gap-1.5">
              <span className="font-caption text-caption text-on-surface-variant">
                Aşağıdaki profesyonel hazır görsellerden tıklayarak galerinize ekleyebilirsiniz:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                {PRESET_PHOTOS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="group relative h-20 rounded-lg overflow-hidden border border-surface-container hover:border-secondary hover:ring-2 hover:ring-secondary/30 transition-all text-left cursor-pointer"
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      width="120"
                      height="80"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-1.5">
                      <span className="font-caption text-[10px] text-white font-semibold leading-tight line-clamp-1">
                        {preset.name}
                      </span>
                    </div>
                    <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-[14px]">add</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PHOTO THUMBNAILS LIST & COVER PREVIEW */}
          {photos.length > 0 ? (
            <div className="mt-1 pt-3 border-t border-surface-container flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption font-semibold text-on-surface-variant">
                  Ekli Fotoğraflar ({photos.length}) — İlk fotoğraf ana kapak görseli olarak kullanılır
                </span>
                <button
                  type="button"
                  onClick={() => setPhotos([])}
                  className="font-caption text-[11px] text-error hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[13px]">delete_sweep</span>
                  Tümünü Temizle
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto p-1">
                {photos.map((photo, index) => {
                  const isCover = index === 0;
                  return (
                    <div
                      key={photo.id}
                      className={`group relative rounded-lg overflow-hidden bg-surface border transition-all ${
                        isCover
                          ? 'border-secondary ring-2 ring-secondary shadow-md'
                          : 'border-surface-container hover:border-outline'
                      }`}
                    >
                      {/* Image Preview */}
                      <div className="h-24 w-full overflow-hidden bg-surface-container-high relative">
                        <img
                          src={photo.url}
                          alt={photo.label}
                          width="160"
                          height="96"
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Cover Badge */}
                        {isCover && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded font-caption text-[10px] font-bold bg-secondary text-on-secondary shadow-xs flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[12px]">star</span>
                            Kapak
                          </span>
                        )}

                        {/* Quick Delete */}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          title="Fotoğrafı Kaldır"
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-error text-white flex items-center justify-center opacity-80 hover:opacity-100 hover:scale-110 transition-all shadow-sm cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>

                      {/* Card Controls */}
                      <div className="p-1.5 flex flex-col gap-1 bg-surface-container-lowest">
                        <select
                          value={photo.label}
                          onChange={(e) => handleLabelChange(index, e.target.value)}
                          className="w-full text-[11px] font-medium bg-surface border border-surface-container rounded px-1.5 py-0.5 text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary cursor-pointer"
                        >
                          {ROOM_LABELS.map((r) => (
                            <option key={r.label} value={r.label}>
                              {r.label}
                            </option>
                          ))}
                        </select>

                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => handleSetCover(index)}
                            className="w-full py-0.5 text-[10px] rounded bg-surface-container hover:bg-secondary hover:text-on-secondary text-primary font-semibold transition-colors flex items-center justify-center gap-0.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[12px]">
                              star_border
                            </span>
                            <span>Kapak Yap</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-surface border border-dashed border-outline text-center flex flex-col items-center justify-center text-on-surface-variant font-caption text-caption">
              <span className="material-symbols-outlined text-[28px] text-outline mb-1">
                image_not_supported
              </span>
              <span>Henüz fotoğraf eklenmedi. Yukarıdaki seçeneklerden fotoğraf ekleyin.</span>
            </div>
          )}
        </div>

        {/* Title */}
        <FormField
          id="property-title"
          label="İlan Başlığı"
          required
          error={formErrors.title}
        >
          <input
            id="property-title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (formErrors.title) setFormErrors((prev) => ({ ...prev, title: null }));
            }}
            placeholder="Örn: Moda Sahilinde Panoramik Deniz Manzaralı 3+1 Penthouse"
            className={`w-full h-11 px-3 bg-surface border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm text-on-surface ${
              formErrors.title ? 'border-error' : 'border-surface-container'
            }`}
          />
        </FormField>

        {/* Type & Category & Tag */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField
            id="property-type"
            label="İşlem Türü"
            required
          >
            <select
              id="property-type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm text-on-surface cursor-pointer"
            >
              <option value="Satılık">Satılık</option>
              <option value="Kiralık">Kiralık</option>
            </select>
          </FormField>

          <FormField
            id="property-category"
            label="Mülk Kategorisi"
            required
          >
            <select
              id="property-category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm text-on-surface cursor-pointer"
            >
              <option value="Daire">Daire</option>
              <option value="Rezidans">Rezidans</option>
              <option value="Villa / Köşk">Villa / Köşk</option>
              <option value="Ticari / Ofis">Ticari / Ofis</option>
              <option value="İmarlı Arsa">İmarlı Arsa</option>
            </select>
          </FormField>

          <FormField
            id="property-tag"
            label="Öne Çıkan Etiket"
          >
            <select
              id="property-tag"
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
              className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm text-on-surface cursor-pointer"
            >
              <option value="Özel Yetkili">Özel Yetkili</option>
              <option value="VIP Portföy">VIP Portföy</option>
              <option value="Fırsat İlan">Fırsat İlan</option>
              <option value="Kurumsal Kiracılı">Kurumsal Kiracılı</option>
              <option value="İmarlı Arsa">İmarlı Arsa</option>
              <option value="Full Eşyalı">Full Eşyalı</option>
              <option value="Boğaz Manzaralı">Boğaz Manzaralı</option>
              <option value="Marina Cephe">Marina Cephe</option>
            </select>
          </FormField>
        </div>

        {/* Price & Net Area & Gross Area */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField
            id="property-price"
            label="Fiyat (₺)"
            required
            error={formErrors.price}
          >
            <input
              id="property-price"
              type="number"
              required
              value={formData.price}
              onChange={(e) => {
                setFormData({ ...formData, price: e.target.value });
                if (formErrors.price) setFormErrors((prev) => ({ ...prev, price: null }));
              }}
              placeholder="Örn: 28500000"
              className={`w-full h-10 px-3 bg-surface border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm text-on-surface ${
                formErrors.price ? 'border-error' : 'border-surface-container'
              }`}
            />
          </FormField>

          <FormField
            id="property-net-area"
            label="Net Metrekare (m²)"
            required
            error={formErrors.netArea}
          >
            <input
              id="property-net-area"
              type="number"
              required
              value={formData.netArea}
              onChange={(e) => {
                setFormData({ ...formData, netArea: e.target.value });
                if (formErrors.netArea) setFormErrors((prev) => ({ ...prev, netArea: null }));
              }}
              placeholder="Örn: 185"
              className={`w-full h-10 px-3 bg-surface border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm text-on-surface ${
                formErrors.netArea ? 'border-error' : 'border-surface-container'
              }`}
            />
          </FormField>

          <FormField
            id="property-gross-area"
            label="Brüt Metrekare (m²)"
          >
            <input
              id="property-gross-area"
              type="number"
              value={formData.grossArea}
              onChange={(e) => setFormData({ ...formData, grossArea: e.target.value })}
              placeholder="Örn: 220"
              className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm text-on-surface"
            />
          </FormField>
        </div>

        {/* District & Neighborhood & Rooms */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField
            id="property-district"
            label="İlçe"
            required
          >
            <input
              id="property-district"
              type="text"
              required
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              placeholder="Örn: Kadıköy"
              className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm text-on-surface"
            />
          </FormField>

          <FormField
            id="property-neighborhood"
            label="Mahalle / Semt"
            required
          >
            <input
              id="property-neighborhood"
              type="text"
              required
              value={formData.neighborhood}
              onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              placeholder="Örn: Moda"
              className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm text-on-surface"
            />
          </FormField>

          <FormField
            id="property-rooms"
            label="Oda Sayısı"
            required
          >
            <select
              id="property-rooms"
              value={formData.rooms}
              onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
              className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm text-on-surface cursor-pointer"
            >
              <option value="1+0">1+0 (Stüdyo)</option>
              <option value="1+1">1+1</option>
              <option value="2+1">2+1</option>
              <option value="3+1">3+1</option>
              <option value="4+1">4+1</option>
              <option value="5+1">5+1</option>
              <option value="5+2">5+2 Dubleks</option>
              <option value="6+2">6+2</option>
              <option value="Villa İmarlı">Villa İmarlı / Arsa</option>
              <option value="Açık Ofis (Bölümlenebilir)">Açık Ofis / Bölümlenebilir</option>
            </select>
          </FormField>
        </div>

        {/* Floor & Building Age & Deed */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField
            id="property-floor"
            label="Kat Bilgisi"
          >
            <input
              id="property-floor"
              type="text"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              placeholder="Örn: 6. Kat (Çatı Dubleks)"
              className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm text-on-surface"
            />
          </FormField>

          <FormField
            id="property-building-age"
            label="Bina Yaşı"
          >
            <input
              id="property-building-age"
              type="text"
              value={formData.buildingAge}
              onChange={(e) => setFormData({ ...formData, buildingAge: e.target.value })}
              placeholder="Örn: 0 (Sıfır Yapı)"
              className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm text-on-surface"
            />
          </FormField>

          <FormField
            id="property-deed-status"
            label="Tapu Durumu"
          >
            <select
              id="property-deed-status"
              value={formData.deedStatus}
              onChange={(e) => setFormData({ ...formData, deedStatus: e.target.value })}
              className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm text-on-surface cursor-pointer"
            >
              <option value="Kat Mülkiyetli">Kat Mülkiyetli</option>
              <option value="Kat İrtifakı">Kat İrtifakı</option>
              <option value="Müstakil Tapu">Müstakil Tapu</option>
              <option value="Ticari İskanlı">Ticari İskanlı</option>
            </select>
          </FormField>
        </div>

        {/* Advisor & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            id="property-advisor"
            label="Sorumlu Danışman"
            required
          >
            <select
              id="property-advisor"
              value={formData.advisor}
              onChange={(e) => setFormData({ ...formData, advisor: e.target.value })}
              className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm text-on-surface cursor-pointer"
            >
              {selectAdvisorOptions.map((adv) => {
                const isSelf = currentUser?.name && adv.name === currentUser.name;
                const labelSuffix = adv.title ? ` - ${adv.title}` : '';
                return (
                  <option key={adv.id || adv.name} value={adv.name}>
                    {adv.name} {isSelf ? '(Siz)' : ''}{labelSuffix}
                  </option>
                );
              })}
              {selectAdvisorOptions.length === 0 && (
                <option value={defaultAdvisorName || 'Danışman'}>
                  {defaultAdvisorName || 'Danışman'} (Siz)
                </option>
              )}
            </select>
          </FormField>

          <FormField
            id="property-status"
            label="İlan Durumu"
            required
          >
            <select
              id="property-status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm text-on-surface cursor-pointer"
            >
              <option value="Aktif">Aktif (Yayında)</option>
              <option value="Yeni İlan">Yeni İlan</option>
              <option value="Sözleşmede">Sözleşme Aşamasında</option>
              <option value="Pasif">Pasif / Arşiv</option>
            </select>
          </FormField>
        </div>
      </form>
    </BaseModal>
  );
}
