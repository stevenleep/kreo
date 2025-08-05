import { defineConfig } from "vite";
import { resolve } from "path";
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content/content.ts"),
        background: resolve(__dirname, "src/background.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "content") return "content.js";
          if (chunkInfo.name === "background") return "background.js";
          return "[name].js";
        },
        chunkFileNames: "[name].js",
        // assetFileNames: "[name].[ext]",
        assetFileNames: (assetInfo) => {
            // 附属文件命名，content script会生成配套的css
            return 'content.css'
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        // math: 'parens-division',
        javascriptEnabled: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    react()
  ]
});
