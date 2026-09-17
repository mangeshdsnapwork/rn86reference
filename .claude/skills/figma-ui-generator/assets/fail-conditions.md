# Fail Conditions — Per Platform

Any condition in this file triggers an automatic FAIL verdict.
The output MUST be rejected and the issue fixed before redelivery.

---

## Universal Fail Conditions (All Platforms)

| # | Condition | Rule violated |
|---|---|---|
| F-001 | Platform guideline was NOT loaded before writing code | Q-RULE 2 |
| F-002 | UI section analysis was skipped — code written before analysis | Q-RULE 3 |
| F-003 | Token file was not written before component styles | Q-RULE 4 |
| F-004 | Any inline magic value (hex, px, pt, dp) in a component file instead of token constant | Q-RULE 4 |
| F-005 | Any `localhost:3845` URL remains in final code | Q-RULE 5 |
| F-006 | Platform build exits with error code ≠ 0 | Q-RULE 6 |
| F-009 | A non-semantic element is used where a semantic one is required (e.g. tap gesture on a `Text` instead of a `Button`) | Guideline semantic rule |
| F-010 | VERDICT left blank in report | Q-RULE 9 |
| F-011 | Any component property (variants, booleans, text, instance swap) defined in Figma is omitted from the code interface or not utilized in rendering/logic | Q-RULE 10 |
| F-012 | Any layer stroke color, stroke weight/thickness, style, alignment, or visual styling deviates from the Figma design specification | Q-RULE 10 |

---

## Angular Fail Conditions

| # | Condition |
|---|---|
| FA-001 | A native HTML `<button>` used where `button[mat-flat-button]` is required |
| FA-002 | A `<div>` used where `mat-form-field` + `input[matInput]` is required |
| FA-003 | A `.mat-*` or `.mdc-*` selector overridden WITHOUT `!important` |
| FA-004 | Hard-coded hex/px value in `.component.scss` instead of `$variable` from `_variables.scss` |
| FA-005 | `ng build` exits with compile error |
| FA-006 | `app.component.html` contains anything other than `<router-outlet />` |

---

## React Fail Conditions

| # | Condition |
|---|---|
| FR-001 | A raw `<div onClick>` used where a `<button>` is required |
| FR-002 | Hard-coded colour or spacing value inline instead of Tailwind token or CSS variable |
| FR-003 | Component imports from `@angular/*` or any non-React library |
| FR-004 | `npm run build` / `vite build` exits with error |

---

## React Native Fail Conditions

| # | Condition |
|---|---|
| FRN-001 | Any HTML element (`<div>`, `<span>`, `<p>`) in output |
| FRN-002 | Any CSS class string (`className="..."`) in output |
| FRN-003 | Any Tailwind utility (`className="flex gap-4"`) in output |
| FRN-004 | A touch area implemented with `onPress` on a `View` where `Pressable` is required |
| FRN-005 | Raw color hex or pixel number in `StyleSheet` instead of token constant |
| FRN-006 | `SafeAreaView` from `react-native` used instead of `useSafeAreaInsets` from `react-native-safe-area-context` |

---

## Flutter Fail Conditions

| # | Condition |
|---|---|
| FF-001 | `GestureDetector` on a `Container` used where `ElevatedButton` / `OutlinedButton` / `TextButton` is required |
| FF-002 | `GestureDetector` on a `Container` with placeholder text used where `TextFormField` is required |
| FF-003 | `Stack` used where `Row` or `Column` suffices |
| FF-004 | Any design token value hardcoded inline instead of `AppColors` / `AppTypography` / `AppSpacing` / `AppRadius` |
| FF-005 | `flutter build` exits with compile error |
| FF-006 | Font not registered in `pubspec.yaml` under `flutter.fonts` |

---

## iOS — SwiftUI Fail Conditions

| # | Condition |
|---|---|
| FI-SW-001 | `.onTapGesture` on `Text` or `HStack` used where `Button` is required |
| FI-SW-002 | `ZStack` used for non-overlapping vertical/horizontal content instead of `VStack`/`HStack` |
| FI-SW-003 | A `systemBar` view rendered inside the app layout (creates double status bar) |
| FI-SW-004 | SwiftUI default font (`.font(.headline)`, `.font(.body)`) used instead of `AppTypography` |
| FI-SW-005 | `.border()` modifier used instead of `.overlay(RoundedRectangle(...).stroke(...))` |
| FI-SW-006 | `xcodebuild` exits with compile error |
| FI-SW-007 | Custom font file is an HTML redirect page instead of a binary TTF/OTF |

---

## iOS — UIKit Fail Conditions

| # | Condition |
|---|---|
| FI-UK-001 | `UITapGestureRecognizer` on `UILabel` or `UIView` used where `UIButton` is required |
| FI-UK-002 | `UITapGestureRecognizer` on `UIView` faking an input where `UITextField` is required |
| FI-UK-003 | `CAGradientLayer` applied in `viewDidLoad()` instead of `viewDidLayoutSubviews()` |
| FI-UK-004 | `@IBOutlet` declared with `!` (force-unwrap) instead of `?` (optional) |
| FI-UK-005 | XIB or Storyboard XML hand-authored from scratch instead of copied from Xcode template |
| FI-UK-006 | `xcodebuild` or `ibtool --compile` exits with error |
| FI-UK-007 | `@IBOutlet` Swift type does not match the Storyboard/XIB XML element type (e.g. `UIScrollView` outlet wired to `<view>` instead of `<scrollView>`) — causes runtime crash `NSInvalidArgumentException` |
| FI-UK-008 | `translatesAutoresizingMaskIntoConstraints = false` set on any `@IBOutlet` view that was placed in a Storyboard or XIB — silently destroys IB-defined positions and constraints |
| FI-UK-009 | Variable font weight applied via `UIFont(descriptor:)` `.withSymbolicTraits(.traitBold)` or `.traits` adjustment instead of direct PostScript name lookup (`UIFont(name: "Rubik-Medium", size:)`) — weight has no effect at runtime |
| FI-UK-010 | SF Symbol icon color assigned via `view.tintColor` or `button.tintColor` alone without `.withTintColor(_:renderingMode: .alwaysOriginal)` — color is overridden by the parent view's inherited tintColor |
| FI-UK-011 | Container or content `UIView` has no explicit `backgroundColor` set in either Storyboard XML or Swift styling — parent background bleeds through as transparent fill |

---

## Android — Jetpack Compose Fail Conditions

| # | Condition |
|---|---|
| FA-C-001 | Figma button implemented as `Box` + `Modifier.clickable` instead of `Button`/`OutlinedButton` |
| FA-C-002 | Figma input implemented as `Text` + `Modifier.clickable` instead of `TextField`/`OutlinedTextField` |
| FA-C-003 | Hard-coded `Color(0xFF...)` inline instead of `Color.kt` token constant |
| FA-C-004 | `./gradlew assembleDebug` exits with compile error |

---

## Android — XML Views Fail Conditions

| # | Condition |
|---|---|
| FA-X-001 | Hard-coded `android:textColor="#1A1A1A"` instead of `@color/figma_text_primary` |
| FA-X-002 | Hard-coded `android:padding="16dp"` instead of `@dimen/figma_spacing_lg` |
| FA-X-003 | `./gradlew assembleDebug` exits with compile error |
