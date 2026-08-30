import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://cv.yoann-lascaux.fr',
  output: 'static',
  srcDir: './site/src',
  publicDir: './site/public',
  outDir: './dist',
  trailingSlash: 'always',
});
