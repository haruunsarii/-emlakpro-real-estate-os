import React, { useState } from 'react';
import BaseModal from '../ui/BaseModal';
import FormField from '../ui/FormField';
import { customersList } from '../../services/mockData';
import { useToast } from '../../hooks/useToast';
import { isValidPhone, isValidEmail, isNonEmpty, validateBudgetRange, formatPhoneNumber } from '../../utils/validation';

const AVAILABLE_FEATURES = [
  'Deniz Manzarası',
  'Kapalı Otopark',
  'Balkon / Teras',
  'Sıfır Bina',
  'Metroya Yakın',
  'Güvenlikli Site',
  'Kat Mülkiyetli',
  'Ebeveyn Banyosu',
  'Akıllı Ev Sistemi',
  'Yüksek Tavan',
];

const ADVISORS = [
  { name: 'Burak Yılmaz', initials: 'BY' },
  { name: 'Elif Demir', initials: 'ED' },
  { name: 'Mert Can', initials: 'MC' },
  { name: 'Selin Akın', initials: 'SA' },
];

function getLatestCustomers() {
  try {
    const stored = localStorage.getItem('emlakpro_customers_v1');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return customersList;
}

function generateRequestId() {
  return `TLP-${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * EmlakPro Request Form Modal (Add / Edit)
 * Refactored in Phase 3.2 Step 4 using BaseModal and FormField primitives.
 */
export default function RequestFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
}) {
  const isEditing = Boolean(initialData);
  const { toast } = useToast();

  const [customers] = useState(getLatestCustomers);

  const getInitialFormData = () => {
    if (initialData) {
      return {
        customerId: initialData.customerId || '',
        clientName: initialData.clientName || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        transactionType: initialData.transactionType || 'Satılık',
        propertyType: initialData.propertyType || 'Daire / Rezidans',
        city: initialData.city || 'İstanbul',
        district: initialData.district || 'Kadıköy',
        neighborhood: initialData.neighborhood || '',
        minBudget: initialData.minBudget || 20000000,
        maxBudget: initialData.maxBudget || 35000000,
        minRooms: initialData.minRooms || '3+1',
        maxRooms: initialData.maxRooms || '4+1',
        minArea: initialData.minArea || 140,
        maxArea: initialData.maxArea || 220,
        features: initialData.features || ['Deniz Manzarası', 'Kapalı Otopark'],
        advisor: initialData.advisor || 'Burak Yılmaz',
        status: initialData.status || 'Aktif',
        statusBadge: initialData.statusBadge || 'Aktif Sıcak Talep',
        category: initialData.category || 'VIP Alıcı',
        notes: initialData.notes || '',
      };
    }

    const defaultCustomer = customers[0] || {};
    return {
      customerId: defaultCustomer.id || '',
      clientName: defaultCustomer.name || 'Selin Vardar',
      phone: defaultCustomer.phone || '0 (533) 819 44 20',
      email: defaultCustomer.email || 'selin.vardar@example.com',
      transactionType: 'Satılık',
      propertyType: 'Daire / Rezidans',
      city: 'İstanbul',
      district: 'Kadıköy',
      neighborhood: 'Moda',
      minBudget: 20000000,
      maxBudget: 35000000,
      minRooms: '3+1',
      maxRooms: '4+1',
      minArea: 140,
      maxArea: 220,
      features: ['Deniz Manzarası', 'Kapalı Otopark'],
      advisor: 'Burak Yılmaz',
      status: 'Aktif',
      statusBadge: 'Aktif Sıcak Talep',
      category: 'VIP Alıcı',
      notes: '',
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});

  const currentKey = `${isEditing ? 'edit' : 'add'}-${initialData?.id || 'new'}-${isOpen ? 'open' : 'closed'}`;
  const [prevKey, setPrevKey] = useState(currentKey);

  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    setFormData(getInitialFormData());
    setErrors({});
  }

  const handleCustomerSelect = (e) => {
    const custId = e.target.value;
    const found = customers.find((c) => c.id === custId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        customerId: found.id,
        clientName: found.name,
        phone: found.phone,
        email: found.email,
      }));
      setErrors((prev) => ({ ...prev, clientName: null, phone: null, email: null }));
    }
  };

  const handleFeatureToggle = (feature) => {
    setFormData((prev) => {
      const exists = prev.features.includes(feature);
      return {
        ...prev,
        features: exists
          ? prev.features.filter((f) => f !== feature)
          : [...prev.features, feature],
      };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!isNonEmpty(formData.clientName, 2)) {
      newErrors.clientName = 'Müşteri adı en az 2 karakter olmalıdır.';
    }
    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz (0 (5XX) XXX XX XX).';
    }
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz.';
    }
    if (!isNonEmpty(formData.district, 2)) {
      newErrors.district = 'İlçe / bölge bilgisi girilmelidir.';
    }

    const budgetValidation = validateBudgetRange(formData.minBudget, formData.maxBudget);
    if (!budgetValidation.isValid) {
      newErrors.budget = budgetValidation.message;
    }

    if (Number(formData.minArea) <= 0 || Number(formData.maxArea) <= 0) {
      newErrors.area = 'Metrekare değerleri pozitif sayı olmalıdır.';
    } else if (Number(formData.minArea) > Number(formData.maxArea)) {
      newErrors.area = 'Minimum m², maksimum m² değerinden büyük olamaz.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Lütfen talep formundaki eksik veya geçersiz alanları düzeltin.');
      return;
    }

    const advisorMatch = ADVISORS.find((a) => a.name === formData.advisor);
    const advisorInitials = advisorMatch ? advisorMatch.initials : 'BY';

    // Format budget display string (e.g. ₺25M - ₺35M or ₺120K - ₺160K)
    let budgetDisplay = '';
    const minVal = Number(formData.minBudget);
    const maxVal = Number(formData.maxBudget);
    if (maxVal >= 1000000) {
      const minM = minVal >= 1000000 ? `${(minVal / 1000000).toFixed(0)}M` : `${(minVal / 1000).toFixed(0)}K`;
      const maxM = `${(maxVal / 1000000).toFixed(0)}M`;
      budgetDisplay = `₺${minM} - ₺${maxM}`;
    } else {
      budgetDisplay = `₺${(minVal / 1000).toFixed(0)}K - ₺${(maxVal / 1000).toFixed(0)}K`;
    }

    const payload = {
      ...formData,
      id: isEditing ? initialData.id : generateRequestId(),
      advisorInitials,
      budget: budgetDisplay,
      targetRegion: `${formData.district}${formData.neighborhood ? ` (${formData.neighborhood})` : ''}`,
      roomCount: `${formData.minRooms} - ${formData.maxRooms}`,
      specialPreference: formData.features[0] || 'Standart',
      date: isEditing ? initialData.date : 'Bugün',
    };

    onSubmit(payload);
    onClose();
  };

  const modalFooter = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md cursor-pointer transition-colors"
      >
        Vazgeç
      </button>
      <button
        type="submit"
        form="request-modal-form"
        className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white font-label-md font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px]">
          {isEditing ? 'save' : 'add_circle'}
        </span>
        <span>{isEditing ? 'Değişiklikleri Kaydet' : 'Talebi Oluştur'}</span>
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      icon={isEditing ? 'edit_note' : 'add_task'}
      title={isEditing ? 'Müşteri Talebini Düzenle' : 'Yeni Müşteri Talebi Oluştur'}
      subtitle="Alıcı ve kiracı kriterlerini kaydedin, akıllı motor otomatik portföy eşleştirsin."
      footer={modalFooter}
    >
      <form id="request-modal-form" onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* Section 1: Customer & Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface p-4 rounded-xl border border-surface-container">
          <FormField
            id="request-customer-select"
            label="Kayıtlı Müşteri Seçin"
            required
            className="md:col-span-1"
          >
            <select
              id="request-customer-select"
              value={formData.customerId}
              onChange={handleCustomerSelect}
              className="w-full h-[42px] px-3 bg-surface-container-lowest text-on-surface font-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:border-secondary cursor-pointer"
            >
              <option value="">-- Müşteri Listesinden Seç --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.role || 'Müşteri'} • {c.phone || c.email || c.id})
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            id="request-client-name"
            label="Müşteri Adı Soyadı"
            required
            error={errors.clientName}
            className="md:col-span-1"
          >
            <input
              id="request-client-name"
              type="text"
              value={formData.clientName}
              onChange={(e) => {
                setFormData({ ...formData, clientName: e.target.value });
                if (errors.clientName) setErrors((prev) => ({ ...prev, clientName: null }));
              }}
              placeholder="Örn: Selin Vardar"
              className={`w-full h-[42px] px-3 bg-surface-container-lowest text-on-surface font-body-sm rounded-lg border focus:outline-none ${
                errors.clientName ? 'border-error bg-error-container/10' : 'border-surface-container-high focus:border-secondary'
              }`}
            />
          </FormField>

          <FormField
            id="request-phone"
            label="İletişim Telefonu"
            error={errors.phone}
            className="md:col-span-1"
          >
            <input
              id="request-phone"
              type="text"
              value={formData.phone}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                setFormData({ ...formData, phone: formatted });
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
              }}
              placeholder="0 (5XX) XXX XX XX"
              className={`w-full h-[42px] px-3 bg-surface-container-lowest text-on-surface font-body-sm rounded-lg border focus:outline-none ${
                errors.phone ? 'border-error bg-error-container/10' : 'border-surface-container-high focus:border-secondary'
              }`}
            />
          </FormField>

          <FormField
            id="request-email"
            label="E-posta Adresi"
            error={errors.email}
            className="md:col-span-1"
          >
            <input
              id="request-email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              placeholder="musteri@ornek.com"
              className={`w-full h-[42px] px-3 bg-surface-container-lowest text-on-surface font-body-sm rounded-lg border focus:outline-none ${
                errors.email ? 'border-error bg-error-container/10' : 'border-surface-container-high focus:border-secondary'
              }`}
            />
          </FormField>
        </div>

        {/* Section 2: Property Type & Transaction */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            id="request-transaction-type"
            label="Talep Türü"
          >
            <div className="flex gap-2">
              {['Satılık', 'Kiralık'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, transactionType: type })}
                  className={`flex-1 h-[42px] rounded-lg font-label-md transition-all cursor-pointer ${
                    formData.transactionType === type
                      ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                      : 'bg-surface text-on-surface-variant hover:bg-surface-container border border-surface-container'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </FormField>

          <FormField
            id="request-property-type"
            label="Gayrimenkul Tipi"
          >
            <select
              id="request-property-type"
              value={formData.propertyType}
              onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
              className="w-full h-[42px] px-3 bg-surface text-on-surface font-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:border-secondary cursor-pointer"
            >
              <option value="Daire / Rezidans">Daire / Rezidans</option>
              <option value="Penthouse / Çatı Dubleksi">Penthouse / Çatı Dubleksi</option>
              <option value="Villa / Müstakil">Villa / Müstakil</option>
              <option value="Ticari Plaza / Ofis">Ticari Plaza / Ofis</option>
              <option value="Komple Bina / Plaza Bloğu">Komple Bina / Plaza Bloğu</option>
              <option value="Arsa / Arazi">Arsa / Arazi</option>
            </select>
          </FormField>

          <FormField
            id="request-category"
            label="Talep Segmenti"
          >
            <select
              id="request-category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full h-[42px] px-3 bg-surface text-on-surface font-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:border-secondary cursor-pointer"
            >
              <option value="VIP Alıcı">VIP Alıcı</option>
              <option value="Yatırımcı">Yatırımcı</option>
              <option value="Kurumsal Kiracı">Kurumsal Kiracı</option>
              <option value="Müstakil Arayışı">Müstakil Arayışı</option>
              <option value="İlk Ev Alıcısı">İlk Ev Alıcısı</option>
            </select>
          </FormField>
        </div>

        {/* Section 3: Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            id="request-city"
            label="Şehir"
          >
            <input
              id="request-city"
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="İstanbul"
              className="w-full h-[42px] px-3 bg-surface text-on-surface font-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:border-secondary"
            />
          </FormField>

          <FormField
            id="request-district"
            label="İlçe / Bölge"
            required
            error={errors.district}
          >
            <input
              id="request-district"
              type="text"
              value={formData.district}
              onChange={(e) => {
                setFormData({ ...formData, district: e.target.value });
                if (errors.district) setErrors((prev) => ({ ...prev, district: null }));
              }}
              placeholder="Kadıköy, Beşiktaş..."
              className={`w-full h-[42px] px-3 bg-surface text-on-surface font-body-sm rounded-lg border focus:outline-none ${
                errors.district ? 'border-error bg-error-container/10' : 'border-surface-container-high focus:border-secondary'
              }`}
            />
          </FormField>

          <FormField
            id="request-neighborhood"
            label="Mahalle / Semt"
          >
            <input
              id="request-neighborhood"
              type="text"
              value={formData.neighborhood}
              onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              placeholder="Moda, Kalamış..."
              className="w-full h-[42px] px-3 bg-surface text-on-surface font-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:border-secondary"
            />
          </FormField>
        </div>

        {/* Section 4: Budget Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface p-4 rounded-xl border border-surface-container">
          <FormField
            id="request-min-budget"
            label="Minimum Bütçe (₺)"
          >
            <input
              id="request-min-budget"
              type="number"
              step="500000"
              value={formData.minBudget}
              onChange={(e) => {
                setFormData({ ...formData, minBudget: e.target.value });
                if (errors.budget) setErrors((prev) => ({ ...prev, budget: null }));
              }}
              className="w-full h-[42px] px-3 bg-surface-container-lowest text-on-surface font-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:border-secondary"
            />
          </FormField>

          <FormField
            id="request-max-budget"
            label="Maksimum Bütçe (₺)"
            required
            error={errors.budget}
          >
            <input
              id="request-max-budget"
              type="number"
              step="500000"
              value={formData.maxBudget}
              onChange={(e) => {
                setFormData({ ...formData, maxBudget: e.target.value });
                if (errors.budget) setErrors((prev) => ({ ...prev, budget: null }));
              }}
              className={`w-full h-[42px] px-3 bg-surface-container-lowest text-on-surface font-body-sm rounded-lg border focus:outline-none ${
                errors.budget ? 'border-error bg-error-container/10' : 'border-surface-container-high focus:border-secondary'
              }`}
            />
          </FormField>
        </div>

        {/* Section 5: Area and Rooms */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormField
            id="request-min-rooms"
            label="Min. Oda"
          >
            <select
              id="request-min-rooms"
              value={formData.minRooms}
              onChange={(e) => setFormData({ ...formData, minRooms: e.target.value })}
              className="w-full h-[42px] px-3 bg-surface text-on-surface font-body-sm rounded-lg border border-surface-container-high cursor-pointer"
            >
              <option value="1+1">1+1</option>
              <option value="2+1">2+1</option>
              <option value="3+1">3+1</option>
              <option value="4+1">4+1</option>
              <option value="5+1">5+1 ve üzeri</option>
            </select>
          </FormField>

          <FormField
            id="request-max-rooms"
            label="Maks. Oda"
          >
            <select
              id="request-max-rooms"
              value={formData.maxRooms}
              onChange={(e) => setFormData({ ...formData, maxRooms: e.target.value })}
              className="w-full h-[42px] px-3 bg-surface text-on-surface font-body-sm rounded-lg border border-surface-container-high cursor-pointer"
            >
              <option value="2+1">2+1</option>
              <option value="3+1">3+1</option>
              <option value="4+1">4+1</option>
              <option value="5+1">5+1</option>
              <option value="6+2">6+2 ve üzeri</option>
            </select>
          </FormField>

          <FormField
            id="request-min-area"
            label="Min. m²"
          >
            <input
              id="request-min-area"
              type="number"
              value={formData.minArea}
              onChange={(e) => {
                setFormData({ ...formData, minArea: e.target.value });
                if (errors.area) setErrors((prev) => ({ ...prev, area: null }));
              }}
              className="w-full h-[42px] px-3 bg-surface text-on-surface font-body-sm rounded-lg border border-surface-container-high"
            />
          </FormField>

          <FormField
            id="request-max-area"
            label="Maks. m²"
            error={errors.area}
          >
            <input
              id="request-max-area"
              type="number"
              value={formData.maxArea}
              onChange={(e) => {
                setFormData({ ...formData, maxArea: e.target.value });
                if (errors.area) setErrors((prev) => ({ ...prev, area: null }));
              }}
              className="w-full h-[42px] px-3 bg-surface text-on-surface font-body-sm rounded-lg border border-surface-container-high"
            />
          </FormField>
        </div>

        {/* Section 6: Features */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-body-sm font-semibold text-on-surface">
            Özel Tercihler &amp; Özellikler (Eşleştirme Puanını Etkiler)
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_FEATURES.map((feature) => {
              const selected = formData.features.includes(feature);
              return (
                <button
                  key={feature}
                  type="button"
                  onClick={() => handleFeatureToggle(feature)}
                  className={`px-3 py-1.5 rounded-lg font-caption text-caption font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    selected
                      ? 'bg-secondary text-on-secondary shadow-xs font-semibold'
                      : 'bg-surface text-on-surface-variant hover:bg-surface-container border border-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {selected ? 'check' : 'add'}
                  </span>
                  <span>{feature}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 7: Advisor, Status & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="request-advisor"
            label="Sorumlu Danışman"
          >
            <select
              id="request-advisor"
              value={formData.advisor}
              onChange={(e) => setFormData({ ...formData, advisor: e.target.value })}
              className="w-full h-[42px] px-3 bg-surface text-on-surface font-body-sm rounded-lg border border-surface-container-high cursor-pointer"
            >
              {ADVISORS.map((adv) => (
                <option key={adv.name} value={adv.name}>
                  {adv.name} ({adv.initials})
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            id="request-status"
            label="Talep Durumu"
          >
            <select
              id="request-status"
              value={formData.status}
              onChange={(e) => {
                const val = e.target.value;
                const badgeMap = {
                  Yeni: 'Yeni Talep',
                  Aktif: 'Aktif Sıcak Talep',
                  'Eşleşme Bulundu': 'Eşleşme Bulundu',
                  'Randevu Planlandı': 'Randevu Planlandı',
                  Tamamlandı: 'Tamamlandı (Satış)',
                  İptal: 'İptal Edildi',
                };
                setFormData({
                  ...formData,
                  status: val,
                  statusBadge: badgeMap[val] || 'Aktif',
                });
              }}
              className="w-full h-[42px] px-3 bg-surface text-on-surface font-body-sm rounded-lg border border-surface-container-high cursor-pointer"
            >
              <option value="Yeni">Yeni</option>
              <option value="Aktif">Aktif</option>
              <option value="Eşleşme Bulundu">Eşleşme Bulundu</option>
              <option value="Randevu Planlandı">Randevu Planlandı</option>
              <option value="Tamamlandı">Tamamlandı</option>
              <option value="İptal">İptal</option>
            </select>
          </FormField>

          <FormField
            id="request-notes"
            label="Özel Müşteri Notu"
            className="md:col-span-2"
          >
            <textarea
              id="request-notes"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Müşterinin özel beklentileri, taşınma aciliyeti, ödeme şekli..."
              className="w-full p-3 bg-surface text-on-surface font-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:border-secondary resize-none"
            />
          </FormField>
        </div>
      </form>
    </BaseModal>
  );
}
