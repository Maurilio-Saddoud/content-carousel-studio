import { Link, Route, Routes, useParams } from 'react-router-dom'
import { CarouselSlide } from './components/CarouselSlide'
import { carouselDirectory, getCarousel } from './lib/loaders'

function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">CONTENT CAROUSEL STUDIO</p>
        <h1>Table of contents</h1>
        <p>
          React-powered carousel previews built for LinkedIn and Instagram. Each carousel gets its own route and can be rendered to PNGs.
        </p>
      </section>

      <section className="toc-grid">
        {carouselDirectory.map((item) => (
          <Link key={item.slug} to={`/carousel/${item.slug}`} className="toc-card">
            <p className="eyebrow">{item.sourceType.toUpperCase()}</p>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <span>Open preview →</span>
          </Link>
        ))}
      </section>
    </main>
  )
}

function CarouselPage() {
  const { slug = '' } = useParams()
  const carousel = getCarousel(slug)

  if (!carousel) {
    return (
      <main className="page-shell">
        <h1>Carousel not found</h1>
        <Link to="/">Back to table of contents</Link>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <div className="carousel-header">
        <div>
          <p className="eyebrow">{carousel.sourceType.toUpperCase()}</p>
          <h1>{carousel.title}</h1>
          <p>{carousel.description}</p>
        </div>
        <Link to="/">← Back</Link>
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

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/carousel/:slug" element={<CarouselPage />} />
    </Routes>
  )
}
