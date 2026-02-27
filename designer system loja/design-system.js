// Design System Leroy Merlin - interações para design-system.html
// Alinhado à referência: scroll suave, focus, reduced-motion

document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const navLinks = Array.from(
    document.querySelectorAll("header nav a[href^='#']")
  );
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href") || ""))
    .filter((el) => el);

  // Animações de entrada só se o usuário não preferir menos movimento
  if (!prefersReducedMotion) {
    sections.forEach((section) => {
      section.classList.add("ds-section-animate");
    });
  }

  // Scroll suave para âncoras do nav
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      const header = document.querySelector("header");
      const headerHeight = header ? header.offsetHeight : 0;

      const rect = target.getBoundingClientRect();
      const offsetTop = window.scrollY + rect.top - headerHeight - 12;

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    });
  });

  // IntersectionObserver para revelar seções e destacar nav ativo
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("id");
        if (!id) return;

        const relatedLink = navLinks.find(
          (l) => l.getAttribute("href") === `#${id}`
        );

        if (entry.isIntersecting) {
          entry.target.classList.add("ds-in-view");
          if (relatedLink) {
            relatedLink.classList.add("ds-nav-active");
          }
        } else if (relatedLink) {
          relatedLink.classList.remove("ds-nav-active");
        }
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -55% 0px",
      threshold: 0.2,
    }
  );

  sections.forEach((section) => observer.observe(section));

  // Skip link: foco no conteúdo principal (acessibilidade)
  const skipLink = document.querySelector(".ds-skip-link");
  const mainEl = document.querySelector("main");
  if (skipLink && mainEl) {
    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      mainEl.setAttribute("tabindex", "-1");
      mainEl.focus({ preventScroll: false });
    });
  }
});

