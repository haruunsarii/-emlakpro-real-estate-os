import React, { useState } from 'react';
import MatchScore from './MatchScore';
import MatchingProperties from './MatchingProperties';

export default function RequestDetailDrawer({
  demand,
  matchedProperties = [],
  onEditDemand,
  onDeleteDemand,
  onOpenPropertyDetail,
  onScheduleShowing,
  onSendPresentation,
  onSendCatalog,
  onAddNote,
}) {
  const [newNote, setNewNote] = useState('');
  const [catalogSending, setCatalogSending] = useState(false);
  const [catalogSent, setCatalogSent] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);

  if (!demand) {
    return (
      <div className="bg-surface-container-lowest p-12 rounded-xl shadow-sm text-center border border-surface-container flex flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined text-[48px] text-outline">
          assignment_late
        </span>
        <h3 className="font-headline-md text-on-surface font-semibold">
          Talep Seçilmedi
        </h3>
        <p className="font-body-md text-on-surface-variant max-w-md">
          Eşleşme skorlarını ve önerilen gayrimenkulleri incelemek için lütfen soldaki listeden bir müşteri talebi seçin.
        </p>
      </div>
    );
  }

  const initials = demand.clientName
    ? demand.clientName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'TP';

  const handleSendCatalogClick = () => {
    setCatalogSending(true);
    setTimeout(() => {
      setCatalogSending(false);
      setCatalogSent(true);
      if (onSendCatalog) {
        onSendCatalog(demand, matchedProperties);
      }
      setTimeout(() => {
        setCatalogSent(false);
      }, 3000);
    }, 600);
  };

  const handleAddNoteSubmit = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    if (onAddNote) {
      onAddNote(demand.id, newNote.trim());
    }
    setNewNote('');
  };

  return (
    <div className="flex flex-col gap-space-lg">
      {/* 1. Selected Demand Detail Header Panel */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-surface-container-low">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          {/* Avatar and Client Info */}
          <div className="flex items-center gap-space-sm">
            <div className="w-12 h-12 rounded-xl bg-secondary-fixed/50 flex items-center justify-center text-secondary font-headline-md font-bold shrink-0">
              {initials}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  {demand.clientName}
                </h2>
                <span className="font-caption text-caption bg-secondary-fixed/50 text-secondary px-2 py-0.5 rounded font-semibold">
                  {demand.id}
                </span>
                <span className="font-caption text-caption bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse" />
                  {demand.statusBadge || demand.status || 'Aktif Sıcak Talep'}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Kayıt: {demand.date || '12 Mart 2024'} • Danışman:{' '}
                <span className="font-semibold text-on-surface">
                  {demand.advisor || 'Burak Yılmaz'}
                </span>{' '}
                • Telefon: {demand.phone || '+90 (532) 412 88 00'}
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${(demand.phone || '905324128800').replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-all flex items-center justify-center hover:scale-105"
              title="WhatsApp İle Görüş"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">
                chat
              </span>
            </a>

            {/* Quick Presentation */}
            <button
              onClick={() => onSendPresentation && onSendPresentation(demand, matchedProperties[0])}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-all flex items-center justify-center hover:scale-105"
              title="Hızlı PDF Sunum Oluştur"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                picture_as_pdf
              </span>
            </button>

            {/* Edit */}
            <button
              onClick={() => onEditDemand && onEditDemand(demand)}
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-all flex items-center gap-1"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Düzenle</span>
            </button>

            {/* Delete */}
            <button
              onClick={() => onDeleteDemand && onDeleteDemand(demand)}
              className="p-2 rounded-lg bg-surface-container hover:bg-error-container/30 text-outline hover:text-error transition-all flex items-center justify-center"
              title="Talebi Sil"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        </div>

        {/* Demand Full Criteria Summary Card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-surface p-3.5 rounded-xl border border-surface-container text-body-sm font-body-sm">
          <div>
            <span className="text-on-surface-variant text-[11px] block font-caption font-semibold uppercase">
              Hedef Lokasyon
            </span>
            <span className="text-on-surface font-medium truncate block">
              {demand.city ? `${demand.city} / ` : ''}
              {demand.targetRegion || demand.district || 'Kadıköy'}
            </span>
          </div>

          <div>
            <span className="text-on-surface-variant text-[11px] block font-caption font-semibold uppercase">
              Bütçe Aralığı
            </span>
            <span className="text-secondary font-bold truncate block">
              {demand.budget || '₺20M - ₺40M'}
            </span>
          </div>

          <div>
            <span className="text-on-surface-variant text-[11px] block font-caption font-semibold uppercase">
              Mülk & Oda Sayısı
            </span>
            <span className="text-on-surface font-medium truncate block">
              {demand.propertyType || 'Daire'} • {demand.roomCount || '3+1'}
            </span>
          </div>

          <div>
            <span className="text-on-surface-variant text-[11px] block font-caption font-semibold uppercase">
              Hedef Metrekare
            </span>
            <span className="text-on-surface font-medium truncate block">
              {demand.minArea ? `${demand.minArea} - ${demand.maxArea} m²` : '150 - 220 m²'}
            </span>
          </div>

          {/* Additional Features / Preferences Tags */}
          <div className="col-span-2 md:col-span-4 pt-2 border-t border-surface-container flex items-center gap-2 flex-wrap">
            <span className="text-on-surface-variant text-[11px] font-caption font-semibold uppercase mr-1">
              Özel Tercihler:
            </span>
            {demand.features && demand.features.length > 0 ? (
              demand.features.map((feat, idx) => (
                <span
                  key={idx}
                  className="font-caption text-caption bg-surface-container-high text-on-surface px-2.5 py-0.5 rounded-full font-medium"
                >
                  {feat}
                </span>
              ))
            ) : (
              <>
                <span className="font-caption text-caption bg-surface-container-high text-on-surface px-2.5 py-0.5 rounded-full font-medium">
                  {demand.specialPreference || 'Deniz Manzarası'}
                </span>
                <span className="font-caption text-caption bg-surface-container-high text-on-surface px-2.5 py-0.5 rounded-full font-medium">
                  Kapalı Otopark
                </span>
                <span className="font-caption text-caption bg-surface-container-high text-on-surface px-2.5 py-0.5 rounded-full font-medium">
                  Balkon / Teras
                </span>
              </>
            )}
          </div>
        </div>

        {/* Algorithmic Scoring Breakdown */}
        <MatchScore
          overallScore={demand.overallScore || 0}
          scoring={demand.scoring || { budget: 95, location: 90, area: 85, building: 80 }}
        />
      </div>

      {/* 2. Matched Properties Deck */}
      <MatchingProperties
        clientName={demand.clientName}
        properties={matchedProperties}
        onOpenPropertyDetail={onOpenPropertyDetail}
        onScheduleShowing={onScheduleShowing}
        onSendPresentation={onSendPresentation}
      />

      {/* 3. Quick Comparison Catalog Action Footer Box */}
      <div className="bg-gradient-to-r from-primary-container via-primary-container to-tertiary-container text-on-primary p-space-lg rounded-xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-space-md border border-white/10">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-surface-container-lowest/15 backdrop-blur-md flex items-center justify-center shrink-0 text-white shadow-inner">
            <span className="material-symbols-outlined text-[26px]">
              forward_to_inbox
            </span>
          </div>
          <div className="flex flex-col">
            <h4 className="font-headline-sm text-headline-sm text-on-primary font-bold">
              Müşteriye Karşılaştırmalı E-Katalog Gönder
            </h4>
            <p className="font-body-sm text-body-sm text-on-primary-container mt-0.5">
              Seçili {matchedProperties.length} eşleşen ilanı tek tıkla branded PDF karşılaştırma tablosu veya interaktif WhatsApp bağlantısı olarak {demand.clientName}&apos;e iletin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowCatalogModal(true)}
            className="px-4 py-2.5 rounded-lg bg-surface-container-lowest/20 hover:bg-surface-container-lowest/30 text-on-primary font-label-md text-label-md transition-all active:scale-95"
            type="button"
          >
            Şablonu İncele
          </button>

          <button
            onClick={handleSendCatalogClick}
            disabled={catalogSending || matchedProperties.length === 0}
            className={`px-5 py-2.5 rounded-lg font-label-md text-label-md font-semibold transition-all shadow-md active:scale-95 flex items-center gap-1.5 ${
              catalogSent
                ? 'bg-emerald-600 text-white'
                : 'bg-secondary-container hover:bg-secondary text-on-secondary disabled:opacity-50'
            }`}
            type="button"
          >
            {catalogSending ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  sync
                </span>
                <span>Hazırlanıyor...</span>
              </>
            ) : catalogSent ? (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  check_circle
                </span>
                <span>Gönderildi!</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>Tek Tıkla Gönder</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4. Notes & Activity Feed */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">
              comment
            </span>
            <span>Danışman Notları & Görüşme Geçmişi</span>
          </span>
          <span className="font-caption text-caption text-on-surface-variant">
            {demand.notesList ? demand.notesList.length : (demand.notes ? 1 : 0)} Not Kayıtlı
          </span>
        </div>

        {/* Existing Notes list */}
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
          {demand.notes && (
            <div className="p-3 rounded-lg bg-surface border border-surface-container/60 text-body-sm">
              <div className="flex items-center justify-between text-[11px] font-caption text-on-surface-variant mb-1">
                <span className="font-semibold text-primary">Sistem Notu</span>
                <span>{demand.date || 'Bugün'}</span>
              </div>
              <p className="text-on-surface">{demand.notes}</p>
            </div>
          )}

          {demand.notesList && demand.notesList.map((item, index) => (
            <div key={index} className="p-3 rounded-lg bg-surface border border-surface-container/60 text-body-sm">
              <div className="flex items-center justify-between text-[11px] font-caption text-on-surface-variant mb-1">
                <span className="font-semibold text-primary">{item.author || demand.advisor || 'Danışman'}</span>
                <span>{item.date || 'Az önce'}</span>
              </div>
              <p className="text-on-surface">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Add Note Input */}
        <form onSubmit={handleAddNoteSubmit} className="flex gap-2 mt-1">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Müşteri talebine yeni danışman notu veya randevu kaydı ekle..."
            className="flex-1 h-[40px] px-3 bg-surface text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:border-secondary transition-all"
          />
          <button
            type="submit"
            disabled={!newNote.trim()}
            className="px-4 h-[40px] rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-all disabled:opacity-50 flex items-center gap-1 shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Ekle</span>
          </button>
        </form>
      </div>

      {/* Catalog Preview Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[24px]">
                  auto_stories
                </span>
                <h3 className="font-headline-sm text-on-surface font-bold">
                  E-Katalog Şablon Önizlemesi
                </h3>
              </div>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-4 bg-surface rounded-xl border border-surface-container flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption text-secondary font-bold uppercase tracking-wider">
                  EmlakPro Branded Karşılaştırma Portföyü
                </span>
                <span className="font-caption text-caption text-on-surface-variant">
                  Hazırlayan: {demand.advisor || 'Burak Yılmaz'}
                </span>
              </div>
              <h4 className="font-headline-sm text-primary font-semibold">
                Sayın {demand.clientName}, Sizin İçin Seçtiğimiz {matchedProperties.length} Prestijli Gayrimenkul
              </h4>
              <p className="font-body-sm text-on-surface-variant">
                Aradığınız {demand.targetRegion || demand.district || 'bölgedeki'} bütçenize ve kriterlerinize en yüksek uyum sağlayan gayrimenkullerin detaylı teknik karşılaştırma tablosu aşağıda listelenmiştir.
              </p>

              <div className="divide-y divide-surface-container">
                {matchedProperties.slice(0, 3).map((prop, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between gap-3 text-body-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="font-caption font-bold text-primary px-2 py-0.5 bg-surface-container rounded">
                        {prop.id}
                      </span>
                      <span className="font-medium text-on-surface truncate max-w-xs">
                        {prop.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-secondary">{prop.priceFormatted}</span>
                      <span className="font-caption text-caption bg-secondary-fixed/50 text-secondary px-2 py-0.5 rounded-full font-bold">
                        %{prop.matchScore || 90}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCatalogModal(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md"
                type="button"
              >
                Kapat
              </button>
              <button
                onClick={() => {
                  setShowCatalogModal(false);
                  handleSendCatalogClick();
                }}
                className="px-5 py-2 rounded-lg bg-secondary-container hover:bg-secondary text-on-secondary font-label-md font-semibold flex items-center gap-1.5"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>Şimdi Gönder</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

