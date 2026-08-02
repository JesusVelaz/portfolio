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
| `src/data/experience.js` | One object per job |

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
  stack: ['React', 'Node'],
  liveUrl: 'https://...',      // or null
  thumb: '/projects/my-project/thumb.jpg',
  productHeadline: 'A short introduction to the product walkthrough.',
  gallerySections: [
    {
      id: 'overview',
      eyebrow: '01 / Overview',
      title: 'What this part of the product does.',
      description: 'Why it matters to the person using it.',
    },
  ],
  screenshots: [
    {
      group: 'overview',
      src: '/projects/my-project/01.jpg',
      width: 1600,
      height: 900,
      alt: 'Describe the image',
      title: 'Screenshot title',
      caption: 'Explain what the screenshot demonstrates.',
    },
  ],
}
```

## Adding images and the résumé

Images are optional. Any missing file renders as a labelled gradient placeholder instead of a
broken image, so nothing looks broken while you gather assets.

| Drop the file here | What it is | Recommended size |
|---|---|---|
| `public/projects/<slug>/thumb.jpg` | Work-section card image | 1200 × 750 (16:10) |
| `public/projects/<slug>/01.jpg` | Case-study gallery image | 1600 × 900 (16:9) |
| `public/projects/<slug>/02.jpg`, `03.jpg` | Additional gallery images | 1600 × 1000 (16:10) |
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

GitHub Pages has no server, so client-side routes need static files to land on. The build
(`emitStaticRoutes` in `vite.config.js`) emits two things:

- `404.html` — a copy of the SPA shell. Pages serves it for any unmatched path, so the router
  can still resolve the URL. It is served with a **404 status**, which is right for a genuinely
  unknown URL and wrong for a real page.
- `work/<slug>/index.html` — one per project, also a copy of the shell. These return **200**,
  so a shared project link previews correctly and is not treated as missing by crawlers.

Adding a project to `src/data/projects.js` generates its static route automatically. Nothing
else to do.

### Custom domain

The site serves from **jesusvelazquez.dev**. `public/CNAME` carries the domain into `dist/`,
which is how GitHub Pages learns about it — deleting that file reverts the site to the
`github.io` URL on the next deploy.

DNS at your registrar needs to point at GitHub Pages:

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `<username>.github.io.` |

Then in **Settings → Pages → Custom domain**, enter the domain and tick **Enforce HTTPS**
once the certificate finishes provisioning (usually minutes, occasionally up to a day).

Because `base` is `'/'`, a custom domain needs no build changes. Serving from a project repo
subpath instead would require one edit in `vite.config.js`:

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
