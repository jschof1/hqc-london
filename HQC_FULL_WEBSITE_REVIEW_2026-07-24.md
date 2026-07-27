# HQC Full Website Review

Date: 24 July 2026  
Status: implemented locally, not deployed

## Review outcome

The sitemap and enquiry routing were structurally correct, but the site still felt like an implementation scaffold. The primary causes were:

- very limited use of the existing HQC photography library
- short, repeated service-page sections
- insufficient proof and founder context on the homepage
- weak visual distinction between buyer journeys
- generic card layouts and a largely text-only page rhythm
- an intrusive chat welcome card covering the mobile hero
- oversized source imagery
- missing social-sharing metadata, security headers and agent-discovery content

## Changes implemented

### Homepage

- Rebuilt the hero around real HQC/property imagery and a clearer editorial hierarchy.
- Added three image-led buyer journeys for property, commercial and home clients.
- Added selected organisation logos already present in the project library.
- Added a visual explanation of the HQC process.
- Added project/transformation evidence.
- Added a founder section featuring Pedro.
- Restyled the service selector and final calls to action.

### Service and trust pages

The shared page template now gives every launch page:

- a route-specific image-led hero
- a clear buyer, service and enquiry summary
- service-specific outcomes
- the factors HQC establishes before quoting
- a three-image project evidence section
- a clear enquiry-to-delivery process
- related routes and a stronger final call to action

Route-specific image and content sets have been added for property, communal areas, agency support, voids, tenancy, post-construction, portfolios, commercial, office, deep cleaning, home, Essential Clean, moving, complex properties, pricing, proof, areas and company pages.

### Shared visual system

- Reworked colour, typography, spacing, buttons and section styles.
- Rebuilt the fixed header and mobile navigation.
- Rebuilt the footer without the unrelated external texture image.
- Added responsive image treatment and meaningful alternative text.
- Suppressed the third-party chat widget below 640px because its welcome card obscured most of the phone viewport.

### Technical and discoverability

- Added Open Graph and Twitter sharing metadata.
- Added caching and baseline security headers for Cloudflare Pages.
- Added `llms.txt`.
- Converted the heaviest new imagery to WebP.
- Reduced the audited homepage image payload by more than 4 MB.

## Verification

- `npm run build`: passed
- 22 outcome-led launch routes: prerendered successfully
- 17 existing location routes: prerendered successfully
- Desktop homepage visual QA: passed
- Representative service-page visual QA: passed
- 390 × 844 mobile layout: no horizontal overflow
- Mobile menu: opens and exposes the grouped navigation
- Browser console: no site-authored errors found
- `git diff --check`: passed

### Local crawl

Squirrel surface audit, 23 pages:

- Core SEO: 100
- Social Media: 100
- Structured Data: 100
- Mobile: 100
- Local SEO: 100
- Accessibility: 99
- Content: 92
- Images: improved from 67 to 90 before the final image reduction

The reported overall local score is not representative of production. The crawler penalises the HTTP development origin, production-domain sitemap URLs, Vite development assets and missing Cloudflare response headers. It also reports dynamic local routes as broken even though direct GET and HEAD checks return 200 and browser rendering succeeds.

## Still dependent on Pedro or provider configuration

- Confirm permission and preferred wording for named organisation logos.
- Supply the final founder video if it should replace the current founder image.
- Confirm which client reviews and project stories may be published with names.
- Confirm the Automaid or Launch27 booking URL and Essential Clean eligibility rules.
- Confirm final GHL field mapping and automation ownership.

## Release boundary

No commit, push, Cloudflare deployment, client message or provider configuration change has been made. Pushing the connected branch will trigger production deployment and therefore requires Jack's explicit approval.
