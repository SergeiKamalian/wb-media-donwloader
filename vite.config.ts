import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // BRIEF указывает www.wildberries.ru/__internal/card/cards/v4/detail.
      // Этот хост отвечает 403/498 (WAF Angie). Origin, Referer и User-Agent
      // по одному и вместе не открывают его. Рабочий публичный аналог —
      // card.wb.ru/cards/v4/detail, без дополнительных заголовков.
      '/wb-card': {
        target: 'https://card.wb.ru',
        changeOrigin: true,
        rewrite(path) {
          return path.replace(/^\/wb-card/, '')
        },
      },
      '/wb-cdn': {
        target: 'https://cdn.wbbasket.ru',
        changeOrigin: true,
        rewrite(path) {
          return path.replace(/^\/wb-cdn/, '')
        },
      },
    },
  },
  test: {
    passWithNoTests: true,
  },
})
