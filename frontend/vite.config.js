import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',               // se hospedar em subpasta, ajuste aqui (ex.: '/app/')
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Opcional: facilita chamadas ao backend sem CORS
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // reescreve /api/xxxxx -> /xxxxx
        rewrite: p => p.replace(/^\/api/, '')
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Em dev, o SW fica desligado por padrão (bom para evitar cache louco)
      devOptions: { enabled: false },
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'Sistema Academia SA',
        short_name: 'AcademiaSA',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#6C4FFF',
        icons: [
          { src: 'logo192.png', sizes: '192x192', type: 'image/png' },
          { src: 'logo512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        // Não cacheia chamadas ao backend
        navigateFallbackDenylist: [/^\/api\//, /^http/],
      },
    })
  ]
})
