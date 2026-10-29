# Website version review

Pedro and Jack can compare saved page captures at `/versions/` using the existing private photo-review link or session. Open the photo review and choose **Compare website versions**. The same review code works in both areas. No new account is needed.

Choose Before, After, a page and a screen size. Side by side shares a scroll frame. Slider overlays the two captures. Toggle switches images without resetting the scroll position. Actual size supports desktop pan and scroll. Phones start with the mobile capture and toggle mode.

Comments attach to the selected After version and page. Switching pages retains unsaved drafts in that tab. Save writes an append-only comment to shared Cloudflare storage. Retry reuses its request identifier to prevent a duplicate after an uncertain response. Refresh retrieves other comments. Names are chosen labels under a shared private link, not verified identities. No emails or notifications are sent. A comment does not approve or publish the website.

## Evidence

The initial manifest contains four checkpoints and three pages, each at 1440px and 390px. The public-site capture is dated 29 October and linked to the Cloudflare production source from 21 October. Other captures come from fixed deployment URLs for 14, 20 and 28 October. All screenshots were captured on 29 October, with then-available image assets. These are not screenshots taken on the release dates.

The selected pages in the earlier October checkpoints can look identical. Operational changes need separate runtime evidence. These captures do not establish working forms, CRM routing, payments, acceptance or launch readiness. The May source has not been captured here.

`public/versions/manifest.json` records deployment/source references, route, viewport, capture timestamp, dimensions and SHA-256 for each image. `evidence/version-captures-20261029.json` records the requested/final URLs and capture method. Historical pages that redirect to a different origin must be marked unavailable rather than replaced with a current page.

## Add a review version

1. Obtain a successful Cloudflare deployment and its exact commit reference. Check that each requested page remains on that deployment and route.
2. Capture the full page at the existing viewport widths. Reject optional cookies. Load images and fonts. Do not submit forms. Tall captures can be tiled and joined without changing the layout. Retain the original capture privately.
3. Add the compressed captures and manifest entries with their actual dimensions, hashes and capture dates. Use a new stable version ID. Leave missing pages absent. Do not replace an earlier version's image files.
4. Run `node --test tools/photo-review/version-review.test.mjs` and the capture-integrity check. Drive the private app on desktop and phone. Check image loading, slider, toggle and the missing-image state.
5. Deploy only the review Worker using the existing config and `--keep-vars`. Preserve its secret, Durable Object binding, namespace, migration and photo assets. Never deploy the Astro customer website as part of this operation.

The Worker routes website comments to the existing `PhotoReview` class using the distinct `pedro-website-versions-v1` object ID and `discussion` storage key. Photo selections retain the original `pedro-may-2026` ID and `review` key. No migration or schema change is needed. Review comments have a 2,000-character limit and the initial discussion permits 500 comments.

Before a hosted test, back up `/api/review` and `/api/versions` privately. Do not run the legacy photo suite against an active client review; it changes selections. Use local storage for comment-write tests. Preserve the previous Worker script and settings for rollback. Cloudflare persistence is not an independent backup.
