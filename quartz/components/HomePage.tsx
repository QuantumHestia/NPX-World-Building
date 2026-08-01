import { FullSlug, resolveRelative } from "../util/path";
import { QuartzPluginData } from "../plugins/vfile";
import { QuartzComponent, QuartzComponentProps } from "./types";

type Gateway = {
  eyebrow: string;
  title: string;
  description: string;
  slug: FullSlug;
  icon: string;
  variant: string;
};

const gateways: Gateway[] = [
  {
    eyebrow: "Atlas & regions",
    title: "Enter the World",
    description:
      "Cross the threshold through Eldoria's illustrated maps and regional records.",
    slug: "Codex/Settings/world-navigation" as FullSlug,
    icon: "⌖",
    variant: "world",
  },
  {
    eyebrow: "Preserved tales",
    title: "Read the Chronicles",
    description:
      "Enter the reading room for stories, testimonies, and disputed accounts.",
    slug: "Chronicles" as FullSlug,
    icon: "☾",
    variant: "chronicles",
  },
  {
    eyebrow: "Courts & covenants",
    title: "Divine Ledgers",
    description:
      "Study the immortal courts and the sacred powers that shape the mortal world.",
    slug: "Codex/World-Codex/The-Godly-Pantheons" as FullSlug,
    icon: "✦",
    variant: "divine",
  },
  {
    eyebrow: "Restricted holdings",
    title: "Archive Records",
    description:
      "Open case files, persons of interest, factions, and unresolved incidents.",
    slug: "Codex/World-Codex/Case-Files" as FullSlug,
    icon: "⌘",
    variant: "records",
  },
];

function recentRecords(files: QuartzPluginData[]) {
  return files
    .filter(
      (page) =>
        page.slug &&
        page.slug !== "index" &&
        !page.slug.endsWith("/index") &&
        String(page.frontmatter?.status ?? "").toLowerCase() !==
          "forthcoming" &&
        (page.slug.startsWith("Codex/") ||
          page.slug.startsWith("Chronicles/") ||
          page.slug.startsWith("Archival-Materials/")),
    )
    .sort((a, b) => {
      const aDate =
        a.dates?.modified?.getTime() ?? a.dates?.created?.getTime() ?? 0;
      const bDate =
        b.dates?.modified?.getTime() ?? b.dates?.created?.getTime() ?? 0;
      return bDate - aDate;
    })
    .slice(0, 4);
}

function recordKind(page: QuartzPluginData) {
  if (page.slug?.startsWith("Chronicles/")) return "Chronicle";
  if (page.slug?.includes("NPCs/")) return "Dossier";
  if (page.slug?.includes("Settings/")) return "Location";
  if (page.slug?.includes("Case")) return "Case file";
  return "Archive record";
}

export const HomePage: QuartzComponent = ({
  allFiles,
  fileData,
}: QuartzComponentProps) => {
  const recent = recentRecords(allFiles);

  return (
    <main class="homepage-portal" data-homepage-portal>
      <section class="homepage-hero" aria-label="The Archives of Eldoria">
        <div
          class="homepage-hero-image"
          role="img"
          aria-label="A mountainous Eldorian landscape beneath an ancient sky"
        />
        <div class="homepage-hero-vignette" aria-hidden="true" />
        <p class="homepage-hero-caption">The Third Record · Veritas</p>
      </section>

      <section class="homepage-introduction">
        <div class="homepage-seal" aria-hidden="true">
          <span>Æ</span>
        </div>
        <p class="homepage-kicker">
          The Office of the Archivists welcomes you to
        </p>
        <h1>The Archives of Eldoria</h1>
        <blockquote>
          “History is not written at all. It is screamed into the wind and
          caught by those who know how to listen.”
          <cite>— High Archivist Rhaelle</cite>
        </blockquote>
        <p class="homepage-summary">
          A living record of remembered promises, divine rivalries, dangerous
          songs, ruined empires, and those who inherit what history leaves
          behind.
        </p>
      </section>

      <nav class="homepage-gateways" aria-label="Enter the Archives">
        {gateways.map((gateway, index) => (
          <a
            class={`homepage-gateway homepage-gateway-${gateway.variant} internal`}
            href={resolveRelative(fileData.slug!, gateway.slug)}
            style={{ "--gateway-index": index } as Record<string, number>}
          >
            <span class="homepage-gateway-icon" aria-hidden="true">
              {gateway.icon}
            </span>
            <span class="homepage-gateway-copy">
              <small>{gateway.eyebrow}</small>
              <strong>{gateway.title}</strong>
              <span>{gateway.description}</span>
            </span>
            <span class="homepage-gateway-arrow" aria-hidden="true">
              →
            </span>
          </a>
        ))}
      </nav>

      <section class="homepage-recent">
        <header>
          <p class="homepage-kicker">From the accession desk</p>
          <h2>Recently Unsealed Records</h2>
          <div class="homepage-rule" aria-hidden="true">
            <span>✦</span>
          </div>
        </header>
        <div class="homepage-recent-grid">
          {recent.map((page) => (
            <a
              class="homepage-record internal"
              href={resolveRelative(fileData.slug!, page.slug!)}
            >
              <span class="homepage-record-kind">{recordKind(page)}</span>
              <strong>
                {page.frontmatter?.title ?? page.slug?.split("/").at(-1)}
              </strong>
              <span class="homepage-record-description">
                {page.description ??
                  "A newly catalogued holding from the Archives of Eldoria."}
              </span>
              <span class="homepage-record-open">Examine record →</span>
            </a>
          ))}
        </div>
      </section>

      <footer class="homepage-closing">
        <span aria-hidden="true">◆</span>
        <p>
          The Archive promises preservation, comparison, revision—and sufficient
          warning.
        </p>
        <a
          class="internal"
          href={resolveRelative(
            fileData.slug!,
            "Codex/World-Codex/Office-of-the-Archivists" as FullSlug,
          )}
        >
          Learn about the Archive
        </a>
      </footer>
    </main>
  );
};
