import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { Env } from "@humanwhocodes/env";

// 配置中心
const env = new Env()
const baseURL = env.get('BASE_URL', 'http://localhost:8080')

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  build: {
    chunkSizeWarningLimit: 5000,
  },
  plugins: [
    vue()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')  // 与 tsconfig 的 paths 保持一致
    }
  },
  server: {
    open: true, // 是否自动在浏览器打开
    cors: true, // 允许跨域  8月更新
    port: 4000, // 端口号
    host: "0.0.0.0",
    proxy: {
      '/api': {
        target: baseURL, // 后台接口
        changeOrigin: true,
        // secure: true, // 如果是https接口，需要配置这个参数
        ws: true, //websocket支持
        rewrite: (path) => path.replace(/^\/api/, "")
      },
    }
  }
})
