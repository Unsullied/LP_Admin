import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import eslintConfigPrettier from 'eslint-config-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Yarn / PnP artifacts:
    '.pnp.cjs',
    '.pnp.loader.mjs',
    '.yarn/**',
    'node_modules/**',
  ]),
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      // Prefer arrow/function expressions over `function foo() {}` declarations.
      'func-style': ['warn', 'expression'],
    },
  },
])

export default eslintConfig
