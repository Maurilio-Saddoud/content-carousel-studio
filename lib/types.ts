export type CarouselSlide = {
  id: string
  eyebrow?: string
  title: string
  body: string
}

export type CarouselTheme = {
  accent?: string
  background?: string
  foreground?: string
  muted?: string
}

export type CarouselDirectoryItem = {
  slug: string
  title: string
  description: string
  sourceType: 'transcript' | 'notes' | 'custom'
  aspectRatio: 'portrait'
  updatedAt: string
  createdAt?: string
  theme?: CarouselTheme
}

export type Carousel = CarouselDirectoryItem & {
  slides: CarouselSlide[]
}
