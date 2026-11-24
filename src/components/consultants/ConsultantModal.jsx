import React, { useState } from 'react';
import BaseModal from '../ui/BaseModal';
import FormField from '../ui/FormField';
import { isValidPhone, isValidEmail, isNonEmpty, formatPhoneNumber } from '../../utils/validation';
import { hashPassword } from '../../services/authService';

export default function ConsultantModal({
  isOpen = false,
  user = null,
  existingUsers = [],
  onClose,
  onSave,
}) {
  const isEditing = Boolean(user);

  const [formData, setFormData] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    title: user?.title || 'Gayrimenkul Danışmanı',
    role: user?.role || 'Gayrimenkul Danışmanı',
    status: user?.status || 'Aktif',
    avatarUrl: user?.avatarUrl || '',
    password: '',
    confirmPassword: '',
  }));

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevUser, setPrevUser] = useState(user);

  // Sync state if editing user changes
  if (user !== prevUser) {
    setPrevUser(user);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      title: user?.title || 'Gayrimenkul Danışmanı',
      role: user?.role || 'Gayrimenkul Danışmanı',
      status: user?.status || 'Aktif',
      avatarUrl: user?.avatarUrl || '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
  }

  const validate = () => {
    const errs = {};
    if (!isNonEmpty(formData.name, 2)) {
      errs.name = 'Danışman adı ve soyadı en az 2 karakter olmalıdır.';
    }

    const cleanEmail = (formData.email || '').trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      errs.email = 'Geçerli bir kurumsal e-posta adresi giriniz.';
    } else {
      // Check for duplicate email across other users
      const isDuplicate = existingUsers.some(
        (u) => u.id !== user?.id && (u.email || '').trim().toLowerCase() === cleanEmail
      );
      if (isDuplicate) {
        errs.email = 'Bu e-posta adresi ile kayıtlı başka bir kullanıcı bulunmaktadır.';
      }
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      errs.phone = 'Geçerli bir telefon numarası giriniz (0 (5XX) XXX XX XX).';
    }

    // Password validation for new users
    if (!isEditing) {
      if (!formData.password || formData.password.length < 6) {
        errs.password = 'Başlangıç şifresi en az 6 karakter olmalıdır.';
      }
      if (formData.password !== formData.confirmPassword) {
        errs.confirmPassword = 'Şifreler birbiriyle eşleşmiyor.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let roleBadgeClass = 'bg-secondary-fixed text-on-secondary-fixed';
      if (formData.role === 'Yönetici') {
        roleBadgeClass = 'bg-primary text-white';
      } else if (formData.role === 'Ofis Müdürü') {
        roleBadgeClass = 'bg-secondary text-white';
      } else if (formData.role === 'Asistan') {
        roleBadgeClass = 'bg-surface-variant text-on-surface';
      }

      const statusBadgeClass =
        formData.status === 'Aktif'
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-slate-100 text-slate-700';

      const payload = {
        id: user ? user.id : `usr-${Date.now()}`,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        title: formData.title.trim() || formData.role,
        role: formData.role,
        status: formData.status,
        avatarUrl: formData.avatarUrl.trim(),
        roleBadgeClass,
        statusBadgeClass,
        createdAt: user?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Handle password hashing (NEVER plaintext!)
      if (!isEditing) {
        payload.passwordHash = await hashPassword(formData.password);
      } else if (user?.passwordHash) {
        payload.passwordHash = user.passwordHash;
      }

      await onSave(payload);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
      >
        Vazgeç
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-primary text-white hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
            Kaydediliyor...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-base">save</span>
            {isEditing ? 'Bilgileri Güncelle' : 'Danışmanı Kaydet'}
          </>
        )}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Danışman Bilgilerini Düzenle' : 'Yeni Danışman Ekle'}
      subtitle={
        isEditing
          ? `${user?.name || ''} adlı personelin iletişim ve yetki detayları`
          : 'Sisteme yeni bir danışman veya ofis personeli tanımlayın'
      }
      icon={isEditing ? 'edit_note' : 'person_add'}
      size="md"
      footer={footer}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Ad Soyad */}
        <FormField label="Danışman Adı ve Soyadı" required error={errors.name} id="consultant-name">
          <input
            id="consultant-name"
            type="text"
            required
            placeholder="Örn: Selin Aydın"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          />
        </FormField>

        {/* E-posta */}
        <FormField label="Kurumsal E-posta Adresi" required error={errors.email} id="consultant-email">
          <input
            id="consultant-email"
            type="email"
            required
            placeholder="selin@emlakpro.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          />
        </FormField>

        {/* Telefon & Unvan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Telefon Numarası" error={errors.phone} id="consultant-phone">
            <input
              id="consultant-phone"
              type="tel"
              placeholder="0 (5XX) XXX XX XX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </FormField>

          <FormField label="Unvan / Görev Tanımı" id="consultant-title">
            <input
              id="consultant-title"
              type="text"
              placeholder="Lüks Konut Uzmanı"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </FormField>
        </div>

        {/* Rol ve Durum */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Sistem Rolü" required id="consultant-role">
            <select
              id="consultant-role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 bg-white"
            >
              <option value="Gayrimenkul Danışmanı">Gayrimenkul Danışmanı</option>
              <option value="Ofis Müdürü">Ofis Müdürü</option>
              <option value="Yönetici">Yönetici (Admin)</option>
              <option value="Asistan">Asistan</option>
            </select>
          </FormField>

          <FormField label="Hesap Durumu" id="consultant-status">
            <select
              id="consultant-status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 bg-white"
            >
              <option value="Aktif">Aktif (Giriş Yapabilir)</option>
              <option value="Pasif">Pasif (Giriş Engelli)</option>
            </select>
          </FormField>
        </div>

        {/* Profil Fotoğrafı URL */}
        <FormField label="Profil Fotoğrafı URL (Opsiyonel)" id="consultant-avatar">
          <input
            id="consultant-avatar"
            type="url"
            placeholder="https://..."
            value={formData.avatarUrl}
            onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          />
        </FormField>

        {/* Şifre Alanları (Yalnızca Yeni Danışman Eklemede) */}
        {!isEditing && (
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Başlangıç Giriş Şifresi
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Şifre" required error={errors.password} id="consultant-password">
                <input
                  id="consultant-password"
                  type="password"
                  placeholder="En az 6 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </FormField>
              <FormField label="Şifre Tekrarı" required error={errors.confirmPassword} id="consultant-confirm-password">
                <input
                  id="consultant-confirm-password"
                  type="password"
                  placeholder="Şifreyi tekrar yazınız"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </FormField>
            </div>
            <p className="text-[11px] text-slate-500">
              Şifre istemci tarafında Web Crypto SHA-256 ile özetlenerek kaydedilir; düz metin olarak asla saklanmaz.
            </p>
          </div>
        )}
      </form>
    </BaseModal>
  );
}
