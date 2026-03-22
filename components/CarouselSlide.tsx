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
type ListBlock = { type: 'list'; items: string[]; ordered: boolean }
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

function getSeededStats(slug: string, index: number) {
  const seed = `${slug}:${index}`
  let hash = 2166136261
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  const scalar = 0.72 + ((hash >>> 0) % 61) / 100
  const replies = Math.max(6, Math.round(28 * scalar))
  const reposts = Math.max(3, Math.round(14 * scalar * 0.9))
  const likes = Math.max(40, Math.round(197 * scalar * 1.15))
  const views = Math.max(700, Math.round(2100 * scalar * 1.35))

  return {
    replies: replies.toString(),
    reposts: reposts.toString(),
    likes: likes.toString(),
    views: formatViews(views),
  }
}

function formatViews(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toString()
}

function getTextProfile(slide: Slide) {
  const blocks = parseBodyBlocks(slide.body)
  const kickerLength = slide.eyebrow?.trim().length ?? 0
  const titleLength = getPlainTextLength(slide.title)
  const bodyLength = blocks.reduce((sum, block) => sum + getBlockTextLength(block), 0)
  const paragraphCount = blocks.reduce((sum, block) => sum + (block.type === 'list' ? block.items.length : 1), 0)
  const totalLength = kickerLength + titleLength + bodyLength

  const density = totalLength > 340 || paragraphCount >= 4 || titleLength > 120
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
    const unorderedItems = lines
      .map((line) => line.match(/^[-*]\s+(.+)$/)?.[1]?.trim())
      .filter((item): item is string => Boolean(item))

    if (unorderedItems.length === lines.length && unorderedItems.length > 0) {
      return { type: 'list', items: unorderedItems, ordered: false }
    }

    const orderedItems = lines
      .map((line) => line.match(/^\d+[.)]\s+(.+)$/)?.[1]?.trim())
      .filter((item): item is string => Boolean(item))

    if (orderedItems.length === lines.length && orderedItems.length > 0) {
      return { type: 'list', items: orderedItems, ordered: true }
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

function getLeadParagraph(blocks: BodyBlock[]) {
  const paragraph = blocks.find((block): block is ParagraphBlock => block.type === 'paragraph')
  if (!paragraph) return undefined

  const sentences = paragraph.text.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter(Boolean)
  const lead = sentences[0]
  if (!lead || lead.length > 140) return undefined
  if (sentences.length < 2 && paragraph.text.length < 100) return undefined

  return {
    lead,
    remainder: paragraph.text.slice(lead.length).trim(),
  }
}

function renderBodyBlock(block: BodyBlock, key: string, options?: { asQuoteCard?: boolean; emphasizeLead?: boolean }) {
  if (block.type === 'paragraph') {
    if (options?.emphasizeLead) {
      const lead = getLeadParagraph([block])
      if (lead) {
        return (
          <p key={key}>
            <span className="body-lead">{renderInlineMarkdown(lead.lead)}</span>
            {lead.remainder ? <> {' '}{renderInlineMarkdown(lead.remainder)}</> : null}
          </p>
        )
      }
    }

    return <p key={key}>{renderInlineMarkdown(block.text)}</p>
  }

  if (block.type === 'quote') {
    return (
      <blockquote key={key} className={options?.asQuoteCard ? 'quote-card' : undefined}>
        {renderInlineMarkdown(block.text)}
      </blockquote>
    )
  }

  const ListTag = block.ordered ? 'ol' : 'ul'
  return (
    <ListTag key={key}>
      {block.items.map((item, itemIndex) => <li key={`${key}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>)}
    </ListTag>
  )
}

function renderBody(blocks: BodyBlock[]) {
  return <div className="body-copy explainer-body">{blocks.map((block, i) => renderBodyBlock(block, `body-${i}`, { emphasizeLead: i === 0 }))}</div>
}

export function CarouselSlide({ carousel, slide, index, total }: Props) {
  const theme = {
    accent: carousel.theme?.accent ?? '#1d9bf0',
    background: carousel.theme?.background ?? '#000000',
    foreground: carousel.theme?.foreground ?? '#e7e9ea',
    muted: carousel.theme?.muted ?? '#71767b',
  }
  const textProfile = getTextProfile(slide)
  const stats = getSeededStats(carousel.slug, index)

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
          {slide.eyebrow ? <p className="tweet-kicker">{renderInlineMarkdown(slide.eyebrow)}</p> : null}
          <h2>{renderInlineMarkdown(slide.title)}</h2>
          {slide.body.trim() ? renderBody(textProfile.blocks) : null}
        </div>

        <div className="tweet-meta-row">
          <span>7:42 PM</span>
          <span className="tweet-dot">·</span>
          <span>{stats.views} Views</span>
          <span className="tweet-dot">·</span>
          <span>{carousel.title}</span>
        </div>

        <footer className="tweet-footer">
          <div className="tweet-engagement" aria-label="Tweet actions">
            <span className="tweet-action"><MessageCircleMore className="tweet-icon" strokeWidth={1.8} /> <span>{stats.replies}</span></span>
            <span className="tweet-action"><Repeat className="tweet-icon" strokeWidth={1.8} /> <span>{stats.reposts}</span></span>
            <span className="tweet-action"><Heart className="tweet-icon" strokeWidth={1.8} /> <span>{stats.likes}</span></span>
            <span className="tweet-action"><BarChart3 className="tweet-icon" strokeWidth={1.8} /> <span>{stats.views}</span></span>
            <span className="tweet-action tweet-action-icon-only"><Bookmark className="tweet-icon" strokeWidth={1.8} /></span>
            <span className="tweet-action tweet-action-icon-only"><Share className="tweet-icon" strokeWidth={1.8} /></span>
          </div>
          <span className="tweet-counter">{String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}</span>
        </footer>
      </div>
    </article>
  )
}
