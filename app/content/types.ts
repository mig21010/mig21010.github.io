export type Social = {
  id: 'github' | 'linkedin' | 'email' | 'twitter' | 'instagram'
  url: string
  icon: string
  label: string
}

export type SkillGroup = {
  id: 'frontend' | 'styles' | 'backend' | 'devops'
  items: string[]
}

export type Job = {
  id: string
  start: string
  end: string | 'present'
  company: string
  roleKey: string
}
