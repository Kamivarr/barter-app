'use server';

import { prisma } from '@/lib/prisma';

const COMMISSION_RATE = 0.15; // 15% prowizji platformy Barter

export interface ItemType {
  id: string;
  title: string;
  description: string;
  category: string;
  dailyPrice: number;
  ownerName: string;
  neighborLoc: string;
  address: string;
  imageUrl: string;
  rating: number;
}

export interface BookingType {
  id: string;
  itemId: string;
  renterName: string;
  days: number;
  ownerAmount: number;
  commissionAmount: number;
  totalPaid: number;
  status: string;
  pickupPin: string;
  item: ItemType;
}

// Pobranie danych z bazy + automatyczny seed przy pierwszym uruchomieniu
export async function getBarterDataAction(): Promise<{
  items: ItemType[];
  bookings: BookingType[];
}> {
  const count = await prisma.item.count();

  if (count === 0) {
    await prisma.item.createMany({
      data: [
        {
          title: 'DeWalt 20V MAX XR Cordless Compact Drill/Driver Kit',
          description:
            'Profesjonalna wiertarko-wkrętarka bezszczotkowa. W zestawie 2 akumulatory, ładowarka oraz walizka transportowa. Idealna do remontu.',
          category: 'Elektronarzędzia',
          dailyPrice: 45,
          ownerName: 'Marek (Sąsiad z bloku nr 4)',
          neighborLoc: '200m od Ciebie • ul. Akademicka',
          address: 'ul. Akademicka 4/12, kod do domofonu: 412#, tel. 500-100-200',
          imageUrl:
            'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
          rating: 4.9,
        },
        {
          title: 'Myjka ciśnieniowa Kärcher K5 Power Control',
          description:
            'Wysokociśnieniowa myjka do kostki brukowej, tarasu i samochodu. Zawiera lancę rotacyjną oraz wąż 10m.',
          category: 'Sprzęt czyszczący',
          dailyPrice: 60,
          ownerName: 'Anna (Sąsiadka z osiedla)',
          neighborLoc: '450m od Ciebie • ul. Słoneczna',
          address: 'ul. Słoneczna 18, odbiór z garażu, tel. 600-300-400',
          imageUrl:
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
          rating: 4.8,
        },
        {
          title: 'Glebogryzarka spalinowa / Wertykulator ogrodowy',
          description:
            'Niezbędna na wiosenne porządki w ogrodzie i przygotowanie trawnika. Pełny bak paliwa w cenie.',
          category: 'Ogród i Działka',
          dailyPrice: 80,
          ownerName: 'Piotr (Dom jednorodzinny)',
          neighborLoc: '600m od Ciebie • ul. Zielona',
          address: 'ul. Zielona 7, wejście od ogrodu, tel. 700-800-900',
          imageUrl:
            'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
          rating: 5.0,
        },
      ],
    });
  }

  const items = await prisma.item.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const bookings = await prisma.booking.findMany({
    include: { item: true },
    orderBy: { createdAt: 'desc' },
  });

  return { items, bookings };
}

// KROK 01: Wystawienie sprzętu na stronie przez właściciela
export async function createItemAction(input: {
  title: string;
  category: string;
  dailyPrice: number;
  description: string;
  neighborLoc: string;
  address: string;
  imageUrl: string;
}) {
  await prisma.item.create({
    data: {
      title: input.title,
      category: input.category,
      dailyPrice: input.dailyPrice,
      description: input.description,
      ownerName: 'Ty (Właściciel sąsiedzki)',
      neighborLoc: input.neighborLoc || '150m od Ciebie',
      address: input.address || 'ul. Studencka 2/10, tel. 555-444-333',
      imageUrl:
        input.imageUrl ||
        'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80',
    },
  });

  return await getBarterDataAction();
}

// KROK 02: Bezpieczna płatność online z naliczeniem prowizji serwisu
export async function createBookingWithPaymentAction(
  itemId: string,
  days: number,
  renterName: string
) {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) throw new Error('Nie znaleziono sprzętu');

  const baseRental = item.dailyPrice * days;
  const commissionAmount = Math.round(baseRental * COMMISSION_RATE * 100) / 100;
  const totalPaid = Math.round((baseRental + commissionAmount) * 100) / 100;
  const pickupPin = Math.floor(1000 + Math.random() * 9000).toString();

  await prisma.booking.create({
    data: {
      itemId: item.id,
      renterName: renterName || 'Kamil Śliwa (Sąsiad)',
      days,
      ownerAmount: baseRental,
      commissionAmount,
      totalPaid,
      status: 'PAID',
      pickupPin,
    },
  });

  return await getBarterDataAction();
}

// KROK 03: Odbiór sprzętu bezpośrednio od sąsiada (Weryfikacja PIN)
export async function verifyPickupPinAction(bookingId: string, enteredPin: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    return {
      success: false,
      message: 'Nie znaleziono rezerwacji.',
      data: await getBarterDataAction(),
    };
  }

  if (booking.pickupPin !== enteredPin.trim()) {
    return {
      success: false,
      message: 'Błędny kod PIN! Poproś sąsiada o 4-cyfrowy kod z jego aplikacji.',
      data: await getBarterDataAction(),
    };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'PICKED_UP' },
  });

  return {
    success: true,
    message: 'Kod poprawny! Sprzęt wydany sąsiadowi.',
    data: await getBarterDataAction(),
  };
}

// Zwrot sprzętu i zamknięcie transakcji
export async function completeBookingAction(bookingId: string) {
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'COMPLETED' },
  });

  return await getBarterDataAction();
}