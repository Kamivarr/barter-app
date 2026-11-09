'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Calendar,
  Sparkles,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TOOL_CONDITION_LABELS, ToolCondition } from '@/types/domain';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface ItemFiltersProps {
  categories: CategoryItem[];
}

export function ItemFilters({ categories }: ItemFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get('category') || '';
  const currentQuery = searchParams.get('q') || '';
  const currentCondition = searchParams.get('condition') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentStartDate = searchParams.get('startDate') || '';
  const currentEndDate = searchParams.get('endDate') || '';

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState(currentQuery);

  // Sprawdzenie, czy jakikolwiek filtr poza domyślnym jest aktywny
  const hasActiveFilters = Boolean(
    currentCategory ||
      currentQuery ||
      currentCondition ||
      currentMinPrice ||
      currentMaxPrice ||
      currentStartDate ||
      currentEndDate ||
      (currentSort && currentSort !== 'newest')
  );

  function updateFilters(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    // Każda zmiana filtrów resetuje stronę na pierwszą
    params.delete('page');

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all' || value === 'Wszystkie') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateFilters({ q: localQuery.trim() || null });
  }

  function handleResetAll() {
    setLocalQuery('');
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  return (
    <div className="space-y-4">
      {/* GŁÓWNY PASEK: KATEGORIE ORAZ WYSZUKIWARKA */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Pigułki kategorii (Tabs) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 lg:pb-0 scrollbar-none no-scrollbar">
          <button
            type="button"
            onClick={() => updateFilters({ category: null })}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
              !currentCategory
                ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/25'
                : 'bg-stone-900/90 text-stone-300 border-stone-800 hover:border-stone-700 hover:text-white'
            }`}
          >
            <span>Wszystkie</span>
          </button>

          {categories.map((cat) => {
            const isActive = currentCategory === cat.slug || currentCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateFilters({ category: cat.slug })}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/25'
                    : 'bg-stone-900/90 text-stone-300 border-stone-800 hover:border-stone-700 hover:text-white'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Wyszukiwarka i przycisk zaawansowanych filtrów */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Szukaj w tytule, opisie..."
              value={localQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalQuery(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {localQuery && (
              <button
                type="button"
                onClick={() => {
                  setLocalQuery('');
                  updateFilters({ q: null });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <Button
            type="button"
            variant={isAdvancedOpen ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="shrink-0 flex items-center gap-1.5"
            aria-expanded={isAdvancedOpen}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filtry</span>
          </Button>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetAll}
              className="text-stone-400 hover:text-red-400 p-2 shrink-0"
              title="Resetuj wszystkie filtry"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* PANEL ZAAWANSOWANYCH FILTRÓW (ROZWIJANY) */}
      {isAdvancedOpen && (
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* 1. Stan techniczny */}
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-300 block uppercase tracking-wider text-[11px]">
                Stan techniczny:
              </label>
              <select
                value={currentCondition}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilters({ condition: e.target.value || null })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="">Wszystkie stany</option>
                {Object.entries(TOOL_CONDITION_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Zakres cenowy (zł/doba) */}
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-300 block uppercase tracking-wider text-[11px]">
                Cena dobowej stawki (zł):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Od"
                  value={currentMinPrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilters({ minPrice: e.target.value || null })}
                  className="w-1/2 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-stone-500">–</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Do"
                  value={currentMaxPrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilters({ maxPrice: e.target.value || null })}
                  className="w-1/2 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* 3. Dostępność w przedziale dat */}
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-300 block uppercase tracking-wider text-[11px]">
                Dostępność w terminie:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={currentStartDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilters({ startDate: e.target.value || null })}
                  className="w-1/2 bg-stone-950 border border-stone-800 rounded-xl px-2 py-2 text-[11px] text-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-stone-500">–</span>
                <input
                  type="date"
                  value={currentEndDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilters({ endDate: e.target.value || null })}
                  className="w-1/2 bg-stone-950 border border-stone-800 rounded-xl px-2 py-2 text-[11px] text-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* 4. Sortowanie */}
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-300 block uppercase tracking-wider text-[11px]">
                Sortuj wyniki:
              </label>
              <select
                value={currentSort}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilters({ sort: e.target.value || null })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="newest">Najnowsze ogłoszenia</option>
                <option value="price_asc">Cena: od najniższej</option>
                <option value="price_desc">Cena: od najwyższej</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ODZNAKI AKTYWNYCH FILTRÓW (CHIPY) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-stone-400 font-medium text-[11px]">Aktywne filtry:</span>

          {currentCategory && (
            <Badge variant="primary" size="sm" className="flex items-center gap-1">
              <span>Kategoria: {currentCategory}</span>
              <button
                type="button"
                onClick={() => updateFilters({ category: null })}
                className="hover:text-red-300 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {currentQuery && (
            <Badge variant="info" size="sm" className="flex items-center gap-1">
              <span>Fraza: &ldquo;{currentQuery}&rdquo;</span>
              <button
                type="button"
                onClick={() => {
                  setLocalQuery('');
                  updateFilters({ q: null });
                }}
                className="hover:text-red-300 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {currentCondition && (
            <Badge variant="purple" size="sm" className="flex items-center gap-1">
              <span>Stan: {TOOL_CONDITION_LABELS[currentCondition as ToolCondition] || currentCondition}</span>
              <button
                type="button"
                onClick={() => updateFilters({ condition: null })}
                className="hover:text-red-300 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {(currentMinPrice || currentMaxPrice) && (
            <Badge variant="default" size="sm" className="flex items-center gap-1">
              <span>Cena: {currentMinPrice || '0'} - {currentMaxPrice || '∞'} zł</span>
              <button
                type="button"
                onClick={() => updateFilters({ minPrice: null, maxPrice: null })}
                className="hover:text-red-300 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {(currentStartDate || currentEndDate) && (
            <Badge variant="warning" size="sm" className="flex items-center gap-1">
              <Calendar className="w-3 h-3 mr-0.5" />
              <span>{currentStartDate || 'od zaraz'} do {currentEndDate || '...'}</span>
              <button
                type="button"
                onClick={() => updateFilters({ startDate: null, endDate: null })}
                className="hover:text-red-300 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {currentSort !== 'newest' && (
            <Badge variant="default" size="sm" className="flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 mr-0.5" />
              <span>{currentSort === 'price_asc' ? 'Najtańsze' : 'Najdroższe'}</span>
              <button
                type="button"
                onClick={() => updateFilters({ sort: null })}
                className="hover:text-red-300 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          <button
            type="button"
            onClick={handleResetAll}
            className="text-stone-400 hover:text-white underline text-[11px] ml-1 cursor-pointer"
          >
            Wyczyść wszystkie
          </button>
        </div>
      )}
    </div>
  );
}
