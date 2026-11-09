'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  PlusCircle,
  Edit3,
  Power,
  ExternalLink,
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toggleItemAvailabilityAction } from '@/app/actions/item.actions';
import { TOOL_CONDITION_LABELS, ToolCondition, getFirstImage } from '@/types/domain';

interface OwnerItem {
  id: string;
  title: string;
  description: string;
  dailyPrice: number;
  depositAmount: number;
  condition: string;
  neighborLoc: string;
  imagesJson?: string;
  isAvailable: boolean;
  category?: { name: string };
  reviews?: { id: string; rating: number }[];
}

interface OwnerItemsListProps {
  items: OwnerItem[];
  onRefresh: () => void;
}

export function OwnerItemsList({ items, onRefresh }: OwnerItemsListProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleToggle(itemId: string) {
    setTogglingId(itemId);
    try {
      const res = await toggleItemAvailabilityAction(itemId);
      if (res.success) {
        onRefresh();
      } else {
        alert(res.message || 'Nie udało się zmienić dostępności.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      alert(msg || 'Błąd połączenia.');
    } finally {
      setTogglingId(null);
    }
  }

  const activeCount = items.filter((i) => i.isAvailable).length;

  return (
    <div className="space-y-4">
      {/* PASEK ZARZĄDZANIA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-stone-900/60 border border-stone-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
            Twoje wystawione narzędzia
          </span>
          <p className="text-xs text-stone-300 mt-0.5">
            Łącznie: <strong className="text-white">{items.length}</strong> narzędzi •{' '}
            <strong className="text-emerald-400">{activeCount}</strong> aktywnych w katalogu
          </p>
        </div>

        <Link href="/items/new">
          <Button variant="primary" size="sm" className="shadow-md shadow-orange-600/25">
            <PlusCircle className="w-4 h-4 mr-1.5" /> Dodaj nowy sprzęt
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <Card className="border-stone-800 bg-stone-900/40 text-center py-12 px-4">
          <CardContent className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 text-stone-500 mx-auto flex items-center justify-center">
              <Wrench className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Nie wystawiłeś jeszcze żadnego sprzętu</h4>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Zarabiaj na narzędziach leżących w piwnicy lub garażu. Dodaj swoje pierwsze ogłoszenie.
            </p>
            <div className="pt-2">
              <Link href="/items/new">
                <Button variant="primary" size="sm">
                  Wystaw pierwszy sprzęt
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const reviewsCount = item.reviews?.length || 0;
            const avgRating =
              reviewsCount > 0
                ? (
                    (item.reviews?.reduce((acc, r) => acc + r.rating, 0) || 0) / reviewsCount
                  ).toFixed(1)
                : null;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-3 transition hover:border-stone-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-stone-950 border border-stone-800 shrink-0 flex items-center justify-center">
                      {getFirstImage(item.imagesJson) ? (
                        <img
                          src={getFirstImage(item.imagesJson)!}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Wrench className="w-6 h-6 text-stone-600 stroke-1" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-orange-400">
                          {item.category?.name || 'Sprzęt'}
                        </span>
                        <span className="text-stone-600">•</span>
                        <Badge variant={item.isAvailable ? 'success' : 'default'}>
                          {item.isAvailable ? 'Widoczne w katalogu' : 'Ukryte'}
                        </Badge>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                        {item.title}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                        <span className="font-semibold text-orange-400">
                          {item.dailyPrice} zł / doba
                        </span>
                        {item.depositAmount > 0 && (
                          <span>Kaucja: {item.depositAmount} zł</span>
                        )}
                        {avgRating && (
                          <span className="flex items-center gap-1 text-amber-400">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {avgRating} ({reviewsCount})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AKCJE ZARZĄDZANIA */}
                  <div className="flex items-center gap-2 self-end sm:self-auto pt-2 sm:pt-0">
                    <Button
                      variant={item.isAvailable ? 'outline' : 'success'}
                      size="sm"
                      onClick={() => handleToggle(item.id)}
                      isLoading={togglingId === item.id}
                      title={item.isAvailable ? 'Ukryj w katalogu' : 'Aktywuj w katalogu'}
                    >
                      <Power className="w-3.5 h-3.5 mr-1" />
                      {item.isAvailable ? 'Zawieś' : 'Aktywuj'}
                    </Button>

                    <Link href={`/items/${item.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit3 className="w-3.5 h-3.5 mr-1" /> Edytuj
                      </Button>
                    </Link>

                    <Link href={`/items/${item.id}`} target="_blank">
                      <Button variant="ghost" size="sm" title="Otwórz podgląd oferty">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
