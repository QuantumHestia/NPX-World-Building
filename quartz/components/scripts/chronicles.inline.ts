const progressKey = (pathname: string) => `chronicle-progress:${pathname}`;

function storedProgress(pathname: string) {
  try {
    return (
      Number.parseFloat(localStorage.getItem(progressKey(pathname)) ?? "0") || 0
    );
  } catch {
    return 0;
  }
}

function initializeReadingRoom() {
  const room = document.querySelector<HTMLElement>("[data-chronicles-room]");
  if (!room || room.dataset.bound === "true") return;
  room.dataset.bound = "true";

  const cards = [...room.querySelectorAll<HTMLElement>(".chronicle-card")];
  const storyCards = [
    ...room.querySelectorAll<HTMLElement>("[data-story-card]"),
  ];
  const search = room.querySelector<HTMLInputElement>(
    "[data-chronicle-search]",
  );
  const filters = [
    ...room.querySelectorAll<HTMLButtonElement>("[data-chronicle-filter]"),
  ];
  const empty = room.querySelector<HTMLElement>("[data-chronicles-empty]");
  let activeFilter = "all";

  for (const card of storyCards) {
    const href =
      card.dataset.storyHref ??
      card.querySelector<HTMLAnchorElement>("a[href]")?.href;
    if (!href || card.dataset.status === "forthcoming") continue;
    card.classList.add("is-clickable");
    card.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.closest("a, button, input, select, textarea")) return;
      window.location.assign(href);
    });
  }

  const refresh = () => {
    const query = search?.value.trim().toLowerCase() ?? "";
    let visible = 0;

    for (const card of cards) {
      const statusMatches =
        activeFilter === "all" || card.dataset.status === activeFilter;
      const searchMatches =
        !query || (card.dataset.search ?? "").includes(query);
      const show = statusMatches && searchMatches;
      card.hidden = !show;
      if (show) visible += 1;
    }

    if (empty) empty.hidden = visible !== 0;
  };

  for (const card of cards) {
    const href = card.dataset.storyHref;
    if (!href || card.classList.contains("is-sealed")) continue;
    const pathname = new URL(href, window.location.href).pathname;
    const progress = Math.min(100, storedProgress(pathname));
    const bar = card.querySelector<HTMLElement>("[data-card-progress]");
    const label = card.querySelector<HTMLElement>("[data-progress-label]");
    if (bar) bar.style.width = `${progress}%`;
    if (label)
      label.textContent =
        progress >= 96
          ? "Completed"
          : progress > 2
            ? `${Math.round(progress)}% read`
            : "Unread";
  }

  for (const button of filters) {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.chronicleFilter ?? "all";
      filters.forEach((item) =>
        item.classList.toggle("is-active", item === button),
      );
      refresh();
    });
  }

  search?.addEventListener("input", refresh);
}

function initializeReader() {
  const reader = document.querySelector<HTMLElement>("[data-chronicle-reader]");
  if (!reader || reader.dataset.bound === "true") return;
  reader.dataset.bound = "true";

  const bar = reader.querySelector<HTMLElement>("[data-reading-progress]");
  const article = document.querySelector<HTMLElement>(".center > article");
  if (!article || !bar) return;

  const update = () => {
    const start = article.offsetTop;
    const distance = Math.max(1, article.offsetHeight - window.innerHeight);
    const progress = Math.max(
      0,
      Math.min(100, ((window.scrollY - start) / distance) * 100),
    );
    bar.style.width = `${progress}%`;
    try {
      localStorage.setItem(
        progressKey(window.location.pathname),
        progress.toFixed(1),
      );
    } catch {
      // Reading progress is optional when storage is unavailable.
    }
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  window.addCleanup?.(() => {
    window.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
  });
}

function initializeCollections() {
  const collection = document.querySelector<HTMLElement>(
    "[data-codex-collection]",
  );
  if (!collection || collection.dataset.bound === "true") return;
  collection.dataset.bound = "true";

  for (const row of collection.querySelectorAll<HTMLTableRowElement>(
    "table tbody tr",
  )) {
    const link = row.querySelector<HTMLAnchorElement>("a[href]");
    if (!link) continue;
    row.classList.add("is-clickable");
    row.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.closest("a, button, input, select, textarea")) return;
      window.location.assign(link.href);
    });
  }
}

function initializeChronicles() {
  initializeReadingRoom();
  initializeReader();
  initializeCollections();
}

document.addEventListener("nav", initializeChronicles);
document.addEventListener("DOMContentLoaded", initializeChronicles);
initializeChronicles();
