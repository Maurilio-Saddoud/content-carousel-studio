import Image from 'next/image'
import type { ReactNode } from 'react'
import type { Carousel, CarouselSlide as Slide } from '@/lib/types'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

type Props = {
  carousel: Carousel
  slide: Slide
  index: number
  total: number
}

type ParagraphBlock = { type: 'paragraph'; text: string }
type ListBlock = { type: 'list'; items: string[] }
type QuoteBlock = { type: 'quote'; text: string }
type BodyBlock = ParagraphBlock | ListBlock | QuoteBlock

type InlineToken =
  | { type: 'text'; text: string }
  | { type: 'strong'; children: InlineToken[] }
  | { type: 'em'; children: InlineToken[] }

function ReplyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="tweet-icon tweet-icon-stroke">
      <path d="M4.9 11.42c0-4.57 3.7-8.27 8.27-8.27 3.38 0 6.08 1.59 7.88 4.26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m4.9 12.06 4.52-3.92" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="m4.9 12.06 4.52 3.92" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function RepostIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="tweet-icon tweet-icon-stroke">
      <path d="M4.75 7.5h10.82" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="m13.05 4.92 3.52 2.58-3.52 2.58" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.25 16.5H8.43" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="m10.95 13.92-3.52 2.58 3.52 2.58" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.43 16.5V7.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16.57 7.5v9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function LikeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="tweet-icon tweet-icon-stroke">
      <path d="M16.7 5.1c-1.97 0-3.28 1.04-4.12 2.31C11.74 6.14 10.43 5.1 8.46 5.1 5.62 5.1 3.5 7.29 3.5 10.02c0 2.12.88 3.8 2.65 5.66 1.63 1.73 3.73 3.28 5.62 4.67a.4.4 0 0 0 .47 0c1.89-1.39 3.99-2.94 5.62-4.67 1.77-1.86 2.65-3.54 2.65-5.66 0-2.73-2.12-4.92-4.96-4.92Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ViewsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="tweet-icon tweet-icon-stroke">
      <path d="M4.5 18.5h15" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" opacity="0.55" />
      <path d="M7.25 16.8v-3.05" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M11.1 16.8V9.95" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M14.95 16.8v-4.7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M18.8 16.8V7.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="tweet-icon tweet-icon-stroke">
      <path d="M6.75 4.5h10.5c.41 0 .75.34.75.75v14.29l-5.53-3.95a.8.8 0 0 0-.94 0L6 19.54V5.25c0-.41.34-.75.75-.75Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="tweet-icon tweet-icon-stroke">
      <path d="M12 4.75v8.78" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="m8.48 8.22 3.52-3.47 3.52 3.47" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.75 13.75v4.5c0 .83.67 1.5 1.5 1.5h9.5c.83 0 1.5-.67 1.5-1.5v-4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function VerifiedBadge() {
  return (
    <span className="tweet-badge" aria-label="Verified account">
      <svg viewBox="0 0 20 20" className="tweet-badge-icon" aria-hidden="true">
        <circle cx="10" cy="10" r="8.5" fill="currentColor" />
        <path d="m8.53 12.72-2.1-2.1 1.06-1.06 1.04 1.04 3.04-3.04 1.06 1.06-4.1 4.1Z" fill="#fff" />
      </svg>
    </span>
  )
}

function getTextProfile(slide: Slide) {
  const blocks = parseBodyBlocks(slide.body)
  const eyebrowLength = slide.eyebrow?.trim().length ?? 0
  const titleLength = getPlainTextLength(slide.title)
  const bodyLength = blocks.reduce((sum, block) => sum + getBlockTextLength(block), 0)
  const paragraphCount = blocks.reduce((sum, block) => sum + (block.type === 'list' ? block.items.length : 1), 0)
  const totalLength = eyebrowLength + titleLength + bodyLength

  const density = totalLength > 340 || paragraphCount >= 3 || titleLength > 120
    ? 'tweet-card-dense'
    : totalLength < 170 && paragraphCount <= 2 && titleLength < 80
      ? 'tweet-card-compact'
      : 'tweet-card-balanced'

  const titleTone = titleLength > 110 ? 'tweet-title-long' : titleLength < 55 ? 'tweet-title-short' : 'tweet-title-balanced'
  const bodyTone = bodyLength > 170 || paragraphCount >= 3 ? 'tweet-body-long' : bodyLength < 90 ? 'tweet-body-short' : 'tweet-body-balanced'

  return { density, titleTone, bodyTone, blocks }
}

function getBlockTextLength(block: BodyBlock) {
  if (block.type === 'list') {
    return block.items.join(' ').trim().length
  }

  return block.text.trim().length
}

function getPlainTextLength(text: string) {
  return text.replace(/[*_`>#-]+/g, '').trim().length
}

function parseBodyBlocks(body: string): BodyBlock[] {
  const sections = body
    .split(/\n\s*\n/)
    .map((section) => section.trim())
    .filter(Boolean)

  return sections.map((section) => {
    const lines = section.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    const listItems = lines
      .map((line) => line.match(/^[-*]\s+(.+)$/)?.[1]?.trim())
      .filter((item): item is string => Boolean(item))

    if (listItems.length === lines.length && listItems.length > 0) {
      return { type: 'list', items: listItems }
    }

    const quoteLines = lines
      .map((line) => line.match(/^>\s?(.+)$/)?.[1]?.trim())
      .filter((item): item is string => Boolean(item))

    if (quoteLines.length === lines.length && quoteLines.length > 0) {
      return { type: 'quote', text: quoteLines.join(' ') }
    }

    return { type: 'paragraph', text: lines.join(' ') }
  })
}

function parseInlineMarkdown(text: string): InlineToken[] {
  return parseInlineSegment(text)
}

function parseInlineSegment(text: string, activeMarker?: '**' | '*'): InlineToken[] {
  const tokens: InlineToken[] = []
  let cursor = 0

  while (cursor < text.length) {
    const strongMarker = text.indexOf('**', cursor)
    const emMarker = text.indexOf('*', cursor)
    const nextMarker = getNextMarker(strongMarker, emMarker)

    if (!nextMarker) {
      pushTextToken(tokens, text.slice(cursor))
      break
    }

    if (nextMarker.index > cursor) {
      pushTextToken(tokens, text.slice(cursor, nextMarker.index))
    }

    if (activeMarker === nextMarker.marker) {
      return tokens
    }

    const innerStart = nextMarker.index + nextMarker.marker.length
    const innerTokens = parseInlineSegment(text.slice(innerStart), nextMarker.marker)
    const consumed = getTokenText(innerTokens).length
    const closingIndex = innerStart + consumed

    if (text.slice(closingIndex, closingIndex + nextMarker.marker.length) === nextMarker.marker) {
      tokens.push({ type: nextMarker.marker === '**' ? 'strong' : 'em', children: innerTokens })
      cursor = closingIndex + nextMarker.marker.length
      continue
    }

    pushTextToken(tokens, nextMarker.marker)
    cursor = innerStart
  }

  return tokens
}

function getNextMarker(strongIndex: number, emIndex: number) {
  const candidates = [
    strongIndex >= 0 ? { marker: '**' as const, index: strongIndex } : undefined,
    emIndex >= 0 ? { marker: '*' as const, index: emIndex } : undefined,
  ].filter((value): value is { marker: '**' | '*'; index: number } => Boolean(value))

  if (candidates.length === 0) {
    return undefined
  }

  candidates.sort((a, b) => a.index - b.index || b.marker.length - a.marker.length)
  return candidates[0]
}

function pushTextToken(tokens: InlineToken[], text: string) {
  if (!text) return

  const previous = tokens[tokens.length - 1]
  if (previous?.type === 'text') {
    previous.text += text
    return
  }

  tokens.push({ type: 'text', text })
}

function getTokenText(tokens: InlineToken[]): string {
  return tokens.map((token) => (token.type === 'text' ? token.text : getTokenText(token.children))).join('')
}

function renderInlineMarkdown(text: string): ReactNode[] {
  return renderInlineTokens(parseInlineMarkdown(text))
}

function renderInlineTokens(tokens: InlineToken[], keyPrefix = 'md'): ReactNode[] {
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`
    if (token.type === 'text') {
      return token.text
    }

    if (token.type === 'strong') {
      return <strong key={key}>{renderInlineTokens(token.children, `${key}-strong`)}</strong>
    }

    return <em key={key}>{renderInlineTokens(token.children, `${key}-em`)}</em>
  })
}

export function CarouselSlide({ carousel, slide, index, total }: Props) {
  const theme = {
    accent: carousel.theme?.accent ?? '#1d9bf0',
    background: carousel.theme?.background ?? '#000000',
    foreground: carousel.theme?.foreground ?? '#e7e9ea',
    muted: carousel.theme?.muted ?? '#71767b',
  }
  const textProfile = getTextProfile(slide)

  return (
    <article
      className={`carousel-slide tweet-card ${textProfile.density} ${textProfile.titleTone} ${textProfile.bodyTone}`}
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
            <Image src={`${basePath}/assets/maurilio-profile.jpg`} alt="Maurilio Saddoud" width={52} height={52} priority />
          </div>

          <div className="tweet-meta">
            <div className="tweet-name-row">
              <span className="tweet-name">Maurilio Saddoud</span>
              <VerifiedBadge />
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
          <p className="tweet-kicker">{renderInlineMarkdown(slide.eyebrow ?? carousel.title)}</p>
          <h2>{renderInlineMarkdown(slide.title)}</h2>
          <div className="body-copy">
            {textProfile.blocks.map((block, i) => {
              if (block.type === 'paragraph') {
                return <p key={i}>{renderInlineMarkdown(block.text)}</p>
              }

              if (block.type === 'quote') {
                return <blockquote key={i}>{renderInlineMarkdown(block.text)}</blockquote>
              }

              return (
                <ul key={i}>
                  {block.items.map((item, itemIndex) => <li key={`${i}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>)}
                </ul>
              )
            })}
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
          <div className="tweet-engagement" aria-label="Tweet actions">
            <span className="tweet-action"><ReplyIcon /> <span>28</span></span>
            <span className="tweet-action"><RepostIcon /> <span>14</span></span>
            <span className="tweet-action"><LikeIcon /> <span>197</span></span>
            <span className="tweet-action"><ViewsIcon /> <span>2.1K</span></span>
            <span className="tweet-action tweet-action-icon-only"><BookmarkIcon /></span>
            <span className="tweet-action tweet-action-icon-only"><ShareIcon /></span>
          </div>
          <span className="tweet-counter">{String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}</span>
        </footer>
      </div>
    </article>
  )
}
