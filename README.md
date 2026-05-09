# my-portfolio

Personal portfolio of Miguel Angel Escamilla — full-stack developer.

**Live:** https://mig21010.github.io/

## Stack
- Nuxt 4 + Vue 3.5 + TypeScript
- Bootstrap 5 SCSS (partial) + Bootstrap Icons
- `@nuxtjs/i18n` (ES / EN)
- Vitest + Vue Test Utils

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
```

## Tests and typecheck

```bash
npm test
npm run typecheck
```

## Static build

```bash
npm run generate          # outputs .output/public
npx serve .output/public  # preview locally
```

## Deploy

Pushed commits to `main` are built and published to GitHub Pages by `.github/workflows/deploy.yml`.
Enable Pages in the repo settings (Source: GitHub Actions) before the first run.

## Editing content

- Personal text per language: `i18n/locales/es.json`, `i18n/locales/en.json`
- Social links: `app/content/socials.ts`
- Skill groups: `app/content/skills.ts`
- Work experience entries: `app/content/work.ts`
