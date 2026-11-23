# Review corrections, 23 November 2026: Terms amendments

Source request: the client's 20 November final Terms clause amendments (private evidence `hqc-review-2026-11-23`). Earlier 12, 13 and 17 November requirements remain cumulative at `ac24c18` / `99efba8e`.

## Implemented (final source `2aaba22`, preview `https://6b694c82.hqc-london.pages.dev`)

- Terms: every item in the client's implementation checklist, applied verbatim. New sections are 5 (service commitment and re-clean, 48 hours), 11 (14-day right to cancel and model form), 16 (keys, codes and alarms, £500) and 28 (damage, valuables and photos).
- Terms: the section 8 additions, the fixed cancellation tiers in section 12, and payment, VAT and quotation wording in sections 4 and 7.
- Terms: precedence (section 1), complaints at 2/10 working days, a copy-of-Terms paragraph, the new Contact section 35, and the commercial schedule C1–C4.
- Sections renumbered 1–35, with cross-references updated. Header reads "Last updated: 23 November 2026".
- Old sections 15, 18 and 27 (now 17, 20 and 29) are unchanged pending the insurance renewal.
- Footer and section 35: VAT registration number.
- Dated Terms PDF at `/terms-2026-11.pdf`. `scripts/build-terms-pdf.mjs` writes new editions to new paths only.
- Request a Quote: the client's 14-day early-start tick-box. It appears only for home quotes dated from today to 14 days ahead (London date) and is checked again at submit time. The server accepts only an exact `yes` on eligible home quotes.

## Independent review

- Codex review 1 (FAIL): past dates triggered the box; date changes cleared frequency; the server accepted ineligible values; the test asserted source text; the PDF generator could overwrite the dated copy. All fixed in `a2f64b7`.
- Codex re-check 2 (FAIL): eligibility went stale across London midnight; malformed values returned 400; the PDF write was not exclusive. All fixed in `31370b8`, with behaviour tests.
- Codex re-check 3 (PASS-WITH-FIXES): native validation could block an expired unticked box after midnight. Fixed in `2aaba22` (JS `noValidate`, handler validates after refreshing eligibility; no-JS validation retained). Final preview `https://6b694c82.hqc-london.pages.dev`, version `nov23-pedro-terms-v2`.

## Verification

Scope check, Terms and audit tests 36/36, forms 42/42 + 1/1, analytics 2/2, revisions 18/18, and review build all pass. Hosted QA used 52 fresh captures (26 pages at 1440 and 390), and version `nov23-pedro-terms` was appended and read back.

On mobile, the section 12 tables scroll sideways, using the same pattern as the previously approved matrix.

## Held

- Insurance sections, pending the renewal.
- Privacy "Last reviewed" wording.
- The client's sign-off of the Terms comparison.
- Three questions for the client:
  - the old quotation expiry bullet;
  - the schedule scope sentence;
  - the section 12 intro.
- Forms/CRM, booking, redirect and pop-up evidence.
- Production release through protected `main`.
