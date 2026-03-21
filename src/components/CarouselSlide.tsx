import type { Carousel, CarouselSlide as Slide } from '../lib/types'

type Props = {
  carousel: Carousel
  slide: Slide
  index: number
  total: number
}

export function CarouselSlide({ carousel, slide, index, total }: Props) {
  const theme = {
    accent: carousel.theme?.accent ?? '#D1702B',
    background: carousel.theme?.background ?? '#F7F4ED',
    foreground: carousel.theme?.foreground ?? '#171717',
    muted: carousel.theme?.muted ?? '#5E5A55',
  }

  return (
    <article
      className="carousel-slide"
      style={{
        background: theme.background,
        color: theme.foreground,
        ['--accent' as string]: theme.accent,
        ['--muted' as string]: theme.muted,
      }}
    >
      <div className="accent-bar" />
      <div className="slide-content">
        <p className="eyebrow">{slide.eyebrow ?? carousel.title}</p>
        <h2>{slide.title}</h2>
        <div className="body-copy">
          {slide.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
      <footer>
        <span>{carousel.title}</span>
        <span>{String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}</span>
      </footer>
    </article>
  )
}
