import React, { useState, useEffect } from 'react';

export default function SecuritySettingsSection({
  security = {},
  onChange,
  onToast,
}) {
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [totpVerificationResult, setTotpVerificationResult] = useState(null); // 'success' | 'error' | null
  const [totpTimer, setTotpTimer] = useState(30);

  // IP Check State
  const [isCheckingIp, setIsCheckingIp] = useState(false);
  const [detectedIpInfo, setDetectedIpInfo] = useState(null);

  // 30s TOTP countdown simulation
  useEffect(() => {
    if (!is2FAModalOpen) return;
    const interval = setInterval(() => {
      setTotpTimer((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [is2FAModalOpen]);

  const handleToggle2FA = () => {
    const isEnforced = !security.isTwoFactorEnforced;
    const updated = {
      ...security,
      isTwoFactorEnforced: isEnforced,
      twoFactorAuth: isEnforced ? 'ZORUNLU' : 'İSTEĞE BAĞLI',
    };
    if (onChange) onChange(updated);
    if (onToast)
      onToast(
        `2FA doğrulaması ${
          isEnforced ? 'tüm ekip için zorunlu yapıldı' : 'isteğe bağlı hale getirildi'
        }.`
      );
  };

  const handleToggleIP = () => {
    const isActive = !security.isIpRestrictionActive;
    const updated = {
      ...security,
      isIpRestrictionActive: isActive,
      ipRestriction: isActive ? 'AKTİF' : 'PASİF',
    };
    if (onChange) onChange(updated);
    if (onToast)
      onToast(`Ofis IP kısıtlaması ${isActive ? 'aktif edildi' : 'devre dışı bırakıldı'}.`);
  };

  const handleVerifyTotp = (e) => {
    e.preventDefault();
    if (totpCode.trim().length === 6 && /^\d+$/.test(totpCode.trim())) {
      setTotpVerificationResult('success');
      if (onToast) onToast('Arayüz simülasyonu: 6 haneli kod formatı doğrulandı (Demo).', 'info');
    } else {
      setTotpVerificationResult('error');
      if (onToast) onToast('Geçersiz TOTP kodu: Lütfen 6 haneli sayısal kod girin.', 'error');
    }
  };

  const handleCheckCurrentIp = () => {
    setIsCheckingIp(true);
    setTimeout(() => {
      setIsCheckingIp(false);
      // Simulate network IP check demo
      setDetectedIpInfo({
        ip: '212.156.44.82',
        isp: 'Turkcell Superonline Kurumsal Fiber (Örnek)',
        location: 'Kadıköy, İstanbul',
        isWhitelisted: true,
      });
      if (onToast) onToast('Simüle ağ kontrolü tamamlandı: Örnek ofis IP kaydı görüntülendi.');
    }, 600);
  };

  const auditLogs = security.auditLogs || [];
  const displayLogs = showAllLogs ? auditLogs : auditLogs.slice(0, 4);

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-space-lg flex flex-col gap-space-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-space-sm bg-surface-container-low -mx-space-lg -mt-space-lg p-space-lg rounded-t-xl border-b border-surface-container">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">shield</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
              Güvenlik & Erişim Kontrolleri
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              KVKK uyumlu veri bütünlüğü, 2 faktörlü kimlik doğrulama ve sistem denetim kayıtları.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-label-sm bg-surface-container text-on-surface-variant font-semibold">
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          İstemci İlke Ayarı (Simülasyon)
        </span>
      </div>

      {/* Backend / WAF Architecture Notice */}
      <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex items-start gap-3">
        <span className="material-symbols-outlined text-secondary text-[22px] mt-0.5 flex-shrink-0">
          admin_panel_settings
        </span>
        <div className="flex flex-col gap-1">
          <span className="font-label-md text-label-md font-bold text-primary">
            Güvenlik Mimarisi & Gerçeklik Bildirimi (Simülasyon Modu)
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            İki faktörlü kimlik doğrulama (2FA) ve statik IP filtreleme istemci (React SPA) tarafında tek başına ağ güvenliği sağlayamaz. Bu ekrandaki anahtarlar ve formlar, kurumsal güvenlik politikasının kullanıcı arayüzü simülasyonudur. Canlı sistemde gerçek güvenlik; Nginx/Cloudflare WAF kuralları, VPN ağ geçidi ve merkezi backend yetkilendirme (Auth Gateway) servisleri üzerinden yürütülmelidir.
          </p>
        </div>
      </div>

      {/* Security Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {/* 2FA */}
        <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between gap-space-md">
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-label-md text-label-md font-bold text-primary">
                  İki Faktörlü Doğrulama (2FA) — Simülasyon
                </span>
                <span
                  className={`font-caption text-caption font-bold px-2 py-0.5 rounded ${
                    security.isTwoFactorEnforced
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-on-surface-variant bg-surface-container'
                  }`}
                >
                  {security.twoFactorAuth || 'ZORUNLU'}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Girişlerde Google Authenticator veya SMS zorunluluğu ilke tercihi. (Arayüz tasarımıdır; canlı 2FA için backend RFC 6238 HMAC gereklidir).
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={Boolean(security.isTwoFactorEnforced)}
                onChange={handleToggle2FA}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
            </label>
          </div>

          <div className="pt-2 border-t border-surface-container flex items-center justify-between">
            <span className="text-[11px] font-mono text-on-surface-variant">
              RFC 6238 Şema Simülasyonu
            </span>
            <button
              type="button"
              onClick={() => {
                setIs2FAModalOpen(true);
                setTotpVerificationResult(null);
                setTotpCode('');
              }}
              className="text-secondary font-label-sm text-label-sm font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
              <span>2FA Test & Kurulum Modalı</span>
            </button>
          </div>
        </div>

        {/* IP Restriction */}
        <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between gap-space-md">
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-label-md text-label-md font-bold text-primary">
                  Ofis İçi IP Kısıtlaması — Simülasyon
                </span>
                <span
                  className={`font-caption text-caption font-bold px-2 py-0.5 rounded ${
                    security.isIpRestrictionActive
                      ? 'text-secondary bg-secondary-fixed/50'
                      : 'text-on-surface-variant bg-surface-container'
                  }`}
                >
                  {security.ipRestriction || 'AKTİF'}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Ofis dışı ağlardan erişimde maskeleme tercihi. (Gerçek IP kısıtlaması sunucu/WAF düzeyinde yapılmalıdır).
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={Boolean(security.isIpRestrictionActive)}
                onChange={handleToggleIP}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
            </label>
          </div>

          <div className="pt-2 border-t border-surface-container flex items-center justify-between">
            <span className="text-[11px] font-mono text-on-surface-variant">
              Örnek IP: {security.officeStaticIp || '212.156.44.82'}
            </span>
            <button
              type="button"
              onClick={handleCheckCurrentIp}
              disabled={isCheckingIp}
              className="text-secondary font-label-sm text-label-sm font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span
                className={`material-symbols-outlined text-[16px] ${
                  isCheckingIp ? 'animate-spin' : ''
                }`}
              >
                {isCheckingIp ? 'sync' : 'network_check'}
              </span>
              <span>{isCheckingIp ? 'Taranıyor...' : 'Mevcut IP Kontrolü'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Detected IP Details Banner */}
      {detectedIpInfo && (
        <div className="p-3.5 rounded-xl bg-surface-container-low text-primary border border-surface-container flex items-center justify-between flex-wrap gap-2 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-secondary text-[22px]">
              info
            </span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm font-bold">
                Örnek Ağ Bilgisi: {detectedIpInfo.ip} ({detectedIpInfo.location})
              </span>
              <span className="text-[11px] text-on-surface-variant">
                {detectedIpInfo.isp} • Not: İstemci tarafı IP eşleşmesi gerçek ağ güvenliği sağlamaz ve yasal KVKK veri koruma yükümlülüklerini hiçbir şekilde ortadan kaldırmaz.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-surface-container text-primary font-label-sm text-caption font-bold">
            Arayüz Simülasyonu
          </span>
        </div>
      )}

      {/* 2FA Setup & Verification Modal */}
      {is2FAModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-2xl border border-surface-container overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">
                  security
                </span>
                <h3 className="font-headline-sm text-[18px] font-bold text-primary">
                  2FA Authenticator Kurulum Simülatörü (Demo)
                </h3>
              </div>
              <button
                onClick={() => setIs2FAModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container text-[12px] text-on-surface-variant leading-relaxed">
                <strong>Simülasyon Bildirimi:</strong> Bu ekran yalnızca arayüz tasarım akışını gösterir. Sabit bir mock anahtar kullanılır. Canlı sistemde bu işlem RFC 6238 HMAC algoritması kullanan backend sunucusu gerektirir.
              </div>

              {/* QR Code Mock */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-surface border border-surface-container">
                <div className="w-36 h-36 bg-white p-2 rounded-lg border-2 border-primary/20 flex flex-col items-center justify-center shadow-inner relative">
                  <div className="grid grid-cols-4 gap-1.5 w-full h-full p-1 opacity-80">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          i % 2 === 0 || i % 5 === 0 ? 'bg-primary' : 'bg-surface-container'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white p-1 rounded-full text-secondary shadow-md font-bold text-[10px]">
                      EMLAKPRO
                    </span>
                  </div>
                </div>
                <span className="mt-2 text-[11px] font-mono text-on-surface-variant font-semibold">
                  Örnek Gizli Anahtar: EMLK-PRO-2026-AUTH (Mock)
                </span>
              </div>

              {/* Form to test 6-digit code */}
              <form onSubmit={handleVerifyTotp} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="font-label-sm text-on-surface font-semibold">
                    6 Haneli Kod Format Testi:
                  </label>
                  <span className="text-[11px] font-mono text-secondary font-bold">
                    Simüle Süre: {totpTimer} sn
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => {
                      setTotpCode(e.target.value);
                      setTotpVerificationResult(null);
                    }}
                    placeholder="Örn: 482910"
                    className="w-full h-11 px-3 text-center tracking-widest font-mono text-lg font-bold bg-surface border border-surface-container rounded-lg focus:outline-none focus:border-secondary"
                  />
                  <button
                    type="submit"
                    className="h-11 px-4 rounded-lg bg-primary text-white font-label-md font-semibold hover:bg-primary-container transition-colors cursor-pointer flex-shrink-0"
                  >
                    Test Et
                  </button>
                </div>

                {totpVerificationResult === 'success' && (
                  <div className="p-2.5 rounded-lg bg-surface-container text-primary border border-surface-container-high text-body-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                    <span>Format Geçerli (Simülasyon): 6 haneli kod formatı onaylandı. Canlı 2FA doğrulaması için backend servisi gereklidir.</span>
                  </div>
                )}

                {totpVerificationResult === 'error' && (
                  <div className="p-2.5 rounded-lg bg-red-50 text-red-800 border border-red-200 text-body-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>Geçersiz format: Lütfen tam 6 haneli rakam girin.</span>
                  </div>
                )}
              </form>

              <div className="flex justify-end pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setIs2FAModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md font-semibold cursor-pointer hover:bg-surface-container-high transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Timeline */}
      <div className="flex flex-col gap-space-sm pt-2">
        <div className="flex items-center justify-between">
          <span className="font-caption text-caption uppercase text-on-surface-variant tracking-wider font-bold">
            Son Sistem & Denetim Günlüğü (Audit Log)
          </span>
          <span className="font-caption text-caption text-on-surface-variant">
            {auditLogs.length} Kayıt Listelendi
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {displayLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-lg bg-surface border border-surface-container text-body-sm text-on-surface flex items-start gap-3 hover:bg-surface-container-low transition-colors"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  log.dotColor || 'bg-secondary'
                } mt-2 flex-shrink-0`}
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 flex-1">
                <span>
                  <strong>{log.author}:</strong> {log.action}
                </span>
                <span className="text-[11px] text-on-surface-variant font-mono flex-shrink-0">
                  {log.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setShowAllLogs(!showAllLogs)}
            className="font-label-sm text-label-sm text-secondary font-semibold hover:underline cursor-pointer"
          >
            {showAllLogs
              ? 'Daha Az Kayıt Göster ↑'
              : `Tüm Güvenlik Günlüğünü İncele (${auditLogs.length} Kayıt) →`}
          </button>
        </div>
      </div>
    </div>
  );
}

