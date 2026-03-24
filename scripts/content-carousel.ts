import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildPagesFromArgv } from './build-pages'
import { ingestYoutubeFromArgv, rebuildCarouselsFromSourceArgv, syncSourceManifestFromArgv } from './ingest-youtube'
import { renderAllFromArgv } from './render-all'
import { renderCarouselFromArgv } from './render-carousel'
import { runSelfTestFromArgv } from './self-test'

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
      await rebuildCarouselsFromSourceArgv(rest)
      return
    case 'sync-source':
      await syncSourceManifestFromArgv(rest)
      return
    case 'render-all':
      await renderAllFromArgv(rest)
      return
    case 'build-pages':
      await buildPagesFromArgv(rest)
      return
    case 'self-test':
      await runSelfTestFromArgv(rest)
      return
    default:
      throw new Error(`Unknown command: ${command}`)
  }
}

function printHelp() {
  console.log(`content-carousel <command> [options]

Commands:
  youtube <url>         Ingest a YouTube video into source artifacts and carousel(s)
  render <slug>         Render one carousel preview route to PNG files
  render-all            Render PNG files for every carousel in the directory
  rebuild-source <slug> Rebuild published carousels from an existing local source package
  sync-source <slug>    Reconcile source.json/summary.md with surviving briefs + carousel markdown
  self-test <slug>      Audit one source package for drift, weak titles, duplicates, and stale artifacts
  self-test --repo      Audit every source package plus repo-wide duplicate/stale artifact drift
                        Add --json for machine-readable output in either mode
  build-pages           Build the static site and PNG export bundle for Pages
  help                  Show this help

Examples:
  content-carousel youtube https://www.youtube.com/watch?v=VIDEO_ID
  content-carousel youtube https://www.youtube.com/watch?v=VIDEO_ID --slug my-topic
  content-carousel rebuild-source my-topic --max-segments 8
  content-carousel sync-source my-topic
  content-carousel self-test my-topic
  content-carousel self-test my-topic --json
  content-carousel self-test --repo
  content-carousel self-test --repo --json
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
