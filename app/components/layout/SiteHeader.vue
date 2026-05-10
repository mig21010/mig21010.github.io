<script setup lang="ts">
import LanguageSwitcher from '../ui/LanguageSwitcher.vue'
import MobileNav from './MobileNav.vue'

const { t } = useI18n()
</script>

<template>
  <header class="site-header">
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center gap-3">
        <div class="site-header__name">
          <strong>Miguel Angel</strong><br />Escamilla
        </div>

        <nav class="d-none d-md-flex gap-4">
          <a href="#about"    class="site-header__link">{{ t('nav.about') }}</a>
          <a href="#projects" class="site-header__link">{{ t('nav.projects') }}</a>
          <a href="#work"     class="site-header__link">{{ t('nav.work') }}</a>
        </nav>

        <div class="d-flex align-items-center gap-2">
          <MobileNav class="d-md-none" />
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid $border-subtle;

  &__name {
    font-size: 0.875rem;
    line-height: 1.3;
  }

  &__link {
    color: $text-muted;
    text-decoration: none;
    font-size: 0.95rem;

    &:hover { color: $text-primary; }
  }
}
</style>
