# Figma UI Generator — Quality Rules

All output from this skill MUST satisfy these rules before being marked complete.
Rules are enforced by `scripts/validate-output.js` and checked manually in the report.

---

## Q-RULE 1 — Stack Detection Must Be Evidence-Based

| Rule | Condition | Severity |
|---|---|---|
| Platform detected from project evidence | `package.json`, manifest, lock files, source extensions, config files | BLOCKING |
| No platform assumed without evidence | If no evidence — ask; do not default to Angular or web | BLOCKING |
| At most one clarification question | Ask ONE targeted question when confidence is low | WARNING |

---

## Q-RULE 2 — Guideline Must Be Loaded Before Any Code

| Rule | Condition | Severity |
|---|---|---|
| Platform guideline loaded in full | `read_file` on the matching `references/<platform>-guideline.md` | BLOCKING |
| Guideline loaded BEFORE any file is written | No code generation until guideline is in context | BLOCKING |
| Correct guideline for the detected stack | React Native uses `react-native-figma-guideline.md`, not the React guideline | BLOCKING |

---

## Q-RULE 3 — UI Section Analysis Must Complete Before Code

| Rule | Condition | Severity |
|---|---|---|
| Section-by-section Figma analysis produced | Written analysis covering all visible sections | BLOCKING |
| Every section mapped to a platform primitive | No section left unmapped | BLOCKING |
| Ambiguous values annotated | `// TODO: confirm with design system` on every estimated value | WARNING |

---

## Q-RULE 4 — Design Tokens Must Be Extracted Before Styles

| Rule | Condition | Severity |
|---|---|---|
| Token file written before any component style | Token extraction step must complete first | BLOCKING |
| No inline magic values in component files | All colours, sizes, spacing from token constants | BLOCKING |
| All 7 token categories present | Colours, Typography, Spacing, Layout constants, Border & radius, Shadows, Breakpoints | WARNING |
| Existing token file — append only | Never overwrite existing tokens; add only new ones | BLOCKING |

---

## Q-RULE 5 — Assets Must Be Local (Figma Mode)

| Rule | Condition | Severity |
|---|---|---|
| Zero `localhost:3845` URLs in final code | All MCP asset URLs replaced with project-local paths | BLOCKING |
| Original hash filename preserved | Do NOT rename to `logo.png`, `icon.png`, etc. | WARNING |
| Asset folder per platform guideline | `Assets.xcassets/Figma/` for iOS, `assets/figma/` for RN/Flutter, etc. | BLOCKING |

---

## Q-RULE 6 — Platform Build Must Pass

| Rule | Condition | Severity |
|---|---|---|
| Build command run after all files written | Exit code must be 0 | BLOCKING |
| All compile-time errors fixed before delivery | Zero errors allowed | BLOCKING |
| Build command follows platform guideline | `xcodebuild`, `ng build`, `flutter build`, `./gradlew assembleDebug`, etc. | WARNING |

---

## Q-RULE 7 — Visual Comparison (Manual Verification)

| Rule | Condition | Severity |
|---|---|---|
| Reference screenshot obtained | Figma MCP `get_screenshot` (Figma mode) or user image (screenshot mode) if available | WARNING |
| Generated screenshot obtained | Live platform running app manually reviewed | WARNING |
| Visual correctness | Manual inspection confirms high layout fidelity | WARNING |
| Significant mismatches logged and fixed | Mismatch log in report updated after visual verification | WARNING |

---

## Q-RULE 8 — Todos Must Track Every File

| Rule | Condition | Severity |
|---|---|---|
| `manage_todo_list` called before first file is written | One todo per file + validation + screenshot | WARNING |
| Todos kept current | Mark in-progress before starting; completed immediately after | WARNING |
| Never more than one todo in-progress | Sequential execution only | WARNING |

---

## Q-RULE 9 — Report Must Be Complete

| Rule | Condition | Severity |
|---|---|---|
| Report saved to `reports/<componentName>-report.md` | Using `assets/report-template.md` | WARNING |
| All affected files listed | Every created and modified file documented | WARNING |
| Assumptions documented | All inferred/estimated values noted in fallbackNotes | WARNING |
| VERDICT set to PASS or FAIL | Cannot be left blank | BLOCKING |

---

## Q-RULE 10 — Component & Visual Properties Fidelity

| Rule | Condition | Severity |
|---|---|---|
| All component properties mapped | Every defined component property (variants, booleans, text, instance swap) mapped to code interface parameter/prop | BLOCKING |
| Component properties utilized | Mapped properties fully bound to visual structure and logic in the component code (no skipped properties) | BLOCKING |
| Visual properties & strokes compliance | Stroke colors, weights, styles, alignments, and other layout/visual properties implemented exactly as per Figma with zero deviation | BLOCKING |

---

## Severity Legend

| Severity | Meaning |
|---|---|
| BLOCKING | Output MUST NOT be delivered if this rule is violated |
| WARNING | Flag in report; delivery allowed if user accepts the risk |
