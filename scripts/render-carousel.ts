import { execFile } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'
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
  pdfFileName?: string
  pdfPath?: string
  publicPdfUrl?: string
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
const execFileAsync = promisify(execFile)

export async function renderCarouselFromArgv(argv: string[] = process.argv.slice(2)) {
  const options = parseArgs(argv)
  const slug = options.slug
  if (!slug) {
    console.error('Usage: content-carousel render <slug> [--base-url http://127.0.0.1:3000]')
    process.exit(1)
  }

  const baseUrl = options.baseUrl ?? process.env.CAROUSEL_BASE_URL ?? 'http://127.0.0.1:3000'
  const outDir = path.resolve('public', 'exports', slug)
  await mkdir(outDir, { recursive: true })

  const carousel = await readCarousel(slug)
  const previewPath = `${basePath}/carousel/${slug}/`
  const files: RenderManifest['files'] = []
  const browser = await chromium.launch()
  let context

  try {
    context = await browser.newContext({
      viewport: { width: 430, height: 932 },
      screen: { width: 430, height: 932 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    })
    const page = await context.newPage()
    await page.goto(`${stripTrailingSlash(baseUrl)}${previewPath}`, { waitUntil: 'networkidle' })

    const slidesLocator = page.locator('.carousel-slide')
    const slideCount = await slidesLocator.count()

    if (slideCount === 0) {
      throw new Error(`Render target produced 0 .carousel-slide elements at ${stripTrailingSlash(baseUrl)}${previewPath}`)
    }

    for (let i = 0; i < slideCount; i++) {
      const slide = slidesLocator.nth(i)
      const fileName = `${String(i + 1).padStart(2, '0')}.png`
      const relativePath = path.posix.join('exports', slug, fileName)
      await slide.screenshot({ path: path.join(outDir, fileName) })

      files.push({
        index: i + 1,
        fileName,
        relativePath,
        publicPath: `${basePath}/${relativePath}`,
        publicUrl: publicSiteUrl ? `${publicSiteUrl}/${relativePath}` : undefined,
      })
    }
  } finally {
    await context?.close().catch(() => undefined)
    await browser.close()
  }

  const zipFileName = `${slug}.zip`
  const pdfFileName = `${slug}.pdf`
  await createZipBundle(outDir, zipFileName, files.map((file) => file.fileName))
  await createPdfBundle(outDir, pdfFileName, files.map((file) => file.fileName))

  const manifest: RenderManifest = {
    slug,
    title: carousel.title,
    description: carousel.description,
    previewPath,
    publicPreviewUrl: publicSiteUrl ? `${publicSiteUrl}/carousel/${slug}/` : undefined,
    pdfFileName,
    pdfPath: `${basePath}/exports/${slug}/${pdfFileName}`,
    publicPdfUrl: publicSiteUrl ? `${publicSiteUrl}/exports/${slug}/${pdfFileName}` : undefined,
    exportedAt: new Date().toISOString(),
    slideCount: files.length,
    files,
  }

  await writeFile(path.join(outDir, 'manifest.json'), `${JSON.stringify({ ...manifest, zipFileName }, null, 2)}\n`, 'utf8')
  await writeFile(path.join(outDir, 'index.html'), buildBatchHtml(manifest), 'utf8')

  console.log(`Rendered ${files.length} slides to ${outDir}`)
}

function parseArgs(argv: string[]) {
  const options: { slug?: string; baseUrl?: string } = {}

  for (let i = 0; i < argv.length; i++) {
    const current = argv[i]
    if (!current) continue

    if (!options.slug && !current.startsWith('--')) {
      options.slug = current
      continue
    }

    if (current === '--base-url') {
      options.baseUrl = argv[++i]
      continue
    }

    if (current.startsWith('--base-url=')) {
      options.baseUrl = current.split('=').slice(1).join('=')
      continue
    }

    throw new Error(`Unknown argument: ${current}`)
  }

  return options
}

async function readCarousel(slug: string): Promise<Carousel> {
  const carousel = await getCarousel(slug)
  if (!carousel) {
    throw new Error(`Carousel not found: ${slug}`)
  }

  return carousel
}

async function createZipBundle(outDir: string, zipFileName: string, fileNames: string[]) {
  if (fileNames.length === 0) return

  const zipPath = path.join(outDir, zipFileName)
  await execFileAsync('zip', ['-jq', zipPath, ...fileNames], { cwd: outDir })
}

async function createPdfBundle(outDir: string, pdfFileName: string, fileNames: string[]) {
  if (fileNames.length === 0) return

  const slides = await Promise.all(
    fileNames.map(async (fileName, index) => ({
      index: index + 1,
      dataUrl: `data:image/png;base64,${(await readFile(path.join(outDir, fileName))).toString('base64')}`,
    })),
  )

  const html = buildPdfHtml(slides)
  const browser = await chromium.launch()

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    await page.pdf({
      path: path.join(outDir, pdfFileName),
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })
  } finally {
    await browser.close()
  }
}

function buildBatchHtml(manifest: RenderManifest) {
  const zipFileName = `${manifest.slug}.zip`
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
      <p class="meta"><a href="./${zipFileName}" download>Download all slides as .zip</a> · <a href="./${manifest.pdfFileName}" download>Download PDF</a></p>
      <p class="meta">Download every card below, grab the PDF, or use <code>manifest.json</code> for automation.</p>
      <ul>${items}
      </ul>
    </main>
  </body>
</html>
`
}

function buildPdfHtml(slides: Array<{ index: number; dataUrl: string }>) {
  const pages = slides
    .map((slide) => `
      <section class="page">
        <img src="${slide.dataUrl}" alt="Slide ${slide.index}" />
      </section>`)
    .join('')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Carousel PDF export</title>
    <style>
      @page { size: 430px 932px; margin: 0; }
      html, body { margin: 0; padding: 0; background: #000; }
      .page { width: 430px; height: 932px; page-break-after: always; break-after: page; }
      .page:last-child { page-break-after: auto; break-after: auto; }
      img { width: 430px; height: 932px; display: block; object-fit: cover; }
    </style>
  </head>
  <body>${pages}
  </body>
</html>`
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
