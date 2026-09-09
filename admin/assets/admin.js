(() => {
  "use strict";

  const body = document.body;
  const workspace = document.querySelector("[data-workspace]");
  const loading = document.querySelector("[data-loading]");
  const viewTitle = document.querySelector("[data-view-title]");
  const dirtyState = document.querySelector("[data-dirty-state]");
  const pageCount = document.querySelector("[data-page-count]");
  const publishButton = document.querySelector("[data-publish]");
  const previewButton = document.querySelector("[data-preview-current]");
  const picker = document.querySelector("[data-media-picker]");
  const pickerGrid = document.querySelector("[data-media-picker-grid]");
  const sidebar = document.querySelector("#sidebar");
  const mobileToggle = document.querySelector(".mobile-nav-toggle");

  const state = {
    data: null,
    view: "dashboard",
    page: null,
    pageFilter: "all",
    pageSearch: "",
    mediaTarget: null,
    confirmResolve: null,
  };

  const uid = () => globalThis.crypto?.randomUUID?.() || `block-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const escapeHtml = (value = "") => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const formatDate = (value) => {
    if (!value) return "Vēl nav publicēts";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("lv-LV", { dateStyle: "medium", timeStyle: "short" }).format(date);
  };

  const formatBytes = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const api = async (action, options = {}) => {
    const method = options.method || "GET";
    const request = { method, credentials: "same-origin", headers: {} };
    if (method !== "GET") request.headers["X-CSRF-Token"] = body.dataset.csrf || "";
    if (options.form) {
      request.body = options.form;
    } else if (options.body !== undefined) {
      request.headers["Content-Type"] = "application/json";
      request.body = JSON.stringify(options.body);
    }
    const response = await fetch(`/admin/api.php?action=${encodeURIComponent(action)}${options.query || ""}`, request);
    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error("Serveris atbildēja neparedzētā formātā.");
    }
    if (response.status === 401) {
      window.location.href = "/admin/";
      throw new Error("Sesija beigusies.");
    }
    if (!response.ok || !payload.ok) throw new Error(payload.error || "Darbība neizdevās.");
    if (payload.csrf) {
      body.dataset.csrf = payload.csrf;
    }
    return payload;
  };

  const toast = (message, type = "success") => {
    const stack = document.querySelector("[data-toasts]");
    const item = document.createElement("div");
    item.className = `toast${type === "error" ? " is-error" : ""}`;
    item.innerHTML = `<p>${escapeHtml(message)}</p><button type="button" aria-label="Aizvērt">×</button>`;
    item.querySelector("button").addEventListener("click", () => item.remove());
    stack.appendChild(item);
    window.setTimeout(() => item.remove(), 5200);
  };

  const setDirty = (dirty) => {
    if (!dirtyState) return;
    dirtyState.classList.toggle("is-dirty", Boolean(dirty));
    dirtyState.classList.toggle("is-live", !dirty);
    dirtyState.innerHTML = dirty ? "<i></i> Ir nepublicētas izmaiņas" : "<i></i> Vietne ir aktuāla";
    if (state.data) state.data.dirty = Boolean(dirty);
  };

  const confirmAction = (title, text, dangerous = false) => new Promise((resolve) => {
    const dialog = document.querySelector("[data-confirm]");
    dialog.querySelector("[data-confirm-title]").textContent = title;
    dialog.querySelector("[data-confirm-text]").textContent = text;
    const ok = dialog.querySelector("[data-confirm-ok]");
    ok.classList.toggle("button--danger", dangerous);
    ok.classList.toggle("button--primary", !dangerous);
    ok.textContent = dangerous ? "Jā, turpināt" : "Apstiprināt";
    dialog.hidden = false;
    state.confirmResolve = resolve;
    ok.focus();
  });

  const closeConfirm = (result) => {
    const dialog = document.querySelector("[data-confirm]");
    dialog.hidden = true;
    if (state.confirmResolve) state.confirmResolve(result);
    state.confirmResolve = null;
  };

  document.querySelectorAll("[data-confirm-cancel]").forEach((button) => button.addEventListener("click", () => closeConfirm(false)));
  document.querySelector("[data-confirm-ok]")?.addEventListener("click", () => closeConfirm(true));

  const setView = (view) => {
    state.view = view;
    state.page = null;
    document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("is-active", button.dataset.view === view));
    const titles = { dashboard: "Pārskats", pages: "Lapas", media: "Attēli", settings: "Kontakti", history: "Versijas" };
    viewTitle.textContent = titles[view] || "Vadība";
    previewButton.disabled = true;
    sidebar.classList.remove("is-open");
    mobileToggle?.setAttribute("aria-expanded", "false");
    renderView();
  };

  const renderIntro = (kicker, title, text, actions = "") => `
    <div class="view-intro">
      <div><p class="kicker">${escapeHtml(kicker)}</p><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p></div>
      ${actions ? `<div class="view-actions">${actions}</div>` : ""}
    </div>`;

  const renderDashboard = () => {
    const { stats, health, published_at: publishedAt } = state.data;
    workspace.innerHTML = `<div class="workspace-inner">
      ${renderIntro("Vadības centrs", "Viss svarīgais vienuviet.", "Pārvaldiet saturu kā konstruktorā: saglabājiet melnrakstu, pārbaudiet un publicējiet tikai gatavu versiju.")}
      <section class="stats-grid" aria-label="Vietnes statistika">
        <article class="stat-card"><p>Vietnes lapas</p><strong>${stats.pages}</strong><small>LV, RU un EN</small></article>
        <article class="stat-card"><p>Valodas</p><strong>${stats.languages}</strong><small>savstarpēji sasaistītas</small></article>
        <article class="stat-card"><p>Attēli</p><strong>${stats.media}</strong><small>mediju bibliotēkā</small></article>
        <article class="stat-card"><p>Mainītas lapas</p><strong>${stats.edited_pages}</strong><small>caur vadības paneli</small></article>
      </section>
      <div class="dashboard-grid">
        <section class="panel">
          <div class="panel__head"><h3>Ātrās darbības</h3><span class="kicker">DARBS</span></div>
          <div class="panel__body quick-list">
            <button type="button" data-go="pages"><span><strong>Rediģēt lapas saturu</strong><small>Teksti, SEO, attēli un papildu bloki</small></span><b>→</b></button>
            <button type="button" data-go="media"><span><strong>Pievienot jaunus attēlus</strong><small>Automātiska samazināšana un WebP, ja serveris atbalsta</small></span><b>→</b></button>
            <button type="button" data-go="settings"><span><strong>Mainīt tālruņus un e-pastu</strong><small>Vienlaikus visās lapās un valodās</small></span><b>→</b></button>
          </div>
        </section>
        <section class="panel">
          <div class="panel__head"><h3>Sistēmas stāvoklis</h3><span class="kicker">LIVE</span></div>
          <div class="panel__body health-list">
            ${[
              ["PHP", health.php],
              ["Lapu rediģēšana", health.dom ? "Darbojas" : "Nav DOM"],
              ["Attēlu optimizācija", health.gd ? "Darbojas" : "Oriģināla režīms"],
              ["Datu saglabāšana", health.storage_writable && health.root_writable ? "Darbojas" : "Jāpārbauda"],
            ].map(([label, value], index) => `<div class="health-item"><span>${escapeHtml(label)}</span><strong${index === 3 && !(health.storage_writable && health.root_writable) ? ' class="is-bad"' : ""}>${escapeHtml(String(value))}</strong></div>`).join("")}
            <div class="health-item"><span>Pēdējā publikācija</span><strong>${escapeHtml(formatDate(publishedAt))}</strong></div>
          </div>
        </section>
      </div>
    </div>`;
    workspace.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.go)));
  };

  const renderPages = () => {
    const languages = ["all", "lv", "ru", "en"];
    const filtered = state.data.pages.filter((page) => {
      const languageMatch = state.pageFilter === "all" || page.lang === state.pageFilter;
      const query = state.pageSearch.toLowerCase();
      const searchMatch = !query || `${page.title} ${page.path} ${page.seo_title}`.toLowerCase().includes(query);
      return languageMatch && searchMatch;
    });
    workspace.innerHTML = `<div class="workspace-inner">
      ${renderIntro("Satura karte", "Katra lapa ir rediģējama.", "Mainiet tikai vajadzīgo. Strukturētie bloki un priekšskatījums pasargā vietnes dizainu.")}
      <div class="toolbar">
        <label class="search-box"><span class="sr-only"></span><input class="control" type="search" data-page-search placeholder="Meklēt pēc nosaukuma vai URL…" value="${escapeHtml(state.pageSearch)}"></label>
        <div class="filter-group" aria-label="Valodas filtrs">${languages.map((lang) => `<button type="button" data-lang-filter="${lang}" class="${state.pageFilter === lang ? "is-active" : ""}">${lang === "all" ? "VISAS" : lang.toUpperCase()}</button>`).join("")}</div>
      </div>
      <div class="page-list">${filtered.length ? filtered.map((page) => `<button class="page-row" type="button" data-edit-page="${escapeHtml(page.path)}">
        <span class="page-row__lang">${escapeHtml(page.lang.toUpperCase())}</span>
        <span><strong>${escapeHtml(page.title || "Lapa")}</strong><small>${escapeHtml(page.seo_title)}</small></span>
        <code>${escapeHtml(page.url)}</code><span class="page-row__arrow">→</span>
      </button>`).join("") : `<div class="empty-state"><strong>Nekas nav atrasts</strong><p>Mainiet meklēšanas tekstu vai valodas filtru.</p></div>`}</div>
    </div>`;
    workspace.querySelector("[data-page-search]")?.addEventListener("input", (event) => {
      state.pageSearch = event.target.value;
      window.clearTimeout(event.target._timer);
      event.target._timer = window.setTimeout(renderPages, 180);
    });
    workspace.querySelectorAll("[data-lang-filter]").forEach((button) => button.addEventListener("click", () => {
      state.pageFilter = button.dataset.langFilter;
      renderPages();
    }));
    workspace.querySelectorAll("[data-edit-page]").forEach((button) => button.addEventListener("click", () => openPage(button.dataset.editPage)));
  };

  const openPage = async (pagePath) => {
    workspace.innerHTML = `<div class="loading-state"><span class="loader"></span><p>Ielādē lapu…</p></div>`;
    try {
      const payload = await api("page", { query: `&page=${encodeURIComponent(pagePath)}` });
      state.page = payload.page;
      viewTitle.textContent = "Lapas redaktors";
      previewButton.disabled = false;
      renderEditor();
    } catch (error) {
      toast(error.message, "error");
      renderPages();
    }
  };

  const accordion = (id, title, count, content, open = false) => `<section class="accordion__item${open ? " is-open" : ""}" data-accordion>
    <button class="accordion__trigger" type="button" aria-expanded="${open}"><span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(String(count))}</small></span><span>+</span></button>
    <div class="accordion__content">${content}</div>
  </section>`;

  const renderTextFields = () => state.page.texts.map((field) => `<div class="content-field">
    <label for="txt-${field.id}">${escapeHtml(field.label)}</label>
    ${field.multiline
      ? `<textarea id="txt-${field.id}" data-text-xpath="${escapeHtml(field.xpath)}" data-leading-space="${field.leading_space ? "1" : "0"}" data-trailing-space="${field.trailing_space ? "1" : "0"}">${escapeHtml(field.value)}</textarea>`
      : `<input id="txt-${field.id}" data-text-xpath="${escapeHtml(field.xpath)}" data-leading-space="${field.leading_space ? "1" : "0"}" data-trailing-space="${field.trailing_space ? "1" : "0"}" value="${escapeHtml(field.value)}">`}
  </div>`).join("");

  const renderAttributeFields = () => state.page.attributes.map((group, groupIndex) => Object.entries(group.values).map(([name, value]) => `<div class="content-field">
    <label for="attr-${groupIndex}-${name}">${escapeHtml(group.label)} · ${escapeHtml(name)}</label>
    <input id="attr-${groupIndex}-${name}" data-attr-xpath="${escapeHtml(group.xpath)}" data-attr-name="${escapeHtml(name)}" value="${escapeHtml(value)}">
  </div>`).join("")).join("");

  const renderImageFields = () => state.page.images.map((image, index) => `<article class="image-editor" data-image-xpath="${escapeHtml(image.xpath)}" data-image-src="${escapeHtml(image.src)}">
    <div class="image-editor__preview"><img src="${escapeHtml(image.preview)}" alt=""></div>
    <div class="image-editor__body"><strong>${escapeHtml(image.label)}</strong><span class="image-src">${escapeHtml(image.src)}</span>
      <label class="field"><span>ALT teksts</span><input data-image-alt value="${escapeHtml(image.alt)}" maxlength="300"></label>
      <div class="image-editor__actions"><button class="button button--small" type="button" data-pick-image="${index}">Mainīt attēlu</button></div>
    </div>
  </article>`).join("");

  const blockLabels = { text: "Teksta bloks", split: "Attēls + teksts", list: "Saraksts", cta: "Aicinājums rīkoties" };

  const renderBlock = (block, index) => {
    const type = block.type || "text";
    const imageFields = type === "split" ? `
      <label class="field field--wide"><span>Attēls</span><div class="image-editor__actions"><input class="control" data-block-field="image" value="${escapeHtml(block.image || "")}" readonly><button class="button button--small" type="button" data-pick-block-image>Izvēlēties</button></div></label>
      <label class="field"><span>ALT teksts</span><input data-block-field="alt" value="${escapeHtml(block.alt || "")}"></label>
      <label class="toggle"><input type="checkbox" data-block-field="reverse" ${block.reverse ? "checked" : ""}> Attēls labajā pusē</label>` : "";
    const listFields = type === "list" ? `<label class="field field--wide"><span>Saraksts · viena rinda = viens punkts</span><textarea data-block-field="items">${escapeHtml((block.items || []).join("\n"))}</textarea></label>` : "";
    const ctaFields = type === "cta" ? `<label class="field"><span>Pogas teksts</span><input data-block-field="button_label" value="${escapeHtml(block.button_label || "Zvanīt")}"></label><label class="field"><span>Pogas saite</span><input data-block-field="button_href" value="${escapeHtml(block.button_href || "tel:+37122002700")}"></label>` : "";
    return `<article class="block-card" data-block data-block-id="${escapeHtml(block.id || uid())}" data-block-type="${escapeHtml(type)}">
      <div class="block-card__head"><span class="block-index">${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(blockLabels[type])}</strong><div class="block-card__tools">
        <button class="icon-button" type="button" data-block-up aria-label="Uz augšu">↑</button><button class="icon-button" type="button" data-block-down aria-label="Uz leju">↓</button><button class="icon-button" type="button" data-block-delete aria-label="Dzēst">×</button>
      </div></div>
      <div class="block-card__body">
        <label class="toggle field--wide"><input type="checkbox" data-block-field="enabled" ${block.enabled !== false ? "checked" : ""}> Rādīt šo bloku</label>
        <label class="field"><span>Mazais virsraksts</span><input data-block-field="eyebrow" value="${escapeHtml(block.eyebrow || "")}"></label>
        <label class="field"><span>Virsraksts</span><input data-block-field="title" value="${escapeHtml(block.title || "")}"></label>
        <label class="field field--wide"><span>Teksts</span><textarea data-block-field="body">${escapeHtml(block.body || "")}</textarea></label>
        ${imageFields}${listFields}${ctaFields}
      </div>
    </article>`;
  };

  const renderBlocks = () => `<div class="blocks-list" data-blocks-list>${state.page.blocks.map(renderBlock).join("")}</div>
    <div class="add-blocks" aria-label="Pievienot bloku">
      ${Object.entries(blockLabels).map(([type, label]) => `<button type="button" data-add-block="${type}">+ ${escapeHtml(label)}</button>`).join("")}
    </div>`;

  const renderEditor = () => {
    const page = state.page;
    workspace.innerHTML = `<div class="workspace-inner">
      ${renderIntro(page.lang.toUpperCase() + " · " + page.url, page.h1 || "Lapas redaktors", "Saglabājiet melnrakstu un apskatiet rezultātu labajā pusē.", `<button class="button button--quiet" type="button" data-back-pages>← Visas lapas</button><a class="button button--ghost" href="${escapeHtml(page.url)}" target="_blank" rel="noopener">Atvērt LIVE ↗</a>`)}
      <div class="editor-layout">
        <div class="editor-main">
          <div class="accordion">
            ${accordion("seo", "Google / SEO", "Title + Description", `<div class="field-grid">
              <label class="field"><span>Title</span><input data-seo-title maxlength="180" value="${escapeHtml(page.seo.title)}"><small class="field-help">Ieteicams ap 50–60 rakstzīmēm. Svarīgākais vaicājums sākumā.</small></label>
              <label class="field"><span>Description</span><textarea data-seo-description maxlength="360">${escapeHtml(page.seo.description)}</textarea><small class="field-help">Ieteicams ap 140–160 rakstzīmēm un skaidrs aicinājums zvanīt.</small></label>
            </div>`, true)}
            ${accordion("content", "Lapas teksti", `${page.texts.length} lauki`, `<div>${renderTextFields()}</div>`)}
            ${accordion("images", "Attēli un ALT", `${page.images.length} attēli`, `<div class="image-list">${renderImageFields()}</div>`)}
            ${accordion("attributes", "Formu un pogu paskaidrojumi", `${page.attributes.length} grupas`, `<div>${renderAttributeFields()}</div>`)}
            ${accordion("blocks", "LEGO bloki", `${page.blocks.length} pievienoti`, renderBlocks())}
          </div>
          <div class="editor-savebar"><p>Izmaiņas vispirms nonāk melnrakstā. LIVE vietne nemainās līdz publicēšanai.</p><button class="button button--primary" type="button" data-save-page>Saglabāt melnrakstu</button></div>
        </div>
        <aside class="editor-preview" data-editor-preview>
          <div class="panel__head"><h3>Priekšskatījums</h3><div class="preview-size"><button type="button" class="is-active" data-preview-size="mobile" aria-label="Mobilā versija">▯</button><button type="button" data-preview-size="desktop" aria-label="Datora versija">▭</button></div></div>
          <div class="preview-frame-wrap"><iframe title="Lapas priekšskatījums" data-preview-frame src="/admin/preview.php?page=${encodeURIComponent(page.path)}"></iframe></div>
        </aside>
      </div>
    </div>`;

    workspace.querySelector("[data-back-pages]")?.addEventListener("click", () => setView("pages"));
    workspace.querySelectorAll("[data-accordion] .accordion__trigger").forEach((button) => button.addEventListener("click", () => {
      const item = button.closest("[data-accordion]");
      const open = item.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
    }));
    workspace.querySelector("[data-save-page]")?.addEventListener("click", saveCurrentPage);
    workspace.querySelectorAll("[data-pick-image]").forEach((button) => button.addEventListener("click", () => {
      const card = button.closest("[data-image-xpath]");
      openMediaPicker((media) => {
        card.dataset.imageSrc = media.src;
        card.querySelector("img").src = media.url;
        card.querySelector(".image-src").textContent = media.src;
      });
    }));
    bindBlockEvents();
    workspace.querySelectorAll("[data-preview-size]").forEach((button) => button.addEventListener("click", () => {
      const desktop = button.dataset.previewSize === "desktop";
      workspace.querySelector("[data-editor-preview]").classList.toggle("is-desktop", desktop);
      workspace.querySelectorAll("[data-preview-size]").forEach((item) => item.classList.toggle("is-active", item === button));
      if (desktop) button.textContent = "×";
    }));
  };

  const bindBlockEvents = () => {
    workspace.querySelectorAll("[data-add-block]").forEach((button) => button.addEventListener("click", () => {
      collectBlocksIntoState();
      state.page.blocks.push({ id: uid(), type: button.dataset.addBlock, enabled: true, title: "", body: "", items: [], image: "", alt: "", button_label: "Zvanīt", button_href: "tel:+37122002700" });
      refreshBlocksOnly();
    }));
    workspace.querySelectorAll("[data-block-delete]").forEach((button) => button.addEventListener("click", async () => {
      if (!await confirmAction("Dzēst bloku?", "Bloks pazudīs no melnraksta. LIVE vietne nemainīsies līdz publicēšanai.", true)) return;
      collectBlocksIntoState();
      const id = button.closest("[data-block]").dataset.blockId;
      state.page.blocks = state.page.blocks.filter((block) => block.id !== id);
      refreshBlocksOnly();
    }));
    workspace.querySelectorAll("[data-block-up], [data-block-down]").forEach((button) => button.addEventListener("click", () => {
      collectBlocksIntoState();
      const id = button.closest("[data-block]").dataset.blockId;
      const index = state.page.blocks.findIndex((block) => block.id === id);
      const next = button.hasAttribute("data-block-up") ? index - 1 : index + 1;
      if (index < 0 || next < 0 || next >= state.page.blocks.length) return;
      [state.page.blocks[index], state.page.blocks[next]] = [state.page.blocks[next], state.page.blocks[index]];
      refreshBlocksOnly();
    }));
    workspace.querySelectorAll("[data-pick-block-image]").forEach((button) => button.addEventListener("click", () => {
      const input = button.closest("[data-block]").querySelector('[data-block-field="image"]');
      openMediaPicker((media) => { input.value = media.src; });
    }));
  };

  const refreshBlocksOnly = () => {
    const content = workspace.querySelector("[data-blocks-list]")?.parentElement;
    if (!content) return;
    content.innerHTML = renderBlocks();
    bindBlockEvents();
  };

  const collectBlocksIntoState = () => {
    if (!workspace.querySelector("[data-block]")) {
      if (workspace.querySelector("[data-blocks-list]")) state.page.blocks = [];
      return;
    }
    state.page.blocks = [...workspace.querySelectorAll("[data-block]")].map((card) => {
      const value = (name) => card.querySelector(`[data-block-field="${name}"]`)?.value || "";
      const checked = (name) => Boolean(card.querySelector(`[data-block-field="${name}"]`)?.checked);
      return {
        id: card.dataset.blockId,
        type: card.dataset.blockType,
        enabled: checked("enabled"),
        eyebrow: value("eyebrow"),
        title: value("title"),
        body: value("body"),
        items: value("items").split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
        image: value("image"),
        alt: value("alt"),
        reverse: checked("reverse"),
        button_label: value("button_label"),
        button_href: value("button_href"),
      };
    });
  };

  const collectPage = () => {
    const texts = {};
    workspace.querySelectorAll("[data-text-xpath]").forEach((input) => {
      const leading = input.dataset.leadingSpace === "1" ? " " : "";
      const trailing = input.dataset.trailingSpace === "1" ? " " : "";
      texts[input.dataset.textXpath] = `${leading}${input.value.trim()}${trailing}`;
    });
    const attributes = {};
    workspace.querySelectorAll("[data-attr-xpath]").forEach((input) => {
      attributes[input.dataset.attrXpath] ||= {};
      attributes[input.dataset.attrXpath][input.dataset.attrName] = input.value;
    });
    const images = {};
    workspace.querySelectorAll("[data-image-xpath]").forEach((card) => {
      images[card.dataset.imageXpath] = { src: card.dataset.imageSrc, alt: card.querySelector("[data-image-alt]").value };
    });
    collectBlocksIntoState();
    return {
      seo: { title: workspace.querySelector("[data-seo-title]").value, description: workspace.querySelector("[data-seo-description]").value },
      texts,
      attributes,
      images,
      blocks: state.page.blocks,
    };
  };

  const saveCurrentPage = async (silent = false) => {
    if (!state.page) return true;
    const button = workspace.querySelector("[data-save-page]");
    if (button) { button.disabled = true; button.textContent = "Saglabā…"; }
    try {
      const payload = await api("save-page", { method: "POST", body: { page: state.page.path, content: collectPage() } });
      setDirty(payload.dirty);
      if (!silent) toast(payload.message);
      const frame = workspace.querySelector("[data-preview-frame]");
      if (frame) frame.src = `/admin/preview.php?page=${encodeURIComponent(state.page.path)}&v=${Date.now()}`;
      return true;
    } catch (error) {
      toast(error.message, "error");
      return false;
    } finally {
      if (button) { button.disabled = false; button.textContent = "Saglabāt melnrakstu"; }
    }
  };

  const renderMediaCard = (media, pickerMode = false) => {
    const cardTag = pickerMode ? "button" : "article";
    return `<${cardTag} class="media-card" ${pickerMode ? `type="button" data-select-media="${escapeHtml(media.src)}"` : ""}>
      <div class="media-card__image"><img src="${escapeHtml(media.url)}" alt="" loading="lazy"></div>
      <div class="media-card__body"><strong>${escapeHtml(media.name)}</strong><small>${media.width || "?"} × ${media.height || "?"} · ${formatBytes(media.bytes)}</small></div>
      ${!pickerMode && media.source === "uploads" ? `<button class="media-card__delete" type="button" data-delete-media="${escapeHtml(media.name)}" aria-label="Dzēst ${escapeHtml(media.name)}">×</button>` : ""}
    </${cardTag}>`;
  };

  const renderMedia = () => {
    const uploads = state.data.media.filter((item) => item.source === "uploads");
    const siteImages = state.data.media.filter((item) => item.source === "site");
    workspace.innerHTML = `<div class="workspace-inner">
      ${renderIntro("Mediju bibliotēka", "Jauns attēls — bez liekas apstrādes.", "JPG, PNG vai WebP līdz 12 MB. Serveris samazina lielus attēlus un, ja iespējams, saglabā ātrajā WebP formātā.")}
      <label class="upload-zone" data-upload-zone><input type="file" accept="image/jpeg,image/png,image/webp" data-upload-input><span><strong>Ievelciet attēlu šeit</strong><p>vai nospiediet, lai izvēlētos failu</p></span></label>
      <section class="panel" style="margin-bottom:18px"><div class="panel__head"><h3>Jūsu augšupielādes</h3><span class="kicker">${uploads.length} FAILI</span></div><div class="panel__body">
        ${uploads.length ? `<div class="media-grid">${uploads.map((item) => renderMediaCard(item)).join("")}</div>` : `<div class="empty-state"><strong>Vēl nav jaunu attēlu</strong><p>Pievienojiet pirmo foto augšējā laukā. Vietnes esošie attēli ir redzami zemāk.</p></div>`}
      </div></section>
      <section class="panel"><div class="panel__head"><h3>Vietnes attēli</h3><span class="kicker">${siteImages.length} FAILI</span></div><div class="panel__body"><div class="media-grid">${siteImages.map((item) => renderMediaCard(item)).join("")}</div></div></section>
    </div>`;
    bindUpload();
    workspace.querySelectorAll("[data-delete-media]").forEach((button) => button.addEventListener("click", async (event) => {
      event.stopPropagation();
      const name = button.dataset.deleteMedia;
      if (!await confirmAction("Dzēst attēlu?", `${name} tiks neatgriezeniski izdzēsts no augšupielādēm.`, true)) return;
      try {
        const payload = await api("delete-media", { method: "POST", body: { name } });
        state.data.media = state.data.media.filter((item) => !(item.source === "uploads" && item.name === name));
        toast(payload.message);
        renderMedia();
      } catch (error) { toast(error.message, "error"); }
    }));
  };

  const bindUpload = () => {
    const input = workspace.querySelector("[data-upload-input]");
    const zone = workspace.querySelector("[data-upload-zone]");
    if (!input || !zone) return;
    const upload = async (file) => {
      if (!file) return;
      const form = new FormData();
      form.append("image", file);
      zone.querySelector("strong").textContent = "Augšupielādē un optimizē…";
      try {
        const payload = await api("upload", { method: "POST", form });
        state.data.media.unshift(payload.media);
        state.data.stats.media += 1;
        toast(payload.message);
        renderMedia();
      } catch (error) {
        toast(error.message, "error");
        zone.querySelector("strong").textContent = "Ievelciet attēlu šeit";
      }
    };
    input.addEventListener("change", () => upload(input.files[0]));
    ["dragenter", "dragover"].forEach((name) => zone.addEventListener(name, (event) => { event.preventDefault(); zone.classList.add("is-dragging"); }));
    ["dragleave", "drop"].forEach((name) => zone.addEventListener(name, (event) => { event.preventDefault(); zone.classList.remove("is-dragging"); }));
    zone.addEventListener("drop", (event) => upload(event.dataTransfer.files[0]));
  };

  const openMediaPicker = (callback) => {
    state.mediaTarget = callback;
    pickerGrid.innerHTML = state.data.media.map((item) => renderMediaCard(item, true)).join("");
    picker.hidden = false;
    pickerGrid.querySelectorAll("[data-select-media]").forEach((button) => button.addEventListener("click", () => {
      const media = state.data.media.find((item) => item.src === button.dataset.selectMedia);
      if (media && state.mediaTarget) state.mediaTarget(media);
      closeMediaPicker();
    }));
    picker.querySelector("[data-close-modal]")?.focus();
  };

  const closeMediaPicker = () => {
    picker.hidden = true;
    state.mediaTarget = null;
  };
  document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeMediaPicker));

  const renderSettings = () => {
    const global = state.data.global;
    workspace.innerHTML = `<div class="workspace-inner">
      ${renderIntro("Globālie dati", "Vienreiz mainiet — visur atjaunojas.", "Galvenais un otrais tālrunis, kā arī e-pasts tiek atjaunots visās valodās un pakalpojumu lapās.", `<a class="button button--ghost" href="/admin/export.php">Lejupielādēt rezerves kopiju ↓</a>`)}
      <section class="panel form-panel">
        <div class="panel__head"><h3>Kontakti</h3><span class="kicker">VISAS LAPAS</span></div>
        <form class="panel__body" data-global-form>
          <p class="settings-note">Tālruņi ietekmē zvana pogas, WhatsApp pieprasījumu un strukturētos Google datus. Pirms publicēšanas pārbaudiet numurus.</p>
          <div class="settings-grid">
            <label class="field"><span>Galvenais tālrunis</span><input name="primary_phone" inputmode="tel" value="${escapeHtml(global.primary_phone)}" required></label>
            <label class="field"><span>Otrais tālrunis</span><input name="secondary_phone" inputmode="tel" value="${escapeHtml(global.secondary_phone)}" required></label>
            <label class="field field--wide"><span>E-pasts</span><input name="email" type="email" value="${escapeHtml(global.email)}" required></label>
          </div>
          <div class="form-actions"><button class="button button--primary" type="submit">Saglabāt melnrakstu</button></div>
        </form>
      </section>
      <section class="panel form-panel" style="margin-top:18px">
        <div class="panel__head"><h3>Administratora parole</h3><span class="kicker">DROŠĪBA</span></div>
        <form class="panel__body" data-password-form autocomplete="off">
          <div class="settings-grid"><label class="field"><span>Pašreizējā parole</span><input name="current" type="password" autocomplete="current-password" required></label><label class="field"><span>Jaunā parole · vismaz 12 zīmes</span><input name="next" type="password" autocomplete="new-password" minlength="12" required></label></div>
          <div class="form-actions"><button class="button button--ghost" type="submit">Nomainīt paroli</button></div>
        </form>
      </section>
    </div>`;
    workspace.querySelector("[data-global-form]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      try {
        const payload = await api("save-global", { method: "POST", body: Object.fromEntries(form) });
        state.data.global = payload.global;
        setDirty(payload.dirty);
        toast(payload.message);
      } catch (error) { toast(error.message, "error"); }
    });
    workspace.querySelector("[data-password-form]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      try {
        const payload = await api("password", { method: "POST", body: Object.fromEntries(form) });
        event.currentTarget.reset();
        toast(payload.message);
      } catch (error) { toast(error.message, "error"); }
    });
  };

  const renderHistory = () => {
    const revisions = state.data.revisions || [];
    workspace.innerHTML = `<div class="workspace-inner">
      ${renderIntro("Drošības tīkls", "Iepriekšējās versijas nepazūd.", "Pirms katras publikācijas sistēma saglabā iepriekšējo stāvokli. Atjaunojiet to melnrakstā, pārbaudiet un publicējiet.", `<button class="button button--ghost" type="button" data-discard ${state.data.dirty ? "" : "disabled"}>Atcelt melnrakstu</button>`)}
      ${revisions.length ? `<div class="revision-list">${revisions.map((revision) => `<article class="revision-row"><span><strong>${escapeHtml(formatDate(revision.saved_at || revision.published_at))}</strong><small>${escapeHtml(revision.id)} · ${revision.pages} mainītas lapas</small></span><small>Iepriekšējā LIVE versija</small><button class="button button--small" type="button" data-restore="${escapeHtml(revision.id)}">Atjaunot melnrakstā</button></article>`).join("")}</div>` : `<div class="empty-state"><strong>Versiju vēl nav</strong><p>Pirmā drošības kopija tiks izveidota, kad publicēsiet izmaiņas.</p></div>`}
    </div>`;
    workspace.querySelector("[data-discard]")?.addEventListener("click", async () => {
      if (!await confirmAction("Atcelt visas melnraksta izmaiņas?", "Melnraksts tiks aizstāts ar pašreizējo LIVE versiju.", true)) return;
      try {
        const payload = await api("discard", { method: "POST", body: {} });
        setDirty(false);
        toast(payload.message);
        renderHistory();
      } catch (error) { toast(error.message, "error"); }
    });
    workspace.querySelectorAll("[data-restore]").forEach((button) => button.addEventListener("click", async () => {
      if (!await confirmAction("Ielādēt šo versiju?", "Pašreizējais melnraksts tiks aizstāts. LIVE vietne pagaidām nemainīsies.")) return;
      try {
        const payload = await api("restore", { method: "POST", body: { id: button.dataset.restore } });
        setDirty(true);
        toast(payload.message);
      } catch (error) { toast(error.message, "error"); }
    }));
  };

  const renderView = () => {
    if (!state.data) return;
    if (state.view === "pages") renderPages();
    else if (state.view === "media") renderMedia();
    else if (state.view === "settings") renderSettings();
    else if (state.view === "history") renderHistory();
    else renderDashboard();
  };

  const publish = async () => {
    if (state.page && !await saveCurrentPage(true)) return;
    if (!state.data.dirty) {
      toast("Nav nepublicētu izmaiņu.");
      return;
    }
    if (!await confirmAction("Publicēt vietnē?", "Melnraksts kļūs redzams apmeklētājiem visās mainītajās lapās.")) return;
    publishButton.disabled = true;
    publishButton.textContent = "Publicē…";
    try {
      const payload = await api("publish", { method: "POST", body: {} });
      state.data.revisions = payload.revisions;
      state.data.published_at = payload.result.published_at;
      setDirty(false);
      toast(`${payload.message} Atjaunotas ${payload.result.pages} lapas.`);
      if (state.page) {
        const frame = workspace.querySelector("[data-preview-frame]");
        if (frame) frame.src = `/admin/preview.php?page=${encodeURIComponent(state.page.path)}&v=${Date.now()}`;
      }
    } catch (error) { toast(error.message, "error"); }
    finally { publishButton.disabled = false; publishButton.innerHTML = 'Publicēt <span aria-hidden="true">↑</span>'; }
  };

  publishButton?.addEventListener("click", publish);
  previewButton?.addEventListener("click", () => {
    if (!state.page) return;
    window.open(`/admin/preview.php?page=${encodeURIComponent(state.page.path)}`, "_blank", "noopener");
  });
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
  mobileToggle?.addEventListener("click", () => {
    const open = sidebar.classList.toggle("is-open");
    mobileToggle.setAttribute("aria-expanded", String(open));
  });
  document.querySelector("[data-logout]")?.addEventListener("click", async () => {
    try {
      const payload = await api("logout", { method: "POST", body: {} });
      window.location.href = payload.redirect;
    } catch (error) { toast(error.message, "error"); }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!picker.hidden) closeMediaPicker();
      if (!document.querySelector("[data-confirm]").hidden) closeConfirm(false);
      const fullPreview = document.querySelector(".editor-preview.is-desktop");
      if (fullPreview) fullPreview.classList.remove("is-desktop");
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s" && state.page) {
      event.preventDefault();
      saveCurrentPage();
    }
  });

  const boot = async () => {
    try {
      state.data = await api("bootstrap");
      body.dataset.csrf = state.data.csrf;
      pageCount.textContent = state.data.pages.length;
      setDirty(state.data.dirty);
      loading.hidden = true;
      workspace.hidden = false;
      renderDashboard();
    } catch (error) {
      loading.innerHTML = `<div class="empty-state"><strong>Vadības paneli neizdevās ielādēt</strong><p>${escapeHtml(error.message)}</p><button class="button button--primary" type="button" data-retry> Mēģināt vēlreiz</button></div>`;
      loading.querySelector("[data-retry]")?.addEventListener("click", () => window.location.reload());
    }
  };

  boot();
})();
