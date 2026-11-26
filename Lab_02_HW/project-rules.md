# Project Rules

### 1. Prohibited Practices

- Do not use `var`, `innerHTML`, or inline event handlers (e.g., `onclick="..."`).

### 2. Required Practices

- Use `const` and `let`.
- Use `keydown` and `event.key` for custom keyboard interactions.
- Use DOM APIs such as `createElement()` and `textContent`.
- Use `addEventListener()` and event delegation where appropriate.
- Use modern build tools like Vite, ESBuild, and JSX Transform as applicable to the project.

### 3. Code Simplicity

- Keep the code as simple and concise as possible without sacrificing functionality.
- Avoid over-engineering or writing "clever code" that is difficult to read.
- Do not implement features "just in case" for future use if they are not currently needed.
- Keep functions focused on a single responsibility.
- Avoid excessively long functions or files that combine multiple unrelated responsibilities.
- Prefer straightforward solutions with minimal necessary code.
- Avoid unnecessary abstractions, excessive helper functions, redundant checks, and repetitive logic.
- Do not compress code into unreadable one-liners merely to reduce line count.
- Do not rewrite or refactor working code unless necessary to fix an issue or improve maintainability.

### 4. Code Reusability

- Avoid duplicating logic across multiple places.
- Extract repeated or independent logic into reusable functions or modules when appropriate.
- Separate concerns such as data processing, UI rendering, and event handling when doing so improves clarity.
- Avoid creating excessive files or modules for trivial functionality.
- Reuse existing components and utilities instead of unnecessarily reimplementing them.
- Write HTML code following WCAG 2.2 accessibility standards.

### 5. Product Quality & Functional Completeness

- **Code simplicity must not compromise product functionality or quality.**
- Build a complete, functional, and user-friendly product, not just a basic demonstration or prototype.
- Implement all essential features that users would reasonably expect from the requested product.
- Prioritize real user interactions over hardcoded or simulated functionality.
- Ensure users can perform the intended actions themselves, rather than relying on predefined data or automatic demonstrations.
- Create a polished, modern, responsive, and accessible user interface.
- Keep the implementation simple and maintainable without sacrificing essential features.
- Implement closely related functionality together to avoid unnecessary code rewrites in later tasks.
- Preserve existing working functionality when adding or modifying features.
- Do not add unnecessary features beyond the project's scope.

**Core Principle:** Keep the code concise, readable, and maintainable while delivering a complete, functional, and professional product.