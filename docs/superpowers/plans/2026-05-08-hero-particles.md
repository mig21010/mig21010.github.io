# Hero particles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a subtle decorative particle background (white dots + connecting lines) behind the hero section, respecting `prefers-reduced-motion`.

**Architecture:** New `HeroParticles.vue` component encapsulating tsParticles config, mounted inside `HeroSection.vue` as an absolutely-positioned background layer wrapped in `<ClientOnly>`. A `usePrefersReducedMotion` composable short-circuits rendering when the user requests reduced motion. tsParticles engine is initialized once via a Nuxt client plugin.

**Tech Stack:** `@tsparticles/vue3` (Vue 3 wrapper) + `@tsparticles/slim` (slim engine bundle including the "links" preset).

---

## File Structure

**To create:**
- `app/composables/usePrefersReducedMotion.ts` — reactive media-query wrapper
- `app/plugins/particles.client.ts` — registers tsParticles Vue plugin once on the client
- `app/components/ui/HeroParticles.vue` — particle config + canvas wrapper
- `tests/composables/usePrefersReducedMotion.test.ts` — unit test for the composable
- `tests/components/HeroParticles.test.ts` — verifies the canvas isn't rendered when reduced motion is requested

**To modify:**
- `package.json` — add `@tsparticles/vue3` and `@tsparticles/slim` dev/runtime deps
- `app/components/sections/HeroSection.vue` — wrap content with positioned layers, mount `HeroParticles`
- `tests/setup.ts` — stub `defineNuxtPlugin` global if needed by component imports (we'll see in Task 4)

---

## Task 1: Install tsParticles dependencies

**Files:**
- Modify: `package.json` (add 2 deps)

- [ ] **Step 1: Install the two packages**

Run:

```bash
npm install @tsparticles/vue3 @tsparticles/slim
```

Expected: both packages added to `package.json` `dependencies`. The install should complete cleanly. Some peer-dep warnings about Vue version are normal (they support Vue 3.x).

- [ ] **Step 2: Verify versions**

Read `package.json` and confirm the new entries appear under `"dependencies"`. Both should be `^3.x.x` (the v3 generation of tsParticles). Note the exact installed versions for reference in later tasks.

- [ ] **Step 3: Verify build still works**

Run: `npm run generate`
Expected: succeeds. No new errors related to the packages (they're not used by code yet).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git -c user.name="Miguel Angel Escamilla" -c user.email="rodrigo.tejero@thewebchi.mp" commit -m "chore: install @tsparticles/vue3 and @tsparticles/slim"
```

(If git identity is already configured globally, the inline `-c` flags can be dropped. Same for every commit step below.)

---

## Task 2: Create `usePrefersReducedMotion` composable (TDD)

**Files:**
- Test: `tests/composables/usePrefersReducedMotion.test.ts`
- Create: `app/composables/usePrefersReducedMotion.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/composables/usePrefersReducedMotion.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { usePrefersReducedMotion } from '~/app/composables/usePrefersReducedMotion'

type Listener = (e: { matches: boolean }) => void

function makeMediaQueryList(initial: boolean) {
  const listeners: Listener[] = []
  const mql = {
    matches: initial,
    addEventListener: (_event: string, listener: Listener) => listeners.push(listener),
    removeEventListener: (_event: string, listener: Listener) => {
      const i = listeners.indexOf(listener)
      if (i >= 0) listeners.splice(i, 1)
    },
    dispatchChange: (matches: boolean) => {
      mql.matches = matches
      for (const l of listeners) l({ matches })
    },
  }
  return mql
}

const Harness = defineComponent({
  setup() {
    const reduced = usePrefersReducedMotion()
    return () => h('div', { 'data-reduced': String(reduced.value) })
  },
})

describe('usePrefersReducedMotion', () => {
  let mql: ReturnType<typeof makeMediaQueryList>

  beforeEach(() => {
    mql = makeMediaQueryList(false)
    vi.stubGlobal('matchMedia', vi.fn(() => mql))
  })

  it('returns false when prefers-reduced-motion is not set', async () => {
    const wrapper = mount(Harness)
    await flushPromises()
    expect(wrapper.attributes('data-reduced')).toBe('false')
  })

  it('returns true when prefers-reduced-motion is set on mount', async () => {
    mql = makeMediaQueryList(true)
    vi.stubGlobal('matchMedia', vi.fn(() => mql))

    const wrapper = mount(Harness)
    await flushPromises()
    expect(wrapper.attributes('data-reduced')).toBe('true')
  })

  it('updates reactively when the media query changes', async () => {
    const wrapper = mount(Harness)
    await flushPromises()
    expect(wrapper.attributes('data-reduced')).toBe('false')

    mql.dispatchChange(true)
    await flushPromises()
    expect(wrapper.attributes('data-reduced')).toBe('true')
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

Run: `npm test -- usePrefersReducedMotion`
Expected: FAIL — module `~/app/composables/usePrefersReducedMotion` not found.

- [ ] **Step 3: Implement the composable**

Create `app/composables/usePrefersReducedMotion.ts`:

```ts
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
```

> **Note:** Reads `window.matchMedia` only inside `onMounted` so the composable is SSR-safe. The composable is only ever called from a `<ClientOnly>` subtree in production, but safer to guard anyway.

- [ ] **Step 4: Run tests — verify they pass**

Run: `npm test`
Expected: PASS — all 3 new tests green; the existing 12 tests still pass. Total 15.

- [ ] **Step 5: Run typecheck**

Run: `set -o pipefail; npm run typecheck > /dev/null 2>&1; echo "EXIT: $?"`
Expected: `EXIT: 0`.

- [ ] **Step 6: Commit**

```bash
git add app/composables/usePrefersReducedMotion.ts tests/composables/usePrefersReducedMotion.test.ts
git -c user.name="Miguel Angel Escamilla" -c user.email="rodrigo.tejero@thewebchi.mp" commit -m "feat: add usePrefersReducedMotion composable with tests"
```

---

## Task 3: Create the tsParticles Nuxt plugin

**Files:**
- Create: `app/plugins/particles.client.ts`

- [ ] **Step 1: Verify the actual API of `@tsparticles/vue3`**

The exact import shape can vary slightly between minor versions. Inspect what's installed:

```bash
node -e "const p = require('@tsparticles/vue3'); console.log(Object.keys(p))"
```

Expected output is something like `[ 'default', 'install' ]` (default export is the Vue plugin) or `[ 'install', 'VueParticles' ]`. Note which export shape is present.

The two patterns that the v3 line generally supports are:
- **Pattern A (default export):** `import Particles from '@tsparticles/vue3'; app.use(Particles, { init })`
- **Pattern B (named install):** `import { install } from '@tsparticles/vue3'; install(app, { init })`

Use whichever pattern matches the installed package's exports. The Step 2 code uses Pattern A; switch to Pattern B if the inspection in Step 1 shows no default export.

- [ ] **Step 2: Create `app/plugins/particles.client.ts`**

```ts
import Particles from '@tsparticles/vue3'
import { loadSlim } from '@tsparticles/slim'
import type { Engine } from '@tsparticles/engine'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Particles, {
    init: async (engine: Engine) => {
      await loadSlim(engine)
    },
  })
})
```

> **Notes:**
> - The `.client.ts` filename suffix tells Nuxt to only run this plugin in the browser (perfect — `tsParticles` needs `window`).
> - `defineNuxtPlugin` is auto-imported by Nuxt; don't add an explicit import.
> - If the package doesn't ship type declarations for `@tsparticles/engine`, replace the type import with `import type { Engine } from '@tsparticles/engine/types'` or fall back to `(engine: any) => ...` with a `// eslint-disable-next-line` comment if any-types are flagged. Pragmatic: if the type isn't exported, use `any` here since the plugin is small and well-isolated.
> - If Step 1 showed Pattern B (no default export), replace this file's body with:
>   ```ts
>   import { install } from '@tsparticles/vue3'
>   import { loadSlim } from '@tsparticles/slim'
>
>   export default defineNuxtPlugin((nuxtApp) => {
>     install(nuxtApp.vueApp, {
>       init: async (engine: any) => {
>         await loadSlim(engine)
>       },
>     })
>   })
>   ```

- [ ] **Step 3: Verify the plugin loads without errors**

Run: `npm run generate`
Expected: build succeeds. The plugin is bundled but only invoked client-side, so the SSG render pass shouldn't even touch it.

If you see a Vite/Rollup error about importing tsParticles in a server context, that's a sign Nuxt is trying to evaluate the `.client.ts` plugin server-side. Confirm the filename is `particles.client.ts` (not `particles.ts`). If the error persists, wrap the plugin body's contents in `if (import.meta.client) { ... }` as a belt-and-braces fix.

- [ ] **Step 4: Commit**

```bash
git add app/plugins/particles.client.ts
git -c user.name="Miguel Angel Escamilla" -c user.email="rodrigo.tejero@thewebchi.mp" commit -m "feat: add tsParticles Nuxt client plugin"
```

---

## Task 4: Build `HeroParticles` component (TDD)

**Files:**
- Test: `tests/components/HeroParticles.test.ts`
- Create: `app/components/ui/HeroParticles.vue`

- [ ] **Step 1: Write the failing test**

Create `tests/components/HeroParticles.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import HeroParticles from '~/app/components/ui/HeroParticles.vue'

vi.mock('~/app/composables/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: vi.fn(),
}))

import { usePrefersReducedMotion } from '~/app/composables/usePrefersReducedMotion'

describe('HeroParticles', () => {
  it('renders the particles canvas wrapper when reduced motion is NOT requested', () => {
    vi.mocked(usePrefersReducedMotion).mockReturnValue(ref(false))

    const wrapper = mount(HeroParticles, {
      global: {
        stubs: {
          // The real <vue-particles> component is registered by the plugin in production.
          // In tests, stub it so we can assert on its presence without booting tsParticles.
          'vue-particles': { template: '<div class="vue-particles-stub" />' },
        },
      },
    })

    expect(wrapper.find('.vue-particles-stub').exists()).toBe(true)
  })

  it('renders nothing when reduced motion IS requested', () => {
    vi.mocked(usePrefersReducedMotion).mockReturnValue(ref(true))

    const wrapper = mount(HeroParticles, {
      global: {
        stubs: { 'vue-particles': { template: '<div class="vue-particles-stub" />' } },
      },
    })

    expect(wrapper.find('.vue-particles-stub').exists()).toBe(false)
    // The component's root template should be empty (just a comment node, equivalent to <!---->).
    expect(wrapper.html()).toBe('<!--v-if-->')
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

Run: `npm test -- HeroParticles`
Expected: FAIL — module `~/app/components/ui/HeroParticles.vue` not found.

- [ ] **Step 3: Create `app/components/ui/HeroParticles.vue`**

```vue
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
```

> **Notes:**
> - `vue-particles` is registered globally by the Nuxt plugin (Task 3), so it doesn't need to be imported here.
> - Relative import for the composable matches the convention established earlier in the project (Nuxt 4's `~` alias resolves to `app/`).
> - `v-if="!reduced"` is what makes the component "render nothing" when motion is reduced — Vue replaces the absent element with a placeholder comment that the test asserts on.

- [ ] **Step 4: Run tests — verify they pass**

Run: `npm test`
Expected: PASS — both `HeroParticles` tests green; existing 15 still green; total 17.

- [ ] **Step 5: Run typecheck**

Run: `set -o pipefail; npm run typecheck > /dev/null 2>&1; echo "EXIT: $?"`
Expected: `EXIT: 0`.

If typecheck fails because `vue-particles` isn't a known global element, add a small ambient declaration to the project. Create `app/types/components.d.ts`:

```ts
declare module 'vue' {
  export interface GlobalComponents {
    'vue-particles': any
  }
}
export {}
```

Then re-run typecheck. If still failing, report BLOCKED with the exact error.

- [ ] **Step 6: Commit**

```bash
git add app/components/ui/HeroParticles.vue tests/components/HeroParticles.test.ts
# Also add the types file if you needed to create it:
# git add app/types/components.d.ts
git -c user.name="Miguel Angel Escamilla" -c user.email="rodrigo.tejero@thewebchi.mp" commit -m "feat: add HeroParticles component with motion-preference handling"
```

---

## Task 5: Wire `HeroParticles` into `HeroSection`

**Files:**
- Modify: `app/components/sections/HeroSection.vue`

- [ ] **Step 1: Update the component**

Replace the current contents of `app/components/sections/HeroSection.vue` with:

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
      <div class="row align-items-end g-4">
        <div class="col-lg-8">
          <h1 class="display-hero mb-3">{{ t('hero.title') }}</h1>
          <p class="hero__intro">{{ t('hero.intro') }}</p>
        </div>

        <div class="col-lg-4 text-lg-end">
          <a href="#work" class="btn-pill btn-pill--solid">
            {{ t('hero.cta') }}
            <i class="bi bi-arrow-right" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div class="hero__socials mt-5 d-flex flex-wrap gap-3 justify-content-center">
        <SocialLink
          v-for="s in socials"
          :key="s.id"
          :icon="s.icon"
          :url="s.url"
          :label="s.label"
        />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero {
  position: relative;
  padding-block: 4rem;
  overflow: hidden;

  &__particles {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
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

The diff vs. the previous version is exactly:
- **Script:** added `import HeroParticles from '../ui/HeroParticles.vue'`
- **Template:** wrapped existing `.container` in `.hero__content` and added `<ClientOnly><HeroParticles class="hero__particles" /></ClientOnly>` as its first child
- **Style:** added `position: relative`, `overflow: hidden` to `.hero`; added `&__particles` and `&__content` rules

- [ ] **Step 2: Run tests — confirm nothing broke**

Run: `npm test`
Expected: PASS — 17 tests still green.

- [ ] **Step 3: Run typecheck**

Run: `set -o pipefail; npm run typecheck > /dev/null 2>&1; echo "EXIT: $?"`
Expected: `EXIT: 0`.

- [ ] **Step 4: Verify static build still works and bundle size hasn't ballooned**

Run: `npm run generate`. Expected: succeeds. Inspect the generated client JS bundles:

```bash
ls -la .output/public/_nuxt/*.js
```

Compare total size against the previous generate (mentally — we don't store a baseline file). The added weight from tsParticles slim + Vue3 wrapper should be roughly 30–40 KB *uncompressed*. If you see a multi-hundred-KB jump, something pulled in the full tsParticles bundle by accident — investigate before continuing.

- [ ] **Step 5: Commit**

```bash
git add app/components/sections/HeroSection.vue
git -c user.name="Miguel Angel Escamilla" -c user.email="rodrigo.tejero@thewebchi.mp" commit -m "feat: mount HeroParticles inside HeroSection"
```

---

## Task 6: Manual smoke test in the browser

This task has no commit — it's a verification gate before considering the feature done.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (run in the background; let it boot ~10 s).

- [ ] **Step 2: Open `http://localhost:3000/es` in a browser**

Verify:
- The hero shows white dots floating slowly behind the title.
- Lines connect dots when they get close (~150 px).
- Movement is unhurried; the title text remains clearly readable.
- The CTA button and social links remain clickable (they're above the canvas thanks to `pointer-events: none` on the canvas wrapper and `z-index: 1` on `.hero__content`).
- Scroll down — the rest of the page (About, Work) is unaffected.

- [ ] **Step 3: Test reduced motion**

In the browser DevTools:
- Open the **Rendering** panel (Chrome/Edge: ⋮ → More tools → Rendering).
- Find "Emulate CSS media feature prefers-reduced-motion" and set it to **`reduce`**.
- Reload the page.

The hero should now render WITHOUT particles — just the title, intro, CTA, and socials on the plain dark background.

Reset the emulation to "No emulation" when finished.

- [ ] **Step 4: Stop the dev server**

Stop the background dev server.

- [ ] **Step 5: Done**

The feature is verified. No additional commit; the work is captured in Tasks 1–5.
