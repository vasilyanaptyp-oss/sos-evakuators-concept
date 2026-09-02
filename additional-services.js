(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (!menuButton || !mobileMenu) return;

  const focusableElements = () => [
    ...mobileMenu.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])")
  ];

  const setMenu = (open) => {
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Aizvērt izvēlni" : "Atvērt izvēlni");
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    mobileMenu.inert = !open;
    document.body.classList.toggle("menu-open", open);

    if (open) {
      window.setTimeout(() => focusableElements()[0]?.focus(), 220);
    }
  };

  menuButton.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  mobileMenu.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const items = focusableElements();
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
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !mobileMenu.classList.contains("is-open")) return;
    setMenu(false);
    menuButton.focus();
  });
})();
