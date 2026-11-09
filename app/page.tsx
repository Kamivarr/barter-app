import React, { Suspense } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Search,
  PlusCircle,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  KeyRound,
  CreditCard,
  MapPin,
  Loader2,
} from 'lucide-react';
import { getCatalogItems, getCategories, CatalogFilters } from '@/lib/queries/items.queries';
import { ItemCard } from '@/components/items/item-card';
import { ItemFilters } from '@/components/items/item-filters';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ToolCondition } from '@/types/domain';

interface PageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    startDate?: string;
    endDate?: string;
    sort?: 'price_asc' | 'price_desc' | 'newest';
    page?: string;
  }>;
}

export const metadata = {
  title: 'Katalog Sprzętu i Narzędzi – Barter Rzeszów',
  description:
    'Eksploruj oferty wypożyczenia wiertarek, drabin, myjek i sprzętu ogrodowego od sąsiadów w Rzeszowie. Płatności BLIK, odbiór kodem PIN, 15% prowizji.',
};

function buildPageUrl(rawParams: Record<string, string | undefined>, targetPage: number): string {
  const params = new URLSearchParams();
  Object.entries(rawParams).forEach(([k, v]) => {
    if (v && k !== 'page') {
      params.set(k, v);
    }
  });
  if (targetPage > 1) {
    params.set('page', String(targetPage));
  }
  const queryString = params.toString();
  return queryString ? `/?${queryString}` : '/';
}

function CatalogSkeleton() {
  return (
    <div className="space-y-8 animate-pulse pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-28 bg-stone-900 rounded-2xl" />
        <div className="h-28 bg-stone-900 rounded-2xl" />
        <div className="h-28 bg-stone-900 rounded-2xl" />
      </div>
      <div className="h-12 bg-stone-900 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] bg-stone-900 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

async function CatalogContent({ searchParamsPromise }: { searchParamsPromise: PageProps['searchParams'] }) {
  const resolvedParams = await searchParamsPromise;

  const categorySlug = resolvedParams.category;
  const query = resolvedParams.q;
  const minPrice = resolvedParams.minPrice ? Number(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams.maxPrice ? Number(resolvedParams.maxPrice) : undefined;
  const condition = resolvedParams.condition as ToolCondition | undefined;
  const startDate = resolvedParams.startDate;
  const endDate = resolvedParams.endDate;
  const sort = resolvedParams.sort;
  const page = resolvedParams.page ? Math.max(1, Number(resolvedParams.page)) : 1;

  const [categories, catalogData] = await Promise.all([
    getCategories(),
    getCatalogItems({
      categorySlug,
      query,
      minPrice,
      maxPrice,
      condition,
      startDate,
      endDate,
      sort,
      page,
      limit: 12,
    }),
  ]);

  const { items, total, totalPages, currentPage } = catalogData;

  return (
    <div className="space-y-8 pb-12">
      {/* BANER INFORMACYJNY: 3 KROKI PLATFORMY BARTER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-stone-900 to-stone-900/60 border-stone-800 hover:border-orange-500/30 transition-all">
          <CardContent className="p-5 flex items-start gap-4">
            <span className="bg-orange-600/20 text-orange-400 font-extrabold px-2.5 py-1 rounded-md text-xs shrink-0 border border-orange-500/20">
              01
            </span>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-white">Wystaw sprzęt sąsiadom</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Właściciel dodaje zdjęcie i stawkę dobową narzędzia, które leży nieużywane w garażu.
              </p>
              <Link
                href="/items/new"
                className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 pt-1"
              >
                Dodaj sprzęt <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-stone-900 to-stone-900/60 border-stone-800 hover:border-orange-500/30 transition-all">
          <CardContent className="p-5 flex items-start gap-4">
            <span className="bg-orange-600/20 text-orange-400 font-extrabold px-2.5 py-1 rounded-md text-xs shrink-0 border border-orange-500/20">
              02
            </span>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-white">Rezerwacja i płatność BLIK</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Wypożyczający wybiera dostępne dni w kalendarzu i opłaca wynajem wraz z 15% opłatą serwisową.
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold pt-1">
                <CreditCard className="w-3 h-3" /> Bezpieczna kaucja
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-stone-900 to-stone-900/60 border-stone-800 hover:border-orange-500/30 transition-all">
          <CardContent className="p-5 flex items-start gap-4">
            <span className="bg-orange-600/20 text-orange-400 font-extrabold px-2.5 py-1 rounded-md text-xs shrink-0 border border-orange-500/20">
              03
            </span>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-white">Odbiór z 4-cyfrowym PIN</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Przy odbiorze narzędzia sąsiad podaje PIN właścicielowi, co oficjalnie rozpoczyna bieg wypożyczenia.
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-stone-400 font-semibold pt-1">
                <KeyRound className="w-3 h-3 text-orange-500" /> Weryfikacja spotkania
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PASEK FILTRÓW (KATEGORIE, WYSZUKIWARKA, ZAAWANSOWANE) */}
      <Suspense fallback={<div className="h-12 bg-stone-900 rounded-xl animate-pulse" />}>
        <ItemFilters categories={categories} />
      </Suspense>

      {/* LICZNIK WYNIKÓW */}
      <div className="flex items-center justify-between pb-1 border-b border-stone-800/80 text-xs text-stone-400">
        <div>
          Znaleziono: <strong className="text-white font-extrabold">{total}</strong>{' '}
          {total === 1 ? 'ofertę' : total > 1 && total < 5 ? 'oferty' : 'ofert'} w Rzeszowie
        </div>
        {totalPages > 1 && (
          <div>
            Strona <strong className="text-white">{currentPage}</strong> z{' '}
            <strong className="text-white">{totalPages}</strong>
          </div>
        )}
      </div>

      {/* SIATKA OFERT LUB STAN PUSTY */}
      {items.length === 0 ? (
        <Card className="border-dashed border-stone-800 bg-stone-900/40 p-12 text-center">
          <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
            <div className="p-3.5 bg-stone-800/80 rounded-2xl text-stone-500">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Brak przedmiotów spełniających wybrane kryteria</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Spróbuj zmienić kategorię, poszerzyć zakres dat lub wyczyścić frazę wyszukiwania. Możesz też wystawić własny sprzęt jako pierwszy w okolicy!
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/">
                <Button variant="outline" size="sm">
                  Pokaż wszystkie przedmioty
                </Button>
              </Link>
              <Link href="/items/new">
                <Button variant="primary" size="sm">
                  <PlusCircle className="w-4 h-4" /> Wystaw sprzęt sąsiadom
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              href={`/items/${item.id}`}
            />
          ))}
        </div>
      )}

      {/* PAGINACJA */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 border-t border-stone-800">
          {currentPage > 1 ? (
            <Link href={buildPageUrl(resolvedParams, currentPage - 1)}>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" />
                <span>Poprzednia</span>
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled className="flex items-center gap-1 opacity-40">
              <ChevronLeft className="w-4 h-4" />
              <span>Poprzednia</span>
            </Button>
          )}

          <div className="flex items-center gap-1 px-3 text-xs text-stone-300 font-semibold">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isCurrent = pageNum === currentPage;
              return (
                <Link
                  key={pageNum}
                  href={buildPageUrl(resolvedParams, pageNum)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                      : 'text-stone-400 hover:text-white hover:bg-stone-900 border border-stone-800'
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}
          </div>

          {currentPage < totalPages ? (
            <Link href={buildPageUrl(resolvedParams, currentPage + 1)}>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <span>Następna</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled className="flex items-center gap-1 opacity-40">
              <span>Następna</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CatalogPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogContent searchParamsPromise={searchParams} />
    </Suspense>
  );
}
