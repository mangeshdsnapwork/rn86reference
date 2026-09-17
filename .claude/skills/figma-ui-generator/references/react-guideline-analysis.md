<!-- React guideline analysis: Steps 2–11 (UI Analysis, Shared Styling, Script, Conversion, Layout, Assets, Structure, Measurements, Responsive, Visual Comparison). Load with react-guideline-rules.md, react-guideline-qa.md for complete React implementation rules. -->

# Step 2 — UI Analysis (React + Tailwind/SCSS Mapping)

Before generating UI, analyze the Figma design and map it to React + HTML elements styled with Tailwind/SCSS.

## Analysis Rules

- Analyze UI from top to bottom
- Identify the appropriate semantic HTML element for each section
- Identify which elements need Tailwind utility overrides
- Identify where SCSS is required because Tailwind utilities are insufficient
- Identify fixed-size elements that must not use auto sizing

## Allowed Element Categories

- Layout: `div`, `section`, `main`, `header`, `footer`, `aside`
- Navigation: `nav`, `ul`, `li`, `a`
- Buttons: `button`, `a` (styled as button)
- Inputs: `input`, `textarea`, `select`, `label`
- Images/Icons: `img`, inline SVG (only when necessary)
- Cards: `div` with card Tailwind/SCSS class
- Lists: `ul`, `ol`, `li`
- Dividers: `hr` or `div` with border utility

Always use **the correct native HTML element first** for any UI element that has a semantic equivalent.

### Element Detection Table (BLOCKING — check before writing any JSX)

| Figma layer name / visual shape | Correct HTML element | FORBIDDEN alternative |
|---|---|---|
| Button / CTA / Primary-btn / Secondary-btn / ADD / REMOVE / SAVE / CONTINUE | `<button type="button">` | `<div onClick>`, `<p onClick>`, `<span onClick>` |
| Text field / Input / Field / State=Idle / State=Active / State=Error / State=Filled | `<input type="text">` | `<div>` with `<p>` inside |
| Password field | `<input type="password">` | `<div>` |
| Number / Amount / PIN Code / OTP | `<input type="number">` or `<input type="text" inputMode="numeric">` | `<div>` |
| Email | `<input type="email">` | `<div>` |
| Phone / Mobile / Tel | `<input type="tel">` | `<div>` |
| Date of Birth / DOB / DD-MM-YYYY | `<input type="text" placeholder="DD/MM/YYYY">` | `<div>` |
| Search | `<input type="search">` | `<div>` |
| Dropdown / Select / Picker / Combo | `<select>` + `<option>` | `<div>` with static text |
| Textarea / Remarks / Multiline | `<textarea>` | `<div>` |
| Checkbox / Tick box (any visual style) | `<input type="checkbox" className="sr-only">` + `<label>` | `<div onClick>`, `<button onClick>` |
| Radio / Radio chip / Toggle chip (single-select) | `<input type="radio" className="sr-only">` + `<label>` | `<div onClick>`, `<button onClick>` |
| Toggle / Switch | `<input type="checkbox" role="switch" className="sr-only">` + `<label>` | `<div onClick>` |
| Form group / Form section | `<form>` | bare `<div>` with no form semantics |
| Field label (text above an input) | `<label htmlFor="inputId">` | `<p>`, `<div>`, `<span>` without `htmlFor` |
| Card / Panel | `<div>` with Tailwind/SCSS classes | OK — no native element exists |
| Navigation item | `<a>` (if it navigates) or `<button>` (if it triggers action) | `<div onClick>` |
| Icon-only action | `<button aria-label="...">` containing `<img>` | `<div onClick>` |

### KEY RULE: Visual customisation does NOT justify using a div

When Figma shows a visually styled chip, toggle, or checkbox that does not look like a browser default:
- Still use `<input type="radio|checkbox">` with `className="sr-only"` (hidden from view)
- Wrap it in a `<label>` that carries all Figma visual styles
- Use React `checked` / `onChange` state to drive the visual

Never sacrifice semantics for visual convenience.


## For Each UI Section Provide

- Section name
- Recommended HTML element
- Why it fits
- Required or optional
- Whether exact visual override is needed via Tailwind or SCSS
- Whether it is readonly
- If not expressible via Tailwind:
  - custom SCSS class required
  - wrapper adjustments required

## Output Format (MANDATORY)

1. Section-wise element mapping
2. Final element list
3. List of elements requiring Tailwind utility overrides
4. List of elements requiring SCSS
5. List of fixed-size elements requiring exact dimension control

Do NOT generate code in this step.

---

# Step 3 — Shared Styling System

Before generating component styles, check whether these exist:

- `src/styles/globals.css`
- `tailwind.config.js`
- `src/styles/tokens.css` or `src/styles/_variables.scss`

## Rules

- If not present — create them
- If present — append only new styles/config
- Do not duplicate existing rules
- Keep reusable styles global
- Component-level styling should be minimal
- Prefer Tailwind utilities for layout and spacing
- Use SCSS only when Tailwind utilities are insufficient

## What to include

### In `tailwind.config.js`
Store or extend design tokens:
- colors
- font families
- font sizes
- font weights
- spacing
- border radius
- shadows
- breakpoints
- z-index values if relevant

### In `src/styles/globals.css`
- Tailwind directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`)
- shared resets
- base typography fixes
- custom utilities if needed

### In `{ComponentName}.scss`
- component-scoped styles that cannot be expressed with Tailwind utilities
- pseudo-element styles
- complex selector chains
- animation keyframes

### In reusable token file (`src/styles/_variables.scss`)
Store:
- reusable sizing tokens
- shadow values
- border values
- semantic colors

---

# Step 4 — Execute Script

Run:

`node scripts/generate-react-ui.js --figma=<figma-url> --component=<component-name> --feature=<feature-name> --style=tailwind --lang=ts`

---

# Step 5 — React + Tailwind/SCSS UI Conversion

Convert generated UI to React components styled with Tailwind CSS and SCSS.

## Strict Rules

- Do NOT add business logic
- Preserve:
  - props contract
  - readonly state
  - disabled state
  - required state
  - conditional rendering
  - mapped lists
  - event handlers only if already part of existing preserved structure
  - routing links if part of existing app
- Keep existing class names where useful
- Maintain layout structure from Figma
- Use Tailwind utilities first; fall back to SCSS only when necessary

## Component Mapping Rules (STRICT — no exceptions)

| Figma element | Required React/HTML | Forbidden |
|---|---|---|
| Any text input field | `<input type="text|number|email|tel|password">` | `<div>` |
| Any dropdown / select | `<select>` with `<option>` children | `<div>` |
| Any radio / chip (single-select) | `<input type="radio" className="sr-only">` + `<label>` | `<div onClick>` |
| Any checkbox | `<input type="checkbox" className="sr-only">` + `<label>` | `<div onClick>`, `<button onClick>` |
| Any textarea | `<textarea>` | `<div>` |
| Any button / CTA | `<button type="button">` | `<div onClick>`, `<p onClick>` |
| Card / panel / container | `<div>` | — |
| Field label | `<label htmlFor="id">` | `<p>`, `<span>` without `htmlFor` |
| Form group | `<form>` | bare `<div>` |
| Icon-only button | `<button aria-label="...">` + `<img>` | `<div onClick>` |
| Navigation link | `<a href>` | `<div onClick>` |
| List | `<ul>` + `<li>` | `<div>` stack |
| Divider line | `<hr>` or `<div aria-hidden>` | — |
| Image / illustration | `<img>` with `alt` | `<div>` with background-image |
| Icon asset | `<img>` with exact w/h | icon library component |

## Pre-Code Checklist (run BEFORE writing any JSX)

For every interactive element in the Figma design, answer:

- [ ] Is this a button/CTA? → use `<button>`
- [ ] Is this a text input field? → use `<input>`
- [ ] Is this a dropdown? → use `<select>`
- [ ] Is this a radio chip or radio button? → use `<input type="radio">` + `<label>`
- [ ] Is this a checkbox? → use `<input type="checkbox">` + `<label>`
- [ ] Is this a textarea? → use `<textarea>`
- [ ] Does every label have `htmlFor` pointing to its input `id`?
- [ ] Is the form group wrapped in `<form>`?
- [ ] Are all disabled fields using the `disabled` attribute (not just visual greying of a `<div>`)?

If any answer is NO — fix before writing component code.

## Input Label Strategy (CRITICAL)

Inspect Figma before choosing label strategy.

### Case A — Label is above the input box (most common)
Use `<label htmlFor="inputId">` as a sibling above the `<input id="inputId">`. Do NOT use a `<p>` or `<div>` as the label.

### Case B — Label floats inside the input border (floating label)
Use `placeholder` attribute on `<input>` with exact Figma placeholder colour applied via `placeholder:text-[...]` Tailwind utility or `::placeholder` SCSS.

### Case C — Label is permanently inside (prefix label, e.g. currency symbol)
Use `<div className="relative">` wrapper; position the label as an absolutely placed element; add matching `paddingLeft` to the `<input>` so text does not overlap.

## If exact UI is not possible with Tailwind

- keep structure intact
- document the reason
- apply closest visual result in SCSS
- state what needs a custom SCSS class

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
- save to `public/assets/figma/` using the **original hash filename** — do NOT rename to generic names like `logo.png`
- ignore non-image layout wrappers (frames, groups) — those are not assets
- apply exact Figma width and height to every `<img>` element

## RULE — NO ICON LIBRARY SUBSTITUTION (HARD BAN)

Every glyph visible in Figma — eye, three-dots menu, QR code, send arrow, plus, search, bell, chevron, anything — MUST be sourced from one of these two places, in this order:

1. **Exported MCP asset** at `localhost:3845/assets/<hash>.<ext>` — download to `public/assets/figma/<hash>.<ext>` and use as `<img src="/assets/figma/<hash>.<ext>" width="..." height="..." alt="..." />`.
2. **Inline SVG verbatim from `get_design_context` output** — when Figma returns the icon as inline SVG markup rather than a URL. Paste the `<svg>` JSX as-is into the component; do not redraw, do not simplify paths.

Icon-library imports (`lucide-react`, `@heroicons/react`, `react-icons`, `@radix-ui/react-icons`, MUI `@mui/icons-material`) are FORBIDDEN unless ALL of the following are true:
- the project already imports the library and uses it elsewhere
- the Figma layer name explicitly references the icon by its library export name (e.g. `lucide:Eye`, `heroicons:bell`)
- the rendered glyph is visually identical to the library version

If any of these is false, an icon-library import is a guess. Use the exported asset.

### Common substitution mistakes (DO NOT make these)

| Figma glyph | Wrong (library guess) | Correct |
|---|---|---|
| Eye / visibility toggle | `import { Eye } from 'lucide-react'` | exported `<img src="/assets/figma/<hash>.svg">` |
| Three horizontal dots | `<MoreHorizontal />` from any library | exported `<img>` of the dots |
| QR code | `<QrCode />` from any library | exported `<img>` of the Figma QR glyph |
| Bell / notification | `<Bell />` from any library | exported `<img>` |
| Search / magnifier | `<Search />` from any library | exported `<img>` |
| Send arrow / paper-plane | `<Send />` or `<ArrowRight />` from any library | exported `<img>` |
| Plus / add | `<Plus />` from any library | exported `<img>` (unless verbatim library glyph) |

Asset folder: `public/assets/figma/`
Reference path in code (Vite/CRA serve `public/` at root): `/assets/figma/<hash>.<ext>`

## RULE — NEVER USE `localhost:3845` URLS IN FINAL CODE (MANDATORY)

The Figma MCP server temporarily hosts assets at `http://localhost:3845/assets/<hash>.*`.
These URLs only work while Figma desktop is open. They will break in all other environments.

**IMMEDIATELY after `get_design_context`, download every asset and replace all references.**

Windows PowerShell:
```powershell
New-Item -ItemType Directory -Force -Path "public/assets/figma" | Out-Null
Invoke-WebRequest -Uri "http://localhost:3845/assets/<hash>.svg" -OutFile "public/assets/figma/<hash>.svg"
```

macOS / Linux:
```bash
mkdir -p public/assets/figma
curl -o public/assets/figma/<hash>.svg http://localhost:3845/assets/<hash>.svg
```

Use the **original hash filename as-is**. Do NOT rename. Renaming creates drift between the MCP output and the local file system.

Replace every `http://localhost:3845/...` src with `/assets/figma/<hash>.<ext>` before delivering.
Final code must contain zero `localhost:3845` references.

Above the constants block in the component, add the comment:
```tsx
// Assets downloaded from Figma Desktop MCP — paths are project-local.
```

---

# Step 8 — React Structure

Generate components per the classification produced in Step 2.5 (or its equivalent for React — see "Component classification" below). Do NOT dump everything into a single feature folder.

## Three-bucket folder routing

| Bucket | Folder pattern | When |
|---|---|---|
| **Layout** | `src/layout/<Name>/` | Header, Footer, BottomNav, SideNav, AppShell, AuthLayout |
| **Shared** | `src/shared/components/<Name>/` | Avatar, IconButton, ListItemRow, Card patterns reused 2+ times |
| **Feature** | `src/features/{featureName}/components/<Name>/` | Page-level container that composes Layout + Shared |

`featureName` comes from the user input collected in `SKILL.md` Step 1.

## Component classification (run this before generating code)

For the current Figma frame, walk this checklist and decide the bucket for every visual section:

| Pattern | Required if Figma has... |
|---|---|
| **Header** | A top bar with greeting, title, search, or notification icon — `src/layout/Header/` |
| **Footer** | A bottom bar with text/links — `src/layout/Footer/` |
| **BottomNav** | A fixed bottom tab bar with 3+ items — `src/layout/BottomNav/` |
| **SideNav** | A persistent left/right navigation panel — `src/layout/SideNav/` |
| **Avatar** | Circular images or initials — `src/shared/components/Avatar/` |
| **IconButton** | Repeated icon-only buttons — `src/shared/components/IconButton/` |
| **ListItemRow** | Repeated rows with icon + title + subtitle + value — `src/shared/components/<DomainName>Row/` |
| **Card** | Repeated card patterns — `src/shared/components/<DomainName>Card/` |

Repeated visual patterns are NEVER inlined. A frame with three transaction rows produces ONE `TransactionRow` component used three times via `.map()`, not three hardcoded JSX blocks.

## Files per component (every bucket)

For every entry in the classification table, generate:
- `<Name>.tsx`
- `<Name>.scss` (omit if fully expressible with Tailwind utilities)
- `index.ts` (re-exports default)

All Shared and Layout components are **presentational**, accept props via TypeScript-typed `Props`, and contain no data fetching or routing side-effects.

## Generation order

1. Layout components first (Header, Footer, BottomNav)
2. Shared components next (Avatar, ListItemRow, Card)
3. Feature page last — it imports and composes the above

## Feature page composition example

→ See examples/platform-code-examples.md — ## React: DashboardPage — Feature Page Composition Example

## Routing

Add the Feature page to React Router as a lazy route:

```tsx
const DashboardPage = lazy(() => import('./features/dashboard/components/DashboardPage'));

<Routes>
  <Route path="/dashboard" element={<DashboardPage />} />
</Routes>
```

Layout and Shared components are imported directly by their consumers (Feature pages). Do NOT add them to the router.

## App root cleanup

The app root (`App.tsx` / `main.tsx`) should contain only:
- the router
- required providers (theme, store, query client)

Remove:
- hardcoded headers
- sample content
- unused wrappers
- placeholder markup

If app-wide layout chrome (header/footer) needs to wrap every authenticated route, create an `AuthLayout` component in `src/layout/AuthLayout/` and use it as a parent route element. Do NOT hardcode chrome into `App.tsx`.

---

