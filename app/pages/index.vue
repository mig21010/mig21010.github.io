<script setup lang="ts">
import SiteHeader from '../components/layout/SiteHeader.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
import HeroSection from '../components/sections/HeroSection.vue'
import AboutSection from '../components/sections/AboutSection.vue'
import ProjectsSection from '../components/sections/ProjectsSection.vue'
import WorkSection from '../components/sections/WorkSection.vue'

const { t, locale } = useI18n()

useHead({
  title: () => `Miguel Angel Escamilla — ${t('hero.title')}`,
  htmlAttrs: { lang: locale.value },
})
</script>

<template>
  <div class="page">
    <SiteHeader />
    <main>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <WorkSection />
    </main>
    <SiteFooter />
  </div>
</template>
