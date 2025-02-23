
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import terser from '@rollup/plugin-terser';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },

  // Ensure public directory is copied to build output
  publicDir: "public",
  
  build: {
    outDir: "dist",
    // Copy files from public to build output
    copyPublicDir: true,
    
    // Configuration TypeScript
    typescript: {
      tsconfigPath: './tsconfig.json',
      typeCheck: true
    },

    // Options de minification et d'optimisation
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production'
      }
    },

    // Optimisation des chunks
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-components': [
            '@radix-ui/react-select',
            '@radix-ui/react-label',
            '@radix-ui/react-dialog',
            '@radix-ui/react-toast'
          ]
        }
      },
      plugins: [
        terser({
          format: {
            comments: false,
          },
        })
      ]
    },

    // Gestion des erreurs et avertissements
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096
  },

  // Définition des variables d'environnement
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    __DEV__: mode === 'development'
  }
}));
