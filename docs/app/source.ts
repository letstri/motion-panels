import { readFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.join(process.cwd(), 'app')

export const readRegion = async (file: string, region: string) => {
  const source = await readFile(path.join(ROOT, file), 'utf-8')
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
