<script setup lang="ts">
import ProjectCard from '../ui/ProjectCard.vue'
import { projects } from '../../content/projects'

const { t } = useI18n()
</script>

<template>
  <section id="projects" class="projects">
    <div class="container py-5">
      <div class="row mb-4 g-4">
        <div class="col-md-4">
          <span class="section-label">{{ t('projects.label') }}</span>
        </div>
        <div class="col-md-8">
          <h2 class="display-section projects__title mb-0">{{ t('projects.title') }}</h2>
        </div>
      </div>

      <div class="d-flex flex-column gap-4">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
        />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.projects {
  padding-block: 2.5rem;

  @media (min-width: 768px) { padding-block: 4rem; }

  &__title {
    text-align: center;

    @media (min-width: 768px) { text-align: end; }
  }
}
</style>
