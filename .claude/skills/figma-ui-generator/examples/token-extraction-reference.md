# Token Extraction Reference

Shows the expected token file output shape for each supported platform.
All values in these examples are illustrative. Replace with exact values from `get_variable_defs` (Figma mode) or the screenshot visual analysis (screenshot mode).

---

## Angular — SCSS (`src/styles/_variables.scss`)

```scss
// ── Colours ──────────────────────────────────────────────────────────────────
$color-primary:        #002953;   // Figma: "primary/navy" — node 6541:44697
$color-accent:         #FF6700;   // Figma: "accent/orange"
$color-text-primary:   #1A1A1A;
$color-text-secondary: #666666;
$color-text-hint:      #999999;
$color-border:         #999999;
$color-surface:        #FFFFFF;
$color-background:     #F5F5F5;

// ── Typography ────────────────────────────────────────────────────────────────
$font-family:    'Rubik', sans-serif;
$font-size-h1:   22px;
$font-size-body: 14px;
$font-size-sm:   12px;
$font-weight-medium: 500;
$font-weight-regular: 400;

// ── Spacing ───────────────────────────────────────────────────────────────────
$spacing-xs:   4px;   $spacing-sm:   8px;
$spacing-md:   12px;  $spacing-lg:   16px;
$spacing-xl:   20px;  $spacing-xxl:  24px;

// ── Border & Radius ───────────────────────────────────────────────────────────
$radius-input:  4px;  $radius-chip:   8px;
$radius-button: 82px; $radius-card:   12px;
$border-width:  1px;

// ── Shadows ───────────────────────────────────────────────────────────────────
$shadow-card: 0 2px 8px rgba(0, 0, 0, 0.10);

// ── Breakpoints ───────────────────────────────────────────────────────────────
$bp-mobile:  480px;
$bp-tablet:  768px;
$bp-desktop: 1024px;
$bp-wide:    1440px;
```

---

## React — Tailwind config (`tailwind.config.ts → theme.extend`)

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary:        '#002953',
        accent:         '#FF6700',
        'text-primary': '#1A1A1A',
        'text-secondary':'#666666',
        border:         '#999999',
        surface:        '#FFFFFF',
        background:     '#F5F5F5',
      },
      fontFamily: { rubik: ['Rubik', 'sans-serif'] },
      fontSize: { body: '14px', sm: '12px', h1: '22px' },
      borderRadius: { input: '4px', chip: '8px', btn: '82px', card: '12px' },
      spacing: { xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '20px', xxl: '24px' },
      screens: { mobile: '480px', tablet: '768px', desktop: '1024px', wide: '1440px' },
    },
  },
};
```

---

## React Native — TypeScript (`src/theme/figma-tokens.ts`)

```ts
export const figmaTokens = {
  colors: {
    primary:       '#002953',
    accent:        '#FF6700',
    textPrimary:   '#1A1A1A',
    textSecondary: '#666666',
    textHint:      '#999999',
    border:        '#999999',
    surface:       '#FFFFFF',
    background:    '#F5F5F5',
  },
  typography: {
    fontFamily: 'Rubik',
    h1: { size: 22, weight: '500' as const },
    body: { size: 14, weight: '400' as const },
    caption: { size: 12, weight: '400' as const },
    button: { size: 14, weight: '500' as const },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, screenH: 16 },
  radius: { input: 4, chip: 8, button: 82, card: 12 },
  breakpoints: { mobile: 480, tablet: 768, desktop: 1024 },
} as const;
```

---

## Flutter — Dart (`lib/core/theme/`)

```dart
// app_colors.dart
import 'package:flutter/material.dart';
class AppColors {
  static const primary       = Color(0xFF002953);
  static const accent        = Color(0xFFFF6700);
  static const textPrimary   = Color(0xFF1A1A1A);
  static const textSecondary = Color(0xFF666666);
  static const border        = Color(0xFF999999);
  static const surface       = Color(0xFFFFFFFF);
  static const background    = Color(0xFFF5F5F5);
}

// app_spacing.dart
class AppSpacing {
  static const double xs = 4; static const double sm = 8;
  static const double md = 12; static const double lg = 16;
  static const double xl = 20; static const double xxl = 24;
  static const double screenHorizontal = 16;
  static const double fieldHeight = 48;
  static const double buttonHeight = 52;
}

// app_radius.dart
class AppRadius {
  static const double input = 4; static const double chip = 8;
  static const double button = 82; static const double card = 12;
}
```

---

## iOS — Swift (`<FeatureFolder>/Theme/`)

```swift
// AppColors.swift (SwiftUI) — use UIColor for UIKit (see B-RULE 3)
struct AppColors {
    static let primary        = Color(hex: "#002953")
    static let accent         = Color(hex: "#FF6700")
    static let textPrimary    = Color(hex: "#1A1A1A")
    static let textSecondary  = Color(hex: "#666666")
    static let border         = Color(hex: "#999999")
    static let surface        = Color.white
    static let background     = Color(hex: "#F5F5F5")
}

// AppSpacing.swift
struct AppSpacing {
    static let xs: CGFloat = 4;  static let sm: CGFloat = 8
    static let md: CGFloat = 12; static let lg: CGFloat = 16
    static let xl: CGFloat = 20; static let xxl: CGFloat = 24
    static let screenHorizontal: CGFloat = 16
    static let fieldHeight: CGFloat = 47
    static let buttonHeight: CGFloat = 40
}

// AppRadius.swift
struct AppRadius {
    static let input:  CGFloat = 4;  static let chip:   CGFloat = 8
    static let button: CGFloat = 82; static let card:   CGFloat = 12
}
```

---

## Android — Kotlin Compose (`ui/theme/`) + XML (`res/values/`)

```kotlin
// Color.kt
val Primary       = Color(0xFF002953)
val Accent        = Color(0xFFFF6700)
val TextPrimary   = Color(0xFF1A1A1A)
val TextSecondary = Color(0xFF666666)
val Border        = Color(0xFF999999)
val Surface       = Color(0xFFFFFFFF)
val Background    = Color(0xFFF5F5F5)
```

```xml
<!-- res/values/figma_colors.xml (Android XML) -->
<resources>
  <color name="figma_primary">#002953</color>
  <color name="figma_accent">#FF6700</color>
  <color name="figma_text_primary">#1A1A1A</color>
  <color name="figma_border">#999999</color>
  <color name="figma_surface">#FFFFFF</color>
  <color name="figma_background">#F5F5F5</color>
</resources>
```
