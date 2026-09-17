/*
 * SOS Evakuators — analytics preparation layer.
 *
 * STATUS: Private first-party counters are enabled. Google Ads conversions
 * (phone click, WhatsApp) are enabled since 17.09.2026: the Google tag loads
 * in Consent Mode v2 with everything denied (no cookies) and a small banner
 * lets the visitor allow ad cookies. Google Analytics stays off (no GA4 ID).
 *
 * WHAT IT DOES TODAY:
 *   - sends anonymous aggregate counters to this site's /track.php endpoint;
 *     no cookies, IP addresses, form values or coordinates are stored
 *   - pushes privacy-safe events into window.dataLayer
 *     (call_click, whatsapp_open, sms_open, geolocation_start,
 *      geolocation_success, request_prepared)
 *   - "request_prepared" means the visitor handed a prepared message to the
 *     share sheet / WhatsApp. It is NOT a confirmed incoming lead, the same
 *     way "call_click" is NOT a confirmed phone conversation. Actual calls
 *     can only be measured with a call-tracking provider or Google Ads call
 *     conversions.
 *   - no personal data is ever tracked: no names, no phone numbers typed
 *     into the form, no issue descriptions, no coordinates, no photos.
 *
 * TO ENABLE GOOGLE ANALYTICS 4 (owner must provide):
 *   1. GA4 Measurement ID (format G-XXXXXXXXXX)  -> CONFIG.ga4MeasurementId
 *   2. Google Ads conversion: ID (AW-XXXXXXXXX) + conversion label
 *      -> CONFIG.adsConversion.id / .label (one per action if desired)
 *   3. Decide on a consent banner / CMP. Consent Mode v2 defaults below are
 *      DENIED for EEA compliance; gtag('consent','update',...) must be called
 *      after the visitor agrees (wire your CMP to window.SOSAnalytics.setConsent).
 *   4. Content-Security-Policy: the <meta> CSP on every page must add
 *      https://www.googletagmanager.com to script-src and connect-src
 *      (https://*.google-analytics.com https://*.analytics.google.com
 *       https://*.g.doubleclick.net). Without this GA4 requests are blocked.
 *   5. Rebuild pages (node scripts/build-site.mjs) — analytics.js is served
 *      as-is, so this file is the single switch.
 *
 * OFFICIAL DOCS: https://developers.google.com/analytics/devguides/collection/ga4
 *                https://developers.google.com/tag-platform/security/guides/consent
 */
(() => {
  const CONFIG = {
    ga4MeasurementId: "",            // e.g. "G-XXXXXXXXXX" — leave "" to keep disabled
    adsConversion: { id: "AW-749354982", label: "ideMCJaZ6focEOb_qOUC" }, // WhatsApp click on the site (goal: Contact)
    adsPhoneConversion: { id: "AW-749354982", label: "2BgfCJOZ6focEOb_qOUC" } // phone number click on the site (goal: Phone call lead)
  };

  window.dataLayer = window.dataLayer || [];
  // gtag.js only reads Arguments objects from the dataLayer, never plain arrays.
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  let gtagLoaded = false;

  // First-party counters are skipped for automation, crawlers, the admin area and
  // anyone who opened the site once with ?notrack=1 (the owner, the developer).
  const BOT_UA = /bot|crawl|spider|slurp|headless|playwright|puppeteer|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|curl\/|wget|python|httpclient|phantom|selenium|facebookexternalhit|preview/i;
  let firstPartyMuted = false;
  try {
    const params = new URLSearchParams(location.search);
    if (params.has("notrack")) localStorage.setItem("ap_notrack", params.get("notrack") === "0" ? "" : "1");
    firstPartyMuted = localStorage.getItem("ap_notrack") === "1";
  } catch (_) {}
  if (navigator.webdriver === true || BOT_UA.test(navigator.userAgent || "") || /^\/(admin|adm)(\/|$)/.test(location.pathname)) firstPartyMuted = true;

  // Daily visitor id (rolls over at midnight) — a person is one visitor per day, not one per tab.
  let firstPartyVisitor = "";
  try {
    const today = new Date().toISOString().slice(0, 10);
    const stored = JSON.parse(localStorage.getItem("ap_visitor") || "null");
    if (stored && stored.d === today && /^[a-f0-9-]{16,64}$/.test(stored.id)) firstPartyVisitor = stored.id;
    else {
      firstPartyVisitor = globalThis.crypto?.randomUUID?.() || `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem("ap_visitor", JSON.stringify({ id: firstPartyVisitor, d: today }));
    }
  } catch (_) {}

  let firstPartySession = "";
  try {
    firstPartySession = sessionStorage.getItem("ap_session") || "";
    if (!/^[a-f0-9-]{16,64}$/.test(firstPartySession)) {
      firstPartySession = globalThis.crypto?.randomUUID?.() || `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
      sessionStorage.setItem("ap_session", firstPartySession);
    }
  } catch (_) {
    firstPartySession = `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
  }

  const firstPartySource = (() => {
    if (!document.referrer) return "direct";
    try {
      const host = new URL(document.referrer).hostname.toLowerCase();
      if (host === location.hostname) return "direct";
      if (host.includes("google.")) return "google";
      if (host.includes("bing.")) return "bing";
      if (host.includes("facebook.") || host.includes("fb.")) return "facebook";
      if (host.includes("instagram.")) return "instagram";
      if (host.includes("whatsapp.") || host.includes("wa.me")) return "whatsapp";
    } catch (_) {}
    return "other";
  })();

  const firstPartyDevice = matchMedia("(max-width: 640px)").matches
    ? "mobile"
    : matchMedia("(max-width: 1024px)").matches ? "tablet" : "desktop";

  const sendFirstParty = (event) => {
    const allowed = ["page_view", "heartbeat", "phone_primary", "phone_secondary", "whatsapp_open", "location_open", "request_prepared", "sms_open"];
    if (!allowed.includes(event) || firstPartyMuted) return;
    const payload = JSON.stringify({
      event,
      session: firstPartySession,
      visitor: firstPartyVisitor || firstPartySession,
      path: location.pathname,
      language: document.documentElement.lang || "lv",
      device: firstPartyDevice,
      source: firstPartySource
    });
    try {
      if (navigator.sendBeacon?.("/track.php", new Blob([payload], { type: "application/json" }))) return;
    } catch (_) {}
    fetch("/track.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
      credentials: "omit"
    }).catch(() => {});
  };

  const firstPartyEvent = (event, params) => {
    if (event === "call_click") return params.phone === "secondary" ? "phone_secondary" : "phone_primary";
    if (event === "geolocation_start") return "location_open";
    if (["whatsapp_open", "request_prepared", "sms_open"].includes(event)) return event;
    return "";
  };

  const gtagQueue = (...args) => window.gtag(...args);

  // Consent Mode v2: deny by default until the visitor agrees (see docs above).
  const defaultConsent = {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500
  };

  const adsId = CONFIG.adsConversion.id || CONFIG.adsPhoneConversion.id;
  const loadGtag = () => {
    const tagId = CONFIG.ga4MeasurementId || adsId;
    if (!tagId || gtagLoaded) return;
    gtagQueue("js", new Date());
    if (CONFIG.ga4MeasurementId) gtagQueue("config", CONFIG.ga4MeasurementId, { anonymize_ip: true });
    if (adsId) gtagQueue("config", adsId);
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagId)}`;
    document.head.append(script);
    gtagLoaded = true;
  };

  const sanitize = (params) => {
    if (!params) return {};
    const clean = {};
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "boolean" || typeof value === "number") clean[key] = value;
      else if (typeof value === "string" && value.length <= 48) clean[key] = value;
    }
    return clean;
  };

  const sendConversion = (name) => {
    const isPhone = name === "call_click";
    const target = isPhone && CONFIG.adsPhoneConversion.id ? CONFIG.adsPhoneConversion : CONFIG.adsConversion;
    if (target.id && target.label) {
      gtagQueue("event", "conversion", { send_to: `${target.id}/${target.label}` });
    }
  };

  const track = (event, params = {}) => {
    const clean = sanitize(params);
    window.dataLayer.push({ event, ...clean });
    sendFirstParty(firstPartyEvent(event, clean));
    if (gtagLoaded && !firstPartyMuted) {
      gtagQueue("event", event, clean);
      if (event === "call_click" || event === "whatsapp_open") sendConversion(event);
    }
  };

  window.SOSAnalytics = {
    track,
    setConsent(granted) {
      const state = granted ? "granted" : "denied";
      gtagQueue("consent", "update", {
        analytics_storage: state,
        ad_storage: state,
        ad_user_data: state,
        ad_personalization: state
      });
    }
  };

  // Consent Mode v2 defaults must be set before any tag loads. With ad_storage
  // denied the tag sets no cookies and redacts ad click ids.
  gtagQueue("consent", "default", defaultConsent);
  gtagQueue("set", "ads_data_redaction", true);

  const CONSENT_KEY = "ap_consent";
  let consent = "";
  try { consent = localStorage.getItem(CONSENT_KEY) || ""; } catch (_) {}
  if (consent === "granted") window.SOSAnalytics.setConsent(true);
  if (!firstPartyMuted) loadGtag();

  // A small non-blocking banner, shown until the visitor answers. Styled from JS
  // because the additional-service pages forbid inline style attributes. It must
  // never cover the main call button: on phones it waits for the call dock (the
  // dock slides in once that button is scrolled away) and sits above it; on
  // wider screens it stays in the bottom right corner.
  const CONSENT_COPY = {
    lv: { text: "Mēs izmantojam Google sīkdatnes, lai redzētu, kuras reklāmas palīdz jums mūs atrast.", yes: "Pieņemt", no: "Noraidīt", label: "Sīkdatnes" },
    ru: { text: "Мы используем cookie Google, чтобы видеть, какая реклама помогает вам нас найти.", yes: "Принять", no: "Отказаться", label: "Cookie" },
    en: { text: "We use Google cookies to see which ads help you find us.", yes: "Accept", no: "Decline", label: "Cookies" }
  };
  const showConsentBanner = () => {
    const copy = CONSENT_COPY[(document.documentElement.lang || "lv").slice(0, 2)] || CONSENT_COPY.lv;
    const box = document.createElement("div");
    box.className = "consent-banner";
    box.setAttribute("role", "region");
    box.setAttribute("aria-label", copy.label);
    Object.assign(box.style, {
      position: "fixed", zIndex: "25", right: "12px", maxWidth: "440px",
      gap: "12px", padding: "14px 16px", background: "#0d0f11", color: "#fbfaf6",
      font: "14px/1.45 Geist, Arial, sans-serif", boxShadow: "0 12px 34px rgba(0,0,0,.28)"
    });
    const dock = document.querySelector(".mobile-dock");
    const narrow = matchMedia("(max-width: 820px)");
    const place = () => {
      const dockUsed = !!dock && getComputedStyle(dock).display !== "none";
      const dockShown = dockUsed && dock.classList.contains("is-visible");
      box.style.display = narrow.matches && dockUsed && !dockShown ? "none" : "grid";
      box.style.left = narrow.matches ? "12px" : "auto";
      box.style.bottom = narrow.matches && dockShown ? `${Math.round(dock.getBoundingClientRect().height) + 12}px` : "16px";
    };
    const dockWatch = dock ? new MutationObserver(place) : null;
    dockWatch?.observe(dock, { attributes: true, attributeFilter: ["class"] });
    narrow.addEventListener?.("change", place);
    const text = document.createElement("p");
    text.textContent = copy.text;
    text.style.margin = "0";
    const row = document.createElement("div");
    Object.assign(row.style, { display: "flex", gap: "8px" });
    const choice = (label, value) => {
      const primary = value === "granted";
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      Object.assign(button.style, {
        flex: "1", minHeight: "44px", cursor: "pointer", font: "inherit", fontWeight: "700",
        border: primary ? "0" : "1px solid rgba(251,250,246,.4)",
        background: primary ? "#f4c531" : "transparent", color: primary ? "#0d0f11" : "#fbfaf6"
      });
      button.addEventListener("click", () => {
        try { localStorage.setItem(CONSENT_KEY, value); } catch (_) {}
        window.SOSAnalytics.setConsent(primary);
        dockWatch?.disconnect();
        narrow.removeEventListener?.("change", place);
        box.remove();
      });
      return button;
    };
    row.append(choice(copy.no, "denied"), choice(copy.yes, "granted"));
    box.append(text, row);
    place();
    document.body.append(box);
  };
  if (!consent && !firstPartyMuted && adsId) showConsentBanner();

  const startFirstParty = () => {
    sendFirstParty("page_view");
    sendFirstParty("heartbeat");
    window.setInterval(() => {
      if (document.visibilityState === "visible") sendFirstParty("heartbeat");
    }, 60000);
  };
  if ("requestIdleCallback" in window) window.requestIdleCallback(startFirstParty, { timeout: 1200 });
  else window.setTimeout(startFirstParty, 350);

  // Phone click attribution: works on every page, incl. additional services.
  const zone = (element) => element?.closest("header") ? "header"
    : element?.closest(".mobile-dock") ? "dock"
    : element?.closest(".site-footer") ? "footer"
    : element?.closest(".cta-band, .contact") ? "contact"
    : element?.closest(".hero, .page-hero") ? "hero"
    : element?.closest(".mobile-menu") ? "menu"
    : "body";

  document.addEventListener("click", (event) => {
    const tel = event.target.closest?.('a[href^="tel:"]');
    if (tel) {
      track("call_click", {
        phone: tel.getAttribute("href").includes("20091762") ? "secondary" : "main",
        placement: zone(tel)
      });
      return;
    }
    const wa = event.target.closest?.('a[href*="wa.me"], a[href*="whatsapp"]');
    if (wa) track("whatsapp_open", { via: "direct_link", placement: zone(wa) });
  }, true);
})();
