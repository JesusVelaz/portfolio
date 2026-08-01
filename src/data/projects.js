const projects = [
  {
    slug: 'waiver-director',
    title: 'Waiver Director',
    tagline: 'Digital waiver management that captures every participant, not just the booker.',
    role: 'Co-founder & Software Engineer',
    year: 'March 2026 — Present',
    featured: true,
    stack: ['SvelteKit', 'Svelte', 'TypeScript', 'Convex', 'Resend'],
    liveUrl: 'https://www.waiverdirector.com/',
    repoUrl: null,
    thumb: '/projects/waiver-director/05-marketing-site.png',
    problem:
      'Adventure operators — zipline tours, axe throwing, escape rooms, kayak rentals — collect a ' +
      'signed waiver from every participant, but only capture contact details for the person who ' +
      'made the booking. Everyone else signs, walks away, and is never reachable again. Operators ' +
      'lose most of their customer list at the exact moment engagement is highest.',
    whatIBuilt:
      'Waiver Director is a multi-tenant SaaS that captures a verified email from every signer, ' +
      'keeps each operator’s records sealed off from every other tenant, and automates individual ' +
      'follow-up for reviews and repeat bookings. I co-founded it and build its full-stack ' +
      'features — the SvelteKit front end, the Convex data layer, and the authorization that ' +
      'holds the tenant boundary.',
    highlights: [
      'Multi-tenant architecture enforcing workspace-level data isolation and server-side authorization, so one operator’s signed records are never reachable from another tenant’s session.',
      'Automated email follow-up built end to end: a rich-text editor, reusable templates with dynamic content, scheduled Convex jobs, and delivery through Resend.',
      'Follow-up is addressed to every individual signer rather than the booking lead, which is the entire reason the product exists.',
      'Built on SvelteKit and Convex, which keeps authorization checks next to the data layer instead of scattered across API handlers.',
    ],
    productHeadline: 'One connected workflow, from signature to follow-up.',
    gallerySections: [
      {
        id: 'overview',
        eyebrow: '01 / Product overview',
        title: 'See the entire day before it happens.',
        description:
          'Start with the operating picture: who has signed, what is pending, and which customer messages are already queued.',
      },
      {
        id: 'capture',
        eyebrow: '02 / Capture',
        title: 'Build the workflow once.',
        description:
          'Create the exact waiver experience the business needs, then connect it to the systems already driving bookings and marketing.',
      },
      {
        id: 'follow-ups',
        eyebrow: '03 / Automated follow-ups',
        title: 'Write it. Improve it. Send it.',
        description:
          'One continuous outbound workflow takes a message from first draft through AI review and into a fully auditable delivery queue.',
      },
      {
        id: 'measure',
        eyebrow: '04 / Measure',
        title: 'Know what is working.',
        description:
          'Close the loop with performance trends, customer growth, and delivery health across the workspace.',
      },
    ],
    screenshots: [
      {
        group: 'overview',
        src: '/projects/waiver-director/05-marketing-site.png',
        width: 2391,
        height: 1906,
        alt: 'Waiver Director marketing website showing a live participant session dashboard',
        title: 'Workspace Dashboard',
        caption:
          'See bookings, submissions, customer growth, and the next scheduled follow-ups in one daily operating view.',
      },
      {
        group: 'capture',
        src: '/projects/waiver-director/03-waiver-builder.png',
        width: 3475,
        height: 1900,
        alt: 'Waiver Director editor for creating a digital waiver with custom fields and signer details',
        title: 'Waiver Builder',
        caption:
          'Build custom signing forms from typed fields, then publish versioned waivers that preserve exactly what each customer signed.',
      },
      {
        group: 'capture',
        src: '/projects/waiver-director/02-integrations.png',
        width: 2179,
        height: 1123,
        alt: 'Waiver Director integrations settings for booking and email platforms',
        title: 'Integrations Settings',
        caption:
          'Connect booking and marketing tools, monitor sync health, and review webhook activity from one workspace-scoped hub.',
      },
      {
        group: 'follow-ups',
        src: '/projects/waiver-director/04-email-creator.png',
        width: 2094,
        height: 1750,
        alt: 'Follow-up email editor with scheduling, variables, templates, and AI review tools',
        title: 'Follow-Up Email Editor',
        caption:
          'Compose reusable follow-ups with rich text, merge variables, and precise send delays after a waiver is signed.',
      },
      {
        group: 'follow-ups',
        src: '/projects/waiver-director/06-ai-review.png',
        width: 1942,
        height: 1609,
        alt: 'AI email review comparing the original message with suggested improvements',
        title: 'AI Email Review',
        caption:
          'Score templates for clarity, tone, personalization, calls to action, and deliverability, then apply an improved draft in one click.',
      },
      {
        group: 'follow-ups',
        src: '/projects/waiver-director/07-follow-up-queue.png',
        width: 2305,
        height: 1299,
        alt: 'Follow-up email queue showing scheduled, sent, failed, and unscheduled messages',
        title: 'Follow-Up Queue',
        caption:
          'Audit every queued, sent, blocked, or failed message with recipient details, timing, search, and clear recovery context.',
      },
      {
        group: 'measure',
        src: '/projects/waiver-director/01-analytics-dashboard.png',
        width: 2170,
        height: 1897,
        alt: 'Waiver Director analytics dashboard showing bookings, submissions, follow-ups, customers, and recent activity',
        title: 'Analytics Dashboard',
        caption:
          'Track submissions, bookings, customer growth, and email delivery trends over time with period-over-period comparisons.',
      },
    ],
  },
  {
    slug: 'pokedex',
    title: 'PokeDex App',
    tagline: 'A Pokémon field companion for daily discovery, deep research, and team building.',
    role: 'Solo project',
    year: '2023',
    featured: false,
    stack: ['React', 'JavaScript', 'PokéAPI', 'CSS'],
    liveUrl: 'https://jesusvelaz.github.io/PokeDex-App/',
    repoUrl: 'https://github.com/JesusVelaz/PokeDex-App',
    thumb: '/projects/pokedex/01-trainer-field-desk.png',
    problem:
      'Turning 1,351 species into a responsive field guide means coordinating data spread across ' +
      'multiple PokéAPI resources while keeping search, filtering, favorites, and team state fast.',
    whatIBuilt:
      'A React single-page app with a state-aware trainer dashboard, a searchable and paginated ' +
      'Pokédex, inline species details, favorites, and a persistent multi-team roster builder.',
    highlights: [
      'A daily “Who’s That Pokémon?” challenge, live research checklist, trainer report, and randomized nearby sightings turn app state into a playable dashboard.',
      'Debounced search, type filtering, favorites, and pagination make all 1,351 species manageable, with rich details opening inline.',
      'Multiple six-Pokémon rosters support inline renaming, slot controls, shiny variants, and localStorage persistence across reloads.',
    ],
    productHeadline: 'A complete trainer workflow, from first sighting to saved roster.',
    gallerySections: [
      {
        id: 'field-desk',
        eyebrow: '01 / Field desk',
        title: 'Begin with something new to discover.',
        description:
          'Framed as Professor Oak’s terminal, the home screen turns real app state into a daily research briefing.',
      },
      {
        id: 'pokedex',
        eyebrow: '02 / Pokédex',
        title: 'Every species in one searchable guide.',
        description:
          'A paginated browser keeps all 1,351 species fast to search, filter, favorite, and inspect.',
      },
      {
        id: 'teams',
        eyebrow: '03 / Team builder',
        title: 'Turn favorites into a complete lineup.',
        description:
          'Build and persist multiple named rosters, each with six configurable Pokémon slots.',
      },
    ],
    screenshots: [
      {
        group: 'field-desk',
        src: '/projects/pokedex/01-trainer-field-desk.png',
        width: 1900,
        height: 909,
        alt: 'Pokédex Trainer Field Desk with a mystery Pokémon challenge, research objectives, trainer report, and nearby sightings',
        title: 'Trainer Field Desk',
        caption:
          'Guess the daily silhouette with free text, follow a three-step research checklist, review indexed species and roster totals, and scan randomized nearby sightings.',
      },
      {
        group: 'pokedex',
        src: '/projects/pokedex/02-pokedex-browser.png',
        width: 1903,
        height: 909,
        alt: 'Searchable Pokédex browser with Pokémon cards and a detailed Dragonite entry showing abilities and base stats',
        title: 'Searchable Pokédex',
        caption:
          'Debounced search and type filters refine the grid. Each inline entry includes artwork, typing, a shiny toggle, playable cry, dimensions, abilities, and animated base-stat totals.',
      },
      {
        group: 'teams',
        src: '/projects/pokedex/03-team-builder.png',
        width: 1897,
        height: 909,
        alt: 'Pokémon team builder showing three named teams with six available slots each',
        title: 'Pokémon Team Builder',
        caption:
          'Rename teams inline, add or remove Pokémon, switch individual slots to shiny variants, and delete rosters. Teams and favorites persist through reloads with localStorage.',
      },
    ],
  },
]

export function getProject(slug) {
  return projects.find((p) => p.slug === slug)
}

export default projects
