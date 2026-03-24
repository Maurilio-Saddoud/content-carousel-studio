import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getCarouselDirectory } from '@/lib/carousels'
import { renderCarouselFromArgv } from './render-carousel'

type DirectoryItem = {
  slug: string
  title: string
  description: string
  updatedAt: string
}

type ExportIndexItem = {
  slug: string
  title: string
  description: string
  updatedAt: string
  manifestPath: string
  batchPath: string
  previewPath: string
}

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'content-carousel-studio'
const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH ?? process.env.BASE_PATH ?? '')
const publicSiteUrl = normalizePublicSiteUrl(process.env.PUBLIC_SITE_URL)

export async function renderAllFromArgv(argv: string[] = process.argv.slice(2)) {
  const { indexOnly } = parseArgs(argv)

  const items = await getCarouselDirectory() as DirectoryItem[]

  if (!indexOnly) {
    await rm(path.resolve('public', 'exports'), { recursive: true, force: true })
    await mkdir(path.resolve('public', 'exports'), { recursive: true })
  } else {
    await mkdir(path.resolve('public', 'exports'), { recursive: true })
  }

  if (!indexOnly) {
    for (const item of items) {
      await renderCarouselFromArgv([item.slug])
    }
  }

  const exportIndex: ExportIndexItem[] = items.map((item) => ({
    slug: item.slug,
    title: item.title,
    description: item.description,
    updatedAt: item.updatedAt,
    manifestPath: `${basePath}/exports/${item.slug}/manifest.json`,
    batchPath: `${basePath}/exports/${item.slug}/`,
    previewPath: `${basePath}/carousel/${item.slug}/`,
  }))

  await writeFile(path.resolve('public', 'exports', 'index.json'), `${JSON.stringify(exportIndex, null, 2)}\n`, 'utf8')
  await writeFile(path.resolve('public', 'exports', 'index.html'), buildExportsIndexHtml(exportIndex), 'utf8')
}

function parseArgs(argv: string[]) {
  let indexOnly = false

  for (const arg of argv) {
    if (arg === '--index-only') {
      indexOnly = true
      continue
    }

    throw new Error(`Unknown arguments: ${argv.join(' ')}`)
  }

  return { indexOnly }
}

function buildExportsIndexHtml(items: ExportIndexItem[]) {
  const cards = items
    .map(
      (item) => `
        <li>
          <h2>${escapeHtml(item.title)}</h2>
          <p>${escapeHtml(item.description)}</p>
          <p><a href="${item.previewPath}">Preview</a> · <a href="${item.batchPath}">PNG batch</a> · <a href="${item.manifestPath}">manifest.json</a></p>
        </li>`,
    )
    .join('')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Carousel PNG exports</title>
    <style>
      :root { color-scheme: dark; }
      body { font-family: Inter, Arial, sans-serif; margin: 0; background: #020617; color: #f8fafc; }
      main { max-width: 960px; margin: 0 auto; padding: 32px 20px 64px; }
      a { color: #7dd3fc; }
      ul { list-style: none; padding: 0; display: grid; gap: 16px; }
      li { background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 18px; padding: 18px; }
      p { color: #cbd5e1; }
    </style>
  </head>
  <body>
    <main>
      <p>${publicSiteUrl ? `Public base: <a href="${publicSiteUrl}/">${publicSiteUrl}/</a>` : 'Public site URL not set during generation.'}</p>
      <h1>Published carousel PNG exports</h1>
      <p>Only published markdown carousels are indexed here. Each batch has a preview route, a PNG gallery/download page, and a machine-readable manifest.</p>
      <ul>${cards}</ul>
    </main>
  </body>
</html>
`
}

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function normalizeBasePath(value: string) {
  if (!value || value === '/') return ''
  return `/${value.replace(/^\/+|\/+$/g, '')}`
}

function normalizePublicSiteUrl(value?: string) {
  if (value) return value.replace(/\/+$/, '')
  if (process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY_OWNER) {
    return `https://${process.env.GITHUB_REPOSITORY_OWNER.toLowerCase()}.github.io/${repoName}`
  }
  return undefined
}
