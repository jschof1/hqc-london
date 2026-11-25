# Website follow-up on 25 November 2026

Pedro reviewed the 45 routes on the [24 November 3D preview](https://c356b857.hqc-london.pages.dev/). He signed off the Terms wording, VAT, WhatsApp, Privacy supplier categories, Reviews and the 3D header. His eight follow-up requests are held privately under `hqc-review-2026-11-25/1a21008f3e8531a7.txt`.

Source `6cfbe188d4a58b49827ce341f27cbad56204c8c0` is deployed to the [25 November review candidate](https://1d7154bb.hqc-london.pages.dev/).

## Website and preview evidence

| Request | Checked result |
| --- | --- |
| Privacy date | The preview displays “Last updated: 24 November 2026”. |
| Legal staging notice | Terms and Privacy still show the notice on this preview. The legal component's production predicate omits it and has a regression test. Read the released HTML back when the production hold is lifted. |
| Essential Clean wording | The page uses “takes any advance payment required before”. |
| Terms PDF | A dated download link appears beside the Terms date. The hosted PDF matches the approved 11-page PDF byte for byte and contains the signed-off §29 and C5. |
| 14-day home quote checkbox | The desktop preview recording uses synthetic fields. With the required box unticked and all other fields valid, a real submit-button click triggers the checkbox's validation, focuses it and makes zero quote requests. Private proof video and measured result are under `hqc-review-2026-11-25`. |
| Header logo | Both 3D gold image variants have “High Quality Clean” alternative text. The full wordmark shows at 390 and 1440 px and the compact mark at 1024 px. |
| Complex and Executive hero | The page uses the already available illustrative marble bathroom image with gloved hands and no face. It differs from the Move-in / Void hero. |
| Homepage reviews | All six cards size to their content at 390 px. Desktop retains its 292 px minimum. |

The guarded build and 99 targeted automated tests passed. Independent hosted review found no blocking preview defects. The early-start proof covers the website form, whose browser validation runs when the checkbox becomes required. All 45 sitemap paths in the built artefact returned 200 with preview noindex and no redirects. Three first-hop legacy redirects for Mayfair, Holland Park and Walton-on-Thames reached the expected canonical paths on both preview and current production.

The booking page displays its Launch27 fallback link and request wording. The Essential Clean promotion was deliberately unmounted on 6 November in `c298746`. The Essential Clean and Home Cleaning routes still have no promotional modal. Test evidence for an enabled promotion would require a separate decision to restore it.

## Launch evidence still due

- Pedro's final review of this new preview.
- Production readback of both noindex signals and the staging notice following an authorised release. The existing live home and FAQ responses already serve `index, follow` and have no `X-Robots-Tag` header.
- Reconcile the handset alert and finish the remaining GoHighLevel workflow controls. The prior test enquiry, automation list and rollback evidence are held separately.
- Verify an actual Launch27 booking, payment and GoHighLevel handoff on the agreed test route.

## Private comparison

[Compare the 24 and 25 November previews](https://review.highqualityclean.co.uk/versions/?before=nov24-hqc-3d-header&after=nov25-pedro-final-fixes&page=home#compare). The 25 November capture contains desktop and mobile images across 26 pages.

The protected hosted readback verified all 52 capture hashes. Earlier versions, photo selections and comments matched their pre-publish state.
