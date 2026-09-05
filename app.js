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
  const appScript = document.currentScript;
  const base = appScript?.getAttribute("data-base") || "";
  let lastLocationTrigger = null;

  const track = (event, params) => {
    window.SOSAnalytics?.track(event, params);
  };

  const MESSAGES = {
    lv: {
      menuOpen: "Atvērt izvēlni",
      menuClose: "Aizvērt izvēlni",
      smsBody: "Labdien! Man nepieciešama palīdzība uz ceļa. Mana atrašanās vieta: ",
      smsFound: "Atrašanās vieta atrasta. Atveram īsziņu pārbaudei.",
      smsRetry: "Mēģināt vēlreiz",
      smsFailed: "Neizdevās noteikt atrašanās vietu. Pārbaudiet atļauju vai zvaniet.",
      geoUnsupported: "Šī ierīce neatbalsta atrašanās vietas noteikšanu. Lūdzu, zvaniet.",
      geoLocating: "Nosakām atrašanās vietu…",
      geoButton: "Noteikt manu atrašanās vietu",
      formGeoUnsupported: "Šī ierīce neatbalsta atrašanās vietas noteikšanu. Ievadiet adresi manuāli.",
      formGeoLocating: "Nosakām atrašanās vietu…",
      formGeoRetry: "Mēģināt vēlreiz",
      formGeoFailed: "Neizdevās noteikt atrašanās vietu. Pārbaudiet atļauju vai ievadiet adresi manuāli.",
      formGeoPrefix: "Precīza atrašanās vieta:",
      formGeoUpdate: "Atjaunot atrašanās vietu",
      formGeoAdded: "Atrašanās vieta pievienota pieprasījumam. Karti varat pārbaudīt pirms nosūtīšanas.",
      photoNone: "Foto nav izvēlēts",
      photoSingle: (name) => name,
      photoMany: (count) => `Izvēlēti ${count} foto`,
      phoneInvalid: "Lūdzu, pārbaudiet tālruņa numuru — nepieciešami vismaz septiņi cipari.",
      requiredMissing: "Lūdzu, aizpildiet vārdu, tālruni un situāciju.",
      photosOnlyImages: "Lūdzu, pievienojiet tikai attēlu failus.",
      photosTooMany: "Pievienojiet ne vairāk kā 4 attēlus, kopā līdz 20 MB.",
      shareOpening: "Atveram kopīgošanas izvēlni — izvēlieties WhatsApp.",
      shareDone: "Pieprasījums nodots kopīgošanai.",
      shareCancelled: "Kopīgošana atcelta. Varat mēģināt vēlreiz vai piezvanīt.",
      photosReminder: (count) => `Foto: izvēlēti ${count} — lūdzu, pievienojiet tos šai WhatsApp sarunai.`,
      waOpeningPhotos: "Atveram WhatsApp. Pievienojiet izvēlētos foto sarunai.",
      waOpening: "Atveram WhatsApp ar sagatavotu pieprasījumu.",
      requestTitle: "Palīdzības pieprasījums",
      labelName: "Vārds",
      labelPhone: "Tālrunis",
      labelIssue: "Situācija",
      labelPlace: "Vieta / apraksts",
      labelNotSpecified: "Nav norādīts"
    },
    ru: {
      menuOpen: "Открыть меню",
      menuClose: "Закрыть меню",
      smsBody: "Здравствуйте! Мне нужна помощь на дороге. Моё местоположение: ",
      smsFound: "Местоположение определено. Открываем сообщение для проверки.",
      smsRetry: "Попробовать снова",
      smsFailed: "Не удалось определить местоположение. Проверьте разрешение или позвоните.",
      geoUnsupported: "Это устройство не поддерживает определение местоположения. Пожалуйста, позвоните.",
      geoLocating: "Определяем местоположение…",
      geoButton: "Определить моё местоположение",
      formGeoUnsupported: "Это устройство не поддерживает определение местоположения. Введите адрес вручную.",
      formGeoLocating: "Определяем местоположение…",
      formGeoRetry: "Попробовать снова",
      formGeoFailed: "Не удалось определить местоположение. Проверьте разрешение или введите адрес вручную.",
      formGeoPrefix: "Точное местоположение:",
      formGeoUpdate: "Обновить местоположение",
      formGeoAdded: "Местоположение добавлено к запросу. Карту можно проверить перед отправкой.",
      photoNone: "Фото не выбрано",
      photoSingle: (name) => name,
      photoMany: (count) => `Выбрано фото: ${count}`,
      phoneInvalid: "Пожалуйста, проверьте номер телефона — требуется минимум семь цифр.",
      requiredMissing: "Пожалуйста, заполните имя, телефон и ситуацию.",
      photosOnlyImages: "Пожалуйста, добавляйте только файлы изображений.",
      photosTooMany: "Добавьте не более 4 изображений, всего до 20 МБ.",
      shareOpening: "Открываем меню общего доступа — выберите WhatsApp.",
      shareDone: "Запрос передан для отправки.",
      shareCancelled: "Отправка отменена. Можно попробовать снова или позвонить.",
      photosReminder: (count) => `Фото: выбрано ${count} — пожалуйста, добавьте их в эту беседу WhatsApp.`,
      waOpeningPhotos: "Открываем WhatsApp. Добавьте выбранные фото в беседу.",
      waOpening: "Открываем WhatsApp с подготовленным запросом.",
      requestTitle: "Запрос на помощь",
      labelName: "Имя",
      labelPhone: "Телефон",
      labelIssue: "Ситуация",
      labelPlace: "Место / описание",
      labelNotSpecified: "Не указано"
    },
    en: {
      menuOpen: "Open menu",
      menuClose: "Close menu",
      smsBody: "Hello! I need help on the road. My location: ",
      smsFound: "Location found. Opening the message for you to review.",
      smsRetry: "Try again",
      smsFailed: "Could not determine your location. Check the permission or call us.",
      geoUnsupported: "This device does not support geolocation. Please call us.",
      geoLocating: "Determining your location…",
      geoButton: "Determine my location",
      formGeoUnsupported: "This device does not support geolocation. Enter the address manually.",
      formGeoLocating: "Determining your location…",
      formGeoRetry: "Try again",
      formGeoFailed: "Could not determine your location. Check the permission or enter the address manually.",
      formGeoPrefix: "Exact location:",
      formGeoUpdate: "Update location",
      formGeoAdded: "Location added to your request. You can check the map before sending.",
      photoNone: "No photo selected",
      photoSingle: (name) => name,
      photoMany: (count) => `${count} photos selected`,
      phoneInvalid: "Please check the phone number — at least seven digits are required.",
      requiredMissing: "Please fill in your name, phone and situation.",
      photosOnlyImages: "Please add image files only.",
      photosTooMany: "Add no more than 4 images, up to 20 MB in total.",
      shareOpening: "Opening the share sheet — choose WhatsApp.",
      shareDone: "Request handed over for sharing.",
      shareCancelled: "Sharing cancelled. You can try again or call us.",
      photosReminder: (count) => `Photos: ${count} selected — please attach them to this WhatsApp chat.`,
      waOpeningPhotos: "Opening WhatsApp. Attach the selected photos to the chat.",
      waOpening: "Opening WhatsApp with a prepared request.",
      requestTitle: "Assistance request",
      labelName: "Name",
      labelPhone: "Phone",
      labelIssue: "Situation",
      labelPlace: "Location / description",
      labelNotSpecified: "Not specified"
    }
  };
  const msg = MESSAGES[document.documentElement.lang] || MESSAGES.lv;

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

  const headerSentinel = document.querySelector(".header-sentinel");
  if (headerSentinel && header && "IntersectionObserver" in window) {
    const headerObserver = new IntersectionObserver(([entry]) => {
      header.classList.toggle("is-scrolled", !entry.isIntersecting);
    });
    headerObserver.observe(headerSentinel);
  }

  /* ── Call dock: hidden while the main call button is on screen ── */
  const dock = document.querySelector(".mobile-dock");
  const dockWatch = document.querySelector("[data-dock-watch]");
  if (dock && dockWatch && "IntersectionObserver" in window) {
    let dockState = null;
    let hasScrolled = window.scrollY > 8;
    let observer = null;
    const updateDock = () => {
      if (!dockState) return;
      const rootTop = dockState.rootBounds ? dockState.rootBounds.top : header?.offsetHeight || 0;
      const scrolledPast = !dockState.isIntersecting && dockState.boundingClientRect.bottom <= rootTop + 1;
      dock.classList.toggle("is-visible", scrolledPast && hasScrolled);
    };
    const buildDockObserver = () => {
      observer?.disconnect();
      observer = new IntersectionObserver((entries) => {
        dockState = entries[entries.length - 1];
        updateDock();
      }, { rootMargin: `-${header?.offsetHeight || 72}px 0px 0px 0px` });
      observer.observe(dockWatch);
    };
    window.addEventListener("scroll", () => {
      if (window.scrollY > 8) hasScrolled = true;
      updateDock();
    }, { passive: true });
    let dockResizeTimer;
    window.addEventListener("resize", () => {
      window.clearTimeout(dockResizeTimer);
      dockResizeTimer = window.setTimeout(buildDockObserver, 200);
    });
    buildDockObserver();
  } else if (dock) {
    dock.classList.add("is-visible");
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
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? msg.menuClose : msg.menuOpen);
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    mobileMenu.inert = !open;
    document.body.classList.toggle("menu-open", open);
    if (open) window.setTimeout(() => focusableElements(mobileMenu)[0]?.focus(), reducedMotion ? 0 : 400);
  };

  menuButton?.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  mobileMenu?.addEventListener("keydown", (event) => {
    trapFocus(event, mobileMenu);
  });

  const setLocationSheet = (open, trigger = null) => {
    if (!locationSheet) return;
    if (open) lastLocationTrigger = trigger;
    locationSheet.classList.toggle("is-open", open);
    locationSheet.setAttribute("aria-hidden", String(!open));
    locationSheet.inert = !open;
    document.body.classList.toggle("sheet-open", open);
    if (open) {
      window.setTimeout(() => shareLocation?.focus(), reducedMotion ? 0 : 350);
    } else {
      lastLocationTrigger?.focus();
    }
  };

  locationTriggers.forEach((button) => button.addEventListener("click", () => setLocationSheet(true, button)));
  closeLocationButtons.forEach((button) => button.addEventListener("click", () => setLocationSheet(false)));
  locationSheet?.addEventListener("keydown", (event) => {
    trapFocus(event, locationSheet);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (locationSheet?.classList.contains("is-open")) {
      setLocationSheet(false);
      return;
    }
    if (mobileMenu?.classList.contains("is-open")) {
      setMenu(false);
      menuButton?.focus();
    }
  });

  shareLocation?.addEventListener("click", () => {
    if (!navigator.geolocation) {
      locationStatus.textContent = msg.geoUnsupported;
      return;
    }
    track("geolocation_start", { source: "location_sheet" });
    shareLocation.disabled = true;
    shareLocation.textContent = msg.geoLocating;
    locationStatus.textContent = "";
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const mapUrl = `https://maps.google.com/?q=${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`;
        const body = encodeURIComponent(`${msg.smsBody}${mapUrl}`);
        window.location.href = `sms:+37122002700?body=${body}`;
        shareLocation.disabled = false;
        shareLocation.textContent = msg.geoButton;
        locationStatus.textContent = msg.smsFound;
        track("geolocation_success", { source: "location_sheet" });
        track("sms_open", { location: "location_sheet" });
      },
      () => {
        shareLocation.disabled = false;
        shareLocation.textContent = msg.smsRetry;
        locationStatus.textContent = msg.smsFailed;
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  });

  if (form) {
    const formLocationButton = form.querySelector("[data-form-location]");
    const formLocationLabel = form.querySelector("[data-form-location-label]");
    const formMapLink = form.querySelector("[data-form-map-link]");
    const formLocationStatus = form.querySelector(".form-location-status");
    const detailsField = form.elements.details;

    formLocationButton.addEventListener("click", () => {
      if (!navigator.geolocation) {
        formLocationStatus.textContent = msg.formGeoUnsupported;
        return;
      }

      track("geolocation_start", { source: "request_form" });
      formLocationButton.disabled = true;
      formLocationLabel.textContent = msg.formGeoLocating;
      formLocationStatus.textContent = "";
      formMapLink.hidden = true;
      formMapLink.removeAttribute("href");

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const mapUrl = `https://maps.google.com/?q=${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`;
          const locationPrefix = msg.formGeoPrefix;
          const currentDetails = detailsField.value
            .split("\n")
            .filter((line) => !line.trimStart().startsWith(locationPrefix))
            .join("\n")
            .trim();
          detailsField.value = currentDetails
            ? `${currentDetails}\n${locationPrefix} ${mapUrl}`
            : `${locationPrefix} ${mapUrl}`;
          formMapLink.href = mapUrl;
          formMapLink.hidden = false;
          formLocationButton.disabled = false;
          formLocationLabel.textContent = msg.formGeoUpdate;
          formLocationStatus.textContent = msg.formGeoAdded;
          track("geolocation_success", { source: "request_form" });
        },
        () => {
          formLocationButton.disabled = false;
          formLocationLabel.textContent = msg.formGeoRetry;
          formLocationStatus.textContent = msg.formGeoFailed;
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

    const photoInput = form.elements.photos;
    const photoLabel = form.querySelector("[data-file-label]");
    photoInput.addEventListener("change", () => {
      const count = photoInput.files.length;
      photoLabel.textContent = count === 0
        ? msg.photoNone
        : count === 1
          ? msg.photoSingle(photoInput.files[0].name)
          : msg.photoMany(count);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = form.querySelector(".form-status");
      const required = [...form.querySelectorAll("[required]")];
      required.forEach((field) => field.classList.remove("is-invalid"));
      const photoField = photoInput;
      photoField.classList.remove("is-invalid");
      const phoneField = form.elements.phone;
      const invalid = required.filter((field) => !field.value.trim());
      const phoneValue = phoneField.value.trim();
      const phoneDigits = phoneValue.replace(/\D/g, "");
      const hasValidPhoneCharacters = /^\+?[\d\s().-]+$/.test(phoneValue);
      if (phoneValue && (!hasValidPhoneCharacters || phoneDigits.length < 7)) invalid.push(phoneField);
      if (invalid.length) {
        invalid.forEach((field) => field.classList.add("is-invalid"));
        invalid[0].focus();
        status.textContent = invalid.includes(phoneField) && phoneField.value.trim()
          ? msg.phoneInvalid
          : msg.requiredMissing;
        return;
      }

      const photos = [...photoField.files];
      const totalPhotoSize = photos.reduce((sum, photo) => sum + photo.size, 0);
      if (photos.some((photo) => !photo.type.startsWith("image/"))) {
        photoField.classList.add("is-invalid");
        photoField.focus();
        status.textContent = msg.photosOnlyImages;
        return;
      }
      if (photos.length > 4 || totalPhotoSize > 20 * 1024 * 1024) {
        photoField.classList.add("is-invalid");
        photoField.focus();
        status.textContent = msg.photosTooMany;
        return;
      }

      const data = new FormData(form);
      const messageLines = [
        msg.requestTitle,
        `${msg.labelName}: ${data.get("name")}`,
        `${msg.labelPhone}: ${data.get("phone")}`,
        `${msg.labelIssue}: ${data.get("issue")}`,
        `${msg.labelPlace}: ${data.get("details") || msg.labelNotSpecified}`
      ];

      track("request_prepared", { has_photos: photos.length > 0 });

      if (photos.length) {
        let canSharePhotos = false;
        try {
          canSharePhotos = typeof navigator.share === "function"
            && typeof navigator.canShare === "function"
            && navigator.canShare({ files: photos });
        } catch (_) {
          canSharePhotos = false;
        }

        if (canSharePhotos) {
          status.textContent = msg.shareOpening;
          try {
            await navigator.share({
              title: msg.requestTitle,
              text: messageLines.join("\n"),
              files: photos
            });
            status.textContent = msg.shareDone;
            track("whatsapp_open", { via: "share_sheet" });
            return;
          } catch (error) {
            if (error && error.name === "AbortError") {
              status.textContent = msg.shareCancelled;
              return;
            }
          }
        }

        messageLines.push(msg.photosReminder(photos.length));
      }

      status.textContent = photos.length
        ? msg.waOpeningPhotos
        : msg.waOpening;
      track("whatsapp_open", { via: "wa_me_link" });
      window.location.href = `https://wa.me/37122002700?text=${encodeURIComponent(messageLines.join("\n"))}`;
    });
  }

  const initMotion = () => {
    if (reducedMotion || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    if (document.querySelector(".hero-line")) {
      gsap.set(".hero-line > span", { yPercent: 110 });
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro
        .to(".hero-line > span", { yPercent: 0, duration: 1.1, stagger: 0.12 })
        .from(".hero .eyebrow, .hero-tagline, .hero-cta-row", { opacity: 0, y: 24, duration: .85, stagger: .1, clearProps: "all" }, "-=.75");
    }

    gsap.utils.toArray(".section-heading h2, .pricing-head h2, .work-heading h2, .contact-copy h2, .svc-shell h2, .cta-band h2").forEach((heading) => {
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

    gsap.utils.toArray(".gallery-panel:not([hidden]) img, .service-card--photo img, .svc-photos img").forEach((image) => {
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
    loadScript(`${base}assets/vendor/gsap.min.js`)
      .then(() => loadScript(`${base}assets/vendor/ScrollTrigger.min.js`))
      .then(initMotion)
      .catch(() => {});
  }
})();
