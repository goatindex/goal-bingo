import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

/** GitHub Pages project site. Dev stays at `/` so the local shell does not move. */
const pagesBase = '/goal-bingo/'

export default defineConfig(({ command, isPreview }) => {
  const base = command === 'build' || isPreview ? pagesBase : '/'
  return {
    base,
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'pwa-192.png', 'pwa-512.png'],
        manifest: {
          name: 'Goal Bingo',
          short_name: 'Goal Bingo',
          description:
            'A continuous bingo game played with your own real-life goals.',
          theme_color: '#1E1537',
          background_color: '#FFF4E4',
          display: 'standalone',
          orientation: 'any',
          start_url: base,
          scope: base,
          icons: [
            {
              src: 'pwa-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff2}'],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
  }
})
