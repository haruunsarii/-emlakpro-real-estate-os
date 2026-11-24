import React, { useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import EmptyState from '../ui/EmptyState';
import { useLocalStorage } from '../../hooks/useLocalStorage';

function RecentPropertiesList({ onSelectProperty }) {
  const navigate = useNavigate();
  const [properties] = useLocalStorage('emlakpro_properties_v1', []);

  const displayProperties = useMemo(() => {
    if (Array.isArray(properties) && properties.length > 0) {
      return properties.slice(0, 4);
    }
    return [];
  }, [properties]);

  const totalCount = Array.isArray(properties) ? properties.length : 0;

  return (
    <div className="flex flex-col gap-space-md">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Son Eklenen Gayrimenkul Portföyleri
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-surface-container font-caption text-caption text-secondary font-bold">
            {totalCount} İlan
          </span>
        </div>

        <button
          onClick={() => navigate('/gayrimenkuller')}
          className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary hover:text-primary font-medium transition-colors"
          type="button"
        >
          <span>Tümünü Gör ({totalCount})</span>
          <span className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </button>
      </div>

      {/* Cards Stack */}
      <div className="flex flex-col gap-space-sm">
        {displayProperties.length === 0 ? (
          <EmptyState
            type="empty"
            compact
            title="Henüz Portföy Eklenmemiş"
            description="Sisteme yeni bir gayrimenkul portföyü ekleyerek başlayabilirsiniz."
            actionLabel="Yeni Portföy Ekle"
            onAction={() => navigate('/gayrimenkuller')}
          />
        ) : (
          displayProperties.map((prop, idx) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              index={idx}
              isPriority={idx === 0}
              onSelect={onSelectProperty}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default memo(RecentPropertiesList);
