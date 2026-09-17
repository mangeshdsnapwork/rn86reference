
# Step 1.5 — Pixel-Perfect Figma Conversion Rules (MANDATORY)

## DESIGN IS THE SINGLE SOURCE OF TRUTH

Call `get_design_context` to retrieve the implementation context.

Parameters:
- nodeId: `{NODE_ID}`
- dirForAssetWrites: `{DIR_FOR_ASSET_WRITES}`
- forceCode: true
- clientFrameworks: `"angular"`
- clientLanguages: `"typescript,html,scss"`

This call is the SINGLE source of truth for:
- layout
- content placement
- spacing
- typography
- colors
- assets
- auto-layout
- dimensions
- alignment

### Companion MCP tools

The Figma MCP server exposes more than just `get_design_context`. Use them where they fit — they save tokens and improve fidelity:

- **`get_variable_defs`** — returns the design variables and styles (colours, spacing, typography, radii) actually used in the selection. Use this as the **primary source** when populating `_variables.scss` (Step 3 / Step 9). It's leaner and more accurate than scraping values out of `get_design_context` output.
- **`get_metadata`** — returns a sparse XML outline (layer IDs, names, types, sizes) of the selection. For large frames, call this first to plan your reads, then issue targeted `get_design_context` calls per section. This prevents the single big `get_design_context` call from blowing up the context window.
- **`get_screenshot`** — used in Step 11 for the visual comparison loop. It's the official screenshot tool name; do not invent prefixed variants.

### Strict Rules
- Do NOT guess
- Do NOT redraw manually
- Do NOT approximate values
- Do NOT “simplify” Figma layout
- Do NOT rely on Angular Material default visuals
- All measurements must come directly from Figma

---

## MATERIAL-FIRST RULE (TOP PRIORITY)

Always use **Angular Material components first** for any UI element where a Material component exists.

### Component Mapping (with examples)

| Figma element | Angular Material |
|---|---|
| input / search | `mat-form-field` + `input matInput` |
| textarea | `mat-form-field` + `textarea matInput` |
| button | `mat-flat-button` / `mat-stroked-button` / `mat-raised-button` / `mat-icon-button` |
| select / dropdown | `mat-form-field` + `mat-select` + `mat-option` |
| checkbox | `mat-checkbox` |
| radio | `mat-radio-group` + `mat-radio-button` |
| datepicker | `mat-form-field` + `input matDatepicker` + `mat-datepicker` |
| slider | `mat-slider` + `input matSliderThumb` |
| toggle group | `mat-button-toggle-group` + `mat-button-toggle` |
| card | `mat-card` + `mat-card-content` |
| tabs | `mat-tab-group` + `mat-tab` |
| stepper | `mat-stepper` + `mat-step` |
| accordion | `mat-accordion` + `mat-expansion-panel` |
| list | `mat-list` / `mat-nav-list` + `mat-list-item` |
| table | `mat-table` |
| grid | `mat-grid-list` + `mat-grid-tile` |
| toolbar / navbar | `mat-toolbar` + `mat-toolbar-row` |
| dialog | `mat-dialog` (open via `MatDialog.open(...)`) |
| divider | `mat-divider` |
| icon | exported `<img>` for ALL custom Figma icons (default). `mat-icon` is forbidden unless the conditions in Step 7 are met. |

**input** → `mat-form-field + input matInput`
```html
<mat-form-field appearance="outline" class="my-form-field">
  <mat-label>First Name</mat-label>
  <input matInput type="text" [(ngModel)]="firstName" placeholder="Enter first name" />
</mat-form-field>
```

---

**textarea** → `mat-form-field + textarea matInput`
```html
<mat-form-field appearance="outline" class="my-form-field">
  <mat-label>Description</mat-label>
  <textarea matInput rows="4" [(ngModel)]="description" placeholder="Enter description"></textarea>
</mat-form-field>
```

---

**card** → `mat-card`
```html
<mat-card class="my-card">
  <mat-card-header class="my-card__header">
    <mat-card-title>Card Title</mat-card-title>
  </mat-card-header>
  <mat-card-content class="my-card__body">
    <p>Card body content here.</p>
  </mat-card-content>
  <mat-card-actions class="my-card__actions">
    <button mat-flat-button class="my-btn">Action</button>
  </mat-card-actions>
</mat-card>
```

---

**dialog** → `mat-dialog`
```typescript
// Open dialog
this.dialog.open(MyDialogComponent, { width: '480px', data: { id: 1 } });
```
```html
<!-- Dialog template -->
<mat-dialog-container>
  <h2 mat-dialog-title>Confirm Action</h2>
  <mat-dialog-content>Are you sure?</mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-stroked-button mat-dialog-close>Cancel</button>
    <button mat-flat-button [mat-dialog-close]="true">Confirm</button>
  </mat-dialog-actions>
</mat-dialog-container>
```

---

**list** → `mat-list` / `mat-nav-list`
```html
<!-- Static list -->
<mat-list class="my-list">
  <mat-list-item *ngFor="let item of items" class="my-list__item">
    <span matListItemTitle>{{ item.name }}</span>
    <span matListItemLine>{{ item.subtitle }}</span>
  </mat-list-item>
</mat-list>

<!-- Navigation list (clickable rows) -->
<mat-nav-list>
  <a mat-list-item *ngFor="let link of links" [routerLink]="link.route">
    {{ link.label }}
  </a>
</mat-nav-list>
```

---

**tabs** → `mat-tab-group`
```html
<mat-tab-group class="my-tabs" [(selectedIndex)]="activeTab">
  <mat-tab label="Overview">
    <p>Overview content</p>
  </mat-tab>
  <mat-tab label="Details">
    <p>Details content</p>
  </mat-tab>
  <mat-tab label="History">
    <p>History content</p>
  </mat-tab>
</mat-tab-group>
```

---

**divider** → `mat-divider`
```html
<!-- Horizontal divider -->
<mat-divider class="my-divider"></mat-divider>

<!-- Vertical divider (inside flex row) -->
<mat-divider [vertical]="true" class="my-divider--vertical"></mat-divider>
```

---

**icon** → use exported asset `<img>` if Figma uses custom SVG icons; use `mat-icon` only for Material Design iconography
```html
<!--  Custom Figma icon (use img) -->
<img src="assets/figma/ico-arrow-right.svg" alt="" class="my-icon" width="24" height="24" />

<!--  Material Design icon (use mat-icon) -->
<mat-icon class="my-icon">chevron_right</mat-icon>
```

---

**button** → `mat-flat-button` / `mat-stroked-button` / `mat-raised-button` / `mat-icon-button`
```html
<!-- Primary CTA (filled) -->
<button mat-flat-button class="my-btn my-btn--primary" (click)="submit()">Submit</button>

<!-- Secondary (outlined) -->
<button mat-stroked-button class="my-btn my-btn--secondary" (click)="cancel()">Cancel</button>

<!-- Icon-only button -->
<button mat-icon-button class="my-icon-btn" aria-label="Delete">
  <img src="assets/figma/ico-trash.svg" alt="Delete" width="20" height="20" />
</button>
```

---

**checkbox** → `mat-checkbox`
```html
<mat-checkbox [(ngModel)]="isAccepted" class="my-checkbox">
  I agree to the Terms &amp; Conditions
</mat-checkbox>
```

---

**radio** → `mat-radio-group` + `mat-radio-button`
```html
<mat-radio-group [(ngModel)]="selectedOption" class="my-radio-group">
  <mat-radio-button value="yes" class="my-radio">Yes</mat-radio-button>
  <mat-radio-button value="no" class="my-radio">No</mat-radio-button>
</mat-radio-group>
```

---

**select** → `mat-select` inside `mat-form-field`
```html
<mat-form-field appearance="outline" class="my-form-field">
  <mat-label>Loan Type</mat-label>
  <mat-select [(ngModel)]="loanType" placeholder="Select">
    <mat-option value="personal">Personal Loan</mat-option>
    <mat-option value="home">Home Loan</mat-option>
    <mat-option value="auto">Auto Loan</mat-option>
  </mat-select>
</mat-form-field>
```

---

**datepicker** → `mat-datepicker` inside `mat-form-field`
```html
<mat-form-field appearance="outline" class="my-form-field">
  <mat-label>Date of Birth</mat-label>
  <input matInput [matDatepicker]="dob" [(ngModel)]="dateOfBirth" placeholder="DD/MM/YYYY" />
  <mat-datepicker-toggle matIconSuffix [for]="dob"></mat-datepicker-toggle>
  <mat-datepicker #dob></mat-datepicker>
</mat-form-field>
```

---

**toolbar** → `mat-toolbar` + `mat-toolbar-row`
```html
<mat-toolbar class="my-nav__top">
  <mat-toolbar-row class="my-nav__top-row">
    <img src="assets/figma/brand-logo.png" alt="Brand" class="my-nav__logo" />
    <span class="spacer"></span>
    <button mat-button class="my-nav__link">EN</button>
    <button mat-button class="my-nav__link">Notification</button>
  </mat-toolbar-row>
</mat-toolbar>

<mat-toolbar class="my-nav__bottom" color="primary">
  <mat-toolbar-row class="my-nav__bottom-row">
    <button mat-button class="my-nav__item">Dashboard</button>
    <button mat-button class="my-nav__item my-nav__item--active">Score Simulator</button>
    <button mat-button class="my-nav__item">Reports</button>
  </mat-toolbar-row>
</mat-toolbar>
```

---

**stepper** → `mat-stepper`
```html
<mat-stepper [linear]="true" class="my-stepper" #stepper>
  <mat-step label="Personal Details" [completed]="step1Done">
    <!-- step 1 form content -->
    <button mat-flat-button matStepperNext class="my-btn">Next</button>
  </mat-step>
  <mat-step label="Address" [completed]="step2Done">
    <!-- step 2 form content -->
    <button mat-stroked-button matStepperPrevious class="my-btn">Back</button>
    <button mat-flat-button matStepperNext class="my-btn">Next</button>
  </mat-step>
  <mat-step label="Review">
    <!-- review content -->
    <button mat-flat-button class="my-btn" (click)="submit()">Submit</button>
  </mat-step>
</mat-stepper>
```

---

**grid** → `mat-grid-list`
```html
<mat-grid-list cols="3" rowHeight="200px" gutterSize="16px" class="my-grid">
  <mat-grid-tile *ngFor="let item of items" class="my-grid__tile">
    <mat-card class="my-grid__card">{{ item.name }}</mat-card>
  </mat-grid-tile>
</mat-grid-list>
```

---

**accordion / expansion panel** → `mat-accordion` + `mat-expansion-panel`
```html
<mat-accordion class="my-accordion">
  <mat-expansion-panel *ngFor="let panel of panels" class="my-accordion__panel">
    <mat-expansion-panel-header class="my-accordion__header">
      <mat-panel-title class="my-accordion__title">{{ panel.title }}</mat-panel-title>
    </mat-expansion-panel-header>
    <p class="my-accordion__body">{{ panel.content }}</p>
  </mat-expansion-panel>
</mat-accordion>
```

---

**table** → `mat-table`
```html
<table mat-table [dataSource]="dataSource" class="my-table">
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef>Name</th>
    <td mat-cell *matCellDef="let row">{{ row.name }}</td>
  </ng-container>
  <ng-container matColumnDef="amount">
    <th mat-header-cell *matHeaderCellDef>Amount</th>
    <td mat-cell *matCellDef="let row">{{ row.amount }}</td>
  </ng-container>
  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
</table>
```

---

**search** → `mat-form-field + input matInput`
```html
<mat-form-field appearance="outline" class="my-search-field">
  <mat-label>Search</mat-label>
  <input matInput type="search" [(ngModel)]="searchQuery" placeholder="Search..." />
  <button mat-icon-button matSuffix aria-label="Search">
    <img src="assets/figma/ico-search.svg" alt="Search" width="18" height="18" />
  </button>
</mat-form-field>
```

---

**toggle button group** → `mat-button-toggle-group`
```html
<mat-button-toggle-group [(ngModel)]="selectedMode" class="my-toggle-group">
  <mat-button-toggle value="all" class="my-toggle">All</mat-button-toggle>
  <mat-button-toggle value="choose" class="my-toggle">Choose</mat-button-toggle>
</mat-button-toggle-group>
```

---

**slider** → `mat-slider` + `input matSliderThumb`
```html
<mat-slider min="0" max="100" step="1" class="my-slider">
  <input matSliderThumb [(ngModel)]="sliderValue" />
</mat-slider>
```


**Navbar / Toolbar**:
```html
<!--  BANNED -->
<nav class="sso-nav">
  <div class="sso-nav__top">...</div>
</nav>

<!--  REQUIRED -->
<mat-toolbar class="sso-nav__top">
  <mat-toolbar-row>...</mat-toolbar-row>
</mat-toolbar>
```
---

Only use plain HTML tags when **no Angular Material component exists** for that UI element.

### Mandatory Replacement Rule
Do NOT use plain HTML for:
- form controls
- buttons
- cards
- tabs
- toolbars
- lists
- dialogs

unless Angular Material has no equivalent.

---

### ELEMENT-LEVEL VIOLATION TABLE (MANDATORY REFERENCE)

Every element below has a banned plain-HTML form and a required Angular Material form.
**If the banned form appears anywhere in the template, it is a BLOCKING violation.**

| UI Element |  BANNED (plain HTML) |  REQUIRED (Angular Material) | Module to import |
|---|---|---|---|
| Dropdown / Select | `<select>`, `<option>` | `<mat-select>` + `<mat-option>` inside `<mat-form-field>` | `MatSelectModule` |
| Text input | `<input type="text">` as standalone | `<input matInput>` inside `<mat-form-field>` | `MatInputModule` |
| Number input | `<input type="number">` as standalone | `<input matInput type="number">` inside `<mat-form-field>` | `MatInputModule` |
| Prefix / Suffix | `<span class="prefix">` before input | `<span matTextPrefix>` inside `<mat-form-field>` | `MatInputModule` |
| Hint text | `<p class="hint">` below input | `<mat-hint>` inside `<mat-form-field>` | `MatFormFieldModule` |
| Toggle button group | `<div>` of plain `<button>` elements | `<mat-button-toggle-group>` + `<mat-button-toggle>` | `MatButtonToggleModule` |
| Action button | `<button class="...">` | `<button mat-flat-button>` / `<button mat-stroked-button>` | `MatButtonModule` |
| Card container | `<div class="card">` | `<mat-card>` + `<mat-card-content>` | `MatCardModule` |
| Slider | Custom `<div>` track + `<input type="range">` | `<mat-slider>` + `<input matSliderThumb>` | `MatSliderModule` |
| Navbar / Toolbar | `<nav>`, `<header>`, plain `<div>` | `<mat-toolbar>` + `<mat-toolbar-row>` | `MatToolbarModule` |
| Divider | `<hr>` or `<div class="divider">` | `<mat-divider>` | `MatDividerModule` |
| Checkbox | `<input type="checkbox">` | `<mat-checkbox>` | `MatCheckboxModule` |
| Radio | `<input type="radio">` | `<mat-radio-group>` + `<mat-radio-button>` | `MatRadioModule` |
| Progress bar | Custom `<div>` fill bar | `<mat-progress-bar>` | `MatProgressBarModule` |

### HTML-to-Material Conversion Cheat-Sheet

**Select / Dropdown** (label above field = Case A — external label):
```html
<!--  BANNED -->
<label>Loan Type*</label>
<select [(ngModel)]="loanType">
  <option value="">Select</option>
</select>

<!--  REQUIRED -->
<div class="sso-field">
  <label class="sso-field__label">Loan Type<span class="sso-field__req">*</span></label>
  <mat-form-field appearance="outline" class="sso-form-field">
    <mat-select [(ngModel)]="loanType" placeholder="Select">
      <mat-option value="personal">Personal Loan</mat-option>
    </mat-select>
  </mat-form-field>
</div>
```

**Text input with prefix** (label above field = Case A):
```html
<!--  BANNED -->
<label>Loan Amount*</label>
<div class="input-wrap">
  <span class="prefix">₹</span>
  <input type="number" [(ngModel)]="loanAmount" />
</div>

<!--  REQUIRED -->
<div class="sso-field">
  <label class="sso-field__label">Loan Amount<span class="sso-field__req">*</span></label>
  <mat-form-field appearance="outline" class="sso-form-field">
    <span matTextPrefix>₹&nbsp;</span>
    <input matInput type="number" [(ngModel)]="loanAmount" />
    <mat-hint>Please enter a value between 10,00,000 and 5,00,00,000</mat-hint>
  </mat-form-field>
</div>
```


**Action button**:
```html
<!--  BANNED -->
<button class="sso-simulate-btn" (click)="simulateNow()">Simulate Now</button>

<!--  REQUIRED -->
<button mat-flat-button class="sso-simulate-btn" (click)="simulateNow()">Simulate Now</button>
```
---

