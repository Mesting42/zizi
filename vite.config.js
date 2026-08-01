import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { rm, writeFile } from 'node:fs/promises'

const cloudflareHeaders = `
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/media/*
  Cache-Control: public, max-age=86400, stale-while-revalidate=604800
/models/*
  Cache-Control: public, max-age=86400, stale-while-revalidate=604800
/generated/*
  Cache-Control: public, max-age=86400, stale-while-revalidate=604800
/images/*
  Cache-Control: public, max-age=86400, stale-while-revalidate=604800
/css/*
  Cache-Control: public, max-age=604800, stale-while-revalidate=86400
/js/*
  Cache-Control: public, max-age=604800, stale-while-revalidate=86400
/draco/*
  Cache-Control: public, max-age=604800, stale-while-revalidate=86400
/*.svg
  Cache-Control: public, max-age=86400, stale-while-revalidate=604800
/index.html
  Cache-Control: public, max-age=0, must-revalidate
`.trimStart()

const excludePrivateMusicFromPublicBuild = () => ({
  name: 'exclude-private-music-from-public-build',
  async closeBundle() {
    // `public/` is copied verbatim by Vite. Keep source media locally but
    // never package raw audio or lyric files into the public website.
    await Promise.all([
      rm(fileURLToPath(new URL('./dist/music', import.meta.url)), { recursive: true, force: true }),
      rm(fileURLToPath(new URL('./dist/lyrics', import.meta.url)), { recursive: true, force: true }),
      // Generate deployment headers from version-controlled build logic. The
      // handoff-only public/_headers file remains untouched and unstaged.
      writeFile(fileURLToPath(new URL('./dist/_headers', import.meta.url)), cloudflareHeaders, 'utf8')
    ])
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), excludePrivateMusicFromPublicBuild()],
  base: '/', // 部署到根路径使用 '/'，部署到子路径如 GitHub Pages 改为 '/仓库名/'
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    open: true,
    // Only the local site may read development-server responses.
    cors: {
      origin: /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/
    },
    // Pre-transform the first route before Chrome opens. Home is also imported
    // eagerly by the router so its request remains part of the initial load.
    warmup: {
      clientFiles: [
        './src/main.js',
        './src/App.vue',
        './src/views/Home.vue',
        './src/css/HomeOddy.css',
        './src/components/PortfolioHeader.vue',
        './src/components/AmbientSideFields.vue'
      ]
    },
    proxy: {
      '/api/lrclib': {
        target: 'https://lrclib.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/lrclib/, '/api'),
        headers: {
          'Lrclib-Client': 'personal-digital-space/1.0',
          'User-Agent': 'personal-digital-space/1.0'
        }
      }
    }
  },
  build: {
    // The site targets current browsers and Android WebView. ES2022 keeps the
    // initial route's top-level await intact so the load indicator and the
    // first visible frame finish together.
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/@vue/') || id.includes('/node_modules/vue/') || id.includes('/node_modules/vue-router/')) {
            return 'vue-vendor'
          }
          if (id.includes('/node_modules/gsap/')) {
            return 'gsap'
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    cssCodeSplit: true
  }
})
