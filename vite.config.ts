import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  
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
    copyPublicDir: true,
    
    // Configuration TypeScript
    typescript: {
      tsconfigPath: './tsconfig.json',
    },
  },

  // Définition des variables d'environnement
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    __DEV__: mode === 'development'
  }
}));
