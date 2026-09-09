# SOS Evakuators — homepage concept

Interactive homepage redesign concept for SOS Evakuators / TK Trans in Daugavpils (autopalidziba.lv).

The concept uses only public business information and photography published on the official website. It is an independent design demonstration, not the official production website.

## Pages

```
/                        LV homepage (canonical LV entry point, existing URL — kept)
/ru/  /en/               RU / EN homepages
/autoevakuators/         Autoevakuators          (+ /ru/avtoevakuator/,  /en/tow-truck/)
/kravas-evakuators/      Kravas evakuators       (+ /ru/gruzovoj-evakuator/, /en/heavy-towing/)
/palidziba-uz-cela/      Palīdzība uz ceļa       (+ /ru/pomosh-na-doroge/, /en/roadside-assistance/)
/auto-izvilkshana/       Auto izvilkšana         (+ /ru/vytyagivanie-avto/, /en/vehicle-recovery/)
/evakuators-latgale/     Evakuators Latgalē      (+ /ru/evakuator-latgaliya/, /en/tow-truck-latgale/)
citi-pakalpojumi/ …      isolated additional-services section (unchanged URLs, LV only)
sitemap.xml, robots.txt, 404.html
```

Every page has self-canonical, an lv/ru/en/x-default hreflang cluster and a language switcher that
opens the equivalent page in the other language. All in-page links are relative, so the same HTML
works on any domain.

## Build

Pages are generated from `scripts/site-content.mjs` (all trilingual copy) by `scripts/build-site.mjs`:

```bash
node scripts/build-site.mjs               # concept build: GitHub Pages base, noindex,nofollow
node scripts/build-site.mjs --production  # final domain: https://autopalidziba.lv, index,follow
```

The committed files are the **concept build**. Before going live on the final domain: run the
production build, commit the result, remove the concept note from the footer copy in
`scripts/site-content.mjs` if desired, and point Search Console at `autopalidziba.lv/sitemap.xml`.
Never point canonicals at production URLs while the site is still served on GitHub Pages — that is
why the two builds are separate commands.

## Local preview

```bash
npm start        # http://127.0.0.1:4174/
```

## Call dock (mobile bottom bar)

`app.js` shows the fixed call/location bar only when the page's main call button
(`[data-dock-watch]`) has been scrolled past (IntersectionObserver + header-height rootMargin +
scroll guard). On pages without a top CTA (the isolated additional-services pages) the bar is always
visible. Colours are intentional: yellow = call, red = location.

## Additional services

The additional-service area is intentionally isolated from the towing homepage:

- `citi-pakalpojumi/` is the directory page;
- every service has its own folder and `index.html`;
- `additional-services.css` and `additional-services.js` are shared only by these pages.

Do not publish prices, contacts, claims, or images there until the client has confirmed them.

## Analytics (prepared, disabled)

`assets/js/analytics.js` is a self-contained layer that pushes privacy-safe events
(`call_click`, `whatsapp_open`, `sms_open`, `geolocation_start`, `geolocation_success`,
`request_prepared`) into `window.dataLayer`. Nothing is sent to Google yet. To enable GA4/Ads the
owner must provide real IDs (`G-…`, `AW-…` + conversion labels), decide on a consent banner
(Consent Mode v2 defaults are denied), and extend each page's Content-Security-Policy with
`https://www.googletagmanager.com` — exact steps are documented in the header of that file.
No personal data (names, phone numbers, issue texts, coordinates, photos) is ever tracked.

## Google Business Profile

The concept links the existing profile review form (`g.page/r/CQ1F6-eN5ajgEAE/review`, place id
`ChIJ7-Ug3hGVwkYRDUXr543lqOA`). Schema.org markup deliberately contains **no** address or
coordinates: the client has not confirmed a customer-facing address yet.

## Content management

The production host includes a private `/admin/` panel. It keeps the public site static and fast:
edits are saved as a draft, rendered from protected baseline copies and written to the public HTML
only after an explicit publish action. The editor supports SEO fields, page text, image/ALT
replacement, global phone/e-mail changes, reusable content blocks, media uploads, preview and
revision restore. Runtime data and credentials live in `admin/storage/` and are intentionally not
committed.
