import React from 'react';

export default function MatchScore({
  overallScore = 96,
  scoring = { budget: 100, location: 100, area: 95, building: 90 },
}) {
  const criteriaList = [
    { label: 'Bütçe Uyumu', val: scoring?.budget ?? 90 },
    { label: 'Lokasyon', val: scoring?.location ?? 90 },
    { label: 'm² & Oda', val: scoring?.area ?? 85 },
    { label: 'Bina Yaşı / Otopark', val: scoring?.building ?? 80 },
  ];

  return (
    <div className="bg-surface p-space-md rounded-xl flex flex-col gap-space-sm border border-surface-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[20px]">
            auto_awesome
          </span>
          <span>Kriter Uygunluk Analizi (Algoritmik Ağırlık)</span>
        </span>
        <span className="font-headline-sm text-headline-sm text-secondary font-bold">
          %{overallScore} Genel Skor
        </span>
      </div>

      {/* 4 Score Progress Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
        {criteriaList.map((item, idx) => (
          <div key={idx} className="bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container/60 shadow-2xs">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-caption text-caption text-on-surface-variant font-medium text-[11px]">
                {item.label}
              </span>
              <span className="font-caption text-caption font-bold text-secondary">
                %{item.val}
              </span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-secondary-container h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${item.val}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

