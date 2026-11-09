'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  KeyRound,
  TrendingUp,
  CheckCircle2,
  PlusCircle,
  MapPin,
  Inbox,
  Package,
} from 'lucide-react';
import { getUserDashboardDataAction } from '@/app/actions/rental.actions';
import { RenterRentalsList } from '@/components/dashboard/renter-rentals-list';
import { OwnerRequestsList } from '@/components/dashboard/owner-requests-list';
import { OwnerItemsList } from '@/components/dashboard/owner-items-list';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export type DashboardData = Awaited<ReturnType<typeof getUserDashboardDataAction>>;

type DashboardTab = 'borrowed' | 'owner-requests' | 'my-items' | 'pm';

export interface DashboardClientViewProps {
  initialData: DashboardData;
  initialTab?: string;
}

export function DashboardClientView({ initialData, initialTab }: DashboardClientViewProps) {
  const initialSelectedTab: DashboardTab =
    initialTab === 'pm'
      ? 'pm'
      : initialTab === 'owner'
      ? 'owner-requests'
      : initialTab === 'items'
      ? 'my-items'
      : 'borrowed';

  const [activeTab, setActiveTab] = useState<DashboardTab>(initialSelectedTab);
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialData);

  async function handleRefresh() {
    try {
      const refreshed = await getUserDashboardDataAction();
      setDashboardData(refreshed);
    } catch (err: unknown) {
      console.error('Błąd odświeżania danych pulpitu:', err);
    }
  }

  const { currentUser, borrowedRentals, ownerRentals, myItems, platformStats } = dashboardData;

  const pendingOwnerCount = ownerRentals.filter((r) => r.status === 'PENDING').length;
  const activeBorrowedCount = borrowedRentals.filter(
    (r) => r.status === 'APPROVED' || r.status === 'ACTIVE'
  ).length;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* NAGŁÓWEK DASHBOARDU */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-stone-950 border border-stone-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/30 text-orange-400 flex items-center justify-center font-black text-xl shrink-0">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white">
                Witaj, {currentUser?.name || 'Użytkowniku'}!
              </h1>
              <Badge variant="primary">Konto sąsiedzkie</Badge>
            </div>
            <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span>
                {currentUser?.neighborhood || 'Rzeszów'} • {currentUser?.email}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/items/new">
            <Button variant="primary" size="sm" className="shadow-lg shadow-orange-600/30">
              <PlusCircle className="w-4 h-4 mr-1.5" /> Wystaw sprzęt
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              Katalog
            </Button>
          </Link>
        </div>
      </div>

      {/* ZAKŁADKI RÓL (Wypożyczający / Właściciel / Narzędzia / Model Prowizyjny) */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2 overflow-x-auto scrollbar-none no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('borrowed')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'borrowed'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
              : 'bg-stone-900/60 text-stone-400 hover:text-white hover:bg-stone-800'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Wypożyczam od sąsiadów</span>
          {activeBorrowedCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-stone-950 font-black text-[10px] flex items-center justify-center">
              {activeBorrowedCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('owner-requests')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'owner-requests'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
              : 'bg-stone-900/60 text-stone-400 hover:text-white hover:bg-stone-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Wypożyczenia mojego sprzętu</span>
          {pendingOwnerCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-black text-[10px] flex items-center justify-center animate-pulse">
              {pendingOwnerCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my-items')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'my-items'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
              : 'bg-stone-900/60 text-stone-400 hover:text-white hover:bg-stone-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Moje narzędzia</span>
          <span className="text-xs opacity-75">({myItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pm')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'pm'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
              : 'bg-stone-900/60 text-stone-400 hover:text-white hover:bg-stone-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Model Prowizyjny (15%)</span>
        </button>
      </div>

      {/* ZAWARTOŚĆ WYBRANEJ ZAKŁADKI */}
      {activeTab === 'borrowed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              Sprzęt, który wypożyczasz od sąsiadów
            </h3>
            <span className="text-xs text-stone-400">
              Łącznie: {borrowedRentals.length} wniosków
            </span>
          </div>
          <RenterRentalsList rentals={borrowedRentals} onRefresh={handleRefresh} />
        </div>
      )}

      {activeTab === 'owner-requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              Wnioski o wypożyczenie Twoich narzędzi
            </h3>
            <span className="text-xs text-stone-400">
              Łącznie: {ownerRentals.length} transakcji
            </span>
          </div>
          <OwnerRequestsList rentals={ownerRentals} onRefresh={handleRefresh} />
        </div>
      )}

      {activeTab === 'my-items' && (
        <div className="space-y-4">
          <OwnerItemsList items={myItems} onRefresh={handleRefresh} />
        </div>
      )}

      {activeTab === 'pm' && platformStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-stone-800 bg-stone-900/60">
              <CardContent className="p-4 sm:p-5 space-y-1">
                <span className="text-xs text-stone-400 block">Wszystkie rezerwacje</span>
                <span className="text-2xl font-black text-white">
                  {platformStats.totalRentalsCount}
                </span>
                <span className="text-[11px] text-stone-500 block">
                  w bazie platformy Barter
                </span>
              </CardContent>
            </Card>

            <Card className="border-stone-800 bg-stone-900/60">
              <CardContent className="p-4 sm:p-5 space-y-1">
                <span className="text-xs text-stone-400 block">Aktywne wypożyczenia</span>
                <span className="text-2xl font-black text-emerald-400">
                  {platformStats.activeRentalsCount}
                </span>
                <span className="text-[11px] text-stone-500 block">
                  sprzęt w rękach sąsiadów
                </span>
              </CardContent>
            </Card>

            <Card className="border-stone-800 bg-stone-900/60">
              <CardContent className="p-4 sm:p-5 space-y-1">
                <span className="text-xs text-stone-400 block">Łączny wolumen (GMV)</span>
                <span className="text-2xl font-black text-white">
                  {Math.round(platformStats.totalVolume)} zł
                </span>
                <span className="text-[11px] text-stone-500 block">
                  wypłacone kaucje + stawki
                </span>
              </CardContent>
            </Card>

            <Card className="border-stone-800 bg-stone-900/60">
              <CardContent className="p-4 sm:p-5 space-y-1">
                <span className="text-xs text-stone-400 block">Prowizja Barter (15%)</span>
                <span className="text-2xl font-black text-orange-400">
                  {Math.round(platformStats.totalCommission)} zł
                </span>
                <span className="text-[11px] text-stone-500 block">
                  przychód serwisu z prowizji
                </span>
              </CardContent>
            </Card>
          </div>

          <Card className="border-stone-800 bg-stone-900/60">
            <CardHeader>
              <CardTitle className="text-base">Założenia modelu prowizyjnego Barter</CardTitle>
              <CardDescription>
                Przejrzyste reguły rozliczeń sąsiedzkich w Rzeszowie:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm text-stone-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>100% stawki bazowej dla Właściciela:</strong> Jeśli wystawisz sprzęt za 50 zł/doba na 2 dni, Twoja kwota bazowa wynosi 100 zł.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>
                  <strong>15% opłaty serwisowej Barter:</strong> Doliczane do kwoty wynajmu na pokrycie ubezpieczenia transakcji, weryfikacji PIN i infrastruktury (np. 15 zł).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Kaucja zwrotna w 100% bez prowizji:</strong> Depozyt jest blokowany i w całości zwalniany po potwierdzeniu zwrotu przez właściciela.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
