import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const targetDestination = location.state?.from?.pathname || '/';
  const { showToast } = useToast();
  const {
    currentUser,
    isAuthenticated,
    isInitialSetupRequired,
    login,
    setupInitialAdmin,
    logout,
  } = useAuth();

  // Setup form state
  const [setupData, setSetupData] = useState({
    name: '',
    email: '',
    title: 'Sistem Yöneticisi',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Handle Initial Admin Setup Submit
  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    const newErrors = {};

    if (!setupData.name || setupData.name.trim().length < 2) {
      newErrors.name = 'Yönetici adı ve soyadı en az 2 karakter olmalıdır.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!setupData.email || !emailRegex.test(setupData.email.trim())) {
      newErrors.email = 'Geçerli bir kurumsal e-posta adresi giriniz.';
    }

    if (!setupData.password || setupData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır.';
    }

    if (setupData.password !== setupData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler birbiriyle eşleşmiyor.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await setupInitialAdmin({
        name: setupData.name.trim(),
        email: setupData.email.trim(),
        title: setupData.title.trim() || 'Sistem Yöneticisi',
        phone: setupData.phone.trim(),
        password: setupData.password,
      });

      if (result.success) {
        showToast?.('İlk yönetici hesabı başarıyla oluşturuldu. Giriş yapıldı.', 'success');
        navigate(targetDestination, { replace: true });
      } else {
        setGeneralError(result.error || 'Yönetici hesabı oluşturulamadı.');
      }
    } catch (err) {
      setGeneralError('Beklenmeyen bir hata oluştu: ' + (err.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Standard Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    const newErrors = {};

    if (!loginData.email || !loginData.email.trim()) {
      newErrors.email = 'E-posta adresinizi giriniz.';
    }
    if (!loginData.password) {
      newErrors.password = 'Şifrenizi giriniz.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await login(loginData.email.trim(), loginData.password);
      if (result.success) {
        showToast?.(`Hoş geldiniz, ${result.user?.name || ''}!`, 'success');
        let destination = targetDestination;
        if (result.user?.role !== 'admin' && (destination === '/ayarlar' || destination === '/danismanlar')) {
          destination = '/';
        }
        navigate(destination, { replace: true });
      } else {
        setGeneralError(result.error || 'E-posta veya şifre hatalı.');
      }
    } catch (err) {
      setGeneralError('Giriş yapılırken bir hata oluştu: ' + (err.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already authenticated, show status card
  if (isAuthenticated && currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <span className="material-symbols-outlined text-3xl">verified_user</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Aktif Oturum Bulunuyor</h2>
          <p className="text-sm text-slate-600 mb-6">
            Zaten <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.displayRole}) olarak giriş yapmış durumdasınız.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-left">
            <div className="text-xs text-slate-700 font-semibold mb-1">Oturum Bilgileri:</div>
            <div className="text-sm text-slate-800"><strong>E-posta:</strong> {currentUser.email}</div>
            <div className="text-sm text-slate-800"><strong>Rol:</strong> {currentUser.displayRole}</div>
            <div className="text-sm text-slate-800"><strong>Unvan:</strong> {currentUser.title}</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">dashboard</span>
              Dashboard&apos;a Dön
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                showToast?.('Oturum kapatıldı.', 'info');
              }}
              className="py-2.5 px-4 rounded-xl border border-rose-300 text-rose-700 font-semibold text-sm hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-primary to-slate-900 flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Brand & Logo Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold tracking-wider uppercase backdrop-blur-sm border border-white/15 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          {isInitialSetupRequired ? 'İlk Kurulum & Yönetici Tanımlama' : 'Kurumsal Giriş Portalı'}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-3xl sm:text-4xl text-secondary-fixed-dim">apartment</span>
          Emlak<span className="text-secondary-fixed-dim">Pro</span>
        </h1>
        <p className="text-slate-300 text-sm mt-1">Real Estate Management OS</p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          {/* Card Title & Description */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {isInitialSetupRequired ? 'İlk Yönetici Hesabınızı Oluşturun' : 'CRM Hesabınıza Giriş Yapın'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {isInitialSetupRequired
                ? 'Sistemde henüz kayıtlı kullanıcı bulunmuyor. EmlakPro CRM yönetimini başlatmak için ilk yöneticiyi belirleyin.'
                : 'Yönetici veya danışman e-posta adresiniz ve şifrenizle oturum açın.'}
            </p>
          </div>

          {/* General Error Banner */}
          {generalError && (
            <div role="alert" className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
              <span className="material-symbols-outlined text-rose-600 text-lg shrink-0 mt-0.5">error</span>
              <div className="flex-1">{generalError}</div>
            </div>
          )}

          {/* MODE 1: Initial Admin Setup Form */}
          {isInitialSetupRequired ? (
            <form noValidate onSubmit={handleSetupSubmit} className="space-y-4">
              {/* Ad Soyad */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Yönetici Adı ve Soyadı <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-lg">person</span>
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Ahmet Yılmaz"
                    value={setupData.name}
                    onChange={(e) => setSetupData({ ...setupData, name: e.target.value })}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-secondary focus:ring-secondary/20'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
              </div>

              {/* Kurumsal E-posta */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Kurumsal E-posta Adresi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-lg">mail</span>
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="yonetici@emlakpro.com"
                    value={setupData.email}
                    onChange={(e) => setSetupData({ ...setupData, email: e.target.value })}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-secondary focus:ring-secondary/20'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
              </div>

              {/* Unvan & Telefon (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Unvan / Görev
                  </label>
                  <input
                    type="text"
                    placeholder="Kurucu Broker"
                    value={setupData.title}
                    onChange={(e) => setSetupData({ ...setupData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Telefon (Opsiyonel)
                  </label>
                  <input
                    type="tel"
                    placeholder="0 (5XX) XXX XX XX"
                    value={setupData.phone}
                    onChange={(e) => setSetupData({ ...setupData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                  />
                </div>
              </div>

              {/* Şifre */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Yönetici Şifresi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-lg">lock</span>
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="En az 6 karakter"
                    value={setupData.password}
                    onChange={(e) => setSetupData({ ...setupData, password: e.target.value })}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.password ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-secondary focus:ring-secondary/20'
                    }`}
                  />
                </div>
                {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
              </div>

              {/* Şifre Tekrarı */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Şifre Tekrarı <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-lg">lock_reset</span>
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Şifreyi tekrar yazınız"
                    value={setupData.confirmPassword}
                    onChange={(e) => setSetupData({ ...setupData, confirmPassword: e.target.value })}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.confirmPassword ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-secondary focus:ring-secondary/20'
                    }`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-rose-600 mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-primary text-white font-semibold text-sm shadow-lg hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    Hesap Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">how_to_reg</span>
                    Yönetici Hesabını Oluştur ve Giriş Yap
                  </>
                )}
              </button>
            </form>
          ) : (
            /* MODE 2: Standard Login Form */
            <form noValidate onSubmit={handleLoginSubmit} className="space-y-4">
              {/* E-posta */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  E-posta Adresi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-lg">mail</span>
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="kullanici@emlakpro.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-secondary focus:ring-secondary/20'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
              </div>

              {/* Şifre */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Şifre <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-lg">lock</span>
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Şifrenizi giriniz"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.password ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-secondary focus:ring-secondary/20'
                    }`}
                  />
                </div>
                {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-primary text-white font-semibold text-sm shadow-lg hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    Giriş Yapılıyor...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">login</span>
                    Giriş Yap
                  </>
                )}
              </button>
            </form>
          )}

          {/* Prototype Architecture Disclaimer */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
              <span className="material-symbols-outlined text-slate-400 text-base shrink-0 mt-0.5">info</span>
              <p className="leading-relaxed">
                <strong>Frontend Prototip Bilgisi:</strong> Bu uygulama istemci tarafında (SPA) çalışmaktadır. Şifreler Web Crypto API (SHA-256) ile özetlenerek yerel tarayıcı hafızasında saklanır; düz metin şifreler hiçbir zaman kaydedilmez. Bu mimari sunucu tarafı kimlik doğrulamasının yerine geçmez.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation Link */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-xs text-slate-300 hover:text-white underline transition-colors inline-flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
          Müşteri İlan Portalına Dön
        </button>
      </div>
    </div>
  );
}
