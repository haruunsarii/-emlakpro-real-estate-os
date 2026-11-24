import React, { useState } from 'react';
import BaseModal from '../ui/BaseModal';
import FormField from '../ui/FormField';
import { customersList, initialPropertiesList } from '../../services/mockData';
import { useToast } from '../../hooks/useToast';
import { isValidPhone, isValidEmail, isNonEmpty, isPositiveNumber } from '../../utils/validation';

const ADVISORS = [
  { name: 'Burak Yılmaz', initials: 'BY' },
  { name: 'Elif Demir', initials: 'ED' },
  { name: 'Mert Can', initials: 'MC' },
  { name: 'Caner Aydın', initials: 'CA' },
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

function getLatestProperties() {
  try {
    const stored = localStorage.getItem('emlakpro_properties_v1');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return initialPropertiesList;
}

function generateDealId() {
  return `FRS-${Math.floor(100 + Math.random() * 900)}`;
}

function generateActivityId() {
  return `act-${Date.now()}`;
}

/**
 * EmlakPro Deal Form Modal (Add / Edit)
 * Refactored in Phase 3.2 Step 4 using BaseModal and FormField primitives.
 */
export default function DealFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  stages = [],
  defaultStageId = 'yeni_firsat',
}) {
  const isEditing = Boolean(initialData);
  const { toast } = useToast();

  const [customers] = useState(getLatestCustomers);
  const [properties] = useState(getLatestProperties);

  const getInitialFormData = () => {
    if (initialData) {
      return {
        title: initialData.title || '',
        customerId: initialData.customerId || '',
        customerName: initialData.customerName || '',
        customerPhone: initialData.customerPhone || '',
        customerEmail: initialData.customerEmail || '',
        customerRole: initialData.customerRole || 'Müşteri',
        propertyId: initialData.propertyId || '',
        propertyTitle: initialData.propertyTitle || '',
        propertyLocation: initialData.propertyLocation || '',
        propertyDistrict: initialData.propertyDistrict || '',
        propertyType: initialData.propertyType || 'Daire / Rezidans',
        type: initialData.type || 'Satılık',
        stage: initialData.stage || defaultStageId,
        amount: initialData.amount || 25000000,
        commissionRate: initialData.commissionRate || 2,
        advisor: initialData.advisor || 'Burak Yılmaz',
        priority: initialData.priority || 'Normal',
        nextAction: initialData.nextAction || '',
        nextActionDate: initialData.nextActionDate || '',
        notes: initialData.notes || '',
      };
    }

    const defaultCustomer = customers[0] || {};
    const defaultProperty = properties[0] || {};
    return {
      title: defaultProperty.title ? `${defaultProperty.title} Anlaşması` : 'Yeni Satış Fırsatı',
      customerId: defaultCustomer.id || '',
      customerName: defaultCustomer.name || 'Selin Vardar',
      customerPhone: defaultCustomer.phone || '0 (533) 819 44 20',
      customerEmail: defaultCustomer.email || 'selin.vardar@example.com',
      customerRole: defaultCustomer.role || 'Alıcı Adayı',
      propertyId: defaultProperty.id || 'PORT-8841',
      propertyTitle: defaultProperty.title || 'Moda Sahil Penthouse',
      propertyLocation: defaultProperty.location || 'Kadıköy, İstanbul',
      propertyDistrict: defaultProperty.district || 'Kadıköy',
      propertyType: defaultProperty.category || 'Daire / Rezidans',
      type: defaultProperty.type || 'Satılık',
      stage: defaultStageId,
      amount: defaultProperty.price || 28500000,
      commissionRate: 2,
      advisor: 'Burak Yılmaz',
      priority: 'Normal',
      nextAction: 'İlk telefon görüşmesi yapılacak',
      nextActionDate: new Date().toISOString().slice(0, 10),
      notes: '',
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});

  const currentKey = `${isEditing ? 'edit' : 'add'}-${initialData?.id || 'new'}-${isOpen ? 'open' : 'closed'}-${defaultStageId}`;
  const [prevKey, setPrevKey] = useState(currentKey);

  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    setFormData(getInitialFormData());
    setErrors({});
  }

  const handleCustomerChange = (e) => {
    const custId = e.target.value;
    const found = customers.find((c) => c.id === custId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        customerId: found.id,
        customerName: found.name,
        customerPhone: found.phone,
        customerEmail: found.email,
        customerRole: found.role || 'Alıcı',
      }));
      setErrors((prev) => ({ ...prev, customerName: null, customerPhone: null, customerEmail: null }));
    }
  };

  const handlePropertyChange = (e) => {
    const propId = e.target.value;
    const found = properties.find((p) => p.id === propId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        propertyId: found.id,
        propertyTitle: found.title,
        propertyLocation: found.location,
        propertyDistrict: found.district || 'İstanbul',
        propertyType: found.category || 'Daire',
        type: found.type || 'Satılık',
        amount: found.price || prev.amount,
        title: prev.title ? prev.title : `${found.title} Fırsatı`,
      }));
    }
  };

  const calculatedCommission = Math.round(
    (Number(formData.amount || 0) * Number(formData.commissionRate || 2)) / 100
  );

  const validate = () => {
    const newErrors = {};
    if (!isNonEmpty(formData.title, 3)) {
      newErrors.title = 'Fırsat başlığı en az 3 karakter olmalıdır.';
    }
    if (!isNonEmpty(formData.customerName, 2)) {
      newErrors.customerName = 'Müşteri adı zorunludur.';
    }
    if (formData.customerPhone && !isValidPhone(formData.customerPhone)) {
      newErrors.customerPhone = 'Geçerli bir telefon numarası giriniz (0 (5XX) XXX XX XX).';
    }
    if (formData.customerEmail && !isValidEmail(formData.customerEmail)) {
      newErrors.customerEmail = 'Geçerli bir e-posta adresi giriniz.';
    }
    if (!isPositiveNumber(formData.amount, 1000)) {
      newErrors.amount = 'Geçerli bir işlem tutarı girilmelidir (en az ₺1.000).';
    }
    if (!isPositiveNumber(formData.commissionRate, 0.1) || Number(formData.commissionRate) > 100) {
      newErrors.commissionRate = 'Komisyon oranı %0.1 ile %100 arasında olmalıdır.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Lütfen fırsat formundaki zorunlu alanları düzeltin.');
      return;
    }

    const advisorObj = ADVISORS.find((a) => a.name === formData.advisor);
    const advisorInitials = advisorObj ? advisorObj.initials : 'BY';

    const customerInitials = formData.customerName
      ? formData.customerName
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'SV';

    const payload = {
      ...formData,
      id: isEditing ? initialData.id : generateDealId(),
      customerInitials,
      advisorInitials,
      amount: Number(formData.amount),
      amountFormatted:
        formData.type === 'Kiralık'
          ? `₺${Number(formData.amount).toLocaleString('tr-TR')} / ay`
          : `₺${Number(formData.amount).toLocaleString('tr-TR')}`,
      commission: calculatedCommission,
      commissionFormatted:
        formData.type === 'Kiralık'
          ? `₺${calculatedCommission.toLocaleString('tr-TR')} (1 Kira)`
          : `₺${calculatedCommission.toLocaleString('tr-TR')} (%${formData.commissionRate})`,
      lastActivity: isEditing ? initialData.lastActivity : 'Az önce oluşturuldu',
      isUrgent: formData.priority === 'Kritik',
      activities: isEditing
        ? initialData.activities || []
        : [
            {
              id: generateActivityId(),
              type: 'created',
              text: 'Fırsat oluşturuldu ve satış hunisine kaydedildi.',
              author: formData.advisor,
              date: 'Bugün, az önce',
            },
          ],
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
        form="deal-modal-form"
        className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white font-label-md font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px]">
          {isEditing ? 'save' : 'add_circle'}
        </span>
        <span>{isEditing ? 'Değişiklikleri Kaydet' : 'Fırsatı Kaydet'}</span>
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      icon={isEditing ? 'edit_note' : 'add_task'}
      title={isEditing ? 'Fırsatı Düzenle' : 'Yeni Satış / Kiralama Fırsatı Ekle'}
      subtitle="Müşteri ve gayrimenkulü bağlayın, Kanban aşamasını ve komisyonunu belirleyin."
      footer={modalFooter}
    >
      <form id="deal-modal-form" onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* Section 1: Title & Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FormField
            id="deal-form-title"
            label="Fırsat / Anlaşma Başlığı"
            required
            error={errors.title}
            className="md:col-span-2"
          >
            <input
              id="deal-form-title"
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
              }}
              placeholder="Örn: Moda Sahil Penthouse Satışı"
              className={`w-full h-[42px] px-3 bg-surface text-on-surface font-body-sm rounded-lg border focus:outline-none ${
                errors.title ? 'border-error bg-error-container/10' : 'border-surface-container-high focus:border-secondary'
              }`}
            />
          </FormField>

          <FormField
            id="deal-form-type"
            label="İşlem Türü"
          >
            <div className="flex gap-2">
              {['Satılık', 'Kiralık'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t })}
                  className={`flex-1 h-[42px] rounded-lg font-label-md transition-all cursor-pointer ${
                    formData.type === t
                      ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                      : 'bg-surface text-on-surface-variant hover:bg-surface-container border border-surface-container'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </FormField>
        </div>

        {/* Section 2: Linked Customer & Portfolio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface p-4 rounded-xl border border-surface-container">
          {/* Customer Select */}
          <FormField
            id="deal-customer-select"
            label="Müşteri Seçin"
            required
            error={errors.customerName}
          >
            <div className="flex flex-col gap-2">
              <select
                id="deal-customer-select"
                value={formData.customerId}
                onChange={handleCustomerChange}
                className="w-full h-[42px] px-3 bg-surface-container-lowest text-on-surface font-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:border-secondary cursor-pointer"
              >
                <option value="">-- Kayıtlı Müşterilerden Seç --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone || c.email || c.id})
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => {
                  setFormData({ ...formData, customerName: e.target.value });
                  if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: null }));
                }}
                placeholder="Müşteri Adı Soyadı"
                className={`w-full h-[38px] px-3 bg-surface-container-lowest text-on-surface font-body-sm rounded-lg border text-body-sm ${
                  errors.customerName ? 'border-error bg-error-container/10' : 'border-surface-container-high'
                }`}
              />
            </div>
          </FormField>

          {/* Property Select */}
          <FormField
            id="deal-property-select"
            label="Portföy / Gayrimenkul Seçin"
            required
          >
            <div className="flex flex-col gap-2">
              <select
                id="deal-property-select"
                value={formData.propertyId}
                onChange={handlePropertyChange}
                className="w-full h-[42px] px-3 bg-surface-container-lowest text-on-surface font-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:border-secondary cursor-pointer"
              >
                <option value="">-- Mevcut Portföy Havuzundan Seç --</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} - {p.title} ({p.priceFormatted || `₺${Number(p.price || 0).toLocaleString('tr-TR')}`})
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={formData.propertyLocation}
                onChange={(e) => setFormData({ ...formData, propertyLocation: e.target.value })}
                placeholder="Konum (Örn: Kadıköy, Moda)"
                className="w-full h-[38px] px-3 bg-surface-container-lowest text-on-surface font-body-sm rounded-lg border border-surface-container-high text-body-sm"
              />
            </div>
          </FormField>
        </div>

        {/* Section 3: Financials & Commission */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-surface p-4 rounded-xl border border-surface-container">
          <FormField
            id="deal-form-amount"
            label="Tahmini İşlem Bedeli (₺)"
            required
            error={errors.amount}
          >
            <input
              id="deal-form-amount"
              type="number"
              step="50000"
              value={formData.amount}
              onChange={(e) => {
                setFormData({ ...formData, amount: e.target.value });
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: null }));
              }}
              className={`w-full h-[42px] px-3 bg-surface-container-lowest text-on-surface font-body-sm rounded-lg border focus:outline-none ${
                errors.amount ? 'border-error bg-error-container/10' : 'border-surface-container-high focus:border-secondary'
              }`}
            />
          </FormField>

          <FormField
            id="deal-form-commission-rate"
            label="Komisyon Oranı (%)"
            error={errors.commissionRate}
          >
            <input
              id="deal-form-commission-rate"
              type="number"
              step="0.5"
              min="0.5"
              max="100"
              value={formData.commissionRate}
              onChange={(e) => {
                setFormData({ ...formData, commissionRate: e.target.value });
                if (errors.commissionRate) setErrors((prev) => ({ ...prev, commissionRate: null }));
              }}
              className={`w-full h-[42px] px-3 bg-surface-container-lowest text-on-surface font-body-sm rounded-lg border focus:outline-none ${
                errors.commissionRate ? 'border-error bg-error-container/10' : 'border-surface-container-high focus:border-secondary'
              }`}
            />
          </FormField>

          <FormField
            id="deal-form-commission-calc-field"
            label="Tahmini Hizmet Bedeli"
          >
            <div
              id="deal-form-commission-calc"
              className="h-[42px] px-3 bg-surface-container flex items-center font-bold text-secondary rounded-lg border border-surface-container-high font-body-sm"
            >
              ₺{calculatedCommission.toLocaleString('tr-TR')}
            </div>
          </FormField>
        </div>

        {/* Section 4: Stage, Priority & Advisor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FormField
            id="deal-form-stage"
            label="Kanban Aşaması"
          >
            <select
              id="deal-form-stage"
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full h-[42px] px-3 bg-surface text-on-surface font-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:border-secondary cursor-pointer"
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            id="deal-form-priority"
            label="Öncelik Durumu"
          >
            <select
              id="deal-form-priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full h-[42px] px-3 bg-surface text-on-surface font-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:border-secondary cursor-pointer"
            >
              <option value="Normal">Normal Öncelik</option>
              <option value="Yüksek">Yüksek Öncelik</option>
              <option value="Kritik">Kritik (Acil Takip)</option>
            </select>
          </FormField>

          <FormField
            id="deal-form-advisor"
            label="Sorumlu Danışman"
          >
            <select
              id="deal-form-advisor"
              value={formData.advisor}
              onChange={(e) => setFormData({ ...formData, advisor: e.target.value })}
              className="w-full h-[42px] px-3 bg-surface text-on-surface font-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:border-secondary cursor-pointer"
            >
              {ADVISORS.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name} ({a.initials})
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Section 5: Next Action & Follow-up */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            id="deal-form-next-action"
            label="Sonraki Takip Eylemi"
          >
            <input
              id="deal-form-next-action"
              type="text"
              value={formData.nextAction}
              onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
              placeholder="Örn: Yarın 14:00 Portföy sunumu"
              className="w-full h-[42px] px-3 bg-surface text-on-surface font-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:border-secondary"
            />
          </FormField>

          <FormField
            id="deal-form-next-action-date"
            label="Takip Tarihi"
          >
            <input
              id="deal-form-next-action-date"
              type="date"
              value={formData.nextActionDate}
              onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value })}
              className="w-full h-[42px] px-3 bg-surface text-on-surface font-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:border-secondary"
            />
          </FormField>

          <FormField
            id="deal-form-notes"
            label="Görüşme Notları / Özel Beklentiler"
            className="md:col-span-2"
          >
            <textarea
              id="deal-form-notes"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Pazarlık marjı, ödeme planı ve müşteri talepleri..."
              className="w-full p-3 bg-surface text-on-surface font-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:border-secondary resize-none"
            />
          </FormField>
        </div>
      </form>
    </BaseModal>
  );
}
