# SmartLedger x Wispr

Voice-first web billing and ledger app for small shopkeepers, built for WeMakeDevs hackathon. Web-only (React + Vite + TypeScript) frontend with Java 17 Spring Boot 3 backend, PostgreSQL, Flyway, Caffeine cache, JWT auth, and Wispr voice integration.

## Stack

### Frontend
- React 18, Vite 5, TypeScript (strict)
- React Router DOM, TanStack Query, axios, Recharts
- Plain CSS variables theme

### Backend
- Java 17, Spring Boot 3, Maven
- Spring Web, Data JPA, Security, Validation
- Flyway, PostgreSQL driver
- Spring Cache + Caffeine (5 min, 1000 entries)
- Lombok, JJWT
- Wispr integration via backend proxy

## Project Structure
```
wispr/
├── backend/        # Spring Boot app (com.wemeetdesk:smartledger)
├── frontend/       # Vite React app
├── docker-compose.yml
├── .env.example
└── script.md       # Build spec
```

## Prerequisites
- Node.js 18+
- Java 17
- Maven
- Docker (for PostgreSQL) or local PostgreSQL

## Setup

### 1) Environment
Copy env files and fill values:
```bash
cp .env.example .env
```
Update `SPRING_DATASOURCE_*`, `JWT_SECRET`, `WISPR_KEY`, `WISPR_BASE_URL` in `.env`. Backend reads from env vars.

### 2) Database
Start PostgreSQL:
```bash
docker compose up -d
```

### 3) Backend
```bash
cd backend
mvn spring-boot:run
```
Runs on `http://localhost:3000`. Health: `GET /api/health`

### 4) Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`. Set `VITE_API_URL=http://localhost:3000` in frontend env if needed.

## API (key endpoints)
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Settings: `GET/PUT /api/settings`, `GET /api/settings/next-bill-number`
- Products/Price Sheet: `GET/POST/PATCH/DELETE /api/products`, `PUT /api/products/price-sheet`
- Ledger: `GET/POST /api/ledger`, `GET /api/ledger/:id` (sale/purchase, stock updates, warnings)
- Insights: `GET /api/insights/daily`, `GET /api/insights/trend?days=7|30` (cached)
- Voice: `POST /api/voice/bill` (multipart audio), `POST /api/voice/ledger`, `POST /api/voice/text`
- Health: `GET /api/health`

Money as numbers, dates as ISO 8601. Errors return `{"error": "..."}`.

## Features
- Daily insights with profit (from cost snapshots), trends, top items, low stock
- Ledger: manual or voice entry; sales deduct stock, purchases add stock; clamping with warnings
- Stock/Product management with merge on duplicate name+unit, low-stock flags
- Price sheet bulk update
- Settings per user (GST/discount defaults, bill prefix/counter, thresholds, currency)
- Wispr via backend proxy only (key never in browser)

## Mock Mode
Frontend supports `VITE_MOCK_API=true` for UI development without backend.

## Testing
Backend:
```bash
cd backend
mvn test
```

## Git Workflow
Work on feature branches per part (e.g., `b1-*`, `f1-*`), commit changes, push when remote added.

## Notes
- Caffeine cache evicted on ledger/stock writes; insights cached by user/date
- All data scoped to logged-in user
- Flyway migrations in `backend/src/main/resources/db/migration/`
