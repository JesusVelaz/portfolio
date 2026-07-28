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

All content lives in `src/data/`. You should never need to edit a component to change what
the site says.

| File | Holds |
|---|---|
| `src/data/profile.js` | Name, headline, About blurb, email, résumé path, socials, skills |
| `src/data/projects.js` | One object per project — drives both the Work cards and the case-study pages |
| `src/data/experience.js` | One object per job, plus the education node |

### Adding a project

Append an object to the array in `src/data/projects.js`. A route at `/work/<slug>` and a card
in the Work section both appear automatically.

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

Images are optional. Any missing file renders as a labelled gradient placeholder instead of a
broken image, so nothing looks broken while you gather assets.

| Drop the file here | What it is | Recommended size |
|---|---|---|
| `public/projects/<slug>/thumb.jpg` | Work-section card image | 1200 × 750 (16:10) |
| `public/projects/<slug>/01.jpg` | Case-study hero image | 1600 × 900 (16:9) |
| `public/projects/<slug>/02.jpg`, `03.jpg` | Additional screenshots | 1600 × 1000 (16:10) |
| `public/resume/jesus-velazquez-resume.pdf` | Résumé | — |
| `public/favicon.svg` | Browser tab icon | replace to change |

Keep the filenames exactly as listed and no code changes are needed.

**The résumé button is hidden until you turn it on.** After adding the PDF, set `resumeUrl` in
`src/data/profile.js`:

```js
resumeUrl: '/resume/jesus-velazquez-resume.pdf',
```

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml`: tests, build, deploy to GitHub Pages.

The build copies `index.html` to `404.html`. GitHub Pages serves `404.html` for any unmatched
path, which is the SPA shell, so `/work/pokedex` resolves correctly on a direct load or refresh.

Deploying to a project repo instead of the root user site requires one change in
`vite.config.js`:

```js
base: '/<repo-name>/',
```

## Design notes

- **Tokens are the only source of color.** They live in `src/styles/tokens.css`. No component
  CSS hardcodes a hex value.
- **`Reveal` is the only scroll-animation implementation.** It also owns
  `prefers-reduced-motion` handling, which is what makes the reduced-motion guarantee
  enforceable instead of aspirational. Don't add `IntersectionObserver` animation elsewhere.
- The design spec and implementation plan are in `docs/superpowers/`.
