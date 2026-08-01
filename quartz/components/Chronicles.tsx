import readingTime from "reading-time";
import { FullSlug, resolveRelative } from "../util/path";
import { QuartzPluginData } from "../plugins/vfile";
// @ts-ignore Quartz/esbuild loads *.inline.ts files as text resources.
import script from "./scripts/chronicles.inline";
import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types";

type ChronicleMeta = {
  subtitle?: string;
  description?: string;
  cover?: string;
  series?: string;
  region?: string;
  status?: string;
  featured?: boolean;
  order?: number;
};

function isChronicle(page: QuartzPluginData) {
  return Boolean(
    page.slug?.startsWith("Chronicles/") && !page.slug.endsWith("/index"),
  );
}

function metadata(page: QuartzPluginData): ChronicleMeta {
  return (page.frontmatter ?? {}) as ChronicleMeta;
}

function titleOf(page: QuartzPluginData) {
  return (
    page.frontmatter?.title ??
    page.slug?.split("/").at(-1)?.replaceAll("-", " ") ??
    "Untitled"
  );
}

function statusOf(page: QuartzPluginData) {
  const explicit = metadata(page).status?.toLowerCase();
  if (explicit) return explicit;
  return page.text?.trim() ? "complete" : "forthcoming";
}

function orderStories(files: QuartzPluginData[]) {
  return files.filter(isChronicle).sort((a, b) => {
    const aOrder = metadata(a).order ?? Number.MAX_SAFE_INTEGER;
    const bOrder = metadata(b).order ?? Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder || titleOf(a).localeCompare(titleOf(b));
  });
}

function synopsisOf(page: QuartzPluginData) {
  const meta = metadata(page);
  return (
    meta.description ??
    page.description ??
    (statusOf(page) === "forthcoming"
      ? "This manuscript remains sealed in the collection."
      : "A chronicle preserved in the Archives of Eldoria.")
  );
}

function minutesOf(page: QuartzPluginData) {
  if (!page.text?.trim()) return 0;
  return Math.max(1, Math.ceil(readingTime(page.text).minutes));
}

function storyHref(current: QuartzPluginData, story: QuartzPluginData) {
  return resolveRelative(current.slug!, story.slug!);
}

export const ChroniclesLanding: QuartzComponent = (
  props: QuartzComponentProps,
) => {
  const stories = orderStories(props.allFiles);
  const featured =
    stories.find((story) => metadata(story).featured) ??
    stories.find((story) => statusOf(story) !== "forthcoming") ??
    stories[0];

  return (
    <section class="chronicles-room" data-chronicles-room>
      <header class="chronicles-masthead">
        <p class="chronicles-kicker">The Archives of Eldoria present</p>
        <h1>Chronicles</h1>
        <p class="chronicles-intro">
          Enter the reading room. Choose a preserved account, an unfinished
          testimony, or a tale whose truth remains disputed.
        </p>
        <div class="chronicles-rule" aria-hidden="true">
          <span>✦</span>
        </div>
      </header>

      {featured && (
        <article
          class="chronicle-featured"
          data-story-card
          data-story-href={storyHref(props.fileData, featured)}
          data-status={statusOf(featured)}
        >
          <div
            class="chronicle-featured-art"
            aria-hidden={metadata(featured).cover ? undefined : "true"}
          >
            {metadata(featured).cover ? (
              <img src={metadata(featured).cover} alt="" loading="eager" />
            ) : (
              <span>{titleOf(featured).charAt(0)}</span>
            )}
          </div>
          <div class="chronicle-featured-copy">
            <p class="chronicle-label">Featured manuscript</p>
            <h2>{titleOf(featured)}</h2>
            {metadata(featured).subtitle && (
              <p class="chronicle-subtitle">{metadata(featured).subtitle}</p>
            )}
            <p>{synopsisOf(featured)}</p>
            <div class="chronicle-meta">
              {metadata(featured).series && (
                <span>{metadata(featured).series}</span>
              )}
              {metadata(featured).region && (
                <span>{metadata(featured).region}</span>
              )}
              {minutesOf(featured) > 0 && (
                <span>{minutesOf(featured)} min read</span>
              )}
            </div>
            <a
              class="chronicle-enter internal"
              href={storyHref(props.fileData, featured)}
            >
              Open the manuscript <span aria-hidden="true">→</span>
            </a>
          </div>
        </article>
      )}

      <div class="chronicles-controls" aria-label="Chronicle filters">
        <label class="chronicles-search">
          <span class="sr-only">Search chronicles</span>
          <input
            type="search"
            placeholder="Search the shelves…"
            data-chronicle-search
          />
        </label>
        <div
          class="chronicles-filter-group"
          role="group"
          aria-label="Filter by manuscript status"
        >
          <button type="button" class="is-active" data-chronicle-filter="all">
            All
          </button>
          <button type="button" data-chronicle-filter="complete">
            Complete
          </button>
          <button type="button" data-chronicle-filter="forthcoming">
            Forthcoming
          </button>
        </div>
      </div>

      <div class="chronicles-shelf" aria-live="polite">
        {stories.map((story, index) => {
          const meta = metadata(story);
          const status = statusOf(story);
          const available = status !== "forthcoming";
          const href = storyHref(props.fileData, story);

          return (
            <article
              class={`chronicle-card ${available ? "" : "is-sealed"}`}
              data-story-card
              data-story-href={href}
              data-status={status}
              data-search={`${titleOf(story)} ${meta.subtitle ?? ""} ${meta.series ?? ""} ${meta.region ?? ""}`.toLowerCase()}
              style={{ "--chronicle-index": index } as Record<string, number>}
            >
              <div class="chronicle-card-art">
                {meta.cover ? (
                  <img src={meta.cover} alt="" loading="lazy" />
                ) : (
                  <span aria-hidden="true">{titleOf(story).charAt(0)}</span>
                )}
                <span class="chronicle-seal" aria-hidden="true">
                  {available ? "E" : "⌛"}
                </span>
              </div>
              <div class="chronicle-card-copy">
                <p class="chronicle-label">
                  {meta.series ??
                    (available ? "Archived tale" : "Sealed record")}
                </p>
                <h2>{titleOf(story)}</h2>
                {meta.subtitle && (
                  <p class="chronicle-subtitle">{meta.subtitle}</p>
                )}
                <p class="chronicle-synopsis">{synopsisOf(story)}</p>
                <div class="chronicle-meta">
                  {meta.region && <span>{meta.region}</span>}
                  {minutesOf(story) > 0 && <span>{minutesOf(story)} min</span>}
                  <span class="chronicle-progress-label" data-progress-label>
                    {available ? "Unread" : "Forthcoming"}
                  </span>
                </div>
                {available ? (
                  <a class="chronicle-card-link internal" href={href}>
                    Read chronicle <span aria-hidden="true">→</span>
                  </a>
                ) : (
                  <span class="chronicle-card-link is-disabled">
                    Awaiting transcription
                  </span>
                )}
                <div class="chronicle-card-progress" aria-hidden="true">
                  <span data-card-progress />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p class="chronicles-empty" hidden data-chronicles-empty>
        No manuscripts answer that description.
      </p>
    </section>
  );
};

const ChronicleReader: QuartzComponent = (props: QuartzComponentProps) => {
  if (!isChronicle(props.fileData)) return null;

  const stories = orderStories(props.allFiles).filter(
    (story) => statusOf(story) !== "forthcoming",
  );
  const currentIndex = stories.findIndex(
    (story) => story.slug === props.fileData.slug,
  );
  const previous = currentIndex > 0 ? stories[currentIndex - 1] : undefined;
  const next =
    currentIndex >= 0 && currentIndex < stories.length - 1
      ? stories[currentIndex + 1]
      : undefined;

  return (
    <aside class="chronicle-reader" data-chronicle-reader>
      <div class="chronicle-reading-progress" aria-hidden="true">
        <span data-reading-progress />
      </div>
      <p class="chronicle-reader-label">Filed in the Chronicles Reading Room</p>
      <nav class="chronicle-reader-nav" aria-label="Chronicle navigation">
        {previous ? (
          <a
            class="internal chronicle-prev"
            href={storyHref(props.fileData, previous)}
          >
            <span>← Previous manuscript</span>
            <strong>{titleOf(previous)}</strong>
          </a>
        ) : (
          <span />
        )}
        <a
          class="internal chronicle-room-link"
          href={resolveRelative(props.fileData.slug!, "Chronicles" as FullSlug)}
        >
          Return to the reading room
        </a>
        {next ? (
          <a
            class="internal chronicle-next"
            href={storyHref(props.fileData, next)}
          >
            <span>Next manuscript →</span>
            <strong>{titleOf(next)}</strong>
          </a>
        ) : (
          <span />
        )}
      </nav>
    </aside>
  );
};

ChronicleReader.afterDOMLoaded = script;

export default (() => ChronicleReader) satisfies QuartzComponentConstructor;
