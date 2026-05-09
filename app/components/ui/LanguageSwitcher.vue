<script setup lang="ts">
import { useLocaleLinks } from '../../composables/useLocaleLinks'

const { currentLocale, links } = useLocaleLinks()
</script>

<template>
  <div class="lang-switcher">
    <a
      v-for="link in links"
      :key="link.code"
      :href="link.path"
      :class="{ active: link.code === currentLocale }"
    >
      {{ link.label }}
    </a>
  </div>
</template>
