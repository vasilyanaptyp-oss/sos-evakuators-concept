// Static site generator for the SOS Evakuators concept.
//   node scripts/build-site.mjs               -> concept build (GitHub Pages, noindex)
//   node scripts/build-site.mjs --production  -> final-domain build (indexable, autopalidziba.lv)
// Output is plain static HTML committed to the repo; GitHub Pages serves it as-is.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { LANGS, LANG_META, SERVICES, T, BUSINESS, SERVICE_OG } from "./site-content.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS_V = "20260909-new-services-gallery";
const CONCEPT_BASE = "https://vasilyanaptyp-oss.github.io/sos-evakuators-concept";
const PRODUCTION_BASE = "https://autopalidziba.lv";
const CONCEPT_ROBOTS = "noindex, nofollow";
const PRODUCTION_ROBOTS = "index, follow";
const LASTMOD = "2026-09-09";
const MENU_OPEN = { lv: "Atvērt izvēlni", ru: "Открыть меню", en: "Open menu" };
const ADDITIONAL_SERVICES_DIR = {
  lv: ["citi-pakalpojumi"],
  ru: ["ru", "drugie-uslugi"],
  en: ["en", "other-services"]
};

const production = process.argv.includes("--production");
const BASE = production ? PRODUCTION_BASE : CONCEPT_BASE;
const ROBOTS = production ? PRODUCTION_ROBOTS : CONCEPT_ROBOTS;

const esc = (value) => String(value)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const escLoose = (value) => String(value).replace(/&(?!(amp|lt|gt|quot|#\d+|shy);)/g, "&amp;");

// Absolute URL of a page: page is "home" or a service key.
const langUrl = (lang, page) => {
  const prefix = LANG_META[lang].prefix;
  if (page === "home") return `${BASE}/${prefix}`;
  const slug = SERVICES.find((s) => s.key === page).slug[lang];
  return `${BASE}/${prefix}${slug}/`;
};

// Directory segments of a page relative to the site root.
const dirOf = (lang, page) => {
  const hasPrefix = Boolean(LANG_META[lang].prefix);
  if (page === "home") return hasPrefix ? [lang] : [];
  return [...(hasPrefix ? [lang] : []), SERVICES.find((s) => s.key === page).slug[lang]];
};

// Relative path from one directory to another, e.g. rel(["ru","auto"],"") === "../../".
const rel = (from, to) => {
  let common = 0;
  while (common < from.length && common < to.length && from[common] === to[common]) common += 1;
  return "../".repeat(from.length - common) + to.slice(common).join("/") + (to.slice(common).length ? "/" : "");
};

const PHONE_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8c1.5 3 3.8 5.3 6.8 6.8l2.3-2.3c.3-.3.8-.4 1.2-.2 1.3.4 2.6.7 4.1.7.6 0 1 .4 1 1V21c0 .6-.4 1-1 1C10.5 22 2 13.5 2 3c0-.6.4-1 1-1h4.2c.6 0 1 .4 1 1 0 1.4.2 2.8.7 4.1.1.4 0 .9-.2 1.2l-2.1 2.5Z"/></svg>`;
const PIN_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-5.7 7-13a7 7 0 1 0-14 0c0 7.3 7 13 7 13Z"/><circle cx="12" cy="9" r="2.4"/></svg>`;
const BRAND_MARK = `<svg viewBox="0 0 44 44" role="img" aria-hidden="true"><path d="M7 25h5l3-8h13l6 8h3v8h-4a5 5 0 0 1-10 0h-7a5 5 0 0 1-10 0H4v-5a3 3 0 0 1 3-3Z"/><circle cx="11" cy="33" r="2.7"/><circle cx="28" cy="33" r="2.7"/><path d="m17 17 3 8h11"/></svg>`;

/* ── Structured data ── */
const areaServed = [
  { "@type": "City", name: "Daugavpils" },
  { "@type": "AdministrativeArea", name: "Latgale" },
  { "@type": "Country", name: "Latvia" }
];

const businessSchema = (withRating) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${BASE}/#sos-evakuators`,
  name: BUSINESS.name,
  alternateName: BUSINESS.alternateName,
  url: `${BASE}/`,
  telephone: BUSINESS.phone,
  email: BUSINESS.email,
  image: `${BASE}/assets/images/fleet-01-1200.webp`,
  logo: `${BASE}/assets/images/logo.svg`,
  priceRange: "€€",
  sameAs: BUSINESS.sameAs,
  openingHoursSpecification: [{
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59"
  }],
  areaServed,
  ...(withRating ? {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: BUSINESS.rating.value,
      bestRating: "5",
      ratingCount: BUSINESS.rating.count
    }
  } : {})
});

const webPageSchema = (name, pageCanonical, lang) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name,
  url: pageCanonical,
  inLanguage: lang
});

const serviceSchema = (lang, key, name, description, pageCanonical) => {
  const t = T[lang].servicesPages[key];
  const confirmedPrice = key === "auto" ? 30 : key === "kravas" ? 150 : null;
  const price = t.sections.price;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    serviceType: t.breadcrumb,
    url: pageCanonical,
    description,
    provider: { "@id": `${BASE}/#sos-evakuators` },
    areaServed,
    ...(confirmedPrice ? {
      offers: {
        "@type": "Offer",
        priceCurrency: "EUR",
        priceSpecification: { "@type": "PriceSpecification", priceCurrency: "EUR", minPrice: confirmedPrice },
        description: `${price.from ? price.from + " " : ""}${price.price}, ${price.per}`.trim()
      }
    } : {})
  };
};

const breadcrumbSchema = (lang, key, name) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: BUSINESS.name, item: langUrl(lang, "home") },
    { "@type": "ListItem", position: 2, name, item: langUrl(lang, key) }
  ]
});

const schemaTag = (object) => `<script type="application/ld+json">${JSON.stringify(object).replace(/</g, "\\u003c")}</script>`;

/* ── Shared chrome ── */
function head({ lang, title, description, page, ogTitle, ogDescription, ogImage, schemas, dirSegments }) {
  const canonical = langUrl(lang, page);
  const alternates = LANGS.map((l) => `<link rel="alternate" hreflang="${LANG_META[l].hreflang}" href="${langUrl(l, page)}">`).join("\n  ");
  const xDefault = `<link rel="alternate" hreflang="x-default" href="${langUrl("lv", page)}">`;
  const ogAlternates = LANGS.filter((l) => l !== lang).map((l) => `<meta property="og:locale:alternate" content="${LANG_META[l].ogLocale}">`).join("\n  ");
  const assetPrefix = rel(dirSegments, []);
  return `  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#0d0f11">
  <meta name="robots" content="${ROBOTS}">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self' mailto:; upgrade-insecure-requests">
  <meta name="description" content="${esc(description)}">
  <meta property="og:title" content="${esc(ogTitle)}">
  <meta property="og:description" content="${esc(ogDescription)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${BASE}/${ogImage.replace(/^\.\//, "")}">
  <meta property="og:locale" content="${LANG_META[lang].ogLocale}">
  ${ogAlternates}
  <title>${esc(title)}</title>
  <link rel="canonical" href="${canonical}">
  ${alternates}
  ${xDefault}
  <link rel="icon" href="${assetPrefix}assets/images/logo.svg" type="image/svg+xml">
  <link rel="preload" href="${assetPrefix}assets/vendor/geist-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${assetPrefix}styles.css?v=${ASSETS_V}">
${schemas.map(schemaTag).join("\n")}`;
}

function header(lang, page, dirSegments) {
  const t = T[lang];
  const homeHref = page === "home"
    ? "#sakums"
    : rel(dirSegments, dirOf(lang, "home"));
  const anchor = (hash) => (page === "home" ? `#${hash}` : `${rel(dirSegments, dirOf(lang, "home"))}#${hash}`);
  const citiHref = rel(dirSegments, ADDITIONAL_SERVICES_DIR[lang]);
  const assetPrefix = rel(dirSegments, []);
  const langLinks = LANGS.map((l) => {
    const current = l === lang;
    return `<a href="${rel(dirSegments, dirOf(l, page))}" lang="${l}" hreflang="${l}"${current ? ' aria-current="true"' : ""}>${l.toUpperCase()}</a>`;
  }).join("");
  const navLinks = page === "home"
    ? `<a href="${anchor("pakalpojumi")}">${esc(t.nav.pakalpojumi)}</a>
      <a href="${anchor("platforma")}">${esc(t.nav.transports)}</a>
      <a href="${anchor("cenas")}">${esc(t.nav.cenas)}</a>
      <a href="${anchor("darbi")}">${esc(t.nav.galerija)}</a>
      <a href="${citiHref}">${esc(t.nav.citi)}</a>
      <a href="${anchor("kontakti")}">${esc(t.nav.kontakti)}</a>`
    : `<a href="${anchor("pakalpojumi")}">${esc(t.nav.pakalpojumi)}</a>
      <a href="${anchor("cenas")}">${esc(t.nav.cenas)}</a>
      <a href="${anchor("darbi")}">${esc(t.nav.galerija)}</a>
      <a href="${citiHref}">${esc(t.nav.citi)}</a>
      <a href="${anchor("kontakti")}">${esc(t.nav.kontakti)}</a>`;
  return `  <header class="site-header" data-header>
    <a class="brand" href="${homeHref}" aria-label="${esc(t.brandAria)}">
      <span class="brand-mark" aria-hidden="true">${BRAND_MARK}</span>
      <span>AUTO<span>PALĪDZĪBA</span>.LV</span>
    </a>

    <nav class="desktop-nav" aria-label="${esc(t.navAria)}">
      ${navLinks}
    </nav>

    <div class="header-actions">
      <span class="availability"><i></i> ${t.availabilityChip}</span>
      <div class="lang-switch" aria-label="${esc(t.langAria)}">${langLinks}</div>
      <a class="header-call magnetic call-rattle" href="tel:${BUSINESS.phone}">
        <span class="call-icon" aria-hidden="true">${PHONE_SVG}</span>
        <span><small>${esc(t.headerCallSmall)}</small>${BUSINESS.phoneDisplay}</span>
      </a>
      <button class="menu-toggle" type="button" aria-label="${esc(MENU_OPEN[lang])}" aria-expanded="false" aria-controls="mobile-menu">
        <span></span><span></span>
      </button>
    </div>
  </header>`;
}

function mobileMenu(lang, page, dirSegments) {
  const t = T[lang];
  const anchor = (hash) => (page === "home" ? `#${hash}` : `${rel(dirSegments, dirOf(lang, "home"))}#${hash}`);
  const citiHref = rel(dirSegments, ADDITIONAL_SERVICES_DIR[lang]);
  const serviceLink = (key, label) => {
    const href = page === key ? undefined : rel(dirSegments, dirOf(lang, key));
    return `<a${href ? ` href="${href}"` : ' aria-current="page"'}>${esc(label)}</a>`;
  };
  return `  <div class="mobile-menu" id="mobile-menu" aria-hidden="true" inert>
    <nav aria-label="${esc(t.mobileNavAria)}">
      ${page === "home"
        ? `<a href="${anchor("pakalpojumi")}">${esc(t.nav.pakalpojumi)}</a>
      <a href="${anchor("platforma")}">${esc(t.nav.transports)}</a>
      <a href="${anchor("cenas")}">${esc(t.nav.cenas)}</a>
      <a href="${anchor("darbi")}">${esc(t.nav.galerija)}</a>
      <a href="${citiHref}">${esc(t.nav.citi)}</a>
      <a href="${anchor("kontakti")}">${esc(t.nav.kontakti)}</a>`
        : `<a href="${anchor("pakalpojumi")}">${esc(t.nav.pakalpojumi)}</a>
      <a href="${anchor("cenas")}">${esc(t.nav.cenas)}</a>
      <a href="${anchor("darbi")}">${esc(t.nav.galerija)}</a>
      <a href="${anchor("kontakti")}">${esc(t.nav.kontakti)}</a>`}
    </nav>
    <p class="mobile-menu-label" id="mobile-services-label">${esc(t.servicesMenuAria)}</p>
    <nav class="mobile-menu-services" aria-labelledby="mobile-services-label">
      ${SERVICES.map((s) => serviceLink(s.key, T[lang].servicesPages[s.key].breadcrumb)).join("\n      ")}
    </nav>
    <div class="mobile-menu-phones" aria-label="${esc(t.phonesAria)}">
      <a class="mobile-menu-call" href="tel:${BUSINESS.phone}"><small>${esc(t.mainPhoneSmall)}</small>${BUSINESS.phoneDisplay}</a>
      <a class="mobile-menu-call mobile-menu-call--secondary" href="tel:${BUSINESS.phoneSecondary}"><small>${esc(t.secondPhoneSmall)}</small>${BUSINESS.phoneSecondaryDisplay}</a>
    </div>
  </div>`;
}

function footer(lang, page, dirSegments) {
  const t = T[lang];
  const homeHref = page === "home" ? "#sakums" : rel(dirSegments, dirOf(lang, "home"));
  const privacyHref = page === "home" && dirSegments.length === 0
    ? "https://autopalidziba.lv/lv/privatuma-politika"
    : "https://autopalidziba.lv/lv/privatuma-politika";
  return `  <footer class="site-footer">
    <div class="footer-top">
      <a class="brand brand--footer" href="${homeHref}"><span>AUTO<span>PALĪDZĪBA</span>.LV</span></a>
      <p>${esc(t.footer.tagline)}</p>
      <div class="footer-phones" aria-label="${esc(t.phonesAria)}">
        <a href="tel:${BUSINESS.phone}">${BUSINESS.phoneDisplay}</a>
        <a href="tel:${BUSINESS.phoneSecondary}">${BUSINESS.phoneSecondaryDisplay}</a>
      </div>
    </div>
    <div class="footer-bottom">
      <a href="mailto:${BUSINESS.email}">${BUSINESS.email}</a>
      <a href="${privacyHref}" rel="noopener">${esc(t.footer.privacy)}</a>
      <span>${esc(t.footer.copyright)}</span>
    </div>
  </footer>`;
}

function dock(lang) {
  const t = T[lang];
  return `  <div class="mobile-dock" aria-label="${esc(t.dock.dockAria)}">
    <a class="dock-call call-rattle" href="tel:${BUSINESS.phone}">${PHONE_SVG} ${esc(t.dock.call)}</a>
    <button type="button" data-location-trigger title="${esc(t.dock.location)}"><span aria-hidden="true">⌖</span> ${esc(t.dock.location)}</button>
  </div>`;
}

function locationSheet(lang) {
  const t = T[lang].sheet;
  return `  <div class="location-sheet" id="location-sheet" aria-hidden="true" inert>
    <button class="sheet-backdrop" type="button" aria-label="${esc(t.backdrop)}" data-close-location></button>
    <div class="sheet-panel" role="dialog" aria-modal="true" aria-labelledby="location-title">
      <button class="sheet-close" type="button" aria-label="${esc(t.close)}" data-close-location>×</button>
      <p class="eyebrow"><span></span>${esc(t.eyebrow)}</p>
      <h2 id="location-title">${esc(t.title)}</h2>
      <p>${esc(t.text)}</p>
      <button class="primary-cta" type="button" id="share-location">${esc(t.button)}</button>
      <a class="sheet-fallback" href="tel:${BUSINESS.phone}">${esc(t.fallback)}</a>
      <p class="location-status" aria-live="polite"></p>
    </div>
  </div>`;
}

const scripts = (lang, dirSegments) => {
  const assetPrefix = rel(dirSegments, []);
  return `  <script src="${assetPrefix}assets/js/analytics.js?v=${ASSETS_V}" defer></script>
  <script src="${assetPrefix}app.js?v=${ASSETS_V}" data-base="${assetPrefix}"></script>`;
};

/* ── Home page ── */
function homePage(lang) {
  const t = T[lang];
  const h = t.home;
  const dirSegments = dirOf(lang, "home");
  const assetPrefix = rel(dirSegments, []);
  const requestHref = "#request-form";
  const serviceHref = (key) => rel(dirSegments, dirOf(lang, key));

  const marqueeItems = [...h.marquee, ...h.marquee];
  const marqueeHtml = marqueeItems.map((item, i) => `<span${i >= h.marquee.length ? ' aria-hidden="true"' : ""}>${esc(item)}</span><i${i >= h.marquee.length ? ' aria-hidden="true"' : ""}></i>`).join("");

  const galleryImages = [
    { img: "client-auto-audi", width: 1200, height: 1200 },
    { img: "client-kravas-heavy", width: 1200, height: 1200 },
    { img: "client-treiler-lift", width: 1200, height: 1200 },
    { img: "client-roadside-wheel", width: 1200, height: 1600 },
    { img: "client-manipulator-01", width: 640, height: 605 },
    { img: "client-manipulator-03", width: 640, height: 605 }
  ];
  const galleryPanels = h.work.tabs.map((tab, i) => {
    const g = galleryImages[i];
    const srcset = [640, 800, 1200].map((s) => `${assetPrefix}assets/images/${g.img}-${s}.webp ${s}w`).join(", ");
    return `        <figure class="gallery-panel" id="gallery-panel-${i}" role="tabpanel" aria-labelledby="gallery-tab-${i}" data-gallery-panel="${i}"${i > 0 ? " hidden" : ""}>
          <img src="${assetPrefix}assets/images/${g.img}-1200.webp" srcset="${srcset}" sizes="94vw" width="${g.width}" height="${g.height}" alt="${esc(h.work.alts[i])}" loading="lazy" decoding="async">
          <figcaption>${esc(tab)}</figcaption>
        </figure>`;
  }).join("\n");
  const galleryTabs = h.work.tabs.map((tab, i) => `        <button class="gallery-tab${i === 0 ? " is-active" : ""}" id="gallery-tab-${i}" type="button" role="tab" aria-selected="${i === 0}" aria-controls="gallery-panel-${i}" tabindex="${i === 0 ? "0" : "-1"}" data-gallery-tab="${i}">${esc(tab)}</button>`).join("\n");

  const serviceCardImages = [
    { img: "service-auto", cls: "auto", no: "A", sizes: [480, 720, 960], w: 960, hh: 1280 },
    { img: "service-truck", cls: "truck", no: "B", sizes: [480, 720, 960], w: 960, hh: 1280 },
    { img: "service-trailer", cls: "trailer", no: "C", sizes: [480, 720, 960], w: 960, hh: 1280 },
    { img: "service-roadside", cls: "roadside", no: "D", sizes: [480, 720, 960], w: 960, hh: 1280 }
  ];
  const serviceCards = h.services.cards.map((card, i) => {
    const meta = serviceCardImages[i];
    const href = card.link ? serviceHref(card.link) : requestHref;
    const srcset = meta.sizes.map((s) => `${assetPrefix}assets/images/${meta.img}-${s}.webp ${s}w`).join(", ");
    const largest = meta.sizes.at(-1);
    return `        <article class="service-card service-card--photo service-card--${meta.cls}">
          <img src="${assetPrefix}assets/images/${meta.img}-${largest}.webp" srcset="${srcset}" sizes="(max-width: 820px) 100vw, 55vw" width="${meta.w}" height="${meta.hh}" alt="${esc(card.alt)}" loading="lazy" decoding="async">
          <div class="photo-shade"></div>
          <div class="card-no">${meta.no}</div>
          <div class="service-card-copy">
            <h3>${esc(card.h3)}</h3>
            <p>${esc(card.p)}</p>
            <a href="${href}">${card.link ? esc(h.services.request) : esc(h.services.request)} <span aria-hidden="true">↘</span></a>
          </div>
        </article>`;
  }).join("\n");

  const reviewCards = h.reviews.cards.map((card) => `        <article class="review-card">
          <div class="review-card-head"><span class="review-initial" aria-hidden="true">${esc(card.name.charAt(0))}</span><div><strong>${esc(card.name)}</strong><span>${esc(card.when)}</span></div></div>
          <div class="review-stars" aria-label="${esc(h.reviews.stars)}">★★★★★</div>
          <blockquote lang="ru">${esc(card.text)}</blockquote>
        </article>`).join("\n");

  const form = h.contact.form;
  const issueOptions = form.issues.map((issue) => `          <option>${esc(issue)}</option>`).join("\n");
  const heroMapAsset = `hero-map-${lang}`;

  return `<!doctype html>
<html lang="${lang}">
<head>
${head({
    lang,
    title: h.title,
    description: h.description,
    page: "home",
    ogTitle: h.ogTitle,
    ogDescription: h.ogDescription,
    ogImage: BUSINESS.defaultOgImage,
    dirSegments,
    schemas: [
      businessSchema(true),
      webPageSchema(h.ogTitle, langUrl(lang, "home"), lang)
    ]
  })}
</head>
<body>
  <a class="skip-link" href="#saturs">${esc(t.skip)}</a>
  <div class="scroll-progress" aria-hidden="true"><span></span></div>

${header(lang, "home", dirSegments)}

${mobileMenu(lang, "home", dirSegments)}

  <main id="saturs">
    <section class="hero" id="sakums" aria-labelledby="hero-title">
      <span class="header-sentinel" aria-hidden="true"></span>

      <div class="hero-grid">
        <div class="hero-copy">
          <p class="eyebrow reveal-item"><span></span>${esc(t.hero.eyebrow)}</p>
          <h1 id="hero-title">
            <span class="hero-line hero-line--accent"><span>${esc(t.hero.h1a)}</span></span>
            <span class="hero-line"><span>${esc(t.hero.h1b)}</span></span>
          </h1>
          <p class="hero-tagline reveal-item"><span class="accent">${esc(t.hero.taglineAccent)}</span>${esc(t.hero.taglineRest)}</p>
          <figure class="hero-map reveal-item">
            <img src="${assetPrefix}assets/images/${heroMapAsset}-1280.webp" srcset="${assetPrefix}assets/images/${heroMapAsset}-640.webp 640w, ${assetPrefix}assets/images/${heroMapAsset}-1280.webp 1280w" sizes="(max-width: 820px) 100vw, 1px" width="1280" height="720" alt="${esc(t.hero.mapAlt)}" loading="lazy" decoding="async">
          </figure>
        </div>
        <div class="hero-cta-row reveal-item">
          <p class="hero-cta-hint">${esc(t.hero.ctaHint)}</p>
          <a class="primary-cta primary-cta--big magnetic call-attention call-rattle" href="tel:${BUSINESS.phone}" data-dock-watch>
            ${PHONE_SVG.replace("<svg ", '<svg class="phone-nudge" ')}
            <span><small>${esc(t.hero.ctaSmall)}</small><strong>${BUSINESS.phoneDisplay}</strong></span>
          </a>
        </div>
      </div>
      <div class="hero-edge" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
    </section>

    <section class="second-call-strip" aria-label="${esc(t.secondPhoneSmall)}">
      <p><span>${esc(t.hero.secondLine)}</span> <a href="tel:${BUSINESS.phoneSecondary}">${BUSINESS.phoneSecondaryDisplay}</a></p>
    </section>

    <section class="marquee" aria-label="${esc(h.marqueeAria)}">
      <div class="marquee-track">
        ${marqueeHtml}
      </div>
    </section>

    <section class="capability chapter" id="platforma" aria-labelledby="capability-title">
      <div class="capability-grid">
        <div class="capability-copy">
          <p class="eyebrow light"><span></span>${esc(h.capability.eyebrow)}</p>
          <h2 id="capability-title">${h.capability.h2}</h2>
          <p>${esc(h.capability.p)}</p>
          <ul class="capability-list" aria-label="${esc(t.nav.transports)}">
            ${h.capability.list.map((item) => `<li>${esc(item)}</li>`).join("\n            ")}
          </ul>
          <div class="capability-actions">
            <a href="tel:${BUSINESS.phone}" class="primary-cta magnetic call-attention">
              ${PHONE_SVG.replace("<svg ", '<svg class="phone-nudge" ')}
              <span><small>${esc(h.capability.ctaSmall)}</small>${esc(h.capability.ctaText)}</span>
            </a>
            <a class="capability-request" href="${requestHref}">${esc(h.capability.request)} <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <figure class="capability-media capability-media--portrait">
          <picture>
            <source type="image/avif" srcset="${assetPrefix}assets/images/client-collage-capability-v2-640.avif 640w, ${assetPrefix}assets/images/client-collage-capability-v2-800.avif 800w, ${assetPrefix}assets/images/client-collage-capability-v2-1200.avif 1200w" sizes="(max-width: 820px) 90vw, 40vw">
            <img src="${assetPrefix}assets/images/client-collage-capability-v2-1200.webp" srcset="${assetPrefix}assets/images/client-collage-capability-v2-640.webp 640w, ${assetPrefix}assets/images/client-collage-capability-v2-800.webp 800w, ${assetPrefix}assets/images/client-collage-capability-v2-1200.webp 1200w" sizes="(max-width: 820px) 90vw, 40vw" width="1200" height="1599" alt="${esc(h.capability.mediaAlt)}" loading="lazy" decoding="async">
          </picture>
          <figcaption><span>${esc(h.capability.mediaCaption[0])}</span><span>${esc(h.capability.mediaCaption[1])}</span></figcaption>
        </figure>
      </div>
    </section>

    <section class="services chapter" id="pakalpojumi" aria-labelledby="services-title">
      <div class="section-heading">
        <p class="eyebrow"><span></span>${esc(h.services.eyebrow)}</p>
        <h2 id="services-title">${esc(h.services.h2)}</h2>
        <p>${esc(h.services.p)}</p>
      </div>

      <div class="service-grid">
${serviceCards}
      </div>
    </section>

    <section class="process chapter" id="ka-tas-notiek" aria-labelledby="process-title">
      <div class="process-shell">
        <div class="process-intro">
          <p class="eyebrow light"><span></span>${esc(h.process.eyebrow)}</p>
          <h2 id="process-title">${esc(h.process.h2)}</h2>
          <p>${esc(h.process.p)}</p>
          <a href="tel:${BUSINESS.phone}" class="text-link call-text-link">${PHONE_SVG.replace("<svg ", '<svg class="phone-nudge" ')}${esc(h.process.callNow)} <span aria-hidden="true">↗</span></a>
        </div>
        <div class="process-steps">
          ${h.process.steps.map((step, i) => `  <article class="process-step">
            <span class="step-number">0${i + 1}</span>
            <div><h3>${esc(step.h3)}</h3><p>${esc(step.p)}</p></div>
          </article>`).join("\n          ")}
        </div>
      </div>
    </section>

    <section class="pricing chapter" id="cenas" aria-labelledby="pricing-title">
      <div class="pricing-head">
        <p class="eyebrow"><span></span>${esc(h.pricing.eyebrow)}</p>
        <h2 id="pricing-title">${esc(h.pricing.h2)}</h2>
      </div>
      <div class="price-layout">
        <div class="price-main">
          <span>${esc(h.pricing.auto.label)}</span>
          <strong><small>${esc(t.servicesPages.auto.sections.price.from || "")}</small> ${esc(h.pricing.auto.price)}</strong>
          <p>${esc(h.pricing.auto.per)}</p>
        </div>
        <div class="price-main price-main--dark">
          <span>${esc(h.pricing.kravas.label)}</span>
          <strong><small>${esc(t.servicesPages.kravas.sections.price.from || "")}</small> ${esc(h.pricing.kravas.price)}</strong>
          <p>${esc(h.pricing.kravas.per)}</p>
        </div>
        <div class="price-factors">
          <h3>${esc(h.pricing.factors.h3)}</h3>
          <ul>
            ${h.pricing.factors.items.map((item) => `<li>${esc(item)}</li>`).join("\n            ")}
          </ul>
          <a href="tel:${BUSINESS.phone}">${esc(h.pricing.factors.link)} <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>

    <section class="editorial chapter" aria-labelledby="editorial-title">
      <p class="eyebrow"><span></span>${esc(h.editorial.eyebrow)}</p>
      <h2 id="editorial-title">${esc(h.editorial.h2)}</h2>
    </section>

    <section class="work chapter" id="darbi" aria-labelledby="work-title">
      <div class="work-heading">
        <p class="eyebrow light"><span></span>${esc(h.work.eyebrow)}</p>
        <h2 id="work-title">${esc(h.work.h2)}</h2>
      </div>
      <div class="gallery-tabs" role="tablist" aria-label="${esc(h.work.h2)}">
${galleryTabs}
      </div>
      <div class="gallery-panels">
${galleryPanels}
      </div>
    </section>

    <section class="reviews chapter" id="atsauksmes" aria-labelledby="reviews-title">
      <div class="reviews-head">
        <div class="reviews-copy">
          <p class="eyebrow"><span></span>${esc(h.reviews.eyebrow)}</p>
          <h2 id="reviews-title">${esc(h.reviews.h2)}</h2>
        </div>
        <div class="reviews-score" aria-label="${esc(h.reviews.scoreAria)}">
          <strong>5,0</strong>
          <span class="review-stars" aria-hidden="true">★★★★★</span>
          <span>${esc(h.reviews.scoreCount)}</span>
        </div>
      </div>
      <div class="reviews-grid" data-google-reviews>
${reviewCards}
      </div>
      <div class="reviews-action">
        <div>
          <p>${esc(h.reviews.action.q)}</p>
          <h3>${esc(h.reviews.action.h3)}</h3>
        </div>
        <a class="reviews-link" href="https://g.page/r/CQ1F6-eN5ajgEAE/review" target="_blank" rel="noopener noreferrer">${esc(h.reviews.action.link)} <span aria-hidden="true">↗</span></a>
      </div>
      <p class="reviews-source">${esc(h.reviews.source)}</p>
    </section>

    <section class="contact chapter" id="kontakti" aria-labelledby="contact-title">
      <div class="contact-copy">
        <p class="eyebrow"><span></span>${esc(h.contact.eyebrow)}</p>
        <h2 id="contact-title">${esc(h.contact.h2)}</h2>
        <a class="contact-number" href="tel:${BUSINESS.phone}">${BUSINESS.phoneDisplay} <span aria-hidden="true">↗</span></a>
        <a class="contact-secondary" href="tel:${BUSINESS.phoneSecondary}"><small>${esc(h.contact.secondSmall)}</small><span>${BUSINESS.phoneSecondaryDisplay} <i aria-hidden="true">↗</i></span></a>
        <a class="contact-email" href="mailto:${BUSINESS.email}">${BUSINESS.email}</a>
      </div>
      <form class="request-form" id="request-form" novalidate>
        <div class="form-row">
          <label>${esc(form.name)}<input type="text" name="name" autocomplete="name" maxlength="80" enterkeyhint="next" required></label>
          <label>${esc(form.phone)}<input type="tel" name="phone" autocomplete="tel" inputmode="tel" maxlength="32" enterkeyhint="next" aria-describedby="phone-hint" required><small id="phone-hint">${esc(form.phoneHint)}</small></label>
        </div>
        <label>${esc(form.issue)}
          <select name="issue" required>
            <option value="">${esc(form.issuePlaceholder)}</option>
${issueOptions}
          </select>
        </label>
        <label for="request-details">${esc(form.details)}<textarea id="request-details" name="details" rows="3" maxlength="500" placeholder="${esc(form.detailsPlaceholder)}"></textarea></label>
        <div class="form-location-tools">
          <button class="form-location-button" type="button" data-form-location>
            ${PIN_SVG.replace("<svg ", '<svg aria-hidden="true" ')}
            <span data-form-location-label>${esc(form.geoButton)}</span>
          </button>
          <a class="form-map-link" data-form-map-link target="_blank" rel="noopener noreferrer" hidden>${esc(form.mapLink)} <span aria-hidden="true">↗</span></a>
        </div>
        <p class="form-location-status" aria-live="polite"></p>
        <div class="form-photo">
          <div class="form-photo-title" id="photo-label">${esc(form.photo)} <small>${esc(form.photoOptional)}</small></div>
          <label class="file-picker">
            <input type="file" name="photos" accept="image/*" capture="environment" multiple aria-labelledby="photo-label" aria-describedby="photo-hint">
            <span class="file-picker-button">${esc(form.photoPick)}</span>
            <span class="file-picker-name" data-file-label>${esc(form.photoNone)}</span>
          </label>
          <small id="photo-hint">${esc(form.photoHint)}</small>
        </div>
        <button type="submit" class="form-submit magnetic">${esc(form.submit)} <span aria-hidden="true">↗</span></button>
        <p class="form-note">${esc(form.note)}</p>
        <p class="form-status" aria-live="polite"></p>
      </form>
    </section>
  </main>

${footer(lang, "home", dirSegments)}

${dock(lang)}

${locationSheet(lang)}

${scripts(lang, dirSegments)}
</body>
</html>
`;
}

/* ── Service page ── */
function servicePage(lang, key) {
  const t = T[lang];
  const p = t.servicesPages[key];
  const s = p.sections;
  const dirSegments = dirOf(lang, key);
  const homeHref = rel(dirSegments, dirOf(lang, "home"));
  const assetPrefix = rel(dirSegments, []);
  const related = SERVICES.filter((svc) => svc.key !== key).slice(0, 3);

  const photosHtml = s.photos.length > 2
    ? "svc-photos svc-photos--collection"
    : s.photos.length > 1 ? "svc-photos" : "svc-photos svc-photos--single";
  const priceFrom = s.price.from ? `<small>${esc(s.price.from)}</small> ` : "";
  const photoMeta = (name) => {
    if (name.startsWith("client-manipulator-") && name !== "client-manipulator-collage") return { widths: [640], width: 640, height: 605 };
    const dimensions = {
      "client-auto-audi": [1200, 1200],
      "client-kravas-heavy": [1200, 1200],
      "client-treiler-lift": [1200, 1200],
      "client-roadside-wheel": [1200, 1600],
      "client-treiler-tractor": [1200, 1600],
      "client-kravas-mud": [1200, 1600],
      "client-auto-van": [1200, 1600],
      "client-recovery-collage": [1200, 567],
      "client-manipulator-collage": [1200, 756],
      "client-collage-auto": [1200, 1500],
      hero: [1200, 900]
    };
    const [width, height] = dimensions[name] || [1200, 800];
    return { widths: [640, 800, 1200], width, height };
  };
  const relatedNote = (svcKey) => {
    const price = T[lang].servicesPages[svcKey].sections.price;
    return price.from ? `${price.from} ${price.price}` : t.availabilityChip;
  };

  return `<!doctype html>
<html lang="${lang}">
<head>
${head({
    lang,
    title: p.title,
    description: p.description,
    page: key,
    ogTitle: p.title.split(" | ")[0],
    ogDescription: p.description,
    ogImage: SERVICE_OG[key],
    dirSegments,
    schemas: [
      businessSchema(false),
      serviceSchema(lang, key, p.h1, p.description, langUrl(lang, key)),
      breadcrumbSchema(lang, key, p.breadcrumb),
      webPageSchema(p.h1, langUrl(lang, key), lang)
    ]
  })}
</head>
<body>
  <a class="skip-link" href="#saturs">${esc(t.skip)}</a>
  <div class="scroll-progress" aria-hidden="true"><span></span></div>

${header(lang, key, dirSegments)}

${mobileMenu(lang, key, dirSegments)}

  <main id="saturs">
    <section class="page-hero" aria-labelledby="page-title">
      <span class="header-sentinel" aria-hidden="true"></span>
      <div class="page-hero-grid">
        <ol class="breadcrumbs" aria-label="${esc(t.navAria)}">
          <li><a href="${homeHref}">${esc(BUSINESS.name)}</a></li>
          <li><span aria-current="page">${esc(p.breadcrumb)}</span></li>
        </ol>
        <p class="eyebrow reveal-item"><span></span>${esc(p.heroEyebrow)}</p>
        <h1 id="page-title">
          <span class="hero-line"><span>${esc(p.h1)}</span></span>
        </h1>
        <p class="hero-tagline reveal-item">${esc(p.tagline)}</p>
        <div class="hero-cta-row reveal-item">
          <p class="hero-cta-hint">${esc(t.hero.ctaHint)}</p>
          <a class="primary-cta primary-cta--big magnetic call-attention call-rattle" href="tel:${BUSINESS.phone}" data-dock-watch>
            ${PHONE_SVG.replace("<svg ", '<svg class="phone-nudge" ')}
            <span><small>${esc(t.hero.ctaSmall)}</small><strong>${BUSINESS.phoneDisplay}</strong></span>
          </a>
        </div>
      </div>
    </section>

    <section class="svc-section" aria-labelledby="about-title">
      <div class="svc-shell">
        <h2 id="about-title">${esc(s.about.h2)}</h2>
        <p class="svc-lead">${esc(s.about.lead)}</p>
        <p>${esc(s.about.p)}</p>
      </div>
    </section>

    <section class="svc-section svc-section--white" aria-labelledby="includes-title">
      <div class="svc-shell">
        <h2 id="includes-title">${esc(s.includesH2)}</h2>
        <ul class="svc-list">
          ${s.includes.map((item) => `<li>${esc(item)}</li>`).join("\n          ")}
        </ul>
      </div>
      <div class="${photosHtml}">
        ${s.photos.map((photo) => {
          const meta = photoMeta(photo.img);
          const largest = meta.widths.at(-1);
          const srcset = meta.widths.map((width) => `${assetPrefix}assets/images/${photo.img}-${width}.webp ${width}w`).join(", ");
          const sizes = s.photos.length > 2 ? "(max-width: 560px) 94vw, (max-width: 820px) 47vw, 31vw" : "(max-width: 820px) 94vw, 50vw";
          return `<figure>
          <img src="${assetPrefix}assets/images/${photo.img}-${largest}.webp" srcset="${srcset}" sizes="${sizes}" width="${meta.width}" height="${meta.height}" alt="${esc(photo.alt)}" loading="lazy" decoding="async">
          <figcaption>${esc(photo.caption)}</figcaption>
        </figure>`;
        }).join("\n        ")}
      </div>
    </section>

    <section class="svc-section svc-section--ink" aria-labelledby="steps-title">
      <div class="svc-shell">
        <h2 id="steps-title">${esc(s.stepsH2)}</h2>
        <ol class="svc-steps">
          ${s.steps.map((step) => `<li><div><strong>${esc(step.h3)}</strong><p>${esc(step.p)}</p></div></li>`).join("\n          ")}
        </ol>
      </div>
    </section>

    <section class="svc-section" aria-labelledby="price-title">
      <div class="svc-shell">
        <h2 id="price-title">${esc(s.priceH2)}</h2>
      </div>
      <div class="price-band">
        <div class="price-cell price-cell--accent">
          <span>${esc(s.price.label)}</span>
          <strong>${priceFrom}${esc(s.price.price)}</strong>
          <p>${esc(s.price.per)}</p>
          <a href="tel:${BUSINESS.phone}">${esc(s.priceLink)} <span aria-hidden="true">↗</span></a>
        </div>
        <div class="price-cell">
          <h3>${esc(s.factorsH3)}</h3>
          <ul>
            ${s.factors.map((item) => `<li>${esc(item)}</li>`).join("\n            ")}
          </ul>
          <p class="price-note">${esc(s.price.note)}</p>
        </div>
      </div>
    </section>

    <section class="svc-section svc-section--white" aria-labelledby="related-title">
      <div class="svc-shell">
        <h2 id="related-title">${esc(s.relatedH2)}</h2>
      </div>
      <div class="svc-related">
        ${related.map((svc) => `<a href="${rel(dirSegments, dirOf(lang, svc.key))}">
          <small>${esc(relatedNote(svc.key))}</small>
          <span class="svc-related-name">${esc(T[lang].servicesPages[svc.key].breadcrumb)} <span aria-hidden="true">↗</span></span>
        </a>`).join("\n        ")}
      </div>
    </section>

    <section class="cta-band" aria-labelledby="cta-title">
      <div class="cta-band-inner">
        <div>
          <h2 id="cta-title">${esc(s.cta.h2)}</h2>
          <p>${esc(s.cta.p)}</p>
        </div>
        <div class="cta-band-actions">
          <a class="primary-cta" href="tel:${BUSINESS.phone}">
            ${PHONE_SVG.replace("<svg ", '<svg class="phone-nudge" aria-hidden="true" ')}
            <span><small>${esc(t.hero.ctaSmall)}</small><strong>${BUSINESS.phoneDisplay}</strong></span>
          </a>
          <a class="contact-secondary" href="tel:${BUSINESS.phoneSecondary}"><small>${esc(t.secondPhoneSmall)}</small><span>${BUSINESS.phoneSecondaryDisplay} <i aria-hidden="true">↗</i></span></a>
        </div>
      </div>
    </section>
  </main>

${footer(lang, key, dirSegments)}

${dock(lang)}

${locationSheet(lang)}

${scripts(lang, dirSegments)}
</body>
</html>
`;
}

/* ── Sitemap / robots / 404 ── */
function sitemap() {
  const pages = ["home", ...SERVICES.map((s) => s.key)];
  const entries = [];
  for (const lang of LANGS) {
    for (const page of pages) {
      const alternates = LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${LANG_META[l].hreflang}" href="${langUrl(l, page)}"/>`).join("\n") + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${langUrl("lv", page)}"/>`;
      entries.push(`  <url>
    <loc>${langUrl(lang, page)}</loc>
    <lastmod>${LASTMOD}</lastmod>
${alternates}
  </url>`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>
`;
}

function robotsTxt() {
  return `# ${production ? "Production" : "Concept"} build.
# Indexability is controlled by the <meta name="robots"> tag on each page (${ROBOTS}).
User-agent: *
Allow: /

Sitemap: ${BASE}/sitemap.xml
`;
}

function notFoundPage() {
  return `<!doctype html>
<html lang="lv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#0d0f11">
  <meta name="robots" content="noindex, nofollow">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <title>404 — lapa nav atrasta | SOS Evakuators</title>
  <link rel="icon" href="${BASE}/assets/images/logo.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${BASE}/styles.css?v=${ASSETS_V}">
</head>
<body>
  <main style="min-height:100svh;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:1.6rem;background:var(--ink);color:var(--white);padding:6rem 5vw">
    <p class="eyebrow"><span></span>404</p>
    <h1 style="margin:0;font-size:clamp(2.6rem,8vw,6rem);letter-spacing:-.07em;line-height:.95">Šīs lapas šeit nav.</h1>
    <p style="margin:0;color:rgba(255,255,255,.66)">Bet evakuators brauc diennakti.</p>
    <div style="display:flex;gap:.9rem;flex-wrap:wrap">
      <a class="primary-cta" href="${BASE}/">${PHONE_SVG.replace("<svg ", '<svg class="phone-nudge" aria-hidden="true" ')}<span><small>Zvanīt</small><strong>${BUSINESS.phoneDisplay}</strong></span></a>
      <a class="primary-cta" href="${BASE}/" style="background:transparent;color:var(--white);border:1px solid rgba(255,255,255,.3)">Uz sākumlapu</a>
    </div>
  </main>
</body>
</html>
`;
}

/* ── Write everything ── */
const outputs = [];
const write = (relativePath, content) => {
  const target = join(ROOT, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
  outputs.push(relativePath);
};

for (const lang of LANGS) {
  write(lang === "lv" ? "index.html" : `${lang}/index.html`, homePage(lang));
  for (const svc of SERVICES) {
    write(join(LANG_META[lang].prefix, svc.slug[lang], "index.html"), servicePage(lang, svc.key));
  }
}

write("sitemap.xml", sitemap());
write("robots.txt", robotsTxt());
write("404.html", notFoundPage());

console.log(`${production ? "PRODUCTION" : "CONCEPT"} build: ${outputs.length} files written (base ${BASE}, robots "${ROBOTS}")`);
