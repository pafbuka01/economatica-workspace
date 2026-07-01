import type { Tutorial } from '@/data/terminal'
import tutorialThumb from '@/assets/thumbs/terminal-tutorial.png'

export interface ApiService {
  id: string
  name: string
}

/** APIs disponíveis (ordem do comp). */
export const apiServices: ApiService[] = [
  { id: 'noticias', name: 'Notícias' },
  { id: 'fundamentos', name: 'Fundamentos' },
  { id: 'fundos', name: 'Fundos' },
]

/** Tutoriais da página de APIs (títulos do comp). */
export const apiTutorials: Tutorial[] = [
  { title: 'Visão geral e primeiro acesso', duration: '1m15s', highlight: 'Comece por aqui', thumb: tutorialThumb },
  { title: 'Montando e organizando seu primeiro workspace', duration: '1m15s', thumb: tutorialThumb },
  { title: 'Montando e organizando seu primeiro workspace', duration: '1m15s', thumb: tutorialThumb },
  { title: 'Aprenda a usar o Kento no seu Terminal', duration: '1m15s', thumb: tutorialThumb },
]
