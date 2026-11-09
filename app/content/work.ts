import type { Job } from './types'

export const jobs: Job[] = [
  {
    id: 'chimp',
    start: '2018-07',
    end: 'present',
    company: 'Chimp Web Studio',
    roleKey: 'work.jobs.chimp.role',
    clients: [
      { id: 'sava', startYear: 2025, endYear: 'present', name: 'SAVA Honda', roleKey: 'work.jobs.chimp.clients.sava' },
      { id: 'proteccion', startYear: 2019, endYear: 'present', name: 'Protección Familiar', roleKey: 'work.jobs.chimp.clients.proteccion' },
      { id: 'growth', startYear: 2018, endYear: 'present', name: 'Growth Institute', roleKey: 'work.jobs.chimp.clients.growth' },
    ],
  },
]
