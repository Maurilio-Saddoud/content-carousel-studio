import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildPagesFromArgv } from './build-pages'
import { ingestYoutubeFromArgv, rebuildDraftsFromSourceArgv } from './ingest-youtube'
import { renderAllFromArgv } from './render-all'
import { renderCarouselFromArgv } from './render-carousel'

export async function runCli(argv: string[] = process.argv.slice(2)) {
  const [command, ...rest] = argv

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printHelp()
    return
  }

  if (command === '--version' || command === '-v') {
    console.log('0.3.0')
    return
  }

  switch (command) {
    case 'youtube':
      await ingestYoutubeFromArgv(rest)
      return
    case 'render':
      await renderCarouselFromArgv(rest)
      return
    case 'rebuild-source':
      await rebuildDraftsFromSourceArgv(rest)
      return
    case 'render-all':
      await renderAllFromArgv(rest)
      return
    case 'build-pages':
      await buildPagesFromArgv(rest)
      return
    default:
      throw new Error(`Unknown command: ${command}`)
  }
}

function printHelp() {
  console.log(`content-carousel <command> [options]

Commands:
  youtube <url>         Ingest a YouTube video into source artifacts and draft carousel(s)
  render <slug>         Render one carousel preview route to PNG files
  render-all            Render PNG files for every carousel in the directory
  rebuild-source <slug> Rebuild draft carousels from an existing local source package
  build-pages           Build the static site and PNG export bundle for Pages
  help                  Show this help

Examples:
  content-carousel youtube https://www.youtube.com/watch?v=VIDEO_ID
  content-carousel youtube https://www.youtube.com/watch?v=VIDEO_ID --slug my-topic
  content-carousel render ai-memory-wall
  content-carousel build-pages
`)
}

function isDirectExecution(moduleUrl: string) {
  const entry = process.argv[1]
  if (!entry) {
    return false
  }

  return pathToFileURL(path.resolve(entry)).href === moduleUrl
}

if (isDirectExecution(import.meta.url)) {
  runCli().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
