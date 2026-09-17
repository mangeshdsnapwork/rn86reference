## A-RULE 7 — INPUT AND FORM FIELD STRICT CONTROL

Every Figma text field MUST use `TextField` or `SecureField`. Tappable `Text`/`HStack` + `.onTapGesture` faking an input is STRICTLY FORBIDDEN.

```swift
//  CORRECT — with focus border state
@FocusState private var isFieldFocused: Bool

TextField("Placeholder", text: $value)
    .font(AppTypography.body1())
    .foregroundColor(AppColors.textPrimary)
    .focused($isFieldFocused)
    .padding(.horizontal, 12)
    .padding(.vertical, 10)
    .frame(height: AppSpacing.fieldHeight)
    .background(AppColors.surface)
    .cornerRadius(AppRadius.input)
    .overlay(
        RoundedRectangle(cornerRadius: AppRadius.input)
            .stroke(isFieldFocused ? AppColors.borderFocus : AppColors.border,
                    lineWidth: isFieldFocused ? 2 : 1)
    )
```

Disabled fields: use a styled `HStack` with a `Text` placeholder. Do NOT use `TextField(_, isDisabled: true)` alone — always apply Figma disabled border and text color.

---

## A-RULE 8 — SAFE AREA, NAVIGATION HEADER, AND SYSTEM STATUS BAR

### Status bar — do NOT render a custom system-bar view inside the app

The iOS system status bar (time, signal, battery) is rendered by the OS and is always present above the app's safe area. Rendering a custom `systemBar` view inside the screen creates a **double status bar** and inflates the header height.

```swift
//  WRONG — renders a second fake status bar below the real one
private var headerSection: some View {
    VStack(spacing: 0) {
        systemBar   // ← never add this; the OS already shows the real status bar
        actionBar
        trackerCard
    }
}

//  CORRECT — only the action bar and tracker are app-owned
private var headerSection: some View {
    VStack(spacing: 0) {
        actionBar
        trackerCard
    }
    .background(
        AppColors.navy
            .ignoresSafeArea(edges: .top)  // navy extends behind the real status bar
    )
}
```

### Navigation header height — match Figma exactly

The action bar (`UINavigationBar` / custom action bar) height is specified in Figma. Do NOT pad it with extra top/bottom padding beyond the Figma value. Typical Figma action bar = 50 pt (title + vertical padding).

```swift
//  CORRECT — matches Figma action bar height of 50pt
private var actionBar: some View {
    HStack(spacing: 0) {
        backButton
        Spacer()
        Text("Personal details")
            .font(AppTypography.title())
            .foregroundColor(AppColors.surface)
        Spacer()
        Color.clear.frame(width: 11.667, height: 22)  // balance spacer
    }
    .padding(.horizontal, AppSpacing.xl)  // 16pt from Figma
    .padding(.vertical, 14)               // exact Figma vertical pad
    // total height = 22 (icon) + 2×14 (padding) = 50pt 
}

//  WRONG — extra padding inflates header; title appears cramped or clipped
    .padding(.vertical, AppSpacing.xxl)  // 24pt over-pad
```

### Safe area — extend background color, not layout

Use `.background(Color.ignoresSafeArea(edges: .top))` on the background modifier. Never apply `.ignoresSafeArea` to the outer `VStack` — that pushes layout content behind the Dynamic Island.

```swift
//  CORRECT — color fills behind status bar; layout is safe-area-aware
.background(AppColors.navy.ignoresSafeArea(edges: .top))

//  WRONG — entire VStack layout enters the Dynamic Island region
VStack { ... }.ignoresSafeArea(edges: .top)
```

---

## A-RULE 9 — RESPONSIVENESS (GeometryReader / .frame)

Never hardcode screen-width values on fluid elements.

```swift
//  CORRECT — full width button
Button(action: onTap) {
    Text("Continue").frame(maxWidth: .infinity).frame(height: 52)
}
.padding(.horizontal, AppSpacing.screenHorizontal)

//  WRONG — hardcoded width breaks on non-375pt screens
TextField("Value", text: $v).frame(width: 343)
```

Use `GeometryReader` for layout branches at iPad width (≥ 768 pt).

---

## A-RULE 10 — IMAGE STRICT CONTROL

```swift
//  CORRECT
Image("banner_home")
    .resizable()
    .scaledToFill()
    .frame(width: 343, height: 160)
    .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))

//  WRONG — auto-sized image
Image("banner_home").resizable()
```

---

## A-RULE 11 — ICON STRICT CONTROL

Icons that come from Figma as SVG/PNG exports MUST be added to `Assets.xcassets/Figma/` and referenced with `Image("asset-name")`. Using an SF Symbol as a substitute for a Figma custom icon is **FORBIDDEN** unless the Figma design layer name explicitly references an SF Symbol.

### Identification rule

Before picking an icon, inspect the Figma layer name and component description:
- If the Figma layer is named after a real SF Symbol (e.g. `chevron.left`, `magnifyingglass`) → use `Image(systemName:)`
- If the Figma layer is a custom SVG shape (e.g. `Shape/healthinsurance-protect-sheld`, `ico_plus_circle`, component instances) → export the SVG, add to `Assets.xcassets/Figma/`, and use `Image("asset-name")`
- Never guess a "close-enough" SF Symbol. A `+` circle in Figma is NOT `shield.fill`; a custom health icon is NOT `lock.shield.fill`.

```swift
//  CORRECT — exported Figma asset
Image("ico_product_lamf")          // exported from Figma, added to xcassets
    .resizable()
    .renderingMode(.template)
    .foregroundColor(AppColors.purple)
    .frame(width: 24, height: 24)

//  WRONG — guessed SF Symbol; shape and meaning do not match Figma
Image(systemName: "lock.shield.fill")
Image(systemName: "shield.fill")
```

If the Figma asset cannot be exported yet, add a `// TODO: replace Image(systemName:"placeholder") with Image("ico_xxx") once asset is in xcassets` comment and use a visually neutral placeholder (`circle.fill`, not a misleading shape).

---

## A-RULE 12 — BORDER AND RADIUS ACCURACY

Apply borders via `.overlay` with `RoundedRectangle` — never `.border()` modifier which applies square corners.

```swift
//  CORRECT
.overlay(RoundedRectangle(cornerRadius: AppRadius.input).stroke(AppColors.border, lineWidth: 1))

//  WRONG
.border(AppColors.border, width: 1)
```

---

## A-RULE 13 — SHADOW AND SURFACE ACCURACY

```swift
//  CORRECT
.shadow(color: AppShadows.Card.color,
        radius: AppShadows.Card.radius,
        x: AppShadows.Card.x,
        y: AppShadows.Card.y)
```

---

## A-RULE 14 — DO NOT STOP AT FIRST GENERATED OUTPUT

After generation: manually compare the UI against the design source, fix all layout mismatches, and re-verify visually to ensure correctness.

---

## A-RULE 16 — BUILD VALIDATION AND MANUAL VERIFICATION (MANDATORY)

### Build validation

After writing all SwiftUI files, run the Xcode build to catch compile-time errors:

```bash
xcodebuild -scheme <SchemeName> \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build 2>&1 | tail -30
```

Fix all errors before proceeding.

### Manual visual verification

Manually run the SwiftUI View on the iOS Simulator or device. Visually compare it against the Figma design or design screenshot. Fix all layout and visual mismatches before completing.

---

## A-RULE 15 — CHIP / SELECTION TILE STRICT CONTROL

Every Figma chip, radio button, or selection tile MUST implement **both** the unselected and selected visual states exactly as Figma specifies. Do NOT use the same background or border for both states.

### Required state spec (extract exact values from Figma per design)

| State | Background | Border | Text color | Text weight |
|---|---|---|---|---|
| **Unselected** | `AppColors.surface` (white) | 1pt solid `AppColors.navy` | `AppColors.navy` | regular |
| **Selected** | `AppColors.navy` (filled) | none (same as bg, invisible) | `AppColors.surface` (white) | regular |

### Implementation pattern

```swift
//  CORRECT — chip button with explicit selected/unselected state
private func chipButton(
    _ title: String,
    isSelected: Bool,
    onTap: @escaping () -> Void
) -> some View {
    Button(action: onTap) {
        Text(title)
            .font(AppTypography.body1())                          // Figma: Regular 14
            .foregroundColor(isSelected                           // text color flips
                ? AppColors.surface
                : AppColors.navy)
            .padding(.horizontal, AppSpacing.chipPadding)         // exact Figma horizontal pad
            .frame(height: AppSpacing.chipHeight)                 // exact Figma height (36pt)
    }
    .background(isSelected ? AppColors.navy : AppColors.surface)  // filled vs white
    .cornerRadius(AppRadius.chip)                                 // 8pt from Figma
    .overlay(
        RoundedRectangle(cornerRadius: AppRadius.chip)
            .stroke(
                isSelected ? Color.clear : AppColors.navy,        // border hidden when selected
                lineWidth: 1
            )
    )
}
```

### State management

```swift
@State private var selectedGender:     String? = nil
@State private var selectedEmployment: String? = nil

// Pass binding to chipButton:
chipButton("Male",   isSelected: selectedGender == "Male")   { selectedGender = "Male" }
chipButton("Female", isSelected: selectedGender == "Female") { selectedGender = "Female" }
```

### FORBIDDEN patterns

```swift
//  WRONG — same chipInactiveBg (#F2F2F2) for selected state
.background(isSelected ? AppColors.chipInactiveBg : AppColors.surface)

//  WRONG — border always visible, even when chip is selected (selected should be filled)
.overlay(RoundedRectangle(cornerRadius: AppRadius.chip).stroke(AppColors.navy, lineWidth: 1))

//  WRONG — text color does not change between states
.foregroundColor(AppColors.navy)
```

### Layout rule for chip rows

- Chips in a horizontal group: use `HStack(spacing: AppSpacing.chipGap)` where `chipGap = 8` (from Figma)
- Do NOT use `Spacer()` between chips unless Figma shows justified spacing
- Each chip width is intrinsic (content-driven with horizontal padding) — do NOT use `.frame(maxWidth: .infinity)` on chips

---
