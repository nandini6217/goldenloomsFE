'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxPos, setLightboxPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbScrollRef = useRef<HTMLDivElement>(null);

  const currentImage = images[selectedIndex];

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!lightboxOpen) return;
      e.preventDefault();
      setLightboxZoom((z) => Math.min(4, Math.max(0.5, z + (e.deltaY > 0 ? -0.2 : 0.2))));
    },
    [lightboxOpen]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (lightboxZoom <= 1) return;
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        posX: lightboxPos.x,
        posY: lightboxPos.y,
      };
    },
    [lightboxZoom, lightboxPos]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      setLightboxPos({
        x: dragStart.current.posX + e.clientX - dragStart.current.x,
        y: dragStart.current.posY + e.clientY - dragStart.current.y,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [lightboxOpen, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (!lightboxOpen) {
      setLightboxZoom(1);
      setLightboxPos({ x: 0, y: 0 });
    }
  }, [lightboxOpen]);

  // Scroll selected thumbnail into view in the horizontal strip
  useEffect(() => {
    const el = thumbScrollRef.current;
    if (!el || images.length <= 1) return;
    const thumb = el.querySelector(`[data-thumb-index="${selectedIndex}"]`);
    if (thumb) thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [selectedIndex, images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxOpen]);

  if (!images?.length) {
    return (
      <div className="aspect-square rounded-[12px] bg-secondary/50 flex items-center justify-center text-primary/50 text-sm">
        No image
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main image - Flipkart style: large on top, click to zoom/open lightbox */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="block w-full aspect-square rounded-[12px] bg-secondary/30 border border-primary/10 overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent/50 relative"
          aria-label="View full size and zoom"
        >
          <Image
            src={currentImage}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            unoptimized
          />
        </button>

        {/* Thumbnails: single row, small size, horizontal scroll on all screens */}
        {images.length > 1 && (
          <div
            ref={thumbScrollRef}
            className="flex gap-2 overflow-x-auto overflow-y-hidden pb-1 scroll-smooth scrollbar-thin"
            style={{ scrollbarWidth: 'thin' }}
          >
            {images.map((url, i) => (
              <button
                key={`${url}-${i}`}
                data-thumb-index={i}
                type="button"
                onClick={() => setSelectedIndex(i)}
                className={`relative flex-shrink-0 w-14 h-14 rounded-lg border-2 overflow-hidden transition-colors min-w-[3.5rem] ${
                  i === selectedIndex
                    ? 'border-accent ring-1 ring-accent'
                    : 'border-primary/20 hover:border-primary/40'
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="3.5rem"
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox with zoom */}
      {lightboxOpen && currentImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
          onWheel={handleWheel}
          role="dialog"
          aria-modal="true"
          aria-label="Image zoom"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
            aria-label="Close"
          >
            ×
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxZoom((z) => Math.min(4, z + 0.5));
              }}
              className="px-3 py-1 rounded bg-white/10 text-white text-sm hover:bg-white/20"
            >
              Zoom +
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxZoom((z) => Math.max(0.5, z - 0.5));
              }}
              className="px-3 py-1 rounded bg-white/10 text-white text-sm hover:bg-white/20"
            >
              Zoom −
            </button>
          </div>
          <div
            ref={containerRef}
            className="overflow-hidden max-w-full max-h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
          >
            <img
              src={currentImage}
              alt={productName}
              className="max-w-full max-h-[90vh] object-contain select-none pointer-events-none"
              style={{
                transform: `translate(${lightboxPos.x}px, ${lightboxPos.y}px) scale(${lightboxZoom})`,
              }}
              draggable={false}
            />
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(i);
                    setLightboxZoom(1);
                    setLightboxPos({ x: 0, y: 0 });
                  }}
                  className={`w-12 h-12 rounded border-2 overflow-hidden ${
                    i === selectedIndex ? 'border-white' : 'border-white/40'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
