import { readFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.join(process.cwd(), 'app')
const files = new Map<string, Promise<string>>()

export const readRegion = async (file: string, region: string) => {
  const pending = files.get(file) ?? readFile(path.join(ROOT, file), 'utf-8')
  files.set(file, pending)
  const source = await pending
  const marker = source.search(new RegExp(String.raw`#region ${region}\b`, 'u'))
  if (marker === -1) {
    throw new Error(`Region "${region}" is not marked in ${file}`)
  }
  const from = source.indexOf('\n', marker) + 1
  const to = source.indexOf('#endregion', from)
  if (to === -1) {
    throw new Error(`Region "${region}" in ${file} is never closed`)
  }

  return source
    .slice(from, to)
    .replace(/[ \t]*(?:\/\/|\/\*)[^\n]*$/u, '')
    .trim()
}
