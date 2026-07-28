# Portfolio Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a static portfolio site for Jesus Velazquez — one scrolling home page plus a case-study page per project, in a deep-space theme with a liquid-glass navigation bar and scroll-driven reveal animations.

**Architecture:** Vite + React SPA. All content lives in three plain data modules (`profile`, `projects`, `experience`) that components read from — adding a project or job never requires touching a component. Scroll animation is implemented exactly once, in a `Reveal` wrapper that also owns reduced-motion handling. Deployed to GitHub Pages via Actions, with `index.html` copied to `404.html` at build time so client-side routes survive direct loads and refreshes.

**Tech Stack:** Vite 5, React 18, React Router 6, Framer Motion 11, CSS Modules, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-07-27-portfolio-website-design.md`

## Global Constraints

- Design tokens are the only source of color. No hardcoded hex values in component CSS — use `var(--void)`, `var(--surface)`, `var(--text)`, `var(--muted)`, `var(--accent)`, `var(--aurora)`.
- Exact token values: `--void: #05070D`, `--surface: #0B0F1A`, `--text: #E8ECF5`, `--muted: #8B94A8`, `--accent: #6EA8FF`, `--aurora: #B77BFF`.
- `--aurora` may only appear inside `linear-gradient()` / `radial-gradient()`. Never as a solid `color` or `background-color`.
- Fonts: **Space Grotesk** (headings), **Inter** (body), **JetBrains Mono** (eyebrows, chips, dates, card numbers).
- Base reveal animation: `opacity 0→1`, `translateY 24px→0`, `blur 6px→0`, `600ms`, `cubic-bezier(.16, 1, .3, 1)`, `60ms` stagger. Fires **once** — never re-animates on scroll-up.
- `prefers-reduced-motion: reduce` must never hide content. Reduced motion is handled inside `Reveal` and `Starfield` only.
- Animate only `opacity`, `transform`, and `filter`.
- Every interactive element gets a visible focus ring in `--accent`.
- Vite `base` is `'/'` (root user site). Changing to a project repo means changing this one value to `'/<repo-name>/'`.
- No CSS framework. CSS Modules per component, one shared token file.
- No snapshot tests of markup.
- Node 20+.

---

## File structure

```
.github/workflows/deploy.yml    CI: test, build, deploy to Pages
public/
  favicon.svg                   JV monogram
  resume/                       (empty; résumé PDF dropped here later)
  projects/                     (empty; screenshots dropped here later)
index.html                      shell + font preconnect
vite.config.js                  base, react plugin, 404.html copy, vitest config
vitest.setup.js                 jsdom polyfills: matchMedia, IntersectionObserver, rAF
package.json
README.md                       asset drop-in guide
src/
  main.jsx                      React root + BrowserRouter
  App.jsx                       routes + ScrollManager + Starfield + Nav
  styles/
    tokens.css                  design tokens
    global.css                  reset, base type, focus ring, scroll behavior
  data/
    profile.js                  name, blurb, skills, email, résumé, socials
    projects.js                 project objects
    experience.js               roles + education node
  lib/
    mostVisible.js              pure: IO entries → most-visible element id
  hooks/
    useReducedMotion.js         matchMedia wrapper
    useActiveSection.js         IntersectionObserver + mostVisible
    useScrolled.js              boolean past a scroll threshold
  components/
    Reveal.jsx                  the ONLY scroll-animation implementation
    Starfield.jsx               fixed canvas + aurora
    Nav.jsx                     glass pill nav
    SkipLink.jsx                skip-to-content
    ProjectImage.jsx            image with gradient fallback when file missing
    StackChips.jsx              mono chip row
  sections/
    Hero.jsx  Work.jsx  ProjectCard.jsx  About.jsx  Experience.jsx  Contact.jsx
  pages/
    Home.jsx  ProjectPage.jsx  NotFound.jsx
  test/
    *.test.jsx
```

Each `.jsx` under `components/`, `sections/`, and `pages/` has a sibling `.module.css`.

---

### Task 1: Project scaffold, tokens, and a running dev server

**Files:**
- Create: `package.json`, `vite.config.js`, `vitest.setup.js`, `index.html`, `.gitignore`
- Create: `src/main.jsx`, `src/App.jsx`, `src/styles/tokens.css`, `src/styles/global.css`
- Test: `src/test/smoke.test.jsx`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `App` (default export from `src/App.jsx`), design tokens as CSS custom properties on `:root`, and a working `npx vitest run` command.

- [ ] **Step 1: Initialize the repo and install dependencies**

The repo currently has no commits and is on branch `master`. Rename it to `main` first — the deploy workflow in Task 13 triggers on `main`.

```bash
git branch -M main
npm init -y
npm install react@18 react-dom@18 react-router-dom@6 framer-motion@11
npm install -D vite@5 @vitejs/plugin-react@4 vitest@2 jsdom@25 @testing-library/react@16 @testing-library/jest-dom@6 @testing-library/user-event@14
```

- [ ] **Step 2: Configure `package.json` scripts**

Replace the `scripts` block and add `"type": "module"`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Create `.gitignore`**

```
node_modules
dist
.DS_Store
*.local
```

- [ ] **Step 4: Create `vite.config.js`**

The `copyIndexTo404` plugin is what makes GitHub Pages serve client-side routes correctly. It only runs on build.

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

function copyIndexTo404() {
  return {
    name: 'copy-index-to-404',
    apply: 'build',
    closeBundle() {
      const dist = resolve(process.cwd(), 'dist')
      copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [react(), copyIndexTo404()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.js',
    include: ['src/test/**/*.test.{js,jsx}'],
  },
})
```

- [ ] **Step 5: Create `vitest.setup.js`**

jsdom implements none of these three APIs. Without the polyfills every component that animates or observes scroll throws on import.

```js
import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
window.IntersectionObserver = MockIntersectionObserver
global.IntersectionObserver = MockIntersectionObserver

window.scrollTo = vi.fn()
```

**Helper for later tasks:** to simulate reduced motion in a test, override `matchMedia` inside the test. Framer Motion reads `prefers-reduced-motion` through the **legacy** `addListener` API, so the double must implement both surfaces or every `motion` component throws on mount:

```js
window.matchMedia = (query) => ({
  matches: query.includes('prefers-reduced-motion'),
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})
```

- [ ] **Step 6: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>Jesus Velazquez — Software Engineer</title>
    <meta name="description" content="Software engineer. Co-founder of Waiver Director. Building REST APIs, component libraries, and web products." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create `src/styles/tokens.css`**

```css
:root {
  --void: #05070D;
  --surface: #0B0F1A;
  --text: #E8ECF5;
  --muted: #8B94A8;
  --accent: #6EA8FF;
  --aurora: #B77BFF;

  --glass-bg: rgba(12, 16, 28, 0.55);
  --glass-border: rgba(255, 255, 255, 0.10);
  --glass-border-bright: rgba(255, 255, 255, 0.18);
  --glass-highlight: rgba(255, 255, 255, 0.14);

  --font-display: 'Space Grotesk', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  --ease-out: cubic-bezier(.16, 1, .3, 1);
  --dur: 600ms;

  --page-max: 1120px;
  --gutter: clamp(1.25rem, 5vw, 3rem);
  --section-gap: clamp(6rem, 14vh, 10rem);

  --radius-card: 20px;
  --radius-pill: 999px;
}
```

- [ ] **Step 8: Create `src/styles/global.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body,
h1,
h2,
h3,
h4,
p,
figure,
ul,
ol {
  margin: 0;
  padding: 0;
}

ul,
ol {
  list-style: none;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--void);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

h1,
h2,
h3 {
  font-family: var(--font-display);
  line-height: 1.1;
  letter-spacing: -0.02em;
  font-weight: 600;
}

a {
  color: var(--accent);
  text-decoration: none;
}

img {
  max-width: 100%;
  display: block;
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 4px;
}

.container {
  width: 100%;
  max-width: var(--page-max);
  margin-inline: auto;
  padding-inline: var(--gutter);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 9: Create `src/App.jsx`**

Minimal for now — Task 11 replaces this with the real router.

```jsx
export default function App() {
  return (
    <main className="container">
      <h1>Jesus Velazquez</h1>
    </main>
  )
}
```

- [ ] **Step 10: Create `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/tokens.css'
import './styles/global.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 11: Write the smoke test**

Create `src/test/smoke.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import App from '../App.jsx'

test('renders the name', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Jesus Velazquez' })).toBeInTheDocument()
})
```

- [ ] **Step 12: Run the test**

Run: `npx vitest run`
Expected: PASS — `1 passed`.

- [ ] **Step 13: Verify the dev server**

Run: `npm run dev`
Expected: server starts on `http://localhost:5173`; the page is near-black (`#05070D`) with "Jesus Velazquez" in Space Grotesk. Stop the server.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React portfolio with design tokens"
```

---

### Task 2: Content data modules

**Files:**
- Create: `src/data/profile.js`, `src/data/projects.js`, `src/data/experience.js`
- Test: `src/test/data.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `profile` (default export, `src/data/profile.js`) — `{ name, role, headline, blurb, email, resumeUrl: string|null, socials: [{label, url}], skills: [{group, items: string[]}] }`
  - `projects` (default export, `src/data/projects.js`) — array of `{ slug, title, tagline, role, year, featured, stack, liveUrl, repoUrl, thumb, problem, whatIBuilt, highlights, screenshots }`
  - `getProject(slug)` (named export, `src/data/projects.js`) — returns the project object or `undefined`
  - `experience` (default export, `src/data/experience.js`) — array of `{ company, url, role, start, end, bullets }`
  - `education` (named export, `src/data/experience.js`) — `{ school, degree, graduated, detail }`

- [ ] **Step 1: Write the failing test**

Create `src/test/data.test.js`:

```js
import profile from '../data/profile.js'
import projects, { getProject } from '../data/projects.js'
import experience, { education } from '../data/experience.js'

test('profile has the fields the UI reads', () => {
  expect(profile.name).toBe('Jesus Velazquez')
  expect(profile.email).toMatch(/@/)
  expect(profile.skills.length).toBeGreaterThan(0)
  profile.skills.forEach((g) => {
    expect(typeof g.group).toBe('string')
    expect(Array.isArray(g.items)).toBe(true)
  })
})

test('every project has a unique slug and the required fields', () => {
  const slugs = projects.map((p) => p.slug)
  expect(new Set(slugs).size).toBe(slugs.length)

  projects.forEach((p) => {
    expect(p.slug).toMatch(/^[a-z0-9-]+$/)
    expect(p.title).toBeTruthy()
    expect(p.tagline).toBeTruthy()
    expect(p.problem).toBeTruthy()
    expect(p.whatIBuilt).toBeTruthy()
    expect(Array.isArray(p.stack)).toBe(true)
    expect(p.highlights.length).toBeGreaterThanOrEqual(3)
    expect(p).toHaveProperty('repoUrl')
    expect(p).toHaveProperty('liveUrl')
  })
})

test('featured projects sort first', () => {
  const firstUnfeatured = projects.findIndex((p) => !p.featured)
  if (firstUnfeatured !== -1) {
    expect(projects.slice(firstUnfeatured).every((p) => !p.featured)).toBe(true)
  }
})

test('getProject finds by slug and returns undefined otherwise', () => {
  expect(getProject('waiver-director').title).toBe('Waiver Director')
  expect(getProject('does-not-exist')).toBeUndefined()
})

test('experience is ordered most recent first and ends at education', () => {
  expect(experience[0].end).toBeNull()
  experience.forEach((role) => {
    expect(role.company).toBeTruthy()
    expect(role.role).toBeTruthy()
    expect(role.bullets.length).toBeGreaterThan(0)
  })
  expect(education.school).toMatch(/Florida International/)
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/test/data.test.js`
Expected: FAIL — `Failed to resolve import "../data/profile.js"`.

- [ ] **Step 3: Create `src/data/profile.js`**

`resumeUrl` is `null` on purpose — the About section hides the résumé button until the PDF exists, so the site never ships a link that 404s.

```js
const profile = {
  name: 'Jesus Velazquez',
  role: 'Software Engineer',
  headline: 'I build software that ships.',
  blurb:
    "I'm a software engineer working on backend systems for the Department of Defense, and " +
    "co-founder of Waiver Director, a digital waiver platform used by adventure and experience " +
    "operators. Most of my time goes to REST APIs, shared component libraries, and the unglamorous " +
    "work of making existing systems faster and easier to change. I studied Computer Science at " +
    'Florida International University and have been writing code professionally since 2023.',
  email: 'jesusvelazquez0980@gmail.com',
  // Set to '/resume/jesus-velazquez-resume.pdf' once the file is added to public/resume/.
  resumeUrl: null,
  socials: [
    { label: 'GitHub', url: 'https://github.com/jesusvelaz' },
  ],
  skills: [
    { group: 'Languages', items: ['Java', 'Python', 'C', 'JavaScript', 'SQL', 'HTML', 'CSS'] },
    { group: 'Backend & Data', items: ['REST APIs', 'PostgreSQL', 'MySQL'] },
    { group: 'Frontend', items: ['React', 'Responsive UI'] },
    { group: 'Tools', items: ['Git', 'GitHub', 'VS Code', 'IntelliJ'] },
  ],
}

export default profile
```

- [ ] **Step 4: Create `src/data/projects.js`**

```js
const projects = [
  {
    slug: 'waiver-director',
    title: 'Waiver Director',
    tagline: 'Digital waiver management that captures every participant, not just the booker.',
    role: 'Co-founder & Software Engineer',
    year: '2024 — Present',
    featured: true,
    stack: ['React', 'REST APIs', 'PostgreSQL', 'Bookeo API', 'Email Automation'],
    liveUrl: 'https://www.waiverdirector.com/',
    repoUrl: null,
    thumb: '/projects/waiver-director/thumb.jpg',
    problem:
      'Adventure operators — zipline tours, axe throwing, escape rooms, kayak rentals — collect a ' +
      'signed waiver from every participant, but only capture contact details for the person who ' +
      'made the booking. Everyone else signs, walks away, and is never reachable again. Operators ' +
      'lose most of their customer list at the exact moment engagement is highest.',
    whatIBuilt:
      'Waiver Director captures a verified email from every signer, matches each signature back to ' +
      'the correct session through the operator\'s booking provider, and automates individual ' +
      'follow-up for reviews and repeat bookings. I co-founded the product and build it.',
    highlights: [
      'Versioned waiver templates: editing a template never mutates signatures already collected, so signed records stay legally intact.',
      'Bookeo integration syncs sessions and expected headcount, so completion analytics compare signed against expected per session rather than reporting raw totals.',
      'Per-signer email automation with configurable delays, addressed to every participant instead of only the booking lead.',
      'Role-based access for owners and staff across multiple venues, backed by immutable audit trails with PDF export.',
    ],
    screenshots: [
      { src: '/projects/waiver-director/01.jpg', alt: 'Waiver Director dashboard showing session completion rates' },
      { src: '/projects/waiver-director/02.jpg', alt: 'The waiver builder editing a branded template' },
      { src: '/projects/waiver-director/03.jpg', alt: 'Email automation schedule configuration' },
    ],
  },
  {
    slug: 'pokedex',
    title: 'PokeDex App',
    tagline: 'A fast, searchable Pokédex built on the PokéAPI.',
    role: 'Solo project',
    year: '2023',
    featured: false,
    stack: ['React', 'JavaScript', 'PokéAPI', 'CSS'],
    liveUrl: 'https://jesusvelaz.github.io/PokeDex-App/',
    // VERIFY: confirm this repo URL with Jesus before deploying.
    repoUrl: 'https://github.com/jesusvelaz/PokeDex-App',
    thumb: '/projects/pokedex/thumb.jpg',
    problem:
      'The PokéAPI exposes hundreds of resources across separate endpoints, and a Pokémon\'s ' +
      'sprite, types, and stats each live in a different place. Rendering a browsable list means ' +
      'coordinating many requests without stalling the interface or hammering the API.',
    whatIBuilt:
      'A React single-page app that fetches from the PokéAPI, resolves each Pokémon\'s details, and ' +
      'renders them as a searchable grid of cards with sprites, types, and base stats.',
    highlights: [
      'Batches and caches API responses so revisiting a Pokémon costs no additional requests.',
      'Client-side search filters the loaded set instantly rather than issuing a request per keystroke.',
      'Type-driven card theming derives colors from each Pokémon\'s type data instead of a hardcoded map.',
    ],
    screenshots: [
      { src: '/projects/pokedex/01.jpg', alt: 'PokeDex App grid of Pokémon cards' },
      { src: '/projects/pokedex/02.jpg', alt: 'Detail view for a single Pokémon showing base stats' },
    ],
  },
]

export function getProject(slug) {
  return projects.find((p) => p.slug === slug)
}

export default projects
```

- [ ] **Step 5: Create `src/data/experience.js`**

```js
const experience = [
  {
    company: 'Department of Defense',
    url: null,
    role: 'Software Engineer',
    start: 'Sep 2024',
    end: null,
    bullets: [
      'Develop and maintain a shared software library of reusable components.',
      'Engineer REST APIs and test endpoints against expected behavior.',
      'Modify and optimize backend functionality across existing services.',
    ],
  },
  {
    company: 'Waiver Director',
    url: 'https://www.waiverdirector.com/',
    role: 'Co-founder & Software Engineer',
    // VERIFY: confirm the start date with Jesus.
    start: '2024',
    end: null,
    bullets: [
      'Co-founded and build a digital waiver platform for adventure and experience operators.',
      'Designed versioned waiver templates that keep already-signed records immutable.',
      'Integrated the Bookeo booking API to match signatures to sessions and report completion rates.',
    ],
  },
  {
    company: 'Fidelity Transport & Logistics',
    url: 'https://fidelityautoshipping.com/',
    role: 'Junior Web Developer',
    start: 'Oct 2023',
    end: 'Jun 2024',
    bullets: [
      'Built and maintained company websites in HTML, CSS, and JavaScript, working on a small team.',
      'Debugged and resolved site issues, improving overall performance and responsiveness.',
      'Contributed ideas and progress updates in project planning meetings.',
    ],
  },
]

export const education = {
  school: 'Florida International University',
  degree: 'B.A. Computer Science',
  graduated: 'May 2023',
  detail: '3.66 GPA · Dean\'s List 2019–2023',
}

export default experience
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run src/test/data.test.js`
Expected: PASS — `5 passed`.

- [ ] **Step 7: Commit**

```bash
git add src/data src/test/data.test.js
git commit -m "feat: add profile, projects, and experience data modules"
```

---

### Task 3: `useReducedMotion` and the `Reveal` component

**Files:**
- Create: `src/hooks/useReducedMotion.js`, `src/components/Reveal.jsx`
- Test: `src/test/reveal.test.jsx`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `useReducedMotion()` (named export, `src/hooks/useReducedMotion.js`) → `boolean`
  - `Reveal` (named export, `src/components/Reveal.jsx`) — props `{ children, as = 'div', delay = 0, className, ...rest }`. `as` is any tag name Framer Motion supports (`'div'`, `'section'`, `'li'`, `'h2'`, `'p'`).

`Reveal` is the only place scroll animation is implemented. No other component may call `IntersectionObserver` for animation or read `prefers-reduced-motion` for animation purposes.

- [ ] **Step 1: Write the failing test**

Create `src/test/reveal.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { Reveal } from '../components/Reveal.jsx'

function setReducedMotion(on) {
  window.matchMedia = (query) => ({
    matches: on && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })
}

afterEach(() => {
  setReducedMotion(false)
})

test('renders its children', () => {
  setReducedMotion(false)
  render(<Reveal>hello</Reveal>)
  expect(screen.getByText('hello')).toBeInTheDocument()
})

test('content is fully visible immediately when reduced motion is requested', () => {
  setReducedMotion(true)
  render(<Reveal>visible now</Reveal>)
  const el = screen.getByText('visible now')
  expect(el).toBeVisible()
  expect(el.style.opacity).not.toBe('0')
})

test('renders as the requested element', () => {
  setReducedMotion(true)
  render(<Reveal as="section">a section</Reveal>)
  expect(screen.getByText('a section').tagName).toBe('SECTION')
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/test/reveal.test.jsx`
Expected: FAIL — `Failed to resolve import "../components/Reveal.jsx"`.

- [ ] **Step 3: Create `src/hooks/useReducedMotion.js`**

```js
import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function read() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(QUERY).matches
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(read)

  useEffect(() => {
    if (!window.matchMedia) return
    const mql = window.matchMedia(QUERY)
    const onChange = (e) => setReduced(e.matches)
    mql.addEventListener?.('change', onChange)
    return () => mql.removeEventListener?.('change', onChange)
  }, [])

  return reduced
}
```

- [ ] **Step 4: Create `src/components/Reveal.jsx`**

```jsx
import { motion } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion.js'

export function Reveal({ children, as = 'div', delay = 0, className, ...rest }) {
  const reduced = useReducedMotion()
  const Tag = motion[as] ?? motion.div

  if (reduced) {
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    )
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
```

`viewport={{ once: true }}` is the constraint that keeps content from re-animating on scroll-up. Do not remove it.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/test/reveal.test.jsx`
Expected: PASS — `3 passed`.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useReducedMotion.js src/components/Reveal.jsx src/test/reveal.test.jsx
git commit -m "feat: add Reveal component with reduced-motion support"
```

---

### Task 4: Starfield background

**Files:**
- Create: `src/components/Starfield.jsx`, `src/components/Starfield.module.css`
- Test: `src/test/starfield.test.jsx`

**Interfaces:**
- Consumes: `useReducedMotion()` from Task 3.
- Produces: `Starfield` (named export, `src/components/Starfield.jsx`), no props. Renders a fixed, `aria-hidden` canvas plus two aurora blobs, positioned behind all content at `z-index: -1`.

- [ ] **Step 1: Write the failing test**

jsdom's `getContext('2d')` returns `null`. The component must guard on that — which is both correct defensive code and what makes it testable.

Create `src/test/starfield.test.jsx`:

```jsx
import { render } from '@testing-library/react'
import { Starfield } from '../components/Starfield.jsx'

test('renders a canvas hidden from assistive technology', () => {
  const { container } = render(<Starfield />)
  const canvas = container.querySelector('canvas')
  expect(canvas).not.toBeNull()
  expect(canvas).toHaveAttribute('aria-hidden', 'true')
})

test('does not throw when the 2d context is unavailable', () => {
  expect(() => render(<Starfield />)).not.toThrow()
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/test/starfield.test.jsx`
Expected: FAIL — `Failed to resolve import "../components/Starfield.jsx"`.

- [ ] **Step 3: Create `src/components/Starfield.module.css`**

```css
.wrap {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
  background: var(--void);
}

.canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.aurora {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.30;
  will-change: transform;
}

.auroraA {
  width: 46vw;
  height: 46vw;
  top: -10vw;
  left: -8vw;
  background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
  animation: driftA 34s ease-in-out infinite alternate;
}

.auroraB {
  width: 52vw;
  height: 52vw;
  bottom: -16vw;
  right: -12vw;
  background: radial-gradient(circle, var(--aurora) 0%, transparent 70%);
  animation: driftB 44s ease-in-out infinite alternate;
}

@keyframes driftA {
  to {
    transform: translate3d(8vw, 6vh, 0) scale(1.15);
  }
}

@keyframes driftB {
  to {
    transform: translate3d(-7vw, -5vh, 0) scale(1.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .auroraA,
  .auroraB {
    animation: none;
  }
}
```

- [ ] **Step 4: Create `src/components/Starfield.jsx`**

```jsx
import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import styles from './Starfield.module.css'

const LAYERS = [
  { density: 0.00009, size: 0.7, speed: 0.02, alpha: 0.45 },
  { density: 0.00005, size: 1.1, speed: 0.06, alpha: 0.70 },
  { density: 0.00002, size: 1.7, speed: 0.12, alpha: 0.95 },
]

export function Starfield() {
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let ctx = null
    try {
      ctx = canvas.getContext('2d')
    } catch {
      return
    }
    if (!ctx) return

    let stars = []
    let width = 0
    let height = 0
    let frame = 0
    let running = true

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth || window.innerWidth
      height = canvas.clientHeight || window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      stars = []
      for (const layer of LAYERS) {
        const count = Math.round(width * height * layer.density)
        for (let i = 0; i < count; i += 1) {
          stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: layer.size * (0.6 + Math.random() * 0.8),
            a: layer.alpha * (0.4 + Math.random() * 0.6),
            speed: layer.speed,
          })
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#CFE0FF'
      const scroll = window.scrollY || 0
      for (const s of stars) {
        let y = (s.y - scroll * s.speed) % height
        if (y < 0) y += height
        ctx.globalAlpha = s.a
        ctx.beginPath()
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    function loop() {
      if (!running) return
      draw()
      frame = requestAnimationFrame(loop)
    }

    function onResize() {
      build()
      draw()
    }

    function onVisibilityChange() {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(frame)
      } else if (!reduced) {
        running = true
        loop()
      }
    }

    build()
    if (reduced) {
      draw()
    } else {
      loop()
    }

    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [reduced])

  return (
    <div className={styles.wrap} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={`${styles.aurora} ${styles.auroraA}`} />
      <div className={`${styles.aurora} ${styles.auroraB}`} />
    </div>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/test/starfield.test.jsx`
Expected: PASS — `2 passed`.

- [ ] **Step 6: Commit**

```bash
git add src/components/Starfield.jsx src/components/Starfield.module.css src/test/starfield.test.jsx
git commit -m "feat: add parallax starfield background with aurora blobs"
```

---

### Task 5: Active-section tracking and the liquid-glass nav

**Files:**
- Create: `src/lib/mostVisible.js`, `src/hooks/useActiveSection.js`, `src/hooks/useScrolled.js`
- Create: `src/components/Nav.jsx`, `src/components/Nav.module.css`
- Create: `src/components/SkipLink.jsx`, `src/components/SkipLink.module.css`
- Test: `src/test/mostVisible.test.js`, `src/test/nav.test.jsx`

**Interfaces:**
- Consumes: nothing from prior tasks.
- Produces:
  - `mostVisible(entries)` (named export, `src/lib/mostVisible.js`) — takes an array of `IntersectionObserverEntry`-shaped objects `{ target: { id }, isIntersecting, intersectionRatio }`, returns the `id` of the most-visible intersecting entry, or `null` if none intersect.
  - `useActiveSection(ids)` (named export, `src/hooks/useActiveSection.js`) → currently active section id string.
  - `useScrolled(threshold = 40)` (named export, `src/hooks/useScrolled.js`) → `boolean`.
  - `SECTIONS` (named export, `src/components/Nav.jsx`) — `[{ id: 'work', label: 'Work' }, { id: 'about', label: 'About' }, { id: 'experience', label: 'Experience' }, { id: 'contact', label: 'Contact' }]`
  - `Nav` (named export, `src/components/Nav.jsx`), no props. Must be rendered inside a router.

The IntersectionObserver-driven parts are untestable in jsdom, so the *selection rule* is extracted into a pure function and tested directly. That is the point of `mostVisible.js`.

- [ ] **Step 1: Write the failing test for `mostVisible`**

Create `src/test/mostVisible.test.js`:

```js
import { mostVisible } from '../lib/mostVisible.js'

const entry = (id, isIntersecting, intersectionRatio) => ({
  target: { id },
  isIntersecting,
  intersectionRatio,
})

test('returns the intersecting entry with the largest ratio', () => {
  const result = mostVisible([
    entry('work', true, 0.2),
    entry('about', true, 0.8),
    entry('contact', true, 0.5),
  ])
  expect(result).toBe('about')
})

test('ignores entries that are not intersecting', () => {
  const result = mostVisible([
    entry('work', false, 0.9),
    entry('about', true, 0.3),
  ])
  expect(result).toBe('about')
})

test('returns null when nothing is intersecting', () => {
  expect(mostVisible([entry('work', false, 0)])).toBeNull()
})

test('returns null for an empty list', () => {
  expect(mostVisible([])).toBeNull()
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/test/mostVisible.test.js`
Expected: FAIL — `Failed to resolve import "../lib/mostVisible.js"`.

- [ ] **Step 3: Create `src/lib/mostVisible.js`**

```js
export function mostVisible(entries) {
  let best = null
  for (const e of entries) {
    if (!e.isIntersecting) continue
    if (!best || e.intersectionRatio > best.intersectionRatio) best = e
  }
  return best ? best.target.id : null
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/test/mostVisible.test.js`
Expected: PASS — `4 passed`.

- [ ] **Step 5: Create `src/hooks/useActiveSection.js`**

```js
import { useEffect, useState } from 'react'
import { mostVisible } from '../lib/mostVisible.js'

export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (elements.length === 0) return

    const seen = new Map()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e))
        const next = mostVisible([...seen.values()])
        if (next) setActive(next)
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '-20% 0px -35% 0px' }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return active
}
```

- [ ] **Step 6: Create `src/hooks/useScrolled.js`**

```js
import { useEffect, useState } from 'react'

export function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled((window.scrollY || 0) > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}
```

- [ ] **Step 7: Write the failing test for `Nav`**

Create `src/test/nav.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Nav, SECTIONS } from '../components/Nav.jsx'

function renderNav(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Nav />
    </MemoryRouter>
  )
}

test('renders the full name and every section link', () => {
  renderNav()
  expect(screen.getByRole('link', { name: /Jesus Velazquez/ })).toBeInTheDocument()
  SECTIONS.forEach((s) => {
    expect(screen.getByRole('link', { name: s.label })).toBeInTheDocument()
  })
})

test('section links point at hash routes so they work from a project page', () => {
  renderNav('/work/pokedex')
  const work = screen.getByRole('link', { name: 'Work' })
  expect(work.getAttribute('href')).toBe('/#work')
})

test('exposes a labelled navigation landmark', () => {
  renderNav()
  expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument()
})
```

- [ ] **Step 8: Run it to confirm it fails**

Run: `npx vitest run src/test/nav.test.jsx`
Expected: FAIL — `Failed to resolve import "../components/Nav.jsx"`.

- [ ] **Step 9: Create `src/components/Nav.module.css`**

The `inset 0 1px 0` highlight is the specular top edge — it is what makes this read as glass rather than as a blurred rectangle.

```css
.wrap {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  padding: 16px var(--gutter);
  transition: padding 400ms var(--ease-out);
}

.wrapScrolled {
  padding-top: 10px;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  max-width: var(--page-max);
  padding: 10px 12px 10px 18px;
  border-radius: var(--radius-pill);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow:
    inset 0 1px 0 var(--glass-highlight),
    0 8px 32px rgba(0, 0, 0, 0.40);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  transition:
    border-color 400ms var(--ease-out),
    max-width 400ms var(--ease-out),
    background-color 400ms var(--ease-out);
}

.barScrolled {
  max-width: calc(var(--page-max) - 80px);
  border-color: var(--glass-border-bright);
  background: rgba(12, 16, 28, 0.72);
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .bar {
    background: rgba(11, 15, 26, 0.94);
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.mark {
  width: 26px;
  height: 26px;
  flex: none;
}

.links {
  display: flex;
  align-items: center;
  gap: 2px;
}

.link {
  position: relative;
  display: block;
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 250ms var(--ease-out);
}

.link:hover {
  color: var(--text);
}

.linkActive {
  color: var(--text);
}

.pill {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-pill);
  background: rgba(110, 168, 255, 0.14);
  border: 1px solid rgba(110, 168, 255, 0.28);
  z-index: -1;
}

.label {
  position: relative;
  z-index: 1;
}

@media (max-width: 720px) {
  .links {
    gap: 0;
  }
  .link {
    padding: 8px 9px;
    font-size: 0.8rem;
  }
  .brand span {
    display: none;
  }
}
```

- [ ] **Step 10: Create `src/components/Nav.jsx`**

Links are always `/#<id>` so a click works identically from the home page and from a project page. `ScrollManager` (Task 11) performs the actual scroll.

```jsx
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useActiveSection } from '../hooks/useActiveSection.js'
import { useScrolled } from '../hooks/useScrolled.js'
import styles from './Nav.module.css'

export const SECTIONS = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
]

const SECTION_IDS = SECTIONS.map((s) => s.id)

export function Nav() {
  const scrolled = useScrolled(40)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const activeSection = useActiveSection(SECTION_IDS)
  const active = isHome ? activeSection : null

  return (
    <div className={`${styles.wrap} ${scrolled ? styles.wrapScrolled : ''}`}>
      <nav
        aria-label="Main"
        className={`${styles.bar} ${scrolled ? styles.barScrolled : ''}`}
      >
        <Link to="/" className={styles.brand}>
          <svg className={styles.mark} viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="16" r="15" fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.55" />
            <text
              x="16"
              y="21"
              textAnchor="middle"
              fill="var(--text)"
              fontFamily="var(--font-display)"
              fontSize="12"
              fontWeight="700"
            >
              JV
            </text>
          </svg>
          <span>Jesus Velazquez</span>
        </Link>

        <ul className={styles.links}>
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <Link
                to={`/#${s.id}`}
                className={`${styles.link} ${active === s.id ? styles.linkActive : ''}`}
                aria-current={active === s.id ? 'true' : undefined}
              >
                {active === s.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className={styles.pill}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className={styles.label}>{s.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
```

- [ ] **Step 11: Create `src/components/SkipLink.module.css`**

```css
.skip {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 200;
  padding: 12px 20px;
  border-radius: 0 0 12px 0;
  background: var(--accent);
  color: var(--void);
  font-weight: 600;
}

.skip:focus {
  left: 0;
}
```

- [ ] **Step 12: Create `src/components/SkipLink.jsx`**

```jsx
import styles from './SkipLink.module.css'

export function SkipLink() {
  return (
    <a href="#main" className={styles.skip}>
      Skip to content
    </a>
  )
}
```

- [ ] **Step 13: Run the nav test to verify it passes**

Run: `npx vitest run src/test/nav.test.jsx`
Expected: PASS — `3 passed`.

- [ ] **Step 14: Commit**

```bash
git add src/lib src/hooks src/components/Nav.jsx src/components/Nav.module.css src/components/SkipLink.jsx src/components/SkipLink.module.css src/test/mostVisible.test.js src/test/nav.test.jsx
git commit -m "feat: add liquid-glass nav with active-section tracking"
```

---

### Task 6: Hero section

**Files:**
- Create: `src/sections/Hero.jsx`, `src/sections/Hero.module.css`
- Test: `src/test/hero.test.jsx`

**Interfaces:**
- Consumes: `profile` (Task 2), `useReducedMotion` (Task 3).
- Produces: `Hero` (named export, `src/sections/Hero.jsx`), no props.

- [ ] **Step 1: Write the failing test**

Create `src/test/hero.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Hero } from '../sections/Hero.jsx'

function renderHero() {
  return render(
    <MemoryRouter>
      <Hero />
    </MemoryRouter>
  )
}

test('shows the name as the page heading', () => {
  renderHero()
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jesus Velazquez')
})

test('primary CTA targets the work section and secondary targets contact', () => {
  renderHero()
  expect(screen.getByRole('link', { name: /view my work/i }).getAttribute('href')).toBe('/#work')
  expect(screen.getByRole('link', { name: /get in touch/i }).getAttribute('href')).toBe('/#contact')
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/test/hero.test.jsx`
Expected: FAIL — `Failed to resolve import "../sections/Hero.jsx"`.

- [ ] **Step 3: Create `src/sections/Hero.module.css`**

```css
.hero {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-block: 140px 100px;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 22px;
}

.name {
  font-size: clamp(2.75rem, 9vw, 5.75rem);
  font-weight: 700;
  margin-bottom: 10px;
}

.word {
  display: inline-block;
}

.tagline {
  font-family: var(--font-display);
  font-size: clamp(1.35rem, 3.6vw, 2.4rem);
  font-weight: 500;
  background: linear-gradient(100deg, var(--text) 10%, var(--accent) 55%, var(--aurora) 95%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 26px;
}

.intro {
  max-width: 46ch;
  color: var(--muted);
  font-size: 1.0625rem;
  margin-bottom: 40px;
}

.ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 26px;
  border-radius: var(--radius-pill);
  font-weight: 600;
  font-size: 0.9375rem;
  transition:
    transform 300ms var(--ease-out),
    box-shadow 300ms var(--ease-out),
    background-color 300ms var(--ease-out);
}

.btn:hover {
  transform: translateY(-2px);
}

.btnPrimary {
  background: var(--accent);
  color: var(--void);
  box-shadow: 0 6px 26px rgba(110, 168, 255, 0.30);
}

.btnPrimary:hover {
  box-shadow: 0 10px 34px rgba(110, 168, 255, 0.45);
}

.btnGhost {
  color: var(--text);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: inset 0 1px 0 var(--glass-highlight);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.btnGhost:hover {
  border-color: var(--glass-border-bright);
}

@media (prefers-reduced-motion: reduce) {
  .btn:hover {
    transform: none;
  }
}
```

- [ ] **Step 4: Create `src/sections/Hero.jsx`**

The name is split into one animated span per word, with a real space text node between them. Do not use `margin-right` for the gap instead — the `<h1>`'s text content would become `"JesusVelazquez"` and the test asserting the heading reads `Jesus Velazquez` would fail.

```jsx
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import profile from '../data/profile.js'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import styles from './Hero.module.css'

const NAME_WORDS = profile.name.split(' ')

export function Hero() {
  const reduced = useReducedMotion()

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.09, delayChildren: reduced ? 0 : 0.15 } },
  }
  const item = reduced
    ? { hidden: {}, show: {} }
    : {
        hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
        show: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        },
      }

  return (
    <section id="hero" className={`${styles.hero} container`}>
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.p variants={item} className={styles.eyebrow}>
          {profile.role}
        </motion.p>

        <h1 className={styles.name}>
          {NAME_WORDS.map((word, i) => (
            <Fragment key={word}>
              <motion.span variants={item} className={styles.word}>
                {word}
              </motion.span>
              {i < NAME_WORDS.length - 1 ? ' ' : null}
            </Fragment>
          ))}
        </h1>

        <motion.p variants={item} className={styles.tagline}>
          {profile.headline}
        </motion.p>

        <motion.p variants={item} className={styles.intro}>
          Backend systems for the Department of Defense by day, co-founder of Waiver Director the
          rest of the time. REST APIs, component libraries, and products people actually use.
        </motion.p>

        <motion.div variants={item} className={styles.ctas}>
          <Link to="/#work" className={`${styles.btn} ${styles.btnPrimary}`}>
            View my work
          </Link>
          <Link to="/#contact" className={`${styles.btn} ${styles.btnGhost}`}>
            Get in touch
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/test/hero.test.jsx`
Expected: PASS — `2 passed`.

- [ ] **Step 6: Commit**

```bash
git add src/sections/Hero.jsx src/sections/Hero.module.css src/test/hero.test.jsx
git commit -m "feat: add hero section with staggered entrance"
```

---

### Task 7: Project cards and the Work section

**Files:**
- Create: `src/components/ProjectImage.jsx`, `src/components/ProjectImage.module.css`
- Create: `src/components/StackChips.jsx`, `src/components/StackChips.module.css`
- Create: `src/sections/ProjectCard.jsx`, `src/sections/ProjectCard.module.css`
- Create: `src/sections/Work.jsx`, `src/sections/Work.module.css`
- Test: `src/test/work.test.jsx`

**Interfaces:**
- Consumes: `projects` (Task 2), `Reveal` (Task 3).
- Produces:
  - `ProjectImage` (named export) — props `{ src, alt, label, className }`. Renders `<img>`; on load error swaps to a labelled gradient placeholder. This is why no binary placeholder files are needed.
  - `StackChips` (named export) — props `{ items }`.
  - `ProjectCard` (named export) — props `{ project, index }`.
  - `Work` (named export) — no props. Renders `<section id="work">`.

- [ ] **Step 1: Write the failing test**

Create `src/test/work.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Work } from '../sections/Work.jsx'
import projects from '../data/projects.js'

function renderWork() {
  return render(
    <MemoryRouter>
      <Work />
    </MemoryRouter>
  )
}

test('renders a card for every project, linking to its detail page', () => {
  renderWork()
  projects.forEach((p) => {
    const link = screen.getByRole('link', { name: new RegExp(p.title, 'i') })
    expect(link.getAttribute('href')).toBe(`/work/${p.slug}`)
  })
})

test('numbers the cards in order', () => {
  renderWork()
  expect(screen.getByText('01')).toBeInTheDocument()
  expect(screen.getByText('02')).toBeInTheDocument()
})

test('renders stack chips for each project', () => {
  renderWork()
  projects[0].stack.forEach((tech) => {
    expect(screen.getAllByText(tech).length).toBeGreaterThan(0)
  })
})

test('the work section carries the id the nav targets', () => {
  const { container } = renderWork()
  expect(container.querySelector('#work')).not.toBeNull()
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/test/work.test.jsx`
Expected: FAIL — `Failed to resolve import "../sections/Work.jsx"`.

- [ ] **Step 3: Create `src/components/ProjectImage.module.css`**

```css
.frame {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  background: var(--surface);
  border: 1px solid var(--glass-border);
}

.img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.fallback {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  min-height: 200px;
  padding: 24px;
  text-align: center;
  background:
    radial-gradient(120% 100% at 20% 0%, rgba(110, 168, 255, 0.22) 0%, transparent 60%),
    radial-gradient(120% 100% at 90% 100%, rgba(183, 123, 255, 0.20) 0%, transparent 60%),
    var(--surface);
}

.fallbackLabel {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}
```

- [ ] **Step 4: Create `src/components/ProjectImage.jsx`**

```jsx
import { useState } from 'react'
import styles from './ProjectImage.module.css'

export function ProjectImage({ src, alt, label, className = '' }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={`${styles.frame} ${className}`}>
      {failed || !src ? (
        <div className={styles.fallback}>
          <span className={styles.fallbackLabel}>{label ?? alt}</span>
        </div>
      ) : (
        <img
          className={styles.img}
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 5: Create `src/components/StackChips.module.css`**

```css
.list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 5px 11px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.04);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.03em;
  color: var(--muted);
  white-space: nowrap;
}
```

- [ ] **Step 6: Create `src/components/StackChips.jsx`**

```jsx
import styles from './StackChips.module.css'

export function StackChips({ items }) {
  return (
    <ul className={styles.list}>
      {items.map((tech) => (
        <li key={tech} className={styles.chip}>
          {tech}
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 7: Create `src/sections/ProjectCard.module.css`**

```css
.card {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1.05fr;
  gap: clamp(24px, 4vw, 48px);
  align-items: center;
  padding: clamp(22px, 3vw, 34px);
  border-radius: var(--radius-card);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: inset 0 1px 0 var(--glass-highlight);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  color: inherit;
  transition:
    transform 450ms var(--ease-out),
    border-color 450ms var(--ease-out),
    box-shadow 450ms var(--ease-out);
}

.card:hover {
  transform: translateY(-6px);
  border-color: rgba(110, 168, 255, 0.38);
  box-shadow:
    inset 0 1px 0 var(--glass-highlight),
    0 22px 60px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(110, 168, 255, 0.12);
}

.card:hover .media {
  transform: scale(1.04);
}

.number {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--accent);
  margin-bottom: 14px;
  display: block;
}

.title {
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  margin-bottom: 10px;
}

.role {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 16px;
}

.tagline {
  color: var(--muted);
  margin-bottom: 22px;
  max-width: 44ch;
}

.mediaWrap {
  overflow: hidden;
  border-radius: 14px;
}

.media {
  aspect-ratio: 16 / 10;
  transition: transform 700ms var(--ease-out);
}

.cta {
  display: inline-block;
  margin-top: 22px;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--accent);
}

@media (max-width: 860px) {
  .card {
    grid-template-columns: 1fr;
  }
  .mediaOrder {
    order: -1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card:hover {
    transform: none;
  }
  .card:hover .media {
    transform: none;
  }
}
```

- [ ] **Step 8: Create `src/sections/ProjectCard.jsx`**

The whole card is one link — a single tab stop and a single unambiguous target, which is better than scattering links inside it.

```jsx
import { Link } from 'react-router-dom'
import { ProjectImage } from '../components/ProjectImage.jsx'
import { StackChips } from '../components/StackChips.jsx'
import styles from './ProjectCard.module.css'

export function ProjectCard({ project, index }) {
  const number = String(index + 1).padStart(2, '0')

  return (
    <Link to={`/work/${project.slug}`} className={styles.card}>
      <div>
        <span className={styles.number}>{number}</span>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.role}>
          {project.role} · {project.year}
        </p>
        <p className={styles.tagline}>{project.tagline}</p>
        <StackChips items={project.stack} />
        <span className={styles.cta}>Read the case study →</span>
      </div>

      <div className={`${styles.mediaWrap} ${styles.mediaOrder}`}>
        <ProjectImage
          src={project.thumb}
          alt={`${project.title} screenshot`}
          label={project.title}
          className={styles.media}
        />
      </div>
    </Link>
  )
}
```

- [ ] **Step 9: Create `src/sections/Work.module.css`**

```css
.section {
  padding-block: var(--section-gap);
  scroll-margin-top: 110px;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 14px;
}

.heading {
  font-size: clamp(2rem, 5vw, 3.1rem);
  margin-bottom: 16px;
}

.lede {
  color: var(--muted);
  max-width: 52ch;
  margin-bottom: 56px;
}

.list {
  display: grid;
  gap: 28px;
}
```

- [ ] **Step 10: Create `src/sections/Work.jsx`**

```jsx
import projects from '../data/projects.js'
import { Reveal } from '../components/Reveal.jsx'
import { ProjectCard } from './ProjectCard.jsx'
import styles from './Work.module.css'

export function Work() {
  return (
    <section id="work" className={`${styles.section} container`}>
      <Reveal>
        <p className={styles.eyebrow}>Work</p>
        <h2 className={styles.heading}>Things I&rsquo;ve built</h2>
        <p className={styles.lede}>
          A shipped commercial product and the project that got me comfortable with React. Each one
          has a write-up covering the problem and what I actually built.
        </p>
      </Reveal>

      <ul className={styles.list}>
        {projects.map((project, i) => (
          <Reveal as="li" key={project.slug} delay={i * 0.06}>
            <ProjectCard project={project} index={i} />
          </Reveal>
        ))}
      </ul>
    </section>
  )
}
```

- [ ] **Step 11: Run the test to verify it passes**

Run: `npx vitest run src/test/work.test.jsx`
Expected: PASS — `4 passed`.

- [ ] **Step 12: Commit**

```bash
git add src/components/ProjectImage.jsx src/components/ProjectImage.module.css src/components/StackChips.jsx src/components/StackChips.module.css src/sections/ProjectCard.jsx src/sections/ProjectCard.module.css src/sections/Work.jsx src/sections/Work.module.css src/test/work.test.jsx
git commit -m "feat: add work section with project cards"
```

---

### Task 8: About section

**Files:**
- Create: `src/sections/About.jsx`, `src/sections/About.module.css`
- Test: `src/test/about.test.jsx`

**Interfaces:**
- Consumes: `profile` (Task 2), `Reveal` (Task 3).
- Produces: `About` (named export, `src/sections/About.jsx`), no props. Renders `<section id="about">`.

The résumé button renders only when `profile.resumeUrl` is truthy. It is `null` until the PDF is added, so the site never ships a link that 404s.

- [ ] **Step 1: Write the failing test**

Create `src/test/about.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { About } from '../sections/About.jsx'
import profile from '../data/profile.js'

test('renders the blurb and every skill group with its items', () => {
  render(<About />)
  expect(screen.getByText(/co-founder of Waiver Director/i)).toBeInTheDocument()
  profile.skills.forEach((group) => {
    expect(screen.getByText(group.group)).toBeInTheDocument()
    group.items.forEach((item) => {
      expect(screen.getAllByText(item).length).toBeGreaterThan(0)
    })
  })
})

test('hides the resume button when no resume is configured', () => {
  render(<About />)
  const button = screen.queryByRole('link', { name: /resume/i })
  if (profile.resumeUrl) {
    expect(button).toBeInTheDocument()
  } else {
    expect(button).toBeNull()
  }
})

test('the about section carries the id the nav targets', () => {
  const { container } = render(<About />)
  expect(container.querySelector('#about')).not.toBeNull()
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/test/about.test.jsx`
Expected: FAIL — `Failed to resolve import "../sections/About.jsx"`.

- [ ] **Step 3: Create `src/sections/About.module.css`**

```css
.section {
  padding-block: var(--section-gap);
  scroll-margin-top: 110px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(32px, 6vw, 72px);
  align-items: start;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 14px;
}

.heading {
  font-size: clamp(2rem, 5vw, 3.1rem);
  margin-bottom: 22px;
}

.blurb {
  color: var(--muted);
  font-size: 1.0625rem;
  max-width: 52ch;
}

.resume {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-top: 30px;
  padding: 13px 24px;
  border-radius: var(--radius-pill);
  color: var(--text);
  font-weight: 600;
  font-size: 0.9rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: inset 0 1px 0 var(--glass-highlight);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: border-color 300ms var(--ease-out);
}

.resume:hover {
  border-color: rgba(110, 168, 255, 0.45);
}

.skills {
  display: grid;
  gap: 26px;
}

.groupName {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 12px;
}

.items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.item {
  padding: 7px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--glass-border);
  font-size: 0.85rem;
  color: var(--text);
}

@media (max-width: 860px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Create `src/sections/About.jsx`**

```jsx
import profile from '../data/profile.js'
import { Reveal } from '../components/Reveal.jsx'
import styles from './About.module.css'

export function About() {
  return (
    <section id="about" className={`${styles.section} container`}>
      <div className={styles.grid}>
        <Reveal>
          <p className={styles.eyebrow}>About</p>
          <h2 className={styles.heading}>Who I am</h2>
          <p className={styles.blurb}>{profile.blurb}</p>
          {profile.resumeUrl && (
            <a
              className={styles.resume}
              href={profile.resumeUrl}
              target="_blank"
              rel="noreferrer"
            >
              View resume ↗
            </a>
          )}
        </Reveal>

        <div className={styles.skills}>
          {profile.skills.map((group, i) => (
            <Reveal key={group.group} delay={i * 0.06}>
              <p className={styles.groupName}>{group.group}</p>
              <ul className={styles.items}>
                {group.items.map((item) => (
                  <li key={item} className={styles.item}>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/test/about.test.jsx`
Expected: PASS — `3 passed`.

- [ ] **Step 6: Commit**

```bash
git add src/sections/About.jsx src/sections/About.module.css src/test/about.test.jsx
git commit -m "feat: add about section with skills grid"
```

---

### Task 9: Experience timeline

**Files:**
- Create: `src/sections/Experience.jsx`, `src/sections/Experience.module.css`
- Test: `src/test/experience.test.jsx`

**Interfaces:**
- Consumes: `experience`, `education` (Task 2), `Reveal` (Task 3), `useReducedMotion` (Task 3).
- Produces: `Experience` (named export, `src/sections/Experience.jsx`), no props. Renders `<section id="experience">`.

- [ ] **Step 1: Write the failing test**

Create `src/test/experience.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { Experience } from '../sections/Experience.jsx'
import experience, { education } from '../data/experience.js'

test('renders every role with its company and bullets', () => {
  render(<Experience />)
  experience.forEach((role) => {
    expect(screen.getByText(role.role)).toBeInTheDocument()
    expect(screen.getAllByText(new RegExp(role.company, 'i')).length).toBeGreaterThan(0)
    role.bullets.forEach((b) => {
      expect(screen.getByText(b)).toBeInTheDocument()
    })
  })
})

test('renders "Present" for a role with no end date', () => {
  render(<Experience />)
  expect(screen.getAllByText(/Present/).length).toBeGreaterThan(0)
})

test('ends the timeline with the education node', () => {
  render(<Experience />)
  expect(screen.getByText(education.school)).toBeInTheDocument()
  expect(screen.getByText(education.degree)).toBeInTheDocument()
})

test('the experience section carries the id the nav targets', () => {
  const { container } = render(<Experience />)
  expect(container.querySelector('#experience')).not.toBeNull()
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/test/experience.test.jsx`
Expected: FAIL — `Failed to resolve import "../sections/Experience.jsx"`.

- [ ] **Step 3: Create `src/sections/Experience.module.css`**

```css
.section {
  padding-block: var(--section-gap);
  scroll-margin-top: 110px;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 14px;
}

.heading {
  font-size: clamp(2rem, 5vw, 3.1rem);
  margin-bottom: 56px;
}

.timeline {
  position: relative;
  padding-left: 34px;
}

.rail {
  position: absolute;
  left: 6px;
  top: 6px;
  bottom: 6px;
  width: 2px;
  background: linear-gradient(180deg, var(--accent), var(--aurora));
  transform-origin: top;
  border-radius: 2px;
  opacity: 0.55;
}

.entry {
  position: relative;
  padding-bottom: 48px;
}

.entry:last-child {
  padding-bottom: 0;
}

.dot {
  position: absolute;
  left: -34px;
  top: 8px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--void);
  border: 2px solid var(--accent);
}

.dotCurrent {
  background: var(--accent);
  box-shadow: 0 0 0 5px rgba(110, 168, 255, 0.16);
}

.dates {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: var(--muted);
  margin-bottom: 8px;
}

.role {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.company {
  color: var(--accent);
  font-size: 0.95rem;
  margin-bottom: 14px;
  display: block;
}

.bullets {
  display: grid;
  gap: 8px;
  max-width: 62ch;
}

.bullet {
  position: relative;
  padding-left: 18px;
  color: var(--muted);
  font-size: 0.9375rem;
}

.bullet::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.65em;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--muted);
}

.eduDetail {
  color: var(--muted);
  font-size: 0.9375rem;
}
```

- [ ] **Step 4: Create `src/sections/Experience.jsx`**

The rail's `scaleY` is driven by scroll progress through the timeline. Under reduced motion it renders fully drawn.

```jsx
import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import experience, { education } from '../data/experience.js'
import { Reveal } from '../components/Reveal.jsx'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import styles from './Experience.module.css'

export function Experience() {
  const timelineRef = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 80%', 'end 60%'],
  })
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.001 })

  return (
    <section id="experience" className={`${styles.section} container`}>
      <Reveal>
        <p className={styles.eyebrow}>Experience</p>
        <h2 className={styles.heading}>Where I&rsquo;ve worked</h2>
      </Reveal>

      <div className={styles.timeline} ref={timelineRef}>
        <motion.div
          className={styles.rail}
          style={reduced ? { scaleY: 1 } : { scaleY }}
        />

        {experience.map((role, i) => (
          <Reveal key={`${role.company}-${role.role}`} delay={i * 0.06}>
            <article className={styles.entry}>
              <span className={`${styles.dot} ${role.end === null ? styles.dotCurrent : ''}`} />
              <p className={styles.dates}>
                {role.start} — {role.end ?? 'Present'}
              </p>
              <h3 className={styles.role}>{role.role}</h3>
              {role.url ? (
                <a className={styles.company} href={role.url} target="_blank" rel="noreferrer">
                  {role.company} ↗
                </a>
              ) : (
                <span className={styles.company}>{role.company}</span>
              )}
              <ul className={styles.bullets}>
                {role.bullets.map((b) => (
                  <li key={b} className={styles.bullet}>
                    {b}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}

        <Reveal delay={experience.length * 0.06}>
          <article className={styles.entry}>
            <span className={styles.dot} />
            <p className={styles.dates}>Graduated {education.graduated}</p>
            <h3 className={styles.role}>{education.degree}</h3>
            <span className={styles.company}>{education.school}</span>
            <p className={styles.eduDetail}>{education.detail}</p>
          </article>
        </Reveal>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/test/experience.test.jsx`
Expected: PASS — `4 passed`.

- [ ] **Step 6: Commit**

```bash
git add src/sections/Experience.jsx src/sections/Experience.module.css src/test/experience.test.jsx
git commit -m "feat: add experience timeline with scroll-drawn rail"
```

---

### Task 10: Contact section

**Files:**
- Create: `src/sections/Contact.jsx`, `src/sections/Contact.module.css`
- Test: `src/test/contact.test.jsx`

**Interfaces:**
- Consumes: `profile` (Task 2), `Reveal` (Task 3).
- Produces: `Contact` (named export, `src/sections/Contact.jsx`), no props. Renders `<section id="contact">` and the page footer.

- [ ] **Step 1: Write the failing test**

Create `src/test/contact.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { Contact } from '../sections/Contact.jsx'
import profile from '../data/profile.js'

test('shows the email address as text', () => {
  render(<Contact />)
  expect(screen.getByText(profile.email)).toBeInTheDocument()
})

test('the go button opens a mail client addressed to the email', () => {
  render(<Contact />)
  const link = screen.getByRole('link', { name: /send an email/i })
  expect(link.getAttribute('href')).toBe(`mailto:${profile.email}`)
})

test('renders every configured social link', () => {
  render(<Contact />)
  profile.socials.forEach((s) => {
    expect(screen.getByRole('link', { name: new RegExp(s.label, 'i') })).toHaveAttribute(
      'href',
      s.url
    )
  })
})

test('the contact section carries the id the nav targets', () => {
  const { container } = render(<Contact />)
  expect(container.querySelector('#contact')).not.toBeNull()
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/test/contact.test.jsx`
Expected: FAIL — `Failed to resolve import "../sections/Contact.jsx"`.

- [ ] **Step 3: Create `src/sections/Contact.module.css`**

```css
.section {
  padding-block: var(--section-gap);
  scroll-margin-top: 110px;
  text-align: center;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 14px;
}

.heading {
  font-size: clamp(2.2rem, 6vw, 3.6rem);
  margin-bottom: 18px;
}

.lede {
  color: var(--muted);
  max-width: 46ch;
  margin: 0 auto 40px;
}

.card {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 16px 16px 26px;
  border-radius: var(--radius-pill);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow:
    inset 0 1px 0 var(--glass-highlight),
    0 8px 32px rgba(0, 0, 0, 0.40);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
}

.email {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--text);
  word-break: break-all;
}

.go {
  padding: 12px 26px;
  border-radius: var(--radius-pill);
  background: var(--accent);
  color: var(--void);
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  transition: box-shadow 300ms var(--ease-out);
}

.go:hover {
  box-shadow: 0 8px 30px rgba(110, 168, 255, 0.45);
}

.socials {
  display: flex;
  justify-content: center;
  gap: 22px;
  margin-top: 40px;
}

.social {
  color: var(--muted);
  font-size: 0.875rem;
  transition: color 250ms var(--ease-out);
}

.social:hover {
  color: var(--text);
}

.footer {
  margin-top: 90px;
  padding-top: 26px;
  border-top: 1px solid var(--glass-border);
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.72rem;
}

@media (max-width: 520px) {
  .card {
    flex-direction: column;
    border-radius: var(--radius-card);
    padding: 22px;
  }
}
```

- [ ] **Step 4: Create `src/sections/Contact.jsx`**

```jsx
import profile from '../data/profile.js'
import { Reveal } from '../components/Reveal.jsx'
import styles from './Contact.module.css'

export function Contact() {
  return (
    <section id="contact" className={`${styles.section} container`}>
      <Reveal>
        <p className={styles.eyebrow}>Contact</p>
        <h2 className={styles.heading}>Let&rsquo;s talk</h2>
        <p className={styles.lede}>
          Open to interesting engineering work and always happy to talk shop. The fastest way to
          reach me is email.
        </p>

        <div className={styles.card}>
          <span className={styles.email}>{profile.email}</span>
          <a className={styles.go} href={`mailto:${profile.email}`}>
            Send an email
          </a>
        </div>

        <div className={styles.socials}>
          {profile.socials.map((s) => (
            <a key={s.label} className={styles.social} href={s.url} target="_blank" rel="noreferrer">
              {s.label} ↗
            </a>
          ))}
        </div>

        <footer className={styles.footer}>
          © {new Date().getFullYear()} {profile.name}
        </footer>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/test/contact.test.jsx`
Expected: PASS — `4 passed`.

- [ ] **Step 6: Commit**

```bash
git add src/sections/Contact.jsx src/sections/Contact.module.css src/test/contact.test.jsx
git commit -m "feat: add contact section with mailto CTA"
```

---

### Task 11: Routing — Home, ProjectPage, NotFound

**Files:**
- Create: `src/pages/Home.jsx`, `src/pages/ProjectPage.jsx`, `src/pages/ProjectPage.module.css`, `src/pages/NotFound.jsx`, `src/pages/NotFound.module.css`
- Create: `src/components/ScrollManager.jsx`
- Modify: `src/App.jsx` (replace the Task 1 placeholder entirely)
- Modify: `src/main.jsx` (wrap in `BrowserRouter`)
- Modify: `src/test/smoke.test.jsx` (replace entirely — `App` now requires a router)
- Test: `src/test/routing.test.jsx`

**Interfaces:**
- Consumes: every section (Tasks 6–10), `Nav`/`SkipLink` (Task 5), `Starfield` (Task 4), `Reveal` (Task 3), `projects`/`getProject` (Task 2).
- Produces: `App` (default export, `src/App.jsx`) — renders routes; must be rendered inside a `BrowserRouter` or `MemoryRouter`.

- [ ] **Step 1: Write the failing test**

Create `src/test/routing.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'
import projects from '../data/projects.js'

function renderAt(route) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  )
}

test('the home route renders every section the nav targets', () => {
  const { container } = renderAt('/')
  ;['work', 'about', 'experience', 'contact'].forEach((id) => {
    expect(container.querySelector(`#${id}`)).not.toBeNull()
  })
})

test.each(projects.map((p) => [p.slug, p.title]))(
  'the route for %s renders its case study',
  async (slug, title) => {
    renderAt(`/work/${slug}`)
    expect(await screen.findByRole('heading', { level: 1, name: title })).toBeInTheDocument()
  }
)

test('a project with a null repoUrl renders without a repo link', async () => {
  const closed = projects.find((p) => p.repoUrl === null)
  expect(closed).toBeDefined()
  renderAt(`/work/${closed.slug}`)
  await screen.findByRole('heading', { level: 1, name: closed.title })
  expect(screen.queryByRole('link', { name: /source|repo|github/i })).toBeNull()
})

test('an unknown project slug renders the not-found page', async () => {
  renderAt('/work/not-a-real-project')
  expect(await screen.findByText(/lost in space/i)).toBeInTheDocument()
})

test('an unknown route renders the not-found page', async () => {
  renderAt('/nope')
  expect(await screen.findByText(/lost in space/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/test/routing.test.jsx`
Expected: FAIL — the home route test fails because `App` still renders only an `<h1>`.

- [ ] **Step 3: Create `src/components/ScrollManager.jsx`**

This is what makes `/#work` work identically from the home page and from a project page. Without it, React Router changes the URL and nothing scrolls.

```jsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useReducedMotion } from '../hooks/useReducedMotion.js'

export function ScrollManager() {
  const { pathname, hash } = useLocation()
  const reduced = useReducedMotion()

  useEffect(() => {
    const behavior = reduced ? 'auto' : 'smooth'

    if (hash) {
      const id = hash.slice(1)
      const target = document.getElementById(id)
      if (target) {
        target.scrollIntoView({ behavior, block: 'start' })
        return
      }
    }

    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash, reduced])

  return null
}
```

- [ ] **Step 4: Create `src/pages/Home.jsx`**

```jsx
import { Hero } from '../sections/Hero.jsx'
import { Work } from '../sections/Work.jsx'
import { About } from '../sections/About.jsx'
import { Experience } from '../sections/Experience.jsx'
import { Contact } from '../sections/Contact.jsx'

export default function Home() {
  return (
    <>
      <Hero />
      <Work />
      <About />
      <Experience />
      <Contact />
    </>
  )
}
```

- [ ] **Step 5: Create `src/pages/NotFound.module.css`**

```css
.wrap {
  min-height: 78vh;
  display: grid;
  place-content: center;
  text-align: center;
  gap: 18px;
  padding-block: 160px 80px;
}

.code {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.16em;
  color: var(--accent);
}

.heading {
  font-size: clamp(2rem, 6vw, 3.4rem);
}

.text {
  color: var(--muted);
  max-width: 42ch;
  margin-inline: auto;
}

.back {
  justify-self: center;
  margin-top: 10px;
  padding: 13px 26px;
  border-radius: var(--radius-pill);
  background: var(--accent);
  color: var(--void);
  font-weight: 600;
  font-size: 0.9rem;
}
```

- [ ] **Step 6: Create `src/pages/NotFound.jsx`**

```jsx
import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

export default function NotFound() {
  return (
    <div className={`${styles.wrap} container`}>
      <p className={styles.code}>404</p>
      <h1 className={styles.heading}>Lost in space</h1>
      <p className={styles.text}>
        That page drifted out of orbit. Everything worth seeing is back on the main page.
      </p>
      <Link to="/" className={styles.back}>
        Back to home
      </Link>
    </div>
  )
}
```

- [ ] **Step 7: Create `src/pages/ProjectPage.module.css`**

```css
.page {
  padding-block: 160px var(--section-gap);
}

.back {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--muted);
  margin-bottom: 34px;
  transition: color 250ms var(--ease-out);
}

.back:hover {
  color: var(--accent);
}

.title {
  font-size: clamp(2.4rem, 7vw, 4.2rem);
  margin-bottom: 12px;
}

.tagline {
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 2.6vw, 1.6rem);
  color: var(--muted);
  max-width: 46ch;
  margin-bottom: 26px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 28px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 26px;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 56px;
}

.linkBtn {
  padding: 12px 24px;
  border-radius: var(--radius-pill);
  font-weight: 600;
  font-size: 0.875rem;
}

.linkPrimary {
  background: var(--accent);
  color: var(--void);
}

.linkGhost {
  color: var(--text);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: inset 0 1px 0 var(--glass-highlight);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.hero {
  aspect-ratio: 16 / 9;
  margin-bottom: 72px;
}

.body {
  display: grid;
  gap: 56px;
  max-width: 68ch;
}

.blockTitle {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 14px;
}

.prose {
  color: var(--muted);
  font-size: 1.0625rem;
}

.highlights {
  display: grid;
  gap: 14px;
}

.highlight {
  position: relative;
  padding-left: 22px;
  color: var(--muted);
}

.highlight::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.62em;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--aurora));
}

.shots {
  display: grid;
  gap: 22px;
  margin-top: 72px;
}

.shot {
  aspect-ratio: 16 / 10;
}

.next {
  margin-top: 90px;
  padding-top: 30px;
  border-top: 1px solid var(--glass-border);
}
```

- [ ] **Step 8: Create `src/pages/ProjectPage.jsx`**

`repoUrl` may be `null` for closed-source commercial work — the link is conditional, which is exactly what the routing test asserts.

```jsx
import { Link, useParams } from 'react-router-dom'
import { getProject } from '../data/projects.js'
import { ProjectImage } from '../components/ProjectImage.jsx'
import { StackChips } from '../components/StackChips.jsx'
import { Reveal } from '../components/Reveal.jsx'
import NotFound from './NotFound.jsx'
import styles from './ProjectPage.module.css'

export default function ProjectPage() {
  const { slug } = useParams()
  const project = getProject(slug)

  if (!project) return <NotFound />

  return (
    <article className={`${styles.page} container`}>
      <Reveal>
        <Link to="/#work" className={styles.back}>
          ← All work
        </Link>
        <h1 className={styles.title}>{project.title}</h1>
        <p className={styles.tagline}>{project.tagline}</p>

        <div className={styles.meta}>
          <span>{project.role}</span>
          <span>{project.year}</span>
        </div>

        <StackChips items={project.stack} />

        <div className={styles.links}>
          {project.liveUrl && (
            <a
              className={`${styles.linkBtn} ${styles.linkPrimary}`}
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
            >
              Visit live site ↗
            </a>
          )}
          {project.repoUrl && (
            <a
              className={`${styles.linkBtn} ${styles.linkGhost}`}
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
            >
              View source ↗
            </a>
          )}
        </div>
      </Reveal>

      <Reveal>
        <ProjectImage
          src={project.screenshots[0]?.src ?? project.thumb}
          alt={project.screenshots[0]?.alt ?? `${project.title} screenshot`}
          label={project.title}
          className={styles.hero}
        />
      </Reveal>

      <div className={styles.body}>
        <Reveal>
          <h2 className={styles.blockTitle}>The problem</h2>
          <p className={styles.prose}>{project.problem}</p>
        </Reveal>

        <Reveal>
          <h2 className={styles.blockTitle}>What I built</h2>
          <p className={styles.prose}>{project.whatIBuilt}</p>
        </Reveal>

        <Reveal>
          <h2 className={styles.blockTitle}>Highlights</h2>
          <ul className={styles.highlights}>
            {project.highlights.map((h) => (
              <li key={h} className={styles.highlight}>
                {h}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {project.screenshots.length > 1 && (
        <div className={styles.shots}>
          {project.screenshots.slice(1).map((shot, i) => (
            <Reveal key={shot.src} delay={i * 0.06}>
              <ProjectImage
                src={shot.src}
                alt={shot.alt}
                label={project.title}
                className={styles.shot}
              />
            </Reveal>
          ))}
        </div>
      )}

      <Reveal className={styles.next}>
        <Link to="/#work" className={styles.back}>
          ← Back to all work
        </Link>
      </Reveal>
    </article>
  )
}
```

- [ ] **Step 9: Replace `src/App.jsx`**

Case-study routes are lazy-loaded so the home page ships less JavaScript. The `Suspense` fallback is `null` because the starfield already fills the screen — a spinner would flash for one frame and look worse than nothing.

```jsx
import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Starfield } from './components/Starfield.jsx'
import { Nav } from './components/Nav.jsx'
import { SkipLink } from './components/SkipLink.jsx'
import { ScrollManager } from './components/ScrollManager.jsx'
import Home from './pages/Home.jsx'

const ProjectPage = lazy(() => import('./pages/ProjectPage.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

export default function App() {
  return (
    <>
      <SkipLink />
      <Starfield />
      <Nav />
      <ScrollManager />
      <main id="main">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work/:slug" element={<ProjectPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </>
  )
}
```

- [ ] **Step 10: Replace `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/tokens.css'
import './styles/global.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

- [ ] **Step 11: Replace `src/test/smoke.test.jsx`**

The Task 1 version renders `App` without a router and now fails. Replace its entire contents:

```jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'

test('renders the name in the hero', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  )
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jesus Velazquez')
})
```

- [ ] **Step 12: Run the full suite**

Run: `npm test`
Expected: PASS — all files green, including `routing.test.jsx` (`6 passed` in that file: 1 home + 2 parameterised slugs + 1 null-repo + 2 not-found).

- [ ] **Step 13: Verify the running site**

Run: `npm run dev`

Check in the browser at `http://localhost:5173`:
- Starfield drifts behind the content; nav is a floating glass pill.
- Clicking Work / About / Experience / Contact scrolls smoothly and the pill slides to the active item.
- Clicking a project card opens `/work/<slug>` at the top of the page.
- Refreshing on `/work/waiver-director` still renders the case study (Vite dev server handles this; Task 13 makes it work on Pages).
- Images show labelled gradient placeholders, not broken-image icons.

Then enable "Reduce motion" in your OS accessibility settings, reload, and confirm all content is visible with no animation.

Stop the server.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: wire up routing with home, project pages, and 404"
```

---

### Task 12: Favicon, asset directories, and README

**Files:**
- Create: `public/favicon.svg`, `public/resume/.gitkeep`, `public/projects/waiver-director/.gitkeep`, `public/projects/pokedex/.gitkeep`
- Create: `README.md`

**Interfaces:**
- Consumes: nothing.
- Produces: `public/favicon.svg` (already referenced by `index.html` from Task 1) and the documented asset drop-in paths.

No binary placeholder images are needed — `ProjectImage` (Task 7) falls back to a labelled gradient whenever a file is missing.

- [ ] **Step 1: Create `public/favicon.svg`**

A JV monogram matching the nav mark. Colors are literal here because SVG files cannot read CSS custom properties from the document.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6EA8FF"/>
      <stop offset="100%" stop-color="#B77BFF"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="#05070D"/>
  <rect x="1" y="1" width="62" height="62" rx="15" fill="none" stroke="url(#g)" stroke-width="2" opacity="0.75"/>
  <text x="32" y="43" text-anchor="middle" font-family="'Space Grotesk', system-ui, sans-serif" font-size="30" font-weight="700" fill="#E8ECF5">JV</text>
</svg>
```

- [ ] **Step 2: Create the asset directories**

Git does not track empty directories, so each needs a `.gitkeep`.

```bash
mkdir -p public/resume public/projects/waiver-director public/projects/pokedex
touch public/resume/.gitkeep public/projects/waiver-director/.gitkeep public/projects/pokedex/.gitkeep
```

- [ ] **Step 3: Create `README.md`**

````markdown
# jesusvelaz.github.io

Personal portfolio — Vite + React, deployed to GitHub Pages.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # Vitest
npm run build    # outputs to dist/
```

## Editing content

All content lives in `src/data/`. You should never need to edit a component to change what the site says.

| File | Holds |
|---|---|
| `src/data/profile.js` | Name, headline, About blurb, email, résumé path, socials, skills |
| `src/data/projects.js` | One object per project — drives both the Work cards and the case-study pages |
| `src/data/experience.js` | One object per job, plus the education node |

### Adding a project

Append an object to the array in `src/data/projects.js`. A route at `/work/<slug>` and a card in the Work section both appear automatically.

```js
{
  slug: 'my-project',          // must be unique, lowercase, hyphens only
  title: 'My Project',
  tagline: 'One sentence.',
  role: 'Solo project',
  year: '2026',
  featured: false,             // featured projects sort first
  stack: ['React', 'Node'],
  liveUrl: 'https://...',      // or null
  repoUrl: 'https://...',      // null hides the "View source" button
  thumb: '/projects/my-project/thumb.jpg',
  problem: '...',
  whatIBuilt: '...',
  highlights: ['...', '...', '...'],
  screenshots: [{ src: '/projects/my-project/01.jpg', alt: 'describe the image' }],
}
```

## Adding images and the résumé

Images are optional — any missing file renders as a labelled gradient placeholder instead of a broken image, so nothing looks broken while you gather assets.

| Drop the file here | What it is | Recommended size |
|---|---|---|
| `public/projects/<slug>/thumb.jpg` | Work-section card image | 1200 × 750 (16:10) |
| `public/projects/<slug>/01.jpg` | Case-study hero image | 1600 × 900 (16:9) |
| `public/projects/<slug>/02.jpg`, `03.jpg` | Additional screenshots | 1600 × 1000 (16:10) |
| `public/resume/jesus-velazquez-resume.pdf` | Résumé | — |
| `public/favicon.svg` | Browser tab icon | replace to change |

Keep the filenames exactly as listed and no code changes are needed.

**The résumé button is hidden until you turn it on.** After adding the PDF, set `resumeUrl` in `src/data/profile.js`:

```js
resumeUrl: '/resume/jesus-velazquez-resume.pdf',
```

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml`: tests, build, deploy to GitHub Pages.

The build copies `index.html` to `404.html`. GitHub Pages serves `404.html` for any unmatched path, which is the SPA shell, so `/work/pokedex` resolves correctly on a direct load or refresh.

Deploying to a project repo instead of the root user site requires one change in `vite.config.js`:

```js
base: '/<repo-name>/',
```
````

- [ ] **Step 4: Verify the build output**

Run: `npm run build`
Expected: build succeeds, and `dist/` contains both `index.html` and `404.html`.

Run: `ls dist`
Expected: output includes `404.html`, `index.html`, `assets`, `favicon.svg`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: add favicon, asset directories, and README"
```

---

### Task 13: GitHub Pages deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: the `test` and `build` scripts from Task 1, and the `copyIndexTo404` plugin from Task 1.
- Produces: an automated deploy on every push to `main`.

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - run: npm test

      - run: npm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Tests run before build, so a broken commit never deploys.

- [ ] **Step 2: Run the full suite one final time**

Run: `npm test`
Expected: PASS — every test file green, zero failures.

- [ ] **Step 3: Verify the production build locally**

Run: `npm run build && npm run preview`
Expected: preview server starts. Visit `http://localhost:4173/work/waiver-director` directly and confirm the case study renders. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: deploy to GitHub Pages on push to main"
```

- [ ] **Step 5: Create the GitHub repository and push**

For the root user site the repository **must** be named `jesusvelaz.github.io`.

```bash
gh repo create jesusvelaz.github.io --public --source=. --remote=origin
git push -u origin main
```

- [ ] **Step 6: Enable Pages**

In the GitHub repository: **Settings → Pages → Build and deployment → Source → GitHub Actions**.

Then confirm the workflow run succeeds under the **Actions** tab, and visit `https://jesusvelaz.github.io`.

Verify on the live site:
- `https://jesusvelaz.github.io/work/waiver-director` loads directly (this is the `404.html` fallback doing its job).
- Refreshing that URL still renders the case study rather than a GitHub 404.

---

## Post-launch checklist for Jesus

These are content items, not code. None block launch, but each one improves the site.

- [ ] Confirm the PokeDex repo URL in `src/data/projects.js` (currently assumed to be `https://github.com/jesusvelaz/PokeDex-App`).
- [ ] Confirm the Waiver Director start date in `src/data/experience.js`.
- [ ] Review the Department of Defense bullets for public release before the site goes live.
- [ ] Add screenshots to `public/projects/<slug>/`.
- [ ] Add the résumé PDF and set `resumeUrl` in `src/data/profile.js`.
- [ ] Read the drafted About blurb and case studies, and rewrite anything that doesn't sound like you.
