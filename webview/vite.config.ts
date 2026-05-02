import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../out/webview',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    },
    // 确保Codicon字体文件被正确复制
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  server: {
    port: 3000,
    open: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  // 复制静态资源
  publicDir: 'public'
});
