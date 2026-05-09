<script setup lang="ts">
import { usePrefersReducedMotion } from '../../composables/usePrefersReducedMotion'

const reduced = usePrefersReducedMotion()

const particlesOptions = {
  background: { color: 'transparent' },
  fpsLimit: 60,
  particles: {
    number: { value: 50, density: { enable: true, area: 800 } },
    color: { value: '#ffffff' },
    opacity: {
      value: { min: 0.1, max: 0.4 },
      animation: { enable: true, speed: 0.5, sync: false },
    },
    size: { value: { min: 1, max: 2.5 } },
    move: {
      enable: true,
      speed: 0.5,
      direction: 'none',
      random: true,
      straight: false,
      outModes: { default: 'out' },
    },
    links: {
      enable: true,
      distance: 150,
      color: '#ffffff',
      opacity: 0.15,
      width: 1,
    },
  },
  interactivity: { events: {} },
  detectRetina: true,
}
</script>

<template>
  <vue-particles
    v-if="!reduced"
    id="hero-particles"
    :options="particlesOptions"
  />
</template>
