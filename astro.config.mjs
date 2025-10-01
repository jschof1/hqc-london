   // @ts-check
   import { defineConfig } from 'astro/config';
   import cloudflare from '@astrojs/cloudflare';
   import tailwindcss from '@tailwindcss/vite';
   import sitemap from '@astrojs/sitemap';
   import robotsTxt from 'astro-robots-txt';

   export default defineConfig({
     output: 'server',
     adapter: cloudflare(),
     vite: {
       plugins: [tailwindcss()]
     },
     site: 'https://highqualitycleaning.co.uk',
     integrations: [sitemap(), robotsTxt()]
   });