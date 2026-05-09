import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import HeroParticles from '~/app/components/ui/HeroParticles.vue'

vi.mock('~/app/composables/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: vi.fn(),
}))

import { usePrefersReducedMotion } from '~/app/composables/usePrefersReducedMotion'

describe('HeroParticles', () => {
  it('renders the particles canvas wrapper when reduced motion is NOT requested', () => {
    vi.mocked(usePrefersReducedMotion).mockReturnValue(ref(false))

    const wrapper = mount(HeroParticles, {
      global: {
        stubs: {
          'vue-particles': { template: '<div class="vue-particles-stub" />' },
        },
      },
    })

    expect(wrapper.find('.vue-particles-stub').exists()).toBe(true)
  })

  it('renders nothing when reduced motion IS requested', () => {
    vi.mocked(usePrefersReducedMotion).mockReturnValue(ref(true))

    const wrapper = mount(HeroParticles, {
      global: {
        stubs: { 'vue-particles': { template: '<div class="vue-particles-stub" />' } },
      },
    })

    expect(wrapper.find('.vue-particles-stub').exists()).toBe(false)
    expect(wrapper.html()).toBe('<!--v-if-->')
  })
})
