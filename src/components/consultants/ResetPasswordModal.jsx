import React, { useState } from 'react';
import BaseModal from '../ui/BaseModal';
import FormField from '../ui/FormField';
import { hashPassword } from '../../services/authService';

/**
 * ResetPasswordModal Component
 * Allows an administrator to set a new password for a consultant/user.
 * Client-side SHA-256 hashed immediately; plain text password is NEVER stored.
 */
export default function ResetPasswordModal({
  isOpen = false,
  user = null,
  onClose,
  onResetPassword,
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const validate = () => {
    const errs = {};
    if (!newPassword || newPassword.length < 6) {
      errs.newPassword = 'Yeni şifre en az 6 karakterden oluşmalıdır.';
    }
    if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Şifreler birbiriyle uyuşmuyor.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validate()) return;
    if (!user) return;

    setIsSubmitting(true);
    try {
      const hashed = await hashPassword(newPassword);
      await onResetPassword(user.id, hashed);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <button
        type="button"
        onClick={handleClose}
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
            <span className="material-symbols-outlined text-base">lock_reset</span>
            Şifreyi Güncelle
          </>
        )}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Danışman Şifresini Sıfırla"
      subtitle={`${user?.name || 'Kullanıcı'} (${user?.email || ''}) için yeni erişim parolası belirleyin.`}
      icon="lock_reset"
      size="sm"
      footer={footer}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Security / Prototype Notice */}
        <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
          <span className="material-symbols-outlined text-amber-600 text-base shrink-0 mt-0.5">
            security
          </span>
          <div>
            <p className="font-semibold text-amber-950">Güvenli Şifreleme Standardı</p>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              Yeni şifre Web Crypto API (SHA-256) ile istemci tarafında anında özetlenecek ve
              localStorage üzerinde asla düz metin olarak kaydedilmeyecektir.
            </p>
          </div>
        </div>

        {/* Yeni Şifre */}
        <FormField
          label="Yeni Geçici / Kalıcı Şifre"
          required
          error={errors.newPassword}
          id="reset-new-password"
        >
          <div className="relative">
            <input
              id="reset-new-password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="En az 6 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 pr-10 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              aria-label={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
            >
              <span className="material-symbols-outlined text-lg">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </FormField>

        {/* Yeni Şifre Tekrarı */}
        <FormField
          label="Yeni Şifre (Tekrar)"
          required
          error={errors.confirmPassword}
          id="reset-confirm-password"
        >
          <input
            id="reset-confirm-password"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Şifreyi tekrar yazınız"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          />
        </FormField>
      </form>
    </BaseModal>
  );
}

