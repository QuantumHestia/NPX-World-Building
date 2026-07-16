(function () {
  function initTimeline() {
    // Run on any page that includes the timeline container
    const container = document.getElementById("world-timeline");
    if (!container) return;

    const article = container.closest("article") || document.querySelector("article");
    if (!article) return;

    const headers = article.querySelectorAll("h3");

    headers.forEach((header) => {
      const internalLink = header.querySelector("a.internal") || header.querySelector("a[href]");
      if (!internalLink) return;

      const description = header.nextElementSibling;

      const navigate = (e) => {
        // If the user clicked an actual link (or anything inside one), don't interfere
        if (e.target && e.target.closest && e.target.closest("a")) return;

        // If the user is selecting text, don't hijack the click
        const sel = window.getSelection ? String(window.getSelection()) : "";
        if (sel.trim().length > 0) return;

        const href = internalLink.getAttribute("href");
        if (!href) return;

        window.location.assign(href);
      };

      header.addEventListener("click", navigate);
      header.style.cursor = "pointer";

      if (description && description.tagName === "P") {
        description.addEventListener("click", navigate);
        description.style.cursor = "pointer";
      }
    });
  }

  // Quartz SPA support (fires on in-site navigation)
  document.addEventListener("nav", initTimeline);

  // Also run on initial load
  document.addEventListener("DOMContentLoaded", initTimeline);

  // If this script is injected mid-article, some headings may parse after execution.
  // A short delay ensures we bind events after the remaining markdown is rendered.
  setTimeout(initTimeline, 0);

  initTimeline();
})();
