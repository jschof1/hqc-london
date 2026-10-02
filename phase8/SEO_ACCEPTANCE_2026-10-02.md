# SEO preservation acceptance, 2 October 2026

This read-only follow-up checks important organic landing pages and linked targets against the controlled route map. No website content, URL, redirect, SEO setting, sitemap submission or indexing request was changed. Raw Search Console exports, account screenshots, canonical inspection transcripts, crawl timestamps and performance data remain in private release evidence outside this public repository.

## Verified preservation

Current production and staging reads cover eleven targets: home, Hersham, quote, deep cleaning, office cleaning, Essential Clean, commercial cleaning, Contact, Reviews/case studies, Terms and Areas We Cover. All return HTTP 200, declare their intended non-www HTTPS lowercase trailing-slash canonical and appear in the production sitemap. Production remains indexable; staging retains noindex. Four historical aliases return a direct HTTP 301 to their final preserved targets on both hosts: `/services/deep-cleaning/`, `/services/office-cleaning/`, `/hersham/` and `/get-quote/`. See `evidence/2026-10-02/seo-priority-preservation.json`.

The authenticated Google source was inspected for these eleven targets and the historical deep-cleaning alias. The target pages are reported indexed; the legacy URL is correctly reported as a redirect. Seven direct UI checks also verified that Google's selected canonical is the inspected URL: home, Hersham, quote and the four service pages. The connector does not expose Google's canonical field, so these conclusions use the actual UI rather than inferring canonical selection from a PASS verdict.

Both available Google external-link CSV exports were captured privately. The overview's linked destination paths are retained and included in the current checks. Google's sample and latest-link exports are limited source-page lists, not an exhaustive backlink database or complete source-to-target mapping. This closes the earlier unavailable-export gate within Google's offered export scope.

## Monitoring and limits

No lost priority target, unintended canonical, index-blocking directive or broken inspected legacy redirect was found. Individual Google inspection panels have temporary sitemap-discovery processing notes, while the separate current sitemap report has no errors or warnings and the inspected target pages remain indexed. Hersham's panel does not list a referring sitemap despite correct indexing and canonical selection. These observations are retained privately and need follow-up; they do not establish a current sitemap failure or justify changing routes.

This is bounded evidence, not site-wide indexing certification or a guarantee of retained traffic. Google inspection data describes its last recorded crawl, not a new live crawl of staging. Production has not been replaced by the staged content. Exact Google crawl dates, raw inspection results and link lists are private.

Owner: Jack/coordinator. Review the temporary discovery notes on Monday 5 October 2026 at 09:00 BST or before controlled production acceptance, whichever comes first. After a separately authorised release, verify production robots/canonicals/redirects and later Google crawl/index state. Keep the existing landing pages and aliases; no deletion, consolidation or SEO approach change is authorised by this evidence. Provider access, CRM date repair and Pedro's acceptance remain separate release gates.
