'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  User,
  ShieldCheck,
  Star,
  AlertCircle,
  Check,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { StatusBadge } from '@/components/rentals/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  respondToRentalRequestAction,
  verifyPickupPinAndActivateAction,
  completeReturnAction,
} from '@/app/actions/rental.actions';
import { RentalStatus } from '@/types/domain';

interface OwnerRentalItem {
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
  };
  renter: {
    id: string;
    name: string;
    email: string;
    neighborhood?: string | null;
    avatarUrl?: string | null;
    phone?: string | null;
  };
  review?: {
    id: string;
    rating: number;
    comment: string;
  } | null;
}

interface OwnerRequestsListProps {
  rentals: OwnerRentalItem[];
  onRefresh: () => void;
}

export function OwnerRequestsList({ rentals, onRefresh }: OwnerRequestsListProps) {
  // Stan weryfikacji PIN per rezerwacja
  const [pinInputs, setPinInputs] = useState<Record<string, string>>({});
  const [pinErrors, setPinErrors] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingRequests = rentals.filter((r) => r.status === 'PENDING');
  const approvedRentals = rentals.filter((r) => r.status === 'APPROVED');
  const activeRentals = rentals.filter((r) => r.status === 'ACTIVE');
  const finishedRentals = rentals.filter(
    (r) => r.status === 'RETURNED' || r.status === 'CANCELLED'
  );

  async function handleDecision(rentalId: string, decision: 'APPROVE' | 'CANCEL') {
    setProcessingId(rentalId);
    try {
      const res = await respondToRentalRequestAction(rentalId, decision);
      if (res.success) {
        onRefresh();
      } else {
        alert(res.message || 'Wystąpił błąd.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      alert(msg || 'Błąd połączenia.');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleVerifyPin(rentalId: string) {
    const pin = (pinInputs[rentalId] || '').trim();
    if (pin.length !== 4) {
      setPinErrors((prev) => ({
        ...prev,
        [rentalId]: 'Wprowadź dokładnie 4-cyfrowy kod PIN.',
      }));
      return;
    }

    setProcessingId(rentalId);
    setPinErrors((prev) => ({ ...prev, [rentalId]: '' }));

    try {
      const res = await verifyPickupPinAndActivateAction(rentalId, pin);
      if (res.success) {
        onRefresh();
      } else {
        setPinErrors((prev) => ({
          ...prev,
          [rentalId]: res.message || 'Błędny kod PIN.',
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setPinErrors((prev) => ({
        ...prev,
        [rentalId]: msg || 'Błąd serwera.',
      }));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleCompleteReturn(rentalId: string) {
    if (!confirm('Czy potwierdzasz odbiór sprawnego sprzętu i zwrot kaucji sąsiadowi?')) {
      return;
    }

    setProcessingId(rentalId);
    try {
      const res = await completeReturnAction(rentalId);
      if (res.success) {
        onRefresh();
      } else {
        alert(res.message || 'Wystąpił błąd.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      alert(msg || 'Błąd połączenia.');
    } finally {
      setProcessingId(null);
    }
  }

  if (rentals.length === 0) {
    return (
      <Card className="border-stone-800 bg-stone-900/40 text-center py-12 px-4">
        <CardContent className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 text-stone-500 mx-auto flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white">Brak wniosków o Twoje narzędzia</h4>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Gdy sąsiedzi wyślą prośbę o wypożyczenie Twojego sprzętu, zobaczysz ich wnioski w tym miejscu.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. WNIOSKI OCZEKUJĄCE NA DECYZJĘ (PENDING) */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Wnioski oczekujące na Twoją decyzję ({pendingRequests.length})
            </h4>
          </div>

          <div className="space-y-3">
            {pendingRequests.map((r) => {
              const start = new Date(r.startDate).toLocaleDateString('pl-PL');
              const end = new Date(r.endDate).toLocaleDateString('pl-PL');

              return (
                <div
                  key={r.id}
                  className="p-4 sm:p-5 rounded-2xl bg-amber-950/15 border border-amber-500/30 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {r.renter.name}
                        </span>
                        {r.renter.neighborhood && (
                          <span className="text-[11px] text-stone-400">
                            ({r.renter.neighborhood})
                          </span>
                        )}
                        <span className="text-stone-600">•</span>
                        <span className="text-xs text-stone-400">chce wypożyczyć:</span>
                      </div>
                      <Link
                        href={`/items/${r.item.id}`}
                        className="text-sm font-bold text-white hover:text-orange-400 transition"
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

                    <div className="text-right">
                      <span className="text-xs text-stone-400 block">Twój zysk netto</span>
                      <span className="text-base font-extrabold text-emerald-400">
                        +{r.ownerAmount} zł
                      </span>
                      {r.depositAmount > 0 && (
                        <span className="text-[10px] text-stone-500 block">
                          (+{r.depositAmount} zł kaucji)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-500/20">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDecision(r.id, 'CANCEL')}
                      isLoading={processingId === r.id}
                      className="text-stone-400 hover:text-red-400 hover:border-red-500/40"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Odrzuć
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDecision(r.id, 'APPROVE')}
                      isLoading={processingId === r.id}
                      className="shadow-md shadow-orange-600/30"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Zatwierdź wypożyczenie
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. ZATWIERDZONE – OCZEKUJĄCE NA KOD PIN I WYDANIE (APPROVED) */}
      {approvedRentals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-orange-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Gotowe do wydania sąsiadowi – Weryfikacja PIN ({approvedRentals.length})
            </h4>
          </div>

          <div className="space-y-3">
            {approvedRentals.map((r) => {
              const start = new Date(r.startDate).toLocaleDateString('pl-PL');
              const end = new Date(r.endDate).toLocaleDateString('pl-PL');
              const err = pinErrors[r.id];

              return (
                <div
                  key={r.id}
                  className="p-4 sm:p-5 rounded-2xl bg-orange-950/20 border border-orange-500/40 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="warning">Zatwierdzone</Badge>
                        <span className="text-xs text-stone-300">
                          Sąsiad: <strong className="text-white">{r.renter.name}</strong>
                        </span>
                        {r.renter.phone && (
                          <span className="text-xs text-stone-400">• tel: {r.renter.phone}</span>
                        )}
                      </div>
                      <h5 className="text-sm font-bold text-white mt-1">{r.item.title}</h5>
                      <span className="text-xs text-stone-400">
                        Termin: {start} – {end} ({r.days} dób) • Twój zysk: {r.ownerAmount} zł
                      </span>
                    </div>
                  </div>

                  {/* FORMULARZ WPROWADZENIA KODU PIN OD SĄSIADA */}
                  <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                    <span className="text-xs font-semibold text-stone-300 block">
                      Wprowadź 4-cyfrowy kod PIN okazany przez {r.renter.name}:
                    </span>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="np. 4821"
                        value={pinInputs[r.id] || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPinInputs((prev) => ({
                            ...prev,
                            [r.id]: e.target.value.replace(/\D/g, ''),
                          }))
                        }
                        className="w-28 bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-center text-lg font-black tracking-widest text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                      />
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleVerifyPin(r.id)}
                        isLoading={processingId === r.id}
                        className="shrink-0"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Zweryfikuj PIN i wydaj sprzęt
                      </Button>
                    </div>

                    {err && (
                      <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {err}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SPRZĘT W UŻYCIU U SĄSIADA (ACTIVE) */}
      {activeRentals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Sprzęt aktualnie w użyciu u sąsiadów ({activeRentals.length})
            </h4>
          </div>

          <div className="space-y-3">
            {activeRentals.map((r) => {
              const start = new Date(r.startDate).toLocaleDateString('pl-PL');
              const end = new Date(r.endDate).toLocaleDateString('pl-PL');

              return (
                <div
                  key={r.id}
                  className="p-4 sm:p-5 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status="ACTIVE" />
                      <span className="text-xs text-stone-300">
                        Wypożycza: <strong className="text-white">{r.renter.name}</strong>
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-white">{r.item.title}</h5>
                    <p className="text-xs text-stone-400">
                      Okres wynajmu: {start} – {end} ({r.days} dób)
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleCompleteReturn(r.id)}
                      isLoading={processingId === r.id}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      Potwierdź zwrot sprzętu
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. HISTORIA ZAKOŃCZONYCH (RETURNED / CANCELLED) */}
      {finishedRentals.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Historia zakończonych wypożyczeń ({finishedRentals.length})
          </h4>

          <div className="space-y-2">
            {finishedRentals.map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-semibold text-white">{r.item.title}</span>
                  <span className="text-stone-500 block text-[11px]">
                    Sąsiad: {r.renter.name} • {r.days} dób
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {r.review && (
                    <div className="hidden sm:flex items-center gap-1 text-amber-400 text-xs">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{r.review.rating}/5</span>
                    </div>
                  )}
                  <StatusBadge status={r.status as RentalStatus} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
