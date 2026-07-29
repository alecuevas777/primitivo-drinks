import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

function siteUrlReplacePlugin(siteUrl) {
  const replace = (content) =>
    content.replaceAll('%VITE_SITE_URL%', siteUrl.replace(/\/$/, ''))

  return {
    name: 'site-url-replace',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return replace(html)
      },
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/robots.txt' || req.url === '/sitemap.xml') {
          const filePath = path.join(server.config.publicDir, req.url.slice(1))
          if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf8')
            const type = req.url.endsWith('.xml') ? 'application/xml' : 'text/plain'
            res.setHeader('Content-Type', type)
            res.end(replace(raw))
            return
          }
        }
        next()
      })
    },
    closeBundle() {
      const outDir = path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'dist')
      for (const file of ['robots.txt', 'sitemap.xml']) {
        const target = path.join(outDir, file)
        if (fs.existsSync(target)) {
          fs.writeFileSync(target, replace(fs.readFileSync(target, 'utf8')), 'utf8')
        }
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '')

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      siteUrlReplacePlugin(siteUrl),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
