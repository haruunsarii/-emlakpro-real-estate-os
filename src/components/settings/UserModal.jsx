import React, { useState } from 'react';
import BaseModal from '../ui/BaseModal';
import FormField from '../ui/FormField';
import { isValidPhone, isValidEmail, isNonEmpty, formatPhoneNumber } from '../../utils/validation';

/**
 * EmlakPro User Management Modal
 * Refactored in Phase 3.2 Step 3 to use BaseModal and FormField.
 * Preserves validation rules, badge generation, and user lifecycle states.
 */
export default function UserModal({
  isOpen = false,
  user = null,
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'Gayrimenkul Danışmanı',
    status: user?.status || 'Aktif',
    avatarUrl: user?.avatarUrl || '',
  }));

  const [errors, setErrors] = useState({});
  const [prevUser, setPrevUser] = useState(user);

  if (user !== prevUser) {
    setPrevUser(user);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || 'Gayrimenkul Danışmanı',
      status: user?.status || 'Aktif',
      avatarUrl: user?.avatarUrl || '',
    });
    setErrors({});
  }

  const validate = () => {
    const errs = {};
    if (!isNonEmpty(formData.name, 2)) {
      errs.name = 'Kullanıcı adı ve soyadı en az 2 karakter olmalıdır.';
    }
    if (!isValidEmail(formData.email)) {
      errs.email = 'Geçerli bir kurumsal e-posta adresi giriniz.';
    }
    if (formData.phone && !isValidPhone(formData.phone)) {
      errs.phone = 'Geçerli bir telefon numarası giriniz (0 (5XX) XXX XX XX).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    let roleBadgeClass = 'bg-surface-container text-on-surface';
    if (formData.role === 'Yönetici') {
      roleBadgeClass = 'bg-primary text-white';
    } else if (formData.role === 'Ofis Müdürü') {
      roleBadgeClass = 'bg-secondary text-white';
    }

    const payload = {
      id: user ? user.id : `usr-${Date.now()}`,
      ...formData,
      lastActive: user ? user.lastActive : 'Yeni Kayıt',
      roleBadgeClass,
      statusBadgeClass:
        formData.status === 'Aktif'
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-surface-variant text-on-surface-variant',
    };

    onSave(payload);
  };

  const modalFooter = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-colors cursor-pointer"
      >
        İptal
      </button>
      <button
        type="submit"
        form="user-modal-form"
        className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white font-label-md text-label-md font-semibold transition-all shadow-sm cursor-pointer"
      >
        {user ? 'Güncelle' : 'Kullanıcıyı Kaydet'}
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      icon={user ? 'manage_accounts' : 'person_add'}
      title={user ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı / Danışman Ekle'}
      subtitle="Ekip üyesi yetki, unvan ve iletişim bilgilerini yönetin."
      footer={modalFooter}
    >
      <form
        id="user-modal-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField
          id="user-form-name"
          label="Kullanıcı Adı Soyadı"
          required
          error={errors.name}
        >
          <input
            id="user-form-name"
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
            }}
            placeholder="Örn: Mehmet Canpolat"
            className={`w-full h-10 px-3 bg-surface border rounded-lg focus:outline-none font-body-sm ${
              errors.name
                ? 'border-error bg-error-container/10 focus:ring-1 focus:ring-error'
                : 'border-surface-container focus:border-secondary'
            }`}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            id="user-form-email"
            label="E-posta Adresi"
            required
            error={errors.email}
          >
            <input
              id="user-form-email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              placeholder="mehmet@emlakpro.com.tr"
              className={`w-full h-10 px-3 bg-surface border rounded-lg focus:outline-none font-body-sm ${
                errors.email
                  ? 'border-error bg-error-container/10 focus:ring-1 focus:ring-error'
                  : 'border-surface-container focus:border-secondary'
              }`}
            />
          </FormField>

          <FormField
            id="user-form-phone"
            label="Telefon"
            error={errors.phone}
          >
            <input
              id="user-form-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                setFormData({ ...formData, phone: formatted });
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
              }}
              placeholder="0 (5XX) XXX XX XX"
              className={`w-full h-10 px-3 bg-surface border rounded-lg focus:outline-none font-body-sm ${
                errors.phone
                  ? 'border-error bg-error-container/10 focus:ring-1 focus:ring-error'
                  : 'border-surface-container focus:border-secondary'
              }`}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            id="user-form-role"
            label="Yetki Rolü"
            required
          >
            <select
              id="user-form-role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:border-secondary font-body-sm cursor-pointer"
            >
              <option value="Yönetici">Yönetici (Admin)</option>
              <option value="Ofis Müdürü">Ofis Müdürü</option>
              <option value="Gayrimenkul Danışmanı">Gayrimenkul Danışmanı</option>
              <option value="Asistan">Saha Asistanı</option>
            </select>
          </FormField>

          <FormField
            id="user-form-status"
            label="Hesap Durumu"
            required
          >
            <select
              id="user-form-status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:border-secondary font-body-sm cursor-pointer"
            >
              <option value="Aktif">Aktif</option>
              <option value="Pasif">Pasif</option>
            </select>
          </FormField>
        </div>

        <FormField
          id="user-form-avatar"
          label="Profil Fotoğrafı URL"
          hint="Opsiyonel: Doğrudan profil resmi web bağlantısı girin."
        >
          <input
            id="user-form-avatar"
            type="url"
            value={formData.avatarUrl}
            onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:border-secondary font-body-sm"
          />
        </FormField>
      </form>
    </BaseModal>
  );
}
