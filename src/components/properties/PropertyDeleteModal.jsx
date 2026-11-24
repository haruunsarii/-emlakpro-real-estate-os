import React from 'react';
import ConfirmDeleteModal from '../ui/ConfirmDeleteModal';

export default function PropertyDeleteModal({
  isOpen,
  property,
  onClose,
  onConfirmDelete,
}) {
  if (!property) return null;

  return (
    <ConfirmDeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => onConfirmDelete(property.id)}
      title="İlanı Silmek İstediğinize Emin misiniz?"
      description={`${property.id} - "${property.title}" başlıklı portföy kaydı sistemden kalıcı olarak kaldırılacaktır.`}
      confirmLabel="Evet, İlanı Sil"
      icon="delete_forever"
      itemDetails={[
        { label: 'İlan Kodu:', value: property.id },
        { label: 'İlan Başlığı:', value: property.title },
        { label: 'Fiyat:', value: property.priceFormatted },
        { label: 'Konum:', value: property.location },
      ]}
    />
  );
}
