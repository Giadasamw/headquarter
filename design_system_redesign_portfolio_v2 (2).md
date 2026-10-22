# Portfolio Redesign — Design System v2
> editorial warmth on parchment · serif announces, grotesque speaks

**Theme:** light
**Status:** v2 — updated to match the approved homepage build. Where this document and the homepage code ever disagree, the homepage code wins.

## Changelog (v1 → v2)

- **Body/UI font replaced:** ABC Diatype Mono → **Bricolage Grotesque**. Every string that is not a serif heading is set in Bricolage Grotesque.
- **Type scale reduced:** display capped at **48px** (was 80px); all other headings at **40px**; card titles **24px**; body **16px**; captions **13px**.
- **Content max-width:** **70% of the viewport on desktop** (was fixed 1432px).
- **Gradients formalized:** the exact, hand-tuned gradient recipes from the homepage are now canonical (see Gradient Recipes).
- **Neutrals warmed:** canvas is now `#f7f5f2`, text `#242321`, borders `#d8d4ce`, secondary text `#56524d` (per homepage code).
- **Radii reduced:** cards max out at **32px** (was 40px); scale is 12 / 16 / 24 / 32. Buttons and tags remain full pills.
- **Body line-height:** 1.5 (was 1.35).
- **Functional blue updated:** `#315fd5`, currently used only as the focus ring. Primary buttons are dark (`#242321`), not blue.

The system keeps its editorial character — warm parchment canvas, serif headlines at weight 400, pill containers, hairline borders, pastel gradient washes as punctuation — but the voice of the body text is now Bricolage Grotesque: friendly, slightly quirky, still precise.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Parchment | `#f7f5f2` | `--color-parchment` | Page canvas and the majority of surface fills — the warm off-white IS the brand's signature surface; never pure white |
| Parchment Deep | `#f6f3f1` | `--color-parchment-deep` | Slightly deeper warm surface — used as the enquiry-card hover fill |
| Ink Warm | `#242321` | `--color-ink-warm` | Primary text, headings, and dark button fills — the warm near-black of the system |
| Graphite Warm | `#56524d` | `--color-graphite-warm` | Secondary text — body copy and sub-headings that need less weight than headlines |
| Ash Warm | `#d8d4ce` | `--color-ash-warm` | Hairline borders, dividers, inputs, and muted surfaces |
| Focus Blue | `#315fd5` | `--color-focus-blue` | Focus ring only. Do not use as a button fill — primary actions are Ink Warm |
| Sky Blue | `#a0b5eb` | `--color-sky-blue` | Secondary surface and decorative gradient stop (blue washes, text selection) |
| Coral | `#ff9473` | `--color-coral` | Accent — decorative gradient stop for the warm washes (hero, peach cards, enquiry panel) |
| Mint | `#a7fccd` | `--color-mint` | Supporting decorative accent when the core palette needs contrast |
| Gold | `#ecda98` | `--color-gold` | Decorative gradient stop — warm accent, never functional UI |
| Crimson | `#f37a0a` | `--color-crimson` | Decorative gradient stop — deep warm tone alongside gold and coral |

### Semantic mapping (shadcn tokens, as used in code)

```css
:root {
  color-scheme: light;
  --background: #f7f5f2;
  --foreground: #242321;
  --card: #f7f5f2;
  --card-foreground: #242321;
  --primary: #242321;
  --primary-foreground: #f7f5f2;
  --secondary: #a0b5eb;
  --secondary-foreground: #242321;
  --muted: #d8d4ce;
  --muted-foreground: #56524d;
  --accent: #ff9473;
  --accent-foreground: #242321;
  --border: #d8d4ce;
  --input: #d8d4ce;
  --ring: #315fd5;
  --radius: 1.5rem;
}
```

## Tokens — Typography

### Bricolage Grotesque — Body, navigation, buttons, badges, tags, and ALL UI strings · `--font-bricolage-grotesque`
- **Substitute:** system-ui sans stack
- **Weights:** 400, 500 (500 reserved for emphasized UI labels)
- **Sizes:** 13px, 16px, 24px (card titles when set in sans)
- **Line height:** 1.5 for body; 1.2 for labels and captions
- **Role:** Every string that is not a serif heading. Body copy, nav labels, buttons, badges, captions, meta text. In code it is mapped to both `--font-sans` and `--font-mono`.

### Untitled Serif — Display and heading type only · `--font-untitled-serif`
- **Fallback (currently active in code):** Georgia, Cambria, "Times New Roman", Times, serif
- **Weights:** 400 only — never bold; the serif's stroke contrast and -0.02em tracking carry the weight
- **Sizes:** 24px (card titles), 40px (all standard headings), 48px (largest heading / hero)
- **Line height:** 1.2
- **Letter spacing:** -0.02em at all sizes
- **Role:** Headlines, section titles, feature card titles, FAQ questions. The serif announces; the grotesque speaks.

### Type Scale

| Role | Size | Line Height | Token |
|------|------|-------------|-------|
| caption | 13px | 1.2 | `--text-caption` |
| body | 16px | 1.5 | `--text-body` |
| card-title | 24px | 1.2 | `--text-card-title` |
| heading | 40px | 1.2 | `--text-heading` |
| display | 48px | 1.2 | `--text-display` |

No text on the site exceeds 48px. All standard headings sit at 40px; only the single largest heading (hero) uses 48px.

## Tokens — Spacing & Shapes

**Base unit:** 8px

**Density:** comfortable

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 8 | 8px | `--spacing-8` |
| 16 | 16px | `--spacing-16` |
| 24 | 24px | `--spacing-24` |
| 32 | 32px | `--spacing-32` |
| 40 | 40px | `--spacing-40` |
| 64 | 64px | `--spacing-64` |
| 72 | 72px | `--spacing-72` |
| 80 | 80px | `--spacing-80` |

### Border Radius

| Token | Value |
|-------|-------|
| `--radius-sm` | 12px (0.75rem) |
| `--radius-md` | 16px (1rem) |
| `--radius-lg` | 24px (1.5rem) |
| `--radius-xl` / `--radius-2xl` / `--radius-3xl` | 32px (2rem) |

| Element | Value |
|---------|-------|
| cards | 32px |
| tags | 9999px (pill) |
| pills | 9999px |
| buttons | 9999px (pill) |

### Layout

- **Content max-width:** **70% of the viewport on desktop** (`max-width: 70vw` on the main content container; full width with standard padding on mobile)
- **Section gap:** 64px
- **Card padding:** 40px
- **Element gap:** 16px

### Base rules (from code)

```css
* { border-color: var(--border); outline-color: color-mix(in srgb, var(--ring) 50%, transparent); }
html { scroll-behavior: smooth; background: var(--background); }
body { font-size: 16px; line-height: 1.5; }
::selection { background: var(--secondary); color: var(--secondary-foreground); }
svg { stroke-width: 1.6; }
```

## Gradient Recipes (canonical — copy verbatim)

These gradients were hand-tuned on the homepage. Reuse them exactly; do not approximate or "improve" the stops, positions, or opacities.

```css
.service-card {
  background-color: color-mix(in srgb, var(--background) 92%, transparent);
  background-repeat: no-repeat;
}
.service-card-blue {
  background-image: radial-gradient(circle at 10% 100%, color-mix(in srgb, var(--secondary) 24%, transparent), transparent 58%);
}
.service-card-peach {
  background-image: radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--accent) 42%, transparent), transparent 58%);
}
.hero-panel {
  background-image: radial-gradient(circle at 50% 72%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 34%);
}
.enquiry-panel {
  background-color: color-mix(in srgb, var(--background) 88%, var(--secondary));
  background-image:
    radial-gradient(ellipse at 50% 16%, color-mix(in srgb, var(--accent) 68%, transparent), transparent 58%),
    linear-gradient(180deg, color-mix(in srgb, var(--accent) 42%, var(--background)) 0%, color-mix(in srgb, var(--secondary) 58%, var(--background)) 100%);
}
```

## Motion & Interaction (canonical — copy verbatim)

```css
.enquiry-card {
  transition:
    transform 500ms cubic-bezier(0.22, 1, 0.36, 1),
    background-color 500ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 500ms cubic-bezier(0.22, 1, 0.36, 1);
}
.enquiry-card:hover,
.enquiry-card:focus-visible {
  background-color: #f6f3f1;
  transform: translateY(-6px);
  box-shadow: 0 18px 36px -28px color-mix(in srgb, var(--foreground) 42%, transparent);
}
.cta-arrow {
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 300ms ease, transform 300ms ease;
}
.enquiry-card:hover .cta-arrow,
.enquiry-card:focus-visible .cta-arrow {
  opacity: 1;
  transform: translateY(0);
}
.gradient-shadow-button {
  box-shadow:
    0 8px 18px -12px color-mix(in srgb, var(--accent) 72%, transparent),
    0 5px 14px -12px color-mix(in srgb, var(--secondary) 76%, transparent);
}
.gradient-shadow-button:hover,
.gradient-shadow-button:focus-visible {
  transform: translateY(-2px);
  box-shadow:
    -8px 10px 22px -12px color-mix(in srgb, var(--accent) 88%, transparent),
    8px 10px 22px -12px color-mix(in srgb, var(--secondary) 90%, transparent);
}
```

**Motion principles:** hover lifts of -2px (buttons) to -6px (cards) with a soft easeOutQuint-style curve `cubic-bezier(0.22, 1, 0.36, 1)`; arrows fade-and-rise on hover; shadows are soft, negative-spread, and tinted with the palette (coral + sky) rather than plain black.

## Components

### Primary Pill Button (Dark)
**Role:** Primary conversion action

Ink Warm (`#242321`) fill, Parchment (`#f7f5f2`) text in Bricolage Grotesque, pill radius (9999px), 16px 32px padding. Primary actions are dark, not blue.

### Gradient Shadow Button
**Role:** Hero / featured CTA

Pill button carrying the `.gradient-shadow-button` coral + sky tinted shadow (see Motion & Interaction). On hover it lifts -2px and the shadow splits left-coral / right-sky.

### Ghost Pill Button
**Role:** Tertiary navigation action

Transparent fill, 1px Ink Warm border, Ink Warm text in Bricolage Grotesque, pill radius, 16px 32px padding.

### Service Card (Blue / Peach)
**Role:** Service or capability card with a corner gradient wash

Near-parchment translucent fill (`color-mix(in srgb, var(--background) 92%, transparent)`), 32px radius, 40px padding, 1px Ash Warm border. Corner radial wash: sky blue from bottom-left (blue variant) or coral from top-right (peach variant) — recipes in Gradient Recipes. Title in Untitled Serif 24px weight 400; body in Bricolage Grotesque 16px, Graphite Warm.

### Hero Panel
**Role:** First-screen headline area

Parchment background with the `.hero-panel` coral radial glow low-center. Headline in Untitled Serif at 48px weight 400, Ink Warm. Subtext in Bricolage Grotesque 16px, Graphite Warm, line-height 1.5. Content constrained to the 70% max-width container.

### Enquiry Panel & Enquiry Card
**Role:** Contact / call-to-action section

Panel: parchment blended toward sky blue with a strong coral ellipse at top and a coral→sky vertical wash (recipe in Gradient Recipes). Cards inside are interactive: they lift -6px on hover, warm to `#f6f3f1`, gain a soft tinted shadow, and reveal a rising arrow (`.cta-arrow`).

### Feature Card
**Role:** Content card with icon, title, description

Transparent or Parchment fill, 1px Ash Warm border, 32px radius, 40px padding. Title in Untitled Serif 24px weight 400, Ink Warm. Body in Bricolage Grotesque 16px, Graphite Warm. No static shadow.

### FAQ Accordion Item
**Role:** Expandable question/answer row

Full-width row, 40px vertical padding, 1px Ash Warm bottom border. Question in Untitled Serif 24px weight 400, Ink Warm. Trailing chevron (↓) 20px right-aligned.

### Navigation Bar
**Role:** Primary site navigation

Transparent or Parchment background, wordmark far left, nav links in Bricolage Grotesque, Ink Warm; primary pill button (dark) right-aligned. ~80px height, no visible border.

## Do's and Don'ts

### Do
- Use Untitled Serif at weight 400 for all headings — never bold; stroke contrast and -0.02em tracking do the work
- Use Bricolage Grotesque for all body copy, buttons, nav labels, badges, and UI text — it is the functional voice of the brand
- Keep the type scale flat and calm: 48px only for the single largest heading, 40px for everything else, 24px card titles, 16px body, 13px captions
- Constrain main content to 70% of the viewport on desktop
- Use Parchment `#f7f5f2` as the page canvas — never pure white
- Reuse the canonical gradient recipes verbatim — they are part of the brand, not decoration to be regenerated
- Use 1px Ash Warm (`#d8d4ce`) hairlines for borders and dividers
- Keep buttons and tags as full pills; cards at 32px radius

### Don't
- Never set headings in bold or 600+ weight
- Never exceed 48px for any text
- Never use pure white `#ffffff` as a page background
- Never use Focus Blue `#315fd5` as a button or surface fill — it is the focus ring only; primary actions are Ink Warm
- Never substitute another typeface for Bricolage Grotesque in body/UI text — the serif + grotesque pairing is the defining gesture
- Never regenerate, approximate, or "clean up" the gradient recipes — copy them exactly
- Never apply static drop shadows to cards — shadows appear only on interaction (hover lift), soft and palette-tinted
- Never use corner radii above 32px on cards or below full-pill on buttons
- Never introduce additional accent colors for UI — the pastels (Sky, Coral, Mint, Gold) are decorative only

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 1 | Parchment | `#f7f5f2` | Page canvas — fills the viewport |
| 2 | Parchment Deep | `#f6f3f1` | Interactive hover surface (enquiry cards) |
| 3 | Sky-tinted panel | `color-mix(in srgb, #f7f5f2 88%, #a0b5eb)` | Enquiry panel base before gradient washes |
| 4 | Ink Warm | `#242321` | Dark surface for primary buttons and inverted contexts |

## Typography Pairing Philosophy

The serif + grotesque pairing is the defining typographic gesture. Untitled Serif (falling back to Georgia in code) handles all hierarchical display text at weight 400 — editorial authority through letterform, never through weight. Bricolage Grotesque handles everything functional: body, navigation, buttons, badges, captions. The serif announces; the grotesque speaks — warm, a little characterful, always legible. The scale stays deliberately modest (48px ceiling) so the warmth of the canvas and the precision of the gradients carry the personality.

## Agent Prompt Guide

Quick Color Reference:
- text: `#242321` (Ink Warm)
- secondary text: `#56524d` (Graphite Warm)
- background: `#f7f5f2` (Parchment)
- border: `#d8d4ce` (Ash Warm)
- accent (decorative): `#ff9473` (Coral) and `#a0b5eb` (Sky Blue)
- primary action: `#242321` fill with `#f7f5f2` text (dark pill — no blue CTA)
- focus ring: `#315fd5`

Example Component Prompts:

1. Create a hero section on Parchment (`#f7f5f2`). Headline in Untitled Serif (Georgia fallback) at 48px weight 400, color `#242321`, letter-spacing -0.02em, line-height 1.2. Subtext in Bricolage Grotesque 16px, color `#56524d`, line-height 1.5. Apply the `.hero-panel` coral radial glow exactly as specified in the design system. Content max-width 70% of viewport.

2. Create a service card: translucent parchment fill (`color-mix(in srgb, var(--background) 92%, transparent)`), 1px `#d8d4ce` border, 32px radius, 40px padding. Corner radial wash per `.service-card-blue` or `.service-card-peach` recipe — copy verbatim. Title in Untitled Serif 24px weight 400 `#242321`; body in Bricolage Grotesque 16px `#56524d`.

3. Create a primary button: `#242321` fill, `#f7f5f2` text in Bricolage Grotesque, full-pill radius, 16px 32px padding. For featured CTAs add the `.gradient-shadow-button` tinted shadow and -2px hover lift, verbatim.

4. Create an FAQ row: full-width, 40px vertical padding, 1px `#d8d4ce` bottom border only. Question in Untitled Serif 24px weight 400 `#242321`; trailing ↓ chevron 20px.

## Quick Start

### CSS Custom Properties

```css
:root {
  color-scheme: light;

  /* Semantic (shadcn) */
  --background: #f7f5f2;
  --foreground: #242321;
  --card: #f7f5f2;
  --card-foreground: #242321;
  --primary: #242321;
  --primary-foreground: #f7f5f2;
  --secondary: #a0b5eb;
  --secondary-foreground: #242321;
  --muted: #d8d4ce;
  --muted-foreground: #56524d;
  --accent: #ff9473;
  --accent-foreground: #242321;
  --border: #d8d4ce;
  --input: #d8d4ce;
  --ring: #315fd5;
  --radius: 1.5rem;

  /* Palette */
  --color-parchment: #f7f5f2;
  --color-parchment-deep: #f6f3f1;
  --color-ink-warm: #242321;
  --color-graphite-warm: #56524d;
  --color-ash-warm: #d8d4ce;
  --color-focus-blue: #315fd5;
  --color-sky-blue: #a0b5eb;
  --color-coral: #ff9473;
  --color-mint: #a7fccd;
  --color-gold: #ecda98;
  --color-crimson: #f37a0a;

  /* Typography — Families */
  --font-bricolage-grotesque: 'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif;
  --font-untitled-serif: 'Untitled Serif', Georgia, Cambria, 'Times New Roman', Times, serif;

  /* Typography — Scale */
  --text-caption: 13px;
  --leading-caption: 1.2;
  --text-body: 16px;
  --leading-body: 1.5;
  --text-card-title: 24px;
  --leading-card-title: 1.2;
  --text-heading: 40px;
  --leading-heading: 1.2;
  --text-display: 48px;
  --leading-display: 1.2;
  --tracking-headings: -0.02em;

  /* Typography — Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;

  /* Spacing */
  --spacing-unit: 8px;
  --spacing-8: 8px;
  --spacing-16: 16px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-64: 64px;
  --spacing-72: 72px;
  --spacing-80: 80px;

  /* Layout */
  --content-max-width: 70vw; /* desktop; full width + padding on mobile */
  --section-gap: 64px;
  --card-padding: 40px;
  --element-gap: 16px;

  /* Border Radius */
  --radius-sm: 0.75rem;
  --radius-md: 1rem;
  --radius-lg: 1.5rem;
  --radius-xl: 2rem;
  --radius-2xl: 2rem;
  --radius-3xl: 2rem;
  --radius-cards: 2rem;
  --radius-pills: 9999px;
  --radius-buttons: 9999px;
  --radius-tags: 9999px;
}
```

### Tailwind v4 `@theme`

```css
@theme inline {
  --font-sans: var(--font-bricolage-grotesque);
  --font-mono: var(--font-bricolage-grotesque);
  --font-serif: Georgia, Cambria, 'Times New Roman', Times, serif;

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --radius-sm: 0.75rem;
  --radius-md: 1rem;
  --radius-lg: 1.5rem;
  --radius-xl: 2rem;
  --radius-2xl: 2rem;
  --radius-3xl: 2rem;
}
```
