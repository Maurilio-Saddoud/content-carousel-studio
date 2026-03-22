import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CarouselSlide } from '@/components/CarouselSlide'
import { getCarousel, getCarouselDirectory } from '@/lib/carousels'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const directory = await getCarouselDirectory()
  return directory.map((item) => ({ slug: item.slug }))
}

export default async function CarouselPage({ params }: Props) {
  const { slug } = await params
  const carousel = await getCarousel(slug)

  if (!carousel) {
    notFound()
  }

  return (
    <main className="page-shell">
      <div className="carousel-header">
        <div>
          <p className="eyebrow">{carousel.sourceType.toUpperCase()}</p>
          <h1>{carousel.title}</h1>
          <p>{carousel.description}</p>
        </div>
        <Link href="/">← Back</Link>
      </div>

      <div className="slides-stack">
        {carousel.slides.map((slide, index) => (
          <CarouselSlide
            key={slide.id}
            carousel={carousel}
            slide={slide}
            index={index}
            total={carousel.slides.length}
          />
        ))}
      </div>
    </main>
  )
}
