import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkSection from '~/app/components/sections/WorkSection.vue'

vi.mock('~/app/content/work', () => ({
  jobs: [
    { id: 'job-1', start: '2024-01', end: 'present', company: 'Acme',  roleKey: 'work.jobs.job-1.role' },
    { id: 'job-2', start: '2022-06', end: '2023-12', company: 'Globex', roleKey: 'work.jobs.job-2.role' },
  ],
}))

describe('WorkSection', () => {
  it('renders one row per job with company and translated role', () => {
    const wrapper = mount(WorkSection)

    const rows = wrapper.findAll('tr')
    expect(rows.length).toBe(2)

    expect(wrapper.text()).toContain('Acme')
    expect(wrapper.text()).toContain('Globex')
    expect(wrapper.text()).toContain('work.jobs.job-1.role')
    expect(wrapper.text()).toContain('work.jobs.job-2.role')
  })

  it('renders the section title and total experience label', () => {
    const wrapper = mount(WorkSection)
    expect(wrapper.text()).toContain('work.title')
    expect(wrapper.text()).toContain('work.totalLabel')
  })
})
