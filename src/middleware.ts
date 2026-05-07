import { defineMiddleware } from 'astro:middleware';

const CANONICAL_ORIGIN = 'https://highqualityclean.co.uk';

const legacyRedirects = new Map<string, string>([
  ['/get-quote', '/quote/'],
  ['/areas/areas', '/areas/'],
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
  ['/concierge-laundry', '/services/ironing-and-laundry/'],
  ['/moving-out', '/services/end-of-tenancy-cleaning/'],
  ['/carpet-cleaning', '/services/carpet-cleaning/'],
  ['/well-clean-advisory', '/'],
  ['/office-cleaning-services', '/services/office-cleaning/'],
  ['/airbnb-turnover', '/services/airbnb-cleaning/'],
  ['/well-clean', '/'],
  ['/services/concierge-laundry', '/services/ironing-and-laundry/'],
  ['/services/moving-out', '/services/end-of-tenancy-cleaning/'],
  ['/services/office-cleaning-services', '/services/office-cleaning/'],
  ['/services/airbnb-turnover', '/services/airbnb-cleaning/'],
  ['/services/well-clean', '/services/deep-cleaning/'],
  ['/services/well-clean-advisory', '/contact/'],
  ['/book', '/quote/'],
  ['/concierge', '/contact/'],
  ['/consulting', '/contact/'],
  ['/protocols', '/process/'],
  ['/resources/material-care', '/services/deep-cleaning/'],
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
  const canonicalUrl = new URL(legacyTarget ?? incomingUrl.pathname, CANONICAL_ORIGIN);

  if (!legacyTarget && shouldNormalizePath(incomingUrl.pathname)) {
    canonicalUrl.pathname = lowerPath.endsWith('/') ? lowerPath : `${lowerPath}/`;
  }

  canonicalUrl.search = incomingUrl.search;

  if (incomingUrl.href !== canonicalUrl.href) {
    return Response.redirect(canonicalUrl, 301);
  }

  return next();
});
