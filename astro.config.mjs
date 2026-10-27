import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import UnoCSS from 'unocss/astro';

export default defineConfig({
  site: process.env.SITE_URL || 'https://crystaldavid.github.io',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [UnoCSS({ injectReset: true }), sitemap()],
  build: { inlineStylesheets: 'auto' },
});
