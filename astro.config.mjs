// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()]
  },
  site: 'https://highqualityclean.co.uk',
  integrations: [sitemap()],
  redirects: {
    '/get-quote': '/quote',
    '/areas/areas': '/areas',
    '/mayfair': '/locations/london/mayfair/',
    '/knightsbridge': '/locations/london/knightsbridge/',
    '/chelsea': '/locations/london/chelsea/',
    '/belgravia': '/locations/london/belgravia/',
    '/kensington': '/locations/london/kensington/',
    '/hampstead': '/locations/london/hampstead/',
    '/wandsworth': '/locations/london/wandsworth/',
    '/battersea': '/locations/london/battersea/',
    '/clapham': '/locations/london/clapham/',
    '/notting-hill': '/locations/london/notting-hill/',
    '/nottingHill': '/locations/london/notting-hill/',
    '/holland-park': '/locations/london/holland-park/',
    '/hollandPark': '/locations/london/holland-park/',
    '/primrose-hill': '/locations/london/primrose-hill/',
    '/primroseHill': '/locations/london/primrose-hill/',
    '/highgate': '/locations/london/highgate/',
    '/st-johns-wood': '/locations/london/st-johns-wood/',
    '/stJohnsWood': '/locations/london/st-johns-wood/',
    '/weybridge': '/locations/surrey/weybridge/',
    '/hersham': '/locations/surrey/hersham/',
    '/walton-on-thames': '/locations/surrey/walton-on-thames/',
    '/waltonOnThames': '/locations/surrey/walton-on-thames/'
  }
});