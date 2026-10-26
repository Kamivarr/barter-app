'use client';

import React, { useState, useEffect } from 'react';
import {
  Handshake,
  PlusCircle,
  Search,
  MapPin,
  ShieldCheck,
  KeyRound,
  CreditCard,
  TrendingUp,
  CheckCircle2,
  Wrench,
  Star,
  Loader2,
} from 'lucide-react';
import {
  getBarterDataAction,
  createItemAction,
  createBookingWithPaymentAction,
  verifyPickupPinAction,
  completeBookingAction,
  ItemType,
  BookingType,
} from './actions';

const CATEGORIES = [
  'Wszystkie',
  'Elektronarzędzia',
  'Sprzęt czyszczący',
  'Ogród i Działka',
  'Budowa i Remont',
];

export default function BarterPage() {
  const [items, setItems] = useState<ItemType[]>([]);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'catalog' | 'add' | 'bookings' | 'pm'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState('Wszystkie');
  const [searchQuery, setSearchQuery] = useState('');

  // Stan formularza dodawania sprzętu (Krok 01)
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Elektronarzędzia');
  const [newDailyPrice, setNewDailyPrice] = useState(40);
  const [newDescription, setNewDescription] = useState('');
  const [newNeighborLoc, setNewNeighborLoc] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  // Stan modala płatności (Krok 02)
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
  const [days, setDays] = useState(2);
  const [blikCode, setBlikCode] = useState('749201');
  const [isPaying, setIsPaying] = useState(false);

  // Stan weryfikacji PIN przy odbiorze (Krok 03)
  const [pinInputs, setPinInputs] = useState<{ [key: string]: string }>({});
  const [pinFeedback, setPinFeedback] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    let mounted = true;
    getBarterDataAction()
      .then((data) => {
        if (mounted) {
          setItems(data.items || []);
          setBookings(data.bookings || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Błąd ładowania danych:', err);
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const safeItems = Array.isArray(items) ? items : [];
  const safeBookings = Array.isArray(bookings) ? bookings : [];

  const filteredItems = safeItems.filter((item) => {
    const matchesCat = selectedCategory === 'Wszystkie' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Statystyki dla Panelu PM (Agata Mróz - nadzór nad monetyzacją)
  const totalCommission = safeBookings.reduce((sum, b) => sum + b.commissionAmount, 0);
  const totalOwnerEarnings = safeBookings.reduce((sum, b) => sum + b.ownerAmount, 0);
  const totalVolume = safeBookings.reduce((sum, b) => sum + b.totalPaid, 0);

  async function handleAddItemSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsSubmittingItem(true);

    const updated = await createItemAction({
      title: newTitle,
      category: newCategory,
      dailyPrice: Number(newDailyPrice) || 40,
      description: newDescription,
      neighborLoc: newNeighborLoc,
      address: newAddress,
      imageUrl: newImageUrl,
    });

    setItems(updated.items);
    setBookings(updated.bookings);
    setNewTitle('');
    setNewDescription('');
    setNewNeighborLoc('');
    setNewAddress('');
    setNewImageUrl('');
    setIsSubmittingItem(false);
    setActiveTab('catalog');
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem) return;
    setIsPaying(true);

    const updated = await createBookingWithPaymentAction(
      selectedItem.id,
      days,
      'Kamil Śliwa (Wypożyczający)'
    );

    setItems(updated.items);
    setBookings(updated.bookings);
    setIsPaying(false);
    setSelectedItem(null);
    setActiveTab('bookings');
  }

  async function handlePinVerify(bookingId: string) {
    const code = pinInputs[bookingId] || '';
    const res = await verifyPickupPinAction(bookingId, code);
    setPinFeedback({ ...pinFeedback, [bookingId]: res.message });
    setItems(res.data.items);
    setBookings(res.data.bookings);
  }

  async function handleCompleteBooking(bookingId: string) {
    const updated = await completeBookingAction(bookingId);
    setItems(updated.items);
    setBookings(updated.bookings);
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans">
      {/* HEADER NAWIGACYJNY */}
      <header className="border-b border-stone-800 bg-[#231520] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div
            onClick={() => setActiveTab('catalog')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="bg-orange-600 p-2.5 rounded-xl text-white shadow-lg shadow-orange-600/30">
              <Handshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight text-white">Barter</span>
              <span className="block text-xs text-orange-400 font-medium">
                Platforma wynajmu sąsiedzkiego • Ekonomia współdzielenia
              </span>
            </div>
          </div>

          {/* MENU GŁÓWNE PROCESU */}
          <nav className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                activeTab === 'catalog'
                  ? 'bg-orange-600 text-white'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <Wrench className="w-4 h-4" /> Katalog Sprzętu
            </button>

            <button
              onClick={() => setActiveTab('add')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                activeTab === 'add'
                  ? 'bg-orange-600 text-white'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <PlusCircle className="w-4 h-4" /> Krok 01: Wystaw sprzęt
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                activeTab === 'bookings'
                  ? 'bg-orange-600 text-white'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <KeyRound className="w-4 h-4" /> Krok 03: Odbiór i Rezerwacje ({safeBookings.length})
            </button>

            <button
              onClick={() => setActiveTab('pm')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                activeTab === 'pm'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-800/80 text-emerald-400 border border-emerald-500/30 hover:bg-stone-700'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Model Prowizyjny (Widok PM)
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* PASEK INFORMACYJNY O 3 KROKACH Z INFOGRAFIKI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-stone-900/90 border border-stone-800 p-4 rounded-2xl">
          <div className="flex items-start gap-3">
            <span className="bg-orange-600/20 text-orange-400 font-bold px-2.5 py-1 rounded text-xs">
              KROK 01
            </span>
            <div>
              <h4 className="font-semibold text-sm text-white">Wystawienie sprzętu na stronie</h4>
              <p className="text-xs text-stone-400">
                Właściciel dodaje zdjęcie i opis wiertarki lub innego sprzętu do platformy.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-orange-600/20 text-orange-400 font-bold px-2.5 py-1 rounded text-xs">
              KROK 02
            </span>
            <div>
              <h4 className="font-semibold text-sm text-white">Płatność z prowizją (15%)</h4>
              <p className="text-xs text-stone-400">
                Wypożyczający dokonuje bezpiecznej płatności online uwzględniającej prowizję serwisu.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-orange-600/20 text-orange-400 font-bold px-2.5 py-1 rounded text-xs">
              KROK 03
            </span>
            <div>
              <h4 className="font-semibold text-sm text-white">Odbiór sprzętu od sąsiada</h4>
              <p className="text-xs text-stone-400">
                Po opłaceniu system odsłania adres i kod PIN potwierdzający odbiór osobisty.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <p className="text-sm">Ładowanie katalogu sąsiedzkiego Barter...</p>
          </div>
        ) : (
          <>
            {/* WIDOK 1: KATALOG I KATEGORIE OFERT */}
            {activeTab === 'catalog' && (
              <div>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                          selectedCategory === cat
                            ? 'bg-orange-500 text-white'
                            : 'bg-stone-900 text-stone-400 border border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Szukaj np. wiertarka DeWalt..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-orange-500/50 transition shadow-lg"
                    >
                      <div>
                        <div className="h-48 overflow-hidden relative bg-stone-800">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur px-2.5 py-1 rounded-full text-xs font-medium text-orange-400 border border-orange-500/30">
                            {item.category}
                          </span>
                        </div>

                        <div className="p-5">
                          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-orange-500" /> {item.neighborLoc}
                            </span>
                            <span className="flex items-center gap-1 text-amber-400 font-semibold">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />{' '}
                              {item.rating.toFixed(1)}
                            </span>
                          </div>

                          <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-xs text-stone-400 mb-4 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="p-5 pt-0 border-t border-stone-800/60 mt-2 flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-extrabold text-white">
                            {item.dailyPrice} zł
                          </span>
                          <span className="text-xs text-stone-400"> / doba</span>
                          <span className="block text-[11px] text-emerald-400">
                            Oszczędzasz ~90% ceny zakupu
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setDays(2);
                          }}
                          className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-md shadow-orange-600/20"
                        >
                          Wypożycz (Krok 02)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WIDOK 2: KROK 01 - WYSTAWIENIE SPRZĘTU NA STRONIE */}
            {activeTab === 'add' && (
              <div className="max-w-xl mx-auto bg-stone-900 border border-stone-800 rounded-2xl p-6">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                  KROK 01 • Zarabiaj na rzadko używanych rzeczach
                </span>
                <h2 className="text-2xl font-bold text-white mt-1 mb-6">
                  Wystaw sprzęt do wypożyczenia sąsiedzkiego
                </h2>

                <form onSubmit={handleAddItemSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Nazwa sprzętu (np. Wiertarka, Drabina, Kosiarka)
                    </label>
                    <input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      placeholder="np. Młotowiertarka Bosch Professional SDS+"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Kategoria oferty
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                      >
                        {CATEGORIES.filter((c) => c !== 'Wszystkie').map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Cena za dobę (PLN)
                      </label>
                      <input
                        type="number"
                        required
                        min={5}
                        value={newDailyPrice}
                        onChange={(e) => setNewDailyPrice(Number(e.target.value))}
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Opis stanu i zawartości zestawu
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Opisz parametry sprzętu, dołączone akcesoria (np. wiertła, walizka)..."
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Przybliżona lokalizacja (widoczna publicznie)
                      </label>
                      <input
                        value={newNeighborLoc}
                        onChange={(e) => setNewNeighborLoc(e.target.value)}
                        placeholder="np. Osiedle Nowe Miasto, 300m"
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Dokładny adres (widoczny dopiero po płatności)
                      </label>
                      <input
                        required
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="np. ul. Podkarpacka 12/4, tel. 500-600-700"
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      URL zdjęcia sprzętu (opcjonalnie)
                    </label>
                    <input
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingItem}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition mt-2"
                  >
                    {isSubmittingItem ? 'Publikowanie...' : 'Opublikuj ofertę w sąsiedztwie'}
                  </button>
                </form>
              </div>
            )}

            {/* WIDOK 3: KROK 03 - ODBIÓR SPRZĘTU I ŚCIEŻKA REZERWACJI */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                    KROK 03 • Bezpośredni odbiór od sąsiada
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-1">
                    Aktywne rezerwacje i kody odbioru sprzętu
                  </h2>
                </div>

                {safeBookings.length === 0 ? (
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center text-stone-400">
                    Brak aktywnych wypożyczeń. Przejdź do Katalogu i przetestuj ścieżkę rezerwacji!
                  </div>
                ) : (
                  safeBookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              b.status === 'PAID'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : b.status === 'PICKED_UP'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {b.status === 'PAID' && 'OPŁACONO (Oczekuje na odbiór u sąsiada)'}
                            {b.status === 'PICKED_UP' &&
                              'ODBIÓR POTWIERDZONY (W trakcie użytkowania)'}
                            {b.status === 'COMPLETED' && 'ZAKOŃCZONO I ZWRÓCONO'}
                          </span>
                          <span className="text-xs text-stone-400">Czas najmu: {b.days} dni</span>
                        </div>

                        <h3 className="text-xl font-bold text-white">{b.item?.title}</h3>

                        <div className="bg-stone-950 border border-stone-800 p-3.5 rounded-xl text-xs space-y-1">
                          <p className="text-emerald-400 font-semibold flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" /> Dane odblokowane po płatności z
                            prowizją:
                          </p>
                          <p className="text-stone-300">
                            <strong>Właściciel:</strong> {b.item?.ownerName}
                          </p>
                          <p className="text-stone-300">
                            <strong>Adres odbioru sprzętu:</strong> {b.item?.address}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs text-stone-400 pt-1">
                          <span>
                            Kwota dla właściciela: <strong>{b.ownerAmount.toFixed(2)} zł</strong>
                          </span>
                          <span>
                            Prowizja Barter (15%):{' '}
                            <strong className="text-orange-400">
                              {b.commissionAmount.toFixed(2)} zł
                            </strong>
                          </span>
                          <span>
                            Razem zapłacono:{' '}
                            <strong className="text-white">{b.totalPaid.toFixed(2)} zł</strong>
                          </span>
                        </div>
                      </div>

                      {/* SEKCJA KODU PIN (KROK 03) */}
                      <div className="md:w-80 bg-stone-950 border border-stone-800 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-stone-400 block">
                            Twój kod PIN dla sąsiada (Wypożyczający):
                          </span>
                          <div className="text-2xl font-mono font-extrabold text-orange-400 tracking-widest my-1">
                            {b.pickupPin}
                          </div>
                        </div>

                        {b.status === 'PAID' && (
                          <div className="mt-3 pt-3 border-t border-stone-800">
                            <label className="block text-xs text-stone-300 mb-1.5 font-medium">
                              Panel Właściciela: Wpisz PIN, aby wydać sprzęt:
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                maxLength={4}
                                placeholder="PIN..."
                                value={pinInputs[b.id] || ''}
                                onChange={(e) =>
                                  setPinInputs({ ...pinInputs, [b.id]: e.target.value })
                                }
                                className="w-24 bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white"
                              />
                              <button
                                onClick={() => handlePinVerify(b.id)}
                                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                              >
                                Wydaj sprzęt
                              </button>
                            </div>
                            {pinFeedback[b.id] && (
                              <p className="text-[11px] text-amber-400 mt-1.5">
                                {pinFeedback[b.id]}
                              </p>
                            )}
                          </div>
                        )}

                        {b.status === 'PICKED_UP' && (
                          <button
                            onClick={() => handleCompleteBooking(b.id)}
                            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Potwierdź zwrot sprzętu
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* WIDOK 4: PANEL MODELU PROWIZYJNEGO (DLA AGATY MRÓZ - PM) */}
            {activeTab === 'pm' && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    PERSPEKTYWA BIZNESOWA PM • Skalowalny model prowizyjny
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-1">
                    Podsumowanie monetyzacji transakcji Barter
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-stone-900 border border-emerald-500/40 rounded-2xl p-6">
                    <span className="text-xs text-stone-400">
                      Przychód serwisu z prowizji (15%)
                    </span>
                    <div className="text-3xl font-extrabold text-emerald-400 mt-2">
                      {totalCommission.toFixed(2)} PLN
                    </div>
                    <p className="text-xs text-stone-400 mt-2">
                      Stały przychód serwisu pobierany automatycznie z każdej opłaconej transakcji.
                    </p>
                  </div>

                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
                    <span className="text-xs text-stone-400">Zysk wypłacony właścicielom</span>
                    <div className="text-3xl font-extrabold text-white mt-2">
                      {totalOwnerEarnings.toFixed(2)} PLN
                    </div>
                    <p className="text-xs text-stone-400 mt-2">
                      Zarabianie przez mieszkańców na rzadko używanych narzędziach.
                    </p>
                  </div>

                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
                    <span className="text-xs text-stone-400">
                      Łączna wartość transakcji (GMV)
                    </span>
                    <div className="text-3xl font-extrabold text-orange-400 mt-2">
                      {totalVolume.toFixed(2)} PLN
                    </div>
                    <p className="text-xs text-stone-400 mt-2">
                      Liczba obsłużonych wypożyczeń sąsiedzkich: {safeBookings.length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL KROKU 02: PŁATNOŚĆ ONLINE Z PROWIZJĄ */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              KROK 02 • Bezpieczna płatność z prowizją
            </span>
            <h3 className="text-xl font-bold text-white mt-1 mb-4">{selectedItem.title}</h3>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Na ile dni chcesz wypożyczyć sprzęt?
                </label>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={days}
                  onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>

              {/* ROZBICIE KWOTY I PROWIZJI */}
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-stone-300">
                  <span>
                    Zysk dla właściciela ({days} dni × {selectedItem.dailyPrice} zł):
                  </span>
                  <span>{(selectedItem.dailyPrice * days).toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between text-orange-400 font-medium">
                  <span>Prowizja serwisu Barter (15%):</span>
                  <span>{(selectedItem.dailyPrice * days * 0.15).toFixed(2)} zł</span>
                </div>
                <div className="border-t border-stone-800 pt-2 flex justify-between font-bold text-base text-white">
                  <span>Razem do zapłaty online:</span>
                  <span>{(selectedItem.dailyPrice * days * 1.15).toFixed(2)} zł</span>
                </div>
              </div>

              {/* SYMULATOR BRAMKI BLIK */}
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-3.5">
                <label className="block text-xs text-stone-400 mb-1 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-orange-500" /> Kod BLIK (Symulacja bramki
                  płatniczej):
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={blikCode}
                  onChange={(e) => setBlikCode(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-center font-mono text-lg tracking-widest text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold py-2.5 rounded-xl text-sm transition"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isPaying}
                  className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl text-sm transition"
                >
                  {isPaying ? 'Przetwarzanie...' : 'Opłać i odbierz PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}