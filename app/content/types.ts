export type Social = {
  id: 'github' | 'linkedin' | 'email' | 'twitter' | 'instagram'
  url: string
  icon: string
  label: string
}

export type SkillGroup = {
  id: 'backend' | 'frontend' | 'ai' | 'devops' | 'databases' | 'mobile'
  items: string[]
}

export type Client = {
  id: string
  startYear: number
  endYear: number | 'present'
  name: string
  roleKey: string
}

export type Job = {
  id: string
  start: string
  end: string | 'present'
  company: string
  roleKey: string
  clients?: Client[]
}

export type Project = {
  id: string
  title: string
  image?: string
  liveUrl?: string
  tech: string[]
  descriptionKey: string
}
