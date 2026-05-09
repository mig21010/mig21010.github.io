import VueParticles from '@tsparticles/vue3'
import { loadSlim } from '@tsparticles/slim'
import type { Engine } from '@tsparticles/engine'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueParticles, {
    init: async (engine: Engine) => {
      await loadSlim(engine)
    },
  })
})
