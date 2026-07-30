# HQC sitemap technical change record

Date: 28 July 2026
Prepared for: Pedro Ndombasi
Source workbook: `HQC_Website_Full_Sitemap_Matrix_Locked_v2.0.xlsx`
Drive file ID: `1gTnyhDBB0trOQMco_uR9rfDC_SkXQ9Cm`
Workbook version checked: modified 18 July 2026 at 15:13 BST
Tabs checked: Sitemap Matrix, Decision Summary, Keyword Ownership, Merge Retire Defer

## Control position

The agreed positioning, brand doctrine and three buyer groups remain unchanged.

The canonical host is `https://highqualityclean.co.uk`. Canonical paths are lowercase and use a trailing slash. The matrix URL and keyword ownership model is approved, subject to the explicit dependencies and amendments below.

Status meanings:

- **Approved**: the matrix decision is accepted and the local implementation has a matching route.
- **Approved with amendment**: the route is accepted, with the recorded technical or content amendment.
- **Retain existing URL**: keep the indexed URL live until Search Console and backlink evidence supports a different decision.
- **Redirect required**: consolidate the old path into the stated canonical owner with a direct 301.
- **Technical dependency**: the page can remain in the architecture, but the named provider, proof or configuration must be confirmed before the related function is called complete.
- **SEO concern**: do not publish or expand the page until the stated overlap or evidence risk is resolved.
- **Defer**: do not include the proposed expansion in the first release.

## Page-by-page decision record

| # | Page | Final approved URL | Status | Form or booking route | Proposed schema | Tracking hooks | Amendment, dependency or SEO control |
|---:|---|---|---|---|---|---|---|
| 1 | Home | `/` | Approved with amendment | Service selector. Eligible Essential Clean users continue to suitability. Other users go to quotation or assessment. | `WebSite`, `WebPage`, `Organization`, `LocalBusiness`, `CleaningService` | `service_selector_result`, CTA clicks, phone, WhatsApp, prompt view | Keep as a mixed-buyer routing page. Do not make office, deep-cleaning or end-of-tenancy terms primary. Founder video and named proof remain dependent on approved assets. |
| 2 | Property and Facilities Cleaning | `/property-facilities-cleaning-london/` | Approved | Commercial/property route with a site or portfolio assessment option | `Service`, `WebPage`, `BreadcrumbList` | Primary and secondary CTA, enquiry route, form submit, phone | Owns `property management cleaning London`. Do not assign office or communal-area primary intent here. |
| 3 | Communal Area Cleaning | `/communal-area-cleaning-london/` | Approved | Commercial/site enquiry | `Service`, `WebPage`, `BreadcrumbList` | CTA, enquiry route, form submit | Keep focused on recurring shared-area delivery. Do not repeat the property hub. |
| 4 | Estate and Lettings Agent Cleaning | `/estate-letting-agent-cleaning-london/` | Approved | Agency/portfolio enquiry | `Service`, `WebPage`, `BreadcrumbList` | CTA, enquiry route, form submit | Do not duplicate consumer end-of-tenancy intent. |
| 5 | Move-In and Void Property Cleaning | `/move-in-void-property-cleaning-london/` | Approved | Property quotation with supporting uploads when provider mapping is confirmed | `Service`, `WebPage`, `BreadcrumbList` | CTA, enquiry route, form submit | Owns professional void-property intent. The private-client move-in page remains separate. |
| 6 | End of Tenancy Cleaning | `/end-of-tenancy-cleaning-london/` | Approved | Manual residential or professional quotation | `Service`, `WebPage`, `BreadcrumbList` | CTA, enquiry route, form submit | One page serves professional and private buyers. Old `/services/end-of-tenancy-cleaning/` and `/moving-out/` paths redirect here. |
| 7 | Post-Construction Cleaning | `/post-construction-cleaning-london/` | Approved | Project quotation or assessment | `Service`, `WebPage`, `BreadcrumbList` | CTA, enquiry route, form submit | Owns post-renovation, after-builders, sparkle-clean and developer-handover intent. No duplicate service pages. |
| 8 | Portfolio Cleaning Support | `/portfolio-cleaning-support-london/` | Approved | Portfolio qualification | `Service`, `WebPage`, `BreadcrumbList` | CTA, enquiry route, form submit | Focus on repeat allocation, communication and coordination. Do not repeat the property hub. |
| 9 | Workplaces and Commercial Cleaning | `/commercial-cleaning-london/` | Approved | Commercial enquiry or site assessment | `Service`, `WebPage`, `BreadcrumbList` | CTA, enquiry route, form submit | Owns `commercial cleaning London`. Office intent belongs to the office page. |
| 10 | Office Cleaning | `/office-cleaning-london/` | Approved | Commercial enquiry requesting site, frequency, hours and mobilisation inputs | `Service`, `WebPage`, `BreadcrumbList` | CTA, enquiry route, form submit | Owns `office cleaning London`. Old office routes redirect here. Do not launch thin Mayfair or Belgravia office pages. |
| 11 | Commercial Deep Cleaning | `/commercial-deep-cleaning-london/` | Approved | Commercial quotation or assessment | `Service`, `WebPage`, `BreadcrumbList` | CTA, enquiry route, form submit | Keep commercial restoration intent separate from residential deep cleaning. |
| 12 | Home Cleaning | `/home-cleaning-london/` | Approved with amendment | Home-service selector. Essential Clean suitability or manual residential quote | `Service`, `CollectionPage`, `WebPage`, `BreadcrumbList` | Selector, CTA, enquiry route | Keep as a home-services hub. It must not compete with Essential Clean or Deep Cleaning. Retired Airbnb, carpet and laundry service paths consolidate here for launch. |
| 13 | Essential Clean | `/essential-clean-london/` | Technical dependency | Suitability first. Public booking only after the verified Automaid or Launch27 URL and eligibility rules are supplied | `Service`, `WebPage`, `BreadcrumbList`, `Offer` only where visible terms match | Selector, suitability result, booking hand-off, CTA | Weekly or fortnightly maintenance-ready homes only. Monthly and heavy-build-up requests go to manual review. Do not claim a live public booking hand-off until provider testing passes. |
| 14 | Deep Cleaning | `/deep-cleaning-london/` | Approved | Manual residential quotation with condition and evidence inputs | `Service`, `WebPage`, `BreadcrumbList` | CTA, enquiry route, form submit | Owns residential restoration intent. Do not overlap Essential Clean, tenancy or commercial deep cleaning. |
| 15 | Move-In Reset | `/move-in-cleaning-london/` | Approved | Manual residential quotation | `Service`, `WebPage`, `BreadcrumbList` | CTA, enquiry route, form submit | Owns private pre-occupation intent. Professional void-property intent remains on its own page. |
| 16 | Complex and Executive Property Cleaning | `/complex-property-cleaning-london/` | Approved with amendment | Complex assessment route with supporting files after provider mapping is confirmed | `Service`, `WebPage`, `BreadcrumbList` | CTA, complex route, form submit | Do not position this as a generic luxury-home page. Use assessment-led wording and evidence. |
| 17 | About HQC | `/about-high-quality-clean/` | Technical dependency | General enquiry or service selector | `AboutPage`, `Organization`, `Person`, `BreadcrumbList` | CTA, video play when supplied | Founder video needs the approved asset, poster, captions, transcript and hosting decision. Use click-to-play loading below the founder introduction. |
| 18 | Why Choose HQC | `/why-choose-hqc/` | Approved | Service selector or quotation route | `WebPage`, `BreadcrumbList` | CTA, selector | Do not use 97% retention, guaranteed excellence or unsupported prestige claims. |
| 19 | How Our Cleaning Service Works | `/how-we-work/` | Approved | Selector to booking suitability, quotation or assessment | `HowTo` only if the visible steps meet the schema requirements, otherwise `WebPage`; `BreadcrumbList` | CTA, selector | Avoid implying every buyer follows one identical process. |
| 20 | How HQC Pricing Works | `/cleaning-prices-london/` | Approved with amendment | Essential Clean suitability or manual quotation | `WebPage`, `BreadcrumbList`, `Offer` only for visible and approved terms | CTA, route selection | Do not publish invented starting prices or internal margin controls. Add examples only after they are operationally validated. |
| 21 | Cleaning FAQs | `/cleaning-faqs/` | Approved | Selector or general enquiry | `FAQPage` for visible on-page questions, `WebPage`, `BreadcrumbList` | CTA, selector | Keep one central FAQ source and service-specific questions only where unique. FAQ markup is for machine understanding, not a promised Google rich result. |
| 22 | Cleaning Case Studies and Client Success Stories | `/reviews-case-studies/` | Technical dependency | Contextual quotation or suitability route | `CollectionPage`, `Article` or `CreativeWork` per real case, `Review` only where policy and visible evidence permit | CTA by case/service | Named logos, reviews, images and stories require permission. Do not add a second client-success page until unique evidence exists. |
| 23 | Request a Quote | `/request-a-quote/` | Technical dependency | One route-aware form with `residential`, `commercial` and `complex` states, posting through `/api/quote` | `ContactPage`, `WebPage`, `BreadcrumbList` | `enquiry_route_selected`, `form_submit`, campaign attribution | The local form route exists. Final GHL pipeline, tags, custom fields, upload handling, automation ownership and controlled end-to-end tests remain provider dependencies. |
| 24 | Contact | `/contact/` | Approved | General contact. Sales users are routed to the quotation flow | `ContactPage`, `Organization`, `BreadcrumbList` | CTA, phone, WhatsApp | Keep administrative contact separate from the main sales conversion route. |
| 25 | Areas We Cover | `/areas-we-cover/` | Approved with amendment | Postcode or service selector | `CollectionPage`, `WebPage`, `BreadcrumbList` | CTA, selector, postcode when implemented | Keep the 17 existing location URLs live pending Search Console and backlink evidence. Do not create dozens of thin pages. |
| 26 | Cleaning Services in East London | `/cleaning-services-east-london/` | Approved with amendment | Postcode-led selector, quotation or assessment | `Service`, `WebPage`, `BreadcrumbList` | CTA, selector, enquiry route | One useful East London hub at launch. Defer six near-identical district pages until there is unique proof and demand. |
| 27 | Privacy Policy | `/privacy-policy/` | Approved | Rights/contact route only | `WebPage` | No conversion target beyond contact | Keep the systems and processor description aligned with the real GHL and booking configuration. |
| 28 | Terms and Conditions | `/terms-and-conditions/` | Approved with amendment | Linked from forms, footer and future booking hand-off | `WebPage` | No conversion target beyond contact | The 30% first-clean offer is limited to eligible new Essential Clean clients on a weekly or fortnightly service with a minimum three-month commitment. Final legal approval remains a business responsibility. |

## Keyword ownership amendments

No primary keyword owner from the locked workbook needs to change.

The implementation controls are:

- Home owns broad `cleaning services London` intent and remains a routing page.
- Property and Facilities owns `property management cleaning London`.
- Commercial Cleaning owns `commercial cleaning London`.
- Office Cleaning owns `office cleaning London`.
- Home Cleaning owns broad home-services intent.
- Essential Clean owns recurring and regular-home-cleaning intent.
- Deep Cleaning owns residential restoration intent.
- Commercial Deep Cleaning owns commercial restoration intent.
- End of Tenancy has one shared page for professional and private buyers.
- Post-Construction owns post-renovation, after-builders and sparkle-clean variants.
- Move-In Reset owns private move-in intent. Move-In and Void Property Cleaning owns professional void-property intent.
- The East London hub owns broad East London intent. District pages are deferred.

## Direct redirect record

The local redirect configuration has been amended so old paths go directly to the final canonical owner. This removes avoidable redirect chains.

| Existing source path or path family | Final destination | Decision |
|---|---|---|
| `/get-quote/`, `/quote/`, `/book/` | `/request-a-quote/` | Redirect required |
| `/services/` | `/#find-my-service` | Redirect required |
| `/why-us/` | `/why-choose-hqc/` | Redirect required |
| `/process/`, `/protocols/` | `/how-we-work/` | Redirect required |
| `/case-studies/`, `/client-success-stories/` | `/reviews-case-studies/` | Redirect required |
| `/areas/`, `/areas/areas/` | `/areas-we-cover/` | Redirect required |
| `/services/office-cleaning/`, `/office-cleaning-services/`, `/services/office-cleaning-services/` | `/office-cleaning-london/` | Redirect required |
| `/services/deep-cleaning/`, `/services/well-clean/`, `/resources/material-care/` | `/deep-cleaning-london/` | Redirect required |
| `/services/end-of-tenancy-cleaning/`, `/moving-out/`, `/services/moving-out/` | `/end-of-tenancy-cleaning-london/` | Redirect required |
| `/post-renovation-cleaning/`, `/after-builders-cleaning/`, `/developer-handover-cleaning/` | `/post-construction-cleaning-london/` | Merge and redirect |
| `/regular-residential-cleaning/` | `/essential-clean-london/` | Merge and redirect |
| `/luxury-cleaning-services/`, `/services/airbnb-cleaning/`, `/airbnb-turnover/`, `/services/airbnb-turnover/`, `/services/carpet-cleaning/`, `/carpet-cleaning/`, `/concierge-laundry/`, `/services/concierge-laundry/`, `/services/ironing-and-laundry/` | `/home-cleaning-london/` | Replace or defer and redirect |
| `/commercial-wellness-cleaning/` | `/commercial-cleaning-london/` | Replace and redirect |
| `/well-clean/`, `/well-clean-advisory/` | `/` | Replace and redirect |
| `/services/well-clean-advisory/`, `/concierge/`, `/consulting/` | `/contact/` | Redirect required |
| `/discount/` | `/offer/` | Redirect required |
| `/sitemap.xml` | `/sitemap-0.xml` | Redirect required |

All equivalent non-trailing-slash versions are covered. HTTP and `www` host variants redirect to the non-www HTTPS canonical host.

## Existing location URLs

The following live location URLs should be retained and rewritten where necessary. They should not be removed or merged until Search Console clicks, impressions, index status and backlink evidence are reviewed:

- `/locations/london/battersea/`
- `/locations/london/belgravia/`
- `/locations/london/chelsea/`
- `/locations/london/clapham/`
- `/locations/london/hampstead/`
- `/locations/london/highgate/`
- `/locations/london/holland-park/`
- `/locations/london/kensington/`
- `/locations/london/knightsbridge/`
- `/locations/london/mayfair/`
- `/locations/london/notting-hill/`
- `/locations/london/primrose-hill/`
- `/locations/london/st-johns-wood/`
- `/locations/london/wandsworth/`
- `/locations/surrey/hersham/`
- `/locations/surrey/walton-on-thames/`
- `/locations/surrey/weybridge/`

Legacy root-level variants such as `/mayfair/`, `/nottingHill/`, `/hollandPark/` and `/waltonOnThames/` redirect directly to the corresponding canonical location URL.

## Navigation record

Desktop navigation is grouped into:

1. Property and Facilities
2. Workplaces
3. Homes
4. How It Works
5. Proof
6. Contact
7. Request a Quote

The mobile menu uses the same buyer grouping in a single scrollable panel. This structure is technically feasible and avoids exposing all 28 routes in the primary navigation.

## Service-selector outcomes

| User outcome | Current route | Final provider hand-off |
|---|---|---|
| Maintain a suitable home weekly or fortnightly | `/essential-clean-london/?next=booking` | Verified Automaid or Launch27 public booking route after suitability |
| Restore a home, prepare for a move or complete a tenancy/post-work clean | `/request-a-quote/?route=residential` | GHL residential quotation mapping |
| Manage a workplace, portfolio, property site or complex project | `/request-a-quote/?route=commercial` or complex assessment | GHL commercial/property or complex-assessment mapping |

Essential Clean is the only route intended for direct public booking. Every other service remains quotation-led or assessment-led.

## Conversion and campaign tracking

The local site emits:

- `service_selector_result`
- `enquiry_route_selected`
- `form_submit`
- `primary_cta`
- `secondary_cta`
- `phone_click`
- `whatsapp_click`
- `conversion_prompt_view`

Before production sign-off, add or verify:

- booking hand-off and confirmed-booking events
- provider-side form success, rather than button-click-only success
- UTM, landing-page and referrer persistence into GHL
- Google Ads and Meta conversion mapping where campaigns require it
- deduplication between browser and provider-side conversion events
- consent behaviour for analytics and advertising tags

## Deferred pages and claims

Defer:

- Mayfair and Belgravia office-cleaning pages
- carpet, upholstery and window-cleaning standalone pages
- Airbnb Cleaning as a standalone sector page
- additional East London district pages
- a second Client Success Stories page

Do not use:

- 97% client retention
- guaranteed excellence
- universal photo handovers
- broad wellness-grade claims without specific evidence
- named logos, reviews or project stories without permission
- aggregate-rating schema unless visible, current and policy-compliant evidence supports it

## Ownership and remaining dependencies

Jack-owned:

- maintain this change record against implementation changes
- run local build, route and redirect checks
- obtain and review Search Console evidence before retiring location URLs
- prepare a controlled provider test plan after Pedro supplies the required configuration
- present the exact client reply and attachment for approval before sending

Pedro-owned, as confirmed in the 28 July email:

- Automaid or Launch27 public booking setup and Essential Clean eligibility rules
- GHL pipelines, tags, custom fields and automation ownership
- founder video and hosting decision
- approved logos, named reviews and project stories

Joint sign-off:

- controlled Essential Clean booking and GHL-copy test
- route-to-pipeline acceptance tests for residential, commercial/property and complex enquiries
- final proof permissions
- Search Console-based location retention or redirect decisions
- production release and redirect activation

## Safest phased release order

1. Approve this URL, keyword and redirect control record.
2. Confirm the GHL field and pipeline mapping.
3. Confirm Essential Clean eligibility and the public booking hand-off.
4. Test the three enquiry outcomes locally and in controlled provider test records.
5. Validate consent and conversion attribution.
6. Review Search Console and backlink evidence for existing location URLs.
7. Add approved founder and proof assets with performance controls.
8. Run final mobile, accessibility, structured-data, redirect and form QA.
9. Obtain explicit release approval.
10. Deploy, then verify the production host, redirects, forms, booking hand-off, analytics and indexation signals.

No deployment, provider configuration, Drive edit, permission change or client send is included in this local change record.
