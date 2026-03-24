import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CarouselSlide } from '@/components/CarouselSlide'
import { getCarousel, getCarouselDirectory } from '@/lib/carousels'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

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
        <div className="carousel-header-main">
          <p className="eyebrow">{carousel.sourceType.toUpperCase()}</p>
          <h1>{carousel.title}</h1>
          <p>{carousel.description}</p>
          <p className="preview-toolbar-note">
            Or open any slide below and save it directly on your phone.
          </p>
        </div>
        <div className="carousel-header-actions">
          <Link href="/" className="preview-button preview-button-ghost">← Back</Link>
          <a href={`${basePath}/exports/${carousel.slug}/${carousel.slug}.zip`} download className="preview-button preview-button-primary">
            Download PNG
          </a>
          <a href={`${basePath}/exports/${carousel.slug}/${carousel.slug}.pdf`} download className="preview-button preview-button-secondary">
            Download PDF
          </a>
        </div>
      </div>

      <div className="slides-stack">
        {carousel.slides.map((slide, index) => (
          <div key={slide.id} className="preview-slide-group">
            <CarouselSlide
              carousel={carousel}
              slide={slide}
              index={index}
              total={carousel.slides.length}
            />
            <div className="preview-slide-actions">
              <a
                className="preview-button preview-button-inline"
                href={`${basePath}/exports/${carousel.slug}/${String(index + 1).padStart(2, '0')}.png`}
                target="_blank"
                rel="noreferrer"
              >
                Open full-size PNG
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
