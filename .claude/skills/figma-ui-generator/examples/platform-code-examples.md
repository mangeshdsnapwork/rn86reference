# Platform Code Examples

All complete token file templates and full component examples, organised by platform.

Reference files use pointers to sections here — load only the section for your target platform.


---


## Flutter / Dart


### app_colors.dart — Color Token File


```dart
// lib/core/theme/app_colors.dart
class AppColors {
  AppColors._();

  // Extract every color value from Figma — no approximation
  static const Color primary       = Color(0xFF002953); // replace with Figma exact hex
  static const Color primaryLight  = Color(0xFFE5EAF7);
  static const Color accent        = Color(0xFFFF6700);
  static const Color textPrimary   = Color(0xFF1A1A1A);
  static const Color textSecondary = Color(0xFF666666);
  static const Color textHint      = Color(0xFF999999);
  static const Color border        = Color(0xFF999999);
  static const Color borderFocus   = Color(0xFF002953);
  static const Color error         = Color(0xFFD32F2F);
  static const Color surface       = Color(0xFFFFFFFF);
  static const Color background    = Color(0xFFF5F5F5);
  static const Color divider       = Color(0xFFE0E0E0);
}
```


### app_typography.dart — Typography Token File


```dart
// lib/core/theme/app_typography.dart
import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTypography {
  AppTypography._();

  // Replace ALL values with exact Figma values
  static const TextStyle heading1 = TextStyle(
    fontFamily: 'Rubik',    // exact font family from Figma
    fontSize: 24,
    fontWeight: FontWeight.w700,
    height: 1.33,           // lineHeight / fontSize
    letterSpacing: 0,
    color: AppColors.textPrimary,
  );

  static const TextStyle heading2 = TextStyle(
    fontFamily: 'Rubik',
    fontSize: 20,
    fontWeight: FontWeight.w600,
    height: 1.4,
    color: AppColors.textPrimary,
  );

  static const TextStyle body1 = TextStyle(
    fontFamily: 'Rubik',
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.43,
    color: AppColors.textPrimary,
  );

  static const TextStyle body2 = TextStyle(
    fontFamily: 'Rubik',
    fontSize: 12,
    fontWeight: FontWeight.w400,
    height: 1.5,
    color: AppColors.textSecondary,
  );

  static const TextStyle label = TextStyle(
    fontFamily: 'Rubik',
    fontSize: 14,
    fontWeight: FontWeight.w500,
    height: 1.43,
    color: AppColors.textPrimary,
  );

  static const TextStyle buttonText = TextStyle(
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: FontWeight.w600,
    height: 1.25,
    letterSpacing: 0.5,
    color: AppColors.surface,
  );

  static const TextStyle hint = TextStyle(
    fontFamily: 'Rubik',
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textHint,
  );

  static const TextStyle error = TextStyle(
    fontFamily: 'Rubik',
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.error,
  );
}
```


### app_spacing.dart — Spacing Token File


```dart
// lib/core/theme/app_spacing.dart
class AppSpacing {
  AppSpacing._();

  // Extract every spacing value directly from Figma
  static const double xs  = 4.0;
  static const double sm  = 8.0;
  static const double md  = 12.0;
  static const double lg  = 16.0;
  static const double xl  = 20.0;
  static const double xxl = 24.0;
  static const double xxxl = 32.0;

  // Page / screen horizontal padding from Figma
  static const double screenHorizontal = 16.0;
  static const double screenVertical   = 24.0;

  // Component-level gaps
  static const double fieldGap         = 16.0;
  static const double sectionGap       = 24.0;
  static const double buttonGap        = 12.0;
}
```


### app_radius.dart — Radius Token File


```dart
// lib/core/theme/app_radius.dart
import 'package:flutter/material.dart';

class AppRadius {
  AppRadius._();

  // Extract all radius values from Figma
  static const double inputRadius    = 4.0;
  static const double buttonRadius   = 8.0;
  static const double cardRadius     = 12.0;
  static const double chipRadius     = 20.0;
  static const double dialogRadius   = 16.0;

  static const BorderRadius inputBorder  = BorderRadius.all(Radius.circular(inputRadius));
  static const BorderRadius buttonBorder = BorderRadius.all(Radius.circular(buttonRadius));
  static const BorderRadius cardBorder   = BorderRadius.all(Radius.circular(cardRadius));
}
```


### app_shadows.dart — Shadow Token File


```dart
// lib/core/theme/app_shadows.dart
import 'package:flutter/material.dart';

class AppShadows {
  AppShadows._();

  // Extract exact shadow values from Figma
  static const List<BoxShadow> card = [
    BoxShadow(
      color: Color(0x1A000000), // Figma shadow color with opacity
      blurRadius: 8,
      offset: Offset(0, 2),
      spreadRadius: 0,
    ),
  ];

  static const List<BoxShadow> elevated = [
    BoxShadow(
      color: Color(0x29000000),
      blurRadius: 16,
      offset: Offset(0, 4),
      spreadRadius: 0,
    ),
  ];
}
```


## Angular


### Feature Page Composition Example


```html
<app-layout-header
  [title]="greeting"
  [showSearch]="true"
  [showNotifications]="true"
></app-layout-header>

<main class="dashboard-page">
  <app-account-card [account]="primaryAccount"></app-account-card>

  <section class="dashboard-page__transactions">
    <header class="dashboard-page__section-header">…</header>
    <app-transaction-row
      *ngFor="let tx of transactions"
      [transaction]="tx"
    ></app-transaction-row>
  </section>

  <section class="dashboard-page__quick-actions">
    <app-quick-action-button
      *ngFor="let action of quickActions"
      [action]="action"
    ></app-quick-action-button>
  </section>

  <section class="dashboard-page__beneficiaries">
    <app-avatar
      *ngFor="let person of beneficiaries"
      [person]="person"
    ></app-avatar>
  </section>
</main>

<app-layout-bottom-nav [activeRoute]="'home'"></app-layout-bottom-nav>
```


## React


### DashboardPage — Feature Page Composition Example


```tsx
export const DashboardPage = () => (
  <>
    <Header
      title={greeting}
      showSearch
      showNotifications
    />

    <main className="dashboard-page">
      <AccountCard account={primaryAccount} />

      <section className="dashboard-page__transactions">
        <header className="dashboard-page__section-header">…</header>
        {transactions.map(tx => (
          <TransactionRow key={tx.id} transaction={tx} />
        ))}
      </section>

      <section className="dashboard-page__quick-actions">
        {quickActions.map(action => (
          <QuickActionButton key={action.id} action={action} />
        ))}
      </section>

      <section className="dashboard-page__beneficiaries">
        {beneficiaries.map(p => (
          <Avatar key={p.id} person={p} />
        ))}
      </section>
    </main>

    <BottomNav activeRoute="home" />
  </>
);
```

## Android

### FigmaColors — Kotlin Token File

```kotlin
object FigmaColors {
    val Surface = Color(0xFFFFFFFF) // Figma variable: surface/default
    val TextPrimary = Color(0xFF111827)
}

object FigmaSpacing {
    val screenHorizontal = 16.dp
    val fieldGap = 12.dp
}
```

### Resource Tokens — XML Template

```xml
<!-- Figma variable: color/surface/default -->
<color name="figma_surface">#FFFFFFFF</color>

<!-- Figma node: Primary CTA height -->
<dimen name="figma_button_height">52dp</dimen>
```
