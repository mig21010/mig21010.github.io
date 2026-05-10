# Projects section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Projects" section between About and Work showing 2 real projects (360 Caribe, Legaliax) as wide stacked cards with image, title, description, tech stack, and a "View live" CTA.

**Architecture:** New `ProjectsSection.vue` (composition wrapper) iterates a typed array `app/content/projects.ts` and renders one `ProjectCard.vue` per entry. Cards are 2-column on `md+` (image / text), stacked on mobile. Brand titles and tech tags live as untranslated strings; descriptions go through `@nuxtjs/i18n` keys. Adds a corresponding `nav.projects` link to both desktop and mobile navigation.

**Tech Stack:** Vue 3.5 SFCs (existing), `@nuxtjs/i18n` v9 (existing), Bootstrap 5 SCSS partials (existing), Vitest + `@vue/test-utils` for the new card component test.

---

## File Structure

**To create:**
- `public/images/projects/360caribe.jpg` — copied from OneDrive
- `public/images/projects/legaliax.png` — copied from OneDrive
- `app/content/projects.ts` — typed array of `Project` entries
- `app/components/ui/ProjectCard.vue` — single project card
- `app/components/sections/ProjectsSection.vue` — section wrapper
- `tests/components/ProjectCard.test.ts` — render + link safety tests

**To modify:**
- `app/content/types.ts` — add `Project` type
- `i18n/locales/es.json` — add `nav.projects` and full `projects` block
- `i18n/locales/en.json` — same, English translations
- `app/components/layout/SiteHeader.vue` — add "Projects" desktop nav link
- `app/components/layout/MobileNav.vue` — add "Projects" link inside drawer
- `app/pages/index.vue` — import and mount `<ProjectsSection />` between About and Work

---

## Task 1: Copy project screenshots to public folder

**Files:**
- Create: `public/images/projects/360caribe.jpg`
- Create: `public/images/projects/legaliax.png`

The originals live in OneDrive on the Windows host:
- `C:\Users\mig21\OneDrive\Documentos\ShareX\Screenshots\2026-05\chrome_L5j3grvLOA.jpg` → `public/images/projects/360caribe.jpg`
- `C:\Users\mig21\OneDrive\Documentos\ShareX\Screenshots\2026-05\chrome_5659mAkch9.png` → `public/images/projects/legaliax.png`

- [ ] **Step 1: Create the projects subfolder**

Run (Bash):
```bash
mkdir -p /c/laragon/www/my-portfolio/public/images/projects
ls /c/laragon/www/my-portfolio/public/images/projects
```
Expected: directory exists, listing is empty.

- [ ] **Step 2: Copy the two screenshots**

Use the PowerShell tool (Windows paths with spaces — PowerShell is the safest for `cp` of OneDrive files):

```powershell
Copy-Item "C:\Users\mig21\OneDrive\Documentos\ShareX\Screenshots\2026-05\chrome_L5j3grvLOA.jpg" "C:\laragon\www\my-portfolio\public\images\projects\360caribe.jpg"
Copy-Item "C:\Users\mig21\OneDrive\Documentos\ShareX\Screenshots\2026-05\chrome_5659mAkch9.png" "C:\laragon\www\my-portfolio\public\images\projects\legaliax.png"
Get-ChildItem "C:\laragon\www\my-portfolio\public\images\projects\" | Format-Table Name, Length
```
Expected: both files listed, sizes > 0 bytes.

If either source file is missing, escalate to the user — they need to confirm the source path or provide a new screenshot.

- [ ] **Step 3: Commit**

```bash
git add public/images/projects/
git -c user.name="Miguel Angel Escamilla" -c user.email="rodrigo.tejero@thewebchi.mp" commit -m "chore(assets): add project screenshots for 360 Caribe and Legaliax"
```

---

## Task 2: Add `Project` type and content data

**Files:**
- Modify: `app/content/types.ts`
- Create: `app/content/projects.ts`

- [ ] **Step 1: Append the `Project` type to `app/content/types.ts`**

Read the current file. Add this type at the end (after the existing `Job` type):

```ts
export type Project = {
  id: string
  title: string
  image: string
  liveUrl: string
  tech: string[]
  descriptionKey: string
}
```

- [ ] **Step 2: Create `app/content/projects.ts`**

```ts
import type { Project } from './types'

export const projects: Project[] = [
  {
    id: '360caribe',
    title: '360 Caribe',
    image: '/images/projects/360caribe.jpg',
    liveUrl: 'https://360caribe.com/',
    tech: ['Vue', 'Nuxt', 'Node', 'Express', 'MySQL', 'AWS S3'],
    descriptionKey: 'projects.items.360caribe.description',
  },
  {
    id: 'legaliax',
    title: 'Legaliax',
    image: '/images/projects/legaliax.png',
    liveUrl: 'https://legal.chimp.mx/',
    tech: ['Vue', 'Nuxt', 'Node', 'Express', 'MySQL', 'AWS S3'],
    descriptionKey: 'projects.items.legaliax.description',
  },
]
```

- [ ] **Step 3: Verify typecheck**

Run:
```bash
set -o pipefail; npm run typecheck > /dev/null 2>&1; echo "EXIT: $?"
```
Expected: `EXIT: 0` (the `[Vue] Load plugin failed: vue-router/volar` warning is pre-existing and does not affect the exit code).

- [ ] **Step 4: Commit**

```bash
git add app/content/types.ts app/content/projects.ts
git -c user.name="Miguel Angel Escamilla" -c user.email="rodrigo.tejero@thewebchi.mp" commit -m "feat(content): add Project type and projects data"
```

---

## Task 3: Add i18n keys for the projects section

**Files:**
- Modify: `i18n/locales/es.json`
- Modify: `i18n/locales/en.json`

- [ ] **Step 1: Update `i18n/locales/es.json`**

Two edits in the file:

**a)** Inside the existing `"nav"` block, add a `"projects"` key. The block (currently `{ "about": ..., "work": ..., "openMenu": ..., "closeMenu": ... }`) becomes:

```json
"nav": {
  "about": "Sobre mí",
  "work": "Experiencia",
  "projects": "Proyectos",
  "openMenu": "Abrir menú",
  "closeMenu": "Cerrar menú"
},
```

**b)** Add a brand-new top-level `"projects"` block. Insert it immediately after the `"about"` block and before `"work"`:

```json
"projects": {
  "label": "/Proyectos",
  "title": "Proyectos",
  "viewLive": "Ver sitio",
  "items": {
    "360caribe": {
      "description": "Plataforma de bienes raíces que gestiona propiedades, características, propietarios y más."
    },
    "legaliax": {
      "description": "Plataforma con una biblioteca completa de herramientas y documentos legales listos para usar. Cuenta con planes escalables según la cantidad de documentos a crear y la cantidad de usuarios que se pueden invitar."
    }
  }
},
```

(Make sure the previous `"about"` block ends with a comma and `"work"` block opens after this new block — JSON commas must be correct.)

- [ ] **Step 2: Update `i18n/locales/en.json`**

Same two edits, English content.

**a)** `nav` block becomes:

```json
"nav": {
  "about": "About",
  "work": "Work",
  "projects": "Projects",
  "openMenu": "Open menu",
  "closeMenu": "Close menu"
},
```

**b)** New `projects` block between `about` and `work`:

```json
"projects": {
  "label": "/Projects",
  "title": "Projects",
  "viewLive": "View site",
  "items": {
    "360caribe": {
      "description": "Real estate platform managing properties, features, owners, and more."
    },
    "legaliax": {
      "description": "Platform with a complete library of ready-to-use legal tools and documents. Features tiered subscription plans based on document creation quotas and the number of users that can be invited."
    }
  }
},
```

- [ ] **Step 3: Validate JSON**

Run:
```bash
node -e "JSON.parse(require('fs').readFileSync('i18n/locales/es.json'))" && \
node -e "JSON.parse(require('fs').readFileSync('i18n/locales/en.json'))" && \
echo OK
```
Expected: `OK`. If either parse fails, fix the comma/quoting before continuing.

- [ ] **Step 4: Commit**

```bash
git add i18n/locales/es.json i18n/locales/en.json
git -c user.name="Miguel Angel Escamilla" -c user.email="rodrigo.tejero@thewebchi.mp" commit -m "feat(i18n): add nav.projects and projects section translations"
```

---

## Task 4: Build `ProjectCard` component (TDD)

**Files:**
- Test: `tests/components/ProjectCard.test.ts`
- Create: `app/components/ui/ProjectCard.vue`

⚠ Conventions:
- Inside `app/`: relative imports for siblings (Nuxt 4 `~` alias = `app/`).
- Tests use `~/app/...` paths; `tests/setup.ts` stubs `useI18n`/`$t` returning the translation key (or interpolated key for params).

- [ ] **Step 1: Write the failing test**

Create `tests/components/ProjectCard.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectCard from '~/app/components/ui/ProjectCard.vue'
import type { Project } from '~/app/content/types'

const sample: Project = {
  id: 'sample',
  title: 'Sample Project',
  image: '/images/projects/sample.png',
  liveUrl: 'https://example.com/',
  tech: ['Vue', 'Nuxt', 'TypeScript'],
  descriptionKey: 'projects.items.sample.description',
}

describe('ProjectCard', () => {
  it('renders title, image, description (via i18n key) and one pill per tech', () => {
    const wrapper = mount(ProjectCard, { props: { project: sample } })

    expect(wrapper.text()).toContain('Sample Project')

    const img = wrapper.get('img')
    expect(img.attributes('src')).toBe('/images/projects/sample.png')
    expect(img.attributes('alt')).toBe('Sample Project')

    expect(wrapper.text()).toContain('projects.items.sample.description')

    const pills = wrapper.findAll('.project-card__tech-pill')
    expect(pills.length).toBe(3)
    expect(pills.map((p) => p.text())).toEqual(['Vue', 'Nuxt', 'TypeScript'])
  })

  it('renders a "view live" link with safe target/rel and the configured URL', () => {
    const wrapper = mount(ProjectCard, { props: { project: sample } })

    const link = wrapper.get('a.project-card__cta')
    expect(link.attributes('href')).toBe('https://example.com/')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
    expect(link.text()).toContain('projects.viewLive')
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

Run: `npm test -- ProjectCard`
Expected: FAIL — "Failed to resolve import `~/app/components/ui/ProjectCard.vue`".

- [ ] **Step 3: Create `app/components/ui/ProjectCard.vue`**

```vue
<script setup lang="ts">
import type { Project } from '../../content/types'

defineProps<{
  project: Project
}>()
</script>

<template>
  <article class="project-card">
    <div class="row g-0 align-items-stretch">
      <div class="col-md-6 project-card__image-col">
        <img
          :src="project.image"
          :alt="project.title"
          class="project-card__image"
        />
      </div>
      <div class="col-md-6 project-card__content">
        <h3 class="project-card__title">{{ project.title }}</h3>
        <p class="project-card__description">{{ $t(project.descriptionKey) }}</p>
        <ul class="project-card__tech">
          <li
            v-for="t in project.tech"
            :key="t"
            class="project-card__tech-pill"
          >
            {{ t }}
          </li>
        </ul>
        <a
          class="btn-pill project-card__cta"
          :href="project.liveUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ $t('projects.viewLive') }}
          <i class="bi bi-box-arrow-up-right" aria-hidden="true" />
        </a>
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.project-card {
  border: 1px solid $border-subtle;
  border-radius: $border-radius-lg;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);

  &__image-col {
    aspect-ratio: 16 / 9;

    @media (min-width: 768px) {
      aspect-ratio: auto;
    }
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__content {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 100%;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: $text-primary;
  }

  &__description {
    color: $text-muted;
    font-size: 1rem;
    line-height: 1.6;
    margin: 0;
  }

  &__tech {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__tech-pill {
    padding: 0.25rem 0.625rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.05);
    font-size: 0.75rem;
    color: $text-muted;
  }

  &__cta {
    margin-top: auto;
    align-self: flex-start;
  }
}
</style>
```

- [ ] **Step 4: Run tests — verify they pass**

Run: `npm test`
Expected: 23 tests passing total (2 new ProjectCard + 21 existing).

- [ ] **Step 5: Run typecheck**

Run: `set -o pipefail; npm run typecheck > /dev/null 2>&1; echo "EXIT: $?"`
Expected: `EXIT: 0`.

- [ ] **Step 6: Commit**

```bash
git add app/components/ui/ProjectCard.vue tests/components/ProjectCard.test.ts
git -c user.name="Miguel Angel Escamilla" -c user.email="rodrigo.tejero@thewebchi.mp" commit -m "feat: add ProjectCard component with tests"
```

---

## Task 5: Build `ProjectsSection` component

**Files:**
- Create: `app/components/sections/ProjectsSection.vue`

- [ ] **Step 1: Create `app/components/sections/ProjectsSection.vue`**

```vue
<script setup lang="ts">
import ProjectCard from '../ui/ProjectCard.vue'
import { projects } from '../../content/projects'

const { t } = useI18n()
</script>

<template>
  <section id="projects" class="projects">
    <div class="container py-5">
      <div class="row mb-4 g-4">
        <div class="col-md-4">
          <span class="section-label">{{ t('projects.label') }}</span>
        </div>
        <div class="col-md-8">
          <h2 class="display-section projects__title mb-0">{{ t('projects.title') }}</h2>
        </div>
      </div>

      <div class="d-flex flex-column gap-4">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
        />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.projects {
  padding-block: 2.5rem;

  @media (min-width: 768px) { padding-block: 4rem; }

  &__title {
    text-align: center;

    @media (min-width: 768px) { text-align: end; }
  }
}
</style>
```

- [ ] **Step 2: Verify typecheck and tests**

Run: `npm test` → 23 tests still passing.
Run: `set -o pipefail; npm run typecheck > /dev/null 2>&1; echo "EXIT: $?"` → `EXIT: 0`.

- [ ] **Step 3: Commit**

```bash
git add app/components/sections/ProjectsSection.vue
git -c user.name="Miguel Angel Escamilla" -c user.email="rodrigo.tejero@thewebchi.mp" commit -m "feat: add ProjectsSection wrapping ProjectCards"
```

---

## Task 6: Mount `ProjectsSection` in `pages/index.vue`

**Files:**
- Modify: `app/pages/index.vue`

- [ ] **Step 1: Replace `app/pages/index.vue`**

```vue
<script setup lang="ts">
import SiteHeader from '../components/layout/SiteHeader.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
import HeroSection from '../components/sections/HeroSection.vue'
import AboutSection from '../components/sections/AboutSection.vue'
import ProjectsSection from '../components/sections/ProjectsSection.vue'
import WorkSection from '../components/sections/WorkSection.vue'

const { t, locale } = useI18n()

useHead({
  title: () => `Miguel Angel Escamilla — ${t('hero.title')}`,
  htmlAttrs: { lang: locale.value },
})
</script>

<template>
  <div class="page">
    <SiteHeader />
    <main>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <WorkSection />
    </main>
    <SiteFooter />
  </div>
</template>
```

The diff vs. previous: added `import ProjectsSection ...` and inserted `<ProjectsSection />` between `<AboutSection />` and `<WorkSection />`.

- [ ] **Step 2: Verify build**

Run: `npm run generate`
Expected: succeeds. Inspect `.output/public/es/index.html` for the new section's content (e.g., grep for "360 Caribe" or "Proyectos"):

```bash
grep -c "360 Caribe" .output/public/es/index.html
```
Expected: `1` or higher (at least one occurrence of the project title).

- [ ] **Step 3: Verify tests + typecheck**

Run: `npm test` → 23 passing.
Run: `set -o pipefail; npm run typecheck > /dev/null 2>&1; echo "EXIT: $?"` → `EXIT: 0`.

- [ ] **Step 4: Commit**

```bash
git add app/pages/index.vue
git -c user.name="Miguel Angel Escamilla" -c user.email="rodrigo.tejero@thewebchi.mp" commit -m "feat: mount ProjectsSection between About and Work"
```

---

## Task 7: Add "Projects" nav link to `SiteHeader` and `MobileNav`

**Files:**
- Modify: `app/components/layout/SiteHeader.vue`
- Modify: `app/components/layout/MobileNav.vue`

- [ ] **Step 1: Update `app/components/layout/SiteHeader.vue`**

Find the existing desktop `<nav>` block. It currently is:
```vue
<nav class="d-none d-md-flex gap-4">
  <a href="#about" class="site-header__link">{{ t('nav.about') }}</a>
  <a href="#work"  class="site-header__link">{{ t('nav.work') }}</a>
</nav>
```

Replace with (one new `<a>` inserted between the existing two):

```vue
<nav class="d-none d-md-flex gap-4">
  <a href="#about"    class="site-header__link">{{ t('nav.about') }}</a>
  <a href="#projects" class="site-header__link">{{ t('nav.projects') }}</a>
  <a href="#work"     class="site-header__link">{{ t('nav.work') }}</a>
</nav>
```

Leave the rest of `SiteHeader.vue` untouched.

- [ ] **Step 2: Update `app/components/layout/MobileNav.vue`**

Find the drawer `<nav>` block (inside the `<Teleport to="body">`). It currently contains:
```vue
<a href="#about" class="mobile-nav__link" @click="close">{{ t('nav.about') }}</a>
<a href="#work"  class="mobile-nav__link" @click="close">{{ t('nav.work') }}</a>
```

Replace with:
```vue
<a href="#about"    class="mobile-nav__link" @click="close">{{ t('nav.about') }}</a>
<a href="#projects" class="mobile-nav__link" @click="close">{{ t('nav.projects') }}</a>
<a href="#work"     class="mobile-nav__link" @click="close">{{ t('nav.work') }}</a>
```

Leave everything else in `MobileNav.vue` untouched.

- [ ] **Step 3: Verify tests + typecheck**

Run: `npm test` → 23 passing (the existing MobileNav test asserts `.mobile-nav__drawer a` count > 0; the new third link doesn't break it because the test's link click test only clicks the first one).
Run: `set -o pipefail; npm run typecheck > /dev/null 2>&1; echo "EXIT: $?"` → `EXIT: 0`.

- [ ] **Step 4: Commit**

```bash
git add app/components/layout/SiteHeader.vue app/components/layout/MobileNav.vue
git -c user.name="Miguel Angel Escamilla" -c user.email="rodrigo.tejero@thewebchi.mp" commit -m "feat(nav): add Projects link to desktop and mobile nav"
```

---

## Task 8: Static build sanity check

**Files:** none — verification gate, no commit.

- [ ] **Step 1: Run static build**

Run: `npm run generate`
Expected: succeeds with prerender of 6 routes.

- [ ] **Step 2: Confirm assets are bundled**

```bash
ls .output/public/images/projects/
```
Expected: both `360caribe.jpg` and `legaliax.png` present.

```bash
grep -c "360 Caribe" .output/public/es/index.html
grep -c "Legaliax" .output/public/es/index.html
grep -c "Projects" .output/public/en/index.html
```
Expected: each grep prints `1` or higher.

- [ ] **Step 3: Done**

Build is healthy. Manual smoke test follows (Task 9).

---

## Task 9: Manual smoke test (human)

**Files:** none — human verification gate.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` in the background; let it boot ~10 s. Open the URL it prints (likely `http://localhost:3000` or `:3001`).

- [ ] **Step 2: Verify section content at desktop width (≥1024px)**

- The new "Projects" section is between About and Work.
- Section label "/Projects" or "/Proyectos" on the left, big "Projects"/"Proyectos" title on the right.
- 2 cards stacked vertically, each with: image left (16:9-ish), text right (title bold, description, tech pills, "View site" / "Ver sitio" CTA).
- Click "View site" — opens the live URL in a new tab (`target="_blank"`).
- Click "Projects" in the desktop nav — smooth scroll to the section.

- [ ] **Step 3: Verify mobile (≤767px) in DevTools responsive mode (e.g., 375×667)**

- Each card collapses to single column: image full-width with 16:9 ratio, text below.
- "Projects" appears in the hamburger drawer between "Sobre mí" and "Experiencia".
- Tap "Proyectos" → drawer closes, page scrolls to projects section.
- No horizontal overflow.

- [ ] **Step 4: Verify language switch**

- On `/en`: "Projects" / "View site" / English descriptions.
- On `/es`: "Proyectos" / "Ver sitio" / Spanish descriptions.
- Brand titles ("360 Caribe", "Legaliax") and tech tags stay identical in both languages.

- [ ] **Step 5: Stop the dev server**

Stop the background process.

- [ ] **Step 6: Done**

If anything looks off, report back; otherwise the feature is complete and ready for `npm run deploy`.
