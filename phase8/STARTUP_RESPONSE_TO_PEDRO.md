Subject: HQC Phase 8 staging progress and release checks

Hi Pedro,

The Phase 8 work is on the separate staging site using your 28 September Release Pack and approved Batches 1–6. The public site has not been replaced.

The four quote routes now validate dates and required information, preserve details if delivery fails, and keep general Contact separate from sales enquiries. The booking embed has a tested failure fallback, and the Google review option is available equally for every rating. Consent controls, direct legacy redirects and mobile image sizes have also been improved.

The site builds successfully. All 55 checks passed across Chrome, Firefox, WebKit and iPhone/Android emulation, including form failures, keyboard/reflow, consent and the offer overlay. We still need actual Safari/Edge and physical-device acceptance. The current production source has been independently restored and built, and its Cloudflare production deployment has been recorded for rollback.

The main outstanding work is the real form-to-GHL connection and delivery checks, including the separate Contact destination, acknowledgement, Pedro notifications and all sales scenarios. The isolated GHL field test is separate from live enquiry delivery. GA4 receipt, the production cookie audit, Search Console baseline and final legal/evidence checks also remain open.

In Launch27, please reconcile “Cancel or reschedule anytime” with the three-month offer commitment, verify the 30% offer and >£400 deposit in a permitted test journey, and make the Terms/Privacy links usable. The loaded provider form still has older service names and shows 07824 390336 for larger homes; please confirm the intended number. No booking or charge has been made during these checks.

We also need the approved transparent logo, professional portrait, company/ICO details and permissioned supporting evidence before launch. The 300+ claim remains withheld pending evidence.

Preview: https://phase8-2026-09-28-staging.hqc-london.pages.dev/

I’ll keep the remaining checks explicit in the release record. Production stays gated on your controlled acceptance and authorisation.

Jack
