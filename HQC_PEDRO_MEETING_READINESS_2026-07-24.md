# High Quality Clean — Pedro meeting readiness

Meeting date: 24 July 2026  
Source reviewed: Pedro’s email of 18 July 2026 and `HQC_Website_Full_Sitemap_Matrix_Locked_v2.0.xlsx`  
Workbook tabs reviewed: Sitemap Matrix, Decision Summary, Keyword Ownership, Merge Retire Defer

## Outcome

The development branch now implements the locked outcome-led architecture locally. It does not reopen Pedro’s positioning or three buyer groups.

No production deployment, CRM submission, source-workbook edit or client message has been made. Those remain approval-gated.

## Implemented

- Replaced the homepage’s luxury/wellness positioning with:
  - `Cleaning Defined by the Outcome`
  - `The right cleaning service for the result you need`
  - `Clear scope. Labour-based quotations. Careful delivery.`
- Added the three fixed buyer journeys:
  - Property & Facilities
  - Workplaces & Commercial Sites
  - Homes & Private Clients
- Added all approved launch URLs from the locked matrix, including the four priority pages:
  - `/`
  - `/property-facilities-cleaning-london/`
  - `/office-cleaning-london/`
  - `/home-cleaning-london/`
- Added the remaining service, trust, conversion and location-hub URLs.
- Implemented a mobile-feasible grouped navigation and full mobile menu.
- Implemented a service selector with three outcomes:
  - Essential Clean™ suitability
  - residential manual quotation
  - professional or complex enquiry
- Made Essential Clean™ the only service presented as potentially bookable online.
- Kept Deep Clean™, Move-In Reset™, End of Tenancy™, Post-Construction™, commercial and property work on manual quotation or assessment routes.
- Added separate residential, commercial/property and complex enquiry states.
- Kept form delivery on the existing `QUOTE_FORM_WEBHOOK` server route. The local Cloudflare variables confirm that route is configured; no test lead was transmitted.
- Added event hooks for:
  - service-selector results
  - enquiry-route selection
  - form submission
  - primary and secondary CTA clicks
  - telephone clicks
  - WhatsApp clicks
  - exit-intent and mobile-scroll prompt views
- Added desktop exit-intent and mobile 55%-scroll conversion prompts with session dismissal.
- Replaced unsupported or conflicting public claims in the new architecture:
  - removed 97% retention
  - removed guaranteed excellence
  - removed the public commercial 30% offer
  - removed the 12-month offer wording
  - removed Signature Clean™ and WellClean™ from the new routes
- Rebuilt organisation/page schema without the unsupported aggregate-rating, award, luxury, wellness and Surrey-wide claims.
- Updated the privacy policy to name GHL and Automaid/Launch27 and cover supporting-file uploads.
- Updated terms for the 30% first Essential Clean™ offer:
  - new clients
  - weekly or fortnightly
  - minimum three months
  - suitability, coverage and availability apply
- Rebuilt the FAQ route as one continuous, grouped section with:
  - the five priority FAQs visible first
  - a CTA immediately after them
  - General, Cleaning Services, Pricing & Payments, and Quality & Trust headings
  - collapsed secondary FAQs
  - direct Terms and Conditions linkage
- Added direct migration redirects for current legacy service, navigation and overlapping-intent URLs.
- Preserved current individual London/Surrey location pages for now rather than destroying indexed assets without Search Console evidence.

## Migration decisions implemented

- Post-Renovation Cleaning → Post-Construction Cleaning
- After Builders Cleaning → Post-Construction Cleaning
- Developer Handover Cleaning → Post-Construction or professional buyer route
- Regular Residential Cleaning → Essential Clean™
- Luxury Cleaning Services → Home hub
- Commercial and Wellness Cleaning → Commercial Cleaning
- Airbnb, carpet, upholstery and laundry standalone routes → home hub for launch
- Old office, deep-clean and end-of-tenancy routes → their single flat canonical pages
- Old services, why-us, process, case-study, areas and quote routes → the new owning pages

## Deliberately not fabricated

These need Pedro/Jack input or provider configuration before they can be called complete:

1. **Automaid/Launch27 public booking URL and embed**
   - No verified public booking URL or account configuration exists in the repository.
   - The selector and Essential Clean™ qualification route are implemented.
   - The final external hand-off must not be guessed.

2. **Automaid → GHL lead copy/sync**
   - Requires provider-side field mapping, webhook/API credentials and a controlled test booking.
   - The site does not expose secrets or claim the sync is live.

3. **Founder video**
   - No approved video file, transcript, poster image or hosting URL was supplied.
   - Recommended placement: About page after the founder introduction, with a poster image, captions, transcript and click-to-play loading.

4. **Proof assets**
   - Commercial logos, named cases, project images, floor plans, portfolio examples and extended stories remain dependent on permission and real evidence.
   - New pages use process statements rather than fabricated case studies.

5. **Existing local-page retirement**
   - The matrix says not to launch thin location pages, but current location URLs may already be indexed.
   - Final retain/redirect decisions require a Search Console export of indexed URLs, clicks, impressions and backlinks.

6. **Production release**
   - Requires Jack’s explicit approval after review.
   - A Git push would auto-deploy the connected Cloudflare Pages branch.

## Recommended meeting decisions

1. Confirm the new architecture and URL ownership.
2. Confirm the Essential Clean™ suitability questions.
3. Provide or approve the Automaid/Launch27 public booking route.
4. Confirm which GHL pipeline, tags and custom fields should receive each enquiry route.
5. Agree a controlled end-to-end test:
   - Essential Clean™ qualification
   - booking hand-off
   - GHL contact creation
   - opportunity/pipeline placement
   - confirmation automation
6. Approve founder-video production and hosting.
7. Identify the first real proof assets for Property & Facilities, Office Cleaning and Home Cleaning.
8. Review Search Console evidence before retiring indexed location pages.
9. Approve the staged production release and redirect activation.

## Verification

- `npm run build`: passed.
- All 23 data-driven matrix pages prerendered successfully.
- Existing 17 location pages still build.
- Homepage inspected at desktop width.
- Homepage navigation and mobile menu inspected at 390 × 844.
- Property & Facilities priority page inspected.
- Commercial/property form route inspected, including frequency and TUPE fields.
- Legacy office and quote routes return direct 301 redirects to the new canonical pages.
- No client form was submitted.
- No production deployment was made.

## Known engineering risk

`npm audit --omit=dev` reports 19 dependency advisories: 1 low, 2 moderate, 15 high and 1 critical. These are in the existing dependency tree. They should be triaged separately because a forced upgrade could introduce breaking changes and is not required to review the new architecture tomorrow.
