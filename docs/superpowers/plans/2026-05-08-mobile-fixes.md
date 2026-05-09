# Mobile fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix six mobile UX issues in the portfolio: missing mobile nav, table overflow, excessive vertical padding, oversized photo, sub-44px touch targets, and a CTA misalignment.

**Architecture:** New `MobileNav.vue` component (hamburger + slide-in drawer with backdrop). The work-table goes from `<table>` rows to stacked block layout via media queries in `_components.scss`. Section padding becomes responsive (`2.5rem` mobile / `4rem` desktop). Photo gets `max-height: 60vh` in mobile/tablet. Touch targets bumped to ≥44px on social/lang links. Hero CTA centered in mobile, right-aligned on desktop.

**Tech Stack:** Vue 3.5 SFCs, SCSS with media queries (`@media (max-width: 767.98px)` for "below md"). Bootstrap Icons (`bi-list`, `bi-x-lg`). Vitest + Vue Test Utils for `MobileNav` behavior.

---

## File Structure

**To create:**
- `app/components/layout/MobileNav.vue` — hamburger button + slide-in drawer
- `tests/components/MobileNav.test.ts` — toggle/aria/close-on-link behavior

**To modify:**
- `i18n/locales/es.json` and `en.json` — add `nav.openMenu` and `nav.closeMenu` keys
- `app/components/layout/SiteHeader.vue` — mount `MobileNav` (visible only `<md`)
- `app/components/sections/HeroSection.vue` — center CTA on mobile, responsive padding
- `app/components/sections/AboutSection.vue` — responsive padding, photo max-height
- `app/components/sections/WorkSection.vue` — responsive padding, title centered on mobile, give `<h2>` a class
- `app/assets/scss/_components.scss` — work-table mobile rules + touch-target padding bumps

---

## Task 1: Add i18n keys for mobile nav button

**Files:**
- Modify: `i18n/locales/es.json`
- Modify: `i18n/locales/en.json`

- [ ] **Step 1: Update `i18n/locales/es.json`**

Replace the `"nav"` block (currently `{ "about": "Sobre mí", "work": "Experiencia" }`) with:

```json
"nav": {
  "about": "Sobre mí",
  "work": "Experiencia",
  "openMenu": "Abrir menú",
  "closeMenu": "Cerrar menú"
},
```

- [ ] **Step 2: Update `i18n/locales/en.json`**

Replace the `"nav"` block with:

```json
"nav": {
  "about": "About",
  "work": "Work",
  "openMenu": "Open menu",
  "closeMenu": "Close menu"
},
```

- [ ] **Step 3: Verify JSON is valid**

Run:
```bash
node -e "JSON.parse(require('fs').readFileSync('i18n/locales/es.json'))" && \
node -e "JSON.parse(require('fs').readFileSync('i18n/locales/en.json'))" && \
echo OK
```
Expected output: `OK`.

- [ ] **Step 4: Commit**

```bash
git add i18n/locales/es.json i18n/locales/en.json
git -c user.name="Miguel Angel Escamilla" -c user.email="rodrigo.tejero@thewebchi.mp" commit -m "feat(i18n): add mobile menu open/close labels"
```

---

## Task 2: Build `MobileNav` component (TDD)

**Files:**
- Test: `tests/components/MobileNav.test.ts`
- Create: `app/components/layout/MobileNav.vue`

⚠ Conventions reminder:
- Inside `app/`: relative imports for siblings.
- Tests: `~/app/...` alias paths.
- Nuxt auto-imports (`useI18n`) are stubbed as globals in `tests/setup.ts`.

- [ ] **Step 1: Write the failing test**

Create `tests/components/MobileNav.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MobileNav from '~/app/components/layout/MobileNav.vue'

describe('MobileNav', () => {
  it('starts closed: aria-expanded false, no drawer rendered', () => {
    const wrapper = mount(MobileNav)
    const button = wrapper.get('button')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.mobile-nav__drawer').exists()).toBe(false)
  })

  it('opens drawer on toggle: aria-expanded true, drawer rendered, icon switches', async () => {
    const wrapper = mount(MobileNav)
    const button = wrapper.get('button')

    expect(button.find('i').classes()).toContain('bi-list')

    await button.trigger('click')

    expect(button.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.mobile-nav__drawer').exists()).toBe(true)
    expect(button.find('i').classes()).toContain('bi-x-lg')
  })

  it('closes drawer when an in-drawer link is clicked', async () => {
    const wrapper = mount(MobileNav)
    await wrapper.get('button').trigger('click')
    expect(wrapper.find('.mobile-nav__drawer').exists()).toBe(true)

    const links = wrapper.findAll('.mobile-nav__drawer a')
    expect(links.length).toBeGreaterThan(0)

    await links[0].trigger('click')
    expect(wrapper.find('.mobile-nav__drawer').exists()).toBe(false)
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('false')
  })

  it('closes drawer when backdrop is clicked', async () => {
    const wrapper = mount(MobileNav)
    await wrapper.get('button').trigger('click')

    const backdrop = wrapper.get('.mobile-nav__backdrop')
    await backdrop.trigger('click')

    expect(wrapper.find('.mobile-nav__drawer').exists()).toBe(false)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

Run: `npm test -- MobileNav`
Expected: FAIL — module `~/app/components/layout/MobileNav.vue` not found.

- [ ] **Step 3: Implement `app/components/layout/MobileNav.vue`**

```vue
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
```

> **Notes:**
> - Two `<style>` blocks: one scoped (for the toggle button), one unscoped (for `.mobile-nav__backdrop` and `.mobile-nav__drawer` because `<Teleport>` moves them to `<body>`, outside the scoped data-attribute scope).
> - Two `watch` calls on `isOpen` for clarity (one for body overflow, one for Escape listener). Could be merged but kept separate for readability.
> - Drawer width: `min(85vw, 320px)` — fits small phones (320px wide → drawer 272px = 85%) without being huge on tablets.
> - `bi-x-lg` is the Bootstrap Icons "close" symbol — heavier than `bi-x` so it visually balances `bi-list`.

- [ ] **Step 4: Run tests — verify they pass**

Run: `npm test`
Expected: 21 tests passing total (4 new MobileNav + 17 existing).

- [ ] **Step 5: Run typecheck**

Run: `set -o pipefail; npm run typecheck > /dev/null 2>&1; echo "EXIT: $?"`
Expected: `EXIT: 0`.

- [ ] **Step 6: Commit**

```bash
git add app/components/layout/MobileNav.vue tests/components/MobileNav.test.ts
git -c user.name="Miguel Angel Escamilla" -c user.email="rodrigo.tejero@thewebchi.mp" commit -m "feat: add MobileNav component with hamburger drawer"
```

---

## Task 3: Mount `MobileNav` in `SiteHeader`

**Files:**
- Modify: `app/components/layout/SiteHeader.vue`

- [ ] **Step 1: Replace the contents of `app/components/layout/SiteHeader.vue`**

```vue
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
          <a href="#about" class="site-header__link">{{ t('nav.about') }}</a>
          <a href="#work"  class="site-header__link">{{ t('nav.work') }}</a>
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
```

The diff vs. the previous version is exactly:
- **Script:** `import MobileNav from './MobileNav.vue'`
- **Template:** added `gap-3` on the outer flex container; wrapped `<MobileNav>` and `<LanguageSwitcher>` in a `<div class="d-flex align-items-center gap-2">` so they sit side-by-side on the right edge

- [ ] **Step 2: Verify tests + typecheck**

Run: `npm test`
Expected: 21 tests still passing.

Run: `set -o pipefail; npm run typecheck > /dev/null 2>&1; echo "EXIT: $?"`
Expected: `EXIT: 0`.

- [ ] **Step 3: Commit**

```bash
git add app/components/layout/SiteHeader.vue
git -c user.name="Miguel Angel Escamilla" -c user.email="rodrigo.tejero@thewebchi.mp" commit -m "feat: mount MobileNav in SiteHeader for <md viewports"
```

---

## Task 4: Responsive padding + touch targets in `_components.scss`

**Files:**
- Modify: `app/assets/scss/_components.scss`

This task adds the work-table mobile stack rules AND the touch-target padding bumps in the same commit (both edit the same file, related concern: mobile polish in shared styles).

- [ ] **Step 1: Replace `app/assets/scss/_components.scss`**

```scss
.btn-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.75rem;
  border: 1px solid $border-subtle;
  border-radius: 999px;
  background: transparent;
  color: $text-primary;
  text-decoration: none;
  transition: background 150ms ease, border-color 150ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: $text-primary;
    color: $text-primary;
  }
}

.btn-pill--solid {
  background: $accent;
  color: $bg-primary;

  &:hover {
    background: $text-primary;
    color: $bg-primary;
  }
}

.skill-group {
  border: 1px solid $border-subtle;
  border-radius: $border-radius-lg;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.02);

  &__title {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: $text-primary;
  }

  &__items {
    color: $text-muted;
    font-size: 0.95rem;
    line-height: 1.7;
  }
}

.work-table {
  width: 100%;
  border-collapse: collapse;

  td {
    padding: 1rem 1.25rem;
    border-top: 1px solid $border-subtle;
    vertical-align: middle;
  }

  tr:last-child td { border-bottom: 1px solid $border-subtle; }

  @media (max-width: 767.98px) {
    &, tbody, tr, td { display: block; width: 100%; }
    tr {
      padding: 1rem 0;
      border-top: 1px solid $border-subtle;
    }
    tr:last-child { border-bottom: 1px solid $border-subtle; }
    td {
      padding: 0.25rem 0;
      border: none;

      &:first-child {
        color: $text-muted;
        font-size: 0.875rem;
      }
    }
  }
}

.work-row--highlight {
  background: $accent;
  color: $bg-primary;

  td { color: $bg-primary; }
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 1px solid $border-subtle;
  border-radius: 999px;
  color: $text-primary;
  text-decoration: none;
  font-size: 0.875rem;
  transition: background 150ms ease;

  &:hover { background: rgba(255, 255, 255, 0.08); color: $text-primary; }

  i { font-size: 1rem; }
}

.lang-switcher {
  display: inline-flex;
  flex-direction: column;
  font-size: 0.875rem;

  a {
    color: $text-muted;
    text-decoration: none;
    line-height: 1.4;
    padding: 0.25rem 0.5rem;

    &.active { color: $text-primary; font-weight: 600; }
    &:hover  { color: $text-primary; }
  }
}
```

Diffs vs. previous version:
- `.work-table` gets a `@media (max-width: 767.98px)` block that turns rows into stacked blocks
- `.social-link`: `padding: 0.5rem 1rem` → `0.625rem 1rem` (≈+4px height → close to 44px)
- `.lang-switcher a`: added `padding: 0.25rem 0.5rem` (gives a tap area without making the column visually huge)

- [ ] **Step 2: Verify build**

Run: `npm run generate`
Expected: succeeds (Sass deprecation warnings about `@import` are pre-existing, ignore).

- [ ] **Step 3: Verify tests + typecheck**

Run: `npm test` → 21 passing.
Run: `set -o pipefail; npm run typecheck > /dev/null 2>&1; echo "EXIT: $?"` → `0`.

- [ ] **Step 4: Commit**

```bash
git add app/assets/scss/_components.scss
git -c user.name="Miguel Angel Escamilla" -c user.email="rodrigo.tejero@thewebchi.mp" commit -m "style: stack work-table on mobile + bump touch targets ≥44px"
```

---

## Task 5: Responsive section padding + Hero CTA centering

**Files:**
- Modify: `app/components/sections/HeroSection.vue`

- [ ] **Step 1: Replace the contents of `app/components/sections/HeroSection.vue`**

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

        <div class="col-lg-4 text-center text-lg-end">
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
  padding-block: 2.5rem;
  overflow: hidden;

  @media (min-width: 768px) { padding-block: 4rem; }

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

Diffs vs. previous:
- Template: `class="col-lg-4 text-lg-end"` → `class="col-lg-4 text-center text-lg-end"`
- Style: `padding-block: 4rem` → `padding-block: 2.5rem` plus a `@media (min-width: 768px)` override to `4rem`

- [ ] **Step 2: Verify tests + typecheck**

Run: `npm test` → 21 passing.
Run: `set -o pipefail; npm run typecheck > /dev/null 2>&1; echo "EXIT: $?"` → `0`.

- [ ] **Step 3: Commit**

```bash
git add app/components/sections/HeroSection.vue
git -c user.name="Miguel Angel Escamilla" -c user.email="rodrigo.tejero@thewebchi.mp" commit -m "style(hero): responsive padding + centered CTA on mobile"
```

---

## Task 6: Responsive padding + photo max-height in `AboutSection`

**Files:**
- Modify: `app/components/sections/AboutSection.vue`

- [ ] **Step 1: Replace the contents of `app/components/sections/AboutSection.vue`**

```vue
<script setup lang="ts">
import SkillGroup from '../ui/SkillGroup.vue'
import { skillGroups } from '../../content/skills'

const { t } = useI18n()
</script>

<template>
  <section id="about" class="about">
    <div class="container py-5">
      <div class="row mb-4 g-4">
        <div class="col-md-4">
          <span class="section-label">{{ t('about.label') }}</span>
        </div>
        <div class="col-md-8">
          <p class="about__intro">{{ t('about.intro') }}</p>
        </div>
      </div>

      <div class="row g-4 align-items-start">
        <div class="col-lg-7 d-flex flex-column gap-3">
          <SkillGroup
            v-for="group in skillGroups"
            :key="group.id"
            :title-key="`about.skillsTitle.${group.id}`"
            :items="group.items"
          />
        </div>

        <div class="col-lg-5">
          <img
            src="/images/photo-placeholder.svg"
            :alt="t('about.photoAlt')"
            class="about__photo img-fluid rounded-4"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.about {
  padding-block: 2.5rem;

  @media (min-width: 768px) { padding-block: 4rem; }

  &__intro {
    font-size: 1.125rem;
    color: $text-primary;
  }

  &__photo {
    filter: grayscale(100%);
    width: 100%;
    border: 1px solid $border-subtle;
    max-height: 60vh;
    object-fit: cover;

    @media (min-width: 992px) {
      max-height: none;
    }
  }
}
</style>
```

Diffs vs. previous:
- Style: `.about` gets responsive padding-block
- Style: `.about__photo` gets `max-height: 60vh` + `object-fit: cover`, with a `@media (min-width: 992px)` override to `none` (so on `lg+` it can take its natural height)

- [ ] **Step 2: Verify tests + typecheck**

Run: `npm test` → 21 passing.
Run: `set -o pipefail; npm run typecheck > /dev/null 2>&1; echo "EXIT: $?"` → `0`.

- [ ] **Step 3: Commit**

```bash
git add app/components/sections/AboutSection.vue
git -c user.name="Miguel Angel Escamilla" -c user.email="rodrigo.tejero@thewebchi.mp" commit -m "style(about): responsive padding + cap photo at 60vh on small screens"
```

---

## Task 7: Responsive padding + title alignment in `WorkSection`

**Files:**
- Modify: `app/components/sections/WorkSection.vue`

- [ ] **Step 1: Replace the contents of `app/components/sections/WorkSection.vue`**

```vue
<script setup lang="ts">
import { jobs } from '../../content/work'
import { calculateExperience } from '../../utils/experience'

const { t } = useI18n()
const total = calculateExperience(jobs)

function formatRange(start: string, end: string | 'present'): string {
  const startYear = start.slice(0, 4)
  if (end === 'present') return `${startYear} - ${t('work.present')}`
  const endYear = end.slice(0, 4)
  return startYear === endYear ? startYear : `${startYear} - ${endYear}`
}

function durationFor(start: string, end: string | 'present'): string {
  const single = calculateExperience(
    [{ id: 'tmp', start, end, company: '', roleKey: '' }],
  )
  return t('work.duration', { years: single.years, months: single.months })
}
</script>

<template>
  <section id="work" class="work">
    <div class="container py-5">
      <h2 class="display-section work__title mb-4">{{ t('work.title') }}</h2>

      <table class="work-table">
        <tbody>
          <tr v-for="job in jobs" :key="job.id">
            <td>
              <div>{{ formatRange(job.start, job.end) }}</div>
              <small class="text-muted">{{ durationFor(job.start, job.end) }}</small>
            </td>
            <td>{{ job.company }}</td>
            <td>{{ t(job.roleKey) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="text-end mt-3 work__total">
        <div>{{ t('work.totalLabel') }}</div>
        <strong>{{ t('work.yearsMonths', { years: total.years, months: total.months }) }}</strong>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.work {
  padding-block: 2.5rem;

  @media (min-width: 768px) { padding-block: 4rem; }

  &__title {
    text-align: center;
    @media (min-width: 768px) { text-align: end; }
  }

  &__total {
    color: $text-muted;
    font-size: 0.95rem;
    strong { color: $text-primary; display: block; }
  }
}
</style>
```

Diffs vs. previous:
- Template: `<h2 class="display-section text-end mb-4">` → `<h2 class="display-section work__title mb-4">` (drop `text-end`, add `work__title`)
- Style: `.work` gets responsive padding-block; new `&__title` rule with responsive `text-align`

- [ ] **Step 2: Verify tests + typecheck**

Run: `npm test` → 21 passing.
Run: `set -o pipefail; npm run typecheck > /dev/null 2>&1; echo "EXIT: $?"` → `0`.

- [ ] **Step 3: Commit**

```bash
git add app/components/sections/WorkSection.vue
git -c user.name="Miguel Angel Escamilla" -c user.email="rodrigo.tejero@thewebchi.mp" commit -m "style(work): responsive padding + center title on mobile"
```

---

## Task 8: Static build sanity check

**Files:** none — verification gate.

- [ ] **Step 1: Run static build**

Run: `npm run generate`
Expected: succeeds. Inspect last lines of output to confirm prerender finished without errors.

- [ ] **Step 2: Confirm key files exist**

Check:
```bash
ls .output/public/.nojekyll .output/public/404.html .output/public/es/index.html .output/public/en/index.html
```
Expected: all 4 listed without errors.

- [ ] **Step 3: Done**

No commit. The build is verified; the next gate (Task 9) is a human in the browser.

---

## Task 9: Manual smoke test (human)

**Files:** none — human verification gate.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` in the background; let it boot ~10s. Open http://localhost:3000/es in the browser.

- [ ] **Step 2: Test at iPhone SE width (375×667)**

In DevTools, switch to responsive mode at **375×667**. Reload. Verify:

- **Header:** name (left), hamburger button + En/Es switcher (right). No inline nav. The hamburger is a circular button, ~44×44px.
- **Tap the hamburger:** drawer slides in from the right with a dark backdrop. The hamburger icon swaps to an X.
- **Tap "Sobre mí":** drawer closes, page smooth-scrolls down to About.
- **Open drawer again, tap the backdrop:** drawer closes.
- **Open drawer, press Escape (in DevTools console: hit Esc focused on the page):** drawer closes.
- **Hero:** title big, intro under it, CTA "Proyectos" centered (not stuck right or left), social links wrap on multiple rows centered.
- **About:** photo placeholder visible at most ~60% of viewport height; doesn't dominate the screen.
- **Work:** each job shows as a stacked block (date + duration on its own line, company on its own line, role on its own line). No horizontal scroll. Title "Experiencia" centered above.
- **Scroll page top to bottom** — no horizontal overflow at any point. Header stays sticky.

- [ ] **Step 3: Test at iPhone 14 Plus width (414×896)**

Same checks, slightly more comfortable layout.

- [ ] **Step 4: Test at iPad portrait (768×1024)**

The hamburger button should disappear; the inline nav ("Sobre mí" / "Experiencia") should appear.
The work-table should render as a 3-column table again.
About photo can be taller (no `max-height` cap on `lg+`).

- [ ] **Step 5: Stop the dev server**

Stop the background process.

- [ ] **Step 6: Done**

If anything visually surprising appeared, report back; otherwise the task is complete.
