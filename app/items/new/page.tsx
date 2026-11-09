import React from 'react';
import Link from 'next/link';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { MultiStepItemForm } from '@/components/items/multi-step-item-form';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Wystaw sprzęt sąsiadom – Barter Rzeszów',
  description: 'Dodaj narzędzie do lokalnego katalogu w Rzeszowie i zacznij zarabiać na leżącym w garażu sprzęcie.',
};

export default async function NewItemPage() {
  // Weryfikacja sesji użytkownika
  await requireAuth();

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
    },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Pasek nawigacyjny powrotu */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Wróć do katalogu
        </Link>
        <Badge variant="primary">KROK 01 • Wystawienie sprzętu</Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-orange-600/15 text-orange-400">
          <PlusCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Wystaw sprzęt sąsiadom
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Wypełnij 3 proste kroki, aby udostępnić swoje narzędzia społeczności w Rzeszowie.
          </p>
        </div>
      </div>

      <MultiStepItemForm categories={categories} />
    </div>
  );
}
