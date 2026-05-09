import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { usePrefersReducedMotion } from '~/app/composables/usePrefersReducedMotion'

type Listener = (e: { matches: boolean }) => void

function makeMediaQueryList(initial: boolean) {
  const listeners: Listener[] = []
  const mql = {
    matches: initial,
    addEventListener: (_event: string, listener: Listener) => listeners.push(listener),
    removeEventListener: (_event: string, listener: Listener) => {
      const i = listeners.indexOf(listener)
      if (i >= 0) listeners.splice(i, 1)
    },
    dispatchChange: (matches: boolean) => {
      mql.matches = matches
      for (const l of listeners) l({ matches })
    },
  }
  return mql
}

const Harness = defineComponent({
  setup() {
    const reduced = usePrefersReducedMotion()
    return () => h('div', { 'data-reduced': String(reduced.value) })
  },
})

describe('usePrefersReducedMotion', () => {
  let mql: ReturnType<typeof makeMediaQueryList>

  beforeEach(() => {
    mql = makeMediaQueryList(false)
    vi.stubGlobal('matchMedia', vi.fn(() => mql))
  })

  it('returns false when prefers-reduced-motion is not set', async () => {
    const wrapper = mount(Harness)
    await flushPromises()
    expect(wrapper.attributes('data-reduced')).toBe('false')
  })

  it('returns true when prefers-reduced-motion is set on mount', async () => {
    mql = makeMediaQueryList(true)
    vi.stubGlobal('matchMedia', vi.fn(() => mql))

    const wrapper = mount(Harness)
    await flushPromises()
    expect(wrapper.attributes('data-reduced')).toBe('true')
  })

  it('updates reactively when the media query changes', async () => {
    const wrapper = mount(Harness)
    await flushPromises()
    expect(wrapper.attributes('data-reduced')).toBe('false')

    mql.dispatchChange(true)
    await flushPromises()
    expect(wrapper.attributes('data-reduced')).toBe('true')
  })
})
