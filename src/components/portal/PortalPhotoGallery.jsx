import React, { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * PortalPhotoGallery Component
 * Rich customer-facing property photo gallery with thumbnails and fullscreen lightbox.
 *
 * Adheres strictly to rule:
 * - Room labels (e.g. "Salon", "Mutfak") are shown ONLY if present in data.
 * - If not present, labels are hidden (no fabricated room tags).
 * - Lightbox supports keyboard navigation (Escape, Left, Right).
 */
export default function PortalPhotoGallery({ property }) {
  const fallbackImage =
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200';

  // Normalize gallery images
  const images = useMemo(() => {
    if (property?.gallery && Array.isArray(property.gallery) && property.gallery.length > 0) {
      return property.gallery.map((item, idx) => ({
        id: idx,
        url: typeof item === 'string' ? item : item.image || item.url || fallbackImage,
        label: typeof item === 'object' && item.label ? item.label.trim() : '',
      }));
    }

    const single = property?.mainImage || property?.image || fallbackImage;
    return [{ id: 0, url: single, label: '' }];
  }, [property, fallbackImage]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const currentImage = images[activeIndex] || images[0];

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Handle keyboard events for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen, handlePrev, handleNext]);

  return (
    <div className="w-full flex flex-col gap-3 select-none">
      {/* 1. Large Main Photo Preview */}
      <div className="relative w-full h-80 sm:h-[460px] lg:h-[520px] rounded-2xl overflow-hidden bg-slate-900 group shadow-sm">
        <img
          src={currentImage.url}
          alt={property?.title || 'Gayrimenkul Fotoğrafı'}
          className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-[1.02]"
          onClick={() => setIsLightboxOpen(true)}
          loading="eager"
          decoding="async"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImage;
          }}
        />

        {/* Gradient Overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Floating Badges */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
          {/* Room Label Badge (ONLY shown if present in data, never fabricated) */}
          {currentImage.label && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-900 shadow-md">
              {currentImage.label}
            </span>
          )}

          {property?.status === 'Yeni İlan' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md">
              Yeni İlan
            </span>
          )}
        </div>

        {/* Top Right Zoom Button */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          title="Tam Ekran Görüntüle"
          aria-label="Tam Ekran Görüntüle"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-slate-950/70 hover:bg-slate-950 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-md"
        >
          <span className="material-symbols-outlined text-[20px]">fullscreen</span>
        </button>

        {/* Navigation Arrows (shown if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              title="Önceki Fotoğraf"
              aria-label="Önceki Fotoğraf"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[24px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              title="Sonraki Fotoğraf"
              aria-label="Sonraki Fotoğraf"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[24px]">chevron_right</span>
            </button>
          </>
        )}

        {/* Bottom Counter Badge */}
        <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950/80 backdrop-blur-md text-white shadow-md">
            <span className="material-symbols-outlined text-[16px]">photo_camera</span>
            <span>
              {activeIndex + 1} / {images.length} Fotoğraf
            </span>
          </span>
        </div>
      </div>

      {/* 2. Thumbnail Strip (shown if multiple images) */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${idx === activeIndex
                  ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105'
                  : 'border-transparent opacity-70 hover:opacity-100'
                }`}
            >
              <img
                src={img.url}
                alt={`Küçük Resim ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackImage;
                }}
              />
              {img.label && (
                <span className="absolute bottom-0 inset-x-0 bg-slate-950/75 text-[9px] text-white font-medium text-center truncate px-0.5">
                  {img.label}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 3. Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tam Ekran Fotoğraf Galerisi"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Header Bar */}
          <div
            className="flex items-center justify-between text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-semibold text-slate-300">
                {activeIndex + 1} / {images.length}
              </span>
              {currentImage.label && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white">
                  {currentImage.label}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Kapat (Escape)"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          {/* Lightbox Center Image & Arrows */}
          <div
            className="relative flex-1 flex items-center justify-center my-2 max-h-[82vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage.url}
              alt={property?.title || 'Büyük Fotoğraf'}
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer shadow-lg"
                  title="Önceki (Sol Ok)"
                >
                  <span className="material-symbols-outlined text-3xl">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer shadow-lg"
                  title="Sonraki (Sağ Ok)"
                >
                  <span className="material-symbols-outlined text-3xl">chevron_right</span>
                </button>
              </>
            )}
          </div>

          {/* Lightbox Footer Title */}
          <div
            className="text-center text-xs text-slate-400 truncate max-w-2xl mx-auto z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {property?.title}
          </div>
        </div>
      )}
    </div>
  );
}

