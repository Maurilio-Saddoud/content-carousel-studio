import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">NOT FOUND</p>
        <h1>Carousel not found</h1>
        <p>The route exists, but that carousel slug does not.</p>
        <Link href="/">← Back to table of contents</Link>
      </section>
    </main>
  )
}
