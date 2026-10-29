---
version: 1
slug: "frontend-src"
primary_target: "frontend/src"
related_targets: []
---

# Surface brief: SmartLedger app (whole authenticated app + auth)

Scope: all routes (auth, insights, ledger, voice entry, manual entry, entry details/print, stock, price sheet, settings). Visitor mode: Operate.

Audience / job: shopkeeper at the counter on a phone, Hindi + English, creating a bill by voice in seconds, then checking stock, prices and the day's money. Back-office on tablet/desktop.

Constraints: UI stack is shadcn/ui (Radix) + Tailwind, light and dark mode. API contracts, routes and auth flow keep working. No invented claims or data. Hindi sublabels are translations of existing labels only.

## Direction contract

THESIS: A shop counter is a platform: things arrive, get called out, and leave on time. The app is a station board for a shop: bilingual signage labels, tabular numerals, signal colours that mean go/stop, and the microphone as the one yellow signal. It refuses the generic fintech dashboard (white cards, purple/blue gradient, hero-metric grid).

OWN-WORLD: Indian Railways signage and timetable tradition, taken only as type, palette, density and one move. Light: cool paper-white ground (#F3F6FB), railway blue shell and primary (#0B3A8C), signal yellow (#FFC20E) reserved for the voice mic and the selected state, go-green (#13803F), stop-red (#C62828), caution amber. Dark ("night platform"): blue-black ground (#0A1020), raised panels (#121B31), yellow becomes the primary fill with blue-black ink. Type: Noto Sans + Noto Sans Devanagari, 1.125 scale, tabular figures for every number. Radius 6px, hairline borders, almost no shadow. Components are standard shadcn.

STORY: The shopkeeper opens the app and sees the day as a board: sales, bills, profit in tabular columns, low stock called out in red. One tap on the yellow mic and the shop is listening; they speak a bill, watch it post line by line, fix a number, and save. They trust it because prices say where they came from.

FIRST VIEWPORT: Phone (390x844): blue top bar with shop name and theme toggle; below, the day board: one dominant sales figure with change vs yesterday, then a compact two-column board of Bills / Average / Purchases / Profit; low-stock rows in red; bottom nav of 4 tabs (Insights, Ledger, Stock, Price Sheet) with a raised yellow mic docked in the centre. Desktop (1440x900): 240px blue rail with bilingual nav pairs (Insights / आज का हाल, Ledger / खाता, Stock / माल, Price Sheet / भाव, Settings / सेटिंग), content at max 1200px, the day board on top, trend chart and low-stock call-outs below, yellow "New sale by voice" as the single primary action.

SIGNATURE: Bilingual sign-pairs on every nav item and page title (English primary, Hindi secondary), plus the departure-board post: parsed voice items appear row by row with a short vertical wipe (reduced-motion: instant). FORM: position 4 of my ordered list (railway timetable/signage), seed:869fda56e8cefb9a.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
