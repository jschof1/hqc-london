# HQC Batch 1 — Controlled Implementation Response and Verification Record

**Parent record:** `HQC_Website_Copywriting_Batch_1_Pedro_Approved_Draft.docx` (unchanged)  
**Controlled implementation version:** 21 August 2026  
**Pull request:** #2 — `hqc-batch-1-controlled-signoff`  
**Revised non-production preview:** https://ae2e3720.hqc-london.pages.dev/

This Markdown record is the reviewable PR companion to the controlled Word response. It does not replace Pedro’s approved draft or the controlled Word copy.

## Verification standard

Statuses use Pedro’s requested controlled-document set: **Implemented and verified**, **Implemented – verification pending**, **Partially implemented**, **Not implemented**, and **Needs discussion**.

| Ref / page | Change and exact location | Previous behaviour | New behaviour | Test and result | Status |
| --- | --- | --- | --- | --- | --- |
| Shared presentation | `src/components/Header.astro`, `src/components/Footer.astro` | Temporary circular `H` treatment. | Responsive HQC/High Quality Clean lock-up, with a typographic footer treatment. | Astro production build; deployed desktop preview route/content check. | Implemented and verified |
| Homepage | `src/pages/index.astro` | Three-stage generic process; no reserved complex-service or controlled proof positions. | Five-stage Site Service Profile, six-stage complex-service visual, three permission-controlled evidence positions and founder-video reserve. | Astro production build; preview root verified on the Pages host. | Implemented and verified |
| Property & Facilities | `src/data/outcome-pages.ts`, `src/components/OutcomePage.astro` | Secondary CTA used `route=complex&buyer=property`. | CTA uses `/request-a-quote/?route=commercial&buyer=property&intent=site-assessment`; five-stage process and controlled property-proof position added. | Deployed preview route and CTA href verified; no desktop horizontal overflow. | Implemented and verified |
| Office Cleaning | `src/data/outcome-pages.ts`, `src/components/OutcomePage.astro`, `public/images/generated/hqc-office-hero.png` | Secondary CTA used `route=complex&service=office`; reviewed preview contained third-party-style office branding. | CTA uses `/request-a-quote/?route=commercial&service=office&intent=site-visit`; five-stage process and controlled workplace-proof position added; current hero is neutral and unbranded. | Deployed preview route and CTA href verified; asset and production build checked. | Implemented and verified |
| Quote context | `src/pages/request-a-quote.astro`, `scripts/verify-form-routing.mjs` | No `intent` field was retained from the route query. | `intent` is retained for site-assessment/site-visit routing and is covered by the route/form verification script. | `node scripts/verify-form-routing.mjs` passed. | Implemented and verified |
| Home Cleaning | `src/data/outcome-pages.ts`, `src/components/OutcomePage.astro` | Approved “Chosen by More Than 300 Clients” section omitted. | Approved trust section restored; named proof remains permission-controlled. | Deployed preview content verified; Astro production build passed. | Implemented and verified |
| Essential Clean™ hand-off | `src/components/ServiceSelector.astro` | Reviewed materials expected suitability to lead to Automaid booking. | Suitability route is retained; copy states a verified booking hand-off is issued only after confirmation. No unverified booking link has been invented. | Repository/configuration review and production build. No Automaid endpoint, integration configuration or acceptance-test route was supplied. | Needs discussion |
| Non-production preview | `src/middleware.ts` | Initial Cloudflare Pages preview redirected to the live canonical domain. | Pages-preview hosts retain their non-production origin; production custom domain still enforces canonical host. | Revised preview verified at the URL above. | Implemented and verified |
| Mobile and functional QA | Homepage, Property, Office and Home routes. | Final real-device/browser breakpoint check required. | Build, route/form, deployed route/content and desktop checks complete. | Astro production build and route/form script pass; deployed desktop checks pass. Requested 390–430 px visual review remains. | Implemented – verification pending |
| Deployment control | Pull request deployment statuses. | No status exception in initial record. | Cloudflare Pages preview succeeded. A separate `high-quality-clean` Cloudflare Workers integration reported a failed deployment. | Pages preview is serving the controlled site; PR status did not expose a Workers failure reason. | Needs discussion |

## Test evidence

```text
node scripts/verify-form-routing.mjs
# Passed: 4 repaired quick forms, discount offer, 5 existing form routes,
# shared handler and 4 webhook bindings.

CI=1 XDG_CONFIG_HOME=/tmp/hqc-astro-config node ./node_modules/astro/astro.js build
node scripts/inject-location-sitemap.mjs
# Passed: production build; 45 controlled canonical routes.
```

Deployed Pages checks confirmed the revised preview stayed on its non-production host and that:

- Property process content and the commercial/property `site-assessment` CTA were present.
- Office process content and the commercial/office `site-visit` CTA were present.
- Home Cleaning included the approved trust-section heading.
- The checked desktop routes had no horizontal document overflow.

## Technical deviations and release constraints

1. **Automaid hand-off:** do not release a direct booking promise until Pedro/Automaid supplies the approved endpoint or integration method, eligibility rules and a non-production acceptance test.
2. **Mobile QA:** Pedro’s requested 390–430 px visual check remains a final release gate.
3. **Workers status:** resolve or explicitly exclude the separate `high-quality-clean` Workers deployment failure before any production release. It did not prevent the Cloudflare Pages preview from serving this controlled branch.
4. **Proof and founder media:** positions are intentionally reserved; no unverified client evidence, reviews or founder video has been published.

## Requested final decision

Approve the implemented Batch 1 amendments as **Developer Ready**, subject to the three controlled release constraints above. Keep Essential Clean™ booking as a separately controlled dependency rather than treating a generic quote route as an Automaid booking hand-off.
