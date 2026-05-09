<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

const { t } = useI18n()
const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

watch(isOpen, (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
})

onUnmounted(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) close()
}

watch(isOpen, (open) => {
  if (typeof window === 'undefined') return
  if (open) window.addEventListener('keydown', handleEscape)
  else window.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <div class="mobile-nav">
    <button
      type="button"
      class="mobile-nav__toggle"
      :aria-expanded="isOpen"
      :aria-label="isOpen ? t('nav.closeMenu') : t('nav.openMenu')"
      @click="toggle"
    >
      <i :class="['bi', isOpen ? 'bi-x-lg' : 'bi-list']" aria-hidden="true" />
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        class="mobile-nav__backdrop"
        @click="close"
      />
      <nav
        v-if="isOpen"
        class="mobile-nav__drawer"
        role="dialog"
        aria-modal="true"
      >
        <a href="#about" class="mobile-nav__link" @click="close">{{ t('nav.about') }}</a>
        <a href="#work"  class="mobile-nav__link" @click="close">{{ t('nav.work') }}</a>
      </nav>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.mobile-nav {
  &__toggle {
    background: transparent;
    border: 1px solid $border-subtle;
    border-radius: 999px;
    color: $text-primary;
    width: 44px;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 150ms ease;

    i { font-size: 1.25rem; }

    &:hover { background: rgba(255, 255, 255, 0.08); }
  }
}
</style>

<style lang="scss">
// Unscoped because Teleport moves content to <body>, outside the scoped style boundary.
.mobile-nav__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.mobile-nav__drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: min(85vw, 320px);
  background: $bg-elevated;
  border-left: 1px solid $border-subtle;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  padding: 5rem 1.5rem 1.5rem;
  gap: 0.5rem;
}

.mobile-nav__link {
  color: $text-primary;
  text-decoration: none;
  padding: 0.875rem 0.5rem;
  font-size: 1.125rem;
  border-bottom: 1px solid $border-subtle;

  &:hover { color: $text-muted; }
}
</style>
