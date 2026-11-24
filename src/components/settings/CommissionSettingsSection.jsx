import React, { useState } from 'react';

export default function CommissionSettingsSection({
  commission = {},
  onChange,
  onToast,
}) {
  const [showLegalDetails, setShowLegalDetails] = useState(false);

  const handleUpdate = (field, value) => {
    const updated = {
      ...commission,
      [field]: value,
    };
    if (onChange) onChange(updated);
  };

  const handleContractToggle = () => {
    const updated = {
      ...commission,
      mandatoryContractRequired: !commission.mandatoryContractRequired,
    };
    if (onChange) onChange(updated);
    if (onToast) {
      const stateStr = updated.mandatoryContractRequired ? 'aktif edildi' : 'devre dışı bırakıldı';
      onToast(`Sözleşme kontrolü ${stateStr}.`);
    }
  };

  const buyerRate = Number(commission.buyerRate ?? 2);
  const sellerRate = Number(commission.sellerRate ?? 2);
  const totalSaleRate = buyerRate + sellerRate;
  const isCeilingExceeded = totalSaleRate > 4;
  const vatRate = Number(commission.vatRate ?? 20);

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-space-lg flex flex-col gap-space-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm bg-surface-container-low -mx-space-lg -mt-space-lg p-space-lg rounded-t-xl border-b border-surface-container">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">payments</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
              Komisyon, Hizmet Bedeli & Satış Kuralları
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Türkiye Taşınmaz Ticareti Hakkında Yönetmelik ve vergi mevzuatı ile uyumlu oranlar.
            </p>
          </div>
        </div>

        {/* Legal Compliance Badge */}
        <div className="self-start sm:self-auto">
          {isCeilingExceeded ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-label-sm bg-red-100 text-red-800 font-bold border border-red-200">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              Yasal Sınır Aşıldı (%{totalSaleRate} &gt; %4)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-label-sm bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Yönetmelik Md. 20 Uyumlu (%{totalSaleRate} ≤ %4)
            </span>
          )}
        </div>
      </div>

      {/* Hard Legal Warning Banner if exceeded */}
      {isCeilingExceeded && (
        <div className="p-4 rounded-xl bg-red-50 text-red-950 border border-red-200 flex items-start gap-3 animate-fadeIn">
          <span className="material-symbols-outlined text-red-700 text-[24px] mt-0.5 flex-shrink-0">
            gavel
          </span>
          <div className="flex flex-col gap-1">
            <strong className="text-red-900 font-label-md">
              HUKUKİ UYARI: Taşınmaz Ticareti Yönetmeliği Madde 20/1 İhlali!
            </strong>
            <p className="font-body-sm text-body-sm text-red-800 leading-relaxed">
              Resmî Gazete'de yayımlanan yönetmelik uyarınca, gayrimenkul alım satımına aracılıkta toplam hizmet bedeli KDV hariç <strong>%4'ü aşamaz</strong>. Şu anki oran toplamı %{totalSaleRate} olarak ayarlanmıştır. Bu durum ofisiniz için idari para cezası ve yetki belgesi iptali riski oluşturur.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {/* Satış Komisyonu */}
        <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <label className="font-label-sm text-label-sm font-bold text-primary">
              Standart Satış Komisyon Oranı
            </label>
            <span className="text-[12px] font-mono font-bold text-primary">
              Toplam: %{totalSaleRate} + KDV
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-1/2 p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container shadow-sm flex items-center justify-between">
              <span className="text-caption font-semibold text-on-surface-variant">Alıcı:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="4"
                  step="0.5"
                  value={commission.buyerRate ?? 2}
                  onChange={(e) => handleUpdate('buyerRate', Number(e.target.value))}
                  className="w-12 h-7 px-1 text-center font-label-md text-label-md font-bold text-primary bg-surface rounded border border-surface-container"
                />
                <span className="font-label-sm text-primary font-bold">%</span>
              </div>
            </div>
            <div className="w-1/2 p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container shadow-sm flex items-center justify-between">
              <span className="text-caption font-semibold text-on-surface-variant">Satıcı:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="4"
                  step="0.5"
                  value={commission.sellerRate ?? 2}
                  onChange={(e) => handleUpdate('sellerRate', Number(e.target.value))}
                  className="w-12 h-7 px-1 text-center font-label-md text-label-md font-bold text-primary bg-surface rounded border border-surface-container"
                />
                <span className="font-label-sm text-primary font-bold">%</span>
              </div>
            </div>
          </div>
          <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
            Yönetmelik Md. 20/2 uyarınca varsayılan oran eşit (%2 + %2) paylaşımdır. Taraflar aralarında yazılı mutabakatla farklı bir oran dağılımı (örn: %1 Alıcı + %3 Satıcı veya %0 Alıcı + %4 Satıcı) kararlaştırabilir; ancak toplam hizmet bedeli tavanı KDV hariç %4'ü aşamaz.
          </p>
        </div>

        {/* Kiralama Hizmet Bedeli & KDV */}
        <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2.5">
          <label className="font-label-sm text-label-sm font-bold text-primary">
            Kiralama Hizmet Bedeli & KDV Oranı
          </label>
          <div className="flex items-center gap-2">
            <div className="w-7/12 p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container shadow-sm flex items-center justify-between">
              <span className="text-caption font-semibold text-on-surface-variant">Kiralama:</span>
              <span className="font-label-md text-label-md font-bold text-primary">
                1 Aylık Kira
              </span>
            </div>
            <div className="w-5/12 p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container shadow-sm flex items-center justify-between">
              <span className="text-caption font-semibold text-on-surface-variant">KDV:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="1"
                  value={vatRate}
                  onChange={(e) => handleUpdate('vatRate', Number(e.target.value))}
                  className="w-12 h-7 px-1 text-center font-label-md text-label-md font-bold text-primary bg-surface rounded border border-surface-container"
                />
                <span className="font-label-sm text-primary font-bold">%</span>
              </div>
            </div>
          </div>
          <p className="font-caption text-caption text-on-surface-variant">
            7346 sayılı CBK gereği aracılık komisyonlarında güncel genel KDV oranı %20'dir.
          </p>
        </div>

        {/* Danışman Prim Modeli */}
        <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2 md:col-span-2">
          <label className="font-label-sm text-label-sm font-bold text-primary">
            Danışman Prim & Gelir Paylaşım Modeli
          </label>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm p-space-sm rounded-lg bg-surface-container-lowest border border-surface-container">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                trending_up
              </span>
              <span className="font-body-sm text-body-sm font-medium text-on-surface">
                {commission.advisorSplitModel ||
                  'Kademeli Performans Modeli (%50 - %70 danışman payı)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onToast && onToast('Ofis danışman prim basamakları görüntülendi.')}
              className="px-space-sm py-1 rounded bg-surface-container text-secondary font-label-sm text-label-sm hover:bg-surface-container-high transition-colors font-semibold cursor-pointer"
            >
              Basamakları İncele
            </button>
          </div>
        </div>

        {/* Hard Policy Toggle: Sözleşmesiz Portföy Yayınlama Engeli */}
        <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between gap-space-md md:col-span-2">
          <div className="flex items-start gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[24px] mt-0.5 flex-shrink-0">
              policy
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-bold text-primary">
                Sözleşmesiz Portföy Yayınlama Engeli (Yasal Zorunluluk - Madde 15)
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {commission.contractEnforcementNotice ||
                  'Yetki sözleşmesi PDF formatında sisteme yüklenmeyen ilanlar portallarda veya sitede yayınlanamaz, taslak kalır.'}
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={Boolean(commission.mandatoryContractRequired)}
              onChange={handleContractToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
          </label>
        </div>
      </div>

      {/* Collapsible Legal Reference Section */}
      <div className="pt-2 border-t border-surface-container">
        <button
          type="button"
          onClick={() => setShowLegalDetails(!showLegalDetails)}
          className="text-secondary font-label-sm text-label-sm font-semibold hover:underline inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">menu_book</span>
          <span>
            {showLegalDetails
              ? 'Hukuki Mevzuat Metinlerini Gizle ↑'
              : 'Resmî Gazete & Hukuki Mevzuat Dayanağını Göster ↓'}
          </span>
        </button>

        {showLegalDetails && (
          <div className="mt-3 p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-3 font-body-sm text-body-sm text-on-surface-variant animate-fadeIn">
            <div>
              <strong className="text-primary block font-label-sm mb-1">
                1. Taşınmaz Ticareti Hakkında Yönetmelik (05.06.2018 / 30442 R.G. - Md. 20)
              </strong>
              <p className="italic bg-surface p-2.5 rounded border border-surface-container">
                "Taşınmaz alım satımına aracılık sözleşmesinde yer alan hizmet bedeli oranı, alım satıma aracılık sözleşmesinde yer alan satış bedelinin Katma Değer Vergisi hariç yüzde dördünden (%4) fazla olamaz. Bu bedel, iş sahibi ile alıcı veya satıcı arasında aksi kararlaştırılmadıkça taraflarca eşit olarak ödenir."
              </p>
            </div>

            <div>
              <strong className="text-primary block font-label-sm mb-1">
                2. Kiralama Hizmet Bedeli Tavanı (Md. 20 / Fıkra 3)
              </strong>
              <p className="italic bg-surface p-2.5 rounded border border-surface-container">
                "Kiralama işlemlerinde hizmet bedeli, kiralama sözleşmesinde yer alan bir aylık kira bedelinin Katma Değer Vergisi hariç tutarından fazla olamaz."
              </p>
            </div>

            <div>
              <strong className="text-primary block font-label-sm mb-1">
                3. Güncel KDV Oranı (07.07.2023 Tarihli ve 7346 Sayılı Cumhurbaşkanı Kararı)
              </strong>
              <p className="italic bg-surface p-2.5 rounded border border-surface-container">
                "Gayrimenkul komisyonculuğu ve aracılık hizmetlerinde uygulanan genel KDV oranı %18'den %20'ye yükseltilmiştir."
              </p>
            </div>

            <div className="p-3 rounded-lg bg-surface-container border border-surface-container-high text-[11px] text-on-surface-variant leading-relaxed">
              <strong>Mali &amp; Hukuki Sorumluluk Reddi:</strong> Bu ekranda yer alan oranlar ve mevzuat referansları genel bilgilendirme amacıyla sunulmuştur. Şirket aktifine kayıtlı ticari taşınmaz devirleri, KDV tevkifatı, tapu harcı muafiyetleri ve özel sözleşme hükümleri gibi vergisel istisnalar için her somut işlemin koşulları yetkili bir mali müşavir veya hukuk danışmanı tarafından ayrıca incelenmelidir.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
