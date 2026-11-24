import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { initialOfficeProfile } from '../../services/settingsData';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { submitPortalContactMessage } from '../../utils/portalHelpers';
import { formatPhoneNumber, isValidPhone, isValidEmail, isNonEmpty } from '../../utils/validation';

const INITIAL_CONTACT_FORM = {
  name: '',
  phone: '',
  email: '',
  subject: 'Genel Danışmanlık',
  message: '',
  kvkkConsent: false,
};

/**
 * ContactPage Component
 * Public customer portal contact page (/iletisim).
 * Fully integrated in Sub-step 7.4 with emlakpro_tasks_v1 and KVKK compliance.
 */
export default function ContactPage() {
  const [settings] = useLocalStorage('emlakpro_settings_v1', null);
  const [customers] = useLocalStorage('emlakpro_customers_v1', []);

  const office = settings?.office || initialOfficeProfile || {
    companyName: 'EmlakPro Gayrimenkul Yatırım Danışmanlığı',
    branch: 'Levent Genel Merkez',
    address: 'Büyükdere Caddesi No:193 Levent, Beşiktaş / İstanbul',
    phone: '+90 (212) 555 0123',
    email: 'info@emlakpro.com',
  };

  const [formData, setFormData] = useState(INITIAL_CONTACT_FORM);
  const [errors, setErrors] = useState({});
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isKvkkModalOpen, setIsKvkkModalOpen] = useState(false);

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
      errs.phone = 'Lütfen geçerli bir Türkiye cep telefonu giriniz (örn: 05XX XXX XX XX).';
    }
    if (formData.email && !isValidEmail(formData.email)) {
      errs.email = 'Lütfen geçerli bir e-posta formatı giriniz.';
    }
    if (!isNonEmpty(formData.message, 5)) {
      errs.message = 'Mesajınız en az 5 karakter olmalıdır.';
    }
    if (!formData.kvkkConsent) {
      errs.kvkkConsent = 'Mesajınızın iletilebilmesi için KVKK aydınlatma metnini onaylamanız gerekmektedir.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const res = submitPortalContactMessage({
      formData,
      users: settings?.users || [],
      customers,
    });

    if (res.success) {
      setSubmissionResult({
        taskId: res.taskId,
        customerId: res.customerId,
        isExistingCustomer: res.isExistingCustomer,
      });
      setFormData(INITIAL_CONTACT_FORM);
      setErrors({});
    } else {
      setErrors({ general: res.error || 'Mesaj kaydedilirken bir hata oluştu.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-3" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-amber-400 transition-colors">
              Ana Sayfa
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-slate-200 font-medium">İletişim & Ofisimiz</span>
          </nav>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-3">
              <span className="material-symbols-outlined text-[14px]">contact_phone</span>
              Bize Ulaşın
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              İletişim ve Ofis Bilgilerimiz
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">
              Gayrimenkul yatırımı, ekspertiz, satış veya kiralama süreçleriniz için uzman ekibimizle dilediğiniz zaman irtibata geçebilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Office Cards */}
          <div className="space-y-4">
            {/* Phone Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <span className="material-symbols-outlined text-[24px]">call</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Telefon Hattı</h3>
                <a
                  href={`tel:${(office.phone || '').replace(/[^0-9+]/g, '')}`}
                  className="text-base font-semibold text-slate-900 mt-0.5 block hover:text-primary transition-colors"
                >
                  {office.phone}
                </a>
                <p className="text-xs text-slate-500 mt-1">Hafta içi 09:00 - 19:00</p>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <span className="material-symbols-outlined text-[24px]">mail</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">E-Posta</h3>
                <a
                  href={`mailto:${office.email}`}
                  className="text-base font-semibold text-slate-900 mt-0.5 block hover:text-primary transition-colors"
                >
                  {office.email}
                </a>
                <p className="text-xs text-slate-500 mt-1">Sorularınız için bize yazabilirsiniz</p>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <span className="material-symbols-outlined text-[24px]">location_on</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ofis Adresi</h3>
                <p className="text-sm font-semibold text-slate-900 mt-0.5 leading-snug">{office.address}</p>
                <p className="text-xs text-slate-500 mt-1">{office.branch}</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            {submissionResult ? (
              /* Success State */
              <div className="text-center py-10 px-4" data-testid="contact-success-state">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                  <span className="material-symbols-outlined text-3xl">mark_email_read</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Mesajınız Bize Ulaştı!</h2>
                <div className="mt-2.5 flex items-center justify-center gap-2 flex-wrap">
                  <div className="inline-block bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl text-slate-700 text-xs font-semibold">
                    Kayıt Referansı: <span className="text-primary font-bold">{submissionResult.taskId}</span>
                  </div>
                  {submissionResult.customerId && (
                    <div className="inline-block bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-emerald-800 text-xs font-semibold">
                      Müşteri Kaydı: <span className="font-bold">{submissionResult.customerId}</span>
                      {submissionResult.isExistingCustomer && ' (Mevcut Müşteri)'}
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-3 max-w-md mx-auto">
                  Mesajınız CRM sistemimize görev olarak iletilmiştir. Danışmanlarımız müsait olduğunda verdiğiniz iletişim bilgilerinden sizinle irtibata geçecektir.
                </p>
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] text-slate-500 max-w-md mx-auto">
                  <span className="font-semibold text-slate-700">CRM Entegrasyonu:</span> İletişim kaydı görev havuzuna (<code>emlakpro_tasks_v1</code>) ve müşteri profili (<code>emlakpro_customers_v1</code>) koleksiyonuna başarıyla işlenmiştir.
                </div>
                <button
                  type="button"
                  onClick={() => setSubmissionResult(null)}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Yeni Bir Mesaj Gönder
                </button>
              </div>
            ) : (
              /* Active Form */
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Bize Mesaj Gönderin</h2>
                    <p className="text-xs text-slate-500">Sorularınızı ve danışmanlık taleplerinizi iletin, ekibimiz en kısa sürede incelesin.</p>
                  </div>
                </div>

                {errors.general && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {errors.general}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Adınız Soyadınız <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, name: e.target.value }));
                          if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                        }}
                        placeholder="Örn: Ahmet Yılmaz"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
                          errors.name
                            ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-200'
                            : 'border-slate-200 bg-white focus:border-primary focus:ring-primary/20'
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-rose-600 font-medium">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Telefon Numaranız <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        placeholder="0 (5XX) XXX XX XX"
                        maxLength={19}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
                          errors.phone
                            ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-200'
                            : 'border-slate-200 bg-white focus:border-primary focus:ring-primary/20'
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-rose-600 font-medium">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        E-Posta Adresiniz <span className="text-slate-400 font-normal">(İsteğe Bağlı)</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, email: e.target.value }));
                          if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                        }}
                        placeholder="ahmet@example.com"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
                          errors.email
                            ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-200'
                            : 'border-slate-200 bg-white focus:border-primary focus:ring-primary/20'
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Konu Başlığı</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="Genel Danışmanlık">Genel Danışmanlık</option>
                        <option value="Portföy Ekspertizi">Portföy Ekspertizi</option>
                        <option value="Satış / Kiralama Süreci">Satış / Kiralama Süreci</option>
                        <option value="Yatırım Danışmanlığı">Yatırım Danışmanlığı</option>
                        <option value="Diğer">Diğer</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mesajınız <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      name="message"
                      value={formData.message}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, message: e.target.value }));
                        if (errors.message) setErrors((prev) => ({ ...prev, message: null }));
                      }}
                      placeholder="İlgilendiğiniz gayrimenkul veya yatırım planınız hakkında bilgi verebilirsiniz..."
                      className={`w-full p-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 resize-none ${
                        errors.message
                          ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-200'
                          : 'border-slate-200 bg-white focus:border-primary focus:ring-primary/20'
                      }`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.message}</p>
                    )}
                  </div>

                  {/* KVKK Consent */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        name="kvkkConsent"
                        checked={formData.kvkkConsent}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, kvkkConsent: e.target.checked }));
                          if (errors.kvkkConsent) setErrors((prev) => ({ ...prev, kvkkConsent: null }));
                        }}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30 accent-primary cursor-pointer"
                      />
                      <span className="text-xs text-slate-600 leading-relaxed select-none">
                        İletişim bilgilerimin mesajımın yanıtlanması ve gayrimenkul danışmanlık hizmeti sunulması amacıyla işlenmesini{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsKvkkModalOpen(true);
                          }}
                          className="text-primary hover:underline font-semibold"
                        >
                          Aydınlatma Metni
                        </button>{' '}
                        doğrultusunda kabul ediyorum. <span className="text-rose-500">*</span>
                      </span>
                    </label>
                    {errors.kvkkConsent && (
                      <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.kvkkConsent}</p>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-xs text-slate-400">
                      * Zorunlu alanlar
                    </span>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Mesajı İlet</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KVKK Information Modal */}
      {isKvkkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">KVKK Aydınlatma Metni</h3>
              <button
                type="button"
                onClick={() => setIsKvkkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="py-4 text-xs text-slate-600 leading-relaxed space-y-2 max-h-60 overflow-y-auto">
              <p>
                EmlakPro Gayrimenkul Danışmanlığı olarak iletişim verilerinizin gizliliğini korumayı taahhüt ediyoruz.
              </p>
              <p>
                <strong>İşlenen Veriler:</strong> Ad Soyad, Telefon Numarası, varsa E-posta Adresi ve ilettiğiniz mesaj içeriği.
              </p>
              <p>
                <strong>İşleme Amacı:</strong> Mesajınızın yanıtlanması, müşteri destek süreçlerinin yürütülmesi ve bilgilendirme sağlanması amacıyla işlenmektedir.
              </p>
              <p>
                <strong>Güvenlik:</strong> Verileriniz üçüncü şahıslara aktarılmaz; yalnızca yerel CRM görev havuzunda güvenle saklanır.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsKvkkModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
