import { readFile, writeFile } from 'node:fs/promises'

import { defineConfig } from 'tsdown'

export default defineConfig({
  name: 'glidepanels',
  entry: ['./src/core/index.ts', './src/react/index.ts'],
  platform: 'browser',
  target: 'es2022',
  dts: {
    build: true,
  },
  hooks: {
    'build:done': async () => {
      const file = await readFile('./dist/react/index.js', 'utf-8')
      await writeFile('./dist/react/index.js', `'use client';\n\n${file}`)
    },
  },
})
