import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    allowedHosts: ['chiasmal-puffingly-etsuko.ngrok-free.dev'],
  },
  resolve: {
    alias: {
      ui: path.resolve(__dirname, "../../packages/ui"),
      utils: path.resolve(__dirname, "../../packages/utils"),

      '@fastfoodordering/store': path.resolve(__dirname, "../../packages/store/src/index.ts"),
      '@fastfoodordering/utils': path.resolve(__dirname, "../../packages/utils/src/index.ts"),
      '@fastfoodordering/types': path.resolve(__dirname, "../../packages/types/src/index.ts"),
    },
  },
});