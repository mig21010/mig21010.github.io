# Projects section — Diseño técnico

**Fecha:** 2026-05-10
**Autor:** Miguel Angel Escamilla
**Estado:** Aprobado para implementación

---

## 1. Contexto y objetivo

Agregar una sección "Projects" entre About y Work del one-pager, mostrando 2 proyectos reales con screenshot, descripción breve, stack tecnológico y enlace al sitio en producción. La sección cierra el hueco identificado en la auditoría previa: el portfolio actual carece de evidencia visual de proyectos construidos, dato que reclutadores buscan primero.

**Caso de uso:** mejora de contenido sobre el portfolio existente. No reemplaza ninguna sección. Sigue las convenciones establecidas (Nuxt 4 SSG, i18n ES/EN, Bootstrap SCSS dark theme, Vitest tests para componentes con lógica).

## 2. Decisiones clave

| Decisión | Elección | Razón |
|---|---|---|
| Layout por card | **Side-by-side: imagen 50% + texto 50%** en `md+`; stacked en `<md` | Con 2 proyectos una grilla queda vacía; cards anchas dan presencia |
| Posición en el one-pager | **Entre About y Work** | Flujo narrativo: quién soy → qué construí → dónde trabajé |
| Detalle por proyecto | **Mínimo viable**: title, descripción 1-2 oraciones, tech tags, "Ver sitio" | Reduce mantenimiento; suficiente para reclutadores |
| Botón "Code" | **No incluido** | Ambos proyectos son trabajo de cliente sin repo público |
| Componente reutilizable | `ProjectCard.vue` separado | Single responsibility, testable en aislación |
| Datos | TS tipado en `app/content/projects.ts`; descripciones traducibles via i18n keys | Espejo del patrón de `work.ts` ya establecido |
| Imágenes | Locales en `public/images/projects/`, formato original (jpg/png), aspect-ratio 16:9 forzado por CSS | Sin dependencias externas; rendimiento controlado |
| Nav | Agregar entry "Projects" al header desktop **y** al drawer mobile | Sin esto, scrollear a la sección requiere scroll manual |
| Tests | 2 tests para `ProjectCard` (render + link safety) | Lógica trivial; demás verificación manual |

### Lo que NO hacemos (YAGNI)

- ❌ Página detalle por proyecto (`/projects/[slug]`)
- ❌ Card que se expande in-place
- ❌ Filtros por tech / categoría
- ❌ Galería de múltiples imágenes por proyecto
- ❌ Animaciones complejas de hover (un fade sutil basta)
- ❌ Lazy loading de imágenes (con 2 proyectos visibles cerca del fold, el ahorro es marginal)
- ❌ Soporte para "Code" button condicional ahora — agregar después si surge un proyecto con repo público

## 3. Arquitectura

### 3.1 Estructura de archivos

```
app/
├── components/sections/
│   └── ProjectsSection.vue          # nuevo
├── components/ui/
│   └── ProjectCard.vue              # nuevo
├── content/
│   ├── projects.ts                  # nuevo
│   └── types.ts                     # modificado: agregar Project type
├── components/layout/
│   ├── SiteHeader.vue               # modificado: nav link "Projects"
│   └── MobileNav.vue                # modificado: link "Projects" en drawer
└── pages/index.vue                  # modificado: insertar <ProjectsSection> entre About y Work

public/images/projects/              # nueva carpeta
├── 360caribe.jpg                    # copiado desde OneDrive
└── legaliax.png                     # copiado desde OneDrive

i18n/locales/{es,en}.json            # modificado: nuevo bloque "projects" + clave "nav.projects"

tests/components/
└── ProjectCard.test.ts              # nuevo: 2 tests
```

### 3.2 Tipos (`app/content/types.ts` — agregar al archivo existente)

```ts
export type Project = {
  id: string                 // slug interno, usado como referencia y para i18n key
  title: string              // brand name; no se traduce
  image: string              // path absoluto desde public, ej: '/images/projects/360caribe.jpg'
  liveUrl: string            // URL al sitio en producción
  tech: string[]             // tags del stack; no se traducen
  descriptionKey: string     // i18n key, ej: 'projects.items.360caribe.description'
}
```

### 3.3 Datos (`app/content/projects.ts`)

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

### 3.4 i18n (bloques nuevos a agregar en ambos locales)

**`i18n/locales/es.json`** — agregar dentro del raíz, en este orden lógico (después de `about`, antes de `work`):

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
}
```

Y dentro de `nav` (mismo archivo) agregar `"projects": "Proyectos"`.

**`i18n/locales/en.json`** — espejo:

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
}
```

Y dentro de `nav` agregar `"projects": "Projects"`.

### 3.5 Componente `ProjectCard.vue`

**Props:** `project: Project` (objeto completo).

**Layout:**
- Container `<article class="project-card">` con `border: 1px solid $border-subtle; border-radius: $border-radius-lg; overflow: hidden; background: rgba(255,255,255,0.02)`
- Bootstrap row interna: `<div class="row g-0 align-items-stretch">`
  - Columna imagen: `class="col-md-6 project-card__image-col"`
    - `<img :src="project.image" :alt="project.title" class="project-card__image">` con `width: 100%; height: 100%; object-fit: cover; display: block`
    - La col padre tiene `aspect-ratio: 16/9` en mobile (cuando es full-width) y `aspect-ratio: auto` en `md+` (cuando está al lado del texto y matchea su altura via `align-items-stretch`)
  - Columna contenido: `class="col-md-6 project-card__content"` con `padding: 2rem; display: flex; flex-direction: column; gap: 1rem; min-height: 100%`
    - `<h3 class="project-card__title">{{ project.title }}</h3>`
    - `<p class="project-card__description">{{ $t(project.descriptionKey) }}</p>`
    - `<ul class="project-card__tech">` lista de pills sutiles iterando `project.tech`
    - `<a class="btn-pill" :href="project.liveUrl" target="_blank" rel="noopener noreferrer">{{ $t('projects.viewLive') }} <i class="bi bi-box-arrow-up-right"></i></a>` — `margin-top: auto` para anclarlo al fondo de la card

**Estilos custom (scoped):**
- Pills de tech: padding chico (`0.25rem 0.625rem`), border-radius 999px, background `rgba(255,255,255,0.05)`, font-size 0.75rem, color `$text-muted`
- En mobile (`<md`): el `aspect-ratio: 16/9` mantiene proporción de la imagen apilada arriba

### 3.6 Componente `ProjectsSection.vue`

**Estructura:**
```vue
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
```

**Estilos scoped:** padding-block responsive (`2.5rem` mobile, `4rem` desktop) — patrón ya establecido en otras secciones.

### 3.7 Modificación a `pages/index.vue`

Importar `ProjectsSection` y agregarlo al template entre `<AboutSection />` y `<WorkSection />`.

### 3.8 Modificación a `SiteHeader.vue` y `MobileNav.vue`

Agregar un nuevo link `<a href="#projects">{{ t('nav.projects') }}</a>` en ambos lugares, ubicado entre "About" y "Work" para mantener el orden visual de la página.

## 4. Tests

`tests/components/ProjectCard.test.ts` — **2 tests:**

1. **Render:** dado un `project` mock, el componente renderiza:
   - El título textual del proyecto
   - Un `<img>` con `src` igual a `project.image` y `alt` igual a `project.title`
   - El texto de la descripción (resuelto vía `$t(project.descriptionKey)` — el setup de tests devuelve la key como fallback, así que verificamos con `wrapper.text().toContain(project.descriptionKey)`)
   - Una pill por cada item en `project.tech`

2. **Link safety:** el `<a>` "Ver sitio" tiene:
   - `href = project.liveUrl`
   - `target = "_blank"`
   - `rel = "noopener noreferrer"`

**Sin tests para:**
- `ProjectsSection.vue` (es composición trivial; cubierto por el render de ProjectCard)
- Estilos / hover / responsive (verificación manual)

## 5. Verificación manual pre-merge

1. `npm run dev`. Abrir `http://localhost:3000` (o puerto que asigne).
2. Scroll a la nueva sección "Projects" entre About y Work.
3. Verificar:
   - 2 cards visibles con imagen + título + descripción + tech pills + botón "Ver sitio"
   - En desktop (≥768px): layout 2 columnas (imagen izq, texto der)
   - En mobile (<768px): apilado vertical, imagen arriba con aspect-ratio 16:9 mantenido
4. Click en "Ver sitio" → abre el sitio real en pestaña nueva (ojo con popup blockers)
5. Header: nav inline en desktop muestra "About / Projects / Work"; drawer mobile (hamburguesa) también incluye "Proyectos"
6. Click en "Proyectos" del nav → smooth scroll a la sección
7. Switch a `/en` → label, título, descripciones y CTA traducidos; títulos de proyectos NO se traducen (correcto, son brand names)
8. `npm test` → 21 + 2 = 23 tests pasando
9. `npm run typecheck` → exit 0
10. `npm run generate` → succeeds; verificar que `.output/public/images/projects/360caribe.jpg` y `legaliax.png` existen en el build

## 6. Manejo de errores

- **Imagen no encontrada:** el navegador muestra el `alt` text. Aceptable; no causa crash.
- **`liveUrl` cae:** el `<a target="_blank">` igual abre la URL; el manejo del 404 es responsabilidad del sitio destino.
- **i18n key faltante:** vue-i18n devuelve la key literal como fallback (visible en pantalla — sirve de aviso visual durante desarrollo).
- **JS deshabilitado:** las cards son HTML estático con imagen y `<a>` — funcionan sin JS. Solo el smooth scroll del nav se pierde.

## 7. Tareas de copia de assets (no son código)

Antes de ejecutar el plan, los screenshots originales en `C:\Users\mig21\OneDrive\Documentos\ShareX\Screenshots\2026-05\` deben copiarse a `public/images/projects/` con renombre:

- `chrome_L5j3grvLOA.jpg` → `360caribe.jpg`
- `chrome_5659mAkch9.png` → `legaliax.png`

El implementer ejecuta esa copia antes del primer commit (parte de la primera task del plan).

## 8. Lo que NO incluimos (decisiones explícitas YAGNI)

- ❌ Página detalle `/projects/[slug]` con caso de estudio largo
- ❌ Botón "Code" condicional (cuando aparezca un proyecto con repo público lo agregamos al `Project` type)
- ❌ Filtros por tech o categoría
- ❌ Múltiples imágenes / galería por proyecto
- ❌ Métricas (usuarios, tráfico, performance)
- ❌ Animaciones de scroll-into-view
- ❌ Lazy loading de imágenes
