import React, { useState } from 'react';
import PortalConfigModal from './PortalConfigModal';

export default function PortalSettingsSection({
  portals = [],
  onPortalsChange,
  onToast,
}) {
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [testingPortalId, setTestingPortalId] = useState(null);
  const [sampleListingModalPortal, setSampleListingModalPortal] = useState(null);

  const handleOpenConfig = (portal) => {
    setSelectedPortal(portal);
    setIsConfigModalOpen(true);
  };

  const handleToggleAutoListing = (portalId) => {
    const updated = portals.map((p) => {
      if (p.id === portalId) {
        return { ...p, autoListing: !p.autoListing };
      }
      return p;
    });
    onPortalsChange(updated);
    if (onToast) onToast('Oto-İlan ayarı güncellendi.');
  };

  const handleSavePortalConfig = (newConfig) => {
    const updated = portals.map((p) => (p.id === newConfig.id ? newConfig : p));
    onPortalsChange(updated);
    setIsConfigModalOpen(false);
    if (onToast) onToast(`${newConfig.name} API ayarları kaydedildi.`);
  };

  const handleTestPortalDirectly = (portal) => {
    setTestingPortalId(portal.id);
    setTimeout(() => {
      setTestingPortalId(null);
      if (portal.apiKey && portal.apiKey.length >= 8) {
        if (onToast) onToast(`${portal.name}: Format Doğrulandı (Simülasyon Modu) — Canlı bağlantı kurulmamıştır.`, 'info');
      } else {
        if (onToast) onToast(`${portal.name}: API anahtarı eksik veya geçersiz format!`, 'error');
      }
    }, 500);
  };

  const handleSyncAll = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      setIsSyncingAll(false);
      const updated = portals.map((p) => ({
        ...p,
        lastSync: 'Simülasyon tazelendi',
      }));
      onPortalsChange(updated);
      if (onToast) onToast('Portal arayüz şablonları yerel olarak yenilendi (Simülasyon).');
    }, 800);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-space-lg flex flex-col gap-space-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm bg-surface-container-low -mx-space-lg -mt-space-lg p-space-lg rounded-t-xl border-b border-surface-container">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-secondary text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">hub</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
              Portal &amp; İlan Entegrasyonları (Arayüz Simülatörü)
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Ulusal portallara veri aktarım şemalarını ve entegrasyon parametrelerini test edin (Simülasyon Modu).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSyncAll}
          disabled={isSyncingAll}
          className="inline-flex items-center gap-1.5 font-label-md text-label-md text-secondary hover:text-primary font-bold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              isSyncingAll ? 'animate-spin' : ''
            }`}
          >
            refresh
          </span>
          <span>{isSyncingAll ? 'Eşitleniyor...' : 'Tümünü Eşitle'}</span>
        </button>
      </div>

      {/* Technical Architecture Notice */}
      <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex items-start gap-3">
        <span className="material-symbols-outlined text-secondary text-[22px] mt-0.5 flex-shrink-0">
          info
        </span>
        <div className="flex flex-col gap-1">
          <span className="font-label-md text-label-md font-bold text-primary">
            Entegrasyon Gerçeklik Bildirimi (Simülasyon Modu)
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            EmlakPro istemci taraflı bir web uygulamasıdır (React SPA). Sahibinden (SOAP/REST), Hepsiemlak Pro API, Emlakjet XML ve Zingat sistemleriyle canlı bir sunucu bağlantısı bulunmamaktadır. Bu ekrandaki test butonları ve formlar, kurumsal entegrasyon akışını ve veri yükü (payload) şemalarını test eden arayüz simülasyonlarıdır. Canlı entegrasyon için kurumsal mağaza sözleşmesi, statik sunucu IP'si ve güvenli backend API Gateway gereklidir. API anahtarları tarayıcı yerel belleğinde (localStorage) şifresiz tutulduğundan canlı anahtarlar girilmemelidir.
          </p>
        </div>
      </div>

      {/* Portal Cards List */}
      <div className="flex flex-col gap-space-md">
        {portals.map((p) => (
          <div
            key={p.id}
            className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col md:flex-row md:items-center justify-between gap-space-md transition-all hover:bg-surface-container/60"
          >
            <div className="flex items-center gap-space-md">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                  p.initialBg || 'bg-surface text-primary'
                }`}
              >
                {p.initial}
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-label-md text-label-md font-bold text-primary">
                    {p.name}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-semibold ${
                      p.statusColor || 'bg-surface-variant text-on-surface-variant'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${p.dotColor || 'bg-slate-400'}`}
                    />
                    {p.status}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-surface-container text-on-surface-variant">
                    {p.isConfigured ? 'Sandbox / Test Modu' : 'Bağlantı Yok'}
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Son Senkronizasyon: {p.lastSync} {p.quota ? `| İlan Kotası: ${p.quota}` : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-space-sm sm:gap-space-md justify-between md:justify-end flex-wrap">
              {p.isConfigured ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-caption text-caption text-on-surface-variant font-medium">
                      Oto-İlan
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(p.autoListing)}
                        onChange={() => handleToggleAutoListing(p.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTestPortalDirectly(p)}
                    disabled={testingPortalId === p.id}
                    title="API Uç Noktası Ping Testi"
                    className="px-space-sm py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container text-primary font-label-sm text-label-sm hover:bg-surface-container transition-colors shadow-sm cursor-pointer font-semibold inline-flex items-center gap-1"
                  >
                    <span
                      className={`material-symbols-outlined text-[16px] ${
                        testingPortalId === p.id ? 'animate-spin' : ''
                      }`}
                    >
                      {testingPortalId === p.id ? 'sync' : 'network_ping'}
                    </span>
                    <span className="hidden sm:inline">
                      {testingPortalId === p.id ? 'Test...' : 'Test Et'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSampleListingModalPortal(p)}
                    className="px-space-sm py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container text-secondary font-label-sm text-label-sm hover:bg-surface-container transition-colors shadow-sm cursor-pointer font-semibold inline-flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span className="hidden sm:inline">İlan Aktarımı Testi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenConfig(p)}
                    className="px-space-md py-1.5 rounded-lg bg-primary text-white font-label-sm text-label-sm hover:bg-primary-container transition-colors shadow-sm cursor-pointer font-semibold"
                  >
                    API Yönet
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenConfig(p)}
                  className="px-space-md py-2 rounded-lg bg-secondary text-white font-label-sm text-label-sm hover:bg-secondary-container transition-colors shadow-sm cursor-pointer font-semibold"
                >
                  Hemen Bağla
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sample Listing Dispatch Modal */}
      {sampleListingModalPortal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-surface-container-lowest w-full max-w-lg rounded-xl shadow-2xl border border-surface-container overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">
                  visibility
                </span>
                <h3 className="font-headline-sm text-[18px] font-bold text-primary">
                  {sampleListingModalPortal.name} — Örnek JSON Payload İnceleme (Simülasyon)
                </h3>
              </div>
              <button
                onClick={() => setSampleListingModalPortal(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container text-body-sm flex items-start gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">
                  info
                </span>
                <div>
                  <strong>Şema Önizleme (Simülasyon):</strong> EmlakPro gayrimenkul verisinin portal API formatına dönüştürülmüş taslak görünümüdür. Canlı yayına gönderilmemiştir.
                </div>
              </div>

              <div>
                <label className="font-label-sm text-on-surface font-semibold block mb-1">
                  Oluşturulan API JSON Yükü (Taslak Payload):
                </label>
                <pre className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container text-primary font-mono text-[12px] overflow-x-auto max-h-48 leading-relaxed">
{JSON.stringify(
  {
    portal: sampleListingModalPortal.id,
    listingRef: 'PRP-2026-004',
    title: 'Kadıköy Caddebostan 3+1 Lüks Daire',
    price: 18500000,
    currency: 'TRY',
    transactionType: 'Satılık',
    category: 'Konut / Daire',
    areaGrossM2: 145,
    areaNetM2: 130,
    roomCount: '3+1',
    authorizedAgent: 'Burak Yılmaz (Broker)',
    agencyLicenseNo: '3400892',
    dispatchTimestamp: '2026-11-11T12:00:00.000Z',
    note: 'DEMO PAYLOAD - CANLI YAYINA GÖNDERİLMEDİ',
  },
  null,
  2
)}
                </pre>
              </div>

              <div className="text-[11px] text-on-surface-variant">
                Şema Durumu: <strong>Taslak Hazır</strong> (Canlı Aktarım Yapılmadı - Backend Gateway Gerekir)
              </div>

              <div className="flex justify-end pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setSampleListingModalPortal(null)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-semibold cursor-pointer hover:bg-surface-container-high transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Config Modal */}
      <PortalConfigModal
        key={selectedPortal?.id || 'none'}
        isOpen={isConfigModalOpen}
        portal={selectedPortal}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleSavePortalConfig}
      />
    </div>
  );
}
