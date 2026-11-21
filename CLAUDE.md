# PrepPass

Next.js 16 (App Router) + React 19 + Tailwind v4 + TypeScript. Tests: `npx vitest run`. Type check: `npx tsc --noEmit -p .`.

## Design rules

All UI work follows the **apple-design** skill (`.claude/skills/apple-design/SKILL.md`). In this codebase that means:

- **Response:** feedback on press, instantly (`:active` scale 0.97, 100ms). No tap delay (`touch-action: manipulation`). Never wait for the end of a gesture to show feedback.
- **Motion:** springs are critically damped by default (Motion: `{ type: "spring", bounce: 0 }`). Add a little bounce only after a flick or throw. CSS transitions use `var(--ease-settle)`; never use overshooting curves like `cubic-bezier(0.34, 1.5, …)` for taps, menus or fades.
- **Gestures:** anything draggable tracks the finger 1:1, rubber-bands at edges, projects momentum on release, hands the release velocity to a spring, and can be grabbed mid-animation (see `components/use-sheet.ts`).
- **Spatial consistency:** things leave the way they came in, and menus grow from the control that opened them.
- **Materials:** chrome (header, tab bar, sheets) is translucent with `backdrop-filter`, uses a soft scroll-edge fade rather than hard dividers, and falls back to solid for `prefers-reduced-transparency` and `prefers-contrast: more`.
- **Type:** tracking is size-specific (big display type tight, small headings near 0, small mono labels slightly positive); leading tight on headings, comfortable on body.
- **Reduced motion:** swap slides, scales and springs for short cross-fades; keep colour/opacity changes that explain state.
- **Children (KS2, 11+):** no pop-ups and no sales prompts (`isYoung()` in `lib/tracks.ts`).
