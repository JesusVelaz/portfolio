# Neutral Palette & Grid Separators — Design Spec

**Author:** Jesus Velazquez
**Date:** 2026-08-01
**Status:** Approved for planning
**Supersedes (in part):** `2026-07-27-portfolio-website-design.md` §Theme

---

## 1. Overview

Two changes to the portfolio's visual system, taken together because they touch the
same files:

1. **Retone the palette** from its navy cast (`--void #0b0d12`, accent `#8da2ff`,
   `--mint #99f6e4`) to a pure neutral zinc ramp with **no accent color at all**, and
   add a **light theme with a user toggle**.
2. **Replace the horizontal rules between sections** with a blueprint grid motif —
   continuous vertical rails plus crosshair registration marks — drawing on
   [ui.shadcn.com](https://ui.shadcn.com/).

Emphasis stops coming from hue and starts coming from weight, size, and contrast.

### Problems being fixed

- Section boundaries are all the same undifferentiated `border-top: 1px solid`.
- Boundaries **double** where a section's last child already has a bottom border:
  `Experience .entry` (`Experience.module.css:36`) against `Contact .section`
  (`Contact.module.css:5`), and `About .storyGrid`'s `border-block`
  (`About.module.css:35`) against `Experience .section`.
- The navy cast reads as a theme applied to the content rather than a frame around it.

---

## 2. Decisions and rationale

| Decision | Choice | Why |
|---|---|---|
| Palette | Pure neutral zinc, no accent | Removes both `--accent` and `--mint`. One less thing to keep consistent, and contrast/weight carry emphasis instead. |
| Themes | Light **and** dark, with a toggle | Requested. Costs a semantic token layer, which the codebase needs regardless. |
| Token architecture | Semantic layer over a raw ramp | Theming becomes one block of remapping instead of edits across 14 modules. Matches shadcn's own vocabulary, so their docs translate directly. |
| Separators | Blueprint rails + crosshairs | Boundaries become structural rather than decorative. Kills the doubling by construction — there is no longer a horizontal line to collide with. |
| Starfield | Kept, made theme-aware | Preserves the hero's motion. Differentiates nodes by opacity now that there is no second color. |
| Brand icons | Stay in brand color | Logos are identifiers, not decoration; shadcn does the same. Only the contrast lift becomes theme-aware. |
| Fonts | Unchanged | Space Grotesk / Inter / JetBrains Mono is already restrained. Out of scope. |
| Scope | Whole site, one pass | Leaves nothing half-navy between routes. |

### Approaches considered and rejected

**`light-dark()` CSS function.** Halves the token lines, but keys off `color-scheme`,
which fights an explicit user override — you end up setting both `color-scheme` and a
data attribute anyway. Also discards the raw ramp as reusable vocabulary.

**Keep current token names, add a `.dark` override.** Smallest diff, but
`--void: #ffffff` in light mode is a lie, and every future reader has to hold two
meanings per name.

---

## 3. Token system

`src/styles/tokens.css` is restructured into two layers.

### 3.1 Raw ramp — never referenced by components

```
--zinc-50  #fafafa    --zinc-400 #a1a1aa    --zinc-800 #27272a
--zinc-100 #f4f4f5    --zinc-500 #71717a    --zinc-900 #18181b
--zinc-200 #e4e4e7    --zinc-600 #52525b    --zinc-950 #09090b
--zinc-300 #d4d4d8    --zinc-700 #3f3f46
```

### 3.2 Semantic layer — the only names components may use

| Token | `:root` (light) | `[data-theme='dark']` |
|---|---|---|
| `--background` | `--zinc-50` | `--zinc-950` |
| `--foreground` | `--zinc-950` | `--zinc-50` |
| `--card` | `#ffffff` | `--zinc-900` |
| `--muted` | `--zinc-100` | `--zinc-800` |
| `--muted-foreground` | `--zinc-500` | `--zinc-400` |
| `--border` | `--zinc-200` | `--zinc-800` |
| `--border-strong` | `--zinc-300` | `--zinc-700` |
| `--ring` | `--zinc-950` | `--zinc-300` |

The 31 hardcoded `rgba()` values across the CSS modules also get semantic homes:
`--overlay-hover`, `--overlay-active`, `--glass-tint`, `--glass-border`,
`--shadow-color`. Every one of them currently assumes a dark surface — white overlays
at low alpha do nothing on a white page — so each needs a genuine light-mode value,
not a mechanical find-and-replace.

### 3.3 Deletions and migrations

- `--accent`, `--accent-strong`, `--mint` are **deleted**. The ~25 references
  re-point to `--foreground` (eyebrows, link underlines, focus rings, the nav mark)
  or `--muted-foreground` (metadata, dates, indices).
- `--void`, `--surface`, `--surface-raised`, `--text` are renamed to their semantic
  equivalents above (`--background`, `--card`, `--card` raised variant, `--foreground`).
- The existing aliases `--glass-bg`, `--glass-border`, `--glass-border-bright`, and
  `--glass-highlight` currently point at `--surface` / `--border` / `--border-strong` /
  `transparent`. They are **kept as names** — `Nav`, `Contact`, `ProjectImage`, and
  `ProjectPage` reference them — but repointed at the new semantic tokens, and
  `--glass-border-bright` collapses into `--border-strong`.
- `--radius-card` tightens `18px` → `10px`. `--radius-pill` is unchanged.

---

## 4. Separator system

### 4.1 `GridFrame` — one decorative layer

A new `src/components/GridFrame.jsx`, rendered **once** in `App.jsx`, not per section.

- `position: fixed; inset: 0; pointer-events: none;` with `aria-hidden="true"`,
  layered behind content.
- Inside it, a single element styled with the **same box as `.container`**
  (`max-width: var(--page-max)`, `margin-inline: auto`, `padding-inline: var(--gutter)`)
  carrying `border-left` and `border-right` at `1px solid var(--border)`.

Because the layer is fixed and full-height, the rails read as continuous down the
entire scroll — no per-section seams, and no repaint on scroll.

### 4.2 Crosshairs mark section starts

Each section renders `::before` / `::after` pseudo-elements: a 9px `+` drawn from two
1px linear-gradients in `--border-strong`, pinned to the section's `top: 0` and sitting
exactly **on** the left and right rails.

`GridFrame` and the crosshairs **must** derive their x-position from one shared
expression — a `--rail-x` token in `tokens.css` computed from the same `.container`
geometry. Duplicating the centering math in two places is the failure mode here; if
they drift, the marks float beside the rails instead of on them.

The crosshairs are the only part that scrolls. The rails do not. The section start
therefore appears to click into a fixed frame like a registration mark.

### 4.3 The eyebrow carries the boundary

The section eyebrow (currently e.g. `WORK` in `--mint`) becomes `01 — WORK` in
`--muted-foreground`, set below the left crosshair. With the rules gone, this and the
whitespace are the "new section" signal.

Numbering: `01` Work, `02` About, `03` Experience, `04` Contact. Hero has no eyebrow
and no crosshair — it is the page's opening, not a section within it.

### 4.4 Rules removed

Delete `border-top: 1px solid var(--border)` from `.section` in **all four** of
`Work.module.css:4`, `About.module.css:4`, `Experience.module.css:4`,
`Contact.module.css:5`.

### 4.5 Inner dividers kept, disciplined

Hairlines between *peer records* stay — they read as a table, which is on-idiom.

- `Experience .entry` keeps `border-bottom`, and gains
  `.entry:last-child { border-bottom: 0 }`.
- `About .storyGrid` drops `border-block` for `border-top` only.

Combined with §4.4, doubling is now impossible rather than merely absent.

### 4.6 Responsive

Below **900px** `GridFrame` is hidden — at gutter width the rails crowd the text.
Mobile falls back to whitespace plus the numbered eyebrow, with **no horizontal line
reintroduced**, so both breakpoints tell the same story. Crosshairs hide with the
frame.

Note: the existing `SectionRail` (fixed scroll-progress ticks, right edge, hidden
below 1220px) is **unrelated** and unchanged. The new component is named `GridFrame`
specifically to avoid a second "rail" concept.

---

## 5. Theme toggle

### 5.1 Pre-paint script

An inline, blocking `<script>` in `index.html`'s `<head>` sets `data-theme` on
`documentElement` before first paint:

```
localStorage.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
```

Wrapped in try/catch — `localStorage` throws in some privacy modes. Without this,
every dark-mode visitor sees a white flash before React mounts.

### 5.2 `useTheme` hook

`src/hooks/useTheme.js`. Source of truth is `documentElement.dataset.theme`.

- `setTheme(next)` writes the attribute, persists to `localStorage`, and sets
  `color-scheme` on the root so scrollbars and form controls follow.
- Subscribes to `matchMedia` changes, but **applies them only when no stored choice
  exists**. The system preference stays authoritative until the user overrides it, and
  stops mattering afterward.

### 5.3 `ThemeToggle` component

Icon button at the right end of the Nav bar, after `.links`. Sun/moon inline SVG in
`currentColor`.

Accessibility: a real `<button>` whose `aria-label` states the **action** and changes
with state ("Switch to light theme" / "Switch to dark theme"). Not `aria-pressed` — on
an icon-only control a changing action label is less ambiguous to a screen reader than
a pressed state.

It sits **outside** `listRef`, so the traveling-pill measurement in `Nav.jsx:40-57` is
untouched.

### 5.4 `Starfield` recolor

`Starfield.jsx` currently hardcodes `#8da2ff`, `#99f6e4`, `#f6f7fb`, and
`rgba(111, 139, 255, …)`.

- Read `--foreground` and `--border` from computed styles at draw setup.
- A `MutationObserver` on the root element's attributes triggers recolor + redraw on
  theme change.
- The two node sizes differentiate by **opacity**, not hue — there is no second color
  left.
- The periwinkle grid in `Starfield.module.css:7-8` becomes `--border`.

### 5.5 `legibleBrandColor` generalizes

`src/lib/legibleBrandColor.js` hardcodes `SURFACE_LUMINANCE = 0.0086` and only ever
lifts **toward white**. On a white card that leaves React's `#61DAFB` unreadable.

New signature takes the surface luminance and mixes toward white against a dark
surface, toward black against a light one. A default parameter preserves today's dark
behavior, making the change additive — `skills.test.jsx:62-63` keeps passing unmodified.

`SkillGrid` reads the current theme via `useTheme` to pass the right luminance.

---

## 6. Testing

### New

- **`theme.test.jsx`** — toggle exposes an accessible name; clicking flips
  `data-theme` on the root; the choice persists to `localStorage`; with nothing
  stored, the system preference wins.
- **`gridFrame.test.jsx`** — renders `aria-hidden` and contributes no accessible
  content.

### Updated

- **`skills.test.jsx`** — add a light-surface case asserting `#61DAFB` is
  **darkened**, complementing the existing dark-surface lift cases.

### Manual verification before completion

- Both themes at 1440 / 900 / 375px.
- Crosshair alignment against the rails at every breakpoint (the drift failure mode
  in §4.2).
- No doubled lines at any section boundary, in either theme.
- Nav fits at 375px with the toggle added.
- `--muted-foreground` on `--background` clears 4.5:1 in **both** themes.

---

## 7. Risks

**Uncommitted work in the blast radius.** Six files are currently modified, including
`ProjectPage.jsx` and `ProjectPage.module.css`, which this design also touches. Commit
or stash before starting.

**Large mechanical diff.** ~25 accent/mint references, 4 renamed base tokens, and 31
hardcoded `rgba()` values all move. Individually trivial, collectively easy to leave
half-finished. The `--accent`/`--mint`/`--void`/`--surface`/`--text` names should be
grep-clean at the end — a zero-hit grep is the completion check.

**Light-mode overlays are not a find-and-replace.** Every `rgba(255,255,255,…)` in
`Nav.module.css` and `StackChips.module.css` assumes a dark surface. Each needs a real
light value chosen by eye, not a token substitution.
