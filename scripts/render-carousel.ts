import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'
import { getCarousel } from '@/lib/carousels'

type Carousel = {
  slug: string
  title: string
  description: string
  slides: Array<{ id: string; title: string }>
}

type RenderManifest = {
  slug: string
  title: string
  description: string
  previewPath: string
  publicPreviewUrl?: string
  exportedAt: string
  slideCount: number
  files: Array<{
    index: number
    fileName: string
    relativePath: string
    publicPath: string
    publicUrl?: string
  }>
}

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'content-carousel-studio'
const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH ?? process.env.BASE_PATH ?? '')
const publicSiteUrl = normalizePublicSiteUrl(process.env.PUBLIC_SITE_URL)

async function main() {
  const slug = process.argv[2]
  if (!slug) {
    console.error('Usage: pnpm render <slug>')
    process.exit(1)
  }

  const baseUrl = process.env.CAROUSEL_BASE_URL ?? 'http://127.0.0.1:3000'
  const outDir = path.resolve('public', 'exports', slug)
  await mkdir(outDir, { recursive: true })

  const carousel = await readCarousel(slug)
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 2 })
  const previewPath = `${basePath}/carousel/${slug}/`
  await page.goto(`${stripTrailingSlash(baseUrl)}${previewPath}`, { waitUntil: 'networkidle' })
  const slides = await page.locator('.carousel-slide').all()

  const files: RenderManifest['files'] = []

  for (let i = 0; i < slides.length; i++) {
    const fileName = `${String(i + 1).padStart(2, '0')}.png`
    const relativePath = path.posix.join('exports', slug, fileName)
    await slides[i].screenshot({ path: path.join(outDir, fileName) })

    files.push({
      index: i + 1,
      fileName,
      relativePath,
      publicPath: `${basePath}/${relativePath}`,
      publicUrl: publicSiteUrl ? `${publicSiteUrl}/${relativePath}` : undefined,
    })
  }

  await browser.close()

  const manifest: RenderManifest = {
    slug,
    title: carousel.title,
    description: carousel.description,
    previewPath,
    publicPreviewUrl: publicSiteUrl ? `${publicSiteUrl}/carousel/${slug}/` : undefined,
    exportedAt: new Date().toISOString(),
    slideCount: files.length,
    files,
  }

  await writeFile(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  await writeFile(path.join(outDir, 'index.html'), buildBatchHtml(manifest), 'utf8')

  console.log(`Rendered ${slides.length} slides to ${outDir}`)
}

async function readCarousel(slug: string): Promise<Carousel> {
  const carousel = await getCarousel(slug)
  if (!carousel) {
    throw new Error(`Carousel not found: ${slug}`)
  }

  return carousel
}

function buildBatchHtml(manifest: RenderManifest) {
  const items = manifest.files
    .map(
      (file) => `
        <li>
          <a href="./${file.fileName}" download>${file.fileName}</a>
          <img src="./${file.fileName}" alt="${escapeHtml(manifest.title)} slide ${file.index}" />
        </li>`,
    )
    .join('')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(manifest.title)} PNG batch</title>
    <style>
      :root { color-scheme: dark; }
      body { font-family: Inter, Arial, sans-serif; margin: 0; background: #0b1020; color: #f8fafc; }
      main { max-width: 1100px; margin: 0 auto; padding: 32px 20px 64px; }
      a { color: #7dd3fc; }
      ul { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
      li { background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 18px; padding: 16px; }
      img { width: 100%; border-radius: 16px; display: block; margin-top: 12px; }
      .meta { color: #cbd5e1; max-width: 70ch; }
    </style>
  </head>
  <body>
    <main>
      <p><a href="${manifest.previewPath}">← Open live preview</a></p>
      <h1>${escapeHtml(manifest.title)} PNG batch</h1>
      <p class="meta">${escapeHtml(manifest.description)}</p>
      <p class="meta">Download every card below, or use <code>manifest.json</code> for automation.</p>
      <ul>${items}
      </ul>
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
  if (value) {
    return stripTrailingSlash(value)
  }

  if (process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY_OWNER) {
    return `https://${process.env.GITHUB_REPOSITORY_OWNER.toLowerCase()}.github.io/${repoName}`
  }

  return undefined
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
