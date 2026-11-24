import React, { useState } from 'react';

export default function DealActivityTimeline({
  activities = [],
  onAddNote,
  dealAdvisor = 'Burak Yılmaz',
}) {
  const [noteText, setNoteText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    if (onAddNote) {
      onAddNote(noteText.trim());
    }
    setNoteText('');
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'stage_change':
        return { icon: 'alt_route', color: 'text-secondary bg-secondary-fixed/50' };
      case 'offer':
        return { icon: 'send', color: 'text-primary bg-primary-container/20' };
      case 'showing':
        return { icon: 'pin_drop', color: 'text-surface-tint bg-surface-container' };
      case 'contract':
        return { icon: 'description', color: 'text-primary bg-primary/10' };
      case 'won':
        return { icon: 'verified', color: 'text-emerald-600 bg-emerald-100' };
      case 'lost':
        return { icon: 'cancel', color: 'text-error bg-error-container/40' };
      case 'warning':
        return { icon: 'warning', color: 'text-error bg-error-container/30' };
      default:
        return { icon: 'chat', color: 'text-on-surface-variant bg-surface-container' };
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Add note input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Müşteri görüşmesi, teklif veya randevu notu ekle..."
          className="flex-1 h-10 px-3 bg-surface text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:border-secondary transition-all"
        />
        <button
          type="submit"
          disabled={!noteText.trim()}
          className="px-4 h-10 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-all disabled:opacity-50 shrink-0 flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Not Ekle</span>
        </button>
      </form>

      {/* Timeline List */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container mt-2 max-h-72 overflow-y-auto pr-1">
        {activities.length === 0 ? (
          <p className="text-caption text-on-surface-variant text-center py-4">
            Henüz aktivite veya görüşme kaydı bulunmuyor.
          </p>
        ) : (
          activities.map((act, index) => {
            const config = getEventIcon(act.type);
            return (
              <div key={act.id || index} className="relative flex items-start gap-2.5">
                {/* Node Dot */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 absolute -left-6 top-0.5 shadow-2xs ${config.color}`}
                >
                  <span className="material-symbols-outlined text-[12px]">{config.icon}</span>
                </div>

                {/* Content Box */}
                <div className="bg-surface p-2.5 rounded-lg border border-surface-container/60 w-full text-body-sm">
                  <div className="flex items-center justify-between text-caption text-[11px] text-on-surface-variant mb-1">
                    <span className="font-semibold text-primary">{act.author || dealAdvisor}</span>
                    <span>{act.date || 'Az önce'}</span>
                  </div>
                  <p className="text-on-surface text-[13px]">{act.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

