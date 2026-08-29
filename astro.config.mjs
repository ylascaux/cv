import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  srcDir: './site/src',
  publicDir: './site/public',
  outDir: './dist',
  trailingSlash: 'always',
});
