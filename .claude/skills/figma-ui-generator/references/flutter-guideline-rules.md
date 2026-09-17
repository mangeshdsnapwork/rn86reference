# Step 1.5 — Pixel-Perfect Figma Conversion Rules for Flutter (MANDATORY)
<!-- Flutter guideline rules: RULE 1–7 (core visual/widget rules) and RULE 17–20 (gradient, opacity, design fidelity, pre-output checklist). Load with flutter-guideline-steps.md (RULE 8–16). -->

## STEP 0 — PRE-EXTRACTION PROTOCOL (MANDATORY — BLOCKING)

Run all three sub-steps **before writing any token file or widget code**.
No Dart code may be generated until Steps 0A, 0B, and 0C are complete.

---

### STEP 0A — Color Extraction via `get_variable_defs` (BLOCKING)

Call `get_variable_defs` on the root frame or page nodeId **before reading any color**:

```
get_variable_defs(
  nodeId: "<root or frame nodeId>",
  clientFrameworks: "flutter",
  clientLanguages: "dart"
)
```

From the response:
1. Map **every** color variable → `static const Color <name> = Color(0xFFXXXXXX);` — exact hex, zero approximation
2. Preserve the Figma variable name in a comment on every constant
3. Include ALL variables — do not skip semantic, dark-mode, or tint variants
4. If `get_variable_defs` returns empty → parse `fill`, `stroke`, and `color` attributes from the `get_design_context` XML response as fallback
5. **NEVER** estimate a color visually from a screenshot — only Figma API hex values are permitted

Expected output shape:
```dart
// In app_colors.dart — every constant MUST have the Figma variable name as a comment
static const Color neutralWhite   = Color(0xFFFFFFFF); // Neutral and Text/Plain white
static const Color pastelBlueN100 = Color(0xFFB0C8E2); // Neutral and Text/Pastel blue N100
static const Color primary        = Color(0xFF3D2E8E); // primary/default
```

**Fallback chain (in priority order):**
1. `get_variable_defs` response → hex value
2. `fill` / `stroke` in `get_design_context` XML → hex value
3. **BLOCKED** — do NOT proceed without a Figma-sourced hex value

---

### STEP 0B — Font and Typography Extraction (BLOCKING)

Call `get_design_context` with `forceCode: true`. From the response, collect every unique text style:

| Figma property | AppTypography field | Precision rule |
|---|---|---|
| `fontFamily` | `fontFamily:` in TextStyle | Exact string — no substitution |
| `fontSize` | `fontSize:` | Exact float — no rounding |
| `fontWeight` (100–900) | `FontWeight.wNNN` | Never use `.bold` / `.normal` |
| `lineHeightPx` | `height: lineHeightPx / fontSize` | Exact ratio — no rounding |
| `letterSpacing` | `letterSpacing:` | Exact float |
| `color` | `AppColors.<constant>` from STEP 0A | No inline `Color()` inside TextStyle |

After extracting all text styles, complete both sub-steps below.

#### Step 0B-1 — pubspec.yaml font registration (MANDATORY)

For **every unique fontFamily** found in the design:

```yaml
flutter:
  fonts:
    - family: <ExactFigmaFontFamilyName>   # MUST match fontFamily string from get_design_context exactly
      fonts:
        - asset: assets/fonts/<FontName>-Regular.ttf
          weight: 400
        - asset: assets/fonts/<FontName>-Medium.ttf
          weight: 500
        - asset: assets/fonts/<FontName>-SemiBold.ttf
          weight: 600
        - asset: assets/fonts/<FontName>-Bold.ttf
          weight: 700
```

#### Step 0B-2 — Google Fonts fallback (when .ttf files are unavailable)

Add `google_fonts: ^6.x` to `pubspec.yaml` dependencies, then resolve the family **once** at file scope:

```dart
import 'package:google_fonts/google_fonts.dart';

// Resolve ONCE at file scope in app_typography.dart — never inline
final _bodyFamily = GoogleFonts.inter().fontFamily;   // replace with exact Figma fontFamily name

class AppTypography {
  AppTypography._();

  static TextStyle body1 = TextStyle(
    fontFamily: _bodyFamily,   // always the resolved variable — never a raw string literal
    fontSize: 14.0,            // exact Figma value
    fontWeight: FontWeight.w400,
    height: 1.4285714,         // exact: lineHeightPx / fontSize — do not round
    letterSpacing: 0.25,       // exact Figma value
    color: AppColors.textPrimary,
  );
}
```

**NEVER** write `fontFamily: 'Inter'` as a plain string literal without registration.
**NEVER** fall back silently to Roboto — the Figma font must always be applied explicitly.

---

### STEP 0C — Icon and Image Asset Download (BLOCKING)

Call `get_design_context` with `dirForAssetWrites` pointing to the project assets directory:

```
get_design_context(
  nodeId: "<frame nodeId>",
  dirForAssetWrites: "<absolute path to project>/assets/icons",
  forceCode: true,
  clientFrameworks: "flutter",
  clientLanguages: "dart"
)
```

After the call:
1. Collect **every file written** to `dirForAssetWrites` — these are the canonical asset paths
2. `.svg` files → `SvgPicture.asset('<writtenPath>')` (requires `flutter_svg: ^2.x` in pubspec)
3. `.png` / `.jpg` files → `Image.asset('<writtenPath>', width: <from Figma>, height: <from Figma>)`
4. Register all written subdirectories under `flutter.assets` in `pubspec.yaml`
5. **NEVER** reference an asset path that was not written to disk by this call

**If Figma MCP returns "Cannot write to this directory":**

```
status: BLOCKED — icon/image asset extraction failed
reason: Figma MCP cannot write to '<dir>' — directory not in Figma Desktop allowed list
requiredAction:
  1. Open Figma Desktop
  2. Go to Dev Mode → MCP panel → Allowed Directories
  3. Add the absolute path: <project root>/assets/icons  (and assets/images if rasters present)
  4. Re-run get_design_context with dirForAssetWrites
```

Do NOT proceed until assets are confirmed on disk.
Do NOT substitute Material icons for Figma assets — the only valid exception is when the Figma layer itself uses a Material Design glyph (verified in Figma, not assumed).

**Required pubspec.yaml additions (from STEP 0C):**

```yaml
dependencies:
  flutter_svg: ^2.x   # add if Figma exports any SVG icons

flutter:
  assets:
    - assets/icons/    # Figma-exported SVG/PNG icons
    - assets/images/   # Figma-exported raster images
```

---

## WIDGET-FIRST RULE (TOP PRIORITY)

Always use the **semantically correct Flutter widget** for every UI element.

### Widget Mapping

| Figma element | Required Flutter widget | FORBIDDEN alternative |
|---|---|---|
| Container / Frame / Box | `Container` or `SizedBox` with exact dimensions | `Padding` alone without size constraint |
| Horizontal layout | `Row` | `Stack` unless absolutely required |
| Vertical layout | `Column` | `Stack` unless absolutely required |
| Text / Label / Heading | `Text` with `TextStyle` | `RichText` for single-style text |
| Primary / CTA button | `ElevatedButton` | `GestureDetector` on a `Container` |
| Secondary / Outlined button | `OutlinedButton` | `InkWell` on a `Container` |
| Text-only button / Link | `TextButton` | `GestureDetector` on a `Text` |
| Icon-only action | `IconButton` | `GestureDetector` on a `Container` |
| Text input / Field | `TextField` inside `TextFormField` | `GestureDetector` on a `Container` with text |
| Password input | `TextField` with `obscureText: true` | any non-input widget |
| Dropdown / Select | `DropdownButtonFormField` | custom `GestureDetector` overlay |
| Checkbox | `Checkbox` inside a `Row` with a `Text` | `GestureDetector` on a custom painted box |
| Radio button | `Radio` inside a `Row` | `GestureDetector` on a custom box |
| Switch / Toggle | `Switch` | `GestureDetector` on a custom container |
| Scrollable list | `ListView` or `ListView.builder` | `Column` for long lists |
| Grid layout | `GridView` or `GridView.builder` | `Wrap` for structured grids |
| Image | `Image.asset` or `Image.network` | `Container` with `DecorationImage` only if clipping is required |
| Icon (exported asset) | `SvgPicture.asset` (flutter_svg) or `Image.asset` | `Icon` widget using Material icons unless design uses Material icons |
| Card / Panel | `Card` with `elevation` | bare `Container` with manual shadows |
| Divider | `Divider` or `VerticalDivider` | `Container(height: 1)` |
| Overlay / Modal | `showDialog` / `showModalBottomSheet` | custom painted overlay |
| Tab bar | `TabBar` + `TabBarView` | manual `Row` of `GestureDetector` buttons |
| Bottom navigation | `BottomNavigationBar` | custom `Row` with `GestureDetector` |
| App bar | `AppBar` | custom `Container` at the top |
| Stepper | `Stepper` | manual `Column` of numbered containers |
| Sliver / Scroll header | `SliverAppBar` inside `CustomScrollView` | |
| Stack (overlapping) | `Stack` | Only when Figma explicitly overlaps layers |

**Stack must only be used when Figma layers explicitly overlap. Do NOT use Stack to approximate a Row or Column layout.**

---

## RULE 1 — WIDGET IS FOR STRUCTURE AND BEHAVIOR ONLY; FIGMA IS THE VISUAL SOURCE

Flutter widgets must be used for:
- semantic structure
- user interaction handling
- accessibility
- scroll and navigation behavior

Flutter widget default visual properties must NOT be treated as the visual source of truth.

All visual styling (colors, sizes, spacing, typography, radius, shadow) must come from Figma.

---

## RULE 2 — OVERRIDE ALL FLUTTER DEFAULTS

For every Flutter widget used, override all default visual properties to match Figma exactly.

Mandatory override list:
- width
- height
- padding (all four sides individually if Figma differs)
- margin
- decoration (background, border, borderRadius, shadow)
- textStyle (fontFamily, fontSize, fontWeight, letterSpacing, color, height/lineHeight)
- button style (shape, backgroundColor, foregroundColor, padding, elevation, side)
- input decoration (border, focusedBorder, errorBorder, contentPadding, hintStyle, labelStyle)
- icon size
- image fit
- gap between siblings

Never rely on Flutter default sizes.

---

## RULE 3 — DESIGN TOKEN EXTRACTION (MANDATORY)

All design values must be extracted from Figma and placed in:

```
lib/core/theme/app_colors.dart      — color constants
lib/core/theme/app_typography.dart  — TextStyle definitions
lib/core/theme/app_spacing.dart     — spacing constants
lib/core/theme/app_radius.dart      — border radius constants
lib/core/theme/app_shadows.dart     — BoxShadow definitions
lib/core/theme/app_theme.dart       — ThemeData that wires all of the above
```

### Color System

**Source:** STEP 0A — `get_variable_defs` response.
Every `AppColors` constant must have a comment with the exact Figma variable name and source hex.
No color may be written until STEP 0A is complete. No color value may be approximated.

### Typography System

**Source:** STEP 0B — `get_design_context` text style parsing.
Every `AppTypography` constant must use a font registered via Step 0B-1 or resolved via Step 0B-2.
No TextStyle may be written without a confirmed `fontFamily` registration.

### Spacing System

All `AppSpacing` constants must be derived from Figma auto-layout gap, padding, and dimension values — not assumed or rounded.

### Border Radius System

All `AppRadius` constants must be derived from Figma corner radius values — not assumed.

### Shadow System

All `AppShadows` constants must use exact Figma effect values: `blurRadius`, `spreadRadius`, `offset`, and `color` with correct ARGB alpha — not approximated.

→ Code shape reference: `examples/platform-code-examples.md`

### Color Naming Convention (MANDATORY)

Every color value in `AppColors` **and** in any inline decoration must use the explicit `Color(0xFFXXXXXX)` hex form.

```dart
//  CORRECT
static const Color primary = Color(0xFF1A73E8);
static const Color surface = Color(0xFFFFFFFF);
static const Color overlay = Color(0x80000000); // 50% black = 0x80 alpha

//  WRONG — Flutter named palette colors are FORBIDDEN
Colors.blue        // ❌
Colors.red         // ❌
Colors.grey        // ❌
Colors.white       // ❌
Colors.black       // ❌
Colors.transparent // ❌  → use Color(0x00000000) instead
```

This applies everywhere: `AppColors`, `TextStyle.color`, `BorderSide.color`, `BoxShadow.color`, `ShaderMask`, etc.

---

## RULE 4 — EXACT DIMENSION ENFORCEMENT

Every visible element must match Figma dimensions exactly.

Extract and apply:
- width
- height
- alignment within parent
- spacing between siblings
- container padding (all four sides)
- Row/Column mainAxisAlignment and crossAxisAlignment
- image dimensions
- icon dimensions
- button dimensions
- input field dimensions

No rounding of values unless the Figma value itself is rounded.

Do NOT use:
- approximate double values
- auto-height when Figma specifies fixed height
- generic Flutter spacing scale not derived from Figma

---

## RULE 5 — TYPOGRAPHY LOCK

Typography must be copied exactly from Figma. No Flutter default TextTheme value may substitute.

Extract and apply for every `Text` widget:
- fontFamily (register in pubspec.yaml)
- fontSize
- fontWeight
- height (lineHeight / fontSize)
- letterSpacing
- color
- textAlign

This applies to:
- labels above inputs
- placeholder (hintText)
- input text
- button labels
- card titles
- section headings
- body copy
- helper / error text

### Font Weight Exact Mapping

Figma weight name → Flutter `FontWeight` — **NEVER** use `FontWeight.bold` or `FontWeight.normal`.

| Figma weight | Flutter constant |
|---|---|
| 100 / Thin | `FontWeight.w100` |
| 200 / ExtraLight | `FontWeight.w200` |
| 300 / Light | `FontWeight.w300` |
| 400 / Regular | `FontWeight.w400` |
| 500 / Medium | `FontWeight.w500` |
| 600 / SemiBold | `FontWeight.w600` |
| 700 / Bold | `FontWeight.w700` |
| 800 / ExtraBold | `FontWeight.w800` |
| 900 / Black / Heavy | `FontWeight.w900` |

`FontWeight.bold` and `FontWeight.normal` are **FORBIDDEN** — always use the explicit `wNNN` constant.

### Font Value Precision

Do **not** round `fontSize` or `letterSpacing` values. Apply the exact float from Figma.

```dart
//  CORRECT — exact Figma value
fontSize: 13.5,
letterSpacing: 0.25,
height: 1.4285714,  // 20px lineHeight / 14px fontSize — do not round to 1.43

//  WRONG — unnecessarily rounded
fontSize: 14,       // if Figma says 13.5
letterSpacing: 0,   // if Figma says 0.25
```

### Font Source Resolution

Font extraction is handled in **STEP 0B** above.

- Local `.ttf`/`.otf` files → registered in `pubspec.yaml` via **Step 0B-1**
- No local file → `google_fonts` package resolved via **Step 0B-2**

**NEVER** write `fontFamily:` as a plain string literal without prior registration or resolution.

---

## RULE 6 — BUTTON STRICT CONTROL

Every Figma button MUST use a semantic Flutter button widget (`ElevatedButton`, `OutlinedButton`, `TextButton`, or `IconButton`).
Using `GestureDetector` on a `Container` as a button is STRICTLY FORBIDDEN.

Buttons must match Figma exactly:

```dart
//  CORRECT — Primary CTA
ElevatedButton(
  onPressed: onPressed,
  style: ElevatedButton.styleFrom(
    backgroundColor: AppColors.primary,         // exact Figma fill color
    foregroundColor: AppColors.surface,
    minimumSize: const Size(double.infinity, 52), // exact Figma height; width 100% of parent
    maximumSize: const Size(400, 52),             // max width from Figma
    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
    shape: RoundedRectangleBorder(
      borderRadius: AppRadius.buttonBorder,       // exact Figma radius
    ),
    elevation: 0,                                 // match Figma elevation (usually 0 for flat)
    textStyle: AppTypography.buttonText,
  ),
  child: const Text('Continue'),
)

//  CORRECT — Secondary / Outlined
OutlinedButton(
  onPressed: onPressed,
  style: OutlinedButton.styleFrom(
    foregroundColor: AppColors.primary,
    minimumSize: const Size(double.infinity, 52),
    side: const BorderSide(color: AppColors.primary, width: 1.5), // exact Figma border
    shape: RoundedRectangleBorder(borderRadius: AppRadius.buttonBorder),
    textStyle: AppTypography.buttonText.copyWith(color: AppColors.primary),
  ),
  child: const Text('Cancel'),
)

//  WRONG — GestureDetector as button
GestureDetector(
  onTap: onPressed,
  child: Container(
    decoration: BoxDecoration(color: AppColors.primary, borderRadius: AppRadius.buttonBorder),
    child: const Text('Continue'),
  ),
)
```

### Button States — Disabled and Pressed

Extract all interactive states from Figma: normal, disabled, pressed/hover. Apply via `WidgetStateProperty.resolveWith`.

```dart
//  CORRECT — full state coverage
ElevatedButton(
  onPressed: isEnabled ? onPressed : null,
  style: ButtonStyle(
    // Background: normal / pressed / disabled
    backgroundColor: WidgetStateProperty.resolveWith((states) {
      if (states.contains(WidgetState.disabled)) {
        return AppColors.primaryDisabled;  // exact Figma disabled fill
      }
      if (states.contains(WidgetState.pressed)) {
        return AppColors.primaryPressed;   // exact Figma pressed fill (if distinct)
      }
      return AppColors.primary;
    }),
    // Text color: normal / disabled
    foregroundColor: WidgetStateProperty.resolveWith((states) {
      if (states.contains(WidgetState.disabled)) {
        return AppColors.onPrimaryDisabled; // exact Figma disabled label color
      }
      return AppColors.surface;
    }),
    // Splash / ink overlay (Figma pressed overlay color)
    overlayColor: WidgetStateProperty.all(
      AppColors.primarySplash, // Color(0xFFXXXXXX) from Figma
    ),
    minimumSize: WidgetStateProperty.all(const Size(double.infinity, 52)),
    shape: WidgetStateProperty.all(
      RoundedRectangleBorder(borderRadius: AppRadius.buttonBorder),
    ),
    elevation: WidgetStateProperty.all(0),
    textStyle: WidgetStateProperty.all(AppTypography.buttonText),
  ),
  child: const Text('Continue'),
)

//  Add to AppColors for every button that has explicit Figma disabled/pressed states:
//  static const Color primaryDisabled = Color(0xFFXXXXXX);
//  static const Color onPrimaryDisabled = Color(0xFFXXXXXX);
//  static const Color primaryPressed = Color(0xFFXXXXXX);
//  static const Color primarySplash = Color(0x1AXXXXXX); // low-alpha overlay
```

---

## RULE 7 — INPUT AND FORM FIELD STRICT CONTROL

Every Figma text field MUST use `TextFormField` (inside a `Form`) or `TextField`.
Using a `GestureDetector` on a `Container` with a `Text` is STRICTLY FORBIDDEN.

### External Label Pattern (label above the field)

```dart
//  CORRECT
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Text('Full Name', style: AppTypography.label),
    const SizedBox(height: AppSpacing.sm),
    TextFormField(
      decoration: InputDecoration(
        hintText: 'Enter your full name',
        hintStyle: AppTypography.hint,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,  // produces exact Figma field height
        ),
        border: OutlineInputBorder(
          borderRadius: AppRadius.inputBorder,
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppRadius.inputBorder,
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppRadius.inputBorder,
          borderSide: const BorderSide(color: AppColors.borderFocus, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: AppRadius.inputBorder,
          borderSide: const BorderSide(color: AppColors.error),
        ),
        filled: true,
        fillColor: AppColors.surface,
      ),
      style: AppTypography.body1,
    ),
  ],
)

//  WRONG — Container pretending to be an input
GestureDetector(
  onTap: () => focusNode.requestFocus(),
  child: Container(
    height: 52,
    decoration: BoxDecoration(border: Border.all(color: AppColors.border)),
    child: Text('Enter your full name', style: AppTypography.hint),
  ),
)
```

### Fixed-Height Enforcement

If Figma specifies an exact input height (e.g. 52px), enforce it via `contentPadding` rather than wrapping in a `SizedBox(height: 52)`. The `SizedBox` approach overrides the field's intrinsic layout and breaks error text display.

Use `contentPadding` values that produce the correct total height:
```
totalHeight = verticalPadding * 2 + fontSize * lineHeight
```

---

## RULE 17 — GRADIENT EXACT EXTRACTION

If Figma uses a gradient fill on any layer, match it **exactly**. Replacing a gradient with a solid color is a CRITICAL fail.

Extract and apply:
- gradient type: Linear / Radial / Angular / Sweep
- exact start and end alignments (derived from Figma angle)
- exact color values at every stop (`Color(0xFFXXXXXX)`)
- exact stop positions (0.0 – 1.0)
- exact per-stop opacity

### Linear Gradient Example

```dart
//  CORRECT
BoxDecoration(
  gradient: const LinearGradient(
    begin: Alignment.topLeft,       // from Figma angle
    end: Alignment.bottomRight,
    colors: [
      Color(0xFF123456),            // Figma stop 0 hex
      Color(0xFF654321),            // Figma stop 100 hex
    ],
    stops: [0.0, 1.0],             // exact positions
  ),
)

//  WRONG — gradient replaced with solid
BoxDecoration(color: Color(0xFF123456))
```

### Figma Angle → Flutter Alignment

| Figma angle | `begin` | `end` |
|---|---|---|
| 0° (top → bottom) | `Alignment.topCenter` | `Alignment.bottomCenter` |
| 45° (top-left → bottom-right) | `Alignment.topLeft` | `Alignment.bottomRight` |
| 90° (left → right) | `Alignment.centerLeft` | `Alignment.centerRight` |
| 135° (top-right → bottom-left) | `Alignment.topRight` | `Alignment.bottomLeft` |
| 180° (bottom → top) | `Alignment.bottomCenter` | `Alignment.topCenter` |
| 270° (right → left) | `Alignment.centerRight` | `Alignment.centerLeft` |

For custom angles, compute `begin`/`end` using trigonometry:
```dart
final rad = angle * pi / 180;
Alignment(sin(rad), -cos(rad))  // end alignment
Alignment(-sin(rad), cos(rad)) // begin alignment
```

### Radial Gradient Example

```dart
BoxDecoration(
  gradient: RadialGradient(
    center: Alignment(0.0, 0.0),  // Figma center position
    radius: 0.8,                  // Figma radius as fraction of bounding box
    colors: const [
      Color(0xFF123456),
      Color(0xFF654321),
    ],
    stops: const [0.0, 1.0],
  ),
)
```

### FORBIDDEN
- Replacing gradient with a solid color
- Using arbitrary gradient colors not from Figma
- Omitting stop positions when Figma has mid-stops
- Approximating angle with the nearest cardinal direction when Figma uses an exact angle

---

## RULE 18 — CONTAINER OPACITY AND BLUR

If Figma applies layer opacity or a blur/frosted-glass effect, replicate it exactly in Flutter.

### Layer Opacity — Color with Alpha

Use the ARGB hex form `Color(0xAARRGGBB)` (Dart 3.x preferred), NOT the deprecated `.withOpacity()`:

```dart
//  CORRECT — explicit ARGB hex
const Color(0x80000000)  // 50% black (0x80 = 128 = ~50%)
const Color(0x33FFFFFF)  // 20% white overlay

//  CORRECT — withValues (non-deprecated Dart 3.x API)
Color(0xFF000000).withValues(alpha: 0.5)  // 50% black

//  WRONG — deprecated
Colors.black.withOpacity(0.5)
```

### Full-Layer Opacity Widget

Use `Opacity` **only** when the entire widget subtree must be transparent. For a single color, prefer the alpha hex form.

```dart
//  CORRECT — subtree opacity
Opacity(
  opacity: 0.5,   // exact Figma layer opacity value
  child: MyWidget(),
)

//  WRONG — Opacity wrapping a single colored Container (use Color alpha instead)
```

### Blur / Frosted Glass (BackdropFilter)

If Figma shows a frosted-glass or blur-background effect:

```dart
import 'dart:ui';

ClipRRect(
  borderRadius: AppRadius.cardBorder,
  child: BackdropFilter(
    filter: ImageFilter.blur(
      sigmaX: 10,  // exact Figma blur value
      sigmaY: 10,
    ),
    child: Container(
      color: Color(0xFF000000).withValues(alpha: 0.2),  // exact Figma overlay opacity
      child: ...,
    ),
  ),
)
```

---

## RULE 19 — DO NOT CHANGE THE DESIGN

The Figma design is the contract. The code must reproduce it, not improve or simplify it.

### STRICTLY FORBIDDEN

| Forbidden action | Why |
|---|---|
| Replacing a gradient with a solid color | Loses visual depth from Figma |
| Replacing a custom Figma icon with a Material icon | Different style, size, stroke weight |
| Rounding border radius to the nearest 4/8/12 | Breaks pixel accuracy |
| Removing a shadow because it looks subtle | Figma shadow is intentional |
| Simplifying a 3-column layout to a single column unconditionally | Breaks desktop fidelity |
| Omitting a border when it exists in Figma | Incomplete reproduction |
| Skipping disabled or pressed visual states | Incomplete button contract |
| Substituting a Figma font with Roboto or the system default | Wrong brand typography |
| Using `SizedBox` where Figma specifies flexible layout | Breaks responsiveness |
| Applying convenience spacing (e.g. 8, 16, 24) not from Figma | Arbitrary, not extracted |

### REQUIRED behavior when a design detail is unclear

1. Infer carefully from the **surrounding components** and the design system
2. Maintain **consistency** with other resolved tokens (spacing, radius, color)
3. Never use an arbitrary value — always derive from evidence

---

## RULE 20 — PRE-OUTPUT VALIDATION CHECKLIST

Run this checklist **before marking any component complete**. Every item must be ✔.

### Typography
- [ ] `fontFamily` matches Figma exactly (registered in `pubspec.yaml` or via GoogleFonts)
- [ ] `fontWeight` uses explicit `FontWeight.wNNN` — no `.bold` / `.normal`
- [ ] `fontSize` applied as exact Figma value — not rounded
- [ ] `height` = lineHeight ÷ fontSize — exact float
- [ ] `letterSpacing` matches Figma exactly
- [ ] `color` uses `Color(0xFFXXXXXX)` — no `Colors.*` named colors
- [ ] Every `TextStyle` references an `AppTypography` constant — no inline literals

### Colors
- [ ] All colors use `Color(0xFFXXXXXX)` or ARGB hex form
- [ ] No `Colors.blue`, `Colors.red`, `Colors.grey`, etc.
- [ ] Opacity encoded as ARGB alpha — not via deprecated `.withOpacity()`
- [ ] Gradient (if present) matches Figma: type, angle, stops, colors

### Buttons
- [ ] Semantic widget used (`ElevatedButton`, `OutlinedButton`, `TextButton`)
- [ ] `minimumSize` height matches Figma exactly
- [ ] `backgroundColor`, `foregroundColor` match Figma
- [ ] `borderRadius` matches Figma via `AppRadius` constant
- [ ] Disabled color and label color defined (if Figma shows a disabled state)
- [ ] Pressed / splash overlay color defined
- [ ] No `GestureDetector` + `Container` used as a button

### Inputs
- [ ] `TextFormField` or `TextField` used — no `Container` + `Text` fake inputs
- [ ] `contentPadding` produces exact Figma field height
- [ ] `border`, `enabledBorder`, `focusedBorder`, `errorBorder` all defined
- [ ] `hintStyle` matches Figma placeholder typography
- [ ] `fillColor` matches Figma field background

### Icons
- [ ] SVG icons use `SvgPicture.asset` — not substituted with Material icons
- [ ] Icon size matches Figma exactly
- [ ] Icon color uses `AppColors` constant
- [ ] Icon style (outlined / rounded / sharp / filled) matches Figma

### Images
- [ ] Exact width and height applied
- [ ] Correct `BoxFit` (`cover` / `contain` / `fill`) matches Figma
- [ ] `ClipRRect` applied if Figma shows corner radius
- [ ] Aspect ratio preserved — no stretching or cropping

### Layout & Spacing
- [ ] All gaps use `AppSpacing` constants — no random `SizedBox` values
- [ ] All padding uses `AppSpacing` constants
- [ ] `Row` / `Column` used for non-overlapping layout — no `Stack` abuse
- [ ] Responsive behavior verified at 360px, 390px, 414px (mobile), 600px+ (tablet)

### Shadows
- [ ] `blurRadius`, `spreadRadius`, `offset`, `color` all match Figma
- [ ] Shadow color uses ARGB hex form with correct alpha
- [ ] No `Card` default elevation substituted for a Figma-specified custom shadow

### General
- [ ] No hardcoded hex, font size, spacing, or radius inline — everything through token constants
- [ ] `const` used wherever the widget tree allows
- [ ] File compiles without errors (`flutter analyze` passes)
- [ ] Formatted with `dart format`
- [ ] Figma design was NOT simplified, redesigned, or approximated

---

## RULE 21 — ICON AND DIVIDER CONTROL

- **No Guessing/Hallucination**: Resource/icon names (such as Material icons or local asset assets) must NEVER be guessed or hallucinated. Always use verified/correct resource names.
- **Centered Dividers**: For horizontal divider structures flanking text (e.g., `─── OR ───` inside a `Row`), ensure flanking lines are wrapped in `Expanded` or use matching flex/width attributes in a `Row` to guarantee centering.

```dart
// CORRECT — Centered dividers flanking text in Flutter Row
Row(
  children: [
    Expanded(
      child: Divider(
        color: AppColors.divider,
        thickness: 1.0,
      ),
    ),
    Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Text(
        'OR',
        style: AppTypography.caption,
      ),
    ),
    Expanded(
      child: Divider(
        color: AppColors.divider,
        thickness: 1.0,
      ),
    ),
  ],
)
```

---

## RULE 22 — TEST IDENTIFIERS (MANDATORY)

Every Flutter widget must have a test ID. Store these in a separate file (e.g. `test_keys.dart` in the feature theme or library) containing static `const Key` fields for static elements, and dynamic static functions returning a `Key` for dynamic elements (such as list cells, dropdown options, and multi-selection items). Bind these test IDs to widgets via the `key` parameter.

### Example `test_keys.dart`
```dart
import 'package:flutter/material.dart';

class TestKeys {
  static const Key loginTitle = Key('login_label_title');
  
  // Dynamic key based on index and value
  static Key loginDropdownOption(int index, String value) {
    final normalized = value.toLowerCase().replaceAll(' ', '_');
    return Key('login_dropdown_option_${index}_$normalized');
  }
}
```

### Usage in Widgets
```dart
class LoginScreen extends StatelessWidget {
  final List<String> options = const ['Self', 'Spouse', 'Child'];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Login', key: TestKeys.loginTitle),
        ...options.asMap().entries.map((entry) {
          int index = entry.key;
          String option = entry.value;
          return InkWell(
            key: TestKeys.loginDropdownOption(index, option),
            onTap: () {},
            child: Text(option),
          );
        }).toList(),
      ],
    );
  }
}
```



