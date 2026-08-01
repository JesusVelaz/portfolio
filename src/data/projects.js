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
    story: {
      eyebrow: 'From required paperwork to repeat business',
      headline: 'Every signature starts a customer relationship.',
      summary:
        'Waiver Director turns a routine waiver into a connected customer journey — capturing every participant, automating the right follow-up, and giving operators a clear view of what happens next.',
      pillars: [
        {
          number: '01',
          title: 'Capture the whole audience',
          text: 'Build a direct, permissioned customer list from every participant who signs — not only the person who booked.',
        },
        {
          number: '02',
          title: 'Follow up while it matters',
          text: 'Turn completed experiences into timely thank-yous, feedback requests, reviews, and reasons to return.',
        },
        {
          number: '03',
          title: 'Run it with confidence',
          text: 'Keep waiver history, workspace data, integrations, and outbound email activity visible and under control.',
        },
      ],
    },
    gallerySections: [
      {
        id: 'overview',
        eyebrow: '01 / Product overview',
        title: 'See the entire day before it happens.',
        description:
          'Start with the operating picture: who has signed, what is pending, and which customer messages are already queued.',
        layout: 'featured',
      },
      {
        id: 'capture',
        eyebrow: '02 / Capture',
        title: 'Build the workflow once.',
        description:
          'Create the exact waiver experience the business needs, then connect it to the systems already driving bookings and marketing.',
        layout: 'pair',
      },
      {
        id: 'follow-ups',
        eyebrow: '03 / Automated follow-ups',
        title: 'Write it. Improve it. Send it.',
        description:
          'One continuous outbound workflow takes a message from first draft through AI review and into a fully auditable delivery queue.',
        layout: 'sequence',
      },
      {
        id: 'measure',
        eyebrow: '04 / Measure',
        title: 'Know what is working.',
        description:
          'Close the loop with performance trends, customer growth, and delivery health across the workspace.',
        layout: 'finale',
      },
    ],
    screenshots: [
      {
        group: 'overview',
        src: '/projects/waiver-director/05-marketing-site.png',
        alt: 'Waiver Director marketing website showing a live participant session dashboard',
        title: 'Workspace Dashboard',
        caption:
          'The daily operating view: KPI tiles for bookings, submissions, follow-ups sent, and new customers, each with a sparkline trend and comparison against the prior period. Below the KPIs, a live email pipeline breakdown and a feed of the next queued follow-ups show exactly what is about to go out.',
      },
      {
        group: 'capture',
        src: '/projects/waiver-director/03-waiver-builder.png',
        alt: 'Waiver Director editor for creating a digital waiver with custom fields and signer details',
        title: 'Waiver Builder',
        caption:
          'A drag-and-build waiver editor where businesses compose their own signing form from typed fields — text, checkbox, select, and date — each configurable as required or optional. Waivers are versioned on publish, so historical submissions always render against the exact terms the customer actually signed.',
      },
      {
        group: 'capture',
        src: '/projects/waiver-director/02-integrations.png',
        alt: 'Waiver Director integrations settings for booking and email platforms',
        title: 'Integrations Settings',
        caption:
          'A connection hub for linking the platform to external booking and marketing systems such as Bookeo and Mailchimp. It handles the full lifecycle — OAuth or API-key connection, live sync status, webhook event history, and safe disconnect — with encrypted credential storage and per-workspace scoping.',
      },
      {
        group: 'follow-ups',
        src: '/projects/waiver-director/04-email-creator.png',
        alt: 'Follow-up email editor with scheduling, variables, templates, and AI review tools',
        title: 'Follow-Up Email Editor',
        caption:
          'A composer for post-visit follow-up emails with a subject, rich body, and merge variables, plus a delay control that schedules sending a set number of minutes, hours, or days after a waiver is signed. Templates can be saved and reused across the workspace.',
      },
      {
        group: 'follow-ups',
        src: '/projects/waiver-director/06-ai-review.png',
        alt: 'AI email review comparing the original message with suggested improvements',
        title: 'AI Email Review',
        caption:
          'A Gemini-powered reviewer that scores any email template from 0–100 across a seven-part rubric: clarity, tone, personalization, usefulness, variable usage, CTA strength, and deliverability. It returns concrete issues, suggestions, and a rewritten subject and body the user can accept in one click, gated by workspace-owner permissions and per-workspace rate limiting.',
      },
      {
        group: 'follow-ups',
        src: '/projects/waiver-director/07-follow-up-queue.png',
        alt: 'Follow-up email queue showing scheduled, sent, failed, and unscheduled messages',
        title: 'Follow-Up Queue',
        caption:
          'An operations queue showing every scheduled follow-up and its state: queued, sent, unscheduled, blocked, or failed. Each row carries the recipient, send time, and failure reason when applicable, with search across the queue — giving businesses a single place to audit and recover their outbound email.',
      },
      {
        group: 'measure',
        src: '/projects/waiver-director/01-analytics-dashboard.png',
        alt: 'Waiver Director analytics dashboard showing bookings, submissions, follow-ups, customers, and recent activity',
        title: 'Analytics Dashboard',
        caption:
          'A time-series analytics view that tracks waiver submissions, bookings, and customer activity over a selectable date range, with period-over-period comparisons on every metric. New vs. returning customers are broken out in a stacked chart, and email performance is split across sent, queued, failed, and blocked states so operators can spot delivery problems at a glance.',
      },
    ],
  },
  {
    slug: 'pokedex',
    title: 'PokeDex App',
    tagline: 'A searchable Pokédex built on the PokéAPI.',
    role: 'Solo project',
    year: '2023',
    featured: false,
    stack: ['React', 'JavaScript', 'PokéAPI', 'CSS'],
    liveUrl: 'https://jesusvelaz.github.io/PokeDex-App/',
    repoUrl: 'https://github.com/JesusVelaz/PokeDex-App',
    thumb: '/projects/pokedex/thumb.jpg',
    problem:
      'The PokéAPI spreads a single Pokémon across several endpoints — sprite, types, and base ' +
      'stats each live at a different resource. Rendering a browsable list means composing many ' +
      'requests into one view without stalling the interface.',
    // TODO(Jesus): these are the claims I could verify from the live site and the public repo.
    // Replace them with the specifics of what you actually did — an interviewer will ask.
    whatIBuilt:
      'A React single-page app that fetches from the PokéAPI, composes each Pokémon’s details ' +
      'from multiple resources, and renders them as a searchable grid of cards.',
    highlights: [
      'Composes each Pokémon’s card from several PokéAPI resources, since sprite, type, and base-stat data are returned by different endpoints.',
      'Search filters the already-loaded set on the client, so typing doesn’t fire a request per keystroke.',
      'The first React app I shipped end to end, from scaffold through a deployed GitHub Pages build.',
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
