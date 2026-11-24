import React, { memo } from 'react';

function PropertyListView({
  properties,
  onOpenDetail,
  onEdit,
  onDelete,
  onSendPdf,
  onShareWhatsapp,
  onToggleBookmark,
  bookmarkedIds = [],
  bookmarkedSet,
}) {
  if (properties.length === 0) {
    return null;
  }

  const isIdBookmarked = (id) => (bookmarkedSet ? bookmarkedSet.has(id) : bookmarkedIds.includes(id));

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-low overflow-hidden">
      {/* Desktop Table View (md and up) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low text-on-surface-variant font-caption text-caption uppercase tracking-wider select-none border-b border-surface-container">
            <tr>
              <th className="py-3 px-4">Portföy / Görsel</th>
              <th className="py-3 px-4">Tür &amp; Kategori</th>
              <th className="py-3 px-4">Konum</th>
              <th className="py-3 px-4">Fiyat &amp; Birim</th>
              <th className="py-3 px-4">Ölçü &amp; Oda</th>
              <th className="py-3 px-4">Danışman</th>
              <th className="py-3 px-4">CRM Eşleşme</th>
              <th className="py-3 px-4 text-right">Aksiyonlar</th>
            </tr>
          </thead>
          <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-surface-container-low">
            {properties.map((prop, idx) => {
              const isBookmarked = isIdBookmarked(prop.id);
              const thumb = prop.gallery?.[0]?.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300';

              return (
                <tr
                  key={prop.id}
                  onClick={() => onOpenDetail(prop)}
                  className="hover:bg-surface-container/60 cursor-pointer transition-colors group"
                >
                  {/* Photo & Title */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                        <img
                          src={thumb}
                          alt={prop.title}
                          width="64"
                          height="48"
                          loading={idx < 6 ? 'eager' : 'lazy'}
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300';
                          }}
                        />
                      </div>
                      <div className="flex flex-col min-w-0 max-w-xs">
                        <span className="font-label-md text-label-md font-semibold text-primary group-hover:text-secondary truncate">
                          {prop.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono font-bold text-[11px] text-secondary">
                            {prop.id}
                          </span>
                          <span className="text-on-surface-variant font-caption text-[11px]">
                            {prop.buildingAge}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Tür & Kategori */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption font-semibold w-max ${prop.type === 'Kiralık'
                            ? 'bg-primary-container text-on-primary'
                            : 'bg-secondary text-on-secondary'
                          }`}
                      >
                        {prop.type}
                      </span>
                      <span className="font-caption text-caption text-on-surface-variant">
                        {prop.category}
                      </span>
                    </div>
                  </td>

                  {/* Konum */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm font-medium text-on-surface">
                        {prop.district}
                      </span>
                      <span className="font-caption text-caption text-on-surface-variant">
                        {prop.neighborhood || prop.location}
                      </span>
                    </div>
                  </td>

                  {/* Fiyat & Birim */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-bold text-primary">
                        {prop.priceFormatted}
                      </span>
                      <span className="font-caption text-caption text-on-surface-variant">
                        {prop.unitPrice}
                      </span>
                    </div>
                  </td>

                  {/* Ölçü & Oda */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm font-medium text-on-surface">
                        {prop.netArea ? `${prop.netArea} m²` : prop.area}
                      </span>
                      <span className="font-caption text-caption text-on-surface-variant">
                        {prop.rooms} • {prop.floor}
                      </span>
                    </div>
                  </td>

                  {/* Danışman */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {prop.advisor?.avatar ? (
                        <img
                          src={prop.advisor.avatar}
                          alt={prop.advisor.name}
                          width="24"
                          height="24"
                          loading="lazy"
                          decoding="async"
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-secondary text-white font-bold text-[10px] flex items-center justify-center">
                          {prop.advisor?.name ? (
                            prop.advisor.name.trim().substring(0, 2).toUpperCase()
                          ) : (
                            <span className="material-symbols-outlined text-[12px]">person</span>
                          )}
                        </div>
                      )}
                      <span className="font-label-sm text-label-sm text-on-surface">
                        {prop.advisor?.name || 'Danışman atanmadı'}
                      </span>
                    </div>
                  </td>

                  {/* CRM Eşleşme */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-[12px] font-bold text-secondary">
                      <span className="material-symbols-outlined text-[15px]">
                        {prop.type === 'Kiralık' ? 'corporate_fare' : 'local_fire_department'}
                      </span>
                      {prop.matchedLabel || `${prop.matchedCount || 3} Eşleşme`}
                    </span>
                  </td>

                  {/* Aksiyonlar */}
                  <td
                    className="py-3 px-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onToggleBookmark(prop.id)}
                        className={`p-1 rounded hover:bg-surface transition-colors cursor-pointer ${isBookmarked ? 'text-secondary' : 'text-on-surface-variant'
                          }`}
                        title="Favori"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isBookmarked ? 'bookmark' : 'bookmark_border'}
                        </span>
                      </button>

                      <button
                        onClick={() => onSendPdf(prop)}
                        className="p-1 rounded hover:bg-surface text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                        title="PDF Sunum"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                      </button>

                      <button
                        onClick={() => onShareWhatsapp(prop)}
                        className="p-1 rounded hover:bg-surface text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"
                        title="WhatsApp"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">share</span>
                      </button>

                      <button
                        onClick={() => onEdit(prop)}
                        className="p-1 rounded hover:bg-surface text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                        title="Düzenle"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>

                      <button
                        onClick={() => onDelete(prop)}
                        className="p-1 rounded hover:bg-error-container text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                        title="Sil"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>

                      <button
                        onClick={() => onOpenDetail(prop)}
                        className="px-2 py-1 rounded bg-surface-container hover:bg-primary hover:text-on-primary font-label-sm text-label-sm text-primary font-semibold transition-all cursor-pointer ml-1"
                        type="button"
                      >
                        Detay
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (under md) */}
      <div className="md:hidden flex flex-col divide-y divide-surface-container-low">
        {properties.map((prop, idx) => {
          const thumb =
            prop.gallery?.[0]?.image ||
            prop.image ||
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300';
          const isBookmarked = isIdBookmarked(prop.id);

          return (
            <div
              key={prop.id}
              onClick={() => onOpenDetail(prop)}
              className="p-3.5 flex flex-col gap-2.5 hover:bg-surface-container/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                  <img
                    src={thumb}
                    alt={prop.title}
                    width="80"
                    height="64"
                    loading={idx < 3 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300';
                    }}
                  />
                  <span
                    className={`absolute top-1 left-1 px-1.5 py-0.2 rounded text-[10px] font-bold text-white ${
                      prop.type === 'Kiralık' ? 'bg-primary' : 'bg-secondary'
                    }`}
                  >
                    {prop.type}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono font-bold text-xs text-secondary">
                      {prop.id}
                    </span>
                    <span className="font-headline-sm text-sm font-bold text-primary">
                      {prop.priceFormatted}
                    </span>
                  </div>
                  <h4 className="font-label-md text-sm font-semibold text-primary truncate mt-0.5">
                    {prop.title}
                  </h4>
                  <p className="font-caption text-xs text-on-surface-variant truncate">
                    📍 {prop.location || prop.district}
                  </p>
                </div>
              </div>

              {/* Specs & Actions Row */}
              <div className="flex items-center justify-between pt-1 border-t border-surface-container/50 text-xs">
                <div className="flex items-center gap-2 text-on-surface-variant font-medium">
                  <span>{prop.rooms}</span>
                  <span>•</span>
                  <span>{prop.netArea} m² net</span>
                </div>

                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onToggleBookmark(prop.id)}
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface text-on-surface-variant hover:text-secondary cursor-pointer"
                    type="button"
                    title="Kaydet"
                  >
                    <span className={`material-symbols-outlined text-[16px] ${isBookmarked ? 'fill text-secondary' : ''}`}>
                      bookmark
                    </span>
                  </button>
                  <button
                    onClick={() => onShareWhatsapp(prop)}
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface text-on-surface-variant hover:text-secondary cursor-pointer"
                    type="button"
                    title="WhatsApp"
                  >
                    <span className="material-symbols-outlined text-[16px]">share</span>
                  </button>
                  <button
                    onClick={() => onEdit(prop)}
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface text-on-surface-variant hover:text-primary cursor-pointer"
                    type="button"
                    title="Düzenle"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button
                    onClick={() => onOpenDetail(prop)}
                    className="px-2 py-1 rounded bg-surface-container text-primary font-semibold text-xs hover:bg-primary hover:text-white transition-colors cursor-pointer"
                    type="button"
                  >
                    Detay
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(PropertyListView);

