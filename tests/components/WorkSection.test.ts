import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkSection from '~/app/components/sections/WorkSection.vue'

vi.mock('~/app/content/work', () => ({
  jobs: [
    {
      id: 'job-1', start: '2024-01', end: 'present', company: 'Acme', roleKey: 'work.jobs.job-1.role',
      clients: [
        { id: 'c1', startYear: 2024, endYear: 'present', name: 'Initech', roleKey: 'work.jobs.job-1.clients.c1' },
        { id: 'c2', startYear: 2024, endYear: 2025, name: 'Umbrella', roleKey: 'work.jobs.job-1.clients.c2' },
      ],
    },
    { id: 'job-2', start: '2022-06', end: '2023-12', company: 'Globex', roleKey: 'work.jobs.job-2.role' },
  ],
}))

describe('WorkSection', () => {
  it('renders one row per job with company and translated role', () => {
    const wrapper = mount(WorkSection)

    const rows = wrapper.findAll('tr:not(.work-table__client)')
    expect(rows.length).toBe(2)

    expect(wrapper.text()).toContain('Acme')
    expect(wrapper.text()).toContain('Globex')
    expect(wrapper.text()).toContain('work.jobs.job-1.role')
    expect(wrapper.text()).toContain('work.jobs.job-2.role')
  })

  it('renders client rows under their employer with year ranges', () => {
    const wrapper = mount(WorkSection)

    const clientRows = wrapper.findAll('tr.work-table__client')
    expect(clientRows.length).toBe(2)
    expect(clientRows[0].text()).toContain('Initech')
    expect(clientRows[0].text()).toContain('2024 - work.present')
    expect(clientRows[0].text()).toContain('work.jobs.job-1.clients.c1')
    expect(clientRows[1].text()).toContain('2024 - 2025')

    const allRows = wrapper.findAll('tr')
    expect(allRows[0].text()).toContain('Acme')
    expect(allRows[1].classes()).toContain('work-table__client')
  })

  it('renders the section title and total experience label', () => {
    const wrapper = mount(WorkSection)
    expect(wrapper.text()).toContain('work.title')
    expect(wrapper.text()).toContain('work.totalLabel')
  })
})
