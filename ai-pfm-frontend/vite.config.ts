import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { readFileSync } from 'node:fs'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Shown on the Settings page as the app version and build date
    __APP_VERSION__: JSON.stringify(version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  server: {
    port: 5173,
    host: true,
  },
})
