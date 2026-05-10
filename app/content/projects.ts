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
