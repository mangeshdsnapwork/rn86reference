<!-- Angular guideline analysis: Steps 2–12 (Analysis, Styling, Conversion, Layout, Assets, Structure, Measurements, Responsive, Visual Comparison, Output). Load with angular-guideline-mapping.md, angular-guideline-overrides.md, angular-guideline-qa.md for complete Angular implementation rules. -->

# Step 2 — UI Analysis (Angular Material Mapping)

Before generating UI, analyze the Figma design and map it to Angular Material components.

This step is BLOCKING — do not start writing code, styles, or token files until this analysis is complete and the output below has been produced.

## Analysis Rules

- Analyze UI from top to bottom
- Identify nearest Angular Material components
- Identify which Material components need heavy visual override
- Identify where plain HTML is required because Material has no equivalent
- Identify fixed-size elements that must not use auto sizing

## Allowed Component Categories

- Layout: Container, Grid list
- Navigation: Menu, Sidenav, Toolbar, Tabs
- Buttons & Indicators: Button, Icon, Progress bar, Spinner
- Popups: Dialog, Tooltip, Snackbar
- Inputs: Input, Select, Checkbox, Radio, Datepicker, Slider
- Data: Table, Paginator, Sort
- Lists: List, Selection list
- Common: Card, Chips, Divider, Expansion panel, Stepper

## For Each UI Section Provide

- Section name
- Recommended Angular Material component
- Why it fits
- Required or optional
- Whether exact visual override is needed
- Whether it is readonly
- If not exact match:
  - closest Material component
  - custom CSS required
  - possible wrapper adjustments required

## Output Format (MANDATORY)

1. Section-wise component mapping
2. Final Angular Material component list
3. Suggested Angular Material modules to import
4. List of components requiring strict override
5. List of fixed-size elements requiring exact dimension control

Do NOT generate code in this step.

---

# Step 2.5 — Component Classification (BLOCKING)

After mapping Figma sections to Angular Material components in Step 2, classify each section into ONE of three buckets. This decides where its files live and how it's reused.

## Three buckets

| Bucket | Purpose | Folder | Examples from a typical mobile dashboard |
|---|---|---|---|
| **Layout** | App-wide chrome that wraps every route or every authenticated route | `src/app/layout/` | Header, Footer, BottomNav, SideNav, AuthLayout, AppShell |
| **Shared** | Reusable presentational components used by 2+ features | `src/app/shared/components/` | Avatar, IconButton, EmptyState, LoadingSpinner, ErrorState, ListItemRow, AccountCard, TransactionRow, BalanceDisplay |
| **Feature** | Logic or layout that only exists inside this feature | `src/app/features/{featureName}/components/` | DashboardPage, the page-level container that composes the above |

## Classification heuristics

A section goes to **Layout** if:
- it appears on multiple pages of the app (header, footer, bottom nav, side nav)
- it is the page-level wrapper (auth shell, app shell)

A section goes to **Shared** if:
- the same visual pattern appears 2+ times in the same Figma frame (e.g. three transaction rows = one `TransactionRow` shared component, not three inline blocks)
- the same pattern is plausible in another feature (avatars, list rows, badge chips, status pills)
- it is a pure presentational component (no business logic, just `@Input()`-driven)

A section goes to **Feature** only if it is the page itself or genuinely one-off.

## Common-component checklist (verify before writing code)

For the current Figma frame, walk this checklist and mark each as Required / Not present:

| Pattern | Required if Figma has... |
|---|---|
| **Header** | A top bar with greeting, title, search, or notification icon — extract as `LayoutHeaderComponent` in `src/app/layout/header/` |
| **Footer** | A bottom bar with text/links — extract as `LayoutFooterComponent` in `src/app/layout/footer/` |
| **BottomNav** | A fixed bottom tab bar with 3+ items — extract as `LayoutBottomNavComponent` in `src/app/layout/bottom-nav/` |
| **SideNav** | A persistent left/right navigation panel — extract as `LayoutSideNavComponent` in `src/app/layout/side-nav/` |
| **Avatar** | Circular images or initials — extract as `AvatarComponent` in `src/app/shared/components/avatar/` |
| **IconButton** | Repeated icon-only buttons (3+ instances of the same shape) — extract as `IconButtonComponent` in `src/app/shared/components/icon-button/` |
| **ListItemRow** | Repeated rows with icon + title + subtitle + amount/value (e.g. transactions) — extract as `<DomainName>RowComponent` in `src/app/shared/components/<domain-name>-row/` |
| **Card** | Repeated card patterns (account card, summary card) — extract as `<DomainName>CardComponent` in `src/app/shared/components/<domain-name>-card/` |

## Output of this step

Produce a classification table BEFORE generating code:

```
| Figma section | Bucket | Component name | Folder |
|---|---|---|---|
| Top greeting + icons | Layout | LayoutHeaderComponent | src/app/layout/header/ |
| Account balance card | Shared | AccountCardComponent | src/app/shared/components/account-card/ |
| Transaction row (×3) | Shared | TransactionRowComponent | src/app/shared/components/transaction-row/ |
| Quick actions row | Shared | QuickActionButtonComponent | src/app/shared/components/quick-action-button/ |
| Avatar circle (×4) | Shared | AvatarComponent | src/app/shared/components/avatar/ |
| Bottom navigation | Layout | LayoutBottomNavComponent | src/app/layout/bottom-nav/ |
| Page composition | Feature | DashboardPageComponent | src/app/features/dashboard/components/dashboard-page/ |
```

## Rules

- Repeated visual patterns are NEVER inlined into the page component — they MUST be extracted into a shared component.
- Layout chrome is NEVER duplicated across pages — extract to `src/app/layout/` and compose in routes.
- A Figma frame that shows three transaction rows produces ONE `TransactionRowComponent` used three times via `*ngFor`, not three hardcoded `<div>` blocks.
- The page-level Feature component receives data and composes Shared + Layout components — it does NOT contain the visual primitives directly.

---

# Step 3 — Shared Styling System

This step decides where every CSS rule lives. Follow it strictly — most "messy CSS" complaints trace back to skipping this step and dumping everything into the component SCSS.

## Mandatory file structure

```
src/styles/
├── _variables.scss     ← design tokens (colours, spacing, typography, radii, shadows, z-index)
├── _typography.scss    ← typography mixins (h1, h2, body, caption, label) tied to tokens
├── _mixins.scss        ← reusable patterns (flex-center, truncate, card-base, button-reset, focus-ring)
├── _material.scss      ← Angular Material overrides (form-field, button, card, tabs, etc.)
├── _utilities.scss     ← optional utility classes (.u-mt-16, .u-flex-row) — only if used 3+ times
├── _reset.scss         ← minimal CSS reset / base element styles
└── common.scss         ← entry that @forwards the above
```

If any file is missing, create it. If present, append only — never duplicate existing rules.

## DRY-LIFT RULE (THE single most important rule for clean CSS)

If a value or pattern appears in **2 or more components**, it MUST be lifted to a shared file:

| Pattern | Lift to |
|---|---|
| Same colour value (`#1A8754`, `rgba(255,255,255,0.6)`) appearing twice | `_variables.scss` as a token |
| Same font-size + weight + line-height combination | `_typography.scss` as a mixin (`@mixin body-md`) |
| Same flex/grid layout snippet (e.g. `display: flex; align-items: center; gap: 12px;`) | `_mixins.scss` as a mixin |
| Same Material component override | `_material.scss` |
| Same border-radius + padding card shape | `_mixins.scss` as `@mixin card-base` |

After Step 8 (component generation), grep all component SCSS files. Any literal that appears in 2+ files is a violation — lift it.

## What MUST NOT be in component SCSS

A component's `.scss` file may ONLY contain:
- layout values specific to this component instance (e.g. `width: 343px; height: 56px;` for a one-off element)
- composition of shared mixins (`@include card-base; @include body-md;`)
- this-component-only variants

It MUST NOT contain:
- raw colour hex values — use tokens from `_variables.scss`
- raw font-size / font-weight / line-height triples — use a typography mixin
- Material overrides — those go in `_material.scss`
- reusable layout snippets — those go in `_mixins.scss`

## Component SCSS template

Every component SCSS file starts with:

```scss
@use 'styles/variables' as *;
@use 'styles/typography' as *;
@use 'styles/mixins' as *;

.component-block {
  // component-specific styles only
}
```

## File contents reference

### `_variables.scss`

The primary source is the `get_variable_defs` MCP tool — call it first and translate its output directly into SCSS variables. Fall back to scraping `get_design_context` only for tokens not bound to Figma variables.

Stores: colours, font families, font sizes, font weights, line heights, spacing scale, border radii, border widths, shadows, z-index scale, breakpoint values.

### `_typography.scss`

Defines mixins per Figma text style — never raw values in components:

```scss
@mixin display-lg { font: 600 32px/40px var(--font-sans); letter-spacing: -0.02em; }
@mixin heading-md { font: 600 20px/28px var(--font-sans); }
@mixin body-md    { font: 400 14px/20px var(--font-sans); }
@mixin label-sm   { font: 500 12px/16px var(--font-sans); letter-spacing: 0.04em; }
```

### `_mixins.scss`

Reusable patterns. Examples:

```scss
@mixin flex-center      { display: flex; align-items: center; justify-content: center; }
@mixin flex-row($gap: 0){ display: flex; align-items: center; gap: $gap; }
@mixin truncate         { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
@mixin card-base        { background: $surface; border-radius: $radius-md; padding: $space-4; }
@mixin button-reset     { all: unset; cursor: pointer; }
```

### `_material.scss`

Material component overrides — see RULE 19 hit-list. Examples:

```scss
.mat-mdc-button { letter-spacing: 0; text-transform: none; }
.mat-button-toggle-appearance-standard { border: none; }
.mat-pseudo-checkbox { display: none !important; }
```

### `_reset.scss`

Minimal element resets (margins on `h*`, default `button` styles, focus outlines).

### `common.scss`

```scss
@forward 'variables';
@forward 'typography';
@forward 'mixins';
@forward 'utilities';
@forward 'reset';
@forward 'material';
```

Imported once in `angular.json` styles array — every component then `@use`s the parts it needs.

---

# Step 4 — Optional CLI Helper

The bundled helper script `scripts/generate-ui.js` is a generic cross-target preparation helper. It validates required inputs, creates `reports/screenshots`, detects the likely stack, and prints the guideline path to load. It does not generate Angular files or any other UI code.

**The MCP-based flow is required.** This helper only prepares workflow metadata; it does not replace `get_design_context`, `get_variable_defs`, asset download, implementation, or screenshot comparison.

Helper usage:

`node scripts/generate-ui.js --figma-url <figma-url> --component <component-name> --feature <feature-name> --project-root <project-root> --target angular`

---

# Step 5 — Angular Material UI Conversion

Convert generated UI to Angular Material components.

## Strict Rules

- Do NOT change business logic
- Preserve:
  - `formGroup`
  - `formControlName`
  - `[(ngModel)]` only if already present in existing code that must be preserved
  - validators
  - `*ngIf`
  - `*ngFor`
  - event bindings
  - `routerLink`
  - `disabled`
  - `readonly`
  - `required`
- Keep existing class names where useful
- Maintain layout structure
- Override all Material defaults that cause mismatch

## Component Mapping

For the Figma-element → Angular Material mapping table, see **Step 1.5 → Component Mapping (with examples)** at the top of this file. Do not redefine the mapping here.

## Input Label Strategy (CRITICAL)

Inspect Figma before choosing label strategy.

### Case A — Label is above the input box
Use external label pattern.
Do NOT use `mat-label` inside `mat-form-field` if it causes mismatch.

### Case B — Label is inside the input border
Use `mat-label` with strict override.

If required marker duplicates:
- disable Material required marker
- follow Figma exactly

## If exact UI is not possible

- keep structure intact
- document the reason
- apply closest visual result
- state what needs custom CSS/CDK

---

# Step 6 — Layout Detection and Common Sections

Detect and generate all layout sections if present:
- header
- sidebar
- footer
- main content

If detected, generate them separately.

Do not skip layout sections.

---

# Step 7 — Assets

Download EVERY Figma MCP asset returned by `get_design_context` to project-local paths. This includes icons, logos, illustrations, decorations, and any other image assets — not just `ico-*` layers.

## Rules
- download every asset URL returned by `get_design_context` (icons, logos, illustrations, decorations)
- save to `src/assets/figma/` using the **original hash filename** — do NOT rename to generic names like `logo.png`
- ignore non-image layout wrappers (frames, groups) — those are not assets
- never inline exported SVG into the template
- apply exact Figma width and height to every `<img>` element

## RULE — NO MATERIAL ICON SUBSTITUTION (HARD BAN)

Every glyph visible in Figma — eye, three-dots menu, QR code, send arrow, plus, search, bell, chevron, anything — MUST be sourced from one of these two places, in this order:

1. **Exported MCP asset** at `localhost:3845/assets/<hash>.<ext>` — download to `src/assets/figma/<hash>.<ext>` and use as `<img src="assets/figma/<hash>.<ext>" width="..." height="..." alt="..." />`.
2. **Inline SVG verbatim from `get_design_context` output** — when Figma returns the icon as inline SVG markup rather than a URL. Copy the `<svg>` element as-is into the template; do not redraw, do not simplify paths.

`mat-icon` is FORBIDDEN unless ALL of the following are true:
- the project already imports `MatIconModule` and a Material Icons font globally (verify in `angular.json` styles + `app.config.ts`)
- the Figma layer name explicitly references a Material Design Icon by its exact ligature (e.g. `mat:home`, `mat:search`)
- the rendered glyph is visually identical to the Material Icons font version

If any of these is false, `mat-icon` is a guess. Use the exported asset.

### Common substitution mistakes (DO NOT make these)

| Figma glyph | Wrong (Material guess) | Correct |
|---|---|---|
| Eye / visibility toggle | `<mat-icon>visibility</mat-icon>` or `<mat-icon>radio_button_checked</mat-icon>` | exported `<img src="assets/figma/<hash>.svg">` |
| Three horizontal dots `•••` | `<mat-icon>more_horiz</mat-icon>` (or `more_vert`) | exported `<img>` of the dots |
| QR code | `<mat-icon>qr_code_scanner</mat-icon>` | exported `<img>` of the Figma QR glyph |
| Bell / notification | `<mat-icon>notifications</mat-icon>` | exported `<img>` |
| Search / magnifier | `<mat-icon>search</mat-icon>` | exported `<img>` |
| Send arrow / paper-plane | `<mat-icon>send</mat-icon>` or `arrow_forward` | exported `<img>` |
| Plus / add | `<mat-icon>add</mat-icon>` | exported `<img>` (unless verbatim Material `add`) |

Asset folder: `src/assets/figma/`
Reference path in code: `assets/figma/<hash>.<ext>`

## RULE — NEVER USE `localhost:3845` URLS IN FINAL CODE (MANDATORY)

The Figma MCP server temporarily hosts assets at `http://localhost:3845/assets/<hash>.*`.
These URLs **only work while Figma desktop is open**. They will break in all other environments.

**IMMEDIATELY after `get_design_context`, download every asset and replace all references.**

Windows PowerShell:
```powershell
New-Item -ItemType Directory -Force -Path "src/assets/figma" | Out-Null
Invoke-WebRequest -Uri "http://localhost:3845/assets/<hash>.svg" -OutFile "src/assets/figma/<hash>.svg"
```

macOS / Linux:
```bash
mkdir -p src/assets/figma
curl -o src/assets/figma/<hash>.svg http://localhost:3845/assets/<hash>.svg
```

Use the **original hash filename as-is**. Do NOT rename. Renaming creates drift between the MCP output and the local file system.

Replace every `http://localhost:3845/...` src with `assets/figma/<hash>.<ext>` before delivering.
Final code must contain **zero** `localhost:3845` references.

Above the constants block in the component, add the comment:
```typescript
// Assets downloaded from Figma Desktop MCP — paths are project-local.
```

---

# Step 8 — Angular Structure

Generate components per the classification produced in Step 2.5. Do NOT dump everything into a single feature folder — that is the root cause of "common components not extracted" complaints.

## Three-bucket folder routing

| Bucket | Folder pattern | When |
|---|---|---|
| **Layout** | `src/app/layout/<name>/` | Header, footer, bottom-nav, side-nav, app-shell |
| **Shared** | `src/app/shared/components/<name>/` | Avatar, IconButton, ListItemRow, Card patterns reused 2+ times |
| **Feature** | `src/app/features/{featureName}/components/<name>/` | Page-level container that composes Layout + Shared |

`featureName` comes from the user input collected in `SKILL.md` Step 1.

## Files per component (every bucket)

For every entry in the Step 2.5 classification table, generate:
- `<name>.component.ts`
- `<name>.component.html`
- `<name>.component.scss`
- `<name>.component.spec.ts`

All Shared and Layout components are **standalone**, **presentational**, and accept inputs via `@Input()`. They contain no business logic, no service calls, no router navigation triggers — those belong in the Feature page.

## Generation order

1. Layout components first (header, footer, bottom-nav)
2. Shared components next (avatar, list rows, cards)
3. Feature page last — it imports and composes the above

## Feature page composition example

→ See examples/platform-code-examples.md — ## Angular: Feature Page Composition Example

## Routing

Add the Feature page as a lazy-loaded route:

```typescript
{
  path: '<feature-route>',
  loadComponent: () =>
    import('./features/<featureName>/components/<page-component>/<page-component>.component')
      .then(m => m.<PageComponent>Component)
}
```

Layout and Shared components are imported directly by their consumers (Feature pages). Do NOT add them to `app.routes.ts`.

## app.component.html cleanup

It must contain only:

```html
<router-outlet />
```

Remove:
- hardcoded headers
- sample content
- unused wrappers
- placeholder markup

If app-wide layout chrome (header/footer) needs to wrap every authenticated route, create an `AuthLayoutComponent` in `src/app/layout/auth-layout/` and use it as the parent route. Do NOT hardcode chrome into `AppComponent`.

