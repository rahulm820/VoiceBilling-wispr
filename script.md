# SmartLedger x Wispr - Spoken Build Script

This is the build script for the hackathon. Read one part at a time into your
voice agent. Do not skip the checks. Start a fresh agent session for each part
if the context gets messy.

Project root: `D:\D\c\c\wispr`

---

## How to use this file

1. Read the **Global context** once at the start of a session.
2. Read the **Say this** block for one part.
3. Let the agent finish and run the check.
4. Only then move to the next part.
5. If the agent wanders, use one of the **Correction lines** at the bottom.

The agent can read this file from the repo. When a prompt says "read script.md",
the agent should read this file and follow the detailed spec for that part.

---

## Technical direction

- Frontend: web only. React + Vite + strict TypeScript.
  - Routing: React Router.
  - Data fetching: TanStack Query.
  - HTTP: axios.
  - Charts: Recharts.
- Backend: Java 17, Spring Boot 3, Maven.
  - Persistence: JPA + PostgreSQL.
  - Migrations: Flyway.
  - Security: Spring Security with JWT.
  - Caching: Caffeine (Spring Cache).
- Voice engine: Wispr.
  - The frontend calls our backend at `POST /api/voice/bill` and `POST /api/voice/text`.
  - Our backend calls Wispr.
  - No Wispr API key ever goes into the web app.
  - Keep the voice call behind one swappable function so a direct Wispr SDK
    can replace the backend call later.
- Removed: Expo, React Native, Appwrite, MySQL, Flask, local Whisper.
- Language: TypeScript (strict) on the frontend, Java 17 on the backend.
- All secrets and URLs go in `.env` and `.env.example`.
- Theme: clean light theme with blue and green accents.

### Product features

- Daily insights
- Ledger creation by manual entry or voice
- Stock maintenance
- Settings section
- Per-product default price sheet
- Stored defaults for GST and discount

### API direction

- Replace the old bills endpoints with a ledger endpoint.
- Add settings, products, and insights endpoints.
- Keep the voice endpoints.
- Use numbers for money. Use ISO 8601 dates.

### Source of truth for screens

- Daily insights dashboard
- Ledger (list, manual entry, voice entry, details)
- Stock (list, add/edit)
- Products (default price sheet)
- Settings (profile, GST/discount defaults, shop details)

---

## Global context

### Say this

> Read script.md in this repo. We are building SmartLedger, a voice-first billing
> app for small shopkeepers, powered by Wispr, for the WeMakeDevs hackathon. The
> frontend is web only in React with Vite and strict TypeScript using React Router,
> TanStack Query, axios, and Recharts. The backend is Java 17 Spring Boot 3 with
> Maven, JPA, Spring Security with JWT, Flyway, PostgreSQL, and Caffeine caching.
> Use Wispr for voice, but call it only through our backend endpoints. Do not use
> Expo, React Native, Appwrite, MySQL, Flask, or local Whisper. Keep the app
> simple, web-first, and demo-ready. Ask me before adding any dependency that
> is not already listed in this script.

### Rules for the agent

- Implement only the part I name. Do not refactor unrelated files.
- Never hardcode API keys, database passwords, or tokens.
- Every network call must have loading, success, and error handling.
- Use a clean light theme with blue and green accents.
- Keep the code plain and readable. No clever abstractions.
- Run the app or the tests after each part and report the result.
- If a backend endpoint is not ready, use mock mode. Do not block the frontend.
- Use numbers for money and ISO 8601 dates in API contracts.
- The frontend must never receive a Wispr API key.

---

## Part 1 - Scaffold and dependencies (Frontend)

Priority: P0

### Say this

> Read script.md, then implement Part 1 only. Scaffold a new Vite React app in
> this folder using strict TypeScript. Install the dependencies in the spec:
> react, react-dom, react-router-dom, @tanstack/react-query, axios, recharts.
> Create the folder structure, set the app name to SmartLedger, and add an
> environment example file. Do not build screens yet. Run the app and report the
> result.

### Spec

- Create a Vite React app in the current folder. If the folder is not empty,
  create the app in place without deleting `script.md`.
- App config:
  - name: `SmartLedger`
  - Vite dev server on port 5173
- Dependencies:
  - `react`, `react-dom`
  - `react-router-dom`
  - `@tanstack/react-query`
  - `axios`
  - `recharts`
  - `typescript` (strict)
- Dev dependencies:
  - `vite`, `@vitejs/plugin-react`
  - `eslint`, `prettier` (optional)
- Create this structure:

```text
index.html
vite.config.ts
tsconfig.json
tsconfig.node.json
src/
  main.tsx
  App.tsx
  api/
    client.ts
    auth.ts
    profile.ts
    stock.ts
    products.ts
    ledger.ts
    settings.ts
    insights.ts
    voice.ts
  components/
    AppButton.tsx
    AppInput.tsx
    AppScreen.tsx
    Card.tsx
    EmptyState.tsx
    LoadingOverlay.tsx
    Spacer.tsx
  config/
    env.ts
  context/
    AuthContext.tsx
  hooks/
    useAuth.ts
  routes/
    index.tsx
  pages/
    SplashPage.tsx
    AuthPage.tsx
    ProfilePage.tsx
    StockPage.tsx
    StockFormPage.tsx
    ProductsPage.tsx
    ProductFormPage.tsx
    LedgerPage.tsx
    ManualLedgerPage.tsx
    VoiceLedgerPage.tsx
    LedgerDetailsPage.tsx
    InsightsPage.tsx
    SettingsPage.tsx
  services/
    wispr.ts
    mockApi.ts
  theme/
    colors.ts
    spacing.ts
  utils/
    format.ts
    parseBill.ts
.env.example
```

- `.env.example` must contain:

```dotenv
VITE_API_URL=http://localhost:8080
VITE_MOCK_API=false
```

### Done when

- `npm run dev` starts without a red screen.
- The folder structure exists.
- No secrets are committed.

---

## Part 2 - Theme, layout shell, and routing (Frontend)

Priority: P0

### Say this

> Read script.md, then implement Part 2 only. Add the theme, reusable components,
> splash page, app layout with sidebar/topbar, and React Router routes. Use the
> screen names and colors in the spec. Do not build the feature pages yet, just
> placeholders. Run the app and show me the navigation.

### Spec

- Colors:
  - primary: `#1976D2`
  - primary light: `#2196F3`
  - success: `#2ECC71`
  - success dark: `#4CAF50`
  - danger: `#E74C3C`
  - warning: `#F39C12`
  - background: `#F3F6FA`
  - card: `#FFFFFF`
  - text: `#222222`
  - muted: `#888888`
  - border: `#D1D5DB`
- Spacing scale: 4, 8, 12, 16, 20, 24, 32.
- Reusable components: AppScreen, Card, AppButton, AppInput, Spacer, EmptyState, LoadingOverlay.
- Splash page: Title `SmartLedger`, Subtitle `Voice billing powered by Wispr`. After 1.2s go to Auth or Main depending on stored token.
- Layout: Top app bar with title and user menu. Sidebar nav: Insights, Ledger, Stock, Products, Settings, Logout.
- Nested routes: Stock (Stock, StockForm), Ledger (Ledger, ManualLedger, VoiceLedger, LedgerDetails).
- Use blue header style with white text.

### Done when

- Splash page appears.
- Sidebar opens.
- Every nav item opens a placeholder page.
- Logout returns to Auth.

---

## Part 3 - API client, auth storage, and auth page (Frontend)

Priority: P0

### Say this

> Read script.md, then implement Part 3 only. Create the API client, auth context,
> token storage, and the login and register page. Use our backend contract in
> Appendix A. Add a mock mode toggle so the app still works if the backend is not
> ready. Do not build the billing pages yet.

### Spec

- `src/config/env.ts`: read `VITE_API_URL`, `VITE_MOCK_API`
- `src/api/client.ts`: Axios instance with base URL, 15s timeout, attach `Authorization: Bearer <token>`, normalize errors
- `src/context/AuthContext.tsx`: user, token, loading; restore from localStorage; login/register/logout/refreshMe
- Auth page: toggle Login/Sign Up, email/password, show/hide password, validation, disable while loading, readable errors, save token and go to Main on success
- Mock mode: if `VITE_MOCK_API=true` use `src/services/mockApi.ts`. Accept valid email and password >= 4 chars. Return fake user and token.

### Done when

- Can register and log in.
- Session survives page reload.
- Logout clears session.
- Wrong password shows readable error.

---

## Part 4 - Profile, settings, and defaults (Frontend)

Priority: P1

### Say this

> Read script.md, then implement Part 4 only. Build the profile page with shop
> details and a simple business summary. Add settings for stored GST and discount
> defaults and currency symbol. Use the profile and settings endpoints from
> Appendix A.

### Spec

- Profile: owner name, shop name, phone. GET/PUT `/api/profile`.
- Settings: default GST percent (default 18), default discount percent, currency symbol. GET/PUT `/api/settings`.
- Summary cards and recent sections where available.
- Empty states.
- Logout with confirmation.
- On first login with empty profile, show form directly.

### Done when

- Profile saves and reloads.
- Settings defaults persist.
- Totals appear if available.
- Logout works.

---

## Part 5 - Stock maintenance (Frontend)

Priority: P0

### Say this

> Read script.md, then implement Part 5 only. Build stock list, search, add,
> edit, delete. Use stock endpoints in Appendix A. Include unit picker and
> low-stock badge.

### Spec

- List: search by name, name/quantity/unit/costPrice, low stock when quantity <= 5, refresh, empty state
- Add/Edit: name, quantity, unit picker (`kg`, `g`, `L`, `ml`, `pcs`, `dozen`, `packets`, `bottles`, `bags`, `litres`, `sachets`, `boxes`, `meters`, `feet`), cost price per unit. POST/PATCH
- Delete: confirmation, DELETE
- If same name and unit exists, backend may merge; show result clearly.
- Handle optimistic updates carefully with rollback if used.

### Done when

- Add/edit/delete works.
- Search filters.
- Low stock visible.

---

## Part 6 - Products (default price sheet) (Frontend)

Priority: P1

### Say this

> Read script.md, then implement Part 6 only. Build the products page for a
> per-product default price sheet. Use products endpoints in Appendix A.

### Spec

- List: search by name, name/default unit price/unit, empty state
- Add/Edit: name, default unit price (number), unit picker. POST/PATCH
- Delete: confirmation, DELETE
- Used as default price source when creating ledger entries.

### Done when

- CRUD works.
- Search filters.
- Defaults appear when adding ledger items.

---

## Part 7 - Ledger list and entry points (Frontend)

Priority: P0

### Say this

> Read script.md, then implement Part 7 only. Build the ledger list with search,
> sort, refresh, Add Manually and Add Using Voice. Tapping a ledger entry opens
> details. Use ledger endpoints in Appendix A.

### Spec

- Header `Ledger`
- Search by customer name
- Sort: newest first / highest total first
- Card: customer name, total (rupees), date
- Navigate to LedgerDetails on tap
- Buttons: Add Manually -> ManualLedger, Add Using Voice -> VoiceLedger
- Refresh, empty state, non-blocking loading

### Done when

- List loads.
- Search and sort work.
- Navigation works.
- Details open.

---

## Part 8 - Manual ledger (Frontend)

Priority: P0

### Say this

> Read script.md, then implement Part 8 only. Build manual ledger entry. Add
> items with name/quantity/unit/price, support per-unit and total price toggle,
> stock checks/warnings, customer details, GST/discount using stored defaults,
> live totals, save via POST /api/ledger.

### Spec

- Item form with product default price lookup, quantity, unit, price, toggle per-unit/total
- Item list with remove/edit
- Stock checks: missing item warn, insufficient quantity warn, do not silently block
- Summary: customer name, customer phone, ledger number, GST checkbox (default from settings), discount checkbox+percent, live subtotal/GST/discount/grand total
- Save: POST /api/ledger with items array, money as numbers
- Validation: at least one item, customer name required, valid numbers
- On success clear and go to Ledger

### Done when

- Items/totals/GST/discount work.
- Stock warnings appear.
- Saving creates ledger entry in list.

---

## Part 9 - Voice ledger with Wispr (Frontend)

Priority: P0

### Say this

> Read script.md, then implement Part 9 only. Add recording with MediaRecorder,
> upload to backend voice endpoint, show transcript/items, make editable,
> reuse manual ledger summary/save flow. Put all Wispr access behind
> src/services/wispr.ts. Never put Wispr key in app.

### Spec

- UI: title Voice Ledger, mic button, timer, status (Ready/Listening/Transcribing with Wispr/Review), transcript card, parsed items, Add Item Manually, Save Ledger
- Recording: mic permission, MediaRecorder (webm/ogg), stop/release, handle denial
- Upload: `transcribeLedger(audioBlob)` in `src/services/wispr.ts` POST multipart to `/api/voice/bill` field `audio`. Expect `{ success, transcript, items: [{ name, quantity, unit, price }] }`. Mock if `VITE_MOCK_API=true`.
- Review: transcript/items editable/removable, add manually, handle no items
- Text fallback: Type instead -> send to `/api/voice/text` or parse with `src/utils/parseBill.ts`
- Save: reuse Part 8 flow POST `/api/ledger`
- Errors: network/Wispr/empty transcript with clear messages

### Parser (parseBill.ts)

Support: `2 kg sugar at 40 rupees`, `do kilo sugar, ek litre oil, teen packet rice`, `sugar 2 kilo 40 rupees`. Normalize Hindi digits/words to English, extract quantity/unit/name/optional price, skip unparseable, use same unit list.

### Done when

- Record/upload works.
- Transcript and items shown/editable.
- Save creates ledger entry.
- Backend failures don't crash app.

---

## Part 10 - Ledger details, insights, and polish (Frontend)

Priority: P1

### Say this

> Read script.md, then implement Part 10 only. Build ledger details with shop/customer/items/subtotal/GST/discount/grand total and print. Add daily insights with Recharts. Polish, add mock data, run end-to-end flow, fix issues, provide final demo steps.

### Spec

- Ledger details: GET `/api/ledger/:id`, fetch shop profile, show all fields, item table, print via clean HTML + `window.print()`, handle loading/missing/network
- Insights: GET `/api/insights/daily`, show sales/purchases/profit, Recharts bar/line, empty state
- Polish: mock data (1 profile, 5 stock items including sugar/oil/rice/tea/milk, 3 ledger entries), mock mode for all features, loading/error states everywhere, keyboard handling, safe layout, disable save while saving, confirmations for delete/logout, no console errors, rebrand strings, README with install/.env/run/mock/backend endpoints

### Done when

- Full demo works with/without backend.
- Consistent look.
- No red screen in demo flow.

---

## B1: Scaffold, database, cache (Backend - implement only this part)

Priority: P0

### Say this

> Read script.md, then implement B1 only. Create a Spring Boot 3 Maven project with Java 17 in a folder named `backend`. Group id `com.wemeetdesk`, artifact `smartledger`. Add dependencies: Spring Web, Data JPA, Security, Validation, Flyway, PostgreSQL driver, Caffeine with Spring Cache, Lombok, JJWT, and Spring test starters. Create packages: controller, service, repository, model, dto, security, config, exception, wispr. Add docker-compose.yml at repo root running PostgreSQL with a named volume. Configure application properties so all sensitive values (database URL, user, password, JWT secret, JWT expiry, Wispr key, Wispr base URL) come from environment variables. Add .env.example and git-ignore the real .env. Set server port to 3000 and allow CORS from http://localhost:5173. Enable caching with Caffeine (5 minute expiry, size limit). Add health endpoint at GET /api/health. Add global exception handler returning `{ "error": "..." }` with correct status. Create first Flyway migration as empty baseline. Do not build features yet. Start the database, run the server, and confirm the health endpoint responds.

### Spec

- Project: `backend/`, group `com.wemeetdesk`, artifact `smartledger`, Java 17, Spring Boot 3, Maven
- Dependencies (Maven): spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-security, spring-boot-starter-validation, flyway-core, postgresql, spring-boot-starter-cache, com.github.ben-manes.caffeine:caffeine, lombok, io.jsonwebtoken:jjwt-api, io.jsonwebtoken:jjwt-impl, io.jsonwebtoken:jjwt-jackson, spring-boot-starter-test (and spring-security-test if desired)
- Packages under `com.wemeetdesk.smartledger`: `controller`, `service`, `repository`, `model`, `dto`, `security`, `config`, `exception`, `wispr`
- `docker-compose.yml` at repo root: PostgreSQL service with named volume, env vars for DB
- `backend/src/main/resources/application.yml` (or properties): server.port=3000, spring.datasource.* from env, spring.flyway.enabled=true, spring.cache.type=caffeine, management/health if needed; JWT and Wispr from env; CORS config for http://localhost:5173
- `.env.example` with placeholders for DB_URL/USER/PASSWORD, JWT_SECRET, JWT_EXPIRY, WISPR_KEY, WISPR_BASE_URL
- Add `.env` to `.gitignore` (real env not committed)
- Caffeine cache config: expireAfterWrite 5m, maximumSize (e.g. 1000)
- Health: `GET /api/health` returns 200 OK (e.g. `{ "status": "UP" }` or simple ok)
- Global exception handler: `@ControllerAdvice` returning `ResponseEntity<Map<String,String>>` with `{"error": "..."}` and appropriate status codes
- Flyway: `src/main/resources/db/migration/V1__baseline.sql` empty
- CORS allowed origin `http://localhost:5173`

### Done when

- Backend compiles and starts.
- `docker compose up -d` starts PostgreSQL.
- `GET http://localhost:3000/api/health` returns 200.
- All sensitive config comes from env vars.
- No secrets committed.

---

## Appendix A - Backend API contract (New)

Base URL: `VITE_API_URL` (frontend). Backend base: `http://localhost:3000` by default.

All authenticated requests (except auth endpoints where noted):
```http
Authorization: Bearer <token>
Content-Type: application/json
```

Errors: return `{ "error": "Readable message" }` with 4xx/5xx status.

Money as numbers. Dates as ISO 8601 strings.

### Auth

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | `{ "email": string, "password": string }` | `{ "token": string, "user": { "id": string, "email": string } }` |
| POST | `/api/auth/login` | `{ "email": string, "password": string }` | `{ "token": string, "user": { "id": string, "email": string } }` |
| GET | `/api/auth/me` | none (auth) | `{ "user": { "id": string, "email": string } }` |

### Profile

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| GET | `/api/profile` | none (auth) | `{ "profile": { "name": string, "shopName": string, "phone": string } }` |
| PUT | `/api/profile` | `{ "name": string, "shopName": string, "phone": string }` | `{ "profile": { "name": string, "shopName": string, "phone": string } }` |

### Settings

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| GET | `/api/settings` | none (auth) | `{ "settings": { "defaultGstPercent": number, "defaultDiscountPercent": number, "currencySymbol": string } }` |
| PUT | `/api/settings` | `{ "defaultGstPercent": number, "defaultDiscountPercent": number, "currencySymbol": string }` | `{ "settings": { "defaultGstPercent": number, "defaultDiscountPercent": number, "currencySymbol": string } }` |

Defaults: `defaultGstPercent` defaults to 18 if not set.

### Stock

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| GET | `/api/stock` | none (auth) | `{ "items": StockItem[] }` |
| POST | `/api/stock` | `{ "name": string, "quantity": number, "unit": string, "costPrice": number }` | `{ "item": StockItem }` |
| PATCH | `/api/stock/:id` | Partial<StockItem> (auth) | `{ "item": StockItem }` |
| DELETE | `/api/stock/:id` | none (auth) | `{ "success": true }` |

StockItem:
```json
{
  "id": "stock_1",
  "name": "Sugar",
  "quantity": 10,
  "unit": "kg",
  "costPrice": 40,
  "createdAt": "2026-10-26T10:00:00.000Z"
}
```

If same name and unit exists, quantity may be merged on the backend.

### Products (default price sheet)

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| GET | `/api/products` | none (auth) | `{ "products": Product[] }` |
| POST | `/api/products` | `{ "name": string, "unitPrice": number, "unit": string }` | `{ "product": Product }` |
| PATCH | `/api/products/:id` | Partial<Product> (auth) | `{ "product": Product }` |
| DELETE | `/api/products/:id` | none (auth) | `{ "success": true }` |

Product:
```json
{
  "id": "prod_1",
  "name": "Sugar",
  "unitPrice": 40,
  "unit": "kg",
  "createdAt": "2026-10-26T10:00:00.000Z"
}
```

### Ledger

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| GET | `/api/ledger` | none (auth) | `{ "entries": LedgerEntry[] }` |
| POST | `/api/ledger` | LedgerInput (auth) | `{ "entry": LedgerEntry }` |
| GET | `/api/ledger/:id` | none (auth) | `{ "entry": LedgerEntry }` |

LedgerInput:
```json
{
  "customerName": "Rahul",
  "customerNumber": "9876543210",
  "ledgerNumber": "L-001",
  "items": [
    {
      "name": "Sugar",
      "quantity": 2,
      "unit": "kg",
      "unitPrice": 40,
      "total": 80
    }
  ],
  "subtotal": 80,
  "gstApplied": true,
  "gstAmount": 14.4,
  "discountApplied": 5,
  "discountAmount": 4,
  "total": 90.4,
  "date": "2026-10-26T10:00:00.000Z"
}
```

LedgerEntry:
```json
{
  "id": "led_1",
  "customerName": "Rahul",
  "customerNumber": "9876543210",
  "ledgerNumber": "L-001",
  "items": [
    {
      "name": "Sugar",
      "quantity": 2,
      "unit": "kg",
      "unitPrice": 40,
      "total": 80
    }
  ],
  "subtotal": 80,
  "gstApplied": true,
  "gstAmount": 14.4,
  "discountApplied": 5,
  "discountAmount": 4,
  "total": 90.4,
  "date": "2026-10-26T10:00:00.000Z",
  "createdAt": "2026-10-26T10:00:00.000Z"
}
```

When a ledger entry is saved, stock must be deducted on the backend.

### Insights

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| GET | `/api/insights/daily` | none (auth) | `{ "days": [ { "date": "2026-10-26", "sales": number, "purchases": number, "profit": number } ] }` |

### Voice

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| POST | `/api/voice/bill` | multipart form-data `audio` (auth) | `{ "success": boolean, "transcript": string, "items": [ { "name": string, "quantity": number, "unit": string, "price": number } ] }` |
| POST | `/api/voice/text` | `{ "text": string }` (auth) | `{ "success": boolean, "transcript": string, "items": [ { "name": string, "quantity": number, "unit": string, "price": number } ] }` |

Backend calls Wispr. Wispr API key never exposed to frontend.

### Health

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| GET | `/api/health` | none | `{ "status": "UP" }` (or 200 OK) |

---

## Appendix B - Wispr integration boundary

The frontend only knows:
```ts
transcribeLedger(audioBlob) -> Promise<{ transcript: string, items: Array<{name:string,quantity:number,unit:string,price:number}> }>
```

Lives in `src/services/wispr.ts`. Implementation options:
1. Backend proxy (recommended): upload to backend, backend calls Wispr, returns transcript/items.
2. Direct Wispr SDK (only if required): implement in transcribeLedger, keep same shape, never expose key.

Rest of app must not care which option is used.

---

## Appendix C - Demo script

1. Open app, show splash.
2. Register/login.
3. Profile: Name `Rahul`, Shop `Rahul Kirana Store`, Phone `9876543210`.
4. Stock: Sugar 10 kg @40/kg, Oil 5 L @120/L, Rice 8 packets @60/packet.
5. Ledger -> Add Using Voice.
6. Say: "Add two kilos of sugar at forty rupees, one litre of oil at one hundred twenty rupees, and three packets of rice at sixty rupees per packet."
7. Show transcript and parsed items, edit quantity.
8. Customer: Amit, 9123456780, Ledger L-001. GST 18%, Discount 5%. Show totals, save.
9. Open ledger details, print.
10. Stock reduced. Insights show chart.

Backup: Type instead with same sentence.

---

## Correction lines

- `Stop. Implement only Part X. Do not modify other files.`
- `Do not use Expo, React Native, Appwrite, MySQL, Flask, or Whisper. Our backend handles those.`
- `Do not hardcode any API key or password. Move it to .env.`
- `The app must still work with VITE_MOCK_API=true.`
- `Run the app and show me the exact error before changing more code.`
- `Make the smallest change that fixes the error.`
- `Read script.md again and follow the spec for this part.`
- `Use numbers for money and ISO dates. Return { "error": "..." } on failure.`

---

## Build order checklist

Frontend:
- [ ] Part 1 - Scaffold and dependencies
- [ ] Part 2 - Theme, layout shell, and routing
- [ ] Part 3 - API client, auth storage, and auth page
- [ ] Part 4 - Profile, settings, and defaults
- [ ] Part 5 - Stock maintenance
- [ ] Part 6 - Products (default price sheet)
- [ ] Part 7 - Ledger list and entry points
- [ ] Part 8 - Manual ledger
- [ ] Part 9 - Voice ledger with Wispr
- [ ] Part 10 - Ledger details, insights, and polish

Backend:
- [ ] B1 - Scaffold, database, cache
- [ ] B2 - Auth, profile, settings
- [ ] B3 - Stock, products
- [ ] B4 - Ledger
- [ ] B5 - Insights, voice proxy
