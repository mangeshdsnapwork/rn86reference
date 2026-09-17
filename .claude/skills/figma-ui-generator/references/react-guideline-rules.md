# Step 1.5 — Pixel-Perfect Figma Conversion Rules (MANDATORY)

## DESIGN IS THE SINGLE SOURCE OF TRUTH

Call `get_design_context` to retrieve the implementation context.

Parameters:
- nodeId: `{NODE_ID}`
- dirForAssetWrites: `{DIR_FOR_ASSET_WRITES}`
- forceCode: true
- clientFrameworks: `"react"`
- clientLanguages: `"typescript,tsx,tailwind,scss"`

This call is the SINGLE source of truth for:
- layout
- content placement
- spacing
- typography
- colors
- assets
- auto-layout
- dimensions
- alignment

### Companion MCP tools

The Figma MCP server exposes more than just `get_design_context`. Use them where they fit — they save tokens and improve fidelity:

- **`get_variable_defs`** — returns the design variables and styles (colours, spacing, typography, radii) actually used in the selection. Use this as the **primary source** when populating Tailwind tokens (`tailwind.config.ts → theme.extend`) or your SCSS variables file. It's leaner and more accurate than scraping values out of `get_design_context` output.
- **`get_metadata`** — returns a sparse XML outline (layer IDs, names, types, sizes) of the selection. For large frames, call this first to plan your reads, then issue targeted `get_design_context` calls per section. This prevents the single big `get_design_context` call from blowing up the context window.
- **`get_screenshot`** — used in Step 11 for the visual comparison loop. It's the official screenshot tool name; do not invent prefixed variants.

### Strict Rules
- Do NOT guess
- Do NOT redraw manually
- Do NOT approximate values
- Do NOT "simplify" Figma layout
- All measurements must come directly from Figma

### Numbering note
Rules 1–2 of this guideline family are Angular-Material-specific (Material override rules); they do not apply to React + Tailwind/SCSS, so this guideline starts at Rule 3 to keep cross-references with the Angular guideline aligned.

---

## RULE 3 — MANDATORY HTML ELEMENT USAGE (NEVER USE DIV FOR INTERACTIVE ELEMENTS)

This rule overrides everything else. No exceptions.

### THE LAW

Every interactive or semantic UI element **MUST** be implemented with its correct native HTML element.
Using a `<div>` (or `<span>`) to fake a button, input, checkbox, radio, dropdown, or textarea is **STRICTLY FORBIDDEN**.

### Figma Layer Name → Required HTML Element

Detect the correct element by inspecting the Figma layer name, component description, or visual shape:

| Figma layer / description | Required HTML element | Notes |
|---|---|---|
| Button, CTA, Primary-btn, Secondary-btn, Save, Continue, Submit | `<button type="button">` | Never `<div>`, never `<a>` unless it is a navigation link |
| Input, Text field, Field, State=Idle, State=Active, State=Error | `<input type="text">` inside `<label>` wrapper | Apply Figma border, radius, height, padding via `className` or `style` |
| Password field | `<input type="password">` | |
| Number / Amount field | `<input type="number">` | |
| Email field | `<input type="email">` | |
| Phone / Mobile field | `<input type="tel">` | |
| Date / DOB field, DD/MM/YYYY placeholder | `<input type="text">` with `placeholder` | Use text not date-picker unless design shows calendar |
| PIN Code / OTP fields | `<input type="text" maxLength={N}>` | |
| Search bar / Search input | `<input type="search">` | |
| Dropdown, Select, Picker | `<select>` | Style via Tailwind + SCSS; hide default arrow with `appearance-none` and overlay Figma arrow asset |
| Textarea, Multiline, Remarks | `<textarea>` | |
| Checkbox (any variant) | `<input type="checkbox">` | Hide native; overlay with `<label>` containing Figma-matched visual |
| Radio button, Radio chip, Chip (single-select) | `<input type="radio">` | Hide native; overlay with `<label>` containing Figma-matched visual |
| Toggle / Switch | `<input type="checkbox" role="switch">` | |
| File upload | `<input type="file">` | |
| Form wrapper | `<form>` | Wrap all form fields |
| Label (field title above input) | `<label htmlFor="...">` | Always link to its input via `htmlFor` |

### Implementation Pattern for Styled Native Elements

When Figma shows a visually custom checkbox, radio, chip, or input:

1. Render the native element (`<input>`) with `className="sr-only"` (screen-reader only, visually hidden)
2. Render a `<label htmlFor="...">` whose visual matches the Figma design exactly
3. Use CSS sibling selectors (`:checked + label`) or React state to toggle active styles

```jsx
//  CORRECT — Radio chip
<div className="flex gap-2">
  {['Male', 'Female', 'Transgender'].map((option) => (
    <label
      key={option}
      className={`flex items-center justify-center h-9 px-2 rounded-lg border cursor-pointer
        ${ selected === option
          ? 'bg-[#e5eaf7] border-[#002953]'
          : 'bg-white border-[#002953]' }`}
    >
      <input
        type="radio"
        name="gender"
        value={option}
        checked={selected === option}
        onChange={() => setSelected(option)}
        className="sr-only"
      />
      <span style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: '#002953' }}>
        {option}
      </span>
    </label>
  ))}
</div>

//  WRONG — div pretending to be a radio button
<div className="..." onClick={() => setSelected(option)}>
  <p>Male</p>
</div>
```

```jsx
//  CORRECT — Text input
<div className="flex flex-col gap-3">
  <label htmlFor="fullName" style={{ fontWeight: 500, fontSize: 14, color: '#000' }}>
    Full Name
  </label>
  <input
    id="fullName"
    type="text"
    placeholder="Enter your full name as per your PAN card"
    className="w-[343px] h-[47px] px-3 py-[10px] rounded-[4px] border border-[#999] bg-white
      text-[14px] text-[#666] font-normal leading-[20px] outline-none
      focus:border-[#002953] placeholder:text-[#666]"
  />
</div>

//  WRONG — div pretending to be an input
<div className="border border-[#999] h-[47px] px-3">
  <p className="text-[#666]">Enter your full name as per your PAN card</p>
</div>
```

```jsx
//  CORRECT — Select / Dropdown
<div className="relative w-[343px]">
  <select
    id="city"
    className="w-full h-[47px] px-3 rounded-[4px] border border-[#999] bg-white
      text-[14px] text-[#1a1a1a] appearance-none outline-none focus:border-[#002953]"
  >
    <option value="">Select city</option>
  </select>
  {/* Figma dropdown arrow overlay */}
  <img
    src={imgDropdownArrow}
    alt=""
    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
    style={{ width: 12, height: 12 }}
  />
</div>

//  WRONG — div with a static text pretending to be a dropdown
<div className="border border-[#999] h-[47px] flex items-center justify-between px-3">
  <p>Select city</p>
  <img src={imgArrow} />
</div>
```

```jsx
//  CORRECT — Checkbox with Figma-styled visual
<label className="flex gap-2 items-center cursor-pointer">
  <input
    type="checkbox"
    checked={accepted}
    onChange={(e) => setAccepted(e.target.checked)}
    className="sr-only"
  />
  {/* Visual proxy matching Figma */}
  <span
    className="inline-flex items-center justify-center shrink-0 rounded-[2px]"
    style={{
      width: 20, height: 20,
      backgroundColor: accepted ? '#ff6700' : 'transparent',
      border: accepted ? 'none' : '2px solid #d2d2d2',
    }}
  >
    {accepted && <img src={imgCheckmark} alt="" style={{ width: 12, height: 12 }} />}
  </span>
  <span style={{ fontSize: 12, color: '#1a1a1a' }}>I accept the Terms and Conditions</span>
</label>

//  WRONG — button acting as checkbox
<button onClick={() => setAccepted(!accepted)}>
  <div className="border-2 border-[#d2d2d2] ..." />
  <p>I accept...</p>
</button>
```

### Automatic Rejection Rules

The code generation MUST be rejected (and regenerated) if any of these are found:

- A `<div>` or `<span>` has an `onClick` handler and is intended as a button → replace with `<button>`
- A Figma input field is rendered as `<div>` containing a `<p>` with placeholder text → replace with `<input>`
- A Figma dropdown is rendered as `<div>` with static text + arrow icon → replace with `<select>`
- A Figma radio chip is rendered as a `<div>` with `onClick` → replace with `<input type="radio">` + `<label>`
- A Figma checkbox is rendered as a `<div>` or `<button>` with `onClick` → replace with `<input type="checkbox">` + `<label>`
- A Figma textarea is rendered as a `<div>` → replace with `<textarea>`
- Any form group is missing a `<form>` wrapper
- Any label is not linked to its input via `htmlFor`

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
- generic spacing scale not derived from Figma

---

## RULE 5 — TYPOGRAPHY LOCK

Typography must be copied exactly from Figma and applied via Tailwind utilities or SCSS.

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

---

## RULE 6 — BUTTON STRICT CONTROL

**MANDATORY: Every Figma button MUST be a `<button type="button">` element. NEVER a `<div>`, `<span>`, or `<p>` with onClick.**

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

If Figma button is fixed size, enforce exact dimensions via Tailwind or SCSS — do not allow auto-sizing.

If Figma button text is centered with exact padding, that exact padding must be applied.

To remove default `<button>` browser styles, always apply:
```
bg-transparent border-none p-0 cursor-pointer
```
Then add all Figma visual properties on top.

---

## RULE 7 — INPUT AND FORM FIELD STRICT CONTROL

**MANDATORY: Every Figma text field / input box MUST be a native `<input>` element. NEVER a `<div>` with placeholder text inside a `<p>` tag.**

Inputs must match Figma exactly in:

- field height
- field width
- label placement
- label spacing
- placeholder style (use `placeholder:` Tailwind variant or SCSS `::placeholder`)
- border thickness
- border color
- hover border color (`focus:border-[...]`)
- focused border color
- corner radius
- prefix/suffix icon position (wrap in `<div className="relative">`, position icon absolutely)
- supporting/error text spacing

If Figma label is outside the box, place a `<label htmlFor="...">` above the `<input>` as a sibling — do NOT use floating label behavior and do NOT use a `<p>` as label.

### Disabled / Read-only Fields

Use HTML `disabled` or `readOnly` attributes — never fake them with reduced opacity on a `<div>`:
```jsx
<input
  type="text"
  disabled
  placeholder="City name will appear based on your PIN code"
  className="... border-[#ccc] text-[#ccc] cursor-not-allowed bg-white"
/>
```

### Prefix / Suffix Icon Pattern
```jsx
<div className="relative w-[343px]">
  <input
    type="text"
    className="w-full h-[47px] pl-10 pr-3 rounded-[4px] border border-[#999] ..."
  />
  {/* prefix icon */}
  <img src={imgIcon} alt="" className="absolute left-3 top-1/2 -translate-y-1/2" style={{ width: 16, height: 16 }} />
</div>
```

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

Do not replace Figma icons with third-party icon library icons unless the design explicitly uses that iconography.

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

---

## RULE 12 — SHADOW AND SURFACE ACCURACY

Where Figma uses elevation or shadow:
- extract exact shadow values
- apply them directly via Tailwind shadow utilities or SCSS

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

The output should be treated as **incomplete and must not be delivered** if any of these happen:

### Semantic / Element Violations (CRITICAL — instant fail)
- A Figma button is implemented as `<div>` or `<p>` with `onClick` instead of `<button>`
- A Figma input / text field is implemented as `<div>` containing static `<p>` placeholder text instead of `<input>`
- A Figma dropdown / select is implemented as `<div>` with arrow icon instead of `<select>`
- A Figma radio button or chip is implemented as `<div>` with `onClick` instead of `<input type="radio">` + `<label>`
- A Figma checkbox is implemented as `<div>` or `<button>` instead of `<input type="checkbox">` + `<label>`
- A Figma textarea is implemented as `<div>` instead of `<textarea>`
- Any `<label>` is missing `htmlFor` linking it to its input
- A form group is missing a `<form>` wrapper

### Visual Violations
- Button size differs visibly from Figma
- Input border-radius differs from Figma
- Text font-size or line-height differs from Figma
- Images are stretched, misplaced, or auto-scaled incorrectly
- Spacing between elements does not match Figma
- Icons use wrong size or wrong asset
- Visual comparison shows obvious mismatch
- Absolute positioning (`position: absolute` with `top`/`left`/`right`/`bottom`) used where Flexbox or Grid would suffice
- Fixed `px` widths used on responsive elements (inputs, buttons) where `%` / `max-width` is appropriate

**Semantic violations must be fixed before visual violations. An input rendered as a div is never acceptable, regardless of how visually close it looks.**

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

//  REQUIRED — responsive input / button (Tailwind)
// className="w-full max-w-[400px]"

//  REQUIRED — responsive input / button (SCSS)
.form-field {
  width: 100%;
  max-width: 400px; // Figma fixed width becomes a max-width cap
}
```

### Responsiveness rules for inputs and buttons
- All input wrappers must have `width: 100%` (Tailwind: `w-full`).
- All buttons must have at minimum `width: 100%; max-width: <figma-width>px` (Tailwind: `w-full max-w-[Xpx]`).
- Containers holding inputs/buttons must use `padding-left` + `padding-right` (or `padding-inline`) derived from Figma to control horizontal inset — never `left: Xpx` on the field itself.
- At `max-width: 480px` (mobile), all fixed max-widths should collapse to `width: 100%` with appropriate side padding.

---

## RULE 21 — ICON AND DIVIDER CONTROL

- **No Guessing/Hallucination**: Resource/icon/asset names must NEVER be guessed or hallucinated. Always use verified/correct asset names or paths.
- **Centered Dividers**: For horizontal divider structures flanking text (e.g., `─── OR ───` in HTML/CSS), ensure the flanking divider lines have equal flex grow, width, or basis properties to guarantee the text remains centered.

```jsx
// CORRECT — Centered dividers flanking text in React (Tailwind)
<div className="flex items-center w-full">
  <div className="flex-1 h-[1px] bg-[#d2d2d2]"></div>
  <span className="px-4 text-xs text-[#666] font-normal">OR</span>
  <div className="flex-1 h-[1px] bg-[#d2d2d2]"></div>
</div>

// CORRECT — Centered dividers flanking text in React (SCSS)
<div className="divider-row">
  <div className="divider-line"></div>
  <span className="divider-text">OR</span>
  <div className="divider-line"></div>
</div>
```

---

## RULE 22 — TEST IDENTIFIERS (MANDATORY)

Every UI element must have a test ID. Store these in a separate file (e.g. `testIdentifiers.ts` in the feature or component directory) containing static string properties for static elements, and dynamic arrow functions for dynamic elements (such as list cells, dropdown options, and multi-selection items). Bind these test IDs to elements via the `data-testid` attribute.

### Example `testIdentifiers.ts`
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

### Usage in Component
```tsx
import React from 'react';
import { TestIdentifiers } from './testIdentifiers';

export const LoginScreen = () => {
  const options = ['Self', 'Spouse', 'Child'];
  
  return (
    <div>
      <h1 data-testid={TestIdentifiers.login.title}>Login</h1>
      
      <ul>
        {options.map((option, index) => (
          <li 
            key={option}
            data-testid={TestIdentifiers.login.dropdownOption(index, option)}
          >
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
};
```


