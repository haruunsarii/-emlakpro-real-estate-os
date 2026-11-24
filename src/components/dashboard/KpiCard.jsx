import React, { memo } from 'react';

function KpiCard({ item }) {
  const { title, value, trend, subtext, icon, progress, progressColor } = item;

  return (
    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-sm relative overflow-hidden group border border-surface-container-low">
      {/* Card Header: Title & Icon */}
      <div className="flex items-center justify-between">
        <span className="font-caption text-caption uppercase text-on-surface-variant tracking-wider font-semibold text-[11px]">
          {title}
        </span>
        <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-secondary-container transition-colors">
          <span className="material-symbols-outlined text-[20px]">
            {icon}
          </span>
        </div>
      </div>

      {/* Card Value & Trend/Subtext */}
      <div>
        <div className="font-currency-stat text-currency-stat text-on-surface tracking-tight font-bold">
          {value}
        </div>
        {trend ? (
          <div className="flex items-center gap-1.5 mt-1 font-label-sm text-label-sm text-secondary font-medium">
            <span className="material-symbols-outlined text-[16px]">
              {icon === 'groups' ? 'arrow_upward' : 'trending_up'}
            </span>
            <span>{trend}</span>
          </div>
        ) : subtext ? (
          <div className="flex items-center gap-1.5 mt-1 font-label-sm text-label-sm text-on-surface-variant">
            {subtext.includes('komisyon') ? (
              <>
                <span className="text-secondary font-semibold">
                  {subtext.replace('komisyon', '').trim()}
                </span>
                <span className="font-normal text-on-surface-variant text-[11px]">komisyon</span>
              </>
            ) : (
              <>
                <span className="text-on-surface font-semibold">{subtext.split(' ')[0]}</span>
                <span className="text-outline text-[12px]">{subtext.substring(subtext.indexOf(' ') + 1)}</span>
              </>
            )}
          </div>
        ) : null}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-1">
        <div
          className={`${progressColor || 'bg-secondary'} h-full rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default memo(KpiCard);

