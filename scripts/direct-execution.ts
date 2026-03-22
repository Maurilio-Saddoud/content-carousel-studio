import path from 'node:path'
import { pathToFileURL } from 'node:url'

export function isDirectExecution(moduleUrl: string) {
  const entry = process.argv[1]
  if (!entry) {
    return false
  }

  return pathToFileURL(path.resolve(entry)).href === moduleUrl
}
