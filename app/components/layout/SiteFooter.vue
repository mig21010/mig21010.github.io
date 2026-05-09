<script setup lang="ts">
const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="container py-4 text-center">
      <small>{{ t('footer.copyright', { year }) }}</small>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.site-footer {
  border-top: 1px solid $border-subtle;
  color: $text-muted;
  margin-top: 4rem;
}
</style>
