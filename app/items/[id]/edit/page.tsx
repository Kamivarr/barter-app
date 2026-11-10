import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit3, ShieldAlert } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { MultiStepItemForm } from '@/components/items/multi-step-item-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EditItemPageProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

export const metadata = {
  title: 'Edycja ogłoszenia – Barter Rzeszów',
  description: 'Zaktualizuj dane, cenę lub zasady wypożyczenia swojego sprzętu.',
};

export default async function EditItemPage({ params }: EditItemPageProps) {
  const sessionUser = await requireAuth();
  const { id } = await params;

  const item = await prisma.item.findUnique({
    where: { id },
  });

  if (!item) {
    notFound();
  }

  // Weryfikacja właściciela (403 Forbidden)
  if (item.ownerId !== sessionUser.id) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-950/50 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">403 – Brak uprawnień</h2>
        <p className="text-xs text-stone-400">
          Możesz edytować wyłącznie ogłoszenia, których jesteś właścicielem.
        </p>
        <div className="pt-2">
          <Link href={`/items/${item.id}`}>
            <Button variant="outline" size="sm">
              Wróć do ogłoszenia
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
          href={`/items/${item.id}`}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Wróć do oferty
        </Link>
        <Badge variant="warning">Edycja ogłoszenia</Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-orange-600/15 text-orange-400">
          <Edit3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Edycja: {item.title}
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Zaktualizuj opis, stawkę dobową, kaucję lub zasady wypożyczenia.
          </p>
        </div>
      </div>

      <MultiStepItemForm
        categories={categories}
        initialData={item}
        isEdit={true}
      />
    </div>
  );
}
