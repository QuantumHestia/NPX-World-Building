# World Codex: Custom Code and Quartz Edits

This document describes the custom code in the World Codex repository:

`github.com/QuantumHestia/NPX-World-Building`

It is an inventory of the changes made on top of Quartz 4 to publish the Eldoria Obsidian vault as a themed lore website. It deliberately does not document the lore in `content/`, and it is not a general Quartz tutorial. Its purpose is to help another developer understand which files are custom, why they exist, and how the features are connected.

## Repository customization at a glance

The site replaces the standard Quartz presentation with a World Anvil-inspired archive interface. The main additions are:

- a curated, persistent World Codex sidebar;
- a parchment-and-ink visual theme;
- full-page Leaflet maps made from custom image tiles;
- a CSS-driven historical timeline;
- custom NPC dossier and gallery code;
- faction and character callout cards;
- archival quotes, marginalia, stamps, badges, and status UI;
- mobile menu behavior;
- custom site metadata, favicons, fonts, and third-party resources.

The custom code is concentrated in these paths:

```text
quartz.config.ts
quartz.layout.ts
quartz/components/CustomHead.tsx
quartz/components/Menu.tsx
quartz/components/MenuScript.tsx
quartz/components/menu-config.ts
quartz/plugins/transformers/MapInjector.ts
quartz/static/js/
quartz/static/data/npcs.json
quartz/static/tiles/
quartz/static/theme/
quartz/styles/custom.scss
quartz/styles/features/
```

## 1. Quartz site configuration

### `quartz.config.ts`

This is the central Quartz configuration. The World Codex version changes the following site-level settings:

- Site title: `World Codex`
- Title suffix: ` | Eldoria Lore Wiki`
- Public hostname: `lore.hestia.best`
- Locale: `en-US`
- SPA navigation: enabled
- Popover previews: disabled
- Analytics: Plausible
- Default date: modified date
- Ignored content: `private`, `templates`, and `.obsidian`

The theme uses Google Fonts and selects `Caudex` for both headings and body text. `Ms Madi` is configured as the code font, although it is visually more of a handwritten display face than a conventional monospace font.

The light palette is warm parchment, brown ink, saddle-brown links, and muted gold. The dark palette uses near-black backgrounds with pale text and stronger gold accents.

The major functional edit is the addition of the custom `MapInjector` transformer immediately after `FrontMatter()`:

```ts
transformers: [
  Plugin.FrontMatter(),
  MapInjector,
  // standard Quartz transformers follow
]
```

Note that `MapInjector` is currently passed as `MapInjector`, not `MapInjector()`. This works because it is itself a Quartz transformer factory matching the expected configuration shape used here.

The remaining transformers and emitters are largely standard Quartz features: Obsidian syntax, GitHub-flavored Markdown, tables of contents, link crawling, LaTeX, aliases, content pages, folder pages, tag pages, RSS, sitemap, static assets, favicons, 404 pages, and generated social images.

## 2. Page layout replacement

### `quartz.layout.ts`

The layout replaces Quartz's ordinary head and navigation components:

```ts
export const sharedPageComponents: SharedLayout = {
  head: CustomHead(),
  header: [],
  afterBody: [MenuScript()],
  footer: Component.Footer(),
}
```

The important changes are:

- `CustomHead()` replaces the default `Component.Head()`.
- The normal header is removed.
- `MenuScript()` is injected after the page body.
- The custom `WorldAnvilMenu()` occupies the left sidebar.
- The right sidebar is empty.

The content layout conditionally hides the generated article title and content metadata on:

- the homepage;
- the world navigation page;
- the Summer Isles regional map page.

Those pages use custom, full-width presentation and therefore do not need Quartz's ordinary title block. Tags are hidden only on the homepage.

List pages retain breadcrumbs, article title, and content metadata, but still use the custom left menu.

## 3. Custom document head and global resources

### `quartz/components/CustomHead.tsx`

This component begins as a modified version of Quartz's normal `Head` component. It preserves:

- document title and description generation;
- Google Font loading;
- Open Graph metadata;
- Twitter card metadata;
- canonical social URLs;
- generated or default social images;
- Quartz component CSS and JavaScript resources.

It then adds site-specific resources globally.

### Leaflet

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="/static/js/map-init.js"></script>
```

Leaflet powers the illustrated world and regional maps.

### Font Awesome

Font Awesome 6.4.0 is loaded from cdnjs for icon support.

### Custom favicons

The component loads 32-pixel, 16-pixel, and Apple touch icons from `quartz/static/theme/`.

### Custom feature scripts

The following scripts are loaded globally:

```text
/static/js/timeline-data.js
/static/js/timeline-init.js
/static/js/npc-init.js
/static/js/npc-gallery-init.js
/static/js/faction-init.js
```

`npc-init.js` and `npc-gallery-init.js` are deferred and marked with `data-persist="true"`. `faction-init.js` is deferred.

### Current resource-loading issues

There are two important redundancies in the current implementation:

1. Leaflet and `map-init.js` are loaded here and also registered by `MapInjector.ts`.
2. `timeline-init.js` is loaded here and is also embedded directly by the timeline Markdown page.

There is also a reference to `/static/js/timeline-data.js`, but that file does not exist in the repository.

These do not describe intended architecture; they are current cleanup items. Each library or initializer should eventually have one registration point.

## 4. Curated World Codex navigation

The standard Quartz explorer is replaced by three custom files.

### `quartz/components/menu-config.ts`

This contains the manually curated navigation structure. The menu is divided into:

- Basics and Introductions
- Archival Materials
- Factions and Figures

The configured links lead to the Archivists, magic system, world map, timeline, case files, immortal factions, mortal factions, and people of interest.

This is intentionally not generated from the directory tree. It exposes the site's main reading paths without displaying every note.

### `quartz/components/Menu.tsx`

This component renders:

- the `World Codex` menu heading;
- a Home button;
- each configured chapter and its links;
- an external `Play The Game` button leading to `https://play.hestia.best`.

The component uses the class `.world-anvil-menu`, which is the styling hook used throughout the custom SCSS.

The current component accepts and destructures `fileData` and `cfg` but does not use them. This produces one of the two current TypeScript check failures.

### `quartz/components/MenuScript.tsx`

This component injects an inline mobile-menu script. At widths of 850 pixels or less it:

1. creates a floating hamburger button;
2. inserts a close button at the top of the left sidebar;
3. adds `.menu-open` when the hamburger is pressed;
4. removes `.menu-open` through the close button or an outside click.

This script runs on `DOMContentLoaded`. It does not currently re-evaluate after resizing from desktop to mobile and does not explicitly reinitialize on Quartz's `nav` event.

### `quartz/static/js/menu-toggle.js`

There is also a standalone menu-toggle script. It is not the script registered by `quartz.layout.ts`; `MenuScript.tsx` provides the active behavior. The standalone file appears to be an earlier or alternative implementation retained in the repository.

## 5. Illustrated map system

The map feature consists of four parts:

```text
MapInjector.ts                build-time markup/resource integration
map-init.js                   browser-side Leaflet setup
_maps.scss                    map and Leaflet presentation
quartz/static/tiles/          generated image tiles
```

### `quartz/plugins/transformers/MapInjector.ts`

The transformer supports author-friendly placeholders:

```html
<div id="map-root" data-map="world"></div>
<div id="map-root" data-map="summer-isles"></div>
```

During the Quartz text transformation it replaces them with:

```html
<div id="world-map" class="quartz-map"></div>
<div id="summer-isles-map" class="quartz-map"></div>
```

For backward compatibility, an unqualified `<div id="map-root"></div>` becomes the world map.

The transformer also registers Leaflet 1.9.4 and `/static/js/map-init.js` as SPA-preserved external resources loaded after the DOM is ready.

The current map Markdown pages use `world-map` and `summer-isles-map` directly, so the text replacements are available but are not needed by those pages in their current form.

### `quartz/static/js/map-init.js`

This is the active map implementation.

It defines two map configurations:

| Map | Container | Tile directory | Source dimensions | Initial behavior |
|---|---|---|---:|---|
| Eldoria world | `world-map` | `eldoria` | 6336 × 2688 | Centered at zoom -1.6 |
| Summer Isles | `summer-isles-map` | `summer-isles` | 5760 × 2944 | Fit to image bounds |

The map uses `L.CRS.Simple`, allowing a fantasy illustration to be treated as a two-dimensional coordinate plane rather than Earth geography.

Tiles are 256 pixels. Tile directories `0` through `5` correspond to Leaflet zoom levels `-5` through `0`, using a zoom offset of five. Leaflet may display zoom levels 1 and 2 by scaling the highest native tiles.

#### Custom Y-coordinate translation

`L.CRS.Simple` projects the vertical axis in the opposite direction from the generated tile files. The custom `MapTileLayer` converts Leaflet's negative Y tile indices to the files' zero-based top-to-bottom numbering:

```js
const fileY = coords.y + numTilesY;
```

The requested tile URL is then constructed as:

```text
/static/tiles/{tileDir}/{zoom}/{x}/{translatedY}.png
```

#### Map boundaries

Each map uses the source image dimensions as bounds. `noWrap` prevents repetition, and `setMaxBounds` keeps the viewport from wandering indefinitely beyond the illustration.

#### World-to-region marker

The world map adds a custom pulsing marker at `[1313, 2928]`. Its popup links to the Summer Isles regional page.

#### Quartz SPA support

The script stores the active map in `mapInstance`. On every Quartz `nav` event it:

1. calls `mapInstance.remove()`;
2. clears residual Leaflet classes and markup;
3. waits 100 milliseconds;
4. initializes whichever supported map container exists on the new page.

An `isInitializing` flag prevents concurrent initialization.

### `quartz/static/tiles/`

The repository contains approximately 36 MB of local PNG tiles split between:

```text
quartz/static/tiles/eldoria/
quartz/static/tiles/summer-isles/
```

Both maps have six native tile levels, numbered 0 through 5. Keeping tiles in the repository means the maps do not depend on an external map host; only the Leaflet library itself is loaded from a CDN.

### `quartz/styles/features/_maps.scss`

This stylesheet supplies:

- framed map containers with dark backgrounds;
- Leaflet popup typography;
- forced visibility and click behavior for zoom controls;
- map legends and responsive rules;
- full-page layout overrides for map pages;
- pulsing circular region markers;
- popup buttons and regional popup styling;
- required map height rules.

Some rules target `body[data-slug="world-navigation"]`, while the actual Quartz slug includes its folder path (`Settings/world-navigation`). Those selectors should be checked against the generated HTML before relying on them.

The file also contains a global `hr { display: none !important; }` rule. Although stored in the map feature stylesheet, it hides horizontal rules throughout the site.

### Current map limitations

- The map supports only the two hard-coded configurations.
- Adding another region requires editing `MAP_CONFIGS` and supplying a matching tile directory.
- Map coordinates and popup content are hard-coded in JavaScript rather than loaded from data.
- NPC gallery map links can include `lat`, `lng`, and `z` query parameters, but `map-init.js` does not currently read them.
- Leaflet is registered twice, as described in the Custom Head section.

## 6. Historical timeline system

The timeline is deliberately content-driven. The code does not maintain a separate event database.

The page structure expected by the styles and script is:

```html
<div id="world-timeline"></div>
```

followed by Markdown in which:

- each `h2` is an era;
- each `h3` is an event title containing a link;
- the immediately following paragraph is the event description.

### `quartz/styles/features/_timeline.scss`

The timeline stylesheet is scoped using:

```scss
body:has(#world-timeline) { ... }
```

Within that page it:

- removes the ordinary parchment article panel;
- constrains the timeline to a 1000-pixel maximum width;
- draws a glowing, animated vertical “Weave” line;
- centers era headings;
- displays event headings and paragraphs as joined cards;
- alternates event cards left and right;
- draws luminous nodes beside each event;
- adds hover movement, border, and glow effects;
- collapses the layout to a single column on mobile.

The visual design uses dark cards, parchment-colored text, muted green light, and gold links.

### `quartz/static/js/timeline-init.js`

The timeline script finds `#world-timeline`, locates its article, and scans all `h3` elements. When an event heading contains an internal link, it makes the heading and its following paragraph act as one large click target.

It intentionally does not navigate when:

- the user clicked an actual link; or
- the user is selecting text.

It runs on:

- Quartz's `nav` event;
- `DOMContentLoaded`;
- a zero-delay timeout;
- immediate script execution.

This makes it tolerant of several loading orders, but it does not mark headings as already bound. Because the script is currently loaded more than once, a heading can receive duplicate event listeners. Navigation still appears to work, but registration should be consolidated.

## 7. NPC dossier UI

NPC presentation is split between styles, page markup, an optional dossier initializer, and an optional generated gallery.

### `quartz/styles/features/_npcs.scss`

This large stylesheet defines the visual language for character records, including:

- dossier headers;
- portraits and header text;
- archival status stamps;
- tabs and tab panels;
- redaction/unseal controls;
- relationship grids and cards;
- NPC gallery cards;
- portraits, names, and action icons;
- status and life badges;
- responsive layouts.

Many NPC pages use `.npc-header`, `.npc-header-text`, and `.npc-stamps`, so the static dossier presentation is active even where the interactive system is not.

### `quartz/static/js/npc-init.js`

This script activates only when it finds:

```html
<div data-npc-dossier>...</div>
```

Inside that root it looks for:

- `[data-tab]` sections;
- an optional `.npc-header`;
- an optional `[data-unseal]` button;
- an optional `[data-relations]` list.

It dynamically creates a tab bar, shows the first panel, toggles the `.npc-unsealed` class, changes the button between `UNSEAL RECORD` and `SEAL RECORD`, and converts relationship list items into linked cards.

The root is marked `.npc-loaded` so initialization is not repeated. The script responds to both `DOMContentLoaded` and Quartz `nav`.

#### Current status

No current content page contains the required `data-npc-dossier` root. The visual dossier classes are used, but the tabs, unseal control, and relationship conversion are dormant.

### `quartz/static/js/generate-npc-registry.mjs`

This Node script is intended to generate `quartz/static/data/npcs.json` from Markdown frontmatter.

It:

1. walks all Markdown files below `content/`;
2. parses a limited subset of YAML frontmatter;
3. selects records with `type: npc` or `npc: true`;
4. derives a slug when one is not supplied;
5. normalizes an optional nested map object;
6. sorts characters by name;
7. writes the JSON registry.

The parser is intentionally minimal. It supports simple scalar properties and one level of nested object properties, but not the complete YAML specification.

The generator is not currently part of the normal npm build command, so `npcs.json` can become stale.

### `quartz/static/data/npcs.json`

The checked-in registry currently contains only two entries. Their page and portrait paths do not correspond cleanly with the larger current NPC collection, so the file appears to be sample or stale data rather than a complete generated index.

### `quartz/static/js/npc-gallery-init.js`

The first half of this script implements a complete basic gallery:

- finds `[data-npc-gallery]`;
- loads `/static/data/npcs.json` or a custom `data-source`;
- creates portrait cards;
- links to each dossier;
- adds map and timeline icons;
- responds to both initial load and SPA navigation.

The second half is an unfinished faction-filtered gallery implementation. It is intended to use `#filtered-gallery` and a `faction` URL parameter, then render results as `.character-grid` callouts.

That filtered function currently has ordering and scope defects:

- `allNpcs` is referenced before it is declared;
- `norm` is referenced before its declaration;
- `src` is not defined in the function;
- `filteredNpcs` is declared twice;
- `initFilteredGallery()` is never registered or called.

No current content page contains `[data-npc-gallery]` or `#filtered-gallery`, so neither gallery mode is active on the published content as presently authored.

## 8. Faction and character cards

### `quartz/styles/features/_factions.scss`

This stylesheet turns Obsidian callouts and surrounding markup into faction and character displays. It includes:

- grid layouts for cards;
- faction emblems;
- card headers and bodies;
- hover states;
- status rows and badges;
- mobile layout adjustments;
- theme-specific presentation for groups and identities.

### `quartz/static/js/faction-init.js`

The script targets:

```css
.character-grid .callout
```

It adds `.is-clickable` to each matching card and registers one delegated document click handler. Clicking a non-interactive area of a card follows the first suitable link inside it. Links, buttons, form elements, summaries, and details retain their normal behavior.

The implementation is Quartz SPA-aware:

- it runs on `nav`;
- it uses a global `window.__factionCardsBound` flag;
- it registers cleanup through `window.addCleanup` when available.

This is one of the cleaner lifecycle implementations in the custom code.

## 9. Divine lineage prototype

### `quartz/static/js/lineage-init.js`

This is an unfinished interactive genealogy graph based on `vis-network`.

It was designed to:

- run only on pages whose slug contains `lineage`;
- initialize inside `#lineage-container`;
- fetch `/divine-lineage-data.yaml`;
- color entities by Greek, Norse, Egyptian, or Celtic mythology;
- style parent, marriage, affair, spawned, and sibling relationships differently;
- create an interactive force-directed network;
- navigate from a node to its wiki page.

The script contains a basic fallback YAML parser when `jsyaml` is unavailable.

#### Current status

The lineage feature is dormant because:

- no file loads `lineage-init.js`;
- `divine-lineage-data.yaml` is absent;
- `vis-network` is not registered;
- `js-yaml` is not registered;
- no current page supplies `#lineage-container`.

The comment at the top also refers to `quartz/static/scripts/lineage-init.js`, while the actual file is under `quartz/static/js/`.

This should be treated as a retained prototype, not a currently supported site feature.

## 10. Custom SCSS architecture

### `quartz/styles/custom.scss`

This file imports Quartz base styles and then the World Codex feature partials:

```scss
@use "./base.scss";
@use "./features/ui-elements";
@use "./features/layout";
@use "./features/menu";
@use "./features/quotes";
@use "./features/npcs";
@use "./features/factions";
@use "./features/maps";
@use "./features/timeline";
@use "./features/marginalia";
```

It also performs broad layout overrides itself:

- defines parchment, ink, and typography variables;
- makes the outer page transparent and full-width;
- hides Quartz's normal page header and right sidebar;
- creates a two-column grid with a 300-pixel left menu;
- makes the menu sticky and independently scrollable;
- styles the central article as a parchment sheet;
- styles global headings, links, buttons, and responsive behavior.

The result is intentionally much more opinionated than a normal Quartz theme. Quartz remains the publishing engine, but little of the default visual layout is visible.

### `_layout.scss`

Contains additional layout rules and responsive adjustments for the customized two-column page.

### `_menu.scss`

Styles the World Codex menu, chapter labels, buttons, and mobile drawer states.

### `_ui-elements.scss`

Provides reusable visual primitives such as labels, panels, badges, buttons, or shared card treatments.

### `_quotes.scss`

Styles quotation and archival excerpt presentation.

### `_marginalia.scss`

Adds note-like annotations and margin treatments that support the archive/manuscript aesthetic.

### `_npcs.scss`, `_factions.scss`, `_maps.scss`, `_timeline.scss`

These are the feature-specific files described in their respective sections above.

## 11. Static theme assets

### `quartz/static/theme/`

The custom site assets include:

- `bg.png` and `bg.webp` for the site background;
- 16-pixel and 32-pixel favicons;
- Apple touch icon;
- 192-pixel and 512-pixel Android Chrome icons.

### `quartz/static/og-image.png`

Provides the default social preview image when a custom generated image is not used.

### `quartz/static/giscus/`

Contains light and dark Giscus styles. The current layout does not visibly register a comments component, so these appear to be supporting assets rather than a major active customization.

## 12. Active, partial, and dormant features

| Feature | State | Notes |
|---|---|---|
| Custom parchment layout | Active | Applied globally through `custom.scss` and layout configuration |
| Curated World Codex menu | Active | Replaces the standard explorer |
| Mobile menu | Active, limited | Works on mobile initial load; lifecycle could be stronger |
| World map | Active | Local Eldoria tiles and one Summer Isles marker |
| Summer Isles map | Active | Local regional tiles |
| Timeline styling | Active | Markdown headings become alternating event cards |
| Timeline click behavior | Active, duplicated | Script is registered more than once |
| Faction/character cards | Active | Used on pages containing `.character-grid` callouts |
| Static NPC dossier styling | Active | Header, portrait, stamps, and related presentation |
| Interactive NPC dossier tabs | Dormant | Required `data-npc-dossier` markup is absent |
| NPC gallery | Dormant | No gallery container; registry is stale/sample data |
| Filtered NPC gallery | Broken prototype | Contains scope/order errors and is never invoked |
| Divine lineage graph | Dormant prototype | Missing data, libraries, page markup, and registration |

## 13. Known code-quality and maintenance items

Running `npm run check` currently reports two TypeScript errors:

```text
quartz/components/Footer.tsx: unused opts parameter
quartz/components/Menu.tsx: unused destructured parameters
```

Other maintenance items visible in the current repository are:

1. Remove duplicate Leaflet and map-script registration.
2. Remove the missing `timeline-data.js` reference.
3. Register `timeline-init.js` in one place only.
4. Mark timeline headings after binding, or use delegated events.
5. Decide whether `menu-toggle.js` or `MenuScript.tsx` is canonical.
6. Make mobile menu setup respond to SPA navigation and viewport changes.
7. Repair or remove the filtered NPC gallery prototype.
8. Add the NPC registry generator to the build process.
9. Standardize NPC frontmatter before regenerating the registry.
10. Make map deep links consume `lat`, `lng`, and `z` parameters.
11. Scope global CSS rules currently stored inside feature partials.
12. Either complete or remove the divine lineage prototype.

These items are documented to distinguish the intended customization from code that was started but not integrated.

## 14. File-to-feature reference

| File | Role |
|---|---|
| `quartz.config.ts` | Site identity, theme colors/fonts, Quartz plugins, MapInjector registration |
| `quartz.layout.ts` | Custom head, left menu, title/meta visibility, empty right sidebar |
| `quartz/components/CustomHead.tsx` | Metadata, favicons, CDN resources, global custom scripts |
| `quartz/components/Menu.tsx` | Rendered World Codex navigation |
| `quartz/components/menu-config.ts` | Curated menu entries |
| `quartz/components/MenuScript.tsx` | Inline mobile menu behavior |
| `quartz/plugins/transformers/MapInjector.ts` | Map placeholders and Leaflet resource registration |
| `quartz/static/js/map-init.js` | World and Summer Isles Leaflet maps |
| `quartz/static/js/timeline-init.js` | Clickable timeline event cards |
| `quartz/static/js/faction-init.js` | Clickable character/faction callouts |
| `quartz/static/js/npc-init.js` | Optional dossier tabs, unsealing, relationship cards |
| `quartz/static/js/npc-gallery-init.js` | Optional JSON-driven galleries and unfinished filtering |
| `quartz/static/js/generate-npc-registry.mjs` | Markdown-frontmatter-to-JSON generator |
| `quartz/static/js/lineage-init.js` | Unintegrated divine genealogy prototype |
| `quartz/static/js/menu-toggle.js` | Alternate/older mobile menu script |
| `quartz/static/data/npcs.json` | Checked-in NPC gallery data |
| `quartz/static/tiles/` | Local illustrated map tiles |
| `quartz/static/theme/` | Background and browser icons |
| `quartz/styles/custom.scss` | Global theme and feature imports |
| `quartz/styles/features/_layout.scss` | Custom page geometry |
| `quartz/styles/features/_menu.scss` | Sidebar and mobile menu styles |
| `quartz/styles/features/_maps.scss` | Leaflet, map page, marker, and popup styles |
| `quartz/styles/features/_timeline.scss` | Alternating animated timeline layout |
| `quartz/styles/features/_npcs.scss` | Dossier, gallery, portrait, tab, and badge styles |
| `quartz/styles/features/_factions.scss` | Faction and character callout cards |
| `quartz/styles/features/_quotes.scss` | Custom quotation presentation |
| `quartz/styles/features/_marginalia.scss` | Archival margin-note presentation |
| `quartz/styles/features/_ui-elements.scss` | Shared UI treatments |

## 15. Summary

The World Codex is not a separate application layered beside Quartz. It is a strongly customized Quartz theme and collection of progressive enhancements around an Obsidian vault.

The most complete custom systems are the site-wide archive layout, curated navigation, local-tile Leaflet maps, CSS timeline, and clickable callout cards. NPC interactivity and the lineage graph show the direction of later experiments but are not fully wired into the published site.

For anyone maintaining the repository, the key architectural relationship is:

```text
quartz.config.ts
       │
       ├── registers MapInjector and standard Quartz processing
       │
quartz.layout.ts
       │
       ├── installs CustomHead and WorldAnvilMenu
       │
CustomHead.tsx / MapInjector.ts
       │
       ├── load browser resources
       │
static/js + static/data + static/tiles
       │
       ├── add runtime interaction and feature data
       │
custom.scss + styles/features/*
       │
       └── replace the normal Quartz appearance with the World Codex interface
```

That is the custom code surface of the project outside the Obsidian `content/` directory.
