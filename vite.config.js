import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import projects from './src/data/projects.js'

// GitHub Pages has no server, so client-side routes need static files to land on.
//
// 404.html is the catch-all: Pages serves it for any unmatched path, and since it is the SPA
// shell the router resolves the URL correctly. But it is served with a 404 status, which is
// wrong for a real page — link previews and crawlers treat a shared project URL as missing.
//
// So every known project route also gets a real index.html at its own path. Those return 200.
// 404.html then only catches genuinely unknown URLs, which is what it is for.
function emitStaticRoutes() {
  return {
    name: 'emit-static-routes',
    apply: 'build',
    closeBundle() {
      const dist = resolve(process.cwd(), 'dist')
      const shell = resolve(dist, 'index.html')

      copyFileSync(shell, resolve(dist, '404.html'))

      for (const project of projects) {
        const dir = resolve(dist, 'work', project.slug)
        mkdirSync(dir, { recursive: true })
        copyFileSync(shell, resolve(dir, 'index.html'))
      }
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [react(), emitStaticRoutes()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.js',
    include: ['src/test/**/*.test.{js,jsx}'],
  },
})
