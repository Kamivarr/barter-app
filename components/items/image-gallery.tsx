'use client';

import React, { useState } from 'react';
import { Wrench, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  imagesJson: string;
  title: string;
  className?: string;
}

export function ImageGallery({ imagesJson, title, className }: ImageGalleryProps) {
  let images: string[] = [];

  try {
    const parsed = JSON.parse(imagesJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      images = parsed.filter((url): url is string => typeof url === 'string' && url.trim().length > 0);
    }
  } catch (err) {
    if (typeof imagesJson === 'string' && imagesJson.startsWith('http')) {
      images = [imagesJson];
    }
  }

  const [selectedIndex, setSelectedIndex] = useState(0);

  const currentImage = images[selectedIndex] || images[0];
  const hasMultiple = images.length > 1;

  function handlePrev() {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }

  function handleNext() {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }

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
      {/* ZDJĘCIE GŁÓWNE */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl group">
        <img
          src={currentImage}
          alt={`${title} - zdjęcie ${selectedIndex + 1}`}
          className="w-full h-full object-cover select-none transition-all duration-300"
        />

        {/* PRZYCISKI NAWIGACJI POPRZEDNIE / NASTĘPNE */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Poprzednie zdjęcie"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-stone-950/80 hover:bg-stone-900 text-white border border-stone-800 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
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

      {/* MINIATURY (PASEK DOLNY) */}
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
    </div>
  );
}
