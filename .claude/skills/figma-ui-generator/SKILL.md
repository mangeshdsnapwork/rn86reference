---
name: figma-ui-generator
description: Generate production-ready UI components from a Figma design OR a screenshot for any supported framework and platform. Accepts a Figma URL/node ID or an attached screenshot image as the design source. Detects the tech stack automatically and loads the matching framework-specific guideline at runtime. Enforces 95%+ visual accuracy, mobile responsiveness, and design token extraction.
---

## Purpose

Convert a Figma design **or a screenshot** into production-ready UI components for any supported framework and platform.

This skill:
- Accepts **two input modes**: (a) Figma URL/node — full MCP-powered token + asset extraction; (b) Screenshot image — AI visual analysis extracts layout, colours, typography, and spacing directly from the image
- Detects the tech stack from project evidence (no assumptions)
- Loads the matching framework-specific guideline and follows it word-for-word
- Extracts design tokens globally before writing any component style
- Extracts and maps all Figma component properties (variants, boolean properties, text properties, instance swap properties) into component props/parameters/arguments, avoiding missing any component characteristics
- Extracts and applies all layer visual/layout properties (stroke colors, stroke weight/thickness, stroke style/alignment, fills, shadows, opacity, corner radius, borders, padding, spacing, and alignment) exactly as per Figma with no deviations
- Downloads all Figma MCP assets to project-local paths (Figma mode only)
- Enforces mobile responsiveness across all breakpoints
- Supports manual visual verification between Figma/screenshot and the generated output
- Supports any frontend platform — detects the stack from project evidence and loads the matching guideline at runtime

No business logic is generated. UI structure and styles only.

---

## Trigger Conditions

Use when:

- You have a **Figma design URL** and want to generate production-ready UI components from it
- You have a **screenshot** (PNG/JPG/WEBP) of a design — from Figma, Zeplin, a PDF, a hand-drawn wireframe, or a live app — and want to convert it to code
- You are working on any frontend platform — stack is auto-detected from project evidence
- You need pixel-accurate, mobile-responsive components that match the source design at 95%+ fidelity
- You want design tokens (colours, typography, spacing, breakpoints) extracted automatically into the project's global token file
- You need Figma assets downloaded to project-local paths (Figma mode only)
- You are scaffolding a new feature UI and want it aligned to the project's existing component library and style conventions

Do NOT use when:

- You need business logic, state management, or API integration — this skill generates UI structure and styles only
- The screenshot is too low-resolution to read colours, text, or spacing reliably (< 300 px wide)
- The Figma Desktop MCP server is not running AND no screenshot is provided

Keywords: `figma`, `ui-generation`, `design-to-code`, `screenshot-to-code`, `design-tokens`, `responsive`, `pixel-accurate`, `create UI from figma`, `generate UI from figma`, `convert figma to code`, `scaffold UI from design`, `implement UI from figma URL`, `create UI from screenshot`, `generate UI from this image`, `convert screenshot to code`, `build UI from this design image`, `implement this screen from screenshot`, `make this design into code`, `convert this image to UI`

---

## Inputs

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `figmaUrl` | string | yes* | Figma design URL or node ID — `https://www.figma.com/design/...` (*required unless `screenshot` is provided) |
| `screenshot` | image | yes* | Attached PNG/JPG/WEBP screenshot of the design (*required unless `figmaUrl` is provided) |
| `componentName` | string | yes | PascalCase name for the component — drives all file names and class names (e.g. `LoginForm`, `DashboardCard`) |
| `featureName` | string | yes | Short lowercase folder label for the feature domain (e.g. `auth`, `dashboard`, `payment`) |
| `targetPlatform` | string | no | Override the auto-detected stack — one of: `angular` \| `react` \| `react-native` \| `flutter` \| `ios` \| `android` \| `web` |
| `reuseComponents` | array (JSON) | no | Optional list of existing components to reuse, containing filename and componentName keys. |

Input rules:
- `figmaUrl` and `screenshot` are mutually substitutable — provide at least one; `figmaUrl` takes precedence when both are provided
- `componentName` and `featureName` are always required — do NOT infer or assume either
- `featureName` is a short lowercase folder label, not a sentence
- `targetPlatform` is optional; if omitted, detect automatically from project evidence (Step 3)
- `reuseComponents` is optional. If provided, contains metadata for existing components to reuse in the implementation.

---

# Step 1 — Collect User Inputs (BLOCKING)

## 1A — Detect Input Mode

First, determine which input mode the user is providing:

| Mode | Signal | Key |
|------|--------|-----|
| **Figma mode** | User provides a `figma.com` URL or a node ID | `inputMode = figma` |
| **Screenshot mode** | User attaches an image (PNG/JPG/WEBP) or pastes a screenshot | `inputMode = screenshot` |
| **Both** | User provides both a Figma URL and a screenshot | `inputMode = figma` (Figma is authoritative; screenshot used as visual reference only) |

If neither is present, ask:
> "Please provide either a Figma design URL/node ID or attach a screenshot of the design you want to convert."

## 1B — Collect Common Inputs

Always ask for:

| Input | Key | Example | Required |
|-------|-----|---------|----------|
| Design source | `figmaUrl` or attached image | `https://www.figma.com/design/...` or image attachment | Yes (one of the two) |
| Component name | `componentName` | `LoginForm`, `DashboardCard` | Yes |
| Feature / domain folder | `featureName` | `auth`, `dashboard`, `payment` | Yes |

Rules:
- Do NOT infer or assume any of these values
- `featureName` is a short lowercase folder label, not a sentence
- `componentName` drives all file names and class names

## 1C — Platform Detection Order (NEVER ask first)

**Run Step 3 (stack detection) BEFORE asking the user about platform.**
Only ask the user if Step 3 cannot confidently determine the platform and delivery mode.

| Step 3 result | Action |
|---------------|--------|
| High-confidence single platform + delivery mode detected | Proceed automatically — do NOT ask |
| Platform detected, MIXED delivery modes | Ask the delivery mode question defined in the loaded platform guideline |
| Platform ambiguous / no signals | Ask for platform — offer a short list based on detected signals only |

**Never show all available platform options if the project clearl## Step 2 — Validate Design Source and Collect Evidence (BLOCKING)

### 2A — Figma Mode Evidence Pipeline

Do NOT rely solely on `get_design_context`. Create an evidence-driven workflow:

1. Validate the Figma URL, node ID, or selected node.
2. Detect the active Figma MCP mode (Remote MCP, Desktop MCP, or unavailable).
3. **Evidence Completeness Check**: The agent must distinguish between `NOT AVAILABLE` (information doesn't exist) and `NOT CHECKED` (agent skipped it). Do NOT silently treat "not checked" as "not present."
4. For large or complex selections, call `get_metadata` to get a sparse XML outline of the layer tree.
5. Issue targeted `get_design_context` calls for detailed layer context.
6. Call `get_variable_defs` when variables/styles/tokens are present to extract semantic design tokens.
7. Call `get_screenshot` for visual reference and validation.
8. Use the supported Figma MCP asset-download mechanism when available. Do NOT rely exclusively on `localhost:3845`, and do NOT assume a URL in the design context means the asset is verified.
9. Use `get_motion_context` only when motion/animation information is required.
10. Combine all collected evidence before generating any iOS code. Fail generation only if *required* evidence is missing (e.g., missing custom font, missing asset, missing required token).

If validation fails, stop immediately and return:

```
status: BLOCKED
reason: <why it failed>
requiredAction: <what the user must do to unblock>
```

**CODE CONNECT IS STRICTLY FORBIDDEN:**
- Do NOT use Code Connect.
- Do NOT call `get_code_connect_map`, `get_code_connect_suggestions`, `get_context_for_code_connect`, or `send_code_connect_mappings`.
- Do NOT make Code Connect a prerequisite or dependency.
- Do NOT fail generation because Code Connect is unavailable.
- Component reuse must continue to work EXCLUSIVELY through Figma INSTANCE/COMPONENT/COMPONENT_SET detection, existing component scanning, name/property matching, and optional user-provided mapping.

**Figma File Structure Analysis**:
Before implementation, inspect the Figma file/page structure. Identify style guides, component pages, and canonical design/screen pages (mobile, tablet, desktop frames vs explorations). Prefer explicit production frames over playgrounds.

**Developer Intent / Annotations**:
Inspect Figma annotations and developer notes. Treat explicit annotations as higher-priority implementation evidence than visual inference for behavior, responsive rules, accessibility, interactions, and component states.

- **Hidden Components and Layers Filter**:
  - During design tree scanning and metadata/context analysis, verify the `visible` attribute of each layer/node. Skip hidden layers.

- **Check for Reusable Components**:
  - Classify layers strictly by applying these rules:
    1. **Reusable Component Instances**: If `type == INSTANCE` AND `componentId` exists.
    2. **Reusable Component Definitions**: If `type == COMPONENT` or `type == COMPONENT_SET`.
    3. **Non-Reusable Elements**: Standard layers without component references.
  - Extract and create reusable components first, saving them to separate self-contained files.
- Prompt the user (BLOCKING pause) to provide a JSON mapping file (or path/raw content) containing the mappings:
    > "These UI components are present in Figma. Please provide a JSON file containing the component mapping to reuse existing components. Example mapping format:
    ```json
    {
      "mapper": [
        {
          "component_name": "primary button",
          "file_name": "primaryButton.swift",
          "scaned_component_name": "button"
        }
      ]
    }
    ```"

## Screenshot Mode

- Call `view_image` on the attached screenshot to load it into context
- Validate that the image is readable:
  - Minimum resolution: 300 px on the shortest side
  - Must contain at least one visible UI element (buttons, inputs, labels, images, navigation bars, etc.)
- If the image is unreadable or too low-resolution, stop and return:

```
status: BLOCKED
reason: Screenshot resolution too low or no UI elements detected
requiredAction: Provide a higher-resolution screenshot (min 300px shortest side)
```

- If valid, record `screenshotPath`, `screenshotResolution`, and `inputMode = screenshot`

Do NOT proceed past this step if the screenshot is unreadable.

---

# Step 3 — Detect Tech Stack (Evidence-Based, No Assumptions)

Scan the project for evidence in this precedence order:

1. Explicit user declaration (`targetPlatform` from Step 1)
2. `package.json`, `pubspec.yaml`, `build.gradle`, or equivalent manifest
3. Lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `Podfile.lock`)
4. Framework config files (`angular.json`, `vite.config.*`, `tailwind.config.*`, `metro.config.js`)
5. Source file extensions and import patterns (`.swift`, `.kt`, `.dart`, `.tsx`, `.vue`)
6. Directory structure and deployment signals (`android/`, `ios/`, `lib/`, `src/`)

Detect and record each dimension:

| Dimension | How to detect |
|-----------|---------------|
| platform | web, ios, android, cross-platform — inferred from project structure |
| language | inferred from source file extensions and import statements |
| framework | inferred from manifest files, config files, and source imports |
| component_library | inferred from dependencies in manifest files |
| styling_approach | inferred from config files and source imports |
| build_system | inferred from config files present in the project root |
| package_manager | inferred from lock files and manifest format |

Platform-specific detection signals and sub-detection rules (e.g. delivery mode within a platform) are defined in each platform’s guideline file. After initial detection via the signals above, load the matching guideline (Step 4) and apply any additional detection rules it defines.

### Confidence → Execution Mode

| Confidence | Action |
|------------|--------|
| High (single delivery mode detected) | Proceed automatically |
| Medium (minor ambiguity, secondary signals) | Proceed and disclose assumption |
| Low (mixed or no signals) | Apply Rule 3 or Rule 4 above — STOP and ask before proceeding |

---

# Step 4 — Figma Intermediate Design Model & Asset Preparation

Before generating any code, normalize Figma information into an internal design representation.

## 4A — Intermediate Design Representation
Translate Figma layout constraints and semantics before mapping to specific framework views. The internal model must contain:
- Node metadata (ID, name, type, component/set ID)
- Properties (instance, variant, text content)
- Typography and Colors (preserving Figma semantic variable references, no hardcoded overrides where variables exist)
- Layout (spacing, padding, alignment, Auto Layout direction/spacing, sizing mode, constraints, min/max dimensions)
- Visuals (border, radius, opacity, shadow, absolute-positioned children)
- External references (asset references, motion information, interaction/state information, accessibility information, responsive information)

Do NOT directly convert raw Figma coordinates into view frames. Interpret the layout semantics first.

## 4B — Responsive Figma Analysis
Inspect available Figma frames for different sizes/breakpoints. If corresponding frames exist:
- Match corresponding sections.
- Compare visibility, ordering, spacing, typography, states, navigation, and image behavior.
- Derive responsive rules only from observed evidence. Do NOT invent responsive behavior or assume the selected frame width is the universal screen width.

## 4C — Asset Manifest and Extraction
Use the supported Figma MCP asset-download capability. Maintain an internal asset manifest containing: `figmaNodeId`, `figmaName`, `assetType`, `source`, `exportFormat`, `localPath`, `iOSAssetName`, and `status`. Statuses include: `discovered`, `downloading`, `downloaded`, `verified`, `registered`, `referenced`, and `failed`.
- Ensure downloaded files are verified (they exist and are readable).
- Do not consider an asset complete until the local file AND the generated code reference have both been verified. The absence of a localhost URL is not proof of success.
- Code generation MUST fail if a required asset is missing, failed to download, or does not resolve in code (e.g., Xcode asset not registered, generated SwiftUI/UIKit reference fails).
- For iOS: place assets into `Assets.xcassets/Figma/` (or equivalent destination).

---

# Step 5 — Load Framework Guideline (BLOCKING)

Using the detected stack from Step 3, identify the matching entry in the `## References

Load ALL files for the detected stack. Never load files for another stack.

### Web — Angular
1. references/angular-guideline-mapping.md
2. references/angular-guideline-rules.md
3. references/angular-guideline-analysis.md
4. references/angular-guideline-build.md

### Web — React
5. references/react-guideline-rules.md
6. references/react-guideline-analysis.md
7. references/react-guideline-build.md

### React Native
8. references/react-native-guideline.md

### Flutter / Dart
9. references/flutter-guideline-rules.md
10. references/flutter-guideline-steps.md

### iOS — SwiftUI
11. references/ios-swiftui-guideline.md
12. references/ios-swiftui-controls.md

### iOS — UIKit / Storyboard / XIB
13. references/ios-uikit-guideline.md
14. references/ios-uikit-storyboard-rules.md

### Android
15. references/android-guideline.md

## Assets

Read BEFORE generating any output. Files here define reusable rules, templates, and fail conditions.

- `assets/report-template.md` — template to copy when writing the final component generation report (Step 12); defines all 9 required sections
- `assets/quality-rules.md` — canonical quality gates Q-RULE 1–9 with BLOCKING / WARNING severity; enforced at each gate step
- `assets/fail-conditions.md` — universal and per-platform FAIL conditions; any condition listed here triggers an automatic FAIL verdict
- `examples/ios-code-examples.md` — iOS (SwiftUI and UIKit) complete token file templates and XIB template; open when writing iOS token files or component scaffolds
- `examples/platform-code-examples.md` — complete token file templates and component examples for Flutter, Angular, React, and Android; open when writing non-iOS token files or component scaffolds
- `examples/token-extraction-reference.md` — expected token file output shape per platform; open when writing a token file for a new stack
- `examples/platform-output-samples.md` — minimal component code stubs for all 8 delivery targets; open when the loaded guideline needs a concrete code shape reference

## Scripts

Run AFTER all output files are written.

**Validate generated output:**
```bash
node .github/skills/figma-ui-generator/scripts/validate-output.js \
  --report=reports/<componentName>-report.md \
  --component=<componentName> \
  --platform=<platform> \
  --src=<srcRootDir> \
  --screenshots=reports/screenshots
```

**Optional scaffold helper** (when Figma Desktop MCP is unreachable):
```bash
node .github/skills/figma-ui-generator/scripts/figma-ui-generator.js \
  --platform=<platform> --component=<name> --feature=<feature>
```

Script rules:
- `validate-output.js` must be executed automatically after all output is emitted; no manual invocation required
- No external dependencies — uses Node.js built-ins only; requires Node.js ≥ 14
- Exit code 0 = all blocking checks passed; exit code 1 = one or more blocking checks failed
- Script output is appended verbatim as the `SCRIPT_OUTPUT` block of the final response

---

## Rules

- Stack detection must be evidence-based — never assumed
- No framework-specific guideline is loaded before detection completes
- At most ONE clarification question when confidence is low
- Guideline compliance analysis (Step 5) must complete before any code is written
- Design tokens must be extracted before any style file is written
- All localhost asset URLs must be replaced before any component is committed
- Mobile responsiveness must be verified at all applicable breakpoints defined in the loaded platform guideline
- Visual comparison must be manually verified and documented in the report before marking complete
- Todos must be created before any file is written and kept current throughout execution
- After all files are written, run the platform build command to validate there are no compile-time errors. The build command and validation steps are defined in the loaded platform guideline. Fix all errors before marking the task complete.
- **Icon/Asset Validation**: Resource and icon names (including iOS SF Symbols, Android/Flutter Material icons, and web/native asset files) must NEVER be guessed or hallucinated. Always use verified/correct resource names.
- **Centered Divider Alignment**: For horizontal dividers flanking text (e.g., `─── OR ───`), ensure flanking elements have equal width, weight, or flex attributes depending on the platform layout system to guarantee text remains centered.
- **Alignment Management**: All alignments of the UI components must be properly managed as per Figma. Auto-layout settings, axes alignment (primary/counter axis alignment), padding, spacing, and constraints must be strictly translated to the corresponding layout system of the target platform (e.g. stacks in SwiftUI, flex/grid properties in CSS/RN, Column/Row parameters in Jetpack Compose/Flutter).
- **Reusable Design System Components**: Any components that are identified as reusable definitions or instances (e.g., `type == COMPONENT/COMPONENT_SET` or `type == INSTANCE` with `componentId`) must be created in a dedicated design system or component library directory suited to the platform, structured for configuration and reusability. Each such reusable component MUST be created as a separate, self-contained file (e.g., `primaryButton.swift`, `CustomTextField.tsx`) rather than inlining them in the main screen/container file. All reusable components must be created first before the rest of the layout is constructed. Standard `FRAME`, `GROUP`, etc., elements without a component reference are not reusable and should be implemented directly ("as is") within the main screen or container file without separate file extraction. The main screen code will import and use the separate reusable component files.
- **Figma UI Alignment and Coordinate Rule**:
  - When generating UI from a Figma URL or JSON structure, NEVER assume standard horizontal layouts or defaults (such as left-aligning headings or right-aligning action buttons).
  - ALWAYS check and parse the exact `textAlignHorizontal` property for text layers, and compare coordinate bounds (`x`, `width`) to see if elements are centered on the parent frame (e.g., if element center equals parent canvas center: `element.x + element.width / 2` is approximately equal to `parent.width / 2`).
  - Separate full-width frames (e.g., headers or background blocks of width 375pt) from padded form content (width < 375pt) to avoid double horizontal padding in the parent view.
- **Test Identifier Generation**:
  - Every UI element generated must have a test ID (accessibility identifier or test tag) created.
  - All test IDs must be stored in a separate, dedicated file (e.g., `TestIdentifiers.swift`, `testIdentifiers.ts`, `test_keys.dart`, `TestIdentifiers.kt` depending on the platform) containing all the static keys and dynamic parameterized helper functions (for list cells, dropdown options, and multi-select elements).
  - The generated UI elements/views must import and reference these identifiers from the separate file rather than using raw string literals.
- **Figma Component Properties Mapping Rule**:
  - Extract, read, and map every component property (variant properties, boolean, text, instance swap).
  - **Variant Mapping**: Treat Figma variants as implementation states/properties (e.g., `variant = primary, state = disabled` maps to the project's button state abstraction). Do NOT flatten Figma variants into unrelated duplicated static implementations. Support states like `default`, `selected`, `disabled`, `pressed`, `focused`, `loading`, `error`, `expanded/collapsed`, `active/inactive`.
  - Translate Figma component properties directly into the target platform's component props, parameters, or constructor arguments.
  - Map Figma property types to appropriate code types (variants to enums/unions, booleans to bools, text to strings, instance swaps to slot/node arguments).
- **Figma Visual & Stroke Properties Compliance Rule**:
  - All layer visual characteristics (strokes, borders, alignments, radius, shadows) must be implemented exactly. Do not omit visual details.
- **Realistic Content Validation**:
  - After generating the UI, validate with: short text, normal text, longest expected text, localization where applicable, large accessibility text sizes, error/warning text, empty states, and loading states.
  - Check for clipping, overlap, unexpected truncation, broken constraints, or broken layouts. Do NOT declare success using only short placeholder text.
- **Narrow-Screen Validation**:
  - For mobile responsive platforms (especially iOS SwiftUI/UIKit), validate the generated UI at: the smallest supported iPhone width, normal iPhone width, larger iPhone width, and relevant iPad size classes.
  - Check wrapping, overflow, button widths, navigation, images, spacing, cards, bottom sheets, and safe areas.
- **Categorized Validation Gates**:
  - **FAIL** when: 
    - Required Figma variable data was not extracted, or semantic variables were unnecessarily hardcoded.
    - Required asset is missing, download failed, invalid file, or the asset reference does not resolve.
    - Required custom font is missing (and no approved fallback exists), or PostScript name is incorrect.
    - Text is clipped or overlaps at supported Dynamic Type accessibility sizes, or responsive behavior from Figma was ignored (e.g., Fill behavior implemented as fixed width).
    - Required accessibility semantics are missing or decorative images are incorrectly exposed as meaningful.
    - Storyboard/XIB fails ibtool validation, or the iOS project fails xcodebuild.
    - A major visual mismatch remains, a required variant was completely ignored, or a custom Figma asset was replaced by an unsupported guessed SF Symbol.
  - **WARNING** when:
    - Figma responsive intent is ambiguous, no alternate breakpoint exists, or exact implementation intent cannot be established.
  - **UNCERTAIN**:
    - Distinguish between verified, not_available, not_required, not_checked, uncertain, and failed. Record whether evidence was actually inspected. Do NOT report "verified" if it was not checked.
  - NOTE: Do NOT fail merely because Code Connect is unavailable.
- **Visual Validation**: Preserve visual validation but make it deterministic: compare Figma screenshot -> simulator screenshot -> mismatch analysis -> correction -> rebuild -> screenshot. Classify mismatches across structure, position, size, spacing, typography, color, border, radius, shadow, asset, alignment, responsive behavior, safe area, text wrapping, and accessibility. Do NOT declare success merely because the generated code compiles.
- **Preserve Existing Project Architecture**: Before generating code, inspect the existing iOS/target project to determine the architecture (SwiftUI/UIKit, MVVM/MVC, existing design systems, routing, asset/font structures, testing). Do not create parallel or duplicate token/component systems. Reuse existing infrastructure whenever possible.
- **Final Execution Pipeline**: The canonical workflow is: Figma input → MCP connection validation → file/node analysis → metadata → targeted design context → variable extraction → component/variant detection → existing component reuse/mapping → screenshot → annotations/developer intent → asset extraction/download → typography/font resolution → responsive analysis → accessibility analysis → motion/interaction analysis → normalized Figma design model → existing project architecture inspection → token integration → implementation → asset registration → format/lint → build → ibtool validation (where applicable) → simulator launch → screenshot → visual comparison → correction loop → final validation.



