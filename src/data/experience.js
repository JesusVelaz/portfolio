const experience = [
  {
    company: 'Department of Defense',
    url: null,
    role: 'Software Engineer',
    start: 'Sep 2024',
    end: null,
    summary:
      'Building shared interface systems and backend services for mission-critical applications, with a focus on accessibility and long-term maintainability.',
    focus: ['Design systems', 'REST APIs', 'Accessibility'],
    metric: '+35% Section 508 compliance',
    bullets: [
      'Develop and maintain a React and Material UI component library used across mission-critical applications, giving product teams a more consistent and reusable foundation.',
      'Engineer REST APIs, test endpoints with Swagger, write SQL database queries, and implement supporting Java services.',
      'Raised an application’s Section 508 accessibility compliance score by 35% by partnering with UX teams to review score sheets, identify systemic gaps, and build action plans.',
      'Refactor legacy code into focused components and utilities, including migrations from React class components to functional components.',
    ],
  },
  {
    company: 'Waiver Director',
    url: 'https://www.waiverdirector.com/',
    role: 'Co-founder & Software Engineer',
    start: 'Mar 2026',
    end: null,
    summary:
      'Co-founding and building a SaaS product that helps experience operators turn every signed waiver into a direct customer relationship.',
    focus: ['Product engineering', 'Multi-tenancy', 'Automation'],
    metric: '0 → 1 SaaS product',
    bullets: [
      'Build full-stack product features using SvelteKit, Svelte, TypeScript, and Convex, working from workflow definition through production delivery.',
      'Enforce workspace-level data isolation and server-side authorization so every operator’s records remain sealed from other tenants.',
      'Built an automated email follow-up system with a rich-text editor, reusable dynamic templates, scheduled Convex jobs, and Resend delivery.',
      'Shape product decisions around the operator experience, balancing fast iteration with the reliability required for signed customer records.',
    ],
  },
  {
    company: 'Fidelity Transport & Logistics',
    url: 'https://fidelityautoshipping.com/',
    role: 'Web Developer',
    start: 'Oct 2023',
    end: 'Jun 2024',
    summary:
      'Modernized public websites and internal document workflows for a logistics business, translating operational friction into practical web solutions.',
    focus: ['Web development', 'Workflow automation', 'Optimization'],
    metric: '30% faster document processing',
    bullets: [
      'Collaborated with cross-functional teams to design, develop, and modernize company websites using JavaScript, HTML, CSS, and WordPress.',
      'Cut document processing time by 30% with conditional form logic and automated data exports, reducing both manual work and entry errors.',
      'Diagnosed and resolved site issues through debugging and performance optimization, improving stability and responsiveness.',
    ],
  },
]

export const education = {
  school: 'Florida International University',
  degree: 'Bachelor of Arts in Computer Science',
  graduated: 'May 2023',
  detail: "3.66 GPA · Dean's List, 2019–2023",
}

export default experience
