import React, { useState, memo } from 'react';

function CustomerDetailDrawer({
  customer,
  onAddAppointment,
  onAddNote,
  onSendPresentation,
  onScheduleShowing,
}) {
  const [quickNote, setQuickNote] = useState('');

  if (!customer) {
    return (
      <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg flex flex-col items-center justify-center text-center border border-surface-container min-h-[400px]">
        <span className="material-symbols-outlined text-[48px] text-outline mb-2">
          person_search
        </span>
        <h3 className="font-headline-sm text-on-surface font-bold">
          Müşteri Seçilmedi
        </h3>
        <p className="font-body-sm text-on-surface-variant max-w-xs mt-1">
          Detaylı profil, kriterler ve portföy eşleşmelerini görmek için tablodan bir müşteri seçin.
        </p>
      </div>
    );
  }

  const handleQuickNoteSubmit = (e) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    if (onAddNote) {
      onAddNote(customer.id, quickNote);
    }
    setQuickNote('');
  };

  return (
    <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-md p-space-md gap-space-md border border-surface-container-low transition-all">
      {/* 1. Customer Profile Header Card */}
      <div className="p-space-md bg-surface rounded-xl flex flex-col gap-space-sm relative border border-surface-container/60">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center font-bold shadow-sm">
              {customer.initials}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                  {customer.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-caption text-caption font-bold">
                  {customer.segment}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {customer.office} • Kayıt: {customer.registrationDate}
              </span>
            </div>
          </div>

          <button
            className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            title="Müşteri Profili Ayarları"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
        </div>

        {/* Quick Action Contact Bar */}
        <div className="grid grid-cols-4 gap-2 pt-space-xs">
          <a
            className="h-9 px-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 shadow-sm transition-all border border-surface-container"
            href={`tel:${customer.phone.replace(/[^0-9+]/g, '')}`}
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">
              call
            </span>
            <span>Ara</span>
          </a>

          <a
            className="h-9 px-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 shadow-sm transition-all border border-surface-container"
            href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">
              chat
            </span>
            <span>WhatsApp</span>
          </a>

          <a
            className="h-9 px-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 shadow-sm transition-all border border-surface-container"
            href={`mailto:${customer.email}`}
          >
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              mail
            </span>
            <span>E-posta</span>
          </a>

          <button
            onClick={() => onAddAppointment && onAddAppointment(customer)}
            className="h-9 px-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">
              calendar_add_on
            </span>
            <span>Randevu</span>
          </button>
        </div>
      </div>

      {/* 2. Preferences & Search Criteria Box */}
      {customer.criteria && (
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-semibold text-primary">
              Aktif Arama Kriterleri
            </span>
            <span className="font-caption text-caption text-secondary font-semibold cursor-pointer hover:underline">
              Talebi Düzenle
            </span>
          </div>

          <div className="p-space-sm bg-surface rounded-lg flex flex-col gap-2 border border-surface-container">
            <div className="grid grid-cols-2 gap-2 font-caption text-caption">
              <div>
                <span className="text-on-surface-variant block">Hedef Bölge:</span>
                <strong className="text-on-surface font-label-sm text-label-sm">
                  {customer.criteria.targetRegion}
                </strong>
              </div>
              <div>
                <span className="text-on-surface-variant block">Bütçe Kapasitesi:</span>
                <strong className="text-secondary font-label-sm text-label-sm">
                  {customer.criteria.budgetRange}
                </strong>
              </div>
              <div>
                <span className="text-on-surface-variant block">Tip &amp; Oda:</span>
                <span className="text-on-surface font-label-sm text-label-sm">
                  {customer.criteria.propertyType}
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block">Tapu &amp; Kredi:</span>
                <span className="text-on-surface font-label-sm text-label-sm">
                  {customer.criteria.deedType}
                </span>
              </div>
            </div>

            {customer.criteria.tags && customer.criteria.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1 border-t border-surface-container/60">
                {customer.criteria.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-caption text-caption"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Matched Properties Highlight (Mini Cards) */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-label-md text-label-md font-semibold text-primary">
              Önerilen Portföy Eşleşmeleri
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-secondary text-white font-caption text-[10px] font-bold">
              {customer.matchedProperties ? customer.matchedProperties.length : 0} Uygun
            </span>
          </div>
          <span className="font-caption text-caption text-on-surface-variant">
            Skor: %96 Uyum
          </span>
        </div>

        {customer.matchedProperties && customer.matchedProperties.length > 0 ? (
          <div className="flex flex-col gap-2">
            {customer.matchedProperties.map((prop) => (
              <div
                key={prop.id}
                className="p-2.5 bg-surface rounded-xl flex gap-space-sm items-center hover:bg-surface-container transition-colors group border border-surface-container/60 cursor-pointer"
              >
                <div
                  className="w-20 h-20 rounded-lg bg-cover bg-center shrink-0 border border-surface-container"
                  style={{ backgroundImage: `url('${prop.image}')` }}
                />

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-caption text-caption text-secondary font-bold">
                      {prop.id}
                    </span>
                    <span className="font-label-sm text-label-sm font-bold text-primary">
                      {prop.priceFormatted}
                    </span>
                  </div>

                  <h3 className="font-label-md text-label-md text-on-surface font-semibold truncate group-hover:text-secondary">
                    {prop.title}
                  </h3>

                  <span className="font-caption text-caption text-on-surface-variant mt-0.5 truncate">
                    {prop.details}
                  </span>

                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => onSendPresentation && onSendPresentation(prop, customer)}
                      className="font-caption text-caption text-primary hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        send
                      </span>
                      Sunum Gönder
                    </button>
                    <span className="text-on-surface-variant font-caption">•</span>
                    <button
                      onClick={() => onScheduleShowing && onScheduleShowing(prop, customer)}
                      className="font-caption text-caption text-secondary hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        location_on
                      </span>
                      Yer Gösterimi
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-surface rounded-lg text-center text-on-surface-variant font-caption border border-surface-container">
            Bu müşteri kriterlerine tam uyan yeni ilan aranıyor.
          </div>
        )}
      </div>

      {/* 4. Activity & Communication Timeline */}
      <div className="flex flex-col gap-space-xs pt-space-xs">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md font-semibold text-primary">
            İletişim &amp; Aktivite Geçmişi
          </span>
          <button
            onClick={() => {
              const note = prompt('Yeni görüşme notu girin:');
              if (note && onAddNote) onAddNote(customer.id, note);
            }}
            className="font-caption text-caption text-secondary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[14px]">
              add_comment
            </span>
            Not Ekle
          </button>
        </div>

        <div className="relative pl-4 flex flex-col gap-3 font-caption text-caption before:content-[''] before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container">
          {customer.timeline && customer.timeline.length > 0 ? (
            customer.timeline.map((item) => (
              <div key={item.id} className="relative flex flex-col">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    item.bulletBg || 'bg-secondary'
                  } absolute -left-[17px] top-1 ring-2 ring-surface-container-lowest`}
                />
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm font-semibold text-primary">
                    {item.title}
                  </span>
                  <span className="text-on-surface-variant">{item.date}</span>
                </div>
                <p className="text-on-surface mt-0.5 font-body-sm text-body-sm leading-snug">
                  {item.notes}
                </p>
                {item.advisor && (
                  <span className="text-on-surface-variant mt-1">
                    Danışman: {item.advisor}
                  </span>
                )}
              </div>
            ))
          ) : (
            <span className="text-outline">Henüz aktivite kaydı bulunmuyor.</span>
          )}
        </div>
      </div>

      {/* 5. Quick Log Action Input */}
      <form onSubmit={handleQuickNoteSubmit} className="pt-space-xs">
        <div className="relative flex items-center">
          <input
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            className="w-full h-10 pl-3 pr-10 bg-surface rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/20 border border-surface-container"
            placeholder={`${customer.name} için hızlı not veya görüşme özeti ekleyin...`}
            type="text"
          />
          <button
            className="absolute right-1 w-8 h-8 rounded-md bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-colors cursor-pointer"
            title="Kaydet"
            type="submit"
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default memo(CustomerDetailDrawer);

