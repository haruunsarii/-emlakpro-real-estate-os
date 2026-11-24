---
name: EmlakPro Modern Real Estate OS
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#45464f'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#767680'
  outline-variant: '#c6c5d0'
  surface-tint: '#4f5c8e'
  primary: '#000f3f'
  on-primary: '#ffffff'
  primary-container: '#172554'
  on-primary-container: '#808dc2'
  inverse-primary: '#b7c4fd'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#040056'
  on-tertiary: '#ffffff'
  tertiary-container: '#0c0092'
  on-tertiary-container: '#7e82ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4fd'
  on-primary-fixed: '#071747'
  on-primary-fixed-variant: '#374475'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.025em
  display-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  caption:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  currency-stat:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

This design system establishes an authoritative, precise, and high-trust digital environment tailored for elite commercial and residential real estate agencies in Turkey. The brand embodies institutional competence, transactional speed, and discreet luxury. Every surface and interaction communicates the financial gravity of property transactions while sustaining the velocity demanded by modern brokerages.

### Design Movement & Aesthetic
The visual language operates within **Corporate / Modern SaaS Minimalism**, enhanced with micro-depth tactile details:
- **Structural Integrity:** Crisp hairline borders (`1px solid #E2E8F0`) defining data-dense operational zones without visual clutter.
- **Architectural Hierarchy:** Strict information cadence modeled after modern financial terminals and architectural blueprints, using whitespace strategically to prevent cognitive fatigue during extended operational sessions.
- **Atmospheric Elegance:** Subtle ambient elevations, refined neutral surfaces, and contextual status markers designed for high legibility across portfolios, listing pipelines, and customer communications.
- **Localization Rigor:** Designed natively around Turkish character sets (Ç, Ğ, İ, Ö, Ş, Ü) and monetary conventions (₺, TRY formatting with dot-thousands and comma-decimals: e.g., `₺14.750.000,00`).

## Colors

The palette balances authoritative deep nautical tones with active digital cobalt accents and unambiguous status signifiers.

### Core Swatches
- **Primary (`#172554` - Deep Navy):** Represents foundational trust, contracts, persistent navigation sidebars, active global toggles, and primary call-to-action buttons.
- **Secondary (`#3B82F6` - Royal Blue):** Interactive focus states, table links, interactive selection rings, and progress indicators.
- **Tertiary (`#6366F1` - Indigo):** Reserved for rental and leasing lifecycles (*Kiralık* operations), differentiating leases from outright sales.
- **Neutral Light Stack:**
  - Body/Canvas Surface: `#F8FAFC`
  - Container/Card Surface: `#FFFFFF`
  - Structural Hairlines & Dividers: `#E2E8F0`
  - Input Inactive / Surface Alt: `#F1F5F9`
- **Neutral Dark Stack:**
  - Headings & KPI Figures: `#0F172A` (Slate 900)
  - Body Copy & Form Labels: `#334155` (Slate 700)
  - Secondary Metadata, Placeholders & Helper Text: `#64748B` (Slate 500)
  - Disabled Elements: `#94A3B8` (Slate 400)

### Real Estate Domain Status Codes
Status badges use soft-tint backgrounds (10% opacity) paired with high-contrast text and border treatments:
- **Success / Closed / Active (`#10B981` Emerald):** *Tamamlandı*, *Aktif Portföy*, *Satıldı*. Background: `#ECFDF5`, Border: `#A7F3D0`.
- **Pending / In Negotiation (`#F59E0B` Amber):** *Bekliyor*, *Pazarlık Aşaması*, *Teklif Sunuldu*. Background: `#FFFBEB`, Border: `#FDE68A`.
- **Critical / Passive / Lost (`#EF4444` Rose):** *Kaybedildi*, *Pasif İlan*, *İptal*. Background: `#FEF2F2`, Border: `#FECACA`.
- **Lease Segment (`#6366F1` Indigo):** *Kiralık Portföy*, *Kira Sözleşmesi*. Background: `#EEF2FF`, Border: `#C7D2FE`.

## Typography

The typographic hierarchy pairs the geometric clarity of **Plus Jakarta Sans** for section headers, portfolio titles, and financial statistics with the high-density legibility of **Inter** for data grids, client interaction logs, and forms.

### Rules of Usage
- **Financial & Numeric Data:** Tabular lining numbers (`tnum`, `cv01` enabled in CSS) must be enforced across all currency indicators, square meter values (`m²`), commission rates, and date stamps to preserve column alignment inside tables.
- **Turkish Diacritics:** Ensure standard font loading includes full latin-ext coverage with explicit rendering quality for dotless `ı`, dotted `İ`, `ğ`, and `ş`.
- **Title Case Convention:** In Turkish UI labels, standard lowercase transforms must utilize `locale: "tr"` to avoid converting `İ` to `i` improperly.

## Layout & Spacing

The layout is built upon an 8-point base spatial system using a responsive 12-column grid.

### Layout Model
- **Dashboard Shell:** Collapsible 260px fixed-width left navigation bar (`#172554`), pinned top operational search and user bar (64px height, `#FFFFFF`), and a fluid main content canvas framed in `#F8FAFC`.
- **Desktop (≥ 1280px):** 12 columns, 24px (`1.5rem`) gutters, 32px (`2rem`) page margin. Max content canvas width spans 1600px with centered alignment on ultra-wide screens.
- **Tablet (768px - 1279px):** 8 columns, 16px (`1rem`) gutters, 24px (`1.5rem`) margins. Side navigation collapses into an icon rail (72px) or off-canvas drawer.
- **Mobile (< 768px):** 4 columns, 12px gutters, 16px (`1rem`) canvas margins. Tables reflow into stacked listing cards.
- **Data Densities:** Spacing within tabular property registries defaults to compact vertical row padding (`space-sm` / 8px) with visual toggle capability for standard (`space-md` / 12px) viewing.

## Elevation & Depth

Visual hierarchy uses flat structural containment backed by subtle, slate-tinted ambient shadows. Avoid heavy dark shadows; depth must simulate real daylight cast onto flat architectural cardstock.

### Elevation Levels
- **Level 0 (Flat Canvas):** `#F8FAFC` background. Zero elevation. Separated from cards through color value and 1px borders.
- **Level 1 (Cards, Data Panels, Listing Rows):** Background `#FFFFFF`, border `1px solid #E2E8F0`, shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)`.
- **Level 2 (Hovered Cards, Kanban Tiles, Dropdown Menus):** Background `#FFFFFF`, border `1px solid #CBD5E1`, shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Modals, Flyout Quickviews, Lead Drawers):** Background `#FFFFFF`, border `1px solid #CBD5E1`, shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.
- **Backdrop Overlays:** `rgba(15, 23, 42, 0.45)` with `backdrop-filter: blur(4px)`.

## Shapes

The interface balances sharp corporate rigor with contemporary ergonomics using Level 2 roundedness.

### Application Rules
- **Standard Cards, Panels & Modals:** `rounded-lg` (12px / `0.75rem` or `1rem`) creates distinct visual bounding boxes without appearing overly casual.
- **Buttons, Form Inputs, Badges & Table Row Selections:** `rounded-md` (8px / `0.5rem`) ensures sharp vertical stack alignment inside tight forms and tables.
- **Status Chips & Pills:** Full rounded radius (`9999px`) is reserved strictly for listing state tags (*Satıldı*, *Kiralık*, *Pazarlık*) and agent avatars.
- **Icon Enclosures:** 8px rounded squares for secondary icon frames with subtle 5% background tints.

## Components

### Buttons
- **Primary:** Background `#172554`, text `#FFFFFF`, border transparent, radius 8px, padding `10px 18px`. Hover: `#1E3A8A`. Active: `#0F172A`. Focused: 3px ring of `rgba(59, 130, 246, 0.35)`.
- **Secondary / Action:** Background `#FFFFFF`, text `#0F172A`, border `1px solid #E2E8F0`, radius 8px. Hover: background `#F8FAFC`, border `#CBD5E1`.
- **Accent Action:** Background `#3B82F6`, text `#FFFFFF`. Hover: `#2563EB`. Used exclusively for primary transaction milestones (e.g., *Yeni Portföy Ekle*, *Sözleşme Oluştur*).
- **Destructive:** Background `#FEF2F2`, text `#EF4444`, border `1px solid #FECACA`. Hover: background `#FEE2E2`.

### Cards & Property Containers
- Built on `#FFFFFF` with `1px solid #E2E8F0` and Level 1 elevation.
- Must include a crisp 4px interior padding hierarchy between the hero property imagery, listing specifications (m², oda sayısı, tapu durumu), and pricing footers.
- Visual separation achieved through `1px solid #F1F5F9` dividing rules.

### Input Fields & Selectors
- Default: Height 42px, background `#FFFFFF`, border `1px solid #E2E8F0`, radius 8px, font size 14px (`#0F172A`), placeholder `#64748B`.
- Focus: Border `#3B82F6`, box-shadow `0 0 0 3px rgba(59, 130, 246, 0.15)`.
- Input Affixes: Dedicated currency symbol affixes (`₺` on the left) rendered in slate-500 with `#F8FAFC` background fill and border separation.

### Status Badges & Chips
- Padding: `4px 10px`, font size 12px, weight 500, radius `9999px`.
- Structure: Includes a 6px solid dot indicator aligned left of the status label:
  - *Aktif / Satıldı:* Emerald dot `#10B981`, background `#ECFDF5`, text `#065F46`.
  - *Pazarlık / Bekliyor:* Amber dot `#F59E0B`, background `#FFFBEB`, text `#92400E`.
  - *Kaybedildi / Pasif:* Rose dot `#EF4444`, background `#FEF2F2`, text `#991B1B`.
  - *Kiralık:* Indigo dot `#6366F1`, background `#EEF2FF`, text `#3730A3`.

### Data Grids & Tables
- Sticky header with `#F8FAFC` background, text in 12px uppercase `#64748B` with `letter-spacing: 0.05em`.
- Alternating or clean rows with bottom border `1px solid #F1F5F9`. Hover state invokes background `#F8FAFC` transition.
- Checkboxes: 18px rounded (4px radius), border `1.5px solid #CBD5E1`, filled `#172554` when checked.

### Domain-Specific Components
- **Currency Stat Callout:** Prominent card displaying total portfolio volume, active commissions, or closing totals with 26px Plus Jakarta Sans bold numbers, paired with positive/negative trend pills.
- **Deed & Legal Status Badge (*Tapu Durumu*):** Monochromatic outline tags (`Kat Mülkiyeti`, `Kat İrtifakı`, `Hisseli Tapu`) utilizing `#334155` text on `#F1F5F9` pill.
- **Agent Assignment Pill:** Micro avatar (20px) paired with the advisor's first and last name, enabling inline reassignment on pipeline views.