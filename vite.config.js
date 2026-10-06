import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(__dirname, 'src')

// https://vitejs.dev/config/

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const drupalUrl = env.VITE_DRUPAL_URL || 'http://localhost:8000'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': srcDir,
        '@/components': path.resolve(srcDir, 'components'),
        '@/features': path.resolve(srcDir, 'features'),
        '@/pages': path.resolve(srcDir, 'pages'),
        '@/services': path.resolve(srcDir, 'services'),
        '@/lib': path.resolve(srcDir, 'lib'),
        '@/data': path.resolve(srcDir, 'data'),
        '@/hooks': path.resolve(srcDir, 'hooks'),
        '@/assets': path.resolve(srcDir, 'assets'),
      },
    },
    server: {
      port: 3000,
      // Cloudflare / other tunnel URLs (subdomain changes per tunnel session)
      allowedHosts: [
        'editor-dennis-wash-intermediate.trycloudflare.com',
        '.trycloudflare.com',
      ],
      proxy: {
        // Proxy for general Drupal API calls — strips /api prefix
        '/api': {
          target: drupalUrl,
          changeOrigin: true,
          secure: drupalUrl.startsWith('https'),
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        // ✅ Proxy for custom file upload module — NO rewrite, path stays as-is
        '/webform-file-upload': {
          target: drupalUrl,
          changeOrigin: true,
          secure: drupalUrl.startsWith('https'),
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      manifest: true
    }
  }
})