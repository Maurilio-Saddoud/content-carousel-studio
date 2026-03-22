import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Carousel, CarouselDirectoryItem } from '@/lib/types'

const carouselsDir = path.resolve(process.cwd(), 'carousels')
const carouselIndexPath = path.join(carouselsDir, 'index.json')

export async function getCarouselDirectory(): Promise<CarouselDirectoryItem[]> {
  const raw = await readFile(carouselIndexPath, 'utf8')
  return JSON.parse(raw) as CarouselDirectoryItem[]
}

export async function getCarousel(slug: string): Promise<Carousel | undefined> {
  try {
    const raw = await readFile(path.join(carouselsDir, slug, 'carousel.json'), 'utf8')
    return JSON.parse(raw) as Carousel
  } catch {
    return undefined
  }
}
