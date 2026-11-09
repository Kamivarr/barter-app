# Changelog AI: Barter App

Rejestr zmian architektonicznych, konfiguracyjnych i infrastrukturalnych prowadzonych przez modele sztucznej inteligencji.

---

## [2026-11-09] - Resetowanie ofert i zasilenie bazy 111 realistycznymi przedmiotami (Marketplace Seed Expansion)
- **Reset danych transakcyjnych i ofert bez destrukcji tabel:**
  - Wdrożono bezpieczne czyszczenie (`prisma.review.deleteMany()`, `prisma.rentalRequest.deleteMany()`, `prisma.item.deleteMany()`) bez naruszania struktury schematu, historii migracji Prisma ani kont użytkowników (`User`).
  - Zachowano domyślnych użytkowników testowych (`Marek Kowalski`, `Anna Nowak`, `Piotr Wiśniewski`, `Jan Kowalski`) z hasłem `haslo1234` oraz użytkowników zarejestrowanych.
- **Rozszerzenie taksonomii kategorii z 4 do 8:**
  - `cat_power_tools` (🔧 Elektronarzędzia)
  - `cat_cleaning` (🧹 Sprzęt czyszczący)
  - `cat_garden` (🌿 Ogród i Działka)
  - `cat_construction` (🏗️ Budowa i Remont)
  - `cat_workshop` (⚙️ Sprzęt warsztatowy)
  - `cat_painting` (🎨 Malowanie i Wykończenie)
  - `cat_measuring` (📐 Przyrządy pomiarowe)
  - `cat_transport` (🛞 Transport i Magazyn)
- **Wprowadzenie 111 unikalnych, wysokiej jakości ogłoszeń sprzętu:**
  - Sprzęt zrównoważony pomiędzy 4 domyślnych właścicieli (~28 przedmiotów na użytkownika) z lokalizacjami w dzielnicach Rzeszowa (Osiedle Akademickie, Słoneczne, Drabinianka, Nowe Miasto).
  - Każdy rekord posiada realistyczne parametry: tytuł renomowanych marek (DeWalt, Bosch, Makita, Kärcher, Stihl, Flex, Scheppach, Stanley itp.), opis ze specyfikacją techniczną, stawkę dobową, kaucję zwrotną, stan techniczny (`NEW`, `GOOD`, `FAIR`, `WELL_USED`) oraz regulamin wypożyczenia.
- **Autentyczne i zweryfikowane fotografie z Unsplash:**
  - Wyselekcjonowano 61 unikalnych identyfikatorów zdjęć z Unsplash odpowiadających konkretnym grupom narzędzi (brak generycznych/niedziałających grafik).
  - Wszystkie adresy URL zweryfikowano zapytaniami HTTP (kod odpowiedzi 200 OK).
- **Przykładowe dane transakcyjne:**
  - Utworzono 7 przykładowych wniosków o wypożyczenie w różnych statusach (`RETURNED`, `ACTIVE`, `APPROVED`) dla demonstracji blokady terminów w kalendarzu i przepływu aktywacji PIN.
  - Dodano 5 rzetelnych opinii sąsiedzkich (oceny 4-5 gwiazdek) z komentarzami potwierdzającymi jakość sprzętu i wzorowy kontakt.

---

## [2026-11-09] - Migracja infrastruktury: Usunięcie Dev Containers i czysta konteneryzacja Docker Compose
- **Usunięcie warstwy Microsoft Dev Containers:**
  - Trwale usunięto katalog `.devcontainer/` oraz plik `.devcontainer/devcontainer.json`.
  - Wyczyszczono z dokumentacji (`README.md`, `Project_context.md`, `AI_WORKFLOW.md`, `AGENTS.md`) wszelkie instrukcje oparte o VS Code Dev Containers na rzecz standardowych komend `docker compose`.
- **Wdrożenie dedykowanego obrazu deweloperskiego (`Dockerfile.dev`):**
  - Oparty na lekkim `node:22-alpine` z bibliotekami systemowymi `libc6-compat` oraz `openssl` (wymaganymi przez silnik Prisma na architekturze musl).
  - Skonfigurowano warstwowe kopiowanie zależności `package.json` i `package-lock.json` przed `npm ci`, w pełni wykorzystując cache warstw Dockera.
  - Wstępne wygenerowanie Prisma Client (`npx prisma generate`) w fazie budowania obrazu.
  - Zdefiniowano właściwe uprawnienia dla wbudowanego użytkownika `node` (UID `1000`), eliminując konflikty uprawnień na hoście.
- **Optymalizacja `docker-compose.yml` i `docker-compose.prod.yml`:**
  - `docker-compose.yml` wskazuje bezpośrednio na `Dockerfile.dev`.
  - Bind mount kodu hosta `.:/app` zapewnia natychmiastowy live-reloading (HMR / Fast Refresh).
  - Izolacja zależności linuksowych (`node_modules`) i cache Next.js (`.next`) w dedykowanych nazwanych wolumenach Dockera (`barter_node_modules`, `barter_next_cache`).
  - Trwałość danych SQLite (`prisma/dev.db`) poprzez mapowanie katalogu `prisma/` z hosta.
  - Zdefiniowano dedykowaną sieć mostkową `barter-network` (`driver: bridge`).
  - Polecenie startowe: `sh -c "npx prisma generate && npm run dev -- -H 0.0.0.0"`.
- **Aktualizacja skryptów zarządzania w `package.json`:**
  - `"docker:up": "docker compose up -d"`,
  - `"docker:build": "docker compose up --build"`,
  - `"docker:down": "docker compose down"`,
  - `"docker:prisma": "docker compose exec app npx prisma"`.
- **Przebudowa sekcji uruchomieniowej w `README.md`:**
  - Opisano standardowy, czysty przepływ: jedna komenda `docker compose up --build` stawia całe środowisko deweloperskie z zerowymi wymaganiami wstępnymi na hoście.

---

## [2026-11-07] - Wdrożenie rekomendacji poaudytowych (Security, Performance & Full Type-Safety)
- **Eliminacja wycieku PIN do właściciela sprzętu (`app/actions/rental.actions.ts`):**
  - **Problem (P0 Security):** W akcji `getUserDashboardDataAction` tablica `ownerRentals` zwracała pole `pickupPin` w odpowiedzi JSON do właściciela sprzętu. Mogło to umożliwić właścicielowi odczytanie kodu PIN najemcy w konsoli i aktywację wypożyczenia bez fizycznej obecności najemcy.
  - **Rozwiązanie:** Wprowadzono maskowanie `pickupPin: '****'` w `ownerRentals`. Właściciel nie zna kodu z góry i musi otrzymać go fizycznie od wypożyczającego przy odbiorze narzędzia.
- **Refaktoring Dashboardu do React Server Component (RSC) (`app/dashboard/page.tsx`, `components/dashboard/dashboard-client-view.tsx`):**
  - **Problem (P1 Architecture):** Strona `app/dashboard/page.tsx` była w całości komponentem klienckim (`'use client'`) pobierającym dane w `useEffect`, co powodowało kaskadę zapytań (waterfall), migotanie spinnera ładowania i użycie stanów `useState<any[]>`.
  - **Rozwiązanie:**
    - `app/dashboard/page.tsx` przekształcono w asynchroniczny Server Component (RSC) oczekujący na `searchParams: Promise<{ tab?: string }>` i ładujący dane po stronie serwera.
    - Wyodrębniono interaktywny kontener zakładek do `components/dashboard/dashboard-client-view.tsx`, zasilany ściśle typowanymi propsami `DashboardData` bez użycia `any`.
    - Eliminacja początkowego stanu ładowania – pulpit renderuje się natychmiast z pełną zawartością HTML zebraną na serwerze.
- **Wzmocnienie reguły ochrony trasy edycji w Middleware (`middleware.ts`):**
  - Zastąpiono podatny warunek `pathname.endsWith('/edit')` bezpiecznym wyrażeniem regularnym `/^\/items\/[^/]+\/edit(\/.*)?$/.test(pathname)`, poprawnie obsługującym zapytania z ukośnikiem na końcu (trailing slash) oraz parametry URL.
- **Całkowita eliminacja typów `any` z kodu aplikacji (100% Strict Type-Safety):**
  - W `lib/queries/items.queries.ts`: zastąpiono `where: any` oraz `orderBy: any` ścisłymi typami Prisma (`Prisma.ItemWhereInput`, `Prisma.ItemOrderByWithRelationInput`, `Prisma.FloatFilter`).
  - W `components/items/item-card.tsx`: zastąpiono `(item: any)` ścisłym typem unii `(item: CatalogItem | ItemWithDetails)`.
  - W `lib/utils.ts`: zastąpiono `{ [key: string]: any }` w `ClassValue` typem `{ [key: string]: unknown }`.
  - W blokach `catch` komponentów klienckich (`availability-calendar.tsx`, `multi-step-item-form.tsx`, `review-modal.tsx`, `renter-rentals-list.tsx`, `owner-requests-list.tsx`, `owner-items-list.tsx`): zastąpiono `catch (err: any)` idiomem `catch (err: unknown)` z bezpieczną ekstrakcją `err instanceof Error ? err.message : ''`.

---

## [2026-11-07] - Hotfix: Naprawa rejestracji, formatowania cen w katalogu i domyślnej strony po logowaniu
- **Naprawa rejestracji i walidacji formularzy (`app/(auth)/register/page.tsx`, `lib/validations/auth.ts`, `app/actions/auth.actions.ts`):**
  - **Problem:** Po kliknięciu "Zarejestruj konto i zaloguj" formularz nie wysyłał żądania, a przeglądarka podświetlała pole "Adres e-mail" bez żadnej informacji zwrotnej. Przyczyną była kolizja natywnej walidacji HTML5 (`required`, `type="email"`) blokującej wysyłkę w przeglądarce przed dotarciem do akcji serwerowej, a także brak sanitizacji białych znaków (np. spacji w autouzupełnianiu).
  - **Rozwiązanie:**
    - Dodano `noValidate` na formularzach w `register/page.tsx` oraz `login/page.tsx`, przekazując pełną kontrolę walidacji do serwerowego silnika Zod.
    - Zaktualizowano `registerSchema` i `loginSchema`: dodano `.trim()` oraz `.min(1, 'Adres e-mail jest wymagany')`, gwarantując czytelne komunikaty o błędach w języku polskim.
    - W `registerAction` i `loginAction` dodano przycinanie białych znaków i normalizację adresu email do małych liter (`.toLowerCase()`).
    - Wprowadzono dynamiczne komunikaty walidacji pod każdym polem oraz wyróżniony banner błędów na górze karty.
- **Poprawa formatowania ceny/doba w kartach katalogu (`components/items/item-card.tsx`):**
  - **Problem:** W wąskich kolumnach siatki (np. 4 kolumny lub widok mobilny) etykieta przycisku "Szczegóły / Wypożycz" spychała stawkę dobową, powodując zawijanie tekstu `/ doba` i rozjeżdżanie się wysokości kart.
  - **Rozwiązanie:**
    - Dodano klasę `whitespace-nowrap` na kontenerze ceny (`flex items-baseline gap-1.5 whitespace-nowrap`), uniemożliwiając rozdzielenie kwoty i jednostki czasu.
    - Zastosowano czytelne, proporcjonalne formatowanie `text-xl sm:text-2xl font-black text-orange-400`.
    - Skrócono etykietę przycisku do eleganckiego i zwięzłego "Wypożycz" (lub "Zajęty", gdy sprzęt jest niedostępny), zapewniając optymalną przestrzeń dla informacji o stawce i kaucji.
- **Domyślne przekierowanie po logowaniu i rejestracji na Katalog (`app/actions/auth.actions.ts`):**
  - Zmieniono domyślny cel przekierowania po pomyślnym zalogowaniu (`loginAction`) oraz rejestracji (`registerAction`) z `/dashboard` na stronę główną `/` (Katalog sprzętu).
  - Jeśli użytkownik próbował wejść na konkretną chronioną trasę (parametr `redirect`), przekierowanie nadal respektuje pierwotną ścieżkę.

---

## [2026-11-07] - Krok 6: Logika rezerwacji i Dashboard użytkownika (Rental State Machine & Role Views)
- **Rygorystyczna maszyna stanów wypożyczenia (`app/actions/rental.actions.ts`):**
  - Zamknięto pełny cykl życia wypożyczenia: `PENDING` $\rightarrow$ `APPROVED` $\rightarrow$ `ACTIVE` $\rightarrow$ `RETURNED` (oraz ścieżkę anulowania `CANCELLED`).
  - `createRentalRequestAction`:
    - Weryfikacja sesji (`requireAuth()`) i blokada samozamawiania (`item.ownerId === sessionUser.id`).
    - Transakcja bazodanowa (`prisma.$transaction`) weryfikująca brak nakładających się rezerwacji w statusach `APPROVED` i `ACTIVE`.
    - Obliczenie kwot: stawka właściciela (`days * dailyPrice`), 15% opłata platformy Barter, kaucja zwrotna oraz generowanie 4-cyfrowego kodu PIN (`pickupPin`).
    - Utworzenie rezerwacji w statusie `PENDING`.
  - `respondToRentalRequestAction`:
    - Dostępne wyłącznie dla właściciela przedmiotu.
    - Zmiana ze statusu `PENDING` na `APPROVED` lub `CANCELLED`.
  - `verifyPickupPinAndActivateAction`:
    - Dostępne wyłącznie dla właściciela przy statusie `APPROVED`.
    - Porównuje 4-cyfrowy kod PIN okazany przez sąsiada z bazodanowym `pickupPin`.
    - Atomowo przestawia stan na `ACTIVE`.
  - `completeReturnAction`:
    - Dostępne wyłącznie dla właściciela przy statusie `ACTIVE`.
    - Przestawia stan na `RETURNED` i zwalnia zablokowaną kaucję.
  - `cancelRentalAsRenterAction`:
    - Dostępne dla wypożyczającego do anulowania wniosków oczekujących (`PENDING`).
  - `createReviewAction`:
    - Wystawianie ocen (1–5 gwiazdek + komentarz) wyłącznie po zakończeniu wypożyczenia (`RETURNED`).
    - Ścisła relacja 1:1 (`rentalRequestId` unikalny w modelu `Review`), co uniemożliwia wielokrotne ocenianie tej samej transakcji.
- **Bezpieczna projekcja danych użytkownika (`getUserDashboardDataAction`):**
  - Rygorystyczne egzekwowanie prywatności: dokładny adres właściciela (`exactAddress`) oraz kod PIN (`pickupPin`) są odsłaniane w interfejsie wypożyczającego **wyłącznie** wtedy, gdy rezerwacja osiągnęła status `APPROVED` lub `ACTIVE`. W statusie `PENDING` dane te są maskowane na serwerze.
- **Komponenty widoków ról i Dashboardu użytkownika:**
  - `components/dashboard/renter-rentals-list.tsx`: Lista wypożyczeń sąsiedzkich z wyróżnionym panelem odbioru (kod PIN, telefon i odblokowany adres dla `APPROVED`/`ACTIVE`), przyciskiem anulowania dla `PENDING` oraz przyciskiem dodania opinii dla `RETURNED`.
  - `components/dashboard/owner-requests-list.tsx`: Panel właściciela podzielony na sekcje decyzyjne (oczekujące wnioski z przyciskami Zatwierdź/Odrzuć, zatwierdzone z polem weryfikacji PIN, aktywne z przyciskiem potwierdzenia zwrotu oraz historia).
  - `components/dashboard/owner-items-list.tsx`: Zarządzanie wystawionym sprzętem z szybkim przełącznikiem dostępności (`toggleItemAvailabilityAction`), linkami do edycji oraz statystykami.
  - `components/rentals/review-modal.tsx`: Interaktywne okno modalne z wyborem 1–5 gwiazdek oraz polem komentarza.
  - `app/dashboard/page.tsx`: Czysta, modułowa architektura z zakładkami: "Wypożyczam od sąsiadów", "Wypożyczenia mojego sprzętu", "Moje narzędzia" oraz "Model Prowizyjny (15%)".
- **Likwidacja długu technologicznego:**
  - Całkowicie usunięto monolityczny plik `app/actions.ts`. Wszyscy konsumenci korzystają teraz ze ściśle sparametryzowanych akcji w `app/actions/item.actions.ts`, `app/actions/rental.actions.ts` oraz `app/actions/auth.actions.ts`.

---

## [2026-11-07] - Krok 5: Moduł dodawania i edycji zasobów (Multi-Step Item Form)
- **Walidacja Zod dla zasobów sprzętowych (`lib/validations/item.ts`):**
  - Utworzono schemat główny `itemFormSchema` (walidacja tytułu min. 5, kategorii, stanu technicznego `ToolCondition`, opisu min. 20, stawki dobowej 5–5000 PLN, kaucji 0–10000 PLN, lokalizacji sąsiedzkiej oraz tablicy min. 1 URL zdjęcia).
  - Wyodrębniono schematy częściowe per krok (`step1Schema`, `step2Schema`, `step3Schema`).
- **Server Actions dla zarządzania sprzętem (`app/actions/item.actions.ts`):**
  - `createItemAction`: Walidacja wejścia Zod, weryfikacja sesji (`requireAuth()`), powiązanie z `ownerId`, `revalidatePath('/')` oraz `revalidatePath('/dashboard')`.
  - `updateItemAction`: Weryfikacja własności (`item.ownerId === sessionUser.id`), w przeciwnym razie błąd autoryzacji `403 Forbidden`, aktualizacja i unieważnienie cache.
  - `toggleItemAvailabilityAction`: Błyskawiczne ukrywanie/odkrywanie ogłoszenia w katalogu przez właściciela.
- **3-krokowy kreator ogłoszenia (`components/items/multi-step-item-form.tsx`):**
  - Krok 1 (Podstawowe dane): Tytuł modelu, kafelkowy wybór kategorii z bazy, selektor stanu technicznego z opisami, pole opisu ze zliczaniem znaków.
  - Krok 2 (Zdjęcia i finanse): Galeria miniatur, dodawanie URL zdjęć z walidacją, presety szablonowe, stawka dobowa i kaucja oraz dynamiczny kalkulator zarobku (stawka klienta, 15% prowizji serwisu, zysk netto za dobę, weekend i tydzień).
  - Krok 3 (Lokalizacja i zasady): Rejon/osiedle sąsiedzkie, regulamin użytkowania oraz podgląd karty ogłoszenia na żywo przed publikacją.
  - Blokada przejścia do kolejnego kroku w przypadku niespełnienia walidacji cząstkowej Zod.
- **Dedykowane widoki routingu:**
  - `app/items/new/page.tsx`: Asynchroniczny RSC weryfikujący sesję użytkownika i pobierający kategorie z bazy danych.
  - `app/items/[id]/edit/page.tsx`: Asynchroniczny RSC weryfikujący uprawnienia właściciela (`ownerId === sessionUser.id`) z prezentacją błędu 403 Forbidden w przypadku próby edycji cudzego sprzętu.

---

## [2026-11-07] - Hotfix: Eliminacja błędów hydratacji React 19 (Dark Reader & Browser Extensions)
- **Problem:**
  - W konsoli przeglądarki pojawiały się błędy hydratacji: `A tree hydrated but some attributes of the server rendered HTML didn't match the client properties`.
  - Rozszerzenie przeglądarki **Dark Reader** wstrzykiwało przed zakończeniem hydratacji React atrybuty na korzeniu `<html>` (`data-darkreader-mode="dynamic"`, `data-darkreader-scheme="dark"`) oraz inline style i atrybuty na elementach `<svg>` ikon `lucide-react` (`style="--darkreader-inline-stroke: currentColor;"`, `data-darkreader-inline-stroke=""`).
- **Rozwiązanie:**
  - `app/layout.tsx`:
    - Dodano tag `<meta name="darkreader-lock" />` w `<head>` oraz w konfiguracji `metadata.other` – oficjalna dyrektywa instruująca Dark Reader, że strona posiada natywny ciemny motyw i nie powinna być modyfikowana ani odwracana kolorystycznie.
    - Zdefiniowano `export const viewport: Viewport = { colorScheme: "dark", themeColor: "#0c0a09" }` oraz dodano `<meta name="color-scheme" content="dark" />`, co informuje silnik renderujący przeglądarki i rozszerzenia o ciemnym profilu strony.
    - Dodano atrybut `suppressHydrationWarning` na elementach `<html lang="pl">` oraz `<body>`, co chroni przed ostrzeżeniami hydratacji wywoływanymi przez zewnętrzne rozszerzenia przeglądarki (np. Dark Reader, menedżery haseł, tłumacze).
  - `app/items/[id]/page.tsx`:
    - Dodano `suppressHydrationWarning` na elemencie wyświetlającym sformatowaną datę recenzji (`toLocaleDateString('pl-PL')`), zabezpieczając przed ewentualnymi rozbieżnościami stref czasowych między kontenerem Docker (UTC) a przeglądarką użytkownika.
  - `types/react-shim.d.ts`:
    - Rozszerzono deklarację modułu `'next'` o typ `Viewport` dla pełnej zgodności kompilatora TypeScript w środowisku hosta.
- **Weryfikacja:**
  - Kompilacja TypeScript: 0 błędów na hoście i w kontenerze Docker.
  - Wygenerowany kod HTML zawiera znaczniki blokujące Dark Reader i informujące o `color-scheme="dark"`.

---

## [2026-11-07] - Krok 4: Katalog przedmiotów i eksploracja (Marketplace Core)
- **Warstwa zapytań katalogowych z rygorystyczną ochroną prywatności (`lib/queries/items.queries.ts`):**
  - `getCatalogItems`: Elastyczne pobieranie ofert z filtrowaniem wielokryterialnym:
    - Kategoria (`categorySlug`),
    - Wyszukiwanie tekstowe (`query`) przeszukujące `title`, `description` oraz `neighborLoc`,
    - Zakres cenowy (`minPrice`, `maxPrice`),
    - Stan techniczny sprzętu (`condition` z walidacją `ToolCondition`),
    - Dostępność w przedziale dat (`startDate`, `endDate`) – wyklucza narzędzia posiadające rezerwacje o statusie `APPROVED` lub `ACTIVE` kolidujące z wybranym zakresem,
    - Paginacja (`page`, `pageSize`, domyślnie 9 elementów na stronę) oraz sortowanie (`createdAt: desc`, `dailyPrice: asc`, `dailyPrice: desc`).
  - `getItemById`: Pobieranie pojedynczej oferty wraz z powiązanymi recenzjami (oraz publicznymi danymi ich autorów) i zablokowanymi terminami rezerwacji (`APPROVED` i `ACTIVE`).
  - **Ścisła izolacja wrażliwych danych właściciela (`publicOwnerSelect`):** Żadne zapytanie publiczne ani strona `/items/[id]` nie ujawnia prywatnych danych (`exactAddress`, `phone`, `email`, `passwordHash`). Publicznie dostępne są wyłącznie: `id`, `name`, `neighborhood`, `avatarUrl`, `city`.
- **Interaktywny pasek filtrów synchronizowany z parametrami URL (`components/items/item-filters.tsx`):**
  - Kliencki komponent (`'use client'`) zarządzający stanem filtrów przez `useSearchParams`, `useRouter`, `usePathname` oraz `useTransition`.
  - Płynne aktualizacje URL (np. `?category=elektronarzedzia&q=wiertarka&condition=PERFECT&minPrice=20&maxPrice=100&page=1`), umożliwiające bezpośrednie udostępnianie linków do przefiltrowanych wyników wyszukiwania.
  - Szybkie kafelki kategorii z emotikonami, formularz wyszukiwania tekstowego, zwijany panel filtrów zaawansowanych (stan narzędzia, widełki cenowe, zakres dat, sortowanie) oraz aktywne etykiety (chipy) z możliwością pojedynczego lub całościowego resetowania.
- **Interaktywna galeria zdjęć przedmiotu (`components/items/image-gallery.tsx`):**
  - Kliencki komponent parsujący `imagesJson` (lub fallback dla braku zdjęć).
  - Główny podgląd zdjęcia w wysokiej rozdzielczości z kontrolkami nawigacyjnymi "Poprzednie / Następne" oraz paskiem miniatur do szybkiego wyboru.
- **Interaktywny kalendarz dostępności i rezerwacji (`components/items/availability-calendar.tsx`):**
  - Kliencki kalendarz miesięczny z nawigacją między miesiącami.
  - Wizualne blokowanie dat przeszłych oraz terminów z istniejących rezerwacji (`APPROVED` lub `ACTIVE`).
  - Intuicyjny wybór zakresu dat (kliknięcie daty początkowej i końcowej).
  - Dynamiczny kalkulator kosztów w czasie rzeczywistym (stawka dzienna * liczba dni, 15% opłata serwisowa platformy, kaucja zwrotna, suma łączna).
  - Zabezpieczenie przed samozamawianiem (`isOwner: true` blokuje możliwość wypożyczenia własnego sprzętu).
  - Zintegrowany formularz z kodem BLIK wywołujący Server Action `createBookingWithPaymentAction`.
- **Dedykowany widok szczegółów oferty (`app/items/[id]/page.tsx`):**
  - Dynamiczny React Server Component pobierający ofertę przez `getItemById(id)`.
  - Zwraca natywny `HTTP 404 Not Found` (`notFound()`) dla nieistniejących identyfikatorów przedmiotów.
  - Zgodność z Next.js 16 (`cacheComponents: true` / Partial Prerendering): oznaczony `export const instant = false;`, co eliminuje ostrzeżenia prerenderowania przy zachowaniu dokładnego kodu HTTP 404.
  - Sekcje widoku: nawigacja okruszkowa (Breadcrumbs), galeria zdjęć, odznaka stanu technicznego, profil właściciela (osiedle, imię, awatar), opis techniczny, zasady wypożyczenia (`rentalRules`), sekcja recenzji sąsiedzkich z ocenami 1–5 gwiazdek oraz przyklejony panel boczny z `AvailabilityCalendar`.
- **Refaktoring strony głównej (`app/page.tsx`):**
  - Przekształcono w asynchroniczny React Server Component pobierający `getCategories()` oraz `getCatalogItems()` na podstawie parametrów `searchParams`.
  - Integracja komponentu `ItemFilters`, licznika znalezionych ofert, siatki kart `ItemCard` opakowanych w linki `<Link href="/items/[id]">` oraz paginacji opartej o linki URL.
  - Opakowanie w `<Suspense fallback={<CatalogSkeleton />}>` dla optymalnego streamingu.
- **Poprawki w układzie i typowaniu (`app/layout.tsx`, `types/`):**
  - Wyeliminowano błąd prerenderowania `usePathname() in a Client Component outside of <Suspense>` poprzez zastąpienie fallbacku `Navbar` czystym komponentem `NavbarSkeleton`.
  - Dodano brakujące deklaracje w `types/react-shim.d.ts` dla ikon `lucide-react` oraz opcji `scroll` w `router.push`.
- **Weryfikacja:**
  - `curl -I http://localhost:3001/items/item_dewalt_drill` -> `HTTP/1.1 200 OK`.
  - `curl -I http://localhost:3001/items/item_non_existent` -> `HTTP/1.1 404 Not Found`.
  - `curl -I "http://localhost:3001/?category=elektronarzedzia&q=wiertarka&page=1"` -> `HTTP/1.1 200 OK`.
  - TypeScript: 0 błędów na hoście (`node node_modules/typescript/bin/tsc --noEmit`) i w kontenerze Docker (`docker compose exec app npx tsc --noEmit`).
  - Prisma: Walidacja schematu `The schema at prisma/schema.prisma is valid 🚀`.

---

## [2026-11-07] - Krok 3: Uwierzytelnianie i autoryzacja (Auth Module)
- **Moduł sesyjny JWT w ciasteczkach HttpOnly:**
  - `lib/auth.ts`: Zaimplementowano funkcje `signSessionToken` (HS256 z wykorzystaniem Web Crypto API `jose`), `verifySessionToken`, `setSessionCookie` (`HttpOnly`, `SameSite: 'lax'`, `path: '/'`, `maxAge: 7 dni`), `deleteSessionCookie`, `getSessionUser` oraz asynchroniczny strażnik `requireAuth`.
  - Wyeliminowano podatność na layout shift i auth waterfalls poprzez pobieranie `getSessionUser()` bezpośrednio w Server Component `app/layout.tsx` i przekazywanie danych użytkownika jako prop do komponentu `Navbar`.
- **Rygorystyczna walidacja danych (Zod):**
  - `lib/validations/auth.ts`: Zdefiniowano schematy `loginSchema` (poprawny email, hasło min. 8 znaków) oraz `registerSchema` (rozszerzone o imię min. 2 znaki, osiedle min. 3 znaki, dokładny adres min. 5 znaków).
- **Next.js Server Actions dla autentykacji (`use server`):**
  - `app/actions/auth.actions.ts`:
    - `loginAction`: Walidacja Zod, wyszukiwanie w SQLite, weryfikacja hasła przez `bcryptjs.compare`, podpisanie JWT, ustawienie ciasteczka `barter_session`, bezpieczne przekierowanie z ochroną przed Open Redirect.
    - `registerAction`: Walidacja Zod, unikalność adresu email, haszowanie hasła solą 10 rund (`bcryptjs.hash`), atomowe utworzenie użytkownika w SQLite, podpisanie JWT i automatyczne logowanie.
    - `logoutAction`: Bezpieczne usunięcie ciasteczka sesyjnego i przekierowanie na stronę główną `/`.
- **Ochrona tras prywatnych w Next.js Middleware:**
  - `middleware.ts`: Chroni trasy `/dashboard/:path*`, `/items/new`, `/items/:path*/edit`. Weryfikuje podpis tokenu `barter_session` bez narzutu Node.js (Edge-compatible Web Crypto przez `jose`). W przypadku braku lub niepoprawności tokenu natychmiast przekierowuje na `/login?redirect=<ścieżka>`.
- **Interfejs użytkownika (React 19 Server/Client):**
  - `app/(auth)/login/page.tsx`: Formularz logowania oparty na hooku React 19 `useActionState`, obsługa błędów serwerowych per pole, wskaźniki ładowania oraz przyciski szybkiego logowania dla pre-seedowanych kont demonstracyjnych (hasło: `haslo1234`).
  - `app/(auth)/register/page.tsx`: Dedykowany formularz rejestracji z automatycznym logowaniem po utworzeniu konta.
  - `components/layout/navbar.tsx`: Dynamiczny stan nawigacji – po zalogowaniu prezentuje awatar z inicjałami, imię i nazwisko, etykietę osiedla oraz przycisk wylogowania; dla gości przyciski "Zaloguj się" i "Rejestracja".
- **Likwidacja sztywnych tożsamości (Eliminacja długu technologicznego):**
  - W `app/actions.ts` oraz `app/page.tsx` usunięto hardcodowane tożsamości wypożyczającego (`'Kamil Śliwa'`, `'Ty (Właściciel)'`).
  - Akcje `createBookingWithPaymentAction` oraz `createItemAction` weryfikują tożsamość zalogowanego użytkownika przez `requireAuth()`, przypisując operacje do `sessionUser.id`.
- **Konfiguracja środowiska i pakietów:**
  - Dodano `jose`, `bcryptjs`, `zod` oraz `@types/bcryptjs`.
  - W `.env` oraz `.env.example` dodano zmienną `JWT_SECRET`.
  - W `types/global.d.ts` oraz `types/react-shim.d.ts` dodano deklaracje ułatwiające statyczną analizę kodu w środowisku hosta.
- **Poprawki stabilności i środowiska deweloperskiego (Hotfix):**
  - `app/layout.tsx`: Usunięto błąd Next.js 16 `blocking-prerender-runtime` (`cookies() accessed outside of <Suspense> prevents prerendering`). Wyekstrahowano komponent asynchroniczny `AuthNavbar` i opakowano go w `<Suspense fallback={<Navbar user={null} />}>`, umożliwiając pełne prerenderowanie statycznych powłok stron (np. `/login`, `/register`).
  - `prisma/seed.ts` & `dev.db`: Zaktualizowano seeder do używania stałego hasha bcrypt dla hasła deweloperskiego `haslo1234`, dodano konto `jan.kowalski@example.com` i zaktualizowano hashe istniejących użytkowników w bazie SQLite (`marek.kowalski@barter.local`, `anna.nowak@barter.local`, `piotr.wisniewski@barter.local`).
  - `app/actions/auth.actions.ts`: Dodano mechanizm wstecznej kompatybilności i automatycznej migracji legacy hashy SHA-256 (`Haslo123!`) do bcrypt.
  - `app/(auth)/login/page.tsx`: Zaktualizowano panel szybkiego logowania – przyciski precyzyjnie odpowiadają kontom w bazie danych z podziałem na role i hasłem `haslo1234`.
  - `components/layout/navbar.tsx` & `app/actions/auth.actions.ts`: Usunięto błąd zawieszania przycisku wylogowania (`isLoggingOut` / wiecznie kręcący się spinner). `logoutAction` unieważnia cache układu (`revalidatePath('/', 'layout')`), a klient wykonuje natychmiastowe przekierowanie z pełnym odświeżeniem sesji.
  - `app/actions.ts` & `app/dashboard/page.tsx`: Wdrożono akcję `getUserDashboardAction()`, eliminując problem pokazywania tych samych wypożyczeń dla wszystkich kont. Wprowadzono separację: "Wypożyczam od sąsiadów" (z kodem PIN do okazania), "Wypożyczenia mojego sprzętu" (z polem weryfikacji PIN przez właściciela), "Moje narzędzia" (wystawiony sprzęt) oraz "Model Prowizyjny".
  - `components/items/item-card.tsx` & `app/page.tsx`: Umożliwiono kliknięcie w dowolne miejsce kafelka produktu (`cursor-pointer`). Rozbudowano modal o pełne dane: podgląd zdjęcia, profil właściciela (imię, osiedle, awatar), pełny opis techniczny (`description`), zasady wynajmu (`rentalRules`), kalkulator stawek i płatność BLIK.
- **Weryfikacja:** Wszystkie chronione trasy przekierowują z kodem `HTTP 307` na `/login`, sesja z ważnym tokenem JWT uzyskuje dostęp (`HTTP 200`), kompilacja TypeScript na hoście i w kontenerze przechodzi z zerową liczbą błędów (`0 errors`).

---

## [2026-11-07] - Krok 2: Refaktoring struktury katalogów i Design System
- **Wdrożono Atomic Design System (shadcn/ui patterns) na bazie Tailwind CSS v4:**
  - `lib/utils.ts`: Utworzono uniwersalną funkcję pomocniczą `cn` do bezpiecznego łączenia klas Tailwind.
  - `components/ui/button.tsx`: Warianty `primary`, `secondary`, `outline`, `ghost`, `destructive`, `success`, rozmiary `sm`, `md`, `lg`, `icon`, stan ładowania `isLoading`, pełne typowanie `React.ComponentProps<'button'>`.
  - `components/ui/badge.tsx`: Warianty semantyczne `primary`, `success`, `warning`, `danger`, `info`, `purple`, `default`, `outline`.
  - `components/ui/input.tsx`: Stylizacja industrialna dark theme, obsługa etykiet, błędów i tekstów pomocniczych.
  - `components/ui/card.tsx`: Zestaw komponentów kart (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`).
  - `components/ui/modal.tsx`: Dostępne okno modalne z blokadą przewijania tła, zamykaniem na `Escape` oraz kliknięcie w tło, zoptymalizowane pod urządzenia mobilne.
- **Komponenty domenowe:**
  - `components/rentals/status-badge.tsx`: Znaczniki statusu wypożyczenia (`PENDING`, `APPROVED`, `ACTIVE`, `RETURNED`, `CANCELLED`) z ikonami i kolorami semantycznymi.
  - `components/items/item-card.tsx`: Karta przedmiotu w stylu OLX/Vinted z podglądem zdjęcia, odznaką stanu technicznego (`ToolCondition`), odległością sąsiedzką, średnią oceną i podziałem cenowym (stawka + kaucja).
- **Struktura układu i routing aplikacji:**
  - `components/layout/navbar.tsx`: Globalny pasek nawigacyjny z logo, zintegrowaną wyszukiwarką, menu mobilnym i linkami do tras `/`, `/items/new`, `/dashboard`.
  - `components/layout/footer.tsx`: Stopka z odznakami zaufania (15% prowizji, weryfikacja PIN, kaucja, Rzeszów), linkami i notą prawną.
  - `app/layout.tsx`: Zaktualizowano atrybut `lang="pl"`, metadane Barter i opakowano aplikację w `Navbar` i `Footer`.
  - `app/page.tsx`: Przekształcono w dedykowaną stronę katalogu z filtrami kategorii, wyszukiwaniem i modalem rezerwacji.
  - `app/items/new/page.tsx`: Dedykowana podstrona wystawiania sprzętu (Krok 01).
  - `app/dashboard/page.tsx`: Dedykowana podstrona zarządzania wypożyczeniami, weryfikacji PIN (Krok 03) oraz panelu modelu prowizyjnego (PM).
- **Paleta barw industrialnych w `app/globals.css`:**
  - Skonfigurowano zmienne CSS: `stone-950` jako tło bazowe, `stone-900` dla kart, `orange-600` dla głównego akcentu, `emerald-500` dla ekonomii i sukcesu.
- **Weryfikacja:** Usunięto zduplikowany eksport `BarterPage` w `app/page.tsx`, wszystkie trasy zwracają `HTTP 200`, kompilacja `tsc --noEmit` na hoście i w kontenerze przechodzi z zerową liczbą błędów.

---

## [2026-11-07] - Wdrożenie Dev Containers, migracje Prisma i trwała dokumentacja AI

### 1. Wdrożenie Microsoft VS Code Dev Containers
- **Utworzono:** [.devcontainer/devcontainer.json](file:///home/kamivarr/Data/Projects/barter-app/.devcontainer/devcontainer.json) podłączony bezpośrednio pod istniejącą usługę `app` w [docker-compose.yml](file:///home/kamivarr/Data/Projects/barter-app/docker-compose.yml).
- **Zaktualizowano [Dockerfile](file:///home/kamivarr/Data/Projects/barter-app/Dockerfile):**
  - Dodano pakiety `git` oraz `bash` w etapie bazowym Alpine (`node:22-alpine`), co umożliwia integrację panelu Git oraz terminala bash w Dev Containers.
  - Skonfigurowano uprawnienia dla wbudowanego użytkownika `node` (UID `1000`), zapobiegając konfliktom uprawnień plików na hoście Fedora Linux.
- **Konfiguracja VS Code:**
  - Dodano rozszerzenia: `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`, `Prisma.prisma`, `bradlc.vscode-tailwindcss`, `ms-azuretools.vscode-docker`.
  - Ustawiono domyślny profil terminala na `/bin/bash`.
  - Skonfigurowano `postCreateCommand: "npx prisma generate"`.

### 2. Bezpieczne przejście na wersjonowane migracje Prisma (eliminacja `db push`)
- **Problem:** Kontenery uruchamiały `prisma db push`, co niosło ryzyko uszkodzenia lub utraty danych w bazie SQLite przy zmianach schematu w środowisku produkcyjnym/deweloperskim.
- **Rozwiązanie bez utraty danych:**
  - Wygenerowano pierwszą bazową migrację struktury za pomocą `prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` do pliku [prisma/migrations/0_init/migration.sql](file:///home/kamivarr/Data/Projects/barter-app/prisma/migrations/0_init/migration.sql).
  - Oznaczono migrację jako zaaplikowaną w istniejącej bazie `dev.db` za pomocą `npx prisma migrate resolve --applied 0_init`.
  - Zweryfikowano integralność danych – 100% rekordów zachowanych (3 użytkowników, 4 kategorie, 6 narzędzi, 2 wnioski o wynajem, 2 opinie).
  - Zastąpiono polecenie startowe w kontenerze: zamiast `prisma db push` zastosowano `npx prisma migrate deploy`.
  - Dodano dedykowane skrypty w [package.json](file:///home/kamivarr/Data/Projects/barter-app/package.json): `docker:prisma:migrate`, `docker:prisma:deploy`.

### 3. Usunięcie błędów kompilacji TypeScript i Next.js Server Actions
- **Błąd Server Actions:** Next.js 16 (Turbopack) wymaga, aby pliki oznaczone klauzulą `'use server'` eksportowały wyłącznie funkcje asynchroniczne (`async`). Funkcje `computeAverageRating` oraz `getFirstImage` były synchroniczne, co powodowało błąd budowania (`Server Actions must be async functions`).
  - **Naprawa:** Przeniesiono funkcje pomocnicze do [types/domain.ts](file:///home/kamivarr/Data/Projects/barter-app/types/domain.ts) i zaktualizowano importy w [app/page.tsx](file:///home/kamivarr/Data/Projects/barter-app/app/page.tsx).
- **Ostrzeżenie `baseUrl` w `tsconfig.json`:** Usunięto przestarzały klucz `"baseUrl": "."` w konfiguracji TypeScript 5 / bundler.
- **Wsparcie IDE na hoście:** Dodano deklaracje [types/global.d.ts](file:///home/kamivarr/Data/Projects/barter-app/types/global.d.ts) oraz [types/react-shim.d.ts](file:///home/kamivarr/Data/Projects/barter-app/types/react-shim.d.ts), eliminując błędy braku typów JSX / React 19 w środowisku hosta.

### 4. Nowa dokumentacja techniczna i workflow dla agentów AI
- Utworzono [Project_context.md](file:///home/kamivarr/Data/Projects/barter-app/Project_context.md) – pełne kompendium techniczne projektu.
- Utworzono [AI_WORKFLOW.md](file:///home/kamivarr/Data/Projects/barter-app/AI_WORKFLOW.md) – protokół inżynieryjny dla przyszłych modeli AI.
- Utworzono [docs/ARCHITECTURE.md](file:///home/kamivarr/Data/Projects/barter-app/docs/ARCHITECTURE.md) – diagramy Mermaid, ERD, maszyna stanów rezerwacji i przepływ danych.
- Zaktualizowano [AGENTS.md](file:///home/kamivarr/Data/Projects/barter-app/AGENTS.md) – zintegrowano reguły utrzymania dokumentacji przy jednoczesnym nienaruszonym zachowaniu bloku reguł Next.js.

### 5. Naprawa błędu runtime `prisma.rentalRequest.findMany is undefined`
- **Przyczyna:** Kontener `barter-app` działał w tle od czasu sprzed migracji modelu domenowego, przez co pamięć procesu Node.js (`globalThis.prisma`) oraz wolumen `node_modules` zawierały starą wersję klienta Prisma z modelem `booking` zamiast `rentalRequest`.
- **Wykryte kwestie poboczne i ich rozwiązanie:**
  - W `package.json` znajdowała się niespójna zależność `tsx`, blokująca `npm ci` przy przebudowie obrazu. Została usunięta (Node 22 posiada natywne `--experimental-strip-types`).
  - Uprawnienia wolumenów `node_modules` i `next_cache` utworzonych pierwotnie przez `root` zostały zaktualizowane (`chown -R 1000:1000`), umożliwiając płynną pracę użytkownika `node`.
- **Weryfikacja:** Obraz przebudowano (`docker compose up --build -d`), zweryfikowano obecność `git` i `bash` wewnątrz kontenera oraz wykonano zapytanie `getBarterDataAction` (zwraca HTTP 200).

---

## [2026-11-07] - Przebudowa warstwy danych i modelu domenowego
- Zastąpiono uproszczony model danych pełnym schematem domenowym w [prisma/schema.prisma](file:///home/kamivarr/Data/Projects/barter-app/prisma/schema.prisma):
  - Modele: `User`, `Category`, `Item`, `RentalRequest`, `Review`.
  - Enumy: `ToolCondition` (`NEW`, `GOOD`, `FAIR`, `WELL_USED`), `RentalStatus` (`PENDING`, `APPROVED`, `ACTIVE`, `RETURNED`, `CANCELLED`).
  - Indeksy zoptymalizowane pod filtrowanie kategorii, dostępności i cen.
- Usunięto auto-seedowanie z [app/actions.ts](file:///home/kamivarr/Data/Projects/barter-app/app/actions.ts) i utworzono dedykowany skrypt [prisma/seed.ts](file:///home/kamivarr/Data/Projects/barter-app/prisma/seed.ts).
- Utworzono [types/domain.ts](file:///home/kamivarr/Data/Projects/barter-app/types/domain.ts) z interfejsami, typami DTO i walidatorami.

---

## [2026-11-07] - Dockeryzacja i zmiana portu na 3001
- Utworzono wieloetapowy [Dockerfile](file:///home/kamivarr/Data/Projects/barter-app/Dockerfile) z obsługą środowiska dev oraz standalone production.
- Utworzono [docker-compose.yml](file:///home/kamivarr/Data/Projects/barter-app/docker-compose.yml) oraz [docker-compose.prod.yml](file:///home/kamivarr/Data/Projects/barter-app/docker-compose.prod.yml).
- Przypisano port `3001` zamiast `3000` w celu uniknięcia kolizji na maszynie hosta.
- Skonfigurowano izolację wolumenów `node_modules` i `next_cache`.
