import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import copy from 'rollup-plugin-copy';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  build: {
    sourcemap: true,
    assetsDir: "code",
  },
  plugins: [
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
    {
      ...copy({
        targets: [
          {
            src: 'node_modules/@shoelace-style/shoelace/dist/assets/icons',
            dest: 'dist/assets/shoelace/assets/icons'
          }
        ],
        // https://github.com/vitejs/vite/issues/1231
        hook: 'writeBundle',
        verbose: true
      }),
      apply: 'build'
    },
    VitePWA({
      strategies: "injectManifest",
      injectManifest: {
        swSrc: 'public/sw.js',
        swDest: 'dist/sw.js',
        globDirectory: 'dist',
        globPatterns: [
          '**/*.{html,js,css,json, png}',
        ],
      },
      devOptions: {
        enabled: true
      }
    })
  ]
})
