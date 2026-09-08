// Trilingual content for the SOS Evakuators concept site.
// All facts come from the client-confirmed homepage and the real site
// autopalidziba.lv (phones, e-mail, prices, services, 00–24 availability).
// No arrival-time promises, guarantees, addresses, fleet sizes or reviews
// beyond what is already published and verified on the site.

export const LANGS = ["lv", "ru", "en"];

export const LANG_META = {
  lv: { prefix: "", ogLocale: "lv_LV", hreflang: "lv" },
  ru: { prefix: "ru/", ogLocale: "ru_RU", hreflang: "ru" },
  en: { prefix: "en/", ogLocale: "en_GB", hreflang: "en" }
};

// URL slugs per language (URL-safe, no diacritics).
export const SERVICES = [
  { key: "auto", slug: { lv: "autoevakuators", ru: "avtoevakuator", en: "tow-truck" } },
  { key: "kravas", slug: { lv: "kravas-evakuators", ru: "gruzovoj-evakuator", en: "heavy-towing" } },
  { key: "cela", slug: { lv: "palidziba-uz-cela", ru: "pomosh-na-doroge", en: "roadside-assistance" } },
  { key: "izvilkshana", slug: { lv: "auto-izvilkshana", ru: "vytyagivanie-avto", en: "vehicle-recovery" } },
  { key: "latgale", slug: { lv: "evakuators-latgale", ru: "evakuator-latgaliya", en: "tow-truck-latgale" } }
];

export const T = {
  lv: {
    langName: "Latviešu",
    skip: "Pāriet uz saturu",
    brandAria: "AUTOPALĪDZĪBA.LV — sākums",
    navAria: "Galvenā navigācija",
    mobileNavAria: "Mobilā navigācija",
    nav: {
      pakalpojumi: "Pakalpojumi",
      transports: "Transports",
      cenas: "Cenas",
      galerija: "Galerija",
      citi: "Citi pakalpojumi",
      kontakti: "Kontakti"
    },
    availabilityChip: "00 – 24",
    headerCallSmall: "Zvani tūlīt",
    phonesAria: "Tālruņi",
    mainPhoneSmall: "Galvenais tālrunis",
    secondPhoneSmall: "Otrs tālrunis",
    langAria: "Valodas",
    hero: {
      eyebrow: "Daugavpilī, visā Latvijā un Eiropā.",
      h1a: "00 – 24 Evakuators",
      h1b: "Daugavpils",
      taglineAccent: "Ceļš apstājās?",
      taglineRest: " Mēs jau braucam pie jums!",
      ctaSmall: "Zvanīt",
      ctaNumber: "+371 22002700",
      ctaHint: "Ātrākais veids saņemt palīdzību",
      secondLine: "Nav atbildes? Tad zvaniet uz otro numuru",
      mapAlt: "Tu neesi viens uz ceļa! — Latvijas karte ar izceltu Latgali",
      availability: "Atbildam diennakti"
    },
    servicesMenuAria: "Evakuatora pakalpojumi",
    dock: { call: "Zvanīt", location: "Jūsu atrašanās vieta", dockAria: "Ātrā palīdzība" },
    footer: {
      tagline: "Diennakts auto un kravas evakuācija Daugavpilī, visā Latvijā un Eiropā.",
      privacy: "Privātuma politika",
      copyright: "© 2026 SOS Evakuators"
    },
    sheet: {
      eyebrow: "Ātrākai palīdzībai",
      title: "Jūsu atrašanās vieta.",
      text: "Pēc atļaujas saņemšanas sagatavosim īsziņu ar precīzu kartes saiti. Jūs varēsiet to pārbaudīt pirms nosūtīšanas.",
      button: "Noteikt manu atrašanās vietu",
      fallback: "Vai vienkārši zvanīt +371 22002700",
      close: "Aizvērt atrašanās vietas logu",
      backdrop: "Aizvērt"
    },
    home: {
      title: "Evakuators Daugavpilī 00–24 | Zvani: +371 22002700",
      description: "Diennakts evakuators Daugavpilī un visā Latgalē: auto un kravas evakuācija, palīdzība uz ceļa visā Latvijā un Eiropā. Zvani +371 22002700.",
      ogTitle: "SOS Evakuators Daugavpilī — 00–24",
      ogDescription: "Auto un kravas evakuācija, palīdzība uz ceļa un tehnikas transportēšana.",
      marqueeAria: "Transportlīdzekļu veidi",
      marquee: ["Vieglie auto", "Motocikli", "Džipi", "Maxi busi", "Kravas auto", "Būvniecības tehnika", "Celtniecības tehnika", "Lauksaimniecības tehnika", "Palīdzība uz ceļa", "Diennakts", "Izvilkšana", "Riepu remonts"],
      capability: {
        eyebrow: "Auto un kravas evakuācija",
        h2: "Palīdzība visiem transport&shy;līdzekļiem.",
        p: "Vieglie auto, kravas auto, autobusi, celtniecības, būvniecības un lauksaimniecības tehnika.",
        list: ["Autoevakuators", "Kravas evakuators", "Treileris"],
        ctaSmall: "Palīdzība 00 – 24",
        ctaText: "Zvanīt +371 22002700",
        request: "Pieteikt izsaukumu",
        mediaCaption: ["Reāls izsaukums", "AUTOPALĪDZĪBA.LV"],
        mediaAlt: "Kolāža ar auto, kravas transporta un tehnikas evakuācijas darbiem"
      },
      services: {
        eyebrow: "Palīdzēsim jebkurā situācijā 24/7",
        h2: "No pilsētas auto līdz smagai tehnikai.",
        p: "Pastāstiet mums, kāda ir jūsu problēma un kur jūs atrodaties. Mēs nosūtīsim pie jums atbilstošu evakuatoru.",
        request: "Pieteikt izsaukumu",
        cards: [
          { h3: "Auto evakuators", p: "Diennakts autoevakuācija, transportēšana no CSN vietas, ar bloķētām vai bojātām riepām, izvilkšana, bloķēta stūre.", link: "auto", alt: "Zaļš minivens uz autoevakuatora platformas Daugavpilī" },
          { h3: "Kravas evakuators", p: "Kravas auto, autobusi, smagā tehnika.", link: "kravas", alt: "Smagais kravas evakuators uz dubļaina ceļa" },
          { h3: "Treileris", p: "Celtniecības tehnika, būvniecības tehnika, lauksaimniecības tehnika.", link: null, alt: "Lauksaimniecības traktors uz treilera platformas" },
          { h3: "Diennakts palīdzība uz ceļa", p: "Izvilkšana no grāvja, sniega un dubļiem. Riepu remonts vai maiņa. Piestartēšana. Degvielas pievešana.", link: "cela", alt: "Riteņa maiņa pelēkai automašīnai" }
        ]
      },
      process: {
        eyebrow: "Bez liekiem soļiem",
        h2: "Trīs darbības. Un palīdzība ir ceļā.",
        p: "Radusies negaidīta problēma? Informējiet mūs! Mēs palīdzēsim!",
        callNow: "Zvanīt tagad",
        steps: [
          { h3: "Pastāstiet, kas noticis", p: "Nosauciet transportlīdzekli, problēmu un savu atrašanās vietu." },
          { h3: "Vienojamies par darbu", p: "Cena ir atkarīga no attāluma, transporta un situācijas sarežģītības." },
          { h3: "Dodamies palīgā", p: "Strādājam visu diennakti, arī brīvdienās un svētku dienās." }
        ]
      },
      pricing: {
        eyebrow: "Skaidrs sākumpunkts",
        h2: "Cena sākas ar situāciju, nevis slēptu solījumu.",
        auto: { label: "Auto evakuators", price: "30 €", per: "un no 0,80 € par kilometru" },
        kravas: { label: "Kravas evakuators", price: "150 €", per: "un no 1,50 € par kilometru" },
        factors: {
          h3: "Precīzu cenu nosaka",
          items: ["attālums un galamērķis", "transportlīdzekļa veids", "riteņu un piekļuves stāvoklis", "izvilkšanas vai uzkraušanas darbi", "nakts, brīvdienas vai svētku diena"],
          link: "Noskaidrot cenu"
        }
      },
      editorial: {
        eyebrow: "Viena komanda dažādam transportam",
        h2: "Evakuācija no vieglā auto līdz kravas auto."
      },
      work: {
        eyebrow: "Reāli izsaukumi",
        h2: "Mūsu darbi",
        tabs: ["Autoevakuators", "Kravas evakuators", "Treileris", "Palīdzība uz ceļa"],
        alts: ["Autoevakuators darbā", "Kravas evakuators darbā", "Treileris transportē tehniku", "Palīdzība uz ceļa"]
      },
      reviews: {
        eyebrow: "Google atsauksmes",
        h2: "Mūsu klientu atsauksmes",
        scoreAria: "Google vērtējums 5,0 no 5, 313 atsauksmes",
        scoreCount: "313 Google atsauksmes",
        stars: "5 no 5 zvaigznēm",
        action: { q: "Vai esat apmierināti ar pakalpojumu?", h3: "Uzrakstīt atsauksmi.", link: "Uzrakstīt atsauksmi" },
        source: "Google profilā pārbaudīts 01.09.2026.",
        cards: [
          { name: "Дмитрий Масенков", when: "pirms 8 mēnešiem", text: "«Приехали быстро, доставили в целости.»" },
          { name: "Slavik Mitrofanov", when: "pirms mēneša", text: "«Очень быстро приезжают к месту эвакуации.»" },
          { name: "Veronika Sokolovska", when: "pirms 2 mēnešiem", text: "«Быстро, качественно, адекватные цены.»" }
        ]
      },
      contact: {
        eyebrow: "00–24 palīdzība uz ceļa",
        h2: "Pasakiet, kur esat. Pārējo atrisināsim pa ceļam.",
        secondSmall: "Otrs tālrunis",
        form: {
          name: "Jūsu vārds",
          phone: "Tālrunis",
          phoneHint: "Vismaz septiņi cipari",
          issue: "Kas noticis?",
          issuePlaceholder: "Izvēlieties situāciju",
          issues: ["Auto nebrauc", "Auto ir grāvī vai dubļos", "Nepieciešama transportēšana", "Kravas vai smagā tehnika", "Cita situācija"],
          details: "Atrašanās vieta vai īss apraksts",
          detailsPlaceholder: "Piemēram: Daugavpils, 18. novembra iela…",
          geoButton: "Noteikt atrašanās vietu kartē",
          mapLink: "Atvērt karti",
          photo: "Pievienot foto",
          photoOptional: "Nav obligāti",
          photoPick: "Izvēlēties foto",
          photoNone: "Foto nav izvēlēts",
          photoHint: "Līdz 4 attēliem un kopā līdz 20 MB. Tālrunī izvēlieties WhatsApp kopīgošanas izvēlnē.",
          submit: "Sagatavot pieprasījumu",
          note: "Ar foto atvērsies tālruņa kopīgošanas izvēlne — izvēlieties WhatsApp. Bez foto atvērsies WhatsApp ar sagatavotu ziņu. Steidzamākā situācijā zvaniet."
        }
      }
    },
    servicesPages: {
      auto: {
        title: "Autoevakuators Daugavpilī | SOS Evakuators 00–24",
        description: "Diennakts autoevakuators Daugavpilī: vieglo auto evakuācija, transportēšana no CSN vietas, izvilkšana. Zvani +371 22002700.",
        h1: "Autoevakuators Daugavpilī",
        tagline: "Diennakts vieglo auto evakuācija Daugavpilī un visā Latvijā.",
        breadcrumb: "Autoevakuators",
        heroEyebrow: "Daugavpilī, visā Latvijā un Eiropā",
        availability: "Izsaukumi diennakti",
        sections: {
          about: {
            h2: "Vieglā auto evakuācija bez pārtraukumiem.",
            lead: "Auto nebrauc, radusies avārija vai jānogādā mašīna servisā? Zvaniet — nosūtīsim evakuatoru.",
            p: "Transportējam vieglos auto, džipus, minibusus un motociklus. Strādājam arī ar bojātām vai bloķētām riepām, bloķētu stūri un auto, kas nav braucamspējīgs pēc ceļu satiksmes negadījuma."
          },
          includesH2: "Kas ietilpst pakalpojumā",
          includes: ["Transportēšana no CSN vietas", "Evakuācija ar bojātām vai bloķētām riepām", "Evakuācija ar bloķētu stūri", "Izvilkšana no grāvja, sniega un dubļiem", "Motociklu un kvadraciklu evakuācija", "Transportēšana uz servisu vai citu adresi"],
          photosH2: "No darbiem",
          photos: [
            { img: "fleet-01", alt: "Autoevakuators platformā iekrāvis furgonu", caption: "Auto evakuācija ar platformu" },
            { img: "client-collage-auto", alt: "Auto evakuācijas darbu kolāža", caption: "Reāli izsaukumi" }
          ],
          stepsH2: "Kā norit izsaukums",
          steps: [
            { h3: "Pastāstiet, kas noticis", p: "Nosauciet auto, problēmu un atrašanās vietu." },
            { h3: "Vienojamies par cenu", p: "Cenu nosaka attālums, auto veids un situācijas sarežģītība." },
            { h3: "Nogādājam auto", p: "Maigi iekrājam un nogādājam norādītajā adresē." }
          ],
          priceH2: "Cena",
          price: { label: "Auto evakuators", from: "no", price: "30 €", per: "un no 0,80 € par kilometru", note: "Precīza cena pirms izbraukšanas — zvaniet." },
          factorsH3: "Precīzu cenu nosaka",
          factors: ["attālums un galamērķis", "transportlīdzekļa veids", "riteņu un piekļuves stāvoklis", "izvilkšanas vai uzkraušanas darbi", "nakts, brīvdienas vai svētku diena"],
          priceLink: "Noskaidrot cenu",
          relatedH2: "Citi evakuatora pakalpojumi",
          cta: { h2: "Nepieciešams autoevakuators?", p: "Zvaniet — atbildam diennakti, arī brīvdienās un svētku dienās." }
        }
      },
      kravas: {
        title: "Kravas evakuators Daugavpilī | SOS Evakuators 00–24",
        description: "Kravas evakuators Daugavpilī: kravas auto, autobusu un smagās tehnikas evakuācija un transportēšana. Zvani +371 22002700.",
        h1: "Kravas evakuators Daugavpilī",
        tagline: "Evakuējam kravas auto, autobusus un smago tehniku.",
        breadcrumb: "Kravas evakuators",
        heroEyebrow: "Daugavpilī, visā Latvijā un Eiropā",
        availability: "Izsaukumi diennakti",
        sections: {
          about: {
            h2: "Smagās tehnikas evakuācija un transportēšana.",
            lead: "Kravas auto, vilcēji, autobusi un pacēlāji prasa jaudīgu evakuatoru. Mēs to transportējam.",
            p: "Evakuējam kravas transportlīdzekļus Daugavpilī, visā Latvijā un Eiropā — diennakti, arī no ceļu satiksmes negadījumu vietām."
          },
          includesH2: "Ko mēs evakuējam",
          includes: ["Kravas auto un vilcēji", "Autobusi un maxi busi", "Būvniecības un celtniecības tehnika", "Lauksaimniecības tehnika", "Pacēlāji un specializētā tehnika", "Smagās tehnikas izvilkšana no grūti pieejamām vietām"],
          photosH2: "No darbiem",
          photos: [
            { img: "hero", alt: "Kravas evakuators transportē pacēlājus lietū", caption: "Pacēlāju transportēšana" },
            { img: "fleet-02", alt: "Smagais kravas evakuators pie kravas auto", caption: "Smagās tehnikas evakuācija" }
          ],
          stepsH2: "Kā norit izsaukums",
          steps: [
            { h3: "Nosauciet tehniku un vietu", p: "Kravas auto, autobuss vai tehnika — un kur tā atrodas." },
            { h3: "Vienojamies par cenu", p: "Cenu nosaka attālums, tehnikas masa un situācijas sarežģītība." },
            { h3: "Transportējam", p: "Nogādājam tehniku norādītajā adresē diennakti." }
          ],
          priceH2: "Cena",
          price: { label: "Kravas evakuators", from: "no", price: "150 €", per: "un no 1,50 € par kilometru", note: "Precīza cena pirms izbraukšanas — zvaniet." },
          factorsH3: "Precīzu cenu nosaka",
          factors: ["attālums un galamērķis", "transportlīdzekļa veids", "riteņu un piekļuves stāvoklis", "izvilkšanas vai uzkraušanas darbi", "nakts, brīvdienas vai svētku diena"],
          priceLink: "Noskaidrot cenu",
          relatedH2: "Citi evakuatora pakalpojumi",
          cta: { h2: "Nepieciešams kravas evakuators?", p: "Zvaniet — atbildam diennakti, arī brīvdienās un svētku dienās." }
        }
      },
      cela: {
        title: "Palīdzība uz ceļa Daugavpilī | SOS Evakuators 00–24",
        description: "Diennakts palīdzība uz ceļa Daugavpilī: izvilkšana, riepu maiņa, piestartēšana, degvielas pievešana. Zvani +371 22002700.",
        h1: "Palīdzība uz ceļa Daugavpilī",
        tagline: "Radusies problēma ceļā? Izsauciet palīdzību — strādājam diennakti.",
        breadcrumb: "Palīdzība uz ceļa",
        heroEyebrow: "Daugavpilī, visā Latvijā un Eiropā",
        availability: "Izsaukumi diennakti",
        sections: {
          about: {
            h2: "Ātra palīdzība, kad ceļš apstājas.",
            lead: "Izlādējies akumulators, caurdurta riepa vai beigusies degviela? Mēs aizbraucam pie jums.",
            p: "Ja uz vietas iztikt neizdodas, evakuējam transportlīdzekli līdz servisu vai citai adresei."
          },
          includesH2: "Kas ietilpst palīdzībā uz ceļa",
          includes: ["Izvilkšana no grāvja, sniega un dubļiem", "Riepu remonts vai maiņa", "Piestartēšana ar izlādējušos akumulatoru", "Degvielas pievešana", "Evakuācija, ja uz vietas iztikt neizdodas"],
          photosH2: "No darbiem",
          photos: [
            { img: "fleet-04", alt: "Evakuators iekrauj furgonu uz lauku ceļa", caption: "Izbraukums ārpus pilsētas" }
          ],
          stepsH2: "Kā norit izsaukums",
          steps: [
            { h3: "Pastāstiet, kas noticis", p: "Nosauciet problēmu un savu atrašanās vietu." },
            { h3: "Vienojamies par cenu", p: "Cenu nosaka attālums un palīdzības veids." },
            { h3: "Dodamies palīgā", p: "Aizbraucam pie jums diennakti, arī brīvdienās." }
          ],
          priceH2: "Cena",
          price: { label: "Palīdzība uz ceļa", from: "", price: "pēc situācijas", per: "Cenu nosaka attālums un palīdzības veids", note: "Noskaidrosiet cenu pa tālruni — zvaniet." },
          factorsH3: "Precīzu cenu nosaka",
          factors: ["attālums un galamērķis", "transportlīdzekļa veids", "riteņu un piekļuves stāvoklis", "izvilkšanas vai uzkraušanas darbi", "nakts, brīvdienas vai svētku diena"],
          priceLink: "Noskaidrot cenu",
          relatedH2: "Citi evakuatora pakalpojumi",
          cta: { h2: "Vajag palīdzību uz ceļa?", p: "Zvaniet — atbildam diennakti, arī brīvdienās un svētku dienās." }
        }
      },
      izvilkshana: {
        title: "Auto izvilkšana Daugavpilī | SOS Evakuators 00–24",
        description: "Auto izvilkšana Daugavpilī un visā Latvijā: izvilkšana no grāvja, sniega, dubļiem un smiltīm. Zvani +371 22002700.",
        h1: "Auto izvilkšana Daugavpilī",
        tagline: "Izvilkam auto un tehniku no grāvja, sniega, dubļiem un smiltīm.",
        breadcrumb: "Auto izvilkšana",
        heroEyebrow: "Daugavpilī, visā Latvijā un Eiropā",
        availability: "Izsaukumi diennakti",
        sections: {
          about: {
            h2: "Izvilkšana arī ārpus pilsētas.",
            lead: "Auto nogājis no ceļa vai iegrimis dubļos? Izvilkam transportlīdzekli un, ja nepieciešams, nogādājam tālāk.",
            p: "Strādājam gan ar vieglajiem auto, gan ar smago tehniku — dažādos laika apstākļos un arī uz lauku ceļiem."
          },
          includesH2: "Kas ietilpst izvilkšanā",
          includes: ["Izvilkšana no grāvja", "Izvilkšana no sniega", "Izvilkšana no dubļiem un smiltīm", "Vieglā auto un smagās tehnikas izvilkšana", "Tālāka transportēšana pēc izvilkšanas"],
          photosH2: "No darbiem",
          photos: [
            { img: "fleet-05", alt: "Smagais evakuators izvelk tehniku no dubļainā ceļa", caption: "Izvilkšana uz lauku ceļa" },
            { img: "fleet-04", alt: "Evakuators iekrauj furgonu uz lauku ceļa", caption: "Iekraušana pēc izvilkšanas" }
          ],
          stepsH2: "Kā norit izsaukums",
          steps: [
            { h3: "Nosauciet vietu", p: "Kur atrodas transportlīdzeklis un kāda ir situācija." },
            { h3: "Vienojamies par cenu", p: "Cenu nosaka attālums, tehnikas veids un izvilkšanas sarežģītība." },
            { h3: "Izvelkam", p: "Izvilkam transportlīdzekli un pēc nepieciešamības transportējam." }
          ],
          priceH2: "Cena",
          price: { label: "Auto izvilkšana", from: "", price: "pēc situācijas", per: "Cenu nosaka izvilkšanas sarežģītība un attālums", note: "Noskaidrosiet cenu pa tālruni — zvaniet." },
          factorsH3: "Precīzu cenu nosaka",
          factors: ["attālums un galamērķis", "transportlīdzekļa veids", "riteņu un piekļuves stāvoklis", "izvilkšanas vai uzkraušanas darbi", "nakts, brīvdienas vai svētku diena"],
          priceLink: "Noskaidrot cenu",
          relatedH2: "Citi evakuatora pakalpojumi",
          cta: { h2: "Auto iegrimis? Izsauciet izvilkšanu.", p: "Zvaniet — atbildam diennakti, arī brīvdienās un svētku dienās." }
        }
      },
      latgale: {
        title: "Evakuators Latgalē | SOS Evakuators 00–24",
        description: "Evakuators visā Latgalē: bāze Daugavpilī, diennakts izsaukumi un transportēšana visā Latvijā un Eiropā. Zvani +371 22002700.",
        h1: "Evakuators Latgalē",
        tagline: "Bāze Daugavpilī — izsaukumi visā Latgalē, transportēšana visā Latvijā un Eiropā.",
        breadcrumb: "Evakuators Latgalē",
        heroEyebrow: "Daugavpilī, visā Latvijā un Eiropā",
        availability: "Izsaukumi diennakti",
        sections: {
          about: {
            h2: "Diennakts evakuācija visā reģionā.",
            lead: "Mūsu bāze ir Daugavpils, taču braucam uz izsaukumiem visā Latgalē — un transportējam visā Latvijā un Eiropā.",
            p: "Neatkarīgi no tā, vai atrodaties Daugavpilī, Rēzeknē, Krāslavā, Preiļos, Ludzā vai citā Latgales vietā, izsauciet — strādājam diennakti, arī brīvdienās un svētku dienās."
          },
          includesH2: "Pakalpojumi reģionā",
          includes: ["Autoevakuators", "Kravas evakuators", "Palīdzība uz ceļa", "Auto izvilkšana", "Tehnikas transportēšana starp pilsētām"],
          photosH2: "No darbiem",
          photos: [
            { img: "fleet-03", alt: "Treileris ar tehniku uz lauku ceļa", caption: "Tehnikas transportēšana reģionā" },
            { img: "fleet-01", alt: "Autoevakuators platformā iekrāvis furgonu", caption: "Izsaukums diennakti" }
          ],
          stepsH2: "Kā norit izsaukums",
          steps: [
            { h3: "Zvaniet un nosauciet vietu", p: "Pilsēta vai ceļš Latgalē, kur atrodaties." },
            { h3: "Vienojamies par cenu", p: "Cenu nosaka attālums līdz vietai un darba apjoms." },
            { h3: "Dodamies palīgā", p: "Izbraucam pie jums un nogādājam vajadzīgajā adresē." }
          ],
          priceH2: "Cena",
          price: { label: "Izsaukums Latgalē", from: "", price: "pēc situācijas", per: "Cenu nosaka attālums un darba apjoms", note: "Noskaidrosiet cenu pa tālruni — zvaniet." },
          factorsH3: "Precīzu cenu nosaka",
          factors: ["attālums un galamērķis", "transportlīdzekļa veids", "riteņu un piekļuves stāvoklis", "izvilkšanas vai uzkraušanas darbi", "nakts, brīvdienas vai svētku diena"],
          priceLink: "Noskaidrot cenu",
          relatedH2: "Citi evakuatora pakalpojumi",
          cta: { h2: "Vajag evakuatoru Latgalē?", p: "Zvaniet — atbildam diennakti, arī brīvdienās un svētku dienās." }
        }
      }
    }
  },

  ru: {
    langName: "Русский",
    skip: "Перейти к содержимому",
    brandAria: "AUTOPALĪDZĪBA.LV — на главную",
    navAria: "Основная навигация",
    mobileNavAria: "Мобильная навигация",
    nav: {
      pakalpojumi: "Услуги",
      transports: "Транспорт",
      cenas: "Цены",
      galerija: "Галерея",
      citi: "Другие услуги",
      kontakti: "Контакты"
    },
    availabilityChip: "00 – 24",
    headerCallSmall: "Звоните сейчас",
    phonesAria: "Телефоны",
    mainPhoneSmall: "Основной телефон",
    secondPhoneSmall: "Второй телефон",
    langAria: "Языки",
    hero: {
      eyebrow: "Даугавпилс, вся Латвия и Европа.",
      h1a: "00 – 24 Эвакуатор",
      h1b: "в Даугавпилсе",
      taglineAccent: "Поездка прервалась?",
      taglineRest: " Мы уже едем к вам!",
      ctaSmall: "Позвонить",
      ctaNumber: "+371 22002700",
      ctaHint: "Самый быстрый способ получить помощь",
      secondLine: "Нет ответа? Тогда звоните на второй номер",
      mapAlt: "Карта Латвии с выделенной Латгалией — Ты не один на дороге!",
      availability: "Отвечаем круглосуточно"
    },
    servicesMenuAria: "Услуги эвакуатора",
    dock: { call: "Позвонить", location: "Ваше местоположение", dockAria: "Быстрая помощь" },
    footer: {
      tagline: "Круглосуточная эвакуация легковых и грузовых авто в Даугавпилсе, по всей Латвии и Европе.",
      privacy: "Политика конфиденциальности",
      copyright: "© 2026 SOS Evakuators"
    },
    sheet: {
      eyebrow: "Для более быстрой помощи",
      title: "Ваше местоположение.",
      text: "После получения разрешения подготовим сообщение с точной ссылкой на карту. Вы сможете проверить его перед отправкой.",
      button: "Определить моё местоположение",
      fallback: "Или просто позвонить +371 22002700",
      close: "Закрыть окно местоположения",
      backdrop: "Закрыть"
    },
    home: {
      title: "Эвакуатор Даугавпилс 00–24 | Звоните: +371 22002700",
      description: "Круглосуточный эвакуатор в Даугавпилсе и всей Латгалии: эвакуация легковых и грузовых авто, помощь на дороге по всей Латвии и Европе. Звоните +371 22002700.",
      ogTitle: "SOS Evakuators Даугавпилс — 00–24",
      ogDescription: "Эвакуация легковых и грузовых авто, помощь на дороге и транспортировка техники.",
      marqueeAria: "Виды транспорта",
      marquee: ["Легковые авто", "Мотоциклы", "Джипы", "Макси-фургоны", "Грузовые авто", "Строительная техника", "Спецтехника", "Сельхозтехника", "Помощь на дороге", "Круглосуточно", "Вытягивание", "Ремонт шин"],
      capability: {
        eyebrow: "Эвакуация легковых и грузовых авто",
        h2: "Помощь для любого транспорта.",
        p: "Легковые и грузовые авто, автобусы, строительная, специальная и сельскохозяйственная техника.",
        list: ["Автоэвакуатор", "Грузовой эвакуатор", "Трейлер"],
        ctaSmall: "Помощь 00 – 24",
        ctaText: "Позвонить +371 22002700",
        request: "Вызвать эвакуатор",
        mediaCaption: ["Реальный вызов", "AUTOPALĪDZĪBA.LV"],
        mediaAlt: "Коллаж из работ по эвакуации авто, грузовиков и техники"
      },
      services: {
        eyebrow: "Поможем в любой ситуации 24/7",
        h2: "От городского авто до тяжёлой техники.",
        p: "Расскажите, что произошло и где вы находитесь. Мы вышлем к вам подходящий эвакуатор.",
        request: "Вызвать эвакуатор",
        cards: [
          { h3: "Автоэвакуатор", p: "Круглосуточная эвакуация легковых авто, транспортировка с места ДТП, эвакуация с заблокированными или повреждёнными колёсами, вытягивание, заблокированный руль.", link: "auto", alt: "Зелёный минивен на платформе автоэвакуатора в Даугавпилсе" },
          { h3: "Грузовой эвакуатор", p: "Грузовые авто, автобусы, тяжёлая техника.", link: "kravas", alt: "Тяжёлый грузовой эвакуатор на грязной дороге" },
          { h3: "Трейлер", p: "Специальная, строительная и сельскохозяйственная техника.", link: null, alt: "Сельскохозяйственный трактор на платформе трейлера" },
          { h3: "Круглосуточная помощь на дороге", p: "Вытягивание из кювета, снега и грязи. Ремонт или замена шин. Прикуривание. Доставка топлива.", link: "cela", alt: "Замена колеса на сером автомобиле" }
        ]
      },
      process: {
        eyebrow: "Без лишних шагов",
        h2: "Три действия. И помощь уже в пути.",
        p: "Произошла непредвиденная ситуация? Сообщите нам! Мы поможем!",
        callNow: "Позвонить сейчас",
        steps: [
          { h3: "Расскажите, что случилось", p: "Назовите транспорт, проблему и ваше местоположение." },
          { h3: "Договариваемся о работе", p: "Цена зависит от расстояния, транспорта и сложности ситуации." },
          { h3: "Едем на помощь", p: "Работаем круглосуточно, включая выходные и праздничные дни." }
        ]
      },
      pricing: {
        eyebrow: "Понятная отправная точка",
        h2: "Цена начинается с ситуации, а не со скрытого обещания.",
        auto: { label: "Автоэвакуатор", price: "30 €", per: "и от 0,80 € за километр" },
        kravas: { label: "Грузовой эвакуатор", price: "150 €", per: "и от 1,50 € за километр" },
        factors: {
          h3: "Точную цену определяют",
          items: ["расстояние и пункт назначения", "тип транспортного средства", "состояние колёс и доступа", "работы по вытягиванию или погрузке", "ночь, выходные или праздничный день"],
          link: "Уточнить цену"
        }
      },
      editorial: {
        eyebrow: "Одна команда для разного транспорта",
        h2: "Эвакуация от легкового авто до грузовика."
      },
      work: {
        eyebrow: "Реальные вызовы",
        h2: "Наши работы",
        tabs: ["Автоэвакуатор", "Грузовой эвакуатор", "Трейлер", "Помощь на дороге"],
        alts: ["Автоэвакуатор в работе", "Грузовой эвакуатор в работе", "Трейлер перевозит технику", "Помощь на дороге"]
      },
      reviews: {
        eyebrow: "Отзывы Google",
        h2: "Отзывы наших клиентов",
        scoreAria: "Оценка Google 5,0 из 5, 313 отзывов",
        scoreCount: "313 отзывов Google",
        stars: "5 из 5 звёзд",
        action: { q: "Довольны обслуживанием?", h3: "Написать отзыв.", link: "Написать отзыв" },
        source: "Проверено в Google-профиле 01.09.2026.",
        cards: [
          { name: "Дмитрий Масенков", when: "8 месяцев назад", text: "«Приехали быстро, доставили в целости.»" },
          { name: "Slavik Mitrofanov", when: "месяц назад", text: "«Очень быстро приезжают к месту эвакуации.»" },
          { name: "Veronika Sokolovska", when: "2 месяца назад", text: "«Быстро, качественно, адекватные цены.»" }
        ]
      },
      contact: {
        eyebrow: "00–24 помощь на дороге",
        h2: "Скажите, где вы. Остальное решим по дороге.",
        secondSmall: "Второй телефон",
        form: {
          name: "Ваше имя",
          phone: "Телефон",
          phoneHint: "Минимум семь цифр",
          issue: "Что случилось?",
          issuePlaceholder: "Выберите ситуацию",
          issues: ["Авто не едет", "Авто в кювете или в грязи", "Нужна транспортировка", "Грузовое авто или спецтехника", "Другая ситуация"],
          details: "Место или краткое описание",
          detailsPlaceholder: "Например: Даугавпилс, улица 18 Ноября…",
          geoButton: "Определить местоположение на карте",
          mapLink: "Открыть карту",
          photo: "Добавить фото",
          photoOptional: "Необязательно",
          photoPick: "Выбрать фото",
          photoNone: "Фото не выбрано",
          photoHint: "До 4 изображений, суммарно до 20 МБ. На телефоне выберите WhatsApp в меню общего доступа.",
          submit: "Подготовить запрос",
          note: "С фото откроется меню общего доступа телефона — выберите WhatsApp. Без фото откроется WhatsApp с подготовленным сообщением. В срочной ситуации звоните."
        }
      }
    },
    servicesPages: {
      auto: {
        title: "Автоэвакуатор в Даугавпилсе | SOS Evakuators 00–24",
        description: "Круглосуточный автоэвакуатор в Даугавпилсе: эвакуация легковых авто, транспортировка с места ДТП, вытягивание. Звоните +371 22002700.",
        h1: "Автоэвакуатор в Даугавпилсе",
        tagline: "Круглосуточная эвакуация легковых авто в Даугавпилсе и по всей Латвии.",
        breadcrumb: "Автоэвакуатор",
        heroEyebrow: "Даугавпилс, вся Латвия и Европа",
        availability: "Вызовы круглосуточно",
        sections: {
          about: {
            h2: "Эвакуация легковых авто без перерывов.",
            lead: "Авто не едет, произошла авария или нужно доставить машину на сервис? Звоните — вышлем эвакуатор.",
            p: "Перевозим легковые авто, джипы, минивэны и мотоциклы. Работаем также с повреждёнными или заблокированными колёсами, заблокированным рулём и авто, которое не на ходу после ДТП."
          },
          includesH2: "Что входит в услугу",
          includes: ["Транспортировка с места ДТП", "Эвакуация с повреждёнными или заблокированными колёсами", "Эвакуация с заблокированным рулём", "Вытягивание из кювета, снега и грязи", "Эвакуация мотоциклов и квадроциклов", "Доставка на сервис или по другому адресу"],
          photosH2: "Из работ",
          photos: [
            { img: "fleet-01", alt: "Автоэвакуатор загрузил фургон на платформу", caption: "Эвакуация с платформой" },
            { img: "client-collage-auto", alt: "Коллаж из работ по эвакуации легковых авто", caption: "Реальные вызовы" }
          ],
          stepsH2: "Как проходит вызов",
          steps: [
            { h3: "Расскажите, что случилось", p: "Назовите авто, проблему и местоположение." },
            { h3: "Согласуем цену", p: "Цену определяют расстояние, тип авто и сложность ситуации." },
            { h3: "Доставим авто", p: "Аккуратно загрузим и доставим по указанному адресу." }
          ],
          priceH2: "Цена",
          price: { label: "Автоэвакуатор", from: "от", price: "30 €", per: "и от 0,80 € за километр", note: "Точную цену назовём до выезда — звоните." },
          factorsH3: "Точную цену определяют",
          factors: ["расстояние и пункт назначения", "тип транспортного средства", "состояние колёс и доступа", "работы по вытягиванию или погрузке", "ночь, выходные или праздничный день"],
          priceLink: "Уточнить цену",
          relatedH2: "Другие услуги эвакуатора",
          cta: { h2: "Нужен автоэвакуатор?", p: "Звоните — отвечаем круглосуточно, включая выходные и праздники." }
        }
      },
      kravas: {
        title: "Грузовой эвакуатор в Даугавпилсе | SOS Evakuators 00–24",
        description: "Грузовой эвакуатор в Даугавпилсе: эвакуация и транспортировка грузовиков, автобусов и тяжёлой техники. Звоните +371 22002700.",
        h1: "Грузовой эвакуатор в Даугавпилсе",
        tagline: "Эвакуируем грузовики, автобусы и тяжёлую технику.",
        breadcrumb: "Грузовой эвакуатор",
        heroEyebrow: "Даугавпилс, вся Латвия и Европа",
        availability: "Вызовы круглосуточно",
        sections: {
          about: {
            h2: "Эвакуация и транспортировка тяжёлой техники.",
            lead: "Грузовики, тягачи, автобусы и подъёмники требуют мощного эвакуатора. Мы их перевозим.",
            p: "Эвакуируем грузовой транспорт в Даугавпилсе, по всей Латвии и Европе — круглосуточно, в том числе с мест ДТП."
          },
          includesH2: "Что мы эвакуируем",
          includes: ["Грузовые авто и тягачи", "Автобусы и maxi-фургоны", "Строительная и специальная техника", "Сельскохозяйственная техника", "Подъёмники и специализированная техника", "Вытягивание тяжёлой техники из труднодоступных мест"],
          photosH2: "Из работ",
          photos: [
            { img: "hero", alt: "Грузовой эвакуатор перевозит подъёмники в дождь", caption: "Перевозка подъёмников" },
            { img: "fleet-02", alt: "Тяжёлый эвакуатор у грузового авто", caption: "Эвакуация тяжёлой техники" }
          ],
          stepsH2: "Как проходит вызов",
          steps: [
            { h3: "Назовите технику и место", p: "Грузовик, автобус или спецтехника — и где она находится." },
            { h3: "Согласуем цену", p: "Цену определяют расстояние, масса техники и сложность ситуации." },
            { h3: "Транспортируем", p: "Доставим технику по указанному адресу круглосуточно." }
          ],
          priceH2: "Цена",
          price: { label: "Грузовой эвакуатор", from: "от", price: "150 €", per: "и от 1,50 € за километр", note: "Точную цену назовём до выезда — звоните." },
          factorsH3: "Точную цену определяют",
          factors: ["расстояние и пункт назначения", "тип транспортного средства", "состояние колёс и доступа", "работы по вытягиванию или погрузке", "ночь, выходные или праздничный день"],
          priceLink: "Уточнить цену",
          relatedH2: "Другие услуги эвакуатора",
          cta: { h2: "Нужен грузовой эвакуатор?", p: "Звоните — отвечаем круглосуточно, включая выходные и праздники." }
        }
      },
      cela: {
        title: "Помощь на дороге в Даугавпилсе | SOS Evakuators 00–24",
        description: "Круглосуточная помощь на дороге в Даугавпилсе: вытягивание, замена шин, прикуривание, доставка топлива. Звоните +371 22002700.",
        h1: "Помощь на дороге в Даугавпилсе",
        tagline: "Проблема в дороге? Вызывайте помощь — работаем круглосуточно.",
        breadcrumb: "Помощь на дороге",
        heroEyebrow: "Даугавпилс, вся Латвия и Европа",
        availability: "Вызовы круглосуточно",
        sections: {
          about: {
            h2: "Быстрая помощь, когда дорога остановилась.",
            lead: "Сел аккумулятор, пробило колесо или закончилось топливо? Мы приедем к вам.",
            p: "Если на месте решить не удаётся, эвакуируем транспорт до сервиса или другого адреса."
          },
          includesH2: "Что входит в помощь на дороге",
          includes: ["Вытягивание из кювета, снега и грязи", "Ремонт или замена шин", "Прикуривание при разряженном аккумуляторе", "Доставка топлива", "Эвакуация, если на месте решить не удаётся"],
          photosH2: "Из работ",
          photos: [
            { img: "fleet-04", alt: "Эвакуатор загружает фургон на сельской дороге", caption: "Выезд за город" }
          ],
          stepsH2: "Как проходит вызов",
          steps: [
            { h3: "Расскажите, что случилось", p: "Назовите проблему и ваше местоположение." },
            { h3: "Согласуем цену", p: "Цену определяют расстояние и вид помощи." },
            { h3: "Едем на помощь", p: "Приедем к вам круглосуточно, включая выходные." }
          ],
          priceH2: "Цена",
          price: { label: "Помощь на дороге", from: "", price: "по ситуации", per: "Цену определяют расстояние и вид помощи", note: "Цену назовём по телефону — звоните." },
          factorsH3: "Точную цену определяют",
          factors: ["расстояние и пункт назначения", "тип транспортного средства", "состояние колёс и доступа", "работы по вытягиванию или погрузке", "ночь, выходные или праздничный день"],
          priceLink: "Уточнить цену",
          relatedH2: "Другие услуги эвакуатора",
          cta: { h2: "Нужна помощь на дороге?", p: "Звоните — отвечаем круглосуточно, включая выходные и праздники." }
        }
      },
      izvilkshana: {
        title: "Вытягивание авто в Даугавпилсе | SOS Evakuators 00–24",
        description: "Вытягивание авто в Даугавпилсе и по всей Латвии: из кювета, снега, грязи и песка. Звоните +371 22002700.",
        h1: "Вытягивание авто в Даугавпилсе",
        tagline: "Вытянем авто и технику из кювета, снега, грязи и песка.",
        breadcrumb: "Вытягивание авто",
        heroEyebrow: "Даугавпилс, вся Латвия и Европа",
        availability: "Вызовы круглосуточно",
        sections: {
          about: {
            h2: "Вытягивание и за городом.",
            lead: "Авто съехало с дороги или увязло в грязи? Вытащим транспорт и, если нужно, доставим дальше.",
            p: "Работаем как с легковыми авто, так и с тяжёлой техникой — в разную погоду и на сельских дорогах."
          },
          includesH2: "Что входит в вытягивание",
          includes: ["Вытягивание из кювета", "Вытягивание из снега", "Вытягивание из грязи и песка", "Вытягивание легковых авто и тяжёлой техники", "Дальнейшая транспортировка после вытягивания"],
          photosH2: "Из работ",
          photos: [
            { img: "fleet-05", alt: "Тяжёлый эвакуатор вытягивает технику из грязной дороги", caption: "Вытягивание на сельской дороге" },
            { img: "fleet-04", alt: "Эвакуатор загружает фургон на сельской дороге", caption: "Погрузка после вытягивания" }
          ],
          stepsH2: "Как проходит вызов",
          steps: [
            { h3: "Назовите место", p: "Где находится транспорт и какова ситуация." },
            { h3: "Согласуем цену", p: "Цену определяют расстояние, тип техники и сложность вытягивания." },
            { h3: "Вытягиваем", p: "Вытащим транспорт и при необходимости транспортируем." }
          ],
          priceH2: "Цена",
          price: { label: "Вытягивание авто", from: "", price: "по ситуации", per: "Цену определяют сложность вытягивания и расстояние", note: "Цену назовём по телефону — звоните." },
          factorsH3: "Точную цену определяют",
          factors: ["расстояние и пункт назначения", "тип транспортного средства", "состояние колёс и доступа", "работы по вытягиванию или погрузке", "ночь, выходные или праздничный день"],
          priceLink: "Уточнить цену",
          relatedH2: "Другие услуги эвакуатора",
          cta: { h2: "Авто увязло? Вызывайте вытягивание.", p: "Звоните — отвечаем круглосуточно, включая выходные и праздники." }
        }
      },
      latgale: {
        title: "Эвакуатор в Латгалии | SOS Evakuators 00–24",
        description: "Эвакуатор по всей Латгалии: база в Даугавпилсе, круглосуточные выезды и транспортировка по всей Латвии и Европе. Звоните +371 22002700.",
        h1: "Эвакуатор в Латгалии",
        tagline: "База в Даугавпилсе — выезды по всей Латгалии, транспортировка по всей Латвии и Европе.",
        breadcrumb: "Эвакуатор в Латгалии",
        heroEyebrow: "Даугавпилс, вся Латвия и Европа",
        availability: "Вызовы круглосуточно",
        sections: {
          about: {
            h2: "Круглосуточная эвакуация по всему региону.",
            lead: "Наша база — Даугавпилс, но мы выезжаем на вызовы по всей Латгалии и транспортируем по всей Латвии и Европе.",
            p: "Где бы вы ни находились — в Даугавпилсе, Резекне, Краславе, Прейли, Лудзе или другом месте Латгалии, — звоните: работаем круглосуточно, включая выходные и праздники."
          },
          includesH2: "Услуги в регионе",
          includes: ["Автоэвакуатор", "Грузовой эвакуатор", "Помощь на дороге", "Вытягивание авто", "Транспортировка техники между городами"],
          photosH2: "Из работ",
          photos: [
            { img: "fleet-03", alt: "Трейлер с техникой на сельской дороге", caption: "Транспортировка техники по региону" },
            { img: "fleet-01", alt: "Автоэвакуатор загрузил фургон на платформу", caption: "Вызовы круглосуточно" }
          ],
          stepsH2: "Как проходит вызов",
          steps: [
            { h3: "Позвоните и назовите место", p: "Город или дорога в Латгалии, где вы находитесь." },
            { h3: "Согласуем цену", p: "Цену определяет расстояние до места и объём работы." },
            { h3: "Едем на помощь", p: "Выедем к вам и доставим по нужному адресу." }
          ],
          priceH2: "Цена",
          price: { label: "Вызов по Латгалии", from: "", price: "по ситуации", per: "Цену определяют расстояние и объём работы", note: "Цену назовём по телефону — звоните." },
          factorsH3: "Точную цену определяют",
          factors: ["расстояние и пункт назначения", "тип транспортного средства", "состояние колёс и доступа", "работы по вытягиванию или погрузке", "ночь, выходные или праздничный день"],
          priceLink: "Уточнить цену",
          relatedH2: "Другие услуги эвакуатора",
          cta: { h2: "Нужен эвакуатор в Латгалии?", p: "Звоните — отвечаем круглосуточно, включая выходные и праздники." }
        }
      }
    }
  },

  en: {
    langName: "English",
    skip: "Skip to content",
    brandAria: "AUTOPALĪDZĪBA.LV — home",
    navAria: "Main navigation",
    mobileNavAria: "Mobile navigation",
    nav: {
      pakalpojumi: "Services",
      transports: "Vehicles",
      cenas: "Prices",
      galerija: "Gallery",
      citi: "Other services",
      kontakti: "Contacts"
    },
    availabilityChip: "00 – 24",
    headerCallSmall: "Call now",
    phonesAria: "Phone numbers",
    mainPhoneSmall: "Main phone",
    secondPhoneSmall: "Second phone",
    langAria: "Languages",
    hero: {
      eyebrow: "Daugavpils, all of Latvia and Europe.",
      h1a: "00 – 24 Tow Truck",
      h1b: "in Daugavpils",
      taglineAccent: "Trip cut short?",
      taglineRest: " We're already on our way!",
      ctaSmall: "Call",
      ctaNumber: "+371 22002700",
      ctaHint: "The fastest way to get help",
      secondLine: "No answer? Then call the second number",
      mapAlt: "Map of Latvia with Latgale highlighted — You are not alone on the road!",
      availability: "We answer around the clock"
    },
    servicesMenuAria: "Tow truck services",
    dock: { call: "Call", location: "Your location", dockAria: "Quick help" },
    footer: {
      tagline: "Around-the-clock car and truck towing in Daugavpils, across Latvia and Europe.",
      privacy: "Privacy policy",
      copyright: "© 2026 SOS Evakuators"
    },
    sheet: {
      eyebrow: "For faster help",
      title: "Your location.",
      text: "After you grant permission, we will prepare a message with an exact map link. You can review it before sending.",
      button: "Determine my location",
      fallback: "Or simply call +371 22002700",
      close: "Close the location dialog",
      backdrop: "Close"
    },
    home: {
      title: "Tow Truck Daugavpils 24/7 | Call +371 22002700",
      description: "24/7 tow truck in Daugavpils and across Latgale: car and heavy vehicle towing, roadside assistance across Latvia and Europe. Call +371 22002700.",
      ogTitle: "SOS Evakuators Daugavpils — 00–24",
      ogDescription: "Car and truck towing, roadside assistance and machinery transport.",
      marqueeAria: "Vehicle types",
      marquee: ["Cars", "Motorcycles", "SUVs", "Maxi vans", "Trucks", "Construction machinery", "Heavy equipment", "Agricultural machinery", "Roadside assistance", "Around the clock", "Vehicle recovery", "Tyre repair"],
      capability: {
        eyebrow: "Car and truck towing",
        h2: "Help for every vehicle.",
        p: "Cars, trucks, buses, construction, heavy and agricultural machinery.",
        list: ["Car towing", "Truck towing", "Trailer transport"],
        ctaSmall: "Help 00 – 24",
        ctaText: "Call +371 22002700",
        request: "Request a tow",
        mediaCaption: ["A real call-out", "AUTOPALĪDZĪBA.LV"],
        mediaAlt: "Collage of car, truck and machinery towing jobs"
      },
      services: {
        eyebrow: "We help in any situation, 24/7",
        h2: "From a city car to heavy machinery.",
        p: "Tell us what happened and where you are. We will send the right tow truck to you.",
        request: "Request a tow",
        cards: [
          { h3: "Car towing", p: "Around-the-clock car towing, transport from an accident scene, towing with blocked or damaged wheels, vehicle recovery, locked steering.", link: "auto", alt: "Green minivan loaded on a tow-truck platform in Daugavpils" },
          { h3: "Truck towing", p: "Trucks, buses, heavy machinery.", link: "kravas", alt: "Heavy tow truck on a muddy road" },
          { h3: "Trailer transport", p: "Construction, heavy and agricultural machinery.", link: null, alt: "Agricultural tractor secured on a trailer platform" },
          { h3: "24/7 roadside assistance", p: "Recovery from ditches, snow and mud. Tyre repair or replacement. Jump start. Fuel delivery.", link: "cela", alt: "Roadside wheel change on a grey car" }
        ]
      },
      process: {
        eyebrow: "No unnecessary steps",
        h2: "Three steps. And help is on the way.",
        p: "An unexpected problem? Let us know! We will help!",
        callNow: "Call now",
        steps: [
          { h3: "Tell us what happened", p: "Name the vehicle, the problem and your location." },
          { h3: "We agree on the job", p: "The price depends on distance, vehicle and complexity." },
          { h3: "We head your way", p: "We work around the clock, including weekends and holidays." }
        ]
      },
      pricing: {
        eyebrow: "A clear starting point",
        h2: "The price starts with the situation, not a hidden promise.",
        auto: { label: "Car towing", price: "30 €", per: "and from 0.80 € per kilometre" },
        kravas: { label: "Truck towing", price: "150 €", per: "and from 1.50 € per kilometre" },
        factors: {
          h3: "The exact price depends on",
          items: ["distance and destination", "vehicle type", "wheel and access condition", "recovery or loading work", "night, weekend or holiday"],
          link: "Find out the price"
        }
      },
      editorial: {
        eyebrow: "One team for many vehicles",
        h2: "Towing from a passenger car to a truck."
      },
      work: {
        eyebrow: "Real call-outs",
        h2: "Our work",
        tabs: ["Car towing", "Truck towing", "Trailer transport", "Roadside assistance"],
        alts: ["Car tow truck at work", "Truck tow truck at work", "Trailer transporting machinery", "Roadside assistance"]
      },
      reviews: {
        eyebrow: "Google reviews",
        h2: "What our clients say",
        scoreAria: "Google rating 5.0 out of 5, 313 reviews",
        scoreCount: "313 Google reviews",
        stars: "5 out of 5 stars",
        action: { q: "Happy with the service?", h3: "Write a review.", link: "Write a review" },
        source: "Checked in the Google profile on 01.09.2026.",
        cards: [
          { name: "Дмитрий Масенков", when: "8 months ago", text: "«Приехали быстро, доставили в целости.»" },
          { name: "Slavik Mitrofanov", when: "a month ago", text: "«Очень быстро приезжают к месту эвакуации.»" },
          { name: "Veronika Sokolovska", when: "2 months ago", text: "«Быстро, качественно, адекватные цены.»" }
        ]
      },
      contact: {
        eyebrow: "00–24 roadside assistance",
        h2: "Tell us where you are. We'll sort the rest on the way.",
        secondSmall: "Second phone",
        form: {
          name: "Your name",
          phone: "Phone",
          phoneHint: "At least seven digits",
          issue: "What happened?",
          issuePlaceholder: "Choose the situation",
          issues: ["Car won't drive", "Car in a ditch or mud", "Transportation needed", "Truck or heavy machinery", "Other situation"],
          details: "Location or a short description",
          detailsPlaceholder: "For example: Daugavpils, 18. novembra iela…",
          geoButton: "Determine location on the map",
          mapLink: "Open the map",
          photo: "Add a photo",
          photoOptional: "Optional",
          photoPick: "Choose photos",
          photoNone: "No photo selected",
          photoHint: "Up to 4 images, 20 MB in total. On your phone, choose WhatsApp in the share sheet.",
          submit: "Prepare the request",
          note: "With photos, the phone's share sheet opens — choose WhatsApp. Without photos, WhatsApp opens with a prepared message. In an urgent situation, call."
        }
      }
    },
    servicesPages: {
      auto: {
        title: "Tow Truck in Daugavpils | SOS Evakuators 00–24",
        description: "24/7 tow truck in Daugavpils: car towing, transport from an accident scene, vehicle recovery. Call +371 22002700.",
        h1: "Tow Truck in Daugavpils",
        tagline: "Around-the-clock car towing in Daugavpils and across Latvia.",
        breadcrumb: "Tow truck",
        heroEyebrow: "Daugavpils, all of Latvia and Europe",
        availability: "Call-outs around the clock",
        sections: {
          about: {
            h2: "Car towing without interruptions.",
            lead: "Car won't drive, an accident happened, or the car has to reach a garage? Call — we'll send a tow truck.",
            p: "We transport cars, SUVs, minibuses and motorcycles. We also handle damaged or blocked wheels, locked steering and vehicles that are not drivable after a road accident."
          },
          includesH2: "What the service includes",
          includes: ["Transport from an accident scene", "Towing with damaged or blocked wheels", "Towing with locked steering", "Recovery from ditches, snow and mud", "Motorcycle and quad bike towing", "Delivery to a garage or any address"],
          photosH2: "From the job",
          photos: [
            { img: "fleet-01", alt: "Tow truck with a van loaded on its platform", caption: "Flatbed towing" },
            { img: "client-collage-auto", alt: "Collage of car towing jobs", caption: "Real call-outs" }
          ],
          stepsH2: "How a call works",
          steps: [
            { h3: "Tell us what happened", p: "Name the car, the problem and your location." },
            { h3: "We agree on the price", p: "The price depends on distance, vehicle type and complexity." },
            { h3: "We deliver the car", p: "We load it carefully and deliver it to the address." }
          ],
          priceH2: "Price",
          price: { label: "Car towing", from: "from", price: "30 €", per: "and from 0.80 € per kilometre", note: "The exact price is confirmed before departure — call us." },
          factorsH3: "The exact price depends on",
          factors: ["distance and destination", "vehicle type", "wheel and access condition", "recovery or loading work", "night, weekend or holiday"],
          priceLink: "Find out the price",
          relatedH2: "Other tow truck services",
          cta: { h2: "Need a tow truck?", p: "Call us — we answer around the clock, including weekends and holidays." }
        }
      },
      kravas: {
        title: "Heavy Vehicle Towing in Daugavpils | SOS Evakuators 00–24",
        description: "Heavy tow truck in Daugavpils: towing and transport of trucks, buses and heavy machinery. Call +371 22002700.",
        h1: "Heavy Vehicle Towing in Daugavpils",
        tagline: "We tow trucks, buses and heavy machinery.",
        breadcrumb: "Heavy towing",
        heroEyebrow: "Daugavpils, all of Latvia and Europe",
        availability: "Call-outs around the clock",
        sections: {
          about: {
            h2: "Heavy machinery towing and transport.",
            lead: "Trucks, tractor units, buses and scissor lifts need a powerful tow truck. We move them.",
            p: "We evacuate heavy vehicles in Daugavpils, across Latvia and Europe — around the clock, including from accident scenes."
          },
          includesH2: "What we tow",
          includes: ["Trucks and tractor units", "Buses and maxi vans", "Construction and heavy equipment", "Agricultural machinery", "Scissor lifts and specialised machinery", "Recovery of heavy machinery from hard-to-reach places"],
          photosH2: "From the job",
          photos: [
            { img: "hero", alt: "Heavy tow truck carrying scissor lifts in the rain", caption: "Scissor lift transport" },
            { img: "fleet-02", alt: "Heavy tow truck next to a truck", caption: "Heavy machinery towing" }
          ],
          stepsH2: "How a call works",
          steps: [
            { h3: "Name the vehicle and place", p: "Truck, bus or machinery — and where it is." },
            { h3: "We agree on the price", p: "The price depends on distance, vehicle weight and complexity." },
            { h3: "We transport it", p: "We deliver the machinery to the address, around the clock." }
          ],
          priceH2: "Price",
          price: { label: "Truck towing", from: "from", price: "150 €", per: "and from 1.50 € per kilometre", note: "The exact price is confirmed before departure — call us." },
          factorsH3: "The exact price depends on",
          factors: ["distance and destination", "vehicle type", "wheel and access condition", "recovery or loading work", "night, weekend or holiday"],
          priceLink: "Find out the price",
          relatedH2: "Other tow truck services",
          cta: { h2: "Need heavy towing?", p: "Call us — we answer around the clock, including weekends and holidays." }
        }
      },
      cela: {
        title: "Roadside Assistance in Daugavpils | SOS Evakuators 00–24",
        description: "24/7 roadside assistance in Daugavpils: recovery, tyre change, jump start, fuel delivery. Call +371 22002700.",
        h1: "Roadside Assistance in Daugavpils",
        tagline: "A problem on the road? Call for help — we work around the clock.",
        breadcrumb: "Roadside assistance",
        heroEyebrow: "Daugavpils, all of Latvia and Europe",
        availability: "Call-outs around the clock",
        sections: {
          about: {
            h2: "Fast help when the road stops.",
            lead: "Flat battery, a punctured tyre or out of fuel? We will come to you.",
            p: "If it cannot be fixed on the spot, we tow the vehicle to a garage or another address."
          },
          includesH2: "What roadside assistance includes",
          includes: ["Recovery from ditches, snow and mud", "Tyre repair or replacement", "Jump start for a flat battery", "Fuel delivery", "Towing if it can't be fixed on the spot"],
          photosH2: "From the job",
          photos: [
            { img: "fleet-04", alt: "Tow truck loading a van on a rural road", caption: "Call-outs outside the city" }
          ],
          stepsH2: "How a call works",
          steps: [
            { h3: "Tell us what happened", p: "Name the problem and your location." },
            { h3: "We agree on the price", p: "The price depends on distance and the type of help." },
            { h3: "We head your way", p: "We come to you around the clock, including weekends." }
          ],
          priceH2: "Price",
          price: { label: "Roadside assistance", from: "", price: "depends on the situation", per: "The price depends on distance and the type of help", note: "We will quote the price over the phone — call us." },
          factorsH3: "The exact price depends on",
          factors: ["distance and destination", "vehicle type", "wheel and access condition", "recovery or loading work", "night, weekend or holiday"],
          priceLink: "Find out the price",
          relatedH2: "Other tow truck services",
          cta: { h2: "Need roadside help?", p: "Call us — we answer around the clock, including weekends and holidays." }
        }
      },
      izvilkshana: {
        title: "Vehicle Recovery in Daugavpils | SOS Evakuators 00–24",
        description: "Vehicle recovery in Daugavpils and across Latvia: recovery from ditches, snow, mud and sand. Call +371 22002700.",
        h1: "Vehicle Recovery in Daugavpils",
        tagline: "We recover cars and machinery from ditches, snow, mud and sand.",
        breadcrumb: "Vehicle recovery",
        heroEyebrow: "Daugavpils, all of Latvia and Europe",
        availability: "Call-outs around the clock",
        sections: {
          about: {
            h2: "Recovery outside the city too.",
            lead: "Car off the road or stuck in the mud? We recover the vehicle and, if needed, take it further.",
            p: "We handle both passenger cars and heavy machinery — in all weather and on rural roads."
          },
          includesH2: "What recovery includes",
          includes: ["Recovery from a ditch", "Recovery from snow", "Recovery from mud and sand", "Recovery of cars and heavy machinery", "Onward transport after recovery"],
          photosH2: "From the job",
          photos: [
            { img: "fleet-05", alt: "Heavy tow truck recovering machinery from a muddy road", caption: "Recovery on a rural road" },
            { img: "fleet-04", alt: "Tow truck loading a van on a rural road", caption: "Loading after recovery" }
          ],
          stepsH2: "How a call works",
          steps: [
            { h3: "Name the place", p: "Where the vehicle is and what the situation is." },
            { h3: "We agree on the price", p: "The price depends on distance, vehicle type and recovery complexity." },
            { h3: "We recover it", p: "We recover the vehicle and transport it if needed." }
          ],
          priceH2: "Price",
          price: { label: "Vehicle recovery", from: "", price: "depends on the situation", per: "The price depends on recovery complexity and distance", note: "We will quote the price over the phone — call us." },
          factorsH3: "The exact price depends on",
          factors: ["distance and destination", "vehicle type", "wheel and access condition", "recovery or loading work", "night, weekend or holiday"],
          priceLink: "Find out the price",
          relatedH2: "Other tow truck services",
          cta: { h2: "Vehicle stuck? Call for recovery.", p: "Call us — we answer around the clock, including weekends and holidays." }
        }
      },
      latgale: {
        title: "Tow Truck in Latgale | SOS Evakuators 00–24",
        description: "Tow truck across Latgale: based in Daugavpils, 24/7 call-outs and transport across Latvia and Europe. Call +371 22002700.",
        h1: "Tow Truck in Latgale",
        tagline: "Based in Daugavpils — call-outs across Latgale, transport across Latvia and Europe.",
        breadcrumb: "Tow truck in Latgale",
        heroEyebrow: "Daugavpils, all of Latvia and Europe",
        availability: "Call-outs around the clock",
        sections: {
          about: {
            h2: "Around-the-clock towing across the region.",
            lead: "We are based in Daugavpils, but we answer call-outs across Latgale — and transport across Latvia and Europe.",
            p: "Whether you are in Daugavpils, Rēzekne, Krāslava, Preiļi, Ludza or another place in Latgale, call us — we work around the clock, including weekends and holidays."
          },
          includesH2: "Services in the region",
          includes: ["Car towing", "Truck towing", "Roadside assistance", "Vehicle recovery", "Machinery transport between cities"],
          photosH2: "From the job",
          photos: [
            { img: "fleet-03", alt: "Trailer with machinery on a rural road", caption: "Machinery transport in the region" },
            { img: "fleet-01", alt: "Tow truck with a van loaded on its platform", caption: "Call-outs around the clock" }
          ],
          stepsH2: "How a call works",
          steps: [
            { h3: "Call and name the place", p: "The town or road in Latgale where you are." },
            { h3: "We agree on the price", p: "The price depends on the distance to you and the scope of work." },
            { h3: "We head your way", p: "We come to you and deliver to the address you need." }
          ],
          priceH2: "Price",
          price: { label: "Call-out in Latgale", from: "", price: "depends on the situation", per: "The price depends on distance and the scope of work", note: "We will quote the price over the phone — call us." },
          factorsH3: "The exact price depends on",
          factors: ["distance and destination", "vehicle type", "wheel and access condition", "recovery or loading work", "night, weekend or holiday"],
          priceLink: "Find out the price",
          relatedH2: "Other tow truck services",
          cta: { h2: "Need a tow truck in Latgale?", p: "Call us — we answer around the clock, including weekends and holidays." }
        }
      }
    }
  }
};

export const BUSINESS = {
  name: "SOS Evakuators",
  alternateName: "AUTOPALĪDZĪBA.LV",
  phone: "+37122002700",
  phoneDisplay: "+371 22002700",
  phoneSecondary: "+37120091762",
  phoneSecondaryDisplay: "+371 20091762",
  email: "tktrans@inbox.lv",
  sameAs: ["https://autopalidziba.lv/", "https://www.facebook.com/autopalidziba.lv/", "https://www.google.com/maps/place/?q=place_id:ChIJ7-Ug3hGVwkYRDUXr543lqOA"],
  rating: { value: "5", count: 313, noteChecked: "01.09.2026" },
  logo: "assets/images/logo.svg",
  defaultOgImage: "assets/images/client-collage-hero-v2-1200.webp"
};

// Per-service og:image (jpg for maximal social crawler compatibility).
export const SERVICE_OG = {
  auto: "assets/images/fleet-01-1200.webp",
  kravas: "assets/images/hero-1200.webp",
  cela: "assets/images/fleet-04-1200.webp",
  izvilkshana: "assets/images/fleet-05-1200.webp",
  latgale: "assets/images/fleet-03-1200.webp"
};
