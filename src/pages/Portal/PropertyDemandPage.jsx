import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { submitPortalDemand } from '../../utils/portalHelpers';
import { formatPhoneNumber, isValidPhone, isValidEmail, isNonEmpty } from '../../utils/validation';

const INITIAL_FORM = {
  name: '',
  phone: '',
  email: '',
  transactionType: 'Satılık',
  propertyType: 'Daire / Rezidans',
  district: '',
  minBudget: '',
  maxBudget: '',
  minRooms: '2+1',
  maxRooms: '4+1',
  notes: '',
  kvkkConsent: false,
};

/**
 * PropertyDemandPage Component
 * Public customer portal demand submission page (/talep-birak).
 * Fully integrated in Sub-step 7.4 with emlakpro_requests_v1, duplicate customer
 * detection in emlakpro_customers_v1, instant matching score, and KVKK compliance.
 */
export default function PropertyDemandPage() {
  const [properties] = useLocalStorage('emlakpro_properties_v1', []);
  const [customers] = useLocalStorage('emlakpro_customers_v1', []);
  const [settings] = useLocalStorage('emlakpro_settings_v1', null);

  const [formData, setFormData] = useState(INITIAL_FORM);
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
      errs.email = 'Lütfen geçerli bir e-posta adresi formatı giriniz.';
    }
    if (formData.minBudget && formData.maxBudget) {
      const min = Number(String(formData.minBudget).replace(/[^\d]/g, ''));
      const max = Number(String(formData.maxBudget).replace(/[^\d]/g, ''));
      if (min > 0 && max > 0 && min > max) {
        errs.budget = 'Minimum bütçe, maksimum bütçeden büyük olamaz.';
      }
    }
    if (!formData.kvkkConsent) {
      errs.kvkkConsent = 'Talebinizin değerlendirilebilmesi için KVKK aydınlatma metnini onaylamanız gerekmektedir.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const minB = formData.minBudget ? Number(String(formData.minBudget).replace(/[^\d]/g, '')) : 0;
    const maxB = formData.maxBudget ? Number(String(formData.maxBudget).replace(/[^\d]/g, '')) : 0;

    let budgetDisplay = '';
    if (minB > 0 && maxB > 0) {
      budgetDisplay = `₺${minB.toLocaleString('tr-TR')} - ₺${maxB.toLocaleString('tr-TR')}`;
    } else if (maxB > 0) {
      budgetDisplay = `₺${maxB.toLocaleString('tr-TR')}'ye kadar`;
    } else if (minB > 0) {
      budgetDisplay = `₺${minB.toLocaleString('tr-TR')}'den başlayan`;
    }

    const res = submitPortalDemand({
      formData: {
        ...formData,
        minBudget: minB,
        maxBudget: maxB,
        budgetDisplay,
      },
      properties,
      customers,
      users: settings?.users || [],
    });

    if (res.success) {
      setSubmissionResult({
        demandId: res.demandId,
        isExistingCustomer: res.isExistingCustomer,
      });
      setFormData(INITIAL_FORM);
      setErrors({});
    } else {
      setErrors({ general: res.error || 'Talep kaydedilirken bir hata oluştu.' });
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
            <span className="text-slate-200 font-medium">Talep Bırak</span>
          </nav>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
              <span className="material-symbols-outlined text-[14px]">notifications_active</span>
              Özel Portföy Takibi
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Gayrimenkul Arama Talebi Bırakın
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">
              Hayalinizdeki gayrimenkulün kriterlerini bize iletin; kriterlerinize uyan yeni bir portföy geldiğinde ilk sizin haberiniz olsun.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs">
          {submissionResult ? (
            /* Success State */
            <div className="text-center py-8 px-4" data-testid="demand-success-state">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Talebiniz Başarıyla Alındı!
              </h2>
              <div className="mt-3 inline-block bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl text-slate-700 text-sm font-semibold">
                Talep Takip Referansı: <span className="text-primary font-bold">{submissionResult.demandId}</span>
              </div>

              <p className="text-sm text-slate-600 mt-4 max-w-lg mx-auto">
                Gayrimenkul arama kriterleriniz CRM sistemimize kaydedildi ve canlı portföy eşleştirme motorumuz tarafından anında incelendi.
                {submissionResult.isExistingCustomer && (
                  <span className="block text-xs text-blue-600 mt-1 font-medium">
                    (Mevcut müşteri profiliniz tanındı ve talep hesabınızla ilişkilendirildi.)
                  </span>
                )}
              </p>

              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] text-slate-500 max-w-md mx-auto">
                <span className="font-semibold text-slate-700">Prototip Bilgisi:</span> Talebiniz tarayıcı yerel belleğine (<code>emlakpro_requests_v1</code>) başarıyla işlenmiştir.
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setSubmissionResult(null)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Yeni Bir Talep Bırak
                </button>
                <Link
                  to="/ilanlar"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-semibold text-xs transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">travel_explore</span>
                  Mevcut İlanları Keşfet
                </Link>
              </div>
            </div>
          ) : (
            /* Active Demand Form */
            <div>
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 mb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                  <span className="material-symbols-outlined text-2xl">edit_document</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Arama Kriterlerinizi Belirtin
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    İstediğiniz bölge, işlem türü ve bütçe aralığını girin; akıllı eşleştirme motorumuz kriterlerinizi anında değerlendirsin.
                  </p>
                </div>
              </div>

              {errors.general && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* 1. Personal Information */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    1. İletişim Bilgileriniz
                  </h3>
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
                        placeholder="Örn: Ayşe Demir"
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

                  <div className="mt-3">
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
                      placeholder="ayse.demir@example.com"
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
                </div>

                {/* 2. Property Preferences */}
                <div className="pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    2. Gayrimenkul Kriterleri
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">İşlem Türü</label>
                      <select
                        name="transactionType"
                        value={formData.transactionType}
                        onChange={(e) => setFormData((prev) => ({ ...prev, transactionType: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="Satılık">Satılık</option>
                        <option value="Kiralık">Kiralık</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Gayrimenkul Tipi</label>
                      <select
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={(e) => setFormData((prev) => ({ ...prev, propertyType: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="Daire / Rezidans">Daire / Rezidans</option>
                        <option value="Villa / Müstakil">Villa / Müstakil</option>
                        <option value="Ofis / Ticari">Ofis / Ticari</option>
                        <option value="Arsa / Arazi">Arsa / Arazi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Hedef Bölge / İlçe</label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
                        placeholder="Örn: Kadıköy, Beşiktaş"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Budget & Rooms */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Minimum Bütçe (₺)
                      </label>
                      <input
                        type="number"
                        name="minBudget"
                        value={formData.minBudget}
                        onChange={(e) => setFormData((prev) => ({ ...prev, minBudget: e.target.value }))}
                        placeholder="Örn: 10000000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Maksimum Bütçe (₺)
                      </label>
                      <input
                        type="number"
                        name="maxBudget"
                        value={formData.maxBudget}
                        onChange={(e) => setFormData((prev) => ({ ...prev, maxBudget: e.target.value }))}
                        placeholder="Örn: 25000000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Oda Sayısı</label>
                      <select
                        name="minRooms"
                        value={formData.minRooms}
                        onChange={(e) => setFormData((prev) => ({ ...prev, minRooms: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="1+1">1+1</option>
                        <option value="2+1">2+1</option>
                        <option value="3+1">3+1</option>
                        <option value="4+1">4+1 ve üzeri</option>
                      </select>
                    </div>
                  </div>
                  {errors.budget && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.budget}</p>
                  )}

                  {/* Notes */}
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Özel Tercihler & Notlarınız
                    </label>
                    <textarea
                      rows={3}
                      name="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Balkon, otopark, manzara veya kat tercihinizi belirtebilirsiniz..."
                      className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    />
                  </div>
                </div>

                {/* 3. KVKK Consent */}
                <div className="pt-2">
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
                      6698 sayılı KVKK kapsamında; iletişim ve gayrimenkul talep verilerimin talebimin değerlendirilmesi ve tarafıma uygun portföy sunulması amacıyla işlenmesini{' '}
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
                      doğrultusunda onaylıyorum. <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  {errors.kvkkConsent && (
                    <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.kvkkConsent}</p>
                  )}
                </div>

                {/* Submit Row */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                  <Link
                    to="/ilanlar"
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Mevcut İlanları İncele
                  </Link>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-primary hover:bg-primary-container text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>Talebi İlet</span>
                  </button>
                </div>
              </form>
            </div>
          )}
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
                EmlakPro Gayrimenkul Danışmanlığı olarak kişisel verilerinizin güvenliğine ve gizliliğine önem veriyoruz.
              </p>
              <p>
                <strong>İşlenen Veriler:</strong> Form üzerinden paylaştığınız Ad, Soyad, Telefon numarası, varsa E-posta adresi ve aradığınız gayrimenkul kriterleriniz.
              </p>
              <p>
                <strong>İşleme Amacı:</strong> Belirttiğiniz kriterlere uygun portföylerin tespit edilmesi, danışmanlarımız tarafından talebinizin değerlendirilmesi ve tarafınızla irtibat kurulması amacıyla işlenmektedir.
              </p>
              <p>
                <strong>Veri Güvenliği:</strong> Verileriniz üçüncü şahıs veya reklam şirketleriyle kesinlikle paylaşılmaz; yalnızca yerel tarayıcı hafızanızda ve yetkili CRM havuzunda güvenle saklanır.
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
