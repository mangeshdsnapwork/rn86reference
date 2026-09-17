# Step 1.5 — Pixel-Perfect Figma Conversion Rules for React Native (MANDATORY)

## DESIGN IS THE SINGLE SOURCE OF TRUTH

Call:
`get_design_context`

Parameters:
- nodeId: `{NODE_ID}`
- dirForAssetWrites: `{DIR_FOR_ASSET_WRITES}`
- forceCode: true
- clientFrameworks: `"react-native"`
- clientLanguages: `"typescript,tsx"`

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

### Strict Rules
- Do NOT guess
- Do NOT redraw manually
- Do NOT approximate values
- Do NOT "simplify" Figma layout
- Do NOT emit HTML, CSS, SCSS, Tailwind, or DOM APIs
- All measurements must come directly from Figma

---

## RULE 1 — USE REACT NATIVE PRIMITIVES ONLY

Every visible or interactive element must map to the correct React Native primitive or existing project-native component.

### Figma Layer Name → Required React Native Primitive

| Figma layer / description | Required React Native primitive | Notes |
|---|---|---|
| Screen root / page frame | `View` + `useSafeAreaInsets()` | Apply `paddingTop: insets.top` to root `View`; apply `paddingBottom: insets.bottom` to `ScrollView` `contentContainerStyle`. Do **NOT** use the built-in `SafeAreaView` from `react-native` — it only covers the top edge on Android and ignores the bottom navigation bar |
| Scrollable screen | `ScrollView` | Use when content can overflow vertically |
| Long repeating list | `FlatList` or `SectionList` | Never map long lists to plain `ScrollView` unless count is tiny |
| Frame / card / panel / box | `View` | Use exact width, height, radius, border, and shadow from Figma |
| Horizontal auto-layout | `View` with `flexDirection: 'row'` | Do not use absolute positioning |
| Vertical auto-layout | `View` with `flexDirection: 'column'` | Use `gap` if supported or explicit spacers/margins |
| Text / label / heading / helper text | `Text` | All typography must come from tokens |
| Primary / secondary / ghost button | `Pressable` | Wrap text/icon inside; use `accessibilityRole="button"` |
| Text input / field | `TextInput` | Wrap in labeled container when design shows label |
| Password field | `TextInput` with `secureTextEntry` | |
| Search field | `TextInput` | Use `placeholder` and search icon if shown |
| Checkbox | `Pressable` + visual proxy | Must set `accessibilityRole="checkbox"` and checked state |
| Radio chip / radio option | `Pressable` + visual proxy | Must set `accessibilityRole="radio"` and selected state |
| Switch / toggle | `Switch` or existing project switch component | Prefer `Switch` unless the repo already has a shared primitive |
| Icon-only action | `Pressable` | Ensure touch target is at least the Figma size |
| Image / illustration / logo | `Image` | Use local asset path, exact dimensions, and `resizeMode` from design intent |
| Modal / sheet / overlay | `Modal` | Only when the Figma design explicitly shows an overlay |
| Keyboard-aware form | `KeyboardAvoidingView` | Required for form-heavy mobile screens |

### Banned Output

The generation must be rejected if it contains any of these in final code:
- `<div>`, `<button>`, `<input>`, `<img>`, or any other HTML tag
- `className`, Tailwind utilities, SCSS imports, or CSS files
- DOM APIs such as `document`, `window`, `getBoundingClientRect`, `onClick`
- Web-only routing or browser-only screenshot instructions for a React Native target

---

## RULE 2 — EXACT DIMENSION ENFORCEMENT

Every visible element must match Figma dimensions exactly.

Extract and apply:
- width
- height
- min/max dimensions when present
- padding on each side
- gaps between siblings
- icon and image sizes
- border radii
- border widths
- shadow values
- alignment within parent layout

Do NOT:
- round values unless Figma already rounds them
- replace fixed dimensions with `flex: 1` unless the Figma layout actually stretches
- use `position: 'absolute'` for normal layout structure

---

## RULE 3 — TYPOGRAPHY LOCK

Typography must be copied exactly from Figma and applied through shared tokens.

Extract and apply:
- fontFamily
- fontSize
- fontWeight
- lineHeight
- letterSpacing
- textTransform
- text color
- text alignment

This applies to headings, labels, placeholders, button text, helper text, and error text.

---

## RULE 4 — BUTTON STRICT CONTROL

Every Figma button must be a `Pressable` with a nested `Text` and optional `Image`/icon asset.

Buttons must match Figma exactly in:
- width
- height
- radius
- fill color
- border width and color
- horizontal and vertical padding
- icon spacing
- text style

Required behavior rules:
- set `accessibilityRole="button"`
- use `android_ripple` only if it does not change the resting visual design
- keep the visual state in sync with pressed, disabled, or selected variants shown in Figma

### Example — Primary Button

```tsx
<Pressable
  accessibilityRole="button"
  style={({ pressed }) => [
    styles.primaryButton,
    pressed && styles.primaryButtonPressed,
  ]}
>
  <Text style={styles.primaryButtonText}>Continue</Text>
</Pressable>
```

---

## RULE 5 — INPUT AND FORM FIELD STRICT CONTROL

Every Figma input must render as a real `TextInput`.

### Required structure

```tsx
<View style={styles.fieldGroup}>
  <Text style={styles.fieldLabel}>Email address</Text>
  <View style={styles.inputShell}>
    <TextInput
      placeholder="Enter your email"
      placeholderTextColor={tokens.colors.textMuted}
      style={styles.textInput}
      keyboardType="email-address"
      autoCapitalize="none"
    />
  </View>
</View>
```

Rules:
- Never fake an input with a `View` plus placeholder `Text`
- If the design shows a prefix/suffix icon, place it inside the input shell with the exact gap from Figma
- Use `secureTextEntry` for password fields
- Use `keyboardType` that matches the field intent when design indicates it
- Wrap form screens with `KeyboardAvoidingView` when the keyboard would cover controls

### Checkbox / radio pattern

React Native core has no built-in checkbox/radio styling primitive that matches arbitrary Figma visuals. Use `Pressable` with accessibility semantics and a visual proxy.

```tsx
<Pressable
  accessibilityRole="checkbox"
  accessibilityState={{ checked: accepted }}
  style={styles.checkboxRow}
  onPress={toggleAccepted}
>
  <View style={[styles.checkboxBox, accepted && styles.checkboxBoxChecked]}>
    {accepted ? <Image source={icons.check} style={styles.checkboxIcon} /> : null}
  </View>
  <Text style={styles.checkboxLabel}>I accept the terms and conditions</Text>
</Pressable>
```

---

## RULE 6 — IMAGE AND ICON STRICT CONTROL

All Figma image and icon assets must be downloaded locally before code is finalized.

### Asset rules
- Store assets in `assets/figma/`
- Keep the original hash filename from Figma
- Use `require()` for static assets in final code
- If the Figma export is SVG, only keep it as SVG when the repo already supports SVG rendering
- If SVG support is absent, export a raster asset from Figma instead of adding a new library

### Example

```tsx
const illustrations = {
  hero: require('../../assets/figma/9f0c2e8a4d.png'),
  chevron: require('../../assets/figma/0bb4c14f2a.png'),
};

<Image
  source={illustrations.hero}
  style={styles.heroImage}
  resizeMode="contain"
/>
```

---

## RULE 7 — SHARED DESIGN TOKENS (MANDATORY)

Extract all Figma values into a shared TypeScript token file before writing component styles.

### Canonical file

Use:
`src/theme/figma-tokens.ts`

If the repo does not use `src/`, use:
`theme/figma-tokens.ts`

### Required token categories

- `colors`
- `typography`
- `spacing`
- `radius`
- `borders`
- `shadows`
- `layout`
- `breakpoints`

### Example token file

→ See full implementation example: `examples/react-native-code-examples.md` — Section: RULE 7 Token File Template

Rules:
- Append only new tokens if the token file already exists
- Do not redeclare raw color or spacing values across component files
- Keep Figma comments next to tokens when practical

---

## RULE 8 — STYLE IMPLEMENTATION

Use `StyleSheet.create()` for component styles unless the repo already standardizes on another React Native styling solution.

### Rules
- Prefer one `.tsx` file plus one sibling `.styles.ts` file for larger screens
- Small leaf components may keep `StyleSheet.create()` in the same file
- Reuse tokens instead of repeating literals
- Use `overflow: 'hidden'` only when clipping is shown in Figma
- Use `resizeMode` intentionally: `cover`, `contain`, `stretch`, or `center` based on design evidence

### Example screen structure

→ See full implementation example: `examples/react-native-code-examples.md` — Section: RULE 8 Screen Structure Template

> **Safe-area rule:** Always import `useSafeAreaInsets` from `react-native-safe-area-context`.
> Apply `paddingTop: insets.top` to the root `View` so the nav bar clears the status bar.
> Apply `paddingBottom: insets.bottom + <bottom-gap>` to the `ScrollView` `contentContainerStyle`
> so the last card clears the system navigation bar / home indicator.
> Never use the built-in `SafeAreaView` from `react-native` — it does not handle the bottom edge reliably on Android.

---

## RULE 9 — LAYOUT AND RESPONSIVENESS

React Native has no CSS media queries. Responsive behavior must be implemented with shared breakpoints and runtime width checks.

### Required approach

- Use `useWindowDimensions()` at the screen or layout wrapper level
- Derive `isMobile`, `isTablet`, `isDesktop`, and `isWide` from shared breakpoint tokens
- Pass responsive flags downward or derive a single responsive style variant
- Do not hardcode different widths throughout multiple child components

### Example

```tsx
import {useWindowDimensions} from 'react-native';

const {width} = useWindowDimensions();
const isTablet = width <= figmaTokens.breakpoints.tablet;
const isMobile = width <= figmaTokens.breakpoints.mobile;
```

### Responsive checklist

- `>= 1440`: layout matches desktop-width Figma frame when applicable
- `1024`: panels still align and nothing clips
- `768`: multi-column layouts stack vertically
- `480`: full-width inputs/buttons, reduced side padding, decorative-only art hidden if required
- tiny screens: screen remains scrollable, keyboard does not cover active fields

### Two-panel auth layouts

- Large widths: hero panel can remain fixed-width while form panel grows
- Tablet and below: stack hero above form
- Mobile: reduce hero height and hide decorative-only floating art

---

## RULE 10 — DO NOT USE ABSOLUTE POSITIONING FOR PRIMARY LAYOUT

`position: 'absolute'` is allowed only when Figma explicitly overlays one layer on another.

Forbidden uses:
- building columns or rows with absolute coordinates
- placing labels, buttons, or inputs by x/y offsets when flex layout can express the same structure
- simulating spacing with `top` and `left`

Required layout approach:
- `flexDirection`
- `justifyContent`
- `alignItems`
- exact padding and margins from Figma
- wrapper `View` containers that mirror Figma auto-layout groups

---

## RULE 11 — QUALITY GATES

Reject and regenerate the React Native output if any of these are true:
- HTML or CSS appears anywhere in the final implementation
- raw Figma localhost asset URLs remain in code
- a button is rendered as plain `Text` or `View` without `Pressable`
- an input is rendered as a `View` with placeholder text instead of `TextInput`
- repeated design values are hardcoded instead of added to shared tokens
- the screen breaks at mobile or tablet widths
- screenshot comparison is missing or under 95% visual match
- `SafeAreaView` from `react-native` is used instead of `useSafeAreaInsets` from `react-native-safe-area-context`
- `paddingBottom` for the scroll container does not include `insets.bottom`

---

## RULE 12 — BUILD VALIDATION (MANDATORY)

After writing all React Native files, run the app to catch compile-time and Metro bundler errors:

```bash
# iOS Simulator
npx react-native run-ios

# Android Emulator
npx react-native run-android
```

Fix all errors before proceeding to screenshot capture.

---

## RULE 12B — MANUAL VISUAL VERIFICATION (MANDATORY)

> **This step is MANDATORY.**
> You MUST run the application and visually inspect the rendered UI on an emulator, simulator, or device, comparing it against the source design before marking the task complete.

### Manual Verification Steps:
1. Open the screen on the Android Emulator or iOS Simulator.
2. Manually compare the rendered UI side-by-side with the Figma design layout or design screenshot.
3. Verify that:
   - Layout alignment, margins, and flexbox distribution match the design structure.
   - Text elements use correct typography values (font, weight, size, color) defined in the design tokens.
   - Touch areas are implemented with semantic `Pressable` primitive (or custom button components) and have appropriate feedback behavior.
   - Screen behaves correctly on different device form factors (mobile, tablet, etc.).
4. Document layout mismatches and adjustments in the final report mismatch table.

---

## RULE 13 — IMPLEMENTATION OUTPUT

For a React Native screen, generate:
- `FeatureScreen.tsx` or `{ComponentName}.tsx`
- sibling `FeatureScreen.styles.ts` when the component is non-trivial
- shared token file update
- local asset constants block
- screen registration update only if the repo already has a navigation layer

Do NOT generate:
- browser routing files
- CSS, SCSS, HTML, or Tailwind config changes
- new libraries unless they already exist in the repo and are clearly required by the current design

---

## STEP 14 — FINAL DELIVERY CHECKLIST

Before returning the task as complete, verify all of the following:

- Stack detected as React Native with evidence from the repo
- React Native guideline used, not the web React guideline
- Tokens extracted before styles were written
- Assets downloaded to `assets/figma/` and referenced locally
- Output uses React Native primitives only
- Responsive pass completed for mobile, tablet, and larger widths
- Screenshot comparison saved and logged
- Final report includes affected files, assumptions, and visual score

---

## RULE 15 — ICON AND DIVIDER CONTROL

- **No Guessing/Hallucination**: Resource/icon names must NEVER be guessed or hallucinated. Always use verified/correct resource names.
- **Centered Dividers**: For horizontal divider structures flanking text (e.g., `─── OR ───` inside a Row), ensure flanking lines (using `View` with background color) are configured using equal `flex` (such as `flex: 1`) or equal width to guarantee the text remains centered.

```tsx
// CORRECT — Centered dividers flanking text in React Native
<View style={styles.dividerRow}>
  <View style={styles.dividerLine} />
  <Text style={styles.dividerText}>OR</Text>
  <View style={styles.dividerLine} />
</View>

// styles
const styles = StyleSheet.create({
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: tokens.colors.divider,
  },
  dividerText: {
    marginHorizontal: tokens.spacing.md,
    fontSize: tokens.typography.caption.fontSize,
    color: tokens.colors.textMuted,
  },
});
```

---

## RULE 16 — TEST IDENTIFIERS (MANDATORY)

Every React Native element must have a test ID. Store these in a separate file (e.g. `testIdentifiers.ts` in the feature theme or component directory) containing static string properties for static elements, and dynamic arrow functions for dynamic elements (such as list cells, dropdown options, and multi-selection items). Bind these test IDs to elements via the `testID` attribute.

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
import { View, Text, Pressable } from 'react-native';
import { TestIdentifiers } from './testIdentifiers';

export const LoginScreen = () => {
  const options = ['Self', 'Spouse', 'Child'];
  
  return (
    <View>
      <Text testID={TestIdentifiers.login.title}>Login</Text>
      
      {options.map((option, index) => (
        <Pressable 
          key={option}
          testID={TestIdentifiers.login.dropdownOption(index, option)}
        >
          <Text>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
};
```