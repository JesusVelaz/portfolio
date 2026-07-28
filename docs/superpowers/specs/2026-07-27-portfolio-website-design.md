# Portfolio Website — Design Spec

**Author:** Jesus Velazquez
**Date:** 2026-07-27
**Status:** Approved for planning

---

## 1. Overview

A personal portfolio site for Jesus Velazquez — software engineer. Single scrolling
home page plus a dedicated case-study page per project. Static, deployed to GitHub
Pages. Visual direction is *deep space, restrained*: dark canvas, parallax starfield,
liquid-glass navigation, one accent color, and cinematic scroll reveals.

The site has one job: convince an engineering hiring manager, in under two minutes,
that Jesus ships real software.

---

## 2. Decisions and rationale

| Decision | Choice | Why |
|---|---|---|
| Theme | Deep space, restrained | Liquid glass reads best on dark. Discipline lives in typography and spacing, so it stays professional rather than costume-y. |
| Stack | Vite + React + React Router | Fully static, free hosting, real routes for case studies, manageable animation orchestration. |
| Project pages | Light case study (~250–400 words) | Enough to show engineering judgment without becoming a writing project that never ships. |
| Motion | Cinematic reveals | Alive and intentional, never fights the user's scroll. No scroll-jacking. |
| Projects layout | Vertical list | Two projects in a carousel looks empty and hides half the work behind an arrow. A list scales to six. |
| Contact | `mailto:` only | Static sites need a third-party service for forms; a form that silently fails is worse than no form. |
| Styling | CSS Modules + token file | Tailwind is more config than it saves at this size. |
| Deploy target | Root user site, `base: '/'` | Matches local dev, keeps Vite config trivial. One-line change for a project repo. |

### Resolved ambiguity

The original brief used "experience" for both projects and jobs. Since the navigation
has both **Work** and **Experience**, these are split:

- **Work** — projects (Waiver Director, PokeDex)
- **Experience** — employment timeline, terminating in education

The hero's primary CTA targets **Work**.

---

## 3. Information architecture

```
/                          Hero → Work → About → Experience → Contact
/work/waiver-director      case study
/work/pokedex              case study
```

Navigation: logo + "Jesus Velazquez" on the left; Work / About / Experience / Contact
on the right. On a case-study page the section links route back to `/#<section>`.

**Section order rationale:** Work comes before About because the projects are the
strongest asset. A visitor who reads only one section should read that one.

---

## 4. Content model

All content lives in plain data modules. Components never hardcode content.
Adding a project or a job means editing one file, never a component.

### `src/data/projects.js`

```js
{
  slug:        'waiver-director',      // → /work/waiver-director
  title:       'Waiver Director',
  tagline:     string,                 // one line, shown on card and page hero
  role:        string,                 // 'Co-founder & Software Engineer'
  year:        string,                 // '2024 — Present'
  featured:    boolean,                // controls ordering; featured first
  stack:       string[],               // rendered as mono chips
  liveUrl:     string | null,
  repoUrl:     string | null,          // null for closed-source commercial work
  thumb:       string,                 // card image path
  problem:     string,                 // case study: what problem existed
  whatIBuilt:  string,                 // case study: scope of contribution
  highlights:  string[],               // 3–5 bullets of engineering substance
  screenshots: [{ src: string, alt: string }]
}
```

`repoUrl: null` must render cleanly — Waiver Director is commercial and likely
closed-source. The card and case-study page both conditionally render the repo link.

**Ordering:** `featured` first, then array order. Waiver Director is `01`, PokeDex `02`.

### `src/data/experience.js`

```js
{
  company:  string,
  url:      string | null,
  role:     string,
  start:    string,          // 'Sep 2024'
  end:      string | null,   // null → renders 'Present'
  bullets:  string[]
}
```

Timeline entries, most recent first:

1. **Software Engineer** — Department of Defense — Sep 2024 – Present
   - Develops and maintains a shared software library of reusable components
   - Engineers REST APIs and tests endpoints
   - Modifies and optimizes backend functionality
2. **Co-founder & Software Engineer** — Waiver Director — 2024 – Present
   - Bullets drafted during implementation from the case study; start date to be confirmed
3. **Junior Web Developer** — Fidelity Transport & Logistics — Oct 2023 – Jun 2024
   - Built and maintained company websites in HTML, CSS, and JavaScript
   - Debugged and troubleshot site issues, improving performance
   - Contributed ideas in project planning meetings

The timeline terminates in a distinct **education** node: Florida International
University, B.A. Computer Science, May 2023 — 3.66 GPA, Dean's List 2019–2023.
Rendering education as the timeline's endpoint is deliberate — the eye travels from
current work backward to its origin.

### `src/data/profile.js`

Name, headline, about blurb, email, résumé path, social links, and grouped skills:

- **Languages** — Java, Python, C, JavaScript, SQL, HTML, CSS
- **Backend & Data** — REST APIs, MySQL, PostgreSQL
- **Frontend** — React, responsive UI
- **Tools** — Git, GitHub, VS Code, IntelliJ

**Recommendation:** the résumé's IDE list (PyCharm, NetBeans) is dropped. Enumerating
IDEs reads junior; the work history already establishes tooling fluency.

---

## 5. Components

Each has one responsibility and is testable in isolation.

| Component | Responsibility |
|---|---|
| `Nav` | Glass bar. Tints and tightens past the hero, tracks active section, slides an indicator pill. |
| `Hero` | Headline with word-stagger entrance, two CTAs (Work, Contact). |
| `Work` | Section wrapper; maps `projects` → `ProjectCard`. |
| `ProjectCard` | One project. Number, title, tagline, stack chips, image with internal parallax. Links to `/work/:slug`. |
| `About` | Blurb, grouped skills, résumé button. |
| `Experience` | Timeline; line draws down on scroll. Renders `ExperienceItem` + education node. |
| `Contact` | Email display + `mailto:` CTA. |
| `ProjectPage` | Single template rendered from a project object. 404s on unknown slug. |
| `Starfield` | Fixed background canvas: three parallax layers + drifting aurora blobs. |
| `Reveal` | Reusable scroll-in wrapper. Owns reduced-motion handling. |
| `NotFound` | Unknown route. |

**Isolation note:** `Reveal` is the single place scroll animation is implemented.
Sections never call IntersectionObserver directly. This is what makes the
reduced-motion guarantee enforceable rather than aspirational.

---

## 6. Visual system

### Tokens (`src/styles/tokens.css`)

| Token | Value | Use |
|---|---|---|
| `--void` | `#05070D` | Page base. Blue-black, never pure black. |
| `--surface` | `#0B0F1A` | Raised panels. |
| `--text` | `#E8ECF5` | Body. Soft white avoids glare on dark. |
| `--muted` | `#8B94A8` | Secondary text, metadata. |
| `--accent` | `#6EA8FF` | Links, focus rings, active nav pill, primary CTA. |
| `--aurora` | `#B77BFF` | Gradients only. Never a solid fill. |

Restraint rule: exactly one accent on interactive elements. The aurora provides all
other color, and only through gradients.

### Typography

- **Space Grotesk** — display and headings. Geometric with enough character to avoid reading as a template.
- **Inter** — body. Chosen for legibility at 16px.
- **JetBrains Mono** — eyebrow labels, stack chips, timeline dates, card numbering (`01 / 02`).

The mono details are what make the site read *engineer* rather than *designer*.

### Liquid glass

A floating pill inset from the top of the viewport — not an edge-to-edge bar.

```css
backdrop-filter: blur(20px) saturate(180%);
background: rgba(12, 16, 28, .55);
border: 1px solid rgba(255, 255, 255, .10);
box-shadow: inset 0 1px 0 rgba(255, 255, 255, .14),
            0 8px 32px rgba(0, 0, 0, .40);
border-radius: 999px;
```

The inset top-edge highlight is the effect's core — it produces a specular edge, which
is the difference between "glass" and "blurry rectangle." Past the hero the pill
tightens slightly and the border brightens.

**Fallback:** browsers without `backdrop-filter` get an opaque `--surface` background
at higher alpha, via `@supports not (backdrop-filter: blur(1px))`.

---

## 7. Motion system

Base reveal, used by every section:

```
opacity   0 → 1
translateY 24px → 0
blur      6px → 0
duration  600ms
easing    cubic-bezier(.16, 1, .3, 1)
stagger   60ms between list children
```

Fires **once**. Re-animating on scroll-up is the tell of a cheap portfolio.

| Element | Motion |
|---|---|
| Hero headline | Word-by-word stagger on load |
| Nav | Tint and tighten past hero; indicator pill slides via `layoutId` |
| Project card | Lift + border glow on hover; screenshot scales gently inside its clipped frame |
| Timeline | Vertical line draws downward on scroll |
| Starfield | Three layers at fractional scroll speed; aurora drifts slowly |

### Reduced motion

`prefers-reduced-motion: reduce` is handled inside `Reveal` and `Starfield`:

- Transforms and blurs resolve instantly; content is visible, never hidden
- Starfield renders one static frame
- All parallax disabled

### Performance

- Starfield pauses rendering when the tab is hidden (`visibilitychange`)
- Star density scales to viewport area
- Animation restricted to `opacity`, `transform`, and `filter`
- Case-study routes are lazy-loaded via `React.lazy`

---

## 8. Accessibility

- Semantic landmarks: `header`, `nav`, `main`, `section`, `footer`
- Visible focus ring in `--accent` on every interactive element
- Skip-to-content link as the first focusable element
- All images carry meaningful `alt`; the starfield canvas is `aria-hidden`
- Nav links are real anchors — keyboard and middle-click work
- Text meets WCAG AA against `--void` (`--text` and `--muted` both verified)
- Reduced motion never hides content

---

## 9. Build and deployment

- **Vite + React**, `base: '/'`
- **GitHub Actions** on push to `main`: build, then deploy to Pages
- **SPA routing fix:** the build copies `index.html` → `404.html`. GitHub Pages serves
  `404.html` for unmatched paths; that file is the SPA shell, so the router resolves
  `/work/pokedex` correctly on direct load and refresh. Clean URLs, no hash router.
- Deploying to a project repo instead requires changing `base` to `'/<repo-name>/'` —
  a one-line change.

---

## 10. Asset conventions

Fixed paths so files can be dropped in later without touching code:

```
public/
  favicon.svg
  resume/jesus-velazquez-resume.pdf
  projects/waiver-director/{thumb,01,02,03}.jpg
  projects/pokedex/{thumb,01,02}.jpg
```

No placeholder binaries are committed. A `ProjectImage` component renders the image and,
on load error, swaps to a labeled gradient placeholder — so a missing screenshot renders
as an intentional-looking panel rather than a broken-image icon. Dropping the real file
at the documented path is the entire update process; no code changes.

The résumé button is rendered only when `profile.resumeUrl` is non-null. It ships as
`null`, so the site never contains a link that 404s. Adding the PDF and setting that one
value turns the button on.

The README documents each path and its target dimensions.

---

## 11. Content status

**Drafted during implementation** (Jesus edits): about blurb, both case studies,
Fidelity Transport role copy, all UI copy.

**Supplied:** DoD role bullets, Fidelity Transport role, education, skills.

**Pending from Jesus** — none of these block local development:

1. PokeDex repo URL. Implementation assumes `https://github.com/jesusvelaz/PokeDex-App`
   and that the app consumes PokeAPI. Both are marked for verification.
2. Waiver Director start date for the timeline entry.
3. Screenshots, résumé PDF, favicon.
4. Public-release review of the DoD role bullets before deployment.

---

## 12. Testing

Vitest + Testing Library, covering logic rather than markup:

- Every slug in `projects.js` resolves to a rendering `ProjectPage`
- An unknown slug renders `NotFound`
- A project with `repoUrl: null` renders without a repo link and without error
- `Reveal` reaches its visible state when `prefers-reduced-motion: reduce` is set
- Nav marks the correct section active for a given scroll position

Snapshot tests of markup are explicitly excluded — they break on every restyle and
catch nothing.

---

## 13. Out of scope (YAGNI)

Deliberately excluded: CMS or headless backend, blog, contact form or form backend,
analytics, dark/light theme toggle (the site is dark by design), i18n,
comments, and a project filter or search (two projects need neither).
