import directory from '../../carousels/index.json'
import aiMemoryWall from '../../carousels/ai-memory-wall/carousel.json'
import type { Carousel } from './types'

const carousels: Record<string, Carousel> = {
  'ai-memory-wall': aiMemoryWall as Carousel,
}

export const carouselDirectory = directory as Array<Pick<Carousel, 'slug' | 'title' | 'description' | 'sourceType' | 'aspectRatio' | 'updatedAt' | 'theme'>>

export function getCarousel(slug: string): Carousel | undefined {
  return carousels[slug]
}
