export default defineNuxtConfig({
  compatibilityDate: '2026-05-08',
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },
  typescript: { strict: true },
  app: {
    baseURL: '/',
    head: {
      title: 'Miguel Angel Escamilla — Full-stack Developer',
      htmlAttrs: { lang: 'es' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Full-stack developer portfolio.' },
      ],
    },
  },
})
