import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VueRouterAutoImports, getPascalCaseRouteName } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig, loadEnv } from 'vite'
import VueDevTools from 'vite-plugin-vue-devtools'
import MetaLayouts from 'vite-plugin-vue-meta-layouts'
import vuetify from 'vite-plugin-vuetify'
import svgLoader from 'vite-svg-loader'

// Helper: produce routesFolder entries for each module
function moduleRoutes() {
  const modulesRoot = fileURLToPath(new URL('./src/modules', import.meta.url))
  let entries: { src: string; path: string }[] = []

  if (fs.existsSync(modulesRoot)) {
    for (const dirent of fs.readdirSync(modulesRoot, { withFileTypes: true })) {
      if (!dirent.isDirectory()) continue
      const name = dirent.name
      const pagesDir = path.join(modulesRoot, name, 'pages')
      if (!fs.existsSync(pagesDir)) continue

      // mount "root" at "/", others at "/<module>"
      entries.push({
        src: path.posix.join('src/modules', name, 'pages'),
        path: name === 'root' ? '' : `${name}/`,
      })
    }
  }

  return entries
}

const env = loadEnv(process.cwd(), '')

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: ['agentic.io'],
    port: Number(env.VITE_PORT || 3000),
    strictPort: true,
    hmr: { protocol: 'ws', host: 'localhost', overlay: false },
    fs: { strict: false, allow: ['./src'] },
    watch: { ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'] },
  },
  cacheDir: './node_modules/.vite_cache',
  plugins: [
    // Must be before vue()
    VueRouter({
      routesFolder: [
        ...moduleRoutes(),
      ],
      getRouteName: routeNode =>
        getPascalCaseRouteName(routeNode)
          .replace(/([a-z\d])([A-Z])/g, '$1-$2')
          .toLowerCase(),
      dts: 'src/typed-router.d.ts',
    }),

    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag === 'swiper-container' || tag === 'swiper-slide',
        },
      },
    }),
    VueDevTools(),
    vueJsx(),

    vuetify({ styles: { configFile: 'src/assets/styles/variables/_vuetify.scss' } }),

    MetaLayouts({ target: './src/layouts', defaultLayout: 'default' }),

    Components({
      dirs: ['src/@core/components', 'src/views/demos', 'src/components'],
      dts: true,
      resolvers: [
        name => (name === 'VueApexCharts' ? { name: 'default', from: 'vue3-apexcharts', as: 'VueApexCharts' } : undefined),
      ],
    }),

    AutoImport({
      imports: ['vue', VueRouterAutoImports, '@vueuse/core', '@vueuse/math', 'vue-i18n', 'pinia'],
      dirs: [
        './src/@core/utils',
        './src/@core/composable/',
        './src/composables/',
        './src/utils/',
        './src/modules/**/stores/', // recursive glob for module stores
        './src/plugins/*/composables/*',
      ],
      vueTemplate: true,
      ignore: ['useCookies', 'useStorage'],
    }),

    VueI18nPlugin({
      runtimeOnly: true,
      compositionOnly: true,
      include: [fileURLToPath(new URL('./src/plugins/i18n/locales/**', import.meta.url))],
    }),

    svgLoader(),
    ...(process.env.ANALYZE ? [visualizer({ filename: 'stats.html', gzipSize: true, brotliSize: true })] : []),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@themeConfig': fileURLToPath(new URL('./themeConfig.ts', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/@core', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/@layouts', import.meta.url)),
      '@images': fileURLToPath(new URL('./src/assets/images/', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/assets/styles/', import.meta.url)),
      '@configured-variables': fileURLToPath(new URL('./src/assets/styles/variables/_template.scss', import.meta.url)),
      '@modules': fileURLToPath(new URL('./src/modules/', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        manualChunks: {
          tiptap: [
            '@tiptap/core',
            'markdown-it',
            'turndown',
          ],
        },
      },
    },
  },
  optimizeDeps: { exclude: ['vuetify'], entries: ['./src/**/*.vue'] },
})
