# Neutral Palette & Grid Separators Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retone the portfolio from navy to a pure neutral zinc ramp with a light/dark toggle, and replace the horizontal rules between sections with a blueprint grid motif.

**Architecture:** A two-layer token system — a raw zinc ramp that components never touch, and a semantic layer (`--background`, `--foreground`, `--border`, …) remapped under `[data-theme='dark']`. Legacy token names are kept as aliases through Tasks 1–7 so the site renders correctly at every commit, then deleted in Task 8. Section separators become a single fixed `GridFrame` layer (two continuous vertical rails) plus per-section crosshair pseudo-elements.

**Tech Stack:** Vite 5, React 18, React Router 6, CSS Modules, Vitest 2 + Testing Library, simple-icons.

**Spec:** `docs/superpowers/specs/2026-08-01-neutral-palette-grid-separators-design.md`

## Global Constraints

- **No accent color.** `--accent`, `--accent-strong`, and `--mint` are deleted. Nothing may reintroduce a hue outside brand logos.
- **Components reference semantic tokens only** — never `--zinc-*` directly.
- **Every commit leaves the suite green.** Run `npm test` before each commit.
- **Contrast floor:** `--muted-foreground` on `--background` must clear 4.5:1 in both themes.
- **Existing `SectionRail`** (fixed scroll-progress ticks, right edge) is unrelated and must not be modified. The new layer is `GridFrame`.
- **Breakpoints already in use:** 760px (section grids), 860px (Starfield), 900px (new — GridFrame), 1220px (SectionRail). Do not invent others.
- Test runner: `npm test` (`vitest run`). Single file: `npx vitest run src/test/<file>`.

---

### Task 1: Semantic token system and pre-paint theme script

**Files:**
- Modify: `src/styles/tokens.css` (full rewrite)
- Modify: `index.html:27-28` (inline script before `</head>`)
- Modify: `src/styles/global.css:30`, `:49`, `:64-66`, `:68-72`

**Interfaces:**
- Consumes: nothing.
- Produces: semantic tokens `--background`, `--foreground`, `--card`, `--card-raised`, `--muted`, `--muted-foreground`, `--border`, `--border-strong`, `--ring`, `--overlay-hover`, `--overlay-active`, `--glass-tint`, `--glass-tint-strong`, `--shadow-color`. Legacy aliases `--void`, `--surface`, `--surface-raised`, `--text`, `--accent`, `--accent-strong`, `--mint`, `--glass-bg`, `--glass-border`, `--glass-border-bright` remain valid until Task 8. Root carries `data-theme="light" | "dark"`.

- [ ] **Step 1: Rewrite `src/styles/tokens.css`**

```css
:root {
  /* Raw ramp — never reference these from a component. */
  --zinc-50: #fafafa;
  --zinc-100: #f4f4f5;
  --zinc-200: #e4e4e7;
  --zinc-300: #d4d4d8;
  --zinc-400: #a1a1aa;
  --zinc-500: #71717a;
  --zinc-600: #52525b;
  --zinc-700: #3f3f46;
  --zinc-800: #27272a;
  --zinc-900: #18181b;
  --zinc-950: #09090b;

  /* Semantic layer — light. */
  --background: var(--zinc-50);
  --foreground: var(--zinc-950);
  --card: #ffffff;
  --card-raised: var(--zinc-100);
  --muted: var(--zinc-100);
  --muted-foreground: var(--zinc-500);
  --border: var(--zinc-200);
  --border-strong: var(--zinc-300);
  --ring: var(--zinc-950);

  /* Overlays. Dark surfaces take light overlays and vice versa, so these
     cannot be one shared value. */
  --overlay-hover: rgba(9, 9, 11, 0.05);
  --overlay-active: rgba(9, 9, 11, 0.09);
  --glass-tint: rgba(255, 255, 255, 0.72);
  --glass-tint-strong: rgba(255, 255, 255, 0.85);
  --shadow-color: rgba(9, 9, 11, 0.1);

  --font-display: 'Space Grotesk', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  --ease-out: cubic-bezier(.16, 1, .3, 1);
  --dur: 600ms;

  --page-max: 1180px;
  --gutter: clamp(1.25rem, 5vw, 3rem);
  --section-gap: clamp(6rem, 12vh, 9rem);

  --radius-card: 10px;
  --radius-pill: 999px;
}

:root[data-theme='dark'] {
  --background: var(--zinc-950);
  --foreground: var(--zinc-50);
  --card: var(--zinc-900);
  --card-raised: var(--zinc-800);
  --muted: var(--zinc-800);
  --muted-foreground: var(--zinc-400);
  --border: var(--zinc-800);
  --border-strong: var(--zinc-700);
  --ring: var(--zinc-300);

  --overlay-hover: rgba(250, 250, 250, 0.06);
  --overlay-active: rgba(250, 250, 250, 0.1);
  --glass-tint: rgba(24, 24, 27, 0.42);
  --glass-tint-strong: rgba(24, 24, 27, 0.55);
  --shadow-color: rgba(0, 0, 0, 0.34);
}

/* Legacy names. Every module still referencing these is migrated in Tasks
   4–8; this block is deleted in Task 8. */
:root {
  --void: var(--background);
  --surface: var(--card);
  --surface-raised: var(--card-raised);
  --text: var(--foreground);
  --accent: var(--foreground);
  --accent-strong: var(--foreground);
  --mint: var(--muted-foreground);
  --glass-bg: var(--card);
  --glass-border: var(--border);
  --glass-border-bright: var(--border-strong);
  --glass-highlight: transparent;
}
```

- [ ] **Step 2: Add the pre-paint script to `index.html`**

Insert immediately before `</head>` (after the font `<link>` at line 26). It must be inline and blocking — an external or deferred script paints white first.

```html
    <script>
      // Runs before first paint so dark-theme visitors never see a white flash.
      ;(function () {
        try {
          var stored = localStorage.getItem('theme')
          var theme =
            stored ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          document.documentElement.dataset.theme = theme
          document.documentElement.style.colorScheme = theme
        } catch (e) {
          // Private-browsing modes throw on localStorage. Dark is the design default.
          document.documentElement.dataset.theme = 'dark'
          document.documentElement.style.colorScheme = 'dark'
        }
      })()
    </script>
```

- [ ] **Step 3: Point `global.css` at semantic tokens**

Four replacements in `src/styles/global.css`:

```css
/* line 30 */   background: var(--background);
/* line 31 */   color: var(--foreground);
/* line 49 */   color: var(--foreground);

/* lines 63-66 */
::selection {
  background: var(--foreground);
  color: var(--background);
}

/* lines 68-72 */
:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 3px;
  border-radius: 4px;
}
```

- [ ] **Step 4: Run the suite**

Run: `npm test`
Expected: 18 files, 77 tests, all PASS. Nothing asserts on color, so the retone must not break anything. If a test fails, a module referenced a token that no longer exists — check the legacy alias block covers it.

- [ ] **Step 5: Verify both themes render in the browser**

Start the dev server and load the page. Confirm: no white flash on reload; the page is neutral gray with no navy or mint anywhere; setting `document.documentElement.dataset.theme = 'light'` in the console flips the whole page to light without a reload.

- [ ] **Step 6: Commit**

```bash
git add src/styles/tokens.css src/styles/global.css index.html
git commit -m "Replace navy tokens with a neutral zinc semantic layer"
```

---

### Task 2: `useTheme` hook and `ThemeToggle` control

**Files:**
- Create: `src/hooks/useTheme.js`
- Create: `src/components/ThemeToggle.jsx`
- Create: `src/components/ThemeToggle.module.css`
- Modify: `src/components/Nav.jsx:139` (after the `</ul>`)
- Test: `src/test/theme.test.jsx` (create)

**Interfaces:**
- Consumes: `data-theme` on `documentElement` from Task 1.
- Produces: `useTheme()` → `{ theme: 'light' | 'dark', setTheme(next), toggle() }`. `<ThemeToggle />` renders a `<button>` whose accessible name is `Switch to light theme` / `Switch to dark theme`. Task 7 consumes `useTheme`.

- [ ] **Step 1: Write the failing test**

Create `src/test/theme.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { ThemeToggle } from '../components/ThemeToggle.jsx'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.dataset.theme = 'dark'
})

test('names the action it will take, not the state it is in', () => {
  render(<ThemeToggle />)
  expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument()
})

test('clicking flips the theme on the root element', async () => {
  const user = userEvent.setup()
  render(<ThemeToggle />)
  await user.click(screen.getByRole('button'))
  expect(document.documentElement.dataset.theme).toBe('light')
  expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument()
})

test('remembers the choice so it survives the next visit', async () => {
  const user = userEvent.setup()
  render(<ThemeToggle />)
  await user.click(screen.getByRole('button'))
  expect(localStorage.getItem('theme')).toBe('light')
})

test('reads the theme already on the root rather than assuming one', () => {
  document.documentElement.dataset.theme = 'light'
  render(<ThemeToggle />)
  expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/test/theme.test.jsx`
Expected: FAIL — `Failed to resolve import "../components/ThemeToggle.jsx"`.

- [ ] **Step 3: Write `src/hooks/useTheme.js`**

```js
import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'theme'

function currentTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function storedChoice() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function apply(theme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

export function useTheme() {
  const [theme, setThemeState] = useState(currentTheme)

  const setTheme = useCallback((next) => {
    apply(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private-browsing modes throw. The theme still applies for this session.
    }
    setThemeState(next)
  }, [])

  const toggle = useCallback(() => {
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark')
  }, [setTheme])

  // The system preference only speaks until the visitor makes a choice of their
  // own. After that it would be overriding a deliberate decision.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event) => {
      if (storedChoice()) return
      const next = event.matches ? 'dark' : 'light'
      apply(next)
      setThemeState(next)
    }
    query.addEventListener?.('change', onChange)
    return () => query.removeEventListener?.('change', onChange)
  }, [])

  return { theme, setTheme, toggle }
}
```

- [ ] **Step 4: Write `src/components/ThemeToggle.jsx`**

```jsx
import { useTheme } from '../hooks/useTheme.js'
import styles from './ThemeToggle.module.css'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
    >
      <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
        {theme === 'dark' ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
        )}
      </svg>
    </button>
  )
}
```

- [ ] **Step 5: Write `src/components/ThemeToggle.module.css`**

```css
.toggle {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: none;
  padding: 0;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--muted-foreground);
  cursor: pointer;
  transition:
    color 250ms var(--ease-out),
    background-color 250ms var(--ease-out),
    border-color 250ms var(--ease-out),
    scale 220ms var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .toggle:hover {
    color: var(--foreground);
    background: var(--overlay-hover);
    border-color: var(--border);
  }
}

.toggle:active {
  scale: 0.94;
}

.icon {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* The moon is a solid silhouette; stroking it as well thickens the crescent. */
.icon path[d^='M20'] {
  fill: currentColor;
  stroke: none;
}
```

- [ ] **Step 6: Mount it in the Nav**

In `src/components/Nav.jsx`, add the import at the top:

```jsx
import { ThemeToggle } from './ThemeToggle.jsx'
```

Then insert `<ThemeToggle />` immediately after the closing `</ul>` (line 139) and before `</nav>`. It must sit **outside** `<ul ref={listRef}>` — the traveling-pill measurement at `Nav.jsx:40-57` walks that list's children and would otherwise measure the button.

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx vitest run src/test/theme.test.jsx src/test/nav.test.jsx`
Expected: PASS — 4 new theme tests, 4 existing nav tests. The nav tests query links by role, so an added button does not disturb them.

- [ ] **Step 8: Run the full suite**

Run: `npm test`
Expected: 19 files, 81 tests, all PASS.

- [ ] **Step 9: Verify in the browser**

Click the toggle: the page flips, the icon swaps, and reloading keeps the chosen theme. Check the Nav bar still fits at 375px with the button added — if it crowds, reduce `.bar` `gap` from `24px` at the 760px breakpoint rather than shrinking the button below 34px (it is a touch target).

- [ ] **Step 10: Commit**

```bash
git add src/hooks/useTheme.js src/components/ThemeToggle.jsx src/components/ThemeToggle.module.css src/components/Nav.jsx src/test/theme.test.jsx
git commit -m "Add a light/dark theme toggle to the nav"
```

---

### Task 3: `GridFrame` rails

**Files:**
- Create: `src/components/GridFrame.jsx`
- Create: `src/components/GridFrame.module.css`
- Modify: `src/App.jsx:12-24`
- Modify: `src/styles/global.css` (add a `main` rule)
- Test: `src/test/gridFrame.test.jsx` (create)

**Interfaces:**
- Consumes: `--page-max`, `--gutter`, `--border` from Task 1; the existing global `.container` class (`global.css:74-79`).
- Produces: `<GridFrame />`, a decorative fixed layer. Task 4's crosshairs align to the rails it draws.

**Geometry note — read before implementing.** Each section already carries the global `.container` class (`Work.jsx:8`, `About.jsx:8`, `Experience.jsx:7`, `Contact.jsx:7`), so the section element *is* the container box: `max-width: var(--page-max)`, centered, `padding-inline: var(--gutter)`. The rails must land on that box's **content** edge. `GridFrame` therefore reuses `.container` and puts the borders on a child that fills its content box — that way the two derive from one rule and cannot drift, which is the failure mode §4.2 of the spec calls out.

- [ ] **Step 1: Write the failing test**

Create `src/test/gridFrame.test.jsx`:

```jsx
import { render } from '@testing-library/react'
import { expect, test } from 'vitest'
import { GridFrame } from '../components/GridFrame.jsx'

test('is decoration, so it stays out of the accessibility tree', () => {
  const { container } = render(<GridFrame />)
  expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
})
```

This file has exactly one test. `pointer-events: none` is the other thing worth
guaranteeing here — a mistake there makes the entire page unclickable — but jsdom
does not compute CSS module styles, so it cannot be asserted in this suite. It is
covered by the browser check in Step 8 instead. Do not add a test that asserts a
class name as a stand-in; it would pass even if the component were broken.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/test/gridFrame.test.jsx`
Expected: FAIL — `Failed to resolve import "../components/GridFrame.jsx"`.

- [ ] **Step 3: Write `src/components/GridFrame.jsx`**

```jsx
import styles from './GridFrame.module.css'

// Two hairlines the page is drawn against. Fixed rather than per-section, so
// they read as one continuous pair down the whole scroll with no seams — and
// so scrolling costs no repaint. Section starts mark themselves against these
// with crosshairs; see .section-mark in global.css.
export function GridFrame() {
  return (
    <div className={styles.frame} aria-hidden="true">
      <div className="container">
        <div className={styles.rails} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write `src/components/GridFrame.module.css`**

```css
.frame {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.frame > :global(.container) {
  height: 100%;
}

.rails {
  height: 100%;
  border-left: 1px solid var(--border);
  border-right: 1px solid var(--border);
}

/* At gutter width the rails sit inside the text's breathing room. Mobile
   boundaries are carried by whitespace and the numbered eyebrow instead. */
@media (max-width: 900px) {
  .frame {
    display: none;
  }
}
```

- [ ] **Step 5: Mount it and lift content above it**

In `src/App.jsx`, add the import and render `<GridFrame />` as the first child of the fragment, before `<Nav />`:

```jsx
import { GridFrame } from './components/GridFrame.jsx'
```

```jsx
    <>
      <GridFrame />
      <Nav />
      <ScrollManager />
      <main id="main">
```

Then in `src/styles/global.css`, add after the `.container` rule — a fixed element paints above non-positioned in-flow content, so `main` needs a stacking context of its own or the rails draw over the text:

```css
main {
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/test/gridFrame.test.jsx src/test/smoke.test.jsx src/test/routing.test.jsx`
Expected: PASS.

- [ ] **Step 7: Run the full suite**

Run: `npm test`
Expected: 20 files, 82 tests, all PASS.

- [ ] **Step 8: Verify alignment in the browser**

Load the page at 1440px. The two rails must line up **exactly** with the left and right edges of the section text. Scroll: the rails stay put and do not shift by a pixel. Below 900px they disappear entirely. Confirm links and buttons are still clickable everywhere (a `pointer-events` mistake here silently kills the whole page).

- [ ] **Step 9: Commit**

```bash
git add src/components/GridFrame.jsx src/components/GridFrame.module.css src/App.jsx src/styles/global.css src/test/gridFrame.test.jsx
git commit -m "Draw continuous grid rails behind the page"
```

---

### Task 4: Crosshair separators, numbered eyebrows, no more rules

**Files:**
- Modify: `src/styles/global.css` (add `.section-mark`)
- Modify: `src/sections/Work.module.css:1-5`, `:7-14`
- Modify: `src/sections/About.module.css:1-5`, `:7-15`, `:30-36`
- Modify: `src/sections/Experience.module.css:1-5`, `:7-14`, `:31-37`
- Modify: `src/sections/Contact.module.css:1-5`
- Modify: `src/sections/Work.jsx:8,10`, `src/sections/About.jsx:8,11`, `src/sections/Experience.jsx:7,10`, `src/sections/Contact.jsx:7,9`

**Interfaces:**
- Consumes: the rails from Task 3; `--border-strong`, `--muted-foreground`, `--gutter` from Task 1.
- Produces: a global `.section-mark` class. No new JS interface.

- [ ] **Step 1: Add `.section-mark` to `src/styles/global.css`**

Place after the `.section-heading` block. The `+` is drawn from two 1px gradients rather than a glyph so it needs no font and stays crisp at any zoom.

```css
/* Section starts register against the GridFrame rails instead of being fenced
   off by a full-width rule. The crosshair is the only part that scrolls — the
   rails behind it are fixed — so a new section reads as clicking into place. */
.section-mark {
  position: relative;
}

.section-mark::before,
.section-mark::after {
  content: '';
  position: absolute;
  top: 0;
  width: 9px;
  height: 9px;
  background:
    linear-gradient(var(--border-strong) 0 0) center / 100% 1px no-repeat,
    linear-gradient(var(--border-strong) 0 0) center / 1px 100% no-repeat;
}

.section-mark::before {
  left: var(--gutter);
  transform: translate(-50%, -50%);
}

.section-mark::after {
  right: var(--gutter);
  transform: translate(50%, -50%);
}

/* Matches the GridFrame breakpoint — a crosshair with no rail to sit on is
   just a speck. */
@media (max-width: 900px) {
  .section-mark::before,
  .section-mark::after {
    display: none;
  }
}
```

- [ ] **Step 2: Delete every section `border-top`**

Remove **only** the `border-top: 1px solid var(--border);` line from the `.section` rule in all four files. Leave every other declaration alone — the four rules are not identical, and Contact in particular has its own asymmetric padding that must not be replaced with `var(--section-gap)`.

Files and lines: `Work.module.css:4`, `About.module.css:4`, `Experience.module.css:4`, `Contact.module.css:5`.

After the edit, `Work.module.css` reads:

```css
.section {
  padding-block: var(--section-gap);
  scroll-margin-top: 110px;
}
```

and `Contact.module.css` reads:

```css
.section {
  padding-block: clamp(9rem, 18vh, 13rem) clamp(4rem, 8vh, 7rem);
  scroll-margin-top: 110px;
  text-align: center;
}
```

- [ ] **Step 3: Fix the inner dividers that caused the doubling**

In `src/sections/Experience.module.css`, add after the `.entry` rule (line 37):

```css
/* The last entry's rule used to collide with the next section's top border.
   The section border is gone now, but a trailing rule under the final entry
   would still read as a boundary the section does not have. */
.entry:last-child {
  border-bottom: 0;
}
```

In `src/sections/About.module.css:35`, change `border-block` to `border-top`:

```css
  border-top: 1px solid var(--border);
```

- [ ] **Step 4: Retone the eyebrows**

`Work.module.css:12` — change `color: var(--accent);` to `color: var(--muted-foreground);`
`About.module.css:13` — change `color: var(--mint);` to `color: var(--muted-foreground);`
`Experience.module.css:12` — change `color: var(--mint);` to `color: var(--muted-foreground);`
`Contact.module.css:13` — change `color: var(--accent);` to `color: var(--muted-foreground);`

- [ ] **Step 5: Number the eyebrows and add the crosshair class**

Four JSX edits. Add `section-mark` to each section's className and prefix the eyebrow text with its index. Hero is deliberately excluded — it is the page's opening, not a section within it.

`src/sections/Work.jsx`:
```jsx
    <section id="work" className={`${styles.section} section-mark container`}>
```
```jsx
        <p className={styles.eyebrow}>01 — Selected work</p>
```

`src/sections/About.jsx`:
```jsx
    <section id="about" className={`${styles.section} section-mark container`}>
```
```jsx
          <p className={styles.eyebrow}>02 — About</p>
```

`src/sections/Experience.jsx`:
```jsx
    <section id="experience" className={`${styles.section} section-mark container`}>
```
```jsx
          <p className={styles.eyebrow}>03 — Experience</p>
```

`src/sections/Contact.jsx`:
```jsx
    <section id="contact" className={`${styles.section} section-mark container`}>
```
```jsx
        <p className={styles.eyebrow}>04 — Contact</p>
```

- [ ] **Step 6: Run the section tests**

Run: `npx vitest run src/test/work.test.jsx src/test/about.test.jsx src/test/experience.test.jsx src/test/contact.test.jsx`
Expected: PASS. If a test asserts on exact eyebrow text (e.g. `getByText('About')`), it will fail on the added prefix — update the assertion to a regex (`getByText(/About/)`) rather than reverting the copy.

- [ ] **Step 7: Run the full suite**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 8: Verify in the browser**

Scroll the whole page in **both** themes and confirm: no full-width horizontal rule between any two sections; a crosshair sits precisely **on** each rail at every section start; no doubled line under the last Experience entry or under the About story grid; below 900px there are no crosshairs, no rails, and still no horizontal rules.

- [ ] **Step 9: Commit**

```bash
git add src/styles/global.css src/sections/
git commit -m "Replace section rules with crosshair registration marks"
```

---

### Task 5: Light-mode overlays for Nav and StackChips

**Files:**
- Modify: `src/components/Nav.module.css:55-60`, `:76-80`, `:89-91`, `:96`, `:152-153`, `:177-179`, `:202`, `:212`
- Modify: `src/components/StackChips.module.css:11`

**Interfaces:**
- Consumes: `--glass-tint`, `--glass-tint-strong`, `--overlay-hover`, `--overlay-active`, `--border`, `--border-strong`, `--shadow-color`, `--card` from Task 1.
- Produces: nothing new.

**Why this is its own task.** Every `rgba(255,255,255,…)` in these two files assumes a dark surface — a white overlay at 6% opacity is invisible on a white page. These are not token substitutions; each needs a value that works in both themes, which is what the `--overlay-*` and `--glass-*` tokens from Task 1 provide.

- [ ] **Step 1: Replace the Nav bar surfaces**

`Nav.module.css:55-60` (`.bar`):
```css
  background: var(--glass-tint);
  /* The edge is one flat hairline now, so it has to carry the whole contour. */
  border: 1px solid var(--border-strong);
  box-shadow:
    0 18px 44px var(--shadow-color),
    0 2px 8px var(--shadow-color);
```

`Nav.module.css:76-80` (`.barScrolled`):
```css
  background: var(--glass-tint-strong);
  border-color: var(--border-strong);
  box-shadow:
    0 22px 50px var(--shadow-color),
    0 2px 8px var(--shadow-color);
```

`Nav.module.css:89-91` (`.barMinimized`):
```css
  background: var(--glass-tint);
  border-color: var(--border);
  box-shadow: 0 10px 26px var(--shadow-color);
```

`Nav.module.css:96` (the no-backdrop-filter fallback):
```css
    background: var(--card);
```

- [ ] **Step 2: Replace the link and pill overlays**

`Nav.module.css:152-153` (`.link:not(.linkActive):hover`):
```css
    color: var(--foreground);
    background: var(--overlay-hover);
    border-color: var(--border);
```

`Nav.module.css:177-179` (`.pill`):
```css
  background: var(--overlay-active);
  border: 1px solid var(--border-strong);
  box-shadow: 0 4px 12px var(--shadow-color);
```

`Nav.module.css:202` (reduced-transparency `.bar`) — change `var(--surface)` to `var(--card)`.
`Nav.module.css:212` (reduced-transparency `.pill`) — change to `background: var(--overlay-active);`.

- [ ] **Step 3: Retone the remaining Nav color references**

`Nav.module.css:133` — `.link` `color: var(--muted);` becomes `color: var(--muted-foreground);`
`Nav.module.css:106` and `:151` and `:166` — `var(--text)` becomes `var(--foreground)`.

In `src/components/Nav.jsx:99`, the brand mark's `stroke="var(--accent)"` becomes `stroke="var(--foreground)"`, and `fill="var(--text)"` on line 106 becomes `fill="var(--foreground)"`.

- [ ] **Step 4: Fix StackChips**

`src/components/StackChips.module.css:11`:
```css
  background: var(--overlay-hover);
```

- [ ] **Step 5: Run the suite**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 6: Verify the glass in both themes**

This is the highest-risk visual change in the plan — the bar is translucent, so it inherits whatever is behind it. In **light** mode confirm the bar is still legibly distinct from the page (it should read as frosted white over light gray, with the border doing the contour work), the active pill is visible against it, and hover states register. Repeat in dark. Check scrolled and minimized states in both. Also check `prefers-reduced-transparency` by forcing the media query in devtools.

- [ ] **Step 7: Commit**

```bash
git add src/components/Nav.module.css src/components/Nav.jsx src/components/StackChips.module.css
git commit -m "Make the nav glass and chip overlays work in both themes"
```

---

### Task 6: Theme-aware Starfield

**Files:**
- Modify: `src/components/Starfield.jsx:45-86`, `:104-128`
- Modify: `src/components/Starfield.module.css:6-11`, `:28`

**Interfaces:**
- Consumes: `--foreground`, `--border`, `--card`, `--muted-foreground` from Task 1; `data-theme` on the root from Task 2.
- Produces: nothing new.

**Coverage note.** `vitest.setup.js:43` stubs `HTMLCanvasElement.prototype.getContext` to return `null`, so the draw loop never executes under test — `starfield.test.jsx` only asserts the element mounts. This task is verified in the browser, not by tests. Do not add canvas mocking to cover it; that would test the mock.

- [ ] **Step 1: Read colors from the theme instead of hardcoding them**

In `src/components/Starfield.jsx`, add above the `resize` function (after line 33):

```js
    // The canvas cannot use CSS variables directly, so it reads them once per
    // theme change and paints with the resolved values.
    let colors = readColors()

    function readColors() {
      const root = getComputedStyle(document.documentElement)
      return {
        node: root.getPropertyValue('--foreground').trim() || '#fafafa',
      }
    }
```

- [ ] **Step 2: Repaint using those colors**

Replace the body of `draw` from line 59 (`ctx.lineWidth = 1`) through line 86 (`}`) with:

```js
      ctx.lineWidth = 1
      ctx.strokeStyle = colors.node
      for (let i = 0; i < positions.length; i += 1) {
        for (let j = i + 1; j < positions.length; j += 1) {
          const a = positions[i]
          const b = positions[j]
          const distance = Math.hypot(a.x - b.x, a.y - b.y)
          if (distance < radius * 0.29) {
            ctx.globalAlpha = 0.2 * (1 - distance / (radius * 0.29))
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      // With the accent gone there is no second hue to tell the sizes apart,
      // so weight does it instead.
      ctx.fillStyle = colors.node
      for (const point of positions) {
        ctx.globalAlpha = point.size > 3 ? 0.85 : 0.45
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.arc(cx, cy, 7, 0, Math.PI * 2)
      ctx.fill()
    }
```

- [ ] **Step 3: Redraw when the theme changes**

Add after the `IntersectionObserver` block (after line 111), and register the disconnect in the cleanup:

```js
    // The theme swaps the root's data attribute; the canvas has to be told.
    const themeObserver =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver(() => {
            colors = readColors()
            draw(performance.now())
          })
    themeObserver?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
```

In the cleanup return (line 122-127), add:

```js
      themeObserver?.disconnect()
```

- [ ] **Step 4: Retone the module CSS**

`src/components/Starfield.module.css:6-11`:
```css
  background:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px),
    var(--card);
  background-size: 42px 42px;
  border: 1px solid var(--border);
```

`src/components/Starfield.module.css:28` — change `color: var(--muted);` to `color: var(--muted-foreground);`.

- [ ] **Step 5: Run the suite**

Run: `npm test`
Expected: all PASS, including `starfield.test.jsx` (2 tests).

- [ ] **Step 6: Verify in the browser**

The constellation renders in neutral in both themes — near-white nodes on dark, near-black on light. Toggle the theme **without reloading**: the canvas must recolor immediately. Confirm the grid behind it is visible but faint in both. Check `prefers-reduced-motion` still freezes it.

- [ ] **Step 7: Commit**

```bash
git add src/components/Starfield.jsx src/components/Starfield.module.css
git commit -m "Recolor the starfield from the active theme"
```

---

### Task 7: Theme-aware brand icon contrast

**Files:**
- Modify: `src/lib/legibleBrandColor.js` (full rewrite)
- Modify: `src/components/SkillGrid.jsx:4-6`, `:22-27`, `:98`
- Modify: `src/components/SkillGrid.module.css:38-39`, `:78`
- Test: `src/test/skills.test.jsx:61-64`

**Interfaces:**
- Consumes: `useTheme()` from Task 2.
- Produces: `legibleBrandColor(hex, surfaceLuminance = DARK_SURFACE_LUMINANCE)`, plus named exports `DARK_SURFACE_LUMINANCE` and `LIGHT_SURFACE_LUMINANCE`.

- [ ] **Step 1: Write the failing test**

Replace `src/test/skills.test.jsx:61-64` with:

```jsx
test('brand colours too dark for a dark surface are lifted to a legible one', () => {
  expect(legibleBrandColor('#61DAFB')).toBe('#61dafb')
  expect(legibleBrandColor('#0F0F11')).not.toBe('#0f0f11')
})

test('brand colours too light for a light surface are darkened instead', () => {
  // React's cyan clears 3:1 against near-black but only manages ~1.6:1 on white.
  expect(legibleBrandColor('#61DAFB', LIGHT_SURFACE_LUMINANCE)).not.toBe('#61dafb')
  expect(legibleBrandColor('#0F0F11', LIGHT_SURFACE_LUMINANCE)).toBe('#0f0f11')
})
```

And update the import at the top of the file:

```jsx
import { legibleBrandColor, LIGHT_SURFACE_LUMINANCE } from '../lib/legibleBrandColor.js'
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/test/skills.test.jsx`
Expected: FAIL — `LIGHT_SURFACE_LUMINANCE` is not exported.

- [ ] **Step 3: Rewrite `src/lib/legibleBrandColor.js`**

```js
// simple-icons ships each mark at its official brand hex, tuned for white
// backgrounds. Some marks vanish against our dark surface (Angular's #0F0F11)
// and others against our light one (React's #61DAFB), so lift or darken any
// colour that misses the 3:1 non-text contrast minimum for the surface it is
// actually being drawn on.

export const DARK_SURFACE_LUMINANCE = 0.0092 // --card on dark, #18181b
export const LIGHT_SURFACE_LUMINANCE = 1 // --card on light, #ffffff

const MIN_CONTRAST = 3

function toRgb(hex) {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.replace(/./g, (c) => c + c) : clean
  const int = parseInt(full, 16)
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

function toHex(rgb) {
  return `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`
}

function channel(value) {
  const c = value / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance(rgb) {
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2])
}

// Which of the two is lighter depends on the surface now, so the ratio has to
// be ordered rather than assuming the mark is the brighter of the pair.
function contrast(rgb, surfaceLuminance) {
  const mark = luminance(rgb)
  const lighter = Math.max(mark, surfaceLuminance)
  const darker = Math.min(mark, surfaceLuminance)
  return (lighter + 0.05) / (darker + 0.05)
}

export function legibleBrandColor(hex, surfaceLuminance = DARK_SURFACE_LUMINANCE) {
  const rgb = toRgb(hex)
  if (contrast(rgb, surfaceLuminance) >= MIN_CONTRAST) return toHex(rgb)

  // Move away from the surface: toward white on a dark one, toward black on a light one.
  const target = surfaceLuminance < 0.5 ? 255 : 0
  for (let mix = 0.05; mix < 1; mix += 0.05) {
    const shifted = rgb.map((c) => c + (target - c) * mix)
    if (contrast(shifted, surfaceLuminance) >= MIN_CONTRAST) return toHex(shifted)
  }
  return target === 255 ? '#ffffff' : '#000000'
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/test/skills.test.jsx`
Expected: PASS — 7 tests (the file had 6; Step 1 splits the contrast test in two).

- [ ] **Step 5: Feed the current surface in from SkillGrid**

In `src/components/SkillGrid.jsx`, update the import on line 4 and add the hook import:

```jsx
import {
  legibleBrandColor,
  DARK_SURFACE_LUMINANCE,
  LIGHT_SURFACE_LUMINANCE,
} from '../lib/legibleBrandColor.js'
import { useTheme } from '../hooks/useTheme.js'
```

Inside the component, after `const reduced = useReducedMotion()` (line 24):

```jsx
  const { theme } = useTheme()
  const surface = theme === 'dark' ? DARK_SURFACE_LUMINANCE : LIGHT_SURFACE_LUMINANCE
```

And on line 98, pass it through:

```jsx
                  style={{ fill: legibleBrandColor(icon.hex, surface) }}
```

- [ ] **Step 6: Retone the SkillGrid chips**

`src/components/SkillGrid.module.css:38-39` (`.chipActive`):
```css
  background: var(--foreground);
  border-color: var(--foreground);
```

Check the active chip's text color in the same rule — it must be `var(--background)` so it stays legible on the inverted fill. `SkillGrid.module.css:78` — change `color: var(--accent);` to `color: var(--muted-foreground);`.

- [ ] **Step 7: Run the full suite**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 8: Verify in the browser**

Open the About section's skill grid in both themes. Every logo must be clearly visible against its card — React's cyan should visibly darken in light mode, Angular's near-black should visibly lighten in dark mode. Toggle the theme and confirm the icons recolor. Check the active filter chip reads as inverted, not invisible.

- [ ] **Step 9: Commit**

```bash
git add src/lib/legibleBrandColor.js src/components/SkillGrid.jsx src/components/SkillGrid.module.css src/test/skills.test.jsx
git commit -m "Pick brand icon contrast against the active theme's surface"
```

---

### Task 8: Migrate remaining modules and delete the legacy aliases

**Files:**
- Modify: `src/sections/Hero.module.css`, `src/sections/ProjectCard.module.css`, `src/sections/Contact.module.css`, `src/sections/About.module.css`, `src/sections/Experience.module.css`, `src/sections/Work.module.css`
- Modify: `src/components/SectionRail.module.css`, `src/components/ProjectImage.module.css`, `src/components/StackChips.module.css`
- Modify: `src/pages/ProjectPage.module.css`, `src/pages/NotFound.module.css`
- Modify: `src/styles/tokens.css` (delete the legacy alias block)

**Interfaces:**
- Consumes: every semantic token from Task 1.
- Produces: a codebase with zero references to the retired names.

- [ ] **Step 1: Mechanically replace the renamed tokens**

Across all CSS modules, apply these substitutions:

| Old | New |
|---|---|
| `var(--void)` | `var(--background)` |
| `var(--surface)` | `var(--card)` |
| `var(--surface-raised)` | `var(--card-raised)` |
| `var(--text)` | `var(--foreground)` |
| `var(--muted)` | `var(--muted-foreground)` |
| `var(--glass-bg)` | `var(--card)` |
| `var(--glass-border)` | `var(--border)` |
| `var(--glass-border-bright)` | `var(--border-strong)` |

Careful with `--muted`: it now means a *surface* (`--zinc-100`/`--zinc-800`), not a text color. Every existing use is a text color, so all of them become `--muted-foreground`. Any use where `--muted` was a background must become `--muted` deliberately, not by find-and-replace.

- [ ] **Step 2: Replace the accent and mint references by intent**

These are judgment calls, not substitutions. Eyebrows, emphasis, and interactive marks take `--foreground`; metadata and secondary text take `--muted-foreground`.

Every filled control below (`.chipActive`, `.linkPrimary`, NotFound's button) already pairs its `--accent` background with `color: var(--void)`, which Step 1 turns into `var(--background)`. So inverting the fill to `--foreground` keeps the label legible automatically — no separate text edit is needed, but confirm it visually in Step 6.

| Location | New value |
|---|---|
| `About.module.css:54` (`.resume` underline) | `var(--foreground)` |
| `About.module.css:77` (`.principle span`) | `var(--muted-foreground)` |
| `Experience.module.css:66` | `var(--foreground)` |
| `Experience.module.css:98` | `var(--muted-foreground)` |
| `Experience.module.css:99-100` (mint chip) | `background: var(--muted); border-color: var(--border);` |
| `Hero.module.css:19`, `:139` | `var(--muted-foreground)` |
| `Hero.module.css:88` (`border-color`) | `var(--border-strong)` |
| `Hero.module.css:78` (shadow) | `0 10px 30px var(--shadow-color)` |
| `ProjectCard.module.css:33`, `:73` | `var(--muted-foreground)` |
| `ProjectCard.module.css:20` (hover border) | `var(--border-strong)` |
| `ProjectCard.module.css:22-23` (shadow) | `0 22px 60px var(--shadow-color), 0 0 0 1px var(--border)` |
| `Contact.module.css:39` (shadow) | `0 8px 32px var(--shadow-color)` |
| `Contact.module.css:61` (button glow) | `0 8px 30px var(--shadow-color)` |
| `ProjectPage.module.css:15`, `:84`, `:124`, `:160` | `var(--muted-foreground)` |
| `ProjectPage.module.css:59`, `:112` (filled buttons) | `var(--foreground)` |
| `NotFound.module.css:14` | `var(--muted-foreground)` |
| `NotFound.module.css:32` (filled button) | `var(--foreground)` |
| `SectionRail.module.css:61` | `var(--border-strong)` |
| `SectionRail.module.css:76`, `:82` | `var(--muted-foreground)` |
| `SectionRail.module.css:87-88`, `:91-92` | `var(--foreground)` |

- [ ] **Step 3: Delete the legacy alias block**

Remove the entire final `:root { --void: …; }` block from `src/styles/tokens.css` — the one commented "Legacy names".

- [ ] **Step 4: Prove nothing references the retired names**

Run:
```bash
grep -rn -- "--void\|--surface\|--text\b\|--accent\|--mint\|--glass-bg\|--glass-border\|--glass-highlight" src/
```
Expected: **zero hits.** A non-zero result means a module still points at a token that no longer exists, which renders as an unstyled fallback rather than an error — this grep is the only thing that catches it.

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 6: Full visual sweep**

This is the completion gate for the whole plan. In **both** themes, at **1440 / 900 / 375px**:

- Home: hero, work cards, about (story grid, principles, skill grid), experience, contact.
- A project page (`/work/waiver-director`) including the gallery.
- The 404 page (`/nope`).
- No navy or mint anywhere; nothing invisible; no unstyled fallback colors.
- Crosshairs still land on the rails at 1440 and 900; both are gone at 375.
- No doubled lines at any boundary on any page.
- `--muted-foreground` on `--background` clears 4.5:1 in both themes (check with devtools' contrast inspector on any `.lede`).

- [ ] **Step 7: Commit**

```bash
git add src/ 
git commit -m "Retire the navy token names across every module"
```

---

## Self-Review

**Spec coverage.** §3.1 ramp → Task 1. §3.2 semantic layer → Task 1 (`--border-strong` included in the table). §3.3 deletions, glass aliases, radius → Tasks 1 and 8. §4.1 GridFrame → Task 3. §4.2 crosshairs → Task 4 Step 1. §4.3 numbered eyebrow → Task 4 Step 5. §4.4 rules removed → Task 4 Step 2. §4.5 inner dividers → Task 4 Step 3. §4.6 responsive → Task 3 Step 4 and Task 4 Step 1. §5.1 pre-paint script → Task 1 Step 2. §5.2 useTheme → Task 2 Step 3. §5.3 ThemeToggle → Task 2 Steps 4–6. §5.4 Starfield → Task 6. §5.5 legibleBrandColor → Task 7. §6 tests → Tasks 2, 3, 7. §7 risk (uncommitted work) → already resolved; the tree was committed at `b0bf705` before planning.

**Deviation from the spec, recorded deliberately.** §4.2 calls for a shared `--rail-x` token to keep the rails and crosshairs aligned. Implementation found that unnecessary: each section already carries the global `.container` class, so both the frame and the crosshairs inset by `var(--gutter)` from the same box. Introducing a `calc()` token would have duplicated geometry that CSS already shares. The spec's *requirement* — one source of alignment — is met; its proposed mechanism is not used.

**Type consistency.** `legibleBrandColor(hex, surfaceLuminance)` with exports `DARK_SURFACE_LUMINANCE` / `LIGHT_SURFACE_LUMINANCE` is defined in Task 7 Step 3 and consumed with those exact names in Task 7 Steps 1 and 5. `useTheme()` returns `{ theme, setTheme, toggle }` in Task 2 Step 3 and is destructured as `{ theme, toggle }` in Task 2 Step 4 and `{ theme }` in Task 7 Step 5. `GridFrame` is a named export in Task 3 Step 3 and imported as such in Task 3 Step 5 and the test in Step 1.

**Known gap.** Task 6 has no automated coverage — `vitest.setup.js:43` stubs canvas out, so the Starfield draw loop cannot execute under test. Browser verification in Task 6 Step 6 is the only check on it. Called out in the task rather than papered over with a canvas mock.
