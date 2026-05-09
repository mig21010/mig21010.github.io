# Mobile fixes — Diseño técnico

**Fecha:** 2026-05-08
**Autor:** Miguel Angel Escamilla
**Estado:** Aprobado para implementación

---

## 1. Contexto y objetivo

Auditar y corregir los problemas críticos e importantes de la versión mobile del portfolio. La implementación actual es responsive básico (Bootstrap grid), pero presenta:

- Sin navegación accesible cuando el viewport está debajo de 768px
- Tabla de experiencia que desborda o se aplasta en mobile
- Padding vertical excesivo, foto demasiado alta, touch targets pequeños, alineación de CTA descolgada

Objetivo: que el portfolio se vea pulido y sea usable en pantallas de 320–767px.

## 2. Decisiones clave

| Decisión | Elección | Razón |
|---|---|---|
| Nav mobile | **Botón hamburguesa + drawer deslizable desde la derecha** | Patrón conocido, accesible, no rompe la estética |
| Tabla Work mobile | **Cards apiladas (`display: block`)** | Cada empleo se vuelve una card stack: fecha+duración / empresa / rol. Sin scroll horizontal |
| Padding secciones | `2.5rem` block en mobile, `4rem` desde `md+` | Reduce scroll vertical innecesario en pantallas chicas |
| Foto About | `max-height: 60vh; object-fit: cover` en mobile | Evita que ocupe más de medio viewport |
| Touch targets | Subir a ≥44×44px en social links y language switcher | Recomendación Apple/Material para tap targets |
| Alineación CTA Hero | `text-center text-lg-end` | Centrado en mobile (visualmente atado al título), derecha en desktop |

### Lo que NO hacemos (YAGNI)

- ❌ Bottom navigation bar (descartado en brainstorming)
- ❌ Ocultar columnas (descartado)
- ❌ Scroll horizontal en tabla (descartado)
- ❌ Animaciones complejas para el drawer (un transition de 200ms basta)
- ❌ Soporte para landscape mobile diferenciado (los breakpoints estándar cubren el caso)
- ❌ Tests visuales / snapshots — verificación manual en DevTools responsive

## 3. Arquitectura

### 3.1 Componente nuevo: `app/components/layout/MobileNav.vue`

Encapsula:
- Botón toggle: ícono `bi-list` cuando cerrado, `bi-x-lg` cuando abierto
- Drawer fixed (`position: fixed; top: 0; right: 0; height: 100vh; width: min(85vw, 320px)`) que entra desde la derecha
- Backdrop semi-transparente (`background: rgba(0,0,0,0.5)`) que cierra al tocar
- Lista de enlaces (`#about`, `#work`) que cierran el drawer al click
- Toggle de `<body>.style.overflow = 'hidden'` mientras está abierto para bloquear el scroll del fondo

**Z-index:** backdrop `1040`, drawer `1050`. El header (z-index 10) queda debajo del backdrop — esto es intencional, así el drawer cubre todo cuando está abierto.

Una sola responsabilidad: navegación mobile. Sin props (lee i18n directamente), sin slots.

**API interna:**
```ts
const isOpen = ref(false)
function toggle() { isOpen.value = !isOpen.value }
function close() { isOpen.value = false }

watch(isOpen, (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
})

// Cleanup on unmount: ensure body scroll is restored
onUnmounted(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
```

**Accesibilidad:**
- Botón con `aria-label="Open navigation"` / `"Close navigation"` (traducible vía nuevas claves i18n `nav.openMenu`, `nav.closeMenu`)
- Botón con `aria-expanded="true|false"`
- Drawer con `role="dialog"` y `aria-modal="true"` cuando abierto
- Links del drawer con foco accesible (Bootstrap reset ya provee outline)
- Cerrar al presionar `Escape` (listener global mientras abierto)

### 3.2 Modificación a `app/components/layout/SiteHeader.vue`

Diff conceptual:
```vue
<nav class="d-none d-md-flex gap-4">
  <a href="#about" class="site-header__link">{{ t('nav.about') }}</a>
  <a href="#work"  class="site-header__link">{{ t('nav.work') }}</a>
</nav>
<MobileNav class="d-md-none" />   <!-- nuevo -->
<LanguageSwitcher />
```

El `<MobileNav>` aparece entre el `<nav>` desktop y el `<LanguageSwitcher>`. En `<md` solo se ve el botón hamburguesa (el `<nav>` está oculto). En `md+` el `<nav>` aparece y el `<MobileNav>` queda oculto.

### 3.3 Modificación a `app/components/sections/WorkSection.vue`

Cambios:
- **Template:** agregar clase `work__title` al `<h2>` (para mover el `text-align` a una regla con media query) y reemplazar `text-end` por nada en el `<h2>`. Ej: `<h2 class="display-section work__title mb-4">`.
- **Style scoped:** ajustar padding y `work__title` text-align responsive. (Las reglas mobile de `.work-table` viven en `_components.scss` — sección 3.5 — porque la clase está definida globalmente y queremos cohesión.)

```scss
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
```

### 3.4 Modificaciones a `app/components/sections/HeroSection.vue` y `app/components/sections/AboutSection.vue`

**HeroSection.vue:**
- Template: `<div class="col-lg-4 text-lg-end">` → `<div class="col-lg-4 text-center text-lg-end">`
- Style scoped: `.hero { padding-block: 2.5rem; @media (min-width: 768px) { padding-block: 4rem; } }`

**AboutSection.vue:**
- Style scoped: `.about { padding-block: 2.5rem; @media (min-width: 768px) { padding-block: 4rem; } }`
- Style scoped: `.about__photo { max-height: 60vh; object-fit: cover; @media (min-width: 992px) { max-height: none; } }`

### 3.5 Modificaciones a `app/assets/scss/_components.scss`

Touch targets:
```scss
.social-link {
  /* existente */
  padding: 0.625rem 1rem;   // antes 0.5rem 1rem (suma ~4px de altura)
}

.lang-switcher a {
  /* existente */
  padding: 0.5rem 0.25rem;   // nuevo
}
```

Reglas mobile-first para `.work-table` (movidas desde el scoped style):
```scss
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
```

### 3.6 Modificaciones a i18n

**`i18n/locales/es.json`** y **`en.json`** — agregar bajo `nav`:
```json
"openMenu": "Abrir menú",   // o "Open menu" en EN
"closeMenu": "Cerrar menú"  // o "Close menu" en EN
```

## 4. Tests

`tests/components/MobileNav.test.ts` — 3 tests:

1. Inicial: drawer cerrado, botón con `aria-expanded="false"`
2. Click en hamburguesa: drawer abierto, `aria-expanded="true"`, ícono cambia a "close"
3. Click en un link del drawer: drawer cierra (`aria-expanded="false"`)

No testeamos:
- El efecto sobre `document.body.style.overflow` (test environment es happy-dom; el efecto real se valida en browser)
- Animación CSS del drawer
- Listener de Escape (ídem; valida visual)
- Reglas de media query (CSS)

## 5. Verificación manual pre-merge

1. `npm run dev`. Abrir `http://localhost:3000/es`.
2. DevTools responsive mode a **375×667** (iPhone SE):
   - Header: solo nombre (izq), hamburguesa (centro-der), language switcher (der). Sin nav inline.
   - Tap hamburguesa → drawer entra desde la derecha con backdrop oscuro. Tap "Sobre mí" → drawer cierra y la página hace scroll a `#about`.
   - Tap fuera del drawer (en el backdrop) → cierra.
   - Hero: título grande, intro, CTA "Proyectos" centrado debajo, social links wrap.
   - About: foto a max 60% del viewport.
   - Work: cada job stacked como bloque, fecha+duración pequeña arriba, empresa, rol abajo. Sin scroll horizontal.
3. Cambiar a **414×896** (iPhone 14 Plus) y repetir.
4. Cambiar a **768px+** (iPad portrait) — drawer hamburguesa debe desaparecer, nav inline debe aparecer. Foto About vuelve a su altura natural (en `lg+`).
5. `npm test` → todos los tests pasan (existentes + nuevo MobileNav).
6. `npm run typecheck` → exit 0.
7. `npm run generate` → succeeds.

## 6. Manejo de errores

- **JS deshabilitado:** El drawer no funciona (es JS-driven). El nav desktop sigue siendo HTML estático que aparece en `md+`. En mobile sin JS, el usuario tiene que scrollear manualmente. Aceptable para un sitio decorativo; no es una app crítica.
- **Vibrate / haptic:** No implementamos.
- **Posición sticky del header con drawer abierto:** El header sigue siendo `position: sticky`. El drawer es `position: fixed` con z-index alto (>10). Funciona bien junto.

## 7. Lo que NO incluimos

- ❌ Bottom nav bar
- ❌ Soporte landscape específico (los media queries por width cubren la mayoría de casos)
- ❌ Animación de iconos hamburger→X tipo morph (un cambio simple de ícono basta)
- ❌ Hardware back button handling (es un SSG, no aplica)
- ❌ Tests del effect en `body.overflow` o del listener de Escape (verificación manual)
