# HQC Plausible measurement

Implemented on Phase 8 staging, 6 October 2026. Production release remains a separate approval gate.

## Properties and verified compatibility

- Production property: `highqualityclean.co.uk` (site 8); only this hostname and `www.highqualityclean.co.uk` can select it. Automated browsers are excluded there.
- Isolated preview property: `phase8-2026-09-28-staging.hqc-london.pages.dev` (site 50); only that exact branch hostname can select it. This property intentionally contains QA activity.
- Every other preview, localhost, unknown host and deployment hash hostname is disabled. There is no query parameter that overrides this.
- Self-hosted Plausible `plausible/analytics:v2.0.0` at `https://analytics.aspectstudio.net`. The installed manual script's event protocol is `{n,u,d,r,p}`. Its raw `document.referrer` capture made it unsuitable for the required query privacy boundary; the first-party adapter uses that protocol with sanitized values.
- 23 custom event goals on production, 24 on staging (the extra goal is `form_preview`). No shared/public dashboard links created. Existing account ownership remains unchanged.
- The installed CE release has no `Plausible.Funnels` module. Use goal/property filters and the comparison recipes below; these are not session-ordered funnels.

## Questions this answers

| Decision | Events / properties |
| --- | --- |
| Which services and areas attract interest and enquiries? | Pageviews, `navigation_clicked` with approved destination, `cta_clicked`, page filter |
| Where do the four quotation journeys stall? | `quote_route_selected`, `form_started`, `form_step`, `form_validation`, `form_attempted`, `form_error`, `form_receipt`, `form_abandoned`; filter `form=quote` and route |
| Are visitors finding booking and the external fallback? | `booking_page_viewed`, `booking_fallback_clicked` |
| What information do visitors actually explore? | `service_selector_selected`, `faq_opened`, `content_viewed`, `scroll_depth`, `active_engagement` |
| Are the offer and contact options useful? | `offer_impression`, `offer_dismissed`, `offer_clicked`, `cta_clicked` by category and placement |
| Does private feedback reach the website receipt stage? | `private_feedback_opened`, form stages filtered to `feedback` |

## Events and exact meaning

All events carry `page_type` and `environment`. Their URL contains only an approved page path. Production and staging are separate datasets, not merely a filter.

| Event | Trigger / permitted properties |
| --- | --- |
| `pageview` | Once per document after analytics consent |
| `quote_route_selected` | Initial selected route after consent, then each distinct selected route once per document. `residential`, `property`, `commercial`, `complex`; analytics preserves property separately from the webhook's commercial discriminator |
| `quote_service_selected` | Initial preselected service after consent and each distinct choice; finite service code from the options in `analytics-contract.js`, never free text |
| `form_started` | First focus or valid attempt; `form`, `route` |
| `form_step` | First field-group focus within that journey: identity, service, property, requirements, permission, other. These are **engagement groups**, not completed wizard steps |
| `form_validation` | Native invalid fields grouped by step and reason (`required`, `format`, `constraint`), deduplicated within each attempt |
| `form_attempted` | Immediately before the handler sends a request, after client validation |
| `form_receipt` | Quote/contact/private feedback require HTTP success and `ok:true`. This is a website receipt, not a qualified lead, staff acceptance, email/handset receipt, Google publication, payment or booking |
| `form_preview` | Explicit no-send preview response; staging only, never a production goal |
| `form_error` | Once per pending attempt; `server_validation` or `receipt_unconfirmed`. No server messages or raw field names |
| `form_abandoned` | Best-effort page exit after start without receipt/preview; or switching away from a started, non-pending quote route. Reason `page_exit` or `route_changed`. Returning to that route starts a new journey. Browser termination, lost networking and privacy blocking can undercount |
| `cta_clicked` | Quote, booking, telephone, email, WhatsApp, Google review, download or external link category; header/footer/offer/main/other placement. No address, phone number, outbound URL or link text |
| `navigation_clicked` | Internal/service/location/anchor links; approved destination path, category, placement |
| `menu_opened` | Property/workplaces/homes/mobile menu once per document |
| `service_selector_selected` | Maintain/restore/professional choice once per result |
| `faq_opened` | Question number, once per question; see content map |
| `content_viewed` | First 20 main sections, 20% intersection after interaction, once per section; see content map |
| `scroll_depth` | 25/50/75/90% milestones, once per document; no event for a non-scrolling page |
| `active_engagement` | 15/30/60/120 seconds, visible tab and interaction within the last 30 seconds; bounded timer delta prevents background time counting |
| `booking_page_viewed` | Booking page viewed after consent; **no iframe or confirmed-booking claim** |
| `booking_fallback_clicked` | Explicit link to the existing Launch27 destination; no iframe listeners or provider settings changed |
| `private_feedback_opened` | Optional private-feedback section opened; rating and feedback contents excluded |
| `offer_impression`, `offer_dismissed`, `offer_clicked` | Existing Essential Clean offer interactions; once per action per document |

Links are deduplicated by destination/category/placement per document. Events are capped at 180 per document. Failed analytics sends are not retried. These measures intentionally undercount repeated tapping rather than inflate totals.

### Retained legacy forms

The existing `/discount/` redirect leads to `/offer/`, whose calls to action use the current quotation/booking journey. `/quote/`, `/services/`, `/areas/` and older service routes also redirect. Those redirects remain in place. Retained discount, legacy quote and quick-form handlers have stage hooks and a correct no-send preview notice; discount is covered by an isolated handler fixture. Do not describe the old discount form as an active visitor journey.

Discount and quick-form legacy endpoints proxy upstream HTTP responses; their `form_receipt` means HTTP acceptance only and has a weaker contract than the three current validated forms. It does not establish a downstream CRM or notification result.

## Privacy and consent contract

One first-party adapter replaces the earlier Umami/optional GA4 loaders and raw conversion forwarding. Cookie-choice UI/storage remains. Nothing is queued before analytics consent. Withdrawal stops future events, aborts in-flight fetches where possible and clears journey state. Already received anonymous events cannot be recalled. Withdrawal in another tab is handled by the storage event. Storage failure keeps tracking off. `plausible_ignore=true` is honoured.

No form value (including dates, ratings, postcode, marketing consent choice or free text), submission ID, email/phone, arbitrary label, query string, hash or session identifier enters event payloads. Paths come from `src/data/analytics-paths.json`; unknown paths become `/other/`. Referrers are reduced to an allowlist of public search/social origins, otherwise omitted. Fetch uses `credentials:omit` and `referrerPolicy:no-referrer`. Plausible still receives ordinary transport data such as IP/user agent and derives its normal anonymous metrics; this is not an anonymous network connection.

**Campaign limit:** UTM and all other query values are deliberately omitted. This implementation does not claim campaign-level attribution in Plausible. The website's separate consent-gated form attribution is not forwarded to analytics. New campaign labels require an explicit finite allowlist and privacy tests before adding them. Unknown referral sources appear as direct/unknown.

## Reading the dashboard

1. Choose the correct site and date range. Preview/test metrics live only in the named staging site.
2. For a quote journey, filter to `form=quote` and one route; compare started → attempted → receipt, with validation/error/abandonment alongside. Use **events** to understand retries and unique visitors to understand reach; counts are not a session-ordered conversion funnel.
3. For service/location interest, filter by the approved page URL or navigation destination. Compare CTA categories and quote starts for the same window.
4. For booking, compare booking-page views and external fallback clicks. Stop there: the iframe and actual booked jobs need separately authorised provider evidence.
5. Use the `item` property together with the page path and [readable content map](plausible-content-map.json) to identify the section heading or FAQ question. Regenerate this map after reordering content with `python3 scripts/analytics-content-map.py` against the local server. Items are 1-based DOM order, not permanent content IDs.

## Verification and maintenance

- `npm run test:analytics`: mock analytics endpoint, local no-send form APIs, external resources/Launch27 blocked; Chrome/Firefox/WebKit. Checks privacy, four routes, native/server validation, preview/error/receipt distinctions, consent, FAQ/scroll and booking engagement.
- `npm run test:forms`, `npm run test:forms:runtime`, `npm run test:phase8:browser`, `npm run build`: existing delivery guard and UI regressions.
- Path allowlist must be updated when adding a public route; unknown routes remain `/other/`. The analytics test verifies every route in the sitemap manifest is represented.
- Unload tests assert the actual page-exit fetch invocation: Playwright network interception loses the keepalive request after the document leaves. This is not provider delivery proof; the live staging dashboard check must separately show the abandonment event.
- Goal creation/readback and isolated provider receipts are stored privately, outside this public repository. Mock success proves instrumentation only. Live proof requires a browser event from the actual staging Pages deployment, successful cross-origin response and a subsequent staging dashboard count.
- No production release, real form submission, client message, Launch27 interaction, payment, booking or monitoring schedule is authorised by this measurement change.
