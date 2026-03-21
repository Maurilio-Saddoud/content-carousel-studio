import type { Carousel, CarouselSlide as Slide } from '../lib/types'

type Props = {
  carousel: Carousel
  slide: Slide
  index: number
  total: number
}

export function CarouselSlide({ carousel, slide, index, total }: Props) {
  const theme = {
    accent: carousel.theme?.accent ?? '#1d9bf0',
    background: carousel.theme?.background ?? '#000000',
    foreground: carousel.theme?.foreground ?? '#e7e9ea',
    muted: carousel.theme?.muted ?? '#71767b',
  }

  return (
    <article
      className="carousel-slide tweet-card"
      style={{
        background: theme.background,
        color: theme.foreground,
        ['--accent' as string]: theme.accent,
        ['--muted' as string]: theme.muted,
      }}
    >
      <div className="tweet-shell">
        <header className="tweet-header">
          <div className="tweet-avatar" aria-hidden="true">
            <span>MS</span>
          </div>
          <div className="tweet-meta">
            <div className="tweet-name-row">
              <span className="tweet-name">Maurilio Saddoud</span>
              <span className="tweet-badge">✓</span>
            </div>
            <div className="tweet-handle-row">
              <span className="tweet-handle">@mauriliosaddoud</span>
              <span className="tweet-dot">·</span>
              <span className="tweet-label">Post {String(index + 1).padStart(2, '0')}</span>
            </div>
          </div>
          <div className="tweet-mark" aria-hidden="true">𝕏</div>
        </header>

        <div className="tweet-content">
          <p className="tweet-eyebrow">{slide.eyebrow ?? carousel.title}</p>
          <h2>{slide.title}</h2>
          <div className="body-copy">
            {slide.body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        <footer className="tweet-footer">
          <div className="tweet-engagement">
            <span>💬 28</span>
            <span>🔁 14</span>
            <span>♥ 197</span>
            <span>🔖</span>
          </div>
          <span>{String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}</span>
        </footer>
      </div>
    </article>
  )
}
