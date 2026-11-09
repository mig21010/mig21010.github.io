import type { SkillGroup } from './types'

export const skillGroups: SkillGroup[] = [
  { id: 'backend',   items: ['.NET 8', 'C#', 'ASP.NET Core', 'Node', 'TypeScript', 'PHP', 'REST APIs', 'Microservices'] },
  { id: 'frontend',  items: ['Vue 3', 'Nuxt', 'React', 'TypeScript', 'Tailwind CSS', 'Vite'] },
  { id: 'ai',        items: ['Claude API', 'OpenAI API', 'Function calling', 'Prompt Engineering', 'Workflow Automation'] },
  { id: 'devops',    items: ['Azure DevOps', 'CI/CD', 'Docker', 'GitHub Actions', 'Nginx', 'Linux'] },
  { id: 'databases', items: ['SQL Server', 'MySQL', 'Oracle', 'MongoDB'] },
  { id: 'mobile',    items: ['Flutter', 'Dart'] },
]
