import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ToolCondition } from '@/types/domain';

/**
 * Bezpieczny kształt danych właściciela:
 * Zgodnie ze specyfikacją Krok 04 i wytycznymi bezpieczeństwa,
 * zapytania publiczne wybierają WYŁĄCZNIE pola publiczne właściciela.
 * Pola `exactAddress`, `phone`, `email` i `passwordHash` są jawnie wykluczone.
 */
export const publicOwnerSelect = {
  id: true,
  name: true,
  neighborhood: true,
  avatarUrl: true,
  city: true,
} as const;

export interface CatalogFilters {
  categorySlug?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ToolCondition;
  startDate?: string;
  endDate?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}

export type CatalogItem = Awaited<ReturnType<typeof getCatalogItems>>['items'][number];
export type ItemDetailsData = NonNullable<Awaited<ReturnType<typeof getItemById>>>;

/**
 * Zapytanie katalogowe obsługujące filtrowanie, wyszukiwanie, daty dostępności i paginację.
 */
export async function getCatalogItems(filters: CatalogFilters = {}) {
  const {
    categorySlug,
    query,
    minPrice,
    maxPrice,
    condition,
    startDate,
    endDate,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = filters;

  const where: Prisma.ItemWhereInput = {};

  // 1. Kategoria: dopasowanie po slug lub nazwie
  if (categorySlug && categorySlug !== 'all' && categorySlug !== 'Wszystkie') {
    where.category = {
      OR: [
        { slug: categorySlug },
        { name: categorySlug },
      ],
    };
  }

  // 2. Wyszukiwanie tekstowe w tytule, opisie lub lokalizacji sąsiedzkiej
  if (query && query.trim()) {
    const q = query.trim();
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { neighborLoc: { contains: q } },
    ];
  }

  // 3. Zakres cenowy dobowej stawki
  if ((minPrice !== undefined && minPrice > 0) || (maxPrice !== undefined && maxPrice > 0)) {
    const priceFilter: Prisma.FloatFilter = {};
    if (minPrice !== undefined && minPrice > 0) {
      priceFilter.gte = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice > 0) {
      priceFilter.lte = Number(maxPrice);
    }
    where.dailyPrice = priceFilter;
  }

  // 4. Stan techniczny
  if (condition) {
    where.condition = condition;
  }

  // 5. Dostępność w zadanym przedziale dat:
  // Wykluczenie przedmiotów posiadających RentalRequest o statusie APPROVED lub ACTIVE
  // nachodzącym na wybrane daty (A_start <= B_end && A_end >= B_start)
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      where.NOT = {
        rentalRequests: {
          some: {
            status: { in: ['APPROVED', 'ACTIVE'] },
            startDate: { lte: end },
            endDate: { gte: start },
          },
        },
      };
    }
  }

  // 6. Sortowanie
  let orderBy: Prisma.ItemOrderByWithRelationInput = { createdAt: 'desc' };
  if (sort === 'price_asc') {
    orderBy = { dailyPrice: 'asc' };
  } else if (sort === 'price_desc') {
    orderBy = { dailyPrice: 'desc' };
  } else if (sort === 'newest') {
    orderBy = { createdAt: 'desc' };
  }

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Number(limit) || 12);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      include: {
        owner: { select: publicOwnerSelect },
        category: true,
        reviews: {
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
      orderBy,
      skip,
      take: safeLimit,
    }),
    prisma.item.count({ where }),
  ]);

  return {
    items,
    total,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    currentPage: safePage,
  };
}

/**
 * Pobiera pojedynczy przedmiot po ID dla widoku szczegółów (/items/[id]).
 * Zwraca null, jeśli przedmiot nie istnieje.
 */
export async function getItemById(id: string) {
  if (!id) return null;

  return prisma.item.findUnique({
    where: { id },
    include: {
      owner: { select: publicOwnerSelect },
      category: true,
      reviews: {
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      rentalRequests: {
        where: {
          status: { in: ['APPROVED', 'ACTIVE'] },
        },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          status: true,
        },
      },
    },
  });
}

/**
 * Pobiera listę wszystkich kategorii dla komponentu filtrów.
 */
export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}
