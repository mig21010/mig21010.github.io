import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Translation helper: returns the key, with {param} placeholders substituted.
const t = (key: string, params?: Record<string, unknown>) => {
  if (!params) return key
  return Object.entries(params).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    key,
  )
}

// Stub Nuxt auto-imports as globals so components calling useI18n(), etc. work in tests.
vi.stubGlobal('useI18n', () => ({
  t,
  locale: { value: 'es' },
  locales: { value: [{ code: 'es', name: 'Español' }, { code: 'en', name: 'English' }] },
}))
vi.stubGlobal('useSwitchLocalePath', () => (code: string) => `/${code}`)
vi.stubGlobal('useHead', () => undefined)

// Stub <NuxtLink> so component tests don't need a Nuxt runtime.
config.global.stubs = {
  NuxtLink: {
    props: ['to'],
    template: '<a :href="typeof to === \'string\' ? to : (to?.path ?? \'#\')"><slot /></a>',
  },
}

// Provide $t for templates that use it instead of useI18n's t.
config.global.mocks = { $t: t }
