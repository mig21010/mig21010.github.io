import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MobileNav from '~/app/components/layout/MobileNav.vue'

describe('MobileNav', () => {
  it('starts closed: aria-expanded false, no drawer rendered', () => {
    const wrapper = mount(MobileNav)
    const button = wrapper.get('button')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.mobile-nav__drawer').exists()).toBe(false)
  })

  it('opens drawer on toggle: aria-expanded true, drawer rendered, icon switches', async () => {
    const wrapper = mount(MobileNav, { attachTo: document.body })
    const button = wrapper.get('button')

    expect(button.find('i').classes()).toContain('bi-list')

    await button.trigger('click')

    expect(button.attributes('aria-expanded')).toBe('true')
    expect(document.body.querySelector('.mobile-nav__drawer')).not.toBeNull()
    expect(button.find('i').classes()).toContain('bi-x-lg')
    wrapper.unmount()
  })

  it('closes drawer when an in-drawer link is clicked', async () => {
    const wrapper = mount(MobileNav, { attachTo: document.body })
    await wrapper.get('button').trigger('click')
    expect(document.body.querySelector('.mobile-nav__drawer')).not.toBeNull()

    const link = document.body.querySelector('.mobile-nav__drawer a') as HTMLElement
    expect(link).not.toBeNull()
    link.click()
    await wrapper.vm.$nextTick()

    expect(document.body.querySelector('.mobile-nav__drawer')).toBeNull()
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('closes drawer when backdrop is clicked', async () => {
    const wrapper = mount(MobileNav, { attachTo: document.body })
    await wrapper.get('button').trigger('click')

    const backdrop = document.body.querySelector('.mobile-nav__backdrop') as HTMLElement
    expect(backdrop).not.toBeNull()
    backdrop.click()
    await wrapper.vm.$nextTick()

    expect(document.body.querySelector('.mobile-nav__drawer')).toBeNull()
    wrapper.unmount()
  })
})
