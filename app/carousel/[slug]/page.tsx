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
          {carousel.caption ? (
            <div className="preview-caption-card">
              <div className="preview-caption-head">
                <p className="eyebrow">CAPTION</p>
              </div>
              <p style={{ whiteSpace: 'pre-wrap' }}>{carousel.caption}</p>
            </div>
          ) : null}
        </div>

        <div className="carousel-header-side">
          <Link href="/" className="toolbar-link toolbar-link-subtle">← Back</Link>
          <div className="preview-toolbar-card">
            <p className="eyebrow">EXPORTS</p>
            <div className="preview-toolbar-actions">
              <a className="toolbar-link toolbar-link-primary" href={`${basePath}/exports/${carousel.slug}/${carousel.slug}.zip`} download>
                Download PNG ZIP
              </a>
              <a className="toolbar-link toolbar-link-secondary" href={`${basePath}/exports/${carousel.slug}/${carousel.slug}.pdf`} download>
                Download PDF
              </a>
            </div>
            <p className="preview-toolbar-note">
              Or open any slide below and save it directly on your phone.
            </p>
          </div>
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
                className="toolbar-link toolbar-link-ghost"
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
