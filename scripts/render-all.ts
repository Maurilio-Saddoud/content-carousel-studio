import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { execa } from 'execa'

async function main() {
  const indexPath = path.resolve('carousels/index.json')
  const raw = await readFile(indexPath, 'utf8')
  const items = JSON.parse(raw) as Array<{ slug: string }>

  for (const item of items) {
    await execa('pnpm', ['render', item.slug], { stdio: 'inherit' })
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
