import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt' rather than 'autoUpdate': a silent reload mid-checkout would
      // lose the customer's card form. PwaStatus shows a "Refresh" banner.
      registerType: 'prompt',
      includeAssets: ['favicon.png', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'NaturallyU | Handmade Soaps & Skin Care',
        short_name: 'NaturallyU',
        description: 'Handmade soaps and natural skin care from NaturallyU.',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#3FA34D',
        background_color: '#FFF7E6',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Shop', url: '/shop', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Cart', url: '/cart', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Track order', url: '/track-order', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        // App shell only. The large photos in public/media and
        // public/assets/products are cached on first view instead (below)
        // so installing the app doesn't download ~10MB up front.
        globPatterns: ['**/*.{js,css,html,woff2}', 'icons/*.png'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Public, non-personal API reads that are safe to keep for
            // offline browsing. Everything else (auth, cart, orders,
            // payments, admin) always hits the network. Matched on pathname
            // so it covers the cross-origin production API too. The regex
            // must live inside this function: Workbox copies the function's
            // source into sw.js, so outer variables don't exist there.
            urlPattern: ({ url, request }) =>
              request.method === 'GET' &&
              // Requests carrying a token are admin views (drafts etc.) -
              // never cache those.
              !request.headers.has('Authorization') &&
              /^\/api\/(settings|pages\/[^/]+|products(\/[^/]+)?|archive\/pages(\/[^/]+)?)$/.test(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-public',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: ({ request, sameOrigin }) => sameOrigin && request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 150, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // S3 / CloudFront product and media images.
            urlPattern: ({ request, sameOrigin }) => !sameOrigin && request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-remote',
              // Kept small: cross-origin images without CORS are opaque and
              // browsers count each one heavily against storage quota.
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      // Avoids CORS friction in local dev; production uses VITE_API_URL directly
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // keep sourcemaps for easier debugging of production issues
  },
});
