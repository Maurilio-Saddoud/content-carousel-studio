import Image from 'next/image'
import type { Carousel, CarouselSlide as Slide } from '@/lib/types'

type Props = {
  carousel: Carousel
  slide: Slide
  index: number
  total: number
}

function ReplyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="tweet-icon">
      <path d="M3 12.5c0-4.694 4.03-8.5 9-8.5 4.25 0 7.813 2.78 8.725 6.5h-2.09C17.79 8.03 15.15 6 12 6c-3.866 0-7 2.91-7 6.5S8.134 19 12 19c1.73 0 3.314-.58 4.538-1.54l1.454 1.37C16.42 20.18 14.3 21 12 21c-4.97 0-9-3.806-9-8.5Zm10-1.5h8v2h-8l3.5 3.5-1.414 1.414L9.172 12l5.914-5.914L16.5 7.5 13 11Z" fill="currentColor" />
    </svg>
  )
}

function RepostIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="tweet-icon">
      <path d="M4.5 5.5h10.879l-2.94-2.94L13.853 1.146 19.207 6.5l-5.354 5.354-1.414-1.414 2.94-2.94H6.5v6h-2v-8Zm13 5h2v8H8.621l2.94 2.94-1.414 1.414L4.793 17.5l5.354-5.354 1.414 1.414-2.94 2.94H17.5v-6Z" fill="currentColor" />
    </svg>
  )
}

function LikeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="tweet-icon">
      <path d="M12 21.638h-.014C9.403 21.57 2 15.596 2 9.478 2 6.418 4.42 4 7.48 4c1.87 0 3.63.874 4.52 2.3C12.89 4.874 14.65 4 16.52 4 19.58 4 22 6.418 22 9.478c0 6.118-7.403 12.091-9.986 12.16H12Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="tweet-icon">
      <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-4-6 4V4.75Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="tweet-icon">
      <path d="M12 3.75a.75.75 0 0 1 .75.75v8.69l3.72-3.72a.75.75 0 1 1 1.06 1.06l-5 5a.75.75 0 0 1-1.06 0l-5-5a.75.75 0 0 1 1.06-1.06l3.72 3.72V4.5a.75.75 0 0 1 .75-.75ZM5 14.75A1.75 1.75 0 0 1 6.75 13h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v3.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-3.5a.25.25 0 0 0-.25-.25h-2.5a.75.75 0 0 1 0-1.5h2.5A1.75 1.75 0 0 1 19 14.75v3.5A1.75 1.75 0 0 1 17.25 20H6.75A1.75 1.75 0 0 1 5 18.25v-3.5Z" fill="currentColor" />
    </svg>
  )
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
          <div className="tweet-avatar">
            <Image src="/assets/maurilio-profile.jpg" alt="Maurilio Saddoud" width={52} height={52} priority />
          </div>

          <div className="tweet-meta">
            <div className="tweet-name-row">
              <span className="tweet-name">Maurilio Saddoud</span>
              <span className="tweet-badge" aria-label="Verified account">
                <svg viewBox="0 0 24 24" className="tweet-badge-icon" aria-hidden="true">
                  <path d="M22.25 12c0-.81-.9-1.42-1.14-2.14-.24-.75.09-1.77-.38-2.41-.47-.65-1.56-.76-2.21-1.23-.64-.47-1.06-1.47-1.81-1.71-.72-.24-1.62.36-2.43.36-.81 0-1.71-.6-2.43-.36-.75.24-1.17 1.24-1.81 1.71-.65.47-1.74.58-2.21 1.23-.47.64-.14 1.66-.38 2.41C2.65 10.58 1.75 11.19 1.75 12c0 .81.9 1.42 1.14 2.14.24.75-.09 1.77.38 2.41.47.65 1.56.76 2.21 1.23.64.47 1.06 1.47 1.81 1.71.72.24 1.62-.36 2.43-.36.81 0 1.71.6 2.43.36.75-.24 1.17-1.24 1.81-1.71.65-.47 1.74-.58 2.21-1.23.47-.64.14-1.66.38-2.41.24-.72 1.14-1.33 1.14-2.14Z" fill="currentColor" />
                  <path d="m10.7 14.85-2.4-2.4 1.06-1.06 1.34 1.34 4.02-4.02 1.06 1.06-5.08 5.08Z" fill="#fff" />
                </svg>
              </span>
            </div>
            <div className="tweet-handle-row">
              <span className="tweet-handle">@Maurili007</span>
              <span className="tweet-dot">·</span>
              <span className="tweet-label">Mar 21</span>
            </div>
          </div>

          <div className="tweet-mark" aria-hidden="true">𝕏</div>
        </header>

        <div className="tweet-content">
          <p className="tweet-kicker">{slide.eyebrow ?? carousel.title}</p>
          <h2>{slide.title}</h2>
          <div className="body-copy">
            {slide.body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="tweet-meta-row">
          <span>7:42 PM</span>
          <span className="tweet-dot">·</span>
          <span>2.1K Views</span>
          <span className="tweet-dot">·</span>
          <span>{slide.eyebrow ?? carousel.title}</span>
        </div>

        <footer className="tweet-footer">
          <div className="tweet-engagement">
            <span className="tweet-action"><ReplyIcon /> <span>28</span></span>
            <span className="tweet-action"><RepostIcon /> <span>14</span></span>
            <span className="tweet-action"><LikeIcon /> <span>197</span></span>
            <span className="tweet-action tweet-action-icon-only"><BookmarkIcon /></span>
            <span className="tweet-action tweet-action-icon-only"><ShareIcon /></span>
          </div>
          <span className="tweet-counter">{String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}</span>
        </footer>
      </div>
    </article>
  )
}
