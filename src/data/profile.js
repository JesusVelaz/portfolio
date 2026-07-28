const profile = {
  name: 'Jesus Velazquez',
  role: 'Software Engineer',
  headline: 'I build software that ships.',
  intro:
    'I build web UI component libraries and the REST APIs underneath them for the Department ' +
    'of Defense, and I co-founded Waiver Director, a multi-tenant SaaS for adventure and ' +
    'experience operators.',
  blurb:
    "I'm a software engineer for the Department of Defense, where I build and maintain the web " +
    'UI component library behind mission-critical applications, engineer the REST APIs ' +
    'underneath them, and push on accessibility — most recently raising an application’s 508 ' +
    'compliance score by 35%. I’m also co-founder of Waiver Director, a multi-tenant SaaS that ' +
    'adventure and experience operators use to collect digital waivers and stay in touch with ' +
    'every participant, not just whoever made the booking. I studied Computer Science at ' +
    'Florida International University and have been writing code professionally since 2023.',
  email: 'jesusvelazquez0980@gmail.com',
  // Stays null until a public copy of the résumé (without the phone number) is added to
  // public/resume/. The About section hides the button while this is null, so the site never
  // ships a link that 404s.
  resumeUrl: null,
  socials: [
    { label: 'GitHub', url: 'https://github.com/JesusVelaz' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/jesusvelazquez980' },
  ],
  skills: [
    { group: 'Languages', items: ['JavaScript', 'TypeScript', 'Java', 'Python', 'SQL', 'C', 'C++', 'PHP'] },
    { group: 'Frontend', items: ['React', 'Svelte', 'SvelteKit', 'Angular', 'Material-UI', 'HTML', 'CSS'] },
    { group: 'Backend & Data', items: ['REST APIs', 'Node.js', 'PostgreSQL', 'MySQL', 'Convex', 'Swagger'] },
    { group: 'Tools & Infra', items: ['Git', 'Docker', 'Kubernetes', 'AWS S3'] },
  ],
}

export default profile
