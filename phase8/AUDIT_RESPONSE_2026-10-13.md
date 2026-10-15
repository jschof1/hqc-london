# Phase 8 audit corrections 13 October 2026

Controlled staging only. Responds to the 8 October findings F01–F06 and CC01; not HQC acceptance or production authorisation.

## Changes

- F01: render the Essential Clean offer only on `/essential-clean-london/` and `/home-cleaning-london/`. Remove the older generic promotional overlay entirely.
- F02/F04: retain the 12 October request/manual-confirmation corrections and verify them in the audit regression.
- F03: populate company number 13213121 and registered office from [Companies House](https://find-and-update.company-information.service.gov.uk/company/13213121), checked 13 October. Privacy/Terms contact, approval dates and other HQC-specific legal approval remain open.
- F05/CC01: explicitly distinguish payment details, collection and confirmation; make deposits service-dependent rather than universally 50% above £400. Add parent Terms/Privacy links beside the booking embed. Provider settings remain HQC-owned.
- Remove the unverified landline WhatsApp route from Contact.
- Keep form/dialog controls out of stagger animations, including after page swaps; exclude the cookie preferences action from generic anchor-scroll handling.

## Verification

Fresh release build passed. Local built-server checks (providers blocked or mocked):

- 55 browser checks across Chrome, Firefox, WebKit, iPhone and Android emulations: `evidence/2026-10-13/browser-verified/results.json`.
- 27 analytics checks and payload privacy/isolation assertions: `evidence/2026-10-13/analytics-27-checks.json`.
- 14 grouped audit checks: `evidence/2026-10-13/audit-final/results.json`.
- Existing form routing and 12 handler-runtime groups passed.

Earlier concurrent/dev-server attempts were not accepted as release proof. A rebuilt server retained a stale module manifest until restart, causing missing assets. Final runs used a fresh built server on port 4330 and ran browser engines serially. These are no-send checks, not proof of GHL receipt, email delivery, provider booking completion, payment or physical-device acceptance.

## Remaining release gates

All 11 GHL scenarios and actual route/communications receipt; provider/manual allocation/offer/payment tests under CC01; remaining legal particulars and processor audit; final approved flat/vector logo, portrait, provenance and permissions; analytics platform/attribution reconciliation; final deployed performance/device/SEO review; HQC ownership/MFA and external recovery evidence; explicit Pedro acceptance and production release authorisation. No customer contact or production release performed.

A private four-page response, twelve-area gap register, eighteen-test pop-up register and follow-through checklist are prepared separately. Existing 2 October evidence is historical and dated; 6 October Plausible staging receipt is not production activation.

## 15 October cumulative record addendum

The twelve-area and eighteen-case registers actually sent on 14 October have now been recovered verbatim, preserved under `evidence/2026-10-14/`, and extended as [HQC-gap-register.csv](HQC-gap-register.csv) and [HQC-popup-acceptance.csv](HQC-popup-acceptance.csv). See [the dated release addendum](RELEASE_ADDENDUM_2026-10-15.md) for source versus deployed observations, logo/legal input gates, and unchanged provider/HQC acceptance. The statements and test results above remain historical.
