<!-- Flutter guideline steps: RULE 8–16 and Execution Steps. Load with flutter-guideline-rules.md for complete Flutter implementation rules (RULE 1–7, RULE 17–20). -->

## MANDATORY — Complete STEP 0 (flutter-guideline-rules.md) Before Any Code

Before executing any step in this file, all three pre-extraction steps MUST be confirmed complete:

| Step | What it does | What it unblocks |
|---|---|---|
| **STEP 0A** | `get_variable_defs` → extract all color variables to `AppColors` | Token color file |
| **STEP 0B** | Parse font data from `get_design_context` → register fontFamily in `pubspec.yaml` | Typography file, all TextStyle |
| **STEP 0C** | `get_design_context` with `dirForAssetWrites` → download all icon/image assets to disk | All `SvgPicture.asset` / `Image.asset` refs |

Do **not** write any Dart code until all three steps return confirmed outputs.

---

## RULE 8 — RESPONSIVENESS (MediaQuery / LayoutBuilder)

Never hardcode horizontal widths as fixed pixel values on elements that must fill the screen.

### Required approach

```dart
//  CORRECT — full width input (fills screen minus padding)
SizedBox(
  width: double.infinity,
  child: TextFormField(...),
)

//  CORRECT — constrained width button
ConstrainedBox(
  constraints: const BoxConstraints(maxWidth: 400),
  child: SizedBox(
    width: double.infinity,
    child: ElevatedButton(...),
  ),
)

//  CORRECT — adaptive layout with LayoutBuilder
LayoutBuilder(
  builder: (context, constraints) {
    final isWide = constraints.maxWidth >= 600;
    return isWide
        ? Row(children: [...])
        : Column(children: [...]);
  },
)

//  CORRECT — screen-aware padding
Padding(
  padding: EdgeInsets.symmetric(
    horizontal: MediaQuery.of(context).size.width * 0.05,
    vertical: AppSpacing.screenVertical,
  ),
  child: ...,
)

//  WRONG — hardcoded pixel widths on fluid elements
SizedBox(
  width: 343,   // breaks on large or small screens
  child: TextFormField(...),
)
```

### Breakpoints

| Breakpoint | Min width | Layout change |
|---|---|---|
| Mobile | < 600 | Single column; full-width inputs and buttons |
| Tablet | 600–1024 | Two-column forms; constrained max-width |
| Desktop | > 1024 | Fixed max-width content area; centered |

Always design for mobile-first. Use `LayoutBuilder` or `MediaQuery` when layout changes between breakpoints.

---

## RULE 9 — IMAGE STRICT CONTROL

Images must not be left to Flutter default sizing.

Always apply:
- exact width and height from Figma
- `BoxFit.cover` or `BoxFit.contain` based on Figma behavior
- `borderRadius` (wrap in `ClipRRect` if radius required)
- exact alignment within parent

```dart
//  CORRECT
ClipRRect(
  borderRadius: AppRadius.cardBorder,
  child: Image.asset(
    'assets/images/banner.png',
    width: 343,
    height: 160,
    fit: BoxFit.cover,
  ),
)

//  WRONG — let Flutter auto-size the image
Image.asset('assets/images/banner.png')
```

---

## RULE 10 — ICON STRICT CONTROL

Icons must use exact dimensions from Figma.

### Icon Source Priority

1. **Exported Figma SVG** → `SvgPicture.asset` (flutter_svg package)
2. **Exported Figma PNG** → `Image.asset` with exact `width` and `height`
3. **Material icon** → `Icon` widget **only** when the Figma design explicitly uses a Material Design icon glyph

### Icon Style Matching

Figma icon libraries (e.g. Vuesax, Feather, Remix) define a **style variant** for each icon. You must match the exact variant — never substitute with a different style:

| Figma icon style | Required approach |
|---|---|
| `linear` / `outlined` / `stroke` | Use the outlined/stroke variant SVG; if using Material: `Icons.*_outlined` |
| `bold` / `filled` / `solid` | Use the filled variant SVG; if using Material: `Icons.*` (default filled) |
| `rounded` | Use the rounded variant SVG; if using Material: `Icons.*_rounded` |
| `sharp` / `angular` | Use the sharp variant SVG; if using Material: `Icons.*_sharp` |
| `two-tone` / `duotone` | Use the exact two-tone SVG — no Material icon substitution |

Substituting style variants (e.g. using a filled icon where Figma shows outlined) is a **visual violation**.

```dart
//  CORRECT — exported Figma SVG icon (exact style preserved)
SvgPicture.asset(
  'assets/icons/ico_arrow_right.svg',
  width: 24,
  height: 24,
  colorFilter: const ColorFilter.mode(AppColors.primary, BlendMode.srcIn),
)

//  CORRECT — exported Figma PNG icon
Image.asset(
  'assets/icons/ico_check.png',
  width: 20,
  height: 20,
)

//  CORRECT — Material icon ONLY when design uses Material iconography
const Icon(Icons.close_outlined, size: 24, color: AppColors.closeIconRed)

//  WRONG — replacing outlined Figma icon with filled Material icon
const Icon(Icons.arrow_forward, size: 24)  // wrong style

//  WRONG — replacing Figma icon with nearest-looking Material icon
const Icon(Icons.cancel, size: 24)          // wrong — use the exported SVG
```

### Icon Color

- Always apply `colorFilter` on SVG or `color` on `Icon` from `AppColors`
- Never leave icon color as the Figma asset default when Figma specifies an explicit color

---

## RULE 11 — SPACING SYSTEM LOCK

Spacing must be taken only from Figma.

Use `AppSpacing` constants throughout. Never introduce convenience spacing values not present in Figma.

This includes:
- `SizedBox(height: ...)` between vertical elements
- `SizedBox(width: ...)` between horizontal elements
- `padding` on every `Container`, `Padding`, `EdgeInsets`
- `mainAxisSpacing` and `crossAxisSpacing` in `GridView`
- `runSpacing` in `Wrap`

---

## RULE 12 — BORDER AND RADIUS ACCURACY

All borders and radii must match Figma exactly.

Extract and apply:
- `border` (style, width, color per side)
- `borderRadius` per corner if Figma specifies asymmetric radii
- `side` on `OutlinedButton`

Use `AppRadius` constants. Never write literal `BorderRadius.circular(N)` inline.

---

## RULE 13 — SHADOW AND SURFACE ACCURACY

Where Figma uses elevation or drop shadow:

- extract exact shadow (`color`, `blurRadius`, `spreadRadius`, `offset`)
- apply via `BoxDecoration(boxShadow: AppShadows.card)`
- do NOT use `Card` default elevation to approximate shadow when exact values differ from Figma

Surface and background colors must match exactly.

---

## RULE 14 — DO NOT STOP AT FIRST GENERATED OUTPUT

The first generated output is not final.

After generation:
1. Compare against Figma
2. Detect mismatches in spacing, sizing, color, typography
3. Fix all mismatches
4. Re-verify until output is 95%+ visually accurate

---

## RULE 15 — COMPONENT-LEVEL QA CHECKLIST

Before finalizing any widget, verify:

### Inputs
- [ ] Exact height achieved via contentPadding
- [ ] External label present and styled correctly
- [ ] hintText style matches Figma placeholder style
- [ ] border, focusedBorder, errorBorder all defined
- [ ] fillColor matches Figma field background
- [ ] No hardcoded fixed pixel width on the field itself

### Buttons
- [ ] Correct semantic widget used (ElevatedButton, OutlinedButton, TextButton)
- [ ] minimumSize height matches Figma exactly
- [ ] backgroundColor and foregroundColor match Figma
- [ ] Shape / borderRadius matches Figma
- [ ] Text style (font, size, weight) matches Figma
- [ ] Button fills width of parent (double.infinity) unless Figma specifies fixed width

### Images
- [ ] Exact width and height applied
- [ ] Correct BoxFit
- [ ] ClipRRect applied if radius present
- [ ] No unintended stretching or cropping

### Text
- [ ] fontFamily matches Figma (registered in pubspec.yaml)
- [ ] fontSize matches exactly
- [ ] fontWeight matches exactly
- [ ] height (line-height) matches exactly
- [ ] letterSpacing matches exactly
- [ ] color matches AppColors constant

### Layout
- [ ] Correct widget (Row / Column) used — no Stack for non-overlapping content
- [ ] All gaps use AppSpacing constants
- [ ] All padding uses AppSpacing constants
- [ ] No hardcoded pixel width on fluid elements
- [ ] Responsive behavior verified at 360px, 390px, 414px widths

### Gradients
- [ ] Gradient type matches Figma (Linear / Radial / Angular)
- [ ] `begin` / `end` alignments derived from exact Figma angle (not approximated)
- [ ] Every color stop uses `Color(0xFFXXXXXX)` form
- [ ] Stop positions match Figma exactly
- [ ] Gradient NOT replaced with a solid color

### Shadows
- [ ] `blurRadius`, `spreadRadius`, `offset` match Figma
- [ ] Shadow `color` uses ARGB hex with correct alpha
- [ ] No `Card` default elevation substituted for a Figma custom shadow

### Icons
- [ ] SVG icons use `SvgPicture.asset` — not Material icons
- [ ] Icon style (outlined / filled / rounded / sharp) matches Figma variant exactly
- [ ] `colorFilter` applied where Figma specifies icon color
- [ ] Icon `width` and `height` match Figma

### Button States
- [ ] Disabled background and label color defined (`WidgetStateProperty`)
- [ ] Pressed/splash overlay defined
- [ ] No `GestureDetector` + `Container` used as a button

---

## RULE 16 — FAIL CONDITIONS

The output MUST be rejected and regenerated if any of these are found:

### Semantic / Widget Violations (CRITICAL — instant fail)
- A Figma button is implemented as `GestureDetector` on a `Container`
- A Figma input / text field is implemented as `GestureDetector` on a `Container` with a `Text`
- A Figma dropdown is implemented as a `GestureDetector` overlay without `DropdownButtonFormField`
- A Figma checkbox is implemented as `GestureDetector` on a custom box
- A Figma radio button is implemented as `GestureDetector` without `Radio`
- A `Stack` is used where a `Row` or `Column` suffices
- Any design token value is hardcoded inline instead of using AppColors / AppTypography / AppSpacing / AppRadius

### Visual Violations
- Button height differs from Figma
- Input border radius or border color differs from Figma
- Text font-size, weight, or line-height differs from Figma
- Images are stretched, misaligned, or auto-scaled
- Spacing between elements does not match Figma
- Icons use wrong size or wrong asset source (Material icon substituted for Figma asset)
- Fixed-width containers used on elements that must be fluid

**Semantic violations must be fixed before visual violations.**

---

# Step 2 — UI Analysis (Flutter Widget Mapping)

Before generating code, analyze the Figma design and map each layer to a Flutter widget.

## Analysis Rules

- Analyze UI from top to bottom then left to right
- Identify the correct Flutter widget for each visual element
- Note which elements require custom decoration
- Note which elements require LayoutBuilder or MediaQuery for responsiveness
- Note which elements must use AppColors / AppTypography / AppSpacing

## Output Format (MANDATORY)

1. Section-wise widget mapping
2. Final widget tree outline
3. List of elements requiring custom `InputDecoration`
4. List of elements requiring `ButtonStyle` overrides
5. List of fixed-height elements
6. List of responsive elements requiring `LayoutBuilder` or `MediaQuery`

Do NOT generate code in this step.

---

# Step 3 — Token File Setup

Before generating widget code, check whether these files exist:

```
lib/core/theme/app_colors.dart
lib/core/theme/app_typography.dart
lib/core/theme/app_spacing.dart
lib/core/theme/app_radius.dart
lib/core/theme/app_shadows.dart
lib/core/theme/app_theme.dart
```

## Rules

- If not present — create them from Figma values
- If present — append only new tokens
- Do not duplicate existing constants
- All widget code must reference these files — no inline magic values

## pubspec.yaml — fonts, assets, and packages (MANDATORY)

All values must come from STEP 0B (fonts) and STEP 0C (assets) — never assumed.

```yaml
dependencies:
  flutter_svg: ^2.x        # REQUIRED if STEP 0C produces any .svg files
  google_fonts: ^6.x       # REQUIRED if font .ttf files are not available locally

flutter:
  fonts:
    - family: <ExactFigmaFontFamily>    # MUST match the fontFamily string from STEP 0B exactly
      fonts:
        - asset: assets/fonts/<FontName>-Regular.ttf
          weight: 400
        - asset: assets/fonts/<FontName>-Medium.ttf
          weight: 500
        - asset: assets/fonts/<FontName>-SemiBold.ttf
          weight: 600
        - asset: assets/fonts/<FontName>-Bold.ttf
          weight: 700
  assets:
    - assets/icons/         # Figma-exported SVG/PNG icons (written by STEP 0C)
    - assets/images/        # Figma-exported raster images (written by STEP 0C)
    - assets/fonts/         # local font files (Step 0B-1)
```

**Validation (run before writing any widget code):**
- Every `fontFamily:` in `AppTypography` MUST appear in this YAML or be resolved by `google_fonts`
- Every `SvgPicture.asset()` / `Image.asset()` path MUST be under a declared `assets:` directory
- Missing font registration → silent Roboto fallback → **FAIL**
- Missing `flutter_svg` dependency with SVG assets → compile error → **FAIL**

---

# Step 4 — Execute Code Generation

Generate Dart widget code following all rules above.

---

# Step 5 — Build Validation and Screenshot Capture (MANDATORY)

### Build validation

After writing all Dart files, run the Flutter build to catch compile-time errors:

```bash
# iOS Simulator target
flutter build ios --simulator --no-codesign

# Android target
flutter build apk --debug
```

Or run directly on an attached device/emulator:

```bash
flutter run
```

Fix all errors before proceeding to screenshot capture.

### Manual visual verification

> **This step is MANDATORY.**
> You MUST run the application on an emulator, simulator, or real device, and manually compare the rendered layout against the Figma design or screenshot before finalizing.

Verify that:
- Layout and padding match the Figma specification.
- Colors, typography, spacing, and border-radius match the design tokens.
- All widgets render correctly without overflow warnings.
- The interface responds properly to sizing changes.

Log any deviations or adjustments in the final mismatch log within the report.

Every generated widget file must:
- import only from `lib/core/theme/`
- contain no hardcoded color hex, font size, spacing, or radius values
- use `const` wherever possible for performance
- compile without errors
- be formatted with `dart format`
