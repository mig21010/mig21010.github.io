import type { SkillGroup } from './types'

export const skillGroups: SkillGroup[] = [
  { id: 'frontend', items: ['Vue', 'Nuxt', 'React', 'TypeScript', 'Pinia', 'Vite'] },
  { id: 'styles',   items: ['SCSS', 'SASS', 'Bootstrap'] },
  { id: 'backend',  items: ['.NET 8', 'C#', 'Node', 'PHP', 'Laravel', 'MySQL', 'PostgreSQL', 'REST', 'GraphQL'] },
  { id: 'mobile',   items: ['Flutter', 'Dart'] },
  { id: 'devops',   items: ['Nginx', 'GitHub Actions', 'Bash', 'Linux'] },
]
