import { defineMiddleware } from 'astro:middleware';

const CANONICAL_ORIGIN = 'https://highqualityclean.co.uk';

const legacyRedirects = new Map<string, string>([
  ['/get-quote', '/request-a-quote/'],
  ['/quote', '/request-a-quote/'],
  ['/discount', '/offer/'],
  ['/services', '/#find-my-service'],
  ['/why-us', '/why-choose-hqc/'],
  ['/process', '/how-we-work/'],
  ['/case-studies', '/reviews-case-studies/'],
  ['/client-success-stories', '/reviews-case-studies/'],
  ['/areas', '/areas-we-cover/'],
  ['/areas/areas', '/areas-we-cover/'],
  ['/services/office-cleaning', '/office-cleaning-london/'],
  ['/services/deep-cleaning', '/deep-cleaning-london/'],
  ['/services/end-of-tenancy-cleaning', '/end-of-tenancy-cleaning-london/'],
  ['/services/airbnb-cleaning', '/home-cleaning-london/'],
  ['/services/carpet-cleaning', '/home-cleaning-london/'],
  ['/services/ironing-and-laundry', '/home-cleaning-london/'],
  ['/post-renovation-cleaning', '/post-construction-cleaning-london/'],
  ['/after-builders-cleaning', '/post-construction-cleaning-london/'],
  ['/developer-handover-cleaning', '/post-construction-cleaning-london/'],
  ['/regular-residential-cleaning', '/essential-clean-london/'],
  ['/luxury-cleaning-services', '/home-cleaning-london/'],
  ['/commercial-wellness-cleaning', '/commercial-cleaning-london/'],
  ['/mayfair', '/locations/london/mayfair/'],
  ['/knightsbridge', '/locations/london/knightsbridge/'],
  ['/chelsea', '/locations/london/chelsea/'],
  ['/belgravia', '/locations/london/belgravia/'],
  ['/kensington', '/locations/london/kensington/'],
  ['/hampstead', '/locations/london/hampstead/'],
  ['/wandsworth', '/locations/london/wandsworth/'],
  ['/battersea', '/locations/london/battersea/'],
  ['/clapham', '/locations/london/clapham/'],
  ['/notting-hill', '/locations/london/notting-hill/'],
  ['/nottinghill', '/locations/london/notting-hill/'],
  ['/holland-park', '/locations/london/holland-park/'],
  ['/hollandpark', '/locations/london/holland-park/'],
  ['/areas/hollandpark', '/locations/london/holland-park/'],
  ['/primrose-hill', '/locations/london/primrose-hill/'],
  ['/primrosehill', '/locations/london/primrose-hill/'],
  ['/highgate', '/locations/london/highgate/'],
  ['/st-johns-wood', '/locations/london/st-johns-wood/'],
  ['/stjohnswood', '/locations/london/st-johns-wood/'],
  ['/weybridge', '/locations/surrey/weybridge/'],
  ['/hersham', '/locations/surrey/hersham/'],
  ['/walton-on-thames', '/locations/surrey/walton-on-thames/'],
  ['/waltononthames', '/locations/surrey/walton-on-thames/'],
  ['/concierge-laundry', '/home-cleaning-london/'],
  ['/moving-out', '/end-of-tenancy-cleaning-london/'],
  ['/carpet-cleaning', '/home-cleaning-london/'],
  ['/well-clean-advisory', '/'],
  ['/office-cleaning-services', '/office-cleaning-london/'],
  ['/airbnb-turnover', '/home-cleaning-london/'],
  ['/well-clean', '/'],
  ['/services/concierge-laundry', '/home-cleaning-london/'],
  ['/services/moving-out', '/end-of-tenancy-cleaning-london/'],
  ['/services/office-cleaning-services', '/office-cleaning-london/'],
  ['/services/airbnb-turnover', '/home-cleaning-london/'],
  ['/services/well-clean', '/deep-cleaning-london/'],
  ['/services/well-clean-advisory', '/contact/'],
  ['/book', '/request-a-quote/'],
  ['/concierge', '/contact/'],
  ['/consulting', '/contact/'],
  ['/protocols', '/how-we-work/'],
  ['/resources/material-care', '/deep-cleaning-london/'],
]);

const skippedPrefixes = ['/api/'];
const skippedExtensions = /\.[a-z0-9]+$/i;

function stripTrailingSlash(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

function shouldNormalizePath(pathname: string) {
  return !skippedPrefixes.some((prefix) => pathname.startsWith(prefix)) && !skippedExtensions.test(pathname);
}

export const onRequest = defineMiddleware(async ({ request }, next) => {
  const incomingUrl = new URL(request.url);
  const lowerPath = incomingUrl.pathname.toLowerCase();
  const legacyTarget = legacyRedirects.get(stripTrailingSlash(lowerPath));
  // Cloudflare Pages previews must retain their preview host for QA. The
  // production custom domain continues to enforce the canonical host.
  const localOrPreviewRequest =
    ['localhost', '127.0.0.1', '::1'].includes(incomingUrl.hostname) ||
    incomingUrl.hostname.endsWith('.hqc-london.pages.dev');
  const canonicalUrl = new URL(
    legacyTarget ?? incomingUrl.pathname,
    localOrPreviewRequest ? incomingUrl.origin : CANONICAL_ORIGIN
  );

  if (!legacyTarget && shouldNormalizePath(incomingUrl.pathname)) {
    canonicalUrl.pathname = lowerPath.endsWith('/') ? lowerPath : `${lowerPath}/`;
  }

  canonicalUrl.search = incomingUrl.search;

  if (incomingUrl.href !== canonicalUrl.href) {
    return Response.redirect(canonicalUrl, 301);
  }

  return next();
});
