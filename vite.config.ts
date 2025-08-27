import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build optimizations
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info'] : []
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          utils: ['sonner']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: process.env.NODE_ENV === 'development'
  },
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@components": path.resolve(__dirname, "./components"),
      "@utils": path.resolve(__dirname, "./utils"),
      "@styles": path.resolve(__dirname, "./styles")
    },
  },
  
  // Development server
  server: {
    port: 5173,
    host: true,
    hmr: {
      overlay: true
    }
  },
  
  // CSS optimization
  css: {
    devSourcemap: process.env.NODE_ENV === 'development'
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', 'sonner']
  }
})
