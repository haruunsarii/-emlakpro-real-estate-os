import React from 'react';
import ConfirmDeleteModal from '../ui/ConfirmDeleteModal';

export default function TaskDeleteModal({
  isOpen = false,
  onClose,
  onConfirm,
  item = null,
}) {
  if (!item) return null;

  const isAppointment = item.type === 'appointment';
  const title = isAppointment ? 'Randevuyu Sil' : 'Görevi Sil';
  const itemTitle = item.data?.title || 'Bu öğe';

  const itemDetails = [
    { label: isAppointment ? 'Randevu Başlığı:' : 'Görev Tanımı:', value: itemTitle },
    ...(isAppointment
      ? [
          {
            label: 'Tarih & Saat:',
            value: `${item.data?.date || ''} • ${item.data?.startTime || ''} - ${item.data?.endTime || ''}`,
          },
        ]
      : [
          {
            label: 'Atanan & Son Tarih:',
            value: `${item.data?.assignedTo || ''} • ${item.data?.dueDate || ''}`,
          },
        ]),
  ];

  return (
    <ConfirmDeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      description="Bu işlem geri alınamaz."
      confirmLabel="Evet, Sil"
      icon="delete_forever"
      itemDetails={itemDetails}
    >
      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200/60 flex items-start gap-2 text-xs text-amber-900 mt-1">
        <span className="material-symbols-outlined text-[18px] text-amber-700 shrink-0 mt-0.5">
          info
        </span>
        <p className="leading-snug">
          <strong>Güvenli Silme:</strong> Bu kaydı sildiğinizde, varsa ilişkili <strong>müşteri</strong> veya <strong>portföy</strong> kayıtları sistemden silinmez; yalnızca bu ajanda kaydı kaldırılır.
        </p>
      </div>
    </ConfirmDeleteModal>
  );
}
