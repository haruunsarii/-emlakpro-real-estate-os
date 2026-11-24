import React from 'react';
import ConfirmDeleteModal from '../ui/ConfirmDeleteModal';

export default function RequestDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  demand,
}) {
  if (!demand) return null;

  return (
    <ConfirmDeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => onConfirm(demand.id)}
      title="Talebi Silmek İstiyor Musunuz?"
      description="İşlem geri alınamaz."
      confirmLabel="Evet, Talebi Sil"
      icon="warning"
      itemDetails={[
        { label: 'Talep Kodu:', value: demand.id },
        { label: 'Müşteri:', value: demand.clientName },
        {
          label: 'Bölge / Bütçe:',
          value: `${demand.targetRegion || demand.district || ''} • ${demand.budget || ''}`,
        },
      ]}
    >
      <div className="p-3 rounded-lg bg-surface-container-low text-[12px] text-on-surface-variant flex items-start gap-2 border border-surface-container mt-1">
        <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">
          info
        </span>
        <span>
          <strong>Güvenli Silme:</strong> Bu işlem yalnızca talep kaydını ve eşleştirme ilişkisini siler. Sistemdeki müşteri profili ve portföy gayrimenkulleri <strong>kesinlikle silinmez</strong>.
        </span>
      </div>
    </ConfirmDeleteModal>
  );
}
