import React from 'react';
import { useNavigate } from 'react-router-dom';
import DealActivityTimeline from './DealActivityTimeline';
import BaseDrawer from '../ui/BaseDrawer';

export default function DealDetailDrawer({
  isOpen,
  deal,
  stages = [],
  onClose,
  onEditDeal,
  onDeleteDeal,
  onMoveStage,
  onAddActivityNote,
}) {
  const navigate = useNavigate();

  if (!isOpen || !deal) return null;

  const currentStageIndex = stages.findIndex((s) => s.id === deal.stage);
  const currentStage = stages[currentStageIndex] || stages[0] || { title: 'Yeni Fırsat', dotColor: 'bg-secondary' };

  const customHeader = (
    <div className="p-space-lg flex flex-col gap-3 bg-surface-container-low/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-caption text-caption bg-surface-container px-2.5 py-0.5 rounded font-mono font-bold text-secondary">
            {deal.id}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full font-caption text-caption font-semibold ${
              deal.type === 'Satılık'
                ? 'bg-secondary-fixed text-on-secondary-fixed'
                : 'bg-surface-container text-on-surface'
            }`}
          >
            {deal.type}
          </span>
          <span className="flex items-center gap-1 font-caption text-caption bg-surface-container px-2.5 py-0.5 rounded-full font-medium text-on-surface">
            <span className={`w-2 h-2 rounded-full ${currentStage.dotColor || 'bg-secondary'}`} />
            {currentStage.title}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          type="button"
          aria-label="Çekmeceyi Kapat"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-headline-sm text-headline-sm text-primary font-bold truncate">
            {deal.title}
          </h2>
          <span className="font-body-sm text-body-sm text-on-surface-variant block truncate">
            Sorumlu Danışman: <strong className="text-on-surface">{deal.advisor || 'Burak Yılmaz'}</strong> • Kayıt Tarihi: {deal.createdDate || 'Bugün'}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onEditDeal && onEditDeal(deal)}
            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center gap-1 transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            <span>Düzenle</span>
          </button>
          <button
            onClick={() => onDeleteDeal && onDeleteDeal(deal)}
            className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/30 transition-all cursor-pointer"
            title="Fırsatı Sil"
            aria-label="Fırsatı Sil"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  );

  const drawerFooter = (
    <div className="flex items-center justify-between">
      <span className="font-caption text-caption text-on-surface-variant">
        Durum: <strong className="text-on-surface">{deal.priority || 'Normal'} Öncelikli</strong>
      </span>
      <button
        onClick={onClose}
        className="px-5 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold transition-all cursor-pointer"
        type="button"
      >
        Kapat
      </button>
    </div>
  );

  return (
    <BaseDrawer
      isOpen={isOpen}
      onClose={onClose}
      customHeader={customHeader}
      ariaLabel={`Fırsat Detayı: ${deal.title || deal.id}`}
      width="xl"
      footer={drawerFooter}
      footerClassName="p-space-md border-t border-surface-container bg-surface-container-low/40"
      contentClassName="p-space-lg flex flex-col gap-space-lg"
    >
      {/* 1. Stage Progression Wizard */}
      <div className="p-space-md rounded-xl bg-surface border border-surface-container flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm font-bold text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[18px]">
              linear_scale
            </span>
            <span>Satış Hunisi Aşaması</span>
          </span>
          <span className="font-caption text-caption text-secondary font-bold">
            Aşama {currentStageIndex + 1} / {stages.length}
          </span>
        </div>

        {/* Stage Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {stages.map((stage, idx) => {
            const isSelected = stage.id === deal.stage;
            const isPassed = idx < currentStageIndex;
            return (
              <button
                key={stage.id}
                onClick={() => onMoveStage && onMoveStage(deal.id, stage.id)}
                className={`p-2 rounded-lg text-left text-caption font-caption transition-all flex items-center justify-between gap-1 border cursor-pointer ${
                  isSelected
                    ? 'bg-primary-container text-on-primary font-bold border-primary shadow-xs'
                    : isPassed
                    ? 'bg-secondary-fixed/30 text-secondary border-secondary/30 font-medium'
                    : 'bg-surface-container-lowest text-on-surface-variant border-surface-container hover:bg-surface-container'
                }`}
                type="button"
              >
                <span className="truncate">{stage.title}</span>
                {isSelected && (
                  <span className="material-symbols-outlined text-[14px]">check</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Customer & Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {/* Customer Box */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold">
              Müşteri Profili
            </span>
            <span className="font-caption text-caption bg-surface-container text-secondary px-2 py-0.5 rounded font-medium">
              {deal.customerRole || 'Müşteri'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-secondary-fixed/50 flex items-center justify-center font-bold text-secondary text-headline-sm shrink-0">
              {deal.customerInitials || 'SV'}
            </div>
            <div className="flex flex-col min-w-0">
              <h4 className="font-label-md text-label-md font-bold text-on-surface truncate">
                {deal.customerName}
              </h4>
              <span className="font-caption text-caption text-on-surface-variant truncate">
                {deal.customerPhone}
              </span>
              <span className="font-caption text-caption text-on-surface-variant truncate">
                {deal.customerEmail || 'E-posta kayıtlı değil'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-surface-container">
            <a
              href={`https://wa.me/${(deal.customerPhone || '905338194420').replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-center font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">chat</span>
              <span>WhatsApp</span>
            </a>
            <a
              href={`tel:${deal.customerPhone || '+905338194420'}`}
              className="flex-1 py-1.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-center font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
              <span>Ara</span>
            </a>
          </div>
        </div>

        {/* Portfolio Box */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold">
              İlgili Gayrimenkul
            </span>
            <span className="font-caption text-caption bg-primary-container text-on-primary px-2 py-0.5 rounded font-mono font-bold">
              {deal.propertyId || 'PORT-XXXX'}
            </span>
          </div>

          <div>
            <h4 className="font-label-md text-label-md font-bold text-primary line-clamp-1">
              {deal.propertyTitle || deal.title}
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[16px] text-outline">location_on</span>
              <span className="truncate">{deal.propertyLocation || 'Kadıköy, İstanbul'}</span>
            </p>
            <div className="flex items-center gap-2 mt-2 font-caption text-caption text-secondary font-bold">
              <span>{deal.propertyType || 'Daire'}</span>
              <span>•</span>
              <span>{deal.amountFormatted || '₺28.500.000'}</span>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              navigate('/gayrimenkuller');
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary font-label-sm font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            type="button"
          >
            <span>Portföy İlanına Git</span>
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </button>
        </div>
      </div>

      {/* 3. Financial Box */}
      <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <span className="font-caption text-[11px] text-on-surface-variant uppercase tracking-wider block font-semibold">
            İşlem / Fırsat Tutarı
          </span>
          <span className="font-currency-stat text-currency-stat text-primary font-bold">
            {deal.amountFormatted || `₺${Number(deal.amount || 0).toLocaleString('tr-TR')}`}
          </span>
        </div>

        <div>
          <span className="font-caption text-[11px] text-on-surface-variant uppercase tracking-wider block font-semibold">
            Komisyon Oranı
          </span>
          <span className="font-currency-stat text-currency-stat text-on-surface font-bold">
            %{deal.commissionRate || 2}
          </span>
        </div>

        <div>
          <span className="font-caption text-[11px] text-on-surface-variant uppercase tracking-wider block font-semibold">
            Tahmini Hizmet Bedeli
          </span>
          <span className="font-currency-stat text-currency-stat text-secondary font-bold">
            {deal.commissionFormatted || `₺${Number(deal.commission || 0).toLocaleString('tr-TR')}`}
          </span>
        </div>
      </div>

      {/* 4. Next Follow-Up Action */}
      <div className="p-space-md rounded-xl bg-surface border border-surface-container flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[22px]">event_upcoming</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm font-bold text-primary">
              Bir Sonraki Takip &amp; Randevu
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {deal.nextAction || 'Takip planlanmadı'} • Tarih: <strong>{deal.nextActionDate || 'Belirtilmedi'}</strong>
            </span>
          </div>
        </div>

        {deal.isUrgent && (
          <span className="px-2.5 py-1 rounded-full font-caption text-caption bg-error-container text-error font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            <span>Acil İlgilen</span>
          </span>
        )}
      </div>

      {/* 5. Activity History & Timeline */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              history
            </span>
            <span>Görüşme Geçmişi &amp; Aktivite Günlüğü</span>
          </span>
          <span className="font-caption text-caption text-on-surface-variant">
            {deal.activities?.length || 0} Kayıt
          </span>
        </div>

        <DealActivityTimeline
          activities={deal.activities || []}
          onAddNote={(text) => onAddActivityNote && onAddActivityNote(deal.id, text)}
          dealAdvisor={deal.advisor}
        />
      </div>
    </BaseDrawer>
  );
}
