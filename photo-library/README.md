# HQC photo library

Approved HQC job photos that can be used on the website, service pages, case studies, social posts and Google Business Profile posts.

This folder is not served by the website. Nothing here appears on a live page until it is copied into `public/images/` as part of a scoped client revision (see `AGENTS.md` and `revisions/current.json`).

## How files are prepared

- WebP, longest edge 1,600px or less, quality 80.
- All EXIF data removed, including GPS location and phone model. Pedro's originals carried GPS coordinates, so never commit the raw files.
- Descriptive kebab-case names. `-before` and `-after` files with the same stem are a matching pair.
- Original WhatsApp files are kept out of git.
- Photos showing identifiable faces, addresses or house numbers, or clients' personal belongings that shouldn't be public, are left out. Each exclusion is listed below.

## 4 November 2026: from Pedro via WhatsApp

Pedro sent 18 photos and asked for them to be added to the list of photos we can use. 14 were added and 4 were left out. The four bathroom tile photos were taken on 30 June 2026 (according to their file names); the rest have no capture date.

| File | What it shows | Alt text | Suggested use |
|---|---|---|---|
| `hqc-bathroom-tiles-grout-corner-before.webp` | Bath surround tiles with orange-stained grout lines, before cleaning | Stained grout lines on beige bathroom tiles before a deep clean | Before/after pair, deep clean service page, case studies |
| `hqc-bathroom-tiles-grout-corner-after.webp` | The same tile corner with clean, even grout | Clean beige bathroom tiles and grout after an HQC deep clean | Before/after pair, deep clean service page, case studies |
| `hqc-bathroom-shower-wall-grout-before.webp` | Shower wall above the bath with stained grout and mosaic band | Shower wall with discoloured grout above a bath before cleaning | Before/after pair, deep clean or end of tenancy page |
| `hqc-bathroom-shower-wall-grout-after.webp` | The same shower wall after cleaning, chrome taps and glass screen | Shower wall and bath taps after a deep clean, with clean grout | Before/after pair, deep clean or end of tenancy page |
| `hqc-bath-tap-limescale-before.webp` | Bath mixer tap with limescale and grime around the base | Bath mixer tap with limescale and grime before descaling | Before/after pair, social posts, bathroom cleaning detail |
| `hqc-bath-tap-limescale-after.webp` | The same style of bath tap polished and free of limescale | Polished chrome bath tap after limescale removal | Before/after pair, social posts, bathroom cleaning detail |
| `hqc-navy-bedroom-before.webp` | Navy bedroom with unmade bed, shopping bags and clutter | Untidy bedroom with unmade bed and bags before cleaning | Before/after pair with the navy bedroom after shot, regular or one-off clean |
| `hqc-navy-bedroom-after.webp` | Same navy bedroom with the bed made and floor clear | Freshly made double bed in a navy bedroom after a clean | Before/after pair, regular domestic cleaning page, gallery |
| `hqc-small-bedroom-boxes-before.webp` | Small bedroom filled with packed boxes, mattress roll and bags | Small bedroom full of moving boxes before an end of tenancy clean | Before/after pair, end of tenancy or move in/out page |
| `hqc-small-bedroom-after.webp` | Same small bedroom cleared, bed made, bedside table tidy | Tidy small bedroom with a freshly made bed after cleaning | Before/after pair, end of tenancy or move in/out page, gallery |
| `hqc-living-room-after.webp` | Tidy living room with grey corner sofa, fireplace and rug | Clean, tidy living room with a corner sofa and fireplace | Regular domestic cleaning page, gallery, hero alternative (includes framed artwork, one a painted portrait) |
| `hqc-after-builders-clean-before.webp` | Newly renovated room with dust, debris and tools before an after-builders clean | Renovated room with dust and builders' debris before an after-builders clean | After-builders cleaning page, social posts (no matching after photo yet) |
| `hqc-basement-steps-railings-before.webp` | Dirt and debris along painted railings above basement steps | Dirty ledge and railings above basement steps before cleaning | Exterior or communal cleaning, social posts (no matching after photo yet) |
| `hqc-exterior-window-cleaning-water-fed-pole.webp` | Water-fed pole reaching the upper windows of a brick house | Water-fed pole cleaning the upper windows of a London brick house | Window cleaning service, social posts. Cropped so the operative's face is not visible |

### Not added

| Supplied photo | Reason |
|---|---|
| Untidy living room with laptop, wine bottle, cigarette packet and a street sign | Client's personal belongings that shouldn't be published. The matching after shot (`hqc-living-room-after.webp`) is included |
| Operative cleaning a sash window from a balcony | Operative's face is clearly visible. Could be used if he gives written consent |
| Two operatives cleaning a sauna glass door | Operatives' faces are partly visible, including in the glass reflection. Could be used with their written consent |
| Navy bedroom, second after shot from the window side | Very dark, with bags still on the floor. A weaker near-duplicate of `hqc-navy-bedroom-after.webp` |
