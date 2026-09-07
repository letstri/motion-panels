import { defineConfig } from 'oxfmt'
import ultracite from 'ultracite/oxfmt'

import { ignorePatterns } from './ignores.ts'

export default defineConfig({
  ...ultracite,
  ignorePatterns,
  semi: false,
  singleQuote: true,
})
