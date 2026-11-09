'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Star, ShieldCheck, Wrench } from 'lucide-react';
import {
  CatalogItem,
  ItemWithDetails,
  ToolCondition,
  TOOL_CONDITION_LABELS,
  getFirstImage,
  computeAverageRating,
} from '@/types/domain';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ItemCardProps extends React.ComponentProps<'div'> {
  item: CatalogItem | ItemWithDetails;
  onRentClick?: (item: CatalogItem | ItemWithDetails) => void;
  onCardClick?: (item: CatalogItem | ItemWithDetails) => void;
  href?: string;
}

const CONDITION_BADGE_VARIANTS: Record<ToolCondition, 'success' | 'info' | 'warning' | 'default'> = {
  NEW: 'success',
  GOOD: 'info',
  FAIR: 'warning',
  WELL_USED: 'default',
};

export function ItemCard({
  item,
  onRentClick,
  onCardClick,
  href,
  className,
  ...props
}: ItemCardProps) {
  const imageUrl = getFirstImage(item.imagesJson);
  const averageRating = computeAverageRating(item.reviews);
  const reviewCount = item.reviews?.length ?? 0;
  
  const conditionKey = (item.condition as ToolCondition) in TOOL_CONDITION_LABELS
    ? (item.condition as ToolCondition)
    : 'GOOD';
  const conditionLabel = TOOL_CONDITION_LABELS[conditionKey] || item.condition;
  const conditionVariant = CONDITION_BADGE_VARIANTS[conditionKey] || 'default';

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(item);
    } else if (onRentClick) {
      onRentClick(item);
    }
  };

  const cardContent = (
    <div
      onClick={handleCardClick}
      className={cn(
        'group flex flex-col h-full bg-stone-900/90 border border-stone-800 rounded-2xl overflow-hidden shadow-lg cursor-pointer',
        'hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-950/20 transition-all duration-300',
        className
      )}
      {...props}
    >
      {/* KONTENER ZDJĘCIA W STYLU VINTED/OLX */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-950">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-600 gap-2">
            <Wrench className="w-10 h-10 stroke-1" />
            <span className="text-xs">Brak zdjęcia</span>
          </div>
        )}

        {/* Etykiety nakładane na zdjęcie */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <Badge variant="primary" size="sm" className="backdrop-blur-md bg-stone-950/80">
            {item.category?.name || 'Sprzęt'}
          </Badge>
          <Badge variant={conditionVariant} size="sm" className="backdrop-blur-md bg-stone-950/80">
            {conditionLabel}
          </Badge>
        </div>

        {/* Informacja o braku dostępności */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center z-20">
            <Badge variant="danger" size="md">
              Aktualnie wypożyczony
            </Badge>
          </div>
        )}
      </div>

      {/* TREŚĆ KARTY PRODUKTU */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Lokalizacja sąsiedzka i ocena */}
        <div className="flex items-center justify-between text-xs text-stone-400 mb-2 gap-2">
          <span className="inline-flex items-center gap-1 truncate text-stone-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="truncate">{item.neighborLoc || 'Rzeszów'}</span>
          </span>

          <span className="inline-flex items-center gap-1 shrink-0 bg-stone-800/80 px-2 py-0.5 rounded-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-stone-200">
              {averageRating !== null ? averageRating.toFixed(1) : 'Nowy'}
            </span>
            {reviewCount > 0 && (
              <span className="text-stone-500">({reviewCount})</span>
            )}
          </span>
        </div>

        {/* Tytuł i krótki opis */}
        <h3 className="font-bold text-base sm:text-lg text-white line-clamp-1 group-hover:text-orange-400 transition-colors">
          {item.title}
        </h3>
        <p className="text-xs text-stone-400 line-clamp-2 mt-1 mb-2">
          {item.description}
        </p>

        {/* Właściciel sprzętu */}
        <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-3">
          <span className="w-5 h-5 rounded-full bg-orange-600/20 text-orange-400 font-bold text-[10px] flex items-center justify-center border border-orange-500/30 shrink-0">
            {item.owner?.name ? item.owner.name[0] : 'S'}
          </span>
          <span className="truncate">Właściciel: <strong className="text-stone-300 font-medium">{item.owner?.name || 'Sąsiad'}</strong></span>
        </div>

        {/* Pasek cenowy i kaucja */}
        <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between gap-2 mt-auto">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-xl sm:text-2xl font-black text-orange-400 tracking-tight">
                {Math.round(item.dailyPrice)} zł
              </span>
              <span className="text-xs text-stone-400 font-medium">/ doba</span>
            </div>
            <div className="text-[11px] text-stone-400 flex items-center gap-1 whitespace-nowrap mt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
              <span className="truncate">
                {item.depositAmount > 0
                  ? `Kaucja: ${Math.round(item.depositAmount)} zł`
                  : 'Bez kaucji'}
              </span>
            </div>
          </div>

          {/* Przycisk akcji */}
          <Button
            size="sm"
            variant="primary"
            disabled={!item.isAvailable}
            onClick={(e) => {
              if (onRentClick) {
                e.stopPropagation();
                onRentClick(item);
              }
            }}
            className="shrink-0 text-xs px-3 h-8 font-semibold shadow-sm shadow-orange-600/20"
          >
            {item.isAvailable ? 'Wypożycz' : 'Zajęty'}
          </Button>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full group focus:outline-none">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
