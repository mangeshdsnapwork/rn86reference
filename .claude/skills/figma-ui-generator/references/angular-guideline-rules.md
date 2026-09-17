# ANGULAR MATERIAL OVERRIDE SYSTEM (CRITICAL - BLOCKER FIX)

## ROOT PROBLEM

Angular Material applies default styles that often break pixel-perfect output.

Examples of problems:
- wrong input height
- wrong button size
- incorrect border radius
- default line-height mismatch
- wrong internal padding
- incorrect font scaling
- wrong image placement because of wrapper spacing
- button label spacing mismatch

Therefore:

## RULE 1 — MATERIAL IS FOR STRUCTURE, ACCESSIBILITY, AND BEHAVIOR ONLY

Angular Material must be used for:
- accessibility
- structure
- component behavior
- keyboard/focus handling

Angular Material must NOT be treated as the visual source of truth.

All visual styling must come from Figma.

---

## RULE 2 — OVERRIDE ALL MATERIAL DEFAULTS

For every Angular Material component used, override all default visual properties to match Figma exactly.

Mandatory override list:
- width
- height
- min-height
- max-height
- padding
- margin
- gap
- border-radius
- border
- box-shadow
- background
- font-size
- font-weight
- line-height
- letter-spacing
- icon size
- label spacing
- internal wrapper spacing

Never rely on default Material sizes.

### RULE 2A — ALL MATERIAL INTERNAL SELECTOR OVERRIDES MUST USE `!important`

Any CSS property targeting an Angular Material or MDC internal class **MUST** include `!important`.

This is mandatory because MDC/Material internal rules carry higher specificity than a single custom class selector. Without `!important`, MDC rules will silently win.

**Rule:** If the selector starts with `.mat-`, `.mdc-`, or `.mat-mdc-`, every property declaration inside it **must** end with `!important`.

---

## RULE 3 — REMOVE MATERIAL INTERNAL SPACING

Angular Material often injects internal spacing that causes mismatch.

You MUST inspect and override:
- `.mat-mdc-form-field`
- `.mat-mdc-text-field-wrapper`
- `.mat-mdc-form-field-infix`
- `.mat-mdc-form-field-subscript-wrapper`
- `.mat-mdc-button-touch-target`
- `.mat-mdc-button-persistent-ripple`
- `.mdc-text-field`
- `.mdc-button`
- `.mdc-notched-outline`
- `.mat-icon`
- `.mat-mdc-card`
- `.mat-mdc-radio-button`
- `.mat-mdc-checkbox`

Default padding/margins must be removed when they cause visual mismatch.

Examples:
- remove extra input infix padding
- remove button touch target expansion if it changes height
- reset min-height
- reset internal outline offsets

---

## RULE 4 — EXACT DIMENSION ENFORCEMENT

Every visible element must match Figma dimensions exactly.

Extract and apply:
- width
- height
- x/y alignment
- spacing between siblings
- container padding
- row/column gaps
- image dimensions
- icon dimensions
- button dimensions
- input dimensions

No rounding of values unless the Figma value itself is rounded.

Do NOT use:
- approximate width
- auto height when fixed height exists in Figma
- default Material heights
- generic spacing scale not derived from Figma

---

## RULE 5 — TYPOGRAPHY LOCK

Typography must be copied exactly from Figma and must override Angular Material typography.

Extract and apply:
- font-family
- font-size
- font-weight
- line-height
- letter-spacing
- text-transform
- text color
- text alignment

This applies to:
- labels
- placeholders
- input text
- button text
- card titles
- section headings
- body text
- helper text
- error text

Do NOT allow Material typography defaults to alter font rendering.

---

## RULE 6 — BUTTON STRICT CONTROL

Buttons must match Figma exactly in:

- width
- height
- min-width
- padding
- border-radius
- font-size
- line-height
- font-weight
- label alignment
- icon/text spacing
- background color
- border color
- shadow

If Figma button is fixed size, do not allow Material auto-sizing.

If Figma button text is centered with exact padding, that exact padding must be applied.

---

## RULE 7 — INPUT AND FORM FIELD STRICT CONTROL

Inputs must match Figma exactly in:

- field height
- field width
- label placement
- label spacing
- placeholder style
- border thickness
- border color
- hover border color
- focused border color
- corner radius
- prefix/suffix icon position
- supporting/error text spacing

If Figma label is outside the box, use external label pattern.
Do not force `mat-label` when it visually breaks the design.

If required marker duplicates because of Material behavior, disable Material required marker and follow Figma exactly.

---

## RULE 8 — IMAGE STRICT CONTROL

Images must not be left to browser auto-scaling.

Always apply:
- exact width
- exact height
- exact positioning
- exact border radius if present
- `object-fit` based on Figma behavior
- wrapper alignment rules from Figma

Do not let image size be determined by default flex behavior or inherited CSS.

---

## RULE 9 — ICON STRICT CONTROL

Icons must use exact dimensions from Figma.

If icon is an exported asset:
- use exact asset file
- use exact width and height
- use exact placement and gap

Do not replace Figma icons with Material icons unless the design explicitly uses Material icons.

Never resize icons approximately.

---

## RULE 10 — SPACING SYSTEM LOCK

Spacing must be taken only from Figma.

This includes:
- margin
- padding
- gap
- row spacing
- column spacing
- text-to-input spacing
- label-to-field spacing
- button-to-button spacing
- image-to-text spacing

Do not use random spacing values.
Do not rely on Material layout spacing.
Do not introduce convenience spacing.

### Percentage vs Pixel preference for spacing

When the Figma frame is a **fluid / responsive container**, prefer `%` over `px` for:
- widths of inputs, buttons, and cards (e.g. `width: 100%` or `max-width: 400px`)
- horizontal padding expressed as `%` of the parent container
- gaps that scale proportionally with the viewport

Only use `px` for:
- values that must remain fixed regardless of viewport (e.g. icon sizes, border widths, fixed-height toolbars)
- values explicitly fixed in Figma with no responsive intent

Prefer `max-width` + `width: 100%` over a single fixed `px` width for inputs and buttons to allow shrinkage on smaller viewports.

---

## RULE 11 — BORDER AND RADIUS ACCURACY

All borders and radii must match Figma exactly.

Extract and apply:
- border width
- border style
- border color
- radius per corner if needed

Do not use default outlined Material border styles unless they visually match exactly after override.

---

## RULE 12 — SHADOW AND SURFACE ACCURACY

Where Figma uses elevation or shadow:
- extract exact shadow values
- apply them directly
- do not use default Material elevation tokens if they differ visually

Surface/background colors must also match exactly.

---

## RULE 13 — DO NOT STOP AT FIRST GENERATED OUTPUT

The first generated output is not final.

After generation:
1. compare against Figma
2. detect mismatches
3. fix mismatches
4. re-check until the output is visually very close

Target:
- at least 95% visual match
- especially for spacing, sizing, typography, button styles, images, and field appearance

---

## RULE 14 — COMPONENT-LEVEL QA CHECK

Before finalizing any component, verify:

### Inputs
- exact height
- exact label position
- exact internal padding
- exact border and radius
- exact placeholder style

### Buttons
- exact width/height
- exact label size
- exact font weight
- exact radius
- exact spacing

### Images
- exact dimensions
- exact alignment
- no stretching
- no unintended cropping

### Text
- exact font-size
- exact line-height
- exact color
- exact spacing above/below

### Layout
- exact gaps
- exact alignment
- no extra wrapper spacing
- no missing sections

---

## RULE 15 — FAIL CONDITIONS

The output should be treated as incomplete if any of these happen:

- Material default height is used instead of Figma height
- Button size differs visibly from Figma
- Input border-radius differs from Figma
- Text font-size or line-height differs from Figma
- Images are stretched, misplaced, or auto-scaled incorrectly
- Spacing between elements does not match Figma
- Material wrappers create extra space
- Icons use wrong size or wrong asset
- Visual comparison shows obvious mismatch
- Absolute positioning (`position: absolute` with `top`/`left`/`right`/`bottom`) used where Flexbox or Grid would suffice
- Fixed `px` widths used on responsive elements (inputs, buttons) where `%` / `max-width` is appropriate
- Plain `<select>` used instead of `mat-select` inside `mat-form-field`
- Plain `<input>` used as standalone instead of `matInput` inside `mat-form-field`
- Plain `<button>` group used for toggles instead of `mat-button-toggle-group`
- Plain `<button>` used for action buttons instead of `<button mat-flat-button>` / `<button mat-stroked-button>`
- Plain `<div>` used as a card container instead of `mat-card`
- Custom slider (`<div>` track + `<input type="range">`) used instead of `mat-slider`
- Plain `<nav>` / `<header>` / `<div>` used as toolbar instead of `mat-toolbar`
- A Material module is imported in the NgModule but its directive/component is never applied in the HTML template
- `<input type="range">` used for sliders — must be replaced with `mat-slider` + `matSliderThumb`

---

## RULE 16 — NO ABSOLUTE POSITIONING FOR LAYOUT (MANDATORY)

### BANNED — Do NOT use `position: absolute` / `top` / `left` / `right` / `bottom` for element layout.

Absolute positioning breaks responsiveness, causes overflow on smaller viewports, and makes maintenance extremely difficult.

### REQUIRED layout approach

| Figma pattern | Required CSS approach |
|---|---|
| Horizontal row of elements | `display: flex; flex-direction: row; gap: <Figma gap>` |
| Vertical stack of elements | `display: flex; flex-direction: column; gap: <Figma gap>` |
| Two-column layout | `display: flex;` or `display: grid; grid-template-columns: <w1> <w2>` |
| Centered content | `display: flex; justify-content: center; align-items: center` |
| Card with internal padding | `padding: <top> <right> <bottom> <left>` from Figma — never `top`/`left` offsets |
| Form fields in a column | `display: flex; flex-direction: column; gap: <field-gap>` |
| Sticky header/footer | `position: sticky; top: 0` or `position: fixed` only for true viewport-anchored elements |
| Overlay / modal | `position: fixed` is acceptable ONLY for true overlay layers |

### Rules
- Convert every Figma `x / y` coordinate into **padding or margin** relative to its parent container.
- Convert every Figma frame gap into `gap` on the flex/grid parent.
- Use `max-width` + `width: 100%` for inputs and buttons so they shrink on mobile.
- Use `%` widths for columns and panels where the Figma frame scales responsively.
- Use `px` only for values that are intentionally fixed (icon size, border width, fixed toolbar height).
- If a design uses a fixed-size canvas (e.g. 1440 × 1080 desktop), still implement the page using flex/grid and let the browser scroll — do not pin elements by absolute pixel offsets.

### Conversion cheat-sheet

```scss
//  BANNED — absolute pixel offsets
.element {
  position: absolute;
  top: 231px;
  left: 100px;
}

//  REQUIRED — flex parent with padding/gap
.parent {
  display: flex;
  flex-direction: column;
  padding: 231px 0 0 100px; // use Figma spacing as padding on the parent
  gap: 24px;                 // Figma gap between children
}

//  REQUIRED — responsive input / button
.form-field {
  width: 100%;
  max-width: 400px; // Figma fixed width becomes a max-width cap
}
```

### Responsiveness rules for inputs and buttons
- All `mat-form-field` wrappers must have `width: 100%` on the host element.
- All buttons must have at minimum `width: 100%; max-width: <figma-width>px`.
- Containers holding inputs/buttons must use `padding-left` + `padding-right` (or `padding-inline`) derived from Figma to control horizontal inset — never `left: Xpx` on the field itself.
- At `max-width: 480px` (mobile), all fixed max-widths should collapse to `width: 100%` with appropriate side padding.

---

## RULE 17 — TEMPLATE COMPLIANCE ENFORCEMENT (MANDATORY — BLOCKING)

### The HTML template is the CONTRACT. Importing a module is NOT enough.

After writing the HTML template and before building, perform a self-audit by scanning the template line-by-line against this checklist. **Any unchecked item is a BLOCKING violation.**

### Template self-audit checklist

| Check | How to verify | Pass condition |
|---|---|---|
| Every `<select>` replaced | Search template for `<select` | Zero hits |
| Every standalone `<input>` replaced | Search for `<input` not preceded by `matInput` | Zero hits |
| Every plain `<button>` for toggles replaced | Search for `class=".*tab.*"` or `class=".*toggle.*"` on `<button>` | Zero hits |
| Every action `<button>` has a mat directive | Search for `<button` without `mat-flat-button` / `mat-stroked-button` / `mat-icon-button` | Zero hits |
| Every card `<div>` replaced | Search for `class=".*card.*"` on `<div>` | Zero hits |
| Custom slider removed | Search for `type="range"` | Zero hits |
| Every `mat-form-field` has `appearance` | Search for `<mat-form-field` without `appearance=` | Zero hits |
| All `mat-button-toggle-group` bound | Search for `<mat-button-toggle-group` without `[(ngModel)]` or `formControl` | Zero hits |

### How to run the audit

Run these checks against the finished template before building. Every command must return zero matches.

Windows PowerShell:
```powershell
$file = "src/app/features/<feature>/components/<component>/<component>.component.html"

Select-String -Path $file -Pattern "<select"
Select-String -Path $file -Pattern "<input(?!.*matInput)"
Select-String -Path $file -Pattern 'type="range"'
Select-String -Path $file -Pattern "<button(?!.*mat-flat-button|.*mat-stroked-button|.*mat-icon-button|.*mat-button)"
```

macOS / Linux:
```bash
file="src/app/features/<feature>/components/<component>/<component>.component.html"

grep -nE "<select" "$file"
grep -nP "<input(?!.*matInput)" "$file"
grep -nE 'type="range"' "$file"
grep -nP "<button(?!.*mat-flat-button|.*mat-stroked-button|.*mat-icon-button|.*mat-button)" "$file"
```

If any command returns a match, fix the violation **before** proceeding to the build step.

---

## RULE 18 — MODULE IMPORT vs TEMPLATE USAGE CROSS-CHECK (MANDATORY)

### Every imported Material module MUST have at least one corresponding directive or component used in the HTML template.

After writing both the module and the template, verify this cross-reference table is fully satisfied:

| Imported module | Required template usage | Verify |
|---|---|---|
| `MatFormFieldModule` | `<mat-form-field>` present in template |  /  |
| `MatInputModule` | `matInput` attribute on at least one `<input>` |  /  |
| `MatSelectModule` | `<mat-select>` present in template |  /  |
| `MatButtonModule` | `mat-flat-button` / `mat-stroked-button` / `mat-button` on at least one `<button>` |  /  |
| `MatButtonToggleModule` | `<mat-button-toggle-group>` present in template |  /  |
| `MatCardModule` | `<mat-card>` present in template |  /  |
| `MatSliderModule` | `<mat-slider>` present in template |  /  |
| `MatToolbarModule` | `<mat-toolbar>` present in template |  /  |
| `MatDividerModule` | `<mat-divider>` present in template |  /  |
| `MatCheckboxModule` | `<mat-checkbox>` present in template |  /  |
| `MatRadioModule` | `<mat-radio-group>` present in template |  /  |

### Rules
- If a module is imported but its directive is absent from the template → **remove the module import OR add the directive to the template**.
- If a template uses a Material directive but the module is missing from the NgModule → **add the module**.
- Both directions must be satisfied before the task is considered complete.
- Perform this check **after writing the template** and **before the build step**.

---

## RULE 19 — MATERIAL DEFAULTS BLEED-THROUGH (HIGHEST RISK OF VISUAL MISMATCH)

Angular Material components add visual elements that do NOT exist in the Figma design — selection indicators, ripple effects, focus rings, default elevations, hover overlays, default underlines. If left unchecked, these silently leak into the output and break visual parity even when every dimension and colour is correct.

Before declaring Step 11 PASS, verify that every Material default below has been removed if it does not appear in Figma.

### Material Defaults Hit-list

| Material component | Default that bleeds through | Remediation |
|---|---|---|
| `mat-button-toggle-group` | Checkmark icon on the selected toggle | Add `hideSingleSelectionIndicator` to the group, OR `hideMultipleSelectionIndicator`. CSS fallback: `::ng-deep .mat-pseudo-checkbox { display: none !important; }` |
| `mat-button-toggle` | Border between toggles, default radius, default font | Override `.mat-button-toggle-appearance-standard { border: none; }` and set radius/font to Figma values |
| `mat-tab-group` | Bottom indicator line, default tab height (48px), uppercase ripple | Override `.mat-mdc-tab-header { ... }`; set `--mat-tab-header-active-focus-indicator-color: transparent` if Figma has no underline |
| `mat-form-field` (`appearance="fill"`) | Filled background, underline, floating label animation | Use `appearance="outline"` and override `--mdc-outlined-text-field-*` tokens, OR use a plain `<input>` styled to match Figma |
| `mat-form-field` (`appearance="outline"`) | 16px floating label gap, default outline colour | Override `--mdc-outlined-text-field-outline-color` and label tokens to Figma values |
| `mat-button` / `mat-flat-button` / `mat-stroked-button` | Ripple effect, hover state overlay, focus ring | Add `disableRipple` attribute. Override `.mat-mdc-button-persistent-ripple` and `.mat-mdc-button-ripple` if needed. |
| `mat-icon-button` | 40px default touch target, ripple | Set explicit Figma width/height; `disableRipple` |
| `mat-card` | Default `box-shadow` (elevation-1) | Override `box-shadow` to Figma's exact shadow, or `none` |
| `mat-checkbox` | Default check colour, ripple | Override `--mdc-checkbox-selected-icon-color`; `disableRipple` |
| `mat-radio-button` | Default radio outer ring colour, ripple | Override `--mdc-radio-selected-icon-color`; `disableRipple` |
| `mat-select` | Default arrow icon, panel elevation | Override `mat-form-field` panel styles; replace arrow if Figma has a custom one |
| `mat-slider` | Default thumb size, track height, focus ring | Override `--mdc-slider-handle-*` and `--mdc-slider-active-track-*` tokens |
| `mat-slide-toggle` | Default thumb / track colours, ripple | Override `--mdc-switch-*` tokens; `disableRipple` |
| `mat-list-item` | Default 48px height, hover background | Set explicit Figma height; override `--mdc-list-list-item-hover-state-layer-color: transparent` |
| `mat-dialog` | Default backdrop colour, max-width 80vw, default elevation | Override via `MatDialogConfig` and CDK overlay panel styles |
| `mat-menu` | Default item height, hover state | Override `--mat-menu-item-hover-state-layer-color` and item height |

If a Material default contradicts Figma and you cannot find a clean override path, switch to a plain HTML element styled with SCSS. Material is a means to an end, not a constraint.

---

## RULE 20 — NO ICON SUBSTITUTION (CROSS-REFERENCE)

Every glyph in Figma must be sourced from an exported MCP asset or inline SVG returned by `get_design_context`. `mat-icon` is forbidden by default. See **Step 7 → "RULE — NO MATERIAL ICON SUBSTITUTION (HARD BAN)"** for the full rule and substitution mistake table.

---

## RULE 21 — BEM CLASS NAMING (MANDATORY)

Every CSS class in component templates MUST follow BEM (Block — Element — Modifier). Random, decorative, or position-based names are forbidden.

### Format

```
.block                  ← the component itself
.block__element         ← a part of the component
.block--modifier        ← a variant of the whole block
.block__element--modifier  ← a variant of a part
```

- All names are **kebab-case** (lowercase, hyphen-separated).
- Element separator is **double-underscore** `__`.
- Modifier separator is **double-hyphen** `--`.
- The block name MUST match the component name converted to kebab-case (e.g. `TransactionRowComponent` → `.transaction-row`).

### Naming rules

- Names must be **semantic** — describe what the element IS, not what it LOOKS like.
  - YES: `.transaction-row__amount`, `.transaction-row__amount--debit`
  - NO: `.red-text`, `.big-bold`, `.div-1`, `.wrapper`, `.container-2`, `.left-side`
- Names must be **stable** — don't encode the current colour or font in the class name.
- Names must be **scoped to the block** — never write a bare `.title` that could collide; write `.transaction-row__title`.
- Generic helpers (`.wrapper`, `.container`, `.inner`, `.content`) are forbidden — replace with the BEM element name (`.transaction-row__inner` if it really has no better name).

### Examples (correct vs wrong)

For the dashboard's account card:

```html
<!-- CORRECT -->
<section class="account-card account-card--savings">
  <header class="account-card__header">
    <span class="account-card__label">Savings A/c</span>
    <span class="account-card__number">**9270</span>
  </header>
  <div class="account-card__balance">
    <span class="account-card__balance-label">Available Balance</span>
    <strong class="account-card__balance-value">₱520,500.00</strong>
    <button class="account-card__visibility-toggle">…</button>
  </div>
</section>

<!-- WRONG -->
<section class="card-1">
  <div class="top">
    <span class="grey-text">Savings A/c</span>
    <span class="bold">**9270</span>
  </div>
  <div class="middle">
    <span class="small">Available Balance</span>
    <strong class="big-text">₱520,500.00</strong>
    <button class="eye-btn">…</button>
  </div>
</section>
```

### Modifier examples

```
.transaction-row--credit   ← amount is positive
.transaction-row--debit    ← amount is negative
.button--primary
.button--ghost
.account-card--frozen
.tab--active
.avatar--small / .avatar--medium / .avatar--large
```

### Verification

After writing the template, scan for forbidden class patterns. Any match is a violation.

Windows PowerShell:
```powershell
$file = "src/app/.../component.component.html"
Select-String -Path $file -Pattern 'class="(wrapper|container|inner|content|left|right|top|bottom|red|blue|green|big|small|bold|grey|gray)'
Select-String -Path $file -Pattern 'class="div-?\d|class="section-?\d|class="block-?\d'
```

macOS / Linux:
```bash
file="src/app/.../component.component.html"
grep -nE 'class="(wrapper|container|inner|content|left|right|top|bottom|red|blue|green|big|small|bold|grey|gray)' "$file"
grep -nE 'class="(div|section|block)-?[0-9]' "$file"
```

Both must return zero matches before the build step.

---

## RULE 21 — ICON AND DIVIDER CONTROL

- **No Guessing/Hallucination**: Resource/icon/asset names must NEVER be guessed or hallucinated. Always use verified/correct asset names or paths.
- **Centered Dividers**: For horizontal divider structures flanking text (e.g., `─── OR ───` in Angular templates), ensure flanking lines have equal width/flex attributes using flexbox layout (`display: flex` and `flex: 1` or equal percentage width) to guarantee text remains centered.

```html
<!-- CORRECT — Centered dividers flanking text in Angular (Flexbox CSS) -->
<div class="divider-row">
  <div class="divider-line"></div>
  <span class="divider-text">OR</span>
  <div class="divider-line"></div>
</div>
```

---

## RULE 22 — TEST IDENTIFIERS (MANDATORY)

Every UI element must have a test ID. Store these in a separate file (e.g. `test-identifiers.ts` in the feature or component directory) containing static string properties for static elements, and dynamic arrow functions for dynamic elements (such as list cells, dropdown options, and multi-selection items). Bind these test IDs to elements via the `[attr.data-testid]` attribute template binding, or reference them in the controller class.

### Example `test-identifiers.ts`
```typescript
export const TestIdentifiers = {
  login: {
    title: 'login_label_title',
    // Dynamic function based on index and value
    dropdownOption: (index: number, value: string) => 
      `login_dropdown_option_${index}_${value.toLowerCase().replace(/\s+/g, '_')}`
  }
} as const;
```

### Component TypeScript
```typescript
import { Component } from '@angular/core';
import { TestIdentifiers } from './test-identifiers';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  testIds = TestIdentifiers.login;
  options = ['Self', 'Spouse', 'Child'];
}
```

### Component HTML Template
```html
<h1 [attr.data-testid]="testIds.title">Login</h1>

<ul>
  <li *ngFor="let option of options; let i = index" 
      [attr.data-testid]="testIds.dropdownOption(i, option)">
    {{ option }}
  </li>
</ul>
```


