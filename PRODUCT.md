# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Small shopkeepers in India (confirmed). They use SmartLedger at the counter while serving customers, mostly on a phone, speaking Hindi and English. They create sales and purchase bills, track stock and prices, and check how the day went. Back-office tasks (stock, price sheet, insights, settings) happen on tablet or desktop but are secondary.

## Product Purpose
Voice-first billing and ledger for a small shop. The shopkeeper speaks a bill; Wispr transcribes it, the backend parses it into line items priced from the shop's own price sheet, and the shopkeeper reviews and saves it. Success is a bill created in seconds without typing, with stock and profit kept correct as a side effect.

## Positioning
Billing that starts from speech in Hindi and English and prices items from the shop's own price sheet, rather than starting from a form. Wispr is the speech layer and is part of the product story (hackathon build for WeMakeDevs).

## Operating Context
- Counter use: one hand free, customers waiting, noisy shop, interrupted constantly.
- Entries are sales or purchases with party name, phone, entry number, optional GST and discount, item lines with units and per-unit or total pricing.
- Currency defaults to the rupee, formatted en-IN. Defaults (GST on, discount on, percentages) live in Settings.
- Entries must be printable as an invoice on one A4 page.

## Capabilities and Constraints
- Frontend: React 18, Vite 5, strict TypeScript, React Router, TanStack Query, axios, Recharts. Existing styling is plain CSS variables; redesign moves to shadcn/ui + Tailwind (user decision) with light and dark mode.
- Backend: Java 17, Spring Boot 3, PostgreSQL, Flyway, Caffeine cache, JWT auth, Wispr via backend proxy. The user wants flaws found in the backend fixed too; the work is primarily frontend.
- Domain terms: Insights, Ledger, Stock, Price Sheet, Settings, Entry, Sale, Purchase, Low stock, Price from sheet.
- Hindi (Devanagari) text must render correctly wherever transcripts or item names appear.
- Undecided: whether the real pages (Insights, Ledger, ManualLedger, VoiceLedger, Stock, PriceSheet, Settings, LedgerDetails) replace the current stub routes in App.tsx (Profile, Add Stock, Create Bill, About); the working tree is mid-change.

## Brand Commitments
Name: SmartLedger. Tagline in the existing draft: "Voice billing powered by Wispr". No logo or brand colors are binding; the blue/green palette in the existing DESIGN.md draft is an unapproved draft, not a commitment.

## Evidence on Hand
No testimonials, customer counts, benchmarks or pricing exist and none may be invented. README.md, script.md (build spec) and PROMPTS.md describe intended behavior.

## Product Principles
1. Voice is the primary path; the microphone is always one tap away.
2. Glanceable at the counter: money and totals are the loudest things on screen.
3. Warn, never block: issues are inline and dismissible so a bill is never stuck.
4. Trust the shop's own numbers: prices come from the price sheet and are labelled when they do.
5. Works for Hindi and English speakers equally.

## Accessibility & Inclusion
Touch targets of at least 44px, readable contrast in bright shop light and in dark mode, full keyboard support, live-region announcements for voice states, `prefers-reduced-motion` respected. Hindi-speaking users are first-class.
