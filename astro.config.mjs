// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

import robotsTxt from 'astro-robots-txt';

import partytown from '@astrojs/partytown';



// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  site: 'https://highqualitycleaning.co.uk',
  integrations: [sitemap(), robotsTxt(),  partytown({ config: { forward: ['dataLayer.push'] } })]
});