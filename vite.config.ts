import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'

/** Makes social-preview image URLs absolute when VITE_SITE_URL is known (WhatsApp needs this). */
function absoluteOgImage(siteUrl: string | undefined): Plugin {
  return {
    name: 'absolute-og-image',
    transformIndexHtml(html) {
      if (!siteUrl) return html
      const base = siteUrl.replace(/\/+$/, '')
      return html
        .replace('content="/og-image.jpg"', `content="${base}/og-image.jpg"`)
        .replace('<meta property="og:type"', `<meta property="og:url" content="${base}/" />\n    <meta property="og:type"`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react(), absoluteOgImage(env.VITE_SITE_URL)],
  }
})
