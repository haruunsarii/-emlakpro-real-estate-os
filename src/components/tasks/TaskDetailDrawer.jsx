import React, { useState } from 'react';
import BaseDrawer from '../ui/BaseDrawer';

export default function TaskDetailDrawer({
  appointment,
  isOpen = true,
  onClose,
  onEdit,
  onDelete,
  onSendLocationWhatsapp,
  onAddNote,
  isDrawerMode = false, // if true, renders with BaseDrawer overlay
}) {
  const [newNoteText, setNewNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const emptyAppointmentContent = (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-space-lg text-center flex flex-col items-center justify-center min-h-[300px]">
      <span className="material-symbols-outlined text-[48px] text-outline mb-2">
        event_upcoming
      </span>
      <h4 className="font-label-md text-sm font-bold text-primary">
        Henüz Randevu Seçilmedi
      </h4>
      <p className="font-caption text-xs text-on-surface-variant max-w-xs mt-1">
        Detayları, müşteri bilgilerini ve konum aksiyonlarını görüntülemek için takvimden bir randevuya tıklayın.
      </p>
    </div>
  );

  if (!appointment) {
    if (isDrawerMode) {
      if (!isOpen) return null;
      return (
        <BaseDrawer
          isOpen={isOpen}
          onClose={onClose}
          width="sm"
          title="Randevu Detayı"
          ariaLabel="Randevu Detayı"
          contentClassName="p-4"
        >
          {emptyAppointmentContent}
        </BaseDrawer>
      );
    }
    return emptyAppointmentContent;
  }

  const handleWhatsappLocation = () => {
    if (onSendLocationWhatsapp) {
      onSendLocationWhatsapp(appointment);
      return;
    }
    const phone = appointment.clientPhone?.replace(/[^0-9]/g, '') || '905329842100';
    const loc = appointment.location || 'Kadıköy, İstanbul';
    const msg = encodeURIComponent(
      `Merhaba ${appointment.clientName || 'Sayın Müşterimiz'},\n\n` +
      `Bugünkü "${appointment.title}" randevumuz için konum bilgisi:\n📍 ${loc}\n\n` +
      `Görüşmek üzere, EmlakPro Danışmanınız ${appointment.advisorName || 'Danışman'}.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const handleSaveNote = () => {
    if (!newNoteText.trim()) return;
    if (onAddNote) {
      onAddNote(appointment.id, newNoteText);
    }
    setNewNoteText('');
    setShowNoteInput(false);
  };

  const content = (
    <div className="bg-surface-container-lowest rounded-xl shadow-md border border-surface-container overflow-hidden flex flex-col">
      {/* 1. Hero Görsel Başlığı */}
      <div className="relative h-32 bg-surface-container overflow-hidden">
        <img
          src={
            appointment.propertyImage ||
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
          }
          alt={appointment.title}
          width="400"
          height="128"
          decoding="async"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-transparent" />

        {/* Üst Rozet & Kapat Butonu (Drawer Modunda) */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <span className="bg-secondary-container text-white font-caption text-[11px] px-2.5 py-0.5 rounded-full font-bold shadow-xs">
            Seçili Randevu Detayı
          </span>
          {isDrawerMode && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
              aria-label="Randevu Kartını Kapat"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Görsel İçi Başlık Bilgisi */}
        <div className="absolute bottom-2.5 left-3 right-3 text-white">
          <span className="font-caption text-[10px] uppercase tracking-wider font-semibold text-secondary-fixed block">
            {appointment.date} • {appointment.startTime} - {appointment.endTime}
          </span>
          <h3 className="font-label-md text-sm font-bold leading-tight text-white truncate">
            {appointment.title}
          </h3>
        </div>
      </div>

      {/* 2. Detay Kartı Gövdesi */}
      <div className="p-space-md flex flex-col gap-space-sm">
        {/* Gayrimenkul Özet Şeridi */}
        {appointment.propertyId && (
          <div className="flex items-center justify-between p-space-xs bg-surface-container-low rounded-lg border border-surface-container">
            <div className="flex flex-col min-w-0">
              <span className="font-caption text-[11px] text-on-surface-variant font-medium">
                İlgili Portföy: <span className="font-mono font-bold text-primary">{appointment.propertyId}</span>
              </span>
              <span className="font-label-md text-sm font-extrabold text-primary">
                {appointment.propertyPrice || '₺28.500.000'}
              </span>
            </div>
            <div className="text-right">
              <span className="font-caption text-[10px] text-outline block">Tip &amp; Alan</span>
              <span className="font-caption text-xs font-semibold text-on-surface">
                {appointment.propertySpecs || '4+1 • 260 m² • 8. Kat'}
              </span>
            </div>
          </div>
        )}

        {/* Müşteri İletişim Kartı */}
        <div className="p-space-xs rounded-lg bg-surface-container-low/60 border border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
              {appointment.clientName?.charAt(0) || 'M'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-xs font-bold text-primary truncate">
                {appointment.clientName || 'İsimsiz Müşteri'}
              </span>
              <span className="font-caption text-[10px] text-on-surface-variant truncate">
                {appointment.clientRole || 'Kadıköy Şube VIP Müşteri'}
              </span>
              <span className="font-caption text-[11px] font-mono text-outline">
                {appointment.clientPhone || '+90 532 984 21 00'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {appointment.clientPhone && (
              <>
                <a
                  href={`tel:${appointment.clientPhone}`}
                  className="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary flex items-center justify-center transition-colors"
                  title="Müşteriyi Ara"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                </a>
                <a
                  href={`https://wa.me/${appointment.clientPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors"
                  title="WhatsApp'tan Yaz"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Danışman & Konum Bilgisi */}
        <div className="flex flex-col gap-1 text-xs font-caption text-on-surface-variant">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">badge</span>
            <span>Atanan Danışman: <strong className="text-primary">{appointment.advisorName}</strong></span>
          </div>

          {appointment.location && (
            <div className="flex items-start justify-between gap-2 mt-1">
              <div className="flex items-start gap-1.5 flex-1 min-w-0">
                <span className="material-symbols-outlined text-[16px] text-rose-600 shrink-0 mt-0.5">
                  location_on
                </span>
                <span className="text-on-surface leading-tight">
                  {appointment.location}
                </span>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(appointment.location)}`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-secondary hover:underline shrink-0 font-semibold"
              >
                Haritada Aç
              </a>
            </div>
          )}
        </div>

        {/* Notlar & Hazırlık Bölümü */}
        <div className="p-space-xs rounded-lg bg-amber-50/60 border border-amber-200/60 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-caption text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">sticky_note_2</span>
              Notlar &amp; Hazırlık
            </span>
            <button
              type="button"
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="text-[10px] text-amber-800 font-bold hover:underline cursor-pointer"
            >
              {showNoteInput ? 'İptal' : '+ Not Ekle'}
            </button>
          </div>
          <p className="font-caption text-[11px] text-amber-950 leading-relaxed">
            {appointment.notes || 'Site güvenliğine ziyaretçi bildirimi yapılacak ve anahtar temin edilecek.'}
          </p>

          {/* Yeni Not Girişi */}
          {showNoteInput && (
            <div className="mt-2 flex flex-col gap-1.5 pt-2 border-t border-amber-200">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Randevuyla ilgili yeni not yazın..."
                rows={2}
                className="w-full text-xs p-1.5 rounded border border-amber-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => setShowNoteInput(false)}
                  className="px-2 py-0.5 text-[10px] text-on-surface-variant hover:bg-black/5 rounded cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="px-2.5 py-0.5 text-[10px] bg-amber-600 text-white rounded font-bold hover:bg-amber-700 cursor-pointer"
                >
                  Kaydet
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Aksiyon Butonları Grubu */}
        <div className="flex flex-col gap-2 pt-2 border-t border-surface-container">
          {/* WhatsApp Konum Gönder Hero Butonu */}
          <button
            type="button"
            onClick={handleWhatsappLocation}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-label-sm text-xs rounded-lg font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">share_location</span>
            <span>WhatsApp ile Konum Gönder</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onEdit && onEdit(appointment)}
              className="py-1.5 px-2 bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-xs rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Düzenle</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete && onDelete(appointment)}
              className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-label-sm text-xs rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              <span>İptal / Sil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isDrawerMode) {
    if (!isOpen) return null;
    return (
      <BaseDrawer
        isOpen={isOpen}
        onClose={onClose}
        width="sm"
        title="Randevu Detayı"
        ariaLabel={`Randevu Detayı: ${appointment.title}`}
        contentClassName="p-4"
      >
        {content}
      </BaseDrawer>
    );
  }

  return content;
}
