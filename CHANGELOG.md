# Dziennik Zmian (Changelog): Barter App

Wszystkie istotne zmiany architektoniczne, funkcjonalne i konfiguracyjne projektu **Barter App** są rejestrowane w tym dokumencie.  
Format oparty jest na specyfikacji [Keep a Changelog](https://keepachangelog.com/pl/1.1.0/), a wersjonowanie na [Semantic Versioning](https://semver.org/).

---

## [1.0.0] - 2026-11-09

Wydanie oficjalne MVP (Minimum Viable Product) przygotowane do ewaluacji inżynierskiej i wdrożenia platformy sąsiedzkiego wynajmu sprzętu w Rzeszowie.

### Dodano (Added)
- **Interaktywna galeria zdjęć z Lightboxem i Zoomem 2x (`components/items/image-gallery.tsx`):**
  - Kliknięcie w zdjęcie główne oferty lub w dedykowany przycisk *„Powiększ”* otwiera pełnoekranowy modal podglądu z tłem `bg-stone-950/95 backdrop-blur-md` i blokadą scrolla (`body scroll lock`).
  - Tryb powiększenia 2x (`ZoomIn` / `ZoomOut` / płynna transformacja `scale-175`) do weryfikacji detali technicznych i stanu narzędzia.
  - Pełna obsługa skrótów klawiaturowych (`Escape` – zamknięcie, `ArrowLeft` / `ArrowRight` – nawigacja między zdjęciami).
  - Pasek miniatur i licznik fotografii (`1 / N`).
- **Obsługa ogłoszeń bez zdjęć (Opcjonalne fotografie):**
  - Zniesiono wymóg dołączania fotografii w schemacie Zod (`lib/validations/item.ts`), definiując tablicę `images` jako opcjonalną z domyślną pustą listą (`.default([])`).
  - W 3-krokowym formularzu dodawania sprzętu (`components/items/multi-step-item-form.tsx`) wprowadzono stan pusty z czytelnym komunikatem informującym o braku wymogu zdjęć.
  - Zaktualizowano funkcję domenową `getFirstImage` w `types/domain.ts` – brak zdjęć zwraca `null` zamiast generycznego URL-a, co aktywuje elegancki placeholder z ikoną `Wrench` w kartach katalogu i w panelu użytkownika.
- **Rozszerzenie taksonomii bazy danych i marketplace'u (`prisma/seed.ts`):**
  - Rozszerzono taksonomię z 4 do 8 kategorii: Elektronarzędzia, Sprzęt czyszczący, Ogród i Działka, Budowa i Remont, Sprzęt warsztatowy, Malowanie i Wykończenie, Przyrządy pomiarowe oraz Transport i Magazyn.
  - Zasilenie bazy 111 unikalnymi, autentycznymi ofertami renomowanych marek (DeWalt, Bosch, Makita, Kärcher, Stihl, Scheppach) ze zweryfikowanymi fotografiami Unsplash i lokalizacjami w dzielnicach Rzeszowa.
- **Optymalizacja konteneryzacji Docker Compose (`Dockerfile.dev`):**
  - Utworzono dedykowany, lekki obraz deweloperski oparty na `node:22-alpine` z bibliotekami systemowymi `libc6-compat` oraz `openssl` (wymaganymi przez silnik Prisma na architekturze musl).
  - Skonfigurowano izolację wolumenów Dockera dla `node_modules` i pamięci podręcznej Turbopack `.next`.

### Bezpieczeństwo i wydajność (Security & Performance)
- **Eliminacja wycieku PIN do właściciela narzędzia (`app/actions/rental.actions.ts`):**
  - Wprowadzono serwerowe maskowanie `pickupPin: '****'` w zestawieniu `ownerRentals`. Właściciel nie zna kodu z góry i musi otrzymać go fizycznie od wypożyczającego przy przekazaniu sprzętu.
- **Refaktoring Pulpitu Użytkownika do React Server Component (`app/dashboard/page.tsx`):**
  - Wyeliminowano zjawisko kaskady zapytań (waterfall) po stronie klienta oraz migotanie ekranu ładowania. Pulpit ładuje dane użytkownika po stronie serwera i przekazuje je do ściśle typowanego komponentu `DashboardClientView`.
- **Wzmocnienie ochrony tras w Edge Middleware (`middleware.ts`):**
  - Zabezpieczono trasę edycji sprzętu wyrażeniem regularnym `/^\/items\/[^/]+\/edit(\/.*)?$/`, uniemożliwiając ominięcie autoryzacji parametrami URL.
- **100% Strict Type-Safety:**
  - Całkowicie wyeliminowano typy `any` z warstwy zapytań (`lib/queries/items.queries.ts`), komponentów i bloków `catch`.

### Zmieniono (Changed)
- Podniesiono wersję projektu w `package.json` do `1.0.0`.
- Wyczyszczono z repozytorium zależność od środowiska VS Code Dev Containers na rzecz standardowych poleceń `docker compose`.
- Zapewniono stabilność hydratacji w React 19 poprzez blokadę zewnętrznych rozszerzeń przeglądarki (`darkreader-lock`).

---

## [0.2.0] - 2026-11-07

Etap wdrożenia kompletnego cyklu rezerwacji, autoryzacji oraz zarządzania sprzętem.

### Dodano (Added)
- **Rygorystyczna maszyna stanów wypożyczenia (`app/actions/rental.actions.ts`):**
  - Zamknięty cykl życia rezerwacji: `PENDING` $\rightarrow$ `APPROVED` $\rightarrow$ `ACTIVE` $\rightarrow$ `RETURNED` (oraz `CANCELLED`).
  - Blokada nakładających się terminów rezerwacji za pomocą transakcji bazodanowych `prisma.$transaction`.
  - Atomowa aktywacja wypożyczenia 4-cyfrowym kodem PIN okazany przez sąsiada.
- **Dwurolowy panel użytkownika (`app/dashboard/page.tsx`):**
  - Zakładka wypożyczającego z kodem PIN, bezpiecznym adresem i statusem.
  - Zakładka właściciela sprzętu z weryfikacją PIN, potwierdzeniem zwrotu oraz zarządzaniem ofertami.
  - Moduł reputacji: wystawianie ocen (1–5 gwiazdek z recenzją) powiązanych ściśle z relacją 1:1 do zrealizowanego wypożyczenia.
- **System uwierzytelniania oparty o ciasteczka sesyjne `HttpOnly` (`lib/auth.ts`):**
  - Tokeny sesyjne JWT (HS256) podpisywane przez bibliotekę `jose` (Web Crypto API).
  - Bezpieczne haszowanie haseł algorytmem bcrypt (koszt 10).
  - Ochrona tras prywatnych w Next.js Edge Middleware.
- **3-krokowy kreator ogłoszeń (`components/items/multi-step-item-form.tsx`):**
  - Krok 1: Informacje podstawowe i stan techniczny (`ToolCondition`).
  - Krok 2: Zdjęcia, stawka dobowa, kaucja i kalkulator 15% marży serwisowej.
  - Krok 3: Strefa sąsiedzka, regulamin i podgląd na żywo.

---

## [0.1.0] - 2026-10-26

Początkowa inicjalizacja szkieletu projektu i infrastruktury bazodanowej.

### Dodano (Added)
- Inicjalizacja projektu na bazie Next.js 16 (App Router, Turbopack) z React 19 i TypeScript 5.
- Wdrożenie Atomic Design System w oparciu o Tailwind CSS v4 i paletę industrialną (`stone-950`, `orange-600`).
- Schemat relacyjny Prisma ORM (modele `User`, `Category`, `Item`, `RentalRequest`, `Review`) z bazą SQLite.
- Konfiguracja środowiska kontenerowego Docker Compose (port `3001`).
