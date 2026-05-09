import { describe, it, expect } from 'vitest'
import { calculateExperience } from '~/app/utils/experience'
import type { Job } from '~/app/content/types'

const make = (start: string, end: string | 'present', id = 'j'): Job => ({
  id, start, end, company: 'X', roleKey: 'k',
})

describe('calculateExperience', () => {
  it('returns 0/0 for empty job list', () => {
    expect(calculateExperience([])).toEqual({ years: 0, months: 0 })
  })

  it('computes a single closed range exactly', () => {
    const jobs = [make('2022-01', '2023-01')]
    expect(calculateExperience(jobs)).toEqual({ years: 1, months: 0 })
  })

  it('counts months for partial-year ranges', () => {
    const jobs = [make('2022-01', '2022-07')]
    expect(calculateExperience(jobs)).toEqual({ years: 0, months: 6 })
  })

  it('treats "present" as the injected now date', () => {
    const jobs = [make('2024-01', 'present')]
    const now = new Date(2026, 4, 1) // May 2026 — month is 0-indexed
    expect(calculateExperience(jobs, now)).toEqual({ years: 2, months: 4 })
  })

  it('sums multiple job ranges', () => {
    const jobs = [
      make('2020-01', '2021-01', 'a'), // 12 months
      make('2021-06', '2022-06', 'b'), // 12 months
    ]
    expect(calculateExperience(jobs)).toEqual({ years: 2, months: 0 })
  })

  it('handles a same-month range as 0 months', () => {
    const jobs = [make('2024-03', '2024-03')]
    expect(calculateExperience(jobs)).toEqual({ years: 0, months: 0 })
  })
})
