import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: "jsx",
    include: /src\/admin\/modules\/auth\/pages\/hook\/Useauth\.jsx$/,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://46.225.21.146:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
