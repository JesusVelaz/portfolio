const projects = [
  {
    slug: 'waiver-director',
    title: 'Waiver Director',
    tagline: 'Digital waiver management that captures every participant, not just the booker.',
    role: 'Co-founder & Software Engineer',
    year: 'March 2026 — Present',
    stack: ['SvelteKit', 'Svelte', 'TypeScript', 'Convex', 'Resend'],
    liveUrl: 'https://www.waiverdirector.com/',
    thumb: '/projects/waiver-director/05-marketing-site.png',
    thumbTitle: 'Marketing Site',
    gallerySections: [
      {
        id: 'overview',
        name: 'Product overview',
        description: 'The day’s bookings, signed waivers, and queued follow-ups on one screen.',
      },
      {
        id: 'capture',
        name: 'Capture',
        description: 'Custom waiver forms, connected to the booking and email tools a business already uses.',
      },
      {
        id: 'follow-ups',
        name: 'Automated follow-ups',
        description: 'Write follow-up emails, review them with AI, and track every send.',
      },
      {
        id: 'measure',
        name: 'Measure',
        description: 'Trends for submissions, bookings, new customers, and email delivery.',
      },
    ],
    screenshots: [
      {
        group: 'overview',
        src: '/projects/waiver-director/05-workspace-dashboard.png',
        width: 2576,
        height: 1498,
        alt: 'Waiver Director workspace dashboard with daily bookings, submissions, follow-ups, and new customers, above a live booking list and email follow-up queue',
        title: 'Workspace Dashboard',
        caption: 'Today’s bookings, submissions, new customers, and scheduled follow-ups.',
      },
      {
        group: 'capture',
        src: '/projects/waiver-director/03-waiver-builder.png',
        width: 3475,
        height: 1900,
        alt: 'Waiver Director editor for creating a digital waiver with custom fields and signer details',
        title: 'Waiver Builder',
        caption: 'Typed form fields, published as versioned waivers that record exactly what each customer signed.',
      },
      {
        group: 'capture',
        src: '/projects/waiver-director/02-integrations.png',
        width: 2179,
        height: 1123,
        alt: 'Waiver Director integrations settings for booking and email platforms',
        title: 'Integrations Settings',
        caption: 'Booking and email integrations with sync status and a webhook log.',
      },
      {
        group: 'follow-ups',
        src: '/projects/waiver-director/04-email-creator.png',
        width: 2094,
        height: 1750,
        alt: 'Follow-up email editor with scheduling, variables, templates, and AI review tools',
        title: 'Follow-Up Email Editor',
        caption: 'Rich-text templates with merge variables and a send delay after signing.',
      },
      {
        group: 'follow-ups',
        src: '/projects/waiver-director/06-ai-review.png',
        width: 1942,
        height: 1609,
        alt: 'AI email review comparing the original message with suggested improvements',
        title: 'AI Email Review',
        caption: 'Scores a template on clarity, tone, personalization, call to action, and deliverability, then suggests a rewrite.',
      },
      {
        group: 'follow-ups',
        src: '/projects/waiver-director/07-follow-up-queue.png',
        width: 2305,
        height: 1299,
        alt: 'Follow-up email queue showing scheduled, sent, failed, and unscheduled messages',
        title: 'Follow-Up Queue',
        caption: 'Every queued, sent, blocked, and failed email, searchable, with recipient and timing.',
      },
      {
        group: 'measure',
        src: '/projects/waiver-director/01-analytics-dashboard.png',
        width: 2170,
        height: 1897,
        alt: 'Waiver Director analytics dashboard showing bookings, submissions, follow-ups, customers, and recent activity',
        title: 'Analytics Dashboard',
        caption: 'Submissions, bookings, customers, and email delivery over time, against the previous period.',
      },
    ],
  },
  {
    slug: 'agents-cafe',
    title: 'Agents Café',
    tagline:
      'A local control room for running Claude Code and Codex agents in a cozy pixel-art café.',
    role: 'Solo project',
    year: 'September 2026 — Present',
    stack: ['Next.js', 'TypeScript', 'Fastify', 'Prisma', 'SQLite', 'Claude Agent SDK'],
    liveUrl: 'https://agentscafe.dev/',
    repoUrl: 'https://github.com/JesusVelaz/agent-cafe',
    thumb: '/projects/agents-cafe/01-cafe-work-board.png',
    gallerySections: [
      {
        id: 'floor',
        name: 'The café floor',
        description: 'Claude Code agents work upstairs and Codex agents downstairs. Each one moves according to the events its run emits.',
      },
      {
        id: 'composer',
        name: 'Sending work',
        description: 'Every message sets the agent, the model, and how much it may do without asking.',
      },
      {
        id: 'teamwork',
        name: 'Agents working together',
        description: 'Agents message each other and delegate tasks across Claude Code and Codex.',
      },
      {
        id: 'accounts',
        name: 'Your own plans',
        description: 'Each floor signs in with your own Claude or ChatGPT plan. The café never stores credentials.',
      },
    ],
    screenshots: [
      {
        group: 'floor',
        src: '/projects/agents-cafe/01-cafe-work-board.png',
        width: 3200,
        height: 2000,
        alt: 'Isometric pixel-art café with seven named agents across two floors, beside a work board of live threads and their delegated sub-tasks',
        title: 'Café & Work Board',
        caption: 'Drawn by a custom software rasteriser. Tool calls walk agents along A* paths to the matching station.',
      },
      {
        group: 'floor',
        src: '/projects/agents-cafe/02-night-cafe-view.png',
        width: 3200,
        height: 2000,
        alt: 'The café at night with the side panel folded away, a floating message box, and a status rail of every agent',
        title: 'Café View at Night',
        caption: 'The panel folded away, with a status rail for every agent. The theme follows the time of day.',
      },
      {
        group: 'composer',
        src: '/projects/agents-cafe/03-permission-modes.png',
        width: 3200,
        height: 2000,
        alt: 'Message box with the permission menu open, offering Ask first and Auto-accept edits',
        title: 'Permission Modes',
        caption: 'Ask first approves every edit and command. Auto-accept edits lets file changes inside the project through.',
      },
      {
        group: 'composer',
        src: '/projects/agents-cafe/04-command-menu.png',
        width: 3200,
        height: 2000,
        alt: 'Slash command menu listing the skills and commands Claude Code can use in the selected project',
        title: 'Harness Command Menu',
        caption: 'Typing / opens the harness’s own commands, including the project’s local skills.',
      },
      {
        group: 'teamwork',
        src: '/projects/agents-cafe/05-delegation-thread.png',
        width: 3200,
        height: 2000,
        alt: 'Thread where a Claude Code agent messages three Codex agents and collects each of their replies',
        title: 'Cross-Agent Delegation',
        caption: 'Claude Code messages three Codex agents over an in-process MCP server, capped at 12 exchanges per request.',
      },
      {
        group: 'accounts',
        src: '/projects/agents-cafe/06-providers.png',
        width: 3200,
        height: 2000,
        alt: 'Providers settings showing Claude and ChatGPT connected, each with its 5-hour usage limit',
        title: 'Connected Providers',
        caption: 'Each harness signs in through its own CLI. API keys are stripped, so runs always use the subscription.',
      },
      {
        group: 'accounts',
        src: '/projects/agents-cafe/07-agent-models.png',
        width: 3200,
        height: 2000,
        alt: 'Agents settings listing each agent with its default model, grouped by floor',
        title: 'Per-Agent Models',
        caption: 'Each agent’s default model, picked from the models the signed-in harness offers.',
      },
    ],
  },
  {
    slug: 'pokedex',
    title: 'PokeDex App',
    tagline: 'A Pokémon field companion for daily discovery, deep research, and team building.',
    role: 'Solo project',
    year: '2023',
    stack: ['React', 'JavaScript', 'PokéAPI', 'CSS'],
    liveUrl: 'https://jesusvelaz.github.io/PokeDex-App/',
    thumb: '/projects/pokedex/01-trainer-field-desk.png',
    gallerySections: [
      {
        id: 'field-desk',
        name: 'Field desk',
        description: 'The home screen, styled as Professor Oak’s terminal and built from live app state.',
      },
      {
        id: 'pokedex',
        name: 'Pokédex',
        description: 'All 1,351 species, paginated, searchable, and filterable by type.',
      },
      {
        id: 'teams',
        name: 'Team builder',
        description: 'Named rosters with six slots each, saved in the browser.',
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
        caption: 'A daily silhouette guess, a three-step research checklist, roster totals, and random nearby sightings.',
      },
      {
        group: 'pokedex',
        src: '/projects/pokedex/02-pokedex-browser.png',
        width: 1903,
        height: 909,
        alt: 'Searchable Pokédex browser with Pokémon cards and a detailed Dragonite entry showing abilities and base stats',
        title: 'Searchable Pokédex',
        caption: 'Debounced search and type filters, with artwork, stats, abilities, and a playable cry for each entry.',
      },
      {
        group: 'teams',
        src: '/projects/pokedex/03-team-builder.png',
        width: 1897,
        height: 909,
        alt: 'Pokémon team builder showing three named teams with six available slots each',
        title: 'Pokémon Team Builder',
        caption: 'Named teams of six with shiny variants, saved with localStorage.',
      },
    ],
  },
]

// The card carousel: the project's thumbnail first, then every gallery
// screenshot in order. A thumbnail that is also a gallery shot appears once.
export function cardSlides(project) {
  const lead = project.screenshots.find((shot) => shot.src === project.thumb)
  return [
    { src: project.thumb, title: lead?.title ?? project.thumbTitle ?? project.title },
    ...project.screenshots
      .filter((shot) => shot.src !== project.thumb)
      .map((shot) => ({ src: shot.src, title: shot.title })),
  ]
}

export function getProject(slug) {
  return projects.find((p) => p.slug === slug)
}

export default projects
