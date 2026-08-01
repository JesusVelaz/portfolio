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
    screenshots: [
      {
        src: '/projects/waiver-director/01-analytics-dashboard.png',
        alt: 'Waiver Director analytics dashboard showing bookings, submissions, follow-ups, customers, and recent activity',
        caption: 'Analytics dashboard — a live view of bookings, waiver submissions, customer growth, and follow-up performance.',
      },
      {
        src: '/projects/waiver-director/02-integrations.png',
        alt: 'Waiver Director integrations settings for booking and email platforms',
        caption: 'Integrations — connect booking and email tools so customer data moves into Waiver Director automatically.',
      },
      {
        src: '/projects/waiver-director/03-waiver-builder.png',
        alt: 'Waiver Director editor for creating a digital waiver with custom fields and signer details',
        caption: 'Waiver builder — create branded digital waivers, collect custom details, and publish a signing link.',
      },
      {
        src: '/projects/waiver-director/04-email-creator.png',
        alt: 'Follow-up email editor with scheduling, variables, templates, and AI review tools',
        caption: 'Follow-up email creator — write reusable, personalized emails and choose when they are sent after a booking.',
      },
      {
        src: '/projects/waiver-director/05-marketing-site.png',
        alt: 'Waiver Director marketing website showing a live participant session dashboard',
        caption: 'Marketing site — communicates how every signed waiver becomes an opportunity for a direct customer relationship.',
      },
      {
        src: '/projects/waiver-director/06-ai-review.png',
        alt: 'AI email review comparing the original message with suggested improvements',
        caption: 'AI review — identifies issues, scores the message, and proposes changes that can be reviewed before applying.',
      },
      {
        src: '/projects/waiver-director/07-follow-up-queue.png',
        alt: 'Follow-up email queue showing scheduled, sent, failed, and unscheduled messages',
        caption: 'Follow-up queue — search, filter, schedule, and monitor every customer email from one operational view.',
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
