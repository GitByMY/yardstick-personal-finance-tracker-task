import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Import or define componentTagger plugin
// Example: import componentTagger from 'vite-plugin-component-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    // Uncomment and install the plugin if available
    // mode === 'development' && componentTagger(),
    react(),
    // mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
