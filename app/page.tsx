import Link from 'next/link'
import { getCarouselDirectory } from '@/lib/carousels'

export default async function HomePage() {
  const carouselDirectory = await getCarouselDirectory()

  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">CONTENT CAROUSEL STUDIO</p>
        <h1>Table of contents</h1>
        <p>
          Published markdown carousels with dedicated preview routes and PNG exports.
        </p>
      </section>

      <section className="toc-grid">
        {carouselDirectory.map((item) => (
          <Link key={item.slug} href={`/carousel/${item.slug}`} className="toc-card">
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
