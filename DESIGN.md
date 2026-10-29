---
name: SmartLedger
description: Voice billing for a small Indian shop, set as a station board with railway-blue signage and one yellow microphone signal.
colors:
  platform-paper: "#f3f6fb"
  ticket-white: "#ffffff"
  ink-blue: "#0e1a2f"
  timetable-grey: "#4a5a75"
  rule-line: "#d3dceb"
  field-line: "#b4c1d8"
  muted-panel: "#e9eef6"
  railway-blue: "#0b3a8c"
  railway-blue-lit: "#164aa8"
  rail-text: "#eaf1ff"
  rail-text-muted: "#a9c0ee"
  signal-yellow: "#ffc20e"
  signal-ink: "#1b1500"
  go-green: "#13803f"
  go-green-soft: "#e2f4e9"
  stop-red: "#c62828"
  stop-red-soft: "#fbe7e7"
  caution-amber: "#9a5700"
  caution-amber-soft: "#fdf0d8"
  info-blue-soft: "#e2ebfa"
  night-platform: "#0a1020"
  night-panel: "#111a30"
  night-popover: "#141f38"
  night-ink: "#e8eefa"
  night-muted-ink: "#9fb0cc"
  night-line: "#22304d"
  night-field-line: "#34456b"
  night-rail: "#0d1730"
  night-go-green: "#46d98f"
  night-stop-red: "#ff7070"
  night-caution-amber: "#ffb454"
  night-chart-blue: "#6fa0ff"
typography:
  display:
    fontFamily: "Noto Sans Variable, Noto Sans Devanagari Variable, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Noto Sans Variable, Noto Sans Devanagari Variable, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Noto Sans Variable, Noto Sans Devanagari Variable, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.55
  body:
    fontFamily: "Noto Sans Variable, Noto Sans Devanagari Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
  label:
    fontFamily: "Noto Sans Variable, Noto Sans Devanagari Variable, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
  caption:
    fontFamily: "Noto Sans Variable, Noto Sans Devanagari Variable, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.railway-blue}"
    textColor: "{colors.ticket-white}"
    rounded: "{rounded.md}"
    typography: "{typography.label}"
    height: "40px"
    padding: "8px 16px"
  button-primary-lg:
    backgroundColor: "{colors.railway-blue}"
    textColor: "{colors.ticket-white}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "0 24px"
  button-signal:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.signal-ink}"
    rounded: "{rounded.md}"
    typography: "{typography.label}"
    height: "40px"
    padding: "8px 16px"
  button-destructive:
    backgroundColor: "{colors.stop-red}"
    textColor: "{colors.ticket-white}"
    rounded: "{rounded.md}"
    height: "40px"
  button-secondary:
    backgroundColor: "#e6ecf6"
    textColor: "{colors.ink-blue}"
    rounded: "{rounded.md}"
    height: "40px"
  input-field:
    backgroundColor: "{colors.ticket-white}"
    textColor: "{colors.ink-blue}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "4px 12px"
  card-panel:
    backgroundColor: "{colors.ticket-white}"
    textColor: "{colors.ink-blue}"
    rounded: "{rounded.xl}"
    padding: "24px"
  rail-link:
    backgroundColor: "{colors.railway-blue}"
    textColor: "{colors.rail-text}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "0 12px"
  rail-link-active:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.signal-ink}"
  mic-dock:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.signal-ink}"
    rounded: "{rounded.full}"
    size: "56px"
---

# Design System: SmartLedger

## Overview

**Creative North Star: "The Station Board"**

A shop counter is a platform: things arrive, get called out, and leave on time. SmartLedger takes Indian Railways signage and timetable tradition for its type, palette, density and one move only. A cool paper-white ground carries a railway-blue shell, hairline rules, tabular columns of rupees, and go/stop signal colours that mean exactly that. The microphone is the one yellow signal on the board.

The system is calm and dense where money is shown and loud only where an action or a warning needs to be. Components are standard shadcn/ui (Radix) on Tailwind, re-skinned entirely through tokens in `src/index.css`; there are no bespoke widgets except the sign pair, the departure-board post, and the docked mic. Light is the platform by day; dark is the "night platform", a blue-black ground where yellow takes over as the primary fill.

It rejects the generic fintech dashboard: white card walls, purple or blue gradients, a hero-metric grid.

**Key Characteristics:**
- Railway blue shell and primary; signal yellow reserved for the mic and the selected state.
- Bilingual sign pairs (English primary, Hindi secondary) on nav items and page titles.
- Tabular numerals set globally; every figure aligns in columns.
- 6px radius, hairline borders, near-flat surfaces.
- Departure-board reveal: parsed voice lines post row by row.
- Light and dark themes with the same roles; Hindi is first-class.

## Colors

A cool, blue-tinted neutral field with one saturated blue, one yellow, and three status colours. Values below are light mode; the night-platform counterparts are in the frontmatter and mapped by role.

### Primary
- **Railway Blue** (`{colors.railway-blue}`): primary buttons, links, focus ring, the mobile top bar, the desktop rail, the sales chart series. In dark mode the primary role is taken by Signal Yellow.
- **Railway Blue Lit** (`{colors.railway-blue-lit}`): hover and accent surface on the blue rail.

### Secondary
- **Signal Yellow** (`{colors.signal-yellow}`): the microphone (docked mic, global voice, voice recording button and its pulsing ring), the active rail item, text selection, and the "New sale by voice" action. In dark mode it is also the primary fill, accent text, and focus ring. Ink on it is always Signal Ink (`{colors.signal-ink}`).

### Tertiary (status)
- **Go Green** (`{colors.go-green}`): profit, positive change, success, profit chart series. Soft fill `{colors.go-green-soft}`.
- **Stop Red** (`{colors.stop-red}`): low stock, errors, destructive actions. Soft fill `{colors.stop-red-soft}`.
- **Caution Amber** (`{colors.caution-amber}`): warnings, purchases chart series (`#b26a00` in light). Soft fill `{colors.caution-amber-soft}`.
- **Info Blue Soft** (`{colors.info-blue-soft}`): neutral informational fills.

### Neutral
- **Platform Paper** (`{colors.platform-paper}`): page ground.
- **Ticket White** (`{colors.ticket-white}`): cards, popovers.
- **Ink Blue** (`{colors.ink-blue}`): body text. **Timetable Grey** (`{colors.timetable-grey}`): secondary text.
- **Rule Line** (`{colors.rule-line}`) hairline borders; **Field Line** (`{colors.field-line}`) input borders and scrollbar thumbs; **Muted Panel** (`{colors.muted-panel}`) muted fills.
- **Night Platform** (`{colors.night-platform}`) dark ground, **Night Panel** (`{colors.night-panel}`) raised dark cards, **Night Ink** (`{colors.night-ink}`) dark text.

### Named Rules
**The One Yellow Rule.** Signal Yellow means "voice" or "you are here". It never decorates a card, badge, chart or heading.
**The Go/Stop Rule.** Green means money in or healthy; red means stop or low. Never swap them for branding.
**The Paired Surface Rule.** Every status colour is used as text/solid plus its soft fill; never raw alpha tints.

## Typography

**Display, Body and Label Font:** Noto Sans Variable (with Noto Sans Devanagari Variable, then system-ui, Segoe UI, sans-serif)

**Character:** One family covers Latin and Devanagari so Hindi and English sit at the same weight and colour. Weight and size carry hierarchy; no second face.

### Hierarchy
- **Display** (700, 2.25rem, 3rem from md, tight tracking): the single dominant sales figure on Insights; also the auth tagline.
- **Headline** (700, 1.5rem, -0.025em): page title as a Sign pair, English then Hindi at 1rem beside it.
- **Title** (600, 1.125rem): card titles and section heads.
- **Body** (400, 1rem, 1.5; Devanagari 1.6): body text, inputs on mobile. Tabular figures are on for the whole body.
- **Label** (500 to 600, 0.875rem): buttons, table cells, form labels, rail links (15px).
- **Caption** (500, 0.75rem): dock labels, Hindi sub-label in rail, hints.

### Named Rules
**The Tabular Rule.** `font-variant-numeric: tabular-nums` is set on `body`; money and quantities always align in columns. Currency is formatted en-IN with the rupee.
**The Sign Pair Rule.** A bilingual label is English at full size over (or beside) Hindi at 0.8em, normal weight, 75% opacity, tagged `lang="hi"`. Hindi is a translation of the existing label, never new copy.

## Layout

Phone first, content in a single column with 16px side padding (24px from md, 32px from lg), centred at max 1200px. Spacing follows the Tailwind 4px step; the board reads in compact two-column groups on mobile and widens at md and lg. Navigation switches by breakpoint: below md a 64px bottom dock with five slots (Insights, Ledger, raised mic, Stock, Prices) and a 56px blue top bar; at md a 72px icon rail; from lg a 240px rail with Sign-pair labels, plus a 56px content header. Main content leaves 128px bottom padding on mobile for the dock and mic. Touch targets are 44px or more (inputs 44px on mobile, 40px from md; rail links 48px).

## Elevation & Depth

Nearly flat. Depth comes from tonal layering (paper ground, white or night-panel cards) and hairline borders, not shadows. Stock shadcn `shadow-xs` sits under inputs and outline buttons; menus and dialogs use the shadcn popover shadows, which is the only lift in the system.

### Shadow Vocabulary
- **Mic lift** (`box-shadow: 0 4px 12px rgba(10,16,32,0.25)` plus a 4px ring in the ground colour): the docked mic only, so it reads as cut out of the dock.
- **Overlay** (shadcn `shadow-md` / `shadow-lg`): dropdowns, selects, dialogs, sheets.

### Named Rules
**The Flat Platform Rule.** Surfaces are flat at rest. A shadow marks something that floats above the page (mic, menu, dialog), never a card.

## Shapes

Small, practical radius from a single `--radius` of 6px: sm 4px, md 6px (buttons, inputs, nav links), lg 8px (dialogs), xl 12px (cards). Fully round is reserved for the mic, badges and switches. Borders are 1px hairlines in Rule Line. Focus is a 2px ring-coloured outline with 2px offset, plus a 3px 50% ring on controls.

## Components

### Buttons
- **Shape:** 6px radius, 40px high (sm 32px, lg 48px, icon 40px), label type, 16px horizontal padding.
- **Primary:** Railway Blue with white text (dark: Signal Yellow with Signal Ink). Hover is 90% opacity.
- **Signal:** Signal Yellow, Signal Ink, weight 600, for voice actions only ("New sale by voice").
- **Secondary / Outline / Ghost:** Secondary tint fill; Outline has a hairline border; Ghost shows accent on hover. Destructive is Stop Red.

### Inputs / Fields
- **Style:** transparent (dark: 30% input tint) fill, 1px Field Line border, 6px radius, 44px high on mobile.
- **Focus:** border becomes the ring colour with a 3px 50% ring. Invalid uses Stop Red border and ring. Disabled is 50% opacity.

### Cards / Containers
- **Corner Style:** 12px. **Background:** Ticket White (dark Night Panel). **Border:** 1px hairline. **Padding:** 24px, 24px internal gap. **Shadow:** none by rule; the shipped Card primitive still carries stock shadcn `shadow-sm`, recorded as drift, not as a rule.

### Navigation
Blue shell: rail and mobile top bar in Railway Blue (dark: Night Rail). Rail links are 48px with a 20px outline icon and a Sign pair; the active link is a Signal Yellow block with Signal Ink. Dock links are caption-size icon-over-label, active in primary colour at weight 600. The theme toggle and the global voice assistant button sit in the header.

### Docked Mic
A 56px yellow circle raised 24px above the centre of the dock, microphone icon at 2.4 stroke, ringed in the ground colour, 95% scale on press. On the voice screen the recording button pulses an expanding yellow ring (`ring`, 2.8s, hidden when reduced motion is requested).

### Departure-Board Post
Parsed voice items enter as list rows with the `post` animation: 220ms, `cubic-bezier(0.16, 1, 0.3, 1)`, a clip-path wipe from the top with a 6px settle, staggered 70ms per row. Reduced motion collapses all animation to 0.01ms.

### Voice Assistant (global)
A header button opens a hands-free listener that interprets spoken commands from `src/lib/voiceCommands.ts` and answers with a toast: go to Insights, Price Sheet, Stock, Settings or Ledger (also "khata", "kholo", "dikhao"); new bill, optionally with items ("new bill for 2 kg sugar and 1 litre oil", "naya bill banao"); new purchase/manual entry; open, view or print a bill by number or the current one; restock an item ("add 10 kg sugar to stock"); set an item price; set GST rate, GST on/off, discount percent, discount on/off, low-stock level, shop name, shop phone; dark mode or light mode; and help, which lists these commands.

### Print Sheet
On print, the page is A4 with 12mm margins, white ground, black ink; elements marked `no-print` (rail, bars, dock, actions) disappear, `print-sheet` drops borders, shadows and tint, and table rows do not break across pages.

## Do's and Don'ts

### Do:
- **Do** use the token roles (`bg-background`, `text-muted-foreground`, `bg-signal`, `text-success`, soft fills) rather than raw hex.
- **Do** pair every nav item and page title in English with a Hindi translation (Insights / आज का हाल, Ledger / खाता, Stock / माल, Price Sheet / भाव, Settings / सेटिंग).
- **Do** keep touch targets at or above 44px on mobile and keep focus rings visible in both themes.
- **Do** let money be the largest type on a screen and align it with tabular numerals.
- **Do** make every new motion honour `prefers-reduced-motion`.

### Don't:
- **Don't** spend Signal Yellow on anything but voice and the selected state.
- **Don't** use purple or blue gradients, white card grids around a hero metric, or other generic fintech dashboard devices.
- **Don't** add shadows to cards, or introduce radii outside the 4/6/8/12px scale.
- **Don't** set Hindi in a different weight, face or colour from its English pair, or add Hindi copy that is not a translation of an existing label.
- **Don't** put a quantity, price or total in proportional figures.
