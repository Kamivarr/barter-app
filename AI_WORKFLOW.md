# AI Workflow & Engineering Standards: Barter App

Ten dokument definiuje obowiązkowy protokół postępowania dla modeli sztucznej inteligencji (AI agents, LLM copilot) oraz programistów wprowadzających modyfikacje w repozytorium **Barter App**. Każdy agent ma bezwzględny obowiązek stosowania poniższych reguł.

---

## 1. Złote zasady pracy agenta AI

### Zasada 1: Weryfikacja rzeczywistości przed działaniem
Nigdy nie zakładaj stanu projektu na podstawie samych instrukcji promptu ani wiedzy wstępnej z treningu modelu. Zawsze:
1. Sprawdź strukturę katalogów (`ls -la`).
2. Przeczytaj zawartość modyfikowanych plików ([read_file](file:///home/kamivarr/Data/Projects/barter-app/)).
3. Sprawdź [Project_context.md](file:///home/kamivarr/Data/Projects/barter-app/Project_context.md) oraz [CHANGELOG_AI.md](file:///home/kamivarr/Data/Projects/barter-app/CHANGELOG_AI.md).

### Zasada 2: Minimalna inwazyjność i ochrona działających funkcji
Nie przepisuj całych plików od nowa, jeśli wystarczy punktowa modyfikacja. Nie usuwaj istniejących komentarzy, konfiguracji ani działających mechanizmów (np. bloków generowanych przez Next.js w [AGENTS.md](file:///home/kamivarr/Data/Projects/barter-app/AGENTS.md)).

### Zasada 3: Ochrona integralności bazy danych
- **Bezwzględny zakaz:** `prisma migrate reset`, `npx prisma db push --force-reset` lub usuwania pliku `prisma/dev.db`.
- **Bezwzględny zakaz:** uruchamiania `docker compose down -v` (kasowanie wolumenów).
- Wszelkie zmiany w schemacie muszą być przeprowadzane za pomocą wersjonowanych migracji Prisma.

### Zasada 4: Zero kodu "na ślepo" (weryfikacja na każdym etapie)
Po wprowadzeniu zmian w kodzie lub schemacie agent musi uruchomić odpowiednie testy weryfikacyjne (kompilacja TS, walidacja schematu Prisma, sprawdzenie migracji) i upewnić się, że kod nie generuje błędów.

---

## 2. Procedura modyfikacji schematu bazy danych (Prisma Migrations)

Gdy zadanie wymaga dodania lub zmiany tabel, kolumn, relacji lub indeksów:

1. **Edycja schematu:**
   Zmodyfikuj plik [prisma/schema.prisma](file:///home/kamivarr/Data/Projects/barter-app/prisma/schema.prisma).
2. **Walidacja poprawności schematu:**
   ```bash
   node node_modules/prisma/build/index.js validate
   # lub w kontenerze: npx prisma validate
   ```
3. **Utworzenie nowej migracji SQL:**
   - W środowisku hosta z uruchomionym Dockerem:
     ```bash
     docker compose exec app npx prisma migrate dev --name <nazwa_migracji>
     # lub: npm run docker:prisma:migrate -- --name <nazwa_migracji>
     ```
4. **Wygenerowanie zaktualizowanego klienta Prisma Client:**
   ```bash
   npx prisma generate
   ```
5. **Dostosowanie warstwy typów i akcji:**
   - Zaktualizuj interfejsy i funkcje w [types/domain.ts](file:///home/kamivarr/Data/Projects/barter-app/types/domain.ts).
   - Dostosuj akcje serwerowe w [app/actions.ts](file:///home/kamivarr/Data/Projects/barter-app/app/actions.ts).
   - Dostosuj skrypt seedujący [prisma/seed.ts](file:///home/kamivarr/Data/Projects/barter-app/prisma/seed.ts), jeśli schemat wymaga nowych pól obowiązkowych.
6. **Weryfikacja statusu migracji:**
   ```bash
   node node_modules/prisma/build/index.js migrate status
   ```

---

## 3. Procedura dodawania zależności npm

Aby zachować izolację środowiska i uniknąć konfliktów z systemem operacyjnym hosta:

1. **Dodanie pakietu w kontenerze:**
   ```bash
   # Uruchom instalację wewnątrz kontenera aplikacji
   docker compose exec app npm install <nazwa-pakietu>
   # LUB dla zależności deweloperskich:
   docker compose exec app npm install -D <nazwa-pakietu>
   ```
2. **Synchronizacja plików konfiguracyjnych:**
   Upewnij się, że zmiany w [package.json](file:///home/kamivarr/Data/Projects/barter-app/package.json) i `package-lock.json` są zapisane na dysku hosta (bind mount `.:/app` automatycznie to synchronizuje).
3. **Przebudowa obrazu (gdy dodano pakiety systemowe lub zmieniono Dockerfile):**
   ```bash
   npm run docker:dev:build
   # LUB: docker compose up --build -d
   ```

---

## 4. Procedura weryfikacji zmian przed zakończeniem zadania

Przed zaraportowaniem zadania jako ukończone agent AI musi wykonać następującą listę kontrolną:

1. **Walidacja składni Prisma:**
   ```bash
   node node_modules/prisma/build/index.js validate
   ```
2. **Weryfikacja migracji bazy danych:**
   ```bash
   node node_modules/prisma/build/index.js migrate status
   ```
3. **Kompilacja TypeScript (brak błędów typowania):**
   ```bash
   node node_modules/typescript/bin/tsc --noEmit
   ```
4. **Weryfikacja konfiguracji Docker Compose:**
   ```bash
   docker compose config
   ```
5. **Weryfikacja Next.js Server Actions:**
   Upewnij się, że plik `app/actions.ts` eksportuje wyłącznie funkcje asynchroniczne (`export async function ...`).
6. **Inspekcja czystości repozytorium:**
   ```bash
   git status
   ```
   Upewnij się, że nie pozostawiono tymczasowych plików śmieciowych, logów ani zduplikowanych baz SQLite.

---

## 5. Obowiązkowy protokół aktualizacji dokumentacji (Documentation Maintenance Protocol)

Każdy model AI wprowadzający zmiany architektoniczne, strukturalne lub konfiguracyjne **ma bezwzględny obowiązek zaktualizowania dokumentacji przed zakończeniem odpowiedzi**:

1. **Rejestr w [CHANGELOG_AI.md](file:///home/kamivarr/Data/Projects/barter-app/CHANGELOG_AI.md):**
   Dodaj nowy wpis pod bieżącą datą, opisujący:
   - Cel wprowadzonych zmian,
   - Zmodyfikowane i utworzone pliki,
   - Nowe komendy, migracje lub zmienne środowiskowe,
   - Status testów weryfikacyjnych.
2. **Aktualizacja [Project_context.md](file:///home/kamivarr/Data/Projects/barter-app/Project_context.md):**
   Jeśli modyfikacji uległy: porty, zmienne środowiskowe, modele Prisma, zależności lub architektura wolumenów.
3. **Aktualizacja [docs/ARCHITECTURE.md](file:///home/kamivarr/Data/Projects/barter-app/docs/ARCHITECTURE.md):**
   Jeśli wprowadzono nowe komponenty architektoniczne, encje bazodanowe lub zmieniono przepływ danych w systemie.
4. **Deklaracja spójności:**
   W finalnej odpowiedzi dla użytkownika model musi jednoznacznie potwierdzić:
   > *"Dokumentacja techniczna ([Project_context.md](file:///home/kamivarr/Data/Projects/barter-app/Project_context.md), [AI_WORKFLOW.md](file:///home/kamivarr/Data/Projects/barter-app/AI_WORKFLOW.md), [docs/ARCHITECTURE.md](file:///home/kamivarr/Data/Projects/barter-app/docs/ARCHITECTURE.md), [CHANGELOG_AI.md](file:///home/kamivarr/Data/Projects/barter-app/CHANGELOG_AI.md)) została zweryfikowana i zaktualizowana zgodnie ze stanem repozytorium."*
