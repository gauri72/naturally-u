# Old Site → New CMS Content Migration Report

Migration of all content from the retired Wix site **https://www.naturallyu.nl** into
this project's data layer (CMS Pages, Products, Settings). Executed via
`npm run migrate:content` (`server/src/seed/migrateOldContent.js`), which is
idempotent and safe to re-run.

Discovery method: `robots.txt` + `sitemap.xml` (pages + store-products sitemaps),
recursive internal-link extraction from every fetched page, Wix site-structure data
embedded in the SSR HTML, and the blog RSS feed. All pages were server-rendered by
Wix, so no headless-browser crawl was needed.

---

## (a) Full old-site inventory

| # | Old URL | Title tag | Content found |
|---|---------|-----------|---------------|
| 1 | `/` | Handmade Soap \| NaturallyU \| The Hague | Hero (intro text + soaps photo + CTA button), "Our Story", 3-photo gallery, "OUR YES's & NO's" (4 titled paragraphs), disclaimer, footer (email, ©) |
| 2 | `/about-2` | About \| NaturallyU | Founder story (3 sections + 2 photos), "How was NaturallyU born?", "How do I make my products?", "NaturallyU's vision", "What's Next???", "Soap-Making Workshops" (+1 photo), contact section (address / email / phone + form), disclaimer |
| 3 | `/blog` | Blog \| NaturallyU | **Testimonials page** (nav labels it "Testimonials"): heading + 6 customer quotes; 7 decorative stock photos; RSS feed confirms zero real blog posts |
| 4 | `/products` | Products \| NaturallyU | Grid of all 13 products (no unique copy) |
| 5 | `/shop` | Shop \| NaturallyU | Paginated grid of the same 13 products (no unique copy) |
| 6 | Cart (`cart-page`) | — | Functional Wix store cart, no content |
| 7–19 | `/product-page/<slug>` ×13 | per product | Name, price (EUR), description, 1–4 photos, stock status |

Site-wide: nav (Home / About / Products / Testimonials / More→Shop), social links
(Facebook `facebook.com/naturallyu.nl`, Instagram `instagram.com/naturallyu2018`),
footer email `NaturallyUIndia@gmail.com`, copyright "©2021 by NaturallyU. Proudly
created with Wix.com", per-page disclaimer paragraph, site logo image.

Dutch `?lang=nl` variants exist for every page (Wix multilingual). Per confirmed
decision, only the **English** content was migrated.

## (b) Mapping: old URL → new destination

| Old source | New destination |
|------------|-----------------|
| `/` hero (text, photo, CTA) | `home` Page → `richText` block `home-old-hero` (CTA rewritten `/products` → `/shop`) |
| `/` "Our Story" | `home` Page → `richText` block `home-our-story` |
| `/` 3-photo strip | `home` Page → `imageGallery` block `home-gallery` |
| `/` "OUR YES's & NO's" + 4 items | `home` Page → 5 `richText` blocks |
| `/` disclaimer | `home` Page → `richText` block `home-disclaimer` (last block) |
| `/` meta description | `home` Page `metaDescription` (verbatim) |
| `/blog` 6 testimonials | `home` Page → existing `testimonial` block (per confirmed decision #3). Quotes + author names verbatim. The page's 7 photos render as an `imageGallery` block beside the testimonial section (owner decision). |
| `/about-2` (all 8 sections + disclaimer) | New CMS Page **`about-2`** (9 `richText` blocks, published, meta description verbatim) — public at **`/about-2`** via the generic CMS route added after review (see below) |
| `/about-2` contact details | Address/email/phone verbatim inside the `about-contact` block; site-wide email/phone also → `Settings.footer.connect` |
| `/products`, `/shop` grids | Not migrated as pages (per confirmed decision #2) — served by the structural `/shop` page from Product documents |
| 13 `/product-page/*` | `Product` documents (upserted by identical slug): **names + descriptions set to verbatim old text**; prices/stock already matched; images already in `client/public/assets/products/` |
| Nav, social, footer email, logo | `Settings`: `footer.connect.email/phone/social`, `logoUrl: /media/logo.jpg`. Header/nav is structural (hardcoded) — old nav mapping: Home→`/`, About→`/about-the-maker` (structural retelling), Products→`/shop`, Testimonials→home testimonial section |
| Cart | Nothing to migrate (new site has its own cart) |

Old-site merchandising had no categories or "bestseller" labels; the existing
tags (`soap`, `skincare`, `haircare`, `accessory`, `bestseller`) from the earlier
catalog migration were kept (decision #5).

## (c) New block types created

Only two, both from the documented 4-step pattern, styled exclusively with
`client/src/styles/base/variables.css` tokens; no existing component, stylesheet,
or layout was modified:

1. **`richText`** (`RichTextBlock`) — `{ heading?, body?, image?, imageAlt?, ctaLabel?, ctaLink? }`.
   Needed because no existing block renders multi-paragraph prose, and the designed
   Hero/GiftBanner/Testimonial blocks render *fixed bundled brand imagery* (they
   ignore their `image` prop), so migrated sections' original photos couldn't ride
   on them.
2. **`imageGallery`** (`ImageGalleryBlock`) — `{ images: [{ url, alt }] }`.
   Needed for the old home page's 3-photo strip (no existing block renders a
   CMS-sourced image grid).

One owner-approved follow-up after the needs-review pass (outside the original
"no structural changes" constraint, at the owner's direction): a generic CMS page
route — `CmsPage.jsx` + `<Route path="/:slug">` registered just before the 404
catch-all in `AppRoutes.jsx` — so any published CMS Page (e.g. `/about-2`) is
publicly reachable. Static storefront routes and `/admin` rank higher in
react-router matching and are not shadowed; unknown slugs still render the 404
page.

## (d) Images downloaded

15 files → `client/public/media/` (full-resolution originals via Wix CDN `/v1/`
truncation). **0 failures.**

| File | Source (old site) |
|------|-------------------|
| `home-hero-soaps.jpg` | home hero (`soap1.jpg`) |
| `home-gallery-1..3.jpg` | home photo strip |
| `logo.jpg` | site logo (`logo_jpg (1)_edited.jpg`) → `Settings.logoUrl` |
| `about-deepti.jpg` | about founder photo (`IMG_4204.jpg`) |
| `about-deepti-yoga.jpg` | about second photo |
| `about-workshop.jpg` | workshops section (`Workshop_edited.jpg`) |
| `testimonials-photo.jpg` + 6 decor images | `/blog` page (stock decor: Branch, Orange Flower, Herb Infused Oils, Homemade Skin Care, Natural Herbs + 1 untitled). 6 of the 7 are now the per-review card images in the home testimonial carousel (see post-migration changes below); `testimonials-decor-1.jpg` is the unused 7th. Downscaled to ≤1600px wide for page weight (~24 MB → ~1.9 MB); originals remain on Wix's CDN at the recorded source URLs |

The 13 products' 27 photos were already present in
`client/public/assets/products/` from the earlier catalog migration and are
referenced by the Product documents; they were verified against the old site's
media lists and left untouched.

> **Production note:** `/media/*` (and `/assets/products/*`) files are served from
> the frontend bundle. Before production they should be re-uploaded to S3 via the
> admin media endpoint and the URLs updated (the Render backend has no persistent
> disk for `client/public`).

## (e) Rewritten and dead links

Rewritten (old → new):
- `/products` (home CTA "EXPLORE OUR STUNNING LINE OF PRODUCTS!") → `/shop`
- Old nav "Testimonials" → `/blog` → home page testimonial section
- `mailto:NaturallyUIndia@gmail.com` → now in `Settings.footer.connect.email`

Dead/unresolvable links: **none found** — every internal link on the old site
resolves to a page in the inventory.

## (f) Needs review — resolutions (reviewed with the owner, 2026-07-13)

1. **`about-2` page routing — RESOLVED: made public.** A generic CMS page route
   (`CmsPage.jsx`, `/:slug` before the 404 catch-all) was added at the owner's
   direction; `/about-2` now renders publicly. The structural `/about-the-maker`
   page still carries the designed retelling.
2. **Home testimonial placeholder — RESOLVED: keep only the 6 real quotes.** The
   seeded "Priya S., Verified Buyer" demo quote stays removed.
3. **Product name casing — RESOLVED: keep verbatim old-site names** (e.g. "Minty
   Lip balm", "Lotion bar", "Coconut shell carved soap dish").
4. **Testimonials-page photos — RESOLVED: display them.** Now used as the
   per-review images inside the home testimonial carousel (one photo per review),
   downscaled to web size. (Superseded the earlier standalone gallery — see
   post-migration changes below.)
5. **`soap-keeping-box` description:** old site has none (empty on Wix); the
   Product model requires a description, so the existing authored text stays.
6. **Copyright — RESOLVED: keep** "© 2026 NaturallyU. All rights reserved." The
   old "©2021 by NaturallyU. Proudly created with Wix.com" line is recorded here
   only.
7. **Tribal Indian Hair Oil product video — RESOLVED: skipped** (owner decision).
   Source reference: Wix media `17944492874041207.mp4`, 720×1280, poster frame id
   `720cf4_60907efd012249fc8562440a548094faf002`.
8. **Contact emails — RESOLVED: keep both, as placed.** Site-wide/footer:
   `NaturallyUIndia@gmail.com` (Settings); About page text keeps
   `naturallyu@gmail.com` verbatim. The contact *form* lives on the structural
   `/contact` page.
9. **Enrichments kept:** existing `ingredients`, `tags`, `shortDescription`,
   `stock` values on products (authored during the earlier catalog migration)
   were kept — the old site had no separate ingredients/tag data. Old-site
   out-of-stock status (Minty Lip balm, Strawberry Lip Balm, Uptan Soap) already
   matched `stock: 0`.
10. **Dutch (`?lang=nl`) content not migrated** (no i18n in the new site), per
    decision #1.
11. **Admin Media-Gallery Archive — SEEDED (2026-07-14); bucket left private.**
    After the owner added AWS credentials, the 4 imageless `ArchivePage` docs
    (left behind by the original credential-less run, verified byte-identical to
    the seeder manifest before removal) were dropped and `npm run seed:archive`
    re-run cleanly: 4 pages, 32 sections, 16 images uploaded to S3 with zero
    failures. **Caveat:** the bucket (`voice-nl-media`) has Block Public Access
    enabled, so the stored S3 URLs return 403 — archive images (and any future
    admin Media-Library upload) won't display until public read is allowed. The
    owner chose to leave it private for now. To enable later: disable "Block all
    public access" on the bucket and attach a bucket policy allowing
    `s3:GetObject` for `arn:aws:s3:::voice-nl-media/archive/*` and
    `arn:aws:s3:::voice-nl-media/uploads/*`.

## Verification performed

- `npm run migrate:content` run twice — second run produced identical results
  (16 home blocks, no duplicates; block `_id`s preserved).
- Every migrated block passes its server-side schema validator (validated in-script
  before save).
- Headless-browser (Playwright/Chromium) render of `/`: all 9 content checks pass
  (old hero, Our Story, gallery ×3, YES/NO's, 6 testimonial dots, CTA, disclaimer);
  no page errors; only pre-existing console noise (React-Router future-flag
  warnings, anonymous `/auth/me` 401).
- Render of `/shop/uptan`: verbatim multi-paragraph description displays, no errors.
- `GET /api/pages/home`, `/api/pages/about-2`, `/api/settings`, `/api/products`
  all return the migrated data.

After the needs-review resolutions:
- `/about-2` renders via the new CMS route: all 9 sections, 3 photos, contact
  details and disclaimer present; screenshot inspected.
- Unknown slugs (e.g. `/no-such-page-xyz`) still show the 404 page.
- Home page: both galleries render and every gallery image loads
  (10/10 `naturalWidth > 0` after scroll; the testimonials gallery sits directly
  after the testimonial/newsletter row).
- Re-run of `npm run migrate:content` after the manifest change stayed idempotent:
  17 home blocks, existing blocks updated in place, no duplicates.

## Post-migration home-page design changes (2026-07-14)

Requested after the migration; all use existing design tokens only, and the
migration remains idempotent (16 home blocks now — the standalone testimonials
gallery was removed).

- **Site-wide search.** Header search now targets `/search?q=` instead of
  `/shop?search=`. New backend `GET /api/search` (`search.controller.js`) returns
  matching products **and** published CMS pages (with a match snippet); new
  `SearchPage.jsx` renders both. Header nav "About the Maker" → "About".
- **Styled block variants.** `RichTextBlock` and `ImageGalleryBlock` gained an
  optional `variant` prop (default = the plain styling interior pages like
  `/about-2` still use). Home sections now set: `feature` (Nature's Superfoods,
  framed image + eyebrow), `story` (Our Story, centered + leaf divider),
  `section-title` (YES/NO heading), `pledge` (the four YES/NO promise cards with
  green/gold tone badges), `disclaimer` (dashed fine-print note), and `story` on
  the Our Story gallery (editorial collage).
- **Our Story gallery 3 → 6 images.** The old site's Our Story strip only ever had
  3 photos (confirmed against the live site + a headless render). Enriched to 6
  using the authentic old-site founder/workshop photos from `/about-2`
  (`about-deepti`, `about-deepti-yoga`, `about-workshop`) — flagged as an
  enrichment, not original placement.
- **Testimonials reworked.** The testimonial carousel card is now a fixed height
  (consistent across all 6 reviews; long quotes scroll), and each review shows its
  own old-site photo instead of one shared image. This replaced the standalone
  `home-testimonials-gallery` block, which was removed.
- **Testimonials above newsletter.** The former side-by-side testimonial+newsletter
  pairing in `PageRenderer` was removed; the two now stack full-width (testimonial
  on top, "Start Your Natural Routine" below).
