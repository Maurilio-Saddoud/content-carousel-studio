#!/usr/bin/env node

import { spawn } from 'node:child_process'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cliScript = path.join(rootDir, 'scripts', 'content-carousel.ts')
const require = createRequire(import.meta.url)
const tsxPackagePath = require.resolve('tsx/package.json')
const requireFromTsx = createRequire(tsxPackagePath)
const { buildSync } = requireFromTsx('esbuild')
const buildDir = path.join(rootDir, '.content-carousel-cache')
const bundledCliPath = path.join(buildDir, 'content-carousel.mjs')

mkdirSync(buildDir, { recursive: true })

buildSync({
  entryPoints: [cliScript],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  outfile: bundledCliPath,
  packages: 'external',
  sourcemap: 'inline',
  tsconfig: path.join(rootDir, 'tsconfig.json'),
})

const child = spawn(process.execPath, [bundledCliPath, ...process.argv.slice(2)], {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 1)
})

child.on('error', (error) => {
  console.error(error)
  process.exit(1)
})
