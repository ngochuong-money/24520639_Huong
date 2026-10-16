# Project Rules
### 1. Prohibited Practices
- Do not use `var`, `innerHTML`, or inline event handlers (e.g., `onclick="..."`).
### 2. Required Practices
- Use `const` and `let`.
- Use `keydown` and `event.key`.
- Use DOM APIs such as `createElement()` and `textContent`.
- Use `addEventListener()` and event delegation.
- Use modern build tools like Vite, ESBuild, and JSX Transform.
### 3. Code Simplicity
- Keep the code as simple as possible.
- Avoid over-engineering or writing "clever code" that is difficult to read.
- Do not implement features "just in case" for future use if they are not currently needed.
### 4. Code Reusability
- Avoid duplicating logic across multiple places.
- Extract repeated logic into functions, modules, or use inheritance.
- Write HTML code following WCAG 2.2 accessibility standards.