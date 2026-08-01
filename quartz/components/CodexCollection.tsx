import { ComponentChildren } from "preact";
import { htmlToJsx } from "../util/jsx";
import { QuartzComponent, QuartzComponentProps } from "./types";

type CollectionDefinition = {
  kicker: string;
  title: string;
  introduction: string;
  kind: "cases" | "divine" | "mortal" | "people";
  sigil: string;
};

const collections: Record<string, CollectionDefinition> = {
  "Case-Files": {
    kicker: "Restricted archival holdings",
    title: "Case Files",
    introduction:
      "Incidents, anomalies, and unresolved truths preserved because the world has a habit of repeating its errors.",
    kind: "cases",
    sigil: "CF",
  },
  "The-Godly-Pantheons": {
    kicker: "The divine registries",
    title: "The Godly Pantheons",
    introduction:
      "Enter the courts, covenants, and cosmic administrations through which immortal powers shape Eldoria.",
    kind: "divine",
    sigil: "✦",
  },
  "The-Mortal-Factions": {
    kicker: "The ledger of worldly powers",
    title: "Mortal Factions",
    introduction:
      "Houses, orders, circles, and institutions whose ambitions leave marks no less lasting than those of gods.",
    kind: "mortal",
    sigil: "⚔",
  },
  "Persons-of-Interests": {
    kicker: "The registry of notable figures",
    title: "Persons of Interest",
    introduction:
      "Archivists, operatives, wanderers, and unresolved identities whose lives intersect the greater record.",
    kind: "people",
    sigil: "⌖",
  },
};

export function collectionForSlug(slug?: string) {
  if (!slug) return undefined;
  const key = Object.keys(collections).find((candidate) =>
    slug.endsWith(candidate),
  );
  return key ? collections[key] : undefined;
}

export const CodexCollection: QuartzComponent = ({
  fileData,
  tree,
}: QuartzComponentProps) => {
  const definition = collectionForSlug(fileData.slug);
  if (!definition) return null;

  const content = htmlToJsx(fileData.filePath!, tree) as ComponentChildren;
  const classes: string[] = fileData.frontmatter?.cssclasses ?? [];

  return (
    <section
      class={`codex-collection codex-collection-${definition.kind}`}
      data-codex-collection
      data-collection-kind={definition.kind}
    >
      <header class="chronicles-masthead codex-collection-masthead">
        <p class="chronicles-kicker">{definition.kicker}</p>
        <div class="codex-collection-sigil" aria-hidden="true">
          {definition.sigil}
        </div>
        <h1>{definition.title}</h1>
        <p class="chronicles-intro">{definition.introduction}</p>
        <div class="chronicles-rule" aria-hidden="true">
          <span>✦</span>
        </div>
      </header>

      <div class="codex-collection-content">
        <article class={["popover-hint", ...classes].join(" ")}>
          {content}
        </article>
      </div>
    </section>
  );
};
