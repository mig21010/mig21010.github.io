<script setup lang="ts">
import type { Project } from '../../content/types'

defineProps<{
  project: Project
}>()
</script>

<template>
  <article class="project-card">
    <div class="row g-0 align-items-stretch">
      <div class="col-md-6 project-card__image-col">
        <img
          :src="project.image"
          :alt="project.title"
          class="project-card__image"
        />
      </div>
      <div class="col-md-6 project-card__content">
        <h3 class="project-card__title">{{ project.title }}</h3>
        <p class="project-card__description">{{ $t(project.descriptionKey) }}</p>
        <ul class="project-card__tech">
          <li
            v-for="t in project.tech"
            :key="t"
            class="project-card__tech-pill"
          >
            {{ t }}
          </li>
        </ul>
        <a
          class="btn-pill project-card__cta"
          :href="project.liveUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ $t('projects.viewLive') }}
          <i class="bi bi-box-arrow-up-right" aria-hidden="true" />
        </a>
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.project-card {
  border: 1px solid $border-subtle;
  border-radius: $border-radius-lg;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);

  &__image-col {
    aspect-ratio: 16 / 9;

    @media (min-width: 768px) {
      aspect-ratio: auto;
    }
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__content {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 100%;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: $text-primary;
  }

  &__description {
    color: $text-muted;
    font-size: 1rem;
    line-height: 1.6;
    margin: 0;
  }

  &__tech {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__tech-pill {
    padding: 0.25rem 0.625rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.05);
    font-size: 0.75rem;
    color: $text-muted;
  }

  &__cta {
    margin-top: auto;
    align-self: flex-start;
  }
}
</style>
