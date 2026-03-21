export type CarouselSlide = {
  id: string
  eyebrow?: string
  title: string
  body: string[]
}

export type Carousel = {
  slug: string
  title: string
  description: string
  sourceType: 'transcript' | 'notes' | 'custom'
  aspectRatio: 'portrait'
  updatedAt: string
  theme?: {
    accent?: string
    background?: string
    foreground?: string
    muted?: string
  }
  slides: CarouselSlide[]
}
