---
name: Vite static entry scripts
description: A Vite-specific detail for keeping plain HTML and JavaScript entry files bundled correctly.
---

When a plain JavaScript file is referenced directly from the root HTML entry, use module loading so Vite includes the script in the production bundle.

**Why:** Vite warns that classic root HTML scripts cannot be bundled and may omit them from the production output.

**How to apply:** Keep the application logic in the simple JavaScript file, but reference it with `type="module"` in the HTML entry.