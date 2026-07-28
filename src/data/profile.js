const profile = {
  name: 'Jesus Velazquez',
  role: 'Software Engineer',
  headline: 'I build software that ships.',
  blurb:
    "I'm a software engineer working on backend systems for the Department of Defense, and " +
    'co-founder of Waiver Director, a digital waiver platform used by adventure and experience ' +
    'operators. Most of my time goes to REST APIs, shared component libraries, and the unglamorous ' +
    'work of making existing systems faster and easier to change. I studied Computer Science at ' +
    'Florida International University and have been writing code professionally since 2023.',
  email: 'jesusvelazquez0980@gmail.com',
  // Set to '/resume/jesus-velazquez-resume.pdf' once the file is added to public/resume/.
  resumeUrl: null,
  socials: [{ label: 'GitHub', url: 'https://github.com/jesusvelaz' }],
  skills: [
    { group: 'Languages', items: ['Java', 'Python', 'C', 'JavaScript', 'SQL', 'HTML', 'CSS'] },
    { group: 'Backend & Data', items: ['REST APIs', 'PostgreSQL', 'MySQL'] },
    { group: 'Frontend', items: ['React', 'Responsive UI'] },
    { group: 'Tools', items: ['Git', 'GitHub', 'VS Code', 'IntelliJ'] },
  ],
}

export default profile
