import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SkillGroup from '~/app/components/ui/SkillGroup.vue'

describe('SkillGroup', () => {
  it('renders the resolved title and items joined by a separator', () => {
    const wrapper = mount(SkillGroup, {
      props: {
        titleKey: 'about.skillsTitle.frontend',
        items: ['Vue', 'Nuxt', 'React'],
      },
    })

    expect(wrapper.text()).toContain('about.skillsTitle.frontend')
    const itemsText = wrapper.find('.skill-group__items').text()
    expect(itemsText).toContain('Vue')
    expect(itemsText).toContain('Nuxt')
    expect(itemsText).toContain('React')
  })

  it('renders all items when given a long list', () => {
    const items = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    const wrapper = mount(SkillGroup, {
      props: { titleKey: 'about.skillsTitle.backend', items },
    })

    for (const item of items) {
      expect(wrapper.find('.skill-group__items').text()).toContain(item)
    }
  })
})
