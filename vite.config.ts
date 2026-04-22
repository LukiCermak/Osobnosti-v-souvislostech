import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH?.trim() || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;

  return {
    base: normalizedBase,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: false,
        includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png'],
        manifest: {
          id: normalizedBase,
          name: 'Osobnosti v souvislostech',
          short_name: 'Osobnosti',
          description: 'Interaktivní studijní aplikace pro speciální pedagogiku.',
          start_url: normalizedBase,
          scope: normalizedBase,
          display: 'standalone',
          orientation: 'portrait',
          lang: 'cs',
          theme_color: '#5b6cf6',
          background_color: '#f5f7ff',
          categories: ['education', 'reference'],
          icons: [
            {
              src: 'icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'icons/maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          navigateFallback: 'offline/offline-fallback.html',
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === 'document',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'app-documents',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 7
                }
              }
            },
            {
              urlPattern: ({ request }) =>
                ['script', 'style', 'worker'].includes(request.destination),
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'app-shell-assets'
              }
            },
            {
              urlPattern: ({ request }) =>
                request.destination === 'image' || request.url.includes('/content/built/'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'study-content',
                expiration: {
                  maxEntries: 120,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: false
        }
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      host: true,
      port: 5173
    },
    preview: {
      host: true,
      port: 4173
    }
  };
});
