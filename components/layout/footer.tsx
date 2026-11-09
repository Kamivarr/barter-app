'use client';

import React from 'react';
import Link from 'next/link';
import { Handshake, ShieldCheck, KeyRound, Sparkles, MapPin, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = 2026;
  return (
    <footer className="border-t border-stone-800 bg-stone-950 mt-auto text-stone-400 text-xs">
      {/* PASEK ZAUFANIA I BEZPIECZEŃSTWA */}
      <div className="border-b border-stone-850 bg-stone-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-900/60 border border-stone-800/80">
              <div className="p-2 rounded-lg bg-orange-600/15 text-orange-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-semibold text-white text-xs">15% opłaty serwisowej</h5>
                <p className="text-[11px] text-stone-400">Przejrzysty model prowizyjny</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-900/60 border border-stone-800/80">
              <div className="p-2 rounded-lg bg-emerald-600/15 text-emerald-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-semibold text-white text-xs">Bezpieczny odbiór PIN</h5>
                <p className="text-[11px] text-stone-400">Weryfikacja kodem przy odbiorze</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-900/60 border border-stone-800/80">
              <div className="p-2 rounded-lg bg-blue-600/15 text-blue-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-semibold text-white text-xs">Dzielnice Rzeszowa</h5>
                <p className="text-[11px] text-stone-400">Sprzęt od sąsiada z Twojej ulicy</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-900/60 border border-stone-800/80">
              <div className="p-2 rounded-lg bg-amber-600/15 text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-semibold text-white text-xs">Kaucja zwrotna</h5>
                <p className="text-[11px] text-stone-400">Gwarancja dbałości o sprzęt</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GŁÓWNA ZAWARTOŚĆ STOPKI */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Kolumna 1: Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="bg-orange-600 p-1.5 rounded-lg text-white">
                <Handshake className="w-4 h-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">Barter App</span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              Sąsiedzka platforma ekonomii współdzielenia sprzętu remontowego, budowlanego i ogrodniczego w Rzeszowie. Po co kupować drogie narzędzie na jeden raz, skoro Twój sąsiad ma je w garażu?
            </p>
          </div>

          {/* Kolumna 2: Szybkie linki */}
          <div className="space-y-2">
            <h6 className="font-bold text-white uppercase tracking-wider text-[11px]">Nawigacja</h6>
            <ul className="space-y-1.5">
              <li>
                <Link href="/" className="hover:text-orange-400 transition-colors">
                  Katalog sprzętu
                </Link>
              </li>
              <li>
                <Link href="/items/new" className="hover:text-orange-400 transition-colors">
                  Wystaw swój sprzęt (Krok 01)
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-orange-400 transition-colors">
                  Panel wypożyczeń i odbiorów (Krok 03)
                </Link>
              </li>
              <li>
                <Link href="/dashboard?tab=pm" className="hover:text-orange-400 transition-colors">
                  Model finansowy i prowizyjny
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolumna 3: Lokalizacje Rzeszów */}
          <div className="space-y-2">
            <h6 className="font-bold text-white uppercase tracking-wider text-[11px]">Lokalizacje</h6>
            <p className="text-stone-400 text-xs">
              Dostępne w dzielnicach: Nowe Miasto, Drabinianka, Baranówka, Zalesie, Słocina, Staromieście oraz Śródmieście.
            </p>
          </div>
        </div>

        {/* Dolna belka z prawami */}
        <div className="border-t border-stone-850 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500">
          <p>© {currentYear} Barter App. Wszelkie prawa zastrzeżone.</p>
          <p className="flex items-center gap-1">
            Zbudowane z myślą o lokalnych społecznościach <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
