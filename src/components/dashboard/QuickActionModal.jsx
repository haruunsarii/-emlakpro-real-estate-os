import React, { useState } from 'react';
import BaseModal from '../ui/BaseModal';
import FormField from '../ui/FormField';
import { useToast } from '../../hooks/useToast';
import {
  formatPhoneNumber,
  isValidPhone,
  isNonEmpty,
  isPositiveNumber,
} from '../../utils/validation';

/**
 * EmlakPro QuickActionModal Component
 * Refactored in Phase 3.2 (Final Step) to standardize under BaseModal & FormField primitives.
 * Supports 4 unified modes:
 * - 'musteri': Fast customer lead creation
 * - 'randevu': Fast appointment scheduling
 * - 'portfoy': Fast portfolio property draft creation
 * - 'detail': Property quick preview card
 */
export default function QuickActionModal({ type, data, onClose, onSubmitSuccess }) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    name: '',
    phone: '',
    budget: '',
    propertyType: 'Satılık',
    date: '',
    time: '',
    notes: '',
    image: '',
  });

  const [errors, setErrors] = useState({});
  const [prevType, setPrevType] = useState(type);

  // Synchronize and reset form state when modal type changes
  if (type !== prevType) {
    setPrevType(type);
    setFormData({
      title: '',
      name: '',
      phone: '',
      budget: '',
      propertyType: 'Satılık',
      date: '',
      time: '',
      notes: '',
      image: '',
    });
    setErrors({});
  }

  if (!type) return null;

  const validate = () => {
    const errs = {};
    if (type === 'musteri') {
      if (!isNonEmpty(formData.name, 2)) {
        errs.name = 'Müşteri adı en az 2 karakter olmalıdır.';
      }
      if (!isValidPhone(formData.phone)) {
        errs.phone = 'Geçerli bir Türkiye cep telefonu giriniz (örn: 0 (5XX) XXX XX XX).';
      }
    } else if (type === 'randevu') {
      if (!isNonEmpty(formData.title, 3)) {
        errs.title = 'Randevu konusu en az 3 karakter olmalıdır.';
      }
      if (!formData.date) {
        errs.date = 'Randevu tarihi seçilmelidir.';
      }
      if (!formData.time) {
        errs.time = 'Randevu saati seçilmelidir.';
      }
    } else if (type === 'portfoy') {
      if (!isNonEmpty(formData.title, 3)) {
        errs.title = 'İlan başlığı en az 3 karakter olmalıdır.';
      }
      const rawPrice = String(formData.budget).replace(/[^\d]/g, '');
      if (!isPositiveNumber(rawPrice, 1000)) {
        errs.budget = 'Geçerli bir portföy fiyatı giriniz (en az ₺1.000).';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Lütfen formdaki eksik veya hatalı alanları düzeltin.');
      return;
    }

    if (onSubmitSuccess) {
      onSubmitSuccess(type, formData);
    }
    onClose();
  };

  const titles = {
    musteri: 'Yeni Müşteri Ekle',
    randevu: 'Yeni Randevu Oluştur',
    portfoy: 'Yeni Portföy Kaydı Ekle',
    detail: data ? data.title : 'Gayrimenkul Detayı',
  };

  const icons = {
    musteri: 'person_add',
    randevu: 'calendar_add_on',
    portfoy: 'add_home_work',
    detail: 'apartment',
  };

  const subtitles = {
    musteri: 'Hızlı müşteri adayı ve iletişim kaydı oluşturun.',
    randevu: 'Müşteri randevusu veya yer gösterimi planlayın.',
    portfoy: 'Hızlı gayrimenkul portföy taslağı oluşturun.',
    detail: data ? `${data.category || 'Gayrimenkul'} • ${data.status || 'Aktif'}` : undefined,
  };

  const modalFooter =
    type === 'detail' ? null : (
      <>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface-variant hover:bg-surface-container font-label-md transition-colors cursor-pointer"
        >
          İptal
        </button>
        <button
          type="submit"
          form="quick-action-form"
          className="px-5 py-2 rounded-lg bg-primary text-white font-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm cursor-pointer"
        >
          Kaydet
        </button>
      </>
    );

  const advisorName =
    typeof data?.advisor === 'object' && data.advisor !== null
      ? data.advisor.name
      : typeof data?.advisor === 'string'
        ? data.advisor
        : 'Burak Yılmaz';

  const advisorInitials = advisorName
    ? advisorName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'BY';

  const priceFormatted =
    data?.priceFormatted ||
    (data?.price ? `₺${Number(data.price).toLocaleString('tr-TR')}` : '');

  return (
    <BaseModal
      isOpen={Boolean(type)}
      onClose={onClose}
      size="md"
      icon={icons[type]}
      title={titles[type]}
      subtitle={subtitles[type]}
      footer={modalFooter}
    >
      {type === 'detail' && data ? (
        <div className="flex flex-col gap-4">
          <div className="h-52 sm:h-56 w-full rounded-xl overflow-hidden relative border border-surface-container bg-surface-container">
            <img
              src={
                data.image ||
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
              }
              alt={data.title || 'Gayrimenkul'}
              width="480"
              height="224"
              decoding="async"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';
              }}
            />
            {data.type && (
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full font-caption font-bold bg-primary-container text-white shadow-xs">
                {data.type}
              </span>
            )}
            {priceFormatted && (
              <span className="absolute bottom-3 right-3 px-3 py-1 rounded-lg font-headline-sm font-bold bg-surface-container-lowest text-primary shadow-md">
                {priceFormatted}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-caption text-secondary font-semibold uppercase tracking-wider">
              {data.category || 'Konut'} • {data.status || 'Aktif'}
            </span>
            <h4 className="font-headline-sm text-lg font-bold text-on-surface">
              {data.title}
            </h4>
            {data.location && (
              <p className="font-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                {data.location}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 p-3 bg-surface rounded-xl border border-surface-container text-center">
            <div>
              <span className="font-caption text-on-surface-variant block">Alan</span>
              <span className="font-label-md font-bold text-on-surface">
                {data.area || (data.netArea ? `${data.netArea} m²` : '-')}
              </span>
            </div>
            <div>
              <span className="font-caption text-on-surface-variant block">Özellik</span>
              <span className="font-label-md font-bold text-on-surface">
                {data.rooms || '-'}
              </span>
            </div>
            <div>
              <span className="font-caption text-on-surface-variant block">Tapu Durumu</span>
              <span className="font-label-md font-bold text-secondary">
                {data.deedStatus || data.status || '-'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-surface-container">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary-container text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {advisorInitials}
              </div>
              <div>
                <span className="font-caption text-on-surface-variant block text-[11px]">Sorumlu Danışman</span>
                <span className="font-label-md font-semibold text-on-surface text-body-sm">
                  {advisorName}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="px-4 py-1.5 rounded-lg bg-secondary text-white font-label-sm font-semibold hover:bg-secondary-container transition-colors cursor-pointer"
              onClick={() =>
                toast.info(`Danışman ${advisorName} ile iletişim başlatılıyor...`)
              }
            >
              İletişime Geç
            </button>
          </div>
        </div>
      ) : (
        <form
          id="quick-action-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          {type === 'musteri' && (
            <>
              <FormField
                id="quick-customer-name"
                label="Müşteri Adı Soyadı"
                required
                error={errors.name}
              >
                <input
                  id="quick-customer-name"
                  type="text"
                  placeholder="Örn: Selin Karaca"
                  className={`w-full h-10 px-3 bg-surface border rounded-lg focus:outline-none focus:ring-2 font-body-sm transition-colors ${
                    errors.name
                      ? 'border-error focus:ring-error/20 bg-error-container/10'
                      : 'border-surface-container focus:ring-secondary/20'
                  }`}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }));
                    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                  }}
                />
              </FormField>

              <FormField
                id="quick-customer-phone"
                label="Telefon Numarası"
                required
                error={errors.phone}
              >
                <input
                  id="quick-customer-phone"
                  type="tel"
                  placeholder="0 (5XX) XXX XX XX"
                  className={`w-full h-10 px-3 bg-surface border rounded-lg focus:outline-none focus:ring-2 font-body-sm transition-colors ${
                    errors.phone
                      ? 'border-error focus:ring-error/20 bg-error-container/10'
                      : 'border-surface-container focus:ring-secondary/20'
                  }`}
                  value={formData.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setFormData((prev) => ({ ...prev, phone: formatted }));
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                  }}
                />
              </FormField>

              <FormField
                id="quick-customer-budget"
                label="Talep / Bütçe"
                hint="Müşterinin aradığı bölge veya tahmini bütçe aralığı."
              >
                <input
                  id="quick-customer-budget"
                  type="text"
                  placeholder="Örn: Kadıköy 3+1 (Bütçe: 20-25M ₺)"
                  className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm transition-colors"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, budget: e.target.value }))
                  }
                />
              </FormField>
            </>
          )}

          {type === 'randevu' && (
            <>
              <FormField
                id="quick-appointment-title"
                label="Randevu Konusu"
                required
                error={errors.title}
              >
                <input
                  id="quick-appointment-title"
                  type="text"
                  placeholder="Örn: Yer Gösterimi - Suadiye Daire"
                  className={`w-full h-10 px-3 bg-surface border rounded-lg focus:outline-none focus:ring-2 font-body-sm transition-colors ${
                    errors.title
                      ? 'border-error focus:ring-error/20 bg-error-container/10'
                      : 'border-surface-container focus:ring-secondary/20'
                  }`}
                  value={formData.title}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, title: e.target.value }));
                    if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
                  }}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  id="quick-appointment-date"
                  label="Tarih"
                  required
                  error={errors.date}
                >
                  <input
                    id="quick-appointment-date"
                    type="date"
                    className={`w-full h-10 px-3 bg-surface border rounded-lg focus:outline-none focus:ring-2 font-body-sm transition-colors ${
                      errors.date
                        ? 'border-error focus:ring-error/20 bg-error-container/10'
                        : 'border-surface-container focus:ring-secondary/20'
                    }`}
                    value={formData.date}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, date: e.target.value }));
                      if (errors.date) setErrors((prev) => ({ ...prev, date: null }));
                    }}
                  />
                </FormField>

                <FormField
                  id="quick-appointment-time"
                  label="Saat"
                  required
                  error={errors.time}
                >
                  <input
                    id="quick-appointment-time"
                    type="time"
                    className={`w-full h-10 px-3 bg-surface border rounded-lg focus:outline-none focus:ring-2 font-body-sm transition-colors ${
                      errors.time
                        ? 'border-error focus:ring-error/20 bg-error-container/10'
                        : 'border-surface-container focus:ring-secondary/20'
                    }`}
                    value={formData.time}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, time: e.target.value }));
                      if (errors.time) setErrors((prev) => ({ ...prev, time: null }));
                    }}
                  />
                </FormField>
              </div>
            </>
          )}

          {type === 'portfoy' && (
            <>
              <FormField
                id="quick-property-title"
                label="İlan Başlığı"
                required
                error={errors.title}
              >
                <input
                  id="quick-property-title"
                  type="text"
                  placeholder="Örn: Caddebostan Sahil Sıfır 4+1 Dubleks"
                  className={`w-full h-10 px-3 bg-surface border rounded-lg focus:outline-none focus:ring-2 font-body-sm transition-colors ${
                    errors.title
                      ? 'border-error focus:ring-error/20 bg-error-container/10'
                      : 'border-surface-container focus:ring-secondary/20'
                  }`}
                  value={formData.title}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, title: e.target.value }));
                    if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
                  }}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  id="quick-property-type"
                  label="İşlem Tipi"
                >
                  <select
                    id="quick-property-type"
                    className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm transition-colors"
                    value={formData.propertyType}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, propertyType: e.target.value }))
                    }
                  >
                    <option value="Satılık">Satılık</option>
                    <option value="Kiralık">Kiralık</option>
                  </select>
                </FormField>

                <FormField
                  id="quick-property-price"
                  label="Fiyat (₺)"
                  required
                  error={errors.budget}
                >
                  <input
                    id="quick-property-price"
                    type="text"
                    placeholder="Örn: 35.000.000"
                    className={`w-full h-10 px-3 bg-surface border rounded-lg focus:outline-none focus:ring-2 font-body-sm transition-colors ${
                      errors.budget
                        ? 'border-error focus:ring-error/20 bg-error-container/10'
                        : 'border-surface-container focus:ring-secondary/20'
                    }`}
                    value={formData.budget}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, budget: e.target.value }));
                      if (errors.budget) setErrors((prev) => ({ ...prev, budget: null }));
                    }}
                  />
                </FormField>
              </div>

              <FormField
                id="quick-property-image"
                label="İlan Fotoğrafı (İsteğe Bağlı URL)"
                hint="Boş bırakılırsa sistem otomatik örnek bir gayrimenkul fotoğrafı atar."
              >
                <input
                  id="quick-property-image"
                  type="url"
                  placeholder="https://... fotoğraf URL adresi"
                  className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 font-body-sm transition-colors text-xs"
                  value={formData.image || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, image: e.target.value }))
                  }
                />
              </FormField>
            </>
          )}
        </form>
      )}
    </BaseModal>
  );
}
