import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "@/pages/Home" },
  ],
  npmClient: 'yarn',
  outputPath: 'docs',
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
});
