# iOS UIKit — Storyboard / XIB Runtime Safety Rules

> Load this file alongside `ios-uikit-guideline.md` whenever `ios_delivery_mode` is
> **UIKit + Storyboard** or **UIKit + XIB**.
>
> Rules here (B-RULE 17–23) encode bugs discovered during production screen generation
> that are silent at compile time but cause crashes or visual defects at runtime.

---

## B-RULE 17 — OUTLET TYPE MUST EXACTLY MATCH STORYBOARD ELEMENT TYPE (BLOCKING)

Every `@IBOutlet` Swift type must match the XML element type in the Storyboard/XIB file.

| Swift outlet type | Required XML element | WRONG XML element |
|---|---|---|
| `UIScrollView` | `<scrollView ...>` | `<view ...>` |
| `UITableView` | `<tableView ...>` | `<view ...>` |
| `UICollectionView` | `<collectionView ...>` | `<view ...>` |
| `UITextField` | `<textField ...>` | `<label ...>` |
| `UITextView` | `<textView ...>` | `<view ...>` |
| `UIButton` | `<button ...>` | `<view ...>` |
| `UIStackView` | `<stackView ...>` | `<view ...>` |
| `UIImageView` | `<imageView ...>` | `<view ...>` |

**Why it matters**: A type mismatch causes an immediate runtime crash:
`NSInvalidArgumentException: -[UIView setShowsHorizontalScrollIndicator:]`

**Verification step (mandatory)**: After writing the Swift outlet declarations, scan the storyboard/XIB XML and confirm every outlet's XML element tag matches its Swift type. If the XML element is `<view>` but the outlet is typed as `UIScrollView`, change the XML element to `<scrollView>`.

---

## B-RULE 18 — NEVER SET TAMIC=false ON STORYBOARD/XIB-OWNED VIEWS

`translatesAutoresizingMaskIntoConstraints = false` is ONLY valid for views created entirely in Swift code (no IB counterpart).

**FORBIDDEN**: Setting TAMIC=false in any styling helper, `viewDidLoad`, or any other method for a view that has a corresponding element in a Storyboard or XIB file. This silently destroys the IB-defined layout — views positioned with `fixedFrame="YES"` will collapse to origin (0,0) and all absolute positions will be lost.

```swift
// FORBIDDEN — destroys fixedFrame and Auto Layout positions from IB
textField.translatesAutoresizingMaskIntoConstraints = false

// CORRECT — TAMIC=false only on views YOU create in code
let dynamicView = UIView()
dynamicView.translatesAutoresizingMaskIntoConstraints = false
view.addSubview(dynamicView)
```

**Checklist**: Before delivery, search the generated Swift file for `translatesAutoresizingMaskIntoConstraints = false`. Every hit must correspond to a view created programmatically in the same file — not to any `@IBOutlet`.

---

## B-RULE 19 — VARIABLE FONTS: ALWAYS USE POSTSCRIPT NAME LOOKUP

For variable fonts registered in `Info.plist` as `UIAppFonts` (e.g. `RubikVariable.ttf`), the only reliable weight assignment is a direct PostScript name:

```swift
// CORRECT — PostScript name lookup; always works for variable fonts
let font = UIFont(name: "Rubik-Medium", size: 14) ?? UIFont.systemFont(ofSize: 14)

// WRONG — .traits weight adjustment has NO effect on variable fonts
let descriptor = UIFont(name: "Rubik-Regular", size: 14)!.fontDescriptor
    .withSymbolicTraits(.traitBold)!
let font = UIFont(descriptor: descriptor, size: 14)   // ← weight unchanged
```

**Variable font PostScript name map (Rubik example — follow same pattern for other families):**

| UIFont.Weight | PostScript name |
|---|---|
| `.ultraLight`, `.thin`, `.light` | `Rubik-Light` |
| `.regular` | `Rubik-Regular` |
| `.medium` | `Rubik-Medium` |
| `.semibold` | `Rubik-SemiBold` |
| `.bold` | `Rubik-Bold` |
| `.heavy` | `Rubik-ExtraBold` |
| `.black` | `Rubik-Black` |

Always provide a `UIFont.systemFont(ofSize:weight:)` fallback after the `??` operator.

---

## B-RULE 20 — ALL CONTAINER VIEWS MUST HAVE AN EXPLICIT BACKGROUND COLOR

Every `UIView` that hosts child content (scroll content views, form body panels, card views, section containers) MUST have an explicit `backgroundColor`. Never rely on the UIKit default (which is `nil` / transparent).

**Why it matters**: A transparent container lets the parent's background color bleed through all padding gaps and between child views, causing a visual defect (e.g. a white form body showing the blue-grey screen background through every gap).

In Storyboard XML — set it on the content view element:
```xml
<color key="backgroundColor" white="1" alpha="1"
       colorSpace="custom" customColorSpace="genericGamma22GrayColorSpace"/>
```

In Swift:
```swift
contentView.backgroundColor    = .white          // form body
productCardView.backgroundColor = .white          // card panel
bannerView.backgroundColor     = UIColor(hex: "#FEF0CA")  // banner strip
```

**Checklist**: Every `UIView` that appears as a content container in the Figma design must have `backgroundColor` set — either in the Storyboard XML attribute or in the Swift styling method. Verify visually after first build.

---

## B-RULE 21 — SF SYMBOL ICON COLORS: BAKE COLOR WITH .alwaysOriginal

When assigning a specific color to an SF Symbol icon, always bake the color directly into the `UIImage` using `.withTintColor(_:renderingMode: .alwaysOriginal)`. **Do NOT rely on `view.tintColor` or `button.tintColor` alone** — the app window's default tintColor (`#007AFF` system blue, or any custom app-level tint) will override any `tintColor` set on a child view, making the icon appear the wrong color.

```swift
// CORRECT — color baked in; immune to tintColor inheritance
let conf = UIImage.SymbolConfiguration(pointSize: 13, weight: .regular)
let img  = UIImage(systemName: "info.circle", withConfiguration: conf)?
    .withTintColor(AppColors.textSecondary, renderingMode: .alwaysOriginal)
button.setImage(img, for: .normal)

// WRONG — tintColor on button can be overridden by parent view's tintColor
button.setImage(UIImage(systemName: "info.circle"), for: .normal)
button.tintColor = AppColors.textSecondary    // ← may be ignored at runtime
```

This rule applies to every SF Symbol used in a `UIButton`, `UIImageView`, or `UIBarButtonItem`.

---

## B-RULE 22 — STORYBOARD FONT DESCRIPTION: USE type="system" FOR LABELS OVERRIDDEN IN SWIFT

When a `UILabel` in the Storyboard/XIB will have its font replaced in Swift code (`label.font = ...`), the storyboard `fontDescription` element MUST use `type="system"`. Using `type="boldSystem"` or `type="italicSystem"` causes the label to render briefly in the wrong weight before the Swift override runs (observable as a flash on first render).

```xml
<!-- CORRECT — no flash; font is fully set by Swift code -->
<fontDescription key="fontDescription" type="system" pointSize="14"/>

<!-- WRONG — brief bold flash before Swift override runs -->
<fontDescription key="fontDescription" type="boldSystem" pointSize="14"/>
```

---

## B-RULE 23 — ICON ON COLORED BACKGROUND: ENSURE SUFFICIENT CONTRAST

An icon placed as a subview inside a colored container (e.g., an SF Symbol inside a purple circle) MUST use a color that provides sufficient contrast against that container's background. Never use the same color for both the icon and its background container.

| Container background | Required icon color |
|---|---|
| Solid dark (e.g. `#002953` navy) | White (`.white`) |
| Low-opacity brand color (e.g. `#AD1FCC` at 15% alpha = light purple) | White (`.white`) or full-opacity brand color at high contrast |
| Solid white / light neutral | Brand accent (`#FF6700`) or text dark (`#1A1A1A`) |
| Amber / yellow banner (`#FEF0CA`) | Brand accent (`#FF6700`) or dark (`#1A1A1A`) |

```swift
// CORRECT — white icon readable against light-purple circle background
let img = UIImage(systemName: "chart.bar.fill", withConfiguration: conf)?
    .withTintColor(.white, renderingMode: .alwaysOriginal)

// WRONG — purple icon on light-purple background = near-invisible
let img = UIImage(systemName: "chart.bar.fill", withConfiguration: conf)?
    .withTintColor(UIColor(hex: "#AD1FCC"), renderingMode: .alwaysOriginal)
```

**Verification**: After generating icons, render in a simulator and confirm every icon is clearly distinguishable from its background. An icon that blends into its container is a visual defect and MUST be fixed before delivery.

---

## B-RULE 24 — XIB ROOT VIEW CANVAS SIZE: MATCH TARGET DEVICE LOGICAL RESOLUTION

The Xcode default XIB canvas size (375×667 pt — iPhone SE / 6 era) does NOT match current target devices. Using the wrong canvas size causes all child frames to be too narrow, scroll areas to be clipped, and form elements to misalign on modern hardware.

**Rule**: Always override the root view frame in XIB to match the primary target device's logical resolution:

| Target device family | Root view size |
|---|---|
| iPhone 16 / 16 Pro / 15 / 15 Pro / 14 Pro | `width="393" height="852"` |
| iPhone 16 Plus / 15 Plus / 14 Plus | `width="430" height="932"` |
| iPhone SE (3rd gen) | `width="375" height="667"` |
| iPad (any) | `width="820" height="1180"` |

Default to `393×852` when the target device is unspecified and the project targets modern iPhones.

```xml
<!-- CORRECT — iPhone 16 Pro logical size -->
<view ... id="root-view-001">
    <rect key="frame" x="0.0" y="0.0" width="393" height="852"/>
```

---

## B-RULE 25 — SAFE AREA TOP: DYNAMIC HEIGHT FOR ANY VIEW COVERING THE STATUS BAR

Any view that acts as a top system bar (covers the status bar / Dynamic Island area) MUST NOT have its height hardcoded to a fixed constant in XIB. The safe area top inset varies by device: ~20 pt (no notch), ~44 pt (notch), ~59 pt (Dynamic Island).

**XIB**: Set a placeholder height (e.g. 60 pt) so layout is visible at design time, but mark it as runtime-adjustable.

**Swift — update in `viewDidLayoutSubviews()`**:
```swift
override func viewDidLayoutSubviews() {
    super.viewDidLayoutSubviews()
    let safeTop = view.safeAreaInsets.top
    if safeTop > 0 {
        // Find the height constraint on the top system bar view and update it
        for c in (topSystemBarView.superview?.constraints ?? []) {
            if (c.firstItem as? UIView) === topSystemBarView,
               c.firstAttribute == .height,
               c.secondItem == nil {
                c.constant = safeTop
                break
            }
        }
    }
}
```

Any container that wraps the top system bar (e.g. a header container) must also update its total height to `safeTop + actionBarHeight + any additional rows`.

**FORBIDDEN**: `topSystemBarView.heightAnchor.constraint(equalToConstant: 44)` — hardcoded values are wrong on at least one device family.

---

## B-RULE 26 — SAFE AREA BOTTOM: BOTTOM-FIXED BARS MUST PIN TO safeAreaLayoutGuide

Any view pinned to the bottom of the screen (CTA bar, toolbar, tab bar replacement) MUST have its bottom constraint anchored to `safeAreaLayoutGuide.bottom`, NOT to `root-view.bottom`.

**Why it matters**: On iPhone X and later (including iPhone 16), the home indicator occupies 34 pt at the very bottom of the screen. Pinning to `root-view.bottom` places the bar behind the home indicator, making the bottom portion of the bar (and any buttons near the bottom of it) visually cut off or unreachable by touch.

**In XIB** — set the constraint's `secondItem` to the `<viewLayoutGuide key="safeArea">` element:
```xml
<!-- CORRECT -->
<constraint firstItem="bottom-bar-001" firstAttribute="bottom"
            secondItem="safe-area-001" secondAttribute="bottom" id="c-btm-bot"/>

<!-- WRONG — home indicator overlaps the bar on real devices -->
<constraint firstItem="bottom-bar-001" firstAttribute="bottom"
            secondItem="root-view-001" secondAttribute="bottom" id="c-btm-bot"/>
```

The safe area layout guide ID (`safe-area-001` above) must match the `id` attribute of the `<viewLayoutGuide key="safeArea"/>` element declared inside the root view. Always check the actual ID in the XIB before writing the constraint.

The 34 pt home indicator zone below the bar will show the root view's background color — this is the correct iOS pattern.

---

## B-RULE 27 — VERTICAL-ONLY SCROLL VIEW: WIDTH LOCK + DISABLE HORIZONTAL SCROLL

For any `UIScrollView` intended to scroll vertically only, three attributes MUST be set together. Missing any one of them can cause a phantom horizontal content offset or an unwanted horizontal scroll on real devices.

**In XIB on the `<scrollView>` element**:
```xml
<scrollView showsHorizontalScrollIndicator="NO"
            showsVerticalScrollIndicator="NO"
            contentInsetAdjustmentBehavior="never" ...>
```

**In XIB constraints** — add an explicit width-equality constraint between the scroll content view and the scroll view itself:
```xml
<!-- Forces content width = scroll frame width; eliminates horizontal drift -->
<constraint firstItem="scroll-content-001" firstAttribute="width"
            secondItem="main-scroll-001" secondAttribute="width"
            constant="0" id="c-sc-w"/>
```

**Why `contentInsetAdjustmentBehavior="never"`**: iOS automatically adds content insets based on navigation bars and tab bars when this is `automatic` (the default). For custom full-screen layouts that manage their own top/bottom spacing, automatic adjustment causes the content to be pushed down unexpectedly.

**FORBIDDEN**: Relying on `frameLayoutGuide.widthAnchor` in Swift code to fix horizontal drift — the XIB constraint is the correct place for this relationship.

---

## B-RULE 28 — MULTI-LINE LABELS: SET numberOfLines BASED ON CONTENT TYPE

The XIB default `numberOfLines="1"` truncates any label whose text wraps across two or more lines. This silently clips step indicator labels, badge descriptions, warning banners, and any other label containing a phrase rather than a single word.

**Rule**: Set `numberOfLines` based on the content type, not the Figma single-state appearance:

| Label content type | `numberOfLines` | XIB `lineBreakMode` | Minimum height |
|---|---|---|---|
| Single word / short fixed string | `1` | `tailTruncation` | As designed |
| Two-word phrase or step indicator | `2` | `wordWrap` | ≥ 26 pt |
| Dynamic / variable-length text | `0` (unlimited) | `wordWrap` | Use Auto Layout height |
| Error / warning message | `0` | `wordWrap` | Use Auto Layout height |

```xml
<!-- CORRECT — step indicator label that can wrap -->
<label numberOfLines="2" lineBreakMode="wordWrap" ...>
    <rect key="frame" x="..." y="..." width="72" height="26"/>
```

**FORBIDDEN**: `numberOfLines="1"` on any label whose Figma content contains a space character or whose placeholder text is a phrase.

---

## B-RULE 29 — GRADIENT LAYER: REMOVE STALE SUBLAYERS BEFORE RE-APPLYING

`viewDidLayoutSubviews()` is called multiple times during a screen's lifecycle (initial layout, rotation, keyboard appearance, etc.). Adding a `CAGradientLayer` without first removing the previous one stacks multiple gradient layers, causing color shifts and unexpected opacity blending.

**Rule**: Always remove existing gradient sublayers before inserting a new one:

```swift
// CORRECT — idempotent; safe to call any number of times
override func viewDidLayoutSubviews() {
    super.viewDidLayoutSubviews()

    // Remove any previously added gradient layer on this button
    ctaButton.layer.sublayers?
        .filter { $0 is CAGradientLayer }
        .forEach { $0.removeFromSuperlayer() }

    let gradient = CAGradientLayer()
    gradient.frame      = ctaButton.bounds
    gradient.colors     = [AppColors.gradientStart.cgColor, AppColors.gradientEnd.cgColor]
    gradient.startPoint = CGPoint(x: 0, y: 0.5)
    gradient.endPoint   = CGPoint(x: 1, y: 0.5)
    ctaButton.layer.insertSublayer(gradient, at: 0)
}
```

**FORBIDDEN**: Inserting a `CAGradientLayer` without the removal step — this is the B-RULE 6 gradient example gap. The removal guard is mandatory whenever `viewDidLayoutSubviews()` is the application site.

---

## B-RULE 30 — FRAME-BASED SCROLL CONTENT CHILDREN: autoresizingMask widthSizable

When child views inside a scroll content view use **frame-based layout** (i.e. `<rect key="frame" .../>` with fixed x/y/width values rather than full Auto Layout anchors), their width is frozen at the XIB design-time value and will not adapt to different device widths.

**Rule**: For every frame-layout child view inside a scroll content view, set `autoresizingMask` with `widthSizable="YES"`:

```xml
<!-- CORRECT — stretches to fill the parent width on all device sizes -->
<autoresizingMask key="autoresizingMask" widthSizable="YES"/>

<!-- WRONG — width frozen at XIB design value; clips on wider devices, overflows on narrower ones -->
<autoresizingMask key="autoresizingMask" flexibleMaxX="YES" flexibleMaxY="YES"/>
```

This applies to: text fields, labels, error labels, section headers, dividers, chip rows, terms rows — any element whose Figma design spans edge-to-edge or uses a percentage of the screen width.

**Exception**: Elements with a fixed design width that must NOT stretch (e.g. a small icon, a fixed-size badge) should keep their exact width and NOT use `widthSizable="YES"`.

---

## C-RULE 6 — POST-DELIVERY BUILD VALIDATION (MANDATORY)

After all Storyboard/XIB files are written, run the Xcode build to catch IB and Swift compile-time errors before marking delivery complete:

```bash
xcodebuild -scheme <SchemeName> \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build 2>&1 | tail -30
```

Do NOT mark delivery complete if any build error remains. Fix all errors, then re-run the build to confirm PASS.

### Post-build screenshot capture

```bash
xcrun simctl io booted screenshot reports/screenshots/<componentName>-generated-ios.png
```

Compare against the Figma reference screenshot. Fix all visual mismatches and re-capture until PASS at ≥ 95% visual match.

---

## C-RULE 7 — LARGE XIB / STORYBOARD GENERATION: NO ARBITRARY FRAGMENTS (BLOCKING)

The skill must establish one consistent policy for large Storyboard/XIB implementations:

**Preferred**:
- Use Xcode-generated Storyboard/XIB structures.
- Reuse existing project Storyboards/XIBs where available.
- Modify existing valid structures when appropriate.
- Validate the resulting Storyboard/XIB using Xcode tooling (e.g. `ibtool`).

**Allowed**:
- Generate a minimal XIB/Storyboard skeleton ONLY when the implementation workflow explicitly supports it and the structure is based on valid Xcode-generated patterns.

**Not Allowed**:
- Hand-author arbitrary Storyboard/XIB XML from scratch.
- Generate large XML files in arbitrary fragments/parts.
- Invent undocumented Interface Builder XML structures.

**Rule**: For large Storyboard/XIB implementations:
1. Prefer an existing Xcode-generated Storyboard/XIB.
2. Reuse existing project structure and conventions.
3. Make only necessary changes.
4. Validate the final file using Xcode/ibtool.
5. If safe Storyboard/XIB generation cannot be achieved, use programmatic UIKit instead.
6. Never construct arbitrary Interface Builder XML fragments.
