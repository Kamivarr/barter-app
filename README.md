# Barter App 🔄

Aplikacja sąsiedzkiego wypożyczania sprzętu i narzędzi w Rzeszowie zbudowana w oparciu o **Next.js 16** (App Router, Turbopack, React Server Components), **React 19**, **Tailwind CSS v4** oraz **Prisma ORM** (baza SQLite).

---

## 🐳 Uruchamianie z użyciem Dockera (Zalecane)

Aplikacja została w pełni skonteneryzowana przy użyciu standardowego **Docker Compose**. Do uruchomienia projektu na dowolnej maszynie nie jest wymagana lokalna instalacja Node.js ani pakietów `node_modules` na hoście.

### 1. Szybki start (Jedna komenda)

Aby zbudować obrazy i uruchomić całe środowisko deweloperskie z automatycznym odświeżaniem kodu (HMR / Fast Refresh):

```bash
docker compose up --build
```

lub przy użyciu npm:

```bash
npm run docker:build
```

Jeśli obrazy są już zbudowane i chcesz uruchomić kontenery w tle:

```bash
docker compose up -d
# lub: npm run docker:up
```

Po uruchomieniu aplikacja jest dostępna w przeglądarce pod adresem:  
👉 **[http://localhost:3001](http://localhost:3001)**

#### Architektura kontenera deweloperskiego:
- **Live-Reloading / Fast Refresh:** Kod źródłowy jest podmontowany jako wolumen (`.:/app`), dzięki czemu każda edycja pliku na hoście natychmiast wyzwala HMR w kontenerze.
- **Izolacja zależności:** Katalogi `node_modules` oraz pamięć podręczna `.next` są odizolowane w dedykowanych nazwanych wolumenach Dockera (`barter_node_modules`, `barter_next_cache`), zapobiegając konfliktom binariów hosta z Linuksem w kontenerze.
- **Trwałość danych (Persistence):** Plik bazy danych SQLite (`prisma/dev.db`) jest połączony trwale z katalogiem na hoście — restart kontenera nie powoduje utraty danych.
- **Sieć mostkowa (Bridge Network):** Usługa działa w izolowanej sieci `barter-network`.

Zatrzymanie kontenera:
```bash
docker compose down
# lub: npm run docker:down
```

---

### 2. Zarządzanie bazą danych i migracjami w Dockerze

Wszystkie operacje Prisma można wygodnie wywoływać z poziomu hosta za pośrednictwem kontenera:

- **Wywołanie Prisma CLI w kontenerze:**
  ```bash
  npm run docker:prisma -- <komenda>
  # przykład: docker compose exec app npx prisma status
  ```

- **Wdrażanie migracji:**
  ```bash
  npm run docker:prisma:deploy
  # lub: docker compose exec app npx prisma migrate deploy
  ```

- **Tworzenie nowej migracji (po edycji `schema.prisma`):**
  ```bash
  npm run docker:prisma:migrate -- --name <nazwa_migracji>
  # lub: docker compose exec app npx prisma migrate dev --name <nazwa_migracji>
  ```

- **Wypełnienie bazy danymi testowymi (Seed):**
  ```bash
  npm run docker:prisma:seed
  # lub: docker compose exec app npx prisma db seed
  ```

- **Wygenerowanie Prisma Client:**
  ```bash
  npm run docker:prisma:generate
  # lub: docker compose exec app npx prisma generate
  ```

- **Podgląd bazy w Prisma Studio:**
  ```bash
  docker compose exec app npx prisma studio --port 5555 --browser none
  ```

---

### 3. Środowisko produkcyjne (Zoptymalizowany obraz Standalone)

W celu przetestowania lub wdrożenia wersji produkcyjnej serwera Next.js (wielostopniowy build standalone, zoptymalizowana waga obrazu Alpine, użytkownik nie-root `node`):

```bash
docker compose -f docker-compose.prod.yml up --build
# lub: npm run docker:prod
```

Zatrzymanie środowiska produkcyjnego:
```bash
docker compose -f docker-compose.prod.yml down
# lub: npm run docker:prod:down
```

---

## ⚙️ Konfiguracja środowiska (.env)

Domyślne wartości zmiennych środowiskowych znajdują się w pliku `.env.example`. W razie potrzeby możesz stworzyć lokalny plik `.env`:

```env
DATABASE_URL="file:./dev.db"
PORT=3001
HOSTNAME=0.0.0.0
NODE_ENV=development
WATCHPACK_POLLING=true
JWT_SECRET=barter_jwt_secret_development_key_min_32_bytes_super_secure_2026!
```

---

## 📚 Dokumentacja techniczna

Szczegółowa dokumentacja projektu znajduje się w:
- [Project_context.md](Project_context.md) – tożsamość projektu, stack technologiczny, architektura, zmienne środowiskowe,
- [AI_WORKFLOW.md](AI_WORKFLOW.md) – standardy inżynieryjne, procedury weryfikacji i instalacji,
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) – diagramy Mermaid, ERD bazy danych, maszyna stanów wypożyczeń,
- [CHANGELOG_AI.md](CHANGELOG_AI.md) – rejestr zmian architektonicznych wprowadzonych przez AI.

---

## 🛠️ Tradycyjne uruchamianie lokalne bez Dockera (opcjonalne)

Jeżeli wolisz uruchomić aplikację bezpośrednio na maszynie hosta:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```
