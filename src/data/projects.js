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
      "the correct session through the operator's booking provider, and automates individual " +
      'follow-up for reviews and repeat bookings. I co-founded the product and build it.',
    highlights: [
      'Versioned waiver templates: editing a template never mutates signatures already collected, so signed records stay legally intact.',
      'Bookeo integration syncs sessions and expected headcount, so completion analytics compare signed against expected per session rather than reporting raw totals.',
      'Per-signer email automation with configurable delays, addressed to every participant instead of only the booking lead.',
      'Role-based access for owners and staff across multiple venues, backed by immutable audit trails with PDF export.',
    ],
    screenshots: [
      {
        src: '/projects/waiver-director/01.jpg',
        alt: 'Waiver Director dashboard showing session completion rates',
      },
      {
        src: '/projects/waiver-director/02.jpg',
        alt: 'The waiver builder editing a branded template',
      },
      {
        src: '/projects/waiver-director/03.jpg',
        alt: 'Email automation schedule configuration',
      },
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
      "The PokéAPI exposes hundreds of resources across separate endpoints, and a Pokémon's " +
      'sprite, types, and stats each live in a different place. Rendering a browsable list means ' +
      'coordinating many requests without stalling the interface or hammering the API.',
    whatIBuilt:
      "A React single-page app that fetches from the PokéAPI, resolves each Pokémon's details, and " +
      'renders them as a searchable grid of cards with sprites, types, and base stats.',
    highlights: [
      'Batches and caches API responses so revisiting a Pokémon costs no additional requests.',
      'Client-side search filters the loaded set instantly rather than issuing a request per keystroke.',
      "Type-driven card theming derives colors from each Pokémon's type data instead of a hardcoded map.",
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
