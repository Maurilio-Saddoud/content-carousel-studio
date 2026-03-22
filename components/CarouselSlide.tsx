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
      <path d="M12 3.75a.75.75 0 0 1 .75.75v8.69l3.72-3.72a.75.75 0 1 1 1.06 1.06l-5 5a.75.75 0 0 1-1.06 0l-5-5a.75.75 0 1 1 1.06-1.06l3.72 3.72V4.5a.75.75 0 0 1 .75-.75ZM5 14.75A1.75 1.75 0 0 1 6.75 13h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v3.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-3.5a.25.25 0 0 0-.25-.25h-2.5a.75.75 0 0 1 0-1.5h2.5A1.75 1.75 0 0 1 19 14.75v3.5A1.75 1.75 0 0 1 17.25 20H6.75A1.75 1.75 0 0 1 5 18.25v-3.5Z" fill="currentColor" />
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
