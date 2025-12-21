import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: [
        'vue',
        {
          '@vueuse/core': [
            'useTimeAgo',
          ],
        },
      ],
      dts: false,
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
