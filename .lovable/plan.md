

## Fix `--background` token

One small correction needed: `--background` in `:root` is currently `240 20% 98%` (slight blue tint) but should be `0 0% 98%` (neutral) per the design system spec.

### Changes

**`src/index.css` line 7**: Change `--background: 240 20% 98%` → `--background: 0 0% 98%`

Everything else (primary, secondary, muted, accent, destructive, border, ring, card, foreground) already matches the spec exactly. No direct color values were found in the codebase — all components use semantic Tailwind tokens correctly.

