## 2025-05-15 - Toast Accessibility Gap
**Learning:** Custom toast notifications often lack native role/aria-live attributes, making them invisible to screen readers. Also, visual-only reveal (opacity-0 until hover) without focus alternatives creates a trap for keyboard users.
**Action:** Always ensure toasts have `role="status/alert"`, `aria-live`, and interactive elements inside them are keyboard focusable and visible on focus.
