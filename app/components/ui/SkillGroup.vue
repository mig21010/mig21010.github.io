<script setup lang="ts">
defineProps<{
  titleKey: string
  items: string[]
}>()
</script>

<template>
  <div class="skill-group">
    <div class="skill-group__title">{{ $t(titleKey) }}</div>
    <div class="skill-group__items">{{ items.join(' / ') }}</div>
  </div>
</template>
