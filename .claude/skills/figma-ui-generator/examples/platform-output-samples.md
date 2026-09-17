# Platform Output Samples

Quick reference for the expected file structure and code shape per platform.
These are minimal stubs — actual output is driven by the Figma design and the loaded platform guideline.

---

## Angular

**Files generated per component:**
```
src/app/features/<feature>/components/<kebab-name>/
  <kebab-name>.component.html
  <kebab-name>.component.scss
  <kebab-name>.component.ts
  <kebab-name>.component.spec.ts   (optional)
```

**TypeScript stub:**
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent {}
```

**SCSS stub (token-driven):**
```scss
@use 'src/styles/variables' as *;

.login-form {
  padding: $spacing-lg;
  background: $color-surface;
  border-radius: $radius-card;
}
```

---

## React

**Files generated per component:**
```
src/features/<feature>/components/<PascalName>/
  <PascalName>.tsx
  <PascalName>.module.css   (or Tailwind class list inline)
```

**TSX stub (Tailwind):**
```tsx
export function LoginForm() {
  return (
    <section className="flex flex-col gap-4 p-4 bg-surface rounded-card">
      {/* UI generated from Figma */}
    </section>
  );
}
```

---

## React Native

**Files generated per screen/component:**
```
src/features/<feature>/components/
  <ComponentName>.tsx
  <ComponentName>.styles.ts   (when non-trivial)
```

**TSX stub:**
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { figmaTokens as tokens } from '../../theme/figma-tokens';

export function LoginForm() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Sign In</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: tokens.spacing.lg,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.card,
  },
  title: {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.h1.size,
    color: tokens.colors.textPrimary,
  },
});
```

---

## Flutter

**Files generated per widget:**
```
lib/features/<feature>/widgets/
  login_form.dart
lib/core/theme/
  app_colors.dart
  app_typography.dart
  app_spacing.dart
  app_radius.dart
```

**Dart stub:**
```dart
import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';

class LoginForm extends StatelessWidget {
  const LoginForm({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.card),
      ),
      child: const Column(children: []),
    );
  }
}
```

---

## iOS — SwiftUI

**Files generated per screen:**
```
<FeatureFolder>/
  <ComponentName>View.swift
  Theme/
    AppColors.swift
    AppTypography.swift
    AppSpacing.swift
    AppRadius.swift
```

**SwiftUI stub:**
```swift
import SwiftUI

struct LoginFormView: View {
    var body: some View {
        VStack(spacing: AppSpacing.md) {
            // UI generated from Figma
        }
        .padding(AppSpacing.lg)
        .background(AppColors.surface)
        .cornerRadius(AppRadius.card)
    }
}
```

---

## iOS — UIKit (Programmatic)

**Files generated per screen:**
```
<FeatureFolder>/
  <ComponentName>ViewController.swift
  Theme/
    AppColors.swift       (UIColor variants)
    AppTypography.swift   (UIFont variants)
    AppSpacing.swift
    AppRadius.swift
```

**UIKit stub:**
```swift
import UIKit

final class LoginFormViewController: UIViewController {

    private let titleLabel = UILabel()
    private let continueButton = UIButton(type: .custom)

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = AppColors.background
        setupViews()
        setupConstraints()
        applyStyles()
    }

    private func setupViews() {
        [titleLabel, continueButton].forEach {
            $0.translatesAutoresizingMaskIntoConstraints = false
            view.addSubview($0)
        }
    }

    private func setupConstraints() {
        NSLayoutConstraint.activate([
            titleLabel.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor,
                                            constant: AppSpacing.lg),
            titleLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor,
                                                constant: AppSpacing.screenHorizontal),
            titleLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor,
                                                 constant: -AppSpacing.screenHorizontal),
        ])
    }

    private func applyStyles() {
        titleLabel.font      = AppTypography.title()
        titleLabel.textColor = AppColors.textPrimary
        continueButton.backgroundColor    = AppColors.accent
        continueButton.layer.cornerRadius = AppRadius.button
    }
}
```

---

## Android — Jetpack Compose

**Files generated per screen:**
```
app/src/main/java/ui/<feature>/
  <ComponentName>.kt
ui/theme/
  Color.kt
  Type.kt
  Theme.kt
```

**Compose stub:**
```kotlin
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.ui.theme.*

@Composable
fun LoginForm() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.md)
    ) {
        // UI generated from Figma
    }
}
```

---

## Android — XML Views

**Files generated per screen:**
```
app/src/main/res/layout/
  fragment_login_form.xml
app/src/main/java/ui/<feature>/
  LoginFormFragment.kt
res/values/
  figma_colors.xml
  figma_dimens.xml
```

**XML stub:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:padding="@dimen/figma_spacing_lg"
    android:background="@color/figma_surface">
    <!-- UI generated from Figma -->
</LinearLayout>
```
