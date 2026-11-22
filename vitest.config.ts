import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      // Czyste funkcje (np. app/utils) — szybkie testy w Node, bez Nuxta.
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.test.js'],
          environment: 'node'
        }
      },
      // Komponenty — środowisko Nuxt (auto-importy, useFetch, registerEndpoint).
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.test.js'],
          environment: 'nuxt'
        }
      })
    ]
  }
})
