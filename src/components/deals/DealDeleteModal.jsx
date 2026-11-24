import React from 'react';
import ConfirmDeleteModal from '../ui/ConfirmDeleteModal';

export default function DealDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  deal,
}) {
  if (!deal) return null;

  return (
    <ConfirmDeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => onConfirm(deal.id)}
      title="Fırsatı Silmek İstiyor Musunuz?"
      description="İşlem satış hunisinden kalıcı olarak kaldırılır."
      confirmLabel="Evet, Fırsatı Sil"
      icon="warning"
      itemDetails={[
        { label: 'Fırsat Kodu:', value: deal.id },
        { label: 'Fırsat:', value: deal.title },
        { label: 'Müşteri:', value: deal.customerName },
        {
          label: 'Tutar:',
          value: deal.amountFormatted || `₺${Number(deal.amount || 0).toLocaleString('tr-TR')}`,
        },
      ]}
    >
      <div className="p-3 rounded-lg bg-surface-container-low text-[12px] text-on-surface-variant flex items-start gap-2 border border-surface-container mt-1">
        <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">
          verified_user
        </span>
        <span>
          <strong>Güvenli Silme:</strong> Bu işlem yalnızca bu satış sürecini huniden siler. Sistemdeki <strong>{deal.customerName}</strong> müşteri kartı ve ilgili <strong>{deal.propertyId}</strong> gayrimenkul kaydı <strong>kesinlikle silinmez</strong>.
        </span>
      </div>
    </ConfirmDeleteModal>
  );
}
