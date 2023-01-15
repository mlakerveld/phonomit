import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import copy from 'rollup-plugin-copy';
import { NgmiPolyfill } from "vite-plugin-ngmi-polyfill";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  build: {
    sourcemap: true,
    assetsDir: "code",
  },
  plugins: [
    NgmiPolyfill(),
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
