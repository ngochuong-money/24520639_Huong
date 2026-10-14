# HW1: Production Portfolio

## M1 — WCAG 2.2 AA Audit

### Audit
- Checked semantic landmarks: `header`, `nav`, `main`, and `footer`.
- Checked color contrast for both light mode and dark mode.
- Primary text and background colors meet WCAG 2.2 AA contrast requirements.

### Changes
- Added a site-wide `<footer>` landmark to improve semantic page structure.
- Kept the existing accessible skip link and primary navigation.

### Source Code
- [HTML](../Lab_01/Ex_1/index.html)
- [CSS](../Lab_01/Ex_2/style.css)
### Result
✅ WCAG 2.2 AA contrast and landmark audit completed.

## M2 — Focus Trap Audit

### Audit
- Tested keyboard navigation using `Tab`, `Shift + Tab`, `Enter`, and `Esc`.
- Verified that interactive elements have visible focus indicators.
- Verified that keyboard focus does not move to page controls behind the modal dialog.

### Changes
- Added dialog focus management.
- Moved focus to the `Close` button when the dialog opens.
- Returned focus to the `Open Dialog` button when the dialog closes.
- Improved the visible focus indicator for the `Retry` button.

### Source Code
- [HTML — Dialog Structure](../Lab_01/Ex_1/index.html)
- [JavaScript — Dialog Focus Management](../Lab_01/Ex_2/script.js)
- [CSS — Focus Indicator](../Lab_01/Ex_2/style.css)

### Result
✅ Keyboard navigation and focus trap audit completed.
## M3 — Strict CSP & Zero Inline Handlers

### Audit
- Verified that inline JavaScript is blocked by the Content Security Policy.
- Verified that JavaScript is loaded from external files.
- Checked that no inline event handlers such as `onclick`, `onsubmit`, or `onkeydown` are used.

### Changes
- Added a strict Content Security Policy.
- Removed inline script usage.
- Kept event handling inside `script.js` using `addEventListener()`.

### Source Code
- [HTML — Content Security Policy](../Lab_01/Ex_1/index.html)
- [JavaScript — External Event Handlers](../Lab_01/Ex_2/script.js)

### Result
✅ Strict CSP and zero inline handlers completed.