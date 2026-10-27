# SmartLedger Prompts for LLM

Use these as ready-to-paste prompts when working with an LLM on this repo. Always read `script.md` and `README.md` first.

## General Rules
Copy/paste this opener before any task:
```
Read script.md and README.md in the repo root. 
We are building SmartLedger (web-only React + Vite + TS frontend, Java 17 Spring Boot 3 backend, PostgreSQL + Flyway + Caffeine). 
Follow script.md API contract exactly. Every record belongs to the logged-in user. 
Only work on the part I name. Do not touch files outside that part. Ask before adding dependencies not listed. 
Create a new git branch for this task, commit after changes, and test before stopping.
```

Closer to use after every task:
```
When done: build/run what you changed, show exact commands + results. 
List every file created/changed and anything skipped/unsure. 
If it failed, show exact error before changing more code. 
Stop and wait.
```

## Backend

### B1 - Scaffold, DB, cache
```
Read script.md. Implement backend B1 only on a new branch b1-scaffold-db-cache.
Create Spring Boot 3 Maven app in backend/ (group com.wemeetdesk, artifact smartledger, Java 17).
Add deps: Spring Web, Data JPA, Security, Validation, Flyway, PostgreSQL, Caffeine+Cache, Lombok, JJWT, Spring Test.
Packages: controller,service,repository,model,dto,security,config,exception,wispr.
Add docker-compose.yml at root with Postgres + named volume. Read all secrets/URLs from env.
Add .env.example and gitignore .env. Port 3000, CORS http://localhost:5173.
Caffeine 5m expiry, size limit. GET /api/health. Global exception handler returning {"error":"..."} with correct status.
Empty Flyway V1 baseline. Compile, start DB if possible, run server, confirm /api/health.
Commit on new branch. Test and report per closer.
```

### B2 - Auth
```
Read script.md. Implement backend B2 only on new branch b2-auth.
Add Flyway V2 users table (id,email unique,password_hash,timestamps).
Endpoints: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me.
BCrypt passwords. Validate email + min 6 chars. Duplicate email -> readable error. Wrong password -> generic "Invalid credentials".
Return token + user {id,email}. JWT filter. /api/health,/api/auth/** public, others authenticated. CurrentUserService helper.
Tests: register, login, wrong password, duplicate email, protected without token.
Compile/test, commit, report.
```

### B3 - Settings
```
Read script.md. Implement backend B3 only on new branch b3-settings.
Flyway V3 settings (1 per user): shop/profile, gst/defaults + flags, discount/defaults + flags, bill prefix/counter, low-stock threshold, currency.
GET/PUT /api/settings (GET creates defaults if missing). Validate percentages 0-100. GET /api/settings/next-bill-number increments counter safely (transaction).
Cache settings read, evict on update. Tests for defaults, validation, update, counter.
Commit/test/report.
```

### B4 - Products/Stock/Price Sheet
```
Read script.md. Implement backend B4 only on new branch b4-products-stock.
Flyway V4 products (owner,name,unit,stock,cost,defaultSelling,gstOverride,lowStockThreshold). Unique per user ignoring case on (name,unit). Allowed units list.
Endpoints: GET /api/products?search, POST, PATCH /api/products/:id, DELETE /api/products/:id. PUT /api/products/price-sheet bulk in transaction.
Low-stock flag = product threshold or settings default. Create with existing name+unit merges quantity and response says so. Ownership checks. BigDecimal internally, numbers in JSON.
Tests: merge, uniqueness, bulk price update, low-stock flag, ownership.
Commit/test/report.
```

### B5 - Ledger
```
Read script.md. Implement backend B5 only on new branch b5-ledger.
Flyway V5 ledger_entries + ledger_items. Entry: type sale|purchase, party, entryNumber, date, items, totals, gst/discount, note. Item snapshot costPriceSnapshot for sales.
POST /api/ledger recomputes totals server-side, reject mismatch. GET /api/ledger (type/search/date filters), GET /api/ledger/:id.
Sale deducts stock, purchase adds stock (match by name+unit ignoring case). Sale item unknown/short -> save entry, clamp stock to 0, return warnings[]. Purchase unknown creates product.
Evict insights cache on write. Transactional. Tests: totals, both directions, clamping+warnings, cost snapshot, rollback, ownership.
Commit/test/report.
```

### B6 - Insights
```
Read script.md. Implement backend B6 only on new branch b6-insights.
GET /api/insights/daily?date= (default today Asia/Kolkata), cached by user+date. Return sales, salesCount, avg, purchases, estimatedGrossProfit (from cost snapshots), salesChange% vs yesterday, top5 by qty/revenue, low-stock count/list.
GET /api/insights/trend?days=7|30 cached by user+days. One point/day, fill zeros. Efficient aggregates, indexes in V6. Tests with seeded data.
Commit/test/report.
```

### B7 - Wispr
```
Read script.md. Implement backend B7 only on new branch b7-wispr.
Create WisprClient in wispr/ only code calling Wispr. Read base-url/key from config, timeout, clear custom exception on failure. If key empty -> "Wispr is not configured".
POST /api/voice/ledger (multipart audio) and POST /api/voice/bill, POST /api/voice/text (json). Call WisprClient then parser.
Parser: EN+HI forms (two kg sugar at forty rupees, do kilo sugar ek litre oil teen packet rice, sugar two kilo forty rupees), spelled numbers/Hindi numbers/units. If no price stated, fill from product default selling price and mark priceFromSheet. Loose name match. Skip unknown. >=20 parser tests + endpoint test with mocked WisprClient. Never log key/raw audio.
Commit/test/report.
```

## Frontend

### F1 - Scaffold, theme, layout
```
Read script.md. Implement frontend F1 only on new branch f1-scaffold.
Create Vite React+TS app in frontend/. Install react-router-dom,@tanstack/react-query,axios,recharts only if needed (ask). 
Folders api,components,context,hooks,pages,types,utils,styles.
CSS variables theme as specified. App shell: sidebar desktop/bottom nav mobile (Insights,Ledger,Stock,Price Sheet,Settings,Logout). 
Components: Button,Input,Select,Card,Modal,EmptyState,Spinner,Toast,ConfirmDialog. Placeholder pages + protected routes. .env.example with VITE_API_URL.
Run dev server, confirm routes render. Commit/test/report.
```

### F2 - API client, types, auth
```
Read script.md. Implement frontend F2 only on new branch f2-auth.
Types for all API contract shapes. Axios client baseURL from env, 15s timeout, bearer token from localStorage, 401 -> logout + readable error.
Auth context login/register/logout/session restore. Login/signup toggle, show/hide password, validation, disabled while loading, error display.
Mock mode via env flag using in-memory data. Test register/login/reload/logout/wrong password.
Commit/test/report.
```

### F3 - Settings
```
Read script.md. Implement frontend F3 only on new branch f3-settings.
Settings page sections: Shop profile, Billing defaults (GST rate/on/off, discount/on/off), Stock defaults (low-stock threshold), bill prefix/currency.
GET/PUT /api/settings. Validate percentages 0-100. Unsaved changes, disable save while saving, toast/error. Shared hook for settings (used by ledger/stock/price sheet).
Commit/test/report.
```

### F4 - Price Sheet
```
Read script.md. Implement frontend F4 only on new branch f4-price-sheet.
Editable table: name,unit,cost,defaultSelling,margin% live, gstOverride. Search, inline edit, highlight changed rows, warn if selling < cost. Save All sends only changed rows to PUT /api/products/price-sheet. Empty state links to Stock. Horizontal scroll on mobile, disable saving, errors. Verify persistence/margin.
Commit/test/report.
```

### F5 - Stock
```
Read script.md. Implement frontend F5 only on new branch f5-stock.
Searchable list: name,qty,unit,cost,defaultSelling, low-stock badge from backend flag. Modal add/edit with unit dropdown (full list). Delete confirmation. Merge message when quantity added to existing. Quick Add Stock (purchase/restock). Low-stock filter. Loading/empty. Optimistic updates only with rollback.
Verify add/search/edit/delete/merge/restock/low-stock filter.
Commit/test/report.
```

### F6 - Ledger/manual entry
```
Read script.md. Implement frontend F6 only on new branch f6-ledger-manual.
Ledger tabs All/Sales/Purchases, search, date range, newest first. New Entry -> Add Manually/Add Using Voice.
Manual: sale/purchase, autocomplete from products (auto-fill unit/default selling, per-unit or total price toggle). Warn if not in stock/exceeds stock (never block). Summary party/name/phone/entry number (auto), GST/discount switches from defaults overrideable, live totals. Validate, send array+numbers, show backend warnings, clear on success.
Verify totals in both modes with GST/discount.
Commit/test/report.
```

### F7 - Voice entry (Wispr)
```
Read script.md. Implement frontend F7 only on new branch f7-voice.
Hero feature. Microphone button, timer, live level, status Ready/Listening/Transcribing with Wispr/Review. MediaRecorder, mic permission, clear denial/unsupported, format, stop tracks, 60s cap.
Module transcribeLedger uploads multipart audio field 'audio' to backend voice endpoint (only place knowing Wispr). After transcription show transcript + editable table, flag items priceFromSheet. Edit/remove/add items. If nothing parsed -> retry/manual. Type instead -> /api/voice/text. Reuse summary/save as manual (defaults). Mock returns canned response after 1.5s. Handle network/Wispr/empty errors. Test real/mock.
Commit/test/report.
```

### F8 - Insights dashboard
```
Read script.md. Implement frontend F8 only on new branch f8-insights.
Home screen. Date picker default today, cards sales/bills/avg/purchases/profit with change vs yesterday. Recharts line/bar 7d with toggle 30d. Top selling items, low-stock alert with link. Quick actions New Sale by Voice/Manually/Add Stock. Loading skeletons, empty day message, retry on error. Refetch on ledger/stock changes via query invalidation. Verify numbers match backend.
Commit/test/report.
```

### F9 - Entry details/print
```
Read script.md. Implement frontend F9 only on new branch f9-details.
Details page fetch entry + settings for shop header (name/address/phone/GST). Item table, subtotal,GST,discount,grand total with currency symbol. Print button triggers window.print() with print stylesheet hiding nav for clean 1-page invoice. Loading/missing/error states. Verify totals/print preview.
Commit/test/report.
```

### F10 - Polish/demo
```
Read script.md. Implement frontend F10 only on new branch f10-polish.
Polish all pages. Add mock data (settings, 5 products sugar/oil/rice/tea/milk with prices, week of ledger history). Loading/empty/error everywhere, keyboard friendly forms, validation, confirm dialogs for destructive actions, disable buttons while saving, responsive phone/tablet/desktop. Fix console errors. README updated if needed. Walk through full demo steps with what to say/click + backup (Type instead). Commit/test/report.
```

## Quick Fix/Bug Prompt
```
Read script.md and README.md. Create a new branch fix/<short-description>.
Bug: <describe issue + steps to reproduce + expected/actual>. 
Find root cause with minimal changes, don't refactor unrelated code. 
Add/update tests if applicable. Build/test. 
Commit with clear message. Report files changed, commands run, result, and stop.
```

## Push Prompt
```
Read README.md. Add remote if missing (ask for URL if unknown). Push current branch to origin. Open PR with summary of changes and test results. Report URL/status.
```
