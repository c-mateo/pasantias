import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import babel from "vite-plugin-babel";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        presets: ["@babel/preset-typescript"],
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths()
  ],
  server: {
    // host: true,
    // port: 3000,
    // hmr: {
    //   host: "localhost"
    // }
    proxy: {
      "/api": "http://localhost:3333",
    },
  },
});
