'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import {
  createRentalSchema,
  reviewSchema,
  verifyPinSchema,
  respondRentalSchema,
} from '@/lib/validations/rental';
import type { RentalStatus } from '@/types/domain';

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  data?: T;
}

const COMMISSION_RATE = 0.15; // 15% opłata serwisowa platformy Barter

/**
 * Tworzy nową rezerwację w statusie PENDING.
 * Weryfikuje dostępność terminu w transakcji oraz blokuje samozamawianie.
 */
export async function createRentalRequestAction(
  rawData: unknown
): Promise<ActionResponse<{ rentalId: string }>> {
  const sessionUser = await requireAuth();

  const parseResult = createRentalSchema.safeParse(rawData);
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
      message: 'Popraw błędy w formularzu rezerwacji.',
      fieldErrors,
    };
  }

  const { itemId, startDate: startStr, endDate: endStr } = parseResult.data;

  const startDate = new Date(startStr);
  const endDate = new Date(endStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return {
      success: false,
      message: 'Podano nieprawidłowy format daty.',
    };
  }

  if (startDate >= endDate) {
    return {
      success: false,
      message: 'Data końcowa musi być późniejsza niż data rozpoczęcia.',
    };
  }

  // Obliczenie liczby dób wypożyczenia (min. 1 doba)
  const diffMs = endDate.getTime() - startDate.getTime();
  const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  // Transakcja bazodanowa sprawdzająca nakładanie się rezerwacji
  const result = await prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new Error('Wybrany sprzęt nie istnieje.');
    }

    if (!item.isAvailable) {
      throw new Error('Ten sprzęt jest aktualnie oznaczony jako niedostępny.');
    }

    // Blokada wypożyczenia własnego sprzętu
    if (item.ownerId === sessionUser.id) {
      throw new Error('Nie możesz wypożyczyć własnego sprzętu.');
    }

    // Sprawdzenie kolizji terminów z rezerwacjami APPROVED lub ACTIVE
    const overlappingRequests = await tx.rentalRequest.findMany({
      where: {
        itemId: item.id,
        status: { in: ['APPROVED', 'ACTIVE'] },
        AND: [
          { startDate: { lte: endDate } },
          { endDate: { gte: startDate } },
        ],
      },
    });

    if (overlappingRequests.length > 0) {
      throw new Error('Wybrany termin jest już zajęty przez innego sąsiada.');
    }

    // Wyliczenie kwot finansowych
    const ownerAmount = Math.round(days * item.dailyPrice * 100) / 100;
    const commissionAmount = Math.round(ownerAmount * COMMISSION_RATE * 100) / 100;
    const depositAmount = item.depositAmount;
    const totalPaid = Math.round((ownerAmount + commissionAmount + depositAmount) * 100) / 100;

    // Generowanie 4-cyfrowego kodu PIN do odbioru
    const pickupPin = Math.floor(1000 + Math.random() * 9000).toString();

    const newRental = await tx.rentalRequest.create({
      data: {
        itemId: item.id,
        renterId: sessionUser.id,
        startDate,
        endDate,
        days,
        ownerAmount,
        commissionAmount,
        depositAmount,
        totalPaid,
        status: 'PENDING' satisfies RentalStatus,
        pickupPin,
      },
    });

    return newRental;
  });

  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath(`/items/${itemId}`);

  return {
    success: true,
    message: 'Wniosek o wypożyczenie został przesłany do właściciela!',
    data: { rentalId: result.id },
  };
}

/**
 * Akceptacja (APPROVE) lub odrzucenie (CANCEL) wniosku o wypożyczenie.
 * Dostępne wyłącznie dla właściciela przedmiotu.
 */
export async function respondToRentalRequestAction(
  rentalId: string,
  decision: 'APPROVE' | 'CANCEL'
): Promise<ActionResponse<{ status: string }>> {
  const sessionUser = await requireAuth();

  const parseResult = respondRentalSchema.safeParse({ rentalId, decision });
  if (!parseResult.success) {
    return {
      success: false,
      message: 'Niepoprawne parametry operacji.',
    };
  }

  const rental = await prisma.rentalRequest.findUnique({
    where: { id: rentalId },
    include: { item: true },
  });

  if (!rental) {
    return {
      success: false,
      message: 'Nie znaleziono wniosku o wypożyczenie.',
    };
  }

  // Weryfikacja: tylko właściciel sprzętu może zatwierdzić lub odrzucić
  if (rental.item.ownerId !== sessionUser.id) {
    throw new Error('403 Forbidden: Nie masz uprawnień do zarządzania tym wnioskiem.');
  }

  // Maszyna stanów: akceptacja lub odrzucenie możliwe wyłącznie ze statusu PENDING
  if (rental.status !== 'PENDING') {
    return {
      success: false,
      message: `Nie można zmienić decyzji dla wniosku o statusie: ${rental.status}.`,
    };
  }

  const newStatus: RentalStatus = decision === 'APPROVE' ? 'APPROVED' : 'CANCELLED';

  await prisma.rentalRequest.update({
    where: { id: rentalId },
    data: { status: newStatus },
  });

  revalidatePath('/dashboard');
  revalidatePath('/');
  revalidatePath(`/items/${rental.itemId}`);

  return {
    success: true,
    message:
      decision === 'APPROVE'
        ? 'Wypożyczenie zatwierdzone! Sąsiad otrzymał powiadomienie z adresem odbioru.'
        : 'Wniosek został odrzucony.',
    data: { status: newStatus },
  };
}

/**
 * Weryfikacja 4-cyfrowego kodu PIN przez właściciela przy wydaniu sprzętu.
 * Zmienia status z APPROVED na ACTIVE.
 */
export async function verifyPickupPinAndActivateAction(
  rentalId: string,
  enteredPin: string
): Promise<ActionResponse<{ status: string }>> {
  const sessionUser = await requireAuth();

  const parseResult = verifyPinSchema.safeParse({ rentalId, enteredPin });
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.issues[0]?.message || 'Podaj poprawny 4-cyfrowy kod PIN.',
    };
  }

  const rental = await prisma.rentalRequest.findUnique({
    where: { id: rentalId },
    include: { item: true },
  });

  if (!rental) {
    return {
      success: false,
      message: 'Nie znaleziono wypożyczenia.',
    };
  }

  // Weryfikacja uprawnień: tylko właściciel weryfikuje PIN przy wydaniu
  if (rental.item.ownerId !== sessionUser.id) {
    throw new Error('403 Forbidden: Tylko właściciel sprzętu może zweryfikować kod PIN.');
  }

  // Maszyna stanów: weryfikacja PIN dopuszczalna wyłącznie dla APPROVED
  if (rental.status !== 'APPROVED') {
    return {
      success: false,
      message: `Weryfikacja PIN jest możliwa wyłącznie dla zatwierdzonych wypożyczeń (obecny status: ${rental.status}).`,
    };
  }

  // Porównanie kodu PIN
  if (rental.pickupPin !== enteredPin.trim()) {
    return {
      success: false,
      message: 'Niepoprawny kod PIN! Poproś sąsiada o 4-cyfrowy kod wyświetlany w jego aplikacji.',
    };
  }

  await prisma.rentalRequest.update({
    where: { id: rentalId },
    data: { status: 'ACTIVE' satisfies RentalStatus },
  });

  revalidatePath('/dashboard');
  revalidatePath('/');

  return {
    success: true,
    message: 'Kod PIN poprawny! Sprzęt został pomyślnie wydany sąsiadowi.',
    data: { status: 'ACTIVE' },
  };
}

/**
 * Potwierdzenie zwrotu sprzętu przez właściciela.
 * Zmienia status z ACTIVE na RETURNED i zwalnia kaucję.
 */
export async function completeReturnAction(
  rentalId: string
): Promise<ActionResponse<{ status: string }>> {
  const sessionUser = await requireAuth();

  const rental = await prisma.rentalRequest.findUnique({
    where: { id: rentalId },
    include: { item: true },
  });

  if (!rental) {
    return {
      success: false,
      message: 'Nie znaleziono wypożyczenia.',
    };
  }

  if (rental.item.ownerId !== sessionUser.id) {
    throw new Error('403 Forbidden: Tylko właściciel sprzętu może potwierdzić zwrot.');
  }

  // Maszyna stanów: zakończenie możliwe wyłącznie dla ACTIVE
  if (rental.status !== 'ACTIVE') {
    return {
      success: false,
      message: `Potwierdzenie zwrotu jest możliwe wyłącznie dla aktywnych wypożyczeń (obecny status: ${rental.status}).`,
    };
  }

  await prisma.rentalRequest.update({
    where: { id: rentalId },
    data: { status: 'RETURNED' satisfies RentalStatus },
  });

  revalidatePath('/dashboard');
  revalidatePath('/');
  revalidatePath(`/items/${rental.itemId}`);

  return {
    success: true,
    message: 'Zwrot potwierdzony! Transakcja zamknięta, a kaucja zwrotna rozliczona.',
    data: { status: 'RETURNED' },
  };
}

/**
 * Anulowanie złożonego wniosku przez wypożyczającego (gdy status to PENDING).
 */
export async function cancelRentalAsRenterAction(
  rentalId: string
): Promise<ActionResponse<{ status: string }>> {
  const sessionUser = await requireAuth();

  const rental = await prisma.rentalRequest.findUnique({
    where: { id: rentalId },
  });

  if (!rental) {
    return {
      success: false,
      message: 'Nie znaleziono rezerwacji.',
    };
  }

  if (rental.renterId !== sessionUser.id) {
    throw new Error('403 Forbidden: Nie jesteś wypożyczającym w tej transakcji.');
  }

  if (rental.status !== 'PENDING') {
    return {
      success: false,
      message: 'Możesz anulować wyłącznie wnioski oczekujące na akceptację (PENDING).',
    };
  }

  await prisma.rentalRequest.update({
    where: { id: rentalId },
    data: { status: 'CANCELLED' satisfies RentalStatus },
  });

  revalidatePath('/dashboard');
  revalidatePath('/');

  return {
    success: true,
    message: 'Wniosek o wypożyczenie został pomyślnie anulowany.',
    data: { status: 'CANCELLED' },
  };
}

/**
 * Wystawienie recenzji przez wypożyczającego po zwrocie sprzętu (RETURNED).
 * Relacja 1:1 – każde wypożyczenie może mieć maksymalnie jedną opinię.
 */
export async function createReviewAction(
  rawData: unknown
): Promise<ActionResponse<{ reviewId: string }>> {
  const sessionUser = await requireAuth();

  const parseResult = reviewSchema.safeParse(rawData);
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
      message: 'Popraw błędy w formularzu recenzji.',
      fieldErrors,
    };
  }

  const { rentalRequestId, rating, comment } = parseResult.data;

  const rental = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: {
      item: true,
      review: true,
    },
  });

  if (!rental) {
    return {
      success: false,
      message: 'Nie znaleziono transakcji wypożyczenia.',
    };
  }

  if (rental.renterId !== sessionUser.id) {
    throw new Error('403 Forbidden: Tylko wypożyczający może wystawić opinię dla tego sprzętu.');
  }

  if (rental.status !== 'RETURNED') {
    return {
      success: false,
      message: 'Możesz wystawić recenzję wyłącznie po zakończeniu wypożyczenia (status: Zwrócone).',
    };
  }

  if (rental.review) {
    return {
      success: false,
      message: 'Dla tego wypożyczenia opinia została już wcześniej wystawiona.',
    };
  }

  const newReview = await prisma.review.create({
    data: {
      rentalRequestId,
      itemId: rental.itemId,
      authorId: sessionUser.id,
      targetUserId: rental.item.ownerId,
      rating,
      comment: comment.trim(),
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/');
  revalidatePath(`/items/${rental.itemId}`);

  return {
    success: true,
    message: 'Dziękujemy! Twoja opinia została dodana do profilu sprzętu.',
    data: { reviewId: newReview.id },
  };
}

/**
 * Bezpieczne pobranie danych do Dashboardu użytkownika:
 * - Odsłania dokładny adres właściciela (exactAddress) i kod PIN WYŁĄCZNIE dla statusów APPROVED i ACTIVE.
 */
export async function getUserDashboardDataAction() {
  const sessionUser = await requireAuth();

  const [rawBorrowedRentals, rawOwnerRentals, myItems, allRentals] = await Promise.all([
    // 1. Wypożyczenia realizowane przez użytkownika
    prisma.rentalRequest.findMany({
      where: { renterId: sessionUser.id },
      include: {
        item: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                neighborhood: true,
                city: true,
                avatarUrl: true,
                exactAddress: true,
                phone: true,
              },
            },
            category: true,
          },
        },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    }),

    // 2. Wnioski i wypożyczenia narzędzi należących do użytkownika
    prisma.rentalRequest.findMany({
      where: { item: { ownerId: sessionUser.id } },
      include: {
        item: {
          include: {
            category: true,
          },
        },
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
            neighborhood: true,
            avatarUrl: true,
            phone: true,
          },
        },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    }),

    // 3. Narzędzia wystawione przez użytkownika
    prisma.item.findMany({
      where: { ownerId: sessionUser.id },
      include: {
        category: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    }),

    // 4. Do wskaźników modelu platformy
    prisma.rentalRequest.findMany({
      select: {
        id: true,
        totalPaid: true,
        commissionAmount: true,
        ownerAmount: true,
        status: true,
      },
    }),
  ]);

  // DoD: Dokładny adres właściciela oraz pickupPin są zwracane WYŁĄCZNIE dla APPROVED lub ACTIVE
  const borrowedRentals = rawBorrowedRentals.map((r) => {
    const isUnlocked = r.status === 'APPROVED' || r.status === 'ACTIVE';
    return {
      ...r,
      pickupPin: isUnlocked ? r.pickupPin : '****',
      item: {
        ...r.item,
        owner: {
          ...r.item.owner,
          exactAddress: isUnlocked ? r.item.owner.exactAddress : null,
          phone: isUnlocked ? r.item.owner.phone : null,
        },
      },
    };
  });

  // BEZPIECZEŃSTWO: Właściciel NIE MOŻE znać kodu PIN przed podaniem go przez sąsiada
  const ownerRentals = rawOwnerRentals.map((r) => ({
    ...r,
    pickupPin: '****',
  }));

  return {
    currentUser: sessionUser,
    borrowedRentals,
    ownerRentals,
    myItems,
    platformStats: {
      totalRentalsCount: allRentals.length,
      activeRentalsCount: allRentals.filter((r) => r.status === 'ACTIVE').length,
      totalVolume: allRentals.reduce((acc, curr) => acc + curr.totalPaid, 0),
      totalCommission: allRentals.reduce((acc, curr) => acc + curr.commissionAmount, 0),
    },
  };
}
