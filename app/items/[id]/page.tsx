import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Star,
  ShieldCheck,
  Wrench,
  ArrowLeft,
  Info,
  Loader2,
} from 'lucide-react';
import { getItemById } from '@/lib/queries/items.queries';
import { getSessionUser } from '@/lib/auth';
import { ImageGallery } from '@/components/items/image-gallery';
import { AvailabilityCalendar } from '@/components/items/availability-calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  computeAverageRating,
  TOOL_CONDITION_LABELS,
  ToolCondition,
} from '@/types/domain';

interface ItemDetailsPageProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

export const metadata = {
  title: 'Szczegóły oferty – Barter Rzeszów',
  description: 'Sprawdź stan techniczny, dostępność w kalendarzu i wypożycz sprzęt od sąsiada w Rzeszowie.',
};

export default async function ItemDetailsPage({ params }: ItemDetailsPageProps) {
  const { id } = await params;
  const item = await getItemById(id);

  if (!item) {
    notFound();
  }

  const sessionUser = await getSessionUser();
  const isOwner = sessionUser?.id === item.ownerId;

  const averageRating = computeAverageRating(item.reviews);
  const conditionKey = (item.condition as ToolCondition) in TOOL_CONDITION_LABELS
    ? (item.condition as ToolCondition)
    : 'GOOD';
  const conditionLabel = TOOL_CONDITION_LABELS[conditionKey] || item.condition;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* NAWIGACJA OKRUSZKOWA (BREADCRUMBS) */}
      <nav className="flex items-center gap-2 text-xs text-stone-400">
        <Link href="/" className="hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Katalog sprzętu</span>
        </Link>
        <span>/</span>
        <Link
          href={`/?category=${encodeURIComponent(item.category.slug)}`}
          className="hover:text-white"
        >
          {item.category.name}
        </Link>
        <span>/</span>
        <span className="text-stone-200 font-semibold truncate max-w-xs sm:max-w-md">
          {item.title}
        </span>
      </nav>

      {/* GŁÓWNY UKŁAD 2-KOLUMNOWY: SZCZEGÓŁY (LEWA) + KALENDARZ/REZERWACJA (PRAWA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEWA KOLUMNA: GALERIA, OPIS, SPECYFIKACJA, WŁAŚCICIEL, OPINIE */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. GALERIA ZDJĘĆ */}
          <ImageGallery imagesJson={item.imagesJson} title={item.title} />

          {/* 2. TYTUŁ I ETYKIETY */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="sm">
                {item.category.icon} {item.category.name}
              </Badge>
              <Badge variant="info" size="sm">
                Stan: {conditionLabel}
              </Badge>
              {item.isAvailable ? (
                <Badge variant="success" size="sm">
                  Dostępny od zaraz
                </Badge>
              ) : (
                <Badge variant="danger" size="sm">
                  Aktualnie wypożyczony
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {item.title}
            </h1>

            {/* Lokalizacja i ocena */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-stone-400">
              <div className="flex items-center gap-1.5 text-stone-300">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{item.neighborLoc || `${item.owner.neighborhood}, Rzeszów`}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 px-2.5 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-white">
                  {averageRating !== null ? averageRating.toFixed(1) : 'Nowy'}
                </span>
                <span className="text-stone-500">({item.reviews.length} ocen)</span>
              </div>
            </div>
          </div>

          {/* 3. PROFIL WŁAŚCICIELA SPRZĘTU (BEZPIECZEŃSTWO: TYLKO DANE PUBLICZNE) */}
          <Card className="border-stone-800 bg-stone-900/80">
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-lg shrink-0">
                  {item.owner.name ? item.owner.name[0] : 'S'}
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider font-bold block">
                    Właściciel sprzętu
                  </span>
                  <div className="text-base font-bold text-white flex items-center gap-2">
                    <span>{item.owner.name}</span>
                    <Badge variant="success" size="sm" className="text-[10px]">
                      Zweryfikowany sąsiad
                    </Badge>
                  </div>
                  <span className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                    <span>{item.owner.neighborhood || 'Rzeszów'}</span>
                  </span>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-[11px] text-stone-500 block leading-tight">
                  Dokładny adres odbioru i kontakt udostępniany po zatwierdzeniu rezerwacji.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 4. OPIS PRZEDMIOTU */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-orange-500" />
              Opis i specyfikacja techniczna
            </h3>
            <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 text-sm text-stone-300 leading-relaxed whitespace-pre-line">
              {item.description}
            </div>
          </div>

          {/* 5. ZASADY WYNAJMU WŁAŚCICIELA */}
          {item.rentalRules && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Zasady i warunki właściciela
              </h3>
              <div className="p-4 rounded-xl bg-stone-900/50 border border-stone-800 text-xs sm:text-sm text-stone-300 leading-relaxed">
                {item.rentalRules}
              </div>
            </div>
          )}

          {/* 6. RECENZJE I OCENY SĄSIADÓW */}
          <div className="space-y-4 pt-4 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                Opinie sąsiadów ({item.reviews.length})
              </h3>
              {averageRating !== null && (
                <span className="text-xs font-semibold text-stone-300">
                  Średnia ocena: <strong className="text-amber-400">{averageRating.toFixed(1)} / 5.0</strong>
                </span>
              )}
            </div>

            {item.reviews.length === 0 ? (
              <div className="p-6 rounded-xl bg-stone-900/40 border border-dashed border-stone-800 text-center text-xs text-stone-400">
                Brak opinii dla tego przedmiotu. Bądź pierwszym sąsiadem, który go wypożyczy i oceni!
              </div>
            ) : (
              <div className="space-y-3">
                {item.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl bg-stone-900/70 border border-stone-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-stone-800 text-stone-300 font-bold text-[10px] flex items-center justify-center">
                          {rev.author.name ? rev.author.name[0] : 'U'}
                        </div>
                        <span className="font-semibold text-stone-200">{rev.author.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-stone-500 block" suppressHydrationWarning>
                      {new Date(rev.createdAt).toLocaleDateString('pl-PL')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PRAWA KOLUMNA: KALENDARZ DOSTĘPNOŚCI ORAZ FORMULARZ REZERWACJI (STICKY) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <AvailabilityCalendar
            itemId={item.id}
            dailyPrice={item.dailyPrice}
            depositAmount={item.depositAmount}
            isAvailable={item.isAvailable}
            bookedRanges={item.rentalRequests}
            isOwner={isOwner}
          />
        </div>
      </div>
    </div>
  );
}
