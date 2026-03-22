import Image from 'next/image'
import type { ReactNode } from 'react'
import {
  Bookmark,
  Check,
  Heart,
  MessageCircleMore,
  Repeat,
  BarChart3,
  Share,
} from 'lucide-react'
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

function VerifiedBadge() {
  return (
    <span className="tweet-badge" aria-label="Verified account">
      <span className="tweet-badge-circle">
        <Check className="tweet-badge-check" aria-hidden="true" strokeWidth={3} />
      </span>
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
            <span className="tweet-action"><MessageCircleMore className="tweet-icon" strokeWidth={1.8} /> <span>28</span></span>
            <span className="tweet-action"><Repeat className="tweet-icon" strokeWidth={1.8} /> <span>14</span></span>
            <span className="tweet-action"><Heart className="tweet-icon" strokeWidth={1.8} /> <span>197</span></span>
            <span className="tweet-action"><BarChart3 className="tweet-icon" strokeWidth={1.8} /> <span>2.1K</span></span>
            <span className="tweet-action tweet-action-icon-only"><Bookmark className="tweet-icon" strokeWidth={1.8} /></span>
            <span className="tweet-action tweet-action-icon-only"><Share className="tweet-icon" strokeWidth={1.8} /></span>
          </div>
          <span className="tweet-counter">{String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}</span>
        </footer>
      </div>
    </article>
  )
}
