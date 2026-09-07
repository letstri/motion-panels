import { readFile, writeFile } from 'node:fs/promises'

import { defineConfig } from 'tsdown'

export default defineConfig({
  name: 'motion-panels',
  entry: ['./src/core/index.ts', './src/react/index.ts'],
  platform: 'browser',
  // Leave the guard for the consumer's bundler: `platform: 'browser'` would
  // otherwise fold NODE_ENV to 'development' and ship the dev warnings.
  define: { 'process.env.NODE_ENV': 'process.env.NODE_ENV' },
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
