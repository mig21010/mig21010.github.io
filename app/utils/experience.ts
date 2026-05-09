import type { Job } from '../content/types'

export function calculateExperience(
  jobs: Job[],
  now: Date = new Date(),
): { years: number; months: number } {
  let totalMonths = 0

  for (const job of jobs) {
    const startDate = parseYearMonth(job.start)
    const endDate = job.end === 'present' ? now : parseYearMonth(job.end)
    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth())
    if (months > 0) totalMonths += months
  }

  return { years: Math.floor(totalMonths / 12), months: totalMonths % 12 }
}

function parseYearMonth(value: string): Date {
  const [yearStr, monthStr] = value.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  return new Date(year, month - 1, 1)
}
