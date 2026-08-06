// The 28 controlled pages from the HQC sitemap record plus 17 retained
// location URLs. Keep this explicit list in one place so sitemap generation
// cannot reintroduce redirect-only or malformed legacy routes.
const controlledPagePaths = [
  '/',
  '/property-facilities-cleaning-london/',
  '/communal-area-cleaning-london/',
  '/estate-letting-agent-cleaning-london/',
  '/move-in-void-property-cleaning-london/',
  '/end-of-tenancy-cleaning-london/',
  '/post-construction-cleaning-london/',
  '/portfolio-cleaning-support-london/',
  '/commercial-cleaning-london/',
  '/office-cleaning-london/',
  '/commercial-deep-cleaning-london/',
  '/home-cleaning-london/',
  '/essential-clean-london/',
  '/deep-cleaning-london/',
  '/move-in-cleaning-london/',
  '/complex-property-cleaning-london/',
  '/about-high-quality-clean/',
  '/why-choose-hqc/',
  '/how-we-work/',
  '/cleaning-prices-london/',
  '/cleaning-faqs/',
  '/reviews-case-studies/',
  '/request-a-quote/',
  '/contact/',
  '/areas-we-cover/',
  '/cleaning-services-east-london/',
  '/privacy-policy/',
  '/terms-and-conditions/'
];

const londonAreas = [
  'battersea',
  'belgravia',
  'chelsea',
  'clapham',
  'hampstead',
  'highgate',
  'holland-park',
  'kensington',
  'knightsbridge',
  'mayfair',
  'notting-hill',
  'primrose-hill',
  'st-johns-wood',
  'wandsworth'
];

const surreyAreas = ['hersham', 'walton-on-thames', 'weybridge'];

export const locationSitemapPaths = [
  ...londonAreas.map((area) => `/locations/london/${area}/`),
  ...surreyAreas.map((area) => `/locations/surrey/${area}/`)
];

export const canonicalSitemapPaths = new Set([
  ...controlledPagePaths,
  ...locationSitemapPaths
]);
