# TASK DECOMPOSITION

## Exercise 1: Semantic DOM Architecture & A11y Contract

---

# WBS Task T-01

**Task ID:** T-01  
**Task Name:** Semantic DOM Architecture & A11y Contract  
**Main File:** `index.html`

## Objective

Build an HTML5 page using semantic HTML structure and accessibility best practices. The page must demonstrate semantic DOM architecture, accessible navigation, proper content formatting, accessible media, semantic tables, modern form controls with native validation, and browser-compatible HTML5 practices.

The HTML structure must not use `<div>` elements for the required semantic DOM architecture.

---

# 1. Semantic DOM Architecture

## T-01.1 — Create Semantic Landmark Structure

Create the page structure using semantic HTML5 elements.

### Requirements

- Do not use `<div>` elements.
- Use semantic landmark elements.
- Include a `<header>` for the page header.
- Use `role="banner"` for the header.
- Include a `<nav>` for primary navigation.
- Use `role="navigation"` for navigation.
- Add `aria-label="Primary"` to the primary navigation.
- Include a `<main>` element for the main page content.
- Use `role="main"` for the main content.
- Give the main element the ID `main-content`.
- Use `<section>` elements to organize page content.
- Navigation links must point to corresponding section IDs.

### Expected Structure

```text
body
├── skip link
├── header
│   └── h1
├── nav
│   └── ul
│       ├── li
│       │   └── a
│       └── li
│           └── a
└── main
    ├── section
    └── section
```

Example:

```html
<header role="banner">
    <h1>Jane Doe, Lead Engineer</h1>
</header>

<nav role="navigation" aria-label="Primary">
    <ul>
        <li><a href="#about">About</a></li>
        <li><a href="#projects">Projects</a></li>
    </ul>
</nav>

<main id="main-content" role="main">
    <section id="about">
        ...
    </section>

    <section id="projects">
        ...
    </section>
</main>
```

---

# 2. Accessible Skip Link

## T-01.2 — Implement Skip to Main Content

Create an accessible skip link before the main navigation and page landmarks.

### Requirements

The skip link must point to:

```text
#main-content
```

Use:

```html
<a href="#main-content" class="skip-link">
    Skip to main content
</a>
```

The page must contain the corresponding main element:

```html
<main id="main-content" role="main">
```

### Completion Conditions

- The skip link exists.
- The link uses `href="#main-content"`.
- The `<main>` element contains `id="main-content"`.
- The link text clearly indicates its purpose.

---

# 3. Content Formatting

## T-01.3 — Use Semantic Text Elements

Use appropriate semantic HTML elements for textual content.

### Required Elements

Use:

```html
<p>
```

for paragraphs.

Use:

```html
<blockquote>
```

for block quotations.

Use:

```html
<address>
```

for contact or address information.

Use:

```html
<code>
```

for code content.

Use:

```html
<pre>
```

for preformatted content.

---

# 4. Semantic Text Importance

## T-01.4 — Use Strong and Em Correctly

Use:

```html
<strong>
```

to represent important content.

Use:

```html
<em>
```

to represent stress emphasis.

Do not use these elements only for visual styling.

---

# 5. Deprecated Text Elements

## T-01.5 — Avoid Obsolete Strike Element

Do not use:

```html
<strike>
```

Use:

```html
<del>
```

when content has been removed.

Use:

```html
<s>
```

when content is outdated or no longer accurate.

---

# 6. Subscript and Superscript

## T-01.6 — Demonstrate Subscript and Superscript

Use `<sub>` for subscript content.

Example:

```html
H<sub>2</sub>O
```

Use `<sup>` for superscript content.

Example:

```html
2<sup>10</sup>
```

which represents:

```text
2¹⁰ = 1024
```

---

# 7. HTML Entities

## T-01.7 — Use HTML Entities

Demonstrate the following HTML entities:

```html
&copy;
```

for:

```text
©
```

Use:

```html
&mdash;
```

for an em dash.

Use:

```html
&lt;
```

for:

```text
<
```

Use:

```html
&gt;
```

for:

```text
>
```

---

# 8. Heading Hierarchy

## T-01.8 — Create Correct Heading Structure

Follow an accessible heading hierarchy.

### Requirements

- Use exactly one primary `<h1>` in the document.
- Do not skip heading levels.
- Maintain sequential heading order.

Correct:

```text
<h1>
  ↓
<h2>
  ↓
<h3>
```

Do not choose heading levels based only on desired font size.

Use CSS for font sizing instead of changing semantic heading levels.

---

# 9. Accessible Form Labels

## T-01.9 — Pair Labels with Inputs

Every relevant form input must have an explicit visible `<label>`.

The `for` attribute of the label must match the `id` of its input.

Example:

```html
<label for="applicant-name">Full Name:</label>

<input
    type="text"
    id="applicant-name"
    name="name">
```

The following values must match:

```text
for="applicant-name"
id="applicant-name"
```

---

# 10. Placeholder Accessibility

## T-01.10 — Do Not Replace Labels with Placeholders

Do not use placeholder text as a replacement for visible labels.

Reasons:

- Placeholder text disappears when the user starts typing.
- Placeholder text may fail color contrast requirements.

Visible `<label>` elements must be used for form controls.

---

# 11. Supplementary Form Hints

## T-01.11 — Use aria-describedby

Use:

```html
aria-describedby
```

when supplementary hint text or instructions need to be associated with an input.

---

# 12. Core Web Vitals

## T-01.12 — Follow Core Web Vitals Requirements

Consider the following Core Web Vitals targets.

### LCP — Largest Contentful Paint

LCP represents primary visual loading performance.

Target:

```text
LCP <= 2.5 seconds
```

### INP — Interaction to Next Paint

INP represents user-interface responsiveness.

Target:

```text
INP <= 200 milliseconds
```

### CLS — Cumulative Layout Shift

CLS represents visual page stability.

Target:

```text
CLS <= 0.1
```

---

# 13. CLS-Proof Images

## T-01.13 — Prevent Layout Shift from Images

Images must have explicit dimensions.

### Requirements

Each important `<img>` must provide:

- `src`
- descriptive `alt`
- `width`
- `height`

Use the image-loading attributes demonstrated in the exercise where appropriate:

- `loading="lazy"`
- `decoding="async"`

Example:

```html
<img
    src="assets/avatar.webp"
    alt="Portrait of a Senior Developer"
    width="400"
    height="400"
    loading="lazy"
    decoding="async">
```

Explicit `width` and `height` reserve space before the image loads and help prevent Cumulative Layout Shift.

Always provide descriptive `alt` attributes for accessibility.

---

# 14. Responsive Images

## T-01.14 — Use Picture with Next-Generation Formats

Use the `<picture>` element to provide modern image formats.

Provide:

1. AVIF
2. WebP
3. JPG fallback

Example:

```html
<picture>
    <source
        type="image/avif"
        srcset="hero.avif">

    <source
        type="image/webp"
        srcset="hero.webp">

    <img
        src="hero.jpg"
        alt="Tech Conference"
        width="1200"
        height="600">
</picture>
```

The fallback `<img>` must contain:

- descriptive `alt`
- `width`
- `height`

---

# 15. Semantic Tables

## T-01.15 — Create Semantic Data Tables

Use `<table>` for two-dimensional relational data.

### Required Structure

```text
table
├── caption
├── thead
│   └── tr
│       └── th
└── tbody
    └── tr
        └── td
```

Use:

```html
<table>
```

as the table container.

Use:

```html
<caption>
```

to provide an accessible summary describing the table content.

Use:

```html
<thead>
```

to group column headers.

Use:

```html
<tbody>
```

to group data records.

Use:

```html
<tr>
```

for table rows.

Use:

```html
<th>
```

for header cells.

Use:

```html
<td>
```

for data cells.

Example:

```html
<table>
    <caption>Student Academic Progression</caption>

    <thead>
        <tr>
            <th scope="col">Course Code</th>
            <th scope="col">Subject Title</th>
            <th scope="col">Grade</th>
        </tr>
    </thead>

    <tbody>
        <tr>
            <td>SE104</td>
            <td>Web Application Development</td>
            <td>A+</td>
        </tr>
    </tbody>
</table>
```

---

# 16. Table Header Scope

## T-01.16 — Define Header Relationships

For column headers use:

```html
<th scope="col">
```

For row headers use:

```html
<th scope="row">
```

Use the appropriate scope depending on the relationship represented by the header.

---

# 17. Table Cell Merging

## T-01.17 — Use colspan and rowspan

For horizontal cell merging use:

```html
colspan
```

For vertical cell merging use:

```html
rowspan
```

---

# 18. Deprecated Table Attributes

## T-01.18 — Avoid Presentational Table Attributes

Do not use deprecated presentational HTML attributes such as:

```html
border="1"
```

Do not use:

```html
cellpadding
```

Do not use:

```html
align
```

---

# 19. Native HTML Forms

## T-01.19 — Use Supported Form Methods

HTML forms natively support:

```text
GET
POST
```

Example:

```html
<form action="/api/register" method="POST">
```

The following methods are not native HTML form methods:

```text
PUT
PATCH
DELETE
```

Use the JavaScript Fetch API when PUT, PATCH, or DELETE requests are required.

---

# 20. Modern Input Types

## T-01.20 — Use Modern Form Controls

Use appropriate modern HTML input types where relevant:

```text
email
tel
date
number
url
search
```

---

# 21. Native Form Validation

## T-01.21 — Use Native Constraint Validation

Use HTML native validation attributes where appropriate.

The exercise includes:

```text
required
pattern
min
max
minlength
```

Example:

```html
<label for="applicant-name">
    Full Name:
</label>

<input
    type="text"
    id="applicant-name"
    name="name"
    required
    minlength="3">
```

Email example:

```html
<label for="applicant-email">
    Institutional Email:
</label>

<input
    type="email"
    id="applicant-email"
    name="email"
    required>
```

---

# 22. Submit Button

## T-01.22 — Use Semantic Submit Button

Use:

```html
<button type="submit">
    Submit Application
</button>
```

for form submission.

---

# 23. Native Modal Dialog

## T-01.23 — Use Native Dialog

Use the native HTML:

```html
<dialog>
```

element for modal dialogs.

Open the dialog using:

```javascript
dialog.showModal()
```

The native `<dialog>` element should be preferred over heavy third-party modal plugins as stated in the exercise.

---

# 24. Official Documentation Sources

## T-01.24 — Use Official Web Authorities

Use the following sources when checking HTML, CSS, Web APIs, performance, and browser compatibility.

### MDN Web Docs

Use:

```text
developer.mozilla.org
```

as the primary reference for Web APIs.

### web.dev

Use web.dev for:

- Modern Core Web Vitals
- Performance budgets

### W3C / WHATWG

Use W3C / WHATWG for official:

- HTML standards
- CSS specification standards

---

# 25. Browser Compatibility

## T-01.25 — Check Target Browser Support

Before using a web feature, consider whether target-user browsers can run the feature without polyfills.

Do not choose a feature only because it looks visually interesting.

Do not rely on outdated SEO blog posts containing obsolete practices.

---

# 26. MDN Browser Baseline

## T-01.26 — Understand Browser Baseline Status

### Widely Available

A feature is described in the exercise as widely available when it has been supported across all major browser engines for more than 30 months.

Examples:

```text
<dialog>
Flexbox
Grid
```

These are described as safe for production in the exercise.

### Newly Available

A feature may be newly available when it has only recently gained support across browser engines.

Examples:

```text
Popover API
:has()
```

Before depending on newly available features, assess the user demographics and target browsers.

---

# 27. Verification Gate

## T-01.27 — Verify Accessibility Landmark Tree

After implementing the semantic HTML structure:

1. Open `index.html` in Chrome.
2. Open Chrome DevTools.
3. Open the Accessibility tools.
4. Inspect the Landmark Tree.
5. Verify the semantic page structure.
6. Confirm that the expected landmarks are recognized.
7. Confirm that the skip link points to the main content.
8. Confirm that the semantic landmark structure does not rely on `<div>` elements.

---

# 28. Atomic Commit

## T-01.28 — Commit the Semantic HTML Work

After completing and verifying the semantic landmark tree, create the required atomic commit.

Use:

```bash
git add index.html
git commit -m 'feat(html): semantic landmark tree'
```

Required commit message:

```text
feat(html): semantic landmark tree
```

---

# 29. One-Shot Prompt / CSS Rule

## T-01.29 — Keep CSS Separate from the HTML Commit

Do not combine CSS work with the required HTML atomic commit.

The exercise states:

> One-shot prompt penalty: Commits combining CSS with HTML get 0 pts.

Therefore:

- Complete the required HTML work separately.
- Do not mix CSS changes into the semantic HTML atomic commit.

---

# 30. Definition of Done

WBS Task T-01 is complete when all applicable requirements have been implemented and verified.

## Semantic DOM

- [ ] `TASK_DECOMPOSITION.md` declares WBS Task T-01.
- [ ] `index.html` has been created.
- [ ] Semantic HTML landmarks are used.
- [ ] No `<div>` elements are used for the required semantic DOM architecture.
- [ ] `<header>` is present.
- [ ] `<nav>` is present.
- [ ] `<main>` is present.
- [ ] `<section>` elements are present.
- [ ] Navigation links point to corresponding section IDs.

## Accessibility

- [ ] A skip link is present.
- [ ] The skip link uses `href="#main-content"`.
- [ ] `<main>` contains `id="main-content"`.
- [ ] Exactly one primary `<h1>` is present.
- [ ] Heading levels are sequential.
- [ ] Form controls have explicit visible labels.
- [ ] Label `for` values match input `id` values.
- [ ] Placeholder text is not used as a replacement for visible labels.
- [ ] Supplementary hint text uses `aria-describedby` where applicable.

## Content Formatting

- [ ] `<p>` is used appropriately.
- [ ] `<blockquote>` is used appropriately.
- [ ] `<address>` is used appropriately.
- [ ] `<code>` is used appropriately.
- [ ] `<pre>` is used appropriately.
- [ ] `<strong>` represents importance.
- [ ] `<em>` represents stress emphasis.
- [ ] `<strike>` is not used.
- [ ] `<del>` is used for removed content where applicable.
- [ ] `<s>` is used for outdated content where applicable.
- [ ] `<sub>` is demonstrated.
- [ ] `<sup>` is demonstrated.
- [ ] Required HTML entity concepts are demonstrated.

## Media

- [ ] Images contain descriptive `alt` attributes.
- [ ] Images contain explicit `width`.
- [ ] Images contain explicit `height`.
- [ ] Image dimensions are used to reduce avoidable CLS.
- [ ] `loading="lazy"` is used where appropriate.
- [ ] `decoding="async"` is used where appropriate.
- [ ] `<picture>` is used for the responsive image example.
- [ ] AVIF source is provided.
- [ ] WebP source is provided.
- [ ] JPG fallback is provided.

## Core Web Vitals

- [ ] LCP target is understood as `<= 2.5s`.
- [ ] INP target is understood as `<= 200ms`.
- [ ] CLS target is understood as `<= 0.1`.

## Tables

- [ ] Semantic `<table>` is used.
- [ ] `<caption>` is included.
- [ ] `<thead>` is used.
- [ ] `<tbody>` is used.
- [ ] `<tr>` is used correctly.
- [ ] `<th>` is used for headers.
- [ ] `<td>` is used for data.
- [ ] `scope="col"` or `scope="row"` is used where appropriate.
- [ ] `colspan` is used when horizontal cell merging is required.
- [ ] `rowspan` is used when vertical cell merging is required.
- [ ] Deprecated `border` attribute is not used.
- [ ] Deprecated `cellpadding` attribute is not used.
- [ ] Deprecated `align` attribute is not used.

## Forms

- [ ] Native GET/POST methods are used correctly.
- [ ] PUT/PATCH/DELETE are treated as JavaScript Fetch API operations.
- [ ] Appropriate modern input types are used.
- [ ] `required` is used where applicable.
- [ ] `pattern` is used where applicable.
- [ ] `min` is used where applicable.
- [ ] `max` is used where applicable.
- [ ] `minlength` is used where applicable.
- [ ] Submit control uses `<button type="submit">`.
- [ ] Native `<dialog>` is used if a modal is implemented.
- [ ] `showModal()` is used to open a native modal when applicable.

## Browser Standards

- [ ] MDN is used as a primary Web API reference.
- [ ] web.dev is recognized for Core Web Vitals and performance budgets.
- [ ] W3C / WHATWG are recognized as official specification sources.
- [ ] Browser support is considered before using features.
- [ ] Widely Available and Newly Available baseline concepts are understood.
- [ ] Target users are considered before relying on newly available features.

## Verification and Submission

- [ ] Chrome DevTools Accessibility has been opened.
- [ ] Landmark Tree has been verified.
- [ ] HTML work has been committed separately.
- [ ] Required commit message is used:

```text
feat(html): semantic landmark tree
```

- [ ] CSS is not combined with the HTML atomic commit.

---

# 31. Required Work Sequence

Follow the mandatory Exercise 1 workflow:

```text
STEP 1
Declare WBS Task T-01
in TASK_DECOMPOSITION.md

        ↓

STEP 2
Define landmark hierarchy contract
0 <div> elements

        ↓

STEP 3
Implement accessible skip link
<a href="#main-content">
    Skip to main content
</a>

        ↓

STEP 4
Atomic Commit
git commit -m 'feat(html): semantic landmark tree'

        ↓

VERIFICATION GATE
Chrome DevTools
→ Accessibility
→ Verify Landmark Tree
```

## Final Submission Rule

Keep the semantic HTML implementation separate from CSS work.

Do not combine CSS and HTML changes in the required semantic HTML atomic commit.

---

# Exercise 4 — Resilient Component Architecture

## State Machine Definition

The resilient component follows a four-state contract:

1. Loading State
   - The component is waiting for data.
   - A pure CSS shimmer skeleton is displayed.

2. Live Data State
   - Data has loaded successfully.
   - Metadata badges are arranged with Flexbox.
   - The data list is arranged with CSS Grid.

3. Empty State
   - Data loading succeeds, but no data is available.
   - An empty-state interface is displayed.

4. Error State
   - Data loading fails.
   - An accessible retry trigger is provided.

## State Flow

Loading
├── Success with data → Live Data
├── Success without data → Empty
└── Failure → Error

Error
└── Retry → Loading

## SUB-TASK T-03A — Loading Skeleton

### Objective

Implement the Loading State of the resilient component using a pure CSS shimmer skeleton.

### Requirements

- Implement only the Loading State in this sub-task.
- Use a pure CSS shimmer gradient.
- Use `.skeleton-item` for skeleton placeholders.
- Use the `shimmer` animation.
- The shimmer animation runs continuously while the component is loading.
- Do not implement the Live Data, Empty, or Error states in this sub-task.

### Decomposition Rule

T-03A is implemented and committed independently before proceeding to the remaining states.

### Completion Criteria

T-03A is complete when:

- The loading skeleton is visible.
- Skeleton placeholders use the CSS shimmer gradient.
- The shimmer animation works continuously.
- The implementation does not include the Live Data, Empty, or Error states.
- The Loading State is committed independently.

### Required Commit

git commit -m "feat(css): skeleton"

## SUB-TASK T-03B — Live Data State

### Objective

Implement the Live Data State of the resilient component.

### Requirements

- Implement only the Live Data State in this sub-task.
- Display successfully loaded data.
- Use Flexbox for metadata badges.
- Use CSS Grid for the live data list.
- Keep the Loading State from T-03A as a separate state.
- Do not implement the Empty State in this sub-task.
- Do not implement the Error State in this sub-task.
- Do not implement the retry trigger in this sub-task.

### State Transition

Loading
└── Success with data → Live Data

### Live Data Structure

Live Data State
├── Metadata → Flexbox badges
└── Data List → CSS Grid

### Decomposition Rule

T-03B is implemented separately after T-03A and before T-03C.

The Live Data State must not be combined with the Empty or Error states in this implementation step.

### Completion Criteria

T-03B is complete when:

- The Live Data State is present.
- Successfully loaded data is visible.
- Metadata badges are arranged using Flexbox.
- The live data list is arranged using CSS Grid.
- The Loading State remains independently defined.
- Empty and Error states have not been implemented.
- T-03B is committed independently.