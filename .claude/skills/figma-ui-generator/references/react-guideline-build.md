# Step 9 — Measurements

### Extract from Figma:
- width
- height
- font-size
- font-weight
- line-height
- letter-spacing
- colors with opacity
- border
- border radius
- shadows
- padding
- margins
- gaps
- image dimensions
- icon dimensions
- button dimensions
- input dimensions

### Store reusable values in:
- Tailwind theme extension (`tailwind.config.js`)
- SCSS variables (`src/styles/_variables.scss`)
- token files

Do not hardcode numbers when a reusable token should exist.

---

# Step 10 — Responsive Behavior

Use mobile-first approach.

Breakpoints:
- 480px (mobile)
- 768px (tablet)
- 1024px (small desktop)
- 1440px (large desktop / Figma default frame)

### Rules:
- preserve Figma hierarchy
- preserve relative spacing logic
- do not break fixed-size elements unintentionally
- resize only where Figma/responsive structure suggests
- preserve exact desktop sizing when desktop frame is fixed

### Layout rules (MANDATORY — enforces RULE 16)

- Use **Flexbox** for linear (row or column) layouts.
- Use **CSS Grid** for two-dimensional layouts (multi-column forms, card grids).
- NEVER use `position: absolute` with `top`/`left`/`right`/`bottom` for layout positioning of any form element, button, or content block.
- `position: absolute` is only allowed for true overlays, decorative background layers, or icons that float on top of a parent image.

### Dimension rules (MANDATORY)

- Input fields: `w-full max-w-[<figma-width>px]` (Tailwind) or `width: 100%; max-width: <figma-width>px` (SCSS)
- Buttons: `w-full max-w-[<figma-width>px]` (Tailwind) or `width: 100%; max-width: <figma-width>px` (SCSS)
- Form container panels: `width: 100%; max-width: <figma-panel-width>px; padding-inline: <figma-horizontal-inset>`
- Column widths inside a grid: use `%` or `fr` units, not fixed `px` widths
- At `max-width: 480px`: all `max-width` caps become `width: 100%` with `padding-inline: 16px`

### Spacing rules (MANDATORY)

- All Figma `x / y` coordinates must be converted to `padding` or `margin` on the parent container.
- All Figma auto-layout gaps must be expressed as `gap` on the flex/grid parent (Tailwind: `gap-[<value>]`).
- Prefer `padding-block` / `padding-inline` shorthand over four separate `top`/`right`/`bottom`/`left` values.
- Prefer `%` for horizontal padding of wide containers, `px` only for fixed gutters.

### Per-pattern responsive behavior (MANDATORY)

Mobile-first means: write the < 480px Tailwind utilities as the base, then add `sm:`, `md:`, `lg:`, `xl:` prefixes to widen for larger screens. Never write desktop-first then shrink.

| Pattern | < 480px (mobile) | 480-767px (sm) | 768-1023px (md) | ≥ 1024px (lg) |
|---|---|---|---|---|
| Page padding-inline | `px-4` (16px) | `px-4` | `px-6` (24px) | `px-8` or container `mx-auto max-w-[1200px]` |
| Card width | `w-full` (with px) | `w-full` | `max-w-[600px] mx-auto` | `max-w-[800px] mx-auto` |
| Bottom nav | visible, `fixed bottom-0` | visible | visible OR replaced by side nav | replaced by header nav or side nav |
| Header height | `h-14` to `h-16` | `h-14`-`h-16` | `h-16`-`h-18` | `h-18`-`h-20` |
| Touch targets | min `h-11 w-11` (44px) | min 44px | min `h-10 w-10` | min `h-8 w-8` |
| Body font-size | `text-sm` to `text-base` | same | same | same |
| Heading scale | smaller end of Figma | smaller end | mid | full Figma scale |
| List rows | single column, `w-full` | single column | `grid grid-cols-2` if Figma allows | `grid grid-cols-3` if Figma allows |
| Modal / dialog | full-screen sheet | full-screen | centered, `max-w-[480px]` | centered, `max-w-[560px]`-`max-w-[640px]` |
| Forms | single column | single column | single OR two-column based on Figma | match Figma desktop |
| Avatar group | horizontal scroll on overflow | horizontal scroll | wrap | wrap |

### Touch-target rule (MANDATORY at < 768px)

Every clickable element MUST have a minimum hit area of 44×44px on viewports < 768px. If the visual icon is smaller, add `padding` to the wrapper to reach 44px — do not change the icon size. Tailwind: wrap with `p-3` or `p-2.5` to bring an icon up to a 44px target.

### Use:
- Tailwind responsive utilities (`sm:`, `md:`, `lg:`, `xl:`) in mobile-first order
- wrapper structure that matches Figma auto-layout

---

## CSS organization (MANDATORY for any non-Tailwind styles)

Tailwind handles most styling. Custom CSS (when needed) follows these rules.

### File structure

```
src/styles/
├── _variables.scss     ← design tokens (colours, spacing, typography, radii, shadows)
├── _typography.scss    ← typography mixins tied to tokens
├── _mixins.scss        ← reusable patterns (flex-center, truncate, card-base)
├── _utilities.scss     ← optional utility classes (only if used 3+ times)
└── globals.scss        ← entry that @forwards the above
```

### DRY-LIFT rule

If a value or pattern appears in **2 or more component SCSS files** (or as Tailwind arbitrary values like `bg-[#1A8754]` in 2+ JSX files), it MUST be lifted:

| Pattern | Lift to |
|---|---|
| Same colour value appearing in 2+ files | `tailwind.config.ts` `theme.extend.colors` AND/OR `_variables.scss` |
| Same font-size + weight + line-height combination | `tailwind.config.ts` `theme.extend.fontSize` (returns `[size, { lineHeight, fontWeight }]`) AND/OR `_typography.scss` mixin |
| Same flex/grid layout snippet | extract to a Tailwind component class via `@apply` in `globals.scss`, OR a `_mixins.scss` mixin |
| Same border-radius + padding card shape | Tailwind `@apply` component class |

### What MUST NOT be in a component

A component's JSX MUST NOT contain:
- raw colour hex values inside Tailwind arbitrary syntax (`bg-[#1A8754]`) repeated 2+ times — add to `tailwind.config.ts`
- the same set of 5+ utility classes repeated 3+ times — extract a Tailwind component via `@apply` or a real React component

A component's `.scss` file (when used) MUST NOT contain:
- raw colour hex values — use tokens
- raw font-size / font-weight / line-height triples — use a typography mixin
- reusable layout snippets — use mixins

---

## RULE — BEM CLASS NAMING (MANDATORY)

When a component uses real CSS class names (i.e. an SCSS file or `className="..."` for non-utility classes), names MUST follow BEM (Block — Element — Modifier).

### Format

```
.block                  ← the component itself (matches component name in kebab-case)
.block__element         ← a part of the component
.block--modifier        ← a variant of the whole block
.block__element--modifier
```

### Naming rules

- All names are **kebab-case**.
- Element separator is `__`. Modifier separator is `--`.
- Names must be **semantic** — describe what the element IS, not what it LOOKS like.
  - YES: `.transaction-row__amount`, `.transaction-row__amount--debit`
  - NO: `.red-text`, `.big-bold`, `.div-1`, `.wrapper`, `.container-2`
- Generic helpers (`.wrapper`, `.container`, `.inner`, `.content`) are forbidden — replace with the BEM element name.

### Verification

After writing the JSX, scan for forbidden class patterns. Both must return zero matches:

```bash
grep -rnE 'className="(wrapper|container|inner|content|left|right|top|bottom|red|blue|green|big|small|bold|grey|gray)\b' \
  src/features src/shared src/layout --include="*.tsx"
grep -rnE 'className="(div|section|block)-?[0-9]' \
  src/features src/shared src/layout --include="*.tsx"
```

(For arbitrary Tailwind class strings the rule does not apply — Tailwind utility names are exempt. The rule applies to your own custom class names.)

---

# Step 11 — Manual Visual Verification

### Verification Step — Build and manually check visual layouts.

---

### 11a — Build and Serve the React App

Run build first to verify zero errors:

```bash
npm run build
```

Must exit with code 0. Fix all errors before continuing.

Then serve:

```bash
npm run dev -- --port 4201
```

Wait for the dev server ready message before proceeding.

---

### 11b — Manual Verification and Review

> **This step is MANDATORY.**
> You MUST run the application and visually inspect the rendered UI, comparing it against the source design before marking the task complete.

#### 11b-1 — Visual Inspection
- Open the component in your browser or local dev server (e.g. `http://localhost:4201/<component-route>`).
- Compare the rendered output next to the Figma design/screenshot and evaluate layout correctness.

#### 11b-2 — Layout & Responsive Audit
Inspect the layout at standard viewport widths (e.g., 360px, 480px, 768px, 1024px, 1440px) to verify responsive scaling:
- No horizontal scroll (unless Figma explicitly designs it).
- No text clipping or overlap.
- Touch targets ≥ 44px on smaller mobile viewports.
- Absolute positioning check: Ensure `position: absolute` is only used for decorative layers or overlay popups. Form fields, buttons, and content blocks MUST be laid out using Flexbox or Grid.

#### 11b-3 — Style Audit
- Verify color, typography, spacing, and border-radius match design tokens.

---

### 11c — Save Verification Report

Document your manual verification in:
```
reports/<component>-report.md
```

Include:
- Reference layout details.
- Mismatch log describing any adjustments made during implementation.
- Verification status (PASS/APPROVED).

---

### 11d — Final State After Manual Pass

After verification, ensure the following files exist:
```
reports/<component>-report.md                   ← Verification report with PASS verdict
```
*(Optional: If reference or generated screenshots are captured manually, they can be saved to `reports/screenshots/` for review.)*

Do not finalize if any layout errors or compilation warnings remain.
