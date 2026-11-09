<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Directives & Repository Standards: Barter App

Wszystkie autonomiczne modele AI i asystenci kodujący pracujący nad projektem **Barter App** są zobowiązani do bezwzględnego przestrzegania poniższych wytycznych.

---

## 1. Wymagane źródła wiedzy o projekcie

Zanim rozpoczniesz planowanie lub wprowadzanie zmian, masz obowiązek zapoznać się z dokumentacją techniczną:

- **[Project_context.md](file:///home/kamivarr/Data/Projects/barter-app/Project_context.md)** – Tożsamość projektu, stack technologiczny (Next.js 16, React 19, Tailwind v4, Prisma, SQLite), struktura katalogów, Docker Compose, konfiguracja środowiskowa.
- **[AI_WORKFLOW.md](file:///home/kamivarr/Data/Projects/barter-app/AI_WORKFLOW.md)** – Standardy inżynieryjne, procedury migracji bazy danych, instalacji pakietów oraz weryfikacji.
- **[docs/ARCHITECTURE.md](file:///home/kamivarr/Data/Projects/barter-app/docs/ARCHITECTURE.md)** – Diagramy Mermaid (architektura, ERD bazy danych, maszyna stanów wypożyczeń).
- **[CHANGELOG_AI.md](file:///home/kamivarr/Data/Projects/barter-app/CHANGELOG_AI.md)** – Historia dotychczasowych zmian architektonicznych wprowadzonych przez AI.

---

## 2. Podstawowe zasady i ograniczenia (Golden Rules)

1. **Weryfikacja przed działaniem:** Sprawdź stan faktyczny plików i bazy (`git status`, inspekcja plików) – nie zakładaj konfiguracji "z pamięci".
2. **Zakaz destrukcji bazy:** NIGDY nie wykonuj `prisma migrate reset`, `prisma db push --force-reset` ani nie usuwaj bazy `prisma/dev.db`.
3. **Zakaz `docker compose down -v`:** Nie usuwaj wolumenów Dockera.
4. **Wersjonowane migracje Prisma:** Wszelkie zmiany schematu w `prisma/schema.prisma` muszą być wdrażane przez `prisma migrate dev` (nigdy `db push` na żywo).
5. **Next.js 16 Server Actions:** Pliki `'use server'` mogą eksportować **wyłącznie funkcje asynchroniczne (`async`)**. Wszystkie czyste funkcje pomocnicze i przeliczniki muszą znajdować się w [types/domain.ts](file:///home/kamivarr/Data/Projects/barter-app/types/domain.ts) lub `lib/`.
6. **Środowisko Docker Compose:** Podstawowym środowiskiem uruchomieniowym jest kontener Docker (port **3001**). Uprawnienia użytkownika kontenera są zmapowane na `node` (UID `1000`).

---

## 3. Kluczowe polecenia deweloperskie i weryfikacyjne

```bash
# Uruchomienie aplikacji w Docker Compose (port 3001)
docker compose up

# Uruchomienie z przebudową obrazu
docker compose up --build

# Zatrzymanie kontenerów (bez usuwania wolumenów)
docker compose down

# Tworzenie nowej migracji Prisma (przy zmianie schema.prisma)
docker compose exec app npx prisma migrate dev --name <nazwa_migracji>

# Wdrożenie migracji (np. na serwerze lub w CI)
docker compose exec app npx prisma migrate deploy

# Seedowanie bazy danych (User, Category, Item, RentalRequest, Review)
npm run docker:prisma:seed
# lub: docker compose exec app npx prisma db seed

# Weryfikacja spójności schematu Prisma
node node_modules/prisma/build/index.js validate

# Weryfikacja stanu migracji Prisma
node node_modules/prisma/build/index.js migrate status

# Weryfikacja kompilacji TypeScript
node node_modules/typescript/bin/tsc --noEmit

# Weryfikacja poprawności konfiguracji Docker Compose
docker compose config
```

---

## 4. Obowiązek aktualizacji dokumentacji (Documentation Maintenance Protocol)

Każdy model AI pracujący nad projektem ma bezwzględny obowiązek:
1. **Przeczytać dokumentację** przed przystąpieniem do jakichkolwiek modyfikacji.
2. **Zaktualizować dokumentację po wprowadzeniu istotnych zmian:**
   - Dodać wpis w [CHANGELOG_AI.md](file:///home/kamivarr/Data/Projects/barter-app/CHANGELOG_AI.md) pod bieżącą datą,
   - Zaktualizować [Project_context.md](file:///home/kamivarr/Data/Projects/barter-app/Project_context.md), jeśli zmieniła się architektura, zmienne lub zależności,
   - Zaktualizować [docs/ARCHITECTURE.md](file:///home/kamivarr/Data/Projects/barter-app/docs/ARCHITECTURE.md), jeśli zmienił się model danych, przepływ informacji lub maszyna stanów.
3. **Potwierdzić w podsumowaniu dla użytkownika**, że dokumentacja jest w 100% spójna ze stanem kodu w repozytorium.
