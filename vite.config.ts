import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

const isAnalyze = process.env.ANALYZE === "true";

const plugins = [
  react(),
  tailwindcss(),
  jsxLocPlugin(),
  ...(isAnalyze
    ? [
        visualizer({
          open: true,
          filename: "dist/bundle-report.html",
          gzipSize: true,
          brotliSize: true,
        }),
      ]
    : []),
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Performance optimizations
    minify: "esbuild", // Use esbuild for faster builds
    cssMinify: true,
    // Code splitting configuration
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // React and core libraries
          "react-vendor": ["react", "react-dom", "react/jsx-runtime"],
          // Routing
          router: ["wouter"],
          // UI components
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-label",
            "@radix-ui/react-checkbox",
          ],
          // Animation
          animation: ["framer-motion"],
          // Icons
          icons: ["lucide-react"],
          // Utilities
          utils: ["clsx", "tailwind-merge", "date-fns"],
        },
        // Optimize chunk file names
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000, // Warn if chunk > 1MB
    // Source maps for debugging (disable in production for smaller builds)
    sourcemap: false,
  },
  server: {
    host: true,
    allowedHosts: ["localhost", "127.0.0.1"],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
