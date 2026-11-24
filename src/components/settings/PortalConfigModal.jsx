import React, { useState } from 'react';
import BaseModal from '../ui/BaseModal';
import FormField from '../ui/FormField';

/**
 * EmlakPro Portal Integration Configuration Modal (Simulator)
 * Refactored in Phase 3.2 Step 3 to use BaseModal and FormField.
 * Preserves simulated credentials test, endpoints, and syncing options.
 */
export default function PortalConfigModal({
  isOpen = false,
  portal = null,
  onClose,
  onSave,
}) {
  const [apiKey, setApiKey] = useState(portal?.apiKey || '');
  const [apiEndpoint, setApiEndpoint] = useState(portal?.apiEndpoint || '');
  const [autoListing, setAutoListing] = useState(portal?.autoListing !== undefined ? Boolean(portal.autoListing) : true);
  const [fetchLeads, setFetchLeads] = useState(portal?.fetchLeads !== undefined ? Boolean(portal.fetchLeads) : true);
  const [testStatus, setTestStatus] = useState(null); // 'testing' | 'success' | 'error' | null
  const [testMessage, setTestMessage] = useState('');
  const [prevPortal, setPrevPortal] = useState(portal);

  if (portal !== prevPortal) {
    setPrevPortal(portal);
    setApiKey(portal?.apiKey || '');
    setApiEndpoint(portal?.apiEndpoint || '');
    setAutoListing(portal?.autoListing !== undefined ? Boolean(portal.autoListing) : true);
    setFetchLeads(portal?.fetchLeads !== undefined ? Boolean(portal.fetchLeads) : true);
    setTestStatus(null);
    setTestMessage('');
  }

  if (!isOpen || !portal) return null;

  const handleTestConnection = () => {
    const key = apiKey.trim();
    if (!key) {
      setTestStatus('error');
      setTestMessage('Lütfen önce bir API anahtarı girin.');
      return;
    }

    if (key.length < 8) {
      setTestStatus('error');
      setTestMessage('Biçim Hatası: API anahtarı çok kısa (En az 8 karakter olmalıdır).');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Anahtar formatı ve şema parametreleri kontrol ediliyor...');

    setTimeout(() => {
      setTestStatus('success');
      setTestMessage('Şema Formatı Geçerli (Simülasyon): Anahtar biçimi doğrulandı. (Not: Canlı portal API bağlantısı kurulmamıştır; backend gateway gereklidir).');
    }, 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanKey = apiKey.trim();
    onSave({
      ...portal,
      apiKey: cleanKey,
      apiEndpoint: apiEndpoint.trim(),
      autoListing,
      fetchLeads,
      isConfigured: Boolean(cleanKey),
      status: cleanKey ? 'Yapılandırıldı (Simülasyon)' : 'Pasif - API Tanımsız',
      statusColor: cleanKey
        ? 'bg-surface-container text-primary font-semibold'
        : 'bg-surface-variant text-on-surface-variant',
      dotColor: cleanKey ? 'bg-secondary' : 'bg-slate-400',
      lastSync: cleanKey ? 'Yerel kayıt güncellendi' : portal.lastSync,
    });
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
        form="portal-config-form"
        className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white font-label-md text-label-md font-semibold transition-all shadow-sm cursor-pointer"
      >
        Bağlantıyı Kaydet &amp; Kapat
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      icon="hub"
      title={`${portal.name} Entegrasyon Arayüzü (Simülatör)`}
      subtitle="Kurumsal API parametreleri ve otomatik senkronizasyon ayarları"
      footer={modalFooter}
    >
      <form
        id="portal-config-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        {/* Architecture & Security Notice */}
        <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container flex items-start gap-2.5">
          <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5 shrink-0">
            info
          </span>
          <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
            <strong>Simülatör &amp; Güvenlik Bildirimi:</strong> Ulusal portallar (Sahibinden, Hepsiemlak vb.) ile canlı ağ bağlantısı bulunmamaktadır. Bu alana girilen anahtarlar tarayıcı yerel belleğinde (localStorage) şifresiz metin olarak tutulduğundan canlı kurumsal API anahtarlarınızı buraya girmeyiniz. Canlı ortamda mTLS, sabit IP ve backend API Gateway zorunludur.
          </p>
        </div>

        {/* API Key */}
        <FormField
          id="portal-api-key"
          label="Kurumsal API / Token Anahtarı"
          required
          hint="Portal mağaza yönetim panelinizden aldığınız kurumsal API anahtarını girin."
        >
          <input
            id="portal-api-key"
            type="text"
            required
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setTestStatus(null);
            }}
            placeholder="shb_live_... veya he_prod_..."
            className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:border-secondary font-mono text-body-sm"
          />
        </FormField>

        {/* API Endpoint */}
        <FormField
          id="portal-api-endpoint"
          label="API Uç Noktası (Endpoint / Webhook)"
          hint="Opsiyonel: Portal webhook veya REST uç nokta adresi"
        >
          <input
            id="portal-api-endpoint"
            type="url"
            value={apiEndpoint}
            onChange={(e) => setApiEndpoint(e.target.value)}
            placeholder="https://api.portal.com/v1"
            className="w-full h-10 px-3 bg-surface border border-surface-container rounded-lg focus:outline-none focus:border-secondary font-mono text-body-sm"
          />
        </FormField>

        {/* Test Connection Button & Status */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-surface-container-high text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[16px] ${testStatus === 'testing' ? 'animate-spin' : ''}`}>
                {testStatus === 'testing' ? 'sync' : 'network_check'}
              </span>
              <span>{testStatus === 'testing' ? 'Pingleniyor...' : 'API Bağlantısını Test Et'}</span>
            </button>
          </div>

          {testStatus && (
            <div
              className={`p-2.5 rounded-lg text-body-sm font-medium flex items-center gap-2 ${
                testStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : testStatus === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {testStatus === 'success' ? 'check_circle' : testStatus === 'error' ? 'error' : 'hourglass_top'}
              </span>
              <span className="text-caption font-mono">{testMessage}</span>
            </div>
          )}
        </div>

        {/* Sync Toggles */}
        <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container flex flex-col gap-3">
          <label className="flex items-center justify-between cursor-pointer select-none">
            <div>
              <span className="font-label-sm font-semibold text-primary block">
                Otomatik İlan Aktarımı (Oto-İlan)
              </span>
              <span className="text-[11px] text-on-surface-variant block">
                Yeni eklenen yetkili portföyler onaylandığında otomatik yayına gönderilir.
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoListing}
              onChange={(e) => setAutoListing(e.target.checked)}
              className="w-4 h-4 accent-secondary cursor-pointer shrink-0 ml-3"
            />
          </label>

          <label className="flex items-center justify-between pt-2 border-t border-surface-container cursor-pointer select-none">
            <div>
              <span className="font-label-sm font-semibold text-primary block">
                Gelen Talepleri Çek (Talep Havuzu)
              </span>
              <span className="text-[11px] text-on-surface-variant block">
                Portaldan gelen mesaj ve formlar Müşteri Talepleri ekranına otomatik akar.
              </span>
            </div>
            <input
              type="checkbox"
              checked={fetchLeads}
              onChange={(e) => setFetchLeads(e.target.checked)}
              className="w-4 h-4 accent-secondary cursor-pointer shrink-0 ml-3"
            />
          </label>
        </div>
      </form>
    </BaseModal>
  );
}
