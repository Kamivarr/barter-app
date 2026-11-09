'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { itemFormSchema } from '@/lib/validations/item';

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  data?: T;
}

/**
 * Tworzy nowe ogłoszenie sprzętu przypisane do zalogowanego użytkownika (ownerId).
 */
export async function createItemAction(rawData: unknown): Promise<ActionResponse<{ itemId: string }>> {
  const sessionUser = await requireAuth();

  const parseResult = itemFormSchema.safeParse(rawData);
  if (!parseResult.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parseResult.error.issues) {
      const path = issue.path[0]?.toString();
      if (path && !fieldErrors[path]) {
        fieldErrors[path] = issue.message;
      }
    }
    return {
      success: false,
      message: 'Popraw błędy w formularzu przed publikacją.',
      fieldErrors,
    };
  }

  const {
    title,
    categoryId,
    condition,
    description,
    dailyPrice,
    depositAmount,
    neighborLoc,
    rentalRules,
    images,
  } = parseResult.data;

  // Weryfikacja czy kategoria istnieje w bazie
  const categoryExists = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!categoryExists) {
    return {
      success: false,
      fieldErrors: { categoryId: 'Wybrana kategoria nie istnieje.' },
    };
  }

  const newItem = await prisma.item.create({
    data: {
      title: title.trim(),
      categoryId,
      condition,
      description: description.trim(),
      dailyPrice,
      depositAmount,
      neighborLoc: neighborLoc.trim(),
      rentalRules: rentalRules?.trim() || null,
      imagesJson: JSON.stringify(images),
      isAvailable: true,
      ownerId: sessionUser.id,
    },
  });

  revalidatePath('/');
  revalidatePath('/dashboard');

  return {
    success: true,
    message: 'Ogłoszenie zostało pomyślnie opublikowane!',
    data: { itemId: newItem.id },
  };
}

/**
 * Aktualizuje istniejące ogłoszenie sprzętu.
 * Weryfikuje czy zalogowany użytkownik jest właścicielem (403 Forbidden w przeciwnym razie).
 */
export async function updateItemAction(
  itemId: string,
  rawData: unknown
): Promise<ActionResponse<{ itemId: string }>> {
  const sessionUser = await requireAuth();

  const existingItem = await prisma.item.findUnique({
    where: { id: itemId },
    select: { id: true, ownerId: true },
  });

  if (!existingItem) {
    return {
      success: false,
      message: 'Nie znaleziono ogłoszenia o podanym identyfikatorze.',
    };
  }

  if (existingItem.ownerId !== sessionUser.id) {
    throw new Error('403 Forbidden: Nie masz uprawnień do edycji tego ogłoszenia.');
  }

  const parseResult = itemFormSchema.safeParse(rawData);
  if (!parseResult.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parseResult.error.issues) {
      const path = issue.path[0]?.toString();
      if (path && !fieldErrors[path]) {
        fieldErrors[path] = issue.message;
      }
    }
    return {
      success: false,
      message: 'Popraw błędy w formularzu przed zapisem.',
      fieldErrors,
    };
  }

  const {
    title,
    categoryId,
    condition,
    description,
    dailyPrice,
    depositAmount,
    neighborLoc,
    rentalRules,
    images,
  } = parseResult.data;

  await prisma.item.update({
    where: { id: itemId },
    data: {
      title: title.trim(),
      categoryId,
      condition,
      description: description.trim(),
      dailyPrice,
      depositAmount,
      neighborLoc: neighborLoc.trim(),
      rentalRules: rentalRules?.trim() || null,
      imagesJson: JSON.stringify(images),
    },
  });

  revalidatePath('/');
  revalidatePath(`/items/${itemId}`);
  revalidatePath('/dashboard');

  return {
    success: true,
    message: 'Zmiany w ogłoszeniu zostały zapisane!',
    data: { itemId },
  };
}

/**
 * Przełącza status dostępności ogłoszenia (isAvailable).
 * Dostępne wyłącznie dla właściciela przedmiotu.
 */
export async function toggleItemAvailabilityAction(
  itemId: string
): Promise<ActionResponse<{ isAvailable: boolean }>> {
  const sessionUser = await requireAuth();

  const existingItem = await prisma.item.findUnique({
    where: { id: itemId },
    select: { id: true, ownerId: true, isAvailable: true },
  });

  if (!existingItem) {
    return {
      success: false,
      message: 'Nie znaleziono ogłoszenia.',
    };
  }

  if (existingItem.ownerId !== sessionUser.id) {
    throw new Error('403 Forbidden: Nie masz uprawnień do zmiany dostępności tego przedmiotu.');
  }

  const updatedItem = await prisma.item.update({
    where: { id: itemId },
    data: { isAvailable: !existingItem.isAvailable },
    select: { isAvailable: true },
  });

  revalidatePath('/');
  revalidatePath(`/items/${itemId}`);
  revalidatePath('/dashboard');

  return {
    success: true,
    message: updatedItem.isAvailable
      ? 'Ogłoszenie jest teraz aktywne i widoczne w katalogu.'
      : 'Ogłoszenie zostało ukryte przed sąsiadami.',
    data: { isAvailable: updatedItem.isAvailable },
  };
}
