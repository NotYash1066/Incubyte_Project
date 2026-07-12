---
name: Dealership Inventory
description: Premium automotive inventory management for modern dealerships
colors:
  velocity-blue: "#2563eb"
  velocity-blue-hover: "#1d4ed8"
  velocity-blue-light: "#eff6ff"
  titanium-900: "#102a43"
  titanium-800: "#243b53"
  titanium-700: "#334e68"
  titanium-600: "#486581"
  titanium-500: "#627d98"
  titanium-400: "#829ab1"
  titanium-300: "#9fb3c8"
  titanium-200: "#bcccdc"
  titanium-100: "#d9e2ec"
  titanium-50: "#f0f4f8"
  showroom-white: "#ffffff"
  surface-secondary: "#f8fafc"
  surface-tertiary: "#f1f5f9"
  border: "#e2e8f0"
  border-light: "#f1f5f9"
  text-primary: "#0f172a"
  text-secondary: "#475569"
  text-muted: "#94a3b8"
  track-green: "#16a34a"
  track-green-light: "#f0fdf4"
  track-green-border: "#bbf7d0"
  amber-warning: "#d97706"
  amber-warning-light: "#fffbeb"
  amber-warning-border: "#fde68a"
  brake-red: "#dc2626"
  brake-red-hover: "#b91c1c"
  brake-red-light: "#fef2f2"
  brake-red-border: "#fecaca"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1.25rem, 3vw, 1.75rem)"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1rem, 2.5vw, 1.25rem)"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
  mono:
    fontFamily: "'JetBrains Mono', ui-monospace, 'Fira Code', monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  card: "0.75rem"
  button: "0.5rem"
  input: "0.5rem"
  badge: "9999px"
  icon: "0.625rem"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  2xl: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.velocity-blue}"
    textColor: "{colors.showroom-white}"
    rounded: "{rounded.button}"
    padding: "0.625rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.velocity-blue-hover}"
    textColor: "{colors.showroom-white}"
    rounded: "{rounded.button}"
  button-secondary:
    backgroundColor: "{colors.showroom-white}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.button}"
    padding: "0.625rem 1rem"
  button-danger:
    backgroundColor: "{colors.brake-red}"
    textColor: "{colors.showroom-white}"
    rounded: "{rounded.button}"
    padding: "0.625rem 1rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.button}"
    padding: "0.625rem 1rem"
  input:
    backgroundColor: "{colors.showroom-white}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.input}"
    padding: "0.625rem 0.875rem"
  card:
    backgroundColor: "{colors.showroom-white}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.card}"
  badge-blue:
    backgroundColor: "{colors.velocity-blue-light}"
    textColor: "{colors.velocity-blue}"
    rounded: "{rounded.badge}"
    padding: "0.125rem 0.625rem"
  badge-green:
    backgroundColor: "{colors.track-green-light}"
    textColor: "{colors.track-green}"
    rounded: "{rounded.badge}"
    padding: "0.125rem 0.625rem"
  badge-red:
    backgroundColor: "{colors.brake-red-light}"
    textColor: "{colors.brake-red}"
    rounded: "{rounded.badge}"
    padding: "0.125rem 0.625rem"
  badge-gray:
    backgroundColor: "{colors.surface-tertiary}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.badge}"
    padding: "0.125rem 0.625rem"
---

# Design System: The Showroom Floor

## 1. Overview

**Creative North Star: "The Showroom Floor"**

Every vehicle on a showroom floor sits in its own pool of light. The space is generous, the surfaces are clean, and each piece has presence. This design system brings that same curation to inventory management: each vehicle card is a spotlighted exhibit, every interaction feels considered, and the interface breathes with the confidence of a premium dealership.

The system rejects the clutter of traditional dealership CRMs (dense tables, beige surfaces, information without hierarchy) in favor of automotive-inspired clarity. It's energetic without being chaotic, premium without being cold.

This is a **brand-first product** — utility that delights. The tool reflects the quality of the vehicles it manages.

**Key Characteristics:**
- Generous whitespace and deliberate rhythm, like a well-lit showroom
- Confident blue anchor color with headroom for palette expansion
- Tactile, layered surfaces with purposeful elevation
- Fast, responsive micro-interactions that feel instant
- Typography-led hierarchy that scales cleanly across devices

## 2. Colors: The Velocity Palette

The palette is anchored by a confident blue (Velocity Blue) with a full titanium neutral range from deep navy-black to near-white. Status colors are automotive-inspired: Track Green for in-stock, Brake Red for errors, Amber Warning for alerts.

### Primary
- **Velocity Blue** (#2563eb — oklch(55% 0.2 255)): The single committed accent. Appears on primary actions, key interactive elements, and the brand mark. Used deliberately and consistently.
- **Velocity Blue Hover** (#1d4ed8 — oklch(48% 0.2 255)): Interactive darkening for buttons and links.
- **Velocity Blue Light** (#eff6ff — oklch(95% 0.03 255)): Background tint for selected states, badge fills, active nav indicators.

### Neutral: Titanium Scale
- **Titanium 900** (#102a43) → **Titanium 50** (#f0f4f8): A cool-leaning blue-gray scale. The high end (900) works as deep background or heavy text emphasis; the low end (50) as subtle surface differentiation. The full 9-step scale supports every surface and text role without extra mixing.
- **Showroom White** (#ffffff): Primary surface for cards, modals, and content areas.
- **Surface Secondary** (#f8fafc): Page backgrounds, behind-the-scenes containers.
- **Surface Tertiary** (#f1f5f9): Skeleton loaders, subtle hover fills, disabled backgrounds.

### Text
- **Text Primary** (#0f172a): Headings, body copy, primary labels. Near-black with a cool tint.
- **Text Secondary** (#475569): Secondary information, meta text, navigation labels.
- **Text Muted** (#94a3b8): Placeholders, disabled text, timestamps, helper hints.

### Status: Automotive Signals
- **Track Green** (#16a34a — oklch(55% 0.18 145)): In stock, success states, confirmation badges.
- **Brake Red** (#dc2626 — oklch(50% 0.2 30)): Out of stock, errors, destructive actions. High urgency.
- **Amber Warning** (#d97706 — oklch(60% 0.15 80)): Low stock, warnings, attention-required states.

### Border
- **Border** (#e2e8f0): Default dividers, card borders, table row separators.
- **Border Light** (#f1f5f9): Subtle dividers for nested or secondary sections.

### Named Rules
- **The One Voice Rule.** Velocity Blue is the single committed accent across all interactive surfaces. Success/error/warning have their own distinct status colors, but they are semantic, not decorative.
- **The Showroom Lighting Rule.** Dark text on light surfaces is the norm. Light text on dark backgrounds (Titanium 900, Velocity Blue) is reserved for deliberate contrast moments: the brand mark, inverted buttons, emphasis badges.

## 3. Typography

**Display Font:** Inter (with system-ui fallback)
**Body Font:** Inter (with system-ui fallback)  
**Mono Font:** JetBrains Mono (for code, prices, and data values)

Inter was chosen for its exceptional legibility at screen sizes, its x-height that maintains readability at small scales, and its range of weights (400–700) that creates clear hierarchy within a single family. This is a tool first; the type gets out of the way and lets the data speak.

**Character:** Clean, confident, unpretentious. Inter's tight apertures and generous x-height give the interface a precise, engineered feel — like a well-tuned instrument panel. No decorative flourishes, no unnecessary contrast.

### Hierarchy
- **Display** (700, `clamp(1.75rem, 4vw, 2.5rem)`, 1.2): Page titles, hero-level headings. Used sparingly — one per view.
- **Headline** (600, `clamp(1.25rem, 3vw, 1.75rem)`, 1.3): Section headings, modal titles, card titles.
- **Title** (600, `clamp(1rem, 2.5vw, 1.25rem)`, 1.4): Card vehicle names, subsection headings.
- **Body** (400, 0.875rem, 1.5): Primary reading text, table cells, descriptions. 65–75ch max line length.
- **Label** (500, 0.8125rem, 1.4, 0.01em letter-spacing): Form labels, table headers, metadata. Slightly tighter tracking for clarity.
- **Mono** (400, 0.8125rem, 1.5): Currency values, stock numbers, code-like data — JetBrains Mono.

### Named Rules
- **The Instrument Panel Rule.** Data values (prices, quantities, stock counts) that need precise scanning get mono type. This creates a visual rhythm where numbers stand out from labels without extra color.

## 4. Elevation

The system uses a layered approach: surfaces are flat at rest, and elevation is expressed through controlled, tight shadows that suggest proximity without floating. The effect is a tactile, cards-on-a-desk physicality — each card has just enough shadow to feel like a real object.

### Shadow Vocabulary
- **Card** (`0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)`): Default surface shadow for cards, dropdowns. Subtle enough to suggest resting on the page.
- **Card Hover** (`0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)`): Raised state for interactive cards on hover. Noticeably lifted but still grounded.
- **Elevated** (`0 10px 25px -5px rgb(0 0 0 / 0.08), 0 4px 10px -6px rgb(0 0 0 / 0.06)`): Modals, dialogs, floating elements. Clearly above the surface layer.
- **Modal** (`0 20px 50px -12px rgb(0 0 0 / 0.15)`): Highest layer. Full-screen overlays, confirmation dialogs.

### Named Rules
- **The Showroom Pedestal Rule.** Every interactive card has a resting state, a hover state, and an active state. The shadow difference between them is always exactly one step — never skip from Card to Modal on hover.

## 5. Components

### Buttons
- **Shape:** Medium-radius (`0.5rem`). Rounded enough to feel friendly, squared enough to feel precise.
- **Primary (Velocity Blue):** Bold anchor for the primary action on any screen. `#2563eb` background, white text, `0.625rem 1rem` padding. Hover deepens to `#1d4ed8`. Active presses to `scale(0.97)` with a shadow step.
- **Secondary (White):** Ghost-light alternative. White background, `#0f172a` text, `#e2e8f0` border. Hover tints to `#f1f5f9`. Default for cancel, secondary actions.
- **Danger (Brake Red):** Destructive action button. `#dc2626` background, white text. Hover deepens to `#b91c1c`. Reserved for irreversible actions only.
- **Ghost:** Borderless text button. Transparent background, `#475569` text. Hover fills `#f1f5f9` and shifts text to `#0f172a`. Used in toolbars, inline actions, table row controls.
- **Transition:** All buttons use `150ms cubic-bezier(0.4, 0, 0.2, 1)` for state changes. Fast enough to feel instant, slow enough to register.

### Cards
- **Corner Style:** Generous radius (`0.75rem`). Soft, premium, automotive-showroom feel.
- **Background:** Showroom White (`#ffffff`).
- **Shadow Strategy:** Card shadow at rest, Card Hover on interactive cards. See Elevation section.
- **Border:** Thin `#e2e8f0` border. Defines the card shape without adding visual weight.
- **Internal Padding:** `1.5rem` (vertical), `1.5rem` (horizontal). Air around content is part of the premium feel.
- **Interactive cards** (vehicle cards on Dashboard) have hover lift (`0.5rem` upward translate) and shadow step up.

### Inputs / Fields
- **Style:** Thin border (`#e2e8f0`), white background, medium radius (`0.5rem`).
- **Focus:** Border shifts to Velocity Blue, plus a `2px` ring at `#2563eb / 20%` opacity. No outline — the ring replaces it.
- **Padding:** `0.625rem 0.875rem` — comfortable tap target without being oversized.
- **Placeholder:** Text Muted (`#94a3b8`). Clear, never confused with filled values.
- **Error:** Border shifts to Brake Red.
- **Disabled:** `50%` opacity on the entire control. Surface Tertiary background.

### Badges
- **Shape:** Fully pill-shaped (`9999px`). Meant to sit inline with text.
- **Variants map to status colors:**
  - Blue badge: Category labels, non-status tags. Velocity Blue Light background.
  - Green badge: In stock, positive status. Track Green Light background.
  - Red badge: Out of stock, errors. Brake Red Light background.
  - Gray badge: Secondary tags, metadata. Surface Tertiary background.
- **Padding:** `0.125rem 0.625rem`. Compact but legible at 0.75rem font size.
- **Icon support:** Badges can include a leading icon (checkmark for in-stock, × for out-of-stock) at 0.75rem matching the text color.

### Navigation (Top Bar)
- **Style:** Fixed top bar with full-width background (`white/95` with backdrop blur). Bottom border separates it from content.
- **Brand mark:** Left-aligned. Small icon box (`2rem` square, Velocity Blue rounded, white car icon) + stacked "Dealership / Inventory" wordmark.
- **Nav links:** Text buttons with active state indicated by Velocity Blue Light background + Velocity Blue text.
- **User menu:** Right-aligned. Avatar initial in Titanium 100 circle, name/role stack, logout link.
- **Mobile:** Graceful collapse — user avatar hides below `sm` breakpoint, logout label hides, nav items remain tappable.

### Loading States
- **Skeleton:** Surface Tertiary (`#f1f5f9`) rounded bars matching text widths. Pulse animation.
- **Card skeleton:** Mirrors the card shape (0.75rem radius, full padding) with 3-4 skeleton bars mimicking title, subtitle, price, and button.
- **Button loading:** Inline spinner icon (animated stroke circle) replaces the button text width. Button stays at the same dimensions — no layout shift.

### Empty States
- **Icon:** A rounded icon container (Surface Tertiary circle, `4rem` diameter) with a muted SVG icon.
- **Heading:** "No vehicles found" or "No vehicles yet" — Title weight, Text Primary.
- **Description:** One line of guidance, Text Muted.
- **Action:** A single clear CTA (Clear Filters or Add Vehicle) that directly resolves the empty state.

## 6. Do's and Don'ts

### Do:
- **Do** use Velocity Blue as the single committed accent. Let it carry the interactive identity.
- **Do** use generous card padding (`1.5rem`) for a premium, airy feel — especially on vehicle cards.
- **Do** use mono type (JetBrains Mono) for prices, stock counts, and any data that benefits from precise scanning.
- **Do** stagger card entrance animations (60ms delay per card) for a polished, choreographed page load.
- **Do** use showroom-appropriate language: "in stock" / "out of stock" rather than "available" / "unavailable".
- **Do** respect WCAG 2.1 AAA contrast across all text, status colors, and interactive states.
- **Do** use the full titanium neutral range — the 50–900 scale gives enough granularity for every surface role.

### Don't:
- **Don't** use gradient text (`background-clip: text`). Emphasis comes from weight, size, and color — never gradients.
- **Don't** use side-stripe colored borders (border-left/right > 1px as an accent). Use full borders, background tints, or nothing.
- **Don't** use glassmorphism or backdrop blur as a decorative default. The surfaces are solid and tactile.
- **Don't** build identical card grids with icon + heading + text repeated endlessly. Vary card content and layout.
- **Don't** default to modal dialogs. Exhaust inline editing, expandable sections, and progressive disclosure first.
- **Don't** use the hero-metric template (big number + small label + supporting stats). This is inventory, not a SaaS dashboard.
- **Don't** use beige or muted palettes — the Titanium scale is cool-leaning and precise, not warm and washed out.
- **Don't** use em dashes. Use commas, colons, semicolons, or periods.
- **Don't** use all-caps body copy. Reserve uppercase for short labels and table headers.
- **Don't** animate CSS layout properties (width, height, top, left). Use transforms and opacity only.
