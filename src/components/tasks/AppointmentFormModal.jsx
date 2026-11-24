import React, { useState, useMemo } from 'react';
import BaseModal from '../ui/BaseModal';
import FormField from '../ui/FormField';
import { APPOINTMENT_TYPES, getTodayYMD, getActiveAdvisors } from '../../utils/taskHelpers';
import { customersList, initialPropertiesList } from '../../services/mockData';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { isNonEmpty, isValidTimeRange } from '../../utils/validation';

function getInitialCustomers() {
  try {
    const saved = localStorage.getItem('emlakpro_customers_v1') || localStorage.getItem('emlakpro_customers');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return customersList;
}

function getInitialProperties() {
  try {
    const savedProps = localStorage.getItem('emlakpro_properties_v1') || localStorage.getItem('emlakpro_properties');
    if (savedProps) {
      const parsed = JSON.parse(savedProps);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return initialPropertiesList;
}

function generateApptId() {
  return `APPT-${Date.now().toString().slice(-4)}`;
}

/**
 * EmlakPro Appointment Form Modal (Add / Edit)
 * Refactored in Phase 3.2 Step 4 using BaseModal and FormField primitives.
 */
export default function AppointmentFormModal({
  isOpen = false,
  onClose,
  onSave,
  initialData = null,
}) {
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const availableAdvisors = useMemo(() => {
    return getActiveAdvisors(currentUser);
  }, [currentUser]);

  const defaultAdvisorName = useMemo(() => {
    return currentUser?.name || availableAdvisors[0]?.name || '';
  }, [currentUser, availableAdvisors]);

  // Düzenleme sırasında mevcut sorumlu korunsun
  const selectAdvisorOptions = useMemo(() => {
    const list = [...availableAdvisors];
    const existing = initialData?.advisorName;
    if (existing && !list.some((u) => u.name === existing)) {
      list.push({
        id: 'existing-appt-advisor',
        name: existing,
        title: 'Danışman',
      });
    }
    return list;
  }, [availableAdvisors, initialData]);

  const [availableCustomers] = useState(getInitialCustomers);
  const [availableProperties] = useState(getInitialProperties);

  const getInitialFormData = () => {
    if (initialData) {
      return {
        title: initialData.title || '',
        type: initialData.type || 'Yer Gösterimi',
        clientId: initialData.clientId || '',
        clientName: initialData.clientName || '',
        clientPhone: initialData.clientPhone || '',
        clientRole: initialData.clientRole || 'Müşteri',
        propertyId: initialData.propertyId || '',
        propertyTitle: initialData.propertyTitle || '',
        propertyPrice: initialData.propertyPrice || '',
        propertySpecs: initialData.propertySpecs || '',
        propertyImage: initialData.propertyImage || '',
        date: initialData.date || getTodayYMD(),
        startTime: initialData.startTime || '10:00',
        endTime: initialData.endTime || '11:00',
        advisorName: initialData.advisorName || defaultAdvisorName,
        location: initialData.location || '',
        notes: initialData.notes || '',
        status: initialData.status || 'active',
      };
    }
    return {
      title: '',
      type: 'Yer Gösterimi',
      clientId: '',
      clientName: '',
      clientPhone: '',
      clientRole: 'Müşteri',
      propertyId: '',
      propertyTitle: '',
      propertyPrice: '',
      propertySpecs: '',
      propertyImage: '',
      date: getTodayYMD(),
      startTime: '10:00',
      endTime: '11:00',
      advisorName: defaultAdvisorName,
      location: '',
      notes: '',
      status: 'active',
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});

  const currentKey = `${initialData?.id || 'new'}-${isOpen ? 'open' : 'closed'}`;
  const [prevKey, setPrevKey] = useState(currentKey);

  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    setFormData(getInitialFormData());
    setErrors({});
  }

  // Müşteri seçildiğinde bilgileri otomatik doldur
  const handleClientSelect = (clientId) => {
    const found = availableCustomers.find((c) => String(c.id) === String(clientId));
    if (found) {
      setFormData((prev) => ({
        ...prev,
        clientId: found.id,
        clientName: found.name,
        clientPhone: found.phone || '+90 532 000 00 00',
        clientRole: found.role || 'Alıcı Adayı',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        clientId: '',
        clientName: '',
        clientPhone: '',
      }));
    }
  };

  // Portföy seçildiğinde bilgileri otomatik doldur
  const handlePropertySelect = (propId) => {
    const found = availableProperties.find(
      (p) => String(p.id) === String(propId) || p.code === propId
    );
    if (found) {
      setFormData((prev) => ({
        ...prev,
        propertyId: found.code || found.id,
        propertyTitle: found.title,
        propertyPrice: found.price ? `₺${found.price.toLocaleString('tr-TR')}` : '',
        propertySpecs: `${found.roomCount || '3+1'} • ${found.area || 180} m²`,
        propertyImage: found.image || '',
        location: found.location?.address || `${found.location?.district || ''}, ${found.location?.city || 'İstanbul'}`,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        propertyId: '',
        propertyTitle: '',
        propertyPrice: '',
        propertySpecs: '',
        propertyImage: '',
      }));
    }
  };

  // Form doğrulama
  const validate = () => {
    const newErrors = {};
    if (!isNonEmpty(formData.title, 3)) {
      newErrors.title = 'Randevu başlığı en az 3 karakter olmalıdır.';
    }
    if (!formData.date) {
      newErrors.date = 'Tarih seçilmelidir.';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Başlangıç saati zorunludur.';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'Bitiş saati zorunludur.';
    }

    // Zaman mantığı kontrolü: startTime < endTime
    if (formData.startTime && formData.endTime) {
      if (!isValidTimeRange(formData.startTime, formData.endTime)) {
        newErrors.endTime = 'Bitiş saati başlangıç saatinden sonra olmalıdır.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Lütfen randevu başlığı, müşteri ve saat bilgilerini kontrol edin.');
      return;
    }

    onSave({
      ...initialData,
      ...formData,
      advisorName: formData.advisorName || defaultAdvisorName || 'Atanmadı',
      id: initialData?.id || generateApptId(),
    });
  };

  const modalFooter = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg font-medium transition-colors cursor-pointer"
      >
        Vazgeç
      </button>
      <button
        type="submit"
        form="appointment-modal-form"
        className="px-5 py-2 text-sm bg-primary hover:bg-primary-container text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
      >
        <span className="material-symbols-outlined text-[18px]">save</span>
        <span>{initialData ? 'Güncelle' : 'Randevuyu Kaydet'}</span>
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      icon="calendar_add_on"
      title={initialData ? 'Randevuyu Düzenle' : 'Yeni Randevu Oluştur'}
      subtitle="Müşteri ziyareti, yer gösterimi veya resmi sözleşme randevusu tanımlayın."
      footer={modalFooter}
    >
      <form id="appointment-modal-form" onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* Randevu Başlığı */}
        <FormField
          id="appt-form-title"
          label="Randevu Başlığı"
          required
          error={errors.title}
        >
          <input
            id="appt-form-title"
            type="text"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
            }}
            placeholder="Örn: Caddebostan 4+1 Daire Yer Gösterimi"
            className={`w-full h-10 px-3 text-sm rounded-lg border bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.title ? 'border-rose-500' : 'border-surface-container'
            }`}
          />
        </FormField>

        {/* Aktivite Türü & Durum */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            id="appt-form-type"
            label="Aktivite Türü"
          >
            <select
              id="appt-form-type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full h-10 px-3 text-sm rounded-lg border border-surface-container bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {Object.keys(APPOINTMENT_TYPES).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            id="appt-form-status"
            label="Randevu Durumu"
          >
            <select
              id="appt-form-status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full h-10 px-3 text-sm rounded-lg border border-surface-container bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="active">Aktif &amp; Bekleyen</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal Edildi</option>
            </select>
          </FormField>
        </div>

        {/* Tarih ve Saatler */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField
            id="appt-form-date"
            label="Tarih"
            required
            error={errors.date}
          >
            <input
              id="appt-form-date"
              type="date"
              value={formData.date}
              onChange={(e) => {
                setFormData({ ...formData, date: e.target.value });
                if (errors.date) setErrors((prev) => ({ ...prev, date: null }));
              }}
              className="w-full h-10 px-3 text-sm rounded-lg border border-surface-container bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </FormField>

          <FormField
            id="appt-form-start-time"
            label="Başlangıç Saati"
            required
            error={errors.startTime}
          >
            <input
              id="appt-form-start-time"
              type="time"
              value={formData.startTime}
              onChange={(e) => {
                setFormData({ ...formData, startTime: e.target.value });
                if (errors.startTime) setErrors((prev) => ({ ...prev, startTime: null }));
              }}
              className="w-full h-10 px-3 text-sm rounded-lg border border-surface-container bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </FormField>

          <FormField
            id="appt-form-end-time"
            label="Bitiş Saati"
            required
            error={errors.endTime}
          >
            <input
              id="appt-form-end-time"
              type="time"
              value={formData.endTime}
              onChange={(e) => {
                setFormData({ ...formData, endTime: e.target.value });
                if (errors.endTime) setErrors((prev) => ({ ...prev, endTime: null }));
              }}
              className={`w-full h-10 px-3 text-sm rounded-lg border bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.endTime ? 'border-rose-500' : 'border-surface-container'
              }`}
            />
          </FormField>
        </div>

        {/* Müşteri ve Portföy Bağlantısı */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface-container-low/50 p-3 rounded-xl border border-surface-container">
          {/* Müşteri Seçimi */}
          <FormField
            id="appt-client-select"
            label="İlişkili Müşteri"
            hint={formData.clientName ? `Seçilen: ${formData.clientName} • ${formData.clientPhone}` : undefined}
          >
            <select
              id="appt-client-select"
              value={formData.clientId}
              onChange={(e) => handleClientSelect(e.target.value)}
              className="w-full h-10 px-3 text-sm rounded-lg border border-surface-container bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="">-- Müşteri Seçin --</option>
              {availableCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone || 'Tel Yok'})
                </option>
              ))}
            </select>
          </FormField>

          {/* Portföy Seçimi */}
          <FormField
            id="appt-property-select"
            label="İlişkili Portföy"
            hint={formData.propertyTitle ? `Seçilen: ${formData.propertyTitle} (${formData.propertySpecs})` : undefined}
          >
            <select
              id="appt-property-select"
              value={formData.propertyId}
              onChange={(e) => handlePropertySelect(e.target.value)}
              className="w-full h-10 px-3 text-sm rounded-lg border border-surface-container bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="">-- Portföy Seçin --</option>
              {availableProperties.map((p) => (
                <option key={p.id} value={p.code || p.id}>
                  {p.code ? `[${p.code}] ` : ''}{p.title}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Atanan Danışman & Konum */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            id="appt-form-advisor"
            label="Atanan Danışman"
          >
            <select
              id="appt-form-advisor"
              value={formData.advisorName || defaultAdvisorName}
              onChange={(e) => setFormData({ ...formData, advisorName: e.target.value })}
              className="w-full h-10 px-3 text-sm rounded-lg border border-surface-container bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
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
                <option value={defaultAdvisorName || ''}>
                  {defaultAdvisorName ? `${defaultAdvisorName} (Siz)` : 'Atanmadı'}
                </option>
              )}
            </select>
          </FormField>

          <FormField
            id="appt-form-location"
            label="Buluşma / Konum Adresi"
          >
            <input
              id="appt-form-location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Örn: Moda Cad. No:142 D:18 Kadıköy"
              className="w-full h-10 px-3 text-sm rounded-lg border border-surface-container bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </FormField>
        </div>

        {/* Notlar & Hazırlık Talimatları */}
        <FormField
          id="appt-form-notes"
          label="Notlar &amp; Randevu Hazırlıkları"
        >
          <textarea
            id="appt-form-notes"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Site güvenliğine plaka bildirilecek, anahtar kapıcıdan temin edilecek vb."
            className="w-full p-3 text-sm rounded-lg border border-surface-container bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </FormField>
      </form>
    </BaseModal>
  );
}
