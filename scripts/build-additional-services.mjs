import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://vasilyanaptyp-oss.github.io/sos-evakuators-concept";
const VERSION = "20260909-multilingual";
const LANGS = ["lv", "ru", "en"];
const ROUTES = {
  hub: { lv: ["citi-pakalpojumi"], ru: ["ru", "drugie-uslugi"], en: ["en", "other-services"] },
  wells: { lv: ["aku-tirisana"], ru: ["ru", "chistka-kolodtsev"], en: ["en", "well-cleaning"] },
  waste: { lv: ["atkritumu-izvesana"], ru: ["ru", "vyvoz-musora"], en: ["en", "waste-removal"] },
  fitness: { lv: ["fitness"], ru: ["ru", "fitnes"], en: ["en", "fitness"] }
};
const HOME = { lv: [], ru: ["ru"], en: ["en"] };
const C = {
  lv: {skip:"Pāriet uz saturu",brand:"AUTOPALĪDZĪBA.LV — sākums",navAria:"Galvenā navigācija",mobileAria:"Mobilā navigācija",menuOpen:"Atvērt izvēlni",nav:["Pakalpojumi","Transports","Cenas","Galerija","Citi pakalpojumi","Kontakti"],hub:"Citi pakalpojumi",accent:"Citi pakalpojumi.",eyebrow:"Atsevišķa sadaļa",count:"3 virzieni",note:"Katram pakalpojumam ir sava lapa. Informācija tiks papildināta pēc klienta materiālu saņemšanas.",list:"01 / Pakalpojumu saraksts",choose:"Izvēlieties virzienu.",info:"Informācija un materiāli tiks papildināti.",services:{wells:"Aku tīrīšana",waste:"Atkritumu izvešana",fitness:"Fitness"},preparing:"Saturs tiek gatavots",status:"Informācija tiks papildināta pēc reālo materiālu saņemšanas.",placeholder:"Vieta pārbaudītai informācijai.",placeholderText:"Šajā lapā netiek publicēti pieņēmumi. Pakalpojuma apraksts, attēli un saziņas informācija tiks pievienota pēc klienta apstiprinājuma.",planned:"Plānotais saturs",rows:["Pakalpojuma apraksts","Reāli darbu materiāli","Apstiprināta saziņas informācija"],all:"← Visi papildu pakalpojumi",main:"Galvenā lapa",back:"Atgriezties galvenajā lapā →",call:"Zvanīt",location:"Jūsu atrašanās vieta",faster:"Ātrākai palīdzībai",locationTitle:"Jūsu atrašanās vieta.",locationText:"Pēc atļaujas saņemšanas sagatavosim īsziņu ar precīzu kartes saiti. Jūs varēsiet to pārbaudīt pirms nosūtīšanas.",locate:"Noteikt manu atrašanās vietu",fallback:"Vai vienkārši zvanīt +371 22002700",close:"Aizvērt"},
  ru: {skip:"Перейти к содержимому",brand:"AUTOPALĪDZĪBA.LV — главная",navAria:"Основная навигация",mobileAria:"Мобильная навигация",menuOpen:"Открыть меню",nav:["Услуги","Транспорт","Цены","Галерея","Другие услуги","Контакты"],hub:"Другие услуги",accent:"Другие услуги.",eyebrow:"Отдельный раздел",count:"3 направления",note:"Для каждой услуги создана отдельная страница. Информация будет дополнена после получения материалов от клиента.",list:"01 / Список услуг",choose:"Выберите направление.",info:"Информация и материалы будут добавлены позже.",services:{wells:"Очистка колодцев",waste:"Вывоз мусора",fitness:"Фитнес"},preparing:"Содержание готовится",status:"Информация будет добавлена после получения реальных материалов.",placeholder:"Место для проверенной информации.",placeholderText:"На этой странице не публикуются предположения. Описание услуги, фотографии и контактная информация появятся после подтверждения клиента.",planned:"Планируемое содержание",rows:["Описание услуги","Реальные материалы с работ","Подтверждённая контактная информация"],all:"← Все дополнительные услуги",main:"Главная страница",back:"Вернуться на главную →",call:"Позвонить",location:"Ваше местоположение",faster:"Для быстрой помощи",locationTitle:"Ваше местоположение.",locationText:"После разрешения мы подготовим сообщение с точной ссылкой на карту. Вы сможете проверить его перед отправкой.",locate:"Определить моё местоположение",fallback:"Или просто позвонить +371 22002700",close:"Закрыть"},
  en: {skip:"Skip to content",brand:"AUTOPALĪDZĪBA.LV — home",navAria:"Main navigation",mobileAria:"Mobile navigation",menuOpen:"Open menu",nav:["Services","Vehicles","Prices","Gallery","Other services","Contacts"],hub:"Other services",accent:"Other services.",eyebrow:"Separate section",count:"3 directions",note:"Each service has its own page. Information will be added after client materials are received.",list:"01 / Service list",choose:"Choose a direction.",info:"Information and materials will be added later.",services:{wells:"Well cleaning",waste:"Waste removal",fitness:"Fitness"},preparing:"Content in preparation",status:"Information will be added after real client materials are received.",placeholder:"Space for verified information.",placeholderText:"No assumptions are published on this page. The service description, images and contact information will be added after client approval.",planned:"Planned content",rows:["Service description","Real work materials","Approved contact information"],all:"← All additional services",main:"Main page",back:"Return to the main page →",call:"Call",location:"Your location",faster:"For faster assistance",locationTitle:"Your location.",locationText:"After permission is granted, we will prepare a message with an exact map link. You can review it before sending.",locate:"Find my location",fallback:"Or simply call +371 22002700",close:"Close"}
};

const esc = (s) => String(s).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const absolute = (segments) => `${BASE}/${segments.join("/")}${segments.length ? "/" : ""}`;
function rel(from, to) { const p = path.posix.relative(from.join("/"), to.join("/")) || "."; return p === "." ? "./" : `${p}/`; }
function languages(lang,page,from){return LANGS.map(code=>`<a href="${rel(from,ROUTES[page][code])}" lang="${code}" hreflang="${code}"${code===lang?' aria-current="true"':""}>${code.toUpperCase()}</a>`).join("");}
function head(lang,page,title,description,from){const canonical=absolute(ROUTES[page][lang]);const alternates=LANGS.map(code=>`<link rel="alternate" hreflang="${code}" href="${absolute(ROUTES[page][code])}">`).join("\n  ");return `<meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#0d0f11">
  <meta name="robots" content="noindex, nofollow">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; font-src 'self'; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'">
  <meta name="description" content="${esc(description)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <title>${esc(title)}</title>
  <link rel="canonical" href="${canonical}">
  ${alternates}
  <link rel="alternate" hreflang="x-default" href="${absolute(ROUTES[page].lv)}">
  <link rel="icon" href="${rel(from,[])}assets/images/logo.svg" type="image/svg+xml">
  <link rel="preload" href="${rel(from,[])}assets/vendor/geist-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${rel(from,[])}additional-services.css?v=${VERSION}">`;}
function shell(lang,page,main,title,description){const t=C[lang],from=ROUTES[page][lang],home=rel(from,HOME[lang]),hub=rel(from,ROUTES.hub[lang]),anchors=["pakalpojumi","platforma","cenas","darbi",null,"kontakti"];const nav=t.nav.map((label,i)=>`<a href="${i===4?hub:`${home}#${anchors[i]}`}"${i===4?' aria-current="page"':""}>${label}</a>`).join("\n      ");return `<!doctype html>
<html lang="${lang}">
<head>
  ${head(lang,page,title,description,from)}
</head>
<body>
  <a class="skip-link" href="#saturs">${t.skip}</a>
  <header class="site-header">
    <a class="brand" href="${home}" aria-label="${t.brand}"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 44 44"><path d="M7 25h5l3-8h13l6 8h3v8h-4a5 5 0 0 1-10 0h-7a5 5 0 0 1-10 0H4v-5a3 3 0 0 1 3-3Z"/><circle cx="11" cy="33" r="2.7"/><circle cx="28" cy="33" r="2.7"/><path d="m17 17 3 8h11"/></svg></span><span>AUTO<span>PALĪDZĪBA</span>.LV</span></a>
    <nav class="desktop-nav" aria-label="${t.navAria}">${nav}</nav>
    <div class="header-actions"><div class="lang-switch" aria-label="Language">${languages(lang,page,from)}</div><button class="menu-toggle" type="button" aria-label="${t.menuOpen}" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span></button></div>
  </header>
  <div class="mobile-menu" id="mobile-menu" aria-hidden="true" inert><nav aria-label="${t.mobileAria}">${nav}</nav></div>
  <main id="saturs">${main}</main>
  <footer class="site-footer"><div class="site-footer__inner"><a class="brand" href="${home}"><span>AUTO<span>PALĪDZĪBA</span>.LV</span></a><a href="${page==='hub'?home:hub}">${page==='hub'?t.back:`${t.hub} →`}</a></div></footer>
  <div class="mobile-dock" aria-label="${t.faster}"><a class="dock-call call-rattle" href="tel:+37122002700"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8c1.5 3 3.8 5.3 6.8 6.8l2.3-2.3c.3-.3.8-.4 1.2-.2 1.3.4 2.6.7 4.1.7.6 0 1 .4 1 1V21c0 .6-.4 1-1 1C10.5 22 2 13.5 2 3c0-.6.4-1 1-1h4.2c.6 0 1 .4 1 1 0 1.4.2 2.8.7 4.1.1.4 0 .9-.2 1.2l-2.1 2.5Z"/></svg> ${t.call}</a><button type="button" data-location-trigger title="${t.location}"><span aria-hidden="true">⌖</span> ${t.location}</button></div>
  <div class="location-sheet" id="location-sheet" aria-hidden="true" inert><button class="sheet-backdrop" type="button" aria-label="${t.close}" data-close-location></button><div class="sheet-panel" role="dialog" aria-modal="true" aria-labelledby="location-title"><button class="sheet-close" type="button" aria-label="${t.close}" data-close-location>×</button><p class="eyebrow"><span></span>${t.faster}</p><h2 id="location-title">${t.locationTitle}</h2><p>${t.locationText}</p><button class="primary-cta" type="button" id="share-location">${t.locate}</button><a class="sheet-fallback" href="tel:+37122002700">${t.fallback}</a><p class="location-status" aria-live="polite"></p></div></div>
  <script src="${rel(from,[])}app.js?v=20260905-client-feedback" data-base="${rel(from,[])}"></script>
  <script src="${rel(from,[])}assets/js/analytics.js?v=1" defer></script>
</body>
</html>\n`;}
function hub(lang){const t=C[lang],from=ROUTES.hub[lang];const items=["wells","waste","fitness"].map((key,i)=>`<a class="directory-item" href="${rel(from,ROUTES[key][lang])}"><span class="directory-item__number">0${i+1}</span><div class="directory-item__copy"><h3>${t.services[key]}</h3><p>${t.info}</p></div><span class="directory-item__arrow" aria-hidden="true">↗</span></a>`).join("");const main=`<section class="directory-hero" aria-labelledby="page-title"><div class="directory-hero__inner"><div><p class="eyebrow">${t.eyebrow}</p><h1 id="page-title">${t.accent}</h1></div><p class="hero-note"><strong>${t.count}</strong>${t.note}</p></div></section><section class="directory" aria-labelledby="directory-title"><div class="directory__head"><p class="section-index">${t.list}</p><h2 id="directory-title">${t.choose}</h2></div><nav class="directory-list" aria-label="${t.hub}">${items}</nav></section>`;return shell(lang,"hub",main,`${t.hub} | AUTOPALĪDZĪBA.LV`,t.note);}
function service(lang,key){const t=C[lang],from=ROUTES[key][lang],name=t.services[key],hubHref=rel(from,ROUTES.hub[lang]),number=String(["wells","waste","fitness"].indexOf(key)+1).padStart(2,"0");const main=`<section class="service-hero" aria-labelledby="page-title"><div class="service-hero__inner"><div class="service-hero__meta"><div><nav class="breadcrumb" aria-label="${t.hub}"><a href="${hubHref}">${t.hub}</a><span aria-hidden="true">/</span><span>${name}</span></nav><h1 id="page-title">${name}.</h1></div><p class="service-status"><strong>${t.preparing}</strong>${t.status}</p></div></div></section><section class="placeholder-section" aria-labelledby="placeholder-title"><div class="placeholder-grid"><div class="placeholder-copy"><p class="section-index">${number} / ${name}</p><h2 id="placeholder-title">${t.placeholder}</h2><p>${t.placeholderText}</p></div><div class="placeholder-panel" aria-label="${t.planned}">${t.rows.map((row,i)=>`<div class="placeholder-row"><span>0${i+1}</span><strong>${row}</strong></div>`).join("")}</div></div><div class="page-actions"><a class="page-action" href="${hubHref}">${t.all}</a><a class="page-action page-action--secondary" href="${rel(from,HOME[lang])}">${t.main}</a></div></section>`;return shell(lang,key,main,`${name} | ${t.hub}`,t.status);}
for(const lang of LANGS){for(const page of Object.keys(ROUTES)){const html=page==="hub"?hub(lang):service(lang,page),dir=path.join(ROOT,...ROUTES[page][lang]);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,"index.html"),html);}}
console.log("Additional services: 12 localized pages written");
