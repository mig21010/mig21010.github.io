<script setup lang="ts">
import SocialLink from '../ui/SocialLink.vue'
import HeroParticles from '../ui/HeroParticles.vue'
import { socials } from '../../content/socials'

const { t } = useI18n()
</script>

<template>
  <section class="hero">
    <ClientOnly>
      <HeroParticles class="hero__particles" />
    </ClientOnly>
    <div class="container py-5 hero__content">
      <div class="row align-items-end g-4">
        <div class="col-lg-8">
          <h1 class="display-hero mb-3">{{ t('hero.title') }}</h1>
          <p class="hero__intro">{{ t('hero.intro') }}</p>
        </div>

        <div class="col-lg-4 text-lg-end">
          <a href="#work" class="btn-pill btn-pill--solid">
            {{ t('hero.cta') }}
            <i class="bi bi-arrow-right" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div class="hero__socials mt-5 d-flex flex-wrap gap-3 justify-content-center">
        <SocialLink
          v-for="s in socials"
          :key="s.id"
          :icon="s.icon"
          :url="s.url"
          :label="s.label"
        />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero {
  position: relative;
  padding-block: 4rem;
  overflow: hidden;

  &__particles {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  &__content {
    position: relative;
    z-index: 1;
  }

  &__intro {
    color: $text-muted;
    max-width: 32rem;
    font-size: 1rem;
    margin-bottom: 0;
  }
}
</style>
