import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const slug = process.argv[2]
if (!slug) {
  console.error('Usage: pnpm render <slug>')
  process.exit(1)
}

const baseUrl = process.env.CAROUSEL_BASE_URL ?? 'http://127.0.0.1:4173/content-carousel-studio'
const outDir = path.resolve('exports', slug)
await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 2 })
await page.goto(`${baseUrl}/carousel/${slug}`, { waitUntil: 'networkidle' })
const slides = await page.locator('.carousel-slide').all()
for (let i = 0; i < slides.length; i++) {
  await slides[i].screenshot({ path: path.join(outDir, `${String(i + 1).padStart(2, '0')}.png`) })
}
await browser.close()
console.log(`Rendered ${slides.length} slides to ${outDir}`)
