# Hero particles — Diseño técnico

**Fecha:** 2026-05-08
**Autor:** Miguel Angel Escamilla
**Estado:** Aprobado para implementación

---

## 1. Contexto y objetivo

Agregar un fondo decorativo de partículas conectadas (estilo "links" clásico de particles.js) detrás del título del hero del portfolio para darle más atmósfera visual sin distraer del contenido principal.

**Caso de uso:** mejora estética puntual sobre la implementación actual del portfolio (ver `docs/superpowers/specs/2026-05-08-portfolio-nuxt-design.md`). No cambia ninguna otra sección.

## 2. Decisiones clave

| Decisión | Elección | Razón |
|---|---|---|
| Librería | **`@tsparticles/vue3` + `@tsparticles/slim`** | tsParticles es el sucesor mantenido del original `particles.js` (sin actualizaciones desde 2016). El bundle "slim" (~30 KB gzipped) ya incluye el preset "links" que necesitamos |
| Wrapper Vue | `@tsparticles/vue3` (paquete oficial) | Componente `<vue-particles>` listo para Vue 3.5+ |
| Estilo visual | Puntos blancos + líneas conectoras (preset "links") | Pega con la estética sobria del portfolio dark; clásico de particles.js |
| Densidad | ~50 partículas, opacidad 0.3, links con opacidad 0.15 | Sutil; decorativo sin competir con el título |
| Cobertura | Solo dentro del bloque `<HeroSection>` | Las partículas desaparecen al hacer scroll fuera del hero. Más barato en CPU que un fondo fijo |
| Render side | Cliente solamente (`<ClientOnly>`) | El canvas necesita `window`/`document`; no afecta SEO porque el HTML estático sigue conteniendo el título y la intro |
| Accesibilidad | Detectar `prefers-reduced-motion: reduce` y NO renderizar | Las partículas estáticas no aportan, mejor saltarlas para usuarios con sensibilidad al movimiento |
| Interactividad | Sin efectos de hover/click | Coherente con la estética minimal del resto del sitio |
| Tests | 1 test mínimo: el componente no monta el canvas cuando `prefers-reduced-motion` está activo | Comportamiento visual no se testea (es animación cliente-only) |

### Lo que NO hacemos (YAGNI)

- ❌ Fondo de partículas en toda la página (solo hero)
- ❌ Modos de partículas alternativos configurables (solo este preset, fijo)
- ❌ Interactividad por mouse/touch
- ❌ Lazy-loading dinámico del módulo (es chico, va en el bundle inicial)
- ❌ Tests visuales / snapshots del canvas

## 3. Arquitectura

### 3.1 Componente nuevo: `app/components/ui/HeroParticles.vue`

Encapsula:
- El `<vue-particles>` component de `@tsparticles/vue3`
- La configuración del preset
- La lógica de motion preference (no monta el canvas si `prefers-reduced-motion: reduce`)

Sin props (configuración fija). Sin slots. Una sola responsabilidad: renderizar el fondo de partículas del hero.

### 3.2 Composable nuevo: `app/composables/usePrefersReducedMotion.ts`

Wrapper sobre `window.matchMedia('(prefers-reduced-motion: reduce)')` que devuelve un `Ref<boolean>` reactivo. Se actualiza si el usuario cambia la preferencia en runtime (raro pero posible).

```ts
import { ref, onMounted, onUnmounted } from 'vue'

export function usePrefersReducedMotion() {
  const prefersReduced = ref(false)
  let mq: MediaQueryList | null = null
  const update = () => { prefersReduced.value = mq?.matches ?? false }

  onMounted(() => {
    mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    update()
    mq.addEventListener('change', update)
  })

  onUnmounted(() => {
    mq?.removeEventListener('change', update)
  })

  return prefersReduced
}
```

Vive en `app/composables/` para mantener la convención de Nuxt 4 (auto-imports posibles, aunque aquí lo importaremos explícito por consistencia con el resto del código).

### 3.3 Modificación a `app/components/sections/HeroSection.vue`

Adiciones surgicas:

```vue
<script setup lang="ts">
import SocialLink from '../ui/SocialLink.vue'
import HeroParticles from '../ui/HeroParticles.vue'
import { socials } from '../../content/socials'

const { t } = useI18n()
</script>

<template>
  <section class="hero">
    <ClientOnly>
      <HeroParticles class="hero__particles" />
    </ClientOnly>
    <div class="container py-5 hero__content">
      <!-- contenido existente: title, intro, CTA, socials -->
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero {
  position: relative;       // nuevo
  padding-block: 4rem;
  overflow: hidden;          // nuevo: contiene el canvas si excede

  &__particles {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;    // no interfiere con clics en el contenido
  }

  &__content {
    position: relative;
    z-index: 1;
  }

  &__intro {
    color: $text-muted;
    max-width: 32rem;
    font-size: 1rem;
    margin-bottom: 0;
  }
}
</style>
```

`ClientOnly` evita que Nuxt intente renderizar el canvas en el server (donde `window` no existe).

### 3.4 Inicialización del engine de tsParticles

`@tsparticles/vue3` requiere registrar el engine una vez. Dos opciones:

- **Plugin de Nuxt** (`app/plugins/particles.client.ts`): se ejecuta una vez al iniciar la app cliente. Ventaja: limpio y centralizado. **Elegida.**
- Inicialización in-component dentro de `HeroParticles.vue`: ejecutaría el `loadSlim` cada vez que se monta el componente. Funciona pero ensucia el componente.

```ts
// app/plugins/particles.client.ts
import { defineNuxtPlugin } from '#app'
import { loadSlim } from '@tsparticles/slim'

export default defineNuxtPlugin(async (nuxtApp) => {
  const Particles = await import('@tsparticles/vue3')
  nuxtApp.vueApp.use(Particles.default, {
    init: async (engine: any) => {
      await loadSlim(engine)
    },
  })
})
```

El sufijo `.client.ts` hace que Nuxt solo lo cargue del lado cliente — coherente con el `<ClientOnly>` del componente.

### 3.5 Configuración de partículas (constante en `HeroParticles.vue`)

```ts
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
  interactivity: { events: {} }, // sin hover/click effects
  detectRetina: true,
}
```

## 4. Tests

`tests/components/HeroParticles.test.ts` — un solo test:

- **Test**: si `usePrefersReducedMotion` devuelve `true`, el componente NO renderiza el `<vue-particles>` element ni el canvas. El componente devuelve un `<template>` vacío (o un comentario placeholder).

Mockeamos `usePrefersReducedMotion` para forzar el valor en cada caso.

No testeamos:
- El render visual del canvas (es animación, frágil de testear)
- El config exacto de partículas (cambios estéticos no merecen un snapshot)
- El plugin de inicialización (su contrato es: el engine carga; no tiene rama de error razonable)

## 5. Verificación manual pre-merge

1. `npm run dev`, abrir `http://localhost:3000/es`. Hero debe mostrar puntitos blancos flotando con líneas finas. Movimiento lento y sutil.
2. DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion" = `reduce`. Recargar. Hero debe verse sin partículas (igual que antes de esta feature).
3. Scroll abajo: las partículas siguen renderizándose en el hero pero quedan fuera de viewport (no notorio). Performance OK.
4. `npm run generate`. El build debe funcionar; revisar tamaño del JS bundle: comparar `.output/public/_nuxt/*.js` con el baseline pre-particles. Aceptable: hasta +50 KB gzipped.
5. `npm test` — todos los tests existentes (12) más el nuevo deben pasar (13 total).
6. `npm run typecheck` — exit 0.

## 6. Manejo de errores

- **tsParticles falla al inicializar**: el plugin captura excepciones y logea por consola. Sin partículas, el sitio sigue funcionando (es decoración).
- **Canvas no soportado en el navegador (caso muy raro)**: tsParticles ya tiene fallback (no renderiza, no rompe).
- **JS deshabilitado**: no se carga ninguna partícula; el HTML estático SSG sigue mostrando el contenido del hero normalmente.

## 7. Performance

- Engine slim (~30 KB gzipped) + Vue3 wrapper (~3 KB gzipped) = +33 KB al bundle JS. Aceptable.
- 50 partículas + canvas a 60fps: uso de CPU bajo en hardware moderno (~1-3% en un MacBook M1).
- En móvil/hardware antiguo: tsParticles auto-ajusta densidad por área del viewport (`density.enable: true`); móviles renderizan menos partículas.
- Cuando el usuario hace scroll fuera del hero, el canvas sigue corriendo (no se puede pausar fácilmente sin Intersection Observer; la complejidad no justifica la ganancia para una sola sección pequeña).

## 8. Lo que NO incluimos

- ❌ Pausa al hacer scroll fuera del hero (Intersection Observer) — overhead innecesario para un canvas pequeño
- ❌ Configuración de partículas customizable por prop — fijo
- ❌ Múltiples presets seleccionables — fijo en "links"
- ❌ Tests visuales / snapshots
- ❌ Carga lazy del módulo — es chico, va en el bundle inicial
- ❌ Rastreo de mouse / efectos interactivos
