# Step 9 — Measurements

Tokenised values (colours, typography, spacing, radii) come from `get_variable_defs` — already written to `_variables.scss` in Step 3. This step covers the values that are NOT in Figma variables: per-element fixed widths/heights, gaps and paddings observed in the layout, and similar layout-specific numbers.

  ## Extract from Figma:

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
  - Store reusable values in `_variables.scss`.

  Do not hardcode numbers when a reusable token should exist.

# Step 10 — Responsive Behavior

## Use mobile-first approach.

## Breakpoints:

- 480px (mobile)
- 768px (tablet)
- 1024px (small desktop)
- 1440px (large desktop / Figma default frame)

## Rules:

- preserve Figma hierarchy
- preserve relative spacing logic
- do not break fixed-size elements unintentionally
- resize only where Figma/responsive structure suggests
- preserve exact desktop sizing when desktop frame is fixed

## Layout rules (MANDATORY — enforces RULE 16)

- Use **Flexbox** for linear (row or column) layouts.
- Use **CSS Grid** for two-dimensional layouts (multi-column forms, card grids).
- NEVER use `position: absolute` with `top`/`left`/`right`/`bottom` for layout positioning of any form element, button, or content block.
- `position: absolute` is only allowed for true overlays, decorative background layers, or icons that float on top of a parent image.

## Dimension rules (MANDATORY)

- Input fields: `width: 100%; max-width: <figma-width>px`
- Buttons: `width: 100%; max-width: <figma-width>px`
- Form container panels: `width: 100%; max-width: <figma-panel-width>px; padding-inline: <figma-horizontal-inset>`
- Column widths inside a grid: use `%` or `fr` units, not fixed `px` widths
- At `max-width: 480px`: all `max-width` caps become `width: 100%` with `padding-inline: 16px`

## Spacing rules (MANDATORY)

- All Figma `x / y` coordinates must be converted to `padding` or `margin` on the parent container.
- All Figma auto-layout gaps must be expressed as `gap` on the flex/grid parent.
- Prefer `padding-block` / `padding-inline` shorthand over four separate `top`/`right`/`bottom`/`left` values.
- Prefer `%` for horizontal padding of wide containers, `px` only for fixed gutters.

## Per-pattern responsive behavior (MANDATORY)

Mobile-first means: write the < 480px style as the base, then add `@media (min-width: <bp>)` blocks to widen for larger screens. Never write desktop-first then shrink with `@media (max-width: ...)`.

| Pattern | < 480px (mobile) | 480-767px | 768-1023px (tablet) | ≥ 1024px (desktop) |
|---|---|---|---|---|
| Page padding-inline | 16px | 16px | 24px | 32px or container max-width 1200px centered |
| Card width | 100% (with padding-inline) | 100% | max-width 600px, centered | max-width 800px, centered |
| Bottom nav | visible, fixed | visible, fixed | visible OR replace with side nav | replaced by header nav or side nav |
| Header height | 56-64px | 56-64px | 64-72px | 72-80px |
| Touch targets | min 44px × 44px | min 44px × 44px | min 40px × 40px | min 32px × 32px |
| Body font-size | 14-16px | 14-16px | 14-16px | 14-16px |
| Heading scale | smaller end of Figma scale | smaller end | mid | full Figma scale |
| List rows | full-width, single column | full-width, single column | grid `repeat(2, 1fr)` if Figma allows | grid `repeat(3, 1fr)` if Figma allows |
| Modal / dialog | full-screen sheet from bottom | full-screen sheet | centered, max-width 480px | centered, max-width 560-640px |
| Forms | single column, fields 100% wide | single column | single column or two-column based on Figma | match Figma desktop layout |
| Avatar group | horizontal scroll if overflow | horizontal scroll if overflow | wrap to multiple rows | wrap |

## Touch-target rule (MANDATORY at < 768px)

Every clickable element (button, icon-button, list-item with click, link) MUST have a minimum hit area of 44×44px on viewports < 768px. If the visual icon is smaller, add `padding` to the wrapper to reach 44px — do not change the icon size.

## Mandatory media query order

```scss
.block {
  // base = mobile (< 480px)

  @media (min-width: 480px) { /* small mobile + */ }
  @media (min-width: 768px) { /* tablet + */ }
  @media (min-width: 1024px) { /* desktop + */ }
  @media (min-width: 1440px) { /* large desktop + */ }
}
```

Never mix `min-width` and `max-width` queries in the same component without strong justification.


# Step 11 — Manual Visual Verification

### Verification Step — Build and manually check visual layouts.

---

### 11a — Build and Serve the Angular App

Run build first to verify zero errors:

```powershell
npx ng build --configuration development
```

Must exit with code 0. Fix all errors before continuing.

Then serve:

```powershell
npx ng serve --port 4201
```

Wait for "Application bundle generation complete" before proceeding.

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

#### 11b-3 — Material & Style Defaults Audit
- Ensure default Material component styles are overridden wherever they contradict the Figma layout design.
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

# Step 12 — Output

# Generate:

Angular CLI Command

`ng generate component features/<feature>/components/<component>`

## Files
- component.html
- component.scss / component.css
- component.ts
# Also include
 - Angular Material modules to import
 - common.scss updates
 - _variables.scss updates
 - _components.scss updates
 - list of strict overrides added
 - Final Verification Checklist

## Before delivering code, verify:

## Asset Verification
- list of all exported ico-* files
- their Figma node IDs
- their pixel dimensions
- visual verification completed
- SVG content matches icon purpose
## Layout Components
- header detected/generated
- sidebar detected/generated
- footer detected/generated
- main content generated
- layout assembly correct
## Configuration Check
- `angular.json` assets configuration is correct
- asset paths use `assets/images/ico-*.svg`
## Code Structure
- app.component.html contains only `<router-outlet />`
- all components are routed correctly
- no unused code/imports
## Design Accuracy
- token list matches Figma
- all measurements match Figma
- Material defaults are overridden
- typography matches exactly
- button dimensions match exactly
- image dimensions and placement match exactly
- spacing between elements matches exactly
## Build & Runtime
- no TypeScript errors
- no build errors
- no console warnings
- assets load correctly
## Visual Verification
- screenshot comparison completed
- no broken images
- no missing icons
- no layout shifts
- no obvious visual mismatch

## If visual comparison still shows meaningful mismatch, do not mark the task as complete.
