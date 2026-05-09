import { ref, onMounted, onUnmounted } from 'vue'

export function usePrefersReducedMotion() {
  const prefersReduced = ref(false)
  let mq: MediaQueryList | null = null

  const update = (e: { matches: boolean }) => {
    prefersReduced.value = e.matches
  }

  onMounted(() => {
    mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReduced.value = mq.matches
    mq.addEventListener('change', update)
  })

  onUnmounted(() => {
    mq?.removeEventListener('change', update)
    mq = null
  })

  return prefersReduced
}
