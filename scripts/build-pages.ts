import { rm, mkdir, cp } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'content-carousel-studio'
const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH ?? process.env.BASE_PATH ?? `/${repoName}`)
const publicSiteUrl = process.env.PUBLIC_SITE_URL ?? derivePublicSiteUrl()
const serveRoot = path.resolve('.pages-serve')

async function main() {
  const port = await getAvailablePort(Number(process.env.PAGES_RENDER_PORT ?? '4310'))
  const sharedEnv = {
    ...process.env,
    BASE_PATH: basePath,
    NEXT_PUBLIC_BASE_PATH: basePath,
    PUBLIC_SITE_URL: publicSiteUrl,
  }

  await run('pnpm', ['exec', 'next', 'build'], sharedEnv)
  await prepareServeRoot()

  const server = spawn('python3', ['-m', 'http.server', String(port), '--directory', serveRoot, '--bind', '127.0.0.1'], {
    stdio: 'inherit',
    env: process.env,
  })

  try {
    await waitForServer(`http://127.0.0.1:${port}${basePath}/`, 30000)
    await run(
      'pnpm',
      ['render:all'],
      {
        ...sharedEnv,
        CAROUSEL_BASE_URL: `http://127.0.0.1:${port}`,
      },
    )
  } finally {
    server.kill('SIGTERM')
    await new Promise((resolve) => server.once('exit', () => resolve(undefined)))
  }

  await run('pnpm', ['exec', 'next', 'build'], sharedEnv)
}

async function prepareServeRoot() {
  await rm(serveRoot, { recursive: true, force: true })
  await mkdir(path.join(serveRoot, repoName), { recursive: true })
  await cp(path.resolve('out'), path.join(serveRoot, repoName), { recursive: true })
}

async function getAvailablePort(startPort: number) {
  for (let port = startPort; port < startPort + 20; port++) {
    const available = await new Promise<boolean>((resolve) => {
      const server = net.createServer()
      server.once('error', () => resolve(false))
      server.once('listening', () => {
        server.close(() => resolve(true))
      })
      server.listen(port, '127.0.0.1')
    })

    if (available) {
      return port
    }
  }

  throw new Error(`Could not find an open port starting at ${startPort}`)
}

async function run(command: string, args: string[], env: NodeJS.ProcessEnv) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env,
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'unknown'}`))
    })
  })
}

async function waitForServer(url: string, timeoutMs: number) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // server not up yet
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  throw new Error(`Timed out waiting for static server at ${url}`)
}

function normalizeBasePath(value: string) {
  if (!value || value === '/') return ''
  return `/${value.replace(/^\/+|\/+$/g, '')}`
}

function derivePublicSiteUrl() {
  const owner = process.env.GITHUB_REPOSITORY_OWNER
  if (owner) {
    return `https://${owner.toLowerCase()}.github.io/${repoName}`
  }

  return `https://example.github.io/${repoName}`
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
