import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'


export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'firebase-messaging-sw.js',
      registerType: 'autoUpdate',
      manifest: false,
      useManifestFromFile: true,
      injectRegister: null,
      injectManifest: {
        injectionPoint: undefined
      }
    })
  ],

})