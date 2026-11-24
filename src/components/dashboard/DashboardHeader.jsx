import React, { memo } from 'react';
import { useAuth } from '../../hooks/useAuth';

function DashboardHeader({ onActionClick }) {
  const { currentUser } = useAuth();
  const displayName = currentUser?.name?.trim() || 'Değerli Kullanıcımız';

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
      {/* Title & Live Status */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-sm flex-wrap">
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
            Genel Bakış Dashboard
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-caption text-caption bg-surface-container-high text-secondary font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            Canlı Akış
          </span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Hoş geldiniz, <strong className="font-semibold text-on-surface">{displayName}</strong>, bugünkü gayrimenkul portföyünüz ve işlem hareketleriniz.
        </p>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center flex-wrap gap-2 sm:gap-space-sm w-full lg:w-auto">
        <button
          onClick={() => onActionClick && onActionClick('musteri')}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container-low transition-all border border-surface-container cursor-pointer whitespace-nowrap"
          type="button"
        >
          <span className="material-symbols-outlined text-[19px] text-on-surface-variant">
            person_add
          </span>
          <span>Müşteri Ekle</span>
        </button>

        <button
          onClick={() => onActionClick && onActionClick('randevu')}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container-low transition-all border border-surface-container cursor-pointer whitespace-nowrap"
          type="button"
        >
          <span className="material-symbols-outlined text-[19px] text-on-surface-variant">
            calendar_add_on
          </span>
          <span>Randevu Oluştur</span>
        </button>

        <button
          onClick={() => onActionClick && onActionClick('portfoy')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-container text-on-secondary-container font-label-md text-label-md shadow-md hover:bg-primary transition-all font-semibold cursor-pointer whitespace-nowrap"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">
            add_home_work
          </span>
          <span>Portföy Ekle</span>
        </button>
      </div>
    </div>
  );
}

export default memo(DashboardHeader);

