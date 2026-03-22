import directory from '@/carousels/index.json'
import aiMemoryWall from '@/carousels/ai-memory-wall/carousel.json'
import aiSkillsAgeFast from '@/carousels/why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci/carousel.json'
import type { Carousel, CarouselDirectoryItem } from '@/lib/types'

const carousels: Record<string, Carousel> = {
  'ai-memory-wall': aiMemoryWall as Carousel,
  'why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci': aiSkillsAgeFast as Carousel,
}

export const carouselDirectory = directory as CarouselDirectoryItem[]

export function getCarousel(slug: string): Carousel | undefined {
  return carousels[slug]
}
