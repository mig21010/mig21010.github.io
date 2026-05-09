<script setup lang="ts">
import SkillGroup from '../ui/SkillGroup.vue'
import { skillGroups } from '../../content/skills'

const { t } = useI18n()
</script>

<template>
  <section id="about" class="about">
    <div class="container py-5">
      <div class="row mb-4 g-4">
        <div class="col-md-4">
          <span class="section-label">{{ t('about.label') }}</span>
        </div>
        <div class="col-md-8">
          <p class="about__intro">{{ t('about.intro') }}</p>
        </div>
      </div>

      <div class="row g-4 align-items-start">
        <div class="col-lg-7 d-flex flex-column gap-3">
          <SkillGroup
            v-for="group in skillGroups"
            :key="group.id"
            :title-key="`about.skillsTitle.${group.id}`"
            :items="group.items"
          />
        </div>

        <div class="col-lg-5">
          <img
            src="/images/me.jpeg"
            :alt="t('about.photoAlt')"
            class="about__photo img-fluid rounded-4"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.about {
  padding-block: 2.5rem;

  @media (min-width: 768px) { padding-block: 4rem; }

  &__intro {
    font-size: 1.125rem;
    color: $text-primary;
  }

  &__photo {
    filter: grayscale(100%);
    width: 100%;
    border: 1px solid $border-subtle;
    max-height: 60vh;
    object-fit: cover;

    @media (min-width: 992px) {
      max-height: none;
    }
  }
}
</style>
