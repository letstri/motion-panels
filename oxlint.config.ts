import { defineConfig } from 'oxlint'
import core from 'ultracite/oxlint/core'
import next from 'ultracite/oxlint/next'
import react from 'ultracite/oxlint/react'

import { ignorePatterns } from './ignores.ts'

export default defineConfig({
  extends: [core, react, next],
  ignorePatterns,
  options: {
    typeAware: true,
  },
  settings: {
    next: {
      rootDir: ['docs'],
    },
  },
  rules: {
    'func-style': 'off',
    'no-nested-ternary': 'off',
    'no-use-before-define': 'off',
    'sort-keys': 'off',
    'import/namespace': 'off',
    'oxc/no-barrel-file': 'off',
    'react/exhaustive-effect-dependencies': 'off',
    'react/function-component-definition': 'off',
    'react/no-danger': 'off',
    'typescript/no-confusing-void-expression': 'off',
    'typescript/no-deprecated': 'off',
    'typescript/no-explicit-any': 'off',
    'typescript/no-non-null-assertion': 'off',
    'typescript/no-unsafe-argument': 'off',
    'typescript/no-unsafe-assignment': 'off',
    'typescript/no-unsafe-type-assertion': 'off',
    'typescript/strict-boolean-expressions': 'off',
    'typescript/strict-void-return': 'off',
    'typescript/unbound-method': 'off',
    'unicorn/filename-case': 'off',
    'unicorn/no-nested-ternary': 'off',
  },
})
