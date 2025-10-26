import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import copy from "rollup-plugin-copy";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    copy({
      targets: [
        {
          // Nutrient Web SDK requires its assets to be in the `public` directory
          src: "node_modules/@nutrient-sdk/viewer/dist/nutrient-viewer-lib",
          dest: "public/",
        },
      ],
      hook: "buildStart",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
