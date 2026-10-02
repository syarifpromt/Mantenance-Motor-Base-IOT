---
name: Veloce Telemetry
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3f4850'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006947'
  on-tertiary: '#ffffff'
  tertiary-container: '#00855b'
  on-tertiary-container: '#f5fff6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-odometer:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 52px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

The design system is engineered for utility-first automotive IoT telemetry, optimized specifically for high-glare outdoor environments and real-time roadside monitoring. The interface delivers an immediate sense of mechanical precision, calm reliability, and instantaneous situational awareness. Built for motorcycle riders interacting with Web Bluetooth hardware via Chrome on Android, the aesthetic merges technical precision with crisp, airy digital minimalism.

Key characteristics:
- **Utilitarian Clarity**: Uncluttered data hierarchy with instantaneous glanceability under direct sunlight.
- **Precision Hardware Metaphor**: Clean structural cards, fine hairline boundaries, and active data states that feel integrated with modern vehicle digital clusters.
- **Diagnostic Color Language**: Purpose-driven semantic feedback that guides maintenance actions without creating unnecessary visual noise.

## Colors

The palette is tuned for extreme daylight legibility, relying on high-contrast base tones and precise semantic accents:

- **Canvas & Surfaces**: The foundation relies on pure white (`#FFFFFF`) for primary cards and elevated sheets, set against cool slate foundations (`#F8FAFC` base background, `#F1F5F9` structural sub-surfaces).
- **Text & Hierarchy**: Deep Slate Navy (`#0F172A`) delivers maximum outdoor contrast for numerical telemetry and critical headings. Secondary typography uses Slate Navy 800 (`#1E293B`) and muted labels leverage Cool Slate (`#64748B`).
- **Telemetry & Connectivity**: Electric Automotive Sky (`#0284C7`) represents active Web Bluetooth connectivity, synced states, and primary touch interactions.
- **Service Diagnostics**:
  - **Aman (Nominal/Safe)**: Emerald Green (`#10B981`) for components operating well within threshold.
  - **Segera (Due Soon ≤20%)**: Amber Gold (`#F59E0B`) for approaching wear limits.
  - **Terlewat (Overdue ≤0km)**: Crimson Red (`#EF4444`) for critical or overdue maintenance intervals.

## Typography

The typography leverages **Plus Jakarta Sans** across all levels for its contemporary geometric construction, open apertures, and exceptional legibility on high-density mobile screens in bright conditions.

- **Tabular Numerics**: Telemetry metrics, odometer mileage readings, and trip calculations must render with `font-variant-numeric: tabular-nums` to ensure stable layout alignment during dynamic over-the-air updates.
- **Scale Priority**: The `display-odometer` level anchors the main interface, establishing instant recognition of current vehicle distance even when viewed from arm's length or mounted on handlebars.
- **Label Discipline**: Diagnostic labels and connection metadata utilize uppercase styling with micro-letter-spacing (`0.05em`) at `label-sm` to maintain clarity at compact dimensions.

## Layout & Spacing

The layout is built for single-hand mobile operation on Chrome Android, adhering to a 4px/8px incremental rhythm:

- **Canvas Container**: Outer canvas margins use `1rem` (16px), maximizing horizontal real estate while maintaining safe touch gutters on edge-to-edge mobile screens.
- **Touch Targets**: All interactive elements (BLE scan buttons, reset switches, modal toggles) enforce a minimum touch area of 48px × 48px to accommodate gloved or wet hands during maintenance inspections.
- **Vertical Rhythm**: Telemetry blocks use `space-md` (16px) for interior component padding and `space-lg` (20px) to separate independent maintenance modules.

## Elevation & Depth

To combat bright outdoor glare where subtle shadows wash out, visual depth is constructed through crisp surface boundaries rather than heavy drop shadows:

- **Base Layer**: Background canvas sits at `#F8FAFC`.
- **Card Tier**: Modules use crisp pure white (`#FFFFFF`) framed by a low-contrast perimeter outline (`1px solid #E2E8F0`).
- **Elevated Interactive Controls**: Floating connect action banners or bottom sheets use an ambient technical shadow: `0 4px 16px -2px rgba(15, 23, 42, 0.06), 0 1px 2px 0 rgba(15, 23, 42, 0.04)`.
- **State Highlighting**: Selected or active cards rely on a 2px inner or stroke accent using the primary color (`#0284C7`), maintaining edge sharpness without blur.

## Shapes

The interface embraces a refined curved architecture matching contemporary vehicle dashboard interfaces:

- **Structural Modules**: Primary cards, telemetry widgets, and status panels use `rounded-2xl` (1rem / 16px) to maintain a soft, modern industrial silhouette.
- **Buttons & Pills**: Touch triggers, BLE status indicators, and threshold chips utilize fully rounded pill contours (`9999px`) to distinguish actionable and stateful indicators from static structural blocks.
- **Inputs & Micro-elements**: Form fields and minor alert containers standardise on `rounded-lg` (0.5rem / 8px).

## Components

### Odometer Hero Card
- Surface: `#FFFFFF`, border: `1px solid #E2E8F0`, corner radius: `1rem`.
- Interior: Prominent display of live kilometer metrics (`display-odometer`), paired with a dynamic sync badge showing the last Bluetooth packet timestamp and signal RSSI strength.

### Connectivity Bar (Web Bluetooth)
- Detached top bar displaying connection state:
  - **Scanning/Connecting**: Pulsing primary cyan accent (`#0284C7`).
  - **Connected**: Subtle pill with a solid green pulse indicator and vehicle hardware UUID/MAC name.
  - **Disconnected**: Soft neutral tone (`#F1F5F9`) with a direct "Hubungkan" (Connect) trigger.

### Maintenance Threshold Cards (Part Status)
- Structured vertical list items for consumable parts (e.g., Oli Mesin, V-Belt, Busi, Kampas Rem).
- Includes remaining kilometer counter, linear progress track (4px height with rounded endpoints), and semantic status pills:
  - **Aman**: Text `#065F46`, background `#D1FAE5`.
  - **Segera**: Text `#92400E`, background `#FEF3C7`.
  - **Terlewat**: Text `#991B1B`, background `#FEE2E2`.

### Buttons
- **Primary**: Solid background `#0284C7`, text `#FFFFFF`, rounded pill format (`9999px`), active state `#0369A1`.
- **Secondary**: Surface `#FFFFFF`, border `1.5px solid #CBD5E1`, text `#0F172A`.
- **Destructive/Reset**: Surface `#FEF2F2`, border `1px solid #F87171`, text `#DC2626`.

### Chips & Badges
- Compact padding (`0.25rem 0.625rem`), uppercase `label-sm` typography, combined with micro status dot icons (6px) to reinforce status for colorblind users.