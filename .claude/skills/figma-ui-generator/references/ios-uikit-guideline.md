# iOS UIKit / Storyboard / XIB Guideline (Part B + C)

> This file covers PART B (UIKit) and PART C (Storyboard/XIB).
> For SwiftUI delivery, load `references/ios-guideline-swiftui.md` instead.

## DELIVERY MODE DETECTION (from Part A — reproduced here for reference)

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


<!-- Delivery mode detection rules are reproduced above. Full SwiftUI rules are in ios-guideline-swiftui.md. -->

# PART B — UIKit (Storyboard / XIB / Programmatic)

Apply every rule in this part when delivery mode is **Storyboard**, **XIB**, or **Programmatic UIKit**.

---

## B — VIEW-FIRST RULE (TOP PRIORITY)

Always use the **semantically correct UIKit class** for every Figma element.

### UIKit View Mapping

| Figma element | Required UIKit class | FORBIDDEN alternative |
|---|---|---|
| Text / Label / Heading | `UILabel` with exact `font`, `textColor`, `numberOfLines` | `UITextField` for display-only text |
| Single-line text input | `UITextField` with exact border, font, padding | `UILabel` with `isUserInteractionEnabled` |
| Password input | `UITextField` with `isSecureTextEntry = true` | custom overlay |
| Multi-line input | `UITextView` | `UITextField` |
| Dropdown / Picker | `UIPickerView` or `UIButton` + `UIMenu` (iOS 14+) | custom overlay |
| Primary / CTA button | `UIButton` with exact `backgroundColor`, `cornerRadius`, `titleFont` | `UILabel` with `UITapGestureRecognizer` |
| Secondary / Outlined button | `UIButton` with `layer.borderWidth`, `layer.borderColor` | `UILabel` with tap gesture |
| Checkbox | Custom `UIControl` subclass or toggle `UIButton` | raw `UILabel` |
| Switch / Toggle | `UISwitch` | `UIButton` faking a switch |
| Image | `UIImageView` with exact frame + `contentMode` | `UIView` with background pattern |
| Icon | `UIImageView` with exact frame + `tintColor` | `UILabel` with symbol character |
| Card / Panel | `UIView` with `layer.cornerRadius`, `layer.shadowColor`, etc. | raw stacking of unrelated views |
| Horizontal stack | `UIStackView` with `axis = .horizontal`, exact `spacing` | manual frame layout |
| Vertical stack | `UIStackView` with `axis = .vertical`, exact `spacing` | manual frame layout |
| Divider | `UIView` with exact `backgroundColor` and `heightAnchor = 1` | `UILabel` of dashes |
| List | `UITableView` or `UICollectionView` | nested `UIStackView` for long lists |
| Grid | `UICollectionView` with `UICollectionViewFlowLayout` | nested `HStack`-style `UIStackView` |
| Scroll container | `UIScrollView` wrapping content `UIView` | `UITableView` with one cell |
| Navigation bar | `UINavigationBar` / `UINavigationController` | custom `UIView` pinned at top |
| Tab bar | `UITabBar` / `UITabBarController` | custom `UIView` at bottom |
| Modal / Sheet | `UIViewController` via `.present(_:animated:)` | custom overlay `UIView` |
| Alert | `UIAlertController` | custom overlay `UIView` |
| Progress | `UIProgressView` | custom `UIView` fill |

---

## B-RULE 1 — VIEW IS FOR STRUCTURE AND BEHAVIOR ONLY; INTERPRET FIGMA SEMANTICS

UIKit views must be used for semantic structure, user interaction binding, accessibility, and navigation behavior.

UIKit view default visual properties must NOT be treated as the visual source of truth.

Do not directly translate raw Figma coordinates into UIKit frames. Instead, interpret the design semantics (colors, sizes, spacing, typography, radius, shadow) and map them to appropriate UIKit properties and Auto Layout constraints.

---

## B-RULE 2 — OVERRIDE ALL UIKIT DEFAULTS

Mandatory property override list:
- `widthAnchor`, `heightAnchor` constraints — use ONLY when the dimension is semantically fixed. Otherwise use intrinsic sizing or leading/trailing anchors.
- `layoutMargins` / `contentInset` — exact per-side padding from Figma
- `font` — exact `UIFont` (name, size, weight) from Figma
- `textColor` — exact `UIColor` from AppColors
- `backgroundColor` — exact fill color
- `layer.cornerRadius` — exact radius from Figma
- `layer.borderWidth` + `layer.borderColor` — exact border from Figma
- `layer.shadowColor`, `layer.shadowOpacity`, `layer.shadowRadius`, `layer.shadowOffset` — exact shadow from Figma

---

## B-RULE 3 — DESIGN TOKEN EXTRACTION (MANDATORY)

All design values must be extracted from Figma and placed in:

```
<FeatureFolder>/Theme/AppColors.swift      // Only for colors
<FeatureFolder>/Theme/AppTypography.swift  // Only for fonts and typography
<FeatureFolder>/Theme/AppSpacing.swift     // Only for spacing, padding, and gaps
<FeatureFolder>/Theme/AppRadius.swift      // Only for corner radius
<FeatureFolder>/Theme/AppShadows.swift     // Only for shadows
<FeatureFolder>/Theme/AppDimensions.swift  // Only for fixed semantic dimensions
<FeatureFolder>/Theme/AppTheme.swift       // Core theme aggregator
```

**Token Responsibility**: Do NOT mix token categories (e.g., never use `AppRadius.card` as a spacing constraint). One-off implementation values may remain local literals when they genuinely are not design-system tokens. 
Token files use `UIColor`, `UIFont`, and `CGFloat` — NOT `Color` or `Font`. Preserve semantic token identities (e.g., `AppColors.textPrimary`) rather than hardcoding colors directly from Figma hex values when a token exists.

→ See examples/ios-code-examples.md — UIKit — Token Files

---

## B-RULE 4 — AUTO LAYOUT STRICT CONTROL

All constraint constants must come from Figma via `AppSpacing` / `AppRadius` tokens.

```swift
//  CORRECT
NSLayoutConstraint.activate([
    label.topAnchor.constraint(equalTo: container.topAnchor, constant: AppSpacing.md),
    label.leadingAnchor.constraint(equalTo: container.leadingAnchor, constant: AppSpacing.lg),
    label.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -AppSpacing.lg),
    label.heightAnchor.constraint(equalToConstant: 18)
])

//  WRONG — magic number
label.topAnchor.constraint(equalTo: container.topAnchor, constant: 15)
```

For `UIStackView`:
```swift
let stack = UIStackView()
stack.axis    = .vertical
stack.spacing = AppSpacing.fieldGap
stack.layoutMargins = UIEdgeInsets(top: 12, left: 16, bottom: 12, right: 16)
stack.isLayoutMarginsRelativeArrangement = true
```

### Centered Dividers Rule
For horizontal divider structures flanking text (e.g., `─── OR ───` in UIKit), always ensure that the left and right divider lines are constraint-locked to have equal width so that the text remains perfectly centered.

```swift
//  CORRECT — Equating flanking line widths
NSLayoutConstraint.activate([
    leftDividerLine.widthAnchor.constraint(equalTo: rightDividerLine.widthAnchor),
    leftDividerLine.heightAnchor.constraint(equalToConstant: 1),
    rightDividerLine.heightAnchor.constraint(equalToConstant: 1)
])
```

---

## B-RULE 5 — TYPOGRAPHY AND DYNAMIC TYPE LOCK

Use `NSMutableParagraphStyle` to apply Figma line heights. Ensure labels and text fields support Dynamic Type using `UIFontMetrics` when appropriate.

```swift
let para = NSMutableParagraphStyle()
para.minimumLineHeight = AppTypography.body1LineHeight
para.maximumLineHeight = AppTypography.body1LineHeight

label.attributedText = NSAttributedString(string: "Text", attributes: [
    .font:           AppTypography.body1(),
    .foregroundColor: AppColors.textPrimary,
    .paragraphStyle: para
])
label.adjustsFontForContentSizeCategory = true
```

**Dynamic Type Validation (MANDATORY)**:
You MUST validate the UI at `default`, `larger accessibility size`, and `extra-large accessibility size`. Fail the validation if supported sizes cause clipping, overlap, unreadable text, or hidden controls. Do not solve Dynamic Type failures by simply reducing font size unless the design system explicitly allows it.

---

## B-RULE 6 — BUTTON STRICT CONTROL

Every Figma button MUST be a `UIButton`. `UITapGestureRecognizer` on a `UILabel` or `UIView` is STRICTLY FORBIDDEN.

```swift
//  CORRECT — Outlined secondary button
let saveButton = UIButton(type: .custom)
saveButton.setTitle("SAVE TO CART", for: .normal)
saveButton.setTitleColor(AppColors.accent, for: .normal)
saveButton.titleLabel?.font   = AppTypography.buttonLabel()
saveButton.heightAnchor.constraint(equalToConstant: AppSpacing.buttonHeight).isActive = true
saveButton.layer.cornerRadius = AppRadius.button
saveButton.layer.borderWidth  = 1
saveButton.layer.borderColor  = AppColors.accent.cgColor
saveButton.backgroundColor    = AppColors.surface
```

For gradient CTAs, apply `CAGradientLayer` in `viewDidLayoutSubviews()` — NEVER in `viewDidLoad()` (bounds are zero at that point). Always remove stale gradient sublayers before inserting a new one (see B-RULE 29).

```swift
override func viewDidLayoutSubviews() {
    super.viewDidLayoutSubviews()
    ctaButton.layer.sublayers?
        .filter { $0 is CAGradientLayer }
        .forEach { $0.removeFromSuperlayer() }
    let g = CAGradientLayer()
    g.frame      = ctaButton.bounds
    g.colors     = [UIColor(hex: "#FF6700").cgColor, UIColor(hex: "#FE8E0C").cgColor]
    g.startPoint = CGPoint(x: 0, y: 0.5); g.endPoint = CGPoint(x: 1, y: 0.5)
    ctaButton.layer.insertSublayer(g, at: 0)
}
```

---

## B-RULE 7 — INPUT AND FORM FIELD STRICT CONTROL

Every Figma text field MUST be `UITextField` or `UITextView`. Tappable `UIView` + gesture recogniser faking an input is STRICTLY FORBIDDEN.

```swift
let field = UITextField()
field.placeholder        = "Enter your full name as per your PAN card"
field.font               = AppTypography.body1()
field.textColor          = AppColors.textPrimary
field.backgroundColor    = AppColors.surface
field.layer.cornerRadius = AppRadius.input
field.layer.borderWidth  = 1
field.layer.borderColor  = AppColors.border.cgColor
field.heightAnchor.constraint(equalToConstant: AppSpacing.fieldHeight).isActive = true
field.leftView  = UIView(frame: CGRect(x: 0, y: 0, width: 12, height: 1))
field.leftViewMode = .always
field.delegate = self
```

Focus state via `UITextFieldDelegate`:
```swift
func textFieldDidBeginEditing(_ tf: UITextField) {
    tf.layer.borderColor = AppColors.borderFocus.cgColor; tf.layer.borderWidth = 2
}
func textFieldDidEndEditing(_ tf: UITextField) {
    tf.layer.borderColor = AppColors.border.cgColor; tf.layer.borderWidth = 1
}
```

---

## B-RULE 8 — STORYBOARD DELIVERY STRATEGY

When delivery mode is **Storyboard**:

1. Generate a `UIViewController` subclass Swift file per screen
2. Declare all `@IBOutlet` properties typed to the correct UIKit class
3. Declare all `@IBAction` methods for every interactive element
4. Apply all visual styling in `viewDidLoad()` using token constants — NOT in IB attributes panel
5. Apply gradients in `viewDidLayoutSubviews()`
6. Do NOT generate `.storyboard` XML — only generate the Swift companion file
7. Document every outlet/action with a Figma node name and ID comment

```swift
//  CORRECT — Storyboard VC structure (replace <ComponentName> with your class)
final class <ComponentName>ViewController: UIViewController {

    // MARK: - Outlets (add Figma node ID comment per outlet)
    @IBOutlet private weak var titleLabel:     UILabel!
    @IBOutlet private weak var primaryField:   UITextField!
    @IBOutlet private weak var primaryButton:  UIButton!

    override func viewDidLoad() {
        super.viewDidLoad()
        // Apply all visual styling here using token constants
        // Do NOT set visual properties in IB attributes panel
        styleTextField(primaryField, placeholder: "Enter value")
        styleButton(primaryButton)
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        // Apply gradients here (bounds are final after layout)
    }

    @IBAction private func primaryButtonTapped(_ sender: UIButton) { }
}
```

---

## B-RULE 9 — XIB DELIVERY STRATEGY

When delivery mode is **XIB**:

1. Generate a `UIView` subclass Swift file per component
2. Call `commonInit()` from both `init(frame:)` and `init?(coder:)` to load the XIB and apply styling
3. Apply all visual styling in `commonInit()` or `awakeFromNib()` using token constants
4. Do NOT generate `.xib` XML files — only generate the Swift companion file

```swift
final class PersonalDetailsFormView: UIView {
    @IBOutlet private weak var contentView:   UIView!
    @IBOutlet private weak var titleLabel:    UILabel!
    @IBOutlet private weak var fullNameField: UITextField!

    override init(frame: CGRect) { super.init(frame: frame); commonInit() }
    required init?(coder: NSCoder) { super.init(coder: coder); commonInit() }

    private func commonInit() {
        UINib(nibName: "PersonalDetailsFormView", bundle: nil).instantiate(withOwner: self)
        contentView.frame = bounds; addSubview(contentView)
        titleLabel.font      = AppTypography.title()
        titleLabel.textColor = AppColors.textPrimary
    }
}
```

---

## B-RULE 10 — PROGRAMMATIC UIKIT DELIVERY STRATEGY

When delivery mode is **Programmatic UIKit**:

1. Build entire view hierarchy in `viewDidLoad()` or `loadView()`
2. Set `translatesAutoresizingMaskIntoConstraints = false` on every programmatically created view
3. Activate all constraints in a single `NSLayoutConstraint.activate([...])` call per view
4. Use `UIScrollView` wrapping a content `UIView` for scrollable screens

---

## B-RULE 11 — CORNER RADIUS AND CLIPSTOBOUNDS

When a view has both `layer.cornerRadius` AND a shadow, use a shadow-container + clipping-inner pattern:

```swift
let shadowContainer = UIView()
AppShadows.applyCard(to: shadowContainer.layer)

let contentView = UIView()
contentView.layer.cornerRadius = AppRadius.card
contentView.clipsToBounds      = true
shadowContainer.addSubview(contentView)
```

---

## B-RULE 12 — IMAGE STRICT CONTROL (SEMANTIC SIZING)

Never convert a Figma canvas/rendered dimension into a UIKit fixed constraint unless the Figma layout semantics explicitly define that dimension as Fixed.

Map Figma image semantics as follows:
- **Figma Fill**: Pin leading/trailing to the parent/container.
- **Figma Hug**: Let the content determine its size where appropriate (intrinsicContentSize).
- **Figma Fixed**: Use an explicit width/height constraint ONLY when Figma actually defines that dimension as Fixed.
- **Figma aspect-ratio constraint**: Preserve the aspect ratio rather than introducing an arbitrary fixed width.

```swift
//  CORRECT — Example of a Figma "Fill" width image
let iv = UIImageView(image: UIImage(named: "banner_home"))
iv.contentMode = .scaleAspectFill; iv.clipsToBounds = true
iv.translatesAutoresizingMaskIntoConstraints = false
iv.layer.cornerRadius = AppRadius.card

NSLayoutConstraint.activate([
    iv.leadingAnchor.constraint(equalTo: container.leadingAnchor),
    iv.trailingAnchor.constraint(equalTo: container.trailingAnchor),
    iv.heightAnchor.constraint(equalToConstant: 160) // Only if height is Fixed in Figma
])
```

---

## B-RULE 13 — ICON STRICT CONTROL

Icons that come from Figma as SVG/PNG exports MUST be added to `Assets.xcassets/Figma/` and referenced with `UIImage(named: "asset-name")`. Using an SF Symbol as a substitute for a Figma custom icon is FORBIDDEN.

### SF Symbol Validation Rules
- **No Guessing/Hallucination**: SF Symbol names must NOT be guessed, assumed, or hallucinated. Always verify that any SF Symbol name used is valid in the target iOS version's SF Symbols database.
- **Common Asset Mappings**: Use these standard system symbol mappings for common assets when using SF Symbols is explicitly allowed or required:
  - **Fingerprint / Touch ID**: `touchid`
  - **Face ID**: `faceid`
  - **Backspace / Delete**: `delete.left` (or `delete.left.fill` / `delete.backward`)

```swift
//  CORRECT — exported Figma asset
let iconView = UIImageView(image: UIImage(named: "ico_shield_health"))
iconView.tintColor = AppColors.purple
iconView.frame = CGRect(x: 0, y: 0, width: 24, height: 24)

//  CORRECT — verified SF Symbol for biometrics
let bioIconView = UIImageView(image: UIImage(systemName: "touchid"))
bioIconView.tintColor = AppColors.primary
```

---

## B-RULE 14 — RESPONSIVENESS (Safe Area + Trait Collection)

Use leading/trailing anchors with `screenHorizontal` insets for fluid-width elements. Never hardcode a pixel width for something that must fill the screen. 
Use Auto Layout constraints, content hugging, and compression resistance appropriately to replicate Figma's adaptive behaviors (hug/fill/constraints).

```swift
NSLayoutConstraint.activate([
    saveButton.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor,
                                        constant: AppSpacing.screenHorizontal),
    saveButton.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor,
                                         constant: -AppSpacing.screenHorizontal)
])
```

For iPad adaptive layouts, branch in `traitCollectionDidChange(_:)` on `traitCollection.horizontalSizeClass` and use appropriate size classes.

---

## B-RULE 14 — DO NOT STOP AT FIRST GENERATED OUTPUT

After generation: manually compare the UI against the Figma design source, fix all mismatches, and re-verify visually to ensure correctness.

---

## B-RULE 16 — BUILD VALIDATION AND MANUAL VERIFICATION (MANDATORY)

### Build validation

After writing UIKit files, run the Xcode build scheme:

```bash
xcodebuild -scheme <SchemeName> \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build 2>&1 | tail -30
```

Fix all compiler errors before proceeding.

### Manual visual verification

Manually run the screen on the iOS Simulator or device. Visually inspect and compare the interface layout with the Figma layout or screenshot. Adjust views, layouts, and constraints manually to fix mismatches.

---

# PART C — XIB / Storyboard Safe Creation (UIKit only)

> Apply this part when `ios_delivery_mode` is **UIKit + XIB** or **UIKit + Storyboard**.
> Skip entirely for SwiftUI or Programmatic UIKit.

## C-RULE 1 — NEVER hand-author XIB or Storyboard XML from scratch

Xcode's Interface Builder parser enforces a private internal schema. It rejects hand-authored XIB/Storyboard XML with **IB error -1** even when the XML is well-formed. `xmllint` does NOT catch this — only `ibtool` does.

**Mandatory: Do not invent arbitrary XIB/Storyboard XML schemas. Always copy from the official Xcode template and make only valid modifications. Never write XIB/Storyboard XML manually.**

## C-RULE 2 — XIB creation procedure (follow every step)

### Step 1 — Copy the official Xcode template

```bash
TEMPLATE="/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Xcode/Templates/File Templates/iOS/Source/Cocoa Touch Class.xctemplate/UIViewControllerXIBSwift/___FILEBASENAME___.xib"
DEST="<project-path>/<FeatureFolder>/<ComponentName>ViewController.xib"
cp "$TEMPLATE" "$DEST"
```

### Step 2 — Replace the class name placeholder

```bash
sed -i '' 's/___FILEBASENAMEASIDENTIFIER___/<ComponentName>ViewController/g' "$DEST"
```

### Step 3 — Validate with ibtool (BLOCKING — never skip)

```bash
xcrun ibtool --compile /tmp/<ComponentName>.nib "$DEST" 2>&1 && echo "XIB VALID" || echo "XIB INVALID"
```

If output is `XIB INVALID` — fix and re-run. Do NOT deliver the file until this passes.

## C-RULE 3 — What the valid XIB template contains

After `cp` + `sed`, the file must look exactly like this (do not add or remove anything):

→ See examples/ios-code-examples.md — UIKit — XIB Template

## C-RULE 4 — XIB IMPLEMENTATION MODES

Before generating XIB code, determine which mode the existing project uses and preserve that convention. Do NOT mix these models within one implementation.

### Mode A — XIB-backed UI
The XIB contains the required view hierarchy (subviews, stack views, labels).
- Use Xcode tools to generate this XIB if possible, or if hand-authoring is strictly forbidden by project capability, fall back to Mode B or Programmatic UIKit.
- Swift contains: `@IBOutlet` properties, `@IBAction` methods, behavior, state, and dynamic styling (e.g. gradients) applied in `viewDidLoad()`.

### Mode B — XIB skeleton
The XIB contains ONLY the required root structure.
- Swift creates the entire subview hierarchy programmatically.
- `init()` → `super.init(nibName: "<ComponentName>ViewController", bundle: nil)`
- All views declared as `private let` properties.
- Call `addSubviews()` → `setupConstraints()` → `applyStyles()` in `viewDidLoad()`.

If a required UI cannot safely be represented using the existing Storyboard/XIB mechanism (e.g., due to IB error -1 when emitting XML), use the project's supported programmatic UIKit approach instead. Do NOT instruct the agent to hand-author large XML files or split hand-authored XML into multiple generated fragments as a workaround.

## C-RULE 5 — IB error -1 root causes reference

| Wrong pattern | Correct |
|--------------|---------|
| `standalone="no"` missing from XML declaration | Required — must be present |
| `targetRuntime="AppleCocoa Touch"` | Must be `"iOS.CocoaTouch"` |
| `<device>` element present | Must be absent |
| `<deployment>` inside `<dependencies>` | Must be absent |
| `customModule="AppName"` on `IBFilesOwner` | Must be absent — use `customModuleProvider="target"` only |
| `<viewLayoutGuide>` before `<color>` inside `<view>` | `<color>` must come first, then `<viewLayoutGuide>` |
| `<color>` missing `cocoaTouchSystemColor` attribute | Must include `cocoaTouchSystemColor="whiteColor"` |
| XML comments (`<!-- ... -->`) anywhere in file | Must be absent — IB rejects them |

## B-RULE 17 — TEST IDENTIFIERS & REAL ACCESSIBILITY (MANDATORY)

Do NOT treat `accessibilityIdentifier` as the complete accessibility implementation. Separate UI testing needs from accessibility semantics.

**UI Test Identifiers**:
Every actionable UI element must have a test ID created in a separate file (e.g. `TestIdentifiers.swift` in the feature folder) as a struct with static constants for static views, and parameterized static functions for dynamic views (such as list cells, dropdown options, or multi-select items). Assign these identifiers in `setupAccessibilityIdentifiers()` called from `viewDidLoad()`.

**Accessibility Semantics**:
Extract and map (where present): accessibility label, hint, value, traits/role. Set `.isAccessibilityElement = false` for purely decorative visual elements to avoid polluting the accessibility tree.

### Example `TestIdentifiers.swift`
```swift
import Foundation

struct TestIdentifiers {
    // MARK: - LoginViewController
    static let loginTitleLabel = "login_label_title"
    
    // Dynamic identifier function based on dropdown index and value
    static func loginDropdownOption(index: Int, value: String) -> String {
        let normalized = value.lowercased().replacingOccurrences(of: " ", with: "_")
        return "login_dropdown_option_\(index)_\(normalized)"
    }
}
```

### Assignment in ViewController
```swift
class LoginViewController: UIViewController {
    private func setupAccessibilityIdentifiers() {
        titleLabel.accessibilityIdentifier = TestIdentifiers.loginTitleLabel
    }
    
    // In dynamic option cell or dropdown setup:
    // optionView.accessibilityIdentifier = TestIdentifiers.loginDropdownOption(index: index, value: optionText)
}
```

---

## REALISTIC CONTENT VALIDATION (MANDATORY)

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

## FIGMA COMPONENT VARIANT/STATE VALIDATION (MANDATORY)

For every relevant Figma COMPONENT, COMPONENT_SET, INSTANCE, VARIANT, or COMPONENT PROPERTY, you must identify its visual/interaction states (e.g. enabled/disabled, selected/unselected, loading, error).

**Mandatory Variant Coverage Check**:
Before implementation is considered complete, produce an internal coverage mapping:
`Figma Component` → `Variant/Property` → `iOS Representation` → `Implemented?` → `Validated?`

**FAIL CONDITION**:
A Figma component variant, state, or component property that affects the generated UI is discovered but silently ignored or omitted from the iOS implementation. 
Do not mark a missing variant as "Not applicable" without evidence; explicitly distinguish between "Not applicable" and "Missing implementation".

---

> **Runtime safety rules and post-delivery validation** (B-RULE 17–23, C-RULE 6) are in
> `references/ios-uikit-storyboard-rules.md` — load that file alongside this one whenever
> `ios_delivery_mode` is **UIKit + Storyboard** or **UIKit + XIB**.
