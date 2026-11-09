# Standardy Inżynieryjne i Przewodnik Kontrybucji: Barter App

Dokument definiuje standardy inżynieryjne, procedury pracy z bazą danych, zasady bezpieczeństwa oraz reguły weryfikacji kodu dla deweloperów i kontrybutorów rozwijających platformę **Barter**.

---

## 1. Złote zasady inżynierskie (Golden Rules)

1. **Środowisko Docker Compose:** Podstawowym środowiskiem wykonawczym projektu jest kontener Docker (port **3001**). Uprawnienia użytkownika kontenera są przypisane do wbudowanego użytkownika `node` (UID `1000`), co zapobiega konfliktom uprawnień na maszynie hosta.
2. **Ochrona integralności bazy danych:**
   - **Bezwzględny zakaz:** `prisma migrate reset`, `npx prisma db push --force-reset` oraz usuwania pliku bazy SQLite `prisma/dev.db`.
   - **Bezwzględny zakaz:** `docker compose down -v` (kasowanie nazwanych wolumenów Dockera).
   - Wszystkie zmiany schematu muszą być wdrażane przez wersjonowane migracje SQL (`prisma migrate dev`).
3. **Next.js 16 Server Actions:** Pliki oznaczone dyrektywą `'use server'` mogą eksportować **wyłącznie funkcje asynchroniczne (`async`)**. Wszelkie czyste funkcje pomocnicze, przeliczniki i walidatory muszą znajdować się w `types/domain.ts` lub `lib/`.
4. **100% Strict Type-Safety (Zero `any`):** Wszelkie typy zapytań bazodanowych, formularzy i akcji muszą korzystać ze ścisłych definicji Prisma (`Prisma.ItemGetPayload`, `Prisma.ItemWhereInput`) lub schematów Zod. Używanie typu `any` jest zabronione.
5. **Weryfikacja przed zatwierdzeniem zmian:** Każda modyfikacja musi przejść pełny cykl weryfikacyjny (kompilacja TypeScript, walidacja schematu Prisma, sprawdzenie konfiguracji Dockera).

---

## 2. Procedura modyfikacji schematu bazy danych (Prisma Migrations)

W przypadku dodawania lub zmiany modeli, tabel, kolumn, relacji bądź indeksów:

1. **Edycja schematu:**  
   Wprowadź zmiany w pliku [`prisma/schema.prisma`](prisma/schema.prisma).
2. **Walidacja poprawności schematu:**  
   ```bash
   node node_modules/prisma/build/index.js validate
   # lub w kontenerze:
   docker compose exec app npx prisma validate
   ```
3. **Utworzenie nowej migracji wersjonowanej:**  
   ```bash
   docker compose exec app npx prisma migrate dev --name <nazwa_migracji>
   # lub z hosta:
   npm run docker:prisma:migrate -- --name <nazwa_migracji>
   ```
4. **Wygenerowanie zaktualizowanego klienta Prisma Client:**  
   ```bash
   node node_modules/prisma/build/index.js generate
   ```
5. **Dostosowanie warstwy typów domenowych i akcji:**  
   - Zaktualizuj interfejsy i funkcje pomocnicze w [`types/domain.ts`](types/domain.ts).
   - Dostosuj akcje serwerowe w `app/actions/`.
   - Zaktualizuj skrypt seedujący [`prisma/seed.ts`](prisma/seed.ts), jeśli schemat wymaga nowych pól obowiązkowych.
6. **Weryfikacja statusu migracji:**  
   ```bash
   node node_modules/prisma/build/index.js migrate status
   ```

---

## 3. Zarządzanie zależnościami npm

Aby zachować izolację środowiska i uniknąć konfliktów z systemem operacyjnym hosta:

1. **Instalacja nowego pakietu w kontenerze:**  
   ```bash
   # Zależność produkcyjna:
   docker compose exec app npm install <nazwa-pakietu>

   # Zależność deweloperska:
   docker compose exec app npm install -D <nazwa-pakietu>
   ```
2. **Synchronizacja plików blokady:**  
   Upewnij się, że zmiany w `package.json` i `package-lock.json` są zsynchronizowane na dysku hosta (mechanizm bind mount `.:/app` wykonuje to automatycznie).
3. **Przebudowa obrazu (gdy dodano pakiety systemowe lub zmodyfikowano Dockerfile):**  
   ```bash
   docker compose up --build -d
   ```

---

## 4. Procedura weryfikacji jakości przed commitem

Przed zatwierdzeniem zmian w repozytorium należy wykonać pełny zestaw testów integralności:

```bash
# 1. Walidacja składni schematu Prisma
node node_modules/prisma/build/index.js validate

# 2. Weryfikacja spójności migracji bazy danych
node node_modules/prisma/build/index.js migrate status

# 3. Kompilacja TypeScript (weryfikacja braku błędów typowania)
node node_modules/typescript/bin/tsc --noEmit

# 4. Sprawdzenie poprawności konfiguracji Docker Compose
docker compose config
```

---

## 5. Standardy komunikatów Git (Conventional Commits)

Wszystkie commity w repozytorium muszą być zgodne ze specyfikacją [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(<obszar>): ...` – Nowa funkcjonalność (np. `feat(marketplace): add category filters`).
- `fix(<obszar>): ...` – Naprawa błędu (np. `fix(auth): sanitize email input whitespaces`).
- `refactor(<obszar>): ...` – Zmiana kodu bez modyfikacji zachowania zewnętrznego (np. `refactor(core): strict type safety`).
- `chore(<obszar>): ...` – Zmiany konfiguracyjne, narzędziowe lub zależności (np. `chore(docker): optimize Dockerfile.dev`).
- `docs(<obszar>): ...` – Aktualizacja dokumentacji (np. `docs: update architecture diagrams`).
