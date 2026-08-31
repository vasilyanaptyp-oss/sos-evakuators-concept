(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const locationSheet = document.querySelector(".location-sheet");
  const locationTriggers = document.querySelectorAll("[data-location-trigger]");
  const closeLocationButtons = document.querySelectorAll("[data-close-location]");
  const shareLocation = document.querySelector("#share-location");
  const locationStatus = document.querySelector(".location-status");
  const form = document.querySelector("#request-form");
  let lastLocationTrigger = null;

  const scriptPromises = new Map();
  const loadScript = (src) => {
    if (scriptPromises.has(src)) return scriptPromises.get(src);
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.append(script);
    });
    scriptPromises.set(src, promise);
    return promise;
  };
  const ensureThree = () => window.THREE
    ? Promise.resolve()
    : loadScript("assets/vendor/three.min.js");

  if (!reducedMotion && window.matchMedia("(min-width: 821px)").matches) {
    ensureThree().then(() => loadScript("assets/js/radar3d.js")).catch(() => {});
  } else {
    document.querySelector("#heroRadarCanvas")?.remove();
  }

  const headerSentinel = document.querySelector(".header-sentinel");
  if (headerSentinel && "IntersectionObserver" in window) {
    const headerObserver = new IntersectionObserver(([entry]) => {
      header.classList.toggle("is-scrolled", !entry.isIntersecting);
    });
    headerObserver.observe(headerSentinel);
  }

  const focusableElements = (container) => [...container.querySelectorAll("a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex='-1'])")];

  const trapFocus = (event, container) => {
    if (event.key !== "Tab") return;
    const items = focusableElements(container);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const setMenu = (open) => {
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Aizvērt izvēlni" : "Atvērt izvēlni");
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    mobileMenu.inert = !open;
    document.body.classList.toggle("menu-open", open);
    if (open) window.setTimeout(() => focusableElements(mobileMenu)[0]?.focus(), reducedMotion ? 0 : 400);
  };

  menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  mobileMenu.addEventListener("keydown", (event) => {
    trapFocus(event, mobileMenu);
  });

  const setLocationSheet = (open, trigger = null) => {
    if (open) lastLocationTrigger = trigger;
    locationSheet.classList.toggle("is-open", open);
    locationSheet.setAttribute("aria-hidden", String(!open));
    locationSheet.inert = !open;
    document.body.classList.toggle("sheet-open", open);
    if (open) {
      window.setTimeout(() => shareLocation.focus(), reducedMotion ? 0 : 350);
    } else {
      lastLocationTrigger?.focus();
    }
  };

  locationTriggers.forEach((button) => button.addEventListener("click", () => setLocationSheet(true, button)));
  closeLocationButtons.forEach((button) => button.addEventListener("click", () => setLocationSheet(false)));
  locationSheet.addEventListener("keydown", (event) => {
    trapFocus(event, locationSheet);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (locationSheet.classList.contains("is-open")) {
      setLocationSheet(false);
      return;
    }
    if (mobileMenu.classList.contains("is-open")) {
      setMenu(false);
      menuButton.focus();
    }
  });

  shareLocation.addEventListener("click", () => {
    if (!navigator.geolocation) {
      locationStatus.textContent = "Šī ierīce neatbalsta atrašanās vietas noteikšanu. Lūdzu, zvaniet.";
      return;
    }
    shareLocation.disabled = true;
    shareLocation.textContent = "Nosakām atrašanās vietu…";
    locationStatus.textContent = "";
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const mapUrl = `https://maps.google.com/?q=${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`;
        const body = encodeURIComponent(`Labdien! Man nepieciešama palīdzība uz ceļa. Mana atrašanās vieta: ${mapUrl}`);
        window.location.href = `sms:+37122002700?body=${body}`;
        shareLocation.disabled = false;
        shareLocation.textContent = "Noteikt manu atrašanās vietu";
        locationStatus.textContent = "Atrašanās vieta atrasta. Atveram īsziņu pārbaudei.";
      },
      () => {
        shareLocation.disabled = false;
        shareLocation.textContent = "Mēģināt vēlreiz";
        locationStatus.textContent = "Neizdevās noteikt atrašanās vietu. Pārbaudiet atļauju vai zvaniet.";
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  });

  const galleryTabs = [...document.querySelectorAll("[data-gallery-tab]")];
  const galleryPanels = [...document.querySelectorAll("[data-gallery-panel]")];

  const activateGallery = (tab, moveFocus = false) => {
    const target = tab.dataset.galleryTab;
    galleryTabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });
    galleryPanels.forEach((panel) => {
      panel.hidden = panel.dataset.galleryPanel !== target;
    });
    if (moveFocus) tab.focus();
  };

  galleryTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateGallery(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % galleryTabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + galleryTabs.length) % galleryTabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = galleryTabs.length - 1;
      else return;
      event.preventDefault();
      activateGallery(galleryTabs[nextIndex], true);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = form.querySelector(".form-status");
    const required = [...form.querySelectorAll("[required]")];
    required.forEach((field) => field.classList.remove("is-invalid"));
    const phoneField = form.elements.phone;
    const invalid = required.filter((field) => !field.value.trim());
    if (phoneField.value.trim() && !/[0-9]{6,}/.test(phoneField.value.replace(/\s/g, ""))) invalid.push(phoneField);
    if (invalid.length) {
      invalid.forEach((field) => field.classList.add("is-invalid"));
      invalid[0].focus();
      status.textContent = invalid.includes(phoneField) && phoneField.value.trim()
        ? "Lūdzu, pārbaudiet tālruņa numuru — nepieciešami vismaz seši cipari."
        : "Lūdzu, aizpildiet vārdu, tālruni un situāciju.";
      return;
    }
    const data = new FormData(form);
    const subject = encodeURIComponent("Palīdzības pieprasījums no mājaslapas koncepta");
    const body = encodeURIComponent([
      `Vārds: ${data.get("name")}`,
      `Tālrunis: ${data.get("phone")}`,
      `Situācija: ${data.get("issue")}`,
      `Vieta / apraksts: ${data.get("details") || "Nav norādīts"}`
    ].join("\n"));
    status.textContent = "Atveram e-pasta lietotni ar sagatavotu pieprasījumu.";
    window.location.href = `mailto:tktrans@inbox.lv?subject=${subject}&body=${body}`;
  });

  const initMotion = () => {
    if (reducedMotion || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.set(".hero-line > span", { yPercent: 110 });
    gsap.set(".reveal-item", { opacity: 0, y: 24 });
    const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
    intro
      .to(".hero-line > span", { yPercent: 0, duration: 1.2, stagger: 0.12 })
      .to(".reveal-item", { opacity: 1, y: 0, duration: 0.85, stagger: 0.1 }, "-=.65")
      .from(".hero-media", { clipPath: "polygon(50% 40%,50% 40%,50% 60%,50% 60%,50% 60%,50% 40%)", duration: 1.25, ease: "power3.inOut" }, "-=1.15");

    gsap.to(".hero-media img", {
      yPercent: 9,
      scale: 1.16,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    gsap.utils.toArray(".section-heading h2, .pricing-head h2, .work-heading h2, .contact-copy h2").forEach((heading) => {
      gsap.from(heading, {
        y: 70,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: heading, start: "top 86%", once: true }
      });
    });

    gsap.utils.toArray(".service-card").forEach((card, index) => {
      gsap.from(card, {
        y: 55,
        opacity: 0,
        duration: .9,
        delay: index * .04,
        ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 88%", once: true }
      });
    });

    const processMedia = gsap.matchMedia();
    processMedia.add("(min-width: 821px)", () => {
      const steps = gsap.utils.toArray(".process-step");
      steps.forEach((step) => {
        gsap.fromTo(step, { opacity: .28 }, {
          opacity: 1,
          scrollTrigger: { trigger: step, start: "top 65%", end: "bottom 50%", scrub: true }
        });
      });
    });

    gsap.fromTo(".inline-image", { width: 0, opacity: 0 }, {
      width: "1.4em",
      opacity: 1,
      ease: "power3.inOut",
      scrollTrigger: { trigger: ".editorial", start: "top 70%", end: "center 45%", scrub: 1 }
    });

    gsap.utils.toArray(".gallery-panel:not([hidden]) img, .service-card--photo img").forEach((image) => {
      gsap.fromTo(image, { scale: .92, opacity: .55 }, {
        scale: 1,
        opacity: 1,
        ease: "none",
        scrollTrigger: { trigger: image, start: "top bottom", end: "center center", scrub: true }
      });
    });

    document.querySelectorAll(".magnetic").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") return;
        const rect = button.getBoundingClientRect();
        gsap.to(button, { x: (event.clientX - rect.left - rect.width / 2) * .12, y: (event.clientY - rect.top - rect.height / 2) * .12, duration: .35, ease: "power2.out" });
      });
      button.addEventListener("pointerleave", () => gsap.to(button, { x: 0, y: 0, duration: .65, ease: "elastic.out(1,.4)" }));
    });
  };

  if (!reducedMotion && window.matchMedia("(min-width: 821px)").matches) {
    loadScript("assets/vendor/gsap.min.js")
      .then(() => loadScript("assets/vendor/ScrollTrigger.min.js"))
      .then(initMotion)
      .catch(() => {});
  }
})();
