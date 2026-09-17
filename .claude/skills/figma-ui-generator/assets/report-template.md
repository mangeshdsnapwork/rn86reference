# Component Generation Report — TEMPLATE

> Copy this file and rename to `<component-name>-report.md` for each generation.
> Fill every `<placeholder>` before marking the task complete.

---

## Metadata

| Field | Value |
|---|---|
| Component name | `<component-name>` |
| Feature / domain | `<feature>` |
| Platform | `<angular \| react \| react-native \| flutter \| ios \| android \| web>` |
| Delivery mode | `<e.g. UIKit Storyboard \| SwiftUI \| Jetpack Compose \| etc.>` |
| Input mode | `<figma \| screenshot>` |
| Figma URL / node ID | `<url or node-id — write "screenshot" if input mode is screenshot>` |
| Generated date | `<YYYY-MM-DD>` |
| Skill version | 5.9.0 |

---

## Part 1 — Stack Detection

| Dimension | Detected value | Evidence file |
|---|---|---|
| platform | | |
| framework | | |
| component_library | | |
| styling_approach | | |
| build_system | | |
| Confidence level | high / medium / low | |
| Guideline loaded | `references/<guideline-file>.md` | |

---

## Part 2 — UI Component Mapping

List every Figma section and the platform primitive/component used. Add rows as needed.

| Figma section | Platform component used | Semantically correct? |
|---|---|---|
| | | PASS / FAIL |
| | | PASS / FAIL |
| | | PASS / FAIL |
| | | PASS / FAIL |
| | | PASS / FAIL |

---

## Part 2B — Figma Component Properties Mapping

List every Figma component property detected (variants, booleans, text, instance swap) and its mapping in the code interface.

| Figma Component / Node | Property Name | Property Type (Variant/Boolean/Text/Instance Swap) | Mapped Code Prop/Argument | Utilized in Logic? |
|---|---|---|---|---|
| | | | | PASS / FAIL |
| | | | | PASS / FAIL |
| | | | | PASS / FAIL |

---

## Part 3 — Design Tokens

| Token category | Token file written? | All values from Figma? |
|---|---|---|
| Colours | PASS / FAIL | PASS / FAIL |
| Typography | PASS / FAIL | PASS / FAIL |
| Spacing | PASS / FAIL | PASS / FAIL |
| Border & radius | PASS / FAIL | PASS / FAIL |
| Shadows | PASS / FAIL | PASS / FAIL |
| Breakpoints | PASS / FAIL | PASS / FAIL |

**No inline magic values in component files:** PASS / FAIL

---

## Part 4 — Assets

| Asset filename | Downloaded / referenced? | `localhost:3845` URL removed? | Dimensions match Figma? |
|---|---|---|---|
| `<name>.<ext>` | PASS / FAIL | PASS / FAIL | PASS / FAIL |

**Zero `localhost:3845` URLs remaining in code:** PASS / FAIL

---

## Part 5 — Dimension Accuracy

| Element | Figma value | Generated value | Match? |
|---|---|---|---|
| | | | PASS / FAIL |
| | | | PASS / FAIL |
| | | | PASS / FAIL |
| | | | PASS / FAIL |

---

## Part 5B — Stroke & Visual Properties Accuracy

Verify that layer stroke properties (color, weight, alignment, style) and other visual properties (fills, shadows, opacity, radius) match Figma with zero deviation.

| Layer / Element | Property Category (Stroke/Fill/Shadows/etc.) | Figma Specification | Generated Specification | Match? |
|---|---|---|---|---|
| | | | | PASS / FAIL |
| | | | | PASS / FAIL |
| | | | | PASS / FAIL |

---

## Part 6 — Typography Accuracy

| Text element | Figma font | Figma size | Figma weight | Generated | Match? |
|---|---|---|---|---|---|
| | | | | | PASS / FAIL |
| | | | | | PASS / FAIL |

---

## Part 7 — Platform Override Compliance

List any platform-specific override rules required (e.g. Angular `!important` overrides, iOS `layer.cornerRadius`, RN `StyleSheet` only). Mark N/A if the rule does not apply.

| Rule | Applied? | Notes |
|---|---|---|
| | PASS / FAIL / N/A | |
| | PASS / FAIL / N/A | |

---

## Part 8 — Visual Verification (Manual check)

### Reference / Design Source
- Source: Figma design URL / Node ID / Attached screenshot
- Manual review completed: YES / NO

### Live Render Review
- Rendered target manually reviewed in runner/browser/emulator: YES / NO
- Build exit code 0: PASS / FAIL

### Mismatch log / Adjustments

| # | Element | Expected (Design) | Actual (Generated) | Fix applied |
|---|---|---|---|---|
| 1 | | | | |

### Visual check results

| Check | Pass? |
|---|---|
| Overall layout structure | PASS / FAIL / NA |
| Colours exact | PASS / FAIL / NA |
| Typography exact (font, size, weight) | PASS / FAIL / NA |
| Spacing / padding exact | PASS / FAIL / NA |
| Button size and style exact | PASS / FAIL / NA |
| Input size and style exact | PASS / FAIL / NA |
| Icons correct (no substitutions without permission) | PASS / FAIL / NA |
| No broken images / assets | PASS / FAIL / NA |
| No layout overflow | PASS / FAIL / NA |
| Responsive at all applicable breakpoints | PASS / FAIL / NA |

**Visual layout match status:** [ ] APPROVED / [ ] REQUIRES REVIEW

---

## Part 9 — Final Enforcement Checklist

### Section A — Pre-generation
- [ ] Platform guideline read in full before writing any code
- [ ] UI section analysis (Step 5) completed before writing any code
- [ ] Design tokens extracted before writing any style
- [ ] All assets downloaded / referenced; zero `localhost:3845` URLs

### Section B — Implementation
- [ ] Correct semantic component used for every Figma element (per platform guideline)
- [ ] All component properties (variants, booleans, text, instance swap) are fully read, mapped to the component interface, and utilized in the code
- [ ] All layer stroke colors, weights, alignments, styles, and other visual properties are implemented exactly as per Figma with no deviations
- [ ] All visual styling from token constants — no inline magic values
- [ ] All dimensions match Figma exactly
- [ ] Responsive behaviour verified at all applicable breakpoints

### Section C — Validation
- [ ] Platform build command run; exit code 0
- [ ] Component rendering manually reviewed
- [ ] Mismatch log updated and fixed (if applicable)

### Section D — Delivery
- [ ] All affected files listed in this report
- [ ] Assumptions and fallback notes documented
- [ ] Report saved to `reports/<componentName>-report.md`

---

## Affected Files

| File path | Action (created / modified) |
|---|---|
| | |
| | |

---

## Assumptions & Fallback Notes

- 

---

## VERDICT

**[ ] PASS — all checks green, manual visual verification successful, build successful**

**[ ] FAIL — open items:**
-
-

