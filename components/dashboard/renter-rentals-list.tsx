'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Phone,
  KeyRound,
  ShieldCheck,
  Star,
  Clock,
  AlertCircle,
  XCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { StatusBadge } from '@/components/rentals/status-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ReviewModal } from '@/components/rentals/review-modal';
import { cancelRentalAsRenterAction } from '@/app/actions/rental.actions';
import { RentalStatus, getFirstImage } from '@/types/domain';

interface RenterRentalItem {
  id: string;
  startDate: Date | string;
  endDate: Date | string;
  days: number;
  totalPaid: number;
  depositAmount: number;
  ownerAmount: number;
  commissionAmount: number;
  status: string;
  pickupPin: string;
  createdAt: Date | string;
  item: {
    id: string;
    title: string;
    imagesJson?: string;
    neighborLoc: string;
    category?: { name: string };
    owner: {
      id: string;
      name: string;
      neighborhood?: string | null;
      city?: string;
      avatarUrl?: string | null;
      exactAddress?: string | null;
      phone?: string | null;
    };
  };
  review?: {
    id: string;
    rating: number;
    comment: string;
  } | null;
}

interface RenterRentalsListProps {
  rentals: RenterRentalItem[];
  onRefresh: () => void;
}

export function RenterRentalsList({ rentals, onRefresh }: RenterRentalsListProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [reviewModalData, setReviewModalData] = useState<{
    rentalId: string;
    itemTitle: string;
  } | null>(null);

  async function handleCancel(rentalId: string) {
    if (!confirm('Czy na pewno chcesz anulować ten wniosek o wypożyczenie?')) return;
    setCancellingId(rentalId);
    try {
      const res = await cancelRentalAsRenterAction(rentalId);
      if (res.success) {
        onRefresh();
      } else {
        alert(res.message || 'Nie udało się anulować wniosku.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      alert(msg || 'Błąd połączenia.');
    } finally {
      setCancellingId(null);
    }
  }

  if (rentals.length === 0) {
    return (
      <Card className="border-stone-800 bg-stone-900/40 text-center py-12 px-4">
        <CardContent className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 text-stone-500 mx-auto flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white">Brak aktywnych wypożyczeń</h4>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Nie masz jeszcze żadnych złożonych wniosków. Przeglądaj katalog i pożyczaj sprzęt od sąsiadów w Rzeszowie.
          </p>
          <div className="pt-2">
            <Link href="/">
              <Button variant="primary" size="sm">
                Przeglądaj katalog narzędzi
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {rentals.map((r) => {
        const start = new Date(r.startDate).toLocaleDateString('pl-PL');
        const end = new Date(r.endDate).toLocaleDateString('pl-PL');
        const isUnlocked = r.status === 'APPROVED' || r.status === 'ACTIVE';
        const isPending = r.status === 'PENDING';
        const isReturned = r.status === 'RETURNED';

        return (
          <div
            key={r.id}
            className="p-4 sm:p-5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-4 transition hover:border-stone-700/80"
          >
            {/* GÓRNY PASEK: KATEGORIA, TYTUŁ, STATUS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-stone-950 border border-stone-800 shrink-0 flex items-center justify-center">
                  {getFirstImage(r.item.imagesJson) ? (
                    <img
                      src={getFirstImage(r.item.imagesJson)!}
                      alt={r.item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Wrench className="w-6 h-6 text-stone-600 stroke-1" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-orange-400">
                      {r.item.category?.name || 'Sprzęt'}
                    </span>
                    <span className="text-stone-600">•</span>
                    <span className="text-[11px] text-stone-400">
                      {r.item.neighborLoc}
                    </span>
                  </div>
                  <Link
                    href={`/items/${r.item.id}`}
                    className="text-sm sm:text-base font-bold text-white hover:text-orange-400 transition"
                  >
                    {r.item.title}
                  </Link>
                  <div className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-500" />
                    <span>
                      {start} – {end} ({r.days} {r.days === 1 ? 'doba' : 'doby'})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-xs text-stone-400 block">Opłacono</span>
                  <span className="text-sm sm:text-base font-extrabold text-white">
                    {r.totalPaid} zł
                  </span>
                  {r.depositAmount > 0 && (
                    <span className="text-[10px] text-stone-500 block">
                      (w tym {r.depositAmount} zł kaucji)
                    </span>
                  )}
                </div>
                <StatusBadge status={r.status as RentalStatus} />
              </div>
            </div>

            {/* SEKCJA ODBLOKOWANEGO ODBIORU DLA APPROVED I ACTIVE */}
            {isUnlocked && (
              <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-orange-400 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Odbiór sprzętu od sąsiada: {r.item.owner.name}</span>
                  </div>
                  <div className="text-xs text-stone-300 space-y-0.5">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      <span className="font-semibold text-white">
                        {r.item.owner.exactAddress || 'Adres do uzgodnienia z właścicielem'}
                      </span>
                      {r.item.owner.neighborhood && (
                        <span className="text-stone-400">({r.item.owner.neighborhood})</span>
                      )}
                    </p>
                    {r.item.owner.phone && (
                      <p className="flex items-center gap-1.5 text-stone-400">
                        <Phone className="w-3.5 h-3.5 text-stone-500" />
                        <span>Tel: {r.item.owner.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-center shrink-0">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Twój kod PIN do odbioru
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-orange-400 tracking-widest font-mono">
                    {r.pickupPin}
                  </span>
                  <span className="text-[10px] text-stone-500 block">
                    Okaż właścicielowi
                  </span>
                </div>
              </div>
            )}

            {/* KOMUNIKAT DLA PENDING */}
            {isPending && (
              <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 text-xs text-stone-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    Wniosek oczekuje na decyzję sąsiada ({r.item.owner.name}). Dokładny adres i kod PIN pojawią się natychmiast po akceptacji.
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancel(r.id)}
                  isLoading={cancellingId === r.id}
                  className="text-stone-400 hover:text-red-400 hover:border-red-500/40 shrink-0"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Anuluj wniosek
                </Button>
              </div>
            )}

            {/* SEKCJA OCENY DLA RETURNED */}
            {isReturned && (
              <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                {r.review ? (
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <span className="font-semibold text-stone-300">Twoja opinia:</span>
                    <div className="flex items-center text-amber-400">
                      {Array.from({ length: r.review.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="italic text-stone-400 truncate max-w-xs">
                      &quot;{r.review.comment}&quot;
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-stone-400">
                      Wypożyczenie zakończone. Jak oceniasz sprzęt sąsiada?
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        setReviewModalData({
                          rentalId: r.id,
                          itemTitle: r.item.title,
                        })
                      }
                    >
                      <Star className="w-3.5 h-3.5 mr-1 text-amber-400 fill-amber-400" />
                      Wystaw opinię
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* MODAL RECENZJI */}
      {reviewModalData && (
        <ReviewModal
          isOpen={true}
          onClose={() => setReviewModalData(null)}
          rentalRequestId={reviewModalData.rentalId}
          itemTitle={reviewModalData.itemTitle}
          onSuccess={() => {
            setReviewModalData(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
