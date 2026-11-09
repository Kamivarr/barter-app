'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Wrench,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseImagesJson } from '@/types/domain';

interface ImageGalleryProps {
  imagesJson: string;
  title: string;
  className?: string;
}

export function ImageGallery({ imagesJson, title, className }: ImageGalleryProps) {
  const images = parseImagesJson(imagesJson);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const currentImage = images[selectedIndex] || images[0];
  const hasMultiple = images.length > 1;

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setIsZoomed(false);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setIsZoomed(false);
  }, [images.length]);

  const toggleZoom = useCallback(() => {
    setIsZoomed((prev) => !prev);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setIsZoomed(false);
  }, []);

  // Blokada przewijania tła (body scroll lock) przy otwartym podglądzie
  useEffect(() => {
    if (!isLightboxOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isLightboxOpen]);

  // Obsługa klawiatury w trybie powiększenia (Escape, strzałki)
  useEffect(() => {
    if (!isLightboxOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        handlePrev();
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        handleNext();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, images.length, closeLightbox, handlePrev, handleNext]);

  // Gdy ogłoszenie nie posiada żadnych zdjęć
  if (images.length === 0) {
    return (
      <div
        className={cn(
          'w-full aspect-[4/3] sm:aspect-[16/10] bg-stone-950 border border-stone-800 rounded-2xl flex flex-col items-center justify-center text-stone-600 gap-3 shadow-inner',
          className
        )}
      >
        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 text-stone-500">
          <Wrench className="w-10 h-10" />
        </div>
        <span className="text-xs font-medium">Brak zdjęć dla tego przedmiotu</span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* ZDJĘCIE GŁÓWNE (KLIKNIĘCIE POWIĘKSZA) */}
      <div
        className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl group cursor-zoom-in"
        onClick={() => setIsLightboxOpen(true)}
      >
        <img
          src={currentImage}
          alt={`${title} - zdjęcie ${selectedIndex + 1}`}
          className="w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-[1.02]"
        />

        {/* PRZYCISK POWIĘKSZENIA W GÓRNYM PRAWYM ROGU */}
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            aria-label="Powiększ zdjęcie"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-950/80 hover:bg-stone-900 text-stone-200 hover:text-white border border-stone-800 backdrop-blur-md text-xs font-semibold shadow-lg transition cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-orange-400" />
            <span>Powiększ</span>
          </button>
        </div>

        {/* PODPOWIEDŹ HOVER W DOLNYM LEWYM ROGU */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-stone-950/80 border border-stone-800/80 text-[11px] font-medium text-stone-300 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 pointer-events-none">
          <ZoomIn className="w-3.5 h-3.5 text-orange-400" />
          <span>Kliknij, aby powiększyć</span>
        </div>

        {/* PRZYCISKI NAWIGACJI POPRZEDNIE / NASTĘPNE NA ZDJĘCIU GŁÓWNYM */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Poprzednie zdjęcie"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-stone-950/80 hover:bg-stone-900 text-white border border-stone-800 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Następne zdjęcie"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-stone-950/80 hover:bg-stone-900 text-white border border-stone-800 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-stone-950/80 border border-stone-800/80 text-[11px] font-mono font-medium text-stone-300 backdrop-blur-md">
              {selectedIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* MINIATURY POD ZDJĘCIEM GŁÓWNYM */}
      {hasMultiple && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={img + idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              aria-label={`Pokaż zdjęcie ${idx + 1}`}
              className={cn(
                'relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-950 border-2 shrink-0 transition-all cursor-pointer',
                selectedIndex === idx
                  ? 'border-orange-500 shadow-md shadow-orange-500/20 scale-102'
                  : 'border-stone-800 opacity-60 hover:opacity-100 hover:border-stone-700'
              )}
            >
              <img
                src={img}
                alt={`${title} miniatura ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* OKNO MODALNE POWIĘKSZONEGO ZDJĘCIA (FULLSCREEN LIGHTBOX) */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Powiększone zdjęcie: ${title}`}
          className="fixed inset-0 z-50 flex flex-col bg-stone-950/95 backdrop-blur-md select-none"
        >
          {/* PASEK GÓRNY LIGHTBOX */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-stone-800/80 bg-stone-950/80 z-20">
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <span className="text-xs sm:text-sm font-semibold text-stone-200 truncate">
                {title}
              </span>
              {hasMultiple && (
                <span className="text-xs font-mono font-medium text-stone-400 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded-md shrink-0">
                  {selectedIndex + 1} / {images.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* PRZYCISK ZOOM (PRZYBLIŻ / ODDAL) */}
              <button
                type="button"
                onClick={toggleZoom}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer',
                  isZoomed
                    ? 'bg-orange-600/20 text-orange-400 border-orange-500/40 hover:bg-orange-600/30'
                    : 'bg-stone-900 text-stone-300 border-stone-800 hover:text-white hover:bg-stone-800'
                )}
                title={isZoomed ? 'Oddal (1x)' : 'Przybliż (2x)'}
              >
                {isZoomed ? (
                  <>
                    <ZoomOut className="w-4 h-4 text-orange-400" />
                    <span className="hidden sm:inline">Oddal (1x)</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-4 h-4 text-orange-400" />
                    <span className="hidden sm:inline">Przybliż (2x)</span>
                  </>
                )}
              </button>

              {/* PRZYCISK ZAMKNIĘCIA */}
              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Zamknij podgląd zdjęcia"
                className="p-1.5 sm:p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* GŁÓWNY OBSZAR ZDJĘCIA */}
          <div
            className="flex-1 relative flex items-center justify-center p-2 sm:p-6 overflow-auto"
            onClick={closeLightbox}
          >
            {/* PRZYCISK POPRZEDNIE W LIGHTBOX */}
            {hasMultiple && (
              <button
                type="button"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Poprzednie zdjęcie"
                className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-stone-900/90 hover:bg-stone-800 text-white border border-stone-700/80 shadow-2xl transition cursor-pointer z-30"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* PRZYCISK NASTĘPNE W LIGHTBOX */}
            {hasMultiple && (
              <button
                type="button"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Następne zdjęcie"
                className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-stone-900/90 hover:bg-stone-800 text-white border border-stone-700/80 shadow-2xl transition cursor-pointer z-30"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* KONTENER POWIĘKSZONEGO OBRAZU */}
            <div
              className={cn(
                'relative flex items-center justify-center transition-transform duration-200',
                isZoomed ? 'scale-150 sm:scale-175 cursor-zoom-out m-auto py-12' : 'cursor-zoom-in'
              )}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                toggleZoom();
              }}
            >
              <img
                src={currentImage}
                alt={`${title} - powiększone zdjęcie ${selectedIndex + 1}`}
                className="max-h-[72vh] sm:max-h-[78vh] max-w-[88vw] w-auto h-auto object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>

          {/* PASEK DOLNY Z MINIATURAMI ORAZ WSKAZÓWKAMI */}
          <div className="px-4 py-3 border-t border-stone-800/80 bg-stone-950/90 flex flex-col items-center gap-2 z-20">
            {hasMultiple && (
              <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={img + idx}
                    type="button"
                    onClick={() => {
                      setSelectedIndex(idx);
                      setIsZoomed(false);
                    }}
                    aria-label={`Przełącz na zdjęcie ${idx + 1}`}
                    className={cn(
                      'relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-stone-900 border-2 shrink-0 transition cursor-pointer',
                      selectedIndex === idx
                        ? 'border-orange-500 shadow-md shadow-orange-500/30 scale-105'
                        : 'border-stone-800 opacity-60 hover:opacity-100'
                    )}
                  >
                    <img
                      src={img}
                      alt={`${title} miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            <p className="text-[11px] text-stone-500 text-center">
              Kliknij zdjęcie, aby {isZoomed ? 'oddalić' : 'przybliżyć'} • Użyj strzałek [← / →] do nawigacji • Klawisz Esc lub kliknięcie w tło zamyka
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
