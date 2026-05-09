<script setup lang="ts">
import { jobs } from '../../content/work'
import { calculateExperience } from '../../utils/experience'

const { t } = useI18n()
const total = calculateExperience(jobs)

function formatRange(start: string, end: string | 'present'): string {
  const startYear = start.slice(0, 4)
  if (end === 'present') return `${startYear} - ${t('work.present')}`
  const endYear = end.slice(0, 4)
  return startYear === endYear ? startYear : `${startYear} - ${endYear}`
}

function durationFor(start: string, end: string | 'present'): string {
  const single = calculateExperience(
    [{ id: 'tmp', start, end, company: '', roleKey: '' }],
  )
  return t('work.duration', { years: single.years, months: single.months })
}
</script>

<template>
  <section id="work" class="work">
    <div class="container py-5">
      <h2 class="display-section work__title mb-4">{{ t('work.title') }}</h2>

      <table class="work-table">
        <tbody>
          <tr v-for="job in jobs" :key="job.id">
            <td>
              <div>{{ formatRange(job.start, job.end) }}</div>
              <small class="text-muted">{{ durationFor(job.start, job.end) }}</small>
            </td>
            <td>{{ job.company }}</td>
            <td>{{ t(job.roleKey) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="text-end mt-3 work__total">
        <div>{{ t('work.totalLabel') }}</div>
        <strong>{{ t('work.yearsMonths', { years: total.years, months: total.months }) }}</strong>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.work {
  padding-block: 2.5rem;

  @media (min-width: 768px) { padding-block: 4rem; }

  &__title {
    text-align: center;
    @media (min-width: 768px) { text-align: end; }
  }

  &__total {
    color: $text-muted;
    font-size: 0.95rem;
    strong { color: $text-primary; display: block; }
  }
}
</style>
