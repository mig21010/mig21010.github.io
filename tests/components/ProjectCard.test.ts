import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectCard from '~/app/components/ui/ProjectCard.vue'
import type { Project } from '~/app/content/types'

const sample: Project = {
  id: 'sample',
  title: 'Sample Project',
  image: '/images/projects/sample.png',
  liveUrl: 'https://example.com/',
  tech: ['Vue', 'Nuxt', 'TypeScript'],
  descriptionKey: 'projects.items.sample.description',
}

describe('ProjectCard', () => {
  it('renders title, image, description (via i18n key) and one pill per tech', () => {
    const wrapper = mount(ProjectCard, { props: { project: sample } })

    expect(wrapper.text()).toContain('Sample Project')

    const img = wrapper.get('img')
    expect(img.attributes('src')).toBe('/images/projects/sample.png')
    expect(img.attributes('alt')).toBe('Sample Project')

    expect(wrapper.text()).toContain('projects.items.sample.description')

    const pills = wrapper.findAll('.project-card__tech-pill')
    expect(pills.length).toBe(3)
    expect(pills.map((p) => p.text())).toEqual(['Vue', 'Nuxt', 'TypeScript'])
  })

  it('renders a "view live" link with safe target/rel and the configured URL', () => {
    const wrapper = mount(ProjectCard, { props: { project: sample } })

    const link = wrapper.get('a.project-card__cta')
    expect(link.attributes('href')).toBe('https://example.com/')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
    expect(link.text()).toContain('projects.viewLive')
  })
})
