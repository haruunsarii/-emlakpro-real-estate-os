import React, { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { submitPropertyInquiry } from '../../utils/portalHelpers';
import { formatPhoneNumber, isValidPhone, isNonEmpty } from '../../utils/validation';

/**
 * PortalConsultantCard Component
 * Customer-facing advisor contact card on property detail page.
 *
 * Rules:
 * - Uses existing property advisor relation (or office representative fallback).
 * - Excludes all internal role tiers, passwords, hashes, and CRM permissions.
 * - WhatsApp button includes pre-filled message with property reference ID & title.
 * - Phone button uses standard `tel:` protocol.
 * - Live inquiry form integrated with emlakpro_tasks_v1 in Sub-step 7.4.
 */
export default function PortalConsultantCard({ property, advisor }) {
  const [settings] = useLocalStorage('emlakpro_settings_v1', null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
    kvkkConsent: false,
  });
  const [errors, setErrors] = useState({});
  const [submittedResult, setSubmittedResult] = useState(null);

  if (!advisor) return null;

  // Clean phone number for WhatsApp wa.me link (digits only, e.g. 905XXXXXXXXX)
  const rawPhone = advisor.phone || '+90 (212) 555 0123';
  const digitsOnly = rawPhone.replace(/\D/g, '');
  const cleanWaPhone = digitsOnly.startsWith('0')
    ? '90' + digitsOnly.slice(1)
    : digitsOnly.startsWith('90')
      ? digitsOnly
      : '90' + digitsOnly;

  const prefilledWaMessage = encodeURIComponent(
    `Merhaba, #${property?.id || ''} referanslı "${property?.title || 'Gayrimenkul'}" ilanınız hakkında bilgi almak istiyorum.`
  );

  const initials = advisor.name
    ? advisor.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : 'EP';

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!isNonEmpty(formData.name, 2)) {
      errs.name = 'Adınız ve soyadınız en az 2 karakter olmalıdır.';
    }
    if (!isValidPhone(formData.phone)) {
      errs.phone = 'Geçerli bir cep telefonu giriniz (örn: 05XX XXX XX XX).';
    }
    if (!formData.kvkkConsent) {
      errs.kvkkConsent = 'Lütfen açık rıza kutusunu onaylayınız.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const res = submitPropertyInquiry({
      formData,
      property,
      users: settings?.users || [],
    });

    if (res.success) {
      setSubmittedResult({ taskId: res.taskId });
      setFormData({
        name: '',
        phone: '',
        message: '',
        kvkkConsent: false,
      });
      setErrors({});
    } else {
      setErrors({ general: res.error || 'Talep iletilirken hata oluştu.' });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs font-sans space-y-6">
      {/* 1. Header & Consultant Info */}
      <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
        {advisor.avatarUrl ? (
          <img
            src={advisor.avatarUrl}
            alt={advisor.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-xs"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500/20 text-amber-700 flex items-center justify-center font-extrabold text-xl shadow-xs">
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider mb-1">
            Yetkili Danışman
          </span>
          <h3 className="text-base font-bold text-slate-900 truncate">
            {advisor.name}
          </h3>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {advisor.title || 'Gayrimenkul Danışmanı'}
          </p>
        </div>
      </div>

      {/* 2. Direct Action Buttons */}
      <div className="space-y-3">
        {/* Direct WhatsApp Message Button */}
        <a
          href={`https://wa.me/${cleanWaPhone}?text=${prefilledWaMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">chat</span>
          <span>WhatsApp ile Bilgi Al</span>
        </a>

        {/* Direct Phone Call Button */}
        <a
          href={`tel:${rawPhone}`}
          className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">call</span>
          <span>Hemen Ara: {rawPhone}</span>
        </a>
      </div>

      {/* 3. Quick Inquiry Form (Live in Phase 7.4) */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          Danışmana Mesaj İletin
        </h4>

        {submittedResult ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center" data-testid="inquiry-success-state">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-xl">check</span>
            </div>
            <p className="text-xs font-bold text-slate-900">
              Talebiniz Danışmanımıza İletildi!
            </p>
            <p className="text-[11px] text-slate-600 mt-1">
              Referans: <span className="font-semibold text-primary">{submittedResult.taskId}</span>
            </p>
            <div className="mt-2.5 p-2 bg-white/80 rounded-lg text-[10px] text-slate-500">
              (Prototip Modu: #{property?.id || ''} ilan bilgi talebiniz CRM Görevler havuzuna kaydedilmiştir.)
            </div>
            <button
              type="button"
              onClick={() => setSubmittedResult(null)}
              className="mt-3 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Yeni Mesaj Yaz
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            {errors.general && (
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errors.general}
              </div>
            )}

            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                placeholder="Adınız Soyadınız *"
                className={`w-full h-10 px-3 rounded-xl border text-xs transition-colors focus:outline-none focus:ring-2 ${
                  errors.name
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-200'
                    : 'border-slate-200 bg-white focus:border-primary focus:ring-primary/20'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.name}</p>
              )}
            </div>

            <div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="Telefon Numaranız (05XX XXX XX XX) *"
                maxLength={19}
                className={`w-full h-10 px-3 rounded-xl border text-xs transition-colors focus:outline-none focus:ring-2 ${
                  errors.phone
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-200'
                    : 'border-slate-200 bg-white focus:border-primary focus:ring-primary/20'
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.phone}</p>
              )}
            </div>

            <div>
              <textarea
                rows={3}
                name="message"
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                placeholder={`Merhaba, #${property?.id || ''} referanslı ilan hakkında detaylı bilgi ve randevu rica ediyorum.`}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            {/* KVKK Consent */}
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="kvkkConsent"
                  checked={formData.kvkkConsent}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, kvkkConsent: e.target.checked }));
                    if (errors.kvkkConsent) setErrors((prev) => ({ ...prev, kvkkConsent: null }));
                  }}
                  className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-primary focus:ring-primary/30 accent-primary cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 leading-tight select-none">
                  İletişim verilerimin bu portföy hakkında tarafıma bilgi verilmesi amacıyla işlenmesini onaylıyorum. *
                </span>
              </label>
              {errors.kvkkConsent && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.kvkkConsent}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>Mesajı Gönder</span>
            </button>
          </form>
        )}

        <p className="text-[11px] text-slate-400 mt-2.5 text-center leading-snug">
          * Doğrudan ve anlık iletişim için yukarıdaki WhatsApp ve telefon hatlarını kullanabilirsiniz.
        </p>
      </div>
    </div>
  );
}
