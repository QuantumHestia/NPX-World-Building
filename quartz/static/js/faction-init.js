// Faction card click handler (Quartz SPA-safe)
(function () {
  function markFactionCards() {
    const cards = document.querySelectorAll(".character-grid .callout");
    cards.forEach((card) => card.classList.add("is-clickable"));
  }

  function onFactionCardClick(e) {
    const card = e.target.closest?.(".character-grid .callout");
    if (!card) return;

    // If user clicked an interactive element, let it behave normally
    if (e.target.closest("a, button, input, textarea, select, summary, details")) return;

    const link =
      card.querySelector(".callout-title a") ||
      card.querySelector(".callout-title-inner a") ||
      card.querySelector("a");

    if (link?.href) window.location.assign(link.href);
  }

  function initFactionCards() {
    markFactionCards();

    // Only bind once per page instance
    if (window.__factionCardsBound) return;
    window.__factionCardsBound = true;

    document.addEventListener("click", onFactionCardClick);

    // Quartz SPA cleanup hook (prevents leaks / duplicate bindings)
    window.addCleanup?.(() => {
      document.removeEventListener("click", onFactionCardClick);
      window.__factionCardsBound = false;
    });
  }

  // Quartz fires "nav" after initial load and after SPA navigation
  document.addEventListener("nav", initFactionCards);
})();
