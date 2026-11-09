# Specyfikacja Systemowa i Dokument Architektury: Barter App

Oficjalny dokument specyfikacji technicznej i architektury oprogramowania platformy **Barter**. Zawiera szczegółowy opis tożsamości systemu, architektury wielowarstwowej, środowiska uruchomieniowego, modelu domenowego, mechanizmów bezpieczeństwa oraz standardów inżynieryjnych.

---

## 1. Tożsamość i cel biznesowy projektu

**Barter App** to platforma internetowa typu peer-to-peer (P2P) wspierająca lokalne społeczności (początkowo dzielnice Rzeszowa) w bezpiecznym wypożyczaniu sprzętu domowego, remontowego i ogrodniczego (np. wiertarki udarowe, drabiny teleskopowe, myjki ciśnieniowe, glebogryzarki).

### Główne filary biznesowe:
1. **Lokalność i sąsiedzkość:** Użytkownicy wyszukują przedmioty w swojej okolicy (np. Nowe Miasto, Drabinianka, Baranówka) z dokładną lokalizacją i wyznaczoną strefą odbioru.
2. **Model finansowy i prowizyjny:**
   - Wynajem rozliczany w stawkach dziennych (`dailyPrice`).
   - Platforma pobiera **15% opłaty serwisowej / prowizji** (`commissionAmount = days * dailyPrice * 0.15`).
   - Właściciel otrzymuje 100% stawki bazowej (`ownerAmount = days * dailyPrice`).
   - Opcjonalna **kaucja zwrotna** (`depositAmount`) zabezpieczająca stan sprzętu.
   - Łączna kwota do zapłaty: `totalPaid = ownerAmount + commissionAmount + depositAmount`.
3. **Bezpieczeństwo i przepływ odbioru:**
   - 4-cyfrowy kod PIN (`pickupPin`) generowany dla każdego zatwierdzonego wniosku.
   - Weryfikacja PIN przez właściciela przy przekazaniu sprzętu fizycznie weryfikuje start wypożyczenia.
4. **Maszyna stanów wypożyczenia:**
   - `PENDING` -> `APPROVED` -> `ACTIVE` -> `RETURNED` (lub `CANCELLED`).
5. **System reputacji i ocen:**
   - Recenzje powiązane ściśle ze zrealizowanym wnioskiem o wypożyczenie (`rentalRequestId` - relacja 1:1).
   - Skala ocen 1–5 gwiazdek z komentarzem tekstowym.

---

## 2. Stack technologiczny

| Warstwa | Technologia | Wersja / Szczegóły |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router, Server Actions) | `16.4.3` (Turbopack) |
| **Biblioteka UI** | React / React DOM | `19.3.0` |
| **Język** | TypeScript | `^5` (Strict mode, ES2017 target) |
| **Stylowanie** | Tailwind CSS | `v4` (`@tailwindcss/turbopack`) |
| **Ikony** | Lucide React | `^1.61.0` |
| **ORM** | Prisma | `^5.22.0` |
| **Baza danych** | SQLite | Plik `prisma/dev.db` |
| **Uwierzytelnianie** | JWT (jose) + bcryptjs | Tokeny sesyjne w ciasteczkach `HttpOnly` (`jose ^6`, `bcryptjs ^3`) |
| **Walidacja danych** | Zod | Schematy walidacji wejścia (`zod ^4`) |
| **Konteneryzacja** | Docker & Docker Compose | Multi-stage build (`node:22-alpine`, `Dockerfile.dev`, `Dockerfile`) |
| **Zarządzanie kontenerami** | Standard Docker Compose | Izolacja `barter-network`, wolumeny dla `node_modules` i `.next` |

---

## 3. Struktura katalogów i kluczowe pliki

```text
barter-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx         # Widok logowania z useActionState i szybkimi kontami demo
│   │   └── register/
│   │       └── page.tsx         # Widok rejestracji nowego użytkownika z autologowaniem
│   ├── actions/
│   │   ├── auth.actions.ts      # Server Actions: logowanie, rejestracja, wylogowanie
│   │   ├── item.actions.ts      # Server Actions: tworzenie, edycja, zmiana widoczności sprzętu
│   │   └── rental.actions.ts    # Server Actions: maszyna stanów, PIN, zwrot, opinie, dashboard
│   ├── dashboard/
│   │   └── page.tsx             # Panel użytkownika z przełącznikiem ról (Wypożyczający / Właściciel)
│   ├── items/
│   │   ├── [id]/
│   │   │   ├── edit/
│   │   │   │   └── page.tsx     # Edycja ogłoszenia (weryfikacja 403 Forbidden dla osób trzecich)
│   │   │   └── page.tsx         # Dedykowany widok oferty (galeria, profil właściciela, kalendarz, opinie)
│   │   └── new/
│   │       └── page.tsx         # 3-krokowy kreator wystawienia nowego sprzętu (Krok 01)
│   ├── globals.css              # Style Tailwind CSS v4 i paleta industrialna (stone-950, orange-600)
│   ├── layout.tsx               # Główny layout (AuthNavbar, NavbarSkeleton, Footer, lang="pl", darkreader-lock)
│   └── page.tsx                 # Strona główna – asynchroniczny katalog RSC z filtrami searchParams
├── components/
│   ├── dashboard/
│   │   ├── owner-items-list.tsx    # Zarządzanie własnymi narzędziami i przełącznik widoczności
│   │   ├── owner-requests-list.tsx # Decyzje o wnioskach, weryfikacja PIN, potwierdzenie zwrotu
│   │   └── renter-rentals-list.tsx # Lista wypożyczeń, bezpieczny kod PIN i adres, anulowanie, recenzje
│   ├── items/
│   │   ├── availability-calendar.tsx # Interaktywny kalendarz rezerwacji z kalkulatorem i blokadą dat
│   │   ├── image-gallery.tsx    # Galeria zdjęć oferty z miniaturami, pełnoekranowym lightboxem i zoomem
│   │   ├── item-card.tsx        # Karta przedmiotu w stylu OLX/Vinted z linkiem do /items/[id]
│   │   ├── item-filters.tsx     # Kliencki pasek filtrów zsynchronizowany z URL searchParams
│   │   └── multi-step-item-form.tsx  # 3-krokowy formularz dodawania i edycji z walidacją Zod
│   ├── layout/
│   │   ├── footer.tsx           # Stopka z odznakami zaufania, linkami i notą prawną
│   │   └── navbar.tsx           # Globalna nawigacja z sesją użytkownika, wyszukiwarką i menu
│   ├── rentals/
│   │   ├── review-modal.tsx     # Okno modalne z gwiazdkami 1–5 i komentarzem po zakończeniu wypożyczenia
│   │   └── status-badge.tsx     # Semantyczne znaczniki statusu rezerwacji z polskimi etykietami
│   └── ui/                      # Reużywalne komponenty atomic design (wzorce shadcn/ui)
│       ├── badge.tsx            # Znacznik etykietowy z wariantami kolorystycznymi
│       ├── button.tsx           # Przycisk z wariantami, stanem isLoading i rozmiarami
│       ├── card.tsx             # Karty panelowe (Card, Header, Title, Description, Content, Footer)
│       ├── input.tsx            # Pole wprowadzania z etykietą, błędem i tekstem pomocniczym
│       └── modal.tsx            # Okno modalne z backdrop blur, blokadą scrolla i zamykaniem na Escape
├── docs/
│   └── ARCHITECTURE.md          # Szczegółowa architektura systemu z diagramami Mermaid
├── lib/
│   ├── auth.ts                  # Bezpieczna obsługa JWT, weryfikacja ciasteczek i requireAuth
│   ├── prisma.ts                # Singleton klienta Prisma dla Next.js (hot-reload safe)
│   ├── queries/
│   │   └── items.queries.ts     # Zoptymalizowana warstwa zapytań Prisma (katalog, filtry, szczegóły)
│   ├── utils.ts                 # Funkcja pomocnicza `cn` do łączenia klas Tailwind
│   └── validations/
│       ├── auth.ts              # Schematy walidacji Zod dla logowania i rejestracji
│       ├── item.ts              # Schemat walidacji Zod dla ogłoszeń sprzętu i kroków formularza
│       └── rental.ts            # Schematy walidacji Zod dla rezerwacji, PIN i recenzji
├── middleware.ts                # Ochrona tras prywatnych (/dashboard, /items/new, /items/:id/edit)
├── prisma/
│   ├── dev.db                   # Baza danych SQLite (przechowywana w repozytorium)
│   ├── migrations/              # Wersjonowane migracje SQL Prisma
│   │   └── 0_init/
│   │       └── migration.sql    # Bazowa migracja struktury tabel, indeksów i relacji
│   ├── schema.prisma            # Schemat domeny Prisma (User, Category, Item, itp.)
│   └── seed.ts                  # Samodzielny skrypt seedujący początkowe dane
├── public/                      # Zasoby statyczne aplikacji
├── types/
│   ├── domain.ts                # Typy TypeScript, interfejsy DTO oraz czyste funkcje pomocnicze
│   ├── global.d.ts              # Globalne deklaracje środowiskowe dla edytora hosta
│   └── react-shim.d.ts          # Zapewnienie typów React 19 dla host-side IntelliSense
├── .dockerignore                # Wykluczenia z kontekstu budowania Dockera
├── .env                         # Lokalny plik zmiennych środowiskowych (git-ignored)
├── .env.example                 # Szablon zmiennych środowiskowych
├── CHANGELOG.md                 # Dziennik zmian zgodny ze specyfikacją Keep a Changelog
├── CONTRIBUTING.md              # Standardy inżynieryjne, migracje bazy i przewodnik weryfikacji
├── docker-compose.yml           # Konfiguracja deweloperska Docker Compose (serwis app, sieć barter-network)
├── docker-compose.prod.yml      # Konfiguracja produkcyjna Docker Compose (standalone)
├── Dockerfile                   # Wielostopniowy produkcyjny obraz Docker (base, deps, builder, production)
├── Dockerfile.dev               # Dedykowany obraz deweloperski z warstwowym cache npm i Prisma
├── next.config.ts               # Konfiguracja Next.js (output standalone, images)
├── package.json                 # Zależności npm i skrypty uruchomieniowe (docker:up, docker:build, docker:prisma)
├── Project_context.md           # Specyfikacja techniczna systemu
└── tsconfig.json                # Konfiguracja kompilatora TypeScript
```

---

## 4. Środowisko Docker i Docker Compose

### Konfiguracja Docker Compose (`docker-compose.yml`)
- **Usługa główna:** `app`
- **Obraz/Dockerfile:** `Dockerfile.dev` (Node.js 22 Alpine z bibliotekami `libc6-compat` i `openssl`).
- **Port:** `3001:3001` (zmieniony z 3000 w celu uniknięcia kolizji z usługami systemowymi hosta).
- **Zmienne środowiskowe w kontenerze:**
  - `NODE_ENV=development`
  - `PORT=3001`
  - `HOSTNAME=0.0.0.0`
  - `WATCHPACK_POLLING=true` (gwarantuje natychmiastowy i niezawodny hot-reload w Next.js na systemach Linux/WSL2/macOS).
  - `DATABASE_URL=file:./dev.db`
- **Zarządzanie wolumenami i izolacja:**
  - `.:/app` – bind mount kodu roboczego z hosta do kontenera z obsługą HMR.
  - `node_modules:/app/node_modules` – nazwany wolumen Dockera (`barter_node_modules`) izolujący pakiety linuksowe od hosta.
  - `next_cache:/app/.next` – nazwany wolumen Dockera (`barter_next_cache`) na cache kompilacji Next.js/Turbopack.
- **Trwałość danych SQLite:** Plik `prisma/dev.db` w katalogu `prisma/` jest powiązany z dyskiem hosta przez bind mount i zachowuje wszystkie rekordy po wyłączeniu kontenerów.
- **Sieć:** Izolowana sieć mostkowa `barter-network` (`driver: bridge`).

---

## 5. Baza danych, SQLite i migracje Prisma

### Położenie bazy danych i ścieżki
- Plik bazy: `prisma/dev.db`.
- **Ważne:** W Prisma dla providera SQLite ścieżka `file:./dev.db` jest rozwiązywana względem katalogu, w którym znajduje się `schema.prisma` (czyli `prisma/`). Dlatego zmienna `DATABASE_URL` ma wartość `file:./dev.db`.
- Baza SQLite znajduje się w katalogu `prisma/`, który jest objęty bind mountem `.:/app`. Dane są natychmiast utrwalane na dysku hosta i nie przepadają przy restartach kontenera.

### Przejście z `db push` na formalne migracje Prisma
Projekt nie korzysta już z destrukcyjnego i niestabilnego `prisma db push`. Zamiast tego wprowadzono wersjonowane migracje:
1. `prisma/migrations/0_init/migration.sql` – migracja bazowa wygenerowana na podstawie istniejącego schematu i oznaczona jako zaaplikowana (`prisma migrate resolve --applied 0_init`).
2. Przy starcie kontenera wykonywane jest bezpieczne polecenie `npx prisma migrate deploy`, które aplikuje wyłącznie nowe, zatwierdzone migracje bez ryzyka utraty istniejących wierszy.
3. Tworzenie nowej migracji w trybie deweloperskim:
   ```bash
   docker compose exec app npx prisma migrate dev --name <nazwa_zmiany>
   # lub: npm run docker:prisma:migrate -- --name <nazwa_zmiany>
   ```

### Seeder bazy danych
- Skrypt: `prisma/seed.ts`.
- Zawiera pełny zestaw 8 kategorii (Elektronarzędzia, Sprzęt czyszczący, Ogród i Działka, Budowa i Remont, Sprzęt warsztatowy, Malowanie i Wykończenie, Przyrządy pomiarowe, Transport i Magazyn), 4 domyślnych użytkowników testowych z hasłem deweloperskim `haslo1234`, 111 różnorodnych przedmiotów z autentycznymi fotografiami z Unsplash przypisanych do dzielnic Rzeszowa, a także przykładowe wypożyczenia (`RETURNED`, `ACTIVE`, `APPROVED`) i opinie 1–5 gwiazdek.
- Uruchamiany automatycznie przez Prisma CLI na podstawie konfiguracji w `package.json`:
  ```json
  "prisma": {
    "seed": "node --no-warnings --experimental-strip-types prisma/seed.ts"
  }
  ```
- Ręczne wywołanie seedowania:
  ```bash
  npm run docker:prisma:seed
  # lub: docker compose exec app npx prisma db seed
  ```

---

## 6. Zmienne środowiskowe

Szablon znajduje się w `.env.example`:

| Zmienna | Wartość domyślna | Przeznaczenie |
| :--- | :--- | :--- |
| `PORT` | `3001` | Port nasłuchiwania serwera HTTP Next.js |
| `HOSTNAME` | `0.0.0.0` | Adres powiązania interfejsu sieciowego w kontenerze |
| `NODE_ENV` | `development` | Środowisko wykonawcze Node.js (`development` / `production`) |
| `DATABASE_URL` | `file:./dev.db` | Ścieżka do bazy danych SQLite dla Prisma |
| `WATCHPACK_POLLING` | `true` | Uruchomienie mechanizmu odpytywania dla hot-reload w kontenerze |
| `JWT_SECRET` | *32+ znaków klucz HS256* | Tajny klucz do podpisywania i weryfikacji tokenów sesyjnych JWT |

---

## 7. Moduł Uwierzytelniania i Bezpieczeństwo (Auth Module)

1. **Ciasteczka sesyjne `HttpOnly` (`barter_session`):**
   - Podpisane algorytmem HS256 za pomocą biblioteki `jose` (Web Crypto API).
   - Flagi: `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'lax'`, `path: '/'`, `maxAge: 7 dni`.
   - Zabezpieczenie przed kradzieżą tokenu przez XSS oraz eliminacja wycieków do skryptów klienckich.
2. **Next.js Middleware (`middleware.ts`):**
   - Chronione trasy: `/dashboard/:path*`, `/items/new`, `/items/:path*/edit`.
   - Brak ważnego tokenu natychmiast przekierowuje na `/login?redirect=<ścieżka>` (kod `HTTP 307`).
   - Weryfikacja JWT w runtime Edge bez konieczności odpytywania bazy danych przy każdym żądaniu routingu.
3. **Haszowanie haseł:**
   - Realizowane przy użyciu `bcryptjs` z solą o koszcie 10 (`bcrypt.hash(password, 10)`).
   - W schemacie Prisma pole `passwordHash` przechowuje wyłącznie skrót hasła.
4. **Walidacja wejścia (Zod):**
   - Formularze logowania i rejestracji są rygorystycznie walidowane w `lib/validations/auth.ts` (email, hasło min. 8 znaków, imię min. 2 znaki, osiedle min. 3 znaki, adres min. 5 znaków).
5. **Autoryzacja w Server Actions:**
   - Funkcja `requireAuth()` weryfikuje sesję i zwraca bezpieczny profil użytkownika (`SessionUser`) pozbawiony hasza hasła.
   - Wszystkie operacje tworzenia przedmiotów i wypożyczeń są powiązane z `sessionUser.id`, definitywnie eliminując sztywne tożsamości.
6. **Przepływ przekierowań po autoryzacji:**
   - Zarówno akcja logowania (`loginAction`), jak i rejestracji (`registerAction`) domyślnie kierują użytkownika na stronę główną katalogu `/`, zachowując intuicyjną ścieżkę przeglądania ofert sąsiedzkich. Parametr `redirect` jest honorowany, gdy logowanie nastąpiło w trakcie próby wejścia na trasę chronioną.

---

## 8. Moduł Katalogu i Eksploracji Ofert (Marketplace Core)

1. **Warstwa zapytań katalogowych (`lib/queries/items.queries.ts`):**
   - Obsługuje zaawansowane filtrowanie ofert:
     - Kategoria (`categorySlug`),
     - Wyszukiwanie tekstowe (`query` w `title`, `description`, `neighborLoc`),
     - Widełki cenowe (`minPrice`, `maxPrice`),
     - Stan techniczny (`condition` z walidacją `ToolCondition`),
     - Dostępność w przedziale dat (`startDate`, `endDate`) poprzez wykluczenie nakładających się rezerwacji `APPROVED` / `ACTIVE`,
     - Sortowanie i paginacja (`page`, `pageSize`).
2. **Ochrona prywatności właściciela (`publicOwnerSelect`):**
   - Prywatne dane (`exactAddress`, `phone`, `email`, `passwordHash`) są wyłączone ze zapytań katalogowych i widoku szczegółów oferty.
   - Publicznie zwracane są wyłącznie: `id`, `name`, `neighborhood`, `avatarUrl`, `city`.
3. **Synchronizacja stanu filtrów z URL:**
   - Kliencki komponent `ItemFilters` synchronizuje stan zaawansowanych filtrów z `searchParams` URL (np. `?category=ogrod&minPrice=20&page=1`), umożliwiając bezpośrednie linkowanie i zachowanie historii przeglądarki.
4. **Kalendarz dostępności i rezerwacji (`AvailabilityCalendar`):**
   - Wizualizuje zablokowane i przeszłe terminy.
   - Na bieżąco przelicza koszty wypożyczenia (stawka bazowa, 15% opłata platformy, kaucja zwrotna, suma).
   - Weryfikuje tożsamość (`isOwner`) i blokuje możliwość rezerwacji własnego sprzętu.
5. **Widok szczegółów oferty (`/items/[id]`):**
   - Dynamiczny Server Component z galerią zdjęć (`ImageGallery`), opisem technicznym, regulaminem, sekcją recenzji sąsiedzkich oraz kalendarzem rezerwacji.
   - Zwraca `HTTP 404 Not Found` dla nieznanych identyfikatorów przedmiotów.

---

## 9. Znane ograniczenia i reguły architektoniczne

1. **Next.js 16 Server Actions – zakaz funkcji synchronicznych:**
   Pliki oznaczone klauzulą `'use server'` (np. [app/actions.ts](file:///home/kamivarr/Data/Projects/barter-app/app/actions.ts)) mogą eksportować **wyłącznie funkcje asynchroniczne (`async`)**. Wszystkie czyste funkcje pomocnicze (np. `computeAverageRating`, `getFirstImage`) muszą znajdować się w plikach bez dyrektywy `'use server'` (np. [types/domain.ts](file:///home/kamivarr/Data/Projects/barter-app/types/domain.ts)).
2. **Next.js 16 Partial Prerendering i `cacheComponents: true`:**
   W trybie PPR uncached dynamic data (takie jak zapytania bazodanowe per dynamiczny parametr trasy) w Server Components nie mogą blokować prerenderowania bez jawnej flagi. Dynamiczne strony mogące zwracać `notFound()` (kod 404) deklarują `export const instant = false;`, co zapobiega błędom streamingu i gwarantuje poprawny kod nagłówka HTTP 404.
3. **Kompilator TypeScript i `baseUrl`:**
   W TypeScript 5+ w połączeniu z `"moduleResolution": "bundler"`, opcja `"baseUrl": "."` jest traktowana jako przestarzała. Ścieżki aliasowe `@/*` są mapowane bezpośrednio jako `"@/*": ["./*"]`.
4. **Izolacja `node_modules` i wsparcie dla hosta:**
   Główny zestaw modułów Node.js znajduje się w wolumenie Dockera. Aby edytor na hoście nie zgłaszał fałszywych błędów braku typów JSX / React 19, w katalogu `types/` umieszczono pliki deklaracji środowiskowych (`types/global.d.ts` oraz `types/react-shim.d.ts`).
5. **Zakaz `docker compose down -v`:**
   Nigdy nie należy usuwać wolumenów Dockera flagą `-v`, aby nie wymusić ponownego pobierania pakietów i utraty cache.
6. **Hydratacja React 19 a rozszerzenia przeglądarki (Dark Reader):**
   Główny układ aplikacji definiuje `<meta name="darkreader-lock" />`, `colorScheme: 'dark'` w konfiguracji viewport oraz `suppressHydrationWarning` na znacznikach `<html>` i `<body>`. Zapobiega to modyfikacji drzewa DOM i wstrzykiwaniu atrybutów przez rozszerzenia przeglądarki (np. Dark Reader na elementach `<svg>`) przed zakończeniem fazy hydratacji React.

---

## 10. Moduł Dashboardu i Maszyna Stanów Wypożyczeń

1. **Architektura React Server Component (`app/dashboard/page.tsx`):**
   - Strona pulpitu jest asynchronicznym Server Componentem (RSC) ładującym dane sesyjne użytkownika na serwerze i przekazującym je do interaktywnego widoku klienta [`DashboardClientView`](file:///home/kamivarr/Data/Projects/barter-app/components/dashboard/dashboard-client-view.tsx).
   - Eliminuje to kaskadowe zapytania po stronie klienta (`useEffect` waterfall) oraz migotanie ekranu ładowania.
2. **Bezpieczeństwo Kodu PIN (`pickupPin`) i Ochrona Danych Adresowych:**
   - Wypożyczający (`borrowedRentals`) widzi dokładny adres właściciela oraz kod PIN **wyłącznie** przy statusach `APPROVED` i `ACTIVE`. W statusach `PENDING`, `RETURNED` i `CANCELLED` dane te są maskowane do `null` / `'****'`.
   - Właściciel sprzętu (`ownerRentals`) **nigdy** nie otrzymuje kodu PIN w payloadzie (`pickupPin: '****'`). Weryfikacja PIN odbywa się w trybie challenge-response przez akcję `verifyPickupPinAndActivateAction`.
3. **Ścisłe Typowanie (Zero `any`):**
   - Wszystkie zapytania bazodanowe, filtry, sortowania oraz stany komponentów korzystają w 100% z silnych typów generowanych przez Prismę i schematy domenowe.
