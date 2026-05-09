import type { SkillGroup } from './types'

export const skillGroups: SkillGroup[] = [
  { id: 'frontend', items: ['Vue', 'Nuxt', 'React', 'TypeScript', 'Pinia', 'Vite'] },
  { id: 'styles',   items: ['SCSS', 'SASS', 'Bootstrap', 'Tailwind', 'PostCSS'] },
  { id: 'backend',  items: ['Node', 'PHP', 'Laravel', 'MySQL', 'PostgreSQL', 'REST', 'GraphQL'] },
  { id: 'devops',   items: ['Docker', 'Nginx', 'GitHub Actions', 'Bash', 'Linux'] },
]
