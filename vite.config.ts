import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  return {
    base: '/Agri-AI/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      // Bundle optimization
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunk for React libs (better caching)
            'vendor-react': ['react', 'react-dom'],
            // UI libraries chunk
            'vendor-ui': ['lucide-react', 'framer-motion', 'react-hot-toast'],
            // HTTP and validation
            'vendor-core': ['axios', 'zod'],
          }
        }
      },
      // Target modern browsers for smaller bundles
      target: 'esnext',
      // Enable minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
        }
      },
      // Source maps for debugging
      sourcemap: mode !== 'production',
    },
    // Performance optimization
    optimizeDeps: {
      include: ['react', 'react-dom', 'axios', 'zod'],
    },
  };
});
