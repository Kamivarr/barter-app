'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Lock,
  Loader2,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createRentalRequestAction } from '@/app/actions/rental.actions';

export interface BookedRange {
  startDate: Date | string;
  endDate: Date | string;
  status?: string;
}

interface AvailabilityCalendarProps {
  itemId: string;
  dailyPrice: number;
  depositAmount: number;
  isAvailable: boolean;
  bookedRanges: BookedRange[];
  isOwner?: boolean;
}

function normalizeDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toISOString().split('T')[0];
}

function isDateInRange(targetDateStr: string, start: Date | string, end: Date | string): boolean {
  const target = new Date(targetDateStr).getTime();
  const s = new Date(normalizeDate(start)).getTime();
  const e = new Date(normalizeDate(end)).getTime();
  return target >= s && target <= e;
}

const MONTH_NAMES = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
];

const WEEKDAY_NAMES = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

export function AvailabilityCalendar({
  itemId,
  dailyPrice,
  depositAmount,
  isAvailable,
  bookedRanges,
  isOwner = false,
}: AvailabilityCalendarProps) {
  const router = useRouter();
  const today = new Date();
  const todayStr = normalizeDate(today);

  // Aktualnie przeglądany miesiąc w kalendarzu
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Wybrany zakres rezerwacji
  const defaultStart = new Date(today.getTime() + 86400000); // domyślnie jutro
  const [selectedStart, setSelectedStart] = useState<string>(normalizeDate(defaultStart));
  const [selectedEnd, setSelectedEnd] = useState<string>(
    normalizeDate(new Date(defaultStart.getTime() + 2 * 86400000))
  );

  const [blikCode, setBlikCode] = useState('749201');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Generowanie dni dla aktualnego widoku miesiąca
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Poniedziałek = 0

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  // Sprawdzenie, czy dany dzień jest zarezerwowany
  function isDayBooked(dateStr: string): boolean {
    return bookedRanges.some((range) => isDateInRange(dateStr, range.startDate, range.endDate));
  }

  function handleDateClick(dateStr: string) {
    if (dateStr < todayStr || isDayBooked(dateStr)) return;

    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(dateStr);
      setSelectedEnd('');
      setErrorMessage('');
    } else {
      if (dateStr < selectedStart) {
        setSelectedStart(dateStr);
        setSelectedEnd('');
      } else {
        // Sprawdź, czy zakres nie nachodzi na zablokowany dzień
        const hasBookedBetween = bookedRanges.some((range) => {
          const s = new Date(selectedStart).getTime();
          const e = new Date(dateStr).getTime();
          const rStart = new Date(normalizeDate(range.startDate)).getTime();
          const rEnd = new Date(normalizeDate(range.endDate)).getTime();
          return Math.max(s, rStart) <= Math.min(e, rEnd);
        });

        if (hasBookedBetween) {
          setErrorMessage('Wybrany przedział obejmuje dni, w których sprzęt jest już zarezerwowany.');
        } else {
          setSelectedEnd(dateStr);
          setErrorMessage('');
        }
      }
    }
  }

  // Obliczenie liczby dni
  let calculatedDays = 1;
  if (selectedStart && selectedEnd) {
    const diffMs = new Date(selectedEnd).getTime() - new Date(selectedStart).getTime();
    calculatedDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  }

  const baseRental = calculatedDays * dailyPrice;
  const commission = Math.round(baseRental * 0.15 * 100) / 100;
  const deposit = depositAmount || 0;
  const totalAmount = Math.round((baseRental + commission + deposit) * 100) / 100;

  async function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStart) {
      setErrorMessage('Wybierz termin rozpoczęcia wypożyczenia.');
      return;
    }

    if (blikCode.length !== 6) {
      setErrorMessage('Wprowadź prawidłowy 6-cyfrowy kod BLIK.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await createRentalRequestAction({
        itemId,
        startDate: selectedStart,
        endDate: selectedEnd,
        blikCode,
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Wystąpił błąd podczas zatwierdzania rezerwacji.');
        setIsSubmitting(false);
        return;
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Błąd rezerwacji:', err);
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('zalogowany')) {
        router.push(`/login?redirect=${encodeURIComponent(`/items/${itemId}`)}`);
      } else {
        setErrorMessage(msg || 'Wystąpił błąd podczas zatwierdzania rezerwacji.');
      }
    }
  }

  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* NAGŁÓWEK KALENDARZA */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-800">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-orange-500" />
            Terminy i Rezerwacja
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Wybierz dostępne dni w kalendarzu. Dni zarezerwowane są zablokowane.
          </p>
        </div>
      </div>

      {isOwner && (
        <div className="p-3.5 bg-orange-950/30 border border-orange-500/30 rounded-xl text-xs text-orange-300 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-orange-400" />
          <span>Jesteś właścicielem tego przedmiotu. Możesz sprawdzać jego dostępność i terminy.</span>
        </div>
      )}

      {/* KALENDARZ MIESIĘCZNY */}
      <div className="space-y-3">
        {/* Nawigacja miesiąca */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800 cursor-pointer transition"
            aria-label="Poprzedni miesiąc"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm text-stone-100">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800 cursor-pointer transition"
            aria-label="Następny miesiąc"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dni tygodnia */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-stone-400">
          {WEEKDAY_NAMES.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>

        {/* Siatka dni */}
        <div className="grid grid-cols-7 gap-1">
          {/* Puste sloty przed pierwszym dniem */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Dni miesiąca */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const currentDayDate = new Date(year, month, dayNum);
            const dateStr = normalizeDate(currentDayDate);

            const isPast = dateStr < todayStr;
            const isBooked = isDayBooked(dateStr);
            const isToday = dateStr === todayStr;

            const isStart = dateStr === selectedStart;
            const isEnd = dateStr === selectedEnd;
            const isSelectedRange =
              selectedStart &&
              selectedEnd &&
              dateStr >= selectedStart &&
              dateStr <= selectedEnd;

            let dayStyle = 'bg-stone-950 text-stone-200 hover:bg-stone-800 hover:text-white border-stone-850';

            if (isPast) {
              dayStyle = 'bg-stone-950/40 text-stone-600 border-transparent cursor-not-allowed';
            } else if (isBooked) {
              dayStyle = 'bg-red-950/40 text-red-400/80 border-red-500/20 line-through cursor-not-allowed';
            } else if (isStart || isEnd) {
              dayStyle = 'bg-orange-600 text-white font-bold border-orange-500 shadow-md shadow-orange-600/30';
            } else if (isSelectedRange) {
              dayStyle = 'bg-orange-950/60 text-orange-200 border-orange-500/30';
            }

            return (
              <button
                key={dateStr}
                type="button"
                disabled={isPast || isBooked || isOwner}
                onClick={() => handleDateClick(dateStr)}
                title={
                  isBooked
                    ? 'Termin zarezerwowany'
                    : isPast
                    ? 'Dzień miniony'
                    : `Wybierz ${dayNum} ${MONTH_NAMES[month]}`
                }
                className={`aspect-square rounded-xl text-xs font-semibold flex flex-col items-center justify-center border transition-all cursor-pointer relative ${dayStyle}`}
              >
                <span>{dayNum}</span>
                {isToday && !isStart && !isEnd && (
                  <span className="w-1 h-1 rounded-full bg-orange-400 absolute bottom-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legenda kalendarza */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-800/80 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-orange-600 inline-block" />
            <span>Wybrany termin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-950 border border-red-500/30 inline-block" />
            <span>Zajęty / Wypożyczony</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-stone-950 border border-stone-800 inline-block" />
            <span>Dostępny</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* PODSUMOWANIE FINANSOWE (MODEL 15% PROWIZJI) */}
      <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2.5 text-xs">
        <div className="flex justify-between text-stone-400">
          <span>
            Okres: {selectedStart || '—'} {selectedEnd ? `do ${selectedEnd}` : ''} ({calculatedDays}{' '}
            {calculatedDays === 1 ? 'doba' : 'doby'}):
          </span>
          <span className="font-semibold text-stone-200">{baseRental.toFixed(2)} zł</span>
        </div>
        <div className="flex justify-between text-stone-400">
          <span className="flex items-center gap-1">
            Prowizja platformy Barter (15%):
            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
          </span>
          <span className="font-semibold text-orange-400">+{commission.toFixed(2)} zł</span>
        </div>
        {deposit > 0 && (
          <div className="flex justify-between text-stone-400">
            <span>Kaucja zwrotna:</span>
            <span className="font-semibold text-emerald-400">+{deposit.toFixed(2)} zł</span>
          </div>
        )}
        <div className="pt-2 border-t border-stone-800 flex justify-between text-sm font-extrabold text-white">
          <span>Łącznie do zapłaty BLIK:</span>
          <span className="text-base text-orange-500">{totalAmount.toFixed(2)} zł</span>
        </div>
      </div>

      {/* FORMULARZ BLIK I ZATWIERDZENIE REZERWACJI */}
      {!isOwner && (
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <Input
            label="Szybka płatność BLIK"
            type="text"
            maxLength={6}
            value={blikCode}
            onChange={(e) => setBlikCode(e.target.value.replace(/\D/g, ''))}
            placeholder="749201"
            helperText="Wpisz 6 cyfr z aplikacji mobilnej Twojego banku"
            disabled={isSubmitting}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold shadow-lg shadow-orange-600/30"
            isLoading={isSubmitting}
            disabled={!selectedStart || blikCode.length !== 6 || !isAvailable}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Zapłać {totalAmount.toFixed(2)} zł i odbierz PIN
          </Button>

          <p className="text-[11px] text-stone-500 text-center leading-tight">
            Po opłaceniu otrzymasz 4-cyfrowy kod PIN odbioru do okazania właścicielowi sprzętu. Kaucja zostanie odblokowana po zwrocie.
          </p>
        </form>
      )}
    </div>
  );
}
