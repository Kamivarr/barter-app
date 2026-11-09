/**
 * Typy domenowe aplikacji Barter.
 *
 * Oparte na Prisma.XxxGetPayload – zapewniają jednoznaczne nazwy pól
 * wynikające bezpośrednio ze schematu bazy danych bez ręcznych duplikatów.
 *
 * Uwaga: SQLite nie obsługuje natywnych enum w Prisma. Pola condition i status
 * są przechowywane jako String. Poniższe typy literałowe wymuszają bezpieczeństwo
 * typów na poziomie TypeScript bez warstwy bazy danych.
 */

import type { Prisma } from '@prisma/client';

// ---------------------------------------------------------------------------
// Enum-like string literals (odpowiadają wartościom przechowywanym w DB)
// ---------------------------------------------------------------------------

export type ToolCondition = 'NEW' | 'GOOD' | 'FAIR' | 'WELL_USED';
export type RentalStatus = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'RETURNED' | 'CANCELLED';

// ---------------------------------------------------------------------------
// Typy domenowe – Item
// ---------------------------------------------------------------------------

/** Publiczny kształt danych Item dla katalogu i widoków publicznych (bezpieczny: brak exactAddress/phone/email) */
export type CatalogItem = Prisma.ItemGetPayload<{
  include: {
    owner: {
      select: {
        id: true;
        name: true;
        neighborhood: true;
        avatarUrl: true;
        city: true;
      };
    };
    category: true;
    reviews: {
      include: {
        author: { select: { id: true; name: true; avatarUrl: true } };
      };
    };
  };
}>;

/** Pełny typ domenowy Item uwzględniający wszystkie relacje: owner, category, reviews. */
export type ItemWithDetails = Prisma.ItemGetPayload<{
  include: {
    owner: {
      select: {
        id: true;
        name: true;
        email: true;
        neighborhood: true;
        city: true;
        avatarUrl: true;
        exactAddress: true;
        phone: true;
      };
    };
    category: true;
    reviews: {
      include: {
        author: { select: { id: true; name: true; avatarUrl: true } };
      };
    };
  };
}>;

/** Alias dla pełnego modelu Item ze wszystkimi relacjami */
export type ItemDomain = Prisma.ItemGetPayload<{
  include: {
    owner: true;
    category: true;
    reviews: true;
  };
}>;

/** Lekki Item dla list i kart (bez recenzji). */
export type ItemSummary = Prisma.ItemGetPayload<{
  include: {
    owner: { select: { id: true; name: true; neighborhood: true; city: true } };
    category: true;
  };
}>;

// ---------------------------------------------------------------------------
// Typy domenowe – RentalRequest
// ---------------------------------------------------------------------------

/** RentalRequest z powiązanym sprzętem (z właścicielem i kategorią), wypożyczającym i recenzją. */
export type RentalRequestWithDetails = Prisma.RentalRequestGetPayload<{
  include: {
    item: {
      include: {
        owner: { select: { id: true; name: true; exactAddress: true; phone: true } };
        category: true;
        reviews: true;
      };
    };
    renter: { select: { id: true; name: true; email: true } };
    review: true;
  };
}>;

/** Alias dla pełnego modelu RentalRequest ze wszystkimi relacjami */
export type RentalRequestDomain = Prisma.RentalRequestGetPayload<{
  include: {
    item: {
      include: {
        owner: true;
        category: true;
        reviews: true;
      };
    };
    renter: true;
    review: true;
  };
}>;

// ---------------------------------------------------------------------------
// Typy pomocnicze i stałe
// ---------------------------------------------------------------------------

/** Dostępne statusy RentalRequest jako obiekt stałych (ułatwia porównania). */
export const RENTAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  RETURNED: 'RETURNED',
  CANCELLED: 'CANCELLED',
} as const satisfies Record<RentalStatus, RentalStatus>;

/** Dostępne stany techniczne sprzętu jako obiekt stałych. */
export const TOOL_CONDITION = {
  NEW: 'NEW',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  WELL_USED: 'WELL_USED',
} as const satisfies Record<ToolCondition, ToolCondition>;

/** Polskie etykiety stanów technicznych dla UI. */
export const TOOL_CONDITION_LABELS: Record<ToolCondition, string> = {
  NEW: 'Nowy',
  GOOD: 'Dobry',
  FAIR: 'Zadowalający',
  WELL_USED: 'Dużo używany',
};

/** Pomocniczy typ guard – sprawdza, czy string jest poprawnym ToolCondition. */
export function isToolCondition(value: string): value is ToolCondition {
  return value in TOOL_CONDITION;
}

/** Pomocniczy typ guard – sprawdza, czy string jest poprawnym RentalStatus. */
export function isRentalStatus(value: string): value is RentalStatus {
  return value in RENTAL_STATUS;
}

/**
 * Parsuje pole imagesJson z modelu Item i zwraca tablicę URL.
 * Bezpieczne – w razie błędu parsowania zwraca pustą tablicę.
 */
export function parseImagesJson(imagesJson?: string | null): string[] {
  if (!imagesJson) return [];
  try {
    const parsed: unknown = JSON.parse(imagesJson);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (url): url is string => typeof url === 'string' && url.trim().length > 0
      );
    }
    if (typeof parsed === 'string' && parsed.trim().length > 0) {
      return [parsed.trim()];
    }
  } catch {
    if (typeof imagesJson === 'string' && imagesJson.startsWith('http')) {
      return [imagesJson.trim()];
    }
  }
  return [];
}

/** Zwraca URL pierwszego zdjęcia przedmiotu lub null jeśli ogłoszenie nie posiada zdjęć. */
export function getFirstImage(imagesJson?: string | null): string | null {
  const images = parseImagesJson(imagesJson);
  return images[0] ?? null;
}

/** Oblicza średnią ocenę przedmiotu z jego recenzji. Zwraca null gdy brak recenzji. */
export function computeAverageRating(
  reviews: Array<{ rating: number }>
): number | null {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
