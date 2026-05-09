<script setup lang="ts">
defineProps<{
  icon: string
  url: string
  label: string
}>()
</script>

<template>
  <a
    class="social-link"
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
  >
    <i :class="['bi', icon]" aria-hidden="true" />
    <span>{{ label }}</span>
  </a>
</template>
