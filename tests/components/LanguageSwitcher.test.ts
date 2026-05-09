import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import LanguageSwitcher from '~/app/components/ui/LanguageSwitcher.vue'

vi.mock('~/app/composables/useLocaleLinks', () => ({
  useLocaleLinks: () => ({
    currentLocale: ref('es'),
    links: ref([
      { code: 'en', label: 'En', path: '/en' },
      { code: 'es', label: 'Es', path: '/es' },
    ]),
  }),
}))

describe('LanguageSwitcher', () => {
  it('renders one link per locale with correct labels and hrefs', () => {
    const wrapper = mount(LanguageSwitcher)
    const links = wrapper.findAll('a')

    expect(links).toHaveLength(2)
    expect(links[0].text()).toBe('En')
    expect(links[0].attributes('href')).toBe('/en')
    expect(links[1].text()).toBe('Es')
    expect(links[1].attributes('href')).toBe('/es')
  })

  it('marks the current locale link with an active class', () => {
    const wrapper = mount(LanguageSwitcher)
    const links = wrapper.findAll('a')

    expect(links[1].classes()).toContain('active')
    expect(links[0].classes()).not.toContain('active')
  })
})
