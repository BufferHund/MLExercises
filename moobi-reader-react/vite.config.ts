import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 1000,      // 端口设置为1000
    strictPort: true, // 如果端口被占用则失败，而不是自动尝试下一个端口
  },
  optimizeDeps: {
    include: ['pdfjs-dist', 'epubjs'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  worker: {
    format: 'es',
  },
  build: {
    target: 'esnext',
    commonjsOptions: {
      include: [/pdfjs-dist/, /epubjs/, /node_modules/],
    },
  },
})
