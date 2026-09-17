<!-- iOS SwiftUI rules. For UIKit / Storyboard / XIB delivery, load ios-guideline-uikit.md instead. -->
# iOS Figma-to-Code Guideline — SwiftUI / Storyboard / XIB / Programmatic

## FIGMA SEMANTICS ARE THE SOURCE OF TRUTH

Do not directly translate raw Figma coordinates into SwiftUI frames. Instead, interpret the design semantics.

Use the available evidence sources in the Figma MCP workflow (metadata, targeted design context, variable defs, screenshots, annotations, and asset downloads) to build a normalized design representation.

### Layout Semantics Mapping
- **Fixed dimension**: Map to a fixed SwiftUI `.frame(width:, height:)`. Use ONLY when the dimension is semantically fixed.
- **Fill container**: Map to flexible SwiftUI sizing (`.frame(maxWidth: .infinity)` or `.frame(maxHeight: .infinity)`).
- **Hug contents**: Map to intrinsic SwiftUI sizing (no explicit frame size).
- **Min / Max**: Map to SwiftUI constraints (`minWidth`, `maxWidth`).
- **Responsive / Adaptive**: Map to adaptive layout behaviors (`ViewThatFits`, `layoutPriority`, etc.).
- **Absolute positioning**: Map to `.overlay` or `ZStack`. Use explicit constraints or `position()` ONLY when the Figma design intentionally requires absolute placement, not just because an element has `x`/`y` coordinates.

The generated implementation must preserve the Figma layout behavior rather than blindly copying exact pixel dimensions from the canvas.

## DELIVERY MODE DETECTION (MANDATORY — before any code)

Scan the project and detect which iOS UI delivery mode is in use.
Apply the **first matching rule** below:

### Rule 1 — Single delivery mode (auto-proceed, no question)

| Evidence (all must match) | Detected mode | Action |
|---------------------------|---------------|--------|
| `import SwiftUI` in source files AND no `.storyboard` / `.xib` in target | **SwiftUI** | Proceed — follow Part A |
| `.storyboard` in Xcode target AND no `import SwiftUI` in source files | **UIKit + Storyboard** | Proceed — follow Part B |
| `.xib` files in target, no `.storyboard` main interface, no `import SwiftUI` | **UIKit + XIB** | Proceed — follow Part B + Part C |
| UIKit imports only, no storyboard/xib/SwiftUI | **UIKit Programmatic** | Proceed — follow Part B |

### Rule 2 — Mixed delivery modes (BLOCKING — must ask)

If the project contains **both** `import SwiftUI` source files **and** `.storyboard` or `.xib` files, ask exactly:

> "This project uses both SwiftUI and UIKit. Which should I use for **this** screen?"
> - SwiftUI
> - UIKit + Storyboard
> - UIKit + XIB
> - UIKit Programmatic (no IB file)

Do NOT assume SwiftUI. Do NOT proceed until answered. Lock the answer as `ios_delivery_mode` for the session.

### Rule 3 — UIKit sub-mode not yet specified

If `ios_delivery_mode` is UIKit but the sub-mode (Storyboard / XIB / Programmatic) was not yet specified, ask:

> "Which UIKit delivery should I use?"
> - Storyboard (add a new scene to the existing Main.storyboard)
> - XIB (new `.xib` file for this VC)
> - Programmatic (pure code, no IB file)

### Rule 4 — Fully ambiguous (no signals at all)

Ask ONE question:
> "Which UI approach does this project use? (SwiftUI / Storyboard / XIB / Programmatic UIKit)"

Apply the matching part below. Do NOT mix strategies within a single component.

---

# PART A — SwiftUI

Apply every rule in this part when delivery mode is **SwiftUI**.

---

## A — VIEW-FIRST RULE (TOP PRIORITY)

Always use the **semantically correct SwiftUI view** for every Figma element.
Translate Figma Auto Layout semantics rather than blindly copying dimensions.

### SwiftUI View Mapping & Auto Layout Special Cases

- **Packed Alignment / Space Between**: Use `Spacer()` or stack spacing appropriately to achieve space-between alignment.
- **Wrapping / Reflow**: Use `Layout` (e.g., custom FlowLayout) or `ViewThatFits` for wrapping behavior, rather than hardcoding frames.
- **Absolute / Ignored Auto Layout**: Use `.overlay` or `ZStack` for elements that intentionally float or overlap (like badges, floating buttons, or overlays).

| Figma element | Required SwiftUI view | FORBIDDEN alternative |
|---|---|---|
| Auto Layout (vertical) | `VStack` | `ZStack` for non-overlapping vertical content |
| Auto Layout (horizontal) | `HStack` | `ZStack` for non-overlapping horizontal content |
| Overlapping / Stacked layers | `ZStack` or `.overlay` | Only use when Figma explicitly represents absolute positioning or overlap |
| Fill container | Flexible SwiftUI sizing (`.frame(maxWidth: .infinity)`) | Hardcoded fixed width |
| Hug contents | Intrinsic SwiftUI sizing | Hardcoded fixed width |
| Fixed size | Fixed frame | Use ONLY when the dimension is semantically fixed |
| Min / Max | SwiftUI constraints (`minWidth`, `maxWidth`) | Fixed frame |
| Text / Label / Heading | `Text` with `.font` + `.foregroundColor` + `.lineSpacing` | Never `TextField` for display-only text |
| Primary / CTA button | `Button` with `.buttonStyle(.plain)` and full custom styling | `Text` with `.onTapGesture` |
| Secondary / Outlined button | `Button` with `.border` via `.overlay` or `.background` | `Text` with `.onTapGesture` |
| Text input (single line) | `TextField` | `Text` with `.onTapGesture` |
| Password input | `SecureField` | `TextField` |
| Multi-line input | `TextEditor` | `TextField` |
| Dropdown / Picker | `Picker` with `.pickerStyle(.menu)` | custom `Button` overlay |
| Checkbox | `Toggle` with `.toggleStyle(.button)` or custom `Toggle` | `Button` faking a toggle |
| Switch / Toggle | `Toggle` | `Button` faking a switch |
| List / Scroll list | `List` or `ScrollView` + `LazyVStack` | `VStack` for long unpaged lists |
| Grid | `LazyVGrid` with `GridItem` columns | manual nested `HStack` |
| Image | `Image` with `.resizable()` + `.scaledToFill()` or `.scaledToFit()` | `AsyncImage` only for remote URLs |
| SVG / Icon (exported Figma asset) | `Image("asset-name")` from xcassets; `Image(systemName:)` only for genuine SF Symbols | SF Symbol substitution for non-SF icons |
| Card / Panel | `VStack` or `HStack` in a `RoundedRectangle` background | raw `ZStack` with opaque layer |
| Divider | `Divider` with `.background(AppColors.divider)` | `Rectangle().frame(height: 1)` |
| Tab bar | Determine if bottom tab, top tabs, segmented control, or paging before using `TabView`. | Universally mapping to `TabView` |
| Navigation bar | `NavigationStack` or `NavigationSplitView` + `.navigationTitle` / `ToolbarItem`. Reuse existing routing. | Universally generating `NavigationView` |
| Modal / Sheet | `.sheet(isPresented:)` for actual sheet presentation | custom overlay `ZStack` |
| Alert | `.alert(...)` | custom overlay `ZStack` |
| Bottom sheet | `confirmationDialog` for system actions, `.sheet` for actual sheets, or custom project component. | Universally mapping to `confirmationDialog` |
| Progress | `ProgressView` | custom `Rectangle` fill |

**ZStack must only be used when Figma layers explicitly overlap. Do NOT use ZStack merely to reproduce arbitrary x/y coordinates when the Figma design uses Auto Layout.**

---

## A-RULE 1 — VIEW IS FOR STRUCTURE AND BEHAVIOR ONLY; FIGMA IS THE VISUAL SOURCE

SwiftUI views must be used for semantic structure, user interaction binding, accessibility, and navigation behavior.

SwiftUI view default visual properties must NOT be treated as the visual source of truth.

All visual styling (colors, sizes, spacing, typography, radius, shadow) must come from Figma.

---

## A-RULE 2 — OVERRIDE ALL SWIFTUI DEFAULTS

For every SwiftUI view used, override all default visual properties to match Figma exactly.

Mandatory modifier override list:
- `.frame(...)` — use semantic sizing (flexible for Fill, intrinsic for Hug, exact only for Fixed).
- `.padding(...)` — exact per-side padding from Figma. Use parent padding rather than arbitrary child offsets.
- `.font(...)` — exact font from Figma (size, weight, design) + `.weight()` chain for system fallback
- `.foregroundColor(...)` — exact color from AppColors
- `.background(...)` — exact fill color or gradient
- `.cornerRadius(...)` — exact radius from Figma
- `.shadow(color:, radius:, x:, y:)` — exact shadow from Figma
- `.overlay(...)` — border applied via overlay with exact color and lineWidth
- `.lineSpacing(...)` — exact line height derived from Figma (`lineHeight - fontSize`)
- `.tracking(...)` — exact letterSpacing from Figma
- `.multilineTextAlignment(...)` — match Figma text alignment

Never rely on SwiftUI default spacing, font sizes, or colors.

---

## A-RULE 3 — DESIGN TOKEN EXTRACTION (MANDATORY)

Use `get_variable_defs` whenever Figma variables are available. Preserve semantic variable identity.
For example, if Figma provides `color/text/primary`, it MUST become `AppColors.textPrimary`.
Do NOT generate `Color(red: 0.2, ...)` or `Color(hex: "#222")` inside views when the value originated from a semantic Figma variable.
Do not create duplicate hardcoded token values unnecessarily. If the project already has an equivalent token file, reuse it.

If missing, generate an appropriate structure:
```
<FeatureFolder>/Theme/AppColors.swift
<FeatureFolder>/Theme/AppTypography.swift
<FeatureFolder>/Theme/AppSpacing.swift
<FeatureFolder>/Theme/AppRadius.swift
<FeatureFolder>/Theme/AppShadows.swift
<FeatureFolder>/Theme/AppTheme.swift
```
The generated UI must consume these tokens (e.g. `AppSpacing.medium` instead of `padding(16)` unless genuinely hardcoded).

→ See examples/ios-code-examples.md — SwiftUI — Token Files

---

## A-RULE 4 — RESPONSIVE AND DIMENSION ENFORCEMENT (NO "FRAME EVERY VIEW")

Do NOT automatically generate `.frame(width: ..., height: ...)` for every Figma node.
Only use fixed dimensions when the dimension is semantically fixed.

- **Fill**: Use flexible sizing (e.g., `.frame(maxWidth: .infinity)`).
- **Hug**: Use intrinsic sizing.
- **Constraints**: Map min/max Figma constraints to `.frame(minWidth: ..., maxWidth: ...)`.

Prefer appropriate adaptive mechanisms: flexible frames, adaptive stacks, `ViewThatFits`, size classes, `layoutPriority`.
Use `GeometryReader` ONLY when genuinely required. Do NOT hardcode one Figma device width.

**Safe-Area Interpretation**:
Detect Figma layouts that represent top/bottom safe areas, navigation areas, tab-bar areas, or edge-to-edge backgrounds. Map them appropriately for SwiftUI native safe-area behavior (using `.ignoresSafeArea()` where intended). Do NOT add arbitrary padding to compensate for device safe areas manually.

---

## A-RULE 5 — TYPOGRAPHY AND DYNAMIC TYPE LOCK

Typography must be copied exactly from Figma (extract font family, style, weight, size, line height, letter spacing, alignment, transform).

**Dynamic Type Validation**:
1. Preserve Figma typography while making it compatible with the project's Dynamic Type strategy.
2. Avoid fixed-height text containers that clip larger text.
3. Ensure multiline content can expand where required.
4. Test larger accessibility text sizes.

### Weight enforcement — chain `.weight()` on every `Font.custom`

Always chain `.weight()` on `Font.custom(...)` so that if the custom font is not registered the system-font fallback uses the correct weight instead of defaulting to `.regular`.

```swift
//  CORRECT — weight chain guarantees correct rendering with OR without custom font
Text(someText)
    .font(AppTypography.title())   // Font.custom("Rubik-Light", size: 18).weight(.medium)
    .foregroundColor(AppColors.textPrimary)

//  WRONG — falls back to system regular when custom font is not registered
Text(someText)
    .font(Font.custom("Rubik-Medium", size: 18))
```

### Font role table — apply consistently for every text element

| Figma text role | `AppTypography` function | Required `.weight()` fallback |
|---|---|---|
| Screen / section heading | `title()` — size 18 | `.weight(.medium)` |
| Form field label | `label()` — size 14 | `.weight(.medium)` |
| Input placeholder / body copy | `body1()` — size 14 | `.weight(.regular)` |
| Caption / subtitle / tracker label | `caption()` — size 12 | `.weight(.regular)` |
| CTA button text | `buttonLabel()` — size 14 | `.weight(.medium)` |

Never use `.font(.headline)`, `.font(.body)`, `.font(.system(size:))` or any SwiftUI system font when Figma specifies a custom font family.

Register custom fonts in `Info.plist` under `UIAppFonts` and verify with `UIFont.familyNames` at launch.
**Never silently replace a Figma-specified custom font. Only use a fallback when the original font genuinely cannot be obtained.**

### Font file acquisition and registration protocol (MANDATORY before writing AppTypography)

Font files MUST be valid binary TrueType/OpenType files.
**Never assume the font filename is the PostScript name.**

#### Step 1 — Identify the correct PostScript name
The string passed to `Font.custom(...)` must be the font's **PostScript name**.
Use Python + fonttools to read PostScript names from any font file:
```bash
python3 -c "
from fontTools.ttLib import TTFont
tt = TTFont('path/to/font.ttf')
for r in tt['name'].names:
    if r.nameID in (1,4,6) and r.platformID in (1,3):
        print(r.nameID, r.toUnicode())
"
# Output:
# 1  Rubik Light       ← family name (do NOT use)
# 4  Rubik Light       ← full name (do NOT use)
# 6  Rubik-Light       ← PostScript name  USE THIS in Font.custom()
```

#### Step 2 — Handle variable fonts
Google Fonts now ships many font families as **variable fonts only**. These contain the full weight axis in a single file. Preserve supported axes and weights.
- Rename bracket characters out of the filename before adding to Xcode: `Rubik[wght].ttf` → `RubikVariable.ttf`
- `Font.custom(postScriptName, size:).weight(.medium)` drives the weight axis at runtime.

#### Step 3 — Info.plist UIAppFonts
List the exact filenames as they exist on disk (case-sensitive, no brackets).

#### Step 4 — Verify registration at launch
Verify the font loaded at runtime. If missing, fail the generation unless a fallback was explicitly requested.

---

## A-RULE 6 — BUTTON STRICT CONTROL

Every Figma button MUST use a `Button` view. Using `.onTapGesture` on a `Text` or `HStack` is STRICTLY FORBIDDEN.

```swift
//  CORRECT — Primary CTA (gradient pill)
Button(action: onContinue) {
    Text("CONTINUE")
        .font(AppTypography.buttonLabel())
        .foregroundColor(AppColors.surface)
        .frame(maxWidth: .infinity)
        .frame(height: AppSpacing.buttonHeight)
}
.background(
    LinearGradient(colors: [Color(hex: "#FF6700"), Color(hex: "#FE8E0C")],
                   startPoint: .leading, endPoint: .trailing)
)
.cornerRadius(AppRadius.button)

//  CORRECT — Secondary / Outlined
Button(action: onSave) {
    Text("SAVE TO CART")
        .font(AppTypography.buttonLabel())
        .foregroundColor(AppColors.accent)
        .frame(maxWidth: .infinity)
        .frame(height: AppSpacing.buttonHeight)
}
.background(AppColors.surface)
.cornerRadius(AppRadius.button)
.overlay(RoundedRectangle(cornerRadius: AppRadius.button).stroke(AppColors.accent, lineWidth: 1))
```

---

## A-RULE 7 — ICON AND ASSET CONTROL

- **Figma Asset Downloads**: All extracted Figma assets must be stored in `Assets.xcassets/Figma/` and referenced with `Image("asset-name")`. Verify every asset referenced actually exists. Code generation MUST fail if a referenced asset is missing.
- **No Guessing/Hallucination**: SF Symbol names must NOT be guessed, assumed, or hallucinated. ONLY use `Image(systemName:)` when the design/project explicitly maps the asset to an SF Symbol. Do NOT replace custom Figma assets with guessed SF Symbols.
- **Common Asset Mappings**: Use these standard system symbol mappings for common assets when using SF Symbols is explicitly allowed or required:
  - **Fingerprint / Touch ID**: `touchid`
  - **Face ID**: `faceid`
  - **Backspace / Delete**: `delete.left` (or `delete.left.fill` / `delete.backward`)

---

## A-RULE 8 — DIVIDER CONTROL

- **Centered Dividers in HStack**: For horizontal divider structures flanking text in SwiftUI (e.g., `─── OR ───` inside an `HStack`), always use `Divider()` on either side of the text. `Divider()` naturally expands equally, preventing the unequal alignment or collapsing issues seen in UIKit, guaranteeing that the flanking lines remain balanced and the text is centered.

```swift
// CORRECT — Centered dividers flanking text in SwiftUI
HStack(spacing: AppSpacing.md) {
    Divider()
        .background(AppColors.divider)
    Text("OR")
        .font(AppTypography.caption())
        .foregroundColor(AppColors.textSecondary)
    Divider()
        .background(AppColors.divider)
}
.frame(height: 20)
```

---

## A-RULE 9 — TEST IDENTIFIERS & REAL ACCESSIBILITY (MANDATORY)

Do NOT treat `accessibilityIdentifier` as the complete accessibility implementation. Separate UI testing needs from accessibility semantics.

**UI Test Identifiers**:
- Use `accessibilityIdentifier` for actionable controls, fields, navigation controls, and important test targets. Every actionable/important UI view element must have a test ID.

**Accessibility Semantics**:
- Extract and map (where present): accessibility label, hint, value, traits/role, heading status, grouping, disabled state, and actionable state.
- **Decorative Elements**: Decorative visual elements should NOT unnecessarily become accessibility elements. Apply `.accessibilityHidden(true)` to purely decorative images or background shapes.

Every UI view element must have a test ID. Define these in a separate file (e.g. `TestIdentifiers.swift`) as a struct containing static constants. Bind these test IDs via `.accessibilityIdentifier(...)`.

### Example `TestIdentifiers.swift`
```swift
import Foundation

struct TestIdentifiers {
    static let loginTitle = "login_label_title"
    static func loginDropdownOption(index: Int, value: String) -> String {
        let normalized = value.lowercased().replacingOccurrences(of: " ", with: "_")
        return "login_dropdown_option_\(index)_\(normalized)"
    }
}
```

### Usage in SwiftUI View
```swift
struct LoginView: View {
    let options = ["Self", "Spouse", "Child"]
    
    var body: some View {
        VStack {
            Text("Login")
                .accessibilityIdentifier(TestIdentifiers.loginTitle)
                .accessibilityAddTraits(.isHeader) // Extracted from Figma
                
            ForEach(0..<options.count, id: \.self) { index in
                Button(action: {}) {
                    Text(options[index])
                }
                .accessibilityIdentifier(TestIdentifiers.loginDropdownOption(index: index, value: options[index]))
                .accessibilityHint("Selects \(options[index]) option") // Extracted from Figma
            }
        }
    }
}
```

---

## A-RULE 10 — MOTION AND ANIMATION SUPPORT

If Figma contains animation information:
1. Use `get_motion_context` to extract animated properties, duration, delay, easing, keyframes, and sequencing.
2. Translate this into SwiftUI animation APIs (e.g., `withAnimation`, `.animation(.easeInOut(duration: ...))`).
3. Preserve timing/easing where supported.
Do not invent animation when Figma does not provide evidence.

---

## A-RULE 11 — REALISTIC CONTENT VALIDATION (MANDATORY)

A generated screen MUST NOT be considered complete if it matches the Figma screenshot only because it uses the exact sample content. The implementation must remain structurally correct when realistic content varies.

For applicable text/content fields, you MUST validate:
1. **Short content**
2. **Normal content**
3. **Long content**
4. **Multiline content**
5. **Localized/translated content** (e.g. English, Hindi, Marathi) when localization is applicable
6. **Empty content**
7. **Error content**
8. **Loading content**

**Validation Checks**: Check for text clipping, unexpected truncation, overlapping views, broken constraints, compressed buttons, incorrect content wrapping, incorrect vertical spacing, horizontal overflow, broken scrolling, layout collapse, and incorrect alignment.

---

## A-RULE 12 — FIGMA COMPONENT VARIANT/STATE VALIDATION (MANDATORY)

For every relevant Figma COMPONENT, COMPONENT_SET, INSTANCE, VARIANT, or COMPONENT PROPERTY, you must identify its visual/interaction states (e.g. enabled/disabled, selected/unselected, loading, error).

**Mandatory Variant Coverage Check**:
Before implementation is considered complete, produce an internal coverage mapping:
`Figma Component` → `Variant/Property` → `iOS Representation` → `Implemented?` → `Validated?`

**FAIL CONDITION**:
A Figma component variant, state, or component property that affects the generated UI is discovered but silently ignored or omitted from the iOS implementation. 
Do not mark a missing variant as "Not applicable" without evidence; explicitly distinguish between "Not applicable" and "Missing implementation".
