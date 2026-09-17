# Android Figma-to-Code Guideline - Jetpack Compose / XML Views

## DESIGN IS THE SINGLE SOURCE OF TRUTH

Use this file for every native Android target. It is the Android equivalent of `ios-guideline.md`: one platform reference, with delivery-mode detection selecting the output strategy.

### Figma mode

Call:
`get_design_context`

Parameters:
- nodeId: `{NODE_ID}`
- dirForAssetWrites: `{DIR_FOR_ASSET_WRITES}`
- forceCode: true
- clientFrameworks: `"android"`
- clientLanguages: `"kotlin,java,xml"`

Use this output as the sole source for layout, text, spacing, colors, typography, images, icons, dimensions, constraints, and responsive behavior. Do not approximate Figma values or rely on Android default component visuals.

### Screenshot mode

When the design source is a screenshot, use the visual analysis from `SKILL.md` Step 5 as the source of truth. Every generated color, spacing, font size, radius, elevation, and asset placeholder must be marked as estimated and should include a `TODO: confirm with design system` comment in the relevant Kotlin or XML resource.

---

## DELIVERY MODE DETECTION (MANDATORY - before any code)

Scan the project and detect which Android UI delivery mode is in use. Apply the first matching rule below and record the result as `android_delivery_mode`.

### Rule 1 - Native Android project confirmation

Proceed only when native Android evidence exists:

- root or app-level `build.gradle` / `build.gradle.kts` with `com.android.application`, `com.android.library`, or Android Gradle Plugin aliases
- `app/src/main/AndroidManifest.xml` or another source-set manifest
- Kotlin or Java Android source under `src/main/java` or `src/main/kotlin`

If the project is React Native or Flutter, stop using this file and return to the matching React Native or Flutter guideline.

### Rule 2 - Single delivery mode (auto-proceed, no question)

| Evidence | Detected mode | Action |
|---|---|---|
| Compose dependencies/plugins (`androidx.compose`, `composeOptions`, `buildFeatures { compose = true }`) OR source uses `@Composable`, `setContent {`, `MaterialTheme`, `Modifier`, or `remember` | **Jetpack Compose** | Proceed - follow Part A |
| XML layouts under `app/src/main/res/layout/` and source uses `setContentView(...)`, `LayoutInflater`, ViewBinding, DataBinding, `Fragment` layout inflation, or `findViewById(...)` | **XML Views** | Proceed - follow Part B |

### Rule 3 - Mixed delivery modes (BLOCKING - must ask)

If the project contains real Compose screens and real XML View screens, ask exactly:

> "This Android project uses both Jetpack Compose and XML Views. Which should I use for this screen?"
> - Jetpack Compose
> - XML Views

Do NOT assume Compose. Do NOT proceed until answered. Lock the answer as `android_delivery_mode` for the session.

### Rule 4 - XML interop is present

If the project uses Compose with `AndroidView(...)` only as interop inside Compose screens, treat the delivery mode as **Jetpack Compose** unless the target screen is clearly owned by an XML Activity/Fragment.

If the project uses XML screens that host Compose via `ComposeView`, treat it as **XML Views** unless the existing screen architecture clearly creates whole screens with Compose.

### Rule 5 - Fully ambiguous (no signals at all)

Ask ONE question:

> "Which Android UI approach does this project use? (Jetpack Compose / XML Views)"

Do not mix Compose and XML in one generated screen unless the existing project already uses that exact interop pattern.

---

# PART A - Jetpack Compose

Apply this part only when delivery mode is **Jetpack Compose**.

## A - COMPOSABLE-FIRST RULE

Map every Figma element to the semantically correct Compose primitive or existing project component.

| Figma element | Required Compose primitive | Forbidden substitute |
|---|---|---|
| Screen root | `Scaffold`, `Box`, `Column`, or `LazyColumn` with safe insets | Hardcoded status/navigation bar spacers |
| Vertical layout | `Column` with exact `verticalArrangement`/spacing | `Box` with manual offsets |
| Horizontal layout | `Row` with exact `horizontalArrangement`/spacing | Absolute positioning |
| Overlap | `Box` | Only when layers overlap in Figma |
| Text | `Text` with tokenized `TextStyle` | Default `MaterialTheme.typography` unless tokens match |
| Button | `Button`, `OutlinedButton`, `TextButton`, or custom `Surface` + clickable semantics | Plain `Text` or `Box` without button semantics |
| Input | `TextField` or `OutlinedTextField` fully styled from Figma | Static `Text` pretending to be input |
| Checkbox/radio/switch | Compose semantic control, restyled to match Figma | Decorative-only shape without state semantics |
| Image/icon asset | `Image` with `painterResource` | Guessed Material icon unless Figma uses that icon |
| List | `LazyColumn` / `LazyRow` | Large static `Column` |
| Card/panel | `Surface`, `Card`, or `Box` with exact shape/shadow | Default Card styling |

## A-RULE 1 - TOKEN EXTRACTION

Create or update Compose tokens before component code:

```text
app/src/main/java/<package>/ui/theme/FigmaColors.kt
app/src/main/java/<package>/ui/theme/FigmaTypography.kt
app/src/main/java/<package>/ui/theme/FigmaSpacing.kt
app/src/main/java/<package>/ui/theme/FigmaRadius.kt
app/src/main/java/<package>/ui/theme/FigmaShadows.kt
```

If the project already uses `Color.kt`, `Type.kt`, `Theme.kt`, or another theme package naming convention, append the Figma tokens there instead of creating duplicate theme systems. Use exact Figma values in Figma mode. In screenshot mode, add estimated-value comments. Append only new tokens when files already exist. Component code must import tokens instead of redeclaring color, font size, spacing, radius, or elevation literals.

→ See examples/platform-code-examples.md — ## Android: FigmaColors — Kotlin Token File

## A-RULE 2 - EXACT MODIFIERS

Every visible element must carry exact Figma dimensions and styling through `Modifier`:

- `size`, `width`, `height`, `requiredSize` only when Figma fixes dimensions
- `padding` with exact per-side values
- `background`, `border`, `clip`, `shadow` from tokens
- `Arrangement.spacedBy(...)` for Figma auto-layout gaps
- `contentScale` and explicit image dimensions for all images

Do not use `offset` for normal rows/columns. Use it only for explicit Figma overlaps.

## A-RULE 3 - TYPOGRAPHY LOCK

Every `Text` must use a tokenized `TextStyle` with exact:

- font family
- font size
- weight
- line height
- letter spacing
- color
- text alignment

Register custom fonts under `app/src/main/res/font/` and reference them through `FontFamily`.

## A-RULE 4 - BUTTONS AND INPUTS

Buttons must use a semantic clickable component and explicitly override shape, colors, elevation, border, size, content padding, icon size, and text style.

Inputs must use `TextField` / `OutlinedTextField` with exact colors, shape, border, placeholder style, content padding, keyboard type, and visual state. Never fake an input with `Box` plus placeholder `Text`.

## A-RULE 5 - RESPONSIVENESS

Use `BoxWithConstraints`, `WindowSizeClass`, or existing project adaptive helpers. Validate at 360dp, 480dp, 600dp, 768dp, 1024dp, and 1440dp-equivalent widths where applicable.

Fluid elements use `fillMaxWidth()` with Figma-derived padding. Fixed-size elements use explicit dimensions only when the Figma node is fixed.

## A-RULE 6 - COMPOSE OUTPUT

Generate:

- one `{ComponentName}Screen.kt` or `{ComponentName}.kt` Composable
- token files under the existing theme package
- navigation registration only if the project already has a navigation graph
- local drawable/font resources for every Figma asset
- previews only if the project already uses Compose previews

Run `./gradlew assembleDebug` or the project-specific Android build command when feasible.

## A-RULE 7 - ICON AND DIVIDER CONTROL

- **No Guessing/Hallucination**: Resource/icon names (such as Material icons or local asset filenames) must NEVER be guessed or hallucinated. Always use verified/correct resource names.
- **Centered Dividers**: For horizontal divider structures flanking text (e.g., `─── OR ───` inside a `Row`), ensure flanking lines (e.g. `Divider` or `HorizontalDivider`) are configured using equal weights (such as `.weight(1f)`) to guarantee the text remains centered.

```kotlin
// CORRECT — Centered dividers flanking text in Jetpack Compose Row
Row(
    modifier = Modifier.fillMaxWidth(),
    verticalAlignment = Alignment.CenterVertically
) {
    HorizontalDivider(modifier = Modifier.weight(1f), color = AppColors.divider)
    Text(
        text = "OR",
        modifier = Modifier.padding(horizontal = AppSpacing.md),
        style = AppTypography.caption
    )
    HorizontalDivider(modifier = Modifier.weight(1f), color = AppColors.divider)
}
```

---

# PART B - XML Views

Apply this part only when delivery mode is **XML Views**.

## B - VIEW-FIRST RULE

Map every Figma element to the semantically correct Android View or Material component.

| Figma element | Required Android View | Forbidden substitute |
|---|---|---|
| Screen root | `ConstraintLayout`, `LinearLayout`, `ScrollView`, or `NestedScrollView` | Flat absolute layout without constraints |
| Text | `TextView` | `EditText` for display text |
| Single-line input | `TextInputLayout` + `TextInputEditText` or `EditText` if project does not use Material | `TextView` pretending to be input |
| Button | `MaterialButton`, `Button`, or `ImageButton` | Clickable `TextView` |
| Checkbox/radio/switch | `CheckBox`, `RadioButton`, `SwitchMaterial` | Decorative-only `View` |
| Image/icon | `ImageView` with local drawable | Guessed vector/material icon unless Figma uses it |
| Card/panel | `MaterialCardView` or `CardView` | Plain layout with default shadow mismatch |
| List | `RecyclerView` | Long static `LinearLayout` |
| Divider | `View` with exact height/color | Text dashes |

## B-RULE 1 - RESOURCE TOKENS

Create or update Android resources before layout code:

```text
app/src/main/res/values/figma_colors.xml
app/src/main/res/values/figma_dimens.xml
app/src/main/res/values/figma_typography.xml
app/src/main/res/values/figma_styles.xml
```

If the project already uses `colors.xml`, `dimens.xml`, `styles.xml`, Material theme overlays, or another token naming convention, append the Figma resources there instead of creating duplicate resource systems. Use exact Figma values in Figma mode and add comments with the Figma variable or node name. In screenshot mode, add estimated-value comments.

→ See examples/platform-code-examples.md — ## Android: Resource Tokens — XML Template

Layouts must reference `@color/figma_*`, `@dimen/figma_*`, and `@style/figma_*` rather than inline literals.

## B-RULE 2 - EXACT XML ATTRIBUTES

Every visible view must set exact Figma values:

- `layout_width`, `layout_height`
- margins and padding
- background drawable/color
- corner radius and stroke through drawable XML or Material shape attributes
- `fontFamily`, `textSize`, `lineHeight`, `letterSpacing`, `textColor`
- `scaleType`, `adjustViewBounds`, tint, width, and height for images/icons

Do not rely on default Material or AppCompat dimensions.

## B-RULE 3 - DRAWABLES AND SHAPES

Create shape drawables for fills, borders, rounded corners, gradients, and pressed/disabled states:

```text
app/src/main/res/drawable/figma_<component>_<state>.xml
```

Use vector drawables only for icons exported from Figma or existing project assets. Do not substitute guessed Material icons for Figma custom icons.

## B-RULE 4 - ACTIVITY / FRAGMENT COMPANION CODE

Generate Kotlin or Java companion code only for wiring, state, and accessibility:

- `{ComponentName}Activity.kt`, `{ComponentName}Fragment.kt`, or update the existing screen owner
- ViewBinding/DataBinding usage if the project already uses it
- click listeners without business logic
- content descriptions when Figma or layer names indicate accessibility labels

Do not add API calls, persistence, or business state.

## B-RULE 5 - RESPONSIVENESS

Use Android resource qualifiers when layouts differ by width:

```text
res/layout/
res/layout-sw600dp/
res/layout-sw720dp/
res/values-sw600dp/
```

Use `ConstraintLayout` constraints, `Guideline`, chains, and `0dp` match constraints for fluid layouts. Use fixed `dp` only where Figma explicitly fixes dimensions.

## B-RULE 6 - XML OUTPUT

Generate:

- `app/src/main/res/layout/<component_name>.xml`
- token resource files under `res/values`
- drawable resources under `res/drawable`
- Kotlin/Java companion file only when needed by the existing architecture
- manifest/navigation updates only if the project already requires them for a new screen
- layout qualifiers (`layout-sw600dp`, `values-sw600dp`, etc.) only when the Figma/screenshot layout needs width-specific adaptation

Run `./gradlew assembleDebug` or the project-specific Android build command when feasible.

## B-RULE 7 - ICON AND DIVIDER CONTROL

- **No Guessing/Hallucination**: Resource/icon names (such as Material icons, drawables, or vector assets) must NEVER be guessed or hallucinated. Always use verified/correct resource names.
- **Centered Dividers**: For horizontal divider structures flanking text (e.g., `─── OR ───` in XML layouts), ensure flanking views have equal width (e.g. using `0dp` and equal weights `layout_weight="1"` in `LinearLayout`, or constraint equal width `app:layout_constraintWidth_percent` / matching constraint width in `ConstraintLayout`) to guarantee the text remains centered.

```xml
<!-- CORRECT — Centered dividers flanking text in XML LinearLayout -->
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:gravity="center_vertical">

    <View
        android:id="@+id/left_divider"
        android:layout_width="0dp"
        android:layout_height="1dp"
        android:layout_weight="1"
        android:background="@color/figma_divider"/>

    <TextView
        android:id="@+id/divider_text"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:paddingStart="8dp"
        android:paddingEnd="8dp"
        android:text="OR"
        android:textColor="@color/figma_text_secondary"/>

    <View
        android:id="@+id/right_divider"
        android:layout_width="0dp"
        android:layout_height="1dp"
        android:layout_weight="1"
        android:background="@color/figma_divider"/>
</LinearLayout>
```

---

# ANDROID ASSET RULES

Download every Figma MCP asset to project-local Android resources before code is finalized.

Preferred destinations:

- Raster assets: `app/src/main/res/drawable/figma_<hash>.png` or density-specific drawable folders when density exports exist
- Vector assets: `app/src/main/res/drawable/figma_<hash>.xml` only when the SVG/vector path is preserved accurately
- Large raw assets that cannot become resources: `app/src/main/assets/figma/<hash>.<ext>`

Android resource names must be lowercase snake_case. Preserve the Figma hash in the name, but normalize illegal characters.

Remove all `http://localhost:3845/assets/...` URLs from generated files.

In screenshot mode, do not invent drawable contents. Add stable placeholder references only when the project already has the asset; otherwise leave a `TODO: add asset to project - sourced from screenshot` comment at the use site and in the report.

---

# ANDROID MANUAL VISUAL VERIFICATION

> **This step is MANDATORY.**
> You MUST run the application on an emulator, simulator, or device, and manually compare the rendered UI side-by-side with the Figma layout or design screenshot.

Verify that:
- Core layouts, padding, margins, and elevations align with the design spec.
- Colors, styling, and fonts match design tokens.
- No layout overflow or compile errors remain.

Document layout mismatches and adjustments in the final report mismatch table.

---

# ANDROID TEST IDENTIFIERS (MANDATORY)

Every UI element must have a test ID. Store these in a separate file (e.g. `TestIdentifiers.kt` in the feature theme/utils directory) containing static `const val` strings for static elements, and dynamic member functions for dynamic elements (such as list cells, dropdown options, and multi-selection items).

### Example `TestIdentifiers.kt`
```kotlin
object TestIdentifiers {
    const val LOGIN_TITLE = "login_label_title"
    
    // Dynamic function based on index and value
    fun loginDropdownOption(index: Int, value: String): String {
        val normalized = value.lowercase().replace(" ", "_")
        return "login_dropdown_option_${index}_${normalized}"
    }
}
```

### Usage in Jetpack Compose
Bind these test IDs to composables using the `Modifier.semantics { testTag = ... }` or `Modifier.testTag(...)`.
```kotlin
@Composable
fun LoginScreen() {
    val options = listOf("Self", "Spouse", "Child")
    Column {
        Text("Login", modifier = Modifier.semantics { testTag = TestIdentifiers.LOGIN_TITLE })
        options.forEachIndexed { index, option ->
            Box(modifier = Modifier
                .semantics { testTag = TestIdentifiers.loginDropdownOption(index, option) }
                .clickable { }
            ) {
                Text(option)
            }
        }
    }
}
```

### Usage in XML Views
Assign these identifiers dynamically in the Fragment/Activity class (e.g. via `contentDescription` or view tags):
```kotlin
class LoginActivity : AppCompatActivity() {
    private fun setupAccessibilityIdentifiers() {
        binding.titleLabel.contentDescription = TestIdentifiers.LOGIN_TITLE
    }
    
    // In dynamic option cell or dropdown setup:
    // optionView.contentDescription = TestIdentifiers.loginDropdownOption(index, option)
}
```

---

# ANDROID FAIL CONDITIONS


Reject and regenerate if any of these are true:

- Android native project uses React Native, Flutter, HTML, CSS, Tailwind, or DOM APIs
- XML screen fakes inputs/buttons with text-only views
- Compose screen fakes inputs/buttons without semantic controls
- Raw colors, dimens, typography, or radii are hardcoded repeatedly instead of tokenized
- Figma assets remain as localhost URLs
- Custom Figma icons are replaced by guessed Material icons
- Layout clips under status/navigation bars
- Mixed Compose/XML delivery mode was assumed without user confirmation
- Responsive validation or screenshot comparison is missing
