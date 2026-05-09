# Portfolio personal — Diseño técnico

**Fecha:** 2026-05-08
**Autor:** Miguel Angel Escamilla
**Estado:** Aprobado para implementación

---

## 1. Contexto y objetivo

Construir el portfolio personal de Miguel Angel Escamilla como **full-stack developer**, basado en el mockup proporcionado. El sitio debe presentar habilidades técnicas, experiencia laboral e información de contacto de forma moderna, funcional y visualmente atractiva.

**Caso de uso:** página única de presentación profesional, optimizada para compartir con reclutadores/clientes y posicionarse en búsquedas.

## 2. Decisiones clave

| Decisión | Elección | Razón |
|---|---|---|
| Tipo de sitio | **SSG (estático)** | Contenido fijo, hosting gratis, máximo rendimiento |
| Framework | **Nuxt 4** | Vue 3.5+, mejor DX, SSG nativo con `nitro` |
| UI / CSS | **Bootstrap 5 SCSS (parcial) + Bootstrap Icons** | Solo grid + reboot + utilities; componentes custom |
| Idiomas | **Español + inglés con switcher** | `@nuxtjs/i18n`, estrategia `prefix` |
| Tema | **Solo modo oscuro** | Fiel al mockup; sin toggle |
| Hosting | **GitHub Pages** | Repo `mig21010.github.io`, dominio raíz, `baseURL: '/'` |
| Tests | **Vitest** sobre lógica pura + componentes clave | Cobertura mínima útil sin sobreingeniería |

### Secciones incluidas
- Hero (título grande + intro + redes sociales)
- About me + skills técnicos
- Tabla de experiencia laboral

### Secciones excluidas (YAGNI)
- Carrusel de artículos/proyectos
- Modo claro / toggle de tema
- Backend, formulario de contacto, CMS
- E2E tests, animaciones complejas

## 3. Arquitectura

### 3.1 Estructura de carpetas

```
my-portfolio/
├── app/
│   ├── app.vue                  # layout raíz mínimo
│   ├── pages/
│   │   └── index.vue            # one-pager con todas las secciones
│   ├── components/
│   │   ├── layout/
│   │   │   ├── SiteHeader.vue
│   │   │   └── SiteFooter.vue
│   │   ├── sections/
│   │   │   ├── HeroSection.vue
│   │   │   ├── AboutSection.vue
│   │   │   └── WorkSection.vue
│   │   └── ui/
│   │       ├── SocialLink.vue
│   │       ├── SkillGroup.vue
│   │       └── LanguageSwitcher.vue
│   ├── content/
│   │   ├── types.ts             # tipos compartidos
│   │   ├── socials.ts           # array tipado de redes sociales
│   │   ├── skills.ts            # grupos de skills
│   │   └── work.ts              # entradas laborales
│   └── utils/
│       └── experience.ts        # función pura calculateExperience
├── i18n/
│   └── locales/
│       ├── es.json
│       └── en.json
├── assets/
│   └── scss/
│       ├── main.scss
│       ├── _variables.scss
│       ├── _typography.scss
│       └── _components.scss
├── public/
│   ├── images/
│   └── .nojekyll                # generado por nitro preset github-pages
├── tests/
│   └── components/
├── .github/workflows/deploy.yml
├── nuxt.config.ts
├── package.json
└── README.md
```

### 3.2 Routing e i18n

**Estrategia:** una única página renderizada en dos variantes de idioma con prefijo de URL.

| Ruta | Comportamiento |
|---|---|
| `/` | Redirige a `/es` (default locale, vía Nuxt i18n) |
| `/es` | Versión española |
| `/en` | Versión inglesa |
| `#about`, `#work` | Anclas internas (scroll suave, sin recarga) |

**Configuración `@nuxtjs/i18n`:**
```ts
i18n: {
  strategy: 'prefix',
  defaultLocale: 'es',
  locales: [
    { code: 'es', name: 'Español', file: 'es.json' },
    { code: 'en', name: 'English', file: 'en.json' }
  ],
  detectBrowserLanguage: false
}
```

Razón de `detectBrowserLanguage: false`: en SSG sobre GitHub Pages, la detección por header del navegador no aplica (no hay servidor); el comportamiento queda más predecible con default fijo.

### 3.3 Build y deploy

**`nuxt.config.ts` (extracto):**
```ts
nitro: {
  preset: 'github-pages',          // genera .nojekyll y 404.html
  prerender: { crawlLinks: true, routes: ['/'] }
},
app: {
  baseURL: '/'                     // raíz porque es <usuario>.github.io
}
```

**Pipeline `.github/workflows/deploy.yml`:**
1. Trigger: `push` a `main`
2. Pasos: checkout → setup Node 20 → `npm ci` → `npm run typecheck` → `npm test` → `npm run generate`
3. Deploy: `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4`
4. Permisos: `pages: write`, `id-token: write`

Si typecheck o tests fallan, no se despliega.

## 4. Componentes

Cada componente tiene una sola responsabilidad y recibe sus datos por props o desde imports tipados (testeable en aislamiento).

### 4.1 Layout

**`SiteHeader.vue`**
- Renderiza: nombre (izq), nav links (centro), `<LanguageSwitcher>` (der)
- Lee: `i18n` para textos del nav
- Comportamiento: nav links son `<a href="#about">` para scroll nativo

**`SiteFooter.vue`**
- Renderiza: copyright con año dinámico desde `new Date().getFullYear()`

### 4.2 Sections

**`HeroSection.vue`**
- Renderiza: título "Full-stack Developer" (clase `.display-hero`), párrafo intro, botón CTA "Projects" (link interno a `#work`), grid de `<SocialLink>` iterando `socials`
- Lee: i18n + `socials.ts`

**`AboutSection.vue`**
- Layout: 2 columnas (skills izq, foto der); 1 columna en `<lg`
- Renderiza: label "/About me", párrafo intro, lista de `<SkillGroup>` iterando `skillGroups`
- Lee: i18n + `skills.ts`

**`WorkSection.vue`**
- Renderiza: título "Work" gigante, tabla de empleos, total de experiencia calculado por `calculateExperience(jobs)`
- Lee: i18n + `work.ts`
- Una fila puede destacarse visualmente (fondo invertido como en el mockup) — control con clase CSS, no con estado

### 4.3 UI reutilizable

**`SocialLink.vue`**
- Props: `{ icon: string, url: string, label: string }`
- Render: `<a target="_blank" rel="noopener noreferrer">` con `<i class="bi $icon">` + label

**`SkillGroup.vue`**
- Props: `{ titleKey: string, items: string[] }` (resuelve título via `$t(titleKey)`)
- Render: caja con borde redondeado, título arriba, items inline

**`LanguageSwitcher.vue`**
- Render: dos enlaces (Es / En) con el activo destacado, generados con `switchLocalePath()` del composable `useSwitchLocalePath()`

### 4.4 Tipos compartidos (`app/content/types.ts`)

```ts
export type Social = {
  id: 'github' | 'linkedin' | 'email' | 'twitter' | 'instagram'
  url: string
  icon: string      // clase Bootstrap Icons (bi-github, etc.)
  label: string
}

export type SkillGroup = {
  id: 'frontend' | 'styles' | 'backend' | 'devops'
  items: string[]   // nombres técnicos del stack, no traducibles
  // El título del grupo se resuelve via i18n key 'about.skillsTitle.<id>'
}

export type Job = {
  id: string
  start: string                 // 'YYYY-MM'
  end: string | 'present'       // 'YYYY-MM' o literal 'present'
  company: string               // no se traduce
  roleKey: string               // i18n key, ej. 'work.jobs.job-1.role'
}
```

## 5. Modelo de datos

### 5.1 `app/content/socials.ts`

```ts
import type { Social } from './types'
export const socials: Social[] = [
  { id: 'github',    url: 'https://github.com/mig21010',          icon: 'bi-github',    label: 'GitHub' },
  { id: 'email',     url: 'mailto:rodrigo.tejero@thewebchi.mp',   icon: 'bi-envelope',  label: 'Email' },
  { id: 'twitter',   url: 'https://twitter.com/PLACEHOLDER',      icon: 'bi-twitter-x', label: 'X' },
  { id: 'instagram', url: 'https://instagram.com/PLACEHOLDER',    icon: 'bi-instagram', label: 'Instagram' },
]
```

URLs marcadas `PLACEHOLDER` se reemplazan en una línea cuando Miguel las tenga.

### 5.2 `app/content/skills.ts`

```ts
import type { SkillGroup } from './types'
export const skillGroups: SkillGroup[] = [
  { id: 'frontend', items: ['Vue', 'Nuxt', 'React', 'TypeScript', 'Pinia', 'Vite'] },
  { id: 'styles',   items: ['SCSS', 'SASS', 'Bootstrap', 'Tailwind', 'PostCSS'] },
  { id: 'backend',  items: ['Node', 'PHP', 'Laravel', 'MySQL', 'PostgreSQL', 'REST', 'GraphQL'] },
  { id: 'devops',   items: ['Docker', 'Nginx', 'GitHub Actions', 'Bash', 'Linux'] },
]
```

Stack inicial razonable para un full-stack; editable libremente.

### 5.3 `app/content/work.ts`

```ts
import type { Job } from './types'
export const jobs: Job[] = [
  { id: 'job-1', start: '2024-01', end: 'present', company: 'PLACEHOLDER Co', roleKey: 'work.jobs.job-1.role' },
  { id: 'job-2', start: '2022-06', end: '2023-12', company: 'PLACEHOLDER Co', roleKey: 'work.jobs.job-2.role' },
]
```

### 5.4 Textos i18n

**`i18n/locales/es.json`** (esquema)
```json
{
  "nav": { "about": "Sobre mí", "work": "Experiencia" },
  "hero": {
    "title": "Full-stack Developer",
    "intro": "Mi objetivo es escribir código mantenible, claro y comprensible para que el desarrollo sea disfrutable.",
    "cta": "Proyectos"
  },
  "about": {
    "label": "/Sobre mí",
    "intro": "Hola, soy Miguel Angel, full-stack developer con más de X años de experiencia.",
    "skillsTitle": {
      "frontend": "Front-end",
      "styles": "Estilos",
      "backend": "Back-end",
      "devops": "DevOps"
    }
  },
  "work": {
    "title": "Experiencia",
    "totalLabel": "Experiencia laboral",
    "yearsMonths": "{years} años {months} meses",
    "present": "Actual",
    "duration": "{years}a {months}m",
    "jobs": {
      "job-1": { "role": "Full-stack developer | Vue & Node" },
      "job-2": { "role": "Frontend developer | React" }
    }
  },
  "footer": { "copyright": "© {year} Miguel Angel Escamilla" }
}
```

**`i18n/locales/en.json`** — espejo en inglés, mismo esquema de claves.

### 5.5 `app/utils/experience.ts`

Función pura sin dependencias de Vue, fácilmente testeable:

```ts
export function calculateExperience(jobs: Job[], now: Date = new Date()): { years: number; months: number } {
  let totalMonths = 0
  for (const job of jobs) {
    const [sy, sm] = job.start.split('-').map(Number)
    const startDate = new Date(sy, sm - 1, 1)
    const endDate = job.end === 'present' ? now : (() => {
      const [ey, em] = job.end.split('-').map(Number)
      return new Date(ey, em - 1, 1)
    })()
    totalMonths += (endDate.getFullYear() - startDate.getFullYear()) * 12
                 + (endDate.getMonth() - startDate.getMonth())
  }
  return { years: Math.floor(totalMonths / 12), months: totalMonths % 12 }
}
```

Inyección de `now` permite tests deterministas.

## 6. SCSS y theming

### 6.1 Orden de imports en `assets/scss/main.scss`

```scss
@import 'variables';

// Bootstrap parcial (sin componentes JS-driven)
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/maps';
@import 'bootstrap/scss/mixins';
@import 'bootstrap/scss/utilities';
@import 'bootstrap/scss/root';
@import 'bootstrap/scss/reboot';
@import 'bootstrap/scss/containers';
@import 'bootstrap/scss/grid';
@import 'bootstrap/scss/utilities/api';

@import 'bootstrap-icons/font/bootstrap-icons.css';
@import 'typography';
@import 'components';
```

Razón de Bootstrap parcial: el bundle completo trae JS y componentes (modals, dropdowns) que no usamos. Importar solo grid + reboot + utilities reduce el peso ~80%.

### 6.2 `_variables.scss` — paleta dark

```scss
$bg-primary:    #0a0a0a;
$bg-elevated:   #1a1a1a;
$text-primary:  #ffffff;
$text-muted:    #888888;
$accent:        #ffffff;
$border-subtle: rgba(255,255,255,.12);

$body-bg:       $bg-primary;
$body-color:    $text-primary;
$border-radius:    1rem;
$border-radius-lg: 2rem;
$font-family-sans-serif: 'Inter', system-ui, sans-serif;
$font-family-display:    'Archivo Black', 'Inter', sans-serif;
```

### 6.3 Tipografía

- **Inter** para cuerpo (variable, 400/500/700)
- **Archivo Black** para títulos display
- Carga vía `<link rel="preload">` declarada en `nuxt.config.ts > app.head.link`
- Clase `.display-hero`: `font-family: $font-family-display; font-size: clamp(3rem, 12vw, 8rem); line-height: .9`

### 6.4 Estilos custom (`_components.scss`)

- `.skill-group` — caja con borde sutil, padding amplio, `border-radius: $border-radius-lg`
- `.work-table` — fila resaltada en blanco con texto invertido (modificador `.work-row--highlight`)
- `.section-label` — tipografía monoespaciada pequeña para `/About me`
- `.btn-pill` — botón outline blanco con `border-radius: 999px`

### 6.5 Responsive

Mobile-first, breakpoints estándar de Bootstrap (sm 576, md 768, lg 992, xl 1200):

| Sección | Mobile (<lg) | Desktop (≥lg) |
|---|---|---|
| Hero | Título escala con `clamp()`, CTA debajo del título | Título + CTA en línea |
| About | 1 columna (foto arriba, skills debajo) | 2 columnas (skills izq / foto der) |
| Work | Cada job en card stack | Tabla |

## 7. Tests

Vitest + `@vue/test-utils`. Cobertura **mínima útil**: lógica pura y comportamiento clave.

| Archivo | Verifica |
|---|---|
| `tests/utils/experience.test.ts` | `calculateExperience` suma rangos, maneja `'present'`, handles edge cases (mismo mes, fin antes de inicio) |
| `tests/components/LanguageSwitcher.test.ts` | Renderiza ambas locales, marca activa, llama `switchLocalePath` correctamente (mockeado) |
| `tests/components/SkillGroup.test.ts` | Renderiza título traducido + cantidad correcta de items |
| `tests/components/WorkSection.test.ts` | Renderiza N filas dado N jobs, muestra el total formateado |

**Excluido:**
- Tests visuales / snapshot (frágiles, valor bajo)
- Tests de `SocialLink` u otros wrappers triviales
- E2E (Playwright/Cypress) — innecesario para un one-pager

## 8. Verificación pre-merge / pre-deploy

Antes de marcar trabajo como completo:
1. `npm run dev` y abrir `http://localhost:3000` en navegador
2. Probar manualmente: scroll por anclas, switcher de idioma, links sociales (apertura en nueva pestaña), layout en mobile (DevTools)
3. `npm run typecheck` y `npm test` en verde
4. `npm run generate && npx serve .output/public` para validar el build estático local
5. Verificar que `404.html` y `.nojekyll` existen en `.output/public/`

## 9. Manejo de errores

Por la naturaleza estática del sitio, los modos de fallo son acotados:

- **404 en navegación** → `404.html` generado por nitro preset; muestra link a inicio
- **Recursos externos (fonts) no cargan** → `font-display: swap` + fallback a `system-ui`
- **i18n key faltante en una locale** → fallback a la default locale (`es`); typecheck con tipos generados por `@nuxtjs/i18n` evita typos
- **Imágenes no encontradas** → `<img>` con `alt` significativo; si una falla, el alt se muestra

No se requiere telemetría/error-tracking en runtime para un sitio puramente informativo.

## 10. Lo que NO hacemos (decisiones explícitas YAGNI)

- ❌ Modo claro y toggle de tema
- ❌ Carrusel de artículos / blog / sección de proyectos
- ❌ Backend, API, formulario de contacto funcional, CMS
- ❌ Animaciones complejas (solo `scroll-behavior: smooth` + transitions sutiles en hover)
- ❌ E2E tests
- ❌ PWA, service worker
- ❌ Analytics (puede agregarse después con un script en `nuxt.config.ts`)
- ❌ Detección automática de idioma del navegador
- ❌ Componentes JS de Bootstrap (modals, dropdowns, etc.)
